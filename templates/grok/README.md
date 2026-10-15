# Grok Bot templates

Public native templates, each using the recipient’s own connected search tools and computer. No Omnimatch account, databases or backend is required.

| Bot | Public template | Pinned code | Source recipe |
| --- | --- | --- | --- |
| Prospector | [Install](https://x.ai/bot/Sx3cWiGu8GvbbZCo96upu) | v0.4.0 | [Profile](PROFILE.md), [instructions](INSTRUCTIONS.md), [setup](SETUP.md) |
| Job Scout | [Install](https://x.ai/bot/aR6yBucgiqls8Z4WurnSI) | v0.4.0 | [Recipe](job-scout/README.md) |
| Recruiter | [Install](https://x.ai/bot/LY-A0Dq9htK2xHtxaiaT0) | v0.4.0 | [Recipe](recruiter/README.md) |
| Day Tripper | [Install](https://x.ai/bot/2oFg1i480oDW6f-UuLTiN) | v0.4.0 | [Recipe](day-tripper/README.md) |

All four were published and their native exported context inspected on 15 October 2026. Each bot ran its fictional demo on its own computer: Prospector on Node 22, the companions on Node 24. The verified output is an openable interactive HTML report. Native interactive rendering inside chat was not verified.

## What transfers

Grok's official guide states that templates package instructions, relevant skills/memories and specified plugins, while custom scripts and non-standard MCP code do not transfer. Each template therefore bootstraps its public pinned skill on the recipient bot's own computer and checks Node 22+. Normal research uses connected Exa and the host assistant’s own assessment. The recipient connects their own search account through Grok. Direct API keys and a separate evaluator are an optional advanced path.

Each export contains the generic profile and namespaced role, setup and onboarding skills: `<skill-name>`, `<skill-name>-setup` and `<skill-name>-getting-started`. The last is its first-run skill. Avoid a shared `getting-started` name, which can collide when several bots are installed. All four use namespaced onboarding. The v0.4.0 sources replace technical setup questionnaires with goal-first onboarding and connected-tool research.

Each reviewed update exports exactly the role’s three namespaced skills and the standard Exa plugin. No credentials, memories, private research, client briefs, CVs, travel preferences, conversation history or routines are exported. Recipients connect their own Exa account through Grok; the creator’s connection does not transfer.

## Create or update a template

1. Create the named bot in your Grok Bot workspace. Use its profile, instructions and setup source files linked above. Keep the whole role skill folder on its computer; no npm install or report build is needed.
2. Save the generic role, first-use bootstrap and brief onboarding as namespaced skills. Set the template's first-run skill explicitly. Do not overwrite another bot's skills or reuse its credentials.
3. Check the offline report path using a fictional demo or host import. Verify the report in an actual browser or supported preview. Do not run paid research merely to prepare a template. Add no routine by default.
4. Use **Share as Template** in bot settings. Inspect the native context review, retaining only the generic role, public skill reference and bootstrap instructions. Include the standard Exa plugin where supported, and check the first-run skill starts from the person’s goal. Exclude memories, personal context and secrets.
5. Publish the reviewed draft and copy Grok's actual share link. Do not invent a link or an unofficial import schema.

Prefer a working interactive artifact/file preview when the installed Grok build supports one. Otherwise attach or open the self-contained report from its computer. Preserve the radar, searchable scrollable results, source evidence and any itinerary, alongside a concise sourced chat answer.

Reference checked 15 October 2026: [Templates for Grok Bot](https://x.ai/bot/guides/templates-for-grok-bot).
