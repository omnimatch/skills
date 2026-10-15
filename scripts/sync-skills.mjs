import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { variants } from '../catalogue/skills.mjs';

const root = new URL('../', import.meta.url);
const source = new URL('skills/prospector/', root);
const digest = (value) =>
  createHash('sha256')
    .update(typeof value === 'string' ? value : JSON.stringify(value))
    .digest('hex');
export function makeDemo(variant) {
  const plan = {
    version: 1,
    title: variant.title,
    brief: variant.brief,
    offer: variant.offer,
    territory: variant.territory,
    exclusions: variant.exclusions,
    collections: variant.collections,
  };
  const items = variant.collections.flatMap((c, lane) =>
    variant.demos[lane].map((title, index) => {
      const url = `https://${variant.slug}-${c.id}-${index + 1}.example/`;
      const scores = Object.fromEntries(
        c.criteria.map((criterion, axis) => {
          const supported = !(index === 3 && axis === 2);
          const score = Math.max(0.2, 0.95 - index * 0.1 - axis * 0.04);
          const mean = score * (criterion.levels.length - 1),
            low = Math.floor(mean),
            high = Math.ceil(mean);
          const probabilities = Array(criterion.levels.length).fill(0);
          probabilities[low] = 1 - (mean - low);
          if (high !== low) probabilities[high] = mean - low;
          return [
            criterion.id,
            {
              score: supported ? score : null,
              supported,
              confidence: 0.84,
              probabilities,
            },
          ];
        }),
      );
      const total = c.criteria.reduce((n, k) => n + k.weight, 0),
        known = c.criteria.reduce(
          (n, k) => n + (scores[k.id].supported ? k.weight : 0),
          0,
        ),
        weighted = c.criteria.reduce(
          (n, k) =>
            n + (scores[k.id].supported ? scores[k.id].score * k.weight : 0),
          0,
        );
      const point =
        variant.slug === 'day-tripper' && lane === 0 && index < 3
          ? { lat: 51.5 + index * 0.004, lon: -0.13 + index * 0.006 }
          : null;
      return {
        id: digest(url).slice(0, 16),
        collectionId: c.id,
        title,
        url,
        searches: [`search:${c.id}:0`],
        assessment: {
          provider: 'fixture',
          model: 'fixture',
          subject: 'eligible',
          scores,
          evaluatedAt: '2026-10-15T09:05:00Z',
        },
        summary: {
          score: weighted / known,
          coverage: known / total,
          rank: weighted / total,
          requirements: [],
        },
        evidence: [
          {
            url,
            text: `${title}. ${variant.demoEvidence[lane]}${point ? ` Synthetic illustration coordinates: ${point.lat}, ${point.lon}.` : ''}`,
            retrievedAt: '2026-10-15T09:02:00Z',
            publishedAt: null,
            truncated: false,
          },
        ],
      };
    }),
  );
  const run = {
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
    duplicates: 0,
    ledger: [],
    searches: Object.fromEntries(
      variant.collections.flatMap((c) =>
        c.searches.map((s, index) => [
          `search:${c.id}:${index}`,
          {
            complete: true,
            collectionId: c.id,
            query: s.query,
            requested: s.numResults,
            returned:
              index === 0
                ? variant.demos[variant.collections.indexOf(c)].length
                : 0,
            atCapacity: false,
          },
        ]),
      ),
    ),
    items,
  };
  if (variant.slug === 'day-tripper')
    run.demoNotes = {
      itinerary: {
        date: 'Fictional example day',
        timezone: 'Europe/London',
        stops: items
          .filter((i) => i.collectionId === 'ideas')
          .slice(0, 3)
          .map((item, index) => ({
            id: item.id,
            time: ['10:30–12:00', '12:15–13:45', '14:00–15:00'][index],
            note: [
              'Start with the gallery as the anchor. Verify the exhibition and opening date before using a real plan.',
              'Leave a generous lunch stop. Check menu, prices and a table for two.',
              'Keep the afternoon flexible. These synthetic points illustrate stop order only.',
            ][index],
            coordinates: {
              lat: 51.5 + index * 0.004,
              lon: -0.13 + index * 0.006,
              sourceUrl: item.url,
            },
          })),
        indoorSwap:
          'Swap the gardens for Old Mill Museum after checking its opening hours and travel time.',
        nextAction:
          'For a real day, verify the chosen date and book the anchor before setting off.',
      },
    };
  return run;
}
for (const variant of variants) {
  const dest = new URL(`skills/${variant.slug}/`, root);
  await mkdir(new URL('scripts/lib/', dest), { recursive: true });
  await mkdir(new URL('references/', dest), { recursive: true });
  await mkdir(new URL('assets/', dest), { recursive: true });
  const transform = (s) =>
    s
      .replaceAll(
        '--collection accounts',
        `--collection ${variant.collections[0].id}`,
      )
      .replaceAll('"id": "accounts"', `"id": "${variant.collections[0].id}"`)
      .replaceAll('PROSPECTOR', variant.env)
      .replaceAll('Prospector', variant.name)
      .replaceAll('prospector', variant.slug);
  for (const file of [
    'scripts/lib/files.mjs',
    'scripts/lib/engine.mjs',
    'scripts/lib/plan.mjs',
    'scripts/lib/providers.mjs',
    'scripts/lib/report.mjs',
    'references/setup.md',
    'references/workflow.md',
    'references/host-output.md',
  ])
    await writeFile(
      new URL(file, dest),
      transform(await readFile(new URL(file, source), 'utf8')),
    );
  await writeFile(
    new URL(`scripts/${variant.slug}.mjs`, dest),
    transform(
      await readFile(new URL('scripts/prospector.mjs', source), 'utf8'),
    ),
  );
  const demo = makeDemo(variant);
  await writeFile(
    new URL('scripts/lib/demo.mjs', dest),
    `// Generated by scripts/sync-skills.mjs from the fictional catalogue.\nexport function demoRun() { return ${JSON.stringify(demo, null, 2)}; }\n`,
  );
  await writeFile(
    new URL('references/example-plan.json', dest),
    `${JSON.stringify(demo.plan, null, 2)}\n`,
  );
  await cp(new URL('LICENSE', source), new URL('LICENSE', dest));
  await cp(
    new URL('assets/THIRD_PARTY_LICENSES.txt', source),
    new URL('assets/THIRD_PARTY_LICENSES.txt', dest),
  );
}
console.log(`Synced ${variants.length} self-contained research skills.`);
execFileSync(
  fileURLToPath(new URL('node_modules/.bin/biome', root)),
  ['format', '--write', ...variants.map((v) => `skills/${v.slug}`)],
  { cwd: fileURLToPath(root), stdio: 'inherit' },
);
