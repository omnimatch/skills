# Validation and compatibility

Checked on 15 October 2026 using Node 24.

- 28 automated offline tests cover plan validation, URL identity, Exa/Decisions/Clef request contracts, nested Cloudflare task responses, unknown evidence, rubric scoring, budgets, checkpoints, explicit retries, lost responses, receipt recovery, report injection escaping, private credential setup, presentation exports, credential-free host-tool imports, provenance/rubric validation, partial imports, immutable snapshots and independent copies of all four skill folders.
- Job Scout, Recruiter and Day Tripper were forward-tested as isolated installs: doctor, example-plan inspection and fictional demo work without neighbouring skills or npm dependencies. Shared documentation findings were corrected before release.
- The reports were inspected in Codex's in-app browser at desktop and mobile widths. Search, filtering, collection selection, evidence expansion, mobile assessment navigation and itinerary stop navigation were exercised. Long radar labels wrap and mobile sort has its own row. The UI uses an embedded React runtime/font and a content security policy that disables network connections.
- Day Tripper's notes validator checks saved stop IDs, one-to-five-stop bounds, coordinate ranges and a source URL in each stop's saved evidence. The route sketch discloses coordinate coverage and represents stop order, not street routing. Factual source support is still the host's responsibility.
- npm 10 and npm 11 clean-install compatibility were checked for the dependency set. The committed reports rebuild with esbuild; recipients need no runtime install. The skill installer was exercised against the published repository.
- All four native Grok Bot templates were published after inspecting their exported context. Each bot reported running the offline demo on its own computer (Prospector: Node 22; companions: Node 24). Role/setup/onboarding skill names are distinct to avoid shared-name collisions. Browser reports were checked there; native interactive chat rendering was not verified. See the Grok guide for actual share links and pinned versions.

No paid search or evaluation was performed. Live provider authentication, entitlement, billing and research quality depend on the recipient's accounts and plan. Local setup checks configuration presence, not API access. Review a small authorised run before relying on results.

The browser report is verified. Native ChatGPT/Claude artifact embedding is host-dependent and was not established by these tests. A chat-only host cannot execute the package. The skill follows the capabilities actually available and always preserves an openable HTML report.

The collector deduplicates canonical URLs. Different pages about one entity, person, vacancy or venue can remain separate. Events are source pages until occurrence details are verified. The radar plots up to 80 assessed in-scope background traces, discloses sampling and retains all results in its searchable list. Coverage is bounded by the saved plan and provider result limits.

Connected-search update: Grok’s native Exa catalogue showed a connected account and both tools enabled. Recruiter confirmed available search/fetch tools without executing a search or inspecting keys. All four skills now start from the person’s goal and keep technical setup internal. API-only doctor failures do not gate connected-tool research. Offline import tests use synthetic evidence; factual citation support remains the host’s responsibility.
