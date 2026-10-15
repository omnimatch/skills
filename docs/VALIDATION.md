# Validation and compatibility

Initial release checked on 15 October 2026 using Node 24.

- Automated offline tests cover plan validation, URL identity, Exa/Decisions/Clef request contracts, nested Cloudflare task responses, unknown evidence, rubric scoring, budgets, checkpoints, explicit retries, lost responses, receipt recovery, report injection escaping, credential setup, presentation exports and an independently copied skill folder.
- The report was opened in Codex's in-app browser and inspected at desktop and mobile widths. Search, filtering, collection selection, evidence expansion and mobile selection navigation were exercised. The report is self-contained, with an embedded React runtime and font. Its content security policy disables network connections.
- npm 10 and npm 11 clean-install compatibility were checked. The committed report can be rebuilt with esbuild; no runtime install is required for skill recipients.
- A fresh reader followed setup and the offline demo without Omnimatch credentials. Both evaluator integrations were checked against their published API contracts and mocked responses.

No paid search or evaluation was performed for this release. Live provider authentication, entitlement, billing and research quality still depend on the recipient's accounts and plan. Local setup checks configuration presence, not API access. Review a small authorised run before relying on results.

The browser report is verified; native ChatGPT/Claude artifact embedding and Grok Bot execution/template publishing are not verified by those tests. The skill adapts to capabilities actually available in each host and always preserves an openable HTML report. A chat-only host cannot execute this package.

The initial collector deduplicates canonical URLs. Different pages about one entity can remain separate. Events are source pages until occurrence details are verified. The report plots up to 80 assessed in-scope background traces, discloses sampling when needed, and retains all results in its searchable list. Research coverage is bounded by the saved plan and provider result limits.
