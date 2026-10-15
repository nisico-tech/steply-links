<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="2775.1">
  <style type="text/css">
    body {background-color: #0f1421}
    p.p1 {margin: 0.0px 0.0px 0.0px 0.0px; font: 18.0px 'Helvetica Neue'; color: #ecf1f7; -webkit-text-stroke: #ecf1f7}
    p.p2 {margin: 0.0px 0.0px 0.0px 0.0px; font: 18.0px 'Helvetica Neue'; color: #ecf1f7; -webkit-text-stroke: #ecf1f7; min-height: 22.0px}
    span.s1 {font-kerning: none}
  </style>
</head>
<body>
<p class="p1"><span class="s1">/* Browser script of the share page (same origin, no inline script). The key never leaves memory. */</span></p>
<p class="p1"><span class="s1">/* global window, document, location, navigator, fetch, atob, crypto, TextDecoder, TextEncoder, DOMParser, module */</span></p>
<p class="p1"><span class="s1">"use strict";</span></p>
<p class="p1"><span class="s1">// Frame-buster: a static host (GitHub Pages) cannot send frame-ancestors, so a framed copy hides itself and stops.</span></p>
<p class="p1"><span class="s1">const FRAMED = typeof window !== "undefined" &amp;&amp; window.top !== window.self;</span></p>
<p class="p1"><span class="s1">if (FRAMED &amp;&amp; typeof document !== "undefined" &amp;&amp; document.body) document.body.style.display = "none";</span></p>
<p class="p1"><span class="s1">// The API base comes from &lt;meta name="steply-api"&gt; (set by build.mjs); without it the page calls its own host at /api.</span></p>
<p class="p1"><span class="s1">const API = (() =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (typeof document === "undefined" || !document.querySelector) return "/api";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const meta = document.querySelector('meta[name="steply-api"]');</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const v = meta &amp;&amp; meta.getAttribute("content");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return v ? v.replace(/\/+$/, "") : "/api";</span></p>
<p class="p1"><span class="s1">})();</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">const COPY = {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>incomplete: "This link is not complete. Ask for it again.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>ended: "This link has ended. Ask for a new one.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>stopped: "This link was stopped by the person who sent it.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>offline: "No internet.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>tryAgain: "Try again",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>pageTitle: "{from} sent you {name}'s {routine} routine",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>pageTitleNoName: "{from} sent you the {routine} routine",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>fromTherapist: "From your therapist, {from}",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>getSteply: "Get Steply (free)",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>afterInstall: "After installing, tap the link again.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>schoolTitle: "What {name} does at home today",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>yourChild: "your child",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>today: "Today",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>tomorrow: "Tomorrow",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>updated: "Updated today at {time}",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>updatedOn: "Updated {date}",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>stale: "This may be out of date.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>changed: "Changed for today",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>print: "Print these cards",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>six: "6 per page",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>two: "2 per page",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>playerOpen: "Do it here, no app needed",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>stepOf: "Step {n} of {total}",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>done: "Done",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>back: "Back",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>close: "Close",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>readIt: "Read it",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>allDone: "All done!",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>again: "Do it again",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>toCards: "Back to the cards",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>withApp: "With the app: timers, sounds and stars.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>landingTitle: "Steply",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>landingLine: "Visual routines for kids, with picture cards. Free.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>landingAlso: "Also for grown-ups who want their own day in pictures.",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>forGrownUps: "For grown-ups",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>privacy: "A link sends a locked copy through our server. We can't open it. It is deleted when the link ends or you stop it.",</span></p>
<p class="p1"><span class="s1">};</span></p>
<p class="p1"><span class="s1">const STORES = {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>ios: "https://apps.apple.com/app/id6822341679",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>android: "https://play.google.com/store/apps/details?id=eu.nisico.steply",</span></p>
<p class="p1"><span class="s1">};</span></p>
<p class="p1"><span class="s1">const MAGIC_BLOB = "STEPLYL1";</span></p>
<p class="p1"><span class="s1">const MAGIC_ENV = "STEPLYPK";</span></p>
<p class="p1"><span class="s1">const B64URL = /^[A-Za-z0-9_-]+$/;</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">const fill = (s, v) =&gt; s.replace(/\{(\w+)\}/g, (_, k) =&gt; (v[k] === undefined ? "" : v[k]));</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">// ---------- decrypt (format 2 envelope; key never leaves memory) ----------</span></p>
<p class="p1"><span class="s1">function b64(s) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const out = new Uint8Array(bin.length);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>for (let i = 0; i &lt; bin.length; i++) out[i] = bin.charCodeAt(i);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return out;</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p1"><span class="s1">const asText = (u8) =&gt; new TextDecoder().decode(u8);</span></p>
<p class="p1"><span class="s1">const startsWith = (u8, s) =&gt; asText(u8.subarray(0, s.length)) === s;</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function splitBlob(blob) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const head = MAGIC_BLOB.length;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (blob.length &lt; head + 4 || !startsWith(blob, MAGIC_BLOB)) return null;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const n = new DataView(blob.buffer, blob.byteOffset, blob.byteLength).getUint32(head, false);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (n &lt; 1 || head + 4 + n &gt; blob.length) return null;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return blob.subarray(head + 4, head + 4 + n);</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">async function decryptEnvelope(env, passphrase) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const m = MAGIC_ENV.length;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (env.length &lt; m + 4 || !startsWith(env, MAGIC_ENV)) throw new Error("envelope");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const hl = new DataView(env.buffer, env.byteOffset, env.byteLength).getUint32(m, false);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (hl &lt; 2 || m + 4 + hl &gt; env.length) throw new Error("envelope");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const headerBytes = env.subarray(m + 4, m + 4 + hl);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const h = JSON.parse(asText(headerBytes));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (h.v !== 2 || !h.kdf || h.kdf.alg !== "pbkdf2-sha256" || h.cipher !== "aes-256-gcm") throw new Error("envelope");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const iterations = Number(h.kdf.i);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!Number.isInteger(iterations) || iterations &lt; 1 || iterations &gt; 2000000) throw new Error("envelope");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const pw = new TextEncoder().encode(passphrase.normalize("NFKC"));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const base = await crypto.subtle.importKey("raw", pw, "PBKDF2", false, ["deriveKey"]);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const key = await crypto.subtle.deriveKey(</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>{ name: "PBKDF2", hash: "SHA-256", salt: b64(h.kdf.salt), iterations },</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>base,</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>{ name: "AES-GCM", length: 256 },</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>false,</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>["decrypt"],</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const plain = await crypto.subtle.decrypt(</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>{ name: "AES-GCM", iv: b64(h.nonce), additionalData: headerBytes, tagLength: 128 },</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>key,</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>env.subarray(m + 4 + hl),</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return new Uint8Array(plain);</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">async function openView(blob, key) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const env = splitBlob(blob);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!env) throw new Error("blob");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return JSON.parse(asText(await decryptEnvelope(env, key)));</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">// ---------- drawing helpers ----------</span></p>
<p class="p1"><span class="s1">function el(tag, cls, text) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const e = document.createElement(tag);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (cls) e.className = cls;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (text !== undefined) e.textContent = text;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return e;</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">const SVG_NS = "http://www.w3.org/2000/svg";</span></p>
<p class="p1"><span class="s1">const SVG_ELEMENTS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "defs", "linearGradient", "radialGradient", "stop", "clipPath", "title"]);</span></p>
<p class="p1"><span class="s1">// Presentation and geometry attributes only. No href, no style, no on*, no xmlns, nothing with a namespace.</span></p>
<p class="p1"><span class="s1">const SVG_ATTRS = new Set([</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>"viewBox", "preserveAspectRatio", "id", "d", "points", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height", "transform",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>"fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-dasharray", "stroke-dashoffset",</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>"stroke-opacity", "opacity", "clip-path", "clip-rule", "clipPathUnits", "offset", "stop-color", "stop-opacity", "gradientUnits", "gradientTransform", "spreadMethod", "fx", "fy",</span></p>
<p class="p1"><span class="s1">]);</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">/** Prunes an SVG tree in place to the allowlist. Works on any node with localName, namespaceURI, attributes, children, remove() and removeAttributeNode(). */</span></p>
<p class="p1"><span class="s1">function sanitizeSvgTree(root) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const walk = (n) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for (const c of Array.from(n.children)) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>if (c.namespaceURI !== SVG_NS || !SVG_ELEMENTS.has(c.localName)) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>c.remove();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>continue;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>walk(c);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for (const a of Array.from(n.attributes)) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>const v = String(a.value);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>const ok =</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>!a.namespaceURI &amp;&amp;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>SVG_ATTRS.has(a.localName) &amp;&amp;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>!/^(on|href|xlink|xmlns|style)/i.test(a.localName) &amp;&amp;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>!/url\s*\(/i.test(v.replace(/url\(\s*#[A-Za-z0-9_-]+\s*\)/g, "")) &amp;&amp;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>!/[&lt;&gt;]|javascript:|data:/i.test(v) &amp;&amp;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>(a.localName !== "id" || /^[A-Za-z0-9_-]{1,64}$/.test(v));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>if (!ok) n.removeAttributeNode(a);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>};</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (root.namespaceURI !== SVG_NS || root.localName !== "svg") return false;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>walk(root);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return true;</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function cleanSvg(markup) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>try {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>let src = String(markup);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const open = /^\s*&lt;svg\b[^&gt;]*&gt;/.exec(src);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (open &amp;&amp; !/\sxmlns\s*=/.test(open[0])) src = src.replace(/^(\s*)&lt;svg\b/, '$1&lt;svg xmlns="http://www.w3.org/2000/svg"');</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const doc = new DOMParser().parseFromString(src, "image/svg+xml");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const root = doc.documentElement;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (!root || doc.getElementsByTagName("parsererror").length || !sanitizeSvgTree(root)) return null;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.removeAttribute("width");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.removeAttribute("height");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.setAttribute("aria-hidden", "true");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.setAttribute("focusable", "false");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return document.importNode(root, true);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>} catch {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return null;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">/** The step's picture (a cleaned drawing or a checked photo), or null. */</span></p>
<p class="p1"><span class="s1">function pictureOf(step) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const p = step.picture || {};</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (typeof p.svg === "string") return cleanSvg(p.svg);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (typeof p.photo === "string" &amp;&amp; /^data:image\/(jpeg|png);base64,/.test(p.photo) &amp;&amp; /^[A-Za-z0-9+/=]*$/.test(p.photo.slice(p.photo.indexOf(",") + 1))) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const img = el("img");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>img.src = p.photo;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>img.alt = "";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return img;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return null;</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">// DESIGN-63b: the step at index i sits on the pastel ground i mod 6, as in the app.</span></p>
<p class="p1"><span class="s1">function stepCard(step, i) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const li = el("li", "card p" + (i % 6));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const pic = pictureOf(step);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (pic) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const box = el("div", "pic");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>box.appendChild(pic);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>li.appendChild(box);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>li.appendChild(el("div", "name", step.label));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>} else {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>li.classList.add("plain");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>li.appendChild(el("div", "name", step.label));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return li;</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function cardList(routine) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const ul = el("ul", "cards");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>(routine.steps || []).forEach((s, i) =&gt; ul.appendChild(stepCard(s, i)));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return ul;</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">/** 12-hour clock, as the app shows it (US): "7:30 PM". */</span></p>
<p class="p1"><span class="s1">function clock12(h, min) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return ((h % 12) || 12) + ":" + String(min).padStart(2, "0") + (h &lt; 12 ? " AM" : " PM");</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p1"><span class="s1">function hm(s) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const m = /^(\d{1,2}):(\d{2})$/.exec(s || "");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return m ? clock12(Number(m[1]), Number(m[2])) : "";</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p1"><span class="s1">const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];</span></p>
<p class="p1"><span class="s1">const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];</span></p>
<p class="p1"><span class="s1">function dateInWords(iso) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!m) return "";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return WEEKDAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">// ---------- pages ----------</span></p>
<p class="p1"><span class="s1">function message(root, text, retry) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.textContent = "";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const box = el("div", "msg", text);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>box.setAttribute("role", "alert");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(box);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (retry) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const b = el("button", "btn alt", COPY.tryAgain);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>b.type = "button";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>b.addEventListener("click", retry);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.appendChild(b);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function privacyLine() {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return el("p", "privacy", COPY.privacy);</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">// `quiet`: the stores as text links (All done: never buttons a child could take for "Do it again").</span></p>
<p class="p1"><span class="s1">function storeRow(quiet) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const row = el("div", "stores");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>for (const [label, href] of [["App Store", STORES.ios], ["Google Play", STORES.android]]) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const a = el("a", quiet ? "link" : "btn", label);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>a.href = href;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>a.rel = "noopener noreferrer";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>row.appendChild(a);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return row;</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">// The bare site root (no link in it) is a plain "Get Steply" page, not an error.</span></p>
<p class="p1"><span class="s1">function landing(root) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.textContent = "";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const cards = el("div", "welcome");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>cards.setAttribute("aria-hidden", "true");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>for (let i = 0; i &lt; 3; i++) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const c = el("div", "wcard");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>c.appendChild(el("span"));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>cards.appendChild(c);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(cards);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(el("h1", "", COPY.landingTitle));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(el("p", "lead", COPY.landingLine));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(storeRow());</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(el("p", "lead", COPY.landingAlso));</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function routineBody(root, view) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const r = (view.routines || [])[0];</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!r) return message(root, COPY.incomplete);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>document.title = r.title;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.textContent = "";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const from = view.fromName;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (from &amp;&amp; view.sender === "therapist") root.appendChild(el("p", "lead", fill(COPY.fromTherapist, { from })));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const who = from || "You were";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>let title;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!from) title = view.forName ? "You were sent " + view.forName + "'s " + r.title + " routine" : "You were sent the " + r.title + " routine";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>else title = fill(view.forName ? COPY.pageTitle : COPY.pageTitleNoName, { from, name: view.forName || "", routine: r.title });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>void who;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(el("h1", "", title));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const go = el("button", "btn big", COPY.playerOpen);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>go.type = "button";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>go.addEventListener("click", () =&gt; player(root, r, () =&gt; routineBody(root, view)));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(go);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(cardList(r));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const get = el("section", "get");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>get.appendChild(el("h2", "", COPY.getSteply));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>get.appendChild(storeRow());</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>get.appendChild(el("p", "", COPY.afterInstall));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(get);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(privacyLine());</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">// ---------- step by step in the browser (F-1719..F-1722) ----------</span></p>
<p class="p1"><span class="s1">/** Same rules as playerStateV63 (src/contracts/share-player-v63.ts). */</span></p>
<p class="p1"><span class="s1">function nextState(s, action) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (action === "again") return { at: 0, total: s.total };</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (action === "back") return { at: Math.max(0, Math.min(s.at, s.total) - 1), total: s.total };</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return { at: Math.min(s.total, s.at + 1), total: s.total };</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function canSpeak() {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return typeof window !== "undefined" &amp;&amp; "speechSynthesis" in window &amp;&amp; typeof window.SpeechSynthesisUtterance === "function";</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function button(cls, text, onClick) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const b = el("button", cls, text);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>b.type = "button";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>b.addEventListener("click", onClick);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>return b;</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function player(root, routine, leave) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const steps = routine.steps || [];</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>let state = { at: 0, total: steps.length };</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>let lock = null;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const keepOn = () =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>try {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>if (typeof navigator !== "undefined" &amp;&amp; navigator.wakeLock &amp;&amp; !lock) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>navigator.wakeLock.request("screen").then((l) =&gt; { lock = l; }, () =&gt; {});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>} catch { /* not allowed here */ }</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>};</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const letGo = () =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (lock) lock.release().catch(() =&gt; {});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>lock = null;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (canSpeak()) window.speechSynthesis.cancel();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>};</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const exit = () =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>letGo();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>leave();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>};</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const act = (a) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>state = nextState(state, a);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>render();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>};</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>function render() {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.textContent = "";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const box = el("div", "player");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (state.at &gt;= state.total) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>letGo();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.classList.add("end");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(el("div", "star", "\u2605"));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(el("h1", "", COPY.allDone));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(el("p", "lead", routine.title));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>const done = el("ul", "donetiles");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>done.setAttribute("aria-hidden", "true");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>for (let i = 0; i &lt; Math.min(steps.length, 12); i++) done.appendChild(el("li"));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(done);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(button("btn big", COPY.again, () =&gt; { keepOn(); act("again"); }));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(button("btn alt", COPY.toCards, exit));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>// At least 40 px lower, under a rule: for grown-ups, the stores as text links (I5-PC-G1: 03, 06).</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>const get = el("section", "grown");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>get.appendChild(el("p", "eyebrow", COPY.forGrownUps));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>get.appendChild(el("h2", "", COPY.getSteply));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>get.appendChild(el("p", "", COPY.withApp));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>get.appendChild(storeRow(true));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(get);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>root.appendChild(box);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>return;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const step = steps[state.at];</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const top = el("div", "ptop");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>top.appendChild(el("span", "pcount", fill(COPY.stepOf, { n: String(state.at + 1), total: String(state.total) })));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>// "Read it" sits up here, away from Done (I5-PC-G2: 03, 05); only where the browser can speak.</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const acts = el("div", "pacts");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (canSpeak()) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>acts.appendChild(button("link", COPY.readIt, () =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>const u = new window.SpeechSynthesisUtterance(step.label);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>u.lang = "en-US";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>window.speechSynthesis.cancel();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>window.speechSynthesis.speak(u);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>}));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>acts.appendChild(button("link ink", COPY.close, exit));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>top.appendChild(acts);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>box.appendChild(top);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const dots = el("div", "dots");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>dots.setAttribute("aria-hidden", "true");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for (let i = 0; i &lt; state.total; i++) dots.appendChild(el("span", i &lt; state.at ? "dot on" : i === state.at ? "dot now" : "dot"));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>box.appendChild(dots);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const pic = pictureOf(step);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (pic) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>const p = el("div", "ppic p" + (state.at % 6));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>p.appendChild(pic);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(p);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>box.appendChild(el("div", pic ? "pname" : "pname plain", step.label));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>box.appendChild(button("btn done", COPY.done, () =&gt; act("done")));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (state.at &gt; 0) box.appendChild(button("link", COPY.back, () =&gt; act("back")));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.appendChild(box);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>keepOn();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>render();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (typeof window !== "undefined" &amp;&amp; window.scrollTo) window.scrollTo(0, 0);</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">function schoolBody(root, view) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const days = view.days || [];</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (days.length === 0) return message(root, COPY.incomplete);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.textContent = "";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const title = fill(COPY.schoolTitle, { name: view.forName || COPY.yourChild });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>document.title = title;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(el("h1", "", title));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(el("p", "lead", dateInWords(days[0].date)));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const sent = new Date(view.sentAt);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!isNaN(sent)) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const now = new Date();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const same = sent.toDateString() === now.toDateString();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const hh = clock12(sent.getHours(), sent.getMinutes());</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>let line = same ? fill(COPY.updated, { time: hh }) : fill(COPY.updatedOn, { date: sent.getDate() + " " + MONTHS[sent.getMonth()] });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const stale = now - sent &gt; 7 * 86400000;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>if (stale) line += ". " + COPY.stale;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.appendChild(el("p", stale ? "fresh stale" : "fresh", line));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const tabs = el("div");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>tabs.setAttribute("role", "tablist");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(tabs);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const panels = [];</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const names = [COPY.today, COPY.tomorrow];</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>days.slice(0, 2).forEach((day, i) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const t = el("button", "", names[i]);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>t.type = "button";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>t.setAttribute("role", "tab");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>t.id = "tab" + i;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>t.setAttribute("aria-controls", "panel" + i);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>tabs.appendChild(t);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const panel = el("section", "panel");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>panel.id = "panel" + i;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>panel.setAttribute("role", "tabpanel");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>panel.setAttribute("aria-labelledby", t.id);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>for (const r of day.routines || []) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>// DESIGN-63b: each routine is a card: its time, its name, then its steps as a row of labelled tiles.</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>const box = el("div", "rcard");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>if (r.time) box.appendChild(el("p", "time", hm(r.time) + (r.until ? " to " + hm(r.until) : "")));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>const h = el("h2", "rtitle", r.title);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>if (r.changedToday) h.appendChild(el("span", "tag", COPY.changed));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(h);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>box.appendChild(cardList(r));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>panel.appendChild(box);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>root.appendChild(panel);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>panels.push({ t, panel });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const select = (n) =&gt; panels.forEach((p, i) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>p.t.setAttribute("aria-selected", i === n ? "true" : "false");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>p.t.tabIndex = i === n ? 0 : -1;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>p.panel.hidden = i !== n;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>panels.forEach((p, i) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>p.t.addEventListener("click", () =&gt; select(i));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>p.t.addEventListener("keydown", (e) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>if (e.key === "ArrowRight" || e.key === "ArrowLeft") {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>const n = (i + 1) % panels.length;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>select(n);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">        </span>panels[n].t.focus();</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>select(0);</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const pr = el("section", "print");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const mk = (value, text, checked) =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const l = el("label");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>const inp = el("input");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>inp.type = "radio";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>inp.name = "pp";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>inp.value = value;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>inp.checked = checked;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>inp.addEventListener("change", () =&gt; {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>document.body.classList.remove("pp6", "pp2");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">      </span>document.body.classList.add("pp" + value);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>});</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>l.appendChild(inp);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>l.appendChild(document.createTextNode(text));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return l;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>};</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>document.body.classList.add("pp6");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>pr.appendChild(mk("6", COPY.six, true));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>pr.appendChild(mk("2", COPY.two, false));</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const pb = el("button", "btn", COPY.print);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>pb.type = "button";</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>pb.addEventListener("click", () =&gt; window.print());</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>pr.appendChild(pb);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(pr);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>root.appendChild(privacyLine());</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">async function run() {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const root = document.getElementById("app");</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const m = /^\/([rs])\/([A-Za-z0-9_-]{22})\/?$/.exec(location.pathname);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>const key = location.hash.slice(1);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (/^\/(index\.html)?$/.test(location.pathname) &amp;&amp; !key) return landing(root);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!m || key.length !== 43 || !B64URL.test(key)) return message(root, COPY.incomplete);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>let res;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>try {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>res = await fetch(API + "/share/" + m[2], { referrerPolicy: "no-referrer", credentials: "omit", cache: "no-store" });</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>} catch {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return message(root, COPY.offline, run);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (res.status === 404) return message(root, COPY.ended);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (res.status === 410) {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>// The server answers 410 only for a stopped link: {"error":{"code":"stopped"}}.</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>let stopped = true;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>try { const j = await res.json(); stopped = !j || !j.error || j.error.code === "stopped"; } catch { /* 410 alone means stopped */ }</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return message(root, stopped ? COPY.stopped : COPY.ended);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!res.ok) return message(root, COPY.offline, run);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>let view;</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>try {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>view = await openView(new Uint8Array(await res.arrayBuffer()), key);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>} catch {</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">    </span>return message(root, COPY.incomplete);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>}</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (!view || view.v !== 1) return message(root, COPY.incomplete);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>if (view.kind === "school" &amp;&amp; m[1] === "s") schoolBody(root, view);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>else if (view.kind === "routine" &amp;&amp; m[1] === "r") routineBody(root, view);</span></p>
<p class="p1"><span class="s1"><span class="Apple-converted-space">  </span>else message(root, COPY.incomplete);</span></p>
<p class="p1"><span class="s1">}</span></p>
<p class="p2"><span class="s1"></span><br></p>
<p class="p1"><span class="s1">if (typeof document !== "undefined" &amp;&amp; !FRAMED) run();</span></p>
<p class="p1"><span class="s1">if (typeof module !== "undefined") module.exports = { sanitizeSvgTree, SVG_NS };</span></p>
</body>
</html>
