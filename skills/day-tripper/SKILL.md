---
name: day-tripper
description: Plan a worthwhile day out using current public venue and event evidence and connected search tools. Guides setup, offers a few ideas, chooses an anchor and produces an interactive comparison report, timed itinerary and a route sketch when coordinates are sourced. Use for solo, couple, family or group day trips; never book or buy automatically.
license: MIT
---

# Day Tripper

Turn a vague idea into a practical day out. Be opinionated: pick a favourite and explain why. Use one or two material questions before bringing ideas. No Omnimatch account, proprietary places database or backend is required.

Resolve `scripts/day-tripper.mjs` relative to this file and use the absolute path as `TRIPPER`. Node 22+ is required. The runner and interactive report are prepackaged; no runtime npm install is needed.

## Start with the person’s goal

Respond in plain language and reuse what the person has already told you. For an unqualified “Are we ready?”, say “Yes — where are you starting from, and which day would you like to go?” unless an actual attempt has established a blocker. Ask only for missing facts that affect the research. Do not make users choose an evaluator, model, runtime, API or numbered budget before discussing their goal. Do not narrate routine installation or readiness checks.

Quietly inspect the host’s available tools. Prefer its connected Exa plugin; use the host’s other supported web search when suitable. On Grok, discover the installed Exa search/fetch skills and actual tools, rather than demanding a separate Exa API key. The assistant itself can compare evidence against the rubric; OpenAI Decisions and Cloudflare Clef are optional advanced routes, never prerequisites. Do not inspect unrelated bots’ credentials.

If search is unavailable, guide one concrete next step in everyday language, such as “Connect Exa so I can search for you,” using the host’s connection card or settings. Verify the connection before promising search. Let the person handle sign-in privately. Never ask for secrets in chat or claim a plugin is free or unlimited. Existing host/plugin limits apply. Obtain consent before adding a new paid service or extra charge; do not invent a dollar budget for ordinary connected-tool use.

Read [workflow](references/workflow.md) and [host research](references/host-research.md) for the default path. Collect with actual host tools, assess against the same rubric, then import the saved evidence to generate the full radar report without provider keys. Handle file/runtime setup quietly. Read [advanced API setup](references/setup.md) only for a requested independent API run or an actual capability gap. An API-only `doctor` result does not block connected-tool research. The fictional offline `demo` is optional, not an onboarding gate.

## Ideas first

Work out roughly where they are, who is going, travel tolerance, mood and budget. Reuse the current request. If party size is unspecified, say you are assuming one or two people and offer easily adjusted ideas. For a solo day favour places pleasant alone; for a group check capacity and booking arrangements. Keep any accessibility or dietary requirements user-stated; do not infer them.

Bring three to five varied ideas with personality: what it is, why it is worth going, evidenced cost and the one thing people go for. Food is one possible anchor, alongside an exhibition, performance, walk, market or a town worth exploring. Do not bend every day into a restaurant trip. Give a clear favourite.

## Collect and compare

Read [workflow](references/workflow.md) and adapt [example-plan.json](references/example-plan.json). Use `places` for venue/activity source pages and `events` for dated listing sources. Keep their units separate. Connected search tools provide public web discovery; no Omnimatch places, hygiene, events or other databases are used.

Choose three to five meaningful criteria for the current party and brief, such as interests, pace, practical access and budget fit. Missing dates, opening hours, prices, ticket availability and travel times are unknown, never invented scores. A recurring event brand does not verify an occurrence. User hard limits stay hard; flexibility must be explicit.

For normal connected-tool research, follow [host research](references/host-research.md): execute the plan with available search/fetch tools, save passages and justified rubric levels, and use `import` to render. Do not run the direct-API runner or expose its setup questions on this path.

The following applies only to an explicitly chosen direct-API run. Run `inspect --plan /absolute/day-plan.json`, explain the providers and request estimates, and use an authorised budget. Obtain a missing budget decision before paid execution:

```sh
node "$TRIPPER" run --plan /absolute/day-plan.json --out /absolute/day-trip-runs/brief
```

Use actual saved progress, checkpoints and source evidence. Resume the same frozen plan with the same command. Failed requests need an explicit `--retry-failed` instruction; lost responses need specific acceptance of possible duplicate charges before `--retry-uncertain`. Never delete state or silently increase the budget. Provider spending limits remain authoritative.

## Build the day

Once the user supplies a date and chooses an anchor, or asks you to pick, verify current practical details with the host's available browser/search tools and official venue, organiser and transport pages. Use the real current date and destination timezone. Put the date into the research brief; publication-date filters do not verify occurrence dates.

Check the anchor is running/open on that exact day, the timed entry or booking conditions, cost basis and the party's access needs. Check local event listings across relevant categories in a broad pass. If no relevant event is found, plan without one. Do not fill a gap from memory. Check actual day-of-week and special closures, not only “open now”. Ratings and review counts need a named current source; never invent Google Maps data.

For UK food venues, consult the current public local-authority/Food Standards Agency page when available and match name plus address. Prefer businesses rated 4 or 5 where that numeric scheme applies. Do not misread a different nation's rating scheme as a number. If no rating can be verified, keep it unknown and say so when it affects the recommendation; never imply a hygiene check happened or connect to Omnimatch's database.

Plan four or five stops at most, anchored to the real fixed time. Allow generous time for meals and realistic travel legs, with one indoor swap. Distinguish sourced travel times from estimates and check the last departure when it matters. Only show a price, date, opening claim or coordinate when its source supports it. No bookings, purchases, reservations or messages happen without a separate explicit user instruction.

## Present the comparison and itinerary

Read saved evidence with `results --run DIRECTORY --evidence --limit 20 --offset 0`. Read [itinerary](references/itinerary.md), then write notes referencing existing result IDs. Include a timed day plan, indoor swap and one clear next action. Source-verified coordinates produce an offline route sketch in visiting order; it is not street routing. Missing coordinates remain missing. Never guess pins or claim a live map/directions engine exists.

Run `report --run DIRECTORY --notes /absolute/notes.json`. Read [host output](references/host-output.md) and prefer a verified interactive artifact/preview. Always preserve the self-contained `report.html` with radar, searchable results, evidence and itinerary. If the host cannot embed it, open or attach it for a browser. The demonstration uses fictional venues and synthetic coordinates, not a real itinerary.

Follow-ups query saved work first. Rendering is offline. Fresh date checks or broader discovery require appropriately authorised provider use. Keep the user's starting location and private preferences outside public template exports.
