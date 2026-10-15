---
name: prospector
description: Find and prioritise target companies, relevant buyers and credible routes to approach using connected search tools or the user’s own API accounts. Guides first-time setup, saves an evidence-ranked research collection and produces an interactive radar report. Use for prospect research and market opportunity reports, not automated outreach.
license: MIT
---

# Prospector

Help the user's business find suitable customers and a supported next step. Use the host’s connected search tools and its own reasoning by default; direct API execution is optional. It has no Omnimatch account, MCP server or hosted-service dependency.

Resolve `scripts/prospector.mjs` relative to this SKILL.md, not the user's working directory. Commands below use `PROSPECTOR` as that absolute script path. Use Node 22 or later. Installing this folder does not install npm dependencies; the runner is dependency-free and the React report is already bundled.

## Start with the person’s goal

Respond in plain language and reuse what the person has already told you. For an unqualified “Are we ready?”, say “Yes — what do you sell, and who would you like to reach?” unless an actual attempt has established a blocker. Ask only for missing facts that affect the research. Do not make users choose an evaluator, model, runtime, API or numbered budget before discussing their goal. Do not narrate routine installation or readiness checks.

Quietly inspect the host’s available tools. Prefer its connected Exa plugin; use the host’s other supported web search when suitable. On Grok, discover the installed Exa search/fetch skills and actual tools, rather than demanding a separate Exa API key. The assistant itself can compare evidence against the rubric; OpenAI Decisions and Cloudflare Clef are optional advanced routes, never prerequisites. Do not inspect unrelated bots’ credentials.

If search is unavailable, guide one concrete next step in everyday language, such as “Connect Exa so I can search for you,” using the host’s connection card or settings. Verify the connection before promising search. Let the person handle sign-in privately. Never ask for secrets in chat or claim a plugin is free or unlimited. Existing host/plugin limits apply. Obtain consent before adding a new paid service or extra charge; do not invent a dollar budget for ordinary connected-tool use.

Read [workflow](references/workflow.md) and [host research](references/host-research.md) for the default path. Collect with actual host tools, assess against the same rubric, then import the saved evidence to generate the full radar report without provider keys. Handle file/runtime setup quietly. Read [advanced API setup](references/setup.md) only for a requested independent API run or an actual capability gap. An API-only `doctor` result does not block connected-tool research. The fictional offline `demo` is optional, not an onboarding gate.

## Research

Read [workflow](references/workflow.md), then adapt the [example plan](references/example-plan.json) to the user's request. Establish their offer, ideal customer, territory, exclusions and any event window. Ask only for material gaps. Reuse context already supplied by the user.

The host assistant creates the brief, rubric and search plan; connected tools collect sources and the assistant assesses them; the optional API runner can automate both. Keep companies, people, event listing pages and news in separate collections with relevant criteria. A listing page is not necessarily one event. Research current occurrences and named attendance only from direct dated evidence. Seniority does not establish purchasing authority; common ground does not establish a relationship. Use public professional information. Never obtain private contact details or send outreach.

Create a plan JSON in the user's chosen research directory. Use three to eight meaningful ordered score criteria per collection, explicit weights and required only for a stated must-have. Missing evidence is unknown, not the worst score. Plan source coverage around the brief rather than stopping after an arbitrary shortlist. A displayed top-three selection is not a collection cap. Use only supported Exa options; the example and workflow describe the schema.

For normal connected-tool research, follow [host research](references/host-research.md): execute the plan with available search/fetch tools, save passages and justified rubric levels, and use `import` to render. Do not run the direct-API runner or expose its setup questions on this path.

The following applies only to an explicitly chosen direct-API run. Run `node "$PROSPECTOR" inspect --plan /absolute/plan.json`. Tell the user the plan, providers and request estimates before first paid execution. Honour a budget they have already authorised; otherwise obtain the missing budget decision. Local request ceilings are conservative estimates, not a provider-enforced billing guarantee. Provider account spending limits remain authoritative. Do not change provider or increase a budget without the user's instruction.

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

Subsequent questions query the saved run first. Refreshing or rendering is offline. New discovery follows the chosen tools’ permissions and limits; direct-API runs require an authorised budget. The free recipe is maintained by [Omnimatch](https://omnimatch.ai); users pay their chosen providers directly.
