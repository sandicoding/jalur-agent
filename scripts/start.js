// Start / stop / status of the board server in the background.
//   node start.js [start|stop|status]
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { DATA, ensure } = require('./paths');

ensure();
const PID = path.join(DATA, 'server.pid');
const LOG = path.join(DATA, 'server.log');
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (_) { return false; } };
const pid = () => { try { return Number(fs.readFileSync(PID, 'utf8')); } catch (_) { return 0; } };
const url = () => { try { return `http://localhost:${fs.readFileSync(path.join(DATA, 'port.txt'), 'utf8').trim()}`; } catch (_) { return '(port unknown)'; } };

const cmd = process.argv[2] || 'start';
if (cmd === 'stop') {
  const p = pid();
  if (p && alive(p)) { process.kill(p); console.log(`stopped (${p})`); } else console.log('not running');
  try { fs.unlinkSync(PID); } catch (_) {}
} else if (cmd === 'status') {
  const p = pid();
  console.log(p && alive(p) ? `running (${p}) at ${url()}` : 'not running');
} else {
  const p = pid();
  if (p && alive(p)) { console.log(`already running at ${url()}`); process.exit(0); }
  const out = fs.openSync(LOG, 'a');
  const child = spawn(process.execPath, [path.join(__dirname, 'server.js')], { detached: true, windowsHide: true, stdio: ['ignore', out, out] });
  fs.writeFileSync(PID, String(child.pid));
  child.unref();
  setTimeout(() => console.log(`started (${child.pid}) at ${url()}`), 800);
}
