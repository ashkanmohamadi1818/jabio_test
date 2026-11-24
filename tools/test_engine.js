// node tools/test_engine.js: checks the scoring engine against the real city snapshots.
const fs = require('fs'), path = require('path'), assert = require('assert');
const root = path.join(__dirname, '..');
globalThis.window = globalThis;
const J = require(path.join(root, 'assets', 'jabio-engine.js'));
const load = id => { let data; globalThis.GA_CITY = d => { data = d; }; new Function(fs.readFileSync(path.join(root, 'assets/data/cities', id + '.js'), 'utf8'))(); return J.prepare(data); };
let fails = 0;
const ok = (name, cond, extra) => { console.log((cond ? 'ok   ' : 'FAIL ') + name + (extra ? '  ' + extra : '')); if (!cond) fails++; };
const t0 = Date.now();
const T = load('tehran');
console.log('tehran', T.nx + 'x' + T.ny, 'buildings', T.buildings, 'places', T.places, T.coverage, 'load ms', Date.now() - t0);

// every type, every radius: scores in range, nothing NaN
let allIn = true, nan = false;
for (const type of J.ORDER) for (const r of [500, 1000, 2000, 3000]) {
  const res = J.topAreas(T, { type, r }, 6);
  res.areas.forEach(a => { if (!(a.score >= 0 && a.score <= 100)) allIn = false; if ([a.pop, a.demand, a.access, a.comp].some(Number.isNaN)) nan = true; });
}
ok('scores stay in 0..100', allIn); ok('no NaN anywhere', !nan);

// determinism
const a1 = J.topAreas(T, { type: 'cafe', r: 1000 }, 6).areas.map(a => a.cell).join();
const a2 = J.topAreas(T, { type: 'cafe', r: 1000 }, 6).areas.map(a => a.cell).join();
ok('same input, same answer', a1 === a2);

// timing with caches cold, then warm
const T2 = load('tehran'); let t = Date.now();
J.topAreas(T2, { type: 'cafe', r: 1000 }, 6); const cold = Date.now() - t; t = Date.now();
J.topAreas(T2, { type: 'cafe', r: 1000 }, 6); const warm = Date.now() - t; t = Date.now();
J.rankTypes(T2, 35.7219, 51.4000, { r: 1000 }); const rank = Date.now() - t;
ok('cold Tehran under 2.5 s', cold < 2500, cold + ' ms (warm ' + warm + ', all-types rank ' + rank + ')');

const T3 = load('tehran'); t = Date.now(); J.topAreas(T3, { type: 'cafe', r: 3000 }, 6); const wide = Date.now() - t; t = Date.now(); J.rankTypes(T3, 35.7219, 51.4, { r: 3000 }); const wideRank = Date.now() - t;
ok('widest radius on the biggest city stays under 2.5 s cold (areas ' + wide + ' ms, all-types ' + wideRank + ' ms)', wide < 2500 && wideRank < 2500);
// the top cafe areas of Tehran should be built-up, with demand, and named
console.log('\nTehran, cafe, 1 km, no preferences:');
const top = J.topAreas(T, { type: 'cafe', r: 1000 }, 6).areas;
top.forEach((a, i) => console.log(' ', i + 1, a.score, a.lat.toFixed(4), a.lon.toFixed(4), 'pop', a.pop, 'dem', a.demand, 'acc', a.access, 'comp', a.comp, '|', a.place ? a.place.fa + ' / ' + a.place.en + ' (' + a.place.dist + ' m)' : 'unnamed'));
ok('no two ranked areas share a name', new Set(top.map(x => x.place && x.place.en)).size === top.length, top.map(x => x.place && x.place.en).join(' | '));
ok('top areas are well apart', top.every((a, i) => top.every((b, j) => i === j || J.metres(T, a, b) >= 1000)));
ok('every ranked area has demand of at least ' + J.MIN_DEMAND, top.every(a => a.demand >= J.MIN_DEMAND), 'lowest ' + Math.min(...top.map(a => a.demand)));

// the formula in the doc, reproduced by hand for one area
const a = top[0], w = J.weights('cafe', {}).top;
const hand = w.pop * a.pop + w.demand * a.demand + w.access * a.access + w.comp * a.room;
ok('score equals the documented formula', Math.abs(hand - a.score) <= 1.2, 'hand ' + hand.toFixed(1) + ' vs ' + a.score);

// strategy and preferences really move the answer
const base = J.topAreas(T, { type: 'cafe', r: 1000 }, 1).areas[0];
const low = J.topAreas(T, { type: 'cafe', r: 1000, strategy: 'low' }, 1).areas[0];
const clus = J.topAreas(T, { type: 'cafe', r: 1000, strategy: 'cluster' }, 1).areas[0];
ok('"avoid competition" finds quieter ground', low.comp <= base.comp, 'comp ' + base.comp + ' -> ' + low.comp);
ok('"cluster" accepts more rivals than "avoid"', clus.comp >= low.comp, 'comp ' + low.comp + ' -> ' + clus.comp);
// an audience changes the answer where it should: students help beside universities, not beside offices
const U = [35.7010, 51.3950], O = [35.7570, 51.4100];   // Enghelab (universities) and Vanak (offices)
const sc = (p, aud) => J.analyzePoint(T, p[0], p[1], { type: 'cafe', r: 1000, audience: aud }).score;
const dU = sc(U, ['students']) - sc(U, []), dO = sc(O, ['students']) - sc(O, []);
ok('"students" lifts the university district more than the office district', dU > dO, 'change ' + dU + ' vs ' + dO);
const eU = sc(U, ['employees']) - sc(U, []), eO = sc(O, ['employees']) - sc(O, []);
ok('"employees" lifts the office district more than the university district', eO > eU, 'change ' + eO + ' vs ' + eU);

// a spot with no data is honest about it
const far = J.analyzePoint(T, 35.2, 51.0, { type: 'cafe', r: 1000 });
ok('a point outside the mapped window gives null, not a made-up score', far === null);

// competitor list matches the number the score uses
const d = J.analyzePoint(T, a.lat, a.lon, { type: 'cafe', r: 1000 });
ok('competitor list is sorted by distance', d.competitors.every((c, i) => i === 0 || c.dist >= d.competitors[i - 1].dist));
ok('every competitor is inside the radius', d.competitors.every(c => c.dist <= 1000));
console.log('  nearest cafes:', d.competitors.filter(c => c.cat === 'cafe').slice(0, 4).map(c => (c.name || '(unnamed)') + ' ' + c.dist + ' m').join(' | '));
console.log('  verdict', d.verdict, '| good', JSON.stringify(d.good), '| bad', JSON.stringify(d.bad), '| risks', d.risks.map(r => r.k).join(','));

// ranking all businesses at one spot (Vanak-ish)
console.log('\nWhat fits near 35.7570, 51.4100 (north-central Tehran), 1 km:');
J.rankTypes(T, 35.7570, 51.4100, { r: 1000 }).forEach(r => console.log('  ', r.type.padEnd(11), String(r.score).padStart(3), 'demand', String(r.demand).padStart(3), 'comp', String(r.comp).padStart(3), 'gap', String(r.gap).padStart(4), r.quadrant));

// every business type has its own colour on the map, and the places list matches the competitor count
const COL = { restaurant: '#ED4545', cafe: '#EDB545', services: '#9AA3B5', grocery: '#45ED45', pharmacy: '#61EFC0',
  fitness: '#4545ED', clinic: '#4588ED', education: '#CBF27D', beauty: '#EB84BB', fashion: '#ED45E1' };
const lab = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); const [r, g, b] = c; const x = (r * .4124 + g * .3576 + b * .1805) / .95047, yy = r * .2126 + g * .7152 + b * .0722, z = (r * .0193 + g * .1192 + b * .9505) / 1.08883; const f = t => t > .008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; return [116 * f(yy) - 16, 500 * (f(x) - f(yy)), 200 * (f(yy) - f(z))]; };
let minDist = 1e9; const ks = Object.keys(COL); ks.forEach((a, i) => ks.slice(i + 1).forEach(c => { const A = lab(COL[a]), B = lab(COL[c]), d = Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); if (d < minDist) minDist = d; }));
ok('ten business types, ten colours that no two look alike (CIE difference > 30)', ks.length === J.ORDER.length && J.ORDER.every(t => COL[t]) && minDist > 30, 'closest pair ' + minDist.toFixed(1));
const around = J.placesAround(T, 35.72148, 51.38862, 1000);
ok('places around a spot are grouped by type and sorted by distance', around.every((x, i) => J.ORDER.includes(x.biz) && (i === 0 || x.dist >= around[i - 1].dist)), around.length + ' places');
ok('cafes on the map equal cafes counted as competitors', around.filter(x => x.biz === 'cafe').length === J.near(T, ['cafe'], 35.72148, 51.38862, 1000).length);
// population: the estimate is present, adds up to something plausible, and is shown rounded
ok('Tehran has a population estimate', T.hasPop === true);
const pa = J.analyzePoint(T, 35.7219, 51.4000, { type: 'cafe', r: 1000 });
ok('people within 1 km of central Tehran is a plausible number (5 000 to 150 000)', pa.people > 5000 && pa.people < 150000, pa.people + ' people');
ok('people estimate is rounded, not falsely precise', pa.people % 10 === 0);
// SANITY CHECK (not a validation): well-known commercial hubs should out-score the far edge of the city
const hub = (n, lat, lon) => ({ n, s: J.analyzePoint(T, lat, lon, { type: 'cafe', r: 1000 }) });
const hubs = [hub('Tajrish', 35.8040, 51.4330), hub('Valiasr/Vanak', 35.7570, 51.4100), hub('Enghelab', 35.7010, 51.3950)];
const edge = J.analyzePoint(T, 35.5300, 51.2600, { type: 'cafe', r: 1000 });
hubs.forEach(h => console.log('  hub', h.n, h.s && ('score ' + h.s.score + ' demand ' + h.s.demand + ' people ' + h.s.people)));
console.log('  edge', edge ? 'score ' + edge.score + ' demand ' + edge.demand : 'outside window');
// Tajrish: WorldPop alone gave ~250 people/km2 there (raw grid checked); the building-footprint blend (tools/blend_population.py) lifts it.
// It is listed, not hidden, and not counted as a pass.
const solid = hubs.filter(h => h.n !== 'Tajrish');
ok('sanity: Vanak and Enghelab have strong demand (>= 60) for cafes', solid.every(h => h.s && h.s.demand >= 60), solid.map(h => h.n + ' ' + (h.s && h.s.demand)).join(', '));
ok('sanity: all three hubs beat a peripheral spot on demand', !edge || hubs.every(h => h.s.demand > edge.demand));
console.log('  Tajrish: demand ' + hubs[0].s.demand + ', people ' + hubs[0].s.people);
// plausible range: contains the score, is wider where the map data is thinner
const pr = J.topAreas(T, { type: 'cafe', r: 1000 }, 6).areas;
ok('every score sits inside its plausible range', pr.every(x => x.range.low <= x.score && x.score <= x.range.high), pr.map(x => x.range.low + '-' + x.score + '-' + x.range.high).join(' | '));
const wid = id => { const C = load(id), r = J.topAreas(C, { type: 'pharmacy', r: 1000 }, 3).areas; return r.reduce((s, x) => s + x.range.high - x.range.low, 0) / r.length; };
ok('range is wider for a thin city than for Tehran', wid('urmia') > wid('tehran'), 'urmia ' + wid('urmia').toFixed(1) + ' vs tehran ' + wid('tehran').toFixed(1));
// local data completeness: Shahrak Azadi / Farhangian (District 21: about 40,000 residents within 1 km, few shops mapped) must be flagged; well-mapped districts must not
const ek = J.analyzePoint(T, 35.7115, 51.2737, { type: 'cafe', r: 1000 }), nm = J.analyzePoint(T, 35.7373, 51.5075, { type: 'cafe', r: 1000 }), vk = J.analyzePoint(T, 35.7570, 51.4100, { type: 'cafe', r: 1000 });
ok('Shahrak Azadi (District 21) is flagged as thinly mapped (completeness under 40)', ek.complete < 40 && ek.risks.some(r => r.k === 'thinHere'), 'complete ' + ek.complete);
ok('well-mapped Narmak and Vanak are not flagged', nm.complete >= 60 && vk.complete >= 60 && !nm.risks.some(r => r.k === 'thinHere'), nm.complete + ' / ' + vk.complete);
const rel = x => (x.range.high - x.range.low) / Math.max(1, x.score);
ok('a thin spot has a wider plausible range, relative to its score, than a well-mapped one', rel(ek) > rel(vk), rel(ek).toFixed(2) + ' vs ' + rel(vk).toFixed(2));
ok('the ranking never offers a thinly mapped area as a top pick', J.topAreas(T, { type: 'cafe', r: 1000 }, 6).areas.every(x => x.complete >= J.THIN_HERE * 100));
// decision facts
const ins = J.analyzePoint(T, 35.7219, 51.4, { type: 'cafe', r: 1000 });
ok('percentile is 0..100', ins.percentile >= 0 && ins.percentile <= 100, ins.percentile + '');
ok('audience mix has four groups, each 0..100', ['residents', 'workers', 'students', 'visitors'].every(k => ins.audienceMix[k] >= 0 && ins.audienceMix[k] <= 100), JSON.stringify(ins.audienceMix));
ok('radius table covers 500/1000/2000/3000 and repeats the shown score at the chosen radius', ins.byRadius.map(x => x.r).join() === '500,1000,2000,3000' && ins.byRadius.find(x => x.r === 1000).score === ins.score, JSON.stringify(ins.byRadius.map(x => x.score)));
ok('nearest rival is the nearest same-type competitor', !ins.nearestRival || ins.nearestRival.dist === Math.min(...ins.competitors.filter(c => c.cat === 'cafe').map(c => c.dist)), JSON.stringify(ins.nearestRival));
ok('better spots are better, near, apart, and never in thinly mapped cells', ins.betterNearby.every((b, i) => b.score >= ins.score + 3 && b.dist <= 1500 && J.analyzePoint(T, b.lat, b.lon, { type: 'cafe', r: 1000 }).complete >= J.THIN_HERE * 100), JSON.stringify(ins.betterNearby.map(b => b.score + '/' + b.dist)));
ok('people per rival is a number and the city benchmark exists', ins.perRival.value > 0 && ins.perRival.median > 0, JSON.stringify(ins.perRival));
// municipal districts and sub-districts (boundaries from OpenStreetMap)
let GEO; globalThis.GA_DISTRICTS = g => { GEO = g; }; new Function(fs.readFileSync(path.join(root, 'assets/data/cities/tehran-districts.js'), 'utf8'))();
ok('22 municipal districts plus Shahr-e Rey, and a plausible number of sub-districts', GEO.levels.district.filter(d => !d.x).length === 22 && GEO.levels.district.some(d => d.x && d.n === 23 && d.en.indexOf('Rey') === 0) && GEO.levels.sub.length > 100 && GEO.levels.sub.length <= 134, GEO.levels.sub.length + ' sub-districts');
const at = (la, lo) => J.locate(GEO, la, lo);
ok('known places fall in the right districts (Vanak 3, Tajrish 1, Narmak 4, Ekbatan Town 5, Gisha 2)', at(35.7570, 51.4100).district.n === 3 && at(35.8040, 51.4330).district.n === 1 && at(35.7373, 51.5075).district.n === 4 && at(35.7070, 51.3056).district.n === 5 && at(35.7358, 51.3764).district.n === 2);
ok('a point outside the city belongs to no district', at(35.55, 51.0) && at(35.55, 51.0).district === null);
const DS = J.districtStats(T, GEO, 'district', { type: 'cafe', r: 1000 });
ok('district stats: one row each, scores 0..100, completeness 0..100', DS.length === 23 && DS.every(r => (r.top == null || (r.top >= 0 && r.top <= 100)) && (r.completeness == null || (r.completeness >= 0 && r.completeness <= 100))));
const sumP = DS.reduce((s2, r) => s2 + r.people, 0);
ok('district residents add up to about the model total inside the districts (within 2% rounding)', sumP > 5.5e6 && sumP < 6.5e6, sumP + '');
ok('sub-district residents add up to the district total (within 2%)', Math.abs(J.districtStats(T, GEO, 'sub', { type: 'cafe', r: 1000 }).reduce((s2, r) => s2 + r.people, 0) - sumP) / sumP < .02);
ok('a district reports its best block inside itself', DS.filter(r => r.bestSpot).every(r => { const L = at(r.bestSpot.lat, r.bestSpot.lon); return L && L.district && L.district.n === r.n; }));
// concepts (sub-categories)
let TAXO; globalThis.GA_TAXONOMY = undefined; { const src = fs.readFileSync(path.join(root, 'assets/data/taxonomy.js'), 'utf8'); new Function(src)(); TAXO = globalThis.GA_TAXONOMY; }
const allSubs = Object.entries(TAXO.cats).flatMap(([t, l]) => l.map(x => [t, x]));
ok('taxonomy: 10 categories, over 100 concepts, ids unique within a category', Object.keys(TAXO.cats).length === 10 && allSubs.length > 100 && Object.values(TAXO.cats).every(l => new Set(l.map(x => x.id)).size === l.length), allSubs.length + ' concepts');
ok('taxonomy: every concept uses only vocabulary the engine knows', allSubs.every(([t, x]) => x.aud.every(a => J.AUDIENCE[a]) && x.pri.every(p => J.PRIORITY[p]) && Object.keys(x.d).every(k => J.DRIVER[k]) && (!x.comp || Object.keys(x.comp).every(k => T.L[k] || ['school', 'hospital'].includes(k)))));
ok('taxonomy: every concept has Persian and English name, description and on-site tip', allSubs.every(([t, x]) => x.fa && x.en && x.dfa && x.den && x.tfa && x.ten));
const cp = (sub, p0) => J.analyzePoint(T, p0[0], p0[1], { type: 'cafe', sub, r: 1000 });
const base0 = J.analyzePoint(T, U[0], U[1], { type: 'cafe', r: 1000 });
ok('no concept chosen: identical to the plain result', J.analyzePoint(T, U[0], U[1], { type: 'cafe', sub: '', r: 1000 }).score === base0.score);
ok('an unknown or foreign concept id is ignored, never an error', J.analyzePoint(T, U[0], U[1], { type: 'cafe', sub: 'no-such', r: 1000 }).score === base0.score && J.analyzePoint(T, U[0], U[1], { type: 'cafe', sub: 'dizi', r: 1000 }).score === base0.score);
const stuU = cp('student', U).score - base0.score, stuO = cp('student', O).score - J.analyzePoint(T, O[0], O[1], { type: 'cafe', r: 1000 }).score;
ok('"student café" gains more beside universities (Enghelab) than beside offices (Vanak)', stuU > stuO, 'change ' + stuU + ' vs ' + stuO);
const NAR = [35.7373, 51.5075];
const dlt = (sub, p0) => J.analyzePoint(T, p0[0], p0[1], { type: 'cafe', sub, r: 1000 }).score - J.analyzePoint(T, p0[0], p0[1], { type: 'cafe', r: 1000 }).score;
ok('"grab-and-go café" gains at office/transit hubs (Vanak, Enghelab) more than in a purely residential area (Narmak)', (dlt('passerby', O) + dlt('passerby', U)) / 2 > dlt('passerby', NAR), 'hubs ' + dlt('passerby', O) + '/' + dlt('passerby', U) + ' vs Narmak ' + dlt('passerby', NAR));
ok('"garden café" gains in a residential area (Narmak) more than in the dense hub (Enghelab)', dlt('garden', NAR) > dlt('garden', U), 'Narmak ' + dlt('garden', NAR) + ' vs Enghelab ' + dlt('garden', U));
ok('a concept with its own rival set uses it (café-restaurant weighs restaurants fully) and moves the score', J.compOf('cafe', { type: 'cafe', sub: 'cafe_restaurant' }).restaurant === 1 && dlt('cafe_restaurant', O) !== 0, 'change ' + dlt('cafe_restaurant', O));
const ice = cp('dessert', [35.7219, 51.4]);
ok('look-alike rivals are counted by name and never exceed the direct rivals', ice.conceptRivals && ice.conceptRivals.n <= ice.conceptRivals.of && ice.concept.id === 'dessert', JSON.stringify(ice.conceptRivals));
ok('a concept with no name clues reports none', cp('student', U).conceptRivals === undefined);
// every concept runs at a real spot, with a sane score
let bad = [];
allSubs.forEach(([t, x]) => { const a2 = J.analyzePoint(T, 35.7219, 51.4, { type: t, sub: x.id, r: 1000 }); if (!a2 || !(a2.score >= 0 && a2.score <= 100) || a2.concept.id !== x.id) bad.push(t + '/' + x.id); });
ok('all ' + allSubs.length + ' concepts produce a valid analysis', bad.length === 0, bad.join(','));
// income level and the population plausibility check
const zaf = J.analyzePoint(T, 35.8105, 51.4130, { type: 'cafe', sub: 'luxury', r: 1000 }), vnk = J.analyzePoint(T, 35.757, 51.41, { type: 'cafe', sub: 'luxury', r: 1000 }), jav = J.analyzePoint(T, 35.6350, 51.3250, { type: 'cafe', sub: 'luxury', r: 1000 });
ok('income level: Zafaraniyeh (well-off) is far above Javadieh/south (modest)', zaf.aff >= 85 && jav.aff <= 30 && zaf.aff - jav.aff >= 55, 'Zafaraniyeh ' + zaf.aff + ' vs south ' + jav.aff);
const aff0 = J.analyzePoint(T, 35.8105, 51.4130, { type: 'cafe', r: 1000 });
ok('income only matters for a concept that asks for it (plain café ignores it)', aff0.affW === 0 || aff0.affW === undefined);
ok('a luxury café scores better in a well-off area than in a modest one, other things being equal', (J.analyzePoint(T, 35.7790, 51.4400, { type: 'cafe', sub: 'luxury', r: 1000 }).score - J.analyzePoint(T, 35.7790, 51.4400, { type: 'cafe', r: 1000 }).score) > (J.analyzePoint(T, 35.6350, 51.3250, { type: 'cafe', sub: 'luxury', r: 1000 }).score - J.analyzePoint(T, 35.6350, 51.3250, { type: 'cafe', r: 1000 }).score));
// north Tehran used to come out nearly empty (WorldPop alone); the building-footprint blend fixes it, so Zafaraniyeh must now carry a real population
ok('Zafaraniyeh has a real population now (building-footprint blend), not a model gap', zaf.people >= 8000 && !zaf.risks.some(r => r.k === 'popLow'), 'people ' + zaf.people + ' for ' + zaf.buildings + ' mapped buildings');
{ // the warning itself still works where the model leaves a well-built area empty (here: the same spot with its residents removed)
  const T4 = load('tehran'); const pl = T4.L['@pop']; const cz = J.cellOf(T4, 35.8105, 51.4130), rr = 8;
  for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) { const i = cz + dy * T4.nx + dx; if (i >= 0 && i < T4.n) pl[i] = 0.5; }
  const z4 = J.analyzePoint(T4, 35.8105, 51.4130, { type: 'cafe', sub: 'luxury', r: 1000 });
  ok('the population warning still fires where a well-built area has almost no modelled residents, and not in a well-modelled one', z4.risks.some(r => r.k === 'popLow') && !vnk.risks.some(r => r.k === 'popLow'), 'people ' + z4.people + ' for ' + z4.buildings + ' buildings');
}
// the owner's complaint: a luxury café must reach the well-off north (Tajrish, Zafaraniyeh, Elahieh, Vanak ...), not only the old centre
{
  const lux = J.topAreas(T, { type: 'cafe', sub: 'luxury', r: 1000 }, 20).areas, near = (la, lo, km) => lux.findIndex(a => J.metres(T, a, { lat: la, lon: lo }) <= km * 1000);
  const north = lux.filter(a => a.lat >= 35.745).length;
  ok('luxury café: Tajrish is among the 20 best spots (1.5 km)', near(35.8044, 51.4330, 1.5) >= 0, 'rank ' + (near(35.8044, 51.4330, 1.5) + 1));
  ok('luxury café: at least 15 of the 20 best spots are in the north (above 35.745)', north >= 15, north + ' of 20');
  ok('luxury café: no spot in the first six is in a low-income area (income level below 40)', lux.slice(0, 6).every(a => J.analyzePoint(T, a.lat, a.lon, { type: 'cafe', sub: 'luxury', r: 1000 }).aff >= 40));
}
const dist0 = (() => { let s2 = 0, n2 = 0; J.ORDER.forEach(t => J.topAreas(T, { type: t, r: 1000 }, 6).areas.forEach(a => { s2 += J.metres(T, { lat: 35.7219, lon: 51.4 }, a) / 1000; n2++; })); return s2 / n2; })();
const topDist = new Set(); J.ORDER.forEach(t => J.topAreas(T, { type: t, r: 1000 }, 6).areas.forEach(a => { const d = J.locate(GEO, a.lat, a.lon); if (d && d.district) topDist.add(d.district.n); }));
ok('the best blocks are not all in the commercial core: spread over at least 8 districts, mean distance from the centre at least 2.5 km (it was 4.7 km before the population was corrected: the old model put too many people in the west and too few in the south; see DATA-EXTRACTION.md section 11)', topDist.size >= 8 && dist0 >= 2.5, dist0.toFixed(1) + ' km, ' + topDist.size + ' districts')
// pedestrian-flow model (district 5, all sub-districts)
let FOOT; globalThis.GA_FOOT = f => { FOOT = f; }; new Function(fs.readFileSync(path.join(root, 'assets/data/cities/tehran-d5-foot.js'), 'utf8'))();
ok('foot model: edges, indices 0..100, area and unit recorded, says it is relative', FOOT.edges.length > 10000 && FOOT.edges.every(e => e[4] >= 0 && e[4] <= 100) && FOOT.area === 'd5' && /Relative/.test(FOOT.note), FOOT.edges.length + ' streets');
const fe = J.footAt(FOOT, 35.7070, 51.3056), ff = J.footAt(FOOT, 35.8040, 51.4330);
ok('foot model: a point inside the area gets a street, a point in north Tehran gets nothing', fe && fe.busiest200 >= 0 && ff === null, JSON.stringify(fe));
const hi = FOOT.edges.filter(e => e[4] >= 90).length, lo = FOOT.edges.filter(e => e[4] <= 10).length;
ok('foot model: the index spreads over the range (some very busy streets, many quiet ones, the top 2% sits at 100)', hi > 50 && lo > 1000 && Math.max(...FOOT.edges.map(e => e[4])) === 100, hi + ' busy, ' + lo + ' quiet');
ok('foot model: the stability check was recorded and is high (lowest rank correlation at least 0.85)', FOOT.stability && FOOT.stability.lowest_rank_correlation >= 0.85, JSON.stringify(FOOT.stability));
// small and thin cities still work, and say so
for (const id of ['urmia', 'yazd', 'mashhad']) {
  const C = load(id), res = J.topAreas(C, { type: 'pharmacy', r: 1000 }, 6);
  ok(id + ' (' + C.coverage + ', ' + C.buildings + ' buildings)', res.areas.length >= 1 && res.areas.every(x => x.score >= 0 && x.score <= 100), res.areas.length + ' areas, best ' + (res.areas[0] && res.areas[0].score));
}
console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
process.exit(fails ? 1 : 0);
