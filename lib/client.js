/* dsh-theme-ascetic 0.4.0 — built by scripts/build.mjs; bundles ascii.rest (MIT, @bas3line). */
window.__ModuleLoader__.load({ id: "dsh-theme-ascetic", factory: (require) => {
'use strict';
var module = { exports: {} };
var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf, __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key) && key !== except && __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: !0 }) : target,
  mod
)), __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

// node_modules/ascii.rest/dist/pieces/black-hole.js
var black_hole_exports = {};
__export(black_hole_exports, {
  default: () => blackHole,
  meta: () => meta
});
function mulberry32(a) {
  return () => {
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function paths() {
  let f = (u) => 1.5 * u * u - u, table = [];
  for (let n = 0; n < NB; n++) {
    let b = (n + 0.5) / NB * BMAX, u = 1 / D, w = Math.sqrt(1 - (b / D) ** 2) / b, us = [u];
    for (; u < 1 && (u > 1 / (OUT + 1) || w > 0); ) {
      let k1 = w, l1 = f(u), k2 = w + H / 2 * l1, l2 = f(u + H / 2 * k1), k3 = w + H / 2 * l2, l3 = f(u + H / 2 * k2), k4 = w + H * l3, l4 = f(u + H * k3);
      u += H / 6 * (k1 + 2 * k2 + 2 * k3 + k4), w += H / 6 * (l1 + 2 * l2 + 2 * l3 + l4), us.push(u);
    }
    table.push(Float32Array.from(us));
  }
  return table;
}
function blackHole() {
  let { cols, rows } = meta, cw = 2 * SPAN / cols, s = Math.sin(TILT), c = Math.cos(TILT), table = paths(), rand = mulberry32(17), TAB = 256, band = [];
  for (let b = 0; b < BANDS; b++) {
    let r = IN + (OUT - IN) * b / (BANDS - 1), turns = Math.max(1, Math.round(SPIN * (IN / r) ** 1.5)), waves = [2, 3, 5, 8, 13].map((k) => [k, rand() * 6.283, (0.5 + rand()) / Math.sqrt(k)]), tab = new Float32Array(TAB), lo = 1 / 0, hi = -1 / 0;
    for (let i = 0; i < TAB; i++) {
      for (let [k, p, a] of waves)
        tab[i] += a * Math.sin(k * 2 * Math.PI * i / TAB + p);
      lo = Math.min(lo, tab[i]), hi = Math.max(hi, tab[i]);
    }
    for (let i = 0; i < TAB; i++)
      tab[i] = 0.45 + 0.55 * (tab[i] - lo) / (hi - lo);
    band.push({ tab, turns });
  }
  let cells = Array.from({ length: cols * rows }, () => []), empty = new Uint8Array(cols * rows).fill(1);
  for (let j = 0; j < rows * SY; j++) {
    let y = (rows / 2 + 0.5 - (j + 0.5) / SY) * 2 * cw;
    for (let i = 0; i < cols * SX; i++) {
      let x = ((i + 0.5) / SX - cols / 2) * cw, k = Math.floor(j / SY) * cols + Math.floor(i / SX), n = Math.hypot(x, y, 1), d = [x / n, (y * c - s) / n, (y * s + c) / n], out = d[1] * s - d[2] * c, side = Math.sqrt(1 - out * out), e2 = [d[0] / side, (d[1] - out * s) / side, (d[2] + out * c) / side], us = table[Math.min(NB - 1, Math.floor(D * side * NB / BMAX))];
      us[us.length - 1] >= 1 && (empty[k] = 0);
      let end = Math.min((us.length - 1) * H, 5.6), light = 1;
      for (let a = (Math.atan2(-s, e2[1]) + 2 * Math.PI) % Math.PI; a < end; a += Math.PI) {
        let p = a / H, q = Math.floor(p), r = 1 / (us[q] + (us[q + 1] - us[q]) * (p - q));
        if (r <= IN || r >= OUT)
          continue;
        let phi = Math.atan2(Math.sin(a) * e2[2] - Math.cos(a) * c, Math.sin(a) * e2[0]), edge = Math.min(1, (r - IN) / 0.7) * (1 - ((r - IN) / (OUT - IN)) ** 2), doppler = 1 - 0.5 * Math.cos(phi), pos = (r - IN) / (OUT - IN) * (BANDS - 1), b0 = Math.min(BANDS - 2, Math.floor(pos));
        empty[k] = 0, cells[k].push(b0, pos - b0, phi, light * edge * doppler * (IN / r) ** 1.5 / (SX * SY)), light *= 0.45;
      }
    }
  }
  let stars = new Uint8Array(cols * rows);
  for (let k = 0; k < cols * rows; k++)
    stars[k] = empty[k] && rand() < 0.03 ? 1 : 0;
  let at = (b, a) => {
    let i = Math.floor(a / (2 * Math.PI) * TAB) % TAB;
    return band[b].tab[i < 0 ? i + TAB : i];
  };
  return (t) => {
    let turn = 2 * Math.PI * (t % LOOP) / LOOP, out = "";
    for (let r = 0; r < rows; r++) {
      r && (out += `
`);
      for (let q = 0; q < cols; q++) {
        let k = r * cols + q, h2 = cells[k], sum = 0;
        for (let i = 0; i < h2.length; i += 4) {
          let b = h2[i], fr = h2[i + 1], phi = h2[i + 2], g0 = at(b, phi - band[b].turns * turn), g1 = at(b + 1, phi - band[b + 1].turns * turn);
          sum += h2[i + 3] * (g0 + (g1 - g0) * fr);
        }
        let v = Math.min(1, Math.max(0, sum * GAIN - FLOOR) / (1 - FLOOR)) ** 0.75, ch = RAMP[Math.round(v * (RAMP.length - 1))];
        out += ch === " " && stars[k] ? "." : ch;
      }
    }
    return out;
  };
}
var meta, RAMP, SX, SY, D, IN, OUT, TILT, SPAN, GAIN, FLOOR, LOOP, BANDS, SPIN, BMAX, NB, H, init_black_hole = __esm({
  "node_modules/ascii.rest/dist/pieces/black-hole.js"() {
    meta = {
      name: "black hole",
      category: "space",
      note: "a black hole, its lensed disk turning, one side brighter",
      cols: 64,
      rows: 20,
      fps: 15
    }, RAMP = " .:-=+*#%@", SX = 3, SY = 4, D = 30, IN = 3, OUT = 9, TILT = 0.15, SPAN = 0.34, GAIN = 1.6, FLOOR = 0.03, LOOP = 60, BANDS = 12, SPIN = 7, BMAX = 12, NB = 1500, H = 0.02;
  }
});

// node_modules/ascii.rest/dist/pieces/earth.js
var earth_exports = {};
__export(earth_exports, {
  default: () => earth,
  meta: () => meta2
});
function mulberry322(a) {
  return () => {
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function earth() {
  let { cols, rows } = meta2, cx = cols / 2, cy = rows / 2, R3 = rows / 2 - 1, land = new Float32Array(MW * MH);
  for (let r = 0; r < MH; r++)
    for (let c = 0; c < MW; c++)
      land[r * MW + c] = MAP[r][c] === "#" ? 1 : 0;
  let at = (u, v) => {
    let x = u - 0.5, y = Math.min(MH - 1, Math.max(0, v - 0.5)), x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, y1 = Math.min(MH - 1, y0 + 1), a = (x0 % MW + MW) % MW, b = (a + 1) % MW, top = land[y0 * MW + a] * (1 - fx) + land[y0 * MW + b] * fx, bot = land[y1 * MW + a] * (1 - fx) + land[y1 * MW + b] * fx;
    return top * (1 - fy) + bot * fy;
  }, m = Math.hypot(-0.42, 0.28, 0.86), [lx, ly, lz] = [-0.42 / m, 0.28 / m, 0.86 / m], hm = Math.hypot(lx, ly, lz + 1), [hx, hy, hz] = [lx / hm, ly / hm, (lz + 1) / hm], cells = [], cT = Math.cos(TILT2), sT = Math.sin(TILT2);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      let s = [];
      for (let j = 0; j < SS; j++)
        for (let i = 0; i < SS; i++) {
          let x = (c + (i + 0.5) / SS - cx) / (2 * R3), y = (cy - r - (j + 0.5) / SS) / R3, d = x * x + y * y;
          if (d >= 1)
            continue;
          let z = Math.sqrt(1 - d), py = y * cT + z * sT, pz = z * cT - y * sT, lat = Math.asin(py), lon = Math.atan2(x, pz);
          s.push(lon, (Math.PI / 2 - lat) / Math.PI * MH, Math.max(0, x * lx + y * ly + z * lz), Math.max(0, x * hx + y * hy + z * hz) ** 300);
        }
      cells.push(s);
    }
  let inside = (c, r) => c >= 0 && c < cols && r >= 0 && r < rows && cells[r * cols + c].length * 2 >= 4 * SS * SS, limb = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (inside(c, r))
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++)
            inside(c + dc, r + dr) || (limb[r * cols + c] = 1);
  let rim = (c, r) => limb[r * cols + c] === 1, rand = mulberry322(5), stars = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      Math.hypot((c + 0.5 - cx) / (2 * R3), (cy - r - 0.5) / R3) > 1.1 && rand() < 0.03 && (stars[r * cols + c] = 1);
  let crest = (u, v) => {
    let h2 = Math.sin(Math.floor(u * 1.5) * 12.9898 + Math.floor(v * 1.5) * 78.233) * 43758.5453;
    return h2 - Math.floor(h2) < 0.12;
  };
  return (t, { paper = !1 } = {}) => {
    let turn = (START - 360 * (t % DAY) / DAY) * Math.PI / 180, out = "";
    for (let r = 0; r < rows; r++) {
      r && (out += `
`);
      for (let c = 0; c < cols; c++) {
        if (!inside(c, r)) {
          out += stars[r * cols + c] ? "." : " ";
          continue;
        }
        let s = cells[r * cols + c], v = 0, l = 0, g = 0, u0 = 0;
        for (let i = 0; i < s.length; i += 4) {
          let u = ((s[i] + turn) / (2 * Math.PI) + 0.5) * MW % MW;
          u < 0 && (u += MW), i || (u0 = u), l += at(u, s[i + 1]), v += s[i + 2], g += s[i + 3];
        }
        let k = s.length / 4;
        v /= k, l /= k, g /= k, l >= 0.5 ? v < 0.03 ? out += rim(c, r) ? "." : "\xB7" : out += (paper ? PAPER_LAND : LAND)[Math.min(LAND.length - 1, Math.floor((paper ? 1 - v : v) * 1.15 * LAND.length))] : v < 0.1 ? out += rim(c, r) ? "." : " " : g > 0.4 ? out += "=" : v > 0.5 && (g > 0.08 || crest(u0, s[1])) ? out += "~" : out += v > 0.5 ? "-" : ".";
      }
    }
    return out;
  };
}
var meta2, MAP, MW, MH, LAND, PAPER_LAND, DAY, START, TILT2, SS, init_earth = __esm({
  "node_modules/ascii.rest/dist/pieces/earth.js"() {
    meta2 = {
      name: "earth",
      category: "space",
      note: "a lit globe turning, continents from a five-degree map",
      cols: 60,
      rows: 30,
      fps: 20
    }, MAP = [
      "                                                                        ",
      "                     ##   ######                                        ",
      "             ###################       #                #               ",
      "           ###########   #######                  ###########           ",
      "#  ##############   ###  #####         #################################",
      "   ##############    ##   ##    #    ### ############################## ",
      "    #    #########  ####           # ## ########################   ##   ",
      "          ###############         ## ###########################        ",
      "           #############           #############################        ",
      "           ###########            ### ####  ## ###############  #       ",
      "           ##########             ##     ################### #          ",
      "            ########              ##### #  #################  #         ",
      "             ####  #             ###########################            ",
      "               ##                ###############  #########             ",
      "                ###              ##############    ##  ###  #           ",
      "                  ##             #############     #    ##  #           ",
      "                    #####         ############          #   #           ",
      "                    ######            #######          ## ##            ",
      "                    ########          ######            # ### ##        ",
      "                    #########         ######             ##    ###      ",
      "                     ########          #####                  #         ",
      "                      ######          ###### #               ####       ",
      "                      ######           ####  #             #######      ",
      "                      ####             ####                ########     ",
      "                     ####              ###                 #######      ",
      "                     ###                                        ##      ",
      "                     ##                                               # ",
      "                     ##                                                 ",
      "                     #                                                  ",
      "                                                                        ",
      "                                                                        ",
      "                       #                       ##################       ",
      "                    ####        ######################################  ",
      "  ####################################################################  ",
      "########################################################################",
      "########################################################################"
    ], MW = 72, MH = 36, LAND = ":+*#%@", PAPER_LAND = "##%%%@", DAY = 36, START = 20, TILT2 = 0.3, SS = 2;
  }
});

// node_modules/ascii.rest/dist/pieces/eclipse.js
var eclipse_exports = {};
__export(eclipse_exports, {
  default: () => eclipse,
  meta: () => meta3
});
function mulberry323(a) {
  return () => {
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function eclipse() {
  let { cols, rows } = meta3, n = RAMP2.length - 1, rand = mulberry323(11), X = (c) => (c - cols / 2) / (2 * R), Y = (r) => (rows / 2 - r) / R, limb = Array.from({ length: 5 }, (_, k) => [3 + 4 * k + Math.floor(rand() * 3), rand() * 6.283, 6e-3 / (1 + k * 0.4)]), moonR = (a) => MOON + limb.reduce((s, [k, p, h2]) => s + h2 * Math.sin(k * a + p), 0), corona = new Float32Array(cols * rows), ring2 = new Float32Array(cols * rows), angle = new Float32Array(cols * rows), stars = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      let k = r * cols + c, x = X(c + 0.5), y = Y(r + 0.5), d = Math.hypot(x, y), a = Math.atan2(y, x);
      if (angle[k] = a, d < 1)
        continue;
      let s = 0;
      for (let [at, w, fall, amp] of STREAMERS) {
        let off = wrap(a - at) / (w / d ** 1.7);
        s += amp * Math.exp(-off * off) * Math.exp(-(d - 1) / fall);
      }
      let pole = Math.exp(-(((Math.abs(a) - Math.PI / 2) / 0.4) ** 2)) * (0.5 + 0.5 * Math.cos(26 * a));
      ring2[k] = Math.exp(-(d - 1) / 0.07);
      for (let [at, size] of PROMS) {
        let px = Math.cos(at) * (1 + size), py = Math.sin(at) * (1 + size);
        ring2[k] += 1.4 * Math.exp(-(((x - px) / size) ** 2 + ((y - py) / (size * 0.8)) ** 2));
      }
      corona[k] = 0.25 * Math.exp(-(d - 1) / 0.16) + s + 0.3 * pole * Math.exp(-(d - 1) / 0.2), d > 1.7 && corona[k] < 0.02 && rand() < 0.014 && (stars[k] = 1);
    }
  return stars[2 * cols + Math.round(cols / 2 - 2.4 * 2 * R)] = 2, (t) => {
    let tau = ((t - MID + LOOP2 / 2) % LOOP2 + LOOP2) % LOOP2 - LOOP2 / 2, d = 0.035 * tau + 515e-5 * tau ** 3, mx = d * Math.cos(TILT3) + MISS * Math.sin(TILT3), my = -d * Math.sin(TILT3) + MISS * Math.cos(TILT3), off = Math.hypot(mx, my), gap = off + 1 - MOON, show = 1 - smooth(0, 0.07, gap), flare = smooth(0, -0.03, gap), bead = smooth(-4e-3, 0.01, gap) * (1 - smooth(0.04, 0.09, gap)), glow = 0.75 + 0.45 * smooth(0, -0.055, gap), out = new Array(cols * rows);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        let k = r * cols + c, lit = 0, moon = 0;
        for (let j = 0; j < SS2; j++)
          for (let i2 = 0; i2 < SS2; i2++) {
            let x = X(c + (i2 + 0.5) / SS2), y = Y(r + (j + 0.5) / SS2), dx = x - mx, dy = y - my, dm = Math.hypot(dx, dy);
            if (dm < MOON + 0.02 && (dm < MOON - 0.02 || dm < moonR(Math.atan2(dy, dx))))
              moon++;
            else {
              let q = 1 - x * x - y * y;
              q > 0 && (lit += 0.72 + 0.28 * Math.sqrt(q));
            }
          }
        lit /= SS2 * SS2;
        let i = lit > 0 ? Math.round(Math.max(lit ** 0.7, 0.2) * n) : 0;
        if (moon < SS2 * SS2 && corona[k] + ring2[k] > 0) {
          let a = angle[k], shimmer = 1 + 0.25 * Math.sin(9 * a + 1.9 * t) * Math.sin(5 * a - 1.2 * t), cv = (corona[k] + 1.3 * ring2[k] * shimmer) * glow;
          i = Math.max(i, Math.min(n, Math.floor(Math.min(1, cv * show) ** 0.8 * (1 - moon / (SS2 * SS2)) * n + 0.1)));
        }
        i === 0 && stars[k] && flare > 0.4 ? out[k] = stars[k] === 2 ? "*" : "." : i === 0 && moon > 0 && moon < SS2 * SS2 && show < 0.5 ? out[k] = "." : out[k] = RAMP2[i];
      }
    if (bead > 0.05) {
      let bx = cols / 2 - mx / off * 2 * R, by = rows / 2 + my / off * R, put = (dc, dr, ch) => {
        let c = Math.floor(bx + dc), r = Math.floor(by + dr);
        c >= 0 && c < cols && r >= 0 && r < rows && (out[r * cols + c] = ch);
      }, arm = bead > 0.5 ? 2 : 1;
      for (let s = 1; s <= arm; s++) {
        let ch = s === arm ? "-" : "=";
        put(s, 0, ch), put(-s, 0, ch);
      }
      bead > 0.4 && (put(0, -1, bead > 0.75 ? "|" : ":"), put(0, 1, bead > 0.75 ? "|" : ":")), put(0, 0, "@");
    }
    let lines = [];
    for (let r = 0; r < rows; r++)
      lines.push(out.slice(r * cols, (r + 1) * cols).join(""));
    return lines.join(`
`);
  };
}
var meta3, RAMP2, R, MOON, LOOP2, MID, TILT3, MISS, SS2, STREAMERS, PROMS, smooth, wrap, init_eclipse = __esm({
  "node_modules/ascii.rest/dist/pieces/eclipse.js"() {
    meta3 = {
      name: "eclipse",
      category: "space",
      note: "the moon slides over the sun; diamond ring, then corona",
      cols: 64,
      rows: 27,
      fps: 20
    }, RAMP2 = " .:-=+*#%@", R = 6, MOON = 1.06, LOOP2 = 18, MID = 5.3, TILT3 = 0.2, MISS = 5e-3, SS2 = 3, STREAMERS = [[0.1, 0.42, 0.44, 0.85], [3.28, 0.45, 0.44, 0.8], [0.85, 0.15, 0.5, 0.6], [2.35, 0.16, 0.48, 0.6], [-0.6, 0.15, 0.45, 0.55], [3.9, 0.14, 0.42, 0.5]], PROMS = [[2.9, 0.06], [-0.9, 0.05], [0.5, 0.04]];
    smooth = (a, b, x) => {
      let u = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return u * u * (3 - 2 * u);
    }, wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  }
});

// node_modules/ascii.rest/dist/pieces/galaxy.js
var galaxy_exports = {};
__export(galaxy_exports, {
  default: () => galaxy,
  meta: () => meta4
});
function galaxy() {
  let { cols, rows } = meta4, cx = cols / 2, cy = rows / 2, R3 = 28, INC = 0.78, PA = -0.14, cpa = Math.cos(PA), spa = Math.sin(PA), WIND = 1 / Math.tan(0.5), PATTERN = 0.1, rand = mulberry324(11), stars = Array.from({ length: 110 }, () => ({
    r: 0.3 + 0.62 * Math.sqrt(rand()),
    a: rand() * TAU,
    b: 0.2 + 0.2 * rand()
  })), field = new Float32Array(cols * rows), bg = [];
  for (let gy = 0; gy < 4; gy++)
    for (let gx = 0; gx < 6; gx++)
      for (let tries = 0; tries < 6; tries++) {
        let c = 1 + Math.floor((gx + rand()) / 6 * (cols - 2)), r = 1 + Math.floor((gy + rand()) / 4 * (rows - 2)), x = c - cx, y = (r - cy) * 2, u = (x * cpa + y * spa) / R3, v = (-x * spa + y * cpa) / (R3 * INC);
        if (!(u * u + v * v < 1.4)) {
          bg.push([c + r * cols, rand() < 0.2 ? "+" : "."]);
          break;
        }
      }
  let light = (x, y, turn) => {
    let u = (x * cpa + y * spa) / R3, v = (-x * spa + y * cpa) / (R3 * INC), r = Math.hypot(u, v);
    if (r > 1.1)
      return 0;
    let phi = Math.atan2(v, u), bulge = 1.6 * Math.exp(-((Math.hypot(u, v * INC * 1.4) / 0.17) ** 2)), disc = 0.15 * Math.exp(-r / 0.3), w = 2 * (phi - turn - Math.log(r + 1e-6) * WIND), arm = (0.5 + 0.5 * Math.cos(w)) ** 3.5, dust = (0.5 + 0.5 * Math.cos(w - 1.3)) ** 8, s = Math.min(1, Math.max(0, (r - 0.12) / 0.16)), reach = s * s * (3 - 2 * s) * (1.3 - 0.8 * r) * Math.exp(-((r / 0.8) ** 3));
    return (bulge + disc + arm * reach) * (1 - 0.75 * dust * reach * Math.min(1, r / 0.3));
  };
  return (t) => {
    let turn = -PATTERN * t;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        let x = c + 0.5 - cx, y = (r + 0.25 - cy) * 2, y2 = (r + 0.75 - cy) * 2;
        field[c + r * cols] = (light(x, y, turn) + light(x, y2, turn)) / 2;
      }
    for (let s of stars) {
      let a = s.a - s.b * t / (s.r + 0.08), u = s.r * Math.cos(a) * R3, v = s.r * Math.sin(a) * R3 * INC, x = u * cpa - v * spa, y = u * spa + v * cpa, c = Math.floor(cx + x), r = Math.floor(cy + y / 2);
      c >= 0 && c < cols && r >= 0 && r < rows && (field[c + r * cols] *= 1.6);
    }
    let out = new Array(cols * rows);
    for (let k = 0; k < cols * rows; k++) {
      let b = 1 - Math.exp(-1.8 * field[k]);
      out[k] = RAMP3[Math.min(RAMP3.length - 1, Math.floor(b * RAMP3.length))];
    }
    for (let [k, ch] of bg)
      out[k] === " " && (out[k] = ch);
    let lines = [];
    for (let r = 0; r < rows; r++)
      lines.push(out.slice(r * cols, (r + 1) * cols).join(""));
    return lines.join(`
`);
  };
}
var meta4, RAMP3, TAU, mulberry324, init_galaxy = __esm({
  "node_modules/ascii.rest/dist/pieces/galaxy.js"() {
    meta4 = {
      name: "galaxy",
      category: "space",
      note: "a tilted spiral galaxy turning, its inner stars the fastest",
      cols: 64,
      rows: 26,
      fps: 20
    }, RAMP3 = " .:-=+*#%@", TAU = Math.PI * 2, mulberry324 = (a) => () => {
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
});

// node_modules/ascii.rest/dist/pieces/planet.js
var planet_exports = {};
__export(planet_exports, {
  default: () => planet,
  meta: () => meta5
});
function ring(r) {
  for (let [a, b, p, q, w] of RINGS)
    if (r >= a && r < b)
      return albedo = w, p + (q - p) * (r - a) / (b - a);
  return 0;
}
function cloud(lat, lon) {
  let w = lat + 0.05 * Math.sin(4 * lon + 6 * lat) + 0.03 * Math.sin(9 * lon - 4 * lat + 1), s = Math.cos(w * 7.2), v = 0.5 + 0.42 * smooth2(-0.35, 0.35, s) - 0.28 * Math.exp(-((s / 0.16) ** 2));
  v += 0.06 * Math.sin(lon * 7 + lat * 21);
  let d = ((((lon + 0.6) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) * Math.cos(lat) / 0.42) ** 2 + ((lat - 0.42) / 0.12) ** 2;
  return d < 1 && (v = d > 0.45 ? 0.3 : 1), v * (1 - 0.35 * Math.abs(Math.sin(lat)) ** 4);
}
function mulberry325(a) {
  return () => {
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function planet() {
  let { cols, rows } = meta5, cr = Math.cos(ROLL), sr = Math.sin(ROLL), lines = new Array(rows), rand = mulberry325(7), stars = Array.from({ length: 14 }, () => [1 + Math.floor(rand() * (cols - 2)), Math.floor(rand() * rows), rand() * 6.283]), sample = (px, py, spin) => {
    let x = cr * px - sr * py, y = sr * px + cr * py, r2 = x * x + y * y, globe = -1, gz = -1 / 0;
    if (r2 < RP * RP) {
      let z2 = Math.sqrt(RP * RP - r2), n = [x / RP, y / RP, z2 / RP];
      gz = z2;
      let lat = Math.asin(dot(n, AXIS)), lon = Math.atan2(n[0], dot(n, E2)) - spin, lit = smooth2(-0.08, 0.4, dot(n, SUN)), s = -(y * AXIS[1] + z2 * AXIS[2]) / dot(SUN, AXIS), shade = s > 0 ? 1 - 0.75 * ring(Math.hypot(x + s * SUN[0], y + s * SUN[1], z2 + s * SUN[2]) / RP) : 1;
      globe = 0.86 * cloud(lat, lon) * lit * shade * (0.7 + 0.3 * n[2]);
    }
    let z = -y * AXIS[1] / AXIS[2], op = ring(Math.sqrt(r2 + z * z) / RP);
    if (op > 0 && z > gz) {
      let b = x * SUN[0] + y * SUN[1] + z * SUN[2], c = r2 + z * z - RP * RP, v = op * albedo * (b < 0 && b * b > c ? 0.04 : 1);
      return globe < 0 ? v : globe * (1 - op) + v;
    }
    return globe;
  };
  return (t, { paper = !1 } = {}) => {
    let spin = 2 * Math.PI * t / DAY2;
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        let sum = 0, hits = 0;
        for (let k = 0; k < 4; k++) {
          let px = (c + 0.25 + 0.5 * (k & 1) - cols / 2) * 0.5, py = rows / 2 - r - 0.25 - 0.5 * (k >> 1), v = sample(px, py, spin);
          v >= 0 && (sum += v, hits++);
        }
        if (hits < 2) {
          line += " ";
          continue;
        }
        let i = Math.min(RAMP4.length - 1, Math.max(1, Math.round(sum / hits * (RAMP4.length - 1))));
        paper && (i = RAMP4.length - i), line += RAMP4[i];
      }
      lines[r] = line;
    }
    for (let [c, r, p] of stars) {
      if (lines[r][c] !== " ")
        continue;
      let ch = p < 2 && Math.sin(t * 0.9 + p * 3) < -0.3 ? " " : p < 4 ? "\xB7" : ".";
      lines[r] = lines[r].slice(0, c) + ch + lines[r].slice(c + 1);
    }
    return lines.join(`
`);
  };
}
var meta5, RAMP4, RP, TILT4, ROLL, DAY2, RINGS, unit, SUN, AXIS, E2, dot, smooth2, albedo, init_planet = __esm({
  "node_modules/ascii.rest/dist/pieces/planet.js"() {
    meta5 = {
      name: "planet",
      category: "space",
      note: "a banded ringed planet turning, with shadows both ways",
      cols: 64,
      rows: 18,
      fps: 20
    }, RAMP4 = " .,:-=+*#%@", RP = 6.5, TILT4 = 0.4, ROLL = 0.2, DAY2 = 18, RINGS = [
      [1.22, 1.48, 0.3, 0.5, 0.1],
      [1.5, 1.9, 0.85, 1, 1],
      [1.98, 2.16, 0.8, 0.65, 0.85]
    ], unit = (v) => v.map((c) => c / Math.hypot(...v)), SUN = unit([-0.42, 0.34, 0.84]), AXIS = [0, Math.cos(TILT4), Math.sin(TILT4)], E2 = [0, -Math.sin(TILT4), Math.cos(TILT4)], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], smooth2 = (e0, e1, x) => {
      let u = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
      return u * u * (3 - 2 * u);
    }, albedo = 0;
  }
});

// node_modules/ascii.rest/dist/pieces/torus-knot.js
var torus_knot_exports = {};
__export(torus_knot_exports, {
  default: () => torusKnot,
  meta: () => meta6
});
function torusKnot() {
  let { cols, rows } = meta6, TUBE = 0.28, NU = 720, NV = 32, curve = (u, o) => {
    let r = 2 + Math.cos(3 * u);
    o[0] = r * Math.cos(2 * u), o[1] = r * Math.sin(2 * u), o[2] = -Math.sin(3 * u);
  }, px = new Float32Array(NU * NV), py = new Float32Array(NU * NV), pz = new Float32Array(NU * NV), nx = new Float32Array(NU * NV), ny = new Float32Array(NU * NV), nz = new Float32Array(NU * NV), c = [0, 0, 0], d = [0, 0, 0];
  for (let i = 0; i < NU; i++) {
    let u = i / NU * 6.2832;
    curve(u, c), curve(u + 1e-3, d);
    let tx = d[0] - c[0], ty = d[1] - c[1], tz = d[2] - c[2], tl = Math.hypot(tx, ty, tz);
    tx /= tl, ty /= tl, tz /= tl;
    let ax = ty, ay = -tx, al = Math.hypot(ax, ay);
    ax /= al, ay /= al;
    let bx = -tz * ay, by = tz * ax, bz = tx * ay - ty * ax;
    for (let j = 0; j < NV; j++) {
      let v = j / NV * 6.2832, cv = Math.cos(v), sv = Math.sin(v), k = i * NV + j;
      nx[k] = ax * cv + bx * sv, ny[k] = ay * cv + by * sv, nz[k] = bz * sv, px[k] = c[0] + TUBE * nx[k], py[k] = c[1] + TUBE * ny[k], pz[k] = c[2] + TUBE * nz[k];
    }
  }
  let D2 = 11, ASPECT = 0.5, view = (t) => [t * 0.3, 0.48 - 0.28 * Math.cos(t * 0.35)], mx = 0, my = 0;
  for (let a = 0; a < 6.283; a += 0.1)
    for (let T = 0.2; T <= 0.77; T += 0.07) {
      let cS = Math.cos(a), sS = Math.sin(a), cT = Math.cos(T), sT = Math.sin(T);
      for (let k = 0; k < NU * NV; k += 7) {
        let x = cS * px[k] - sS * py[k], y = cT * (sS * px[k] + cS * py[k]) - sT * pz[k], z = sT * (sS * px[k] + cS * py[k]) + cT * pz[k];
        mx = Math.max(mx, Math.abs(x) / (D2 - z)), my = Math.max(my, Math.abs(y) / (D2 - z));
      }
    }
  let K2 = Math.min((cols - 2) / 2 / mx, (rows - 2) / 2 / ASPECT / my), GAP = TUBE * 0.9, m = Math.hypot(-0.35, 0.45, 1), [lx, ly, lz] = [-0.35 / m, 0.45 / m, 1 / m], hm = Math.hypot(lx, ly, lz + 1), [hx, hy, hz] = [lx / hm, ly / hm, (lz + 1) / hm], n = cols * rows, out = new Array(n), depth = new Float32Array(n), along = new Int16Array(n), cut = new Uint8Array(n), stack = new Int32Array(n), part = new Int32Array(n), N = RAMP5.length - 1;
  return (t, { paper = !1 } = {}) => {
    let [S2, T] = view(t), cS = Math.cos(S2), sS = Math.sin(S2), cT = Math.cos(T), sT = Math.sin(T), r00 = cS, r01 = -sS, r10 = cT * sS, r11 = cT * cS, r12 = -sT, r20 = sT * sS, r21 = sT * cS, r22 = cT;
    out.fill(" "), depth.fill(0);
    for (let k = 0; k < NU * NV; k++) {
      let wz = r20 * nx[k] + r21 * ny[k] + r22 * nz[k];
      if (wz < -0.15)
        continue;
      let x = r00 * px[k] + r01 * py[k], y = r10 * px[k] + r11 * py[k] + r12 * pz[k], z = r20 * px[k] + r21 * py[k] + r22 * pz[k], ooz = 1 / (D2 - z), col = Math.floor(cols / 2 + K2 * ooz * x), row = Math.floor(rows / 2 - K2 * ASPECT * ooz * y);
      if (col < 0 || col >= cols || row < 0 || row >= rows)
        continue;
      let q = col + row * cols;
      if (z + 20 <= depth[q])
        continue;
      depth[q] = z + 20, along[q] = k / NV | 0;
      let wx = r00 * nx[k] + r01 * ny[k], wy = r10 * nx[k] + r11 * ny[k] + r12 * nz[k], diff = Math.max(0, wx * lx + wy * ly + wz * lz), spec = Math.max(0, wx * hx + wy * hy + wz * hz) ** 24, i = Math.round(Math.min(1, 0.08 + diff * 0.8 + spec * 0.5) * N);
      out[q] = RAMP5[paper ? N - i : i];
    }
    let over = (q, p) => {
      if (depth[p] <= depth[q] + GAP)
        return !1;
      let s = Math.abs(along[p] - along[q]);
      return Math.min(s, NU - s) > NU / 16;
    };
    for (let q = 0; q < n; q++) {
      let c2 = q % cols;
      cut[q] = depth[q] > 0 && (c2 > 0 && over(q, q - 1) || c2 < cols - 1 && over(q, q + 1) || q >= cols && over(q, q - cols) || q < n - cols && over(q, q + cols)) ? 1 : 0;
    }
    for (let q = 0; q < n; q++)
      cut[q] && (out[q] = " ", depth[q] = 0);
    part.fill(0);
    for (let q = 0; q < n; q++) {
      if (out[q] === " " || part[q])
        continue;
      let top = 0, size = 0;
      stack[top++] = q, part[q] = 1;
      let seen = [];
      for (; top; ) {
        let p = stack[--top], c2 = p % cols;
        seen.push(p), size++;
        for (let o of [c2 > 0 ? p - 1 : -1, c2 < cols - 1 ? p + 1 : -1, p - cols, p + cols])
          o >= 0 && o < n && !part[o] && out[o] !== " " && (part[o] = 1, stack[top++] = o);
      }
      if (size < 7)
        for (let p of seen)
          out[p] = " ";
    }
    let lines = [];
    for (let r = 0; r < rows; r++)
      lines.push(out.slice(r * cols, (r + 1) * cols).join(""));
    return lines.join(`
`);
  };
}
var meta6, RAMP5, init_torus_knot = __esm({
  "node_modules/ascii.rest/dist/pieces/torus-knot.js"() {
    meta6 = {
      name: "torus knot",
      category: "shapes",
      note: "a trefoil knot drawn as a lit tube, turning slowly",
      cols: 60,
      rows: 28,
      fps: 30
    }, RAMP5 = ".:-=+*#%@";
  }
});

// node_modules/ascii.rest/dist/pieces/matrix-rain.js
var matrix_rain_exports = {};
__export(matrix_rain_exports, {
  default: () => matrixRain,
  meta: () => meta7
});
function hash(a, b, c) {
  let h2 = Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 2246822519);
  return h2 = Math.imul(h2 ^ h2 >>> 13, 1274126177), ((h2 ^ h2 >>> 16) >>> 0) / 4294967296;
}
function matrixRain() {
  let { cols, rows } = meta7, lanes = Array.from({ length: cols }, (_, c) => {
    let kind = c % 2 ? FAR : NEAR, speed = kind.speed[0] + hash(c, 1, 0) * kind.speed[1], cycle = rows * (1 + kind.gap[0] + kind.gap[1] / 2) + kind.len[0] + kind.len[1] / 2;
    return { kind, speed, phase: (c * 0.618034 + hash(c, 3, 0) * 0.2) % 1 * cycle, k: 0, from: 0 };
  }), span = (c, k, kind) => rows + length(c, k, kind) + rows * (kind.gap[0] + hash(c, k, 2) * kind.gap[1]), length = (c, k, kind) => kind.len[0] + Math.floor(hash(c, k, 4) * kind.len[1]), grid = new Array(cols * rows);
  return (t) => {
    grid.fill(" ");
    let tick = Math.floor(t * 20);
    for (let c = 0; c < cols; c++) {
      let lane = lanes[c], { kind, speed, phase } = lane, u = phase + t * speed;
      u < lane.from && (lane.k = 0, lane.from = 0);
      for (let s; u - lane.from >= (s = span(c, lane.k, kind)); lane.k++)
        lane.from += s;
      let k = lane.k, head = Math.floor(u - lane.from), len = length(c, k, kind);
      for (let d = 0; d < len; d++) {
        let r = head - d;
        if (r < 0)
          break;
        if (r >= rows)
          continue;
        let f = d / len, glyphs;
        if (kind === NEAR) {
          if (f > 0.5 && hash(c, r, k * 31 + 7) < ((f - 0.5) / 0.5) ** 2 * 0.8)
            continue;
          glyphs = d === 0 ? HEAD : d < 3 ? COLLAR : f < 0.5 ? BODY : THIN[f < 0.7 ? 0 : f < 0.86 ? 1 : 2];
        } else {
          if (f > 0.7 && hash(c, r, k * 31 + 7) < (f - 0.7) * 2)
            continue;
          glyphs = FAR_SETS[d === 0 ? 0 : f < 0.45 ? 1 : f < 0.8 ? 2 : 3];
        }
        let when = d === 0 ? tick : Math.floor((t + hash(c, r, 5) * 9) * (0.4 + hash(c, r, 6) * 1.6));
        grid[c + r * cols] = glyphs[Math.floor(hash(c, r, when) * glyphs.length)];
      }
    }
    let lines = [];
    for (let r = 0; r < rows; r++)
      lines.push(grid.slice(r * cols, (r + 1) * cols).join(""));
    return lines.join(`
`);
  };
}
var meta7, HEAD, COLLAR, BODY, THIN, FAR_SETS, NEAR, FAR, init_matrix_rain = __esm({
  "node_modules/ascii.rest/dist/pieces/matrix-rain.js"() {
    meta7 = {
      name: "matrix rain",
      category: "effects",
      note: "streams of glyphs falling, heavy at the head, thin behind",
      cols: 63,
      rows: 24,
      fps: 20
    }, HEAD = "@#%&$", COLLAR = "acdeghkmnorsuvxz", BODY = "0123456789ABCDEFHKMNPRSTXZ", THIN = ["acdeghkmnorsuvxz=+*<>", ":;!|il^~", ".,'`"], FAR_SETS = ["=+*<>|", ":;!|il", ":;!|il^~", ".,'`"], NEAR = { speed: [9, 9], len: [12, 10], gap: [0.15, 0.45] }, FAR = { speed: [4, 2.5], len: [10, 6], gap: [1.1, 1.4] };
  }
});

// node_modules/ascii.rest/dist/pieces/radar.js
var radar_exports = {};
__export(radar_exports, {
  default: () => radar,
  meta: () => meta8
});
function radar({ range = 24, unit: unit2 = "nm" } = {}) {
  let { cols, rows } = meta8, CX = 26, CY = 24.5, cell = (x, y) => Math.round(x) + (Math.round(y - 0.01) >> 1) * cols, bearing = (x, y) => (Math.atan2(x - CX, CY - y) + TAU2) % TAU2, back = new Array(cols * rows).fill(" "), four = (x, y, f) => {
    let c = Math.round(x), p = Math.round(y - 0.01);
    for (let [cc, pp] of [[c, p], [2 * CX - c, p], [c, 2 * CY - p], [2 * CX - c, 2 * CY - p]])
      f(cc, pp);
  }, ring2 = new Uint8Array(cols * rows * 2), plot = (c, p) => {
    c >= 0 && c < cols && p >= 0 && p < rows * 2 && (ring2[c + p * cols] = 1);
  }, RB = R2 + 1.5;
  for (let dx = 0; dx <= RB; dx++)
    four(CX + dx, CY - Math.sqrt(RB * RB - dx * dx), plot);
  for (let dy = 0.5; dy <= RB; dy++)
    four(CX + Math.sqrt(RB * RB - dy * dy), CY - dy, plot);
  for (let i = 0; i < cols * rows; i++) {
    let c = i % cols, p = 2 * Math.floor(i / cols), k = ring2[c + p * cols] | ring2[c + (p + 1) * cols] << 1;
    k && (back[i] = HALF[k]);
  }
  for (let rr of [R2 / 3, 2 * R2 / 3]) {
    let path = [];
    for (let i = 0; i <= 200; i++) {
      let a = Math.PI / 2 * (i / 200), x = CX + rr * Math.sin(a), y = CY - rr * Math.cos(a), k = [Math.round(x), Math.round(y - 0.01) >> 1], last = path[path.length - 1];
      (!last || last[0] !== k[0] || last[1] !== k[1]) && path.push(k);
    }
    let kept = [path[0]];
    for (let j = 1; j < path.length; j++) {
      let p = kept[kept.length - 1], n = path[j + 1];
      (!n || Math.abs(p[0] - n[0]) > 1 || Math.abs(p[1] - n[1]) > 1) && kept.push(path[j]);
    }
    for (let [c, r] of kept)
      four(c, 2 * r + 0.5, (cc, pp) => back[cc + (pp >> 1) * cols] = "\xB7");
  }
  back[cell(CX, CY)] = "+";
  let put = (s, c, r) => {
    for (let i = 0; i < s.length; i++)
      back[c + i + r * cols] = s[i];
  };
  put("000", CX - 1, 1), put("180", CX - 1, rows - 2), put("270", 1, 12), put("090", cols - 4, 12);
  let inside = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      let x = c, y = 2 * r + 0.5;
      Math.hypot(x - CX, y - CY) < R2 - 0.3 && inside.push([c + r * cols, bearing(x, y)]);
    }
  let shore = (b) => R2 * (0.66 + 0.09 * Math.sin(b * 5 + 0.6) + 0.05 * Math.sin(b * 13) + 2.2 * Math.max(0, Math.abs(b - 4.15) - 0.62)), isLand = (x, y) => {
    let b = bearing(x, y);
    return b > 3.3 && b < 5 && Math.hypot(x - CX, y - CY) > shore(b);
  }, land = [];
  for (let [i, b] of inside) {
    let c = i % cols, y = 2 * Math.floor(i / cols) + 0.5;
    if (!isLand(c, y))
      continue;
    let edge = [[1, 0], [-1, 0], [0, 2], [0, -2]].some(([dx, dy]) => !isLand(c + dx, y + dy));
    land.push([i, b, edge]);
  }
  let tracks = [
    [1.05, -5, 1.1, 15, 2, 8],
    [3.45, 6, 0.9, -1, 2, 10],
    [5.3, 9, 1.2, 4, 1, 6],
    [2.1, -11, 0.8, -9, 1, 8],
    [0.4, 3, 1.3, -21, 1, 8],
    [4.75, 13, 0.7, 2, 1, 6]
  ].map(([h2, off, v, u, size, gap]) => {
    let L = 2 * Math.sqrt(R2 * R2 - off * off) + gap;
    return { h: h2, off, v, L, u0: u + L / 2, size };
  }), where = (k, t) => {
    let { h: h2, off, v, L, u0 } = tracks[k], u = ((u0 + v * t) % L + L) % L - L / 2;
    return [CX + u * Math.sin(h2) + off * Math.cos(h2), CY - (u * Math.cos(h2) - off * Math.sin(h2))];
  }, out = new Array(cols * rows);
  return (t) => {
    let sweep = t / TURN * TAU2 % TAU2, ago = (b) => ((sweep - b) % TAU2 + TAU2) % TAU2 / TAU2 * TURN;
    for (let i = 0; i < out.length; i++)
      out[i] = back[i];
    for (let [i, b, edge] of land)
      out[i] = SHADE[edge && ago(b) < 1.2 ? 2 : 1];
    for (let [i, b] of inside) {
      let a = ago(b) / TURN * TAU2;
      a < TRAIL && (out[i] = SHADE[a < 0.08 ? 3 : a < 0.3 ? 2 : Math.max(1, SHADE.indexOf(out[i]))]);
    }
    let seen = 0;
    for (let k = 0; k < tracks.length; k++) {
      let [x0, y0] = where(k, t), s = ago(bearing(x0, y0)), [x, y] = where(k, t - s);
      if (Math.hypot(x - CX, y - CY) > R2 - 1.2 || isLand(x, y))
        continue;
      seen++;
      let g = Math.exp(-s / FADE), ch = SHADE[g > 0.7 ? 4 : g > 0.42 ? 3 : 2], i = cell(x, y);
      out[i] = ch, tracks[k].size > 1 && (out[i + 1] = ch);
    }
    let deg = String(Math.round(sweep * 180 / Math.PI) % 360).padStart(3, "0"), lines = [];
    for (let r = 0; r < rows; r++)
      lines.push(out.slice(r * cols, (r + 1) * cols).join(""));
    let corner = (r, l, rt) => lines[r] = l + lines[r].slice(l.length, cols - rt.length) + rt;
    return corner(1, ` brg ${deg}\xB0`, `rng ${range} ${unit2} `), corner(rows - 2, ` contacts ${seen}`, `rings ${Math.round(range / 3)} ${unit2} `), lines.join(`
`);
  };
}
var meta8, R2, TURN, TRAIL, FADE, HALF, SHADE, TAU2, init_radar = __esm({
  "node_modules/ascii.rest/dist/pieces/radar.js"() {
    meta8 = {
      name: "radar",
      category: "data",
      note: "rotating sweep with afterglow, contacts fade between passes",
      cols: 53,
      rows: 25,
      fps: 30,
      options: { range: 24, unit: "nm" }
    }, R2 = 19, TURN = 4, TRAIL = 0.8, FADE = 2.4, HALF = [" ", "\u2580", "\u2584", "\u2588"], SHADE = " \u2591\u2592\u2593\u2588", TAU2 = Math.PI * 2;
  }
});

// node_modules/ascii.rest/dist/pieces/synthwave.js
var synthwave_exports = {};
__export(synthwave_exports, {
  default: () => synthwave,
  meta: () => meta9
});
function synthwave() {
  let { cols, rows } = meta9, FR = rows - HZ, cx = cols / 2, MID2 = Math.floor(cx), g = Array.from({ length: rows }, () => new Array(cols)), rand = mulberry326(5), H2 = [6];
  for (let c = 1; c <= cols; c++) {
    let d = Math.abs(c - cx) / cx, want = 1 + 6 * (d - 0.25) + 1.5 * Math.sin(c * 0.45), h2 = H2[c - 1], r = rand(), step = r < 0.6 ? Math.sign(Math.round(want - h2)) : r < 0.8 ? 1 : -1;
    d < 0.25 ? step = h2 > 0 ? -1 : 0 : (h2 + step < 0 || h2 + step > 7) && (step = 0), H2.push(h2 + step);
  }
  let stars = [];
  for (let i = 0; i < 24; i++)
    stars.push([Math.floor(rand() * cols), Math.floor(rand() * (HZ - 3)), rand()]);
  let band = (k) => 0.2 * k + 0.3 * k * k / 26, sun = (c, p, s) => {
    let dx = c + 0.5 - cx, dy = p + 0.5 - SUN_Y;
    if (dx * dx + dy * dy > SUN_R * SUN_R)
      return 0;
    let k = p - (SUN_Y - 7);
    return k < 0 || Math.floor(band(k + 1) - s) === Math.floor(band(k) - s) ? 1 : 0;
  }, count = new Array(FR), level = new Array(FR), both = (row, c, l, r) => {
    c >= 0 && c < cols && (row[c] = l), 2 * MID2 - c >= 0 && 2 * MID2 - c < cols && (row[2 * MID2 - c] = r);
  };
  return (t) => {
    for (let r = 0; r < rows; r++)
      g[r].fill(" ");
    for (let [c, r, p] of stars) {
      let tw = Math.sin(t * (0.8 + p) + p * 30);
      g[r][c] = tw > 0.6 ? p < 0.3 ? "+" : "\xB7" : tw > -0.4 ? "." : " ";
    }
    let s = t * 0.6;
    for (let r = 0; r < HZ; r++)
      for (let c = 0; c < cols; c++) {
        let top = sun(c, 2 * r, s), bot = sun(c, 2 * r + 1, s);
        (top || bot) && (g[r][c] = " \u2580\u2584\u2588"[top + 2 * bot]);
      }
    for (let c = 0; c < cols; c++) {
      let a = H2[c], b = H2[c + 1];
      if (!a && !b)
        continue;
      let top = HZ - 1 - Math.min(a, b);
      g[top][c] = b > a ? "/" : b < a ? "\\" : "_";
      for (let r = top + 1; r < HZ; r++)
        g[r][c] = " ";
    }
    let n0 = t * SPEED % 1;
    count.fill(0);
    for (let n = 1; n < 400; n++) {
      let e = K / (n - n0);
      if (e >= FR)
        continue;
      if (e < 1)
        break;
      let y = Math.floor(e);
      count[y]++, level[y] = Math.min(2, Math.floor(e % 1 * 3));
    }
    let kind = count.map((k, y) => y === 0 ? "\u2591" : y === 1 ? "\u2550" : y < FAR2 ? "\u2500" : k > 1 ? "\u2550" : k ? LEVEL[level[y]] : " "), VX = MID2 + 0.5;
    for (let y = 0; y < FR; y++) {
      let row = g[HZ + y], k = kind[y];
      if (row.fill(k), y === 0)
        continue;
      row[MID2] = k === "\u2500" ? "\u253C" : k === "\u2550" ? "\u256A" : "\u2502";
      let every = S * (y + 0.5) >= 2.4 ? 1 : 2 * S * (y + 0.5) >= 2.4 ? 2 : 4;
      for (let m = every; m <= RAILS; m += every) {
        let sl = m * S, xt = VX - sl * y, xb = VX - sl * (y + 1);
        if (xt < 0)
          break;
        if (sl < 1.3) {
          let c = Math.floor(VX - sl * (y + 0.5));
          both(row, c, "/", "\\");
          continue;
        }
        let hi = Math.floor(xt - 1e-6), lo = Math.floor(xb);
        if (k === " " && y >= m)
          for (let c = Math.max(0, lo + 1); c < hi; c++)
            both(row, c, "_", "_");
        both(row, hi, "/", "\\");
      }
    }
    return g.map((row) => row.join("")).join(`
`);
  };
}
var meta9, HZ, SUN_R, SUN_Y, K, FAR2, S, RAILS, SPEED, LEVEL, mulberry326, init_synthwave = __esm({
  "node_modules/ascii.rest/dist/pieces/synthwave.js"() {
    meta9 = {
      name: "synthwave",
      category: "effects",
      note: "a grid rolling toward a striped sun behind a mountain ridge",
      cols: 65,
      rows: 28,
      fps: 20
    }, HZ = 12, SUN_R = 13, SUN_Y = 2 * HZ - 6, K = 24, FAR2 = 5, S = 0.7, RAILS = 6, SPEED = 0.9, LEVEL = ["\u2594", "\u2500", "\u2581"], mulberry326 = (a) => () => {
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
});

// src/client.js
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => SOURCE
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);

// node_modules/ascii.rest/dist/mount.js
function mount(el, piece, options = {}) {
  let make = typeof piece == "function" ? piece : piece.default, meta11 = typeof piece == "function" ? {} : piece.meta, { fps = meta11.fps ?? 30, motion = !1, ...rest } = { ...meta11.options, ...options }, frame = make(rest), { cols = 80, rows = 24, palette, ground, cell = 2 } = meta11, canvas = el instanceof HTMLCanvasElement ? el : null, color = palette && canvas ? new Uint8Array(cols * rows) : void 0, rgb2 = (css) => css[0] === "#" ? [1, 3, 5].map((i) => parseInt(css.slice(i, i + 2), 16)) : (css.match(/[\d.]+/g) || []).map(Number), dark = (css) => {
    let c = rgb2(css);
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] < 128;
  }, env = () => ({ paper: canvas && ground ? !dark(ground) : dark(getComputedStyle(el).color), color }), t = !motion && typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches ? meta11.still ?? 0 : 0, draw = () => {
    el.textContent = frame(t, env());
  }, ro;
  if (canvas) {
    let font2 = (px) => `${px}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, ctx = canvas.getContext("2d"), atlas = document.createElement("canvas"), actx = atlas.getContext("2d"), slots = /* @__PURE__ */ new Map(), w = 0, h2 = 0, sw = 0, sh = 0, pw = 0, ph = 0, width = -1, ink = "", xs = new Int32Array(0), ys = new Int32Array(0), gx = new Int32Array(0), gy = new Int32Array(0), last2 = "", full = !0, lastColor = color && new Uint8Array(cols * rows);
    canvas.style.display ||= "block", canvas.style.width ||= "100%", canvas.style.aspectRatio = `${cols} / ${rows * cell}`;
    let size = () => {
      width = canvas.clientWidth, w = width * (devicePixelRatio || 1) / cols, h2 = w * cell, sw = Math.ceil(w), sh = Math.ceil(h2), pw = sw + 2, ph = sh + 2, canvas.width = Math.round(w * cols), canvas.height = Math.round(h2 * rows), atlas.width = pw * 32, atlas.height = ph * 32, xs = Int32Array.from({ length: cols + 1 }, (_, x) => Math.round(x * w)), ys = Int32Array.from({ length: rows + 1 }, (_, y) => Math.round(y * h2)), gx = Int32Array.from({ length: cols }, (_, x) => Math.round(x * w + (w - sw) / 2)), gy = Int32Array.from({ length: rows }, (_, y) => Math.round(y * h2 + (h2 - sh) / 2)), slots.clear(), full = !0;
    }, glyph = (code, i) => {
      let key = code * 256 + i, s = slots.get(key);
      if (s !== void 0)
        return s;
      slots.size === 1024 && (actx.clearRect(0, 0, atlas.width, atlas.height), slots.clear()), s = slots.size;
      let x = s % 32 * pw + 1, y = Math.floor(s / 32) * ph + 1;
      return actx.font = font2(w / 0.6), actx.textAlign = "center", actx.textBaseline = "middle", actx.fillStyle = palette ? palette[i] || palette[0] : ink, actx.save(), actx.beginPath(), actx.rect(x - 1, y - 1, pw, ph), actx.clip(), actx.fillText(String.fromCharCode(code), x + sw / 2, y + sh / 2), actx.restore(), slots.set(key, s), s;
    };
    draw = () => {
      !palette && getComputedStyle(canvas).color !== ink && (ink = getComputedStyle(canvas).color, slots.clear(), actx.clearRect(0, 0, atlas.width, atlas.height), full = !0);
      let text = frame(t, env());
      ground && (ctx.fillStyle = ground), full && (ground ? ctx.fillRect(0, 0, canvas.width, canvas.height) : ctx.clearRect(0, 0, canvas.width, canvas.height));
      for (let k = 0, x = 0, y = 0; k < text.length; k++) {
        let c = text.charCodeAt(k);
        if (c === 10) {
          x = 0, y++;
          continue;
        }
        let i = y * cols + x;
        if (full || c !== last2.charCodeAt(k) || color && color[i] !== lastColor[i]) {
          let x0 = xs[x], y0 = ys[y], cw = xs[x + 1] - x0, ch = ys[y + 1] - y0;
          if (full || (ground ? ctx.fillRect(x0, y0, cw, ch) : ctx.clearRect(x0, y0, cw, ch)), c !== 32) {
            let s = glyph(c, color ? color[i] : 0);
            ctx.drawImage(atlas, s % 32 * pw + 1 + x0 - gx[x], Math.floor(s / 32) * ph + 1 + y0 - gy[y], cw, ch, x0, y0, cw, ch);
          }
        }
        x++;
      }
      last2 = text, color && lastColor.set(color), full = !1;
    }, size(), ro = new ResizeObserver(() => {
      canvas.clientWidth !== width && (size(), draw());
    }), ro.observe(canvas);
  }
  if (draw(), !fps)
    return () => ro?.disconnect();
  let still = matchMedia("(prefers-reduced-motion: reduce)"), raf = 0, last = 0, seen = !1, tick = (now) => {
    raf = requestAnimationFrame(tick);
    let dt = now - last;
    dt < 1e3 / fps - 2 || (last = now, t += Math.min(dt, 100) / 1e3, draw());
  }, run = () => {
    let go = seen && !document.hidden && (motion || !still.matches);
    go && !raf ? (last = performance.now(), raf = requestAnimationFrame(tick)) : !go && raf && (cancelAnimationFrame(raf), raf = 0);
  }, io = new IntersectionObserver((entries) => {
    seen = entries[entries.length - 1].isIntersecting, run();
  });
  return io.observe(el), document.addEventListener("visibilitychange", run), still.addEventListener("change", run), () => {
    io.disconnect(), ro?.disconnect(), cancelAnimationFrame(raf), raf = 0, document.removeEventListener("visibilitychange", run), still.removeEventListener("change", run);
  };
}

// node_modules/ascii.rest/dist/banner.js
var fonts = {
  block: {
    height: 5,
    glyphs: {
      A: ".##.|#..#|####|#..#|#..#",
      B: "###.|#..#|###.|#..#|###.",
      C: ".###|#...|#...|#...|.###",
      D: "###.|#..#|#..#|#..#|###.",
      E: "####|#...|###.|#...|####",
      F: "####|#...|###.|#...|#...",
      G: ".###|#...|#.##|#..#|.###",
      H: "#..#|#..#|####|#..#|#..#",
      I: "#|#|#|#|#",
      J: "...#|...#|...#|#..#|.##.",
      K: "#..#|#.#.|##..|#.#.|#..#",
      L: "#...|#...|#...|#...|####",
      M: "#...#|##.##|#.#.#|#...#|#...#",
      N: "#...#|##..#|#.#.#|#..##|#...#",
      O: ".##.|#..#|#..#|#..#|.##.",
      P: "###.|#..#|###.|#...|#...",
      Q: ".##.|#..#|#..#|#.#.|.#.#",
      R: "###.|#..#|###.|#.#.|#..#",
      S: ".###|#...|.##.|...#|###.",
      T: "#####|..#..|..#..|..#..|..#..",
      U: "#..#|#..#|#..#|#..#|.##.",
      V: "#...#|#...#|#...#|.#.#.|..#..",
      W: "#...#|#...#|#.#.#|##.##|#...#",
      X: "#...#|.#.#.|..#..|.#.#.|#...#",
      Y: "#...#|.#.#.|..#..|..#..|..#..",
      Z: "####|...#|..#.|.#..|####",
      0: "###|#.#|#.#|#.#|###",
      1: ".#.|##.|.#.|.#.|###",
      2: "###|..#|###|#..|###",
      3: "###|..#|.##|..#|###",
      4: "#.#|#.#|###|..#|..#",
      5: "###|#..|###|..#|###",
      6: "###|#..|###|#.#|###",
      7: "###|..#|..#|..#|..#",
      8: "###|#.#|###|#.#|###",
      9: "###|#.#|###|..#|###",
      ".": ".|.|.|.|#",
      ",": ".|.|.|#|#",
      "!": "#|#|#|.|#",
      "?": "###|..#|.##|...|.#.",
      "'": "#|#|.|.|.",
      ":": ".|#|.|#|.",
      "-": "...|...|###|...|...",
      "+": "...|.#.|###|.#.|...",
      "=": "...|###|...|###|...",
      "/": "..#|..#|.#.|#..|#..",
      _: "...|...|...|...|###",
      " ": ".."
    }
  },
  slim: {
    height: 5,
    glyphs: {
      A: ".#.|#.#|###|#.#|#.#",
      B: "##.|#.#|##.|#.#|##.",
      C: ".##|#..|#..|#..|.##",
      D: "##.|#.#|#.#|#.#|##.",
      E: "###|#..|##.|#..|###",
      F: "###|#..|##.|#..|#..",
      G: ".##|#..|#.#|#.#|.##",
      H: "#.#|#.#|###|#.#|#.#",
      I: "###|.#.|.#.|.#.|###",
      J: "..#|..#|..#|#.#|.#.",
      K: "#.#|#.#|##.|#.#|#.#",
      L: "#..|#..|#..|#..|###",
      M: "#.#|###|#.#|#.#|#.#",
      N: "##.|#.#|#.#|#.#|#.#",
      O: ".#.|#.#|#.#|#.#|.#.",
      P: "##.|#.#|##.|#..|#..",
      Q: ".#.|#.#|#.#|##.|.##",
      R: "##.|#.#|##.|#.#|#.#",
      S: ".##|#..|.#.|..#|##.",
      T: "###|.#.|.#.|.#.|.#.",
      U: "#.#|#.#|#.#|#.#|###",
      V: "#.#|#.#|#.#|.#.|.#.",
      W: "#.#|#.#|#.#|###|#.#",
      X: "#.#|#.#|.#.|#.#|#.#",
      Y: "#.#|#.#|.#.|.#.|.#.",
      Z: "###|..#|.#.|#..|###",
      0: "###|#.#|#.#|#.#|###",
      1: ".#.|##.|.#.|.#.|###",
      2: "##.|..#|.#.|#..|###",
      3: "##.|..#|.#.|..#|##.",
      4: "#.#|#.#|###|..#|..#",
      5: "###|#..|##.|..#|##.",
      6: ".##|#..|###|#.#|###",
      7: "###|..#|.#.|.#.|.#.",
      8: "###|#.#|###|#.#|###",
      9: "###|#.#|###|..#|##.",
      ".": ".|.|.|.|#",
      ",": ".|.|.|#|#",
      "!": "#|#|#|.|#",
      "?": "##.|..#|.#.|...|.#.",
      "'": "#|#|.|.|.",
      ":": ".|#|.|#|.",
      "-": "...|...|###|...|...",
      "+": "...|.#.|###|.#.|...",
      "=": "...|###|...|###|...",
      "/": "..#|..#|.#.|#..|#..",
      _: "...|...|...|...|###",
      " ": ".."
    }
  },
  tall: {
    height: 7,
    glyphs: {
      A: ".###.|#...#|#...#|#####|#...#|#...#|#...#",
      B: "####.|#...#|#...#|####.|#...#|#...#|####.",
      C: ".###.|#...#|#....|#....|#....|#...#|.###.",
      D: "###..|#..#.|#...#|#...#|#...#|#..#.|###..",
      E: "#####|#....|#....|####.|#....|#....|#####",
      F: "#####|#....|#....|####.|#....|#....|#....",
      G: ".###.|#...#|#....|#.###|#...#|#...#|.###.",
      H: "#...#|#...#|#...#|#####|#...#|#...#|#...#",
      I: "###|.#.|.#.|.#.|.#.|.#.|###",
      J: "....#|....#|....#|....#|....#|#...#|.###.",
      K: "#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#",
      L: "#....|#....|#....|#....|#....|#....|#####",
      M: "#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#",
      N: "#...#|#...#|##..#|#.#.#|#..##|#...#|#...#",
      O: ".###.|#...#|#...#|#...#|#...#|#...#|.###.",
      P: "####.|#...#|#...#|####.|#....|#....|#....",
      Q: ".###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#",
      R: "####.|#...#|#...#|####.|#.#..|#..#.|#...#",
      S: ".###.|#...#|#....|.###.|....#|#...#|.###.",
      T: "#####|..#..|..#..|..#..|..#..|..#..|..#..",
      U: "#...#|#...#|#...#|#...#|#...#|#...#|.###.",
      V: "#...#|#...#|#...#|#...#|#...#|.#.#.|..#..",
      W: "#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#",
      X: "#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#",
      Y: "#...#|#...#|.#.#.|..#..|..#..|..#..|..#..",
      Z: "#####|....#|...#.|..#..|.#...|#....|#####",
      0: ".###.|#...#|#..##|#.#.#|##..#|#...#|.###.",
      1: "..#|.##|#.#|..#|..#|..#|..#",
      2: ".###.|#...#|....#|...#.|..#..|.#...|#####",
      3: ".###.|#...#|....#|..##.|....#|#...#|.###.",
      4: "...#.|..##.|.#.#.|#..#.|#####|...#.|...#.",
      5: "#####|#....|####.|....#|....#|#...#|.###.",
      6: "..##.|.#...|#....|####.|#...#|#...#|.###.",
      7: "#####|....#|...#.|..#..|..#..|..#..|..#..",
      8: ".###.|#...#|#...#|.###.|#...#|#...#|.###.",
      9: ".###.|#...#|#...#|.####|....#|...#.|.##..",
      ".": ".|.|.|.|.|.|#",
      ",": "..|..|..|..|..|.#|#.",
      "!": "#|#|#|#|#|.|#",
      "?": ".###.|#...#|....#|...#.|..#..|.....|..#..",
      "'": "#|#|.|.|.|.|.",
      ":": ".|.|#|.|.|.|#",
      "-": "....|....|....|####|....|....|....",
      "+": ".....|..#..|..#..|#####|..#..|..#..|.....",
      "=": ".....|.....|#####|.....|#####|.....|.....",
      "/": "....#|....#|...#.|..#..|.#...|#....|#....",
      _: ".....|.....|.....|.....|.....|.....|#####",
      " ": "...|...|...|...|...|...|..."
    }
  },
  bold: {
    height: 7,
    glyphs: {
      A: ".####.|##..##|##..##|######|##..##|##..##|##..##",
      B: "#####.|##..##|##..##|#####.|##..##|##..##|#####.",
      C: ".####.|##..##|##....|##....|##....|##..##|.####.",
      D: "####..|##.##.|##..##|##..##|##..##|##.##.|####..",
      E: "######|##....|##....|#####.|##....|##....|######",
      F: "######|##....|##....|#####.|##....|##....|##....",
      G: ".####.|##..##|##....|##.###|##..##|##..##|.#####",
      H: "##..##|##..##|##..##|######|##..##|##..##|##..##",
      I: "####|.##.|.##.|.##.|.##.|.##.|####",
      J: "....##|....##|....##|....##|##..##|##..##|.####.",
      K: "##..##|##.##.|####..|###...|####..|##.##.|##..##",
      L: "##....|##....|##....|##....|##....|##....|######",
      M: "##....##|###..###|########|##.##.##|##....##|##....##|##....##",
      N: "##...##|###..##|####.##|##.####|##..###|##...##|##...##",
      O: ".####.|##..##|##..##|##..##|##..##|##..##|.####.",
      P: "#####.|##..##|##..##|#####.|##....|##....|##....",
      Q: ".####.|##..##|##..##|##..##|##.###|##.##.|.##.##",
      R: "#####.|##..##|##..##|#####.|##.##.|##..##|##..##",
      S: ".####.|##..##|##....|.####.|....##|##..##|.####.",
      T: "######|..##..|..##..|..##..|..##..|..##..|..##..",
      U: "##..##|##..##|##..##|##..##|##..##|##..##|.####.",
      V: "##..##|##..##|##..##|##..##|##..##|.####.|..##..",
      W: "##....##|##....##|##....##|##.##.##|########|###..###|##....##",
      X: "##..##|##..##|.####.|..##..|.####.|##..##|##..##",
      Y: "##..##|##..##|.####.|..##..|..##..|..##..|..##..",
      Z: "######|....##|...##.|..##..|.##...|##....|######",
      0: ".####.|##..##|##..##|##.###|###.##|##..##|.####.",
      1: "..##|.###|####|..##|..##|..##|..##",
      2: ".####.|##..##|....##|...##.|..##..|.##...|######",
      3: ".####.|##..##|....##|..###.|....##|##..##|.####.",
      4: "...###|..####|.##.##|##..##|######|....##|....##",
      5: "######|##....|#####.|....##|....##|##..##|.####.",
      6: "..###.|.##...|##....|#####.|##..##|##..##|.####.",
      7: "######|....##|...##.|..##..|..##..|..##..|..##..",
      8: ".####.|##..##|##..##|.####.|##..##|##..##|.####.",
      9: ".####.|##..##|##..##|.#####|....##|...##.|.###..",
      ".": "..|..|..|..|..|##|##",
      ",": "..|..|..|..|##|##|#.",
      "!": "##|##|##|##|..|##|##",
      "?": ".####.|##..##|...##.|..##..|......|..##..|..##..",
      "'": "##|##|..|..|..|..|..",
      ":": "..|##|##|..|..|##|##",
      "-": "....|....|....|####|....|....|....",
      "+": "......|..##..|..##..|######|..##..|..##..|......",
      "=": "......|......|######|......|######|......|......",
      "/": "....##|....##|...##.|..##..|.##...|##....|##....",
      _: "......|......|......|......|......|......|######",
      " ": "...|...|...|...|...|...|..."
    }
  },
  round: {
    height: 6,
    glyphs: {
      0: ".###.|#...#|#.#.#|#.#.#|#...#|.###.",
      1: ".#.|##.|.#.|.#.|.#.|###",
      2: ".###.|#...#|...#.|..#..|.#...|#####",
      3: ".###.|#...#|..##.|....#|#...#|.###.",
      4: "...#.|..##.|.#.#.|#..#.|#####|...#.",
      5: "#####|#....|####.|....#|#...#|.###.",
      6: "..##.|.#...|#....|####.|#...#|.###.",
      7: "####.|....#|...#.|..#..|..#..|..#..",
      8: ".###.|#...#|.###.|#...#|#...#|.###.",
      9: ".###.|#...#|.####|....#|...#.|.##..",
      A: ".###.|#...#|#...#|#####|#...#|#...#",
      B: "###..|#..#.|###..|#..#.|#...#|####.",
      C: ".####|#....|#....|#....|#....|.####",
      D: "###..|#..#.|#...#|#...#|#..#.|###..",
      E: ".####|#....|####.|#....|#....|.####",
      F: ".####|#....|####.|#....|#....|#....",
      G: ".####|#....|#....|#.##.|#...#|.###.",
      H: "#...#|#...#|#####|#...#|#...#|#...#",
      I: "###|.#.|.#.|.#.|.#.|###",
      J: "....#|....#|....#|....#|#...#|.###.",
      K: "#...#|#..#.|###..|#..#.|#...#|#...#",
      L: "#....|#....|#....|#....|#....|.####",
      M: "#...#|##.##|#.#.#|#...#|#...#|#...#",
      N: "#...#|##..#|#.#.#|#.#.#|#..##|#...#",
      O: ".###.|#...#|#...#|#...#|#...#|.###.",
      P: ".###.|#...#|#...#|####.|#....|#....",
      Q: ".###.|#...#|#...#|#.#.#|#..#.|.##.#",
      R: ".###.|#...#|#..#.|###..|#..#.|#...#",
      S: ".###.|#....|.##..|...#.|....#|####.",
      T: "#####|..#..|..#..|..#..|..#..|..#..",
      U: "#...#|#...#|#...#|#...#|#...#|.###.",
      V: "#...#|#...#|#...#|.#.#.|.#.#.|..#..",
      W: "#...#|#...#|#...#|#.#.#|#.#.#|.#.#.",
      X: "#...#|.#.#.|..#..|..#..|.#.#.|#...#",
      Y: "#...#|#...#|.#.#.|..#..|..#..|..#..",
      Z: "#####|...#.|..#..|..#..|.#...|#####",
      ".": ".|.|.|.|.|#",
      ",": ".|.|.|.|#|#",
      "!": "#|#|#|#|.|#",
      "?": ".###.|#...#|...#.|..#..|.....|..#..",
      "'": "#|#|.|.|.|.",
      ":": ".|#|.|.|#|.",
      "-": "...|...|###|...|...|...",
      "+": "...|.#.|###|.#.|...|...",
      "=": "...|###|...|###|...|...",
      "/": "..#|..#|.#.|.#.|#..|#..",
      _: "....|....|....|....|....|####",
      " ": "...|...|...|...|...|..."
    }
  },
  wide: {
    height: 5,
    glyphs: {
      0: ".####.|#...##|#.##.#|##...#|.####.",
      1: "..#|.##|..#|..#|..#",
      2: "#####.|.....#|.####.|#.....|######",
      3: "#####.|.....#|.####.|.....#|#####.",
      4: "#...#.|#...#.|######|....#.|....#.",
      5: "######|#.....|#####.|.....#|#####.",
      6: ".####.|#.....|#####.|#....#|.####.",
      7: "######|.....#|....#.|...#..|..#...",
      8: ".####.|#....#|.####.|#....#|.####.",
      9: ".####.|#....#|.#####|.....#|.####.",
      A: ".####.|#....#|######|#....#|#....#",
      B: "#####.|#....#|######|#....#|#####.",
      C: ".#####|#.....|#.....|#.....|.#####",
      D: "#####.|#....#|#....#|#....#|#####.",
      E: "######|#.....|#####.|#.....|######",
      F: "######|#.....|#####.|#.....|#.....",
      G: ".#####|#.....|#..###|#....#|.####.",
      H: "#....#|#....#|######|#....#|#....#",
      I: "###|.#.|.#.|.#.|###",
      J: ".....#|.....#|.....#|#....#|.####.",
      K: "#....#|#...#.|#####.|#...#.|#....#",
      L: "#.....|#.....|#.....|#.....|######",
      M: "#.....#|##...##|#.#.#.#|#..#..#|#.....#",
      N: "#....#|##...#|#.#..#|#..#.#|#...##",
      O: ".####.|#....#|#....#|#....#|.####.",
      P: "#####.|#....#|#####.|#.....|#.....",
      Q: ".####.|#....#|#....#|#...#.|.###.#",
      R: "#####.|#....#|#####.|#...#.|#....#",
      S: ".####.|#.....|.####.|.....#|.####.",
      T: "#######|...#...|...#...|...#...|...#...",
      U: "#....#|#....#|#....#|#....#|.####.",
      V: "#.....#|#.....#|.#...#.|..#.#..|...#...",
      W: "#.....#|#..#..#|#.#.#.#|##...##|#.....#",
      X: "#....#|.#..#.|..##..|.#..#.|#....#",
      Y: "#.....#|.#...#.|..#.#..|...#...|...#...",
      Z: "######|....#.|..##..|.#....|######",
      ".": ".|.|.|.|#",
      ",": ".|.|.|#|#",
      "!": "#|#|#|.|#",
      "?": "#####.|.....#|..###.|......|..#...",
      "'": "#|#|.|.|.",
      ":": ".|#|.|#|.",
      "-": "....|....|####|....|....",
      "+": ".....|..#..|#####|..#..|.....",
      "=": "....|####|....|####|....",
      "/": "....#|...#.|..#..|.#...|#....",
      _: "......|......|......|......|######",
      " ": "....|....|....|....|...."
    }
  },
  mixed: {
    height: 9,
    cased: !0,
    glyphs: {
      A: ".###.|#...#|#...#|#####|#...#|#...#|#...#|.....|.....",
      B: "####.|#...#|#...#|####.|#...#|#...#|####.|.....|.....",
      C: ".###.|#...#|#....|#....|#....|#...#|.###.|.....|.....",
      D: "####.|#...#|#...#|#...#|#...#|#...#|####.|.....|.....",
      E: "#####|#....|#....|####.|#....|#....|#####|.....|.....",
      F: "#####|#....|#....|####.|#....|#....|#....|.....|.....",
      G: ".###.|#...#|#....|#.###|#...#|#...#|.####|.....|.....",
      H: "#...#|#...#|#...#|#####|#...#|#...#|#...#|.....|.....",
      I: "###|.#.|.#.|.#.|.#.|.#.|###|...|...",
      J: "....#|....#|....#|....#|....#|#...#|.###.|.....|.....",
      K: "#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#|.....|.....",
      L: "#....|#....|#....|#....|#....|#....|#####|.....|.....",
      M: "#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#|.....|.....",
      N: "#...#|#...#|##..#|#.#.#|#..##|#...#|#...#|.....|.....",
      O: ".###.|#...#|#...#|#...#|#...#|#...#|.###.|.....|.....",
      P: "####.|#...#|#...#|####.|#....|#....|#....|.....|.....",
      Q: ".###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#|.....|.....",
      R: "####.|#...#|#...#|####.|#.#..|#..#.|#...#|.....|.....",
      S: ".###.|#...#|#....|.###.|....#|#...#|.###.|.....|.....",
      T: "#####|..#..|..#..|..#..|..#..|..#..|..#..|.....|.....",
      U: "#...#|#...#|#...#|#...#|#...#|#...#|.###.|.....|.....",
      V: "#...#|#...#|#...#|#...#|#...#|.#.#.|..#..|.....|.....",
      W: "#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.|.....|.....",
      X: "#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#|.....|.....",
      Y: "#...#|#...#|.#.#.|..#..|..#..|..#..|..#..|.....|.....",
      Z: "#####|....#|...#.|..#..|.#...|#....|#####|.....|.....",
      a: ".....|.....|.###.|....#|.####|#...#|.####|.....|.....",
      b: "#....|#....|####.|#...#|#...#|#...#|####.|.....|.....",
      c: "....|....|.###|#...|#...|#...|.###|....|....",
      d: "....#|....#|.####|#...#|#...#|#...#|.####|.....|.....",
      e: ".....|.....|.###.|#...#|#####|#....|.####|.....|.....",
      f: "..##|.#..|###.|.#..|.#..|.#..|.#..|....|....",
      g: ".....|.....|.####|#...#|#...#|#...#|.####|....#|.###.",
      h: "#....|#....|#.##.|##..#|#...#|#...#|#...#|.....|.....",
      i: "#|.|#|#|#|#|#|.|.",
      j: "..#|...|..#|..#|..#|..#|..#|..#|##.",
      k: "#...|#...|#..#|#.#.|##..|#.#.|#..#|....|....",
      l: "#.|#.|#.|#.|#.|#.|.#|..|..",
      m: ".....|.....|##.#.|#.#.#|#.#.#|#.#.#|#.#.#|.....|.....",
      n: ".....|.....|#.##.|##..#|#...#|#...#|#...#|.....|.....",
      o: ".....|.....|.###.|#...#|#...#|#...#|.###.|.....|.....",
      p: ".....|.....|####.|#...#|#...#|#...#|####.|#....|#....",
      q: ".....|.....|.####|#...#|#...#|#...#|.####|....#|....#",
      r: "....|....|#.##|##..|#...|#...|#...|....|....",
      s: ".....|.....|.####|#....|.###.|....#|####.|.....|.....",
      t: ".#..|.#..|###.|.#..|.#..|.#..|..##|....|....",
      u: ".....|.....|#...#|#...#|#...#|#...#|.####|.....|.....",
      v: ".....|.....|#...#|#...#|#...#|.#.#.|..#..|.....|.....",
      w: ".....|.....|#...#|#...#|#.#.#|#.#.#|.#.#.|.....|.....",
      x: ".....|.....|#...#|.#.#.|..#..|.#.#.|#...#|.....|.....",
      y: ".....|.....|#...#|#...#|#...#|#...#|.####|....#|.###.",
      z: ".....|.....|#####|...#.|..#..|.#...|#####|.....|.....",
      0: ".###.|#...#|#..##|#.#.#|##..#|#...#|.###.|.....|.....",
      1: ".#.|##.|.#.|.#.|.#.|.#.|###|...|...",
      2: ".###.|#...#|....#|...#.|..#..|.#...|#####|.....|.....",
      3: ".###.|#...#|....#|..##.|....#|#...#|.###.|.....|.....",
      4: "...#.|..##.|.#.#.|#..#.|#####|...#.|...#.|.....|.....",
      5: "#####|#....|####.|....#|....#|#...#|.###.|.....|.....",
      6: "..##.|.#...|#....|####.|#...#|#...#|.###.|.....|.....",
      7: "#####|....#|...#.|..#..|.#...|.#...|.#...|.....|.....",
      8: ".###.|#...#|#...#|.###.|#...#|#...#|.###.|.....|.....",
      9: ".###.|#...#|#...#|.####|....#|...#.|.##..|.....|.....",
      ".": ".|.|.|.|.|.|#|.|.",
      ",": "..|..|..|..|..|..|.#|#.|..",
      "!": "#|#|#|#|#|.|#|.|.",
      "?": ".###.|#...#|....#|...#.|..#..|.....|..#..|.....|.....",
      "'": "#|#|.|.|.|.|.|.|.",
      ":": ".|.|.|#|.|.|#|.|.",
      "-": "....|....|....|....|####|....|....|....|....",
      "+": ".....|.....|..#..|..#..|#####|..#..|..#..|.....|.....",
      "=": ".....|.....|.....|#####|.....|#####|.....|.....|.....",
      "/": "....#|....#|...#.|..#..|.#...|#....|#....|.....|.....",
      _: ".....|.....|.....|.....|.....|.....|#####|.....|.....",
      " ": "...|...|...|...|...|...|...|...|..."
    }
  },
  italic: {
    height: 5,
    glyphs: {
      0: "..##.|.#..#|.#.##|##.#.|.##..",
      1: "...#|.##.|..#.|.#..|###.",
      2: "..###|....#|..##.|.#...|####.",
      3: "..###|....#|..##.|...#.|###..",
      4: ".#..#|#..#.|####.|..#..|..#..",
      5: "..####|.#....|.###..|...#..|###...",
      6: "..##.|.#...|.###.|#..#.|.##..",
      7: ".####|...#.|..#..|.#...|#....",
      8: "..##.|.#..#|..##.|#..#.|.##..",
      9: "..##.|.#..#|..###|...#.|.##..",
      A: "..##.|.#..#|.####|#..#.|#..#.",
      B: "..###|.#..#|.###.|#..#.|###..",
      C: "..###|.#...|.#...|#....|.###.",
      D: "..###|.#..#|.#..#|#..#.|###..",
      E: "..####|.#....|.###..|#.....|####..",
      F: "..####|.#....|.###..|#.....|#.....",
      G: "..###|.#...|.#.##|#..#.|.###.",
      H: "..#..#|.#..#.|.####.|#..#..|#..#..",
      I: ".###.|..#..|..#..|.#...|###..",
      J: ".....#|....#.|....#.|#..#..|.##...",
      K: "..#.#|.#.#.|.##..|#.#..|#..#.",
      L: "..#.|.#..|.#..|#...|####",
      M: "..#...#|.##.##.|.#.#.#.|#...#..|#...#..",
      N: "..#..#|.##.#.|.#.##.|#..#..|#..#..",
      O: "..##.|.#..#|.#..#|#..#.|.##..",
      P: "..###|.#..#|.###.|#....|#....",
      Q: "..##.|.#..#|.#..#|#.##.|.##.#",
      R: "..###|.#..#|.###.|#.#..|#..#.",
      S: "..###|.#...|..##.|...#.|###..",
      T: "#####|..#..|..#..|.#...|.#...",
      U: "..#..#|.#..#.|.#..#.|#..#..|.##...",
      V: "..#..#|.#..#.|.#.#..|#.#...|.#....",
      W: "..#...#|.#...#.|.#.#.#.|#.#.#..|.#.#...",
      X: "..#...#|..#.#..|...#...|.#.#...|#...#..",
      Y: "#...#|.#.#.|..#..|.#...|.#...",
      Z: "..####|....#.|..##..|.#....|####..",
      ".": ".|.|.|.|#",
      ",": "..|..|..|.#|#.",
      "!": "..#|.#.|.#.|...|#..",
      "?": "###|..#|.#.|...|#..",
      "'": ".#|#.|..|..|..",
      ":": "..|.#|..|..|#.",
      "-": "...|...|###|...|...",
      "+": "...|.#.|###|.#.|...",
      "=": "....|.###|....|###.|....",
      "/": "....#|...#.|..#..|.#...|#....",
      _: "....|....|....|....|####",
      " ": "...|...|...|...|..."
    }
  }
}, shadows = {
  double: " \u2551\u2551\u2551\u2550\u255D\u2557\u2563\u2550\u255A\u2554\u2560\u2550\u2569\u2566\u256C",
  single: " \u2502\u2502\u2502\u2500\u2518\u2510\u2524\u2500\u2514\u250C\u251C\u2500\u2534\u252C\u253C",
  heavy: " \u2503\u2503\u2503\u2501\u251B\u2513\u252B\u2501\u2517\u250F\u2523\u2501\u253B\u2533\u254B",
  rounded: " \u2502\u2502\u2502\u2500\u256F\u256E\u2524\u2500\u2570\u256D\u251C\u2500\u2534\u252C\u253C",
  ascii: " |||-+++-+++-+++"
}, INK = { light: "#1f2328", dark: "#f0f6fc" }, QUIET = { light: "#59636e", dark: "#9198a1" }, HEX = /^#[0-9a-f]{6}$/i, and = (words) => words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words.at(-1)}` : words[0] ?? "";
function resolve(font2) {
  if (font2 != null && typeof font2 == "object")
    return font2;
  let name = font2 ?? "block";
  if (!Object.hasOwn(fonts, name))
    throw new Error(`ascii.rest: there is no font named "${name}": there are ${and(Object.keys(fonts))}, or pass one of your own`);
  return fonts[name];
}
var fail = (what) => {
  throw new Error(`ascii.rest: ${what}`);
}, whole = (v, name, least) => v === void 0 || Number.isInteger(v) && v >= least ? v : fail(`${name} takes a whole number of ${least} or more, not ${String(v)}`), positive = (v, name) => v === void 0 || typeof v == "number" && Number.isFinite(v) && v > 0 ? v : fail(`${name} takes a number above 0, not ${String(v)}`), chars = (v, name, most) => {
  let check = (s) => typeof s == "string" && [...s].length >= 1 && [...s].length <= most && !/[\u0000-\u001f\u007f-\u009f]/.test(s) ? s : fail(`${name} takes ${most === 1 ? "one character" : "one or two characters"}, not ${JSON.stringify(s)}`);
  if (v !== void 0) {
    if (typeof v == "object" && v !== null) {
      let g = v;
      return { dark: g.dark === void 0 ? void 0 : check(g.dark), light: g.light === void 0 ? void 0 : check(g.light) };
    }
    return check(v);
  }
};
function drawable(text, font2 = "block") {
  let f = resolve(font2);
  return [...String(text)].filter((ch) => [...f.cased ? ch : ch.toUpperCase()].some((c) => Object.hasOwn(f.glyphs, c))).join("");
}
var shapes = (text, f) => [...String(text)].flatMap((ch) => [...f.cased ? ch : ch.toUpperCase()]).map((c) => Object.hasOwn(f.glyphs, c) ? f.glyphs[c] : void 0).filter((g) => !!g).map((g) => g.split("|"));
function fade(stops, n) {
  let rgb2 = stops.map((s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16)));
  return Array.from({ length: n }, (_, i) => {
    let k = n > 1 ? i / (n - 1) * (rgb2.length - 1) : 0, a = Math.min(rgb2.length - 2, Math.floor(k)), f = k - a;
    return `#${(rgb2.length === 1 ? rgb2[0] : rgb2[a].map((v, j) => Math.round(v + (rgb2[a + 1][j] - v) * f))).map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  });
}
var pick = (themed, theme) => themed !== null && typeof themed == "object" && !Array.isArray(themed) ? themed[theme] : themed;
function banner(text, options = {}) {
  let font2 = resolve(options.font);
  drawable(text, font2).trim() || fail(`the font draws none of "${text}"`);
  let glyphs = shapes(text, font2), effect = options.effect ?? "glint";
  ["glint", "type", "still"].includes(effect) || fail(`effect takes "glint", "type" or "still", not ${JSON.stringify(effect)}`);
  let gap = whole(options.gap, "gap", 0) ?? 2, shade = shadows.double;
  options.shadow === "none" ? shade = null : options.shadow !== void 0 && (shade = Object.hasOwn(shadows, options.shadow) ? shadows[options.shadow] : options.shadow, (typeof shade != "string" || [...shade].length !== 16 || /[\u0000-\u001f\u007f-\u009f]/.test(shade)) && fail(`shadow takes ${[...Object.keys(shadows), "none"].join(", ")}, or 16 characters of your own, not ${JSON.stringify(options.shadow)}`));
  let joins = shade === null ? [] : [...shade], h2 = font2.height, span = (s2) => glyphs.reduce((w, g) => w + g[0].length * s2, 0) + gap * (glyphs.length - 1) + (shade ? 1 : 0), pad = options.pad, pads = pad === void 0 || typeof pad == "number" ? [pad ?? 0, pad ?? 0] : Array.isArray(pad) && pad.length === 2 ? pad : fail(`pad takes a number, or [rows, columns], not ${JSON.stringify(pad)}`), [padY, padX] = pads.map((p, i) => whole(p, i ? "pad's columns" : "pad", 0) ?? 0), tall = h2 + (shade ? 1 : 0), s = whole(options.pixel, "pixel", 1) ?? 2, max = positive(options.max, "max"), cols, rows, x0, y0;
  if (options.size) {
    for ((options.size.cols === void 0 || options.size.rows === void 0) && fail("size takes { cols, rows }, both of them"), cols = whole(options.size.cols, "size.cols", 1), rows = whole(options.size.rows, "size.rows", 1); s > 1 && span(s) > cols - 2; )
      s--;
    x0 = Math.max(0, Math.floor((cols - span(s)) / 2)), y0 = Math.floor((rows - tall) / 2);
  } else {
    if (max !== void 0)
      for (; s > 1 && span(s) + 2 * padX > max; )
        s--;
    cols = span(s) + 2 * padX, rows = tall + 2 * padY, x0 = padX, y0 = padY;
  }
  let ink = new Uint8Array(cols * rows), x = x0;
  for (let g of glyphs)
    g.forEach((line, y) => {
      for (let i = 0; i < line.length; i++)
        if (line[i] === "#")
          for (let k = 0; k < s; k++)
            x + i * s + k < cols && y0 + y < rows && (ink[(y0 + y) * cols + x + i * s + k] = 1);
    }), x += g[0].length * s + gap;
  let at = (c, r) => c >= 0 && c < cols && r >= 0 && r < rows ? ink[r * cols + c] : 0, grid = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (at(c, r)) {
        grid.push(null);
        continue;
      }
      if (!shade) {
        grid.push(" ");
        continue;
      }
      let a = at(c - 1, r - 1), b = at(c, r - 1), d = at(c - 1, r), edges = (a !== b ? 1 : 0) | (d ? 2 : 0) | (a !== d ? 4 : 0) | (b ? 8 : 0);
      grid.push(joins[edges === 15 ? 10 : edges]);
    }
  let both = (v, dark, light) => typeof v == "string" ? { dark: v, light: v } : { dark: v?.dark ?? dark, light: v?.light ?? light }, fill = both(chars(options.fill, "fill", 1), "\u2593", "\u2588"), gl = options.glint ?? {}, shine = both(chars(gl.chars, "glint.chars", 2), "\u2588\u2588", "\u2592\u2593"), speed = positive(options.speed, "speed") ?? 1, firstAt = gl.first ?? 0.5;
  (typeof firstAt != "number" || !Number.isFinite(firstAt)) && fail(`glint.first takes a number of seconds, not ${String(firstAt)}`);
  let first = firstAt / speed, sweep = (positive(gl.sweep, "glint.sweep") ?? 2.4) / speed, every = (positive(gl.every, "glint.every") ?? 3.2) / speed, width = positive(gl.width, "glint.width") ?? 2.4, slant = gl.slant ?? 1.2;
  (typeof slant != "number" || !Number.isFinite(slant)) && fail(`glint.slant takes a number, not ${String(slant)}`);
  let step = (positive(options.type?.step, "type.step") ?? 2 / 15) / speed, rest = every <= sweep ? first : (-first % every + every) % every >= sweep ? 0 : (first + sweep + (every - sweep) / 2) % every, ends = [];
  for (let i = 0, e = x0; i < glyphs.length; i++)
    ends.push((e += glyphs[i][0].length * s + (i ? gap : 0)) + (shade ? 1 : 0));
  let colored = options.color !== void 0 && options.color !== null || options.shadowColor !== void 0 && options.shadowColor !== null;
  for (let theme of ["light", "dark"]) {
    let c = pick(options.color ?? void 0, theme);
    Array.isArray(c) && c.length === 0 && fail("color takes a colour as #rrggbb, or two or more for a fade, not an empty list");
  }
  let steps = [pick(options.color, "light"), pick(options.color, "dark")].some((v) => Array.isArray(v) && v.length > 1) ? Math.max(2, Math.min(30, cols)) : 1, palette;
  if (colored) {
    palette = [];
    for (let theme of ["light", "dark"]) {
      let c = pick(options.color ?? void 0, theme), stops = c == null ? [INK[theme]] : typeof c == "string" ? [c] : Array.isArray(c) ? [...c] : fail(`a colour takes #rrggbb, not ${JSON.stringify(c)}`), quiet = pick(options.shadowColor ?? void 0, theme) ?? QUIET[theme];
      for (let v of [...stops, quiet])
        (typeof v != "string" || !HEX.test(v)) && fail(`a colour takes #rrggbb, not ${JSON.stringify(v)}`);
      palette.push(quiet, ...fade(stops, steps));
    }
  }
  let half = steps + 1, lo = x0, hi = x0 + span(s) - (shade ? 2 : 1), bucket = (c) => steps === 1 ? 0 : Math.max(0, Math.min(steps - 1, Math.round((c - lo) / Math.max(1, hi - lo) * (steps - 1)))), left = x0 - 2, right = x0 + span(s) + 9, frame = (t, { paper = !1, color } = {}) => {
    let glinting = effect === "glint", p = -99;
    if (glinting) {
      let u = ((t - first) % every + every) % every / sweep;
      u < 1 && (p = left + (right - left) * u);
    }
    let upTo = effect === "type" ? ends[Math.min(ends.length - 1, Math.max(0, Math.floor(t / step + 1e-9)))] : cols, g = paper ? "light" : "dark", [core, edge] = [...shine[g]], lines = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        let k = r * cols + c, cell = grid[k];
        if (c >= upTo) {
          line += " ";
          continue;
        }
        if (cell !== null) {
          line += cell, color && palette && cell !== " " && (color[k] = (paper ? 0 : half) + 0);
          continue;
        }
        let d = Math.abs(c + slant * r - p);
        line += d < width / 2 ? core : d < width ? edge ?? core : fill[g], color && palette && (color[k] = (paper ? 0 : half) + 1 + bucket(c));
      }
      lines.push(line);
    }
    return lines.join(`
`);
  }, motion = effect === "glint" ? { seconds: every, from: rest, once: !1, pass: [first, first + sweep] } : effect === "type" ? { seconds: step * ends.length + 4 / 15, from: 0, once: !0 } : { seconds: 0, from: 0, once: !1 }, name = options.name ?? drawable(text, font2).trim();
  return { meta: {
    name,
    category: "type",
    note: `"${name}" in block letters`,
    cols,
    rows,
    fps: effect === "still" ? 0 : 24,
    ...palette ? { palette } : {},
    ...effect === "glint" ? { loop: every } : {},
    // Held still, a glinting banner shows its glint out of sight, and a typed one every letter, not the first.
    ...effect === "glint" && rest ? { still: rest } : effect === "type" ? { still: motion.seconds } : {}
  }, default: () => frame, text: drawable(text, font2), motion };
}

// src/client.js
init_black_hole();
init_earth();
init_eclipse();
init_galaxy();
init_planet();
init_torus_knot();
init_matrix_rain();
init_radar();
init_synthwave();

// src/pieces/chat.js
var MESSAGES = [
  "can you help me name my cli?",
  "sure. what does it do?",
  "it turns images into ascii art",
  "how about glyph, inkdrop or asciify?",
  "glyph. that's the one",
  "nice pick. want a logo to go with it?"
];
function timing(talk) {
  let T = 0.6;
  return { plan: talk.map((text, i) => {
    if (i % 2 === 0) {
      let typed = T;
      return T += text.length * 0.055 + 0.35, { typed, shows: T, done: T };
    }
    let dots = T + 0.5, shows = dots + 1.3;
    T = shows + text.length * 0.025;
    let done = T;
    return T += 1, { typed: dots, shows, done };
  }), total: T + 2 };
}
var meta10 = {
  name: "chat",
  category: "ui",
  note: "a chat in bubbles: typed, sent, three dots, then the reply streaming",
  cols: 48,
  rows: 18,
  fps: 20,
  options: { messages: MESSAGES },
  // The talk above; other messages make another length, so pass svg() its seconds.
  loop: timing(MESSAGES).total
};
function wrap2(text) {
  let lines = [], line = "";
  for (let word of text.split(/\s+/).filter(Boolean)) {
    for (; word.length > 26; )
      line && (lines.push(line), line = ""), lines.push(word.slice(0, 26)), word = word.slice(26);
    line && line.length + 1 + word.length > 26 && (lines.push(line), line = ""), line = line ? `${line} ${word}` : word;
  }
  return (line || !lines.length) && lines.push(line), lines;
}
function bubble(lines, mine, cols, shown = 1 / 0) {
  let w = Math.max(...lines.map((l) => l.length)), [tl, tr, bl, br] = mine ? "\u250C\u2510\u2514\u2518" : "\u256D\u256E\u2570\u256F", out = [tl + "\u2500".repeat(w + 2) + tr], left = shown;
  for (let line of lines) {
    if (left <= 0 && out.length > 1) break;
    out.push("\u2502 " + line.slice(0, Math.max(0, left)).padEnd(w) + " \u2502"), left -= line.length + 1;
  }
  out.push(bl + "\u2500".repeat(w + 2) + br);
  let pad = mine ? cols - 1 - (w + 4) : 1;
  return out.map((s) => (" ".repeat(pad) + s).padEnd(cols));
}
function chat({ messages = meta10.options.messages } = {}) {
  let { cols, rows } = meta10, talk = (messages.length ? messages : MESSAGES).map((m) => m.replace(/\s+/g, " ").trim()), wrapped = talk.map(wrap2), full = wrapped.map((lines, i) => bubble(lines, i % 2 === 0, cols)), blank = " ".repeat(cols), { plan, total } = timing(talk), before = full.flatMap((b) => [blank, ...b]);
  return (t) => {
    let p = t % total, lines = [...before], input = "", typing = -1;
    talk.forEach((text, i) => {
      let { typed, shows, done } = plan[i];
      if (!(p < typed)) {
        if (i % 2 === 0) {
          p < shows ? (input = text.slice(0, Math.min(text.length, Math.floor((p - typed) / 0.055) + 1)), typing = typed) : lines.push(blank, ...full[i]);
          return;
        }
        lines.push(blank), p >= done ? lines.push(...full[i]) : p >= shows ? lines.push(...bubble(wrapped[i], !1, cols, Math.floor((p - shows) / 0.025) + 1)) : lines.push(...bubble(["\xB7".repeat(1 + Math.floor((p - typed) / 0.3) % 3).padEnd(3)], !1, cols));
      }
    });
    let out = lines.slice(-14);
    for (; out.length < 14; ) out.unshift(blank);
    out.push(blank);
    let caret = typing >= 0 || Math.floor(p / 0.5) % 2 === 0 ? "\u2588" : " ", inner = cols - 4, field = (input ? `> ${input}` : "> ").slice(-(inner - 6)) + caret;
    return out.push("\u256D" + "\u2500".repeat(cols - 2) + "\u256E"), out.push("\u2502 " + field.padEnd(inner - 4) + "send \u2502"), out.push("\u2570" + "\u2500".repeat(cols - 2) + "\u256F"), out.slice(0, rows).join(`
`);
  };
}

// src/pieces/new-session.js
var HEAVY = { "\u2500": "\u2501", "\u2502": "\u2503", "\u256D": "\u250F", "\u256E": "\u2513", "\u2570": "\u2517", "\u256F": "\u251B" }, BAND = 3, SWEEP = 0.9, heavy = (ch) => HEAVY[ch] ?? ch;
function newSessionPiece(cols, label, hot) {
  let inner = cols - 2, arrow = "\u2500\u2500>", left = ` [+] ${label.toLowerCase()}`, room = inner - arrow.length - 1, text = (left.length > room ? `${left.slice(0, room - 1)}\u2026` : left.padEnd(room)) + arrow + " ", rows = ["\u256D" + "\u2500".repeat(inner) + "\u256E", "\u2502" + text + "\u2502", "\u2570" + "\u2500".repeat(inner) + "\u256F"], travel = cols + BAND + 3;
  return {
    meta: { name: "new session", category: "ui", note: "a framed button with a passing glint", cols, rows: 3, fps: 20 },
    default: () => (t) => {
      let on = hot(), head = on ? Math.floor(t % SWEEP / SWEEP * travel) : -99, run = on ? Math.floor(t * 8) % 2 : -1;
      return rows.map((row, y) => {
        let out = "";
        for (let x = 0; x < row.length; x += 1) {
          let ch = row[x];
          run >= 0 && y === 1 && x >= inner - arrow.length && x < inner && x - (inner - arrow.length) === run && (ch = "\u2501");
          let d = head - y - x;
          d >= 0 && d < BAND ? ch = ch === " " ? y === 1 ? "\u2591" : ch : heavy(ch) : (on && y !== 1 || on && (x === 0 || x === row.length - 1)) && (ch = heavy(ch)), out += ch;
        }
        return out;
      }).join(`
`);
    }
  };
}

// src/intro.js
var TYPE_STEP = 0.08, GLINT_MS = 900, BLINK_MS = 900, OUT_MS = 600, READY_WAIT_MS = 15e3, LOGO = { font: "bold", shadow: "single", color: ["#4d6bfe", "#9db1ff"], shadowColor: "#24346f" }, wait = (ms) => new Promise((resolve2) => {
  setTimeout(resolve2, ms);
});
function appReady() {
  return document.querySelector('[data-slot="root"]') !== null && document.querySelector("[data-dsh-boot]") === null;
}
function playIntro(text, onError = () => {
}) {
  let root = document.createElement("div");
  root.className = "ax-intro", root.dataset.asciiArt = "", root.dataset.phase = "logo", root.setAttribute("role", "presentation");
  let logoBox = document.createElement("div");
  logoBox.className = "ax-intro-logo";
  let logo = document.createElement("canvas");
  logo.className = "ax-intro-banner", logo.setAttribute("aria-hidden", "true");
  try {
    logo.style.setProperty("--ax-logo-cols", String(banner(text, LOGO).meta.cols));
  } catch {
  }
  let sub = document.createElement("div");
  sub.className = "ax-intro-sub", sub.textContent = "H A R N E S S", logoBox.append(logo, sub);
  let crt = document.createElement("div");
  crt.className = "ax-intro-crt";
  let hint = document.createElement("div");
  hint.className = "ax-intro-hint", hint.textContent = "press any key", root.append(logoBox, crt, hint), document.body.append(root);
  let stop = null, play = (piece) => {
    stop?.(), stop = null;
    try {
      stop = mount(logo, piece, { motion: !0 });
    } catch (error) {
      onError(error);
    }
  }, done = !1, skipped = !1, remove = () => {
    done || (done = !0, stop?.(), stop = null, root.remove(), window.removeEventListener("keydown", skip, !0), window.removeEventListener("pointerdown", skip, !0));
  }, skip = (e) => {
    skipped || (skipped = !0, e.preventDefault(), e.stopPropagation(), root.dataset.phase = "out", setTimeout(remove, OUT_MS / 2));
  };
  return window.addEventListener("keydown", skip, !0), window.addEventListener("pointerdown", skip, !0), (async () => {
    if (play(banner(text, { ...LOGO, effect: "type", type: { step: TYPE_STEP } })), await wait(text.length * TYPE_STEP * 1e3 + 200), skipped || (play(banner(text, { ...LOGO, effect: "glint", glint: { first: 0, sweep: GLINT_MS / 1e3, every: 2.4 } })), root.dataset.sub = "on", await wait(GLINT_MS), skipped) || (root.dataset.phase = "blink", await wait(BLINK_MS), skipped)) return;
    root.dataset.phase = "hold";
    let started = Date.now();
    for (; !appReady() && Date.now() - started < READY_WAIT_MS; )
      if (await wait(100), skipped) return;
    root.dataset.phase = "out", await wait(OUT_MS), remove();
  })(), remove;
}

// src/palettes.js
var PALETTES = {
  phosphor: {
    label: "phosphor",
    scheme: "dark",
    bg: "#0a0f0a",
    bg1: "#0e150e",
    bg2: "#132013",
    bg3: "#192a19",
    ink: "#b9f2ad",
    ink2: "#80c27a",
    ink3: "#5b915a",
    ink4: "#3e6641",
    accent: "#46ff7a",
    onAccent: "#031a08",
    ok: "#7dff9a",
    warn: "#e8d45c",
    err: "#ff6f5e",
    info: "#74e6ff"
  },
  amber: {
    label: "amber",
    scheme: "dark",
    bg: "#110c05",
    bg1: "#181107",
    bg2: "#21180b",
    bg3: "#2b200f",
    ink: "#ffd08a",
    ink2: "#d9a65c",
    ink3: "#a7793c",
    ink4: "#6f5229",
    accent: "#ffb000",
    onAccent: "#1a1000",
    ok: "#cde36c",
    warn: "#ffd75e",
    err: "#ff6e4a",
    info: "#ffe2ad"
  },
  ice: {
    label: "ice",
    scheme: "dark",
    bg: "#0b0e12",
    bg1: "#10151b",
    bg2: "#161d25",
    bg3: "#1d2631",
    ink: "#d4dde8",
    ink2: "#94a5b7",
    ink3: "#67788b",
    ink4: "#475360",
    accent: "#7fdbff",
    onAccent: "#04151d",
    ok: "#8fe3a6",
    warn: "#f2cd6b",
    err: "#ff7a7a",
    info: "#7fdbff"
  },
  mono: {
    label: "mono",
    scheme: "dark",
    bg: "#0c0c0c",
    bg1: "#121212",
    bg2: "#1a1a1a",
    bg3: "#232323",
    ink: "#e6e6e6",
    ink2: "#a9a9a9",
    ink3: "#7b7b7b",
    ink4: "#545454",
    accent: "#ffffff",
    onAccent: "#000000",
    ok: "#9fe39f",
    warn: "#e6c86e",
    err: "#ff7b72",
    info: "#b9c7ff"
  },
  vapor: {
    label: "vapor",
    scheme: "dark",
    bg: "#160f24",
    bg1: "#1b1330",
    bg2: "#241a3d",
    bg3: "#30234f",
    ink: "#f2e9ff",
    ink2: "#cbb9ea",
    ink3: "#9a86c2",
    ink4: "#6a5994",
    accent: "#ff5fd6",
    onAccent: "#1a0a1f",
    ok: "#72f1b8",
    warn: "#fede5d",
    err: "#fe4450",
    info: "#36f9f6"
  },
  // after well-loved editor schemes, darkened or lifted where text needed it
  gruvbox: {
    label: "gruvbox",
    scheme: "dark",
    bg: "#282828",
    bg1: "#2e2c2b",
    bg2: "#3c3836",
    bg3: "#504945",
    ink: "#ebdbb2",
    ink2: "#d5c4a1",
    ink3: "#a89984",
    ink4: "#7c6f64",
    accent: "#fe8019",
    onAccent: "#282828",
    ok: "#b8bb26",
    warn: "#fabd2f",
    err: "#fb4934",
    info: "#83a598"
  },
  nord: {
    label: "nord",
    scheme: "dark",
    bg: "#2e3440",
    bg1: "#343b49",
    bg2: "#3b4252",
    bg3: "#434c5e",
    ink: "#eceff4",
    ink2: "#d8dee9",
    ink3: "#a3adc2",
    ink4: "#6f7c96",
    accent: "#88c0d0",
    onAccent: "#2e3440",
    ok: "#a3be8c",
    warn: "#ebcb8b",
    err: "#e0828c",
    info: "#81a1c1"
  },
  dracula: {
    label: "dracula",
    scheme: "dark",
    bg: "#282a36",
    bg1: "#2d2f3d",
    bg2: "#363848",
    bg3: "#44475a",
    ink: "#f8f8f2",
    ink2: "#cfd0e0",
    ink3: "#9aa1c9",
    ink4: "#6272a4",
    accent: "#bd93f9",
    onAccent: "#21222c",
    ok: "#50fa7b",
    warn: "#f1fa8c",
    err: "#ff5555",
    info: "#8be9fd"
  },
  mocha: {
    label: "mocha",
    scheme: "dark",
    bg: "#1e1e2e",
    bg1: "#232334",
    bg2: "#2b2b3d",
    bg3: "#313244",
    ink: "#cdd6f4",
    ink2: "#bac2de",
    ink3: "#9399b2",
    ink4: "#6c7086",
    accent: "#f5c2e7",
    onAccent: "#1e1e2e",
    ok: "#a6e3a1",
    warn: "#f9e2af",
    err: "#f38ba8",
    info: "#89b4fa"
  },
  "tokyo-night": {
    label: "tokyo-night",
    scheme: "dark",
    bg: "#1a1b26",
    bg1: "#1f2130",
    bg2: "#24283b",
    bg3: "#2f3549",
    ink: "#c0caf5",
    ink2: "#a9b1d6",
    ink3: "#8189b3",
    ink4: "#565f89",
    accent: "#7aa2f7",
    onAccent: "#16161e",
    ok: "#9ece6a",
    warn: "#e0af68",
    err: "#f7768e",
    info: "#7dcfff"
  },
  "rose-pine": {
    label: "rose-pine",
    scheme: "dark",
    bg: "#191724",
    bg1: "#1f1d2e",
    bg2: "#26233a",
    bg3: "#312e47",
    ink: "#e0def4",
    ink2: "#c2bfdc",
    ink3: "#908caa",
    ink4: "#6e6a86",
    accent: "#ebbcba",
    onAccent: "#191724",
    ok: "#9ccfd8",
    warn: "#f6c177",
    err: "#eb6f92",
    info: "#c4a7e7"
  },
  everforest: {
    label: "everforest",
    scheme: "dark",
    bg: "#2d353b",
    bg1: "#323c41",
    bg2: "#3a454a",
    bg3: "#475258",
    ink: "#e4d9be",
    ink2: "#bfb59c",
    ink3: "#9da9a0",
    ink4: "#7a8478",
    accent: "#a7c080",
    onAccent: "#232a2e",
    ok: "#a7c080",
    warn: "#dbbc7f",
    err: "#e67e80",
    info: "#7fbbb3"
  },
  kanagawa: {
    label: "kanagawa",
    scheme: "dark",
    bg: "#1f1f28",
    bg1: "#24242f",
    bg2: "#2a2a37",
    bg3: "#363646",
    ink: "#dcd7ba",
    ink2: "#c8c093",
    ink3: "#9792a9",
    ink4: "#727169",
    accent: "#ffa066",
    onAccent: "#1f1f28",
    ok: "#98bb6c",
    warn: "#e6c384",
    err: "#e46876",
    info: "#7fb4ca"
  },
  paper: {
    label: "paper",
    scheme: "light",
    bg: "#f4f0e6",
    bg1: "#ece7da",
    bg2: "#e3ddcd",
    bg3: "#d9d2bf",
    ink: "#1d1c19",
    ink2: "#4b4840",
    ink3: "#76715f",
    ink4: "#a39d88",
    accent: "#b3261e",
    onAccent: "#fff8f0",
    ok: "#2f7d32",
    warn: "#9a6a00",
    err: "#b3261e",
    info: "#1f4fbf"
  },
  solarized: {
    label: "solarized",
    scheme: "light",
    bg: "#fdf6e3",
    bg1: "#f5eedb",
    bg2: "#eee8d5",
    bg3: "#e2dbc6",
    ink: "#073642",
    ink2: "#4f646c",
    ink3: "#6f8086",
    ink4: "#93a1a1",
    accent: "#1b6fae",
    onAccent: "#fdf6e3",
    ok: "#6c7f00",
    warn: "#9b7400",
    err: "#c9221f",
    info: "#1d8a83"
  },
  latte: {
    label: "latte",
    scheme: "light",
    bg: "#eff1f5",
    bg1: "#e6e9ef",
    bg2: "#dce0e8",
    bg3: "#ccd0da",
    ink: "#383a52",
    ink2: "#5c5f77",
    ink3: "#6c6f85",
    ink4: "#9ca0b0",
    accent: "#8839ef",
    onAccent: "#eff1f5",
    ok: "#2e7a1c",
    warn: "#a8650a",
    err: "#d20f39",
    info: "#1e66f5"
  },
  "rose-dawn": {
    label: "rose-dawn",
    scheme: "light",
    bg: "#faf4ed",
    bg1: "#f4ede6",
    bg2: "#f2e9e1",
    bg3: "#e6dcd3",
    ink: "#464261",
    ink2: "#575279",
    ink3: "#797593",
    ink4: "#9893a5",
    accent: "#a4506a",
    onAccent: "#faf4ed",
    ok: "#286983",
    warn: "#a86a10",
    err: "#a4506a",
    info: "#907aa9"
  }
}, PALETTE_GROUPS = [
  { label: "light", items: ["paper", "solarized", "latte", "rose-dawn"] },
  { label: "dark", items: ["phosphor", "amber", "ice", "mono", "vapor", "gruvbox", "nord", "dracula", "mocha", "tokyo-night", "rose-pine", "everforest", "kanagawa"] },
  { label: "light + dark", items: ["auto", "host"] }
], PALETTE_CHOICES = PALETTE_GROUPS.flatMap((group) => group.items);
function rgb(hex) {
  let n = parseInt(hex.slice(1), 16);
  return `${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}`;
}
function flatTokens(p) {
  let line = (alpha) => `rgba(${rgb(p.ink)}, ${alpha})`, tint = (hex, alpha) => `rgba(${rgb(hex)}, ${alpha})`;
  return {
    // surfaces
    "--dsw-alias-bg-base": p.bg,
    "--dsw-alias-bg-layer-1": p.bg,
    "--dsw-alias-bg-layer-2": p.bg1,
    "--dsw-alias-bg-layer-3": p.bg2,
    "--dsw-alias-bg-overlay": p.bg1,
    "--dsw-alias-bg-module-platform": p.bg1,
    "--dsw-alias-bg-multi-select": p.bg1,
    "--dsw-alias-bg-document-preview": p.bg1,
    "--dsw-alias-bg-skeleton": line(0.06),
    // borders
    "--dsw-alias-border-l1": line(0.1),
    "--dsw-alias-border-l2": line(0.18),
    "--dsw-alias-border-l2-darkmode-thin": line(0.18),
    "--dsw-alias-border-l3": line(0.26),
    "--dsw-alias-border-l4": line(0.36),
    // brand
    "--dsw-alias-brand-primary": p.accent,
    "--dsw-alias-brand-text": p.accent,
    "--dsw-alias-brand-primary-invert": p.onAccent,
    "--dsw-alias-brand-primary-new-colorprimary-new-color": p.accent,
    // buttons
    "--dsw-alias-button-primary-fill": p.ink,
    "--dsw-alias-button-primary-hover": p.accent,
    "--dsw-alias-button-primary-dimmed": p.bg2,
    "--dsw-alias-label-primary-foreground": p.bg,
    "--dsw-alias-button-elevated-fill": p.bg1,
    "--dsw-alias-button-floating-fill": p.bg1,
    "--dsw-alias-button-floating-hover": p.bg2,
    "--dsw-alias-button-ghost-active-border": line(0.4),
    "--dsw-alias-button-ghost-active-fill": p.bg2,
    "--dsw-alias-button-ghost-active-hover": p.bg3,
    "--dsw-alias-button-info-fill": p.accent,
    "--dsw-alias-button-info-hover": p.ink,
    "--dsw-alias-button-contrast-fill": p.ink2,
    // text
    "--dsw-alias-label-primary": p.ink,
    "--dsw-alias-label-primary-dimmed": p.ink,
    "--dsw-alias-label-primary-bluish": p.ink,
    "--dsw-alias-label-primary-inverted": p.bg,
    "--dsw-alias-label-secondary": p.ink2,
    "--dsw-alias-label-tertiary": p.ink3,
    "--dsw-alias-label-caption": p.ink4,
    "--dsw-alias-label-dimmed": p.ink4,
    "--dsw-alias-label-deep-diving": p.accent,
    "--dsw-alias-label-deep-diving-shimmer": p.ink,
    "--dsw-alias-label-document-preview": p.ink2,
    "--dsw-alias-link": p.info,
    "--dsw-alias-menu-icon": p.ink2,
    // interaction tints
    "--dsw-alias-interactive-bg-hover": line(0.07),
    "--dsw-alias-interactive-bg-active": line(0.12),
    "--dsw-alias-interactive-bg-hover-accent": tint(p.accent, 0.16),
    "--dsw-alias-interactive-bg-hover-solid": p.bg2,
    "--dsw-alias-interactive-bg-hover-danger": tint(p.err, 0.12),
    // states
    "--dsw-alias-state-error-primary": p.err,
    "--dsw-alias-state-error-secondary": p.err,
    "--dsw-alias-state-success-primary": p.ok,
    "--dsw-alias-state-success-secondary": p.ok,
    "--dsw-alias-state-success-tertiary": tint(p.ok, 0.14),
    "--dsw-alias-state-warn-primary": p.warn,
    "--dsw-alias-state-warn-secondary": p.warn,
    "--dsw-alias-state-warn-tertiary": tint(p.warn, 0.16),
    "--dsw-alias-state-warn-label": p.warn,
    "--dsw-alias-state-business-primary": p.info,
    "--dsw-alias-state-business-tertiary": tint(p.info, 0.14),
    "--dsw-alias-state-idle-primary": p.ink4,
    // markdown
    "--dsw-alias-markdown-code-block": p.bg1,
    "--dsw-alias-markdown-code-block-banner": p.bg1,
    "--dsw-alias-markdown-inline-code": "transparent",
    "--dsw-alias-markdown-citation": p.bg2,
    "--dsw-alias-markdown-tag": p.bg2,
    "--dsw-alias-markdown-placeholder": p.bg1,
    "--dsw-alias-markdown-code-segment-selected": p.bg,
    "--dsw-alias-markdown-code-segment-unselected": p.bg2,
    // diffs
    "--dsw-alias-code-diff-added": tint(p.ok, 0.1),
    "--dsw-alias-code-diff-deleted": tint(p.err, 0.1),
    "--dsw-alias-file-diff-added-bg": tint(p.ok, 0.12),
    "--dsw-alias-file-diff-added-gutter": tint(p.ok, 0.08),
    "--dsw-alias-file-diff-added-marker": p.ok,
    "--dsw-alias-file-diff-deleted-bg": tint(p.err, 0.12),
    "--dsw-alias-file-diff-deleted-gutter": tint(p.err, 0.08),
    "--dsw-alias-file-diff-deleted-marker": p.err,
    // menus, toasts, tooltips, scrollbars, settings
    "--dsw-alias-menu-group-header-fill": p.bg1,
    "--dsw-alias-toast-bg": p.ink,
    "--dsw-alias-toast-label": p.bg,
    "--dsw-alias-tooltip-bg": p.ink,
    "--dsw-alias-tooltip-key-bg": p.ink2,
    "--dsw-alias-scrollbar-bg-l1": line(0.22),
    "--dsw-alias-scrollbar-bg-l2": line(0.22),
    "--dsw-alias-scrollbar-hover-l1": line(0.42),
    "--dsw-alias-scrollbar-hover-l2": line(0.42),
    "--dsw-alias-settings-card-fill": p.bg,
    "--dsw-alias-settings-card-stroke": line(0.22),
    "--dsw-alias-switch-thumb": p.bg,
    "--dsw-alias-turn-trigger-bg": p.bg1,
    "--dsw-alias-turn-trigger-bg-hover": line(0.07),
    // chrome
    "--dsw-specific-bubble": "transparent",
    "--dsw-specific-bubble-highlight": line(0.12),
    "--dsw-specific-input-major": p.bg,
    "--dsw-specific-login-input": p.bg1,
    "--dsw-specific-menu": p.bg1,
    "--dsw-specific-selector": p.bg1,
    "--dsw-specific-tip": p.bg1,
    "--dsw-specific-sidebar-fill": p.bg1,
    "--dsw-specific-sidebar-nav-item-active": line(0.12),
    "--dsw-specific-sidebar-nav-item-active-accent": tint(p.accent, 0.18),
    "--dsw-specific-sidebar-nav-item-hover": line(0.07)
  };
}
function tokenLayer(choice) {
  if (choice === "host") return null;
  let light = flatTokens(choice === "auto" ? PALETTES.paper : PALETTES[choice] ?? PALETTES.phosphor), dark = flatTokens(choice === "auto" ? PALETTES.phosphor : PALETTES[choice] ?? PALETTES.phosphor), layer = {};
  for (let name of Object.keys(light)) layer[name] = { light: light[name], dark: dark[name] };
  return layer;
}
var HOST_PREVIEW = [
  {
    bg: "var(--dsw-static-neutral-bluish-00)",
    bg2: "var(--dsw-static-neutral-bluish-50)",
    ink2: "var(--dsw-static-neutral-bluish-700)",
    ink: "var(--dsw-static-neutral-bluish-1000)",
    accent: "var(--dsw-static-deepseek-500)"
  },
  {
    bg: "var(--dsw-static-neutral-bluish-950)",
    bg2: "var(--dsw-static-neutral-bluish-850)",
    ink2: "var(--dsw-static-neutral-bluish-300)",
    ink: "var(--dsw-static-neutral-bluish-50)",
    accent: "var(--dsw-static-deepseek-400)"
  }
];
function previewOf(choice) {
  return choice === "host" ? HOST_PREVIEW : choice === "auto" ? [PALETTES.paper, PALETTES.phosphor] : [PALETTES[choice] ?? PALETTES.phosphor];
}
function pinnedScheme(choice) {
  return PALETTES[choice] ? PALETTES[choice].scheme : null;
}

// src/prefs.js
var KEY = "dsh-ascii-compact:prefs", SCHEMA = 2, DENSITIES = ["cozy", "compact", "dense"], HEROES = ["banner", "chat", "black-hole", "earth", "eclipse", "galaxy", "planet", "torus-knot", "matrix-rain", "radar", "synthwave", "random", "stock"], CHAT_STYLES = ["bubbles", "terminal"], LOGO_MAX = 12, DEFAULTS = Object.freeze({
  palette: "paper",
  density: "compact",
  hero: "banner",
  crt: !1,
  statusline: !0,
  glyphs: !0,
  brand: !1,
  dock: !1,
  chat: "bubbles",
  intro: !0,
  logo: "DEEPSEEK"
});
function sanitize(raw) {
  let v = raw && typeof raw == "object" ? raw : {};
  return {
    palette: PALETTE_CHOICES.includes(v.palette) ? v.palette : DEFAULTS.palette,
    density: DENSITIES.includes(v.density) ? v.density : DEFAULTS.density,
    hero: HEROES.includes(v.hero) ? v.hero : DEFAULTS.hero,
    crt: typeof v.crt == "boolean" ? v.crt : DEFAULTS.crt,
    statusline: typeof v.statusline == "boolean" ? v.statusline : DEFAULTS.statusline,
    glyphs: typeof v.glyphs == "boolean" ? v.glyphs : DEFAULTS.glyphs,
    brand: typeof v.brand == "boolean" ? v.brand : DEFAULTS.brand,
    dock: typeof v.dock == "boolean" ? v.dock : DEFAULTS.dock,
    chat: CHAT_STYLES.includes(v.chat) ? v.chat : DEFAULTS.chat,
    intro: typeof v.intro == "boolean" ? v.intro : DEFAULTS.intro,
    logo: logoText(v.logo)
  };
}
function logoText(raw) {
  return String(raw ?? "").toUpperCase().replace(/[^0-9A-Z.,!?':\-+=/_ ]/g, "").replace(/ +/g, " ").trim().slice(0, LOGO_MAX).trim() || DEFAULTS.logo;
}
function load() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
  }
  return raw && typeof raw == "object" && raw.schema !== SCHEMA && (raw = { ...raw, palette: DEFAULTS.palette }), sanitize(raw);
}
var state = load(), listeners = /* @__PURE__ */ new Set(), prefs = {
  get: () => state,
  subscribe(fn) {
    return listeners.add(fn), () => {
      listeners.delete(fn);
    };
  },
  set(patch) {
    state = sanitize({ ...state, ...patch });
    try {
      localStorage.setItem(KEY, JSON.stringify({ schema: SCHEMA, ...state }));
    } catch {
    }
    for (let fn of listeners) fn(state);
  },
  /** Step a list-valued preference to its next (or previous) choice. */
  cycle(field, list, step = 1) {
    let i = list.indexOf(state[field]);
    prefs.set({ [field]: list[(i + step + list.length) % list.length] });
  }
};
function watchStorage() {
  let onStorage = (e) => {
    if (e.key === KEY) {
      state = load();
      for (let fn of listeners) fn(state);
    }
  };
  return window.addEventListener("storage", onStorage), () => {
    window.removeEventListener("storage", onStorage);
  };
}

// src/density.js
var FAM = "var(--dsw-font-family)", CODE = "var(--ds-font-family-code)", BODY2 = "var(--dsh-content-font-size,14px)", SECONDARY = "var(--dsh-content-font-size-secondary,13px)", CODE_SIZE = "var(--dsh-code-font-size,11px)", CODE_DELTA = "var(--dsh-code-font-delta,0px)", plus = (base, px) => px === 0 ? base : `calc(${base} + ${px}px)`, CHROME = {
  s: [["s-14", 400], ["s-strong-14", 600]],
  xs: [["xs-13", 400], ["xs-strong-13", 600]],
  xxs: [["xxs-12", 400], ["xxs-strong-12", 600]],
  xxxs: [["xxxs-11", 400], ["xxxs-strong-11", 600]],
  base: [["base-16", 400], ["base-strong-16", 600]],
  m: [["m-18", 600]],
  l: [["l-20", 600]],
  xl: [["xl-24", 700]]
}, LEVELS = {
  cozy: {
    vars: { row: "30px", nav: "32px", stack: "10px", gap: "12px", col: ".70", maxw: "960px", pad: "12px", status: "22px" },
    chrome: { s: [14, 21], xs: [13, 19], xxs: [12, 17], xxxs: [11, 14], base: [16, 24], m: [16, 26], l: [19, 28], xl: [23, 32] },
    md: { lead: 9, h1: [4, 12], h2: [2, 10], h3: [1, 9], table: 8, small: [12, 19], code: 7, codeSmall: 5 }
  },
  compact: {
    vars: { row: "26px", nav: "26px", stack: "6px", gap: "8px", col: ".80", maxw: "1040px", pad: "8px", status: "20px" },
    chrome: { s: [13, 19], xs: [12, 17], xxs: [11.5, 16], xxxs: [11, 14], base: [14, 20], m: [15, 22], l: [17, 24], xl: [20, 28] },
    md: { lead: 6, h1: [2, 8], h2: [1, 7], h3: [0, 6], table: 5, small: [11.5, 16], code: 5, codeSmall: 4 }
  },
  dense: {
    vars: { row: "22px", nav: "22px", stack: "3px", gap: "5px", col: ".88", maxw: "1180px", pad: "6px", status: "18px" },
    chrome: { s: [12.5, 17], xs: [11.5, 16], xxs: [11, 15], xxxs: [10.5, 13], base: [13, 18], m: [14, 20], l: [16, 22], xl: [18, 24] },
    md: { lead: 4, h1: [1, 6], h2: [1, 5], h3: [0, 4], table: 4, small: [11, 15], code: 4, codeSmall: 3 }
  }
};
function font(name, { style = "normal", weight = 400, size, lead, family = FAM }) {
  let p = `--dsw-font-${name}`, head = [style !== "normal" ? style : "", weight !== 400 ? String(weight) : ""].filter(Boolean).join(" ");
  return [
    `${p}: ${head ? head + " " : ""}${size} / ${lead} ${family};`,
    `${p}-font-family: ${family};`,
    `${p}-font-size: ${size};`,
    `${p}-font-style: ${style};`,
    `${p}-font-weight: ${weight};`,
    `${p}-line-height: ${lead};`
  ].join(`
  `);
}
function levelCss(id, level) {
  let out = [], v = level.vars;
  out.push(
    `--ax-row: ${v.row};`,
    `--ax-nav: ${v.nav};`,
    `--ax-stack: ${v.stack};`,
    `--ax-flow-gap: ${v.gap};`,
    `--ax-col: ${v.col};`,
    `--ax-maxw: ${v.maxw};`,
    `--ax-pad: ${v.pad};`,
    `--ax-status-h: ${v.status};`
  );
  for (let [step, tokens] of Object.entries(CHROME)) {
    let [size, lead] = level.chrome[step];
    for (let [name, weight] of tokens) out.push(font(name, { weight, size: `${size}px`, lead: `${lead}px` }));
  }
  let md = level.md, body = { size: BODY2, lead: plus(BODY2, md.lead) };
  return out.push(
    font("markdown-base", body),
    font("markdown-base-strong", { ...body, weight: 700 }),
    font("markdown-base-italic", { ...body, style: "italic" }),
    font("markdown-base-strong-italic", { ...body, style: "italic", weight: 700 }),
    font("markdown-h1", { weight: 700, size: plus(BODY2, md.h1[0]), lead: plus(BODY2, md.h1[1]) }),
    font("markdown-h2", { weight: 700, size: plus(BODY2, md.h2[0]), lead: plus(BODY2, md.h2[1]) }),
    font("markdown-h3", { weight: 700, size: plus(BODY2, md.h3[0]), lead: plus(BODY2, md.h3[1]) }),
    font("markdown-h4", { weight: 700, size: BODY2, lead: plus(BODY2, md.lead) }),
    font("markdown-table", { size: SECONDARY, lead: plus(SECONDARY, md.table) }),
    font("markdown-table-head", { weight: 700, size: SECONDARY, lead: plus(SECONDARY, md.table) }),
    font("markdown-small", { size: `${md.small[0]}px`, lead: `${md.small[1]}px` }),
    font("markdown-small-strong", { weight: 700, size: `${md.small[0]}px`, lead: `${md.small[1]}px` }),
    font("markdown-small-italic", { style: "italic", size: `${md.small[0]}px`, lead: `${md.small[1]}px` }),
    font("markdown-small-strong-italic", { style: "italic", weight: 700, size: `${md.small[0]}px`, lead: `${md.small[1]}px` }),
    font("markdown-code", { size: `calc(12px + ${CODE_DELTA})`, lead: `calc(${12 + md.code}px + ${CODE_DELTA})`, family: CODE }),
    font("markdown-code-block", { size: CODE_SIZE, lead: plus(CODE_SIZE, md.code + 1), family: CODE }),
    font("markdown-code-block-small", { size: CODE_SIZE, lead: plus(CODE_SIZE, md.codeSmall), family: CODE })
  ), `html[data-ascii][data-ascii-density="${id}"] body {
  ${out.join(`
  `)}
}`;
}
var DENSITY_CSS = Object.entries(LEVELS).map(([id, level]) => levelCss(id, level)).join(`

`), DENSITY_ROWS = Object.fromEntries(Object.entries(LEVELS).map(([id, level]) => [id, level.vars.row]));

// src/mobile.css
var mobile_default = `/* dsh-theme-ascetic \u2014 touch + compact layer.
 *
 * The rest of the skin is a desktop product: a 20px status line of 11px text,
 * popovers anchored to their segment, hover-only reveals, and no thought for a
 * 390px viewport. This file keeps the terminal idiom but gives it the two things
 * a phone needs \u2014 reachable controls and a layout that fits.
 *
 * Two gates, used separately on purpose:
 *   compact  (max-width: 767px), (max-height: 500px)  -> phone LAYOUT
 *            the height half catches a phone in landscape, which is wide and
 *            short and would otherwise inherit the tablet layout.
 *   touch    (pointer: coarse)                        -> hit SIZES
 *            a tablet or a phone at any width still has a thumb, not a cursor.
 *
 * Numbers come from the platform guidelines (see docs/mobile.md): 44x44 CSS px
 * hit regions, 48px sheet rows, 16px inputs (iOS zooms below that), 8px+
 * between targets, env(safe-area-inset-*) wherever the chrome meets an edge.
 */

/* ---- 1. tokens ----------------------------------------------------------- */

html[data-ascii] {
  --ax-hit: 44px;
  --ax-hit-gap: 8px;
  --ax-gutter: 16px;
  --ax-sheet-max: 640px;
  --ax-sheet-h: min(72dvh, 640px);
  --ax-status-touch-h: 44px;
  --ax-kb: 0px;
}

/* ---- 2. touch sizes (coarse pointers, any width) -------------------------- */

/* Every control the skin owns becomes a real target. \`all: unset\` in skin.css
   leaves the status segments, menu rows and choices at text size, which is why
   they measured 11x18 and 300x18 in the desktop CSS. */
@media (pointer: coarse) {
  html[data-ascii] :where(.ax-status .ax-seg, .ax-menu-row, .ax-choice, .ax-menu-group, .ax-menu-title) {
    box-sizing: border-box;
    min-height: var(--ax-hit);
    align-items: center;
  }
  html[data-ascii] :where(.ax-menu-row, .ax-choice) {
    padding-inline: var(--ax-gutter);
  }
  html[data-ascii] :where(.ax-menu-row) {
    font-size: 14px;
    line-height: 20px;
  }
  html[data-ascii] .ax-input {
    min-height: 36px;
    font-size: 16px; /* also the iOS zoom threshold */
  }
  /* adjacent targets never touch (>=8px of air, Android guidance) */
  html[data-ascii] .ax-status .ax-seg + .ax-seg { border-left: 1px solid var(--dsw-alias-border-l2); }

  /* Hover is not an affordance on a phone: the per-row and per-message actions
     that the host reveals on hover have to be there permanently. */
  html[data-ascii] :where([class*="_sessionRow"] [class*="_actions"], [class*="_messageActions"]) {
    opacity: 1 !important;
  }
}

/* ---- 3. touch status line: one 44px row, one thumb ----------------------- */
/* Desktop keeps the 20px vim bar. Anywhere there is no cursor \u2014 a phone at any
   width, or a tablet \u2014 the bar was clipping its own right-hand segments (the
   segments need ~870px on a 768px tablet) and every target was text-height, so
   it becomes: gear | ASCII | summary | safe area. client.js switches the same
   way, so the bar and its markup never disagree. */

@media (pointer: coarse), (max-width: 767px), (max-height: 500px) {
  html[data-ascii] .ax-status {
    height: calc(var(--ax-status-touch-h) + env(safe-area-inset-bottom, 0px));
    /* In landscape a notched phone reserves 47px on each side; without these the
       gear and the summary sit under the rounded corner. The 4px floor keeps the
       first control off the edge on devices that report no inset at all. */
    padding: 0 max(4px, env(safe-area-inset-right, 0px)) env(safe-area-inset-bottom, 0px)
      max(4px, env(safe-area-inset-left, 0px));
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    /* the host's bottom row scrolls whatever overflows it: never give it any */
    overflow: hidden;
  }
  html[data-ascii] .ax-status .ax-seg {
    min-height: var(--ax-status-touch-h);
    padding: 0 12px;
    border-right: 0;
    flex: 0 0 auto;
  }
  html[data-ascii] .ax-status .ax-gear {
    min-width: var(--ax-status-touch-h);
    justify-content: center;
    font-size: 18px;
  }
  html[data-ascii] .ax-status .ax-mode {
    min-width: 72px;
    justify-content: center;
    letter-spacing: .06em;
  }
  html[data-ascii] .ax-status .ax-summary {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: flex-start;
    gap: 1ch;
    padding-inline: 12px;
    border-left: 1px solid var(--dsw-alias-border-l2);
    color: var(--ax-ink2);
    text-align: left;
  }
  html[data-ascii] .ax-status .ax-summary .ax-chev { margin-left: auto; color: var(--ax-ink3); }
  /* Everything the seat renders stays mounted (it publishes the numbers the
     summary and its sheet read) and is hidden here: on a phone the bar is three
     targets, not eleven segments. */
  html[data-ascii] .ax-status > :not(.ax-gear):not(.ax-mode):not(.ax-summary) {
    display: none !important;
  }
  html[data-ascii] .ax-status .ax-summary > .ax-toast { overflow: hidden; text-overflow: ellipsis; }
}

/* ---- 4. popovers become bottom sheets ------------------------------------ */
/* The desktop .ax-menu is anchored 4px from the left, min-width 300px \u2014 on a
   320px viewport that leaves 20px, which is the horizontal-scroll bug. Below
   768px every theme popup is a full-width sheet with 48px rows. */

@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] .ax-menu {
    position: fixed;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: auto !important;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    max-width: var(--ax-sheet-max);
    margin-inline: auto;
    max-height: var(--ax-sheet-h);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 0 env(safe-area-inset-right, 0px) calc(10px + env(safe-area-inset-bottom, 0px))
      env(safe-area-inset-left, 0px);
    border-top: 1px solid var(--ax-line);
    box-shadow: 0 -1px 0 0 var(--ax-line) !important;
    font: 14px/20px var(--ax-mono, monospace);
    white-space: normal;
    /* above the header (which the companion plugin stacks over the page) and
       below the drawer's 1300 */
    z-index: 1200;
  }
  /* A sheet is modal: dim what is behind it. Negative z-index paints the scrim
     above the page but under the sheet's own background, and pointer-events
     stays none so the outside tap still reaches the page and closes the sheet. */
  html[data-ascii] .ax-menu::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    background: color-mix(in srgb, #000 55%, transparent);
    pointer-events: none;
  }
  html[data-ascii] .ax-menu .ax-sheet-grip {
    display: flex;
    align-items: center;
    gap: 1ch;
    width: 100%;
    box-sizing: border-box;
    min-height: var(--ax-hit);
    padding: 0 var(--ax-gutter);
    border-bottom: 1px solid var(--ax-line-soft);
    color: var(--ax-ink3);
    font: 12px/var(--ax-hit) var(--ax-mono, monospace);
  }
  html[data-ascii] .ax-menu .ax-sheet-grip .ax-hint { margin-left: auto; }
  html[data-ascii] .ax-menu-title {
    min-height: 0;
    padding: 6px var(--ax-gutter) 2px;
    font-size: 11px;
  }
  /* ---- option lists inside the sheet --------------------------------------
     A cycle row over 19 palettes is up to 18 taps; expanded, every option is
     visible and one tap away (docs/mobile.md). */
  html[data-ascii] .ax-menu .ax-options {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    padding: 6px var(--ax-gutter) 10px;
  }
  html[data-ascii] .ax-menu .ax-option {
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    min-height: 48px;
    padding: 0 8px;
    border: 1px solid var(--ax-line-soft);
    background: transparent;
    color: var(--ax-ink2);
    font: 13px/1.2 var(--ax-mono, monospace);
    text-align: left;
    cursor: pointer;
  }
  html[data-ascii] .ax-menu .ax-option[aria-selected="true"] {
    border-color: var(--ax-accent);
    box-shadow: inset 2px 0 0 var(--ax-accent);
    color: var(--ax-ink);
  }
  html[data-ascii] .ax-menu .ax-option-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* a narrower strip leaves the name room: 68px of swatch left ~13 characters */
  html[data-ascii] .ax-menu .ax-option .ax-swatch { height: 16px; }
  html[data-ascii] .ax-menu .ax-option .ax-swatch > i { width: 7px; }
  html[data-ascii] .ax-menu .ax-option .ax-swatch > i:last-child { width: 16px; }
  html[data-ascii] .ax-menu .ax-option-hint { margin-left: auto; font-size: 11px; }
  html[data-ascii] .ax-menu .ax-caret { color: var(--ax-ink3); }
  /* a row that only reports a number: it must not look tappable */
  html[data-ascii] .ax-menu-row.ax-row-info { cursor: default; }
  html[data-ascii] .ax-menu-row.ax-row-info:hover {
    background: none;
    color: inherit;
  }
  html[data-ascii] .ax-row-info .ax-hint { color: var(--ax-ink2); }
  /* iOS overlays the keyboard, so a fixed sheet would sit behind it */
  html[data-ascii][data-ascii-kb] .ax-menu { bottom: var(--ax-kb) !important; }
  html[data-ascii] .ax-menu-row {
    min-height: 48px;
    padding-inline: var(--ax-gutter);
    gap: 1ch;
    font-size: 14px;
  }
  html[data-ascii] .ax-menu-group { min-height: 0; padding: 10px var(--ax-gutter) 2px; font-size: 11px; }
  html[data-ascii] .ax-menu-row.ax-menu-field { min-height: 52px; }
  html[data-ascii] .ax-menu-field .ax-input { margin-left: auto; }
  html[data-ascii] .ax-swatch { height: 18px; }
  html[data-ascii] .ax-swatch > i { width: 14px; }
  html[data-ascii] .ax-swatch > i:last-child { width: 30px; }
  /* the picker used to be right-aligned over its segment */
  html[data-ascii] .ax-menu.ax-pick { left: 0 !important; right: 0 !important; max-height: var(--ax-sheet-h); }
}

/* ---- 5. docked host popovers (activity / usage / context / account menu) --- */
/* The skin parks these above the status line. On a phone they get the same
   sheet treatment, including the safe area. */

@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] :is([role="dialog"], [role="menu"])[data-ascii-docked] {
    top: auto !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    width: 100% !important;
    max-width: var(--ax-sheet-max) !important;
    margin-inline: auto;
    max-height: var(--ax-sheet-h) !important;
    overflow-y: auto;
    overscroll-behavior: contain;
    transform: none !important;
    box-shadow: 0 -1px 0 0 var(--ax-line) !important;
    padding: 0 env(safe-area-inset-right, 0px) calc(10px + env(safe-area-inset-bottom, 0px))
      env(safe-area-inset-left, 0px);
    z-index: 1200;
  }
}

/* ---- 6. sidebar drawer --------------------------------------------------- */
/* Off-canvas drawer + toggle belong to the companion \`dsh-web-mobile\` plugin
   (which is where \`[data-mobile-nav]\` comes from); when that plugin is present
   the host slides the sidebar over the conversation below 1024px on a coarse
   pointer but opens it with no scrim, so the page behind reads as interactive.
   The scrim is a body-level element (\`.ax-drawer-scrim\`, installed by client.js
   and positioned under the drawer's own 1300 z-index): a fixed pseudo-element
   on the frame is painted behind the frame's opaque background and never shows.

   What the skin does own here is the drawer's density: 22px rows and 16x16 row
   actions are untappable. Give the drawer real rows and keep the chosen density
   for the conversation itself. */

@media (max-width: 1023px) and (pointer: coarse) {
  html[data-ascii] .ax-drawer-scrim {
    position: fixed;
    inset: 0;
    z-index: 1299;
    background: color-mix(in srgb, #000 50%, transparent);
    pointer-events: none;
  }
  html[data-ascii][data-ascii-density] body {
    --ax-row: var(--ax-hit);
    --ax-nav: var(--ax-hit);
    --ax-stack: 4px;
    --dsh-sidebar-inline-padding: 8px;
  }
  html[data-ascii] :is([class*="_sessionRow"], [class*="_projectRow"], [class*="_panelRow"]) {
    height: var(--ax-hit) !important;
    min-height: var(--ax-hit) !important;
  }
  html[data-ascii] [class*="_logoRow"] { min-height: 56px !important; }
  /* the \u22EF on each session is 16x16: keep the drawing, widen the hit region */
  html[data-ascii] [class*="_sessionRow"] button {
    position: relative;
    min-width: var(--ax-hit) !important;
    min-height: var(--ax-hit) !important;
  }
  html[data-ascii] [class*="_sidebarCol"] button[class*="_searchButton"],
  html[data-ascii] [class*="_sidebarCol"] button[class*="_iconButton"],
  html[data-ascii] [class*="_sidebarCol"] button[class*="_addWorkspace"] {
    min-width: var(--ax-hit) !important;
    min-height: var(--ax-hit) !important;
    justify-content: center;
  }
  html[data-ascii] button[class*="_newSession"][data-ascii-ns] { min-height: var(--ax-hit) !important; }
  /* the drawer's account row and its last row clear the home indicator */
  html[data-ascii] [class*="_sidebarCol"] {
    padding-left: env(safe-area-inset-left, 0px) !important;
    padding-bottom: env(safe-area-inset-bottom, 0px) !important;
  }
}

/* ---- 7. header ----------------------------------------------------------- */
/* The header's 28x28 icon buttons and the 23x20 Agent Team chip are sized by the
   companion mobile plugin with \`min-width/min-height: 0 !important\` at a deeper
   specificity, so these need \`:not(#x)\` to out-rank them \u2014 otherwise the
   declaration is dropped and the button stays 28px. The conversation tabs are
   left to that plugin on purpose: forcing them to 44px overlaps the header's
   title row, which is worse than a 26px tab that is 50-78px wide.

   The "N subagents" chip in the same title cluster is also left at its natural
   size. It sits in an absolutely positioned box that is 21px tall with
   \`overflow: hidden\`, so a blanket 44px rule here does not grow it \u2014 it clips
   the chip in half. Every other control in that cluster (Agent Team, the
   directory toggle, Files) is targeted by name above. */

@media (max-width: 1023px) and (pointer: coarse) {
  html[data-ascii] :is([data-mobile-nav="frame"] [data-mobile-nav="toggle"],
      [data-mobile-nav="frame"] [data-mobile-nav="files"],
      [data-mobile-nav="frame"] [data-mobile-nav="session-log"]):not(#ax-specificity) {
    box-sizing: border-box;
    min-width: var(--ax-hit) !important;
    min-height: var(--ax-hit) !important;
    justify-content: center;
  }
  html[data-ascii] [data-mobile-nav="frame"] header [aria-label="Agent Team"]:not(#ax-specificity) {
    min-width: var(--ax-hit) !important;
    min-height: var(--ax-hit) !important;
  }
}

/* ---- 8. composer --------------------------------------------------------- */
/* 16px is not a style choice: below it iOS Safari zooms the viewport when the
   field takes focus, and never zooms back out. */

@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] [data-composer-card] {
    box-shadow: none !important;
    margin-inline: 0;
  }
  html[data-ascii] [data-composer-input] {
    font-size: 16px !important;
    line-height: 22px !important;
    min-height: 44px;
    max-height: min(40dvh, 132px);
    overflow-y: auto;
    -webkit-text-size-adjust: 100%;
    caret-shape: block;
  }
  /* Height, not width: nine controls share 356px, and forcing a width on the
     labelled ones (the model chip is 21px wide) makes them overlap at 320px.
     A 40px row is a thumb target, and the labelled controls are already wider
     than 44. The primary action still gets the full 44 in both axes. */
  html[data-ascii] [data-composer-card] :is(button, [role="button"]):not(#ax-specificity) {
    min-height: 40px !important;
    flex: 0 0 auto;
  }
  html[data-ascii] [data-composer-card] button[class*="_primary"]:not(#ax-specificity) {
    min-width: var(--ax-hit) !important;
    min-height: var(--ax-hit) !important;
  }
  /* The two collapsed chevrons (auto-continue mode, model picker) are 18px and
     24px wide. 24 is the WCAG 2.2 AA floor and costs the row 6px, which it has;
     widening further would overlap the host's own stacked chips. */
  html[data-ascii] [data-composer-card] :is(.dshAcModeTrigger, [class*="_trigger"]):not(#ax-specificity) {
    min-width: 24px !important;
  }
  /* the bubbles chat style draws \`send\` as a word on a 13px line */
  html[data-ascii-chat="bubbles"] [data-composer-card] button[class*="_primary"] {
    font: 14px/var(--ax-hit) var(--ax-mono, monospace) !important;
    padding: 0 1.5ch !important;
  }
  html[data-ascii-chat="bubbles"] [data-composer-card] [data-input-scroll] > [class*="_grow"]::before {
    left: 16px;
    top: 11px;
    line-height: 22px;
  }
  html[data-ascii-chat="bubbles"] [data-composer-card] [data-composer-input] { padding-left: calc(16px + 2ch) !important; }
  /* the stats row under the composer is 30px of 11px text; it survives as a
     scroll strip, and the status line can carry the same numbers */
  html[data-ascii] [data-composer-dock] {
    padding-bottom: env(safe-area-inset-bottom, 0px);
    overflow-x: auto;
    scrollbar-width: none;
    scroll-padding-inline: env(safe-area-inset-left, 0px) env(safe-area-inset-right, 0px);
  }
  html[data-ascii] [data-composer-dock]::-webkit-scrollbar { display: none; }
}

/* ---- 8b. transcript rows and the stats strip ----------------------------- */
/* Two families of host control are 18-24px tall on a phone: the stat pills under
   the composer (they open the activity / usage / context dialogs) and the
   collapsible Think / tool-call headers in the transcript. The pills get the
   full 44 because they are a short scroll strip; the transcript rows get 32
   because there can be hundreds of them and stacking 44px rows would turn a
   turn into a page. 24 is the WCAG 2.2 AA floor and 32 clears it with room. */

@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] [data-composer-dock] :is(button, [role="button"]):not(#ax-specificity) {
    min-height: var(--ax-hit) !important;
    min-width: var(--ax-hit) !important;
    align-items: center;
  }
  html[data-ascii] [data-composer-dock]:not(#ax-specificity) { min-height: calc(var(--ax-hit) + 4px); }
  html[data-ascii] [data-chat-flow-kind] :is(div, button)[role="button"]:not(#ax-specificity) {
    min-height: 32px;
  }
  /* Controls that only exist while the transcript is scrolled, so a pass over a
     resting page never sees them: the "back to bottom" pill (34x34, with the
     host's 0.5px ring and soft elevation shadows, which read as a light box
     against the flat skin) and the "load earlier" button (22px tall, and it has
     no class at all \u2014 \`:not([class])\` is the only handle on it). */
  html[data-ascii] button[class*="_toBottom"]:not(#ax-specificity) {
    min-width: var(--ax-hit) !important;
    min-height: var(--ax-hit) !important;
    background: var(--ax-bg1) !important;
    border: 0 !important;
    box-shadow: 0 0 0 1px var(--ax-line) !important;
    color: var(--ax-ink2) !important;
  }
  html[data-ascii] button[class*="_toBottom"]:not(#ax-specificity) svg {
    width: 16px;
    height: 16px;
  }
  html[data-ascii] [data-conversation-content] button:not([class]):not(#ax-specificity) {
    min-height: 36px !important;
  }
}

@media (max-width: 1023px) and (pointer: coarse) {
  html[data-ascii] [data-mobile-nav="frame"] header [aria-label="More conversation views"]:not(#ax-specificity) {
    min-width: var(--ax-hit) !important;
    min-height: var(--ax-hit) !important;
  }
}
/* ---- 9. conversation ----------------------------------------------------- */
/* The theme sets --dsh-chat-content-width to clamp(640px, \u2026) and the host reads
   it as a ceiling, so it never overflowed \u2014 but on a 390px phone every consumer
   was pinned to 640px of measure. Give it the host's own phone-safe value: the
   viewport minus the 16px gutters. */

@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] [data-conversation-content] {
    --dsh-chat-content-width: min(calc(100% - var(--ax-gutter) * 2), 920px);
    --dsh-chat-user-width: min(calc(100% - var(--ax-gutter) * 2), 920px);
  }
  html[data-ascii-chat="bubbles"] [data-chat-flow-kind="user"] [class*="_userStack"] {
    max-width: 85% !important;
  }
  /* markdown tables and code keep their own horizontal scroll */
  html[data-ascii] [class*="_markdown_"] [class*="_tableScroll"],
  html[data-ascii] [class*="_markdown_"] [data-code-block-content] {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-padding-inline: env(safe-area-inset-left, 0px) env(safe-area-inset-right, 0px);
  }
  /* the hero: a banner column is 6.85px wide, so a 79-column logo wants 540px.
     It is a real button (it steps the art), so it needs a tappable box too. */
  html[data-ascii] .ax-hero[data-ascii-hero="banner"] {
    font-size: min(7px, calc(min(560px, 88vw) / var(--ax-hero-cols, 79) / .6));
  }
  html[data-ascii] .ax-hero[data-ascii-hero="chat"] { width: min(320px, 86vw) !important; }
  html[data-ascii] .ax-hero:not(#ax-specificity) { min-height: var(--ax-hit); }
  html[data-ascii] [class*="_headline"] [class*="_titleGroup"] { font-size: 14px; }
}

/* ---- 10. settings row ---------------------------------------------------- */

@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] .ax-settings {
    grid-template-columns: 1fr;
    gap: 8px;
    font-size: 14px;
  }
  html[data-ascii] .ax-choices { gap: 8px; }
  html[data-ascii] .ax-choice {
    min-height: var(--ax-hit);
    padding: 0 14px;
    display: inline-flex;
    align-items: center;
    font-size: 14px;
  }
}

/* ---- 11. boot intro ------------------------------------------------------ */

@media (max-width: 767px), (max-height: 500px) {
  html[data-ascii] .ax-intro-banner { width: min(88vw, calc(var(--ax-logo-cols, 111) * 6.85px)) !important; }
  html[data-ascii] .ax-intro-sub { font-size: 11px; letter-spacing: .34em; }
  html[data-ascii] .ax-intro-hint { bottom: calc(20px + env(safe-area-inset-bottom, 0px)); }
}

/* ---- 12. reduced motion keeps its existing opt-outs, plus the keyboard ---- */

@media (prefers-reduced-motion: reduce) {
  html[data-ascii] .ax-menu { scroll-behavior: auto; }
}
`;

// src/skin.css
var skin_default = `/* dsh-theme-ascetic \u2014 terminal chrome layered over the token override.
   Everything is gated on html[data-ascii] (set by the plugin, removed on
   unload), and colours only reference --dsw-alias-* tokens, so the skin tracks
   whichever palette layer is active, including the stock one ("host"). */

/* ---- 1. type, geometry, materials --------------------------------------- */

html[data-ascii] {
  --ax-mono: "JetBrains Mono", "Berkeley Mono", "IBM Plex Mono", "SF Mono", "Cascadia Mono", Menlo, Consolas,
    "PingFang SC", "Microsoft YaHei", monospace;
  --dsh-font-family-text-default: var(--ax-mono);
}

html[data-ascii] body {
  --dsh-font-family-text-default: var(--ax-mono);
  --ax-ink: var(--dsw-alias-label-primary);
  --ax-ink2: var(--dsw-alias-label-secondary);
  --ax-ink3: var(--dsw-alias-label-tertiary);
  --ax-bg: var(--dsw-alias-bg-base);
  --ax-bg1: var(--dsw-alias-bg-layer-2);
  --ax-accent: var(--dsw-alias-brand-primary);
  /* Text on an accent fill. Not brand-primary-invert: the stock palette sets
     that to the same ink as brand-primary, which made such text invisible. */
  --ax-on-accent: var(--dsw-alias-bg-base);
  --ax-line: var(--dsw-alias-border-l3);
  --ax-line-soft: var(--dsw-alias-border-l2);
  --ax-drop: var(--dsw-alias-border-l2);

  --dsw-radius-xs: 0px;
  --dsw-radius-sm: 0px;
  --dsw-radius-md: 0px;
  --dsw-radius-lg: 0px;
  --dsw-radius-xl: 0px;
  --dsw-radius-panel: 0px;
  --dsl-code-block-border-radius: 0px;
  --dsw-shadow-lv1: 0 0 #0000;
  --dsw-shadow-lv2: 0 0 #0000;
  --dsw-shadow-lv3: 0 0 #0000;
  --dsw-elevation-stroke-color: var(--ax-line);
  --dsw-menu-backdrop-filter: none;
  --dsw-menu-surface-fill: var(--ax-bg1);
  --dsh-scrollbar-width: 6px;

  font-variant-ligatures: none;
  font-feature-settings: "liga" 0, "calt" 0;
}

/* Square everything: box-drawing has no round corners. SVG artwork keeps its
   own geometry. */
html[data-ascii] *:not(svg, svg *),
html[data-ascii] *::before,
html[data-ascii] *::after {
  border-radius: 0 !important;
  corner-shape: initial !important;
}

html[data-ascii] ::selection {
  background: var(--ax-accent);
  color: var(--ax-bg);
}

html[data-ascii] :focus-visible {
  outline-style: dashed !important;
  outline-offset: 1px;
}

/* Floating surfaces: one hard line plus an offset block shadow, like a
   window drawn with \u2591 characters. */
html[data-ascii] :is([role="menu"], [role="listbox"], [role="tooltip"], [role="dialog"] > div:first-child) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
html[data-ascii] :is([role="menu"], [role="listbox"]) {
  box-shadow: 0 0 0 1px var(--ax-line), 4px 4px 0 0 var(--ax-drop) !important;
  background: var(--ax-bg1) !important;
}

/* ---- 2. sidebar ---------------------------------------------------------- */

/* macOS Desktop leaves the frame and sidebar see-through over the window's
   native vibrancy, tinted 40-50% with a blue gradient, and gives New Session
   a white wash. A palette paints flat, opaque surfaces instead; \`host\` keeps
   the native material. */
html[data-ascii]:not([data-ascii-palette="host"]) body {
  background: var(--dsw-alias-bg-base);
}
html[data-ascii][data-platform]:not([data-ascii-palette="host"]) body {
  --dsw-specific-menu: var(--dsw-alias-bg-layer-2);
}
html[data-ascii]:not([data-ascii-palette="host"]) [class*="_sidebarCol"] {
  background: var(--dsw-specific-sidebar-fill) !important;
}
/* The expanded sidebar's top block: logo row, New Session, panel list. The
   rail (collapsed) keeps its square icon buttons. */
html[data-ascii] [class*="_root"]:has(> [class*="_logoRow"]):not([class*="_collapsed"]) > [class*="_logoRow"] {
  height: auto !important;
  min-height: 0 !important;
  padding-block: calc(var(--ax-stack) / 2) !important;
  margin-bottom: var(--ax-stack) !important;
}
html[data-ascii-no-brand] [class*="_root"]:has(> [class*="_logoRow"]):not([class*="_collapsed"]) > [class*="_logoRow"] {
  justify-content: flex-end !important;
}
html[data-ascii-no-brand] [class*="_logoRow"] > [class*="_brand"] {
  display: none !important;
}
/* On macOS the collapse toggle sits up in the traffic-light strip, so a
   logo row without its logo has nothing left to show. */
html[data-ascii-no-brand] [class*="_logoRow"]:not(:has([class*="_toggle"])) {
  display: none !important;
}
html[data-ascii] [class*="_root"]:has(> [class*="_logoRow"]):not([class*="_collapsed"]) > button[class*="_newSession"]:not([data-ascii-ns]) {
  height: var(--ax-nav) !important;
  min-height: 0 !important;
  padding: 0 8px !important;
  margin-bottom: var(--ax-stack) !important;
  justify-content: flex-start !important;
}
html[data-ascii] [class*="_root"]:has(> [class*="_logoRow"]):not([class*="_collapsed"]) > [class*="_panelList"] {
  gap: 0 !important;
  margin-bottom: var(--ax-stack) !important;
}
html[data-ascii] [class*="_root"]:has(> [class*="_logoRow"]):not([class*="_collapsed"]) > [class*="_panelList"] button[class*="_panelRow"] {
  height: var(--ax-nav) !important;
  min-height: 0 !important;
  padding-block: 0 !important;
}

/* New Session as an ascii.rest link: \`[+ new session]\`, no box, inverted on
   hover. The rail keeps its plus icon. */
html[data-ascii] button[class*="_newSession"] {
  background: transparent !important;
  box-shadow: none !important;
  border: 0 !important;
  color: var(--dsw-alias-label-primary) !important;
}
html[data-ascii] button[class*="_newSession"]:is(:hover, :focus-visible) {
  background: var(--dsw-alias-label-primary) !important;
  color: var(--dsw-alias-bg-base) !important;
}
/* Only the expanded sidebar: the rail is a 36px square holding just the plus
   icon, and left-aligning its content pins that icon 9px off-centre. */
html[data-ascii] [class*="_root"]:not([class*="_collapsed"]) button[class*="_newSession"] :is([class*="_newSessionLabelMask"], [class*="_newSessionContent"]) {
  justify-content: flex-start !important;
}
html[data-ascii] [class*="_root"]:not([class*="_collapsed"]) > button[class*="_newSession"] [class*="_newSessionContent"] > svg {
  display: none !important;
}
html[data-ascii] button[class*="_newSession"] [class*="_newSessionContent"] > span {
  text-transform: lowercase;
}
html[data-glyphs] button[class*="_newSession"] [class*="_newSessionContent"] > span::before { content: "[+ "; }
html[data-glyphs] button[class*="_newSession"] [class*="_newSessionContent"] > span::after { content: "]"; }
html[data-ascii] button[class*="_newSession"] [class*="_newSessionShortcut"] {
  margin-left: auto;
  opacity: .55;
}
html[data-ascii] button[class*="_newSession"] [class*="_newSessionShortcut"] kbd {
  color: inherit !important;
}

/* With the framed piece attached (installNewSessionArt): the button is only
   the frame, set apart from the panel rows by space and a dashed rule. */
html[data-ascii] button[class*="_newSession"][data-ascii-ns] {
  display: block !important;
  height: auto !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin-top: calc(var(--ax-stack) * 1.5) !important;
  margin-bottom: calc(var(--ax-stack) * 2 + 2px) !important;
  background: transparent !important;
  color: var(--ax-ink2) !important;
  overflow: hidden;
}
html[data-ascii] button[class*="_newSession"][data-ascii-ns]:is(:hover, :focus-visible) {
  background: transparent !important;
  color: var(--ax-accent) !important;
  outline: none !important;
}
html[data-ascii] button[class*="_newSession"][data-ascii-ns]:active {
  color: var(--ax-ink) !important;
}
html[data-ascii] button[class*="_newSession"][data-ascii-ns] > :not(.ax-ns) {
  display: none !important;
}
html[data-ascii] button[class*="_newSession"][data-ascii-ns] + [class*="_panelList"] {
  border-top: 1px dashed var(--ax-line-soft);
  padding-top: var(--ax-stack) !important;
}
.ax-ns {
  display: block;
  width: 100%;
  margin: 0;
  font-size: 12px; /* sets the cell size: a cell is .6em wide, 1.2em tall */
  pointer-events: none;
}
html[data-ascii-density="cozy"] .ax-ns { font-size: 13px; }
html[data-ascii-density="dense"] .ax-ns { font-size: 11px; }

html[data-ascii] body {
  --dsh-sidebar-inline-padding: var(--ax-pad);
}
html[data-ascii] :is([class*="_sessionRow"], [class*="_projectRow"]) {
  height: var(--ax-row) !important;
  min-height: var(--ax-row) !important;
}
html[data-ascii] [class*="_sessionRow"][class*="_selected"] {
  box-shadow: inset 2px 0 0 var(--ax-accent);
}
html[data-glyphs] [class*="_projectRow"] [class*="_name"]::before,
html[data-glyphs] [class*="_projectRow"] [class*="_title"]::before {
  content: "./";
  color: var(--ax-ink3);
}

/* ---- 3. conversation column ---------------------------------------------- */

html[data-ascii] [data-conversation-content] {
  --dsh-chat-content-width: var(--dsh-chat-user-width,
    clamp(640px, calc(var(--dsh-conversation-column-width, 0px) * var(--ax-col, .8)), var(--ax-maxw, 1040px)));
}
html[data-ascii] [data-chat-flow-kind] {
  --dsh-chat-flow-gap: var(--ax-flow-gap) !important;
}

/* Two chat styles. \`bubbles\` follows the ascii.rest chat piece: your messages
   in square boxes on the right (\u250C\u2510\u2514\u2518), replies in rounded ones on the left
   (\u256D\u256E\u2570\u256F), three dots while the reply is written, and the input as a rounded
   box with a \`>\` prompt and a \`send\` word. \`terminal\` keeps a shell look:
   prompts flush left in a dashed box behind \`>\`, replies as bare text. */

html[data-ascii] [data-chat-flow-kind="user"] [class*="_bubble"] {
  background: transparent !important;
  color: var(--ax-ink);
}

/* -- terminal */
html[data-ascii-chat="terminal"] [data-chat-flow-kind="user"] [class*="_userRow"] {
  align-items: flex-start !important;
}
html[data-ascii-chat="terminal"] [data-chat-flow-kind="user"] [class*="_userStack"] {
  align-items: flex-start !important;
  max-width: 100% !important;
}
html[data-ascii-chat="terminal"] [data-chat-flow-kind="user"] [class*="_bubble"] {
  border: 1px dashed var(--ax-line);
  padding: 3px 10px !important;
}
html[data-ascii-chat="terminal"][data-glyphs] [data-chat-flow-kind="user"] [class*="_bubble"] {
  padding-left: calc(10px + 2ch) !important;
  position: relative;
}
html[data-ascii-chat="terminal"][data-glyphs] [data-chat-flow-kind="user"] [class*="_bubble"]::before {
  content: ">";
  position: absolute;
  left: 10px;
  top: 3px;
  color: var(--ax-accent);
  font-weight: 700;
}

/* -- bubbles */
/* declared on body, where the palette tokens they read are resolved */
html[data-ascii-chat="bubbles"] body {
  --ax-box: var(--dsw-alias-border-l4);
  --ax-round: 8px;
}
html[data-ascii-chat="bubbles"] [data-chat-flow-kind="user"] [class*="_bubble"] {
  border: 1px solid var(--ax-box);
  padding: 2px 1ch !important;
}
html[data-ascii-chat="bubbles"] [data-chat-flow-kind="user"] [class*="_userStack"] {
  max-width: min(75%, 72ch) !important;
}
html[data-ascii-chat="bubbles"] [data-chat-flow-kind="assistant-step"] [data-slot="conversation.chat.node"] > [class*="_root"] {
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--ax-box);
  border-radius: var(--ax-round) !important;
  padding: 3px 1.5ch;
}
/* Collapsed Think / preview rows contain a flex child with min-width:0 +
   overflow:hidden + nowrap. Inside a fit-content parent that child shrinks to
   0px, leaving a 27x32 empty square. Keep those rows full-width. */
html[data-ascii-chat="bubbles"] [data-chat-flow-kind="assistant-step"] [data-slot="conversation.chat.node"] > [class*="_root"]:has([data-variant="think"]),
html[data-ascii-chat="bubbles"] [data-chat-flow-kind="assistant-step"] [data-slot="conversation.chat.node"] > [class*="_root"]:has([data-preview="true"]) {
  width: auto !important;
  max-width: none !important;
}
/* the dots bubble while a reply is being written */
html[data-ascii-chat="bubbles"] [data-chat-running="true"] :is([class*="_runningDivider"], [class*="_runningIcon"], [class*="_runningText"]) {
  display: none !important;
}
html[data-ascii-chat="bubbles"] [data-chat-running="true"] [class*="_runningContent"] {
  display: inline-block !important;
  border: 1px solid var(--ax-box);
  border-radius: var(--ax-round) !important;
  padding: 0 1.5ch;
  line-height: 22px;
  color: var(--ax-ink2);
}
html[data-ascii-chat="bubbles"] [data-chat-running="true"] [class*="_runningContent"]::after {
  content: "\xB7\xB7\xB7";
  display: inline-block;
  width: 3ch;
  animation: ax-dots .9s step-end infinite;
}
@keyframes ax-dots {
  0% { clip-path: inset(0 2ch 0 0); }
  33.333% { clip-path: inset(0 1ch 0 0); }
  66.666% { clip-path: inset(0 0 0 0); }
}

/* ---- 4. markdown as it reads in a terminal ------------------------------ */

html[data-ascii] [class*="_markdown_"] :is(h1, h2, h3, h4, h5, h6) {
  color: var(--ax-ink);
  margin-block: .9em .35em;
}
html[data-glyphs] [class*="_markdown_"] :is(h1, h2, h3, h4)::before {
  color: var(--ax-accent);
  font-weight: 700;
}
html[data-glyphs] [class*="_markdown_"] h1::before { content: "# "; }
html[data-glyphs] [class*="_markdown_"] h2::before { content: "## "; }
html[data-glyphs] [class*="_markdown_"] h3::before { content: "### "; }
html[data-glyphs] [class*="_markdown_"] h4::before { content: "#### "; }

html[data-ascii] [class*="_markdown_"] :is(p, ul, ol, blockquote, pre) {
  margin-block: .4em;
}
html[data-glyphs] [class*="_markdown_"] ul > li::marker {
  content: "- ";
  color: var(--ax-ink3);
}
html[data-glyphs] [class*="_markdown_"] ul ul > li::marker { content: "+ "; }
html[data-glyphs] [class*="_markdown_"] ul ul ul > li::marker { content: "* "; }
html[data-ascii] [class*="_markdown_"] ol > li::marker {
  color: var(--ax-ink3);
}

/* inline code keeps its backticks, dimmed */
html[data-ascii] [class*="_markdown_"] :is(p, li, td, th, h1, h2, h3, h4, blockquote) > code {
  background: transparent !important;
  border: 0 !important;
  padding: 0 !important;
  color: var(--ax-accent);
}
html[data-glyphs] [class*="_markdown_"] :is(p, li, td, th, h1, h2, h3, h4, blockquote) > code::before,
html[data-glyphs] [class*="_markdown_"] :is(p, li, td, th, h1, h2, h3, h4, blockquote) > code::after {
  content: "\`";
  color: var(--ax-ink3);
}

html[data-ascii] [class*="_markdown_"] blockquote {
  border-left: 1px dashed var(--ax-accent) !important;
  background: transparent !important;
  padding: 0 0 0 1.5ch !important;
  color: var(--ax-ink2);
}

html[data-ascii] [class*="_markdown_"] hr {
  border: 0;
  border-top: 1px dashed var(--ax-line);
  height: 0;
}

html[data-ascii] [class*="_markdown_"] a {
  text-decoration: underline dashed;
  text-underline-offset: 3px;
}

/* tables drawn as an ASCII grid */
html[data-ascii] [class*="_markdown_"] [class*="_tableScroll"] {
  border: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
}
html[data-ascii] [class*="_markdown_"] table {
  border-collapse: collapse !important;
  border: 1px solid var(--ax-line) !important;
}
html[data-ascii] [class*="_markdown_"] :is(th, td) {
  border: 1px solid var(--ax-line-soft) !important;
  padding: 1px 1ch !important;
  background: transparent !important;
}
html[data-ascii] [class*="_markdown_"] thead th {
  border-bottom: 3px double var(--ax-line) !important;
  color: var(--ax-ink);
}

/* code blocks: a framed panel with a dashed title rule */
html[data-ascii] .md-code-block,
html[data-ascii] [data-code-block-content] {
  box-shadow: none !important;
}
html[data-ascii] .md-code-block {
  border: 1px solid var(--ax-line) !important;
  background: var(--dsw-alias-markdown-code-block) !important;
}
html[data-ascii] [data-code-block-banner] {
  border-bottom: 1px dashed var(--ax-line-soft) !important;
  min-height: 0 !important;
  padding-block: 1px !important;
}

/* ---- 5. tool calls and turn process ------------------------------------- */

html[data-ascii] [data-chat-flow-kind="tool-call"] [data-state] {
  min-height: 0 !important;
}
html[data-ascii] [data-turn-process] {
  letter-spacing: .02em;
}
html[data-glyphs] [data-turn-process]::before {
  content: "[+]";
  margin-right: 1ch;
  color: var(--ax-ink3);
}
html[data-glyphs] [data-turn-process][data-open="true"]::before {
  content: "[-]";
}
/* The "Edited N files" card paints its header from the static grey scale
   (--changes-fill / --changes-hover), which no palette reaches. */
html[data-ascii]:not([data-ascii-palette="host"]) [class*="_card"] {
  --changes-fill: var(--dsw-alias-bg-layer-2);
  --changes-hover: var(--dsw-alias-interactive-bg-hover-solid);
}

/* ---- 6. composer --------------------------------------------------------- */

html[data-ascii] [data-composer-card] {
  border: 1px solid var(--ax-line) !important;
  box-shadow: 4px 4px 0 0 var(--ax-drop) !important;
  background: var(--dsw-specific-input-major) !important;
}
html[data-ascii] [data-composer-card]:focus-within {
  border-color: var(--ax-accent) !important;
}
html[data-ascii] [data-composer-input] {
  caret-color: var(--ax-accent);
  caret-shape: block;
}
html[data-ascii] body {
  --dsh-composer-stack-gap: 4px;
}
html[data-ascii-chat="terminal"] [data-composer-card] button[class*="_primary"] {
  background: var(--ax-accent) !important;
  color: var(--ax-on-accent) !important;
}
html[data-ascii] [data-composer-card] button[class*="_primary"] svg {
  color: inherit;
}

/* bubbles: the piece's input box, \`\u256D\u2500\u256E \u2502 > \u2588 \u2026 send \u2502 \u2570\u2500\u256F\` */
html[data-ascii-chat="bubbles"] [data-composer-card] {
  border-color: var(--ax-box) !important;
  border-radius: var(--ax-round) !important;
  box-shadow: none !important;
}
html[data-ascii-chat="bubbles"] [data-composer-card]:focus-within {
  border-color: var(--ax-ink) !important;
}
html[data-ascii-chat="bubbles"] [data-composer-card] [data-input-scroll] > [class*="_grow"]::before {
  content: ">";
  position: absolute;
  left: 14px;
  top: 4px;
  line-height: 24px;
  color: var(--ax-accent);
  font-weight: 700;
  pointer-events: none;
}
html[data-ascii-chat="bubbles"] [data-composer-card] [data-composer-input] {
  padding-left: calc(14px + 2ch) !important;
}
html[data-ascii-chat="bubbles"] [data-composer-card] [data-composer-placeholder] {
  box-sizing: border-box;
  padding-left: 2ch !important;
}
html[data-ascii-chat="bubbles"] [data-composer-card] button[class*="_primary"] {
  width: auto !important;
  min-width: 0 !important;
  padding: 0 1ch !important;
  background: transparent !important;
  color: var(--ax-ink) !important;
  box-shadow: none !important;
  font: 13px/24px var(--ax-mono, monospace) !important;
}
html[data-ascii-chat="bubbles"] [data-composer-card] button[class*="_primary"] svg {
  display: none !important;
}
html[data-ascii-chat="bubbles"] [data-composer-card] button[class*="_primary"]::after {
  content: "send";
}
/* the stop button carries a square glyph where send carries an arrow */
html[data-ascii-chat="bubbles"] [data-composer-card] button[class*="_primary"]:has(svg rect)::after {
  content: "stop";
}
html[data-ascii-chat="bubbles"] [data-composer-card] button[class*="_primary"]:is(:hover, :focus-visible):not(:disabled) {
  background: var(--ax-ink) !important;
  color: var(--ax-bg) !important;
}
html[data-ascii-chat="bubbles"] [data-composer-card] button[class*="_primary"]:disabled {
  color: var(--ax-ink3) !important;
  opacity: 1 !important;
}
html[data-ascii] [data-composer-dock] {
  font-size: 11px;
}
/* The stats row under the composer is hidden while the status line carries
   the same numbers (and opens the same popovers); it comes back when either
   the "chat stats row" option is on or the status line is off. */
html[data-ascii-no-dock]:not([data-ascii-no-status]) [data-composer-dock] {
  display: none !important;
}

/* A stock popover or menu opened from the status line, pinned above it. */
html[data-ascii] :is([role="dialog"], [role="menu"])[data-ascii-docked] {
  top: auto !important;
  bottom: calc(var(--ax-status-h, 20px) + 6px) !important;
  left: clamp(4px, var(--ax-pop-x, 4px), calc(100vw - 360px)) !important;
  right: auto !important;
  transform: none !important;
  box-shadow: 0 0 0 1px var(--ax-line), 4px 4px 0 0 var(--ax-drop) !important;
}

html[data-glyphs] [data-composer-stat] button::before {
  content: "[";
  color: var(--ax-ink3);
}
html[data-glyphs] [data-composer-stat] button::after {
  content: "]";
  color: var(--ax-ink3);
}

/* The queue dock (messages waiting behind a running turn) is the one composer
   surface that brings a face of its own: the queued-message preview and the
   "N queued" header pin Inter ahead of the type token, so that face wins
   wherever it is installed and the row drops out of the skin. The dock owns no
   slot here, so pin the whole subtree to the mono stack. */
html[data-ascii] :is([data-queue-dock], [data-queue-dock] *) {
  font-family: var(--ax-mono) !important;
}

/* ---- 7. blank-session hero ---------------------------------------------- */

html[data-ascii] [class*="_headline"]:has([data-ascii-hero]) {
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
html[data-ascii] [class*="_headline"]:has([data-ascii-hero]) [class*="_fishHitbox"] {
  width: auto !important;
  height: auto !important;
}
html[data-ascii] [class*="_headline"] [class*="_titleGroup"] {
  font-size: 15px;
  letter-spacing: .04em;
}
html[data-glyphs] [class*="_headline"] [class*="_titleGroup"] > span:first-child::before {
  content: "> ";
  color: var(--ax-accent);
}
html[data-glyphs] [class*="_headline"] [class*="_titleGroup"] > span:first-child::after {
  content: "_";
  color: var(--ax-accent);
  animation: ax-blink 1.1s steps(1) infinite;
}

.ax-hero {
  margin: 0;
  font: 7px/1 var(--ax-mono, monospace);
  letter-spacing: 0;
  color: var(--dsw-alias-brand-primary);
  white-space: pre;
  user-select: none;
  cursor: pointer;
  outline: none;
  transition: opacity .15s ease;
}
/* a click steps to the next art */
.ax-hero:hover { opacity: .8; }
.ax-hero:focus-visible { outline: 1px dashed var(--dsw-alias-brand-primary); outline-offset: 4px; }
/* a long logo shrinks to keep the banner inside the column */
.ax-hero[data-ascii-hero="banner"] { font-size: min(8px, calc(min(560px, 64vw) / var(--ax-hero-cols, 79) / .6)); }
/* a canvas: mount() sizes it to 100% inline, so the width needs !important */
.ax-hero[data-ascii-hero="chat"] { display: block; width: min(300px, 70vw) !important; }

@keyframes ax-blink {
  50% { opacity: 0; }
}

/* ---- 8. status line (shell.bottom) -------------------------------------- */

.ax-status {
  position: relative;
  display: flex;
  align-items: stretch;
  height: var(--ax-status-h, 20px);
  border-top: 1px solid var(--dsw-alias-border-l3);
  background: var(--dsw-specific-sidebar-fill);
  color: var(--dsw-alias-label-secondary);
  font: 11px/var(--ax-status-h, 20px) var(--ax-mono, monospace);
  white-space: nowrap;
  /* the host's bottom row scrolls whatever overflows it: never give it any */
  overflow: hidden;
  user-select: none;
  z-index: 5;
}
/* macOS rounds the window's corners into the bar: keep the gear and the
   clock clear of them */
html[data-platform="darwin"] .ax-status { padding: 0 12px; }
:where(.ax-status, .ax-menu, .ax-settings) :where(button) {
  all: unset;
  cursor: pointer;
}
.ax-seg {
  display: inline-flex;
  align-items: center;
  gap: 1ch;
  padding: 0 1ch;
  border-right: 1px solid var(--dsw-alias-border-l2);
}
.ax-seg:is(button):hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.ax-seg.ax-right {
  border-right: 0;
  border-left: 1px solid var(--dsw-alias-border-l2);
}
/* the gear glyph is drawn small by its font: size it to the bar instead */
.ax-gear {
  padding: 0 5px;
  font-size: calc(var(--ax-status-h, 20px) * .9);
  line-height: 1; /* its fallback face runs taller than the bar at this size */
  overflow: hidden;
  color: var(--dsw-alias-label-secondary);
}
.ax-mode {
  background: var(--dsw-alias-brand-primary);
  color: var(--ax-on-accent) !important;
  font-weight: 700;
  letter-spacing: .08em;
}
.ax-mode:hover {
  background: var(--dsw-alias-label-primary) !important;
  color: var(--dsw-alias-bg-base) !important;
}
.ax-fill { flex: 1; min-width: 0; }
@media (max-width: 1100px) {
  .ax-status .ax-opt { display: none; }
}
@media (max-width: 820px) {
  .ax-status .ax-opt2 { display: none; }
}
.ax-run { color: var(--dsw-alias-brand-primary); font-weight: 700; }
.ax-wait { color: var(--dsw-alias-state-warn-primary); font-weight: 700; }
.ax-idle { color: var(--dsw-alias-label-tertiary); }
.ax-ok { color: var(--dsw-alias-state-success-primary); }
.ax-err { color: var(--dsw-alias-state-error-primary); }
.ax-dim { color: var(--dsw-alias-label-tertiary); }
.ax-bar { color: var(--dsw-alias-brand-primary); letter-spacing: -.02em; }
.ax-bar .ax-dim { color: var(--dsw-alias-border-l4); }
.ax-bar.ax-hot { color: var(--dsw-alias-state-warn-primary); }
.ax-bar.ax-full { color: var(--dsw-alias-state-error-primary); }
/* RUN: an inverted segment, so a working agent reads from across the screen */
.ax-state-run {
  background: var(--dsw-alias-brand-primary);
  color: var(--ax-on-accent);
  font-weight: 700;
}
.ax-state-run .ax-dim { color: inherit; opacity: .7; }
.ax-scan { display: inline-block; width: 8ch; margin: 0; font: inherit; letter-spacing: 0; white-space: pre; }
.ax-toast { color: var(--dsw-alias-brand-primary); }

/* The account menu at the sidebar's foot ("\xB7\xB7\xB7 More") opens from the status
   line's gear instead; it comes back when the status line is off. */
html[data-ascii]:not([data-ascii-no-status]) [class*="_triggerRow"]:has(> [data-slot="settings.launcher"]) {
  display: none !important;
}
html[data-ascii]:not([data-ascii-no-status]) [class*="_settingsArea"]:not(:has([data-slot="sidebar.settings"] > :not([class*="_triggerRow"]))) {
  display: none !important;
}

/* quick menu above the status line */
.ax-menu {
  position: fixed;
  left: 4px;
  bottom: calc(var(--ax-status-h, 20px) + 6px);
  pointer-events: auto;
  min-width: 300px;
  padding: 4px 0;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 0 0 1px var(--dsw-alias-border-l3), 4px 4px 0 0 var(--dsw-alias-border-l2);
  font: 12px/18px var(--ax-mono, monospace);
  white-space: pre;
  z-index: 50;
}
.ax-menu-title {
  padding: 2px 1.5ch;
  color: var(--dsw-alias-label-tertiary);
}
.ax-menu-row {
  box-sizing: border-box;
  width: 100%;
  display: flex !important;
  gap: 1ch;
  padding: 0 1.5ch;
  cursor: pointer;
}
.ax-menu-row:hover, .ax-menu-row:focus-visible {
  background: var(--dsw-alias-brand-primary);
  color: var(--ax-on-accent);
}
.ax-menu-row .ax-key { margin-left: auto; color: inherit; opacity: .6; }

/* the logo text field, in the quick menu and the settings row */
.ax-input {
  all: unset;
  box-sizing: border-box;
  width: 14ch;
  padding: 0 .8ch;
  border: 1px solid var(--dsw-alias-border-l3);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  text-transform: uppercase;
  cursor: text;
}
.ax-input::placeholder { color: var(--dsw-alias-label-tertiary); }
.ax-input:focus { border-color: var(--dsw-alias-brand-primary); }
.ax-menu-row.ax-menu-field { align-items: center; cursor: default; }
.ax-menu-row.ax-menu-field:hover { background: none; color: inherit; }
.ax-menu-field .ax-input { margin-left: auto; line-height: 16px; }
.ax-settings .ax-input { justify-self: start; }

/* palette / density pickers, right-aligned over their segment */
.ax-menu.ax-pick {
  left: auto;
  min-width: 0;
  max-height: calc(100vh - var(--ax-status-h, 20px) - 16px);
  overflow-y: auto;
}
.ax-menu-group {
  padding: 4px 1.5ch 0;
  color: var(--dsw-alias-label-tertiary);
}
.ax-pick .ax-menu-row { gap: 1ch; padding-right: 1ch; }
.ax-radio { color: var(--dsw-alias-label-tertiary); }
.ax-menu-row[aria-checked="true"] .ax-radio { color: var(--dsw-alias-brand-primary); font-weight: 700; }
.ax-menu-row:is(:hover, :focus-visible) :is(.ax-radio, .ax-dim) { color: inherit; }
.ax-hint { margin-left: auto; padding-left: 2ch; }
.ax-swatches { display: inline-flex; align-items: center; gap: 6px; }
.ax-swatch {
  display: inline-flex;
  height: 14px;
  box-shadow: 0 0 0 1px var(--dsw-alias-border-l4);
}
.ax-swatch > i { display: block; width: 11px; }
.ax-swatch > i:last-child { width: 24px; }

/* ---- 9. settings row (General) ------------------------------------------ */

.ax-settings {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 16px;
  align-items: center;
  padding: 10px 0;
  font: 13px/20px var(--ax-mono, monospace);
  color: var(--dsw-alias-label-primary);
}
.ax-settings-title {
  grid-column: 1 / -1;
  font-weight: 700;
}
.ax-settings-title small {
  font-weight: 400;
  color: var(--dsw-alias-label-tertiary);
  margin-left: 1ch;
}
.ax-settings label { color: var(--dsw-alias-label-secondary); }
.ax-choices { display: flex; flex-wrap: wrap; gap: 4px; }
.ax-choice {
  all: unset;
  cursor: pointer;
  padding: 0 .8ch;
  border: 1px solid var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-secondary);
}
.ax-choice:hover { border-color: var(--dsw-alias-border-l4); color: var(--dsw-alias-label-primary); }
.ax-choice[aria-pressed="true"] {
  background: var(--dsw-alias-brand-primary);
  border-color: var(--dsw-alias-brand-primary);
  color: var(--ax-on-accent);
}
.ax-choice:focus-visible { outline: 1px dashed var(--dsw-alias-brand-primary); outline-offset: 1px; }

/* ---- 11. optional CRT ---------------------------------------------------- */

html[data-ascii-crt] body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  background:
    repeating-linear-gradient(0deg, rgba(0, 0, 0, .14) 0 1px, transparent 1px 3px),
    radial-gradient(ellipse at center, transparent 62%, rgba(0, 0, 0, .28) 100%);
  mix-blend-mode: multiply;
}
html[data-ascii-crt][data-ascii-scheme="dark"] body {
  text-shadow: 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary) 40%, transparent);
}

/* ---- 12. boot intro (intro.js) ------------------------------------------ */

.ax-intro {
  position: fixed;
  inset: 0;
  z-index: 2147483600;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #080b12;
  color: #c9d4ff;
  transition: opacity .6s ease;
  user-select: none;
}
.ax-intro[data-phase="out"] { opacity: 0; }

.ax-intro-logo {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 18px;
}
.ax-intro-banner {
  display: block;
  /* 6.85px a banner column: DEEPSEEK (111 columns) comes out at 760px */
  width: min(76vw, calc(var(--ax-logo-cols, 111) * 6.85px)) !important;
}
.ax-intro-sub {
  font: 600 13px/1 var(--ax-mono, monospace);
  letter-spacing: .5em;
  color: #7f93d9;
  opacity: 0;
  transition: opacity .6s ease .15s;
}
.ax-intro[data-sub="on"] .ax-intro-sub { opacity: 1; }
.ax-intro[data-phase="blink"] .ax-intro-logo {
  animation: ax-intro-blink .9s step-end 1;
}
@keyframes ax-intro-blink {
  0%, 33.33%, 66.66%, 100% { opacity: 1; }
  16.66%, 50%, 83.33% { opacity: 0; }
}

.ax-intro-crt {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(0deg, rgba(0, 0, 0, .3) 0 1px, transparent 1px 3px),
    radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, .6) 100%);
  animation: ax-intro-flicker .16s steps(2) infinite;
}
@keyframes ax-intro-flicker {
  0% { opacity: .94; }
  100% { opacity: 1; }
}

.ax-intro-hint {
  position: absolute;
  bottom: 28px;
  font: 600 11px/1 var(--ax-mono, monospace);
  letter-spacing: .35em;
  text-transform: uppercase;
  color: rgba(201, 212, 255, .45);
  animation: ax-blink 1.1s steps(1) infinite;
}
.ax-intro[data-phase="out"] .ax-intro-hint { visibility: hidden; }

@media (prefers-reduced-motion: reduce) {
  html[data-ascii-chat="bubbles"] [data-chat-running="true"] [class*="_runningContent"]::after { animation: none; }
  html[data-glyphs] [class*="_headline"] [class*="_titleGroup"] > span:first-child::after { animation: none; }
}
`;

// src/client.js
var SOURCE = "dsh-theme-ascetic", h = import_react.default.createElement, COMPACT_Q = "(max-width: 767px), (max-height: 500px)", TOUCH_Q = `(pointer: coarse), ${COMPACT_Q}`;
function usePrefs() {
  return import_react.default.useSyncExternalStore(prefs.subscribe, prefs.get, prefs.get);
}
function useMedia(query) {
  let read = () => typeof matchMedia == "function" && matchMedia(query).matches, subscribe = import_react.default.useCallback((fn) => {
    if (typeof matchMedia != "function") return () => {
    };
    let mq = matchMedia(query);
    return mq.addEventListener("change", fn), () => {
      mq.removeEventListener("change", fn);
    };
  }, [query]);
  return import_react.default.useSyncExternalStore(subscribe, read, read);
}
var dash = {
  value: null,
  key: "",
  listeners: /* @__PURE__ */ new Set(),
  /** Shallow merge: the seat and the status line publish different halves. */
  set(patch) {
    let next = { ...dash.value, ...patch }, key = JSON.stringify(next);
    if (key !== dash.key) {
      dash.key = key, dash.value = next;
      for (let fn of dash.listeners) fn();
    }
  },
  subscribe(fn) {
    return dash.listeners.add(fn), () => {
      dash.listeners.delete(fn);
    };
  },
  get: () => dash.value
}, notice = {
  text: "",
  listeners: /* @__PURE__ */ new Set(),
  show(text) {
    notice.text = text;
    for (let fn of notice.listeners) fn();
    clearTimeout(notice.timer), notice.timer = setTimeout(() => {
      notice.text = "";
      for (let fn of notice.listeners) fn();
    }, 2200);
  },
  subscribe(fn) {
    return notice.listeners.add(fn), () => {
      notice.listeners.delete(fn);
    };
  },
  get: () => notice.text
}, menu = {
  open: null,
  right: 4,
  // px from the window's right edge: where a picker's right side sits
  listeners: /* @__PURE__ */ new Set(),
  set(open) {
    if (menu.open !== open) {
      menu.open = open;
      for (let fn of menu.listeners) fn();
    }
  },
  /** Open `kind` (over `segment`, for a picker), or close it if it is open. */
  toggle(kind, segment) {
    segment && (menu.right = Math.max(4, Math.round(window.innerWidth - segment.getBoundingClientRect().right))), menu.set(menu.open === kind ? null : kind);
  },
  subscribe(fn) {
    return menu.listeners.add(fn), () => {
      menu.listeners.delete(fn);
    };
  },
  get: () => menu.open
};
function formatTokens(n) {
  return typeof n != "number" || !Number.isFinite(n) ? "\u2013" : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}k` : String(Math.round(n));
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function elapsed(ms) {
  let s = Math.max(0, Math.floor(ms / 1e3));
  return s >= 3600 ? `${Math.floor(s / 3600)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}` : `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}
function meter(ratio, cells = 10) {
  let r = Math.max(0, Math.min(1, ratio)), full = Math.round(r * cells);
  return ["\u2588".repeat(full), "\u2591".repeat(cells - full)];
}
function useTick(ms, active = !0) {
  let [, beat] = import_react.default.useReducer((x) => x + 1, 0);
  import_react.default.useEffect(() => {
    if (!active) return;
    let id = setInterval(beat, ms);
    return () => {
      clearInterval(id);
    };
  }, [ms, active]);
}
function usePiece(ref, make, deps) {
  import_react.default.useEffect(() => {
    let el = ref.current;
    if (el === null) return;
    let stop;
    try {
      stop = mount(el, make());
    } catch (error) {
      console.warn(`${SOURCE}: ascii.rest piece failed`, error), el.textContent = "";
    }
    return () => {
      typeof stop == "function" && stop();
    };
  }, deps);
}
var Guard = class extends import_react.default.Component {
  constructor(props) {
    super(props), this.state = { failed: !1 };
  }
  static getDerivedStateFromError() {
    return { failed: !0 };
  }
  componentDidCatch(error) {
    console.warn(`${SOURCE}: ${this.props.label} crashed and was hidden`, error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
};
function guarded(label, Comp) {
  function Guarded(props) {
    return h(Guard, { label }, h(Comp, props));
  }
  return Guarded.displayName = `AsciiGuard(${label})`, Guarded;
}
function applyDocument(ctx, p) {
  let root = document.documentElement;
  root.dataset.ascii = "", root.dataset.asciiDensity = p.density, root.dataset.asciiPalette = p.palette, root.dataset.asciiChat = p.chat, p.glyphs ? root.dataset.glyphs = "" : delete root.dataset.glyphs, p.crt ? root.dataset.asciiCrt = "" : delete root.dataset.asciiCrt, p.brand ? delete root.dataset.asciiNoBrand : root.dataset.asciiNoBrand = "", p.dock ? delete root.dataset.asciiNoDock : root.dataset.asciiNoDock = "", p.statusline ? delete root.dataset.asciiNoStatus : root.dataset.asciiNoStatus = "";
  let pin = pinnedScheme(p.palette);
  pin ? root.dataset.asciiPin = pin : delete root.dataset.asciiPin;
  let scheme = pin;
  if (scheme === null)
    try {
      scheme = ctx.theme.getTheme().active.colorScheme;
    } catch {
      scheme = "light";
    }
  root.dataset.asciiScheme = scheme;
}
function clearDocument() {
  let root = document.documentElement;
  for (let key of ["ascii", "asciiDensity", "asciiPalette", "glyphs", "asciiCrt", "asciiNoBrand", "asciiNoDock", "asciiNoStatus", "asciiChat", "asciiPin", "asciiScheme", "asciiKb"])
    delete root.dataset[key];
  root.style.removeProperty("--ax-pop-x"), root.style.removeProperty("--ax-kb");
}
function installSkin(ctx) {
  ctx.effect(() => {
    let tag = document.createElement("style");
    return tag.dataset.plugin = SOURCE, tag.dataset.pluginCss = `${SOURCE}/skin.css`, tag.textContent = `${skin_default}
${DENSITY_CSS}
${mobile_default}`, document.head.appendChild(tag), () => {
      tag.remove();
    };
  }, "ascii: stylesheets"), ctx.effect(() => {
    let palette = null, disposeTokens = () => {
    }, sync = (p) => {
      if (applyDocument(ctx, p), p.palette === palette) return;
      palette = p.palette, disposeTokens();
      let layer = tokenLayer(p.palette);
      disposeTokens = layer === null ? () => {
      } : ctx.theme.overrideTokens(SOURCE, layer);
    };
    sync(prefs.get());
    let unsubscribe = prefs.subscribe(sync);
    return () => {
      unsubscribe(), disposeTokens(), clearDocument();
    };
  }, "ascii: palette layer"), ctx.effect(watchStorage, "ascii: cross-window prefs"), ctx.effect(() => ctx.on("theme/change", () => applyDocument(ctx, prefs.get())), "ascii: theme follow");
}
var SCAN_WIDTH = 8, SCAN_TRAIL = "\u2588\u2593\u2592\u2591", SCAN = {
  meta: { name: "scan", category: "ui", note: "a block sweeping across a dotted track", cols: SCAN_WIDTH, rows: 1, fps: 16 },
  default: () => (t) => {
    let span = 2 * (SCAN_WIDTH - 1), step = Math.floor(t * 16) % span, head = step < SCAN_WIDTH ? step : span - step, dir = step < SCAN_WIDTH ? 1 : -1, out = "";
    for (let x = 0; x < SCAN_WIDTH; x += 1) {
      let behind = (head - x) * dir;
      out += behind >= 0 && behind < SCAN_TRAIL.length ? SCAN_TRAIL[behind] : "\xB7";
    }
    return out;
  }
};
function Scanner() {
  let ref = import_react.default.useRef(null);
  return usePiece(ref, () => SCAN, []), h("span", { ref, className: "ax-scan", "aria-hidden": !0, "data-ascii-art": "" });
}
var NO_HOOK = () => {
}, chatFold = (c) => c?.legacy ?? c;
function useSessionFacts(useSession, useChat) {
  let running = useSession((s) => s?.running === !0) === !0, active = useChat((c) => Array.isArray(chatFold(c)?.runningCalls) ? chatFold(c).runningCalls.length : 0) ?? 0, nodes = useChat((c) => chatFold(c)?.nodes), turns = useChat((c) => chatFold(c)?.turnTimings), seen = import_react.default.useRef(null);
  return running && seen.current === null && (seen.current = Date.now()), running || (seen.current = null), import_react.default.useMemo(() => {
    let ok = 0, err = 0;
    for (let node of Array.isArray(nodes) ? nodes : [])
      node?.kind === "tool-result" && (node.isError ? err += 1 : ok += 1);
    let turnStart = null;
    if (running && turns && typeof turns.values == "function")
      for (let t of turns.values()) t && t.endTime == null && typeof t.startTime == "number" && (turnStart = t.startTime);
    return { running, active, ok, err, turnStart: turnStart ?? seen.current };
  }, [running, active, nodes, turns]);
}
var STAT_TRIGGERS = {
  activity: '[data-composer-stat="activity"] button',
  usage: '[data-composer-stat="usage"] button',
  context: 'button[class*="_trigger"]'
};
function mainDock() {
  let width = (el) => el.closest("[data-conversation-content]")?.clientWidth ?? 0;
  return [...document.querySelectorAll("[data-composer-dock]")].sort((a, b) => width(b) - width(a))[0] ?? null;
}
function statTrigger(kind) {
  return mainDock()?.querySelector(STAT_TRIGGERS[kind]) ?? null;
}
function openDocked(trigger, segment, wasOpen, role) {
  if (wasOpen) return;
  document.documentElement.style.setProperty("--ax-pop-x", `${Math.round(segment.getBoundingClientRect().left)}px`);
  let popups = () => document.querySelectorAll(`[role="${role}"]`), before = new Set(popups()), mark = () => {
    for (let d of popups()) before.has(d) || (d.dataset.asciiDocked = "");
  }, watch = new MutationObserver(mark);
  watch.observe(document.body, { childList: !0, subtree: !0 }), setTimeout(() => {
    watch.disconnect();
  }, 600), trigger.click(), mark();
}
function openStat(kind, segment, wasOpen) {
  let trigger = statTrigger(kind);
  if (trigger === null) {
    notice.show("no stats for this view");
    return;
  }
  openDocked(trigger, segment, wasOpen, "dialog");
}
function StatButton({ kind, title, className = "", children }) {
  let wasOpen = import_react.default.useRef(!1);
  return h("button", {
    className: `ax-seg ax-stat ${className}`,
    title,
    "data-ascii-stat": kind,
    onPointerDown: () => {
      wasOpen.current = statTrigger(kind)?.getAttribute("aria-expanded") === "true";
    },
    onClick: (e) => {
      openStat(kind, e.currentTarget, wasOpen.current), wasOpen.current = !1;
    }
  }, children);
}
var MORE_TRIGGER = '[data-slot="settings.launcher"] button[aria-haspopup="menu"]';
function GearButton() {
  let wasOpen = import_react.default.useRef(!1), trigger = () => document.querySelector(MORE_TRIGGER);
  return h("button", {
    className: "ax-seg ax-gear",
    title: "more: settings, feedback, account",
    "aria-label": "More",
    "aria-haspopup": "menu",
    onPointerDown: () => {
      wasOpen.current = trigger()?.getAttribute("aria-expanded") === "true";
    },
    onClick: (e) => {
      let t = trigger();
      t === null ? notice.show("no menu here") : openDocked(t, e.currentTarget, wasOpen.current, "menu"), wasOpen.current = !1;
    }
  }, "\u2699\uFE0E");
}
function StatusSession(props) {
  let useSession = typeof props.useSession == "function" ? props.useSession : NO_HOOK, useChat = typeof props.useChat == "function" ? props.useChat : NO_HOOK, useProjection = typeof props.useProjection == "function" ? props.useProjection : NO_HOOK, facts = useSessionFacts(useSession, useChat), pressure = useProjection("contextPressure"), usage = useProjection("tokenUsage"), stats = useProjection("sessionStats");
  useTick(1e3, facts.running);
  let segs = [];
  if (facts.running ? segs.push(h(
    "span",
    { key: "state", className: "ax-seg ax-state-run" },
    h(Scanner),
    "RUN",
    facts.turnStart !== null ? h("span", null, elapsed(Date.now() - facts.turnStart)) : null,
    facts.active > 0 ? h("span", { className: "ax-dim" }, `${facts.active} tool${facts.active === 1 ? "" : "s"}`) : null
  )) : segs.push(h("span", { key: "state", className: "ax-seg ax-idle" }, props.sessionId ? "\u25CB IDLE" : "\u25CB NEW")), stats && typeof stats.turns == "number" && stats.turns > 0) {
    let tps2 = stats.decodeMs > 0 && stats.decodeTokens > 0 ? stats.decodeTokens / (stats.decodeMs / 1e3) : null;
    segs.push(h(
      StatButton,
      { key: "act", kind: "activity", title: "session statistics: LLM / tool time, TTFT, TPS" },
      stats.turns,
      h("span", { className: "ax-dim" }, stats.turns === 1 ? "turn" : "turns"),
      stats.steps ?? 0,
      h("span", { className: "ax-dim" }, stats.steps === 1 ? "step" : "steps"),
      tps2 !== null ? h("span", null, `${Math.round(tps2)}`, h("span", { className: "ax-dim" }, " tok/s")) : null
    ));
  }
  let capacity = pressure && typeof pressure.contextWindow == "number" && pressure.contextWindow > 0 ? pressure.contextWindow : null, used = pressure && typeof pressure.projectedTokens == "number" ? pressure.projectedTokens : null;
  if (capacity !== null && used !== null) {
    let ratio = used / capacity, [full, empty] = meter(ratio), tone = ratio >= 0.9 ? " ax-full" : ratio >= 0.7 ? " ax-hot" : "";
    segs.push(h(
      StatButton,
      { key: "ctx", kind: "context", title: `context ${formatTokens(used)} / ${formatTokens(capacity)}: breakdown` },
      h("span", { className: "ax-dim" }, "ctx"),
      h("span", { className: `ax-bar${tone}` }, "\u2595", full, h("span", { className: "ax-dim" }, empty), "\u258F"),
      `${Math.round(ratio * 100)}%`,
      h("span", { className: "ax-dim" }, `${formatTokens(used)}/${formatTokens(capacity)}`)
    ));
  }
  let read = usage?.cacheReadTokens ?? 0, input = (usage?.uncachedInputTokens ?? 0) + read + (usage?.cacheWriteTokens ?? 0);
  input + (usage?.outputTokens ?? 0) > 0 && segs.push(h(
    StatButton,
    { key: "tok", kind: "usage", className: "ax-opt", title: "session tokens: input \u2191 / output \u2193 / cache hit: details" },
    h("span", { className: "ax-dim" }, "tok"),
    `\u2191${formatTokens(input)}`,
    `\u2193${formatTokens(usage.outputTokens)}`,
    input > 0 ? h("span", { className: "ax-dim" }, `hit ${Math.round(read / input * 100)}%`) : null
  )), facts.ok + facts.err > 0 && segs.push(h(
    "span",
    { key: "tools", className: "ax-seg ax-opt", title: "tool calls: ok / failed" },
    h("span", { className: "ax-dim" }, "tools"),
    h("span", { className: "ax-ok" }, `${facts.ok}\u2713`),
    facts.err > 0 ? h("span", { className: "ax-err" }, `${facts.err}\u2717`) : null
  ));
  let tps = stats && typeof stats.decodeMs == "number" && stats.decodeMs > 0 && typeof stats.decodeTokens == "number" && stats.decodeTokens > 0 ? stats.decodeTokens / (stats.decodeMs / 1e3) : null;
  return import_react.default.useEffect(() => {
    dash.set({
      sessionId: props.sessionId ?? null,
      running: facts.running,
      active: facts.active,
      ok: facts.ok,
      err: facts.err,
      turnStart: facts.turnStart,
      turns: stats && typeof stats.turns == "number" ? stats.turns : null,
      steps: stats?.steps ?? null,
      tokPerSec: tps,
      context: capacity !== null && used !== null ? { used, capacity } : null,
      tokens: input + (usage?.outputTokens ?? 0) > 0 ? { input, output: usage?.outputTokens ?? 0, read } : null
    });
  }), h(import_react.default.Fragment, null, segs);
}
function useRunningCount(props) {
  let count = (typeof props.useSessions == "function" ? props.useSessions : NO_HOOK)((s) => {
    let n = 0;
    for (let id of Array.isArray(s?.ids) ? s.ids : []) s.byId?.[id]?.running === !0 && (n += 1);
    return n;
  });
  return typeof count == "number" ? count : 0;
}
function Popup({ className, style, title, onClose, children }) {
  let ref = import_react.default.useRef(null);
  return import_react.default.useEffect(() => {
    let onDown = (e) => {
      ref.current?.contains(e.target) || e.target.closest?.("[data-ascii-menu-toggle]") || onClose();
    }, onKey = (e) => {
      e.key === "Escape" && onClose();
    };
    document.addEventListener("pointerdown", onDown, !0), document.addEventListener("keydown", onKey, !0), window.addEventListener("resize", onClose);
    let el = ref.current, rows = [...el?.querySelectorAll("button") ?? []].filter((b) => !b.classList.contains("ax-sheet-grip"));
    return (el?.querySelector('[aria-checked="true"]') ?? rows[0])?.focus(), () => {
      document.removeEventListener("pointerdown", onDown, !0), document.removeEventListener("keydown", onKey, !0), window.removeEventListener("resize", onClose);
    };
  }, [onClose]), h(
    "div",
    { ref, className, style, role: "menu", onKeyDown: (e) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      let rows = [...ref.current.querySelectorAll("button")], at = rows.indexOf(document.activeElement);
      rows[(at + (e.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length]?.focus();
    } },
    h(SheetGrip, { title, onClose }),
    children
  );
}
function SheetGrip({ title, onClose }) {
  return useMedia(COMPACT_Q) ? h(
    "button",
    {
      role: "menuitem",
      className: "ax-sheet-grip",
      "aria-label": `close ${title || "menu"}`,
      onClick: onClose
    },
    h("span", null, "\u256D\u2500", title || "menu"),
    h("span", { className: "ax-hint" }, "\u25BE close")
  ) : null;
}
function QuickMenu({ p, onClose }) {
  let compact = useMedia(COMPACT_Q), [expanded, setExpanded] = import_react.default.useState(null), row = (key, label, value, onClick) => h(
    "button",
    { key, className: "ax-menu-row", onClick },
    h("span", null, label),
    h("span", { className: "ax-key" }, value)
  ), pick2 = (key, label, field, values) => {
    if (!compact)
      return row(key, label, `< ${p[field]} >`, () => prefs.cycle(field, values));
    let open = expanded === field;
    return h(
      import_react.default.Fragment,
      { key },
      h(
        "button",
        {
          className: "ax-menu-row",
          "aria-expanded": open,
          "aria-haspopup": "listbox",
          onClick: () => setExpanded(open ? null : field)
        },
        h("span", null, label),
        h("span", { className: "ax-key" }, p[field]),
        h("span", { className: "ax-caret" }, open ? "\u25BE" : "\u25B8")
      ),
      open ? h(
        "div",
        { className: "ax-options", role: "listbox", "aria-label": label },
        values.map((v) => h(
          "button",
          {
            key: v,
            role: "option",
            className: "ax-option",
            "aria-selected": p[field] === v,
            onClick: () => {
              prefs.set({ [field]: v }), setExpanded(null);
            }
          },
          field === "palette" ? h(Swatch, { choice: v }) : null,
          h("span", { className: "ax-option-name" }, v),
          field === "density" ? h("span", { className: "ax-dim ax-option-hint" }, DENSITY_ROWS[v]) : null
        ))
      ) : null
    );
  };
  return h(
    Popup,
    { className: "ax-menu", title: "ascii", onClose },
    h("div", { className: "ax-menu-title" }, compact ? "\u250C\u2500 ascii" : "\u250C\u2500 ascii \u2500 click to cycle"),
    pick2("pal", "palette", "palette", PALETTE_CHOICES),
    pick2("den", "density", "density", DENSITIES),
    row("chat", "chat style", `< ${p.chat} >`, () => prefs.cycle("chat", CHAT_STYLES)),
    row("hero", "hero art", `< ${p.hero} >`, () => prefs.cycle("hero", HEROES)),
    h("label", { key: "logo", className: "ax-menu-row ax-menu-field" }, h("span", null, "logo text"), h(LogoInput)),
    row("gly", "glyphs  # > [+] `code`", p.glyphs ? "[x]" : "[ ]", () => prefs.set({ glyphs: !p.glyphs })),
    row("crt", "crt scanlines", p.crt ? "[x]" : "[ ]", () => prefs.set({ crt: !p.crt })),
    row("brand", "sidebar logo", p.brand ? "[x]" : "[ ]", () => prefs.set({ brand: !p.brand })),
    row("dock", "chat stats row", p.dock ? "[x]" : "[ ]", () => prefs.set({ dock: !p.dock })),
    row("sl", "status line", p.statusline ? "[x]" : "[ ]", () => prefs.set({ statusline: !p.statusline })),
    row("intro", "boot intro", p.intro ? "[x]" : "[ ]", () => prefs.set({ intro: !p.intro }))
  );
}
function Swatch({ choice }) {
  return h("span", { className: "ax-swatches", "aria-hidden": !0 }, previewOf(choice).map((c, i) => h(
    "span",
    { key: i, className: "ax-swatch" },
    [c.bg, c.bg2, c.ink2, c.ink, c.accent].map((background, j) => h("i", { key: j, style: { background } }))
  )));
}
var PICKERS = {
  palette: { groups: PALETTE_GROUPS, hint: (v) => h(Swatch, { choice: v }) },
  density: { groups: [{ items: DENSITIES }], hint: (v) => h("span", { className: "ax-dim" }, `rows ${DENSITY_ROWS[v]}`) }
};
function Picker({ field, p, onClose }) {
  let { groups, hint } = PICKERS[field], option = (value) => h(
    "button",
    {
      key: value,
      className: "ax-menu-row",
      role: "menuitemradio",
      "aria-checked": p[field] === value,
      onClick: () => prefs.set({ [field]: value })
    },
    h("span", { className: "ax-radio" }, p[field] === value ? "(\u2022)" : "( )"),
    h("span", null, value),
    h("span", { className: "ax-hint" }, hint(value))
  );
  return h(
    Popup,
    { className: "ax-menu ax-pick", style: { right: menu.right }, title: field, onClose },
    h("div", { className: "ax-menu-title" }, `\u250C\u2500 ${field}`),
    groups.map((group, i) => h(
      import_react.default.Fragment,
      { key: i },
      group.label ? h("div", { className: "ax-menu-group", role: "presentation" }, `\u2500\u2500 ${group.label}`) : null,
      group.items.map(option)
    ))
  );
}
function PickButton({ field, label, open, value }) {
  return h("button", {
    className: "ax-seg ax-right ax-opt2",
    title: `${field}: choose`,
    "aria-haspopup": "menu",
    "aria-expanded": open === field,
    "data-ascii-menu-toggle": "",
    onClick: (e) => menu.toggle(field, e.currentTarget)
  }, h("span", { className: "ax-dim" }, label), value);
}
function SummarySeg() {
  let d = import_react.default.useSyncExternalStore(dash.subscribe, dash.get, dash.get), message = import_react.default.useSyncExternalStore(notice.subscribe, notice.get, notice.get), open = import_react.default.useSyncExternalStore(menu.subscribe, menu.get, menu.get);
  useTick(1e3, d?.running === !0);
  let parts = [];
  if (d?.running ? parts.push(h(
    "span",
    { key: "st", className: "ax-run" },
    "\u25CF RUN ",
    d.turnStart !== null && d.turnStart !== void 0 ? h("span", null, elapsed(Date.now() - d.turnStart)) : null
  )) : parts.push(h("span", { key: "st", className: "ax-idle" }, d?.sessionId ? "\u25CB IDLE" : "\u25CB NEW")), d?.active > 0 && parts.push(h("span", { key: "tl", className: "ax-dim" }, `${d.active} tool${d.active === 1 ? "" : "s"}`)), d?.context) {
    let ratio = d.context.used / d.context.capacity, [full, empty] = meter(ratio);
    parts.push(h("span", { key: "cx", className: "ax-bar" }, "\u2595", full, h("span", { className: "ax-dim" }, empty), "\u258F", `${Math.round(ratio * 100)}%`));
  }
  return parts.push(h("span", { key: "ch", className: "ax-chev" }, "\u25B4")), h(
    "button",
    {
      className: "ax-seg ax-summary",
      "aria-haspopup": "menu",
      "aria-expanded": open === "stats",
      "data-ascii-menu-toggle": "",
      title: message || "session state and statistics",
      onClick: () => menu.toggle("stats")
    },
    message ? h("span", { key: "msg", className: "ax-toast" }, message) : parts
  );
}
function StatsSheet({ onClose }) {
  let d = import_react.default.useSyncExternalStore(dash.subscribe, dash.get, dash.get) ?? {}, wasOpen = import_react.default.useRef(!1), row = (key, label, value, kind = null) => {
    if (value == null || value === "") return null;
    let cells = [h("span", { key: "l", className: "ax-dim" }, label), h("span", { key: "v", className: "ax-hint" }, value)];
    return kind === null ? h("div", { key, className: "ax-menu-row ax-row-info" }, cells) : h("button", {
      key,
      className: "ax-menu-row",
      title: `${label}: details`,
      onPointerDown: () => {
        wasOpen.current = statTrigger(kind)?.getAttribute("aria-expanded") === "true";
      },
      onClick: (e) => {
        let el = e.currentTarget;
        menu.set(null), openStat(kind, el, wasOpen.current), wasOpen.current = !1;
      }
    }, cells);
  }, state2 = d.running ? `\u25CF RUN ${d.turnStart !== null && d.turnStart !== void 0 ? elapsed(Date.now() - d.turnStart) : ""}`.trim() : d.sessionId ? "\u25CB IDLE" : "\u25CB NEW", ctx = d.context ? `${Math.round(d.context.used / d.context.capacity * 100)}% \xB7 ${formatTokens(d.context.used)}/${formatTokens(d.context.capacity)}` : null, tokens = d.tokens ? `\u2191${formatTokens(d.tokens.input)} \u2193${formatTokens(d.tokens.output)}${d.tokens.input > 0 ? ` \xB7 hit ${Math.round(d.tokens.read / d.tokens.input * 100)}%` : ""}` : null, activity = d.turns !== null && d.turns !== void 0 ? `${d.turns} ${d.turns === 1 ? "turn" : "turns"} \xB7 ${d.steps ?? 0} steps${d.tokPerSec ? ` \xB7 ${Math.round(d.tokPerSec)} tok/s` : ""}` : null;
  return h(
    Popup,
    { className: "ax-menu ax-sheet", title: "status", onClose },
    row("state", "state", d.active > 0 ? `${state2} \xB7 ${d.active} tool${d.active === 1 ? "" : "s"}` : state2),
    row("act", "activity", activity, "activity"),
    row("ctx", "context", ctx, "context"),
    row("tok", "tokens", tokens, "usage"),
    row("tools", "tools", d.ok + d.err > 0 ? `${d.ok}\u2713${d.err > 0 ? ` ${d.err}\u2717` : ""}` : null),
    row("run", "running", d.runningGlobal > 0 ? `${d.runningGlobal} across workspaces` : null),
    row("clock", "time", `${pad2((/* @__PURE__ */ new Date()).getHours())}:${pad2((/* @__PURE__ */ new Date()).getMinutes())}`)
  );
}
function StatusLine(props) {
  let p = usePrefs(), message = import_react.default.useSyncExternalStore(notice.subscribe, notice.get, notice.get), open = import_react.default.useSyncExternalStore(menu.subscribe, menu.get, menu.get), running = useRunningCount(props), compact = useMedia(TOUCH_Q);
  if (useTick(15e3, p.statusline), import_react.default.useEffect(() => {
    dash.set({ runningGlobal: running });
  }), !p.statusline) return null;
  let now = /* @__PURE__ */ new Date();
  return compact ? h(
    "div",
    { className: "ax-status", "data-ascii-statusline": "" },
    h(GearButton),
    h("button", {
      className: "ax-seg ax-mode",
      onClick: () => menu.toggle("ascii"),
      title: "ASCII theme menu",
      "aria-expanded": open === "ascii",
      "data-ascii-menu-toggle": ""
    }, "ASCII"),
    h(SummarySeg),
    props.renderSlot("ascii.status.session", {})
  ) : h(
    "div",
    { className: "ax-status", "data-ascii-statusline": "" },
    h(GearButton),
    h("button", {
      className: "ax-seg ax-mode",
      onClick: () => menu.toggle("ascii"),
      title: "ASCII theme menu",
      "aria-expanded": open === "ascii",
      "data-ascii-menu-toggle": ""
    }, "ASCII"),
    props.renderSlot("ascii.status.session", {}),
    message ? h("span", { className: "ax-seg ax-toast" }, message) : null,
    h("span", { className: "ax-fill" }),
    running > 0 ? h("span", { className: "ax-seg ax-right ax-run", title: "sessions running across all workspaces" }, `\u25CF ${running} running`) : null,
    h(PickButton, { field: "palette", label: "pal", open, value: p.palette }),
    h(PickButton, { field: "density", label: "den", open, value: p.density }),
    h("span", { className: "ax-seg ax-right" }, `${pad2(now.getHours())}:${pad2(now.getMinutes())}`)
  );
}
function MenuOverlay() {
  let p = usePrefs(), open = import_react.default.useSyncExternalStore(menu.subscribe, menu.get, menu.get), close = import_react.default.useCallback(() => {
    menu.set(null);
  }, []);
  return open === null || !p.statusline ? null : open === "ascii" ? h(QuickMenu, { p, onClose: close }) : open === "stats" ? h(StatsSheet, { onClose: close }) : h(Picker, { key: open, field: open, p, onClose: close });
}
function registerStatusLine(ctx) {
  ctx.slots.inject("shell.bottom", () => ctx.slots.register({
    name: "shell.bottom",
    children: { "ascii.status.session": { kind: "single", scope: "session-maybe" } }
  }, guarded("status line", StatusLine))), ctx.slots.inject("shell.overlay", () => ctx.slots.register(
    { name: "shell.overlay", id: "ascii.menu", order: 80 },
    guarded("quick menu", MenuOverlay)
  )), ctx.slots.inject("ascii.status.session", () => ctx.slots.register(
    { name: "ascii.status.session", id: "ascii.status.session" },
    guarded("status session", StatusSession)
  ));
}
function installViewport(ctx) {
  ctx.effect(() => {
    let vv = window.visualViewport, root = document.documentElement, raf = 0, apply2 = () => {
      if (raf = 0, !vv) return;
      let kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--ax-kb", `${Math.round(kb)}px`), kb > 120 ? root.dataset.asciiKb = "" : delete root.dataset.asciiKb;
    }, schedule = () => {
      raf === 0 && (raf = requestAnimationFrame(apply2));
    };
    return vv && (vv.addEventListener("resize", schedule, { passive: !0 }), vv.addEventListener("scroll", schedule, { passive: !0 })), apply2(), () => {
      raf !== 0 && cancelAnimationFrame(raf), vv && (vv.removeEventListener("resize", schedule), vv.removeEventListener("scroll", schedule)), root.style.removeProperty("--ax-kb"), delete root.dataset.asciiKb;
    };
  }, "ascii: viewport");
}
function installDrawerScrim(ctx) {
  ctx.effect(() => {
    let scrim = document.createElement("div");
    scrim.className = "ax-drawer-scrim", scrim.setAttribute("aria-hidden", "true");
    let timer = 0, apply2 = () => {
      let side = document.querySelector('[class*="_sidebarCol"]'), conversation = document.querySelector("[data-conversation-content]"), narrow = !window.matchMedia || matchMedia("(max-width: 1023px)").matches, want = !1;
      if (side?.isConnected && narrow && conversation) {
        let drawer = side.getBoundingClientRect(), column = conversation.getBoundingClientRect();
        want = drawer.width > 1 && drawer.height > 1 && drawer.right > column.left + 1;
      }
      want && !scrim.isConnected ? document.body.append(scrim) : !want && scrim.isConnected && scrim.remove();
    };
    return timer = setInterval(apply2, 200), window.addEventListener("resize", apply2, { passive: !0 }), apply2(), () => {
      clearInterval(timer), window.removeEventListener("resize", apply2), scrim.remove();
    };
  }, "ascii: drawer scrim");
}
var HERO_PIECES = {
  "black-hole": black_hole_exports,
  earth: earth_exports,
  eclipse: eclipse_exports,
  galaxy: galaxy_exports,
  planet: planet_exports,
  "torus-knot": torus_knot_exports,
  "matrix-rain": matrix_rain_exports,
  radar: radar_exports,
  synthwave: synthwave_exports
}, HERO_TALK = [
  "fix the failing auth tests",
  "on it. reading src/auth first",
  "skip the e2e ones for now",
  "done: 14 passing, 0 failing. open a pr?",
  "yes, and keep it small",
  "pushed. the diff is 38 lines."
];
function heroPiece(kind, logo) {
  return kind === "banner" ? banner(logo, { font: "block", shadow: "single", effect: "glint", speed: 0.6 }) : kind === "chat" ? { meta: meta10, default: () => chat({ messages: HERO_TALK }) } : HERO_PIECES[kind] ?? planet_exports;
}
var HERO_CYCLE = HEROES.filter((kind) => kind !== "stock" && kind !== "random");
function randomHero(avoid) {
  let pool = HERO_CYCLE.filter((kind) => kind !== avoid);
  return pool[Math.floor(Math.random() * pool.length)];
}
function HeroMark() {
  let p = usePrefs(), [drawn, setDrawn] = import_react.default.useState(() => randomHero()), random = p.hero === "random", kind = random ? drawn : p.hero, ref = import_react.default.useRef(null), piece = import_react.default.useMemo(() => heroPiece(kind, p.logo), [kind, p.logo]);
  usePiece(ref, () => piece, [piece]);
  let next = () => {
    if (random) {
      let other = randomHero(kind);
      setDrawn(other), notice.show(`hero: ${other} (random)`);
    } else
      prefs.cycle("hero", HERO_CYCLE), notice.show(`hero: ${prefs.get().hero}`);
  };
  return h(kind === "chat" ? "canvas" : "pre", {
    key: kind,
    ref,
    className: "ax-hero",
    "data-ascii-hero": kind,
    "data-ascii-art": "",
    style: kind === "banner" ? { "--ax-hero-cols": piece.meta.cols } : void 0,
    role: "button",
    tabIndex: 0,
    "aria-label": random ? `hero art: ${kind}, picked at random; draw another` : `hero art: ${kind}, show the next one`,
    title: random ? `${kind} (random) \xB7 click for another` : `${kind} \xB7 click for the next art`,
    onClick: next,
    onKeyDown: (e) => {
      e.key !== "Enter" && e.key !== " " || (e.preventDefault(), next());
    }
  });
}
function registerHero(ctx) {
  ctx.effect(() => {
    let dispose = null, sync = (p) => {
      let want = p.hero !== "stock";
      want && dispose === null ? dispose = ctx.slots.inject(
        "conversation.hero.brand.mark",
        () => ctx.slots.register({ name: "conversation.hero.brand.mark" }, guarded("hero", HeroMark))
      ) : !want && dispose !== null && (dispose(), dispose = null);
    };
    sync(prefs.get());
    let unsubscribe = prefs.subscribe(sync);
    return () => {
      unsubscribe(), dispose !== null && dispose();
    };
  }, "ascii: hero art");
}
function Choices({ field, list }) {
  let p = usePrefs();
  return h("div", { className: "ax-choices", role: "group" }, list.map((value) => h("button", {
    key: value,
    className: "ax-choice",
    "aria-pressed": p[field] === value,
    onClick: () => prefs.set({ [field]: value })
  }, value)));
}
function Toggle({ field }) {
  let p = usePrefs();
  return h("div", { className: "ax-choices" }, h("button", {
    className: "ax-choice",
    role: "switch",
    "aria-checked": p[field],
    "aria-pressed": p[field],
    onClick: () => prefs.set({ [field]: !p[field] })
  }, p[field] ? "[x] on" : "[ ] off"));
}
function LogoInput() {
  let p = usePrefs(), [draft, setDraft] = import_react.default.useState(p.logo), editing = import_react.default.useRef(!1);
  return import_react.default.useEffect(() => {
    editing.current || setDraft(p.logo);
  }, [p.logo]), h("input", {
    className: "ax-input",
    value: draft,
    maxLength: LOGO_MAX,
    spellCheck: !1,
    autoComplete: "off",
    placeholder: DEFAULTS.logo,
    title: `up to ${LOGO_MAX}: A-Z 0-9 . , ! ? ' : - + = / _ (blank for ${DEFAULTS.logo})`,
    "aria-label": "logo text",
    onFocus: () => {
      editing.current = !0;
    },
    onBlur: () => {
      editing.current = !1, setDraft(prefs.get().logo);
    },
    onChange: (e) => {
      setDraft(e.target.value), prefs.set({ logo: e.target.value });
    },
    onKeyDown: (e) => {
      e.key === "Enter" && e.currentTarget.blur();
    }
  });
}
function SettingsRow() {
  return h(
    "div",
    { className: "ax-settings" },
    h("div", { className: "ax-settings-title" }, "ASCetic", h("small", null, "// dsh-theme-ascetic")),
    h("label", null, "palette"),
    h(Choices, { field: "palette", list: PALETTE_CHOICES }),
    h("label", null, "density"),
    h(Choices, { field: "density", list: DENSITIES }),
    h("label", null, "chat style"),
    h(Choices, { field: "chat", list: CHAT_STYLES }),
    h("label", null, "hero art"),
    h(Choices, { field: "hero", list: HEROES }),
    h("label", null, "logo text"),
    h(LogoInput),
    h("label", null, "glyphs"),
    h(Toggle, { field: "glyphs" }),
    h("label", null, "status line"),
    h(Toggle, { field: "statusline" }),
    h("label", null, "crt"),
    h(Toggle, { field: "crt" }),
    h("label", null, "sidebar logo"),
    h(Toggle, { field: "brand" }),
    h("label", null, "chat stats row"),
    h(Toggle, { field: "dock" }),
    h("label", null, "boot intro"),
    h(Toggle, { field: "intro" })
  );
}
function registerSettings(ctx) {
  ctx.slots.inject("settings.general.item", () => ctx.slots.register(
    { name: "settings.general.item", id: "ascetic", order: 15 },
    guarded("settings", SettingsRow)
  ));
}
function installNewSessionArt(ctx) {
  ctx.effect(() => {
    let live = /* @__PURE__ */ new Map(), attach = (btn) => {
      let art = document.createElement("canvas");
      art.className = "ax-ns", art.setAttribute("aria-hidden", "true"), art.dataset.asciiArt = "", btn.append(art), btn.dataset.asciiNs = "";
      let hot = () => btn.matches(":hover, :focus-visible"), cols = 0, stop = () => {
      }, render = () => {
        let cell = (parseFloat(getComputedStyle(art).fontSize) || 12) * 0.6, next = Math.max(18, Math.floor(art.clientWidth / cell));
        if (next === cols || art.clientWidth === 0) return;
        cols = next, stop();
        let label = btn.querySelector('[class*="_newSessionLabel"]')?.textContent?.trim() || "new session";
        try {
          stop = mount(art, newSessionPiece(cols, label, hot), { motion: !1 });
        } catch (error) {
          console.warn(`${SOURCE}: new session art failed`, error), stop = () => {
          };
        }
      }, resize = new ResizeObserver(render);
      resize.observe(art), render(), live.set(btn, () => {
        resize.disconnect(), stop(), art.remove(), delete btn.dataset.asciiNs;
      });
    }, detach = (btn) => {
      live.get(btn)?.(), live.delete(btn);
    }, sync = () => {
      for (let btn of [...live.keys()])
        (!btn.isConnected || btn.closest('[class*="_collapsed"]')) && detach(btn);
      for (let btn of document.querySelectorAll('button[class*="_newSession"]'))
        live.has(btn) || btn.closest('[class*="_collapsed"]') || btn.parentElement?.querySelector(':scope > [class*="_logoRow"]') && attach(btn);
    }, timer = 0, schedule = () => {
      timer === 0 && (timer = setTimeout(() => {
        timer = 0, sync();
      }, 40));
    }, watch = new MutationObserver((records) => {
      for (let r of records)
        if (!(r.target.nodeType === 1 ? r.target : r.target.parentElement)?.closest("[data-ascii-art]")) {
          schedule();
          return;
        }
    });
    return watch.observe(document.body, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ["class"] }), sync(), () => {
      watch.disconnect(), clearTimeout(timer);
      for (let btn of [...live.keys()]) detach(btn);
    };
  }, "ascii: new session art");
}
function installIntro(ctx) {
  ctx.effect(() => !prefs.get().intro || globalThis.__dshAsciiIntroPlayed ? () => {
  } : typeof matchMedia == "function" && matchMedia("(prefers-reduced-motion: reduce)").matches ? () => {
  } : (globalThis.__dshAsciiIntroPlayed = !0, playIntro(prefs.get().logo, (error) => {
    console.warn(`${SOURCE}: intro piece failed`, error);
  })), "ascii: boot intro");
}
function apply(ctx) {
  for (let step of [installSkin, installViewport, installDrawerScrim, installIntro, registerStatusLine, registerHero, registerSettings, installNewSessionArt])
    step(ctx);
}
var inject = ["theme", "slots"];

return module.exports; } });
