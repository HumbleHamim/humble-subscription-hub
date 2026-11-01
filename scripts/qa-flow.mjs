import { spawn } from 'node:child_process';
import { getQaConfig } from './qa-config.mjs';

const { chromePath: CHROME, port: PORT, base: BASE, userDataDir } = getQaConfig('flow', 9334);

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
      (this.listeners.get(message.method) ?? []).forEach((handler) => handler(message.params));
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
      }, 20000);
    });
  }
  on(method, handler) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(handler);
  }
}

let session;

async function evaluate(expression) {
  const { result, exceptionDetails } = await session.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) {
    throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  }
  return result.value;
}

async function goto(path, waitMs = 900) {
  const response = await fetch(`http://127.0.0.1:${PORT}/json/list`);
  void response;
  await session.send('Page.navigate', { url: `${BASE}${path}` });
  await wait(waitMs);
}

const results = [];
function check(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

await waitForEndpoint();
const target = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, {
  method: 'PUT',
}).then((response) => response.json());
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve);
  ws.addEventListener('error', reject);
});
session = new Session(ws);
await session.send('Page.enable');
await session.send('Runtime.enable');
await session.send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

// Start from a clean slate.
await session.send('Page.navigate', { url: `${BASE}/` });
await wait(1200);
await evaluate(`localStorage.clear()`);

const consoleErrors = [];
session.on('Runtime.consoleAPICalled', (params) => {
  if (params.type === 'error') consoleErrors.push((params.args ?? []).map((a) => a.value ?? '').join(' '));
});
session.on('Runtime.exceptionThrown', (params) => {
  consoleErrors.push(params.exceptionDetails?.exception?.description ?? 'exception');
});

// --- Add to cart from product detail ---
await gotoSplit('/product/spotify');
async function gotoSplit(path) {
  await goto(path, 1400);
}

const addResult = await evaluate(`(() => {
  const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().toLowerCase() === 'add to cart');
  if (!button) return { ok: false, reason: 'button missing' };
  button.click();
  return { ok: true };
})()`);
check('Product detail Add to Cart button exists', addResult.ok, addResult.reason ?? '');

await wait(500);
const cartAfterAdd = await evaluate(`JSON.parse(localStorage.getItem('humble.cart.v1') || '[]')`);
check('Cart persisted to localStorage', cartAfterAdd.length === 1, `${cartAfterAdd.length} item(s), ${cartAfterAdd[0]?.name ?? ''}`);

const badge = await evaluate(`document.querySelector('a[href="/cart"] span span')?.textContent?.trim() ?? ''`);
check('Header cart badge shows 1', badge === '1', `badge=${badge}`);

// --- Add physical product with compare price ---
await goto('/product/AeroFlux-Mini', 1600);
await evaluate(`(() => {
  const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().toLowerCase() === 'add to cart');
  button?.click();
  return Boolean(button);
})()`);
await wait(400);

// --- Wishlist from detail ---
await evaluate(`(() => {
  const button = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').includes('wishlist'));
  button?.click();
  return Boolean(button);
})()`);
await wait(400);
const wishlist = await evaluate(`JSON.parse(localStorage.getItem('humble.wishlist.v1') || '[]')`);
check('Wishlist persisted', wishlist.includes('AeroFlux-Mini'), JSON.stringify(wishlist));

// --- Cart page totals and promo ---
await goto('/cart', 1200);
const cartSummary = await evaluate(`(() => {
  const text = document.body.innerText;
  return {
    items: document.querySelectorAll('a[href^="/product/"] img').length,
    hasSummary: text.includes('Order Summary'),
    hasTotal: text.includes('Total'),
    subtotal: (text.match(/Subtotal\\s*৳[\\d,]+/) || [])[0] || '',
    excerpt: text.slice(Math.max(0, text.indexOf('Subtotal') - 120), text.indexOf('Subtotal') + 60),
  };
})()`);
check('Cart page renders items and summary', /order summary/i.test(cartSummary.excerpt) && cartSummary.items > 0, JSON.stringify(cartSummary));

const promo = await evaluate(`(() => {
  const input = document.querySelector('#promo');
  if (!input) return { ok: false };
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(input, 'HUMBLE10');
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Apply');
  button?.click();
  return { ok: Boolean(button) };
})()`);
check('Promo Apply button found', promo.ok);
await wait(600);
const promoApplied = await evaluate(`document.body.innerText.includes('Promo (HUMBLE10)') || document.body.innerText.includes('HUMBLE10 applied')`);
check('Promo code HUMBLE10 applies discount', promoApplied, await evaluate(`(document.body.innerText.match(/Promo[^\\n]*/) || [''])[0]`));

// --- Wishlist page ---
await goto('/wishlist', 1000);
const wishlistPage = await evaluate(`({ cards: document.querySelectorAll('a[href^="/product/"]').length, h1: document.querySelector('h1')?.textContent?.trim() })`);
check('Wishlist page shows saved product', wishlistPage.cards > 0, JSON.stringify(wishlistPage));

// --- Checkout flow ---
await goto('/checkout', 1400);
const filled = await evaluate(`(() => {
  const setNative = (el, value) => {
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  };
  const values = {
    name: 'Demo Tester',
    phone: '01712345678',
    email: 'demo@example.com',
    city: 'Mirpur',
    address: 'House 12, Road 5, Block B',
    note: 'QA order',
  };
  const filledFields = [];
  for (const [id, value] of Object.entries(values)) {
    const el = document.querySelector('#' + id);
    if (!el) continue;
    setNative(el, value);
    filledFields.push(id);
  }
  const select = document.querySelector('#district');
  if (select) setNative(select, 'Dhaka');
  const form = document.querySelector('main form');
  form?.requestSubmit();
  return { filledFields, hasForm: Boolean(form) };
})()`);
check('Checkout form fields filled', filled.filledFields.length === 6, JSON.stringify(filled.filledFields));
await wait(1500);

const orderResult = await evaluate(`(() => {
  const orders = JSON.parse(localStorage.getItem('humble.orders.v1') || '[]');
  return {
    success: document.body.innerText.includes('Order Placed'),
    orders: orders.length,
    total: orders[0]?.total ?? null,
    payment: orders[0]?.payment ?? null,
    name: orders[0]?.customer?.name ?? null,
    cartCleared: JSON.parse(localStorage.getItem('humble.cart.v1') || '[]').length === 0,
    orderId: orders[0]?.id ?? null,
  };
})()`);
check('Order placed successfully', orderResult.success, JSON.stringify(orderResult));
check('Order stored with details', orderResult.orders === 1 && orderResult.total > 0, `total=${orderResult.total} payment=${orderResult.payment} name=${orderResult.name}`);
check('Cart cleared after order', orderResult.cartCleared);

// --- Login ---
await goto('/login', 1000);
const loginFilled = await evaluate(`(() => {
  const setNative = (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  setNative(document.querySelector('#email'), 'rafid.hasan@example.com');
  setNative(document.querySelector('#password'), 'demo1234');
  document.querySelector('main form')?.requestSubmit();
  return true;
})()`);
void loginFilled;
await wait(1800);
const profileState = await evaluate(`(() => {
  const user = JSON.parse(localStorage.getItem('humble.user.v1') || 'null');
  return {
    path: location.pathname,
    user,
    h1: document.querySelector('h1')?.textContent?.trim() ?? '',
    hasOrders: /HSH-/i.test(document.body.innerText),
    hasAura: /aura/i.test(document.body.innerText),
    orderExcerpt: document.body.innerText.slice(0, 700),
    tabs: [...document.querySelectorAll('button')].map((b) => b.textContent.trim()).filter((t) => ['Orders', 'Wishlist', 'Account'].some((x) => t.startsWith(x))),
  };
})()`);
check('Login stores user and redirects to profile', profileState.path === '/profile' && Boolean(profileState.user), JSON.stringify(profileState.user));
check('Profile shows order history and aura', profileState.hasOrders && profileState.hasAura, `h1=${profileState.h1} tabs=${profileState.tabs.join(',')} orders=${profileState.hasOrders} aura=${profileState.hasAura} excerpt=${JSON.stringify(profileState.orderExcerpt.slice(0, 260))}`);

// --- Aura leaderboard with signed-in user ---
await goto('/aura-leaderboard', 1200);
const auraState = await evaluate(`(() => ({
  h1: document.querySelector('h1')?.textContent?.trim(),
  podium: document.querySelectorAll('ol li').length,
  hasYou: document.body.innerText.includes('You'),
  ribbon: /your standing/i.test(document.body.innerText),
  rank: (document.body.innerText.match(/#\\d+/) || [''])[0],
  rows: document.querySelectorAll('ol > li').length,
}))()`);
check('Leaderboard renders', auraState.h1?.includes('Aura') && auraState.ribbon, JSON.stringify(auraState));

// --- Profile logout ---
await goto('/profile', 1200);
await evaluate(`(() => {
  const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().toLowerCase().includes('sign out'));
  button?.click();
  return Boolean(button);
})()`);
await wait(1200);
const afterLogout = await evaluate(`({ user: localStorage.getItem('humble.user.v1'), path: location.pathname, text: document.body.innerText.slice(0, 120) })`);
check('Sign out clears session', JSON.parse(afterLogout.user) === null, JSON.stringify(afterLogout));

// --- Search ---
await goto('/product?q=power', 1500);
const search = await evaluate(`(() => ({
  h1: document.querySelector('h1')?.textContent?.trim(),
  cards: document.querySelectorAll('a[href^="/product/"] img').length,
  showing: (document.body.innerText.match(/Showing[^\\n]*/) || [''])[0],
}))()`);
check('Search query filters catalog', search.cards > 0 && search.cards < 59 && search.showing.includes('of 59'), JSON.stringify(search));

check('No console errors during flows', consoleErrors.length === 0, consoleErrors.slice(0, 4).join(' | '));

console.log(`\\n${results.filter((r) => r.passed).length}/${results.length} checks passed.`);

await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`);
chrome.kill();
