import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? (process.env.ComSpec || 'cmd.exe') : 'npm';
const children = new Set();
let stopping = false;

function stopChild(child) {
  if (!child || child.exitCode !== null) return;
  if (isWindows && child.pid) {
    const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {
      stdio: 'ignore',
      windowsHide: true,
    });
    killer.on('error', () => child.kill());
  } else {
    child.kill('SIGTERM');
  }
}

function stopAll() {
  if (stopping) return;
  stopping = true;
  for (const child of children) stopChild(child);
}

process.on('SIGINT', stopAll);
process.on('SIGTERM', stopAll);

function startNpm(scriptName) {
  const args = isWindows
    ? ['/d', '/s', '/c', 'npm run ' + scriptName]
    : ['run', scriptName];
  const child = spawn(npmCommand, args, {
    stdio: 'inherit',
    windowsHide: true,
  });
  children.add(child);

  child.on('error', (error) => {
    console.error('Gagal menjalankan npm run ' + scriptName + ': ' + error.message);
    stopAll();
    process.exitCode = 1;
  });
  child.on('exit', (code) => {
    children.delete(child);
    if (!stopping) {
      console.error('Proses ' + scriptName + ' berhenti; proses lain ikut dihentikan.');
      process.exitCode = code || 1;
      stopAll();
    }
  });
  return child;
}

async function endpointReady(url, validate) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(900) });
    if (!response.ok) return null;
    const data = await response.json();
    return validate(data) ? data : null;
  } catch {
    return null;
  }
}

const jsonServerReady = () => endpointReady(
  'http://localhost:3001/events',
  (data) => Array.isArray(data),
);
const expressReady = () => endpointReady(
  'http://localhost:5000/api/health',
  (data) => data?.status === 'ok',
);
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function ensureService({ name, ready, scriptName, failure }) {
  const existing = await ready();
  if (existing) {
    console.log(name + ' sudah aktif; memakai server yang ada.');
    return existing;
  }

  console.log('Menyalakan ' + name + '...');
  startNpm(scriptName);
  for (let attempt = 0; attempt < 50 && !stopping; attempt += 1) {
    const result = await ready();
    if (result) {
      console.log(name + ' siap.');
      return result;
    }
    await wait(300);
  }

  console.error(failure);
  process.exitCode = 1;
  stopAll();
  return null;
}

async function startDevelopment() {
  const database = await ensureService({
    name: 'JSON Server di port 3001',
    ready: jsonServerReady,
    scriptName: 'mock',
    failure: 'JSON Server gagal aktif. Periksa port 3001 dan db.json.',
  });
  if (!database || stopping) return;

  const backend = await ensureService({
    name: 'Backend Express di port 5000',
    ready: expressReady,
    scriptName: 'server',
    failure: 'Backend Express gagal aktif. Periksa port 5000 dan konfigurasi server.',
  });
  if (!backend || stopping) return;

  if (!backend.geminiConfigured) {
    console.warn('GEMINI_API_KEY belum disetel. Salin .env.example menjadi .env dan isi key agar AI dapat menjawab.');
  }
  if (!stopping) startNpm('dev:client');
}

startDevelopment().catch((error) => {
  console.error('Gagal memulai development server:', error.message);
  process.exitCode = 1;
  stopAll();
});