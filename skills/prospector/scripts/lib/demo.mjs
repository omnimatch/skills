import { digest } from './files.mjs';
import { summarize } from './plan.mjs';

const dimensions = (labels) =>
  labels.map((label, i) => ({
    id: `criterion_${i}`,
    label,
    question: `How strong is the direct evidence of ${label.toLowerCase()}?`,
    weight: i === 0 ? 3 : 1,
    required: false,
    levels: [
      'No match',
      'Limited match',
      'Some match',
      'Good match',
      'Strong match',
    ],
  }));
export function demoRun() {
  const collections = [
    {
      id: 'accounts',
      kind: 'companies',
      title: 'Companies',
      unit: 'companies',
      criteria: dimensions([
        'Offer fit',
        'Scale',
        'Territory',
        'Timing',
        'Access',
      ]),
      searches: [{ query: 'Illustrative company search', numResults: 25 }],
    },
    {
      id: 'buyers',
      kind: 'people',
      title: 'People',
      unit: 'public professional profiles',
      criteria: dimensions([
        'Role fit',
        'Employer fit',
        'Relevance',
        'Common ground',
      ]),
      searches: [{ query: 'Illustrative people search', numResults: 25 }],
    },
    {
      id: 'events',
      kind: 'events',
      title: 'Events',
      unit: 'event listing pages',
      criteria: dimensions([
        'Audience fit',
        'Location',
        'Timing',
        'Meeting access',
      ]),
      searches: [{ query: 'Illustrative event search', numResults: 25 }],
    },
  ];
  const plan = {
    version: 1,
    title: 'Where your next customers could be',
    brief:
      'A demonstration of Prospector researching UK manufacturers for an operations consultancy. All organisations, people and events in this report are fictional.',
    offer: 'Operations improvement for growing manufacturers',
    territory: 'United Kingdom',
    exclusions: [],
    collections,
  };
  const names = [
    [
      'Northline Engineering',
      'Alder & Co.',
      'Fieldwork Manufacturing',
      'Common Ground Systems',
      'Meridian Components',
      'Foundry North',
      'Arcwell Industries',
      'Hartley Precision',
      'Morrow Materials',
      'Westhaven Works',
      'Goodform Products',
      'Kelvin Assembly',
      'Dovetail Components',
      'Longshore Metals',
      'Newbridge Packaging',
      'Oakwell Fabrication',
      'Parkfield Systems',
      'Redfern Plastics',
    ],
    [
      'Amelia Hart · Operations Director',
      'Daniel Wells · Managing Director',
      'Priya Shah · Head of Improvement',
      'Oliver Reed · Production Director',
      'Sophie Chen · Supply Chain Lead',
      'James Cole · COO',
    ],
    [
      'Manufacturing Exchange · Birmingham',
      'Operations Leaders Forum · Manchester',
      'Industrial Futures · Leeds',
      'Made in Britain Roundtable · Bristol',
    ],
  ];
  const items = collections.flatMap((collection, lane) =>
    names[lane].map((title, index) => {
      const scores = Object.fromEntries(
        collection.criteria.map((c, axis) => {
          const value = Math.max(
            0.1,
            Math.min(
              0.98,
              0.93 - index * 0.035 - ((index + axis * 3) % 5) * 0.065,
            ),
          );
          const mean = value * 4,
            lower = Math.floor(mean),
            upper = Math.ceil(mean);
          const probabilities = [0, 0, 0, 0, 0];
          probabilities[lower] = 1 - (mean - lower);
          if (upper !== lower) probabilities[upper] = mean - lower;
          const supported = !(
            (index === 3 && axis === 3) ||
            (index === 5 && axis === 4)
          );
          return [
            c.id,
            {
              score: supported ? value : null,
              confidence: 0.84,
              supported,
              probabilities,
            },
          ];
        }),
      );
      const url = `https://${collection.id}-${index + 1}.example/`;
      const assessment = {
        provider: 'fixture',
        model: 'fixture',
        subject: index === 12 ? 'excluded' : 'eligible',
        scores,
        evaluatedAt: '2026-10-15T09:05:00Z',
      };
      return {
        id: digest(url).slice(0, 16),
        collectionId: collection.id,
        title,
        url,
        assessment,
        summary: summarize(collection.criteria, assessment),
        searches: [`search:${collection.id}:0`],
        evidence: [
          {
            url,
            text:
              lane === 0
                ? `${title} is a fictional manufacturer used to demonstrate this report. Its example profile describes a UK production site, an expanding operations team and a programme to improve delivery times. These are sample facts, not researched claims.\n\nThe example evidence supports the offer and territory criteria. Each saved source remains available beside the assessment.`
                : lane === 1
                  ? `${title} is a fictional professional profile. This example describes operational responsibility at one of the sample manufacturers. A job title does not establish purchasing authority or an existing relationship.`
                  : `${title} is a fictional event listing. The audience is relevant to manufacturing operations. No named person's attendance or upcoming date is verified by this demonstration.`,
            retrievedAt: '2026-10-15T09:02:00Z',
            publishedAt: null,
            truncated: false,
          },
        ],
      };
    }),
  );
  return {
    version: 1,
    demo: true,
    id: 'demo',
    planHash: digest(plan),
    plan,
    route: { provider: 'fixture', model: 'fixture' },
    createdAt: '2026-10-15T09:00:00Z',
    finishedAt: '2026-10-15T09:08:00Z',
    status: 'completed',
    budgetUsd: 2,
    accountedUsd: 0,
    duplicates: 4,
    ledger: [],
    searches: Object.fromEntries(
      collections.map((c) => [
        `search:${c.id}:0`,
        {
          complete: true,
          collectionId: c.id,
          query: c.searches[0].query,
          requested: 25,
          returned: names[collections.indexOf(c)].length,
          atCapacity: false,
        },
      ]),
    ),
    items,
  };
}
