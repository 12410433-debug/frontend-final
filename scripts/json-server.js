import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { watch } from 'chokidar';
import { json } from 'milliparsec';
import { createApp } from 'json-server/lib/app.js';
import { NormalizedAdapter } from 'json-server/lib/adapters/normalized-adapter.js';
import { Observer } from 'json-server/lib/adapters/observer.js';

const dbPath = resolve(process.cwd(), 'db.json');
const port = Number(process.env.JSON_SERVER_PORT || 3001);
if (!existsSync(dbPath)) throw new Error(`JSON Server database not found: ${dbPath}`);

const observer = new Observer(new NormalizedAdapter(new JSONFile(dbPath)));
const db = new Low(observer, {});
await db.read();

const app = createApp(db, { logger: false });
const bodyParser = app.middleware.find((middleware) => (
  String(middleware.handler).includes('hasBody(req.method) && checkType(req, type)')
));
if (!bodyParser) throw new Error('Could not configure the JSON Server request body parser.');
bodyParser.handler = json({ payloadLimit: 4 * 1024 * 1024 });

app.listen(port, () => {
  console.log(`JSON Server started on port ${port}; JSON payload limit is 4 MB.`);
  console.log(`Database: ${dbPath}`);
  console.log(`Endpoints: ${Object.keys(db.data).map((name) => `http://localhost:${port}/${name}`).join(', ')}`);
});

let writing = false;
let hadReadError = false;
let previousEndpoints = '';
observer.onWriteStart = () => { writing = true; };
observer.onWriteEnd = () => { writing = false; };
observer.onReadStart = () => { previousEndpoints = JSON.stringify(Object.keys(db.data).sort()); };
observer.onReadEnd = (data) => {
  if (data === null) return;
  const nextEndpoints = JSON.stringify(Object.keys(data).sort());
  if (hadReadError || previousEndpoints !== nextEndpoints) {
    console.log(`JSON Server collections: ${Object.keys(data).join(', ')}`);
  }
  hadReadError = false;
};
watch(dbPath).on('change', () => {
  if (writing) return;
  db.read().catch((error) => {
    if (error instanceof SyntaxError) {
      hadReadError = true;
      console.error(`Error parsing ${dbPath}: ${error.message}`);
      return;
    }
    console.error(error);
  });
});