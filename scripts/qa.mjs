import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9333;
const BASE = process.env.BASE ?? 'http://localhost:3000';
const userDataDir = 'C:/Users/GIGABYTE/AppData/Local/Temp/opencode/chrome-qa';

const pages = [
  ['home', '/'],
  ['catalog', '/product'],
  ['subscriptions', '/subscriptions'],
  ['category-earbuds', '/product/category/earbuds'],
  ['detail-spotify', '/product/spotify'],
  ['detail-physical', '/product/AeroFlux-Mini'],
  ['cart', '/cart'],
  ['wishlist', '/wishlist'],
  ['checkout', '/checkout'],
  ['login', '/login'],
  ['register', '/register'],
  ['profile', '/profile'],
  ['aura', '/aura-leaderboard'],
  ['about', '/about'],
  ['contact', '/contact'],
  ['guide', '/guide'],
  ['shipping', '/shipping'],
  ['refund', '/refund-policy'],
  ['privacy', '/privacy'],
  ['terms', '/terms'],
  ['notfound', '/this-page-does-not-exist'],
];

const widths = [360, 768, 1024, 1440];

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${userDataDir}`,
  'about:blank',
]);
chrome.stderr.on('data', () => {});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForEndpoint() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (response.ok) return response.json();
    } catch {}
    await wait(250);
  }
  throw new Error('Chrome DevTools endpoint did not start');
}

class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }
      const handlers = this.listeners.get(message.method);
      if (handlers) handlers.forEach((handler) => handler(message.params));
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Timeout: ${method}`));
        }
      }, 30000);
    });
  }

  on(method, handler) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(handler);
  }

  once(method) {
    return new Promise((resolve) => {
      const handler = (params) => {
        const list = this.listeners.get(method) ?? [];
        this.listeners.set(
          method,
          list.filter((item) => item !== handler),
        );
        resolve(params);
      };
      this.on(method, handler);
    });
  }
}

async function openSession() {
  const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
    method: 'PUT',
  }).then((response) => response.json());
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  return { session: new Session(ws), targetId: target.id };
}

const inspectExpression = `(() => {
  const innerWidth = window.innerWidth;
  const doc = document.documentElement;
  const offenders = [];
  for (const el of document.querySelectorAll('body *')) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.right > innerWidth + 2 || rect.left < -2) {
      const style = getComputedStyle(el);
      if (style.position === 'fixed') continue;
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 90),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
      });
      if (offenders.length >= 12) break;
    }
  }
  const brokenImages = [...document.images]
    .filter((img) => img.complete && img.naturalWidth === 0)
    .map((img) => img.getAttribute('src'))
    .slice(0, 8);
  const pendingImages = [...document.images].filter((img) => !img.complete).length;
  return {
    scrollWidth: doc.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth,
    overflowX: doc.scrollWidth > innerWidth + 2,
    offenders,
    brokenImages,
    pendingImages,
    imageCount: document.images.length,
    h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 80),
    title: document.title,
    textLength: document.body.innerText.length,
  };
})()`;

const results = [];

const version = await waitForEndpoint();
void version;
const { session, targetId } = await openSession();
await session.send('Page.enable');
await session.send('Runtime.enable');

for (const width of widths) {
  await session.send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });

  for (const [name, path] of pages) {
    const errors = [];
    const onConsole = (params) => {
      if (params.type === 'error') errors.push((params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    };
    session.on('Runtime.consoleAPICalled', onConsole);
    session.on('Runtime.exceptionThrown', (params) => {
      errors.push(('exception: ' + (params.exceptionDetails?.exception?.description ?? '')).slice(0, 200));
    });

    const loaded = session.once('Page.loadEventFired');
    await session.send('Page.navigate', { url: `${BASE}${path}` });
    await Promise.race([loaded, wait(15000)]);
    await wait(700);

    try {
      const { result } = await session.send('Runtime.evaluate', {
        expression: inspectExpression,
        returnByValue: true,
      });
      results.push({ width, name, path, ...result.value, errors: errors.slice(0, 3) });
    } catch (error) {
      results.push({ width, name, path, error: String(error) });
    }

    await session.send('Runtime.disable');
    await session.send('Runtime.enable');
  }
}

await fetch(`http://127.0.0.1:${PORT}/json/close/${targetId}`);
chrome.kill();

fs.writeFileSync(
  'C:/Users/GIGABYTE/AppData/Local/Temp/opencode/qa-results.json',
  JSON.stringify(results, null, 2),
);

const problems = results.filter(
  (r) => r.error || r.overflowX || r.brokenImages?.length || r.errors?.length || r.textLength < 200,
);
console.log(`Checked ${results.length} page/width combos.`);
console.log(`Problems: ${problems.length}`);
for (const problem of problems) {
  console.log('---');
  console.log(`${problem.width}px ${problem.name} (${problem.path})`);
  if (problem.error) console.log('  error:', problem.error);
  if (problem.textLength < 200) console.log('  thin page, text length:', problem.textLength);
  if (problem.overflowX) {
    console.log(`  overflow: scrollWidth=${problem.scrollWidth} innerWidth=${problem.innerWidth}`);
    for (const offender of problem.offenders ?? []) {
      console.log(`    ${offender.tag} [${offender.cls}] l=${offender.left} r=${offender.right} w=${offender.width}`);
    }
  }
  if (problem.brokenImages?.length) console.log('  broken images:', problem.brokenImages.join(', '));
  if (problem.errors?.length) console.log('  console:', problem.errors.join(' | '));
}
