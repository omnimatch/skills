# First-use setup on the bot's computer

Check the available computer and execution tools. Do not guess a local path, tool name or secret API.

1. Check `node --version`. Use Node 22+; Node 24 is recommended. Install it only within the user's permitted computer environment when missing.
2. Fetch the public tagged release with Git, or download and extract its archive using the computer's normal file tools:

   ```sh
   git clone --depth 1 --branch v0.1.0 https://github.com/omnimatch/skills.git omnimatch-skills
   ```

   The archive equivalent is `https://github.com/omnimatch/skills/archive/refs/tags/v0.1.0.tar.gz`. Read `skills/rainmaker/SKILL.md` in that checkout. No npm install or report build is needed.
3. Run `node omnimatch-skills/skills/rainmaker/scripts/rainmaker.mjs doctor`.
4. Guide the user through Exa and their selected evaluator, then privately supply their own credentials using a supported secret manager or user-visible terminal. Read the installed setup reference. Use non-interactive setup only from environment variables the user has deliberately provided. Never interpolate keys into a shell command or ask for them in chat.
5. Run doctor again. Explain that local readiness is checked but provider entitlement is checked only by the first authorised research request.
6. For a no-cost check, run `node omnimatch-skills/skills/rainmaker/scripts/rainmaker.mjs demo --out rainmaker-demo` and open or attach its `report.html`. It must show fictional demonstration data.

Use the same checkout for subsequent runs. Check for a newer published release when the user asks to update; do not silently fetch executable code on every task. Credentials and run directories stay outside the public checkout and are not part of a shared Grok template.
