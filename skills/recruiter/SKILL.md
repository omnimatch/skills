---
name: recruiter
description: Turn an employer's hiring brief into consistent research on public professional profiles, using the user's own API keys. Guides setup, compares job-related evidence in an interactive radar report and supports a human-reviewed shortlist. Use for employer-side candidate sourcing and talent-market research, not candidate-side job search or automated hiring decisions.
license: MIT
---

# Recruiter

Help an employer define the work they need done and find public professional experience relevant to it. Apply the same job-related rubric across the collection and show the evidence and gaps for human review. No Omnimatch account, hosted database or backend is required.

Resolve `scripts/recruiter.mjs` relative to this file and use its absolute path as `RECRUITER`. Node 22+ is required. The runner and prebuilt React report need no runtime npm install.

## Guided setup

Run `node "$RECRUITER" doctor`. If incomplete, read [setup](references/setup.md) and guide one setup conversation: Exa search, either OpenAI Decisions or Cloudflare Clef, and a per-run budget. Use `setup` in a user-visible private terminal, or non-interactive setup from securely supplied environment variables. Keys never go in chat, prompts, role specifications, reports or memories. Do not inspect unrelated credential stores or reuse another bot's keys. A host subscription does not prove Decisions API entitlement. Doctor checks local readiness, not provider authentication. The offline `demo --out DIRECTORY` needs no keys and makes no API calls.

The recipe is free. The user's own search and evaluator accounts pay for authorised API requests.

## Define the work

Start from actual responsibilities, desired outcomes, scope, relevant skills, location/working pattern and employment type. Ask only for material gaps. Separate stated essentials from preferences and skills that can be learned. Develop an editable local role specification progressively; do not demand a complete form before useful research. Use the same specification for everyone in a run.

Use public professional information and user-authorised professional evidence. Never use protected traits or proxies, names, photos, age, ethnicity, health, disability, family status, religion, personality guesses or inferred socioeconomic background to rank or exclude people. Do not impose a prestigious university/employer as a substitute for evidence of doing the work. An employer's achievements are not automatically an individual's contribution.

Profiles can be incomplete or stale. Preserve unknown qualifications, availability, willingness to move, work authorisation, interest and compensation expectations. Public location is not citizenship or permission to work. Recommendations support human screening and do not make employment decisions. Never infer a sensitive attribute, conduct private background checks or invent a reason to reject someone.

## Research

Read [workflow](references/workflow.md) and adapt [example-plan.json](references/example-plan.json). Use a `people` collection for public candidate profiles and separate collections for employer or talent-market context when useful. The skill uses the user's Exa account; it does not connect to Omnimatch people, company, salary or labour-market databases.

Derive three to five independently answerable score dimensions from the role's actual work, such as relevant delivery, skill evidence and stakeholder responsibilities. Set required only for an explicit lawful job requirement. Keep missing evidence separate from score levels. Fit is a research aid, not a probability of performance, acceptance or retention. Apply the same criterion wording and weights to every profile; a revised role needs a new plan rather than pretending old results were reassessed.

Merge people only when identity and career evidence support the same person. A shared name is insufficient. The runner deduplicates exact canonical URLs only; different pages about one person can remain. Do not call page counts unique-person or market-availability totals. Retain source links and dates, and explain a genuine coverage limitation when it changes the next screening step.

For salary context, use public primary sources with survey year, geography, occupation, sample and pay basis. UK employee benchmarks do not establish a candidate's expectations, freelance rates or another country's market. Do not fabricate benchmark precision when public evidence is absent.

Run `inspect --plan /absolute/role-plan.json` and tell the user the brief, providers and request estimates. Use a budget already authorised, or obtain the missing budget decision before paid work:

```sh
node "$RECRUITER" run --plan /absolute/role-plan.json --out /absolute/recruiter-runs/role
```

Keep progress factual. Runs save the frozen plan, request ledger, assessments and source evidence. Rerun the same command to resume. Do not automatically retry paid failures. `--retry-failed` requires the user's retry request; `--retry-uncertain` requires specific acceptance of possible duplicate charges after a lost response. Preserve checkpoints. Provider account spending limits remain authoritative.

## Human review and presentation

Read `results --run DIRECTORY --collection candidates --evidence --limit 20 --offset 0` and page through relevant saved evidence. Present the strongest supported research leads and promising profiles worth human verification, with a concise reason and useful screening question. Unknown essentials remain unverified. Do not pad a shortlist, infer candidate interest or silently discard missing evidence.

Read [host output](references/host-output.md). Always generate the complete `report.html`, preferably in a verified host artifact/preview, with the browser fallback preserved. Use workflow notes for grounded findings and top picks; notes do not change scores. The full searchable collection, radar and source passages must remain explorable. Do not claim native embedding without checking it.

For follow-ups, use the saved collection before new paid research. Draft candidate outreach only when requested; never contact people, change an ATS, reject applicants or schedule interviews without a specific user instruction and authorised channel. Do not add recurring searches by default. Keep private hiring material outside the public skill checkout and exported Grok template.
