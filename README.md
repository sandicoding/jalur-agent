# jalur-agent

**A live transit map of your Claude Code skills.** See which phase the agent is in, where it transfers to another skill or a subagent, how long each tool call took, and replay any run, in a view made to be shown on a screen.

*Jalur* is Indonesian for "line" or "route", as in a train line: each skill gets its own line.

[Bahasa Indonesia](README.id.md)

> 📸 *Demo GIF coming soon.*

## Why another agent dashboard?

There are good open-source dashboards for Claude Code already (see [Related projects](#related-projects)). They show **tool calls**. jalur-agent shows **your process**:

| | Typical agent dashboards | jalur-agent |
|---|---|---|
| Unit on screen | Tool calls, per agent | **Phases of a skill pipeline** you define (stations on a line) |
| Skill → skill hand-offs | Not modelled | Drawn as **transfer lines** at the station where they happen |
| Explaining it to others | Raw event stream | Each station says *why it exists*; each skill says *what it does*; **presentation mode** + **replay** |
| What is stored | Often full payloads | **Summaries only**: no prompt text, no file contents, tokens redacted |
| Install | Often Docker | Node only, zero dependencies |

## Install

```bash
claude plugin marketplace add sandicoding/jalur-agent
claude plugin install jalur-agent@jalur-agent
```

Then in Claude Code:

```
/jalur-agent:board            # start the board, prints http://localhost:4321
```

Run the bundled example skill to see a run move along the line:

```
/jalur-agent:feature-flow add a dark-mode toggle to the settings page
```

Requires Node.js 18+. Data lives in `~/.jalur-agent` (override with `JALUR_AGENT_DATA`).

## Features

- **Transit map of phases.** Stations light up as the run moves on; the active one pulses.
- **Transfers.** When your skill calls another skill or spawns a subagent, a coloured branch line appears at that station.
- **Tool calls with duration and status.** Pre/Post events are merged into one row; failures are marked.
- **Run history and replay.** Pick any past run and replay it at presentation speed.
- **Search and filter** the journey log (skill, shell, edits, reads, MCP, failures).
- **Stats.** Duration, tool calls, files changed, transfers, failures, and duration per phase at the end.
- **Presentation mode** and **English / Bahasa Indonesia** (`?lang=id`).
- **Port fallback.** If 4321 is busy it takes the next free port.

## Your own pipeline

Copy `pipelines/feature-flow.json` to `~/.jalur-agent/pipelines/<name>.json` and open `http://localhost:4321/?pipeline=<name>`.

```jsonc
{
  "name": { "en": "Feature Flow line", "id": "Jalur Feature Flow" },
  "startSkill": "feature-flow",                // a run starts when this skill is invoked
  "steps": [{ "en": "Understand" }, { "en": "Plan" } /* … */],
  "whys":  [{ "en": "Read the request first…" } /* one per step */],
  "rules": [                                    // first matching rule wins; phases only move forward
    { "to": 2, "from": 0, "kind": "^(Edit|Write)$" },
    { "to": 3, "from": 2, "kind": "Shell", "text": "\\btest\\b|jest|pytest" }
  ],
  "skills": { "code-review": { "letter": "R", "name": "Code Review", "color": "#1F6FEB",
              "fungsi": { "en": "Reviews the diff for bugs." }, "manfaat": { "en": "Bugs are caught early." } } }
}
```

`kind` is matched against the event kind (`Skill`, `Shell`, `Read`, `Edit`, `Write`, `Grep`, `Glob`, `Agent`, an MCP server name, `Turn`, `User`) and `text` against its short summary. A run is *done* when it reaches the last station and Claude finishes its answer.

**Honest limitation:** phases are inferred from tool calls. That works well for distinctive steps (a skill call, `git commit`, a test command) and less well for similar ones. Tune the rules to how your agent actually works.

## Bonus: three specialist skills

Skills that stand in for the specialist you would otherwise ask a friend for:

| Skill | Role | Based on |
|---|---|---|
| `specialist-visual-designer` | Design lead: brief → visual world → plan → build → critique from a screenshot | Anthropic `frontend-design` (Apache-2.0), Refactoring UI, WCAG 2.2 |
| `specialist-pitch-storyteller` | Presentation consultant: audience & ask → big idea → pyramid → ghost deck → proof | Minto, Duarte, Alley, Sequoia, Kawasaki |
| `specialist-business-strategist` | Strategist: job & customer → evidence → Lean Canvas → bottom-up sizing → pricing → pre-mortem → cheapest test → go / test / stop | Maurya, Osterwalder, Christensen, Fitzpatrick, Klein |

## Privacy

Everything stays on your machine; the server listens on `127.0.0.1` only. The hook stores the tool kind and a short summary (skill name, shortened command, file basename). It never stores prompt text, file contents or diffs, and it redacts anything that looks like a token or secret. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Related projects

[agents-observe](https://github.com/simple10/agents-observe) ·
[claude-code-hooks-multi-agent-observability](https://github.com/disler/claude-code-hooks-multi-agent-observability) ·
[Claude-Code-Agent-Monitor](https://github.com/hoangsonww/Claude-Code-Agent-Monitor) ·
[Mohano](https://hulryung.github.io/mohano/). Several board ideas (merged pre/post rows, run history, log filters) were inspired by agents-observe; the code here is written from scratch.

## License

MIT. `skills/specialist-visual-designer` adapts ideas from Anthropic's `frontend-design` skill (Apache-2.0); see [NOTICE](NOTICE).
