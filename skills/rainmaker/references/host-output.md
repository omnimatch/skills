# Host-aware output

Always produce the self-contained `report.html`. Treat presentation as an enhancement to the saved research, not a dependency on a hosted Omnimatch app.

1. Inspect the current host's actual artifact, preview or visualization capabilities. Read its supplied skill or tool instructions before using one. Do not assume tool names or embedded rendering from the product name.
2. If the host supports interactive HTML/React artifacts or a local file preview, show the report there. Preserve the radar, result selection, search, filters, scores and evidence. Do not replace the complete report with a screenshot.
3. If its visualization surface requires fragments, specific theming or approved resources, follow those rules. Export presentation data with `report --run DIRECTORY --data-out /absolute/report-data.json` and adapt it to that contract; do not insert an unsupported full document or bypass its content security policy. The export contains source evidence, so treat it with the same privacy as the report. Keep work offline and do not upload the research to a hosting service just to obtain a preview.
4. If embedded execution is unavailable, open the local HTML in a browser or attach it for the user to download and open. Keep a concise sourced answer in chat as well. Say clearly when the report is available as a file rather than claiming it rendered inside chat.

Codex and Claude Code can execute the local runner when their environment permits it; preview support varies. A ChatGPT session must have script execution and files to run this package. A chat-only session cannot install a local skill. Grok Bot may have a computer but its template and embedded-output support differ; follow the companion Grok instructions and offer an openable report when necessary.

For a later conversation, `results` reads the checkpoint without provider calls. A visualization surface losing its state must not start new research. Local filtering and refreshing the report are never paid operations.
