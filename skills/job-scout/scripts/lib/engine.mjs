import { randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';
import { digest, readJson, saveJson, withLock } from './files.mjs';
import { summarize, validatePlan } from './plan.mjs';
import {
  evaluationInput,
  evaluationQuestions,
  evaluatorRequest,
  exaRequest,
  normalizeAssessment,
  postJson,
  providerTarget,
  readExaResults,
} from './providers.mjs';

export class ResearchPause extends Error {}
export function validateBudget(budget) {
  if (!Number.isFinite(budget) || budget <= 0 || budget > 100)
    throw new Error('Choose a positive per-run budget of at most $100.');
  return budget;
}
export function validateCeilings(config) {
  const search = config.searchRequestCeilingUsd ?? 0.25;
  const evaluation = config.evaluationRequestCeilingUsd ?? 0.01;
  if (![search, evaluation].every((n) => Number.isFinite(n) && n > 0))
    throw new Error('Request cost ceilings must be positive numbers.');
  return { search, evaluation };
}
export function estimatePlan(plan, config = {}) {
  const ceilings = validateCeilings(config);
  const searches = plan.collections.reduce((s, c) => s + c.searches.length, 0);
  const candidates = plan.collections.reduce(
    (s, c) => s + c.searches.reduce((n, q) => n + q.numResults, 0),
    0,
  );
  return {
    searches,
    maximumResultsBeforeDeduplication: candidates,
    reservedCeilingUsd:
      searches * ceilings.search + candidates * ceilings.evaluation,
    ceilings,
  };
}
export async function runResearch({
  plan: raw,
  directory,
  settings,
  budgetUsd,
  retryFailed = false,
  retryUncertain = false,
  fetcher = fetch,
  signal,
  onProgress = () => {},
}) {
  const plan = validatePlan(raw);
  const provider = settings.config.provider;
  if (!['openai', 'clef'].includes(provider))
    throw new Error('Choose an evaluator with setup first.');
  if (!settings.keys.EXA_API_KEY)
    throw new Error(
      'EXA_API_KEY is missing. Run setup or supply it in your environment.',
    );
  const target = providerTarget(provider, settings.config, settings.keys);
  const ceilings = validateCeilings(settings.config);
  const budget = validateBudget(budgetUsd ?? settings.config.budgetUsd);
  const path = join(resolve(directory), 'run.json');
  return withLock(resolve(directory), async () => {
    let run = await readJson(path, null);
    const route = { provider, model: target.model };
    if (
      run &&
      (run.planHash !== digest(plan) || digest(run.route) !== digest(route))
    )
      throw new Error(
        'This run has a different plan or evaluator. Use its original plan and provider, or a new output directory.',
      );
    run ??= {
      version: 1,
      id: randomUUID(),
      planHash: digest(plan),
      plan,
      route,
      createdAt: new Date().toISOString(),
      status: 'collecting',
      budgetUsd: budget,
      ledger: [],
      searches: {},
      items: [],
      duplicates: 0,
    };
    run.budgetUsd = budget;
    const save = () => saveJson(path, run);
    for (const entry of run.ledger)
      if (entry.status === 'inflight') {
        entry.status = 'uncertain';
        entry.error = 'The process ended before its response was saved.';
      }
    await save();
    const spent = () => run.ledger.reduce((sum, r) => sum + r.accountedUsd, 0);
    async function request(key, ceiling, callback) {
      if (signal?.aborted)
        throw new ResearchPause('Research stopped. Completed work is saved.');
      const attempts = run.ledger.filter((r) => r.key === key);
      const previous = attempts.at(-1);
      if (previous?.status === 'uncertain' && !retryUncertain)
        throw new ResearchPause(
          'A previous request has an uncertain outcome. Review run.json; use --retry-uncertain only if you accept a possible duplicate charge.',
        );
      if (previous?.status === 'failed' && !retryFailed)
        throw new ResearchPause(
          'A request failed. Completed work is saved. Fix the provider issue, then use --retry-failed.',
        );
      if (spent() + ceiling > run.budgetUsd + 1e-9)
        throw new ResearchPause(
          'Local spending ceiling reached. Increase the approved budget to continue this run.',
        );
      const entry = {
        key,
        status: 'inflight',
        accountedUsd: ceiling,
        startedAt: new Date().toISOString(),
      };
      run.ledger.push(entry);
      await save();
      let value;
      try {
        value = await callback();
      } catch (error) {
        entry.status = /did not finish|unreadable/.test(error.message)
          ? 'uncertain'
          : 'failed';
        entry.error = error.message;
        await save();
        throw error;
      }
      const actual = value?.costDollars?.total;
      entry.status = 'received';
      if (Number.isFinite(actual) && actual >= 0) {
        entry.reportedUsd = actual;
        entry.accountedUsd = Math.max(ceiling, actual);
      }
      entry.finishedAt = new Date().toISOString();
      // Store the receipt before interpreting it: malformed answers must not trigger a second paid call.
      entry.response = value;
      await save();
      return {
        value,
        entry,
        exceeded: Number.isFinite(actual) && actual > ceiling,
      };
    }
    function savedResponse(key) {
      const last = run.ledger.filter((e) => e.key === key).at(-1);
      return last && ['received', 'complete', 'invalid'].includes(last.status)
        ? last
        : null;
    }
    try {
      run.status = 'collecting';
      delete run.pauseReason;
      for (const collection of plan.collections) {
        for (const [index, search] of collection.searches.entries()) {
          const key = `search:${collection.id}:${index}`;
          if (run.searches[key]?.complete) continue;
          onProgress(
            `Searching ${collection.title}: ${index + 1}/${collection.searches.length}`,
          );
          const cached = savedResponse(key);
          const result = cached
            ? {
                value: cached.response,
                entry: cached,
                exceeded: (cached.reportedUsd || 0) > ceilings.search,
              }
            : await request(key, ceilings.search, () =>
                postJson(
                  'https://api.exa.ai/search',
                  { 'x-api-key': settings.keys.EXA_API_KEY },
                  exaRequest(collection, search),
                  fetcher,
                  signal,
                ),
              );
          try {
            const hits = readExaResults(result.value);
            for (const hit of hits) {
              const existing = run.items.find(
                (i) => i.collectionId === collection.id && i.url === hit.url,
              );
              if (existing) {
                run.duplicates++;
                if (
                  !existing.evidence.some((e) => e.text === hit.evidence.text)
                )
                  existing.evidence.push(hit.evidence);
                if (!existing.searches.includes(key))
                  existing.searches.push(key);
              } else
                run.items.push({
                  id: digest([collection.id, hit.url]).slice(0, 16),
                  collectionId: collection.id,
                  title: hit.title,
                  url: hit.url,
                  evidence: [hit.evidence],
                  searches: [key],
                  assessment: null,
                });
            }
            run.searches[key] = {
              complete: true,
              collectionId: collection.id,
              query: search.query,
              requested: search.numResults,
              returned: hits.length,
              providerReturned: result.value.results.length,
              atCapacity: result.value.results.length >= search.numResults,
              completedAt: new Date().toISOString(),
            };
            result.entry.status = 'complete';
            delete result.entry.response;
          } catch (error) {
            result.entry.status = 'invalid';
            result.entry.error = error.message;
            await save();
            throw error;
          }
          await save();
          if (result.exceeded)
            throw new ResearchPause(
              'Search cost exceeded its local request estimate. Review the cost ceiling before continuing.',
            );
        }
      }
      run.status = 'evaluating';
      await save();
      for (const item of run.items) {
        const key = `evaluate:${item.id}`;
        if (
          item.assessment ||
          (item.evaluationError && !savedResponse(key)?.response)
        )
          continue;
        const collection = plan.collections.find(
          (c) => c.id === item.collectionId,
        );
        if (!item.evidence.some((e) => e.text.trim())) {
          item.evaluationError =
            'No source text was returned. This result has not been assessed.';
          await save();
          continue;
        }
        onProgress(`Assessing ${item.title}`);
        const cached = savedResponse(key);
        const result = cached
          ? { value: cached.response, entry: cached }
          : await request(key, ceilings.evaluation, () =>
              postJson(
                target.url,
                target.headers,
                evaluatorRequest(
                  provider,
                  target.model,
                  evaluationInput(plan, collection, item),
                  evaluationQuestions(collection),
                ),
                fetcher,
                signal,
              ),
            );
        try {
          item.assessment = normalizeAssessment(
            provider,
            result.value,
            collection,
          );
          delete item.evaluationError;
          item.summary = summarize(collection.criteria, item.assessment);
          result.entry.status = 'complete';
          delete result.entry.response;
        } catch (error) {
          item.evaluationError = error.message;
          result.entry.status = 'invalid';
          result.entry.error = error.message;
        }
        await save();
      }
      run.status = run.items.some((i) => i.evaluationError)
        ? 'partial'
        : 'completed';
      run.finishedAt = new Date().toISOString();
    } catch (error) {
      run.status = 'paused';
      run.pauseReason = error.message;
    }
    run.accountedUsd = spent();
    await save();
    return run;
  });
}
