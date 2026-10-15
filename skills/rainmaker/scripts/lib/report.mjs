import { readFile } from 'node:fs/promises';
import { atomicWrite } from './files.mjs';
import { summarize } from './plan.mjs';

export function validateNotes(run, raw = {}) {
  const items = new Map(run.items.map((i) => [i.id, i]));
  const string = (value, max) => {
    if (typeof value !== 'string' || value.length > max)
      throw new Error('Report notes must be bounded plain text.');
    return value;
  };
  const collections = (raw.collections || []).map((c) => {
    if (!run.plan.collections.some((lane) => lane.id === c.id))
      throw new Error('Notes reference an unknown collection.');
    if (!Array.isArray(c.topPickIds || []) || (c.topPickIds || []).length > 6)
      throw new Error('Choose at most six top picks per collection.');
    for (const id of c.topPickIds || [])
      if (
        items.get(id)?.collectionId !== c.id ||
        !items.get(id)?.assessment ||
        items.get(id)?.assessment?.subject === 'excluded'
      )
        throw new Error(
          'Top picks must reference assessed non-excluded items in their collection.',
        );
    return {
      id: c.id,
      summary: string(c.summary || '', 1600),
      topPickIds: [...new Set(c.topPickIds || [])],
    };
  });
  const results = (raw.results || []).map((r) => {
    if (!items.has(r.id))
      throw new Error('A result note references an unknown item.');
    return { id: r.id, note: string(r.note, 800) };
  });
  const references = [...new Set(raw.references || [])];
  if (references.some((id) => !items.has(id)))
    throw new Error('The recommended approach references an unknown item.');
  const approach = string(raw.approach || '', 4000);
  if (approach && !references.length)
    throw new Error(
      'A recommended approach needs references to saved results.',
    );
  return { collections, results, references, approach };
}
export function reportData(run, notes = {}) {
  return {
    version: 1,
    demo: run.demo === true,
    title: run.plan.title,
    brief: run.plan.brief,
    offer: run.plan.offer,
    territory: run.plan.territory,
    exclusions: run.plan.exclusions,
    createdAt: run.createdAt,
    finishedAt: run.finishedAt || null,
    status: run.status,
    pauseReason: run.pauseReason || null,
    provider: run.route?.provider || 'fixture',
    model: run.route?.model || 'fixture',
    budgetUsd: run.budgetUsd,
    accountedUsd: run.accountedUsd || 0,
    duplicates: run.duplicates || 0,
    searches: Object.values(run.searches),
    notes: validateNotes(run, notes),
    collections: run.plan.collections.map((c) => ({
      id: c.id,
      title: c.title,
      kind: c.kind,
      unit: c.unit,
      criteria: c.criteria,
      plannedSearches: c.searches.length,
      items: run.items
        .filter((i) => i.collectionId === c.id)
        .map((i) => ({
          id: i.id,
          title: i.title,
          url: i.url,
          evidence: i.evidence,
          assessment: i.assessment,
          evaluationError: i.evaluationError || null,
          summary: summarize(c.criteria, i.assessment),
        })),
    })),
  };
}
export function safeScriptJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
export async function renderReport(run, output, notes = {}) {
  const template = await readFile(
    new URL('../../assets/report-template.html', import.meta.url),
    'utf8',
  );
  if (!template.includes('"__RAINMAKER_DATA__"'))
    throw new Error(
      'Report template is missing. Reinstall Rainmaker from the repository.',
    );
  await atomicWrite(
    output,
    template.replace('"__RAINMAKER_DATA__"', () =>
      safeScriptJson(reportData(run, notes)),
    ),
  );
  return output;
}
