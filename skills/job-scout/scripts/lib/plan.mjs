const text = (v, label, max = 1000) => {
  if (typeof v !== 'string' || !v.trim() || v.length > max)
    throw new Error(
      `${label} must be nonempty text, at most ${max} characters.`,
    );
  return v.trim();
};
const id = (v, label) => {
  text(v, label, 50);
  if (!/^[a-z][a-z0-9_-]*$/.test(v))
    throw new Error(`${label} must be a lowercase identifier.`);
  return v;
};
const unique = (items, label) => {
  if (new Set(items).size !== items.length)
    throw new Error(`${label} must be unique.`);
};
export function validatePlan(raw) {
  if (raw?.version !== 1) throw new Error('Plan version must be 1.');
  if (
    !Array.isArray(raw.collections) ||
    !raw.collections.length ||
    raw.collections.length > 6
  )
    throw new Error('Use one to six separate research collections.');
  const plan = {
    version: 1,
    title: text(raw.title, 'Title', 180),
    brief: text(raw.brief, 'Brief', 5000),
    offer: text(raw.offer, 'Offer', 2000),
    territory: text(raw.territory, 'Territory', 500),
    exclusions: (raw.exclusions || []).map((v) => text(v, 'Exclusion', 500)),
    collections: raw.collections.map((c) => {
      if (
        !['companies', 'people', 'events', 'news', 'jobs', 'places'].includes(
          c.kind,
        )
      )
        throw new Error(
          'Collection kind must be companies, people, events, news, jobs or places.',
        );
      if (
        !Array.isArray(c.criteria) ||
        c.criteria.length < 3 ||
        c.criteria.length > 8
      )
        throw new Error(
          'Each collection needs three to eight meaningful score criteria.',
        );
      if (
        !Array.isArray(c.searches) ||
        !c.searches.length ||
        c.searches.length > 20
      )
        throw new Error('Each collection needs one to twenty searches.');
      const criteria = c.criteria.map((k) => {
        if (
          !Array.isArray(k.levels) ||
          k.levels.length < 2 ||
          k.levels.length > 5
        )
          throw new Error('A criterion needs two to five ordered levels.');
        if (!(Number.isFinite(k.weight) && k.weight > 0 && k.weight <= 10))
          throw new Error(
            'Criterion weight must be above zero and at most ten.',
          );
        if (k.required !== undefined && typeof k.required !== 'boolean')
          throw new Error('required must be true or false.');
        return {
          id: id(k.id, 'Criterion id'),
          label: text(k.label, 'Criterion label', 70),
          question: text(k.question, 'Criterion question', 600),
          weight: k.weight,
          required: k.required === true,
          levels: k.levels.map((l) => text(l, 'Score level', 300)),
        };
      });
      unique(
        criteria.map((k) => k.id),
        'Criterion ids',
      );
      const searches = c.searches.map((s) => {
        const n = s.numResults ?? 25;
        if (!Number.isInteger(n) || n < 1 || n > 100)
          throw new Error('Search numResults must be 1–100.');
        const search = {
          query: text(s.query, 'Search query', 1000),
          numResults: n,
        };
        if (s.since) {
          if (
            !/^\d{4}-\d{2}-\d{2}T/.test(s.since) ||
            !Number.isFinite(Date.parse(s.since))
          )
            throw new Error('Search since must be an ISO timestamp.');
          if (['companies', 'people'].includes(c.kind))
            throw new Error(
              'Company and people searches do not accept publication-date filters. Put scope into the query.',
            );
          search.since = s.since;
        }
        return search;
      });
      unique(
        searches.map((s) => s.query),
        'Search queries within each collection',
      );
      return {
        id: id(c.id, 'Collection id'),
        kind: c.kind,
        title: text(c.title, 'Collection title', 100),
        unit: text(c.unit, 'Result unit', 100),
        criteria,
        searches,
      };
    }),
  };
  unique(
    plan.collections.map((c) => c.id),
    'Collection ids',
  );
  if (plan.collections.reduce((n, c) => n + c.searches.length, 0) > 60)
    throw new Error('A plan supports at most sixty searches.');
  return plan;
}
export function canonicalUrl(value) {
  try {
    const u = new URL(value);
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password)
      return null;
    u.hash = '';
    for (const k of [...u.searchParams.keys()])
      if (/^(utm_|fbclid$|gclid$)/i.test(k)) u.searchParams.delete(k);
    u.searchParams.sort();
    u.hostname = u.hostname.toLowerCase();
    u.pathname = u.pathname.replace(/\/$/, '') || '/';
    return u.href;
  } catch {
    return null;
  }
}
export function summarize(criteria, assessment) {
  let weighted = 0,
    known = 0;
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  const requirements = [];
  for (const c of criteria) {
    const a = assessment?.scores?.[c.id];
    if (a?.supported && Number.isFinite(a.score)) {
      weighted += a.score * c.weight;
      known += c.weight;
    }
    if (c.required)
      requirements.push({
        label: c.label,
        status: !a?.supported
          ? 'unverified'
          : a.score >= 0.75
            ? 'met'
            : 'not met',
      });
  }
  const score = known ? weighted / known : null;
  return {
    score,
    coverage: known / total,
    rank: total ? weighted / total : 0,
    requirements,
  };
}
