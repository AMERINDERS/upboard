// Up Board API — one shared board stored in Upstash Redis (Vercel Storage).
// GET  /api/board            -> current board
// POST /api/board {action, name, by} -> apply an action, returns new board
//
// Rules (change here if your store does it differently):
//   join          -> added to the BOTTOM of the line
//   withCustomer  -> counts an up, goes to the BOTTOM, marked "with customer"
//   missed        -> counts a miss, goes to the BOTTOM
//   powerUp       -> counts a sale, goes to the TOP (set POWER_UP_TO = "bottom" to change)
//   free          -> done with customer (no sale), stays where they are in line
//   leave         -> removed from the board (lunch / going home)
//   moveUp / moveDown -> manager nudges someone one spot
//   reset         -> clears the board and today's counts

const POWER_UP_TO = "top";
const KEY = "upboard:state";
const LOCK = "upboard:lock";
const CACHE_MS = 1500;

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STORE_PIN = (process.env.STORE_PIN || "").trim();

let memory = null; // fallback when Redis isn't connected (not shared reliably!)
let cache = { at: 0, state: null };

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

const empty = () => ({ line: [], people: {}, log: [], updated: Date.now() });

async function load() {
  if (!REDIS_URL) return memory || (memory = empty());
  const raw = await redis(["GET", KEY]);
  return raw ? JSON.parse(raw) : empty();
}

async function save(state) {
  state.updated = Date.now();
  if (!REDIS_URL) { memory = state; return; }
  // keep for 3 days so an abandoned board cleans itself up
  await redis(["SET", KEY, JSON.stringify(state), "EX", "259200"]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withLock(fn) {
  if (!REDIS_URL) return fn();
  const token = Math.random().toString(36).slice(2);
  for (let i = 0; i < 40; i++) {
    const ok = await redis(["SET", LOCK, token, "NX", "PX", "4000"]);
    if (ok === "OK") {
      try { return await fn(); }
      finally {
        const cur = await redis(["GET", LOCK]);
        if (cur === token) await redis(["DEL", LOCK]);
      }
    }
    await sleep(75 + Math.random() * 75);
  }
  throw new Error("Board is busy, try again");
}

const clean = (s) => String(s || "").replace(/\s+/g, " ").trim().slice(0, 30);
const keyOf = (n) => n.toLowerCase();

function person(state, name) {
  const k = keyOf(name);
  if (!state.people[k]) state.people[k] = { name, ups: 0, sales: 0, missed: 0, busy: false, since: null };
  return state.people[k];
}

function toBottom(state, k) { state.line = state.line.filter((x) => x !== k); state.line.push(k); }
function toTop(state, k) { state.line = state.line.filter((x) => x !== k); state.line.unshift(k); }

function apply(state, action, name, by) {
  const k = keyOf(name);
  const who = by && keyOf(by) !== k ? ` (by ${by})` : "";
  const inLine = state.line.includes(k);
  const p = name ? person(state, name) : null;
  const log = (text) => {
    state.log.unshift({ t: Date.now(), text: text + who });
    state.log = state.log.slice(0, 60);
  };

  switch (action) {
    case "join":
      if (!inLine) { toBottom(state, k); p.busy = false; log(`${p.name} joined the line`); }
      break;
    case "withCustomer":
      p.ups++; p.busy = true; p.since = Date.now(); toBottom(state, k);
      log(`${p.name} is with a customer`);
      break;
    case "missed":
      p.missed++; p.busy = false; toBottom(state, k);
      log(`${p.name} missed — to the bottom`);
      break;
    case "powerUp":
      p.sales++; p.busy = false; p.since = null;
      POWER_UP_TO === "top" ? toTop(state, k) : toBottom(state, k);
      log(`⚡ ${p.name} POWER UP — made a sale!`);
      break;
    case "free":
      p.busy = false; p.since = null;
      if (!inLine) toBottom(state, k);
      log(`${p.name} is free again`);
      break;
    case "leave":
      state.line = state.line.filter((x) => x !== k); p.busy = false; p.since = null;
      log(`${p.name} left the board`);
      break;
    case "moveUp":
    case "moveDown": {
      const i = state.line.indexOf(k);
      const j = action === "moveUp" ? i - 1 : i + 1;
      if (i >= 0 && j >= 0 && j < state.line.length) {
        [state.line[i], state.line[j]] = [state.line[j], state.line[i]];
        log(`${p.name} moved ${action === "moveUp" ? "up" : "down"}`);
      }
      break;
    }
    case "reset":
      Object.assign(state, empty());
      log(`Board reset`);
      break;
    default:
      throw new Error("Unknown action");
  }
  return state;
}

function view(state) {
  return { ...state, sharedStorage: !!REDIS_URL, pinRequired: !!STORE_PIN };
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const pin = String(req.headers["x-store-pin"] || "").trim();
    if (STORE_PIN && pin !== STORE_PIN) {
      return res.status(401).json({ error: "Wrong store PIN", pinRequired: true });
    }

    if (req.method === "GET") {
      if (cache.state && Date.now() - cache.at < CACHE_MS) return res.json(view(cache.state));
      const state = await load();
      cache = { at: Date.now(), state };
      return res.json(view(state));
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body || "{}");
      const action = String(body.action || "");
      const name = clean(body.name);
      const by = clean(body.by);
      if (action !== "reset" && !name) return res.status(400).json({ error: "Name required" });

      const state = await withLock(async () => {
        const s = apply(await load(), action, name, by);
        await save(s);
        return s;
      });
      cache = { at: Date.now(), state };
      return res.json(view(state));
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
};
