import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { demoRun } from '../skills/day-tripper/scripts/lib/demo.mjs';
import { validateNotes } from '../skills/prospector/scripts/lib/report.mjs';

const exec = promisify(execFile);
for (const [slug, brand, env] of [
  ['job-scout', 'Job Scout', 'JOB_SCOUT'],
  ['recruiter', 'Recruiter', 'RECRUITER'],
  ['day-tripper', 'Day Tripper', 'DAY_TRIPPER'],
]) {
  test(`${brand} installs alone, validates its own plan and renders its own offline report`, async () => {
    const directory = await mkdtemp(join(tmpdir(), `${slug}-install-`));
    const installed = join(directory, 'skill');
    await cp(new URL(`../skills/${slug}/`, import.meta.url), installed, {
      recursive: true,
    });
    const script = join(installed, `scripts/${slug}.mjs`),
      out = join(directory, 'demo');
    const options = {
      env: {
        ...process.env,
        [`${env}_CONFIG_DIR`]: join(directory, 'empty-config'),
      },
    };
    const { stdout } = await exec(
      process.execPath,
      [script, 'doctor'],
      options,
    );
    assert.equal(JSON.parse(stdout).ready, false);
    const inspected = await exec(
      process.execPath,
      [
        script,
        'inspect',
        '--plan',
        join(installed, 'references/example-plan.json'),
      ],
      options,
    );
    assert.ok(JSON.parse(inspected.stdout).title);
    await exec(process.execPath, [script, 'demo', '--out', out], options);
    await exec(
      process.execPath,
      [script, 'report', '--run', out, '--data-out', join(out, 'data.json')],
      options,
    );
    const html = await readFile(join(out, 'report.html'), 'utf8'),
      data = JSON.parse(await readFile(join(out, 'data.json'), 'utf8'));
    assert.ok(html.includes(brand));
    assert.ok(!html.includes('Made with Prospector'));
    assert.equal(data.demo, true);
    assert.ok(data.collections.every((c) => c.items.length > 0));
    assert.ok(
      data.collections
        .flatMap((c) => c.items)
        .every((i) => new URL(i.url).hostname.endsWith('.example')),
    );
    if (slug === 'day-tripper')
      assert.equal(data.notes.itinerary.stops.length, 3);
    for (const file of ['LICENSE', 'assets/THIRD_PARTY_LICENSES.txt'])
      assert.ok((await readFile(join(installed, file), 'utf8')).length > 100);
  });
}
test('day itinerary preserves source-backed stop order and rejects invented provenance', () => {
  const run = demoRun();
  const notes = structuredClone(run.demoNotes);
  assert.deepEqual(
    validateNotes(run, notes).itinerary.stops.map((s) => s.id),
    notes.itinerary.stops.map((s) => s.id),
  );
  notes.itinerary.stops[0].coordinates.sourceUrl = 'https://unrelated.example/';
  assert.throws(() => validateNotes(run, notes), /saved evidence/);
  notes.itinerary.stops[0].coordinates.sourceUrl = run.items[0].url;
  notes.itinerary.stops[0].coordinates.lat = 91;
  assert.throws(() => validateNotes(run, notes), /latitude/);
  notes.itinerary.stops[0].coordinates = null;
  notes.itinerary.stops[1].id = notes.itinerary.stops[0].id;
  notes.itinerary.stops[1].coordinates = null;
  assert.throws(() => validateNotes(run, notes), /distinct/);
});
test('job and place discovery use ordinary web search rather than a made-up Exa category', async () => {
  const { validatePlan } = await import(
    '../skills/job-scout/scripts/lib/plan.mjs'
  );
  const { exaRequest } = await import(
    '../skills/job-scout/scripts/lib/providers.mjs'
  );
  for (const slug of ['job-scout', 'day-tripper']) {
    const plan = validatePlan(
      JSON.parse(
        await readFile(
          new URL(
            `../skills/${slug}/references/example-plan.json`,
            import.meta.url,
          ),
          'utf8',
        ),
      ),
    );
    const collection = plan.collections[0];
    assert.ok(['jobs', 'places'].includes(collection.kind));
    const request = exaRequest(collection, collection.searches[0]);
    assert.equal(request.category, undefined);
    assert.equal(request.query, collection.searches[0].query);
  }
});
