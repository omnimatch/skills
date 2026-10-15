# Rainmaker for Grok Bot

This companion is a source template for creating a Rainmaker bot. It uses the same public skill, runner and offline report as the Codex/Claude version, with no Omnimatch account dependency.

## Create the bot

1. Create a bot named Rainmaker in your Grok Bot workspace.
2. Use [PROFILE.md](PROFILE.md) as its description and [INSTRUCTIONS.md](INSTRUCTIONS.md) as its instructions. Include [SETUP.md](SETUP.md) as setup knowledge, along with the public Rainmaker skill reference.
3. Give it access to its own computer's command execution and files. The first conversation checks the runtime and fetches the tagged public skill. No integrations that can send messages are required.
4. Test the offline demo. Configure your own keys privately only if you want to test real research. Set no recurring routine by default.
5. In bot settings, use **Share as Template**, inspect the included material, choose the intended audience and publish. Keep the setup knowledge, public skill reference and generic instructions. Exclude credentials, personal memories, client briefs and saved research.

The native Grok template share link must be created in your signed-in Grok Bot workspace. This repository does not contain an invented share link or an unofficial import schema.

## What carries across

Grok's official guide states that templates package instructions, relevant skills/memories and specified plugins, while custom scripts and non-standard MCP code are not transferred. For that reason this template explicitly bootstraps the public skill on the new bot's computer. Each recipient configures their own providers.

The radar report is a self-contained HTML file. Prefer a working interactive preview when the installed Grok Bot supports one; otherwise attach or open it in a browser. Embedded chat rendering has not been verified in Grok.

Reference checked 15 October 2026: [Templates for Grok Bot](https://x.ai/bot/guides/templates-for-grok-bot).
