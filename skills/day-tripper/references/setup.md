# Advanced direct-API setup

This reference is for a requested independent API run, not normal first-use onboarding. Prefer connected host tools plus the assistant’s own assessment and the offline `import` path in [host research](host-research.md). Missing doctor values do not block that route. Keep runtime and provider diagnostics internal. Explain an actual blocker in plain language, with one recovery action.

For a direct-API run, establish the authorised spending ceiling and choose the appropriate available route. Explain a provider choice only when the user needs to make one; do not present unexplained vendor/model choices as the opening question. Explain that the recipe is free and API usage belongs to their accounts. Reuse existing explicitly supplied environment variables. Do not inspect unrelated repositories or credential stores.

Requirements: Node 22+, an agent with file and command execution, Exa for search, and one evaluator. Node 24 is recommended. The installer copies scripts and report assets; no runtime `npm install`, build, server, Omnimatch login or MCP connection is needed.

## Provider accounts

- Search: create `EXA_API_KEY` at <https://dashboard.exa.ai/api-keys>.
- OpenAI Decisions: create `OPENAI_API_KEY` at <https://platform.openai.com/api-keys>. The adapter uses `/v1/decisions` with `gpt-6-luna`. API access and billing are separate from assuming a host subscription covers this endpoint.
- Cloudflare: obtain `CLOUDFLARE_ACCOUNT_ID` from the dashboard and create `CLOUDFLARE_API_TOKEN` with Workers AI Read scoped to that account. The default evaluator is `@cf/cloudflare/clef-flash`.

The private terminal wizard:

```sh
node /absolute/path/to/day-tripper/scripts/day-tripper.mjs setup
```

It asks for evaluator, budget and missing keys. Key input is hidden. It makes no network requests. If a host cannot provide a user-visible terminal, ask the user to run this command themselves; do not solicit secrets through chat. Environment-driven setup is available after the user has securely provided their keys:

```sh
node /absolute/path/to/day-tripper/scripts/day-tripper.mjs setup --non-interactive --provider clef --budget-usd 2
node /absolute/path/to/day-tripper/scripts/day-tripper.mjs doctor
```

`doctor` prints presence and readiness only. It does not verify remote account entitlement. Keys are saved as plaintext in `~/.config/omnimatch/day-tripper/credentials.json`, with mode 0600 and a 0700 containing directory on POSIX systems. Environment variables override saved values. `DAY_TRIPPER_CONFIG_DIR` selects another private configuration directory. On Windows, use the account's private directory or a secret manager with appropriate ACLs; POSIX mode bits alone are not an access-control guarantee there.

## Spending and recovery

The user chooses a local per-run ceiling, at most $100. The runner reserves $0.25 per search request and $0.01 per evaluation request by default. These are conservative estimates, not a quoted price or provider-enforced maximum. They stay reserved even for failures or uncertain outcomes. An Exa-reported cost above its reservation is accounted and pauses further work. Provider dashboard spending limits are the final billing boundary. A user can set `searchRequestCeilingUsd` and `evaluationRequestCeilingUsd` in their private `config.json` after checking their actual provider pricing.

There are no automatic paid retries. A normal resumed run skips completed work. Failed and uncertain requests require explicit flags. Partial reports are generated when a run pauses. A process stopped after receiving a response can reuse the saved receipt without another call. A process stopped before receiving the response cannot know whether the provider charged it; `--retry-uncertain` makes that decision visible.

Research queries and retrieved evidence are sent to Exa and the chosen evaluator. Reports and checkpoints stay local. There is no Omnimatch telemetry or call-home request. The computer must remain running during execution; saved checkpoints support later resumption.

Sources checked 15 October 2026:

- <https://exa.ai/docs/reference/search>
- <https://developers.openai.com/api/docs/guides/decisions>
- <https://developers.cloudflare.com/workers-ai/models/clef/>

Provider schemas and access can change; report an incompatibility instead of silently changing services or substituting a more expensive model.
