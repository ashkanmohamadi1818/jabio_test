/* Jabio report: rebuilt from the address, so a link IS the report and nothing is stored or faked. */
(function () {
  'use strict';
  var J = window.Jabio, W = window.JW, T = W.T, N = W.N, esc = W.esc, $ = function (id) { return document.getElementById(id); };
  var q = W.fromQuery(location.search), byId = {}, C = null;
  (window.GA_CITIES || []).forEach(function (c) { byId[c.id] = c; });

  function empty(msg) { $('sheet').innerHTML = '<div class="rp-empty">' + esc(msg) + '</div>'; }
  function opts() { return { type: q.type, sub: q.sub, r: q.r, audience: q.audience, priorities: q.priorities, strategy: q.strategy }; }
  function row(a, b) { return '<tr><td>' + a + '</td><td>' + b + '</td></tr>'; }
  function conceptBlock(d) {
    var list = (window.GA_TAXONOMY && window.GA_TAXONOMY.cats[d.type]) || [], c = d.concept && list.filter(function (x) { return x.id === d.concept.id; })[0];
    if (!c) return '';
    var h = '<h2>' + esc(T('cc.h', W.isFa() ? c.fa : c.en)) + '</h2><p class="rp-eyebrow">' + esc(W.isFa() ? c.dfa : c.den) + '</p>';
    h += '<p class="rp-eyebrow">' + esc(d.conceptRivals ? (d.conceptRivals.n ? T('cc.rivals', N(d.conceptRivals.n), N(d.conceptRivals.of)) + (d.conceptRivals.nearest ? T('cc.nearest', N(d.conceptRivals.nearest.dist)) : '') : T('cc.none')) : T('cc.noname')) + '</p>';
    if (c.aff) h += '<p class="rp-eyebrow">' + esc(T('cc.aff', N(Math.round(Math.min(.45, Math.abs(c.aff) * .30) * 100)), T(c.aff > 0 ? 'cc.affUp' : 'cc.affDown'))) + (d.aff != null ? ' ' + esc(T('in.aff')) + ': ' + N(d.aff) : '') + '</p>';
    return h + '<p class="rp-eyebrow"><b>' + esc(T('cc.tip', W.isFa() ? c.tfa : c.ten)) + '</b></p><p class="rp-eyebrow">' + esc(T('sub.note')) + '</p>';
  }
  var printedOnce = false;
  var wantAutoPrint = new URLSearchParams(location.search).get('autoprint') === '1';

  function brandingStrip() {
    var A = window.JabioAccount;
    if (!A) return '';
    var st = typeof A.state === 'function' ? A.state() : null;
    var b = (st && st.authenticated && st.profile)
      ? {
          displayName: st.profile.displayName || st.displayName || '',
          accountType: st.profile.accountType || 'personal',
          organizationName: st.profile.organizationName || '',
          roleTitle: st.profile.roleTitle || '',
          email: st.email || ''
        }
      : (typeof A.getCachedBranding === 'function' ? A.getCachedBranding() : null);
    if (!b) return '';
    var parts = [];
    if (b.accountType === 'organization' && b.organizationName) parts.push(b.organizationName);
    if (b.displayName) parts.push(b.displayName + (b.accountType === 'organization' && b.roleTitle ? ' (' + b.roleTitle + ')' : ''));
    else if (b.email) parts.push(b.email);
    if (!parts.length) return '';
    var label = W.isFa() ? 'تهیه‌شده برای: ' : 'Prepared for: ';
    return '<div class="rp-eyebrow" style="margin-bottom:8px;font-weight:600;color:var(--c-text)">' + esc(label + parts.join(' · ')) + '</div>';
  }

  function draw() {
    var d = J.analyzePoint(C, q.point.lat, q.point.lon, opts());
    if (!d) { empty(T('spot.out', W.cityName(byId[q.city]))); return; }
    var counts = {}; J.placesAround(C, d.lat, d.lon, d.r).forEach(function (p) { counts[p.biz] = (counts[p.biz] || 0) + 1; });
    var city = W.cityName(byId[q.city]), place = W.placeText(d.place), w = d.weights;
    var date = new Date().toLocaleDateString(W.isFa() ? 'fa-IR' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    var list = function (ids, k) { return ids.length ? ids.map(function (i) { return T(k + i); }).join(W.isFa() ? '، ' : ', ') : '—'; };
    var h = brandingStrip() +
      '<div class="rp-eyebrow">' + esc(T('rep.h')) + ' · ' + esc(T('rep.date', date)) + '</div>' +
      '<h1>' + esc(T('type.' + d.type)) + ' · ' + esc(city) + '</h1>' +
      '<div class="rp-eyebrow">' + esc(place ? T('res.near', place) + ' · ' : '') + esc(N(d.lat, 4) + ', ' + N(d.lon, 4)) + ' · ' + esc(T('deep.within', N(d.r))) + ' · ' + esc(T('cov.' + d.coverage)) + '</div>' +
      '<div class="rp-lead">' + W.ring(d.score, 116) + '<div><div class="jb-verdict v-' + d.verdict + '" style="font-size:20px">' + esc(T('ver.' + d.verdict)) + '</div>' +
      '<p class="rp-eyebrow" style="margin-top:6px">' + esc(T('deep.range', N(d.range.low), N(d.range.high))) + ' · ' + esc(T('lvl.' + d.level)) + ' · ' + esc(T('quad.' + d.quadrant)) + '</p></div></div>' +
      '<div class="rp-kpis">' +
      [['m.pop', N(d.pop)], ['m.demand', N(d.demand)], ['m.access', N(d.access)], ['m.comp', N(d.comp) + ' (' + N(d.sameType) + ')']].map(function (k) { return '<div class="rp-kpi"><small>' + esc(T(k[0])) + '</small><b>' + k[1] + '</b></div>'; }).join('') + '</div>' +
      '<p class="rp-eyebrow">' + esc(T('deep.rangeNote', N(Math.round(J.uncertainty(d.coverage) * 100)))) + '</p><h2>' + esc(T('rep.map')) + '</h2><div class="rp-two"><div><canvas class="rp-map" id="dots"></canvas><div class="rp-guide-h">' + esc(T('leg.biz', N(d.r))) + '</div><div class="rp-guide">' + W.legendRows(counts, d.type, null, false) + '</div><div class="rp-legend">' + esc(T('rep.legend')) + '</div></div><div>' + W.radar(W.radarVals(d), W.radarLabels(), 260) + '</div></div>' +
      '<h2>' + esc(T('deep.how')) + '</h2>' + [['pop', d.pop, w.pop], ['demand', d.demand, w.demand], ['access', d.access, w.access], ['lowcomp', d.term, w.comp]].map(function (r) {
        return W.bar(esc(T('m.' + r[0])), r[1], esc(T('deep.weight', N(Math.round(r[2] * 100)))));
      }).join('') +
      '<h2>' + esc(T('rep.brief')) + '</h2><table class="rp-table"><tbody>' +
      row(esc(T('f.city')), esc(city)) + row(esc(T('f.type')), esc(T('type.' + d.type))) + (d.concept ? row(esc(T('sub.h')), esc(W.isFa() ? d.concept.fa : d.concept.en)) : '') + row(esc(T('f.radius')), esc(N(d.r) + (W.isFa() ? ' متر' : ' m'))) +
      row(esc(T('f.aud')), esc(list(q.audience, 'aud.'))) + row(esc(T('f.pri')), esc(list(q.priorities, 'pri.'))) + row(esc(T('f.str')), esc(T('str.' + q.strategy))) +
      row(esc(T('rep.method')), esc(W.weightsText(w))) + '</tbody></table>' +
      '<div class="rp-ins">' + W.insightsHtml(d, { city: city }) + '</div>' +
      '<h2>' + esc(T('deep.drivers')) + '</h2><table class="rp-table"><thead><tr><th>' + esc(T('rep.name')) + '</th><th>' + esc(T('rep.count')) + '</th><th>' + esc(T('rep.pct')) + '</th></tr></thead><tbody>' +
      d.drivers.map(function (x) { return '<tr><td>' + esc(T('drv.' + x.key)) + '</td><td>' + N(x.count) + '</td><td>' + N(x.pct) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h2>' + esc(T('deep.rivals')) + ' (' + N(d.competitors.length) + ')</h2>' + (d.competitors.length ? '<p class="rp-eyebrow">' + esc(T('deep.rivalsNote')) + '</p><table class="rp-table"><thead><tr><th>' + esc(T('rep.name')) + '</th><th>' + esc(T('rep.dist')) + '</th></tr></thead><tbody>' +
        d.competitors.slice(0, 12).map(function (c) { return '<tr><td>' + esc(c.name || T('deep.unnamed')) + '</td><td>' + esc(T('deep.away', N(c.dist))) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="rp-eyebrow">' + esc(T('deep.none')) + '</p>');
    if (d.good.length) h += '<h2>' + esc(T('deep.good')) + '</h2><ul class="jb-list">' + d.good.map(function (x) { return '<li>' + esc(W.explain(x, 'good')) + '</li>'; }).join('') + '</ul>';
    if (d.bad.length) h += '<h2>' + esc(T('deep.bad')) + '</h2><ul class="jb-list bad">' + d.bad.map(function (x) { return '<li>' + esc(W.explain(x, 'bad')) + '</li>'; }).join('') + '</ul>';
    h += conceptBlock(d);
    h += W.checklistHtml();
    h += '<h2>' + esc(T('deep.risks')) + '</h2><ul class="jb-list risk">' + d.risks.map(function (x) { return '<li class="sev-' + x.sev + '">' + esc(W.explain(x, 'risk')) + '</li>'; }).join('') + '</ul>' +
      '<h2>' + esc(T('rep.method')) + '</h2><ul class="jb-list">' + [1, 2, 3, 4, 5, 6].map(function (i) { return '<li>' + esc(T('method.' + i)) + '</li>'; }).join('') + '</ul>' +
      '<div class="rp-foot">' + esc(T('data.credit', C.d.date)) + ' · Jabio</div>';
    $('sheet').innerHTML = h;
    W.dotMap($('dots'), C, d, opts(), true);
    if (wantAutoPrint && !printedOnce) {
      printedOnce = true;
      setTimeout(function () { window.print(); }, 350);
    }
  }
  function start() {
    $('rpPrint').addEventListener('click', function () { window.print(); });
    if (!q || !byId[q.city]) {
      empty(T('rep.empty'));
      document.addEventListener('ga-lang', function () { empty(T('rep.empty')); });
      return;
    }
    $('rpBack').href = 'jabio.html?' + W.toQuery(q) + '&m=spot';
    empty(T('load', W.cityName(byId[q.city])));
    J.load(q.city).then(function (c) {
      C = c;
      if (window.GA_TRACK) window.GA_TRACK('report', { city: q.city, type: q.type });
      draw();
      document.addEventListener('ga-lang', draw);
      document.addEventListener('jabio-account', function () { if (C) draw(); });
    }, function () { empty(T('load.fail')); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
