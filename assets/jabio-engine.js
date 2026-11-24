/* Jabio scoring engine, method v1.
   One formula for the whole site (the old prototype had two that disagreed):

     score = 0.30 population + 0.30 demand + 0.20 access + 0.20 (100 - competition)

   computed from OpenStreetMap on a 250 m grid, inside the chosen radius. Every input is a
   count or a length taken from the data in assets/data/cities, never a random number.
   Honest limits: population is a PROXY (building count), there is no rent, income or footfall
   data, and OSM is more complete in some cities than others. The UI says so.

   Runs in the browser and in Node (tools/test_engine.js). */
(function (root) {
  'use strict';
  var CELL = 250, MIN_DEMAND = 40;

  /* ── concepts (sub-categories): assets/data/taxonomy.js, written by tools/build_taxonomy.py ──
     A concept changes who the customers are, what matters most, how much each demand driver counts and which places count
     as rivals. Those settings are expert starting points, not fitted to data. A concept id that does not belong to the
     business type is ignored, so a stale link can never break an analysis. */
  function subOf(o) {
    if (!o) return null;
    var T = root.GA_TAXONOMY;
    if (o.sub && T && T.cats) {
      var list = T.cats[o.type] || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === o.sub) return list[i];
    }
    if (o.profile && typeof o.profile === 'object' && o.profile.id) return o.profile;
    return null;
  }
  function compOf(type, o) {
    var sb = subOf(o && o.type === type ? o : { type: type, sub: o && o.sub, profile: o && o.type === type ? o.profile : null });
    return (sb && sb.comp) || TYPES[type].comp;
  }
  function matchesConcept(name, sb) {
    if (!sb || !sb.kw || !sb.kw.length || !name) return false;
    var n = String(name).toLowerCase();
    for (var i = 0; i < sb.kw.length; i++) if (n.indexOf(sb.kw[i].toLowerCase()) >= 0) return true;
    return false;
  }

  /* ── what each business needs ──────────────────────────────────── */
  var DRIVER = {                       /* demand driver -> OSM categories it counts */
    residents: ['@pop'], office: ['office'], school: ['school'], university: ['university'],
    retail: ['retail', 'fashion', 'grocery'], mall: ['mall'], tourism: ['tourism'], transit: ['transit'],
    bank: ['bank'], civic: ['civic'], commerce: ['restaurant', 'cafe', 'grocery', 'fashion', 'beauty', 'pharmacy', 'clinic', 'retail', 'fitness', 'education', 'mall', 'office', 'bank'], park: ['park'], health: ['clinic', 'hospital', 'pharmacy'], leisure: ['leisure', 'fitness']
  };
  var TYPES = {
    restaurant: { g: 'food', comp: { restaurant: 1, cafe: .25 }, drivers: { office: .25, retail: .15, mall: .1, tourism: .15, transit: .1, university: .05, civic: .05, residents: .1, leisure: .05 } },
    cafe: { g: 'food', comp: { cafe: 1, restaurant: .25 }, drivers: { office: .22, university: .2, retail: .12, mall: .08, transit: .1, park: .08, residents: .1, leisure: .05, tourism: .05 } },
    grocery: { g: 'retail', comp: { grocery: 1 }, drivers: { residents: .45, transit: .1, school: .1, office: .1, civic: .05, health: .1, mall: .1 } },
    fashion: { g: 'retail', comp: { fashion: 1, mall: .3 }, drivers: { retail: .3, mall: .25, transit: .15, tourism: .1, office: .1, residents: .1 } },
    beauty: { g: 'retail', comp: { beauty: 1 }, drivers: { residents: .35, retail: .2, office: .15, mall: .1, transit: .1, leisure: .1 } },
    pharmacy: { g: 'health', comp: { pharmacy: 1 }, drivers: { health: .45, residents: .3, transit: .1, school: .05, civic: .1 } },
    clinic: { g: 'health', comp: { clinic: 1, hospital: .5 }, drivers: { residents: .35, health: .25, office: .15, transit: .15, civic: .1 } },
    fitness: { g: 'health', comp: { fitness: 1 }, drivers: { residents: .35, office: .2, university: .15, leisure: .1, park: .1, transit: .1 } },
    education: { g: 'education', comp: { education: 1 }, drivers: { school: .25, university: .2, residents: .3, transit: .15, civic: .1 } },
    services: { g: 'services', comp: { office: .15 }, drivers: { office: .4, bank: .15, civic: .15, transit: .15, retail: .05, residents: .1 } }
  };
  /* per-business weights for population / demand / access (sum 0.80). JUDGEMENT, not a fit: people count more for neighbourhood businesses (grocery, pharmacy, clinic, beauty, gym, training) than for businesses that live on visitors and offices (restaurant, café, fashion, services). */
  /*CAL:START (judgement, see tools/calibration.md: the fitted weights were dropped because they favoured the commercial centre)*/
  var CAL = {"restaurant": {"pop": 0.24, "demand": 0.34, "access": 0.22}, "cafe": {"pop": 0.24, "demand": 0.34, "access": 0.22}, "grocery": {"pop": 0.32, "demand": 0.26, "access": 0.22}, "fashion": {"pop": 0.24, "demand": 0.34, "access": 0.22}, "beauty": {"pop": 0.32, "demand": 0.26, "access": 0.22}, "pharmacy": {"pop": 0.32, "demand": 0.26, "access": 0.22}, "clinic": {"pop": 0.32, "demand": 0.26, "access": 0.22}, "fitness": {"pop": 0.32, "demand": 0.26, "access": 0.22}, "education": {"pop": 0.32, "demand": 0.26, "access": 0.22}, "services": {"pop": 0.24, "demand": 0.34, "access": 0.22}};
  /*CAL:END*/
  var ORDER = ['restaurant', 'cafe', 'grocery', 'fashion', 'beauty', 'pharmacy', 'clinic', 'fitness', 'education', 'services'];
  var AUDIENCE = {                     /* who the customers are -> which drivers matter more */
    families: { residents: 1.6, school: 1.5, park: 1.5 }, students: { university: 2, school: 1.4 },
    employees: { office: 1.8, bank: 1.2, civic: 1.3 }, tourists: { tourism: 2, mall: 1.3, transit: 1.2 }, locals: { residents: 1.8 }
  };
  var PRIORITY = {                     /* what the owner values -> access parts / drivers */
    foot: { access: { minor: 1.6 }, drivers: { retail: 1.3, mall: 1.3 } }, car: { access: { major: 1.6, parking: 1.6 } },
    transit: { access: { transit: 1.8 } }, parking: { access: { parking: 1.8 } }, visibility: { access: { major: 1.5 } },
    shopping: { drivers: { retail: 1.8, mall: 1.8 } }, offices: { drivers: { office: 1.8, bank: 1.3 } }
  };
  /* the OSM categories that count as each business type, for showing them on a map */
  var BIZ = { restaurant: ['restaurant'], cafe: ['cafe'], grocery: ['grocery'], fashion: ['fashion'], beauty: ['beauty'], pharmacy: ['pharmacy'],
    clinic: ['clinic', 'hospital'], fitness: ['fitness'], education: ['education'], services: ['office'] };
  var ACCESS = { minor: .30, major: .25, transit: .30, parking: .15 };

  /* ── a city, as rasters with row prefix sums ───────────────────── */
  function sparse(flat, n) {
    var a = new Float32Array(n);
    for (var i = 0; i < flat.length; i += 2) { if (flat[i] >= 0 && flat[i] < n) a[flat[i]] = flat[i + 1]; }
    return a;
  }
  function prepare(d) {
    var n = d.nx * d.ny, C = { d: d, nx: d.nx, ny: d.ny, n: n, L: {}, P: {}, F: {}, PC: {}, U: {} };
    C.L['@bc'] = sparse(d.bc, n); C.L['@minor'] = sparse(d.rl, n); C.L['@major'] = sparse(d.ml, n);
    var all = new Float32Array(n);
    Object.keys(d.poi).forEach(function (cat) {
      var a = new Float32Array(n), p = d.poi[cat];
      for (var i = 0; i < p.length; i += 2) {
        var c = cellOf(C, p[i] / 1e5, p[i + 1] / 1e5);
        if (c >= 0) { a[c]++; all[c]++; }
      }
      C.L[cat] = a;
    });
    C.L['@all'] = all;
    /* estimated residents per cell (WorldPop 2020 spread over buildings); older city files fall back to building counts */
    C.hasPop = !!(d.pop && d.pop.length);
    C.L['@pop'] = C.hasPop ? sparse(d.pop, n) : C.L['@bc'];
    /* income level of the surroundings (only cities that have it: see tools/add_affluence.py) */
    C.hasAff = !!(d.aff && d.aff.length);
    if (C.hasAff) { C.L['@one'] = new Float32Array(n).fill(1); C.L['@aff'] = sparse(d.aff, n); var ap = new Float32Array(n), pp = C.L['@pop'], aa = C.L['@aff']; for (var q = 0; q < n; q++) ap[q] = aa[q] * pp[q]; C.L['@affpop'] = ap; }
    var bt = 0, pt = 0, i;
    for (i = 0; i < n; i++) bt += C.L['@bc'][i];
    Object.keys(d.poi).forEach(function (k) { pt += d.poi[k].length / 2; });
    C.buildings = bt; C.places = pt;
    C.coverage = bt >= 10000 ? 'rich' : bt >= 3000 ? 'partial' : 'thin';
    return C;
  }
  function cellOf(C, lat, lon) {
    var d = C.d, iy = Math.floor((lat - d.s) / d.dLat), ix = Math.floor((lon - d.w) / d.dLon);
    return (iy < 0 || ix < 0 || iy >= C.ny || ix >= C.nx) ? -1 : iy * C.nx + ix;
  }
  function centre(C, c) { var d = C.d, iy = Math.floor(c / C.nx), ix = c % C.nx; return { lat: d.s + (iy + .5) * d.dLat, lon: d.w + (ix + .5) * d.dLon }; }
  /* a demand driver is the SUM of its categories (DRIVER). It is cached under its own name, because several driver
     names ('retail', 'leisure', 'office'...) are also raw category names and used to shadow the sum. */
  function layer(C, key) {
    var dk = DRIVER[key] ? '#' + key : key;
    if (C.L[dk]) return C.L[dk];
    var cats = DRIVER[key], a = new Float32Array(C.n);
    if (cats) cats.forEach(function (cat) { var l = C.L[cat]; if (l) for (var i = 0; i < C.n; i++) a[i] += l[i]; });
    return (C.L[dk] = a);
  }
  function prefix(C, key) {
    if (C.P[key]) return C.P[key];
    var src = layer(C, key), W = C.nx + 1, P = new Float32Array(C.ny * W);
    for (var y = 0; y < C.ny; y++) { var s = 0; for (var x = 0; x < C.nx; x++) { s += src[y * C.nx + x]; P[y * W + x + 1] = s; } }
    return (C.P[key] = P);
  }
  /* what the score sees: nearby things count more than far ones. A Gaussian that falls to 13% at the edge of the
     radius (sigma = radius / 2), done as two cheap one-dimensional passes. 'disc' is the old flat circle, kept
     so the two can be compared by tools/validate_engine.js. */
  var KERNEL = 'gauss';
  function field(C, key, rc) {
    if (KERNEL === 'disc') return discField(C, key, rc);
    var k = 'g|' + key + '|' + rc;
    if (C.F[k]) return C.F[k];
    var src = layer(C, key), nx = C.nx, ny = C.ny, n = C.n, sg = Math.max(.8, rc / 2), w = [], j, x, y, i;
    for (j = -rc; j <= rc; j++) w.push(Math.exp(-.5 * (j / sg) * (j / sg)));
    var tmp = new Float32Array(n), out = new Float32Array(n);
    for (y = 0; y < ny; y++) for (x = 0; x < nx; x++) {
      var s = 0, lo = Math.max(-rc, -x), hi = Math.min(rc, nx - 1 - x);
      for (j = lo; j <= hi; j++) s += w[j + rc] * src[y * nx + x + j];
      tmp[y * nx + x] = s;
    }
    for (y = 0; y < ny; y++) {
      var lo2 = Math.max(-rc, -y), hi2 = Math.min(rc, ny - 1 - y);
      for (x = 0; x < nx; x++) {
        var t = 0;
        for (j = lo2; j <= hi2; j++) t += w[j + rc] * tmp[(y + j) * nx + x];
        out[y * nx + x] = t;
      }
    }
    return (C.F[k] = out);
  }
  /* the sum of a layer inside a flat circle of rc cells, around every cell: used for the counts shown to people */
  function discField(C, key, rc) {
    var k = key + '|' + rc;
    if (C.F[k]) return C.F[k];
    var P = prefix(C, key), nx = C.nx, ny = C.ny, W = nx + 1, out = new Float32Array(C.n), hw = [], dy;
    for (dy = -rc; dy <= rc; dy++) hw.push(Math.floor(Math.sqrt(rc * rc - dy * dy)));
    for (var y = 0; y < ny; y++) {
      for (dy = -rc; dy <= rc; dy++) {
        var yy = y + dy; if (yy < 0 || yy >= ny) continue;
        var w = hw[dy + rc], base = yy * W, o = y * nx;
        for (var x = 0; x < nx; x++) {
          var x0 = x - w < 0 ? 0 : x - w, x1 = x + w >= nx ? nx - 1 : x + w;
          out[o + x] += P[base + x1 + 1] - P[base + x0];
        }
      }
    }
    return (C.F[k] = out);
  }
  function urban(C, rc) {
    var k = 'u' + rc; if (C.U[k]) return C.U[k];
    var f = field(C, '@all', 2), b = field(C, '@bc', 2), u = new Uint8Array(C.n);
    for (var i = 0; i < C.n; i++) u[i] = (f[i] + b[i]) > 0 ? 1 : 0;
    return (C.U[k] = u);
  }
  function upper(a, v) { var lo = 0, hi = a.length; while (lo < hi) { var m = (lo + hi) >> 1; if (a[m] <= v) lo = m + 1; else hi = m; } return lo; }
  /* 0..100 on one scale for every input: the value against the busiest part of the same city
     (the 98th percentile of built-up cells with any activity = 100). Rank-based scores hid the
     difference between 18 offices and 166 offices; this keeps it, and it puts demand and
     competition on the same scale so "market gap" means something. */
  function pct(C, key, rc) {
    var k = key + '|' + rc; if (C.PC[k]) return C.PC[k];
    var f = field(C, key, rc), u = urban(C, rc), vals = [], i;
    for (i = 0; i < C.n; i++) if (u[i] && f[i] > 0) vals.push(f[i]);
    vals.sort(function (a, b) { return a - b; });
    var ref = Math.max(1, vals.length ? vals[Math.floor(vals.length * .98)] : 1), out = new Float32Array(C.n);
    for (i = 0; i < C.n; i++) out[i] = Math.min(100, f[i] / ref * 100);
    return (C.PC[k] = out);
  }
  /* competition on the same scale; with a floor so a single rival in a small city is not read as "saturated" */
  function compIndex(C, type, rc, o) {
    var sb = subOf(o && o.type === type ? o : { type: type, sub: o && o.sub });
    var cw = (sb && sb.comp) || TYPES[type].comp, k = 'c|' + type + '|' + (sb ? sb.id : '') + '|' + rc; if (C.PC[k]) return C.PC[k];
    var raw = new Float32Array(C.n), cats = Object.keys(cw), i;
    cats.forEach(function (cat) { var f = field(C, cat, rc), w = cw[cat]; for (i = 0; i < C.n; i++) raw[i] += w * f[i]; });
    var u = urban(C, rc), vals = [];
    for (i = 0; i < C.n; i++) if (u[i] && raw[i] > 0) vals.push(raw[i]);
    vals.sort(function (a, b) { return a - b; });
    var ref = Math.max(2.5, vals.length ? vals[Math.floor(vals.length * .98)] : 0), out = new Float32Array(C.n);
    for (i = 0; i < C.n; i++) out[i] = Math.min(100, raw[i] / ref * 100);
    out.raw = raw;
    return (C.PC[k] = out);
  }

  /* ── is the map data thin HERE? ──────────────────────────────────
     OpenStreetMap is mapped unevenly: a district of 100,000 residents can have a tenth of the shops of a similar
     district across town. Where people live but few shops are mapped, "no rivals" means "nobody mapped them", and
     the engine would wrongly rank the place as a gap. For each cell: mapped shops and services near it, against
     residents near it, compared with the better-mapped part of the same city (75th percentile = complete).
     1 = looks as complete as the rest of the city, 0 = almost nothing mapped. Places without residents (offices,
     bazaars) cannot be judged this way and count as complete. */
  function completeness(C) {
    if (C.CP) return C.CP;
    var rc = 3, obs = field(C, 'commerce', rc), pop = field(C, '@pop', rc), u = urban(C, rc), n = C.n, i, ratios = [], pv = [];
    for (i = 0; i < n; i++) if (u[i] && pop[i] > 0) pv.push(pop[i]);
    pv.sort(function (a, b) { return a - b; });
    var minPop = pv.length ? pv[Math.floor(pv.length * .5)] : 0;                    /* judge only where there are real numbers of residents */
    for (i = 0; i < n; i++) if (u[i] && pop[i] >= minPop && minPop > 0) ratios.push(obs[i] / pop[i]);
    ratios.sort(function (a, b) { return a - b; });
    var ref = ratios.length ? ratios[Math.floor(ratios.length * .75)] : 0, out = new Float32Array(n);
    for (i = 0; i < n; i++) out[i] = (!ref || pop[i] < minPop || !u[i]) ? 1 : Math.min(1, obs[i] / pop[i] / ref);
    return (C.CP = out);
  }
  var THIN_HERE = .3;

  /* how well-off the people around each cell are (0-100): the income layer averaged over the neighbourhood, weighted by residents */
  function affField(C, rc) {
    if (!C.hasAff) return null;
    var k = 'af|' + rc; if (C.PC[k]) return C.PC[k];
    var num = field(C, '@affpop', rc), den = field(C, '@pop', rc), own = field(C, '@aff', rc), out = new Float32Array(C.n), i;
    var cnt = field(C, '@one', rc);
    for (i = 0; i < C.n; i++) out[i] = den[i] > 50 ? num[i] / den[i] : (cnt[i] > 0 ? own[i] / cnt[i] : 50);
    return (C.PC[k] = out);
  }

  /* ── saturation: rivals against what the demand can carry ─────────
     Businesses cluster where demand is, so a bare rival count says "busy", not "crowded" (see VALIDATION.md).
     For each demand level the engine learns, from the city itself, how many rivals there typically are. A place
     with more rivals than that is saturated; with fewer, it is under-served. 50 = as many as usual. */
  function satModel(comp, demand, u, n) {
    var sum = new Float64Array(10), cnt = new Float64Array(10), b, i;
    for (i = 0; i < n; i++) if (u[i]) { b = Math.min(9, Math.floor(demand[i] / 10)); sum[b] += comp[i]; cnt[b]++; }
    var m = [], last = 0;
    for (b = 0; b < 10; b++) { var v = cnt[b] >= 20 ? sum[b] / cnt[b] : null; m.push(v); }
    for (b = 0; b < 10; b++) { if (m[b] === null) m[b] = b ? m[b - 1] : 0; if (m[b] < last) m[b] = last; last = m[b]; }   /* more demand never means fewer rivals */
    return function (d) {                      /* straight line between bin centres, so a small change in demand is a small change */
      var x = Math.min(9, Math.max(0, d / 10 - .5)), lo = Math.floor(x), hi = Math.min(9, lo + 1);
      return m[lo] + (m[hi] - m[lo]) * (x - lo);
    };
  }
  function roomOf(comp, exp, d) { var v = 50 - 1.25 * (comp - exp(d)); return v < 0 ? 0 : v > 100 ? 100 : v; }

  /* ── scoring ───────────────────────────────────────────────────── */
  function norm(o) { var s = 0, k; for (k in o) s += o[k]; for (k in o) o[k] = s ? o[k] / s : 0; return o; }
  function weights(type, o) {
    var d = {}, a = {}, k;
    for (k in TYPES[type].drivers) d[k] = TYPES[type].drivers[k];
    for (k in ACCESS) a[k] = ACCESS[k];
    var sb = subOf({ type: type, sub: o.sub, profile: o.type === type ? o.profile : null });
    var audIds = (o.audience || []).concat(sb && sb.aud ? sb.aud.filter(function (x) { return (o.audience || []).indexOf(x) < 0; }) : []);
    var priIds = (o.priorities || []).concat(sb && sb.pri ? sb.pri.filter(function (x) { return (o.priorities || []).indexOf(x) < 0; }) : []);
    audIds.forEach(function (id) { var m = AUDIENCE[id]; if (m) for (var key in m) d[key] = (d[key] || .05) * m[key]; });
    if (sb && sb.d) for (var dk in sb.d) d[dk] = (d[dk] || .05) * sb.d[dk];
    priIds.forEach(function (id) {
      var p = PRIORITY[id]; if (!p) return;
      for (var key in (p.access || {})) a[key] *= p.access[key];
      for (var key2 in (p.drivers || {})) if (d[key2]) d[key2] *= p.drivers[key2];
    });
    var base = CAL[type] || { pop: .30, demand: .30, access: .20 };
    var w = { pop: base.pop, demand: base.demand, access: base.access, comp: .20, mode: 'inverse', calibrated: !!CAL[type] };
    if (o.strategy === 'low') { var f = .65 / .80; w.pop = base.pop * f; w.demand = base.demand * f; w.access = base.access * f; w.comp = .35; }
    if (o.strategy === 'cluster') w.mode = 'cluster';
    return { drivers: norm(d), access: norm(a), top: w };
  }
  /* a modelled estimate: never show it with more precision than it has */
  function roundPeople(v) { return v >= 10000 ? Math.round(v / 1000) * 1000 : v >= 1000 ? Math.round(v / 100) * 100 : Math.round(v / 10) * 10; }
  function radiusCells(r) { return Math.max(1, Math.round(r / CELL)); }
  function parts(C, type, o) {
    var rc = radiusCells(o.r), W = weights(type, o), n = C.n, i, k;
    var pop = pct(C, '@pop', rc), comp = compIndex(C, type, rc, o);
    var demand = new Float32Array(n), access = new Float32Array(n), total = new Float32Array(n);
    for (k in W.drivers) { var p = pct(C, k, rc), w = W.drivers[k]; for (i = 0; i < n; i++) demand[i] += w * p[i]; }
    var amap = { minor: '@minor', major: '@major', transit: 'transit', parking: 'parking' };
    for (k in W.access) { var q = pct(C, amap[k], rc), w2 = W.access[k]; for (i = 0; i < n; i++) access[i] += w2 * q[i]; }
    /* A concept that depends on income does not want "people" but people who can pay for it. Residents and the
       customers the demand sources bring are scaled by the buying power of the surroundings: with a full income
       preference an area at the bottom of the income scale keeps 30% of its weight, one at the top keeps all of it.
       The income level itself is then also blended into the score (below). Both are judgement settings, not fitted. */
    var sbA = subOf({ type: type, sub: o.sub, profile: o.type === type ? o.profile : null }), AF = affField(C, rc), affW = 0, affSign = 1, ppw = null;
    if (sbA && sbA.aff && AF) {
      affSign = sbA.aff > 0 ? 1 : -1; affW = Math.min(.45, Math.abs(sbA.aff) * .30);
      var lo = 1 - Math.min(.7, Math.abs(sbA.aff) * .7);
      ppw = new Float32Array(n);
      for (i = 0; i < n; i++) ppw[i] = lo + (1 - lo) * (affSign > 0 ? AF[i] : 100 - AF[i]) / 100;
    }
    var t = W.top, exp = satModel(comp, demand, urban(C, rc), n), room = new Float32Array(n), term = new Float32Array(n);
    for (i = 0; i < n; i++) {
      room[i] = roomOf(comp[i], exp, demand[i]);
      var ct = t.mode === 'cluster' ? Math.max(0, 100 - 1.6 * Math.abs(comp[i] - 55)) : room[i];
      term[i] = ct;
      var g = ppw ? ppw[i] : 1;
      total[i] = t.pop * pop[i] * g + t.demand * demand[i] * g + t.access * access[i] + t.comp * ct;
    }
    if (ppw) for (i = 0; i < n; i++) total[i] = (1 - affW) * total[i] + affW * (affSign > 0 ? AF[i] : 100 - AF[i]);
    return { rc: rc, W: W, pop: pop, demand: demand, access: access, comp: comp, room: room, term: term, expected: exp, total: total, aff: AF, affW: affW, affSign: affSign };
  }
  function level(s) { return s >= 75 ? 'strong' : s >= 60 ? 'promising' : s >= 45 ? 'mixed' : 'weak'; }
  function quadrant(demand, comp) {
    if (demand >= 60 && comp < 60) return 'hot';
    if (demand < 60 && comp < 40) return 'niche';
    if (demand < 45 && comp >= 60) return 'risk';
    return 'watch';
  }
  function edgeCell(C, c) { var iy = Math.floor(c / C.nx), ix = c % C.nx; return iy < 4 || ix < 4 || iy >= C.ny - 4 || ix >= C.nx - 4; }
  function metres(C, a, b) {
    var dy = (b.lat - a.lat) * 110574, dx = (b.lon - a.lon) * 111320 * Math.cos(a.lat * Math.PI / 180);
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* the best places in a city for one business */
  function topAreas(C, o, k) {
    k = k || 6;
    var P = parts(C, o.type, o), u = urban(C, P.rc), idx = [], i;
    /* product rule 1: a place whose measured demand is under MIN_DEMAND is not ranked as an area,
       because "no rivals" there usually means "no customers". Relaxed only if nothing qualifies. */
    var cp = completeness(C), skipped = 0;
    for (i = 0; i < C.n; i++) if (u[i] && !edgeCell(C, i) && P.demand[i] >= MIN_DEMAND) { if (cp[i] < THIN_HERE) { skipped++; continue; } idx.push(i); }
    var relaxed = false;
    if (idx.length < k) { relaxed = true; idx = []; for (i = 0; i < C.n; i++) if (u[i] && !edgeCell(C, i)) idx.push(i); }
    idx.sort(function (a, b) { return P.total[b] - P.total[a]; });
    var picked = [], gap = Math.max(o.r, 1000);
    for (var j = 0; j < idx.length && picked.length < k; j++) {
      var c = idx[j], pt = centre(C, c), ok = true;
      for (var m = 0; m < picked.length; m++) if (metres(C, pt, picked[m]) < gap) { ok = false; break; }
      if (ok) picked.push({ cell: c, lat: pt.lat, lon: pt.lon });
    }
    var used = {};
    return {
      areas: picked.map(function (a) { return finish(C, o, P, a, used); }),
      heat: heatPoints(C, P, u),
      weights: P.W,
      relaxed: relaxed, thinSkipped: skipped
    };
  }
  function heatPoints(C, P, u) {
    var vals = [], i;
    for (i = 0; i < C.n; i++) if (u[i]) vals.push(P.total[i]);
    vals.sort(function (a, b) { return a - b; });
    var cut = vals[Math.floor(vals.length * .55)] || 0, out = [];
    for (i = 0; i < C.n; i++) if (u[i] && P.total[i] > cut) { var p = centre(C, i); out.push([+p.lon.toFixed(5), +p.lat.toFixed(5), +P.total[i].toFixed(1)]); }
    return out;
  }
  function placeName(C, lat, lon, used) {
    var best = null, bd = 2200;
    C.d.places.forEach(function (p) {
      var d = metres(C, { lat: lat, lon: lon }, { lat: p[0] / 1e5, lon: p[1] / 1e5 });
      if (d < bd && (p[2] || p[3]) && !(used && used[p[2] || p[3]])) { bd = d; best = p; }
    });
    if (best && used) used[best[2] || best[3]] = 1;
    return best ? { fa: best[2] || best[3], en: best[3] || best[2], dist: Math.round(bd) } : null;
  }
  /* How much could the score move if the inputs are off? Not a statistical interval: every corner of
     "population +-30%" (WorldPop is a model) and "demand and access +-u" (OpenStreetMap is incomplete; u = 10% in
     rich cities, 20% partial, 30% thin) is re-scored, and the lowest and highest results are the range. */
  var UNSURE = { rich: .10, partial: .20, thin: .30 }, POPERR = .30;
  function band(C, P, c) {
    var u = Math.min(.6, (UNSURE[C.coverage] || .3) + (1 - completeness(C)[c]) * .3), t = P.W.top, lo = 101, hi = -1, m, a, b, d, pp, dd, aa, ct, s;
    for (m = 0; m < (P.affW ? 16 : 8); m++) {
      pp = Math.min(100, P.pop[c] * (1 + (m & 1 ? POPERR : -POPERR)));
      dd = Math.min(100, P.demand[c] * (1 + (m & 2 ? u : -u)));
      aa = Math.min(100, P.access[c] * (1 + (m & 4 ? u : -u)));
      ct = t.mode === 'cluster' ? P.term[c] : roomOf(P.comp[c], P.expected, dd);
      s = t.pop * pp + t.demand * dd + t.access * aa + t.comp * ct;
      if (P.affW) { var av = Math.max(0, Math.min(100, P.aff[c] + (m & 8 ? 20 : -20))); s = (1 - P.affW) * s + P.affW * (P.affSign > 0 ? av : 100 - av); }
      if (s < lo) lo = s; if (s > hi) hi = s;
    }
    return { low: Math.round(lo), high: Math.round(hi) };
  }
  function finish(C, o, P, a, used) {
    var c = a.cell, comp = P.comp[c], demand = P.demand[c], access = P.access[c], pop = P.pop[c], score = P.total[c];
    return { type: o.type, cell: c, lat: a.lat, lon: a.lon, r: o.r, score: Math.round(score), level: level(score),
      pop: Math.round(pop), demand: Math.round(demand), access: Math.round(access), comp: Math.round(comp), aff: P.aff ? Math.round(P.aff[c]) : null, affW: P.affW, range: band(C, P, c), complete: Math.round(completeness(C)[c] * 100), room: Math.round(P.room[c]), term: Math.round(P.term[c]), expectedRivals: Math.round(P.expected(demand)), gap: Math.round(demand - comp),
      quadrant: quadrant(demand, comp), place: placeName(C, a.lat, a.lon, used), weights: P.W.top };
  }

  /* exact lists inside the radius, from the raw points */
  function near(C, cats, lat, lon, r) {
    var out = [], here = { lat: lat, lon: lon }, cx = Math.cos(lat * Math.PI / 180);
    cats.forEach(function (cat) {
      var p = C.d.poi[cat]; if (!p) return;
      var nm = (C.d.names || {})[cat];
      for (var i = 0; i < p.length; i += 2) {
        var la = p[i] / 1e5, lo = p[i + 1] / 1e5, dy = (la - lat) * 110574;
        if (dy > r || dy < -r) continue;
        var dx = (lo - lon) * 111320 * cx; if (dx > r || dx < -r) continue;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d <= r) out.push({ cat: cat, lat: la, lon: lo, name: nm ? nm[i / 2] || '' : '', dist: Math.round(d) });
      }
    });
    return out.sort(function (a, b) { return a.dist - b.dist; });
  }
  /* every business of every type inside the radius, nearest first; each one knows its type */
  function placesAround(C, lat, lon, r) {
    var out = [];
    ORDER.forEach(function (t) { near(C, BIZ[t], lat, lon, r).forEach(function (p) { p.biz = t; out.push(p); }); });
    return out.sort(function (a, b) { return a.dist - b.dist; });
  }
  function driverCount(C, key, lat, lon, r) {
    if (key === 'residents') return Math.round(sumCircle(C, '@pop', lat, lon, r));
    return near(C, DRIVER[key], lat, lon, r).length;
  }
  function sumCircle(C, key, lat, lon, r) {
    var c = cellOf(C, lat, lon); if (c < 0) return 0;
    return discField(C, key, radiusCells(r))[c];
  }

  /* one spot, one business, in full */
  function analyzePoint(C, lat, lon, o) {
    var c = cellOf(C, lat, lon);
    if (c < 0) return null;
    var P = parts(C, o.type, o), T = TYPES[o.type], here = finish(C, o, P, { cell: c, lat: lat, lon: lon });
    here.lat = lat; here.lon = lon;
    var cats = Object.keys(compOf(o.type, o)), sbp = subOf(o);
    here.competitors = near(C, cats, lat, lon, o.r);
    here.concept = sbp ? { id: sbp.id, fa: sbp.fa, en: sbp.en } : null;
    if (sbp && sbp.kw && sbp.kw.length) {
      var look = here.competitors.filter(function (x) { return x.cat === cats[0] && matchesConcept(x.name, sbp); });
      here.conceptRivals = { n: look.length, of: here.competitors.filter(function (x) { return x.cat === cats[0]; }).length, nearest: look[0] ? { dist: look[0].dist, name: look[0].name } : null };
    }
    here.sameType = here.competitors.filter(function (x) { return x.cat === cats[0]; }).length;
    here.drivers = [];
    var shares = P.W.drivers;
    Object.keys(shares).forEach(function (k) {
      var pc = pct(C, k, P.rc)[c];
      here.drivers.push({ key: k, weight: shares[k], pct: Math.round(pc), count: driverCount(C, k, lat, lon, o.r) });
    });
    here.drivers.sort(function (a, b) { return b.weight * b.pct - a.weight * a.pct; });
    var acc = [['minor', '@minor'], ['major', '@major'], ['transit', 'transit'], ['parking', 'parking']];
    here.accessParts = acc.map(function (a) { return { key: a[0], pct: Math.round(pct(C, a[1], P.rc)[c]), weight: P.W.access[a[0]] }; });
    here.accessParts.forEach(function (a) {
      if (a.key === 'transit' || a.key === 'parking') a.count = near(C, [a.key], lat, lon, o.r).length;
      else a.km = Math.round(sumCircle(C, a.key === 'minor' ? '@minor' : '@major', lat, lon, o.r) / 100) / 10;
    });
    here.buildings = Math.round(sumCircle(C, '@bc', lat, lon, o.r));
    here.people = roundPeople(sumCircle(C, '@pop', lat, lon, o.r));
    here.peopleModel = C.hasPop;
    here.coverage = C.coverage;
    here.edge = edgeCell(C, c);
    /* what is good, what is not, what to watch */
    var good = [], bad = [], risks = [];
    here.drivers.filter(function (d) { return d.pct >= 55 && d.count > 0; }).slice(0, 2).forEach(function (d) { good.push({ k: 'driver', key: d.key, n: d.count }); });
    if (here.pop >= 65) good.push({ k: 'pop', n: here.people });
    if (here.access >= 65) good.push({ k: 'access' });
    if (here.gap >= 15) good.push({ k: 'gap' });
    if (here.comp <= 25) good.push({ k: 'fewRivals', n: here.sameType });
    var sbI = subOf(o), wantsAff = !!(sbI && sbI.aff);
    if (wantsAff && here.aff != null && (sbI.aff > 0 ? here.aff >= 65 : here.aff <= 40)) good.push({ k: 'affFit' });
    if (wantsAff && here.aff != null && (sbI.aff > 0 ? here.aff < 40 : here.aff > 70)) bad.push({ k: 'affMiss' });
    if (here.demand < 40) bad.push({ k: 'demand' });
    if (here.pop < 35) bad.push({ k: 'pop', n: here.people });
    if (here.access < 35) bad.push({ k: 'access' });
    if (here.comp >= 65) bad.push({ k: 'rivals', n: here.sameType });
    if (here.comp >= 70) risks.push({ k: 'competition', n: here.sameType, sev: here.comp >= 85 ? 'high' : 'medium' });
    if (here.demand < 35) risks.push({ k: 'lowDemand', sev: 'medium' });
    if (here.access < 30) risks.push({ k: 'weakAccess', sev: 'medium' });
    if (C.coverage !== 'rich') risks.push({ k: 'thinData', sev: C.coverage === 'thin' ? 'high' : 'low' });
    if (here.edge) risks.push({ k: 'edge', sev: 'medium' });
    if (here.complete < 60) risks.push({ k: 'thinHere', n: here.complete, sev: here.complete < THIN_HERE * 100 ? 'high' : 'medium' });
    /* plausibility check on the population model: many mapped buildings but almost no residents means the model is too low here */
    if (here.buildings >= 300 && here.people / here.buildings < 8) risks.push({ k: 'popLow', n: here.people, sev: 'high' });
    if (wantsAff && !C.hasAff) risks.push({ k: 'noAff', sev: 'medium' });
    risks.push({ k: 'noRent', sev: 'info' });
    here.good = good; here.bad = bad; here.risks = risks;
    /* product rule 2: "recommended" needs real demand as well as a good score */
    insights(C, o, P, here, c, lat, lon);
    here.verdict = here.score >= 72 && here.comp < 70 && here.demand >= 50 ? 'recommended' : here.score >= 58 && here.demand >= MIN_DEMAND ? 'promising' : here.score >= 45 ? 'mixed' : 'avoid';
    return here;
  }

  /* ── extra facts for a decision, all from the same data ───────────
     Nothing here changes the score. These are the numbers a person asks for before committing money. */
  var GROUPS = { residents: ['residents'], workers: ['office', 'bank', 'civic'], students: ['school', 'university'], visitors: ['tourism', 'mall', 'retail', 'transit'] };
  function perRivalBench(C, type, rc, o) {
    var sb = subOf(o && o.type === type ? o : { type: type, sub: o && o.sub });
    var k = 'pr|' + type + '|' + (sb ? sb.id : '') + '|' + rc; if (C.PC[k]) return C.PC[k];
    var cat0 = Object.keys(compOf(type, o))[0], pop = discField(C, '@pop', rc), riv = discField(C, cat0, rc), u = urban(C, rc), v = [], i;
    for (i = 0; i < C.n; i++) if (u[i] && pop[i] > 200) v.push(pop[i] / (riv[i] + 1));
    v.sort(function (a, b) { return a - b; });
    return (C.PC[k] = { median: v.length ? v[Math.floor(v.length * .5)] : 0, p25: v.length ? v[Math.floor(v.length * .25)] : 0, p75: v.length ? v[Math.floor(v.length * .75)] : 0 });
  }
  function insights(C, o, P, here, c, lat, lon) {
    var T = TYPES[o.type], cat0 = Object.keys(compOf(o.type, o))[0], u = urban(C, P.rc), n = C.n, i, below = 0, cnt = 0;
    /* 1. where this block stands among all built-up blocks of the city, for this business */
    for (i = 0; i < n; i++) if (u[i] && !edgeCell(C, i)) { cnt++; if (P.total[i] < P.total[c]) below++; }
    here.percentile = cnt ? Math.round(100 * below / cnt) : null;
    /* 2. customers per rival, against the city's typical block */
    var b = perRivalBench(C, o.type, P.rc, o), per = here.people / (here.sameType + 1);
    here.perRival = { value: roundPeople(per), median: roundPeople(b.median), ratio: b.median ? Math.round(100 * per / b.median) / 100 : null };
    /* 3. who is around: how strong each kind of customer is here, against the same city (0-100) */
    here.audienceMix = {};
    Object.keys(GROUPS).forEach(function (g) {
      var ks = GROUPS[g], s = 0; ks.forEach(function (k) { s += pct(C, k, P.rc)[c]; });
      here.audienceMix[g] = Math.round(s / ks.length);
    });
    /* 4. the two distances people ask about */
    var nr = here.competitors.filter(function (x) { return x.cat === cat0; })[0];
    here.nearestRival = nr ? { dist: nr.dist, name: nr.name } : null;
    var nt = near(C, ['transit'], lat, lon, 1500)[0];
    here.nearestTransit = nt ? { dist: nt.dist } : null;
    /* 5. does the answer survive a different radius? */
    here.byRadius = [500, 1000, 2000, 3000].map(function (r) {
      if (r === o.r) return { r: r, score: here.score };
      var oo = { type: o.type, sub: o.sub, profile: o.profile, r: r, audience: o.audience, priorities: o.priorities, strategy: o.strategy };
      return { r: r, score: Math.round(parts(C, o.type, oo).total[c]) };
    });
    /* 6. clearly better places close by (reachable on foot or a short ride), mapped well enough to trust */
    var cp = completeness(C), best = [], dm = 1500, cells = [];
    for (i = 0; i < n; i++) {
      if (!u[i] || edgeCell(C, i) || i === c || cp[i] < THIN_HERE || P.demand[i] < MIN_DEMAND || P.total[i] < here.score + 4) continue;
      var pt = centre(C, i), d = metres(C, { lat: lat, lon: lon }, pt);
      if (d <= dm && d >= 300) cells.push({ cell: i, lat: pt.lat, lon: pt.lon, score: P.total[i], dist: d });
    }
    cells.sort(function (a, b2) { return b2.score - a.score; });
    cells.forEach(function (x) { if (best.length < 3 && best.every(function (y) { return metres(C, x, y) >= 500; })) best.push(x); });
    var used = {};
    here.betterNearby = best.map(function (x) { return { lat: x.lat, lon: x.lon, score: Math.round(x.score), dist: Math.round(x.dist), place: placeName(C, x.lat, x.lon, used) }; });
  }

  /* ── municipal districts (منطقه) and sub-districts (ناحیه) ─────────
     The boundaries come from OpenStreetMap (assets/data/cities/<city>-districts.js). Each 250 m cell belongs to the
     district that contains its centre; every district figure is built from its own cells, with the same scores as
     everywhere else. A district that sticks out of the mapped window is marked with how much of it is covered. */
  function ringsBox(rs) {
    var b = [1e9, 1e9, -1e9, -1e9];
    rs.forEach(function (r) { r.forEach(function (p) { if (p[0] < b[0]) b[0] = p[0]; if (p[1] < b[1]) b[1] = p[1]; if (p[0] > b[2]) b[2] = p[0]; if (p[1] > b[3]) b[3] = p[1]; }); });
    return b;
  }
  function inRing(x, y, r) {
    var c = false;
    for (var i = 0, j = r.length - 1; i < r.length; j = i++) {
      var xi = r[i][0], yi = r[i][1], xj = r[j][0], yj = r[j][1];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function inFeature(f, x, y) {
    if (!f._b) f._b = ringsBox(f.rings);
    if (x < f._b[0] || y < f._b[1] || x > f._b[2] || y > f._b[3]) return false;
    for (var k = 0; k < f.rings.length; k++) if (inRing(x, y, f.rings[k])) return true;
    return false;
  }
  function districtIndex(C, geo, level) {
    var key = 'di|' + level; if (C.PC[key]) return C.PC[key];
    var feats = geo.levels[level], d = C.d, out = new Int16Array(C.n).fill(-1), i, k;
    for (i = 0; i < C.n; i++) {
      var iy = Math.floor(i / C.nx), ix = i % C.nx, x = d.w + (ix + .5) * d.dLon, y = d.s + (iy + .5) * d.dLat;
      for (k = 0; k < feats.length; k++) if (inFeature(feats[k], x, y)) { out[i] = k; break; }
    }
    return (C.PC[key] = out);
  }
  /* which district and sub-district is a point in? */
  function locate(geo, lat, lon) {
    if (!geo) return null;
    var d = geo.levels.district.filter(function (f) { return inFeature(f, lon, lat); })[0] || null;
    var sb = geo.levels.sub.filter(function (f) { return inFeature(f, lon, lat); })[0] || null;
    return { district: d, sub: sb };
  }
  function quant(a, q) { if (!a.length) return null; a.sort(function (x, y) { return x - y; }); return a[Math.min(a.length - 1, Math.floor(a.length * q))]; }
  /* one business, every district: how good are its best blocks, who lives there, how many rivals, how well it is mapped */
  function districtStats(C, geo, level, o) {
    var feats = geo.levels[level], P = parts(C, o.type, o), idx = districtIndex(C, geo, level), u = urban(C, P.rc), cp = completeness(C),
      cat0 = Object.keys(compOf(o.type, o))[0], riv = C.L[cat0] || new Float32Array(C.n), pop = C.L['@pop'], n = C.n, i, kx = 111.32 * Math.cos(C.d.lat * Math.PI / 180), cellKm2 = .25 * .25;
    var rows = feats.map(function (f, k) { return { id: f.id, n: f.n, parent: f.parent || null, fa: f.fa, en: f.en, k: k, cells: 0, people: 0, rivals: 0, tot: [], dem: 0, acc: 0, urb: 0, cpW: 0, best: null }; });
    for (i = 0; i < n; i++) {
      var k = idx[i]; if (k < 0) continue; var r = rows[k];
      r.cells++; r.people += pop[i]; r._pp = (r._pp || 0) + pop[i]; r.rivals += riv[i]; r.cpW += cp[i] * pop[i];
      if (u[i] && !edgeCell(C, i)) {
        r.urb++; r.dem += P.demand[i]; r.acc += P.access[i];
        if (cp[i] >= THIN_HERE) { r.tot.push(P.total[i]); if (!r.best || P.total[i] > r.best.s) r.best = { cell: i, s: P.total[i] }; }
      }
    }
    rows.forEach(function (r) {
      var f = feats[r.k], km2 = 0;
      f.rings.forEach(function (ring) { var a = 0; for (var j = 0; j < ring.length - 1; j++) a += (ring[j][0] * kx) * (ring[j + 1][1] * 110.574) - (ring[j + 1][0] * kx) * (ring[j][1] * 110.574); km2 += Math.abs(a) / 2; });
      r.km2 = Math.round(km2 * 10) / 10; r.covered = km2 ? Math.min(100, Math.round(100 * r.cells * cellKm2 / km2)) : 0;
      r.density = km2 ? Math.round(r.people / km2 / 100) * 100 : 0;
      r.perTenK = r.people > 0 ? Math.round(r.rivals / r.people * 1e4 * 10) / 10 : null;
      r.people = roundPeople(r.people); r.rivals = Math.round(r.rivals);
      r.completeness = r._pp > 0 ? Math.round(100 * r.cpW / r._pp) : null;
      r.demand = r.urb ? Math.round(r.dem / r.urb) : null; r.access = r.urb ? Math.round(r.acc / r.urb) : null;
      r.typical = quant(r.tot.slice(), .5); r.top = quant(r.tot.slice(), .9);
      r.typical = r.typical == null ? null : Math.round(r.typical); r.top = r.top == null ? null : Math.round(r.top);
      if (r.best) { var pt = centre(C, r.best.cell); r.bestSpot = { lat: pt.lat, lon: pt.lon, score: Math.round(r.best.s) }; }
      delete r.tot; delete r.dem; delete r.acc; delete r.best; delete r.cpW; delete r.urb; delete r._pp;
    });
    return rows;
  }

  /* what could go here: every business type, ranked */
  function rankTypes(C, lat, lon, o) {
    var c = cellOf(C, lat, lon); if (c < 0) return [];
    return ORDER.map(function (t) {
      var oo = { type: t, r: o.r, audience: o.audience, priorities: o.priorities, strategy: o.strategy };
      var P = parts(C, t, oo);
      return finish(C, oo, P, { cell: c, lat: lat, lon: lon });
    }).sort(function (a, b) { return b.score - a.score; });
  }

  /* ── hexbin spatial aggregation model ────────────────────────────
     Aggregates the 250 m urban grid into a pointy-top axial hexagonal tessellation in local metres,
     returning a GeoJSON FeatureCollection with composite and component scores per hexagon. */
  function hexbin(C, o, hexRadiusM) {
    var P = parts(C, o.type, o), u = urban(C, P.rc), cp = completeness(C), d = C.d, n = C.n;
    var lat0 = d.lat != null ? d.lat : (d.s + C.ny * d.dLat * .5);
    var lon0 = d.lon != null ? d.lon : (d.w + C.nx * d.dLon * .5);
    var mLat = 110574, mLon = 111320 * Math.cos(lat0 * Math.PI / 180), SQRT3 = Math.sqrt(3);
    var spanM = Math.max(C.nx * d.dLon * mLon, C.ny * d.dLat * mLat);
    var R = hexRadiusM && hexRadiusM > 0 ? hexRadiusM : Math.max(380, Math.min(720, Math.round(spanM / 46 / 25) * 25));
    var bins = {}, keys = [], i;
    for (i = 0; i < n; i++) {
      if (!u[i]) continue;
      var pt = centre(C, i);
      var x = (pt.lon - lon0) * mLon, y = (pt.lat - lat0) * mLat;
      var fq = (SQRT3 / 3 * x - y / 3) / R, fr = (2 / 3 * y) / R, fs = -fq - fr;
      var q = Math.round(fq), r = Math.round(fr), s = Math.round(fs);
      var dq = Math.abs(q - fq), dr = Math.abs(r - fr), ds = Math.abs(s - fs);
      if (dq > dr && dq > ds) q = -r - s;
      else if (dr > ds) r = -q - s;
      var key = q + ',' + r, b = bins[key];
      if (!b) {
        b = bins[key] = { q: q, r: r, n: 0, sSum: 0, sMax: 0, pop: 0, dem: 0, acc: 0, comp: 0, room: 0, cp: 0 };
        keys.push(key);
      }
      var sc = P.total[i];
      b.n++;
      b.sSum += sc;
      if (sc > b.sMax) b.sMax = sc;
      b.pop += P.pop[i];
      b.dem += P.demand[i];
      b.acc += P.access[i];
      b.comp += P.comp[i];
      b.room += P.room[i];
      b.cp += cp[i];
    }
    var cosA = [], sinA = [], k;
    for (k = 0; k < 6; k++) {
      var ang = (60 * k - 30) * Math.PI / 180;
      cosA.push(Math.cos(ang)); sinA.push(Math.sin(ang));
    }
    var features = [], minS = 100, maxS = 0;
    for (i = 0; i < keys.length; i++) {
      var h = bins[keys[i]], cnt = h.n;
      var avg = Math.round(h.sSum / cnt);
      if (avg < minS) minS = avg;
      if (avg > maxS) maxS = avg;
      var cx = R * SQRT3 * (h.q + h.r * .5), cy = R * 1.5 * h.r;
      var cLon = lon0 + cx / mLon, cLat = lat0 + cy / mLat;
      var ring = [];
      for (k = 0; k < 6; k++) {
        ring.push([
          Math.round((lon0 + (cx + R * cosA[k]) / mLon) * 1e6) / 1e6,
          Math.round((lat0 + (cy + R * sinA[k]) / mLat) * 1e6) / 1e6
        ]);
      }
      ring.push(ring[0]);
      features.push({
        type: 'Feature',
        id: i + 1,
        properties: {
          s: avg,
          max: Math.round(h.sMax),
          pop: Math.round(h.pop / cnt),
          dem: Math.round(h.dem / cnt),
          acc: Math.round(h.acc / cnt),
          comp: Math.round(h.comp / cnt),
          room: Math.round(h.room / cnt),
          cp: Math.round(100 * h.cp / cnt),
          n: cnt,
          lat: Math.round(cLat * 1e5) / 1e5,
          lon: Math.round(cLon * 1e5) / 1e5,
          lv: level(avg)
        },
        geometry: { type: 'Polygon', coordinates: [ring] }
      });
    }
    return {
      geojson: { type: 'FeatureCollection', features: features },
      radiusM: R,
      diameterM: Math.round(R * SQRT3),
      count: features.length,
      minScore: features.length ? minS : 0,
      maxScore: features.length ? maxS : 0
    };
  }

  var api = { footAt: footAt, loadFoot: loadFoot, subOf: subOf, compOf: compOf, locate: locate, districtStats: districtStats, loadDistricts: loadDistricts, completeness: completeness, THIN_HERE: THIN_HERE, uncertainty: function (cov) { return UNSURE[cov] || .3; }, setKernel: function (k) { KERNEL = k; }, _x: { completeness: completeness, parts: parts, pct: pct, field: field, urban: urban, compIndex: compIndex, satModel: satModel, roomOf: roomOf, edgeCell: edgeCell, radiusCells: radiusCells, layer: layer, centre: centre }, METHOD: 'v2', CELL: CELL, TYPES: TYPES, ORDER: ORDER, AUDIENCE: AUDIENCE, PRIORITY: PRIORITY, DRIVER: DRIVER, prepare: prepare, cellOf: cellOf,
    BIZ: BIZ, placesAround: placesAround, MIN_DEMAND: MIN_DEMAND, topAreas: topAreas, hexbin: hexbin, analyzePoint: analyzePoint, rankTypes: rankTypes, level: level, quadrant: quadrant, near: near, metres: metres, weights: weights };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Jabio = api;

  /* ── loading a city (works from file://: a script, not a fetch) ── */
  var pending = {};
  root.GA_CITY = function (data) { var p = pending[data.id]; if (p) { p.done(prepare(data)); } };
  /* pedestrian-flow model (tools/build_foot_model.py): only for the areas listed in the city's "foot" entry */
  var footPending = {};
  root.GA_FOOT = function (f) { var p = footPending[f.city + '|' + f.area]; if (p) p(f); };
  function loadFoot(city, area) {
    var meta = (root.GA_CITIES || []).filter(function (c) { return c.id === city; })[0];
    if (!root.document || !meta || !meta.foot || meta.foot.indexOf(area) < 0) return Promise.resolve(null);
    var cache = api._fcache || (api._fcache = {}), k = city + '|' + area;
    if (cache[k]) return cache[k];
    cache[k] = new Promise(function (resolve) {
      footPending[k] = resolve;
      var s = document.createElement('script'); s.src = 'assets/data/cities/' + city + '-' + area + '-foot.js'; s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return cache[k];
  }
  /* the flow index of the street in front of a point (nearest street within 80 m), the busiest street within 200 m, and how many streets that is */
  function footAt(foot, lat, lon) {
    if (!foot) return null;
    var b = foot.bbox, u = foot.unit, kx = 111320 * Math.cos(lat * Math.PI / 180), ky = 110574;
    if (lon < b[0] - .004 || lon > b[2] + .004 || lat < b[1] - .004 || lat > b[3] + .004) return null;
    var best = null, bd = 1e9, mx = 0, n = 0, i, e;
    for (i = 0; i < foot.edges.length; i++) {
      e = foot.edges[i];
      var x1 = (b[0] + e[0] * u - lon) * kx, y1 = (b[1] + e[1] * u - lat) * ky, x2 = (b[0] + e[2] * u - lon) * kx, y2 = (b[1] + e[3] * u - lat) * ky;
      var dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, -(x1 * dx + y1 * dy) / l2)) : 0, px = x1 + t * dx, py = y1 + t * dy, d = Math.sqrt(px * px + py * py);
      if (d < bd) { bd = d; best = e; }
      if (d <= 200) { n++; if (e[4] > mx) mx = e[4]; }
    }
    if (!best || bd > 200) return null;
    return { here: bd <= 80 ? best[4] : null, dist: Math.round(bd), busiest200: mx, streets200: n };
  }
  /* the district file exists only for some cities; a missing file is not an error */
  var distPending = {};
  root.GA_DISTRICTS = function (geo) { var p = distPending[geo.city]; if (p) p(geo); };
  function loadDistricts(id) {
    var meta = (root.GA_CITIES || []).filter(function (c) { return c.id === id; })[0];
    if (!root.document || !meta || !meta.districts) return Promise.resolve(null);      /* only cities that have a district file ask for it */
    var cache = api._dcache || (api._dcache = {});
    if (cache[id]) return cache[id];
    cache[id] = new Promise(function (resolve) {
      distPending[id] = resolve;
      var s = document.createElement('script');
      s.src = 'assets/data/cities/' + id + '-districts.js';
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return cache[id];
  }
  api.load = function (id) {
    if (!root.document) return Promise.reject(new Error('no document'));
    var cache = api._cache || (api._cache = {});
    if (cache[id]) return cache[id];
    cache[id] = new Promise(function (resolve, reject) {
      pending[id] = { done: resolve };
      var s = document.createElement('script');
      s.src = 'assets/data/cities/' + id + '.js';
      s.onerror = function () { delete cache[id]; reject(new Error('city data missing: ' + id)); };
      document.head.appendChild(s);
    });
    return cache[id];
  };
})(typeof window !== 'undefined' ? window : globalThis);
