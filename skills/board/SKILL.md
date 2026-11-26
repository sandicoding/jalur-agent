---
description: Start, stop or check the jalur-agent board (live transit map of your skills) and give the user its URL.
disable-model-invocation: true
allowed-tools: Bash
---

Arguments: $ARGUMENTS (one of `start` (default), `stop`, `status`).

Run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/start.js" <start|stop|status>
```

Then tell the user, in one or two lines, the URL it printed (default http://localhost:4321) and that
`?lang=id` switches the board to Indonesian and `?pipeline=<name>` picks another pipeline.
If it fails, show the last lines of `~/.jalur-agent/server.log`.
