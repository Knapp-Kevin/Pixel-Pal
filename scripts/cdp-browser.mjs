import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'google-chrome',
    'google-chrome-stable',
    'chromium',
    'chromium-browser'
  ].filter(Boolean);

  for (const candidate of candidates) {
    const result = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    if (result.status === 0) return candidate;
  }

  throw new Error('A Chrome or Chromium executable is required for viewport verification.');
}

class CdpSession {
  constructor(webSocketUrl) {
    if (typeof WebSocket === 'undefined') {
      throw new Error('Node.js WebSocket support is required. Use Node 22 or newer.');
    }

    this.socket = new WebSocket(webSocketUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });

    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }

      const waiters = this.eventWaiters.get(message.method);
      if (!waiters?.length) return;
      this.eventWaiters.delete(message.method);
      for (const resolve of waiters) resolve(message.params);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const response = new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
    this.socket.send(JSON.stringify({ id, method, params }));
    return response;
  }

  waitForEvent(method, timeoutMilliseconds = 10_000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}.`)), timeoutMilliseconds);
      const wrappedResolve = (value) => {
        clearTimeout(timeout);
        resolve(value);
      };
      const waiters = this.eventWaiters.get(method) ?? [];
      waiters.push(wrappedResolve);
      this.eventWaiters.set(method, waiters);
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });

    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.text ?? 'Browser evaluation failed.');
    }
    return response.result?.value;
  }

  async waitFor(expression, timeoutMilliseconds = 10_000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMilliseconds) {
      if (await this.evaluate(`Boolean(${expression})`)) return;
      await delay(80);
    }
    throw new Error(`Timed out waiting for browser condition: ${expression}`);
  }

  async navigate(url) {
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    const loaded = this.waitForEvent('Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await loaded;
  }

  close() {
    this.socket.close();
  }
}

export async function startHeadlessChrome({ port = 9222 } = {}) {
  const chromePath = findChrome();
  const userDataDirectory = await mkdtemp(join(tmpdir(), 'pixel-pals-chrome-'));
  const processHandle = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDirectory}`,
    'about:blank'
  ], { stdio: 'ignore' });

  const endpoint = `http://127.0.0.1:${port}`;
  const started = Date.now();
  let ready = false;

  while (Date.now() - started < 10_000) {
    if (processHandle.exitCode !== null) {
      throw new Error(`Chrome exited before its DevTools endpoint started (${processHandle.exitCode}).`);
    }

    try {
      const response = await fetch(`${endpoint}/json/version`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      // Chrome is still starting.
    }
    await delay(100);
  }

  if (!ready) throw new Error('Chrome DevTools endpoint did not start.');

  return {
    async newPage() {
      const response = await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' });
      if (!response.ok) throw new Error('Could not create a Chrome page.');
      const target = await response.json();
      return new CdpSession(target.webSocketDebuggerUrl);
    },
    async close() {
      processHandle.kill('SIGTERM');
      await rm(userDataDirectory, { recursive: true, force: true });
    }
  };
}
