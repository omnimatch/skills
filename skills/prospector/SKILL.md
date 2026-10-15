---
name: prospector
description: Find and prioritise target companies, relevant buyers and credible routes to approach using the user's own API keys. Guides first-time setup, saves an evidence-ranked research collection and produces an interactive radar report. Use for prospect research and market opportunity reports, not automated outreach.
license: MIT
---

# Prospector

Help the user's business find suitable customers and a supported next step. This skill runs locally with their own search and evaluation accounts. It has no Omnimatch account, MCP server or hosted-service dependency.

Resolve `scripts/prospector.mjs` relative to this SKILL.md, not the user's working directory. Commands below use `PROSPECTOR` as that absolute script path. Use Node 22 or later. Installing this folder does not install npm dependencies; the runner is dependency-free and the React report is already bundled.

## First use

1. Run `node "$PROSPECTOR" doctor`. It checks local configuration without displaying keys or making network calls.
2. If setup is incomplete, read [setup](references/setup.md). Guide the user through one setup conversation: Exa search, their choice of OpenAI Decisions or Cloudflare Clef, and their per-run budget. Use available configuration before asking for missing facts. Keys go into a private terminal or the user's secret manager, never chat, tool arguments, a research plan or a report. Never collect the assistant host's login tokens. An existing ChatGPT subscription does not establish Decisions API access.
3. Use `node "$PROSPECTOR" setup` in a user-visible private terminal, or non-interactive setup from credentials the user has explicitly provided through environment variables. Do not run an unattended interactive prompt and claim setup is complete. `doctor` must report ready. Setup validates local values; provider authentication is exercised only on the first authorised research request. Do not use anyone else's keys or a key from an unrelated project.
4. Offer the offline `demo` command if the user wants to see the report before connecting providers. It makes no API calls and labels its data fictional.

## Research

Read [workflow](references/workflow.md), then adapt the [example plan](references/example-plan.json) to the user's request. Establish their offer, ideal customer, territory, exclusions and any event window. Ask only for material gaps. Reuse context already supplied by the user.

The host assistant creates the brief, rubric and search plan; the script executes collection and evaluation. Keep companies, people, event listing pages and news in separate collections with relevant criteria. A listing page is not necessarily one event. Research current occurrences and named attendance only from direct dated evidence. Seniority does not establish purchasing authority; common ground does not establish a relationship. Use public professional information. Never obtain private contact details or send outreach.

Create a plan JSON in the user's chosen research directory. Use three to eight meaningful ordered score criteria per collection, explicit weights and required only for a stated must-have. Missing evidence is unknown, not the worst score. Plan source coverage around the brief rather than stopping after an arbitrary shortlist. A displayed top-three selection is not a collection cap. Use only supported Exa options; the example and workflow describe the schema.

Run `node "$PROSPECTOR" inspect --plan /absolute/plan.json`. Tell the user the plan, providers and request estimates before first paid execution. Honour a budget they have already authorised; otherwise obtain the missing budget decision. Local request ceilings are conservative estimates, not a provider-enforced billing guarantee. Provider account spending limits remain authoritative. Do not change provider or increase a budget without the user's instruction.

Execute:

```sh
node "$PROSPECTOR" run --plan /absolute/plan.json --out /absolute/prospector-runs/client
```

Keep working until the process returns completed, partial or paused. Use real saved progress in status updates. Never claim research started before the runner dispatches it, or completion from an acknowledgement. `run.json` retains completed searches, assessments, source text, errors and the request ledger. Preserve its plan and directory for follow-ups. Rerunning the same command resumes completed checkpoints without recollecting them. A changed plan or provider requires a new directory.

Do not automatically retry paid failures. `--retry-failed` explicitly retries failed requests. `--retry-uncertain` can duplicate a charge after a lost response and requires that specific user decision. Report partial coverage, failures or budget stops honestly. Interrupted requests remain visible in the ledger. Never remove checkpoints to get past a pause.

## Interpret and present

Use `results --run DIRECTORY --collection ID --evidence --limit 20 --offset 0` to inspect saved evidence, paging as needed. Ground recommendations in this evidence and the saved scores; do not invent buying signals, relationships, dates or reasons to fill gaps. Do not label the collected sample as the entire market. Exact-URL deduplication is conservative; different pages about one entity can remain distinct.

Produce a brief market opportunity interpretation: strongest companies, relevant people, meeting opportunities if requested, and the recommended next step. The complete collection must remain explorable alongside selected findings. Scores are fit against a rubric, never deal probabilities. Different evaluators are not assumed to have calibrated probabilities.

To include written findings in the report, read the notes format in [workflow](references/workflow.md), save `notes.json`, and run `report --run DIRECTORY --notes /absolute/notes.json`. Reference existing item IDs; do not rescore results. Notes must contain no keys or unrelated private context.

Read [host output](references/host-output.md). Prefer a supported in-chat interactive artifact/visualization surface and follow that host's own authoring rules. Use the already bundled report's data and renderer when the surface supports it. Otherwise open or attach `report.html`; it provides the same radar, searchable scrollable results, criterion scores and saved evidence in a browser. Never claim an embedded UI appeared unless verified. No MCP app is required. Preserve a working downloadable/openable report even when a host can also embed it.

Subsequent questions query the saved run first. Refreshing or rendering is offline. New discovery or reevaluation is a new explicitly budgeted run. The free recipe is maintained by [Omnimatch](https://omnimatch.ai); users pay their chosen providers directly.
