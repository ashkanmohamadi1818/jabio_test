/* Decision tools share the scoring engine and existing browser-only saved format. */
(function () {
  'use strict';
  var J = window.Jabio, W = window.JW, cities = window.GA_CITIES, $ = function (id) { return document.getElementById(id); };
  var page = document.querySelector('[data-page]').dataset.page, KEY = 'ga_saved_v1', GUIDE = 'ga_field_guide_v1';
  var cityById = {}; cities.forEach(function (c) { cityById[c.id] = c; });
  function tr(en, fa) { return W.isFa() ? fa : en; }
  function esc(s) { return W.esc(String(s == null ? '' : s)); }
  function status(en, fa) { $('decisionStatus').textContent = tr(en, fa); }
  function showErr(code, en, fa) {
    status(en, fa);
  }
  function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch (e) { return fallback; } }
  function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { showErr('storage_unavailable', 'Browser storage is unavailable. Your changes could not be saved.', 'حافظه مرورگر در دسترس نیست؛ تغییرات ذخیره نشد.'); return false; } }
  function entries() { if (window.JabioAccount.state().authenticated) return window.JabioAccount.items(); var a = read(KEY, []); return Array.isArray(a) ? a : []; }
  function valid(it) { return it && typeof it.q === 'string' && W.fromQuery(it.q) && cityById[W.fromQuery(it.q).city]; }
  function link(q, report) { return (report ? 'report.html?' : 'jabio.html?m=spot&') + q; }
  function actions(q) {
    return '<div class="decision-actions">' +
      '<a class="ds-btn-tonal" href="' + esc(link(q)) + '">' + tr('Open analysis', 'باز کردن تحلیل') + '</a>' +
      '<a class="ds-btn-tonal" href="' + esc(link(q, true)) + '">' + tr('Report', 'گزارش') + '</a>' +
      '<a class="ds-btn-tonal" href="' + esc(link(q, true) + '&autoprint=1') + '">' + tr('Export PDF', 'خروجی PDF') + '</a>' +
      '</div>';
  }
  function options(values, selected) { return values.map(function (x) { return '<option value="'+esc(x[0])+'"'+(String(x[0])===String(selected)?' selected':'')+'>'+esc(x[1])+'</option>'; }).join(''); }
  function state(city, type, r, lat, lon) { return { city:city,type:type,r:r,point:{lat:lat,lon:lon},audience:[],priorities:[],strategy:'balance' }; }

  function renderSavedPrintSheet() {
    var sheet = $('savedPrintSheet');
    if (!sheet) return;
    var list = entries().filter(valid);
    var A = window.JabioAccount, st = A && A.state ? A.state() : {};
    var p = st.profile || (A && A.getCachedBranding ? A.getCachedBranding() : null) || {};
    var brandParts = [];
    if (p.accountType === 'organization' && p.organizationName) brandParts.push(p.organizationName);
    if (p.displayName) brandParts.push(p.displayName + (p.accountType === 'organization' && p.roleTitle ? ' (' + p.roleTitle + ')' : ''));
    else if (st.email) brandParts.push(st.email);
    var date = new Date().toLocaleDateString(W.isFa() ? 'fa-IR' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    var scores = list.map(function (x) { return typeof x.score === 'number' ? x.score : null; }).filter(function (n) { return n !== null; });
    var avg = scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : null;
    var best = scores.length ? Math.max.apply(null, scores) : null;
    var rowsHtml = list.map(function (it, idx) {
      var q = W.fromQuery(it.q);
      var city = W.cityName(cityById[q.city]);
      var type = W.T('type.' + q.type);
      return '<tr>' +
        '<td>' + W.N(idx + 1) + '</td>' +
        '<td><strong>' + esc(it.name || city) + '</strong>' + (it.notes ? '<div style="font-size:11px;color:#555;margin-top:3px">' + esc(it.notes) + '</div>' : '') + '</td>' +
        '<td>' + esc(city) + '</td>' +
        '<td>' + esc(type) + '</td>' +
        '<td>' + esc(W.N(q.r)) + (W.isFa() ? ' متر' : ' m') + '</td>' +
        '<td style="font-weight:700;font-variant-numeric:tabular-nums">' + (typeof it.score === 'number' ? esc(W.N(it.score)) : '—') + '</td>' +
        '<td dir="ltr" style="font-size:11px">' + esc(q.point.lat.toFixed(4) + ', ' + q.point.lon.toFixed(4)) + '</td>' +
        '</tr>';
    }).join('');
    sheet.innerHTML =
      '<div class="saved-print-head">' +
        '<div class="saved-print-meta">JABIO · ' + esc(date) + (brandParts.length ? ' · ' + esc((W.isFa() ? 'تهیه‌شده برای: ' : 'Prepared for: ') + brandParts.join(' · ')) : '') + '</div>' +
        '<h1>' + esc(tr('Saved Location Analyses Portfolio', 'گزارش جامع تحلیل‌های مکان ذخیره‌شده')) + '</h1>' +
      '</div>' +
      '<div class="saved-print-kpis">' +
        '<div class="saved-print-kpi"><small>' + esc(tr('Saved locations', 'تعداد تحلیل‌ها')) + '</small><strong>' + esc(W.N(list.length)) + '</strong></div>' +
        '<div class="saved-print-kpi"><small>' + esc(tr('Average score', 'میانگین امتیاز')) + '</small><strong>' + esc(avg !== null ? W.N(avg) : '—') + '</strong></div>' +
        '<div class="saved-print-kpi"><small>' + esc(tr('Top score', 'بالاترین امتیاز')) + '</small><strong>' + esc(best !== null ? W.N(best) : '—') + '</strong></div>' +
      '</div>' +
      '<table><thead><tr>' +
        '<th>#</th>' +
        '<th>' + esc(tr('Location & Notes', 'مکان و یادداشت')) + '</th>' +
        '<th>' + esc(tr('City', 'شهر')) + '</th>' +
        '<th>' + esc(tr('Category', 'دسته‌بندی')) + '</th>' +
        '<th>' + esc(tr('Radius', 'شعاع')) + '</th>' +
        '<th>' + esc(tr('Score', 'امتیاز')) + '</th>' +
        '<th>' + esc(tr('Coordinates', 'مختصات')) + '</th>' +
      '</tr></thead><tbody>' + rowsHtml + '</tbody></table>' +
      '<div class="saved-print-foot">' + esc(tr('Generated by Jabio Location Intelligence. Scores reflect the value recorded when each location was saved.', 'تولیدشده توسط سامانه هوش مکانی جابیو. امتیازها مطابق زمان ذخیره هر تحلیل ثبت شده‌اند.')) + '</div>';
  }

  function saved() {
    var term = $('savedSearch').value.toLocaleLowerCase(), all = entries(), shown = 0;
    $('savedList').innerHTML = all.map(function (it, i) {
      if (!valid(it)) return '<article class="decision-card"><h2>'+tr('Unreadable saved entry','تحلیل ذخیره‌شده نامعتبر')+'</h2><button class="ds-btn-tonal" data-delete="'+i+'">'+tr('Remove','حذف')+'</button></article>';
      var q = W.fromQuery(it.q), city = W.cityName(cityById[q.city]), name = String(it.name || city), type = W.T('type.'+q.type);
      if ((name+' '+city+' '+type+' '+(it.notes||'')).toLocaleLowerCase().indexOf(term)<0) return '';
      shown++;
      return '<article class="decision-card"><small>'+esc(city+' · '+type+' · '+W.N(q.r))+' m</small><h2>'+esc(name)+'</h2><p>'+tr('Saved score (not recalculated): ','امتیاز هنگام ذخیره (محاسبه مجدد نشده): ')+esc(typeof it.score==='number'?W.N(it.score):'—')+'</p>'+(it.notes?'<p class="saved-note-preview">'+esc(it.notes)+'</p>':'')+'<p>'+tr('Method: ','روش: ')+esc(it.method || '—')+(it.method!==J.METHOD?' · '+tr('Open to update using the current method.','برای محاسبه با روش فعلی باز کنید.'):'')+'</p><label>'+tr('Location name','نام مکان')+'<input maxlength="80" value="'+esc(name)+'" data-name="'+i+'"></label><div class="decision-actions"><button class="ds-btn-tonal" data-rename="'+i+'">'+tr('Save name','ذخیره نام')+'</button><button class="ds-btn-tonal" data-delete="'+i+'">'+tr('Remove','حذف')+'</button></div>'+actions(it.q)+'</article>';
    }).join('');
    if (!all.length || (!shown && all.every(valid))) $('savedList').innerHTML = '<div class="decision-empty"><h2>'+tr('No matching analyses','تحلیلی پیدا نشد')+'</h2><p>'+tr('Open a spot analysis and choose “Save this analysis” to start your shortlist.','برای ساخت فهرست، تحلیل یک نقطه را باز کن و «ذخیره این تحلیل» را بزن.')+'</p><a href="jabio.html">'+tr('Start an analysis','شروع تحلیل')+'</a></div>';
    renderSavedPrintSheet();
  }
  function accountControls() {
    var A=window.JabioAccount, st=A.state(), guest=read(KEY,[]), html='', hasValid=entries().some(valid);
    var printBtn = hasValid ? '<button class="ds-btn-primary" type="button" id="savedPrintBtn">' + tr('Print / Save Portfolio PDF', 'چاپ / خروجی PDF جامع') + '</button>' : '';
    if(st.loading) html=tr('Loading account…','در حال بارگذاری حساب…');
    else if(st.authenticated) {
      var label = (st.profile && st.profile.displayName) ? st.profile.displayName : st.email;
      html='<span>'+esc(label)+'</span><a class="ds-btn-tonal" href="/account">'+tr('My profile','پروفایل من')+'</a>'+printBtn+(Array.isArray(guest)&&guest.length?'<button class="ds-btn-tonal" id="accountImport">'+tr('Copy browser saves to account','کپی تحلیل‌های مرورگر به حساب')+'</button>':'')+'<button class="ds-btn-tonal" id="accountLogout">'+tr('Sign out','خروج')+'</button>';
    }
    else html='<a class="ds-btn-tonal" href="login.html">'+tr('Sign in or register','ورود یا ثبت‌نام')+'</a>'+printBtn+(st.unavailable?'<span>'+tr('Account service unavailable; guest storage is active.','سرویس حساب در دسترس نیست؛ ذخیره مهمان فعال است.')+'</span>':'');
    $('accountControls').innerHTML=html;
  }
  function initSaved() {
    var A=window.JabioAccount;
    $('savedSearch').addEventListener('input',saved);
    document.addEventListener('jabio-account',function(){saved();accountControls();});
    $('accountControls').addEventListener('click',async function(e){
      var b=e.target.closest('button');if(!b)return;
      if(b.id==='savedPrintBtn') { renderSavedPrintSheet(); window.print(); return; }
      b.disabled=true;
      try { if(b.id==='accountLogout') await A.logout(); else if(b.id==='accountImport') {var list=read(KEY,[]);for(var i=0;i<list.length;i++) {if(!A.items().some(function(x){return x.q===list[i].q;})) await A.add(list[i]);} status('Copied to your account. Browser copies remain.','به حساب کپی شد؛ نسخه مرورگر باقی مانده است.');} }
      catch(err){showErr('load_fail','Account update failed. Try again.','به‌روزرسانی حساب انجام نشد؛ دوباره تلاش کنید.');} finally {b.disabled=false;}
    });
    $('savedList').addEventListener('click',async function(e){
      var b=e.target.closest('button'); if(!b)return; var a=entries(), i, name;
      if(b.hasAttribute('data-delete')) { i=+b.dataset.delete; if(!confirm(tr('Remove this saved analysis?','این تحلیل ذخیره‌شده حذف شود؟')))return; }
      else if(b.hasAttribute('data-rename')) { i=+b.dataset.rename; var nameEl=document.querySelector('[data-name="'+i+'"]'); name=nameEl.value.trim(); if(!name) {showErr('validation','Enter a name.','نام مکان را وارد کن.',nameEl);return;} }
      else return;
      if(!a[i])return; b.disabled=true;
      try { if(A.state().authenticated) { if(b.hasAttribute('data-delete')) await A.remove(a[i].accountId); else await A.rename(a[i].accountId,name); }
        else {if(b.hasAttribute('data-delete')) a.splice(i,1);else a[i].name=name;if(!write(KEY,a))return;} saved();accountControls();status('Shortlist updated.','فهرست به‌روز شد.'); }
      catch(err){showErr('load_fail','Account update failed. Try again.','به‌روزرسانی حساب انجام نشد؛ دوباره تلاش کنید.');} finally {b.disabled=false;}
    }); saved();accountControls();
  }
  var running=false, compareVersion=0, compareMap=null, markers=[null,null], activePoint=0, mapAvailable=false, mapLoadFailed=false;
  function mapStyle() { return 'https://tiles.openfreemap.org/styles/' + (document.documentElement.getAttribute('data-theme') === 'light' ? 'liberty' : 'dark'); }
  function refreshConcept(selected) {
    var list=(window.GA_TAXONOMY.cats[$('type').value] || []);
    $('concept').innerHTML=options([['',tr('General category','دسته کلی')]].concat(list.map(function(x){return [x.id,W.isFa()?x.fa:x.en];})),selected||'');
  }
  function invalidate() { compareVersion++; $('comparison').innerHTML=''; if(running) status('Settings changed. Submit again after loading.','تنظیمات تغییر کرد؛ پس از بارگذاری دوباره مقایسه کن.'); }
  function mapMessage() {
    $('mapHint').textContent = !mapAvailable || mapLoadFailed ? tr('The map is unavailable. You can enter coordinates below.','نقشه در دسترس نیست. می‌توانی مختصات را پایین وارد کنی.') :
      tr('Click the map to set location ','برای انتخاب مکان روی نقشه بزن: ') + W.N(activePoint+1) + (activePoint===1 ? tr(' (or choose location 1 to change it).',' (برای تغییر مکان اول، دکمه آن را انتخاب کن).') : '.');
  }
  function choosePoint(i) {
    activePoint=i;
    document.querySelectorAll('[data-pick]').forEach(function(b){b.setAttribute('aria-pressed',String(+b.dataset.pick===i));});
    mapMessage();
  }
  function syncMarker(i) {
    if(markers[i]) { markers[i].remove(); markers[i]=null; }
    var lat=$('lat'+i).value,lon=$('lon'+i).value;
    if(!mapAvailable || !lat || !lon || !Number.isFinite(+lat) || !Number.isFinite(+lon) || Math.abs(+lat)>90 || Math.abs(+lon)>180) return;
    var el=document.createElement('button');el.type='button';el.className='compare-pin'+(i?' second':'');el.textContent=String(i+1);el.setAttribute('aria-label',tr('Select location ','انتخاب مکان ')+W.N(i+1));
    el.addEventListener('click',function(e){e.stopPropagation();choosePoint(i);});
    markers[i]=new maplibregl.Marker({element:el,anchor:'center'}).setLngLat([+lon,+lat]).addTo(compareMap);
  }
  function initMap() {
    try {
      if(typeof maplibregl==='undefined') throw new Error('Map library unavailable');
      var c=cityById[$('city').value];
      maplibregl.setRTLTextPlugin(new URL('assets/vendor/mapbox-gl-rtl-text.min.js',document.baseURI).href,true);
      compareMap=new maplibregl.Map({container:'compareMap',style:mapStyle(),center:[c.lon,c.lat],zoom:11});
      compareMap.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
      mapAvailable=true;mapMessage();
      compareMap.on('error',function(){if(!compareMap.isStyleLoaded()){mapLoadFailed=true;mapMessage();}});
      compareMap.on('style.load',function(){mapLoadFailed=false;mapMessage();});
      compareMap.on('click',function(e){
        var c=cityById[$('city').value],lat=e.lngLat.lat,lon=e.lngLat.lng;
        if(lat<c.s||lat>c.n||lon<c.w||lon>c.e){showErr('spot_outside','This point is outside the selected city data.','این نقطه خارج از محدوده داده شهر انتخاب‌شده است.');return;}
        $('lat'+activePoint).value=lat.toFixed(5);$('lon'+activePoint).value=lon.toFixed(5);syncMarker(activePoint);invalidate();
        status('Location selected.','مکان انتخاب شد.');
        if(activePoint===0&&!$('lat1').value&&!$('lon1').value) choosePoint(1); else mapMessage();
      });
      document.addEventListener('ga-theme',function(){compareMap.setStyle(mapStyle(),{diff:false});});
      syncMarker(0);syncMarker(1);
    } catch(e) { mapAvailable=false; mapMessage(); }
  }
  function initCompare() {
    var q=W.fromQuery(location.search), city=q&&cityById[q.city]?q.city:'tehran';
    $('city').innerHTML=options(cities.map(function(c){return[c.id,W.cityName(c)];}),city);
    $('type').innerHTML=options(J.ORDER.map(function(t){return[t,W.T('type.'+t)];}),q?q.type:'cafe');
    $('radius').innerHTML=options([500,1000,2000,3000].map(function(r){return[r,W.N(r)+' '+tr('metres','متر')];}),q?q.r:1000);
    refreshConcept(q&&q.sub);
    $('candidates').innerHTML=[0,1].map(function(i){
      return '<fieldset class="candidate"><legend>'+tr('Location ','مکان ')+W.N(i+1)+'</legend><button type="button" class="compare-select" data-pick="'+i+'" aria-pressed="'+String(i===0)+'"><span class="compare-badge'+(i?' second':'')+'">'+W.N(i+1)+'</span>'+tr('Select on map','انتخاب روی نقشه')+'</button><label>'+tr('Name (optional)','نام (اختیاری)')+'<input id="name'+i+'" maxlength="80"></label><label>'+tr('Latitude','عرض جغرافیایی')+'<input id="lat'+i+'" type="number" step="any" min="20" max="45" required></label><label>'+tr('Longitude','طول جغرافیایی')+'<input id="lon'+i+'" type="number" step="any" min="40" max="66" required></label></fieldset>';
    }).join('');
    if(q){$('lat0').value=q.point.lat;$('lon0').value=q.point.lon;activePoint=1;}
    $('candidates').addEventListener('click',function(e){var b=e.target.closest('[data-pick]');if(b){choosePoint(+b.dataset.pick);if(compareMap)$('compareMap').scrollIntoView({behavior:'smooth',block:'nearest'});}});
    $('compareForm').addEventListener('submit',compare);
    $('comparison').addEventListener('click',function(e){if(e.target.closest('[data-print-comparison]')) window.print();});
    $('compareForm').addEventListener('input',function(e){invalidate();if(/^lat[01]$|^lon[01]$/.test(e.target.id))syncMarker(+e.target.id.slice(-1));});
    $('type').addEventListener('change',function(){refreshConcept('');});
    $('city').addEventListener('change',function(){
      [0,1].forEach(function(i){$('lat'+i).value='';$('lon'+i).value='';$('name'+i).value='';syncMarker(i);});
      choosePoint(0);invalidate();var c=cityById[this.value];if(compareMap)compareMap.flyTo({center:[c.lon,c.lat],zoom:11});
      status('City changed; select both locations again.','شهر تغییر کرد؛ دو مکان را دوباره انتخاب کن.');
    });
    initMap();choosePoint(activePoint);
  }
  async function compare(e) {
    e.preventDefault();if(running)return;
    var rows=[], city=$('city').value, type=$('type').value,sub=$('concept').value,r=+$('radius').value;
    for(var i=0;i<2;i++){
      var la=$('lat'+i).value,lo=$('lon'+i).value;
      if(!la||!lo||!Number.isFinite(+la)||!Number.isFinite(+lo)){showErr('validation','Complete both coordinates for each location.','هر دو مختصات هر مکان را کامل کن.',$('lat'+i));return;}
      var q=state(city,type,r,+la,+lo);q.sub=sub;rows.push({name:$('name'+i).value.trim()||tr('Location ','مکان ')+W.N(i+1),q:q});
    }
    if(new Set(rows.map(function(x){return x.q.point.lat+','+x.q.point.lon;})).size!==rows.length){showErr('validation','Choose distinct locations.','مکان‌های متفاوت انتخاب کن.',$('lat1'));return;}
    var version=compareVersion;running=true;var btn=$('compareForm').querySelector('[type=submit]');btn.disabled=true;status('Calculating…','در حال محاسبه…');
    try {
      var C=await J.load(city);if(version!==compareVersion)return;
      rows.forEach(function(x){x.d=J.analyzePoint(C,x.q.point.lat,x.q.point.lon,x.q);if(!x.d)throw Error('outside');});
      var metrics=[['score','Score','امتیاز'],['people','Estimated residents','ساکنان تخمینی'],['demand','Demand index','شاخص تقاضا'],['access','Access index','شاخص دسترسی'],['sameType','Direct rivals','رقبای مستقیم'],['complete','Map completeness index','شاخص کامل‌بودن نقشه']];
      var h='<section class="decision-card compare-report"><div class="decision-actions"><button class="ds-btn-primary" type="button" data-print-comparison>'+tr('Print or save as PDF','چاپ یا ذخیره به‌صورت PDF')+'</button></div><h2>'+tr('Compare the evidence','مقایسه شواهد')+'</h2><p>'+esc(W.cityName(cityById[city])+' · '+W.T('type.'+type)+($('concept').selectedIndex ? ' · '+$('concept').selectedOptions[0].textContent : '')+' · '+W.N(r))+' m · '+esc(C.d.date)+' · '+esc(J.METHOD)+'</p><div class="decision-table-wrap" tabindex="0" role="region" aria-label="'+tr('Location comparison','مقایسه مکان‌ها')+'"><table><thead><tr><th scope="col">'+tr('Measure','معیار')+'</th>'+rows.map(function(x){return '<th scope="col">'+esc(x.name)+'</th>';}).join('')+'</tr></thead><tbody>';
      h+='<tr><th scope="row">'+tr('Coordinates','مختصات')+'</th>'+rows.map(function(x){return '<td dir="ltr">'+esc(x.q.point.lat.toFixed(5)+', '+x.q.point.lon.toFixed(5))+'</td>';}).join('')+'</tr>';
      metrics.forEach(function(m){h+='<tr><th scope="row">'+tr(m[1],m[2])+'</th>'+rows.map(function(x){return '<td'+(m[0]==='score'?' class="score"':'')+'>'+esc(W.N(x.d[m[0]]))+'</td>';}).join('')+'</tr>';});
      h+='<tr><th scope="row">'+tr('Plausible range','بازه محتمل')+'</th>'+rows.map(function(x){return '<td>'+W.N(x.d.range.low)+'–'+W.N(x.d.range.high)+'</td>';}).join('')+'</tr><tr><th>'+tr('Explore','بررسی بیشتر')+'</th>'+rows.map(function(x){return '<td>'+actions(W.toQuery(x.q))+'</td>';}).join('')+'</tr></tbody></table></div>';
      var overlap=rows.some(function(x,i){return rows.some(function(y,k){return k>i&&x.d.range.low<=y.d.range.high&&y.d.range.low<=x.d.range.high;});});
      h+='<aside class="decision-notice">'+(overlap?tr('Some ranges overlap. Small score differences are not a reliable basis for choosing.','بعضی بازه‌ها هم‌پوشانی دارند؛ اختلاف کم امتیاز مبنای قابل اتکایی برای انتخاب نیست.'):tr('These are model ranges, not statistical confidence intervals.','این بازه‌ها سناریوی مدل هستند، نه فاصله اطمینان آماری.'))+'</aside><p>'+tr('Indices are relative to this city, not probabilities of success. Fewer rivals alone is not better. Check rent, actual foot traffic and the quality of competitors on site.','شاخص‌ها نسبت به همین شهر هستند، نه احتمال موفقیت. رقیب کمتر به‌تنهایی بهتر نیست. اجاره، تردد واقعی و کیفیت رقبا را در محل بررسی کن.')+'</p>'+rows.map(function(x){return '<h3>'+esc(x.name)+'</h3><ul>'+x.d.risks.map(function(v){return '<li>'+esc(W.explain(v,'risk'))+'</li>';}).join('')+'</ul>';}).join('')+'<h3>'+tr('Field visit checklist','چک‌لیست بازدید میدانی')+'</h3><ul><li>'+tr('Compare rent, deposit and operating costs.','اجاره، ودیعه و هزینه‌های جاری را مقایسه کنید.')+'</li><li>'+tr('Observe foot traffic at different times and days.','تردد را در روزها و ساعت‌های مختلف بررسی کنید.')+'</li><li>'+tr('Check competitors, visibility, access and licences.','رقبا، دید ملک، دسترسی و مجوزها را بررسی کنید.')+'</li></ul></section>';
      $('comparison').innerHTML=h;status('Comparison ready.','مقایسه آماده است.');
    }catch(err){showErr(err.message==='outside'?'spot_outside':'load_fail',err.message==='outside'?'A location is outside this city’s data. Check coordinates.':'Could not load the city data. Try again.',err.message==='outside'?'یک مکان خارج از داده شهر است؛ مختصات را بررسی کن.':'بارگذاری داده شهر انجام نشد؛ دوباره تلاش کن.');}
    finally{running=false;btn.disabled=false;}
  }
  var examples=[['Vanak','ونک',35.757,51.410,'cafe','An office-oriented café','کافه با مخاطب کارمند','Visit at office arrival and lunch, then again after working hours. Compare weekday and weekend demand.','در شروع کار ادارات و ناهار، سپس بعد از ساعت کار بازدید کن؛ تقاضای روز کاری و تعطیل را مقایسه کن.'],['Enghelab','انقلاب',35.701,51.395,'cafe','A student-oriented café','کافه با مخاطب دانشجو','Check student budgets, exam periods, seating turnover and competing cafés. A university nearby does not guarantee spending.','بودجه دانشجو، فصل امتحان، گردش میز و کافه‌های رقیب را بررسی کن. نزدیکی دانشگاه فروش را تضمین نمی‌کند.'],['Narmak','نارمک',35.7373,51.5075,'grocery','A neighbourhood grocery','سوپرمارکت محلی','Walk the actual route from housing to the unit. Check street crossings, delivery access and daily competitors.','مسیر واقعی خانه‌ها تا ملک را پیاده برو؛ عبور از خیابان، بارگیری و رقبای خرید روزمره را بررسی کن.']];
  var exampleVersion=0;
  async function showExamples(){var version=++exampleVersion;$('exampleList').textContent=tr('Loading map data…','در حال بارگذاری داده نقشه…');try{var C=await J.load('tehran');if(version!==exampleVersion)return;$('exampleList').innerHTML=examples.map(function(x){var q=state('tehran',x[4],1000,x[2],x[3]),d=J.analyzePoint(C,x[2],x[3],q);return '<article class="decision-card"><small>'+esc(tr('Tehran · 1,000 m · ','تهران · ۱٬۰۰۰ متر · ')+C.d.date)+'</small><h2>'+esc(tr(x[0],x[1]))+'</h2><h3>'+esc(tr(x[5],x[6]))+'</h3>'+W.ring(d.score,90)+'<p>'+tr('Plausible range: ','بازه محتمل: ')+W.N(d.range.low)+'–'+W.N(d.range.high)+'</p><p>'+tr('General category analysis; the scenario is a field-research question, not a specialised concept setting.','تحلیل با دسته کلی انجام شده؛ سناریو پرسش بازدید میدانی است، نه تنظیم مفهوم تخصصی.')+'</p>'+W.bar(esc(W.T('m.demand')),d.demand,'')+W.bar(esc(W.T('m.access')),d.access,'')+'<h3>'+tr('What to verify','چه چیزی را بررسی کنیم')+'</h3><p>'+esc(tr(x[7],x[8]))+'</p>'+actions(W.toQuery(q))+'</article>';}).join('');}catch(e){if(version===exampleVersion)$('exampleList').textContent=tr('Could not load examples. Reload to retry.','بارگذاری نمونه‌ها انجام نشد؛ صفحه را دوباره باز کن.');}}
  function initGuide(){var g=read(GUIDE,{});if(!g||typeof g!=='object'||Array.isArray(g))g={};var checks=document.querySelectorAll('[data-check]');checks.forEach(function(c){c.checked=!!(g.checks&&g.checks[c.dataset.check]);c.addEventListener('change',save);});$('fieldNotes').value=typeof g.notes==='string'?g.notes:'';
    function progress(){$('guideProgress').textContent=W.N(Array.from(checks).filter(function(c){return c.checked;}).length)+' / '+W.N(checks.length)+' · '+tr('completed','تکمیل شده');}
    function save(){var a=Array.from(checks).map(function(c){return c.checked;});write(GUIDE,{checks:a,notes:$('fieldNotes').value});progress();}
    $('fieldNotes').addEventListener('input',save);$('printGuide').addEventListener('click',function(){window.print();});$('resetGuide').addEventListener('click',function(){if(!confirm(tr('Clear this checklist and field notes?','چک‌لیست و یادداشت‌ها پاک شوند؟')))return;checks.forEach(function(c){c.checked=false;});$('fieldNotes').value='';save();});progress();}
  if(page==='saved')initSaved();if(page==='compare')initCompare();if(page==='examples')showExamples();if(page==='guide')initGuide();
  document.addEventListener('ga-lang',function(){if(page==='saved'){saved();accountControls();}if(page==='examples')showExamples();if(page==='compare'){var v=[$('city').value,$('type').value,$('radius').value,$('concept').value];$('city').innerHTML=options(cities.map(function(c){return[c.id,W.cityName(c)];}),v[0]);$('type').innerHTML=options(J.ORDER.map(function(t){return[t,W.T('type.'+t)];}),v[1]);$('radius').innerHTML=options([500,1000,2000,3000].map(function(r){return[r,W.N(r)+' '+tr('metres','متر')];}),v[2]);refreshConcept(v[3]);document.querySelectorAll('.candidate').forEach(function(el,i){el.querySelector('legend').textContent=tr('Location ','مکان ')+W.N(i+1);var labels=el.querySelectorAll('label');[tr('Name (optional)','نام (اختیاری)'),tr('Latitude','عرض جغرافیایی'),tr('Longitude','طول جغرافیایی')].forEach(function(text,j){labels[j].firstChild.nodeValue=text;});});document.querySelectorAll('[data-pick]').forEach(function(b,i){b.innerHTML='<span class="compare-badge'+(i?' second':'')+'">'+W.N(i+1)+'</span>'+tr('Select on map','انتخاب روی نقشه');});[0,1].forEach(function(i){syncMarker(i);});mapMessage();invalidate();}if(page==='guide'){$('guideProgress').textContent=W.N(document.querySelectorAll('[data-check]:checked').length)+' / '+W.N(6)+' · '+tr('completed','تکمیل شده');}});
  window.addEventListener('storage',function(e){if(page==='saved'&&(e.key===KEY||e.key===null))saved();});
})();
