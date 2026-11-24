// node tools/calibrate_engine.js [--write --i-know-it-favours-the-centre]
// NOT USED BY THE SITE ANY MORE. The fit rewards agreement with where businesses already are, which is the commercial core, so it pulled every
// answer towards the centre (mean distance of the top blocks from the centre: 3.8 km fitted, 4.5 km with the old shared weights, 5.3 km people-heavy).
// The site uses judgement weights (see CAL in assets/jabio-engine.js). Kept so the experiment can be repeated.
// Step 2: per-business weights for population / demand / access, fitted to where real businesses of that kind are,
// then TESTED ON CITIES THE FIT NEVER SAW (leave-one-city-out). Only a gain on unseen cities counts.
//
// Rules that keep this honest:
//  - the competition weight stays a product decision (0.20, or 0.35 for "avoid competition"). The data cannot set it:
//    businesses cluster, so "rivals nearby" always looks good in this kind of test (see VALIDATION.md).
//  - only the other 0.80 is fitted, split between population, demand and access, never negative.
//  - the fit is pulled halfway back to the old shared weights (shrinkage), so one odd category cannot swing a result.
const fs = require('fs'), path = require('path');
const { J, cities, load, auc, samples, root } = require('./validation_lib.js');
const WRITE = process.argv.includes('--write') && process.argv.includes('--i-know-it-favours-the-centre'), R = 1000, REST = 0.80, SHRINK = 0.5;
const DEF = { pop: .30 / REST, demand: .30 / REST, access: .20 / REST };     // old shared weights, as shares of the 0.80
const KEYS = ['pop', 'demand', 'access'];

// non-negative logistic regression on the three 0..100 inputs, by gradient descent
function fit(pos, neg) {
  const n = pos.length + neg.length, wp = n / (2 * pos.length), wn = n / (2 * neg.length);   // balance the classes
  let w = [.02, .02, .02], b = -3;
  const X = pos.map(f => [KEYS.map(k => f[k] / 100), 1, wp]).concat(neg.map(f => [KEYS.map(k => f[k] / 100), 0, wn]));
  for (let it = 0; it < 400; it++) {
    const g = [0, 0, 0]; let gb = 0;
    for (const [x, y, sw] of X) {
      const z = b + w[0] * x[0] + w[1] * x[1] + w[2] * x[2], p = 1 / (1 + Math.exp(-z)), e = (p - y) * sw;
      g[0] += e * x[0]; g[1] += e * x[1]; g[2] += e * x[2]; gb += e;
    }
    for (let k = 0; k < 3; k++) w[k] = Math.max(0, w[k] - 1.2 * g[k] / n);
    b -= 1.2 * gb / n;
  }
  return w;
}
const shares = w => { const s = w.reduce((a, c) => a + c, 0) || 1; return w.map(v => v / s); };
const blend = w => { const s = shares(w); return KEYS.map((k, i) => SHRINK * s[i] + (1 - SHRINK) * DEF[k]); };
const score = (f, sh, compW) => REST * (sh[0] * f.pop + sh[1] * f.demand + sh[2] * f.access) * (1) + compW * f.room;
const sub = (arr, m) => { if (arr.length <= m) return arr; const out = [], st = arr.length / m; for (let i = 0; i < m; i++) out.push(arr[Math.floor(i * st)]); return out; };

const data = {};            // type -> [{city, pos, neg}]
cities.forEach(cm => { const C = load(cm.id); J.ORDER.forEach(t => { const s = samples(C, t, R); if (s) (data[t] = data[t] || []).push({ city: cm.id, pos: s.pos, neg: sub(s.neg, 6000) }); }); });

const result = {}, lines = [];
lines.push('| Business | Cities | Old shared weights | Fitted weights (pop / demand / access) | AUC on unseen cities, old | AUC on unseen cities, fitted |');
lines.push('|---|---|---|---|---|---|');
let gOld = 0, gNew = 0, gN = 0;
J.ORDER.forEach(t => {
  const D = data[t]; if (!D || D.length < 4) { lines.push('| ' + t + ' | ' + (D ? D.length : 0) + ' | | too few cities: keeps the shared weights | | |'); return; }
  // leave-one-city-out
  let aOld = 0, aNew = 0, nn = 0;
  D.forEach(held => {
    const train = D.filter(d => d !== held), pos = [].concat(...train.map(d => d.pos)), neg = [].concat(...train.map(d => d.neg));
    const sh = blend(fit(pos, neg)), shOld = [DEF.pop, DEF.demand, DEF.access];
    const a1 = auc(held.pos.map(f => score(f, shOld, .2)), held.neg.map(f => score(f, shOld, .2)));
    const a2 = auc(held.pos.map(f => score(f, sh, .2)), held.neg.map(f => score(f, sh, .2)));
    aOld += a1 * held.pos.length; aNew += a2 * held.pos.length; nn += held.pos.length;
  });
  aOld /= nn; aNew /= nn;
  const pos = [].concat(...D.map(d => d.pos)), neg = [].concat(...D.map(d => d.neg));
  const sh = blend(fit(pos, neg)), w80 = sh.map(v => +(v * REST).toFixed(3));
  // a fit that does not beat the old weights on unseen cities is not used
  const use = aNew > aOld + 0.002;
  result[t] = use ? { pop: w80[0], demand: w80[1], access: w80[2] } : null;
  gOld += aOld * nn; gNew += (use ? aNew : aOld) * nn; gN += nn;
  lines.push('| ' + t + ' | ' + D.length + ' | .30 / .30 / .20 | ' + (use ? w80.join(' / ') : 'not used (no gain)') + ' | ' + aOld.toFixed(3) + ' | ' + aNew.toFixed(3) + ' |');
});
console.log(lines.join('\n'));
console.log('\nOverall on unseen cities: old ' + (gOld / gN).toFixed(3) + ' -> calibrated ' + (gNew / gN).toFixed(3));
console.log(JSON.stringify(result));
if (WRITE) {
  const p = path.join(root, 'assets', 'jabio-engine.js'); let s = fs.readFileSync(p, 'utf8');
  const block = '/*CAL:START (written by tools/calibrate_engine.js)*/\n  var CAL = ' + JSON.stringify(result) + ';\n  /*CAL:END*/';
  s = s.replace(/\/\*CAL:START[\s\S]*?\/\*CAL:END\*\//, block);
  fs.writeFileSync(p, s);
  fs.writeFileSync(path.join(root, 'tools', 'calibration.md'), '# Calibration (step 2)\n\nGenerated by `node tools/calibrate_engine.js --write`. Weights are fitted to where real businesses are, and judged only on cities held out of the fit.\n\n' + lines.join('\n') + '\n\nOverall on unseen cities: old ' + (gOld / gN).toFixed(3) + ', calibrated ' + (gNew / gN).toFixed(3) + '.\n\nThe competition weight (0.20, or 0.35 for "avoid competition") is not fitted: businesses cluster, so the data would always push it to zero or below. It stays a product decision.\n');
  console.log('written');
}
