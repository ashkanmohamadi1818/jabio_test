/* Jabio workspace: the form, the ranked areas, the single-spot analysis, and the map. */
(function () {
  'use strict';
  var J = window.Jabio, W = window.JW, T = W.T, N = W.N, L = W.L, esc = W.esc;
  var $ = function (id) { return document.getElementById(id); };
  var CITIES = window.GA_CITIES || [], byId = {};
  CITIES.forEach(function (c) { byId[c.id] = c; });
  var GROUPS = { food: ['restaurant', 'cafe'], retail: ['grocery', 'fashion', 'beauty'], health: ['pharmacy', 'clinic', 'fitness'], education: ['education'], services: ['services'] };
  var st = { sub: '', profile: null, activeMain: 'food_drink', mainCategory: 'food_drink', mainCategoryFa: 'غذا و نوشیدنی', subFa: 'کافه و کافی‌شاپ', subSubFa: '', view: 'blocks', mode: 'areas', city: 'tehran', type: 'cafe', audience: [], priorities: [], strategy: 'balance', r: 1000, point: null, spotType: null };
  var is3d = (function () { try { return localStorage.getItem('ga_3d') === '1'; } catch (e) { return false; } })();
  var geo = null, distCache = {}, foot = null, footOn = false;
  var hexOn = false, hexMeta = null, hexHoverId = null, hexPopupRef = null;
  var HEX_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2.5 20.2 7.25 20.2 16.75 12 21.5 3.8 16.75 3.8 7.25"/><polygon points="12 7.5 15.9 9.75 15.9 14.25 12 16.5 8.1 14.25 8.1 9.75" fill="currentColor" fill-opacity=".28" stroke-width="1.4"/></svg>';
  var C = null, map = null, mapReady = false, token = 0, pins = [], spotMk = null, store = {}, last = { areas: null, ranked: null, deep: null };
  /* the map guide: which businesses are on the map now, how many of each, which ones the user switched off */
  var guide = { open: window.innerWidth > 1000, hidden: {}, counts: null, sel: null, r: 1000 };

  /* ── the form ──────────────────────────────────────────────────── */
  function chip(attr, id, key, on, role) { return '<button type="button" class="jb-chip" ' + attr + '="' + id + '" ' + (role === 'radio' ? 'role="radio" aria-checked="' + on + '"' : 'aria-pressed="' + on + '"') + '>' + L(key) + '</button>'; }
  function applyTaxonomySelection(mainId, subName, subSubName, explicitConceptId) {
    var tax = window.GA_POI_TAXONOMY;
    if (!tax || !tax.resolve) return;
    var r = tax.resolve(mainId, subName, subSubName);
    st.activeMain = r.mainId;
    st.mainCategory = r.mainId;
    st.mainCategoryFa = r.mainFa;
    st.subFa = r.subFa;
    st.subSubFa = r.subSubFa;
    st.type = r.engineType;
    if (explicitConceptId !== undefined) {
      st.sub = explicitConceptId || '';
      st.profile = explicitConceptId ? null : r.profile;
    } else {
      st.sub = r.conceptId || '';
      st.profile = r.profile || null;
    }
  }
  function selectedLabel() {
    var tax = window.GA_POI_TAXONOMY;
    if (tax && tax.resolve && st.mainCategory) {
      var r = tax.resolve(st.mainCategory, st.subFa, st.subSubFa);
      if (r) return W.isFa() ? r.labelFa : r.labelEn;
    }
    return T('type.' + st.type);
  }
  function renderTreeSelect(filterText) {
    var tax = window.GA_POI_TAXONOMY;
    if (!tax || !tax.categories) return;
    var cats = tax.categories;
    var q = String(filterText || '').toLowerCase().trim();
    var isFa = W.isFa();
    if (!st.activeMain) st.activeMain = st.mainCategory || cats[0].id;
    var resolved = tax.resolve ? tax.resolve(st.mainCategory || st.activeMain, st.subFa, st.subSubFa) : null;
    var bcMain = resolved ? (isFa ? resolved.mainFa : resolved.mainEn) : (st.mainCategoryFa || (isFa ? 'غذا و نوشیدنی' : 'Food & Drink'));
    var bcSub = resolved && resolved.subFa ? (isFa ? resolved.subFa : resolved.subEn) : '';
    var bcSubSub = resolved && resolved.subSubFa ? (isFa ? resolved.subSubFa : resolved.subSubEn) : '';
    var ssEnMap = tax.subSubEn || {};

    var html = '<div class="jb-tree-wrap">';
    html += '<input type="text" class="jb-tree-search" id="treeSearchInput" placeholder="' + (isFa ? 'جستجوی سریع در دسته‌بندی‌ها...' : 'Quick search categories...') + '" value="' + esc(filterText || '') + '">';
    html += '<div class="jb-breadcrumb"><span>' + (isFa ? 'مسیر انتخاب:' : 'Path:') + '</span> <b>' + esc(bcMain) + '</b>' + (bcSub ? ' ← <b>' + esc(bcSub) + '</b>' : '') + (bcSubSub ? ' ← <b>' + esc(bcSubSub) + '</b>' : '') + '</div>';

    if (q) {
      html += '<div class="jb-tree-subs" style="margin-top:8px">';
      var count = 0;
      cats.forEach(function (m) {
        var mName = isFa ? m.fa : m.en;
        m.subs.forEach(function (sub) {
          var subName = isFa ? sub.fa : sub.en;
          sub.subsubs.forEach(function (ss) {
            var ssDisplay = isFa ? ss : (ssEnMap[ss] || ss);
            if (m.fa.toLowerCase().includes(q) || m.en.toLowerCase().includes(q) || sub.fa.toLowerCase().includes(q) || sub.en.toLowerCase().includes(q) || ss.toLowerCase().includes(q) || ssDisplay.toLowerCase().includes(q)) {
              count++;
              var on = st.subSubFa === ss ? ' on' : '';
              html += '<button type="button" class="jb-tree-ss' + on + '" data-main="' + m.id + '" data-sub="' + esc(sub.fa) + '" data-ss="' + esc(ss) + '" style="margin:3px">' + esc(mName) + ' › ' + esc(subName) + ' › <b>' + esc(ssDisplay) + '</b></button>';
            }
          });
        });
      });
      if (count === 0) {
        html += '<div style="font-size:12px;color:var(--jb-text2);padding:8px">' + (isFa ? 'موردی یافت نشد.' : 'No categories found.') + '</div>';
      }
      html += '</div>';
    } else {
      html += '<div class="jb-tree-mains">';
      cats.forEach(function (m) {
        var mName = isFa ? m.fa : m.en;
        var active = st.activeMain === m.id ? ' active' : '';
        html += '<button type="button" class="jb-tree-main' + active + '" data-set-main="' + m.id + '" data-name="' + esc(m.fa) + '"><span>' + m.icon + '</span> <span>' + esc(mName) + '</span></button>';
      });
      html += '</div>';

      var activeCat = cats.filter(function (m) { return m.id === st.activeMain; })[0] || cats[0];
      if (activeCat && activeCat.subs) {
        html += '<div style="margin-top:10px;font-size:12px;font-weight:600;color:var(--jb-text2)">' + (isFa ? 'زیردسته‌های ' : 'Subcategories of ') + esc(isFa ? activeCat.fa : activeCat.en) + ':</div>';
        html += '<div class="jb-tree-subs">';
        activeCat.subs.forEach(function (sub) {
          var subName = isFa ? sub.fa : sub.en;
          var subActive = st.subFa === sub.fa ? ' active' : '';
          html += '<div style="margin-bottom:8px">';
          html += '<div class="jb-tree-sub' + subActive + '" data-main="' + activeCat.id + '" data-sub="' + esc(sub.fa) + '">' + esc(subName) + '</div>';
          html += '<div class="jb-tree-subsubs">';
          sub.subsubs.forEach(function (ss) {
            var ssDisplay = isFa ? ss : (ssEnMap[ss] || ss);
            var on = st.subSubFa === ss ? ' on' : '';
            html += '<button type="button" class="jb-tree-ss' + on + '" data-main="' + activeCat.id + '" data-sub="' + esc(sub.fa) + '" data-ss="' + esc(ss) + '">' + esc(ssDisplay) + '</button>';
          });
          html += '</div></div>';
        });
        html += '</div>';
      }
    }
    html += '</div>';
    $('fType').innerHTML = html;
  }
  function buildForm() {
    $('fCity').innerHTML = CITIES.map(function (c) { return '<option value="' + c.id + '" data-en="' + esc(c.en) + '" data-fa="' + esc(c.fa) + '">' + esc(W.isFa() ? c.fa : c.en) + '</option>'; }).join('');
    $('fCity').value = st.city;
    renderTreeSelect('');
    $('fAud').innerHTML = Object.keys(J.AUDIENCE).map(function (a) { return chip('data-aud', a, 'aud.' + a, st.audience.indexOf(a) >= 0); }).join('');
    $('fPri').innerHTML = Object.keys(J.PRIORITY).map(function (p) { return chip('data-pri', p, 'pri.' + p, st.priorities.indexOf(p) >= 0); }).join('');
    $('fStr').innerHTML = ['low', 'balance', 'cluster'].map(function (s) {
      return '<button type="button" class="jb-chip" data-str="' + s + '" role="radio" aria-checked="' + (st.strategy === s) + '">' + L('str.' + s) + '<small>' + L('str.' + s + '.d') + '</small></button>';
    }).join('');
    $('fRadius').innerHTML = [500, 1000, 2000, 3000].map(function (r) { return '<option value="' + r + '">' + N(r) + (W.isFa() ? ' متر' : ' m') + '</option>'; }).join('');
    $('fRadius').value = st.r;
    var mList = $('mList');
    if (mList) mList.innerHTML = [1, 2, 3, 4, 5, 6].map(function (i) { return '<li>' + L('method.' + i) + '</li>'; }).join('');
    renderSub();
  }
  function subList() { var t = window.GA_TAXONOMY; return t && t.cats && t.cats[st.type] ? t.cats[st.type] : []; }
  function subChosen() { return subList().filter(function (x) { return x.id === st.sub; })[0] || null; }
  function renderSub() {
    var box = $('fSub'), wrap = $('fSubWrap'), list = subList(); if (!box || !wrap) return;
    wrap.hidden = !list.length;
    box.innerHTML = '<button type="button" class="jb-chip" data-sub="" aria-pressed="' + (!st.sub) + '">' + esc(T('sub.any')) + '</button>' + list.map(function (x) {
      return '<button type="button" class="jb-chip" data-sub="' + x.id + '" aria-pressed="' + (st.sub === x.id) + '" title="' + esc(W.isFa() ? x.dfa : x.den) + '">' + esc(W.isFa() ? x.fa : x.en) + '</button>';
    }).join('');
    var c = subChosen(), subDesc = $('subDesc');
    if (subDesc) subDesc.innerHTML = (c ? esc(W.isFa() ? c.dfa : c.den) + '<br>' : '') + esc(T('sub.note')) + ' <a href="categories.html" target="_blank" rel="noopener">' + esc(T('sub.all')) + '</a>';
  }
  function syncForm() {
    renderSub();
    renderTreeSelect($('treeSearchInput') ? $('treeSearchInput').value : '');
    [].forEach.call(document.querySelectorAll('[data-aud]'), function (b) { b.setAttribute('aria-pressed', String(st.audience.indexOf(b.getAttribute('data-aud')) >= 0)); });
    [].forEach.call(document.querySelectorAll('[data-pri]'), function (b) { b.setAttribute('aria-pressed', String(st.priorities.indexOf(b.getAttribute('data-pri')) >= 0)); });
    [].forEach.call(document.querySelectorAll('[data-str]'), function (b) { b.setAttribute('aria-checked', String(b.getAttribute('data-str') === st.strategy)); });
    $('fCity').value = st.city; $('fRadius').value = st.r;
  }
  /* scroll the panel, not the page (on phones the page is the scroller) */
  function reveal(el, smooth) {
    var p = document.querySelector('.jb-panel');
    if (p.scrollHeight > p.clientHeight + 4 && getComputedStyle(p).overflowY !== 'visible') p.scrollTo({ top: el.getBoundingClientRect().top - p.getBoundingClientRect().top + p.scrollTop - 12, behavior: smooth === false ? 'auto' : 'smooth' });
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function track(n, p) { try { if (window.GA_TRACK) window.GA_TRACK(n, p); } catch (e) {} }
  function toggle(list, id) { var i = list.indexOf(id); if (i >= 0) list.splice(i, 1); else list.push(id); }
  function wire() {
    $('fType').addEventListener('input', function (e) {
      if (e.target && e.target.id === 'treeSearchInput') {
        renderTreeSelect(e.target.value);
        var input = $('treeSearchInput');
        if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
      }
    });
    $('fType').addEventListener('click', function (e) {
      if (e.target.closest('[data-hex-toggle]')) return;
      var mainBtn = e.target.closest('[data-set-main]');
      if (mainBtn) {
        applyTaxonomySelection(mainBtn.getAttribute('data-set-main'), '', '');
        syncForm();
        if (st.mode === 'spot' && st.point) { st.spotType = st.type; refreshSpot(); }
        if (last.res) runAreas(true);
        else if (hexOn) updateHex();
        return;
      }
      var btn = e.target.closest('[data-ss], [data-sub], [data-main]');
      if (!btn) return;
      var mainId = btn.getAttribute('data-main');
      var sub = btn.getAttribute('data-sub') || '';
      var ss = btn.getAttribute('data-ss') || '';
      applyTaxonomySelection(mainId, sub, ss);
      syncForm();
      if (st.mode === 'spot' && st.point) { st.spotType = st.type; refreshSpot(); }
      if (last.res) runAreas(true);
      else if (hexOn) updateHex();
    });
    if ($('fSub')) $('fSub').addEventListener('click', function (e) { var b = e.target.closest('[data-sub]'); if (!b) return; st.sub = b.getAttribute('data-sub'); if (st.sub) st.profile = null; syncForm(); if (st.mode === 'spot' && st.point && st.spotType === st.type) refreshSpot(); if (last.res) runAreas(true); else if (hexOn) updateHex(); });
    $('fAud').addEventListener('click', function (e) { var b = e.target.closest('[data-aud]'); if (!b) return; toggle(st.audience, b.getAttribute('data-aud')); syncForm(); if (last.res) runAreas(true); else if (hexOn) updateHex(); });
    $('fPri').addEventListener('click', function (e) { var b = e.target.closest('[data-pri]'); if (!b) return; toggle(st.priorities, b.getAttribute('data-pri')); syncForm(); if (last.res) runAreas(true); else if (hexOn) updateHex(); });
    $('fStr').addEventListener('click', function (e) { var b = e.target.closest('[data-str]'); if (!b) return; st.strategy = b.getAttribute('data-str'); syncForm(); if (last.res) runAreas(true); else if (hexOn) updateHex(); });
    $('fRadius').addEventListener('change', function () { st.r = +this.value; if (st.mode === 'spot' && st.point) refreshSpot(); if (last.res) runAreas(true); else if (hexOn) updateHex(); });
    $('fCity').addEventListener('change', function () { changeCity(this.value); });
    $('goAreas').addEventListener('click', function () { runAreas(false); });
    [].forEach.call(document.querySelectorAll('.jb-tab'), function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
    $('results').addEventListener('click', function (e) {
      if (e.target.closest('[data-hex-toggle]')) { setHex(!hexOn); return; }
      var sg = e.target.closest('[data-view]'); if (sg) { st.view = sg.getAttribute('data-view'); renderAreas(); if (st.view === 'blocks') { drawAreas(last.res); } return; }
      var sp = e.target.closest('[data-spot]'); if (sp && geo) { var r = distRows(st.view).filter(function (x) { return x.id === sp.getAttribute('data-spot'); })[0]; if (r && r.bestSpot) { st.spotType = st.type; pickSpot(r.bestSpot.lat, r.bestSpot.lon, true); } return; }
      var dr = e.target.closest('.jb-drow'); if (dr && geo) { focusDistrict(dr.getAttribute('data-id')); return; }
      var go = e.target.closest('.jb-link'), card = e.target.closest('.jb-area');
      if (go) { var a = last.areas[+go.closest('.jb-area').getAttribute('data-i')]; st.spotType = st.type; pickSpot(a.lat, a.lon, true); return; }
      if (card) focusArea(+card.getAttribute('data-i'));
    });
    $('spotBox').addEventListener('click', function (e) {
      var f = e.target.closest('.jb-fit'); if (f) { st.spotType = f.getAttribute('data-t'); renderSpot(); return; }
      if (e.target.closest('#copyLink')) copyLink(e.target.closest('#copyLink'));
      var bt = e.target.closest('[data-better]'); if (bt && last.deep) { var b = last.deep.betterNearby[+bt.getAttribute('data-better')]; st.spotType = last.deep.type; pickSpot(b.lat, b.lon, true); return; }
      if (e.target.closest('#saveSpot')) saveSpot(e.target.closest('#saveSpot'));
      if (e.target.closest('#look3d')) { set3d(true, true); document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
    $('spotBox').addEventListener('input', function (e) { if (e.target.classList.contains('be-in') && last.deep) W.breakEven(last.deep); });
    $('savedBox').addEventListener('click', function (e) {
      var o = e.target.closest('[data-open]'), x = e.target.closest('[data-del]');
      if (x) { var l = loadSaved(), i=+x.getAttribute('data-del'); if(window.JabioAccount.state().authenticated){x.disabled=true;window.JabioAccount.remove(l[i].accountId).catch(function(){fail(W.isFa()?'حذف از حساب انجام نشد.':'Could not remove from account.', { code: 'network' });}).finally(function(){x.disabled=false;});}else{l.splice(i,1);putSaved(l);renderSaved();}return; }
      if (o) { var it = loadSaved()[+o.getAttribute('data-open')]; if (it) location.href = 'jabio.html?' + it.q + '&m=spot'; }
    });
  }
  function setMode(m) {
    st.mode = m;
    [].forEach.call(document.querySelectorAll('.jb-tab'), function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-mode') === m)); });
    $('paneAreas').hidden = m !== 'areas'; $('paneSpot').hidden = m !== 'spot';
    showLayers(); syncPlaces();
  }

  /* ── the city and the engine ───────────────────────────────────── */
  function busy(on, text) { var m = $('mapMsg'); m.hidden = !on; m.classList.remove('err'); m.innerHTML = on ? '<span class="jb-spin"></span><span>' + esc(text) + '</span>' : ''; }
  function fail(text) {
    var m = $('mapMsg');
    if (m) { m.hidden = false; m.classList.add('err'); m.textContent = text; setTimeout(function () { m.hidden = true; }, 4500); }
  }
  function ensureCity() {
    if (C && C.d.id === st.city) return Promise.resolve(C);
    busy(true, T('load', W.cityName(byId[st.city])));
    J.loadDistricts(st.city).then(function (g) { geo = g; distCache = {}; if (last.res) renderAreas(); });
    J.loadFoot(st.city, 'd5').then(function (f) { foot = f; if (map && mapReady) footLayer(); if (st.point && C) renderSpot(); });
    return J.load(st.city).then(function (c) { C = c; busy(false); return c; }, function () {
      busy(false);
      fail(T('load.fail'), { code: 'load_fail', onPrimary: function () { ensureCity().catch(function () {}); } });
      throw new Error('load');
    });
  }
  function changeCity(id) {
    st.city = id; st.point = null; geo = null; distCache = {}; foot = null; footOn = false; if (map && mapReady && map.getLayer('foot-line')) map.setLayoutProperty('foot-line', 'visibility', 'none'); st.view = 'blocks'; setDistLayer(null); last = { areas: null, ranked: null, deep: null };
    clearHexHover(); if (hexPopupRef) { hexPopupRef.remove(); hexPopupRef = null; } hexMeta = null; setData('hex', null);
    $('results').innerHTML = ''; $('spotBox').innerHTML = '';
    clearPins(); setData('heat', null); clearPlaces(); setData('radius', null); if (spotMk) { spotMk.remove(); spotMk = null; }
    var m = byId[id]; if (map) map.flyTo({ center: [m.lon, m.lat], zoom: 11, duration: 900 });
    ensureCity().then(function () { if (hexOn) updateHex(); }).catch(function () {});
  }
  function opts(type) {
    var t = type || st.type;
    var isMine = t === st.type;
    return { type: t, sub: isMine ? st.sub : '', profile: isMine ? st.profile : null, r: st.r, audience: st.audience, priorities: st.priorities, strategy: st.strategy };
  }


  /* ── municipal districts and sub-districts ─────────────────────── */
  function segHtml() {
    return '<div class="jb-seg" role="tablist">' + ['blocks', 'district', 'sub'].map(function (v) {
      return '<button type="button" role="tab" data-view="' + v + '" aria-selected="' + (st.view === v) + '">' + esc(T('view.' + v)) + '</button>';
    }).join('') + '</div>';
  }
  function distRows(level) {
    var key = [st.city, st.type, st.sub || '', (st.profile && st.profile.id) || '', st.r, st.audience.join(), st.priorities.join(), st.strategy, level].join('|');
    if (!distCache[key]) distCache[key] = J.districtStats(C, geo, level, opts());
    return distCache[key];
  }
  function distHue(s) { return s == null ? 'rgba(128,128,128,.3)' : s >= 70 ? '#7CF2A8' : s >= 58 ? '#C2C3F5' : s >= 46 ? '#8F95D8' : '#5B607F'; }
  function districtHtml(level) {
    var rows = distRows(level).slice().sort(function (a, b) { return (b.top == null ? -1 : b.top) - (a.top == null ? -1 : a.top); });
    var h = '<h3 class="jb-dv-h">' + esc(T('dv.h', T('view.' + level), selectedLabel())) + '</h3><p class="jb-note">' + esc(T('dv.note')) + '</p><div class="jb-dv">';
    h += rows.map(function (r, i) {
      var name = W.isFa() ? r.fa : r.en, thin = r.completeness != null && r.completeness < 50;
      return '<article class="jb-drow" data-id="' + r.id + '"><div class="jb-rank">' + N(i + 1) + '</div><div class="jb-dbody"><h4>' + esc(name) + '</h4>' +
        (r.top == null ? '<p class="jb-note">' + esc(T('dv.none')) + '</p>' :
          '<div class="jb-dbar"><i style="width:' + r.top + '%;background:' + distHue(r.top) + '"></i><u style="inset-inline-start:' + r.typical + '%"></u></div>' +
          '<div class="jb-dscore"><b>' + N(r.top) + '</b> <small>' + esc(T('dv.typical', N(r.typical))) + '</small></div>') +
        '<div class="jb-mini"><span>' + esc(T('dv.people', N(r.people))) + '</span>' + (r.perTenK != null ? '<span>' + esc(T('dv.rivals', N(r.perTenK))) + '</span>' : '') +
        '<span class="' + (thin ? 'dv-thin' : '') + '">' + esc(thin ? T('dv.thin', N(r.completeness)) : T('dv.ok', N(r.completeness == null ? 0 : r.completeness))) + '</span>' +
        (r.covered < 90 ? '<span class="dv-thin">' + esc(T('dv.cover', N(r.covered))) + '</span>' : '') + '</div></div>' +
        (r.bestSpot ? '<button type="button" class="jb-link" data-spot="' + r.id + '">' + esc(T('dv.best')) + (W.isFa() ? ' ←' : ' →') + '</button>' : '') + '</article>';
    }).join('') + '</div><p class="jb-note">' + esc(T('dv.warn', N(geo.levels.sub.length), N(Math.round(distRows('district').filter(function (r) { return r.n <= 22; }).reduce(function (a, r) { return a + r.people; }, 0) / 1e4) / 100))) + '</p>';
    return h;
  }
  function setDistLayer(data) {
    store.dist = data;
    var s = map && mapReady && map.getSource('dist'); if (s) s.setData(data || fc([]));
  }
  function showView() {
    if (!map || !mapReady) return;
    var d = !!(geo && st.view !== 'blocks' && st.mode === 'areas');
    if (map.getLayer('dist-fill')) { map.setLayoutProperty('dist-fill', 'visibility', d ? 'visible' : 'none'); map.setLayoutProperty('dist-line', 'visibility', d ? 'visible' : 'none'); }
    syncHexLayers();
    pins.forEach(function (p) { p.el.style.display = !d && st.mode === 'areas' ? '' : 'none'; });
    if (d && last.res) {
      var rows = distRows(st.view), by = {}; rows.forEach(function (r) { by[r.id] = r; });
      setDistLayer(fc(geo.levels[st.view].map(function (f) {
        var r = by[f.id];
        return { type: 'Feature', properties: { id: f.id, s: r && r.top != null ? r.top : -1, n: W.isFa() ? f.fa : f.en }, geometry: { type: 'MultiPolygon', coordinates: f.rings.map(function (ring) { return [ring]; }) } };
      })));
    }
  }
  function focusDistrict(id) {
    var f = geo.levels[st.view].filter(function (x) { return x.id === id; })[0]; if (!f || !map) return;
    var b = new maplibregl.LngLatBounds(); f.rings.forEach(function (r) { r.forEach(function (p) { b.extend(p); }); });
    map.fitBounds(b, { padding: 60, duration: 700, maxZoom: 14 });
    [].forEach.call(document.querySelectorAll('.jb-drow'), function (el) { el.classList.toggle('on', el.getAttribute('data-id') === id); });
  }

  /* ── best areas ────────────────────────────────────────────────── */
  function runAreas(silent) {
    var my = ++token, btn = $('goAreas'); if (!silent) btn.disabled = true;
    ensureCity().then(function (c) {
      return new Promise(function (res) { setTimeout(function () { res(J.topAreas(c, opts(), 6)); }, 20); });
    }).then(function (res) {
      if (my !== token) return;
      track('areas', { city: st.city, type: st.type, main: st.mainCategory, sub: st.subFa, subsub: st.subSubFa });
      last.areas = res.areas; last.res = res; last.sel = null;
      renderAreas(); drawAreas(res); if (hexOn) updateHex(); btn.disabled = false;
      if (!silent) reveal($('results'));
    }).catch(function () { btn.disabled = false; });
  }
  function areaName(a) { var p = W.placeText(a.place); return p ? T('res.near', p) : N(a.lat, 4) + ', ' + N(a.lon, 4); }
  function renderAreas() {
    var res = last.res, box = $('results'); if (!res) { box.innerHTML = ''; return; }
    var cm = byId[st.city], tName = selectedLabel();
    var cc = subChosen();
    var ccName = cc ? (W.isFa() ? cc.fa : cc.en) : '';
    var showSubNote = cc && ccName && ccName !== tName;
    var html = '<h2>' + esc(T('res.h', tName, W.cityName(cm))) + '</h2>' + (showSubNote ? '<p class="jb-note"><b>' + esc(T('sub.in', ccName)) + '</b></p>' : '') +
      '<div class="jb-badges"><span class="jb-badge cov-' + C.coverage + '">' + esc(T('cov.' + C.coverage)) + '</span><span class="jb-badge">' + esc(T('res.heat')) + '</span><button type="button" class="jb-badge jb-badge-btn" data-hex-toggle="1" aria-pressed="' + hexOn + '">' + HEX_SVG + '<span>' + esc(T('hex.toggle')) + '</span></button></div>' +
      '<p class="jb-note">' + esc(T('res.hint', W.cityName(cm))) + '<br>' + esc(W.weightsText(res.weights.top)) + '<br>' + esc(T('res.guard', N(J.MIN_DEMAND))) + (res.relaxed ? '<br><b>' + esc(T('res.relaxed')) + '</b>' : '') + (res.thinSkipped ? '<br>' + esc(T('res.thinSkipped', N(res.thinSkipped))) : '') + '</p>';
    if (C.coverage !== 'rich') html += '<p class="jb-note"><b>' + esc(T('r.thinData.' + (C.coverage === 'thin' ? 'thin' : 'partial'))) + '</b></p>';
    if (geo) html += segHtml();
    if (geo && st.view !== 'blocks') { html += districtHtml(st.view); html += '<p class="jb-note">' + esc(T('data.credit', C.d.date)) + '</p>'; box.innerHTML = html; showView(); return; }
    html += res.areas.map(function (a, i) {
      return '<article class="jb-area' + (last.sel === i ? ' on' : '') + '" data-i="' + i + '" tabindex="0"><div class="jb-rank">' + N(i + 1) + '</div><div><h3>' + esc(areaName(a)) + '</h3>' +
        '<div class="jb-mini"><span>' + esc(T('m.pop')) + ' <b>' + N(a.pop) + '</b></span><span>' + esc(T('m.demand')) + ' <b>' + N(a.demand) + '</b></span><span>' + esc(T('deep.range', N(a.range.low), N(a.range.high))) + '</span><span>' + esc(T('m.access')) + ' <b>' + N(a.access) + '</b></span><span>' + esc(T('m.comp')) + ' <b>' + N(a.comp) + '</b></span></div></div>' +
        W.ring(a.score, 58) + '<button type="button" class="jb-link">' + esc(T('res.analyze')) + (W.isFa() ? ' ←' : ' →') + '</button></article>';
    }).join('');
    html += '<p class="jb-note">' + esc(T('data.credit', C.d.date)) + '</p>';
    box.innerHTML = html; showView();
  }
  function focusArea(i) {
    last.sel = i; var a = last.areas[i];
    [].forEach.call(document.querySelectorAll('.jb-area'), function (el) { el.classList.toggle('on', +el.getAttribute('data-i') === i); });
    pins.forEach(function (p, k) { p.el.classList.toggle('on', k === i); });
    if (map) map.flyTo({ center: [a.lon, a.lat], zoom: Math.max(map.getZoom(), 13.2), duration: 700 });
    setData('radius', circle(a.lat, a.lon, a.r));
    showPlaces(a.lat, a.lon, a.r, st.type);
  }

  /* ── one spot ──────────────────────────────────────────────────── */
  function pickSpot(lat, lon, keepType) {
    var my = ++token;
    ensureCity().then(function (c) {
      if (my !== token) return;
      if (J.analyzePoint(c, lat, lon, opts()) === null) { fail(T('spot.out', W.cityName(byId[st.city])), { code: 'spot_outside' }); return; }
      st.point = { lat: lat, lon: lon }; track('spot', { city: st.city, type: st.spotType || st.type });
      if (!keepType) st.spotType = st.sub ? st.type : null;          /* a chosen concept is a stated intention: analyse that business, not the best-fitting one */
      setMode('spot'); refreshSpot(); reveal($('paneSpot'), false);
    }).catch(function () {});
  }
  function refreshSpot() {
    last.ranked = J.rankTypes(C, st.point.lat, st.point.lon, opts());
    if (!st.spotType) st.spotType = last.ranked[0].type;
    renderSpot();
  }
  function renderSpot() {
    var p = st.point, box = $('spotBox'); if (!p) { box.innerHTML = ''; return; }
    var d = J.analyzePoint(C, p.lat, p.lon, opts(st.spotType)); last.deep = d;
    var ranked = last.ranked, cm = byId[st.city];
    var name = W.placeText(d.place);
    var html = '<div class="jb-deep" style="border-top:0;padding-top:0"><h2>' + esc(T('spot.at')) + ': ' + esc(name || N(p.lat, 4) + ', ' + N(p.lon, 4)) + '</h2>' +
      (geo && J.locate(geo, p.lat, p.lon) && J.locate(geo, p.lat, p.lon).district ? '<p class="jb-note">' + esc(T('dv.in', (function (L) { return W.isFa() ? (L.sub ? L.sub.fa : L.district.fa) : (L.sub ? L.sub.en : L.district.en); })(J.locate(geo, p.lat, p.lon)))) + '</p>' : '') +
      '<div class="jb-badges"><span class="jb-badge cov-' + C.coverage + '">' + esc(T('cov.' + C.coverage)) + '</span><span class="jb-badge">' + esc(T('deep.within', N(st.r))) + '</span></div></div>';
    html += '<section class="jb-sec"><h3>' + esc(T('spot.fit')) + '</h3><div class="jb-fits">' + ranked.map(function (r) {
      return '<button type="button" class="jb-fit' + (r.type === st.spotType ? ' on' : '') + '" data-t="' + r.type + '"><span>' + esc(T('type.' + r.type)) + '</span><b>' + N(r.score) + '</b>' +
        '<div class="jb-bar-t"><i style="width:' + r.score + '%"></i></div><div class="jb-badges"><span class="jb-badge q-' + r.quadrant + '">' + esc(T('quad.' + r.quadrant)) + '</span></div></button>';
    }).join('') + '</div></section>';
    html += deepHtml(d);
    box.innerHTML = html;
    drawSpot(d);
  }
  function footHtml(d) {
    var f = foot && J.footAt(foot, d.lat, d.lon); if (!f) return '';
    var h = '<section class="jb-sec"><h3>' + esc(T('fp.h')) + '</h3>';
    h += f.here != null ? W.bar(esc(T('fp.here', N(f.here))), f.here) : '<p class="jb-note">' + esc(T('fp.far', N(f.dist))) + '</p>';
    h += '<p class="jb-note">' + esc(T('fp.busiest', N(f.busiest200))) + '</p><p class="jb-note"><b>' + esc(T('fp.note')) + '</b></p></section>';
    return h;
  }
  /* the street flow as a map layer, switched on and off by a button */
  function footLayer() {
    if (!foot || !map) return;
    var b = foot.bbox, u = foot.unit;
    var data = fc(foot.edges.map(function (e) { return { type: 'Feature', properties: { f: e[4] }, geometry: { type: 'LineString', coordinates: [[b[0] + e[0] * u, b[1] + e[1] * u], [b[0] + e[2] * u, b[1] + e[3] * u]] } }; }));
    if (!map.getSource('foot')) map.addSource('foot', { type: 'geojson', data: data }); else map.getSource('foot').setData(data);
    if (!map.getLayer('foot-line')) map.addLayer({ id: 'foot-line', type: 'line', source: 'foot', layout: { visibility: footOn ? 'visible' : 'none', 'line-cap': 'round', 'line-sort-key': ['get', 'f'] },
      paint: { 'line-color': ['interpolate', ['linear'], ['get', 'f'], 0, '#3B3F6B', 15, '#6C74D9', 40, '#C2C3F5', 70, '#FFD166', 100, '#FF6B6B'],
        'line-width': ['interpolate', ['linear'], ['get', 'f'], 0, 1, 30, 2.5, 100, 6], 'line-opacity': .9 } });
    var btn = $('btnFoot'); if (btn) btn.setAttribute('aria-pressed', String(footOn));
    renderGuide();
  }
  function setFoot(on) {
    footOn = on; if (on) guide.open = true;          /* the guide must show what the colours mean, so it opens with the layer */
    if (!map || !mapReady || !foot) { renderGuide(); return; }
    footLayer(); map.setLayoutProperty('foot-line', 'visibility', on ? 'visible' : 'none');
    if (on) { var b = foot.bbox; map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 50, duration: 800 }); }
  }
  /* enlarge the map over the side panel, and back */
  function setWide(on) {
    document.body.classList.toggle('jb-wide', on);
    var b = $('btnWide'); if (b) { b.setAttribute('aria-pressed', String(on)); b.title = T(on ? 'map.narrow' : 'map.wide'); b.setAttribute('aria-label', b.title); b.firstChild.textContent = on ? '⤡' : '⤢'; }
    if (map) { map.resize(); setTimeout(function () { map.resize(); }, 120); setTimeout(function () { map.resize(); }, 420); }
  }
  function ControlWide() {}
  ControlWide.prototype.onAdd = function () {
    var d = document.createElement('div'); d.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    d.innerHTML = '<button type="button" id="btnWide" class="jb-3d" aria-pressed="false"><b>⤢</b></button>';
    d.firstChild.title = T('map.wide'); d.firstChild.setAttribute('aria-label', T('map.wide'));
    d.firstChild.addEventListener('click', function () { setWide(!document.body.classList.contains('jb-wide')); });
    this._d = d; return d;
  };
  ControlWide.prototype.onRemove = function () { this._d.remove(); };
  function ControlFoot() {}
  ControlFoot.prototype.onAdd = function () {
    var d = document.createElement('div'); d.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    d.innerHTML = '<button type="button" id="btnFoot" class="jb-3d" aria-pressed="false"><b>👣</b></button>';
    d.firstChild.title = T('fp.map'); d.firstChild.setAttribute('aria-label', T('fp.map'));
    d.firstChild.addEventListener('click', function () { if (!foot) { fail(T('fp.note'), { code: 'foot_unavailable' }); return; } setFoot(!footOn); });
    this._d = d; return d;
  };
  ControlFoot.prototype.onRemove = function () { this._d.remove(); };
  /* ── hexbin spatial aggregation layer ──────────────────────────── */
  function clearHexHover() {
    if (hexHoverId != null && map && mapReady && map.getSource('hex')) {
      try { map.setFeatureState({ source: 'hex', id: hexHoverId }, { hover: false }); } catch (e) {}
    }
    hexHoverId = null;
  }
  function syncHexLayers() {
    var b = $('btnHex'); if (b) b.setAttribute('aria-pressed', String(hexOn));
    var b2 = document.querySelector('[data-hex-toggle]'); if (b2) b2.setAttribute('aria-pressed', String(hexOn));
    if (!map || !mapReady) return;
    var distMode = !!(geo && st.view !== 'blocks' && st.mode === 'areas');
    var showHex = hexOn && !distMode;
    if (map.getLayer('hex-fill')) map.setLayoutProperty('hex-fill', 'visibility', showHex && !is3d ? 'visible' : 'none');
    if (map.getLayer('hex-line')) map.setLayoutProperty('hex-line', 'visibility', showHex && !is3d ? 'visible' : 'none');
    if (map.getLayer('hex-3d')) map.setLayoutProperty('hex-3d', 'visibility', showHex && is3d ? 'visible' : 'none');
    if (map.getLayer('heat')) map.setLayoutProperty('heat', 'visibility', !showHex && !distMode && st.mode === 'areas' ? 'visible' : 'none');
  }
  function updateHex() {
    if (!hexOn) { syncHexLayers(); renderGuide(); return; }
    if (!C) {
      ensureCity().then(function () { if (hexOn) updateHex(); }).catch(function () {});
      return;
    }
    clearHexHover();
    var hx = J.hexbin(C, opts());
    hexMeta = hx;
    setData('hex', hx.geojson);
    syncHexLayers();
    renderGuide();
  }
  function setHex(on) {
    hexOn = !!on;
    if (hexOn) {
      guide.open = true;
      if (st.view !== 'blocks' && st.mode === 'areas') { st.view = 'blocks'; if (last.res) renderAreas(); }
      updateHex();
    } else {
      clearHexHover();
      if (hexPopupRef) { hexPopupRef.remove(); hexPopupRef = null; }
      syncHexLayers();
      renderGuide();
    }
  }
  function hexPopup(f, lngLat) {
    var p = f.properties;
    if (hexPopupRef) { hexPopupRef.remove(); hexPopupRef = null; }
    var box = document.createElement('div');
    box.className = 'jb-hex-pop';
    box.innerHTML =
      '<div class="jb-hex-pop-h"><span class="jb-hex-pop-t">' + esc(T('hex.pop.title')) + ' · ' + esc(selectedLabel()) + '</span><span class="jb-hex-pop-sc lv-' + esc(p.lv || 'mixed') + '">' + N(p.s) + '</span></div>' +
      '<div class="jb-hex-pop-sub">' + esc(T('hex.pop.blocks', N(p.n), N(p.max))) + '</div>' +
      '<div class="jb-hex-pop-grid">' +
        '<div class="jb-hex-pop-m"><span>' + esc(T('m.pop')) + '</span><b>' + N(p.pop) + '</b></div>' +
        '<div class="jb-hex-pop-m"><span>' + esc(T('m.demand')) + '</span><b>' + N(p.dem) + '</b></div>' +
        '<div class="jb-hex-pop-m"><span>' + esc(T('m.access')) + '</span><b>' + N(p.acc) + '</b></div>' +
        '<div class="jb-hex-pop-m"><span>' + esc(T('m.comp')) + '</span><b>' + N(p.comp) + '</b></div>' +
      '</div>' +
      '<button type="button" class="jb-hex-pop-go">' + esc(T('hex.pop.analyze')) + (W.isFa() ? ' ←' : ' →') + '</button>';
    box.querySelector('.jb-hex-pop-go').addEventListener('click', function () {
      if (hexPopupRef) { hexPopupRef.remove(); hexPopupRef = null; }
      st.spotType = st.type;
      pickSpot(Number(p.lat), Number(p.lon), true);
    });
    hexPopupRef = new maplibregl.Popup({ maxWidth: '270px', offset: 10 }).setLngLat(lngLat).setDOMContent(box).addTo(map);
  }
  function ControlHex() {}
  ControlHex.prototype.onAdd = function () {
    var d = document.createElement('div'); d.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    d.innerHTML = '<button type="button" id="btnHex" class="jb-3d jb-hex-btn" aria-pressed="' + hexOn + '">' + HEX_SVG + '</button>';
    d.firstChild.title = T('hex.map'); d.firstChild.setAttribute('aria-label', T('hex.map'));
    d.firstChild.addEventListener('click', function () { setHex(!hexOn); });
    this._d = d; return d;
  };
  ControlHex.prototype.onRemove = function () { this._d.remove(); };
  function conceptHtml(d) {
    var c = d.concept && subChosen(); if (!c) return '';
    var h = '<section class="jb-sec"><h3>' + esc(T('cc.h', W.isFa() ? c.fa : c.en)) + '</h3><p class="jb-note">' + esc(W.isFa() ? c.dfa : c.den) + '</p>';
    if (d.conceptRivals) h += '<p class="jb-note">' + esc(d.conceptRivals.n ? T('cc.rivals', N(d.conceptRivals.n), N(d.conceptRivals.of)) + (d.conceptRivals.nearest ? T('cc.nearest', N(d.conceptRivals.nearest.dist)) : '') : T('cc.none')) + '</p>';
    else h += '<p class="jb-note">' + esc(T('cc.noname')) + '</p>';
    if (c.aff) h += '<p class="jb-note">' + esc(T('cc.aff', N(Math.round(Math.min(.45, Math.abs(c.aff) * .30) * 100)), T(c.aff > 0 ? 'cc.affUp' : 'cc.affDown'))) + (d.aff != null ? ' ' + esc(T('in.aff')) + ': <b>' + N(d.aff) + '</b>' : '') + '</p>';
    return h + '<p class="jb-note"><b>' + esc(T('cc.tip', W.isFa() ? c.tfa : c.ten)) + '</b></p></section>';
  }
  function deepHtml(d) {
    var w = d.weights, rows = [['pop', d.pop, w.pop], ['demand', d.demand, w.demand], ['access', d.access, w.access], ['lowcomp', d.term, w.comp]];
    var titleLabel = d.type === st.type ? selectedLabel() : T('type.' + d.type);
    var h = '<div class="jb-deep"><div class="jb-deep-top">' + W.ring(d.score, 92) + '<div><h2>' + esc(titleLabel) + '</h2><div class="jb-verdict v-' + d.verdict + '">' + esc(T('ver.' + d.verdict)) + '</div><div class="jb-range" title="' + esc(T('deep.rangeNote', N(Math.round(J.uncertainty(d.coverage) * 100)))) + '">' + esc(T('deep.range', N(d.range.low), N(d.range.high))) + '</div></div></div>';
    h += '<section class="jb-sec"><h3>' + esc(T('deep.how')) + '</h3>' + rows.map(function (r) {
      return W.bar(esc(T('m.' + r[0])), r[1], esc(T('deep.weight', N(Math.round(r[2] * 100)))) + (r[0] === 'pop' ? ' · ' + esc(T('deep.people', N(d.people))) : ''));
    }).join('') + '</section>';
    h += '<section class="jb-sec"><h3>' + esc(T('deep.radar')) + '</h3>' + W.radar(W.radarVals(d), W.radarLabels(), 260) + '</section>';
    h += '<section class="jb-sec"><h3>' + esc(T('deep.drivers')) + '</h3>' + d.drivers.slice(0, 5).map(function (x) { return W.bar(esc(T('drv.' + x.key)), x.pct, esc(N(x.count)) + ' · ' + esc(T('deep.within', N(d.r)))); }).join('') + '</section>';
    h += '<section class="jb-sec"><h3>' + esc(T('deep.rivals')) + ' (' + N(d.competitors.length) + ')</h3>' + (d.competitors.length ? '<p class="jb-note">' + esc(T('deep.rivalsNote')) + '</p><div class="jb-rivals">' + d.competitors.slice(0, 8).map(function (c) {
      return '<div class="jb-rival"><span>' + esc(c.name || T('deep.unnamed')) + '</span><b>' + esc(T('deep.away', N(c.dist))) + '</b></div>';
    }).join('') + '</div>' : '<p class="jb-note">' + esc(T('deep.none')) + '</p>') + '</section>';
    h += W.insightsHtml(d, { city: W.cityName(byId[st.city]), link: true });
    h += W.breakEvenHtml();
    h += footHtml(d);
    h += conceptHtml(d);
    if (d.good.length) h += '<section class="jb-sec"><h3>' + esc(T('deep.good')) + '</h3><ul class="jb-list">' + d.good.map(function (x) { return '<li>' + esc(W.explain(x, 'good')) + '</li>'; }).join('') + '</ul></section>';
    if (d.bad.length) h += '<section class="jb-sec"><h3>' + esc(T('deep.bad')) + '</h3><ul class="jb-list bad">' + d.bad.map(function (x) { return '<li>' + esc(W.explain(x, 'bad')) + '</li>'; }).join('') + '</ul></section>';
    h += '<section class="jb-sec"><h3>' + esc(T('deep.risks')) + '</h3><ul class="jb-list risk">' + d.risks.map(function (x) { return '<li class="sev-' + x.sev + '">' + esc(W.explain(x, 'risk')) + '</li>'; }).join('') + '</ul></section>';
    h += W.checklistHtml();
    h += '<section class="jb-sec"><h3>' + esc(T('look.h')) + '</h3><p class="jb-note">' + esc(T('look.note')) + '</p><div class="jb-actions">' +
      '<button type="button" class="jb-btn t" id="look3d">' + esc(T('look.3d')) + '</button>' +
      '<a class="jb-btn t" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=' + d.lat.toFixed(6) + ',' + d.lon.toFixed(6) + '">' + esc(T('look.google')) + '</a>' +
      '<a class="jb-btn t" target="_blank" rel="noopener noreferrer" href="https://www.mapillary.com/app/?lat=' + d.lat.toFixed(6) + '&lng=' + d.lon.toFixed(6) + '&z=17">' + esc(T('look.mly')) + '</a></div></section>';
    h += '<div class="jb-actions"><a class="jb-btn p" href="report.html?' + W.toQuery(st) + '" target="_blank" rel="noopener">' + esc(T('deep.report')) + '</a><button type="button" class="jb-btn t" id="copyLink">' + esc(T('deep.copy')) + '</button>' +
      '<a class="jb-btn t" href="compare.html?' + W.toQuery(st) + '">' + (W.isFa() ? 'مقایسه این مکان' : 'Compare this location') + '</a><a class="jb-btn t" href="saved.html">' + (W.isFa() ? 'تحلیل‌های ذخیره‌شده' : 'Saved analyses') + '</a><button type="button" class="jb-btn t" id="saveSpot">' + esc(T('sv.save')) + '</button>' +
      '<a class="jb-btn t" id="osmAdd" target="_blank" rel="noopener" title="' + esc(T('osm.tip')) + '" href="https://www.openstreetmap.org/edit?editor=id#map=19/' + d.lat.toFixed(5) + '/' + d.lon.toFixed(5) + '">' + esc(T('osm.add')) + '</a></div></div>';
    return h;
  }
  function copyLink(btn) {
    var url = new URL('jabio.html?' + W.toQuery(st) + '&m=spot', location.href).href;
    var done = function () { var o = btn.textContent; btn.textContent = T('deep.copied'); setTimeout(function () { btn.textContent = T('deep.copy'); }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt('', url); }); else { try { window.prompt('', url); } catch (e) {} }
  }

  /* ── my analyses: kept in this browser only, never sent anywhere ─ */
  var SAVE_MAX = 3, SAVE_KEY = 'ga_saved_v1';
  function loadSaved() { if (window.JabioAccount.state().authenticated) return window.JabioAccount.items(); try { var l = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  function putSaved(l) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(l)); } catch (e) {} }
  function saveSpot(btn) {
    var d = last.deep; if (!d) return;
    var l = loadSaved();
    if (window.JabioAccount.state().loading) { fail(W.isFa()?'حساب در حال بارگذاری است.':'Account is loading.', { code: 'validation' }); return; }
    if (!window.JabioAccount.state().authenticated && l.length >= SAVE_MAX) {
      fail(T('sv.full', N(SAVE_MAX)), {
        code: 'shortlist_full',
        primaryLabel: W.isFa() ? 'ورود یا ثبت‌نام' : 'Sign in / register',
        secondaryLabel: W.isFa() ? 'بستن' : 'Close',
        onPrimary: function () { location.href = '/login.html'; }
      });
      return;
    }
    var cm = byId[st.city];
    l.push({ q: W.toQuery(st), method: J.METHOD, city: st.city, type: d.type, name: W.placeText(d.place) || (d.lat.toFixed(4) + ', ' + d.lon.toFixed(4)),
      score: d.score, pop: d.pop, demand: d.demand, access: d.access, comp: d.comp, rivals: d.sameType, people: d.people, r: d.r });
    if(window.JabioAccount.state().authenticated) { btn.disabled=true; window.JabioAccount.add(l[l.length-1]).then(function(){renderSaved();}).catch(function(){fail(W.isFa()?'ذخیره در حساب انجام نشد.':'Could not save to account.', { code: 'network' });}).finally(function(){btn.disabled=false;}); return; }
    putSaved(l); renderSaved(); track('save', { city: st.city, type: d.type });
    var o = btn.textContent; btn.textContent = T('sv.saved'); setTimeout(function () { btn.textContent = T('sv.save'); }, 1600);
  }
  function renderSaved() {
    var box = $('savedBox'), l = loadSaved();
    if (!l.length) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    var h = '<h2>' + esc(T('sv.h')) + '</h2><p class="jb-note">' + esc(window.JabioAccount.state().authenticated ? (W.isFa()?'در حساب شما ذخیره شده است.':'Saved to your account.') : T('sv.note')) + '</p><div class="jb-rivals">' + l.map(function (it, i) {
      return '<div class="jb-rival"><span>' + esc(T('type.' + it.type)) + ' · ' + esc(W.cityName(byId[it.city])) + ' · ' + esc(it.name) + (it.method !== J.METHOD ? ' (' + esc(T('sv.old')) + ')' : '') + '</span>' +
        '<b><button type="button" class="jb-link" data-open="' + i + '">' + esc(T('sv.open')) + '</button> <button type="button" class="jb-link" data-del="' + i + '">' + esc(T('sv.del')) + '</button></b></div>';
    }).join('') + '</div>';
    box.innerHTML = h;
  }

  /* ── the map ───────────────────────────────────────────────────── */
  var STYLE = { dark: 'https://tiles.openfreemap.org/styles/dark', light: 'https://tiles.openfreemap.org/styles/liberty' };
  function themeNow() { return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function circle(lat, lon, r) {
    var pts = [], k = Math.cos(lat * Math.PI / 180);
    for (var i = 0; i <= 64; i++) { var a = i / 64 * 2 * Math.PI; pts.push([lon + Math.cos(a) * r / (111320 * k), lat + Math.sin(a) * r / 110574]); }
    return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [pts] } };
  }
  function fc(f) { return { type: 'FeatureCollection', features: f }; }
  function setData(id, data) {
    store[id] = data;
    var s = map && mapReady && map.getSource(id); if (s) s.setData(data || fc([]));
  }
  function addLayers() {
    ['dist', 'heat', 'hex', 'radius', 'places'].forEach(function (id) { if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: store[id] || fc([]) }); });
    if (!map.getLayer('heat')) map.addLayer({ id: 'heat', type: 'heatmap', source: 'heat', paint: { 'heatmap-weight': ['interpolate', ['linear'], ['get', 's'], 45, 0, 92, 1], 'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, .7, 14, 1.6], 'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 10, 12, 24, 14, 48], 'heatmap-opacity': .8 } });
    if (!map.getLayer('hex-fill')) {
      map.addLayer({ id: 'hex-fill', type: 'fill', source: 'hex', layout: { visibility: 'none' }, paint: { 'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], .82, .62] } });
      map.addLayer({ id: 'hex-line', type: 'line', source: 'hex', layout: { visibility: 'none' }, paint: { 'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 2.2, .85] } });
      map.addLayer({ id: 'hex-3d', type: 'fill-extrusion', source: 'hex', layout: { visibility: 'none' }, paint: {
        'fill-extrusion-height': ['interpolate', ['linear'], ['get', 's'], 20, 25, 45, 90, 60, 220, 75, 420, 92, 760],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': .84,
        'fill-extrusion-vertical-gradient': true
      } });
    }
    if (!map.getLayer('dist-fill')) {
      map.addLayer({ id: 'dist-fill', type: 'fill', source: 'dist', layout: { visibility: 'none' }, paint: { 'fill-opacity': .5, 'fill-color': ['case', ['<', ['get', 's'], 0], '#808080', ['step', ['get', 's'], '#5B607F', 46, '#8F95D8', 58, '#C2C3F5', 70, '#7CF2A8']] } });
      map.addLayer({ id: 'dist-line', type: 'line', source: 'dist', layout: { visibility: 'none' }, paint: { 'line-color': '#ffffff', 'line-width': 1.2, 'line-opacity': .7 } });
      map.on('click', 'dist-fill', function (e) { if (st.view === 'blocks' || !e.features.length) return; var id = e.features[0].properties.id; focusDistrict(id); var el = document.querySelector('.jb-drow[data-id="' + id + '"]'); if (el) reveal(el); });
    }
    if (!map.getLayer('radius-fill')) map.addLayer({ id: 'radius-fill', type: 'fill', source: 'radius', paint: { 'fill-opacity': .12 } });
    if (!map.getLayer('radius-line')) map.addLayer({ id: 'radius-line', type: 'line', source: 'radius', paint: { 'line-width': 2, 'line-dasharray': [2, 2] } });
    if (!map.getLayer('places')) map.addLayer({ id: 'places', type: 'circle', source: 'places', layout: { 'circle-sort-key': ['case', ['==', ['get', 'mine'], 1], 2, 1] }, paint: {
      'circle-radius': ['case', ['==', ['get', 'mine'], 1], 6.5, 4.2],
      'circle-color': ['match', ['get', 'b']].concat(Object.keys(W.BIZ_COLOR).reduce(function (a, k) { return a.concat([k, W.BIZ_COLOR[k]]); }, []), ['#999999']),
      'circle-stroke-width': ['case', ['==', ['get', 'mine'], 1], 2, 1.2], 'circle-opacity': .96 } });
    applyFilter();
    paint(); showLayers(); layer3d(); showView(); footLayer();
  }
  /* 3D buildings from the same OpenStreetMap-based tiles as the map (heights where mapped, about 2 storeys otherwise) */
  function layer3d() {
    var light = themeNow() === 'light', src = map.getStyle().sources && map.getStyle().sources.openmaptiles ? 'openmaptiles' : null;
    ['building-3d'].forEach(function (id) { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none'); });
    if (src && !map.getLayer('bld3d')) {
      map.addLayer({ id: 'bld3d', type: 'fill-extrusion', source: src, 'source-layer': 'building', minzoom: 13.5,
        paint: { 'fill-extrusion-color': light ? '#C9CEDA' : '#434A5E', 'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 7],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': .92, 'fill-extrusion-vertical-gradient': true } }, 'radius-fill');
    }
    if (map.getLayer('bld3d')) map.setLayoutProperty('bld3d', 'visibility', is3d ? 'visible' : 'none');
    var b = $('btn3d'); if (b) { b.setAttribute('aria-pressed', String(is3d)); }
    syncHexLayers();
  }
  function set3d(on, fly) {
    is3d = on; try { localStorage.setItem('ga_3d', on ? '1' : '0'); } catch (e) {}
    if (!map) return;
    if (mapReady) layer3d();
    var o = { pitch: on ? 60 : 0, duration: 900 };
    if (on && fly && st.point) { o.center = [st.point.lon, st.point.lat]; o.zoom = Math.max(map.getZoom(), 17); o.bearing = 20; }
    if (!on) o.bearing = 0;
    map.easeTo(o);
  }
  function Control3d() {}
  Control3d.prototype.onAdd = function () {
    var d = document.createElement('div'); d.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    d.innerHTML = '<button type="button" id="btn3d" class="jb-3d" aria-pressed="' + is3d + '"><b>3D</b></button>';
    d.firstChild.title = T('map.3d'); d.firstChild.setAttribute('aria-label', T('map.3d'));
    d.firstChild.addEventListener('click', function () { set3d(!is3d, true); });
    this._d = d; return d;
  };
  Control3d.prototype.onRemove = function () { this._d.remove(); };
  function paint() {
    var light = themeNow() === 'light', c = light ? '#5151C6' : '#C2C3F5';
    map.setPaintProperty('heat', 'heatmap-color', light ?
      ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(11,122,117,0)', .3, 'rgba(11,122,117,.25)', .6, 'rgba(81,81,198,.55)', 1, 'rgba(81,81,198,.9)'] :
      ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(172,247,240,0)', .25, 'rgba(172,247,240,.3)', .55, 'rgba(194,195,245,.6)', .85, 'rgba(217,242,199,.9)', 1, 'rgba(255,255,255,.95)']);
    var hexColor = light ?
      ['interpolate', ['linear'], ['get', 's'], 25, '#94A3B8', 45, '#7F84EC', 60, '#5151C6', 72, '#149B8E', 85, '#0E7A4B'] :
      ['interpolate', ['linear'], ['get', 's'], 25, '#3E436E', 45, '#6B6FD8', 60, '#9BA4F5', 72, '#38C9A5', 85, '#7CF2A8'];
    if (map.getLayer('hex-fill')) {
      map.setPaintProperty('hex-fill', 'fill-color', hexColor);
      map.setPaintProperty('hex-line', 'line-color', ['case', ['boolean', ['feature-state', 'hover'], false], light ? '#111113' : '#FFFFFF', light ? 'rgba(255,255,255,.72)' : 'rgba(11,12,16,.55)']);
      map.setPaintProperty('hex-line', 'line-opacity', ['case', ['boolean', ['feature-state', 'hover'], false], .95, .7]);
      if (map.getLayer('hex-3d')) map.setPaintProperty('hex-3d', 'fill-extrusion-color', hexColor);
    }
    map.setPaintProperty('places', 'circle-stroke-color', light ? '#FFFFFF' : '#0B0C10');
    map.setPaintProperty('radius-fill', 'fill-color', c); map.setPaintProperty('radius-line', 'line-color', c);
  }
  function showLayers() {
    if (!map || !mapReady || !map.getLayer('heat')) return;
    syncHexLayers();
    pins.forEach(function (p) { p.el.style.display = st.mode === 'areas' ? '' : 'none'; });
    if (spotMk) spotMk.getElement().style.display = st.mode === 'spot' ? '' : 'none';
  }
  function clearPins() { pins.forEach(function (p) { p.m.remove(); }); pins = []; }
  function drawAreas(res) {
    clearPins();
    setData('heat', fc(res.heat.map(function (h) { return { type: 'Feature', properties: { s: h[2] }, geometry: { type: 'Point', coordinates: [h[0], h[1]] } }; })));
    clearPlaces(); setData('radius', null);
    var b = new maplibregl.LngLatBounds();
    res.areas.forEach(function (a, i) {
      var el = document.createElement('div'); el.className = 'jb-pin'; el.textContent = N(i + 1);
      el.addEventListener('click', function (e) { e.stopPropagation(); focusArea(i); var c = document.querySelector('.jb-area[data-i="' + i + '"]'); if (c) reveal(c); });
      pins.push({ el: el, m: new maplibregl.Marker({ element: el }).setLngLat([a.lon, a.lat]).addTo(map) }); b.extend([a.lon, a.lat]);
    });
    if (res.areas.length) map.fitBounds(b, { padding: 90, maxZoom: 13.5, duration: 800 });
    showLayers();
  }
  function drawSpot(d) {
    if (spotMk) spotMk.remove();
    var el = document.createElement('div'); el.className = 'jb-spot';
    spotMk = new maplibregl.Marker({ element: el }).setLngLat([d.lon, d.lat]).addTo(map);
    setData('radius', circle(d.lat, d.lon, d.r));
    showPlaces(d.lat, d.lon, d.r, d.type);
    map.flyTo({ center: [d.lon, d.lat], zoom: Math.max(12.2, 15.2 - Math.log2(d.r / 500)), duration: 700 });
    showLayers();
  }
  function initMap() {
    if (typeof maplibregl === 'undefined') { fail(T('load.fail'), { code: 'map_unavailable' }); return; }
    maplibregl.setRTLTextPlugin(new URL('assets/vendor/mapbox-gl-rtl-text.min.js', location.href).href, true);
    var m = byId[st.city];
    map = new maplibregl.Map({ container: 'map', style: STYLE[themeNow()], center: [m.lon, m.lat], zoom: 11, attributionControl: true, pitchWithRotate: true, maxPitch: 75 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new ControlWide(), 'top-right');
    map.addControl(new Control3d(), 'top-right');
    map.addControl(new ControlHex(), 'top-right');
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('jb-wide')) setWide(false); });
    map.addControl(new ControlFoot(), 'top-right');
    map.on('load', function () { mapReady = true; addLayers(); });
    map.on('click', function (e) {
      if (st.mode === 'areas' && st.view !== 'blocks' && geo) return;          /* in a district view a click on a district is handled by its layer */
      var hit = mapReady && map.getLayer('places') ? map.queryRenderedFeatures([[e.point.x - 6, e.point.y - 6], [e.point.x + 6, e.point.y + 6]], { layers: ['places'] }) : [];
      if (hit.length) { placePopup(hit[0], e.lngLat); return; }
      var hLayer = is3d ? 'hex-3d' : 'hex-fill';
      if (hexOn && mapReady && map.getLayer(hLayer)) {
        var hHit = map.queryRenderedFeatures(e.point, { layers: [hLayer] });
        if (hHit.length) { hexPopup(hHit[0], e.lngLat); return; }
      }
      pickSpot(e.lngLat.lat, e.lngLat.lng);
    });
    map.on('mouseenter', 'places', function () { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'places', function () { map.getCanvas().style.cursor = ''; });
    ['hex-fill', 'hex-3d'].forEach(function (lid) {
      map.on('mousemove', lid, function (e) {
        if (!hexOn || !e.features || !e.features.length) return;
        map.getCanvas().style.cursor = 'pointer';
        var id = e.features[0].id;
        if (id != null && id !== hexHoverId) {
          clearHexHover();
          hexHoverId = id;
          if (map.getSource('hex')) map.setFeatureState({ source: 'hex', id: hexHoverId }, { hover: true });
        }
      });
      map.on('mouseleave', lid, function () {
        map.getCanvas().style.cursor = '';
        clearHexHover();
      });
    });
    document.addEventListener('ga-theme', function (e) {
      mapReady = false; map.setStyle(STYLE[e.detail], { diff: false });
      map.once('style.load', function () { mapReady = true; addLayers(); });
    });
  }

  /* ── businesses on the map, and the guide ──────────────────────── */
  function hiddenList() { return Object.keys(guide.hidden).filter(function (k) { return guide.hidden[k]; }); }
  function applyFilter() {
    if (map && mapReady && map.getLayer('places')) map.setFilter('places', ['!', ['in', ['get', 'b'], ['literal', hiddenList()]]]);
  }
  function clearPlaces() { guide.counts = null; guide.sel = null; setData('places', null); renderGuide(); }
  function showPlaces(lat, lon, r, type) {
    if (!C) return;
    var list = J.placesAround(C, lat, lon, r), counts = {};
    list.forEach(function (p) { counts[p.biz] = (counts[p.biz] || 0) + 1; });
    guide.counts = counts; guide.sel = type; guide.r = r;
    setData('places', fc(list.map(function (p) {
      return { type: 'Feature', properties: { b: p.biz, mine: p.biz === type ? 1 : 0, n: p.name || '', d: p.dist }, geometry: { type: 'Point', coordinates: [p.lon, p.lat] } };
    })));
    renderGuide();
  }
  /* mode changes: the places belong to what is in focus (the spot, or the chosen area) */
  function syncPlaces() {
    if (st.mode === 'spot' && st.point && C) showPlaces(st.point.lat, st.point.lon, st.r, st.spotType || st.type);
    else if (st.mode === 'areas' && last.areas && last.sel != null) { var a = last.areas[last.sel]; showPlaces(a.lat, a.lon, a.r, st.type); }
    else clearPlaces();
  }
  function placePopup(f, lngLat) {
    var p = f.properties, box = document.createElement('div'), dot = document.createElement('i'), t = document.createElement('div'), n = document.createElement('div'), d = document.createElement('div');
    box.style.cssText = 'font-size:13px;min-width:150px'; dot.style.cssText = 'display:inline-block;width:11px;height:11px;border-radius:50%;margin-inline-end:8px;background:' + W.BIZ_COLOR[p.b];
    t.style.cssText = 'font-weight:600;margin-bottom:4px'; t.appendChild(dot); t.appendChild(document.createTextNode(T('type.' + p.b)));
    n.textContent = p.n || T('deep.unnamed'); n.style.opacity = '.85';
    d.style.cssText = 'margin-top:4px;font-size:12px;opacity:.65'; d.textContent = T('leg.pop.dist', N(p.d));
    box.appendChild(t); box.appendChild(n); box.appendChild(d);
    new maplibregl.Popup({ maxWidth: '240px', offset: 8 }).setLngLat(lngLat).setDOMContent(box).addTo(map);
  }
  function renderGuide() {
    var el = $('mapGuide'); if (!el) return;
    var open = guide.open, spotMode = st.mode === 'spot';
    if (!open) {
      el.className = 'jb-guide closed';
      el.innerHTML = '<button type="button" class="lg-toggle" id="lgToggle" aria-expanded="false" aria-label="' + esc(T('leg.open')) + '" title="' + esc(T('leg.open')) + '"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="#ED4545"/><circle cx="16" cy="9" r="3" fill="#4588ED"/><circle cx="10" cy="16" r="3" fill="#45ED45"/></svg></button>';
      return;
    }
    el.className = 'jb-guide';
    var h = '<div class="lg-head"><b>' + esc(T('leg.h')) + '</b><button type="button" class="lg-toggle sm" id="lgToggle" aria-expanded="true" aria-label="' + esc(T('leg.close')) + '" title="' + esc(T('leg.close')) + '">×</button></div>';
    if (guide.counts) {
      h += '<div class="lg-sub">' + esc(T('leg.biz', N(guide.r))) + '</div><div class="lg-rows">' + W.legendRows(guide.counts, guide.sel, guide.hidden, true) + '</div><p class="lg-note">' + esc(T('leg.tap')) + ' ' + esc(T('leg.big')) + '</p>';
    } else {
      h += '<p class="lg-note">' + esc(T('leg.none')) + '</p>';
    }
    if (hexOn) h += '<div class="lg-sub">' + esc(T('hex.guide')) + '</div><div class="lg-hex-grad" dir="ltr"></div><div class="lg-scale" dir="ltr"><span>' + esc(T('hex.low')) + '</span><span>' + esc(T('hex.high')) + '</span></div><p class="lg-note">' + esc(T('hex.gnote', N(hexMeta ? hexMeta.diameterM : 1000))) + '</p>';
    if (foot && footOn) h += '<div class="lg-sub">' + esc(T('fp.guide')) + '</div><div class="lg-grad" dir="ltr"></div><div class="lg-scale" dir="ltr"><span>' + esc(T('fp.quiet')) + '</span><span>' + esc(T('fp.busy')) + '</span></div><p class="lg-note">' + esc(T('fp.gnote')) + '</p>';
    h += '<div class="lg-sub">' + esc(T('leg.symbols')) + '</div><ul class="lg-sym">';
    if (spotMode) h += '<li><span class="lg-spot"></span>' + esc(T('leg.spot')) + '</li><li><span class="lg-ring"></span>' + esc(T('leg.reach')) + '</li>' + (hexOn ? '<li><span class="lg-hex"></span>' + esc(T('hex.sym')) + '</li>' : '');
    else h += '<li><span class="lg-pin">1</span>' + esc(T('leg.area')) + '</li>' + (hexOn ? '<li><span class="lg-hex"></span>' + esc(T('hex.sym')) + '</li>' : '<li><span class="lg-heat"></span>' + esc(T('leg.heat')) + '</li>') + (guide.counts ? '<li><span class="lg-ring"></span>' + esc(T('leg.reach')) + '</li>' : '');
    h += '</ul>';
    el.innerHTML = h;
  }
  function wireGuide() {
    var el = $('mapGuide'); if (!el) return;
    el.addEventListener('click', function (e) {
      if (e.target.closest('#lgToggle')) { guide.open = !guide.open; renderGuide(); return; }
      var row = e.target.closest('.lg-row'); if (!row) return;
      var t = row.getAttribute('data-biz'); guide.hidden[t] = !guide.hidden[t]; applyFilter(); renderGuide();
    });
  }

  /* ── start ─────────────────────────────────────────────────────── */
  var pendingRestore = null;
  function syncTaxonomyFromEngine(engineType, conceptId) {
    var tax = window.GA_POI_TAXONOMY;
    if (!tax || !tax.findByEngineType) return;
    var mapped = tax.findByEngineType(engineType, conceptId);
    if (mapped) applyTaxonomySelection(mapped.mainId, mapped.subFa, mapped.subSubFa, conceptId !== undefined ? conceptId : '');
  }
  function restore(p) {
    st = Object.assign(st, p);
    syncTaxonomyFromEngine(st.type, st.sub || '');
    syncForm();
    pickSpot(p.point.lat, p.point.lon, true);
  }
  function redraw() {
    buildForm(); syncForm(); renderSaved();
    if (last.res) renderAreas();
    if (st.point && C) { last.ranked = J.rankTypes(C, st.point.lat, st.point.lon, opts()); renderSpot(); }
    [].forEach.call(document.querySelectorAll('.jb-pin'), function (el, i) { el.textContent = N(i + 1); });
    [['btnHex', 'hex.map'], ['btn3d', 'map.3d'], ['btnFoot', 'fp.map']].forEach(function (pair) {
      var btn = $(pair[0]); if (btn) { btn.title = T(pair[1]); btn.setAttribute('aria-label', T(pair[1])); }
    });
    renderGuide();
  }
  function quickStart() {
    var step = 0, panel = $('quickStart'), city = $('quickCity'), type = $('quickType');
    function options(preserve) {
      var selectedCity=preserve?city.value:st.city, selectedType=preserve?type.value:st.type;
      city.innerHTML = CITIES.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(W.cityName(c))+'</option>';}).join('');
      type.innerHTML = J.ORDER.map(function(t){return '<option value="'+esc(t)+'">'+esc(T('type.'+t))+'</option>';}).join('');
      city.value = selectedCity; type.value = selectedType;
    }
    function show() {
      ['quickCityStep','quickTypeStep','quickActionStep'].forEach(function(id,i){$(id).hidden = step !== i;});
      $('quickBack').hidden = step === 0; $('quickNext').hidden = step === 2;
      $('quickProgress').textContent = W.isFa() ? 'گام ' + N(step+1) + ' از ۳' : 'Step ' + (step+1) + ' of 3';
    }
    panel.addEventListener('toggle',function(){if(panel.open){options();show();}});
    $('quickNext').addEventListener('click',function(){if(step===0) {if(city.value!==st.city) {$('fCity').value=city.value; $('fCity').dispatchEvent(new Event('change'));}} else if(step===1){syncTaxonomyFromEngine(type.value, ''); syncForm(); if(hexOn) updateHex();}step=Math.min(step+1,2);show(); (step===1?type:$('quickFind')).focus();});
    $('quickBack').addEventListener('click',function(){step=Math.max(0,step-1);show();(step===0?city:type).focus();});
    $('quickFind').addEventListener('click',function(){panel.open=false;setMode('areas');runAreas(false);$('results').scrollIntoView({block:'nearest'});});
    $('quickSpot').addEventListener('click',function(){panel.open=false;setMode('spot');$('hintSpot').scrollIntoView({block:'nearest'});});
    document.addEventListener('ga-lang',function(){if(panel.open){options(true);show();}});
    options();show();
  }
  function start() {
    var sp = new URLSearchParams(location.search), q = W.fromQuery(location.search);
    if (sp.get('c') && byId[sp.get('c')]) st.city = sp.get('c');          /* a city link from the home or city hub page */
    if (!q && sp.get('t') && J.TYPES[sp.get('t')]) {
      st.type = sp.get('t'); st.spotType = sp.get('t');
      syncTaxonomyFromEngine(st.type, sp.get('sub') || '');
    } else if (!q) {
      applyTaxonomySelection('food_drink', 'کافه و کافی‌شاپ', '');
    }
    if (q && byId[q.city]) { st = Object.assign(st, q); syncTaxonomyFromEngine(st.type, st.sub || ''); pendingRestore = q; }
    buildForm(); wire(); wireGuide(); renderSaved(); quickStart();
    $('hintSpot').innerHTML = L('spot.hint');
    initMap(); renderGuide();
    /* the analysis needs the city data, not the basemap: start it now, so a slow map never delays it */
    if (pendingRestore) { var pr = pendingRestore; pendingRestore = null; restore(pr); }
    setMode(sp.get('m') === 'spot' ? 'spot' : 'areas');
    document.addEventListener('ga-lang', redraw);
    document.addEventListener('jabio-account',renderSaved);
    if (!q) {
      ensureCity().then(function () {
        if (sp.get('run') === '1' && sp.get('m') !== 'spot') runAreas();
      }).catch(function () {});
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.JABIO_UI = { map: function () { return map; }, guide: function () { return guide; }, state: function () { return st; }, pick: pickSpot, run: runAreas, setHex: setHex, hex: function () { return { on: hexOn, meta: hexMeta }; }, last: function () { return last; } };
})();
