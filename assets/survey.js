/* Field survey: walk a district, record the shops that are not on the map, download a CSV for tools/import_places.py.
   Everything stays in this browser (localStorage); nothing is sent anywhere. */
(function () {
  'use strict';
  var J = window.Jabio, W = window.JW, esc = W.esc, N = W.N, $ = function (id) { return document.getElementById(id); };
  var KEY = 'ga_survey_v1', CITIES = window.GA_CITIES || [], byId = {};
  CITIES.forEach(function (c) { byId[c.id] = c; });
  var CAT = [
    ['restaurant', 'Restaurant / fast food', 'رستوران / فست‌فود'], ['cafe', 'Café / sweets / juice', 'کافه / شیرینی / آبمیوه'], ['grocery', 'Grocery / bakery / butcher', 'خواربار / نانوایی / قصابی'],
    ['fashion', 'Clothes / shoes / jewellery', 'پوشاک / کفش / طلا'], ['beauty', 'Salon / barber / cosmetics', 'آرایشگاه / لوازم آرایش'], ['pharmacy', 'Pharmacy', 'داروخانه'],
    ['clinic', 'Clinic / dentist / lab', 'مطب / دندانپزشکی / آزمایشگاه'], ['fitness', 'Gym / sports club', 'باشگاه ورزشی'], ['education', 'Training / language school', 'آموزشگاه'],
    ['retail', 'Other shop', 'مغازه‌ی دیگر'], ['mall', 'Shopping centre', 'مرکز خرید'], ['office', 'Office / company', 'دفتر / شرکت'], ['bank', 'Bank / exchange', 'بانک / صرافی'],
    ['school', 'School / kindergarten', 'مدرسه / مهدکودک'], ['civic', 'Government / library / post', 'اداره / کتابخانه / پست'], ['tourism', 'Hotel / museum', 'هتل / موزه'], ['leisure', 'Cinema / theatre', 'سینما / تئاتر']
  ];
  var S = {
    pick: ['Tap the map where the shop is, or use your location.', 'روی نقشه جای مغازه را بزن یا از مکان خودت استفاده کن.'],
    gps: ['Use my location', 'مکان من'], gpsFail: ['Could not get your location. Tap the map instead.', 'مکان تو پیدا نشد. روی نقشه بزن.'],
    saved: ['Saved', 'ذخیره شد'], dup: ['A {0} is already mapped within 30 m of here.', 'در ۳۰ متری اینجا یک «{0}» از قبل روی نقشه هست.'], dupAdd: ['Add anyway', 'با این حال اضافه کن'],
    list: ['Your places ({0})', 'جاهای ثبت‌شده‌ی تو ({0})'], none: ['Nothing yet.', 'هنوز چیزی ثبت نشده.'], del: ['Remove', 'حذف'],
    csv: ['Download CSV', 'دانلود CSV'], clear: ['Clear all', 'پاک‌کردن همه'], confirmClear: ['Remove all places you recorded?', 'همه‌ی جاهای ثبت‌شده حذف شود؟'], outside: ['That point is outside this city’s map.', 'این نقطه بیرون محدوده‌ی نقشه‌ی این شهر است.'],
    thin: ['Orange areas: many residents, few shops mapped. Start there.', 'مناطق نارنجی: جمعیت زیاد، مغازه‌ی ثبت‌شده کم. از آنجا شروع کن.'], loading: ['Loading {0}…', 'در حال بارگذاری {0}…']
  };
  function isFa() { return W.isFa(); }
  function t(k, a) { var v = S[k][isFa() ? 1 : 0]; return a == null ? v : v.replace('{0}', a); }
  function catName(id) { var c = CAT.filter(function (x) { return x[0] === id; })[0]; return c ? c[isFa() ? 2 : 1] : id; }

  var st = { city: 'tehran', pending: null }, C = null, map = null, ready = false, mk = null;
  function load() { try { var l = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(l) ? l : []; } catch (e) { return []; } }
  function save(l) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} }
  function mine() { return load().filter(function (x) { return x.city === st.city; }); }

  function build() {
    $('svCity').innerHTML = CITIES.map(function (c) { return '<option value="' + c.id + '">' + esc(isFa() ? c.fa : c.en) + '</option>'; }).join('');
    $('svCity').value = st.city;
    $('svCat').innerHTML = CAT.map(function (c) { return '<option value="' + c[0] + '">' + esc(c[isFa() ? 2 : 1]) + '</option>'; }).join('');
    $('svHint').textContent = t('pick'); $('svGps').textContent = t('gps'); $('svThin').textContent = t('thin');
    $('svCsvBtn').textContent = t('csv'); $('svClear').textContent = t('clear');
    renderList();
  }
  function fc(f) { return { type: 'FeatureCollection', features: f }; }
  function mineGeo() { return fc(mine().map(function (x) { return { type: 'Feature', properties: { c: x.category }, geometry: { type: 'Point', coordinates: [x.lon, x.lat] } }; })); }
  function renderList() {
    var l = mine(), box = $('svList');
    $('svListH').textContent = t('list', N(l.length));
    box.innerHTML = l.length ? l.map(function (x, i) {
      return '<div class="sv-row"><span><b>' + esc(x.name || '—') + '</b> · ' + esc(catName(x.category)) + '</span><button type="button" data-del="' + i + '">' + esc(t('del')) + '</button></div>';
    }).join('') : '<p class="sv-none">' + esc(t('none')) + '</p>';
    $('svCsvBtn').disabled = !l.length; $('svClear').disabled = !l.length;
    if (map && ready) map.getSource('mine').setData(mineGeo());
  }
  function setPending(lat, lon) {
    if (!C || J.cellOf(C, lat, lon) < 0) { showErr('spot_outside', t('outside')); return; }
    st.pending = { lat: lat, lon: lon };
    if (!mk) mk = new maplibregl.Marker({ color: '#C2C3F5' }).setLngLat([lon, lat]).addTo(map); else mk.setLngLat([lon, lat]);
    $('svForm').hidden = false; $('svWarn').hidden = true;
  }
  function flash(msg) { var m = $('svMsg'); m.textContent = msg; m.hidden = false; setTimeout(function () { m.hidden = true; }, 3500); }
  function showErr(code, msg) {
    flash(msg);
  }
  function near(cat, lat, lon) {
    return J.near(C, [cat], lat, lon, 30).length || mine().some(function (x) { return x.category === cat && J.metres(C, { lat: lat, lon: lon }, x) < 30; });
  }
  function add(force) {
    if (!st.pending) return;
    var cat = $('svCat').value;
    if (!force && near(cat, st.pending.lat, st.pending.lon)) { var w = $('svWarn'); w.innerHTML = esc(t('dup', catName(cat))) + ' <button type="button" id="svForce">' + esc(t('dupAdd')) + '</button>'; w.hidden = false; return; }
    var l = load(); l.push({ city: st.city, category: cat, lat: +st.pending.lat.toFixed(6), lon: +st.pending.lon.toFixed(6), name: $('svName').value.trim().slice(0, 36), t: Date.now() });
    save(l); $('svName').value = ''; $('svWarn').hidden = true; flash(t('saved')); renderList();
  }
  function csv() {
    var rows = ['category,lat,lon,name'].concat(mine().map(function (x) { return [x.category, x.lat, x.lon, '"' + String(x.name || '').replace(/"/g, '""') + '"'].join(','); }));
    var blob = new Blob(['﻿' + rows.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = st.city + '.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  /* squares where many people live but few shops are mapped (the engine's own completeness measure) */
  function thinGeo() {
    var cp = J._x.completeness(C), d = C.d, f = [], i, pop = C.L['@pop'];
    for (i = 0; i < C.n; i++) if (cp[i] < .4 && pop[i] > 0) {
      var iy = Math.floor(i / C.nx), ix = i % C.nx, s = d.s + iy * d.dLat, w = d.w + ix * d.dLon;
      f.push({ type: 'Feature', properties: { p: Math.round(cp[i] * 100) }, geometry: { type: 'Polygon', coordinates: [[[w, s], [w + d.dLon, s], [w + d.dLon, s + d.dLat], [w, s + d.dLat], [w, s]]] } });
    }
    return fc(f);
  }
  function knownGeo() {
    var f = []; Object.keys(C.d.poi).forEach(function (cat) { if (cat === 'transit' || cat === 'parking' || cat === 'park') return; var p = C.d.poi[cat]; for (var i = 0; i < p.length; i += 2) f.push({ type: 'Feature', properties: { c: cat }, geometry: { type: 'Point', coordinates: [p[i + 1] / 1e5, p[i] / 1e5] } }); });
    return fc(f);
  }
  function fillMap() {
    if (!map || !ready || !C) return;
    map.getSource('thin').setData(thinGeo()); map.getSource('known').setData(knownGeo()); map.getSource('mine').setData(mineGeo());
  }
  function openCity(id) {
    st.city = id; var m = byId[id]; if (map) map.flyTo({ center: [m.lon, m.lat], zoom: 12, duration: 800 });
    $('svMsg').textContent = t('loading', isFa() ? m.fa : m.en); $('svMsg').hidden = false;
    J.load(id).then(function (c) { C = c; $('svMsg').hidden = true; fillMap(); renderList(); }).catch(function () {
      $('svMsg').hidden = true;
      showErr('load_fail', isFa() ? 'بارگذاری نقشه این شهر انجام نشد.' : 'Could not load this city map.');
    });
  }
  function initMap() {
    var theme = document.documentElement.getAttribute('data-theme') === 'light' ? 'liberty' : 'dark';
    var m = byId[st.city];
    map = new maplibregl.Map({ container: 'svMap', style: 'https://tiles.openfreemap.org/styles/' + theme, center: [m.lon, m.lat], zoom: 12 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('style.load', function () {
      ['thin', 'known', 'mine'].forEach(function (id) { map.addSource(id, { type: 'geojson', data: fc([]) }); });
      map.addLayer({ id: 'thin', type: 'fill', source: 'thin', paint: { 'fill-color': '#FF9F43', 'fill-opacity': .28 } });
      map.addLayer({ id: 'known', type: 'circle', source: 'known', paint: { 'circle-radius': 2.6, 'circle-color': '#9AA3B5', 'circle-opacity': .85 } });
      map.addLayer({ id: 'mine', type: 'circle', source: 'mine', paint: { 'circle-radius': 6, 'circle-color': '#45ED45', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } });
      ready = true; fillMap();
    });
    document.addEventListener('ga-theme', function (e) {
      ready = false;
      map.setStyle('https://tiles.openfreemap.org/styles/' + (e.detail === 'light' ? 'liberty' : 'dark'), { diff: false });
    });
    map.on('click', function (e) { setPending(e.lngLat.lat, e.lngLat.lng); });
  }
  function start() {
    var q = new URLSearchParams(location.search).get('c'); if (q && byId[q]) st.city = q;
    build(); initMap(); openCity(st.city);
    $('svCity').addEventListener('change', function () { openCity(this.value); renderList(); });
    $('svAdd').addEventListener('click', function () { add(false); });
    $('svWarn').addEventListener('click', function (e) { if (e.target.id === 'svForce') add(true); });
    $('svGps').addEventListener('click', function () {
      if (!navigator.geolocation) { showErr('gps_failed', t('gpsFail')); return; }
      navigator.geolocation.getCurrentPosition(function (p) { map.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 18 }); setPending(p.coords.latitude, p.coords.longitude); }, function () { showErr('gps_failed', t('gpsFail')); }, { enableHighAccuracy: true, timeout: 15000 });
    });
    $('svList').addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]'); if (!b) return;
      var mineList = mine(), item = mineList[+b.getAttribute('data-del')], all = load(), i = all.findIndex(function (x) { return x.t === item.t && x.lat === item.lat && x.lon === item.lon; });
      if (i >= 0) { all.splice(i, 1); save(all); renderList(); }
    });
    $('svCsvBtn').addEventListener('click', csv);
    $('svClear').addEventListener('click', function () { if (confirm(t('confirmClear'))) { save(load().filter(function (x) { return x.city !== st.city; })); renderList(); } });
    document.addEventListener('ga-lang', build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.SURVEY = { map: function () { return map; }, point: setPending, city: function () { return C; } };
})();
