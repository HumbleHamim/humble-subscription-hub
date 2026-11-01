import { spawn } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORT = 9335;
const BASE = process.env.BASE ?? 'http://localhost:3000';
const userDataDir = 'C:/Users/GIGABYTE/AppData/Local/Temp/opencode/chrome-layout';

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
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      const entry = this.pending.get(message.id);
      if (entry) {
        this.pending.delete(message.id);
        if (message.error) entry.reject(new Error(message.error.message));
        else entry.resolve(message.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => reject(new Error(`Timeout: ${method}`)), 20000);
    });
  }
}

await waitForEndpoint();
const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
  method: 'PUT',
}).then((r) => r.json());
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve);
  ws.addEventListener('error', reject);
});
const session = new Session(ws);
await session.send('Page.enable');
await session.send('Runtime.enable');

async function evaluate(expression) {
  const { result, exceptionDetails } = await session.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
}

async function goto(path, expected, waitMs = 900) {
  await session.send('Page.navigate', { url: `${BASE}${path}` });
  const deadline = Date.now() + 12000;
  while (Date.now() < deadline) {
    await wait(250);
    try {
      const text = await evaluate(`document.body?.innerText ?? ''`);
      if (text.includes(expected)) return;
    } catch {}
  }
}

const checks = [];
const check = (name, passed, detail = '') => {
  checks.push({ name, passed });
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const widths = [
  [360, 2],
  [414, 2],
  [640, 3],
  [768, 3],
  [1024, 4],
  [1280, 4],
  [1440, 4],
  [1600, 5],
];

for (const [width, expectedCols] of widths) {
  await session.send('Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await goto('/product', 'All Products');
  await wait(500);

  const grid = await evaluate(`(() => {
    const items = [...document.querySelectorAll('main div')].find((el) => {
      const style = getComputedStyle(el);
      return style.display === 'grid' && el.children.length > 10;
    });
    if (!items) return null;
    const style = getComputedStyle(items);
    return {
      cols: style.gridTemplateColumns.split(' ').length,
      gap: style.gap,
      mobileNav: (() => { const nav = document.querySelector('nav[aria-label="Mobile navigation"]'); return nav ? getComputedStyle(nav).display : 'missing'; })(),
      headerSearch: (() => { const input = document.querySelector('header input[type="search"]'); return input ? getComputedStyle(input).display : 'inactive'; })(),
      containerWidth: document.querySelector('.site-container')?.getBoundingClientRect().width ?? 0,
      itemWidth: items.children[0]?.getBoundingClientRect().width ?? 0,
    };
  })()`);

  const ok = grid && grid.cols === expectedCols;
  check(
    `${width}px catalog grid = ${expectedCols} cols`,
    Boolean(ok),
    JSON.stringify(grid),
  );

  if (width < 768) {
    check(`${width}px mobile bottom nav visible`, grid?.mobileNav !== 'none', grid?.mobileNav);
  } else {
    check(`${width}px mobile bottom nav hidden`, grid?.mobileNav === 'none', grid?.mobileNav);
  }
}

// Header/nav at desktop
await session.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await goto('/', 'Explore Categories');
await wait(800);
const home = await evaluate(`(() => {
  const carousels = [...document.querySelectorAll('ul[aria-label]')].map((ul) => ({
    label: ul.getAttribute('aria-label'),
    items: ul.children.length,
  }));
  const li = document.querySelector('ul[aria-label="popular subscriptions"] li');
  const track = document.querySelector('ul[aria-label="popular subscriptions"]');
  return {
    carousels,
    firstCardWidth: li?.getBoundingClientRect().width ?? 0,
    trackWidth: track?.getBoundingClientRect().width ?? 0,
    gridCols: document.querySelectorAll('main ul.grid')[0] ? getComputedStyle(document.querySelectorAll('main ul.grid')[0]).gridTemplateColumns.split(' ').length : 0,
    sections: [...document.querySelectorAll('main section h2')].map((h) => h.textContent.trim()),
    footer: Boolean(document.querySelector('footer')),
    headerPosition: getComputedStyle(document.querySelector('header')).position,
  };
})()`);
check('Homepage renders all sections', home.sections.length >= 4 && home.footer, JSON.stringify(home.sections));
check('Carousels populated', home.carousels.some((c) => c.items === 9) && home.carousels.some((c) => c.items === 10), JSON.stringify(home.carousels));
check('Carousel cards sized to track', home.firstCardWidth > 0 && home.firstCardWidth < home.trackWidth / 3, `card=${Math.round(home.firstCardWidth)} track=${Math.round(home.trackWidth)}`);
check('Header is sticky', home.headerPosition === 'sticky', home.headerPosition);

// Mobile drawer
await session.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await goto('/', 'Explore Categories');
await wait(600);
await evaluate(`document.querySelector('button[aria-label="Open menu"]')?.click()`);
await wait(500);
const drawer = await evaluate(`(() => {
  const aside = document.querySelector('aside');
  return { open: Boolean(aside), width: aside?.getBoundingClientRect().width ?? 0, bodyOverflow: getComputedStyle(document.body).overflow, links: aside?.querySelectorAll('a').length ?? 0 };
})()`);
check('Mobile menu drawer opens', drawer.open && drawer.links > 15, JSON.stringify(drawer));
check('Drawer locks body scroll', drawer.bodyOverflow === 'hidden', drawer.bodyOverflow);
await evaluate(`document.querySelector('aside button[aria-label="Close menu"]')?.click()`);
await wait(400);
const drawerClosed = await evaluate(`!document.querySelector('aside')`);
check('Mobile menu drawer closes', drawerClosed);

// Product detail
await session.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
await goto('/product/spotify', 'Choose Plan');
await wait(600);
const detail = await evaluate(`(() => ({
  plans: [...document.querySelectorAll('button')].filter((b) => /month|year/i.test(b.textContent) && b.textContent.includes('৳')).length,
  thumbs: document.querySelectorAll('button[aria-label^="Show image"]').length,
  priceShown: document.body.innerText.includes('৳150'),
  addToCart: [...document.querySelectorAll('button')].some((b) => b.textContent.trim().toLowerCase() === 'add to cart'),
  buyNow: [...document.querySelectorAll('button')].some((b) => b.textContent.trim().toLowerCase() === 'buy now'),
  related: document.querySelectorAll('a[href^="/product/"] img').length,
  breadcrumb: document.querySelector('nav[aria-label="Breadcrumb"]')?.textContent?.replace(/\\s+/g, ' ').trim(),
}))()`);
check('Product detail shows plans, price and CTAs', detail.plans >= 4 && detail.priceShown && detail.addToCart && detail.buyNow, JSON.stringify(detail));
check('Product detail gallery thumbs render', detail.thumbs >= 2, `thumbs=${detail.thumbs}`);
check('Product detail related products render', detail.related > 5, `images=${detail.related}`);

// Leaderboard
await goto('/aura-leaderboard', 'AURA LEADERBOARD');
await wait(600);
const aura = await evaluate(`(() => ({
  podium: [...document.querySelectorAll('main .grid.grid-cols-3 > div')].length,
  rows: document.querySelectorAll('ol > li').length,
  tabs: [...document.querySelectorAll('button')].filter((b) => ['ALL TIME', 'THIS MONTH', 'THIS WEEK'].includes(b.textContent.trim().toUpperCase())).length,
}))()`);
check('Leaderboard podium and table render', aura.podium === 3 && aura.rows === 10 && aura.tabs === 3, JSON.stringify(aura));

// Footer & content pages
await goto('/about', 'ABOUT US');
await wait(500);
const content = await evaluate(`(() => ({
  sections: document.querySelectorAll('main section').length,
  hasCta: document.body.innerText.includes('Contact Us'),
  footerCols: document.querySelectorAll('footer nav').length,
}))()`);
check('Content page renders sections and footer columns', content.sections >= 4 && content.hasCta && content.footerCols === 3, JSON.stringify(content));

// 404
await session.send('Page.navigate', { url: `${BASE}/missing-page` });
await wait(1500);
const notFound = await evaluate(`(() => ({ text: document.body.innerText.includes('This page went missing'), status: document.title }))()`);
check('404 page renders', notFound.text, JSON.stringify(notFound));

console.log(`\n${checks.filter((c) => c.passed).length}/${checks.length} checks passed.`);
await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`);
chrome.kill();
