// Where jalur-agent keeps its data. Same for the hook and the server, so both find events.jsonl.
// Override with JALUR_AGENT_DATA. The plugin folder itself is never written to (it changes on update).
const os = require('os');
const path = require('path');
const fs = require('fs');

const DATA = process.env.JALUR_AGENT_DATA || path.join(os.homedir(), '.jalur-agent');
const ROOT = path.join(__dirname, '..');

function ensure() {
  fs.mkdirSync(path.join(DATA, 'pipelines'), { recursive: true });
  return DATA;
}

module.exports = { DATA, ROOT, ensure, EVENTS: path.join(DATA, 'events.jsonl') };
