import { randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';
import { digest, readJson, saveJson, withLock } from './files.mjs';
import { canonicalUrl, summarize, validatePlan } from './plan.mjs';

const text = (value, label, max = 1000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw new Error(
      `${label} must be nonempty text, at most ${max} characters.`,
    );
  return value.trim();
};
const url = (value) => {
  const result = canonicalUrl(value);
  if (!result)
    throw new Error('Source URLs must use HTTP or HTTPS without credentials.');
  return result;
};
const timestamp = (value) => {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T/.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    throw new Error('Use an ISO retrieval timestamp.');
  return value;
};

// This validates the host's saved research structure, not the truth of its claims.
// No credentials, provider requests, invented API receipts or dollar estimates.
export function hostRun(rawPlan, raw) {
  const plan = validatePlan(rawPlan);
  if (
    raw?.version !== 1 ||
    !Array.isArray(raw.searches) ||
    !Array.isArray(raw.items)
  )
    throw new Error(
      'Host research needs version 1, searches and items arrays.',
    );
  if (raw.searches.length > 60 || raw.items.length > 6000)
    throw new Error('Host research exceeds the plan limits.');
  const assistant = text(raw.assistant, 'Assistant', 100);
  const searches = {};
  for (const receipt of raw.searches) {
    const collection = plan.collections.find(
      (c) => c.id === receipt.collectionId,
    );
    const search = collection?.searches[receipt.searchIndex];
    if (
      !Number.isInteger(receipt.searchIndex) ||
      !search ||
      receipt.query !== search.query
    )
      throw new Error(
        'Every search must reference its exact planned collection, index and query.',
      );
    const key = `search:${collection.id}:${receipt.searchIndex}`;
    if (searches[key]) throw new Error('Duplicate search receipt.');
    if (
      typeof receipt.complete !== 'boolean' ||
      !Array.isArray(receipt.resultUrls) ||
      receipt.resultUrls.length > 100
    )
      throw new Error(
        'A search needs complete and up to 100 returned source URLs.',
      );
    const resultUrls = [...new Set(receipt.resultUrls.map(url))];
    searches[key] = {
      collectionId: collection.id,
      query: search.query,
      requested: search.numResults,
      complete: receipt.complete,
      returned: resultUrls.length,
      resultUrls,
      tool: text(receipt.tool, 'Actual search tool', 150),
      completedAt: timestamp(receipt.retrievedAt),
      atCapacity: receipt.atCapacity === true,
      ...(receipt.error
        ? { error: text(receipt.error, 'Search limitation') }
        : {}),
    };
  }
  const seen = new Set();
  const items = raw.items.map((item) => {
    const collection = plan.collections.find((c) => c.id === item.collectionId);
    if (!collection) throw new Error('Result collection is not in the plan.');
    const sourceUrl = url(item.url),
      identity = `${collection.id}:${sourceUrl}`;
    if (seen.has(identity))
      throw new Error(
        'Merge duplicate canonical URLs within a collection before import.',
      );
    seen.add(identity);
    const matchingSearches = Object.entries(searches)
      .filter(
        ([, s]) =>
          s.collectionId === collection.id && s.resultUrls.includes(sourceUrl),
      )
      .map(([key]) => key);
    if (!matchingSearches.length)
      throw new Error('Each result URL needs a matching search receipt.');
    if (
      !Array.isArray(item.evidence) ||
      !item.evidence.length ||
      item.evidence.length > 20
    )
      throw new Error('Each result needs one to twenty saved source passages.');
    const evidence = item.evidence.map((e) => ({
      url: url(e.url),
      text: text(e.text, 'Retrieved source passage', 12000),
      retrievedAt: timestamp(e.retrievedAt),
      publishedAt: e.publishedAt ? timestamp(e.publishedAt) : null,
      truncated: e.truncated === true,
    }));
    const assessment = item.assessment;
    if (
      !assessment ||
      !['eligible', 'excluded', 'uncertain'].includes(assessment.subject)
    )
      throw new Error(
        'Assess subject scope as eligible, excluded or uncertain.',
      );
    const reason = text(assessment.reason, 'Subject scope reason', 1500);
    const supplied = Object.keys(assessment.scores || {});
    if (
      supplied.length !== collection.criteria.length ||
      supplied.some((id) => !collection.criteria.some((c) => c.id === id))
    )
      throw new Error(
        'Supply exactly the planned score criteria, using null levels for unknowns.',
      );
    const scores = Object.fromEntries(
      collection.criteria.map((c) => {
        const score = assessment.scores[c.id];
        if (!score || !Array.isArray(score.evidence))
          throw new Error(
            'Each criterion needs a level, reason and evidence indices.',
          );
        const refs = [...new Set(score.evidence)];
        if (
          refs.some(
            (index) =>
              !Number.isInteger(index) || index < 0 || index >= evidence.length,
          )
        )
          throw new Error(
            'Criterion evidence indices must reference saved passages.',
          );
        const known = score.level !== null;
        if (
          known &&
          (!Number.isInteger(score.level) ||
            score.level < 0 ||
            score.level >= c.levels.length ||
            !refs.length)
        )
          throw new Error(
            'A supported level must be in the rubric and cite saved evidence.',
          );
        if (!known && refs.length)
          throw new Error('Unknown levels must have an empty evidence list.');
        return [
          c.id,
          {
            score: known ? score.level / (c.levels.length - 1) : null,
            supported: known,
            level: score.level,
            reason: text(score.reason, 'Criterion reason', 1500),
            evidence: refs,
          },
        ];
      }),
    );
    const saved = {
      provider: 'host',
      model: assistant,
      subject: assessment.subject,
      reason,
      scores,
      evaluatedAt: timestamp(assessment.evaluatedAt),
    };
    return {
      id: digest([collection.id, sourceUrl]).slice(0, 16),
      collectionId: collection.id,
      title: text(item.title, 'Result title', 300),
      url: sourceUrl,
      searches: matchingSearches,
      evidence,
      assessment: saved,
      summary: summarize(collection.criteria, saved),
    };
  });
  const expected = plan.collections.reduce((n, c) => n + c.searches.length, 0);
  const complete =
    Object.values(searches).filter((s) => s.complete).length === expected;
  return {
    version: 1,
    id: randomUUID(),
    plan,
    planHash: digest(plan),
    importHash: digest(raw),
    route: {
      provider: 'host',
      model: assistant,
      tools: [...new Set(Object.values(searches).map((s) => s.tool))],
    },
    createdAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    status: complete ? 'completed' : 'partial',
    ...(complete
      ? {}
      : {
          pauseReason:
            'Some planned searches are incomplete or missing. Saved findings remain available.',
        }),
    budgetUsd: null,
    accountedUsd: null,
    ledger: [],
    duplicates: 0,
    searches,
    items,
  };
}

export async function importResearch({ plan, input, directory }) {
  const run = hostRun(plan, input);
  return withLock(resolve(directory), async () => {
    const path = join(resolve(directory), 'run.json');
    const previous = await readJson(path, null);
    if (previous) {
      if (
        previous.route?.provider === 'host' &&
        previous.planHash === run.planHash &&
        previous.importHash === run.importHash
      )
        return previous;
      throw new Error(
        'Preserve this saved run. Import changed research into a new output directory.',
      );
    }
    await saveJson(path, run);
    return run;
  });
}
