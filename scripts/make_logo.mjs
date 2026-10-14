// Generates the Fezinha mark: a swirl of brush bands (the spinning globe), lottery balls, a green
// streak and a four-leaf clover shooting out at the head. Usage: node scripts/make_logo.mjs public/logo
import fs from "node:fs";
import path from "node:path";

const OUT = process.argv[2] || ".";
const C = { x: 240, y: 286 };
const rad = (deg) => (deg * Math.PI) / 180;
const f = (n) => Math.round(n * 10) / 10;

// Catmull-Rom through the points, written as cubic Béziers.
const smooth = (pts, move = true) => {
  let d = move ? `M${f(pts[0][0])} ${f(pts[0][1])}` : `L${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
};

// A tapered band along a spiral: angle t0→t1 (deg, y down), radius r(s), width w(s), s in [a, b].
const band = ({ t0, t1, r, w, a = 0, b = 1, steps = 28, offset = () => 0 }) => {
  const outer = [];
  const inner = [];
  for (let i = 0; i <= steps; i++) {
    const s = a + ((b - a) * i) / steps;
    const local = (s - a) / (b - a);
    const taper = Math.min(1, Math.pow(Math.sin(Math.PI * local), 0.55) * 1.15);
    const theta = rad(t0 + (t1 - t0) * s);
    const radius = r(s) + offset(s);
    const half = (w(s) * taper) / 2;
    outer.push([C.x + (radius + half) * Math.cos(theta), C.y + (radius + half) * Math.sin(theta)]);
    inner.push([C.x + (radius - half) * Math.cos(theta), C.y + (radius - half) * Math.sin(theta)]);
  }
  return `${smooth(outer)}${smooth(inner.reverse(), false)}Z`;
};

const peak = (max, at, rise = 0.8, fall = 0.9) => (s) => max * (s < at ? Math.pow(s / at, rise) : Math.pow((1 - s) / (1 - at), fall));
const pieces = (spec, cuts) => cuts.map(([a, b]) => band({ ...spec, a, b }));

// Main band: hugs the hollow on the left and bottom, then spirals out to the clover.
const mainR = (s) => 104 + 112 * Math.pow(s, 2.3);
const mainW = peak(64, 0.36, 0.7, 1.1);
const main = { t0: 212, t1: -36, r: mainR, w: mainW };

const swirl = [
  ...pieces(main, [[0, 0.995]]),
  // Middle ring, broken like a brush stroke.
  ...pieces({ t0: 246, t1: 18, r: (s) => 160 + 22 * Math.pow(s, 1.6), w: peak(34, 0.4) }, [[0, 0.3], [0.33, 0.66], [0.7, 1]]),
  // Outer ring, almost a full turn.
  ...pieces({ t0: 282, t1: 30, r: (s) => 214 - 8 * s, w: peak(40, 0.45, 0.9, 1) }, [[0, 0.24], [0.27, 0.62], [0.655, 1]]),
  // Arc over the top of the hollow.
  band({ t0: 238, t1: 338, r: (s) => 128 - 10 * s, w: peak(17, 0.3) }),
  // Thin slivers that trail the outer rings.
  band({ t0: 150, t1: 230, r: () => 238, w: peak(7, 0.5) }),
  band({ t0: 60, t1: 120, r: () => 240, w: peak(6, 0.5) }),
  band({ t0: 330, t1: 352, r: () => 196, w: peak(7, 0.5) }),
];

// Green streaks on the inner side of the main band and in the gap beyond it.
const streaks = [
  band({ t0: 212, t1: -36, a: 0.3, b: 0.97, r: mainR, offset: (s) => -mainW(s) * 0.3, w: (s) => 16 * Math.sin(Math.PI * Math.min(1, (s - 0.3) / 0.67)) + 3 }),
  band({ t0: 246, t1: 18, a: 0.62, b: 1, r: (s) => 160 + 22 * Math.pow(s, 1.6), offset: () => -20, w: () => 8 }),
];

const star = ([x, y, s]) => `M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`;
const SPARKLES = [[96, 92, 11], [372, 52, 15], [476, 236, 9], [52, 300, 7], [306, 470, 6]];

// The lottery balls tumbling in the swirl.
const BALLS = [130, 146, 160, 174].map((deg, i) => {
  const r = 158 - i * 4;
  return { x: f(C.x + r * Math.cos(rad(deg))), y: f(C.y + r * Math.sin(rad(deg))), r: [18, 15, 12, 9][i] };
});

// Four heart leaves around the head, stem trailing back into the swirl.
const HEAD = { x: f(C.x + 222 * Math.cos(rad(-38))), y: f(C.y + 222 * Math.sin(rad(-38))) };
const LEAF = "M0 0C-17 -6 -27 -24 -18 -36C-11 -45 -2 -42 0 -34C2 -42 11 -45 18 -36C27 -24 17 -6 0 0Z";
const VEIN = "M0 -4L0 -30";

const build = ({ hi, mid, lo, background, size = 512, simple = false }) => {
  const swirlPaths = simple ? [...pieces(main, [[0, 0.995]]), ...pieces({ t0: 282, t1: 30, r: (s) => 214 - 8 * s, w: peak(46, 0.45, 0.9, 1) }, [[0, 1]])] : swirl;
  const streakPaths = simple ? streaks.slice(0, 1) : streaks;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">
<defs>
<linearGradient id="swirl" gradientUnits="userSpaceOnUse" x1="430" y1="70" x2="80" y2="480"><stop offset="0" stop-color="${hi}"/><stop offset="0.5" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
<linearGradient id="streak" gradientUnits="userSpaceOnUse" x1="150" y1="420" x2="420" y2="120"><stop offset="0" stop-color="#146645"/><stop offset="0.55" stop-color="#1a9a68"/><stop offset="1" stop-color="#8fe0bb"/></linearGradient>
<linearGradient id="leaf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1a7d56"/><stop offset="1" stop-color="#5fd3a0"/></linearGradient>
<radialGradient id="ball" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="${hi}"/><stop offset="0.6" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></radialGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#8fe0bb" stop-opacity="0.55"/><stop offset="1" stop-color="#8fe0bb" stop-opacity="0"/></radialGradient>
</defs>
${background ? `<rect width="512" height="512" rx="112" fill="${background}"/>` : ""}
<g transform="translate(256 ${simple ? 262 : 260}) scale(${simple ? 0.86 : 0.9}) translate(-242 -280)">
<g fill="url(#swirl)">${swirlPaths.map((d) => `<path d="${d}"/>`).join("")}</g>
<g fill="url(#streak)">${streakPaths.map((d) => `<path d="${d}"/>`).join("")}</g>
${simple ? "" : `<g fill="url(#ball)">${BALLS.map((ball) => `<circle cx="${ball.x}" cy="${ball.y}" r="${ball.r}"/>`).join("")}</g>`}
${simple ? "" : `<g fill="${hi}" opacity="0.85">${SPARKLES.map((s) => `<path d="${star(s)}"/>`).join("")}</g>`}
<circle cx="${HEAD.x}" cy="${HEAD.y}" r="${simple ? 84 : 64}" fill="url(#glow)"/>
<g transform="translate(${HEAD.x} ${HEAD.y}) scale(${simple ? 1.7 : 1.05})">
<path d="M0 0C-8 10 -18 16 -30 18" fill="none" stroke="#1a7d56" stroke-width="5.5" stroke-linecap="round"/>
${[0, 90, 180, 270].map((deg) => `<g transform="rotate(${deg})"><path d="${LEAF}" fill="url(#leaf)"/><path d="${VEIN}" stroke="#e3f3ec" stroke-opacity="0.55" stroke-width="2.2" stroke-linecap="round"/></g>`).join("")}
<circle r="4.5" fill="#e3f3ec"/>
</g>
</g>
</svg>
`;
};

const write = (name, svg) => fs.writeFileSync(path.join(OUT, name), svg);
write("logo.svg", build({ hi: "#ffffff", mid: "#eeeef4", lo: "#b9bbc9" }));
write("logo_light.svg", build({ hi: "#c9cbd6", mid: "#a3a5b4", lo: "#6c6f80" }));
write("icon.svg", build({ hi: "#ffffff", mid: "#e7e7ee", lo: "#a9abba", background: "#18181b", simple: true }));
console.log("written to", OUT);
