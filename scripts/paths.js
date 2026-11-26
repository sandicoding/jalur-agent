// Where skill-metro keeps its data. Same for the hook and the server, so both find events.jsonl.
// Override with SKILL_METRO_DATA. The plugin folder itself is never written to (it changes on update).
const os = require('os');
const path = require('path');
const fs = require('fs');

const DATA = process.env.SKILL_METRO_DATA || path.join(os.homedir(), '.skill-metro');
const ROOT = path.join(__dirname, '..');

function ensure() {
  fs.mkdirSync(path.join(DATA, 'pipelines'), { recursive: true });
  return DATA;
}

module.exports = { DATA, ROOT, ensure, EVENTS: path.join(DATA, 'events.jsonl') };
