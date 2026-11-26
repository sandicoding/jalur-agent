// jalur-agent local server (127.0.0.1 only, no dependencies).
//   /                 the board         (?pipeline=<name>&lang=en|id)
//   /events           SSE of events.jsonl
//   /pipeline/<name>  pipeline config: <data>/pipelines/<name>.json wins over the bundled example
//   /pipelines        names of all available pipelines
const http = require('http');
const fs = require('fs');
const path = require('path');
const { DATA, ROOT, EVENTS, ensure } = require('./paths');

ensure();
const PORT = Number(process.env.JALUR_AGENT_PORT || 4321);
const clients = new Set();
let offset = 0;

function readAll() {
  try {
    const txt = fs.readFileSync(EVENTS, 'utf8');
    offset = Buffer.byteLength(txt);
    return txt.split('\n').filter(Boolean).slice(-5000);
  } catch (_) { offset = 0; return []; }
}

function poll() {
  let size = 0;
  try { size = fs.statSync(EVENTS).size; } catch (_) { return; }
  if (size < offset) offset = 0; // rotated
  if (size === offset) return;
  const fd = fs.openSync(EVENTS, 'r');
  const buf = Buffer.alloc(size - offset);
  fs.readSync(fd, buf, 0, buf.length, offset);
  fs.closeSync(fd);
  offset = size;
  buf.toString('utf8').split('\n').filter(Boolean).forEach((l) => clients.forEach((res) => res.write(`data: ${l}\n\n`)));
}

const pipelineDirs = [path.join(DATA, 'pipelines'), path.join(ROOT, 'pipelines')];
function pipelineNames() {
  const names = new Set();
  for (const d of pipelineDirs) { try { fs.readdirSync(d).filter((f) => f.endsWith('.json')).forEach((f) => names.add(f.slice(0, -5))); } catch (_) {} }
  return [...names];
}

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    readAll().forEach((l) => res.write(`data: ${l}\n\n`));
    res.write('event: ready\ndata: {}\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  if (url === '/pipelines') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(pipelineNames()));
  }
  if (url.startsWith('/pipeline/')) {
    const name = path.basename(url).replace(/[^a-z0-9-]/gi, '');
    for (const d of pipelineDirs) {
      const f = path.join(d, name + '.json');
      if (fs.existsSync(f)) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(fs.readFileSync(f)); }
    }
    res.writeHead(404); return res.end();
  }
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(path.join(ROOT, 'web', 'board.html')));
  }
  res.writeHead(404); res.end();
});

// Port taken? try the next ones; the chosen port is written to <data>/port.txt
let port = PORT;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && port < PORT + 10) { port++; return server.listen(port, '127.0.0.1'); }
  console.error('jalur-agent server failed:', e.message); process.exit(1);
});
server.on('listening', () => {
  readAll();
  setInterval(poll, 400);
  fs.writeFileSync(path.join(DATA, 'port.txt'), String(port));
  console.log(`jalur-agent: http://localhost:${port}`);
});
server.listen(port, '127.0.0.1');
