# First use on the bot's computer

1. Check available command execution and files, and Node 22+ (24 recommended). Do not guess tool names or paths.
2. Fetch the public versioned code:

   ```sh
   git clone --depth 1 --branch v0.3.0 https://github.com/omnimatch/skills.git omnimatch-skills
   ```

   Archive: https://github.com/omnimatch/skills/archive/refs/tags/v0.3.0.tar.gz. Keep the complete skills/day-tripper folder. No npm install or build is needed.
3. Read skills/day-tripper/SKILL.md and its references. Run `node omnimatch-skills/skills/day-tripper/scripts/day-tripper.mjs doctor`.
4. Guide private provider setup using the installed reference and the recipient's own keys. Never read unrelated bots' keys or ask for secrets in chat. Doctor validates configuration presence; the first authorised provider call checks access.
5. Run `node omnimatch-skills/skills/day-tripper/scripts/day-tripper.mjs demo --out day-tripper-demo` without keys or network calls. Open/attach report.html and verify the visible output.
6. Use saved local state for follow-ups. New discovery needs an authorised budget. Credentials, user profiles and research stay outside the template and public checkout. Update code only when the user requests it.
