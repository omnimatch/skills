import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { demoRun } from '../skills/prospector/scripts/lib/demo.mjs';
import {
  hostRun,
  importResearch,
} from '../skills/prospector/scripts/lib/host.mjs';
import { reportData } from '../skills/prospector/scripts/lib/report.mjs';

const exec = promisify(execFile);
function fixture() {
  const plan = demoRun().plan;
  plan.collections = [plan.collections[0]];
  const collection = plan.collections[0];
  return {
    plan,
    input: {
      version: 1,
      assistant: 'Grok',
      searches: [
        {
          collectionId: collection.id,
          searchIndex: 0,
          query: collection.searches[0].query,
          tool: 'Exa plugin search',
          retrievedAt: '2026-10-15T12:00:00Z',
          complete: true,
          resultUrls: ['https://source.example/profile?utm_source=exa'],
        },
      ],
      items: [
        {
          collectionId: collection.id,
          title: 'Source profile',
          url: 'https://source.example/profile',
          evidence: [
            {
              url: 'https://source.example/profile',
              text: 'An actual tool-returned passage in a synthetic test.',
              retrievedAt: '2026-10-15T12:00:00Z',
            },
          ],
          assessment: {
            subject: 'uncertain',
            reason: 'One scope fact is unknown.',
            evaluatedAt: '2026-10-15T12:05:00Z',
            scores: Object.fromEntries(
              collection.criteria.map((c, i) => [
                c.id,
                {
                  level: i === 0 ? 2 : null,
                  reason:
                    i === 0
                      ? 'Passage supports this level.'
                      : 'Not established.',
                  evidence: i === 0 ? [0] : [],
                },
              ]),
            ),
          },
        },
      ],
    },
  };
}
test('connected-tool research preserves unknowns, provenance and honest billing without provider configuration', () => {
  const { plan, input } = fixture(),
    run = hostRun(plan, input),
    data = reportData(run);
  assert.equal(run.status, 'completed');
  assert.equal(run.route.provider, 'host');
  assert.deepEqual(run.route.tools, ['Exa plugin search']);
  assert.equal(
    run.items[0].assessment.scores[plan.collections[0].criteria[1].id].score,
    null,
  );
  assert.equal(
    run.items[0].summary.coverage,
    plan.collections[0].criteria[0].weight /
      plan.collections[0].criteria.reduce((n, c) => n + c.weight, 0),
  );
  assert.equal(data.budgetUsd, null);
  assert.equal(data.accountedUsd, null);
  assert.equal(run.ledger.length, 0);
});
test('import rejects mismatched queries, invented evidence references and unsupported scores', () => {
  for (const [mutate, message] of [
    [
      (_p, i) => {
        i.searches[0].query = 'not the planned query';
      },
      /exact planned/,
    ],
    [
      (_p, i) => {
        i.items[0].url = 'https://unreturned.example/';
      },
      /matching search/,
    ],
    [
      (_p, i) => {
        i.items[0].evidence[0].url = 'javascript:alert(1)';
      },
      /HTTP/,
    ],
    [
      (p, i) => {
        i.items[0].assessment.scores[p.collections[0].criteria[0].id].evidence =
          [9];
      },
      /indices/,
    ],
    [
      (p, i) => {
        i.items[0].assessment.scores[p.collections[0].criteria[0].id].evidence =
          [];
      },
      /cite saved/,
    ],
    [
      (p, i) => {
        i.items[0].assessment.scores[p.collections[0].criteria[0].id].level =
          999;
      },
      /in the rubric/,
    ],
    [
      (p, i) => {
        delete i.items[0].assessment.scores[p.collections[0].criteria[0].id];
      },
      /exactly/,
    ],
    [
      (_p, i) => {
        i.items.push(structuredClone(i.items[0]));
      },
      /duplicate canonical/,
    ],
  ]) {
    const { plan, input } = fixture();
    mutate(plan, input);
    assert.throws(() => hostRun(plan, input), message);
  }
});
test('missing and failed searches remain partial, including empty findings', () => {
  const { plan, input } = fixture();
  input.searches[0].complete = false;
  assert.equal(hostRun(plan, input).status, 'partial');
  input.searches = [];
  input.items = [];
  assert.equal(hostRun(plan, input).status, 'partial');
});
test('host import is idempotent and cannot overwrite saved research', async () => {
  const { plan, input } = fixture(),
    directory = await mkdtemp(join(tmpdir(), 'host-import-'));
  const first = await importResearch({ plan, input, directory });
  assert.equal((await importResearch({ plan, input, directory })).id, first.id);
  input.assistant = 'Changed host';
  await assert.rejects(
    importResearch({ plan, input, directory }),
    /new output directory/,
  );
  const previous = JSON.parse(
    await readFile(join(directory, 'run.json'), 'utf8'),
  );
  assert.equal(previous.id, first.id);
  previous.route.provider = 'openai';
  await writeFile(join(directory, 'run.json'), JSON.stringify(previous));
  await assert.rejects(
    importResearch({ plan, input: fixture().input, directory }),
    /Preserve/,
  );
});
test('CLI imports and renders in a clean home without credentials, preserving host provenance', async () => {
  const { plan, input } = fixture(),
    directory = await mkdtemp(join(tmpdir(), 'host-cli-'));
  await writeFile(join(directory, 'plan.json'), JSON.stringify(plan));
  await writeFile(join(directory, 'research.json'), JSON.stringify(input));
  const { stdout } = await exec(
    process.execPath,
    [
      'skills/prospector/scripts/prospector.mjs',
      'import',
      '--plan',
      join(directory, 'plan.json'),
      '--input',
      join(directory, 'research.json'),
      '--out',
      join(directory, 'out'),
    ],
    {
      env: {
        PATH: process.env.PATH,
        PROSPECTOR_CONFIG_DIR: join(directory, 'absent-config'),
      },
    },
  );
  assert.equal(JSON.parse(stdout).status, 'completed');
  const html = await readFile(join(directory, 'out/report.html'), 'utf8');
  assert.ok(html.includes('Exa plugin search'));
  assert.ok(html.includes('"budgetUsd":null'));
  assert.ok(html.includes('"provider":"host"'));
});
