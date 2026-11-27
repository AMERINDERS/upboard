// Cart API: SKU search over a copy of thebrick.com's product list, the discount code sheet and warranty tables.
// Everything needs the cart PIN (CART_PIN env var in Vercel). Uses its own Redis keys (cart:*), never the board's.
//   GET  /api/cart?a=meta | codes | warranty | search&q=...
//   POST /api/cart?a=sync  {phase:"start"|"pages"|"finish", start}   -- copies the catalog in small steps
//   GET  /api/cart?a=lookup&url=<thebrick.com product link>  -- adds one product straight from the website
//   GET  /api/cart?a=mycart&who=Name  /  POST /api/cart?a=mycart {who, cart}  -- one saved cart per salesperson

const CODES = require("./_codes.js");
const WARRANTY = require("./_warranty.js");

const ZONE = "ZBC";            // price zone for store 4P St. Catharines (from thebrick.com store selector)
const SITE = process.env.BRICK_SITE || "https://www.thebrick.com";
const PAGES_PER_STEP = 15;     // 30 products per page -> 450 products per step, one page at a time
const MAX_PAGE = 834;          // Shopify stops at 25,000 products (page x 30)
// The main list only reaches the newest 25,000 products, so the departments are copied too (each is under 25,000).
const COLLECTIONS = ["all-furniture-mattresses-excludes-online-only", "appliances", "electronics", "home-decor", "outdoor"];
const TOTAL_PAGES_EST = 834 + Math.ceil((11579 + 9486 + 2259 + 23242 + 5100) / 30);

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const CART_PIN = (process.env.CART_PIN || "").trim();

async function redis(cmd) {
  const r = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}
const getJSON = async (k) => { const v = await redis(["GET", k]); return v ? JSON.parse(v) : null; };
const setJSON = (k, v) => redis(["SET", k, JSON.stringify(v)]);

// ---------- catalog cache (per server instance) ----------
let cache = { version: null, items: [], checkedAt: 0 };

async function catalog() {
  if (Date.now() - cache.checkedAt < 60000 && cache.version) return cache;
  const meta = await getJSON("cart:cat:meta");
  cache.checkedAt = Date.now();
  if (!meta || !meta.version) { cache = { version: null, items: [], checkedAt: Date.now(), meta }; return cache; }
  if (meta.version !== cache.version) {
    const keys = [];
    for (let i = 0; i < meta.batches; i++) keys.push(`cart:cat:${meta.version}:${i}`);
    const items = [], seen = new Set();
    const add = (arr) => { for (const it of arr) if (!seen.has(it[0])) { seen.add(it[0]); items.push(it); } };
    for (let i = 0; i < keys.length; i += 4) {
      const vals = await redis(["MGET", ...keys.slice(i, i + 4)]);
      for (const v of vals) if (v) add(JSON.parse(v));
    }
    add((await getJSON("cart:cat:extra")) || []);
    cache = { version: meta.version, items, checkedAt: Date.now(), meta };
  }
  cache.meta = meta;
  return cache;
}

// one cart per salesperson, saved for 7 days
const whoKey = (s) => {
  const n = String(s || "").replace(/\s+/g, " ").trim().slice(0, 30).toLowerCase();
  return /^[\p{L}\p{N} .'-]+$/u.test(n) ? n : "";
};

const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

function search(items, q) {
  const Q = norm(q);
  if (!Q) return [];
  const tokens = Q.split(" ");
  const qsku = Q.replace(/ /g, "");
  const out = [];
  for (const it of items) {
    const sku = it[0];
    let score = 0;
    if (sku === qsku) score = 1000;
    else if (sku.startsWith(qsku) && qsku.length >= 3) score = 500;
    else {
      const hay = norm(sku + " " + it[1] + " " + it[2] + " " + it[3]);
      if (!tokens.every((t) => hay.includes(t))) continue;
      score = 100 - Math.min(90, it[1].length / 4);
    }
    out.push([score, it]);
  }
  out.sort((a, b) => b[0] - a[0]);
  return out.slice(0, 40).map(([, it]) => ({ sku: it[0], title: it[1], vendor: it[2], type: it[3], price: it[4], regular: it[5], handle: it[6] }));
}

// ---------- catalog copy from thebrick.com ----------
function pick(p) {
  const v = (p.variants || []).find((x) => x.title === ZONE);
  if (!v || !v.sku) return null;
  const title = String(p.title || "").split("|")[0].trim();
  const price = Math.round(parseFloat(v.price) * 100) / 100;
  const cmp = v.compare_at_price ? Math.round(parseFloat(v.compare_at_price) * 100) / 100 : null;
  return [String(v.sku).toUpperCase().trim(), title, p.vendor || "", p.product_type || "", price, cmp && cmp > price ? cmp : null, p.handle];
}

class SlowDown extends Error {}

async function fetchPage(n, col) {
  const url = col ? `${SITE}/collections/${col}/products.json?page=${n}` : `${SITE}/products.json?page=${n}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const r = await fetch(url, { headers: { "User-Agent": "UpBoard-4P-cart/1.0", Accept: "application/json" } });
    if (r.status === 429 || r.status >= 500) { await new Promise((s) => setTimeout(s, 3000)); continue; }
    if (!r.ok) return { done: true, products: [] };
    const j = await r.json();
    return { done: (j.products || []).length < 30, products: j.products || [] };
  }
  throw new SlowDown("thebrick.com asked us to slow down (page " + n + ")");
}

async function syncStep(body) {
  const phase = body.phase || "start";
  if (phase === "start") {
    const version = "v" + Date.now();
    await setJSON("cart:cat:sync", { version, batches: 0, count: 0, startedAt: Date.now() });
    return { phase: "pages", start: 1, version };
  }
  const job = await getJSON("cart:cat:sync");
  if (!job) throw new Error("No catalog update in progress - press the button again");

  if (phase === "pages" || phase === "cols") {
    const ci = +body.ci || 0;
    const col = phase === "cols" ? COLLECTIONS[ci] : null;
    const start = Math.max(1, +body.start || 1);
    const end = Math.min(MAX_PAGE, start + PAGES_PER_STEP - 1);
    const items = [];
    let done = false, fetched = 0;
    for (let n = start; n <= end; n++) {
      const pg = await fetchPage(n, col);
      fetched++;
      for (const p of pg.products) { const it = pick(p); if (it) items.push(it); }
      if (pg.done) { done = true; break; }
      await new Promise((s) => setTimeout(s, 800)); // be gentle with the site: about 1 page a second
    }
    await redis(["SET", `cart:cat:${job.version}:${job.batches}`, JSON.stringify(items), "EX", "1209600"]);
    job.batches++; job.count += items.length; job.pages = (job.pages || 0) + fetched;
    await setJSON("cart:cat:sync", job);
    const progress = Math.min(99, Math.round((job.pages / TOTAL_PAGES_EST) * 100));
    if (!done && end < MAX_PAGE) return { phase, ci, start: end + 1, count: job.count, progress };
    const nextCi = phase === "pages" ? 0 : ci + 1;
    if (nextCi < COLLECTIONS.length) return { phase: "cols", ci: nextCi, start: 1, count: job.count, progress };
    return { phase: "finish", count: job.count };
  }

  if (phase === "finish") {
    const old = await getJSON("cart:cat:meta");
    const meta = { version: job.version, batches: job.batches, count: job.count, zone: ZONE, updated: Date.now() };
    await setJSON("cart:cat:meta", meta);
    await redis(["DEL", "cart:cat:sync"]);
    if (old && old.version && old.version !== job.version) {
      const keys = []; for (let i = 0; i < old.batches; i++) keys.push(`cart:cat:${old.version}:${i}`);
      if (keys.length) await redis(["DEL", ...keys]);
    }
    cache.checkedAt = 0;
    return { phase: "done", count: job.count };
  }
  throw new Error("Unknown step");
}

// ---------- handler ----------
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (!CART_PIN) return res.status(503).json({ error: "The cart PIN isn't set up in Vercel yet (CART_PIN)." });
    if (String(req.headers["x-cart-pin"] || "").trim() !== CART_PIN) return res.status(401).json({ error: "Wrong store PIN", pin: true });
    if (!REDIS_URL) return res.status(503).json({ error: "Storage isn't connected" });

    const a = String((req.query && req.query.a) || "");
    if (req.method === "GET") {
      if (a === "codes") return res.json({ codes: CODES });
      if (a === "warranty") return res.json({ warranty: WARRANTY.map((c) => ({ ...c, match: c.match ? c.match.source : null })) });
      if (a === "meta") { const c = await catalog(); return res.json({ zone: ZONE, store: "4P St. Catharines", catalog: c.meta || null, sync: await getJSON("cart:cat:sync") }); }
      if (a === "search") { const c = await catalog(); return res.json({ results: search(c.items, req.query.q), count: c.items.length }); }
      if (a === "lookup") {
        const m = String(req.query.url || "").match(/\/products\/([a-z0-9][a-z0-9-]*)/i);
        if (!m) return res.status(400).json({ error: "Paste a thebrick.com product link (it has /products/ in it)" });
        const r = await fetch(`${SITE}/products/${m[1].toLowerCase()}.json`, { headers: { "User-Agent": "UpBoard-4P-cart/1.0", Accept: "application/json" } });
        if (!r.ok) return res.status(404).json({ error: "That product link didn't work on thebrick.com" });
        const it = pick((await r.json()).product || {});
        if (!it) return res.status(404).json({ error: "This product has no price for the St. Catharines store" });
        const extra = ((await getJSON("cart:cat:extra")) || []).filter((x) => x[0] !== it[0]);
        extra.unshift(it);
        await setJSON("cart:cat:extra", extra.slice(0, 3000));
        cache.checkedAt = 0; cache.version = null;
        return res.json({ results: [{ sku: it[0], title: it[1], vendor: it[2], type: it[3], price: it[4], regular: it[5], handle: it[6] }], count: 1 });
      }
      if (a === "mycart") {
        const who = whoKey(req.query.who);
        if (!who) return res.status(400).json({ error: "Enter your name" });
        return res.json({ cart: await getJSON("cart:user:" + who) });
      }
    }
    if (req.method === "POST" && a === "mycart") {
      let body = req.body; if (typeof body === "string") body = JSON.parse(body || "{}");
      const who = whoKey(body && body.who);
      const c = body && body.cart;
      if (!who) return res.status(400).json({ error: "Enter your name" });
      if (!c || !Array.isArray(c.lines) || c.lines.length > 300) return res.status(400).json({ error: "Bad cart" });
      const data = JSON.stringify({ lines: c.lines, next: +c.next || 1, savedAt: Date.now() });
      if (data.length > 300000) return res.status(400).json({ error: "Cart too big" });
      await redis(["SET", "cart:user:" + who, data, "EX", "604800"]);
      return res.json({ ok: true });
    }
    if (req.method === "POST" && a === "sync") {
      let body = req.body; if (typeof body === "string") body = JSON.parse(body || "{}");
      return res.json(await syncStep(body || {}));
    }
    res.status(400).json({ error: "Unknown request" });
  } catch (e) {
    res.status(e instanceof SlowDown ? 503 : 500).json({ error: e.message || "Server error", retry: e instanceof SlowDown });
  }
};

