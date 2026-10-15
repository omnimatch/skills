---
name: job-scout
description: Find worthwhile jobs and credible routes into employers using the candidate's own goals and provider keys. Guides setup, researches vacancies, recruiters and relevant communities, creates an interactive evidence report and keeps applications organised in local files. Use for candidate-side job search and applications, not employer-side hiring decisions.
license: MIT
---

# Job Scout

Work for the candidate. Help them decide which opportunities are worth pursuing and what to do next. This is a standalone local skill: no Omnimatch account, databases, teammates or backend are required.

Resolve `scripts/job-scout.mjs` relative to this file. Use that absolute path as `SCOUT` in commands. Node 22+ is required; no runtime npm install or UI build is needed.

## One guided setup

Run `node "$SCOUT" doctor`. Reuse configuration explicitly supplied for this skill; do not search other projects or bots for keys. Read [setup](references/setup.md) when incomplete. Guide the user through Exa and either OpenAI Decisions or Cloudflare Clef, plus one per-run budget. Use `setup` in a user-visible private terminal or `setup --non-interactive --provider clef|openai --budget-usd AMOUNT` from securely supplied environment variables. Never ask for keys or host login tokens in chat. A ChatGPT subscription does not prove Decisions entitlement. Doctor checks local readiness without network calls; the first authorised research call tests provider access.

Offer `demo --out DIRECTORY` to explore the fictional report without keys or API calls. The recipe is free; provider usage belongs to the user's accounts.

## Understand the candidate

Start with the current request and confirmed experience. Offer a CV, a conversation about their background or a target-only start. Ask one or two questions that materially affect the search. Establish desired responsibilities, transferable skills, geography/commute, work pattern, employment type, pay requirements and explicit exclusions progressively. UK and Spain are supported examples, not mandatory territories.

Distinguish confirmed achievements, user preferences and inferences. A personal project may show a skill without proving professional experience. A title alone does not define ability. Do not convert an omitted skill, old target or inferred limitation into a permanent exclusion. Use only necessary professional context in provider queries; omit contact details and unrelated CV information. Explain the proposed research brief before sending it to providers.

With the user's agreement, keep an editable local `candidate-profile.json` outside the public skill checkout. Read before updates, quote the correction, preserve unrelated facts and explicit sharing choices, and replace outdated inferences. There is no automatic cross-agent memory or OCEAN/personality service.

## Research opportunities

Read [workflow](references/workflow.md) and adapt [example-plan.json](references/example-plan.json). Separate vacancy pages (`kind: jobs`), public recruiters (`people`), employers (`companies`) and community/event sources (`events`). Ordinary web search covers jobs; the script does not connect to Omnimatch's vacancy, salary, sponsor, company or labour-market databases.

Use the actual work, contribution, desired scope and stated constraints to create three to five distinct score criteria. Required means a user-stated hard requirement, not a preference. Unknown pay, sponsorship, flexibility or experience remains unknown. Strong fit is not a probability of an interview, offer or visa eligibility. Do not rank protected personal traits or personality.

Check vacancies against original employer/ATS pages, watching for closure, a different location, employment type and requisition ID. A publication date does not establish an open vacancy. Search coverage and exact-URL deduplication have limits; different URLs may represent the same role. Compare employer, title, location and requisition before calling them distinct opportunities. An expired page does not prove rejection. A sponsor listing does not establish sponsorship for this vacancy; verify current employer information and official rules when relevant.

For pay or labour-market context, use current public primary sources. State survey year, geography and pay basis; do not present a UK employee benchmark as a contractor rate, a Spanish salary or an individual's expected pay. If that evidence cannot be obtained, keep the gap visible and continue with the opportunity research.

Run `inspect --plan /absolute/plan.json`, explain the plan, providers and request estimates, and honour the user's authorised budget. Obtain a missing budget decision before paid execution. Run:

```sh
node "$SCOUT" run --plan /absolute/plan.json --out /absolute/job-search-runs/brief
```

Use real saved progress. The same command resumes the frozen plan and evaluator without replaying completed requests. Never automatically retry failures or lost responses. `--retry-failed` needs a user request; `--retry-uncertain` needs explicit acceptance of possible duplicate charges. A changed brief or evaluator needs a new run directory. Provider spending limits remain authoritative.

## Recommend and track

Read saved evidence with `results --run DIRECTORY --collection jobs --evidence --limit 20 --offset 0`, paging as needed. Lead with up to three worthwhile opportunities, or the requested number when supported. Explain contribution, the material requirement to check and one next action. A promising role with an unresolved hard requirement is a lead to verify. Do not pad the shortlist or predict rejection.

Research relevant recruiters, communities and events as separate collections when useful. Public specialism does not prove an active mandate, introduction, relationship or attendance. Draft truthful materials and interview preparation when asked. Never invent qualifications, apply, submit forms or contact anyone without explicit user direction through an authorised channel.

Read [applications](references/applications.md) to maintain a local tracker when asked. Search saved applications before presenting roles as new. A save is not an application; a stage changes only on the user's instruction.

Read [host output](references/host-output.md). Always produce `report.html` and prefer a verified interactive artifact/preview when available. Use notes from the workflow to add grounded findings and top picks. Preserve the complete searchable collection, radar, source evidence and offline browser fallback. Do not claim a native chat UI appeared without checking it. Follow-up questions read the saved run first; refreshing reports is offline.
