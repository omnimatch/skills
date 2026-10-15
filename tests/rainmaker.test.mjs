import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { demoRun } from '../skills/rainmaker/scripts/lib/demo.mjs';
import { runResearch } from '../skills/rainmaker/scripts/lib/engine.mjs';
import { readJson, saveJson } from '../skills/rainmaker/scripts/lib/files.mjs';
import {
  canonicalUrl,
  summarize,
  validatePlan,
} from '../skills/rainmaker/scripts/lib/plan.mjs';
import {
  evaluationInput,
  evaluationQuestions,
  evaluatorRequest,
  exaRequest,
  normalizeAssessment,
} from '../skills/rainmaker/scripts/lib/providers.mjs';
import {
  renderReport,
  reportData,
  validateNotes,
} from '../skills/rainmaker/scripts/lib/report.mjs';

const exec = promisify(execFile);
const temp = () => mkdtemp(join(tmpdir(), 'rainmaker-test-'));
const sample = () => {
  const plan = structuredClone(demoRun().plan);
  plan.collections = [plan.collections[0]];
  plan.collections[0].searches = [{ query: 'UK manufacturers', numResults: 2 }];
  return validatePlan(plan);
};
const settings = {
  config: { provider: 'openai', budgetUsd: 2 },
  keys: { EXA_API_KEY: 'fixture-search', OPENAI_API_KEY: 'fixture-evaluator' },
};
const response = (body) => Response.json(body);
function assessment(collection, provider = 'openai', unknown = false) {
  const questions = evaluationQuestions(collection);
  const answers = questions.map((q) =>
    q.type === 'score'
      ? {
          name: q.id,
          type: 'score',
          score: 3,
          confidence: 0.9,
          probabilities: [0, 0, 0, 1, 0].map((p, i) => ({
            value: i,
            probability: p,
          })),
        }
      : {
          name: q.id,
          type: 'choice',
          choice:
            q.id === 'subject'
              ? 'eligible'
              : unknown
                ? 'insufficient'
                : 'sufficient',
          confidence: 0.9,
          probabilities: Object.keys(q.choices).map((k) => ({
            value: k,
            probability:
              k ===
              (q.id === 'subject'
                ? 'eligible'
                : unknown
                  ? 'insufficient'
                  : 'sufficient')
                ? 1
                : 0,
          })),
        },
  );
  return provider === 'openai'
    ? { model: 'gpt-6-luna', answers }
    : {
        result: {
          model: 'clef-flash',
          answers: Object.fromEntries(
            answers.map((a) => [
              a.name,
              {
                ...a,
                probabilities: Object.fromEntries(
                  a.probabilities.map((p) => [p.value, p.probability]),
                ),
              },
            ]),
          ),
        },
      };
}
const searchResult = () => ({
  results: [
    {
      title: 'Fixture manufacturing',
      url: 'https://example.com/?utm_source=test',
      text: 'A UK production company with direct evidence.',
    },
    {
      title: 'Same canonical company page',
      url: 'https://example.com/',
      text: 'A UK production company with direct evidence.',
    },
  ],
  costDollars: { total: 0.01 },
});

test('plan preserves scope, rejects unsupported filters and duplicate criteria', () => {
  const plan = sample();
  assert.equal(plan.collections[0].criteria.length, 5);
  plan.collections[0].searches[0].since = '2026-10-01T00:00:00Z';
  assert.throws(() => validatePlan(plan), /publication-date/);
  delete plan.collections[0].searches[0].since;
  plan.collections[0].criteria[1].id = plan.collections[0].criteria[0].id;
  assert.throws(() => validatePlan(plan), /unique/);
});
test('URL identity preserves event IDs and discards unsafe schemes and tracking', () => {
  assert.equal(
    canonicalUrl('https://events.example/list?id=2&utm_source=mail#x'),
    'https://events.example/list?id=2',
  );
  assert.notEqual(
    canonicalUrl('https://events.example/list?id=2'),
    canonicalUrl('https://events.example/list?id=3'),
  );
  assert.equal(canonicalUrl('javascript:alert(1)'), null);
  assert.equal(canonicalUrl('https://user:password@example.com'), null);
});
test('provider requests use the distinct Decisions and Clef contracts', () => {
  const c = sample().collections[0];
  const q = evaluationQuestions(c);
  const openai = evaluatorRequest('openai', 'gpt-6-luna', 'evidence', q);
  const clef = evaluatorRequest('clef', 'clef-flash', 'evidence', q);
  assert.equal(openai.input, 'evidence');
  assert.ok(Array.isArray(openai.questions));
  assert.deepEqual(openai.questions[1].levels[0], {
    label: 'Level 1',
    description: 'No match',
  });
  assert.equal(clef.state, 'evidence');
  assert.equal(clef.questions.subject.type, 'choice');
  assert.equal(exaRequest(c, c.searches[0]).category, 'company');
});
test('unknown evidence never becomes a zero fit score; distributions are validated', () => {
  const c = sample().collections[0];
  for (const provider of ['openai', 'clef']) {
    const a = normalizeAssessment(provider, assessment(c, provider, true), c);
    assert.equal(a.scores.criterion_0.score, null);
    assert.equal(summarize(c.criteria, a).score, null);
    assert.equal(summarize(c.criteria, a).coverage, 0);
  }
  const raw = assessment(c);
  raw.answers[1].probabilities[0].probability = 0.8;
  assert.throws(() => normalizeAssessment('openai', raw, c), /distribution/);
});
test('Clef supports the REST wrapper plus a completed Workers AI task envelope', () => {
  const c = sample().collections[0];
  const task = {
    success: true,
    result: { state: 'Completed', result: assessment(c, 'clef').result },
  };
  assert.equal(
    normalizeAssessment('clef', task, c).scores.criterion_0.score,
    0.75,
  );
  assert.throws(
    () =>
      normalizeAssessment(
        'clef',
        { result: { state: 'Failed', error: 'Stopped' } },
        c,
      ),
    /did not complete/,
  );
});
test('large merged evidence is bounded for evaluation while original passages remain saved', () => {
  const plan = sample();
  const evidence = Array.from({ length: 10 }, () => ({
    url: 'https://example.com/',
    text: 'x'.repeat(12000),
  }));
  const input = JSON.parse(
    evaluationInput(plan, plan.collections[0], {
      title: 'Company',
      url: 'https://example.com/',
      evidence,
    }),
  );
  assert.equal(
    input.evidence.reduce((n, e) => n + e.text.length, 0),
    16000,
  );
  assert.equal(input.evidenceOmitted, true);
  assert.equal(evidence[1].text.length, 12000);
});
test('a successful run deduplicates, saves evidence and resumes without API calls', async () => {
  const directory = await temp(),
    plan = sample();
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push([url, JSON.parse(options.body)]);
    return response(
      url.includes('exa.ai') ? searchResult() : assessment(plan.collections[0]),
    );
  };
  const run = await runResearch({ plan, directory, settings, fetcher });
  assert.equal(run.status, 'completed');
  assert.equal(run.items.length, 1);
  assert.equal(run.duplicates, 1);
  assert.equal(run.items[0].summary.score, 0.75);
  assert.equal(calls.length, 2);
  assert.equal(run.items[0].evidence[0].url, 'https://example.com/');
  const again = await runResearch({
    plan,
    directory,
    settings,
    fetcher: () => {
      throw new Error('Must remain offline');
    },
  });
  assert.equal(again.status, 'completed');
  assert.equal(again.ledger.length, 2);
  assert.ok((await stat(join(directory, 'run.json'))).mode & 0o600);
  assert.equal((await stat(join(directory, 'run.json'))).mode & 0o077, 0);
});
test('budget reserves stop the next dispatch and preserve an offline partial report', async () => {
  const directory = await temp(),
    plan = sample();
  let calls = 0;
  const run = await runResearch({
    plan,
    directory,
    settings,
    budgetUsd: 0.25,
    fetcher: async () => {
      calls++;
      return response(searchResult());
    },
  });
  assert.equal(run.status, 'paused');
  assert.equal(calls, 1);
  assert.equal(run.items.length, 1);
  assert.match(run.pauseReason, /ceiling/);
  assert.equal(run.accountedUsd, 0.25);
  await renderReport(run, join(directory, 'partial.html'));
  assert.ok(
    (await readFile(join(directory, 'partial.html'), 'utf8')).includes(
      '"status":"paused"',
    ),
  );
});
test('HTTP failures require explicit retry and retain the original reservation', async () => {
  const directory = await temp(),
    plan = sample();
  let calls = 0;
  const first = await runResearch({
    plan,
    directory,
    settings,
    fetcher: async () => {
      calls++;
      return new Response('', { status: 429 });
    },
  });
  assert.equal(first.status, 'paused');
  assert.equal(calls, 1);
  await runResearch({
    plan,
    directory,
    settings,
    fetcher: () => {
      calls++;
      throw new Error('Unexpected retry');
    },
  });
  assert.equal(calls, 1);
  const resumed = await runResearch({
    plan,
    directory,
    settings,
    retryFailed: true,
    fetcher: async (url) => {
      calls++;
      return response(
        url.includes('exa.ai')
          ? searchResult()
          : assessment(plan.collections[0]),
      );
    },
  });
  assert.equal(resumed.status, 'completed');
  assert.equal(calls, 3);
  assert.equal(resumed.ledger.length, 3);
});
test('lost requests cannot be automatically replayed after a crash', async () => {
  const directory = await temp(),
    plan = sample();
  const run = await runResearch({
    plan,
    directory,
    settings,
    budgetUsd: 0.001,
    fetcher: () => {
      throw new Error('No dispatch');
    },
  });
  run.ledger.push({
    key: 'search:accounts:0',
    status: 'inflight',
    accountedUsd: 0.25,
  });
  await saveJson(join(directory, 'run.json'), run);
  let calls = 0;
  const resumed = await runResearch({
    plan,
    directory,
    settings,
    fetcher: () => {
      calls++;
    },
  });
  assert.equal(calls, 0);
  assert.match(resumed.pauseReason, /uncertain/);
  assert.equal(resumed.ledger.at(-1).status, 'uncertain');
});
test('received receipts recover after a crash without duplicating paid work', async () => {
  const directory = await temp(),
    plan = sample();
  const run = await runResearch({
    plan,
    directory,
    settings,
    budgetUsd: 0.001,
    fetcher: () => {},
  });
  run.ledger.push({
    key: 'search:accounts:0',
    status: 'received',
    accountedUsd: 0.25,
    response: searchResult(),
  });
  await saveJson(join(directory, 'run.json'), run);
  let calls = 0;
  const resumed = await runResearch({
    plan,
    directory,
    settings,
    fetcher: async (url) => {
      calls++;
      assert.ok(url.includes('openai.com'));
      return response(assessment(plan.collections[0]));
    },
  });
  assert.equal(calls, 1);
  assert.equal(resumed.status, 'completed');
});
test('invalid saved evaluator receipts can be reparsed without another paid request', async () => {
  const directory = await temp(),
    plan = sample();
  const run = await runResearch({
    plan,
    directory,
    settings,
    fetcher: async (url) =>
      response(url.includes('exa.ai') ? searchResult() : { answers: [] }),
  });
  assert.equal(run.status, 'partial');
  assert.ok(run.ledger.at(-1).response);
  // Model an adapter repair by replacing a rejected receipt with a valid recorded response.
  run.ledger.at(-1).response = assessment(plan.collections[0]);
  await saveJson(join(directory, 'run.json'), run);
  const repaired = await runResearch({
    plan,
    directory,
    settings,
    fetcher: () => {
      throw new Error('Must reparse offline');
    },
  });
  assert.equal(repaired.status, 'completed');
  assert.equal(repaired.items[0].evaluationError, undefined);
  assert.equal(repaired.ledger.length, 2);
});
test('missing source text is not assessed and remains visible as partial coverage', async () => {
  const plan = sample(),
    directory = await temp();
  let calls = 0;
  const run = await runResearch({
    plan,
    directory,
    settings,
    fetcher: async () => {
      calls++;
      return response({
        results: [{ title: 'Only a link', url: 'https://example.com/' }],
      });
    },
  });
  assert.equal(calls, 1);
  assert.equal(run.status, 'partial');
  assert.match(run.items[0].evaluationError, /No source text/);
});
test('reports escape source HTML and substitution tokens, whitelist fields and need no secrets', async () => {
  const run = demoRun();
  run.plan.brief = '</script><script>globalThis.stolen=1</script> $& $`';
  run.keys = { OPENAI_API_KEY: 'NEVER_INCLUDE_THIS' };
  run.ledger = [{ response: { secret: 'ALSO_PRIVATE' } }];
  const directory = await temp();
  await renderReport(run, join(directory, 'report.html'));
  const html = await readFile(join(directory, 'report.html'), 'utf8');
  assert.ok(!html.includes('NEVER_INCLUDE_THIS'));
  assert.ok(!html.includes('ALSO_PRIVATE'));
  assert.ok(!html.includes('</script><script>globalThis.stolen'));
  const json = html.match(/id="rainmaker-data">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(json).brief, run.plan.brief);
  assert.equal(reportData(run).collections.length, 3);
});
test('curation can reference only existing assessed results and never overwrite scores', () => {
  const run = demoRun();
  const id = run.items[0].id;
  assert.equal(
    validateNotes(run, {
      collections: [
        {
          id: 'accounts',
          summary: 'Grounded interpretation',
          topPickIds: [id],
        },
      ],
      approach: 'Read this company profile.',
      references: [id],
    }).collections[0].topPickIds[0],
    id,
  );
  assert.throws(
    () => validateNotes(run, { approach: 'An unsupported recommendation' }),
    /references/,
  );
  assert.throws(
    () => validateNotes(run, { results: [{ id: 'invented', note: 'No' }] }),
    /unknown/,
  );
});
test('presentation export matches the saved report and excludes request receipts', async () => {
  const directory = await temp();
  const run = demoRun();
  run.ledger = [{ response: { privateReceipt: 'OMIT_RECEIPTS' } }];
  await saveJson(join(directory, 'run.json'), run);
  await exec(process.execPath, [
    new URL('../skills/rainmaker/scripts/rainmaker.mjs', import.meta.url)
      .pathname,
    'report',
    '--run',
    directory,
    '--data-out',
    join(directory, 'data.json'),
  ]);
  const exported = await readJson(join(directory, 'data.json'));
  const html = await readFile(join(directory, 'report.html'), 'utf8');
  const embedded = JSON.parse(
    html.match(/id="rainmaker-data">([\s\S]*?)<\/script>/)[1],
  );
  assert.deepEqual(exported, embedded);
  assert.equal(
    exported.collections.flatMap((c) => c.items).length,
    run.items.length,
  );
  assert.ok(!JSON.stringify(exported).includes('OMIT_RECEIPTS'));
});
test('a copied skill folder generates its report with Node and no npm install', async () => {
  const directory = await temp();
  const installed = join(directory, 'installed-skill');
  await cp(new URL('../skills/rainmaker/', import.meta.url), installed, {
    recursive: true,
  });
  const { stdout } = await exec(process.execPath, [
    join(installed, 'scripts/rainmaker.mjs'),
    'demo',
    '--out',
    join(directory, 'report'),
  ]);
  assert.match(stdout, /no API calls/);
  assert.ok(
    (await readFile(join(directory, 'report/report.html'), 'utf8')).includes(
      'rainmaker-root',
    ),
  );
});
test('non-interactive setup stores only chosen credentials and doctor never prints them', async () => {
  const directory = await temp();
  const script = new URL(
    '../skills/rainmaker/scripts/rainmaker.mjs',
    import.meta.url,
  ).pathname;
  const env = {
    ...process.env,
    RAINMAKER_CONFIG_DIR: directory,
    EXA_API_KEY: 'setup-search-fixture',
    OPENAI_API_KEY: 'setup-openai-fixture',
    CLOUDFLARE_API_TOKEN: 'unselected-fixture',
  };
  await exec(
    process.execPath,
    [
      script,
      'setup',
      '--non-interactive',
      '--provider',
      'openai',
      '--budget-usd',
      '2',
    ],
    { env },
  );
  const credentials = await readJson(join(directory, 'credentials.json'));
  assert.deepEqual(Object.keys(credentials).sort(), [
    'EXA_API_KEY',
    'OPENAI_API_KEY',
  ]);
  const { stdout } = await exec(process.execPath, [script, 'doctor'], { env });
  assert.equal(JSON.parse(stdout).ready, true);
  assert.ok(!stdout.includes('fixture'));
  assert.equal(JSON.parse(stdout).networkChecked, false);
});
