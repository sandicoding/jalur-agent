// skill-metro hook: one short, redacted JSON line per Claude Code event, appended to events.jsonl.
// Never blocks or fails the session: every error is swallowed and the exit code is always 0.
// What is stored: tool kind + a short summary. What is never stored: prompt text, file contents, diffs.
const fs = require('fs');
const path = require('path');
const { EVENTS, ensure } = require('./paths');

const MAX_BYTES = 5 * 1024 * 1024;

const redact = (s) =>
  String(s || '')
    .replace(/(token|secret|password|passwd|authorization|bearer|api[_-]?key)\s*[:=]?\s*\S+/gi, '$1=***')
    .replace(/[A-Za-z0-9_\-.]{32,}/g, '***');
const short = (s, n = 80) => {
  const t = redact(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};
const base = (p) => (p ? path.basename(String(p)) : '');
const lines = (s) => (s ? String(s).split('\n').length : 0);

function summarize(e) {
  const name = e.tool_name || '';
  const i = e.tool_input || {};
  if (name === 'Skill') return { kind: 'Skill', text: String(i.skill || '').replace(/^.*:/, '') };
  if (name === 'Bash' || name === 'PowerShell') {
    // drop a leading "cd <dir>;" / "cd <dir> &&" and shorten skill script paths so the meaningful part survives the cut
    const cmd = String(i.command || '')
      .replace(/^\s*(cd\s+("[^"]*"|\S+)\s*(;|&&)\s*)+/i, '')
      .replace(/(~|[A-Za-z]:)?[\\/][^\s'"]*?[\\/]skills[\\/]([^\\/\s]+)[\\/]scripts[\\/]/g, '$2/');
    return { kind: 'Shell', text: short(cmd) };
  }
  if (name === 'Read') return { kind: 'Read', text: base(i.file_path) };
  if (name === 'Write') return { kind: 'Write', text: `${base(i.file_path)} (${lines(i.content)} lines)` };
  if (name === 'Edit') return { kind: 'Edit', text: `${base(i.file_path)} +${lines(i.new_string)} −${lines(i.old_string)}` };
  if (name === 'Grep' || name === 'Glob') return { kind: name, text: short(i.pattern, 40) };
  if (name === 'Agent' || name === 'Task') return { kind: 'Agent', text: short(i.description, 50) };
  if (name.startsWith('mcp__')) {
    const [, server, ...rest] = name.split('__');
    return { kind: short(server, 12), text: rest.join('__') };
  }
  return { kind: short(name, 14), text: '' };
}

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const e = JSON.parse(raw || '{}');
    const ev = e.hook_event_name;
    const rec = { ts: Date.now(), session: String(e.session_id || '').slice(0, 8), event: ev };
    const tid = e.tool_use_id ? String(e.tool_use_id).slice(-12) : undefined; // pairs Pre with Post
    if (ev === 'PreToolUse') Object.assign(rec, summarize(e), { tid });
    else if (ev === 'PostToolUse') {
      const r = e.tool_response;
      const failed = typeof r === 'string' ? /error|failed/i.test(r.slice(0, 200)) : !!(r && (r.is_error || r.isError || r.error || r.interrupted));
      Object.assign(rec, { kind: summarize(e).kind, tid, ok: !failed });
      if (typeof e.duration_ms === 'number') rec.dur = e.duration_ms;
    } else if (ev === 'UserPromptSubmit') Object.assign(rec, { kind: 'User', text: 'new prompt' });
    else if (ev === 'Stop') Object.assign(rec, { kind: 'Turn', text: 'Claude finished answering' });
    else return;
    ensure();
    try { if (fs.statSync(EVENTS).size > MAX_BYTES) fs.renameSync(EVENTS, EVENTS + '.old'); } catch (_) {}
    fs.appendFileSync(EVENTS, JSON.stringify(rec) + '\n');
  } catch (_) { /* never disturb the session */ }
});
