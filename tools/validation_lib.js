// Shared by validate_engine.js and calibrate_engine.js: "blind" feature samples of real places vs empty built-up cells.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
globalThis.window = globalThis;
const J = require(path.join(root, 'assets', 'jabio-engine.js')), X = J._x;
const idx = fs.readFileSync(path.join(root, 'assets/data/cities/index.js'), 'utf8');
const cities = JSON.parse(idx.match(/GA_CITIES=(\[.*?\]);/s)[1]);
if (process.env.KERNEL) J.setKernel(process.env.KERNEL);
const load = id => { let data; globalThis.GA_CITY = d => { data = d; }; new Function(fs.readFileSync(path.join(root, 'assets/data/cities', id + '.js'), 'utf8'))(); return J.prepare(data); };

function auc(pos, neg) {                      // Mann-Whitney, ties count half
  const all = pos.map(v => [v, 1]).concat(neg.map(v => [v, 0])).sort((a, b) => a[0] - b[0]);
  let rs = 0, i = 0;
  while (i < all.length) {
    let j = i; while (j < all.length && all[j][0] === all[i][0]) j++;
    const avg = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) if (all[k][1]) rs += avg;
    i = j;
  }
  return (rs - pos.length * (pos.length + 1) / 2) / (pos.length * neg.length);
}
// a copy of the city where one type's own categories are blanked, so its inputs cannot contain itself
function blind(C, cats) {
  const B = Object.assign({}, C); B.L = {}; B.P = {}; B.F = {}; B.PC = {}; B.U = C.U;
  Object.keys(C.L).forEach(k => { if (k[0] !== '#') B.L[k] = C.L[k]; });
  cats.forEach(cat => { B.L[cat] = new Float32Array(C.n); });
  return B;
}
// features of every real place (pos) and every empty built-up cell (neg) for one type; null if too few places
function samples(C, type, R, minPos) {
  const rc = X.radiusCells(R), urb = X.urban(C, rc), cats = J.BIZ[type], T = J.TYPES[type];
  const o = { type, r: R, audience: [], priorities: [], strategy: 'balance' };
  const inc = [], has = new Uint8Array(C.n);
  cats.forEach(cat => { const p = C.d.poi[cat] || []; for (let i = 0; i < p.length; i += 2) { const c = J.cellOf(C, p[i] / 1e5, p[i + 1] / 1e5); if (c >= 0) { inc.push({ c, cat }); has[c] = 1; } } });
  const P = X.parts(blind(C, cats), type, o);
  const comp = X.compIndex(C, type, rc);
  let refv = 2.5; for (let i = 0; i < C.n; i++) if (comp.raw[i] > 0 && comp[i] < 100) { refv = comp.raw[i] / comp[i] * 100; break; }
  const exp = X.satModel(comp, P.demand, urb, C.n);
  const feat = (c, selfW) => { const cp = Math.min(100, Math.max(0, comp.raw[c] - selfW) / refv * 100); return { pop: P.pop[c], demand: P.demand[c], access: P.access[c], comp: cp, lowcomp: 100 - cp, room: X.roomOf(cp, exp, P.demand[c]), cell: c }; };
  const pos = inc.filter(x => urb[x.c] && !X.edgeCell(C, x.c)).map(x => feat(x.c, T.comp[x.cat] || 0));
  const neg = []; for (let c = 0; c < C.n; c++) if (urb[c] && !has[c] && !X.edgeCell(C, c)) neg.push(feat(c, 0));
  if (pos.length < (minPos || 30) || neg.length < 200) return null;
  return { pos, neg, W: P.W.top };
}
module.exports = { J, X, cities, load, auc, samples, root };
