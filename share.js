/* Browser script of the share page (same origin, no inline script). The key never leaves memory. */
/* global window, document, location, fetch, atob, crypto, TextDecoder, TextEncoder, DOMParser, module */
"use strict";
// Frame-buster: a static host (GitHub Pages) cannot send frame-ancestors, so a framed copy hides itself and stops.
const FRAMED = typeof window !== "undefined" && window.top !== window.self;
if (FRAMED && typeof document !== "undefined" && document.body) document.body.style.display = "none";
// The API base comes from <meta name="steply-api"> (set by build.mjs); without it the page calls its own host at /api.
const API = (() => {
  if (typeof document === "undefined" || !document.querySelector) return "/api";
  const meta = document.querySelector('meta[name="steply-api"]');
  const v = meta && meta.getAttribute("content");
  return v ? v.replace(/\/+$/, "") : "/api";
})();

const COPY = {
  incomplete: "This link is not complete. Ask for it again.",
  ended: "This link has ended. Ask for a new one.",
  stopped: "This link was stopped by the person who sent it.",
  offline: "No internet.",
  tryAgain: "Try again",
  pageTitle: "{from} sent you {name}'s {routine} routine",
  pageTitleNoName: "{from} sent you the {routine} routine",
  fromTherapist: "From your therapist, {from}",
  getSteply: "Get Steply (free)",
  afterInstall: "After installing, tap the link again.",
  schoolTitle: "What {name} does at home today",
  yourChild: "your child",
  today: "Today",
  tomorrow: "Tomorrow",
  updated: "Updated today at {time}",
  updatedOn: "Updated {date}",
  stale: "This may be out of date.",
  changed: "Changed for today",
  print: "Print these cards",
  six: "6 per page",
  two: "2 per page",
  privacy: "A link sends a locked copy through our server. We can't open it. It is deleted when the link ends or you stop it.",
};
const STORES = {
  ios: "https://apps.apple.com/app/id6822341679",
  android: "https://play.google.com/store/apps/details?id=eu.nisico.steply",
};
const MAGIC_BLOB = "STEPLYL1";
const MAGIC_ENV = "STEPLYPK";
const B64URL = /^[A-Za-z0-9_-]+$/;

const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (v[k] === undefined ? "" : v[k]));

// ---------- decrypt (format 2 envelope; key never leaves memory) ----------
function b64(s) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const asText = (u8) => new TextDecoder().decode(u8);
const startsWith = (u8, s) => asText(u8.subarray(0, s.length)) === s;

function splitBlob(blob) {
  const head = MAGIC_BLOB.length;
  if (blob.length < head + 4 || !startsWith(blob, MAGIC_BLOB)) return null;
  const n = new DataView(blob.buffer, blob.byteOffset, blob.byteLength).getUint32(head, false);
  if (n < 1 || head + 4 + n > blob.length) return null;
  return blob.subarray(head + 4, head + 4 + n);
}

async function decryptEnvelope(env, passphrase) {
  const m = MAGIC_ENV.length;
  if (env.length < m + 4 || !startsWith(env, MAGIC_ENV)) throw new Error("envelope");
  const hl = new DataView(env.buffer, env.byteOffset, env.byteLength).getUint32(m, false);
  if (hl < 2 || m + 4 + hl > env.length) throw new Error("envelope");
  const headerBytes = env.subarray(m + 4, m + 4 + hl);
  const h = JSON.parse(asText(headerBytes));
  if (h.v !== 2 || !h.kdf || h.kdf.alg !== "pbkdf2-sha256" || h.cipher !== "aes-256-gcm") throw new Error("envelope");
  const iterations = Number(h.kdf.i);
  if (!Number.isInteger(iterations) || iterations < 1 || iterations > 2000000) throw new Error("envelope");
  const pw = new TextEncoder().encode(passphrase.normalize("NFKC"));
  const base = await crypto.subtle.importKey("raw", pw, "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: b64(h.kdf.salt), iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64(h.nonce), additionalData: headerBytes, tagLength: 128 },
    key,
    env.subarray(m + 4 + hl),
  );
  return new Uint8Array(plain);
}

async function openView(blob, key) {
  const env = splitBlob(blob);
  if (!env) throw new Error("blob");
  return JSON.parse(asText(await decryptEnvelope(env, key)));
}

// ---------- drawing helpers ----------
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_ELEMENTS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "defs", "linearGradient", "radialGradient", "stop", "clipPath", "title"]);
// Presentation and geometry attributes only. No href, no style, no on*, no xmlns, nothing with a namespace.
const SVG_ATTRS = new Set([
  "viewBox", "preserveAspectRatio", "id", "d", "points", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height", "transform",
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-dasharray", "stroke-dashoffset",
  "stroke-opacity", "opacity", "clip-path", "clip-rule", "clipPathUnits", "offset", "stop-color", "stop-opacity", "gradientUnits", "gradientTransform", "spreadMethod", "fx", "fy",
]);

/** Prunes an SVG tree in place to the allowlist. Works on any node with localName, namespaceURI, attributes, children, remove() and removeAttributeNode(). */
function sanitizeSvgTree(root) {
  const walk = (n) => {
    for (const c of Array.from(n.children)) {
      if (c.namespaceURI !== SVG_NS || !SVG_ELEMENTS.has(c.localName)) {
        c.remove();
        continue;
      }
      walk(c);
    }
    for (const a of Array.from(n.attributes)) {
      const v = String(a.value);
      const ok =
        !a.namespaceURI &&
        SVG_ATTRS.has(a.localName) &&
        !/^(on|href|xlink|xmlns|style)/i.test(a.localName) &&
        !/url\s*\(/i.test(v.replace(/url\(\s*#[A-Za-z0-9_-]+\s*\)/g, "")) &&
        !/[<>]|javascript:|data:/i.test(v) &&
        (a.localName !== "id" || /^[A-Za-z0-9_-]{1,64}$/.test(v));
      if (!ok) n.removeAttributeNode(a);
    }
  };
  if (root.namespaceURI !== SVG_NS || root.localName !== "svg") return false;
  walk(root);
  return true;
}

function cleanSvg(markup) {
  try {
    let src = String(markup);
    const open = /^\s*<svg\b[^>]*>/.exec(src);
    if (open && !/\sxmlns\s*=/.test(open[0])) src = src.replace(/^(\s*)<svg\b/, '$1<svg xmlns="http://www.w3.org/2000/svg"');
    const doc = new DOMParser().parseFromString(src, "image/svg+xml");
    const root = doc.documentElement;
    if (!root || doc.getElementsByTagName("parsererror").length || !sanitizeSvgTree(root)) return null;
    root.removeAttribute("width");
    root.removeAttribute("height");
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("focusable", "false");
    return document.importNode(root, true);
  } catch {
    return null;
  }
}

function stepCard(step) {
  const li = el("li", "card");
  const p = step.picture || {};
  let pic = null;
  if (typeof p.svg === "string") pic = cleanSvg(p.svg);
  else if (typeof p.photo === "string" && /^data:image\/(jpeg|png);base64,/.test(p.photo) && /^[A-Za-z0-9+/=]*$/.test(p.photo.slice(p.photo.indexOf(",") + 1))) {
    pic = el("img");
    pic.src = p.photo;
    pic.alt = "";
  }
  if (pic) {
    const box = el("div", "pic");
    box.appendChild(pic);
    li.appendChild(box);
    li.appendChild(el("div", "name", step.label));
  } else {
    li.classList.add("plain");
    li.appendChild(el("div", "name", step.label));
  }
  return li;
}

function cardList(routine) {
  const ul = el("ul", "cards");
  for (const s of routine.steps || []) ul.appendChild(stepCard(s));
  return ul;
}

/** 12-hour clock, as the app shows it (US): "7:30 PM". */
function clock12(h, min) {
  return ((h % 12) || 12) + ":" + String(min).padStart(2, "0") + (h < 12 ? " AM" : " PM");
}
function hm(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s || "");
  return m ? clock12(Number(m[1]), Number(m[2])) : "";
}
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function dateInWords(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return WEEKDAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
}

// ---------- pages ----------
function message(root, text, retry) {
  root.textContent = "";
  const box = el("div", "msg", text);
  box.setAttribute("role", "alert");
  root.appendChild(box);
  if (retry) {
    const b = el("button", "btn alt", COPY.tryAgain);
    b.type = "button";
    b.addEventListener("click", retry);
    root.appendChild(b);
  }
}

function privacyLine() {
  return el("p", "privacy", COPY.privacy);
}

function routineBody(root, view) {
  const r = (view.routines || [])[0];
  if (!r) return message(root, COPY.incomplete);
  document.title = r.title;
  root.textContent = "";
  const from = view.fromName;
  if (from && view.sender === "therapist") root.appendChild(el("p", "lead", fill(COPY.fromTherapist, { from })));
  const who = from || "You were";
  let title;
  if (!from) title = view.forName ? "You were sent " + view.forName + "'s " + r.title + " routine" : "You were sent the " + r.title + " routine";
  else title = fill(view.forName ? COPY.pageTitle : COPY.pageTitleNoName, { from, name: view.forName || "", routine: r.title });
  void who;
  root.appendChild(el("h1", "", title));
  root.appendChild(cardList(r));
  const get = el("section", "get");
  get.appendChild(el("h2", "", COPY.getSteply));
  const row = el("div", "stores");
  for (const [label, href] of [["App Store", STORES.ios], ["Google Play", STORES.android]]) {
    const a = el("a", "btn", label);
    a.href = href;
    a.rel = "noopener noreferrer";
    row.appendChild(a);
  }
  get.appendChild(row);
  get.appendChild(el("p", "", COPY.afterInstall));
  root.appendChild(get);
  root.appendChild(privacyLine());
}

function schoolBody(root, view) {
  const days = view.days || [];
  if (days.length === 0) return message(root, COPY.incomplete);
  root.textContent = "";
  const title = fill(COPY.schoolTitle, { name: view.forName || COPY.yourChild });
  document.title = title;
  root.appendChild(el("h1", "", title));
  root.appendChild(el("p", "lead", dateInWords(days[0].date)));
  const sent = new Date(view.sentAt);
  if (!isNaN(sent)) {
    const now = new Date();
    const same = sent.toDateString() === now.toDateString();
    const hh = clock12(sent.getHours(), sent.getMinutes());
    let line = same ? fill(COPY.updated, { time: hh }) : fill(COPY.updatedOn, { date: sent.getDate() + " " + MONTHS[sent.getMonth()] });
    const stale = now - sent > 7 * 86400000;
    if (stale) line += ". " + COPY.stale;
    root.appendChild(el("p", stale ? "fresh stale" : "fresh", line));
  }
  const tabs = el("div");
  tabs.setAttribute("role", "tablist");
  root.appendChild(tabs);
  const panels = [];
  const names = [COPY.today, COPY.tomorrow];
  days.slice(0, 2).forEach((day, i) => {
    const t = el("button", "", names[i]);
    t.type = "button";
    t.setAttribute("role", "tab");
    t.id = "tab" + i;
    t.setAttribute("aria-controls", "panel" + i);
    tabs.appendChild(t);
    const panel = el("section", "panel");
    panel.id = "panel" + i;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", t.id);
    for (const r of day.routines || []) {
      const h = el("h2", "rtitle", r.title);
      if (r.changedToday) h.appendChild(el("span", "tag", COPY.changed));
      panel.appendChild(h);
      if (r.time) panel.appendChild(el("p", "time", hm(r.time) + (r.until ? "–" + hm(r.until) : "")));
      panel.appendChild(cardList(r));
    }
    root.appendChild(panel);
    panels.push({ t, panel });
  });
  const select = (n) => panels.forEach((p, i) => {
    p.t.setAttribute("aria-selected", i === n ? "true" : "false");
    p.t.tabIndex = i === n ? 0 : -1;
    p.panel.hidden = i !== n;
  });
  panels.forEach((p, i) => {
    p.t.addEventListener("click", () => select(i));
    p.t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const n = (i + 1) % panels.length;
        select(n);
        panels[n].t.focus();
      }
    });
  });
  select(0);

  const pr = el("section", "print");
  const mk = (value, text, checked) => {
    const l = el("label");
    const inp = el("input");
    inp.type = "radio";
    inp.name = "pp";
    inp.value = value;
    inp.checked = checked;
    inp.addEventListener("change", () => {
      document.body.classList.remove("pp6", "pp2");
      document.body.classList.add("pp" + value);
    });
    l.appendChild(inp);
    l.appendChild(document.createTextNode(text));
    return l;
  };
  document.body.classList.add("pp6");
  pr.appendChild(mk("6", COPY.six, true));
  pr.appendChild(mk("2", COPY.two, false));
  const pb = el("button", "btn", COPY.print);
  pb.type = "button";
  pb.addEventListener("click", () => window.print());
  pr.appendChild(pb);
  root.appendChild(pr);
  root.appendChild(privacyLine());
}

async function run() {
  const root = document.getElementById("app");
  const m = /^\/([rs])\/([A-Za-z0-9_-]{22})\/?$/.exec(location.pathname);
  const key = location.hash.slice(1);
  if (!m || key.length !== 43 || !B64URL.test(key)) return message(root, COPY.incomplete);
  let res;
  try {
    res = await fetch(API + "/share/" + m[2], { referrerPolicy: "no-referrer", credentials: "omit", cache: "no-store" });
  } catch {
    return message(root, COPY.offline, run);
  }
  if (res.status === 404) return message(root, COPY.ended);
  if (res.status === 410) {
    // The server answers 410 only for a stopped link: {"error":{"code":"stopped"}}.
    let stopped = true;
    try { const j = await res.json(); stopped = !j || !j.error || j.error.code === "stopped"; } catch { /* 410 alone means stopped */ }
    return message(root, stopped ? COPY.stopped : COPY.ended);
  }
  if (!res.ok) return message(root, COPY.offline, run);
  let view;
  try {
    view = await openView(new Uint8Array(await res.arrayBuffer()), key);
  } catch {
    return message(root, COPY.incomplete);
  }
  if (!view || view.v !== 1) return message(root, COPY.incomplete);
  if (view.kind === "school" && m[1] === "s") schoolBody(root, view);
  else if (view.kind === "routine" && m[1] === "r") routineBody(root, view);
  else message(root, COPY.incomplete);
}

if (typeof document !== "undefined" && !FRAMED) run();
if (typeof module !== "undefined") module.exports = { sanitizeSvgTree, SVG_NS };
