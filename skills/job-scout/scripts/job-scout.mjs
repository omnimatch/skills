#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { demoRun } from './lib/demo.mjs';
import { estimatePlan, runResearch, validateBudget } from './lib/engine.mjs';
import {
  loadSettings,
  readJson,
  saveJson,
  saveSettings,
} from './lib/files.mjs';
import { importResearch } from './lib/host.mjs';
import { validatePlan } from './lib/plan.mjs';
import { providerTarget } from './lib/providers.mjs';
import { renderReport, reportData, validateNotes } from './lib/report.mjs';

const HELP = `Job Scout by Omnimatch · Node 22+ · no Omnimatch account

  import --plan plan.json --input research.json --out DIRECTORY
                                Save host-tool research and render without API keys
  setup                         Optional direct-API setup for automated research
  setup --non-interactive --provider clef|openai --budget-usd 2
                                Configure from environment variables only
  doctor                        Check local setup without calling any API
  example --out plan.json        Write a complete example research plan
  inspect --plan plan.json       Validate a plan and estimate request ceilings
  run --plan plan.json --out ./job-scout-runs/brief [--budget-usd 2]
                                Run or resume the same saved plan
  run ... --retry-failed         Explicitly retry failed requests
  run ... --retry-uncertain      Accept possible duplicate charges on uncertain requests
  report --run DIRECTORY [--out report.html] [--notes notes.json] [--data-out data.json]
                                Render saved work without API calls
  results --run DIRECTORY [--collection jobs] [--query TEXT]
          [--offset 0] [--limit 20] [--evidence]
                                Read saved results for a follow-up
  demo --out ./demo-output        Generate a fictional interactive report offline

Keys: EXA_API_KEY; OPENAI_API_KEY or CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID.
Never put API keys in a plan, command-line argument, report or chat message.
`;

export async function setup(
  options,
  io = { input: process.stdin, output: process.stdout },
) {
  const settings = await loadSettings();
  const config = { ...settings.config };
  const keys = { ...settings.keys };
  if (options['non-interactive']) {
    config.provider = options.provider || config.provider;
    config.budgetUsd = validateBudget(
      Number(options['budget-usd'] ?? config.budgetUsd),
    );
    config.clefModel = config.clefModel || 'clef-flash';
    if (!['clef', 'openai'].includes(config.provider))
      throw new Error('Choose --provider clef or --provider openai.');
    if (!keys.EXA_API_KEY)
      throw new Error('Supply EXA_API_KEY in the environment first.');
    providerTarget(config.provider, config, keys);
  } else {
    if (!io.input.isTTY || !io.output.isTTY)
      throw new Error(
        'Setup needs a private terminal. Open a terminal and run setup there, or configure from environment variables with --non-interactive. Do not paste keys in chat.',
      );
    let hidden = false;
    const output = new Writable({
      write(chunk, encoding, done) {
        if (!hidden) io.output.write(chunk, encoding);
        done();
      },
    });
    const rl = createInterface({ input: io.input, output, terminal: true });
    const ask = async (label, fallback) =>
      (
        await rl.question(
          `${label}${fallback !== undefined ? ` [${fallback}]` : ''}: `,
        )
      ).trim() || fallback;
    const secret = async (name) => {
      if (keys[name]) {
        io.output.write(`${name}: already available\n`);
        return;
      }
      io.output.write(`${name} (hidden): `);
      hidden = true;
      try {
        keys[name] = (await rl.question('')).trim();
      } finally {
        hidden = false;
        io.output.write('\n');
      }
      if (!keys[name])
        throw new Error(`${name} is required. Setup has not been saved.`);
    };
    try {
      io.output.write(
        'Job Scout uses your provider accounts. Setup makes no paid requests.\nSearch: https://dashboard.exa.ai/api-keys\nEvaluation: Cloudflare Clef Flash or OpenAI Decisions\n',
      );
      config.provider = String(
        await ask('Evaluator (clef/openai)', config.provider || 'clef'),
      ).toLowerCase();
      if (!['clef', 'openai'].includes(config.provider))
        throw new Error('Evaluator must be clef or openai.');
      config.budgetUsd = validateBudget(
        Number(
          await ask(
            'Local per-run spending ceiling in USD',
            config.budgetUsd || 2,
          ),
        ),
      );
      config.clefModel = 'clef-flash';
      await secret('EXA_API_KEY');
      if (config.provider === 'openai') {
        io.output.write('OpenAI key: https://platform.openai.com/api-keys\n');
        await secret('OPENAI_API_KEY');
      } else {
        io.output.write(
          'Cloudflare: create a token with Workers AI Read, scoped to your account.\n',
        );
        keys.CLOUDFLARE_ACCOUNT_ID =
          keys.CLOUDFLARE_ACCOUNT_ID || (await ask('Cloudflare account ID'));
        await secret('CLOUDFLARE_API_TOKEN');
      }
      providerTarget(config.provider, config, keys);
    } finally {
      rl.close();
    }
  }
  // Persist only the selected evaluator's credentials, plus the search key.
  const selected =
    config.provider === 'openai'
      ? ['EXA_API_KEY', 'OPENAI_API_KEY']
      : ['EXA_API_KEY', 'CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'];
  await saveSettings(
    config,
    Object.fromEntries(selected.map((name) => [name, keys[name]])),
  );
  io.output.write(
    'Setup saved privately. Run doctor to inspect readiness. Provider account spending limits remain authoritative.\n',
  );
}

export async function main(args = process.argv.slice(2)) {
  const { values: options, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      'non-interactive': { type: 'boolean' },
      provider: { type: 'string' },
      'budget-usd': { type: 'string' },
      plan: { type: 'string' },
      input: { type: 'string' },
      out: { type: 'string' },
      run: { type: 'string' },
      notes: { type: 'string' },
      'data-out': { type: 'string' },
      'retry-failed': { type: 'boolean' },
      'retry-uncertain': { type: 'boolean' },
      collection: { type: 'string' },
      query: { type: 'string' },
      offset: { type: 'string' },
      limit: { type: 'string' },
      evidence: { type: 'boolean' },
    },
  });
  const command = positionals[0];
  if (options.help || !command || command === 'help') {
    console.log(HELP);
    return;
  }
  if (Number(process.versions.node.split('.')[0]) < 22)
    throw new Error('Job Scout requires Node 22 or later.');
  if (command === 'setup') {
    await setup(options);
    return;
  }
  if (command === 'doctor') {
    const { config, keys } = await loadSettings();
    let evaluatorReady = false;
    try {
      if (['openai', 'clef'].includes(config.provider)) {
        providerTarget(config.provider, config, keys);
        evaluatorReady = true;
      }
    } catch {}
    let budgetReady = false;
    try {
      validateBudget(config.budgetUsd);
      budgetReady = true;
    } catch {}
    console.log(
      JSON.stringify(
        {
          node: process.versions.node,
          provider: config.provider || null,
          searchKeyPresent: Boolean(keys.EXA_API_KEY),
          evaluatorConfigured: evaluatorReady,
          budgetUsd: config.budgetUsd ?? null,
          ready: Boolean(keys.EXA_API_KEY && evaluatorReady && budgetReady),
          networkChecked: false,
        },
        null,
        2,
      ),
    );
    return;
  }
  if (command === 'example') {
    const plan = JSON.parse(
      await readFile(
        new URL('../references/example-plan.json', import.meta.url),
        'utf8',
      ),
    );
    const output = resolve(options.out || 'job-scout-plan.json');
    await saveJson(output, plan);
    console.log(output);
    return;
  }
  if (command === 'demo') {
    const directory = resolve(options.out || 'demo-output');
    const run = demoRun();
    await saveJson(join(directory, 'run.json'), run);
    if (run.demoNotes)
      await saveJson(join(directory, 'notes.json'), run.demoNotes);
    await renderReport(
      run,
      join(directory, 'report.html'),
      run.demoNotes || {},
    );
    console.log(
      `Fictional demo; no API calls.\n${join(directory, 'report.html')}`,
    );
    return;
  }
  if (command === 'import') {
    if (!options.plan || !options.input || !options.out)
      throw new Error('Supply --plan, --input and a new --out directory.');
    const run = await importResearch({
      plan: await readJson(resolve(options.plan)),
      input: await readJson(resolve(options.input)),
      directory: options.out,
    });
    const output = join(resolve(options.out), 'report.html');
    await renderReport(run, output);
    console.log(
      JSON.stringify(
        { status: run.status, collected: run.items.length, report: output },
        null,
        2,
      ),
    );
    return;
  }
  if (command === 'inspect' || command === 'run') {
    if (!options.plan)
      throw new Error('Supply --plan with the research plan JSON file.');
    const plan = validatePlan(await readJson(resolve(options.plan)));
    const settings = await loadSettings();
    if (command === 'inspect') {
      console.log(
        JSON.stringify(
          { title: plan.title, ...estimatePlan(plan, settings.config) },
          null,
          2,
        ),
      );
      return;
    }
    if (!options.out)
      throw new Error(
        'Supply --out with a new or existing research run directory.',
      );
    const controller = new AbortController();
    const cancel = () => {
      console.error(
        'Stopping after the current request. Completed work will be saved.',
      );
      controller.abort();
    };
    process.once('SIGINT', cancel);
    try {
      const run = await runResearch({
        plan,
        directory: options.out,
        settings,
        budgetUsd:
          options['budget-usd'] === undefined
            ? undefined
            : Number(options['budget-usd']),
        retryFailed: options['retry-failed'],
        retryUncertain: options['retry-uncertain'],
        signal: controller.signal,
        onProgress: (message) => console.error(message),
      });
      const output = join(resolve(options.out), 'report.html');
      await renderReport(run, output);
      console.log(
        JSON.stringify(
          {
            status: run.status,
            collected: run.items.length,
            assessed: run.items.filter((i) => i.assessment).length,
            accountedUsd: run.accountedUsd,
            pauseReason: run.pauseReason || null,
            report: output,
          },
          null,
          2,
        ),
      );
      if (run.status === 'paused') process.exitCode = 2;
    } finally {
      process.removeListener('SIGINT', cancel);
    }
    return;
  }
  if (command === 'report' || command === 'results') {
    if (!options.run)
      throw new Error('Supply --run with the saved research directory.');
    const run = await readJson(join(resolve(options.run), 'run.json'));
    if (command === 'report') {
      const out = resolve(options.out || join(options.run, 'report.html'));
      const notesPath = join(resolve(options.run), 'notes.json');
      const notes = validateNotes(
        run,
        await readJson(options.notes ? resolve(options.notes) : notesPath, {}),
      );
      await renderReport(run, out, notes);
      if (options['data-out'])
        await saveJson(resolve(options['data-out']), reportData(run, notes));
      if (options.notes) await saveJson(notesPath, notes);
      console.log(out);
      return;
    }
    const offset = Number(options.offset || 0),
      limit = Number(options.limit || 20);
    if (
      !Number.isInteger(offset) ||
      offset < 0 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    )
      throw new Error('Use a nonnegative offset and a limit from 1 to 100.');
    const query = (options.query || '').toLowerCase();
    const matches = run.items.filter(
      (i) =>
        (!options.collection || i.collectionId === options.collection) &&
        (!query ||
          `${i.title} ${i.evidence.map((e) => e.text).join(' ')}`
            .toLowerCase()
            .includes(query)),
    );
    console.log(
      JSON.stringify(
        {
          total: matches.length,
          offset,
          items: matches.slice(offset, offset + limit).map((i) => ({
            id: i.id,
            collectionId: i.collectionId,
            title: i.title,
            url: i.url,
            assessment: i.assessment,
            summary: i.summary,
            ...(options.evidence ? { evidence: i.evidence } : {}),
          })),
        },
        null,
        2,
      ),
    );
    return;
  }
  throw new Error(`Unknown command: ${command}. Run with --help.`);
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(resolve(process.argv[1]))).href
)
  main().catch((error) => {
    console.error(`Job Scout: ${error.message}`);
    process.exitCode = 1;
  });
