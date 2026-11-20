/*
 * 弹雨 — a small vertical danmaku shooter for OpenChamber.
 *
 * Basic rules: move, auto-fire, dodge. Seven distinct enemy kinds, three upgrade
 * tracks (rate / damage / streams), a boss every fourth wave, and a scrolling
 * multi-layer backdrop that changes zone every four waves.
 *
 * Rebuilt from the served bundle after the extension folder was removed.
 */

import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';

var host = connectHost();
var TAU = Math.PI * 2;
var C = {
  void: "#05070b",
  bone: "#e9e5d8",
  dim: "rgba(233, 229, 216, 0.42)",
  heat: "#ffb45e",
  hot: "#ffc98a",
  cold: "#86d9ff",
  hurt: "#ff5f6d"
};
var WORLD_H = 780;
var BEST_KEY = "bullet-rain:best";
var LIVES = 3;
var PARAMS = new URLSearchParams(window.location.search);
var AUTOPILOT = PARAMS.has("auto");
var SPEED = Math.max(1, Math.min(10, Number(PARAMS.get("speed")) || 1));
var START_WAVE = Math.max(1, Math.min(20, Number(PARAMS.get("wave")) || 1));
var SIM = Math.max(1, Math.min(900, Number(PARAMS.get("sim")) || 1));
var TIMERS = PARAMS.has("timers");
var DBG = PARAMS.has("dbg");
var STEPS = Math.max(0, Math.min(2e5, Number(PARAMS.get("steps")) || 0));
var GOD = PARAMS.has("god");
var clamp = (v2, min, max) => Math.max(min, Math.min(max, v2));
var rand = (min, max) => min + Math.random() * (max - min);
function hexToRgb(hex) {
  const v2 = parseInt(hex.slice(1), 16);
  return [v2 >> 16 & 255, v2 >> 8 & 255, v2 & 255];
}
function tint(hex, a) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
var rgba = (hue, a) => `rgba(${hue[0]}, ${hue[1]}, ${hue[2]}, ${a})`;
var $ = (id) => document.getElementById(id);
var stage = $("stage");
var canvas = $("play");
var ctx = canvas.getContext("2d", { alpha: false });
var scoreEl = $("score");
var bestEl = $("best");
var chainEl = $("chain");
var livesEl = $("lives");
var waveEl = $("wave");
var grazeEl = $("graze");
var powerEl = $("power");
var buffsEl = $("buffs");
var hpEl = $("hp");
var hpNum = $("hp-num");
var meterRate = $("meter-rate");
var meterDmg = $("meter-dmg");
var meterStream = $("meter-stream");
var bossbar = $("bossbar");
var bossname = $("bossname");
var bosshp = $("bosshp");
var gate = $("gate");
var gateKicker = $("gate-kicker");
var gateTitle = $("gate-title");
var gateText = $("gate-text");
var gateActions = $("gate-actions");
var upgradeEl = $("upgrade");
var upgradeOptions = $("up-options");
var loadingEl = $("loading");
var pauseBtn = $("pause");
var soundBtn = $("sound");
var tipEl = $("tip");
if (DBG) {
  const report = (text) => {
    let box = document.getElementById("err");
    if (!box) {
      box = document.createElement("pre");
      box.id = "err";
      box.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:99;margin:0;padding:8px;background:#300;color:#fff;font:12px monospace;white-space:pre-wrap";
      document.body.append(box);
    }
    box.textContent += `${text}
`;
  };
  window.addEventListener("error", (event) => report(`ERR ${event.message} @ ${event.filename}:${event.lineno}`));
  window.addEventListener("unhandledrejection", (event) => report(`REJ ${String(event.reason)}`));
  window.__report = report;
}
var best = readLocalBest();
function readLocalBest() {
  try {
    const raw = window.localStorage.getItem(BEST_KEY);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}
function persistBest() {
  try {
    window.localStorage.setItem(BEST_KEY, String(best));
  } catch {
  }
  try {
    void host.storage.set(BEST_KEY, best).catch(() => void 0);
  } catch {
  }
}
async function loadBest() {
  try {
    const stored = await host.storage.get(BEST_KEY);
    if (typeof stored === "number" && Number.isFinite(stored) && stored > best) best = Math.floor(stored);
  } catch {
  }
  bestEl.textContent = format(best);
}
var state = {
  mode: "menu",
  // menu | playing | paused | upgrade | over
  scale: 1,
  dpr: 1,
  w: 420,
  h: WORLD_H,
  time: 0,
  score: 0,
  chain: 1,
  chainTimer: 0,
  graze: 0,
  lives: LIVES,
  wave: 0,
  zone: 0,
  invuln: 0,
  shake: 0,
  flash: 0,
  slow: 0,
  banner: null,
  boss: null,
  waveBudget: 0,
  spawnTimer: 0,
  waveQuiet: 0,
  bossPending: false,
  pressure: 0.5,
  heavyCount: 0,
  splitCount: 0,
  wallCount: 0,
  fireTimer: 0,
  threats: 0,
  threatTimer: 0,
  shield: 0,
  buff: { over: 0, slow: 0 },
  up: { rate: 0, dmg: 0, stream: 0 },
  tipShown: false,
  tipTimer: 0,
  resizes: 0,
  draws: 0
};
var player = { x: 0, y: 0, r: 4.2, focus: false, alive: true };
var keys = /* @__PURE__ */ new Set();
var pointerDown = false;
var moveTarget = { x: 0, y: 0 };
var enemies = [];
var ebullets = [];
var pbullets = [];
var particles = [];
var popups = [];
var drops = [];
var ZONES = [
  {
    name: "\u6DF1\u7A7A",
    code: "VOID",
    top: "#060810",
    mid: "#080c15",
    bottom: "#04060a",
    hue: [96, 132, 184],
    accent: "#86d9ff",
    dust: 0.14
  },
  {
    name: "\u4F59\u70EC",
    code: "EMBER",
    top: "#0a0605",
    mid: "#110907",
    bottom: "#050304",
    hue: [168, 88, 48],
    accent: "#ffb45e",
    dust: 0.18
  },
  {
    name: "\u51B0\u539F",
    code: "RIME",
    top: "#05080c",
    mid: "#0a1217",
    bottom: "#04070a",
    hue: [116, 172, 194],
    accent: "#d6f2f7",
    dust: 0.12
  },
  {
    name: "\u8D64\u6F6E",
    code: "BLOOM",
    top: "#0b0508",
    mid: "#160810",
    bottom: "#070306",
    hue: [186, 62, 96],
    accent: "#ff7d92",
    dust: 0.17
  }
];
var backdrop = {
  zone: -1,
  scroll: 0,
  nebula: null,
  sky: null,
  vignette: null,
  stars: [],
  debris: [],
  dust: [],
  planet: null
};
function makeStars() {
  const count = Math.round(state.w * state.h / 4200);
  const stars = [];
  for (let i = 0; i < count; i += 1) {
    const depth = Math.random();
    stars.push({
      x: rand(0, state.w),
      y: rand(0, state.h),
      r: depth > 0.9 ? rand(1.3, 2.1) : rand(0.5, 1.1),
      v: 16 + depth * 82,
      a: 0.14 + depth * 0.55,
      layer: depth
    });
  }
  return stars;
}
function makeDebris(z) {
  const debris = [];
  const count = 9 + Math.round(state.w / 90);
  for (let i = 0; i < count; i += 1) {
    const pts = [];
    const n = 5 + Math.floor(Math.random() * 3);
    for (let k = 0; k < n; k += 1) {
      pts.push({ a: k / n * TAU + rand(-0.14, 0.14), d: rand(0.62, 1) });
    }
    debris.push({
      x: rand(0, state.w),
      y: rand(0, state.h),
      r: rand(6, 24),
      rot: rand(0, TAU),
      vr: rand(-0.5, 0.5),
      v: rand(12, 46),
      a: rand(0.1, 0.26),
      pts,
      accent: Math.random() < 0.3 ? z.accent : null
    });
  }
  return debris;
}
function makeDust(z) {
  const dust = [];
  const count = 12;
  for (let i = 0; i < count; i += 1) {
    dust.push({
      x: rand(0, state.w),
      y: rand(0, state.h),
      len: rand(8, 26),
      v: rand(360, 640),
      a: rand(0.06, z.dust)
    });
  }
  return dust;
}
function makePlanet(z) {
  return {
    x: rand(state.w * 0.12, state.w * 0.88),
    y: rand(-state.h * 0.5, -120),
    r: rand(state.w * 0.22, state.w * 0.36),
    v: rand(3, 7),
    tilt: rand(-0.5, 0.5),
    z
  };
}
function bakeNebula(z) {
  const w = Math.max(2, Math.round(state.w));
  const h = Math.max(2, Math.round(state.h));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  const blobs = 4 + Math.round(w / 90);
  for (let i = 0; i < blobs; i += 1) {
    const x = rand(-0.15, 1.15) * w;
    const y = rand(-0.1, 1.1) * h;
    const r = rand(80, 260) * (w / 420);
    const a1 = rand(0.045, 0.1);
    const a2 = rand(0.018, 0.04);
    for (const dy of [0, -h, h]) {
      const grad = g.createRadialGradient(x, y + dy, 0, x, y + dy, r);
      grad.addColorStop(0, rgba(z.hue, a1));
      grad.addColorStop(0.55, rgba(z.hue, a2));
      grad.addColorStop(1, rgba(z.hue, 0));
      g.fillStyle = grad;
      g.fillRect(x - r, y + dy - r, r * 2, r * 2);
    }
  }
  g.globalAlpha = 0.035;
  g.strokeStyle = z.accent;
  for (let i = 0; i < 3; i += 1) {
    const y0 = rand(0, h);
    const c1 = rand(0, h);
    const c2 = rand(0, h);
    const y1 = rand(0, h);
    g.lineWidth = rand(10, 40);
    for (const dy of [-h, 0, h]) {
      g.beginPath();
      g.moveTo(-40, y0 + dy);
      g.bezierCurveTo(w * 0.3, c1 + dy, w * 0.7, c2 + dy, w + 40, y1 + dy);
      g.stroke();
    }
  }
  g.globalAlpha = 1;
  return c;
}
function setZone(index, force = false) {
  if (!force && index === backdrop.zone) return;
  const z = ZONES[(index % ZONES.length + ZONES.length) % ZONES.length];
  backdrop.zone = index;
  state.zone = (index % ZONES.length + ZONES.length) % ZONES.length;
  backdrop.nebula = bakeNebula(z);
  backdrop.stars = makeStars();
  backdrop.debris = makeDebris(z);
  backdrop.dust = makeDust(z);
  backdrop.planet = makePlanet(z);
  backdrop.scroll = 0;
  state.zone = backdrop.zone % ZONES.length;
}
function zoneNow() {
  return ZONES[state.zone] || ZONES[0];
}
function buildSky() {
  const z = zoneNow();
  const grad = ctx.createLinearGradient(0, 0, 0, state.h);
  grad.addColorStop(0, z.top);
  grad.addColorStop(0.55, z.mid);
  grad.addColorStop(1, z.bottom);
  backdrop.sky = grad;
  const vg = ctx.createRadialGradient(state.w / 2, state.h * 0.46, state.h * 0.2, state.w / 2, state.h * 0.46, state.h * 0.78);
  vg.addColorStop(0, "rgba(0,0,0,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.5)");
  backdrop.vignette = vg;
}
function updateBackdrop(dt, rate) {
  for (const s of backdrop.stars) {
    s.y += s.v * dt * rate;
    if (s.y > state.h + 4) {
      s.y = -4;
      s.x = rand(0, state.w);
    }
  }
  for (const d of backdrop.debris) {
    d.y += d.v * dt * rate;
    d.rot += d.vr * dt * rate;
    if (d.y - d.r * 2 > state.h) {
      d.y = -d.r * 2;
      d.x = rand(0, state.w);
    }
  }
  for (const d of backdrop.dust) {
    d.y += d.v * dt * rate;
    if (d.y - d.len > state.h) {
      d.y = -d.len;
      d.x = rand(0, state.w);
    }
  }
  const p = backdrop.planet;
  if (p) {
    p.y += p.v * dt * rate;
    if (p.y - p.r * 2 > state.h) {
      p.y = -p.r * 2.4;
      p.x = rand(state.w * 0.1, state.w * 0.9);
      p.r = rand(state.w * 0.22, state.w * 0.36);
    }
  }
  backdrop.scroll += 24 * dt * rate;
}
function drawBackdrop() {
  const z = zoneNow();
  const w = state.w;
  const h = state.h;
  if (backdrop.sky) ctx.fillStyle = backdrop.sky;
  else ctx.fillStyle = C.void;
  ctx.fillRect(0, 0, w, h);
  for (const s of backdrop.stars) {
    ctx.globalAlpha = s.a;
    ctx.fillStyle = s.layer > 0.9 ? z.accent : C.bone;
    ctx.fillRect(s.x, s.y, s.r, s.r * (1.4 + s.layer));
  }
  ctx.globalAlpha = 1;
  if (backdrop.nebula) {
    const off = backdrop.scroll % h;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(backdrop.nebula, 0, off - h, w, h);
    ctx.drawImage(backdrop.nebula, 0, off, w, h);
    ctx.globalAlpha = 1;
  }
  drawPlanet();
  drawLattice();
  for (const d of backdrop.debris) drawDebris(d);
  ctx.strokeStyle = z.accent;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const d of backdrop.dust) {
    ctx.globalAlpha = d.a;
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x, d.y - d.len);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (backdrop.vignette) {
    ctx.fillStyle = backdrop.vignette;
    ctx.fillRect(0, 0, w, h);
  }
}
function drawPlanet() {
  const p = backdrop.planet;
  if (!p) return;
  const z = p.z;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.tilt);
  ctx.fillStyle = "rgba(4, 6, 10, 0.86)";
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(z.hue, 0.34);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = rgba(z.hue, 0.14);
  ctx.beginPath();
  ctx.arc(0, 0, p.r * 0.86, 0, TAU);
  ctx.stroke();
  ctx.save();
  ctx.scale(1, 0.32);
  ctx.strokeStyle = rgba(z.hue, 0.24);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, p.r * 1.42, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(0, 0, p.r * 1.62, 0, TAU);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = rgba(z.hue, 0.09);
  ctx.beginPath();
  ctx.arc(-p.r * 0.34, p.r * 0.2, p.r * 0.22, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(p.r * 0.4, -p.r * 0.3, p.r * 0.13, 0, TAU);
  ctx.fill();
  ctx.restore();
}
function drawLattice() {
  const z = zoneNow();
  ctx.strokeStyle = rgba(z.hue, 0.07);
  ctx.lineWidth = 1;
  ctx.beginPath();
  const stepX = 54;
  for (let x = state.w % stepX / 2; x < state.w; x += stepX) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, state.h);
  }
  const stepY = 78;
  const off = backdrop.scroll * 0.55;
  for (let y = stepY - off % stepY; y < state.h; y += stepY) {
    ctx.moveTo(0, y);
    ctx.lineTo(state.w, y);
  }
  ctx.stroke();
}
function drawDebris(d) {
  ctx.save();
  ctx.translate(d.x, d.y);
  ctx.rotate(d.rot);
  ctx.beginPath();
  for (let i = 0; i < d.pts.length; i += 1) {
    const p = d.pts[i];
    const x = Math.cos(p.a) * d.r * p.d;
    const y = Math.sin(p.a) * d.r * p.d;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(4, 6, 10, 0.55)";
  ctx.fill();
  ctx.strokeStyle = d.accent ? tint(d.accent, d.a * 2.2) : `rgba(233, 229, 216, ${d.a})`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}
var ENEMY = {
  drone: { tier: 1, r: 12, hp: 3, value: 1, color: "#8ea3c0" },
  rusher: { tier: 2, r: 13, hp: 5, value: 2, color: "#c9f25f" },
  inter: { tier: 3, r: 15, hp: 12, value: 4, color: "#f2efe4" },
  gun: { tier: 4, r: 17, hp: 16, value: 3, color: "#ffb45e" },
  hunter: { tier: 5, r: 21, hp: 24, value: 5, color: "#6fd8ff" },
  split: { tier: 6, r: 25, hp: 40, value: 7, color: "#c084ff" },
  fort: { tier: 7, r: 31, hp: 82, value: 12, color: "#ff4f63" }
};
var BOSSES = [
  { name: "\u68F1\u955C", code: "PRISM", color: "#86d9ff" },
  { name: "\u9488\u96E8", code: "NEEDLE", color: "#ffb45e" },
  { name: "\u6F29\u6DA1", code: "VORTEX", color: "#c78bff" }
];
var hpScale = () => 1 + (state.wave - 1) * 0.22;
var bulletSpeed = () => Math.min(310, 165 + state.wave * 8);
var rank = () => 1 + Math.min(1.2, (state.wave - 1) * 0.075);
function spawnEnemy(kind, x, y) {
  const spec = ENEMY[kind];
  const hp = spec.hp * hpScale();
  const e = {
    kind,
    tier: spec.tier,
    r: spec.r,
    color: spec.color,
    value: spec.value,
    x,
    y,
    hp,
    max: hp,
    t: 0,
    fire: rand(0.6, 1.2),
    burst: rand(0.4, 1),
    spin: rand(0, TAU),
    flash: 0,
    dead: false,
    leaving: false,
    phase: 0,
    shots: 0,
    charge: 0,
    aim: 0,
    vx: 0,
    vy: 0,
    free: null,
    stopY: rand(120, 230),
    amp: rand(16, 40),
    drift: rand(0.5, 1),
    seed: rand(0, TAU),
    cx: x,
    span: Math.min(state.w * 0.3, 150)
  };
  e.cx = clamp(x, e.span + e.r, state.w - e.span - e.r);
  enemies.push(e);
  return e;
}
function spawnBoss() {
  const variant = ((Math.floor(state.wave / 4) - 1) % 3 + 3) % 3;
  const spec = BOSSES[variant];
  const hp = 230 + state.wave * 30 + state.wave * state.wave * 4;
  const e = {
    kind: "boss",
    tier: 8,
    variant,
    r: 48,
    color: spec.color,
    value: 18,
    x: state.w / 2,
    y: -90,
    hp,
    max: hp,
    t: 0,
    fire: 0,
    burst: 0,
    spin: rand(0, TAU),
    pattern: -1,
    patternT: 0.8,
    cont: null,
    phase: 1,
    flash: 0,
    dead: false,
    entered: false,
    leaving: false,
    stopY: 142
  };
  enemies.push(e);
  state.boss = e;
  bossname.textContent = `${spec.name} \xB7 ${spec.code} ${String(state.wave).padStart(2, "0")}`;
  bossbar.hidden = false;
  bosshp.style.width = "100%";
  spawnEnemy("drone", state.w * 0.2, -50);
  spawnEnemy("drone", state.w * 0.8, -70);
  state.banner = { text: "WARNING", sub: spec.name, life: 1.8, max: 1.8 };
}
function closestApproach(x, y, vx, vy) {
  const dx = player.x - x;
  const dy = player.y - y;
  const v2 = vx * vx + vy * vy;
  if (v2 < 1) return null;
  const t = -(dx * vx + dy * vy) / v2;
  if (t <= 0) return null;
  const cx = x + vx * t;
  const cy = y + vy * t;
  return { t, d: Math.hypot(player.x - cx, player.y - cy) };
}

const angDiff = (a, b) => Math.abs((((a - b + Math.PI) % TAU) + TAU) % TAU - Math.PI);

function shoot(x, y, angle, speed, kind = "orb") {
  if (state.mode !== "playing") return;
  // Never materialise on top of the player.
  if (Math.hypot(x - player.x, y - player.y) < 56) return;
  // Hard ceiling; the arena stays readable even on long endless runs.
  if (ebullets.length > 420) return;

  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;
  let hit = closestApproach(x, y, vx, vy);

  // Every bullet needs at least ~0.6s of reading time before it can reach you.
  if (hit && hit.t < 0.6) {
    const k = hit.t / 0.6;
    vx *= k;
    vy *= k;
    hit = closestApproach(x, y, vx, vy);
  }

  // At most two bullets may be pointed exactly at your current spot inside a
  // short window. Later ones are deflected, not dropped, so the unit still
  // visibly fires instead of falling silent.
  if (hit && hit.d < 9 && hit.t < 1.6) {
    if (state.threats >= 2) {
      const bent = angle + (Math.random() < 0.5 ? -1 : 1) * rand(0.12, 0.2);
      const mag = Math.hypot(vx, vy) || speed;
      vx = Math.cos(bent) * mag;
      vy = Math.sin(bent) * mag;
    } else {
      state.threats += 1;
    }
  }

  const r = kind === "needle" ? 5 : kind === "big" ? 9 : 6.4;
  ebullets.push({ x, y, vx, vy, angle, r, kind, grazed: false });
}

var shootOrb = (x, y, a, s) => shoot(x, y, a, s, "orb");
var shootNeedle = (x, y, a, s) => shoot(x, y, a, s, "needle");

// A ring always leaves an open door; the door is random, so you have to move to
// it, but there is always one.
function fireRing(x, y, count, speed, offset, gap = 0.55) {
  const dist = Math.hypot(player.x - x, player.y - y);
  const maxCount = Math.max(10, Math.floor((TAU * Math.max(dist, 120)) / 34));
  const n = Math.max(8, Math.min(count, maxCount));
  const door = offset + rand(0, TAU);
  for (let i = 0; i < n; i += 1) {
    const a = offset + (i / n) * TAU;
    if (angDiff(a, door) < gap / 2) continue;
    shoot(x, y, a, speed, "orb");
  }
}

// Fans thin out when the target is close, and never centre perfectly on it.
function fireFan(x, y, count, spread, speed, kind = "orb", jitter = 0.05, center = null) {
  const dist = Math.hypot(player.x - x, player.y - y);
  const maxCount = Math.max(3, Math.floor((spread * Math.max(dist, 120)) / 30) + 1);
  const n = Math.max(3, Math.min(count, maxCount));
  const a0 = (center === null ? aimAt(x, y) : center) + rand(-jitter, jitter);
  const step = n > 1 ? spread / (n - 1) : 0;
  for (let i = 0; i < n; i += 1) {
    shoot(x, y, a0 + (i - (n - 1) / 2) * step, speed, kind);
  }
}
function aimAt(x, y) {
  return Math.atan2(player.y - y, player.x - x);
}
function bossVolley(e) {
  const speed = bulletSpeed();
  const heavy = e.phase >= 2;
  const v = e.variant;
  e.cont = null;

  if (v === 0) {
    if (e.pattern === 0) {
      fireRing(e.x, e.y, heavy ? 26 : 22, speed * 0.6, e.spin, 0.62);
      e.spin += 0.19;
    } else if (e.pattern === 1) {
      fireFan(e.x, e.y, heavy ? 9 : 7, 0.7, speed * 1.22, "needle", 0.03);
    } else if (e.pattern === 2) {
      e.cont = { kind: "spiral", timer: 2.6, every: 0.1, tick: 0, arms: heavy ? 3 : 2, angle: rand(0, TAU) };
    } else {
      for (let k = 0; k < 4; k += 1) {
        fireFan(e.x, e.y, 5, 0.46, speed * 0.6, "orb", 0.02, (k * Math.PI) / 2 + e.t * 0.25);
      }
    }
  } else if (v === 1) {
    if (e.pattern === 0) {
      e.cont = { kind: "sweep", timer: 2.2, every: 0.09, tick: 0, spread: -0.85, dir: 1 };
    } else if (e.pattern === 1) {
      for (let k = 0; k < 3; k += 1) {
        fireFan(e.x, e.y, 3, 0.24, speed * (1.12 + k * 0.08), "needle", 0.02);
      }
    } else if (e.pattern === 2) {
      e.cont = { kind: "ring", timer: 2.2, every: 0.24, tick: 0, angle: rand(0, TAU) };
    } else {
      e.cont = { kind: "curtain", timer: 2.4, every: 0.4, tick: 0, lane: 2 };
    }
  } else {
    if (e.pattern === 0) {
      e.cont = { kind: "spiral", timer: 2.8, every: 0.09, tick: 0, arms: heavy ? 4 : 3, angle: rand(0, TAU) };
    } else if (e.pattern === 1) {
      fireRing(e.x, e.y, heavy ? 24 : 20, speed * 0.55, e.spin, 0.7);
      e.spin += 0.23;
      fireFan(e.x, e.y, 5, 0.4, speed * 1.05, "needle", 0.03);
    } else if (e.pattern === 2) {
      e.cont = { kind: "wall", timer: 2.4, every: 0.22, tick: 0, side: 1 };
    } else {
      fireRing(e.x, e.y, 14, speed * 0.42, rand(0, TAU), 0.9);
    }
  }
}

function bossCont(e, dt) {
  const c = e.cont;
  if (!c) return;
  const speed = bulletSpeed();
  c.timer -= dt;
  c.tick -= dt;
  if (c.tick <= 0) {
    c.tick = c.every;
    if (c.kind === "spiral") {
      c.angle += 0.34;
      for (let a = 0; a < c.arms; a += 1) shootOrb(e.x, e.y, c.angle + (a / c.arms) * TAU, speed * 0.72);
    } else if (c.kind === "sweep") {
      c.spread += 0.17 * c.dir;
      if (Math.abs(c.spread) > 0.85) c.dir *= -1;
      shootNeedle(e.x, e.y, aimAt(e.x, e.y) + c.spread, speed * 1.15);
    } else if (c.kind === "ring") {
      c.angle += 0.58;
      shootOrb(e.x, e.y, c.angle, speed * 0.82);
      shootOrb(e.x, e.y, c.angle + Math.PI, speed * 0.82);
    } else if (c.kind === "wall") {
      const sway = Math.sin(e.t * 1.4) * 0.5;
      // Five columns, centre column left open as a lane.
      for (let i = -2; i <= 2; i += 1) {
        if (i === 0) continue;
        shootOrb(e.x + i * 16, e.y, Math.PI / 2 + i * 0.22 + sway * 0.16, speed * 0.7);
      }
    } else if (c.kind === "curtain") {
      // A lane of needles missing, and the door only shifts one lane per row.
      c.lane = clamp(c.lane + [-1, 0, 0, 1][Math.floor(Math.random() * 4)], 0, 4);
      for (let i = 0; i < 5; i += 1) {
        if (i === c.lane) continue;
        shootNeedle(state.w * (0.1 + i * 0.2), 18, Math.PI / 2, speed * 0.92);
      }
    }
  }
  if (c.timer <= 0) e.cont = null;
}

function updateBoss(e, dt) {
  if (!e.entered) {
    e.y += 74 * dt;
    if (e.y >= e.stopY) {
      e.entered = true;
      e.t = 0;
      e.patternT = 0.7;
      if (state.wave >= 16) e.phase = 2;
    }
    return;
  }

  e.t += dt;
  e.x = state.w / 2 + Math.sin(e.t * 0.55) * (state.w * 0.26);
  e.y = e.stopY + Math.sin(e.t * 1.5) * 10;
  e.spin += dt * 0.4;

  if (e.phase === 1 && e.hp <= e.max * 0.5) {
    e.phase = 2;
    e.flash = 1;
    state.flash = 0.8;
    state.shake = 12;
    burst(e.x, e.y, e.color, 34);
    sfx.explode(true);
    spawnEnemy("rusher", state.w * 0.16, -40);
    spawnEnemy("rusher", state.w * 0.84, -50);
    state.banner = { text: "\u6838\u5FC3\u8FC7\u8F7D", sub: "OVERDRIVE", life: 1.5, max: 1.5 };
    sfx.phase();
  }

  if (e.phase === 2 && e.hp <= e.max * 0.25) {
    e.phase = 3;
    e.flash = 1;
    state.flash = 0.9;
    state.shake = 14;
    burst(e.x, e.y, C.hurt, 30);
    sfx.explode(true);
    spawnEnemy("split", state.w * 0.24, -50);
    spawnEnemy("split", state.w * 0.76, -60);
    state.banner = { text: "\u4E34\u754C", sub: "CRITICAL", life: 1.4, max: 1.4 };
    sfx.phase();
  }

  const pace = e.phase === 3 ? 0.62 : e.phase === 2 ? 0.78 : 1;
  e.patternT -= dt;
  if (e.patternT <= 0) {
    e.pattern = (e.pattern + 1) % 4;
    e.patternT = 2.7 * pace;
    bossVolley(e);
  }

  e.fire -= dt;
  if (e.fire <= 0) {
    e.fire = e.phase === 3 ? 0.3 : e.phase === 2 ? 0.4 : 0.56;
    shootOrb(e.x + rand(-14, 14), e.y + 18, aimAt(e.x, e.y) + rand(-0.1, 0.1), bulletSpeed() * 0.85);
    if (e.phase === 3) {
      shootOrb(e.x + rand(-18, 18), e.y + 10, aimAt(e.x, e.y) + rand(-0.18, 0.18), bulletSpeed() * 0.7);
    }
  }
  bossCont(e, dt);
  e.flash = Math.max(0, e.flash - dt * 3);
}
function updateEnemy(e, dt) {
  e.t += dt;
  e.flash = Math.max(0, e.flash - dt * 4);
  if (e.kind === "boss") {
    updateBoss(e, dt);
    return;
  }
  const rk = rank();
  const bs = bulletSpeed();
  if (e.kind === "drone") {
    if (e.free) {
      e.x += e.free.vx * dt;
      e.y += e.free.vy * dt;
      e.free.vy += 26 * dt;
    } else {
      e.y += (118 + state.wave * 3) * dt;
      e.x += Math.sin(e.t * 2.2 + e.seed) * e.amp * dt;
    }
    e.fire -= dt;
    if (e.fire <= 0 && e.y > 20 && e.y < state.h * 0.86) {
      e.fire = 2.1 / rk;
      shootOrb(e.x, e.y, aimAt(e.x, e.y), bs);
    }
  } else if (e.kind === "rusher") {
    if (e.phase === 0) {
      e.y += 170 * dt;
      if (e.y >= e.stopY) {
        e.phase = 1;
        e.charge = 0.62 / rk;
      }
    } else if (e.phase === 1) {
      e.charge -= dt;
      if (e.charge <= 0) {
        const a = aimAt(e.x, e.y);
        e.vx = Math.cos(a) * 520;
        e.vy = Math.sin(a) * 520;
        e.phase = 2;
        state.shake = Math.max(state.shake, 3);
      }
    } else {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      if (Math.random() < 0.7) {
        particles.push({
          x: e.x,
          y: e.y,
          vx: rand(-16, 16),
          vy: rand(-30, 30),
          life: 0.22,
          max: 0.22,
          size: rand(1, 2.2),
          color: e.color
        });
      }
    }
  } else if (e.kind === "inter") {
    if (e.y < e.stopY) {
      e.y += 130 * dt;
    } else if (e.phase === 0) {
      e.phase = 1;
      e.charge = 0.95 / rk;
    } else if (e.phase === 1) {
      e.charge -= dt;
      e.aim = aimAt(e.x, e.y);
      if (e.charge <= 0) {
        fireFan(e.x, e.y, 3, 0.11, Math.min(560, bs * 1.7), "needle", 0.01, e.aim);
        e.shots += 1;
        e.phase = 2;
        e.fire = 1.5 / rk;
        state.shake = Math.max(state.shake, 2);
      }
    } else {
      e.fire -= dt;
      if (e.fire <= 0) {
        if (e.shots >= 2) e.leaving = true;
        else e.phase = 0;
      }
    }
    if (e.leaving) e.y -= 120 * dt;
  } else if (e.kind === "gun") {
    if (e.y < e.stopY) {
      e.y += 88 * dt;
    } else if (!e.leaving) {
      e.x += Math.sin(e.t * 0.8 + e.seed) * 22 * dt;
      e.fire -= dt;
      if (e.fire <= 0) {
        e.fire = 2 / rk;
        fireFan(e.x, e.y, 3, 0.3, bs * 0.92, "orb", 0.05);
      }
      if (state.waveBudget <= 0 && e.t > 8) e.leaving = true;
    } else {
      e.y -= 100 * dt;
    }
  } else if (e.kind === "hunter") {
    if (e.y < e.stopY) {
      e.y += 82 * dt;
    } else if (!e.leaving) {
      e.x = e.cx + Math.sin(e.t * 0.85) * e.span;
      e.fire -= dt;
      if (e.fire <= 0) {
        e.fire = 2.15 / rk;
        fireFan(e.x, e.y, 5, 0.52, bs * 0.95, "orb", 0.04);
      }
      if (state.waveBudget <= 0 && e.t > 10) e.leaving = true;
    } else {
      e.y -= 95 * dt;
    }
  } else if (e.kind === "split") {
    if (e.y < e.stopY) {
      e.y += 70 * dt;
    } else {
      e.fire -= dt;
      if (e.fire <= 0) {
        e.fire = 0.18 / rk;
        e.spin += 0.5;
        shootOrb(e.x, e.y, e.spin, bs * 0.72);
        shootOrb(e.x, e.y, e.spin + Math.PI, bs * 0.72);
        if (e.hp < e.max * 0.5) {
          shootOrb(e.x, e.y, e.spin + Math.PI / 2, bs * 0.72);
          shootOrb(e.x, e.y, e.spin - Math.PI / 2, bs * 0.72);
        }
      }
    }
  } else if (e.kind === "fort") {
    if (e.y < e.stopY) {
      e.y += 52 * dt;
    } else if (!e.leaving) {
      e.x += Math.sin(e.t * 0.45) * 26 * dt;
      e.fire -= dt;
      if (e.fire <= 0) {
        e.fire = 2.6 / rk;
        const n = e.hp < e.max * 0.45 ? 18 : 14;
        fireRing(e.x, e.y, n, bs * 0.56, e.spin, 0.6);
        e.spin += 0.19;
      }
      e.burst -= dt;
      if (e.burst <= 0) {
        e.burst = 1.25 / rk;
        fireFan(e.x, e.y, 3, 0.32, bs, "needle", 0.03);
      }
      if (state.waveBudget <= 0 && e.t > 12) e.leaving = true;
    } else {
      e.y -= 70 * dt;
    }
  }
  if (e.t > 0.5 && (e.y > state.h + 80 || e.y < -220 || e.x < -160 || e.x > state.w + 160)) e.dead = true;
}
var FORMATIONS = [
  { id: "swarm", cost: 6, minWave: 1 },
  { id: "pincer", cost: 8, minWave: 2 },
  { id: "rush", cost: 8, minWave: 2 },
  { id: "line", cost: 10, minWave: 2 },
  { id: "snipe", cost: 9, minWave: 3 },
  { id: "arc", cost: 12, minWave: 4 },
  { id: "split", cost: 14, minWave: 5 },
  { id: "heavy", cost: 12, minWave: 6 },
  { id: "wall", cost: 16, minWave: 7 }
];
function spawnFormation(id) {
  const w = state.w;
  if (id === "swarm") {
    for (let i = 0; i < 6; i += 1) {
      spawnEnemy("drone", w * 0.22 + i % 3 * w * 0.28, -40 - Math.floor(i / 3) * 38);
    }
  } else if (id === "pincer") {
    for (let i = 0; i < 2; i += 1) {
      spawnEnemy("drone", w * 0.1, -40 - i * 44);
      spawnEnemy("drone", w * 0.9, -40 - i * 44);
    }
    spawnEnemy("gun", w * 0.5, -120);
  } else if (id === "rush") {
    for (let i = 0; i < 4; i += 1) spawnEnemy("rusher", w * 0.18 + i * w * 0.21, -40 - i * 26);
  } else if (id === "line") {
    for (let i = 0; i < 3; i += 1) spawnEnemy("gun", w * 0.2 + i * w * 0.3, -40 - i * 30);
  } else if (id === "snipe") {
    spawnEnemy("inter", w * 0.16, -40);
    spawnEnemy("inter", w * 0.84, -70);
  } else if (id === "arc") {
    for (let i = -1; i <= 1; i += 1) spawnEnemy("hunter", w / 2 + i * w * 0.26, -40 - Math.abs(i) * 34);
  } else if (id === "split") {
    spawnEnemy("split", w * 0.32, -50);
    spawnEnemy("split", w * 0.68, -90);
  } else if (id === "heavy") {
    spawnEnemy("fort", w / 2, -80);
    spawnEnemy("drone", w * 0.22, -40);
    spawnEnemy("drone", w * 0.78, -40);
  } else if (id === "wall") {
    for (let i = 0; i < 5; i += 1) spawnEnemy("gun", w * 0.14 + i * w * 0.18, -40 - Math.abs(i - 2) * 22);
    spawnEnemy("rusher", w * 0.5, -150);
  }
}
function updateBullets(dt) {
  const k = state.buff.slow > 0 ? 0.5 : 1;
  for (const b of ebullets) {
    b.x += b.vx * dt * k;
    b.y += b.vy * dt * k;
  }
  ebullets = ebullets.filter((b) => b.y > -60 && b.y < state.h + 60 && b.x > -70 && b.x < state.w + 70);
  for (const b of pbullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
  pbullets = pbullets.filter((b) => b.y > -30);
}
var PICKUPS = {
  over: { label: "\u8D85\u8F7D", color: "#ffe08a", weight: 30, time: 8 },
  slow: { label: "\u8FDF\u6EDE", color: "#7fe7ff", weight: 22, time: 4.5 },
  shield: { label: "\u62A4\u76FE", color: "#f4f1e6", weight: 24 },
  pulse: { label: "\u8109\u51B2", color: "#ff7a8f", weight: 12 },
  repair: { label: "\u4FEE\u590D", color: "#a6f08a", weight: 20 }
};
function rollPickup() {
  const list = Object.entries(PICKUPS).filter(([id]) => {
    if (id === "shield" && state.shield > 0) return false;
    if (id === "repair" && state.lives >= LIVES) return false;
    return true;
  });
  const total = list.reduce((sum, [, spec]) => sum + spec.weight, 0);
  let roll = Math.random() * total;
  for (const [id, spec] of list) {
    roll -= spec.weight;
    if (roll <= 0) return id;
  }
  return list[0][0];
}
function dropPickup(x, y, forced) {
  drops.push({
    x,
    y,
    vx: rand(-18, 18),
    vy: rand(42, 66),
    t: 0,
    type: forced || rollPickup(),
    life: 13
  });
}
function maybeDrop(e) {
  if (e.kind === "boss") {
    for (let i = 0; i < 3; i += 1) dropPickup(e.x + rand(-40, 40), e.y + rand(-20, 20));
    return;
  }
  const chance = e.tier >= 5 ? 0.4 : e.tier >= 3 ? 0.14 : 0.07;
  if (state.lives === 1 && e.tier >= 2 && Math.random() < 0.22) {
    dropPickup(e.x, e.y, "repair");
    return;
  }
  if (Math.random() < chance) dropPickup(e.x, e.y);
}
function healPlayer(amount, rewardIfFull) {
  if (state.lives >= LIVES) {
    if (rewardIfFull) {
      addScore(400);
      popups.push({ x: player.x, y: player.y - 28, text: "+400", life: 0.9, max: 0.9, color: C.bone });
      sfx.pickup("repair");
    }
    return false;
  }
  state.lives = Math.min(LIVES, state.lives + amount);
  state.pressure = clamp(state.pressure + 0.05, 0, 1);
  updateHud();
  hpEl.classList.add("is-heal");
  window.setTimeout(() => hpEl.classList.remove("is-heal"), 450);
  popups.push({ x: player.x, y: player.y - 28, text: "HP +1", life: 1, max: 1, color: "#a6f08a" });
  burst(player.x, player.y, "#a6f08a", 12);
  sfx.heal();
  return true;
}
function updateDrops(dt) {
  for (const d of drops) {
    d.t += dt;
    d.life -= dt;
    const dx = player.x - d.x;
    const dy = player.y - d.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 86) {
      const pull = 1 - dist / 86;
      d.vx += dx / (dist || 1) * 1100 * pull * dt;
      d.vy += dy / (dist || 1) * 1100 * pull * dt;
      d.vx = clamp(d.vx, -280, 280);
      d.vy = clamp(d.vy, -280, 280);
    } else {
      d.vy += 14 * dt;
      d.vy = Math.min(d.vy, 80);
    }
    d.x += (d.vx + Math.sin(d.t * 2.4) * 14) * dt;
    d.y += d.vy * dt;
    if (dist < 22) collectPickup(d);
  }
  drops = drops.filter((d) => !d.taken && d.life > 0 && d.y < state.h + 40);
}
function collectPickup(d) {
  d.taken = true;
  const spec = PICKUPS[d.type];
  if (d.type === "over") state.buff.over = Math.max(state.buff.over, spec.time);
  else if (d.type === "slow") state.buff.slow = Math.max(state.buff.slow, spec.time);
  else if (d.type === "shield") state.shield = 1;
  else if (d.type === "pulse") pulseBlast();
  else if (d.type === "repair") healPlayer(1, true);
  popups.push({ x: d.x, y: d.y, text: spec.label, life: 1.1, max: 1.1, color: spec.color });
  burst(d.x, d.y, spec.color, 14);
  if (d.type !== "repair") sfx.pickup(d.type);
  updateBuffs();
}
function pulseBlast() {
  for (const b of ebullets) addScore(2);
  ebullets = [];
  for (const e of enemies) {
    if (!e.dead) damageEnemy(e, 26);
  }
  state.flash = 0.7;
  state.shake = 12;
  burst(player.x, player.y, C.hurt, 30);
  sfx.explode(true);
}
var fireInterval = () => 0.13 * 0.84 ** state.up.rate * (state.buff.over > 0 ? 0.62 : 1);
var streamCount = () => 2 + state.up.stream + (state.buff.over > 0 ? 2 : 0);
var damage = () => 1 + state.up.dmg;
var power = () => state.up.rate + state.up.dmg + state.up.stream + (state.buff.over > 0 ? 2 : 0);
function updatePlayer(dt) {
  if (state.invuln > 0) state.invuln -= dt;
  player.focus = keys.has("shift") || pointerDown;
  let tx = moveTarget.x;
  let ty = moveTarget.y;
  if (AUTOPILOT) {
    tx = player.x;
    ty = player.y;
    const target = enemies[0];
    if (target) {
      tx = target.x;
      ty = Math.min(player.y, state.h - 180);
    }
    for (const b of ebullets) {
      const dx2 = player.x - b.x;
      const dy2 = player.y - b.y;
      const d2 = Math.hypot(dx2, dy2);
      if (d2 < 96) {
        tx += dx2 / (d2 || 1) * (96 - d2) * 1.5;
        ty += dy2 / (d2 || 1) * (96 - d2) * 0.85;
      }
    }
    tx = clamp(tx, 24, state.w - 24);
    ty = clamp(ty, 60, state.h - 60);
  }
  if (AUTOPILOT || player.focus) {
    // Precise mode keeps the old damped follow, so a held Shift lets you nudge
    // the ship without teleporting it onto a bullet.
    const dx = tx - player.x;
    const dy = ty - player.y;
    const d = Math.hypot(dx, dy);
    const step = Math.min(d, 300 * dt);
    if (d > 0.6) {
      player.x += dx / d * step;
      player.y += dy / d * step;
    }
  } else {
    // Normal mode: the ship sits exactly under the pointer, no lag.
    player.x = tx;
    player.y = ty;
  }
  player.x = clamp(player.x, 18, state.w - 18);
  player.y = clamp(player.y, 50, state.h - 26);
  state.fireTimer -= dt;
  if (state.fireTimer <= 0) {
    state.fireTimer = fireInterval();
    fire();
  }
  if (Math.random() < 0.5) {
    particles.push({
      x: player.x + rand(-3, 3),
      y: player.y + 12,
      vx: rand(-10, 10),
      vy: rand(40, 90),
      life: rand(0.14, 0.28),
      max: 0.28,
      size: rand(1, 2),
      color: C.heat
    });
  }
}
function fire() {
  const n = streamCount();
  for (let i = 0; i < n; i += 1) {
    const off = (i - (n - 1) / 2) * 8;
    pbullets.push({ x: player.x + off, y: player.y - 14, vx: 0, vy: -1e3, r: 2.4, dmg: damage() });
  }
  particles.push({
    x: player.x,
    y: player.y - 16,
    vx: 0,
    vy: -30,
    life: 0.1,
    max: 0.1,
    size: 2.2,
    color: C.bone
  });
  sfx.shot();
}
function addScore(value) {
  state.score += Math.round(value);
  scoreEl.textContent = format(state.score);
}
function bumpChain() {
  state.chain = Math.min(10, state.chain + 1);
  state.chainTimer = 3;
  chainEl.textContent = `\u8FDE\u9501 \xD7${state.chain}`;
  if ([3, 5, 7, 10].includes(state.chain)) sfx.chain(state.chain);
}
function resetChain() {
  state.chain = 1;
  state.chainTimer = 0;
  chainEl.textContent = "";
}
function damageEnemy(e, amount) {
  e.hp -= amount;
  e.flash = 1;
  if (e.hp > 0 || e.dead) return;
  e.dead = true;
  const isBoss = e.kind === "boss";
  const points = Math.round(50 * e.value * state.chain + (isBoss ? 2400 : 0));
  addScore(points);
  bumpChain();
  burst(e.x, e.y, e.color, isBoss ? 48 : e.tier >= 6 ? 16 : 8);
  popups.push({ x: e.x, y: e.y, text: `+${points}`, life: 0.8, max: 0.8, big: isBoss });
  state.shake = Math.max(state.shake, isBoss ? 16 : e.tier >= 6 ? 6 : 3);
  sfx.explode(isBoss);
  maybeDrop(e);
  if (e.kind === "split") {
    for (let i = 0; i < 3; i += 1) {
      const mini = spawnEnemy("drone", e.x + rand(-8, 8), e.y + rand(-6, 6));
      const a = -Math.PI / 2 + (i - 1) * 0.75;
      mini.free = { vx: Math.cos(a) * 120, vy: Math.sin(a) * 80 };
    }
  }
  if (isBoss) {
    state.boss = null;
    bossbar.hidden = true;
    state.pressure = clamp(state.pressure + 0.06, 0, 1);
    state.flash = Math.max(state.flash, 0.75);
    ebullets = [];
    healPlayer(1, false);
    spawnEnemy("drone", state.w * 0.24, -40);
    spawnEnemy("drone", state.w * 0.76, -40);
  }
}
function collide() {
  for (const b of ebullets) {
    const dx = b.x - player.x;
    const dy = b.y - player.y;
    const d = Math.hypot(dx, dy);
    if (d < player.r + b.r * 0.58) {
      b.hit = true;
      hitPlayer();
      continue;
    }
    if (!b.grazed && d < 27) {
      b.grazed = true;
      state.graze += 1;
      grazeEl.textContent = `\u64E6\u5F39 ${state.graze}`;
      addScore(6);
      sfx.graze();
      particles.push({ x: b.x, y: b.y, vx: 0, vy: -18, life: 0.3, max: 0.3, size: 1.4, color: C.bone });
    }
  }
  ebullets = ebullets.filter((b) => !b.hit);
  for (const b of pbullets) {
    for (const e of enemies) {
      if (e.dead) continue;
      if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + b.r + 2) {
        b.dead = true;
        damageEnemy(e, b.dmg);
        burst(b.x, b.y, C.bone, 2);
        break;
      }
    }
  }
  pbullets = pbullets.filter((b) => !b.dead);
  for (const e of enemies) {
    if (e.dead || e.kind === "boss") continue;
    if (Math.hypot(e.x - player.x, e.y - player.y) < e.r + player.r) hitPlayer();
  }
  enemies = enemies.filter((e) => !e.dead);
}
function hitPlayer() {
  if (GOD || state.invuln > 0 || state.mode !== "playing") return;
  if (state.shield > 0) {
    state.shield = 0;
    state.invuln = 1.2;
    state.shake = 10;
    state.flash = 0.5;
    ebullets = ebullets.filter((b) => Math.hypot(b.x - player.x, b.y - player.y) > 130);
    burst(player.x, player.y, C.bone, 18);
    sfx.shieldBreak();
    updateBuffs();
    return;
  }
  state.shake = 18;
  state.flash = 1;
  state.slow = 0.5;
  burst(player.x, player.y, C.hurt, 22);
  resetChain();
  state.lives -= 1;
  state.pressure = clamp(state.pressure - 0.12, 0, 1);
  updateHud();
  sfx.hit();
  if (state.lives === 1) sfx.alarm();
  if (state.lives <= 0) {
    if (state.boss) {
      state.boss = null;
      bossbar.hidden = true;
    }
    endRun();
    return;
  }
  state.invuln = 2.4;
  ebullets = [];
  player.x = state.w / 2;
  player.y = state.h - 100;
  moveTarget = { x: player.x, y: player.y };
}
function updateWaveLabel() {
  const z = zoneNow();
  waveEl.textContent = `W${String(Math.max(1, state.wave)).padStart(2, "0")} \xB7 ${z.name}`;
}
function startWave(n) {
  state.wave = n;
  state.heavyCount = 0;
  state.splitCount = 0;
  state.wallCount = 0;
  state.waveBudget = Math.round((32 + n * 12) * (0.9 + state.pressure * 0.2));
  state.spawnTimer = 1;
  state.waveQuiet = 0;
  state.bossPending = n % 4 === 0;
  const zoneIndex = Math.floor((n - 1) / 4);
  const changed = zoneIndex !== backdrop.zone;
  if (changed) setZone(zoneIndex);
  if (changed && backdrop.planet) backdrop.planet.y = -backdrop.planet.r * 1.2;
  const z = zoneNow();
  if (state.bossPending) {
    state.waveBudget = 0;
    state.spawnTimer = 1.8;
    state.banner = { text: `WAVE ${String(n).padStart(2, "0")}`, sub: `\u6838\u5FC3\u63A5\u8FD1 \xB7 ${z.name}`, life: 1.8, max: 1.8 };
  } else if (changed) {
    state.banner = { text: z.name, sub: `ZONE ${String(zoneIndex + 1).padStart(2, "0")} \xB7 ${z.code}`, life: 2.2, max: 2.2 };
  } else {
    state.banner = { text: `WAVE ${String(n).padStart(2, "0")}`, sub: z.code, life: 1.5, max: 1.5 };
  }
  updateWaveLabel();
  if (state.bossPending) sfx.warn();
  else sfx.wave();
}
function countSpawn(id) {
  if (id === "heavy") state.heavyCount += 1;
  else if (id === "split") state.splitCount += 1;
  else if (id === "wall") state.wallCount += 1;
}

function updateWave(dt) {
  if (state.bossPending) {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      state.bossPending = false;
      spawnBoss();
    }
    return;
  }
  if (state.waveBudget > 0) {
    state.spawnTimer -= dt;
    const cap = 9 + Math.min(9, Math.floor(state.wave * 0.7));
    if (state.spawnTimer <= 0 && enemies.length < cap) {
      const heavyMax = state.wave < 8 ? 1 : 2;
      const options = FORMATIONS.filter((f) => {
        if (f.minWave > state.wave || f.cost > state.waveBudget) return false;
        if (f.id === "heavy" && state.heavyCount >= heavyMax) return false;
        if (f.id === "split" && state.splitCount >= 2) return false;
        if (f.id === "wall" && state.wallCount >= 1) return false;
        return true;
      });
      if (options.length === 0) {
        state.waveBudget = 0;
      } else {
        const pack = options[Math.floor(Math.random() * options.length)];
        spawnFormation(pack.id);
        countSpawn(pack.id);
        state.waveBudget -= pack.cost;

        // A second pack only from the light pool, and only once the run has
        // warmed up; heavy packs never double up.
        const light = ["swarm", "rush", "line", "snipe", "arc"];
        if (state.wave >= 6 && state.pressure > 0.35 && light.includes(pack.id) && state.waveBudget >= 6 && enemies.length < cap - 4) {
          const extraOptions = options.filter((f) => light.includes(f.id) && f.cost <= state.waveBudget);
          const extra = extraOptions[Math.floor(Math.random() * extraOptions.length)];
          if (extra) {
            spawnFormation(extra.id);
            state.waveBudget -= extra.cost;
          }
        }
        state.spawnTimer = Math.max(2, rand(2.9, 4) - state.wave * 0.04) * (1.05 - state.pressure * 0.12);
      }
    }
  }
  if (state.waveBudget <= 0 && enemies.length === 0 && !state.bossPending) {
    state.waveQuiet += dt;
    if (state.waveQuiet > 1.4) waveClear();
  } else {
    state.waveQuiet = 0;
  }
}
function waveClear() {
  state.pressure = clamp(state.pressure + 0.04, 0, 1);
  healPlayer(1, false);
  burst(player.x, player.y - 20, C.heat, 18);
  sfx.clear();

  // Upgrades every second wave; the wave in between is a short breather, so a
  // run is not a card screen with bullets in between. Once everything is maxed
  // the run simply continues, so endless waves never dead-end on a menu.
  const canUpgrade = UPGRADES.some((u) => state.up[u.id] < u.max);
  if (state.wave % 2 === 0 && canUpgrade) {
    state.mode = "upgrade";
    state.banner = { text: "WAVE CLEAR", sub: "\u5F3A\u5316 \xB7 UPGRADE", life: 1.2, max: 1.2 };
    showUpgrades();
  } else {
    state.mode = "clear";
    state.clearTimer = 1.9;
    state.banner = { text: "WAVE CLEAR", sub: "\u8865\u7ED9 \xB7 +1 HP", life: 1.8, max: 1.8 };
  }
}
var UPGRADES = [
  { id: "rate", name: "\u5C04\u901F", desc: "\u5C04\u51FB\u95F4\u9694 -16%", max: 5 },
  { id: "dmg", name: "\u4F24\u5BB3", desc: "\u6BCF\u53D1\u4F24\u5BB3 +1", max: 5 },
  { id: "stream", name: "\u591A\u91CD\u5C04\u51FB", desc: "\u5F39\u9053 +1", max: 3 }
];
function upgradeDetail(id) {
  if (id === "rate") return `\u73B0 ${Math.round(fireInterval() * 1e3)}ms`;
  if (id === "dmg") return `\u73B0 ${damage()}/\u53D1`;
  return `\u73B0 ${streamCount()} \u9053`;
}
function showUpgrades() {
  const offers = UPGRADES.filter((u) => state.up[u.id] < u.max);
  upgradeOptions.replaceChildren();
  if (offers.length === 0) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "up-card";
    btn.innerHTML = '<span class="up-key">1</span><span><span class="up-name">\u7EE7\u7EED</span><span class="up-desc">\u706B\u529B\u5DF2\u6EE1\uFF0C\u8FDB\u5165\u4E0B\u4E00\u6CE2</span></span>';
    btn.addEventListener("click", () => chooseUpgrade(null));
    upgradeOptions.append(btn);
  } else {
    offers.forEach((up, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "up-card";
      btn.innerHTML = `<span class="up-key">${i + 1}</span><span><span class="up-name">${up.name}</span><span class="up-desc">${up.desc} \xB7 ${upgradeDetail(up.id)} \xB7 \u5DF2\u6709 ${state.up[up.id]}/${up.max}</span></span>`;
      btn.addEventListener("click", () => chooseUpgrade(up));
      upgradeOptions.append(btn);
    });
  }
  upgradeEl.hidden = false;
  if (AUTOPILOT) {
    const auto = offers[0] || null;
    window.setTimeout(() => {
      if (state.mode === "upgrade") chooseUpgrade(auto);
    }, 240);
  }
}
function chooseUpgrade(up) {
  sfx.confirm();
  if (up) state.up[up.id] += 1;
  upgradeEl.hidden = true;
  state.mode = "playing";
  updatePower();
  startWave(state.wave + 1);
}
function runSteps(count) {
  const dt = 1 / 120;
  try {
    for (let i = 0; i < count; i += 1) {
      if (state.mode === "upgrade") {
        const offers = UPGRADES.filter((u) => state.up[u.id] < u.max);
        chooseUpgrade(offers[0] || null);
      }
      update(dt);
    }
    draw();
  } catch (error) {
    if (window.__report) window.__report(`STEP ${error && error.stack ? error.stack : error}`);
  }
}
function endRun() {
  sfx.death();
  state.mode = "over";
  const isBest = state.score > best;
  if (isBest) {
    best = state.score;
    bestEl.textContent = format(best);
    persistBest();
  }
  showGate({
    kicker: "\u4FE1\u53F7\u4E2D\u65AD \xB7 SIGNAL LOST",
    title: format(state.score),
    text: `\u6CE2\u6B21 <strong>${state.wave}</strong> \xB7 \u533A\u57DF <strong>${zoneNow().name}</strong> \xB7 \u64E6\u5F39 <strong>${state.graze}</strong><br>\u6700\u4F73 <strong>${format(best)}</strong>${isBest ? " \xB7 <em>NEW RECORD</em>" : ""}`,
    actions: [
      { label: "\u518D\u6765\u4E00\u5C40", primary: true, run: startRun },
      { label: "\u8FD4\u56DE", run: () => toMenu() }
    ]
  });
}
function showGate({ kicker, title, text, actions }) {
  gateKicker.textContent = kicker;
  gateTitle.textContent = title;
  gateText.innerHTML = text;
  gateActions.replaceChildren();
  for (const action of actions) {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.className = `gate-button${action.primary ? " primary" : ""}`;
    button2.textContent = action.label;
    button2.addEventListener("click", () => {
      sfx.confirm();
      action.run();
    });
    gateActions.append(button2);
  }
  gate.hidden = false;
  requestAnimationFrame(() => gateActions.querySelector("button")?.focus({ preventScroll: true }));
}
function hideGate() {
  gate.hidden = true;
}
var MENU_LEGEND = `
<div class="legend">
<span><i style="background:#8ea3c0"></i>\u4FA6\u5BDF \xB7 \u4FEF\u51B2</span>
<span><i style="background:#c9f25f"></i>\u7A81\u88AD \xB7 \u51B2\u649E</span>
<span><i style="background:#f2efe4"></i>\u62E6\u622A \xB7 \u72D9\u51FB</span>
<span><i style="background:#ffb45e"></i>\u70AE\u8247 \xB7 \u4E09\u8FDE</span>
<span><i style="background:#6fd8ff"></i>\u6E38\u730E \xB7 \u4E94\u8FDE</span>
<span><i style="background:#c084ff"></i>\u5206\u88C2 \xB7 \u87BA\u65CB</span>
<span><i style="background:#ff4f63"></i>\u5821\u5792 \xB7 \u73AF\u5F62</span>
</div>`;
function toMenu() {
  state.mode = "menu";
  hideGate();
  upgradeEl.hidden = true;
  resetRun();
  setZone(0, true);
  buildSky();
  showGate({
    kicker: "VERTICAL DANMAKU",
    title: "\u5F39\u96E8",
    text: `\u81EA\u52A8\u5C04\u51FB\uFF0C\u51FB\u7834\u654C\u673A\uFF0C\u8EB2\u5F00\u5F39\u5E55\u3002<br>\u6BCF\u6CE2\u7ED3\u675F\u9009\u4E00\u9879\u5F3A\u5316\uFF1A<strong>\u5C04\u901F\u3001\u4F24\u5BB3\u3001\u591A\u91CD\u5C04\u51FB</strong>\u3002<br>\u51FB\u7834\u654C\u673A\u6389\u843D\u9053\u5177\uFF0C\u9760\u8FD1\u81EA\u52A8\u5438\u53D6\uFF1B\u6BCF\u6CE2\u7ED3\u675F\u6062\u590D <strong>1 HP</strong>\u3002${MENU_LEGEND}`,
    actions: [{ label: "\u51FA\u51FB", primary: true, run: startRun }]
  });
  updateHud();
  syncPauseButton();
}
function resetRun() {
  state.score = 0;
  state.chain = 1;
  state.chainTimer = 0;
  state.graze = 0;
  state.lives = LIVES;
  state.wave = 0;
  state.invuln = 0;
  state.slow = 0;
  state.banner = null;
  state.boss = null;
  state.bossPending = false;
  state.pressure = 0.5;
  state.heavyCount = 0;
  state.splitCount = 0;
  state.wallCount = 0;
  state.up = { rate: 0, dmg: 0, stream: 0 };
  enemies = [];
  ebullets = [];
  pbullets = [];
  particles = [];
  popups = [];
  drops = [];
  state.shield = 0;
  state.buff = { over: 0, slow: 0 };
  state.buffTick = 0;
  updateBuffs();
  player.x = state.w / 2;
  player.y = state.h - 110;
  moveTarget = { x: player.x, y: player.y };
  bossbar.hidden = true;
  chainEl.textContent = "";
  tipEl.hidden = true;
  state.tipTimer = 0;
  grazeEl.textContent = "\u64E6\u5F39 0";
  waveEl.textContent = "W01 \xB7 \u6DF1\u7A7A";
  updatePower();
}
function startRun() {
  hideGate();
  upgradeEl.hidden = true;
  resetRun();
  const hp = Number(PARAMS.get("hp"));
  if (hp > 0) state.lives = clamp(Math.floor(hp), 1, LIVES);
  state.mode = "playing";
  state.fireTimer = 0;
  startWave(START_WAVE);
  updateHud();
  syncPauseButton();
  if (!state.tipShown) {
    state.tipShown = true;
    state.tipTimer = 4.5;
    tipEl.hidden = false;
    tipEl.classList.add("is-in");
  }
}
function togglePause() {
  if (state.mode === "playing") {
    state.mode = "paused";
    moveTarget = { x: player.x, y: player.y };
    showGate({
      kicker: "\u6682\u505C \xB7 HOLD",
      title: "\u6682\u505C",
      text: "\u53F3\u952E\u3001P \u6216 Esc \u7EE7\u7EED\u3002",
      actions: [
        { label: "\u7EE7\u7EED", primary: true, run: () => {
          state.mode = "playing";
          moveTarget = { x: player.x, y: player.y };
          hideGate();
          syncPauseButton();
        } },
        { label: "\u91CD\u65B0\u5F00\u59CB", run: startRun }
      ]
    });
  } else if (state.mode === "paused") {
    state.mode = "playing";
    moveTarget = { x: player.x, y: player.y };
    hideGate();
  }
  syncPauseButton();
}
function syncPauseButton() {
  pauseBtn.classList.toggle("is-active", state.mode === "playing" || state.mode === "paused");
  pauseBtn.disabled = state.mode === "menu" || state.mode === "over";
}
function format(value) {
  if (value >= 1e5) return `${Math.floor(value / 1e3)}k`;
  if (value >= 1e4) return `${(value / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  return value.toLocaleString("en-US");
}
function updateHud() {
  scoreEl.textContent = format(state.score);
  bestEl.textContent = format(best);
  if (livesEl.children.length !== LIVES) {
    livesEl.replaceChildren();
    for (let i = 0; i < LIVES; i += 1) {
      const pip = document.createElement("span");
      pip.className = "pip";
      livesEl.append(pip);
    }
  }
  for (let i = 0; i < livesEl.children.length; i += 1) livesEl.children[i].classList.toggle("spent", i >= state.lives);
  livesEl.classList.toggle("low", state.lives === 1);
  hpNum.textContent = `${state.lives}/${LIVES}`;
  updateWaveLabel();
}

function renderMeters() {
  const fill = (el, value, max, bonus) => {
    el.replaceChildren();
    for (let i = 0; i < max; i += 1) {
      const pip = document.createElement("b");
      if (i < value) pip.className = "on";
      el.append(pip);
    }
    for (let i = 0; i < (bonus || 0); i += 1) {
      const pip = document.createElement("b");
      pip.className = "bonus";
      el.append(pip);
    }
  };
  fill(meterRate, state.up.rate, 5);
  fill(meterDmg, state.up.dmg, 5);
  fill(meterStream, state.up.stream, 3, state.buff.over > 0 ? 2 : 0);
}

function updatePower() {
  powerEl.textContent = `\u706B\u529B ${power()}`;
  renderMeters();
}

function buffChip(label, color, seconds) {
  const chip = document.createElement("span");
  chip.className = "buff";
  chip.style.color = color;
  const dot = document.createElement("i");
  const name = document.createElement("b");
  name.textContent = label;
  chip.append(dot, name);
  if (seconds > 0) {
    const time = document.createElement("em");
    time.textContent = `${Math.ceil(seconds)}s`;
    chip.append(time);
    if (seconds < 1.5) chip.classList.add("is-ending");
  }
  buffsEl.append(chip);
}

function updateBuffs() {
  buffsEl.replaceChildren();
  if (state.buff.over > 0) buffChip("\u8D85\u8F7D", "#ffe08a", state.buff.over);
  if (state.buff.slow > 0) buffChip("\u8FDF\u6EDE", "#7fe7ff", state.buff.slow);
  if (state.shield > 0) buffChip("\u62A4\u76FE", "#f4f1e6", 0);
  updatePower();
}
function burst(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const a = rand(0, TAU);
    const s = rand(40, 260);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.2, 0.6), max: 0.6, size: rand(1, 2.6), color });
  }
}
function pointerToWorld(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = clamp((event.clientX - rect.left) / rect.width * state.w, 18, state.w - 18);
  pointer.y = clamp((event.clientY - rect.top) / rect.height * state.h, 20, state.h - 26);
  // While paused, moving the mouse to a button must not drag the ship.
  if (state.mode !== "playing") return;
  moveTarget.x = pointer.x;
  moveTarget.y = pointer.y;
}
function bindEvents() {
  stage.addEventListener("pointermove", (event) => pointerToWorld(event));
  stage.addEventListener("pointerdown", (event) => {
    pointerToWorld(event);
    if (event.button === 0) {
      pointerDown = true;
      canvas.focus({ preventScroll: true });
    }
  });
  window.addEventListener("pointerup", () => {
    pointerDown = false;
  });
  window.addEventListener("pointercancel", () => {
    pointerDown = false;
  });
  stage.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (state.mode === "playing" || state.mode === "paused") togglePause();
  });
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
    if (state.mode === "upgrade") {
      if (key === "1" || key === "2" || key === "3") {
        const card = upgradeOptions.children[Number(key) - 1];
        if (card) card.click();
      }
      return;
    }
    if (key === "p" || key === "escape") {
      if (state.mode === "playing" || state.mode === "paused") togglePause();
      else if (state.mode === "menu") startRun();
      return;
    }
    if (key === "r" && (state.mode === "playing" || state.mode === "paused" || state.mode === "over")) {
      startRun();
      return;
    }
    if (key === " ") keys.add("space");
  });
  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
    keys.delete("space");
  });
  window.addEventListener("blur", () => {
    keys.clear();
    pointerDown = false;
  });
  pauseBtn.addEventListener("click", () => {
    sfx.confirm();
    togglePause();
  });
  soundBtn.addEventListener("click", () => setSound(!soundOn));
  const unlock = () => {
    if (soundOn) ensureAudio();
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.mode === "playing") togglePause();
  });
  new ResizeObserver(() => resize()).observe(stage);
}
var SOUND_KEY = "bullet-rain:sound";
var audio = null;
var master = null;
var noiseBuf = null;
var soundOn = readSoundPref();
var lastShotSound = 0;
var lastGrazeSound = 0;

function readSoundPref() {
  try {
    const raw = window.localStorage.getItem(SOUND_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    // Guest frames may have no storage of their own.
  }
  return true;
}

function saveSoundPref() {
  try {
    window.localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
  } catch {
    // Ignore.
  }
  try {
    void host.storage.set(SOUND_KEY, soundOn).catch(() => undefined);
  } catch {
    // No host outside OpenChamber.
  }
}

async function loadSoundPref() {
  try {
    const stored = await host.storage.get(SOUND_KEY);
    if (typeof stored === "boolean") {
      soundOn = stored;
      syncSoundButton();
    }
  } catch {
    // Keep the local value.
  }
}

function syncSoundButton() {
  soundBtn.classList.toggle("is-on", soundOn);
  soundBtn.setAttribute("aria-pressed", String(soundOn));
}

function setSound(on) {
  soundOn = on;
  syncSoundButton();
  saveSoundPref();
  if (soundOn) {
    ensureAudio();
    sfx.confirm();
  }
}

function ensureAudio() {
  if (!audio) {
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();

      const comp = audio.createDynamicsCompressor();
      comp.threshold.value = -16;
      comp.knee.value = 10;
      comp.ratio.value = 4;
      comp.attack.value = 0.004;
      comp.release.value = 0.22;

      const shaper = audio.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i += 1) {
        const x = i / 512 - 1;
        curve[i] = Math.tanh(x * 2.2);
      }
      shaper.curve = curve;
      shaper.oversample = "2x";

      master = audio.createGain();
      master.gain.value = 0.45;
      master.connect(shaper).connect(comp);
      comp.connect(audio.destination);

      try {
        const conv = audio.createConvolver();
        conv.buffer = makeImpulse(0.9, 2.4);
        const send = audio.createGain();
        send.gain.value = 0.08;
        master.connect(send).connect(conv).connect(comp);
      } catch {
        // Dry only if convolution is unavailable.
      }

      noiseBuf = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.5), audio.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    } catch {
      audio = null;
      master = null;
      return;
    }
  }
  if (audio.state === "suspended") void audio.resume();
}

function makeImpulse(seconds, decay) {
  const len = Math.floor(audio.sampleRate * seconds);
  const buf = audio.createBuffer(2, len, audio.sampleRate);
  for (let ch = 0; ch < 2; ch += 1) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
  }
  return buf;
}

const panOf = (x) => clamp((x - state.w / 2) / (state.w / 2), -1, 1) * 0.55;

function blip(freq, duration, type = "square", gain = 0.03, slide = 0, pan = 0, delay = 0, cutoff = 0) {
  if (!soundOn || !audio || !master) return;
  const at = audio.currentTime + delay;
  const cut = cutoff || Math.min(7000, freq * 9);

  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(cut, at);
  filter.frequency.exponentialRampToValueAtTime(Math.max(160, cut * 0.35), at + duration);

  const amp = audio.createGain();
  amp.gain.setValueAtTime(1e-4, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  amp.gain.exponentialRampToValueAtTime(1e-4, at + duration);

  const panner = audio.createStereoPanner();
  panner.pan.value = pan;
  filter.connect(amp).connect(panner).connect(master);

  const o1 = audio.createOscillator();
  o1.type = type;
  o1.frequency.setValueAtTime(freq, at);
  if (slide) o1.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), at + duration);
  o1.connect(filter);

  const o2 = audio.createOscillator();
  o2.type = type;
  o2.frequency.setValueAtTime(freq * 1.007, at);
  o2.detune.value = rand(-8, 8);
  if (slide) o2.frequency.exponentialRampToValueAtTime(Math.max(30, (freq + slide) * 1.007), at + duration);
  const blend = audio.createGain();
  blend.gain.value = 0.5;
  o2.connect(blend).connect(filter);

  o1.start(at);
  o2.start(at);
  o1.stop(at + duration + 0.03);
  o2.stop(at + duration + 0.03);
}

function sub(freq, duration, gain = 0.1, slide = 0, delay = 0) {
  if (!soundOn || !audio || !master) return;
  const at = audio.currentTime + delay;
  const osc = audio.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, at);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), at + duration);
  const amp = audio.createGain();
  amp.gain.setValueAtTime(1e-4, at);
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.012);
  amp.gain.exponentialRampToValueAtTime(1e-4, at + duration);
  osc.connect(amp).connect(master);
  osc.start(at);
  osc.stop(at + duration + 0.03);
}

function noiseHit(duration, gain, cutoff, pan = 0, delay = 0) {
  if (!soundOn || !audio || !master || !noiseBuf) return;
  const at = audio.currentTime + delay;
  const src = audio.createBufferSource();
  src.buffer = noiseBuf;
  src.playbackRate.value = rand(0.85, 1.2);
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(cutoff, at);
  filter.frequency.exponentialRampToValueAtTime(Math.max(120, cutoff * 0.3), at + duration);
  const amp = audio.createGain();
  amp.gain.setValueAtTime(gain, at);
  amp.gain.exponentialRampToValueAtTime(1e-4, at + duration);
  const panner = audio.createStereoPanner();
  panner.pan.value = pan;
  src.connect(filter).connect(amp).connect(panner).connect(master);
  src.start(at);
  src.stop(at + duration);
}

var sfx = {
  start() {
    blip(392, 0.14, "triangle", 0.06, 80, 0, 0, 1800);
    blip(587, 0.2, "triangle", 0.05, 120, 0, 0.1, 2200);
    sub(98, 0.26, 0.05, 20);
  },
  wave() {
    blip(440, 0.12, "sine", 0.04, 40, 0, 0, 1400);
    blip(660, 0.16, "sine", 0.032, 60, 0, 0.09, 1800);
  },
  warn() {
    for (let i = 0; i < 3; i += 1) {
      sub(62, 0.26, 0.09, -14, i * 0.26);
      blip(124, 0.2, "sawtooth", 0.035, -24, 0, i * 0.26, 420);
    }
  },
  phase() {
    blip(300, 0.6, "sawtooth", 0.06, -240, 0, 0, 800);
    noiseHit(0.5, 0.08, 1600);
    sub(80, 0.5, 0.08, -40);
  },
  shot() {
    const now = performance.now();
    if (now - lastShotSound < 65) return;
    lastShotSound = now;
    const pan = panOf(player.x);
    blip(rand(320, 360), 0.05, "sawtooth", 0.022, -190, pan, 0, 1100);
    noiseHit(0.035, 0.012, 3600, pan);
    sub(150, 0.045, 0.01, -60);
  },
  graze() {
    const now = performance.now();
    if (now - lastGrazeSound < 55) return;
    lastGrazeSound = now;
    blip(1400, 0.025, "triangle", 0.008, -300, panOf(player.x), 0, 4200);
  },
  chain(level) {
    blip(360 + level * 36, 0.09, "triangle", 0.03, 50, 0, 0, 1600);
    sub(110, 0.08, 0.02, 20);
  },
  hit() {
    sub(62, 0.5, 0.16, -30);
    noiseHit(0.45, 0.14, 1100);
    blip(150, 0.35, "sawtooth", 0.07, -90, 0, 0, 600);
  },
  alarm() {
    sub(70, 0.14, 0.08, -20);
    blip(140, 0.14, "square", 0.035, -30, 0, 0, 500);
    sub(70, 0.14, 0.06, -20, 0.2);
    blip(140, 0.14, "square", 0.03, -30, 0, 0.2, 500);
  },
  explode(big) {
    if (big) {
      sub(64, 0.8, 0.18, -36);
      noiseHit(0.75, 0.14, 1500);
      noiseHit(0.28, 0.07, 320, 0, 0.02);
      blip(110, 0.5, "sawtooth", 0.05, -70, 0, 0, 500);
    } else {
      sub(105, 0.2, 0.07, -55);
      noiseHit(0.2, 0.05, 2400);
      blip(210, 0.13, "sawtooth", 0.022, -120, 0, 0, 800);
    }
  },
  pickup(type) {
    const base = { over: 660, slow: 520, shield: 440, pulse: 300, repair: 600 }[type] || 560;
    blip(base, 0.1, "triangle", 0.035, 100, 0, 0, 2400);
    blip(base * 1.5, 0.14, "triangle", 0.028, 140, 0, 0.06, 2800);
    sub(base / 4, 0.1, 0.02, 10);
  },
  heal() {
    blip(523, 0.1, "triangle", 0.035, 60, 0, 0, 2200);
    blip(784, 0.12, "triangle", 0.03, 80, 0, 0.07, 2600);
    blip(1046, 0.16, "triangle", 0.025, 100, 0, 0.14, 3000);
    sub(130, 0.2, 0.03, 30);
  },
  shieldBreak() {
    noiseHit(0.22, 0.07, 2600);
    blip(340, 0.28, "triangle", 0.05, 120, 0, 0, 1800);
    sub(90, 0.2, 0.06, -30);
  },
  clear() {
    blip(440, 0.14, "triangle", 0.04, 60, 0, 0, 2000);
    blip(660, 0.2, "triangle", 0.035, 80, 0, 0.1, 2400);
    sub(110, 0.25, 0.04, 10);
  },
  confirm() {
    blip(360, 0.07, "square", 0.02, 90, 0, 0, 1200);
    blip(540, 0.09, "square", 0.017, 110, 0, 0.05, 1400);
  },
  expire() {
    blip(480, 0.16, "triangle", 0.03, -220, 0, 0, 1400);
  },
  death() {
    sub(60, 1.4, 0.18, -30);
    noiseHit(1, 0.12, 1200);
    blip(320, 1.2, "sawtooth", 0.07, -280, 0, 0, 700);
    blip(160, 1.4, "sine", 0.05, -120, 0, 0.15, 900);
  }
};
function resize() {
  state.resizes += 1;
  const rect = stage.getBoundingClientRect();
  const width = Math.max(200, rect.width);
  const height = Math.max(240, rect.height);
  state.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
  state.scale = height / WORLD_H;
  state.w = width / state.scale;
  state.h = WORLD_H;
  canvas.width = Math.round(width * state.dpr);
  canvas.height = Math.round(height * state.dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  setZone(backdrop.zone < 0 ? state.zone : backdrop.zone, true);
  buildSky();
  for (const e of enemies) {
    e.x = clamp(e.x, e.r + 4, state.w - e.r - 4);
  }
  if (state.mode === "menu" || state.mode === "over") {
    player.x = state.w / 2;
    player.y = state.h - 110;
  } else {
    player.x = clamp(player.x || state.w / 2, 20, state.w - 20);
    player.y = clamp(player.y || state.h - 120, 60, state.h - 40);
  }
  moveTarget = { x: player.x, y: player.y };
}
function polygon(n, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < n; i += 1) {
    const a = rot + i / n * TAU;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}
function fillHull(color) {
  ctx.fillStyle = "rgba(5, 7, 11, 0.93)";
  ctx.fill();
  ctx.fillStyle = tint(color, 0.2);
  ctx.fill();
}
function drawHull(e) {
  const r = e.r;
  const color = e.color;
  const line = e.flash > 0.18 ? C.bone : color;
  ctx.strokeStyle = line;
  ctx.fillStyle = "rgba(5, 7, 11, 0.93)";
  ctx.lineJoin = "miter";
  if (e.kind === "drone") {
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(r * 0.95, -r * 0.68);
    ctx.lineTo(0, -r * 0.18);
    ctx.lineTo(-r * 0.95, -r * 0.68);
    ctx.closePath();
    fillHull(color);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, r * 0.18, 1.8, 0, TAU);
    ctx.fillStyle = color;
    ctx.fill();
  } else if (e.kind === "rusher") {
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(0, r * 1.4);
    ctx.lineTo(r * 0.62, -r * 0.2);
    ctx.lineTo(0, -r * 1.15);
    ctx.lineTo(-r * 0.62, -r * 0.2);
    ctx.closePath();
    fillHull(color);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, r * 1.15);
    ctx.lineTo(0, -r * 0.7);
    ctx.moveTo(r * 0.62, -r * 0.2);
    ctx.lineTo(r * 1.0, -r * 0.78);
    ctx.moveTo(-r * 0.62, -r * 0.2);
    ctx.lineTo(-r * 1.0, -r * 0.78);
    ctx.stroke();
  } else if (e.kind === "inter") {
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(0, r * 1.05);
    ctx.lineTo(r * 0.5, r * 0.05);
    ctx.lineTo(r * 0.95, -r * 0.24);
    ctx.lineTo(0, -r * 1.15);
    ctx.lineTo(-r * 0.95, -r * 0.24);
    ctx.lineTo(-r * 0.5, r * 0.05);
    ctx.closePath();
    fillHull(color);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, r * 0.7);
    ctx.lineTo(0, -r * 0.55);
    ctx.stroke();
    ctx.strokeStyle = C.hurt;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.22, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = line;
  } else if (e.kind === "gun") {
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.lineTo(r * 0.87, 0);
    ctx.lineTo(0, -r);
    ctx.lineTo(-r * 0.87, 0);
    ctx.closePath();
    fillHull(color);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, TAU);
    ctx.fill();
    ctx.strokeRect(-2.2, r * 0.34, 4.4, r * 0.5);
  } else if (e.kind === "hunter") {
    ctx.lineWidth = 1.9;
    polygon(6, r, Math.PI / 6);
    fillHull(color);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.46, 0, TAU);
    ctx.stroke();
    ctx.strokeRect(-r * 1.05, -r * 0.16, r * 0.4, r * 0.32);
    ctx.strokeRect(r * 0.65, -r * 0.16, r * 0.4, r * 0.32);
    ctx.fillStyle = color;
    for (let i = 0; i < 3; i += 1) {
      const a = i / 3 * TAU + e.t * 1.6;
      ctx.fillRect(Math.cos(a) * r * 0.76 - 1.6, Math.sin(a) * r * 0.76 - 1.6, 3.2, 3.2);
    }
  } else if (e.kind === "split") {
    ctx.lineWidth = 1.9;
    polygon(8, r, Math.PI / 8);
    fillHull(color);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.36, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 4; i += 1) {
      const a = Math.PI / 8 + (i * Math.PI) / 2;
      ctx.moveTo(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52);
      ctx.lineTo(Math.cos(a) * r * 0.88, Math.sin(a) * r * 0.88);
    }
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < 3; i += 1) {
      const a = e.spin + i / 3 * TAU;
      ctx.fillRect(Math.cos(a) * r * 0.66 - 1.4, Math.sin(a) * r * 0.66 - 1.4, 2.8, 2.8);
    }
    ctx.globalAlpha = 1;
  } else if (e.kind === "fort") {
    ctx.lineWidth = 2.1;
    const s = r * 0.9;
    ctx.beginPath();
    ctx.rect(-s, -s, s * 2, s * 2);
    fillHull(color);
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(-s * 0.48, -s * 0.48, s * 0.96, s * 0.96);
    ctx.stroke();
    ctx.fillStyle = color;
    for (const [cx, cy] of [[-s, -s], [s, -s], [-s, s], [s, s]]) ctx.fillRect(cx - 2.4, cy - 2.4, 4.8, 4.8);
    ctx.beginPath();
    ctx.moveTo(-s * 0.62, 0);
    ctx.lineTo(s * 0.62, 0);
    ctx.moveTo(0, -s * 0.62);
    ctx.lineTo(0, s * 0.62);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 2.6, 0, TAU);
    ctx.fill();
  } else if (e.kind === "boss") {
    drawBossHull(e, line);
  }
  if (e.tier <= 7) {
    const n = e.tier;
    const gap = 5.2;
    const startX = -((n - 1) * gap) / 2;
    ctx.fillStyle = e.color;
    ctx.globalAlpha = 0.95;
    for (let i = 0; i < n; i += 1) ctx.fillRect(startX + i * gap - 1.6, r + 8, 3.2, 3.2);
    ctx.globalAlpha = 1;
  }
  if (e.tier >= 5 && e.tier <= 7 && e.hp < e.max) {
    const w = r * 1.9;
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = C.bone;
    ctx.fillRect(-w / 2, -r - 10, w, 1.4);
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = e.color;
    ctx.fillRect(-w / 2, -r - 10, w * clamp(e.hp / e.max, 0, 1), 1.4);
    ctx.globalAlpha = 1;
  }
}
function drawBossHull(e, line) {
  const r = e.r;
  const phase2 = e.phase === 2;
  ctx.save();
  ctx.rotate(e.t * 0.3);
  if (e.variant === 0) {
    ctx.lineWidth = 2.4;
    polygon(6, r, 0);
    fillHull(e.color);
    ctx.stroke();
    ctx.beginPath();
    polygon(6, r * 0.62, Math.PI / 6);
    ctx.stroke();
    ctx.beginPath();
    polygon(3, r * 0.34, -e.t * 0.8);
    ctx.fillStyle = tint(e.color, 0.3);
    ctx.fill();
    ctx.stroke();
  } else if (e.variant === 1) {
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, r * 1.1);
    ctx.lineTo(r * 0.66, r * 0.15);
    ctx.lineTo(r * 0.42, -r * 0.9);
    ctx.lineTo(0, -r * 1.14);
    ctx.lineTo(-r * 0.42, -r * 0.9);
    ctx.lineTo(-r * 0.66, r * 0.15);
    ctx.closePath();
    fillHull(e.color);
    ctx.stroke();
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.rect(s * r * 0.74 - 6, -r * 0.34, 12, r * 0.68);
      ctx.stroke();
      ctx.fillStyle = tint(e.color, 0.2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(0, r * 0.8);
    ctx.lineTo(0, -r * 0.8);
    ctx.stroke();
  } else {
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, TAU);
    ctx.fillStyle = tint(e.color, 0.08);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.3, 0, TAU);
    ctx.fillStyle = tint(e.color, 0.34);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 3; i += 1) {
      const a = i / 3 * TAU + e.t * 0.9;
      ctx.beginPath();
      ctx.rect(Math.cos(a) * r * 0.86 - 3, Math.sin(a) * r * 0.86 - 3, 6, 6);
      ctx.fillStyle = e.color;
      ctx.fill();
    }
  }
  ctx.restore();
  if (phase2) {
    ctx.strokeStyle = C.hurt;
    ctx.globalAlpha = 0.35 + 0.3 * Math.abs(Math.sin(e.t * 5));
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.18, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = line;
}
function drawEnemy(e) {
  ctx.save();
  if (e.kind === "inter" && e.phase === 1) {
    const pulse = 0.18 + 0.32 * Math.abs(Math.sin(e.t * 13));
    ctx.strokeStyle = `rgba(255, 95, 109, ${pulse})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([7, 9]);
    ctx.beginPath();
    ctx.moveTo(e.x, e.y);
    ctx.lineTo(e.x + Math.cos(e.aim) * 900, e.y + Math.sin(e.aim) * 900);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (e.kind === "rusher" && e.phase === 1) {
    const t = 1 - clamp(e.charge / 0.62, 0, 1);
    ctx.strokeStyle = tint(e.color, 0.25 + t * 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 8 + t * 12, 0, TAU);
    ctx.stroke();
  }
  ctx.translate(e.x, e.y);
  drawHull(e);
  ctx.restore();
}
function drawDrops() {
  for (const d of drops) {
    const spec = PICKUPS[d.type];
    const blink = d.life < 3 ? 0.35 + 0.65 * Math.abs(Math.sin(d.t * 9)) : 1;
    const bob = Math.sin(d.t * 3.4) * 2;
    ctx.save();
    ctx.translate(d.x, d.y + bob);
    ctx.globalAlpha = blink;

    // Rotating bracket ring: a token, not a hull.
    ctx.strokeStyle = spec.color;
    ctx.globalAlpha = blink * 0.65;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 4; i += 1) {
      const a = d.t * 1.1 + (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.arc(0, 0, 13.5, a, a + 0.46);
      ctx.stroke();
    }

    // Solid disc with a pointer: the only filled, round object in the field.
    ctx.globalAlpha = blink;
    ctx.fillStyle = spec.color;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(233, 229, 216, 0.92)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4.2, 9);
    ctx.lineTo(0, 15);
    ctx.lineTo(4.2, 9);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(5, 7, 11, 0.6)";
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, 7.4, 0, TAU);
    ctx.stroke();

    ctx.strokeStyle = "#05070b";
    ctx.lineWidth = 1.7;
    ctx.lineCap = "square";
    drawPickupIcon(d.type, "#05070b");
    ctx.restore();
  }
}

function drawPickupIcon(type, color) {
  ctx.beginPath();
  if (type === "over") {
    ctx.moveTo(-3.6, 0);
    ctx.lineTo(0, -4.2);
    ctx.lineTo(3.6, 0);
    ctx.moveTo(-3.6, 4.4);
    ctx.lineTo(0, 0.2);
    ctx.lineTo(3.6, 4.4);
    ctx.stroke();
  } else if (type === "slow") {
    ctx.arc(0, 0, 4.2, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -4.4);
    ctx.moveTo(0, 0);
    ctx.lineTo(2.6, 1.2);
    ctx.stroke();
  } else if (type === "shield") {
    ctx.moveTo(0, -5.2);
    ctx.lineTo(4.4, 0);
    ctx.lineTo(0, 5.2);
    ctx.lineTo(-4.4, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -2.4);
    ctx.lineTo(0, 2.4);
    ctx.stroke();
  } else if (type === "pulse") {
    for (let i = 0; i < 4; i += 1) {
      const a = (i / 4) * TAU + Math.PI / 4;
      ctx.moveTo(Math.cos(a) * 1.6, Math.sin(a) * 1.6);
      ctx.lineTo(Math.cos(a) * 5.4, Math.sin(a) * 5.4);
    }
    ctx.stroke();
  } else {
    ctx.moveTo(-4.4, 0);
    ctx.lineTo(4.4, 0);
    ctx.moveTo(0, -4.4);
    ctx.lineTo(0, 4.4);
    ctx.stroke();
  }
}
function drawBullets() {
  for (const b of ebullets) {
    if (b.kind === "needle") {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
      ctx.fillStyle = "rgba(255, 201, 138, 0.26)";
      ctx.fillRect(-2.8, -10, 5.6, 20);
      ctx.fillStyle = C.hot;
      ctx.fillRect(-1.5, -9, 3, 16);
      ctx.fillStyle = C.bone;
      ctx.fillRect(-0.6, -9, 1.2, 9);
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fillStyle = "rgba(255, 180, 94, 0.18)";
      ctx.fill();
      ctx.strokeStyle = C.hot;
      ctx.lineWidth = 1.7;
      ctx.stroke();
      ctx.fillStyle = C.bone;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 1.5, 0, TAU);
      ctx.fill();
    }
  }
  for (const b of pbullets) {
    ctx.fillStyle = C.heat;
    ctx.fillRect(b.x - 1.4, b.y - 9, 2.8, 16);
    ctx.fillStyle = C.bone;
    ctx.fillRect(b.x - 0.7, b.y - 9, 1.4, 6);
  }
}
function drawParticles() {
  for (const p of particles) {
    const t = clamp(p.life / p.max, 0, 1);
    ctx.globalAlpha = t;
    ctx.fillStyle = p.color;
    const s = p.size * (0.5 + t * 0.5);
    ctx.fillRect(p.x, p.y, s, s);
  }
  ctx.globalAlpha = 1;
}
function drawPopups() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const p of popups) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.big ? C.heat : C.bone;
    ctx.font = `${p.big ? 700 : 500} ${p.big ? 14 : 9}px "Chakra Petch", "Microsoft YaHei", sans-serif`;
    ctx.fillText(p.text, p.x, p.y);
  }
  ctx.globalAlpha = 1;
}
function drawShip() {
  const blink = state.invuln > 0 && Math.floor(state.time * 14) % 2 === 0 ? 0.35 : 1;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.globalAlpha = blink;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(11, 12);
  ctx.lineTo(0, 6);
  ctx.lineTo(-11, 12);
  ctx.closePath();
  ctx.fillStyle = C.bone;
  ctx.fill();
  ctx.strokeStyle = "rgba(5, 7, 11, 0.9)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(3.2, -1);
  ctx.lineTo(-3.2, -1);
  ctx.closePath();
  ctx.fillStyle = "#05070b";
  ctx.fill();
  ctx.fillStyle = C.heat;
  ctx.fillRect(-2.4, 6.5, 4.8, 4.5);
  ctx.globalAlpha = 1;
  ctx.fillStyle = C.bone;
  ctx.beginPath();
  ctx.arc(0, 0, 1.8, 0, TAU);
  ctx.fill();
  if (state.shield > 0) {
    ctx.strokeStyle = C.bone;
    ctx.globalAlpha = 0.55 + 0.3 * Math.sin(state.time * 5);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, 23, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (player.focus) {
    ctx.strokeStyle = C.bone;
    ctx.globalAlpha = 0.9;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.16;
    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}
function drawBanner() {
  if (!state.banner) return;
  const b = state.banner;
  const t = clamp(b.life / b.max, 0, 1);
  const alpha = t > 0.72 ? (1 - t) / 0.28 : Math.min(1, t / 0.35);
  const a = clamp(alpha, 0, 1);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = a * 0.94;
  ctx.fillStyle = C.bone;
  ctx.font = '400 26px "Chakra Petch", "Microsoft YaHei", sans-serif';
  ctx.fillText(b.text, state.w / 2, state.h * 0.4);
  if (b.sub) {
    ctx.globalAlpha = a * 0.55;
    ctx.fillStyle = zoneNow().accent;
    ctx.font = '500 9px "Chakra Petch", "Microsoft YaHei", sans-serif';
    ctx.fillText(b.sub, state.w / 2, state.h * 0.4 + 24);
  }
  ctx.globalAlpha = a * 0.28;
  ctx.fillStyle = C.bone;
  ctx.fillRect(state.w / 2 - 40, state.h * 0.4 + 36, 80, 1);
  ctx.globalAlpha = 1;
}
function draw() {
  state.draws += 1;
  const t = state.dpr * state.scale;
  ctx.setTransform(t, 0, 0, t, 0, 0);
  ctx.save();
  if (state.shake > 0) {
    ctx.translate(rand(-state.shake, state.shake) * 0.35, rand(-state.shake, state.shake) * 0.35);
  }
  drawBackdrop();
  for (const e of enemies) drawEnemy(e);
  drawDrops();
  drawBullets();
  drawParticles();
  drawPopups();
  drawShip();
  drawBanner();
  ctx.restore();
  if (state.flash > 0) {
    ctx.setTransform(t, 0, 0, t, 0, 0);
    ctx.fillStyle = `rgba(255, 95, 109, ${state.flash * 0.15})`;
    ctx.fillRect(0, 0, state.w, state.h);
  }
  if (DBG) {
    let box = document.getElementById("dbg");
    if (!box) {
      box = document.createElement("pre");
      box.id = "dbg";
      box.style.cssText = "position:fixed;left:8px;top:64px;z-index:90;margin:0;padding:4px 6px;background:rgba(0,0,0,0.7);color:#9fe;font:10px monospace;white-space:pre";
      document.body.append(box);
    }
    box.textContent = `t=${state.time.toFixed(1)} ${state.mode} W${state.wave} e=${enemies.length} eb=${ebullets.length} pb=${pbullets.length} boss=${state.boss ? Math.round(state.boss.hp) : "-"} score=${state.score} ${Math.round(state.w)}x${state.h} dpr=${state.dpr} canvas=${canvas.width}x${canvas.height} rz=${state.resizes} dr=${state.draws}`;
  }
}
function update(dt) {
  state.time += dt;
  updateBackdrop(dt, state.mode === "playing" ? 1 : 0.35);
  if (state.mode === "clear") {
    state.clearTimer -= dt;
    if (state.banner) {
      state.banner.life -= dt;
      if (state.banner.life <= 0) state.banner = null;
    }
    if (state.clearTimer <= 0) {
      state.mode = "playing";
      startWave(state.wave + 1);
    }
    return;
  }
  if (state.mode !== "playing") return;
  state.threatTimer -= dt;
  if (state.threatTimer <= 0) {
    state.threatTimer = 0.45;
    state.threats = 0;
  }
  if (state.tipTimer > 0) {
    state.tipTimer -= dt;
    if (state.tipTimer <= 0) tipEl.hidden = true;
  }
  if (state.chainTimer > 0) {
    state.chainTimer -= dt;
    if (state.chainTimer <= 0) resetChain();
  }
  const hadBuff = state.buff.over > 0 || state.buff.slow > 0 || state.shield > 0;
  const overWas = state.buff.over;
  const slowWas = state.buff.slow;
  state.buff.over = Math.max(0, state.buff.over - dt);
  state.buff.slow = Math.max(0, state.buff.slow - dt);
  if (overWas > 0 && state.buff.over === 0) sfx.expire();
  if (slowWas > 0 && state.buff.slow === 0) sfx.expire();
  state.buffTick = (state.buffTick || 0) + dt;
  if (state.buffTick >= 0.2) {
    state.buffTick = 0;
    if (hadBuff || state.buff.over > 0 || state.buff.slow > 0) updateBuffs();
  }
  updatePlayer(dt);
  for (const e of enemies) updateEnemy(e, dt);
  enemies = enemies.filter((e) => !e.dead);
  updateBullets(dt);
  updateDrops(dt);
  collide();
  updateWave(dt);
  for (const p of particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.98;
    p.vy *= 0.98;
  }
  particles = particles.filter((p) => p.life > 0);
  for (const p of popups) {
    p.y -= 22 * dt;
    p.life -= dt;
  }
  popups = popups.filter((p) => p.life > 0);
  if (state.boss) {
    const pct = clamp(state.boss.hp / state.boss.max, 0, 1);
    bosshp.style.width = `${(pct * 100).toFixed(1)}%`;
  }
  state.shake = Math.max(0, state.shake - dt * 36);
  state.flash = Math.max(0, state.flash - dt * 3);
  if (state.banner) {
    state.banner.life -= dt;
    if (state.banner.life <= 0) state.banner = null;
  }
}
var last = 0;
function frame(now) {
  if (!last) last = now;
  const raw = clamp((now - last) / 1e3, 0, 0.05);
  last = now;
  if (SIM > 1) {
    const sub = 1 / 120 * SPEED;
    for (let i = 0; i < SIM; i += 1) update(sub);
  } else {
    let dt = raw * SPEED;
    if (state.slow > 0) {
      state.slow = Math.max(0, state.slow - raw);
      dt *= 0.35;
    }
    update(dt);
  }
  draw();
  requestAnimationFrame(frame);
}
var fpsFrames = 0;
var fpsAt = 0;
function trackFps(now) {
  if (!DBG) return;
  fpsFrames += 1;
  if (!fpsAt) fpsAt = now;
  if (now - fpsAt >= 1e3) {
    document.title = `fps ${Math.round(fpsFrames * 1e3 / (now - fpsAt))}`;
    fpsFrames = 0;
    fpsAt = now;
  }
  requestAnimationFrame(trackFps);
}
var booted = false;
async function boot(context) {
  if (booted) return;
  booted = true;
  if (context) applyHostReady(context, document.documentElement);
  bestEl.textContent = format(best);
  resize();
  bindEvents();
  syncSoundButton();
  updateHud();
  updatePower();
  toMenu();
  syncPauseButton();
  loadingEl.classList.add("done");
  if (STEPS > 0) {
    startRun();
    const force = PARAMS.get("drop");
    if (force && PICKUPS[force]) {
      dropPickup(player.x, player.y - 150, force);
    } else if (force === "all") {
      const ids = Object.keys(PICKUPS);
      ids.forEach((id, i) => dropPickup(state.w * (0.2 + i * 0.15), player.y - 170 - i % 2 * 40, id));
    }
    runSteps(STEPS);
  }
  if (TIMERS) {
    window.setInterval(() => {
      for (let i = 0; i < SIM; i += 1) update(1 / 60 * SPEED);
      draw();
    }, 16);
  } else {
    requestAnimationFrame(frame);
  }
  if (DBG) requestAnimationFrame(trackFps);
  void loadBest();
  void loadSoundPref();
  if (AUTOPILOT) {
    window.setTimeout(() => {
      if (state.mode === "menu") startRun();
    }, 260);
  }
}
try {
  host.onReady((context) => {
    applyHostReady(context, document.documentElement);
    void boot(context);
  });
} catch {
}
window.setTimeout(() => void boot(null), 220);
