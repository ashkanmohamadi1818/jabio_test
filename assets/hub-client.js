/* Client interactivity for Jabio Hub pages: Cities filter, Blog filter & TOC, Pricing toggle & inquiry, Account Settings & Password Reset */
(function () {
  'use strict';

  function isFa() {
    return document.documentElement.lang === 'fa';
  }
  function tr(en, fa) {
    return isFa() ? fa : en;
  }
  function setMsg(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.className = 'hb-msg show ' + (kind || 'info');
  }

  /* ── 1. Cities directory filter ────────────────────────────────────── */
  var citySearch = document.getElementById('citySearch');
  var citiesGrid = document.getElementById('citiesGrid');
  if (citySearch && citiesGrid) {
    var activeCov = 'all';
    var cityCards = [].slice.call(citiesGrid.querySelectorAll('[data-city-card]'));
    var citiesEmpty = document.getElementById('citiesEmpty');
    var covBtns = [].slice.call(document.querySelectorAll('[data-cov-btn]'));

    function filterCities() {
      var q = citySearch.value.trim().toLowerCase();
      var shown = 0;
      cityCards.forEach(function (card) {
        var name = card.getAttribute('data-name') || '';
        var cov = card.getAttribute('data-cov') || '';
        var ok = (!q || name.indexOf(q) >= 0) && (activeCov === 'all' || cov === activeCov);
        card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (citiesEmpty) citiesEmpty.hidden = shown > 0;
    }

    citySearch.addEventListener('input', filterCities);
    covBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeCov = btn.getAttribute('data-cov-btn') || 'all';
        covBtns.forEach(function (b) { b.classList.toggle('on', b === btn); });
        filterCities();
      });
    });
  }

  /* ── 2. Blog directory filter ──────────────────────────────────────── */
  var blogSearch = document.getElementById('blogSearch');
  var blogGrid = document.getElementById('blogGrid');
  if (blogSearch && blogGrid) {
    var activeBlogCat = 'all';
    var blogCards = [].slice.call(document.querySelectorAll('[data-blog-card]'));
    var blogEmpty = document.getElementById('blogEmpty');
    var blogBtns = [].slice.call(document.querySelectorAll('[data-blog-cat]'));

    function filterBlog() {
      var q = blogSearch.value.trim().toLowerCase();
      var shown = 0;
      blogCards.forEach(function (card) {
        var text = card.getAttribute('data-q') || '';
        var cat = card.getAttribute('data-cat') || '';
        var ok = (!q || text.indexOf(q) >= 0) && (activeBlogCat === 'all' || cat === activeBlogCat);
        card.style.display = ok ? '' : 'none';
        if (ok) shown++;
      });
      if (blogEmpty) blogEmpty.hidden = shown > 0;
    }

    blogSearch.addEventListener('input', filterBlog);
    blogBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeBlogCat = btn.getAttribute('data-blog-cat') || 'all';
        blogBtns.forEach(function (b) { b.classList.toggle('on', b === btn); });
        filterBlog();
      });
    });
  }

  /* ── 3. Article reading progress & active TOC ──────────────────────── */
  var progressBar = document.getElementById('readProgress');
  var articleEl = document.querySelector('[data-reading-article]');
  if (progressBar && articleEl) {
    var tocLinks = [].slice.call(document.querySelectorAll('#articleToc a'));
    var headings = tocLinks.map(function (a) {
      return document.getElementById((a.getAttribute('href') || '').slice(1));
    }).filter(Boolean);

    function updateProgress() {
      var rect = articleEl.getBoundingClientRect();
      var total = Math.max(1, articleEl.offsetHeight - window.innerHeight * 0.65);
      var scrolled = Math.min(total, Math.max(0, -rect.top + 120));
      progressBar.style.width = ((scrolled / total) * 100).toFixed(1) + '%';

      var activeId = headings.length ? headings[0].id : '';
      headings.forEach(function (h) {
        if (h.getBoundingClientRect().top <= 140) activeId = h.id;
      });
      tocLinks.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
      });
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ── 3B. Interactive article checklist (saved per slug) ────────────── */
  var checklistBox = document.querySelector('[data-checklist-slug]');
  if (checklistBox) {
    var chkSlug = checklistBox.getAttribute('data-checklist-slug') || 'article';
    var storageKey = 'jabio_blog_chk_' + chkSlug;
    var chkInputs = [].slice.call(checklistBox.querySelectorAll('input[data-check-item]'));
    var chkCountEl = checklistBox.querySelector('[data-checklist-count]');
    var chkBarEl = checklistBox.querySelector('[data-checklist-bar]');
    var chkResetBtn = checklistBox.querySelector('[data-checklist-reset]');
    var faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    function toFaNum(n) {
      return String(n).replace(/\d/g, function (d) { return faDigits[Number(d)]; });
    }

    function loadSaved() {
      try {
        var raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : {};
      } catch (e) {
        return {};
      }
    }

    function saveState(map) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(map));
      } catch (e) { /* ignore quota errors */ }
    }

    function syncChecklistUI() {
      var done = 0;
      var total = chkInputs.length || 1;
      chkInputs.forEach(function (inp) {
        var row = inp.closest('.hb-check-item');
        if (inp.checked) done++;
        if (row) row.classList.toggle('is-done', inp.checked);
      });
      var pct = Math.round((done / total) * 100);
      if (chkBarEl) chkBarEl.style.width = pct + '%';
      if (chkCountEl) {
        var enText = done + ' of ' + total + ' done';
        var faText = toFaNum(done) + ' از ' + toFaNum(total) + ' مورد بررسی شد';
        chkCountEl.setAttribute('data-en', enText);
        chkCountEl.setAttribute('data-fa', faText);
        chkCountEl.textContent = isFa() ? faText : enText;
      }
    }

    var saved = loadSaved();
    chkInputs.forEach(function (inp) {
      var id = inp.getAttribute('data-check-item');
      if (id && saved[id]) inp.checked = true;
      inp.addEventListener('change', function () {
        var next = {};
        chkInputs.forEach(function (el) {
          var k = el.getAttribute('data-check-item');
          if (k && el.checked) next[k] = true;
        });
        saveState(next);
        syncChecklistUI();
      });
    });

    if (chkResetBtn) {
      chkResetBtn.addEventListener('click', function () {
        chkInputs.forEach(function (el) { el.checked = false; });
        saveState({});
        syncChecklistUI();
      });
    }

    document.addEventListener('ga-lang', syncChecklistUI);
    syncChecklistUI();
  }

  /* ── 4. Pricing monthly/annual toggle & inquiry form ───────────────── */
  var billingToggle = document.getElementById('billingToggle');
  var currentBilling = 'monthly';
  if (billingToggle) {
    var billBtns = [].slice.call(billingToggle.querySelectorAll('[data-billing]'));
    var priceEls = [].slice.call(document.querySelectorAll('[data-plan-price]'));
    var pqBilling = document.getElementById('pqBilling');

    function syncPrices() {
      var langKey = isFa() ? 'fa' : 'en';
      priceEls.forEach(function (el) {
        var val = el.getAttribute('data-' + currentBilling + '-' + langKey);
        if (val) {
          el.textContent = val;
          el.setAttribute('data-en', el.getAttribute('data-' + currentBilling + '-en') || '');
          el.setAttribute('data-fa', el.getAttribute('data-' + currentBilling + '-fa') || '');
        }
      });
      if (pqBilling) pqBilling.value = currentBilling;
    }

    billBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentBilling = btn.getAttribute('data-billing') === 'annual' ? 'annual' : 'monthly';
        billBtns.forEach(function (b) { b.classList.toggle('on', b === btn); });
        syncPrices();
      });
    });

    document.addEventListener('ga-lang', syncPrices);

    [].slice.call(document.querySelectorAll('[data-select-plan]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var planId = btn.getAttribute('data-select-plan');
        var sel = document.getElementById('pqPlan');
        if (sel && planId) sel.value = planId;
        var formSec = document.getElementById('pricing-inquiry');
        if (formSec) formSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var nameInput = document.getElementById('pqName');
        if (nameInput) setTimeout(function () { nameInput.focus(); }, 350);
      });
    });
  }

  var pricingForm = document.getElementById('pricingForm');
  if (pricingForm && window.JabioAccount) {
    var pqMsg = document.getElementById('pqMsg');
    pricingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (document.getElementById('pqName').value || '').trim();
      var email = (document.getElementById('pqEmail').value || '').trim();
      var plan = document.getElementById('pqPlan').value;
      var city = document.getElementById('pqCity').value;
      var note = (document.getElementById('pqNote').value || '').trim();
      var billing = (document.getElementById('pqBilling') || {}).value || 'monthly';

      if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMsg(pqMsg, tr('Please enter your name and a valid email address.', 'لطفاً نام و یک آدرس ایمیل معتبر وارد کنید.'), 'err', 'validation', document.getElementById('pqName'));
        return;
      }

      window.JabioAccount.submitPricingInquiry({ name: name, email: email, plan: plan, billing: billing, city: city, note: note })
        .then(function () {
          pricingForm.reset();
          setMsg(pqMsg, tr('Thank you! Your request has been recorded and our team will reply to your email.', 'درخواست شما با موفقیت ثبت شد. تیم جابیو ظرف یک روز کاری به ایمیل شما پاسخ می‌دهد.'), 'ok');
        })
        .catch(function (err) {
          var isRate = err && err.message === 'rate_limited';
          var txt = isRate
            ? tr('Too many requests. Please wait a few minutes and try again.', 'تعداد درخواست‌ها زیاد بوده است. چند دقیقه دیگر دوباره تلاش کنید.')
            : tr('Could not submit request. Please check your details and try again.', 'ثبت درخواست انجام نشد. لطفاً اطلاعات را بررسی کرده و دوباره تلاش کنید.');
          setMsg(pqMsg, txt, 'err', isRate ? 'rate_limited' : 'load_fail');
        });
    });
  }

  /* ── 5. Adaptive Account & Profile Workspace (/account) ────────────── */
  var accGuest = document.getElementById('accGuestCard');
  var accAuth = document.getElementById('accAuthView');
  var accLoading = document.getElementById('accLoadingCard');
  if (accGuest && accAuth && window.JabioAccount) {
    var tabs = [].slice.call(document.querySelectorAll('[data-acc-tab]'));
    var panels = [].slice.call(document.querySelectorAll('[data-acc-panel]'));
    var modeBtns = [].slice.call(document.querySelectorAll('[data-prof-mode]'));
    var selectedMode = 'personal';
    var selectedForPdf = {};
    var activeOtpChannel = 'email';
    var LOCAL_SAVED_KEY = 'ga_saved_v1';

    var cityMap = {};
    (window.GA_CITIES || []).forEach(function (c) { cityMap[c.id] = c; });

    function escH(s) {
      return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function toLatin(s) {
      var fa = '۰۱۲۳۴۵۶۷۸۹', ar = '٠١٢٣٤٥٦٧٨٩';
      return String(s || '')
        .replace(/[۰-۹]/g, function (d) { return String(fa.indexOf(d)); })
        .replace(/[٠-٩]/g, function (d) { return String(ar.indexOf(d)); });
    }
    function cityLabel(id) {
      var c = cityMap[id];
      if (!c) return id || '—';
      return isFa() ? (c.fa || c.en) : (c.en || c.fa);
    }
    function readLocalSaves() {
      try {
        var raw = JSON.parse(localStorage.getItem(LOCAL_SAVED_KEY) || '[]');
        return Array.isArray(raw) ? raw : [];
      } catch (e) { return []; }
    }
    function parseMetaFromQ(q) {
      try {
        var sp = new URLSearchParams(String(q || ''));
        return {
          city: sp.get('c') || sp.get('city') || 'tehran',
          type: sp.get('t') || sp.get('type') || 'cafe',
          lat: sp.get('la') || sp.get('lat') || '',
          lon: sp.get('lo') || sp.get('lon') || '',
          r: sp.get('r') || '1000'
        };
      } catch (e) {
        return { city: 'tehran', type: 'cafe', lat: '', lon: '', r: '1000' };
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-acc-tab');
        tabs.forEach(function (t) { t.classList.toggle('on', t === tab); });
        panels.forEach(function (p) { p.hidden = p.getAttribute('data-acc-panel') !== target; });
      });
    });

    function setProfileModeUI(mode) {
      selectedMode = mode === 'organization' ? 'organization' : 'personal';
      modeBtns.forEach(function (b) {
        var on = b.getAttribute('data-prof-mode') === selectedMode;
        b.classList.toggle('on', on);
        b.setAttribute('aria-checked', String(on));
      });
      var orgSec = document.getElementById('accOrgSection');
      if (orgSec) orgSec.hidden = selectedMode !== 'organization';
    }

    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setProfileModeUI(btn.getAttribute('data-prof-mode'));
      });
    });

    function buildPrintPortfolio(subset) {
      var st = window.JabioAccount.state();
      var prof = (st && st.profile) || {};
      var list = subset && subset.length ? subset : (window.JabioAccount.items() || []);
      var sheet = document.getElementById('accPrintPortfolio');
      if (!sheet) return;
      if (!list.length) {
        var msgEl = document.getElementById('accAnalysesMsg');
        if (msgEl) setMsg(msgEl, tr('Save at least one location analysis before printing a PDF portfolio.', 'ابتدا حداقل یک تحلیل مکان ذخیره کنید تا گزارش PDF آماده شود.'), 'info');
        return;
      }

      var scores = list.map(function (x) { return typeof x.score === 'number' ? x.score : null; }).filter(function (v) { return v !== null; });
      var avgScore = scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : '—';
      var uniqueCities = {};
      list.forEach(function (x) { uniqueCities[x.city || parseMetaFromQ(x.q).city] = true; });
      var dateStr = new Date().toLocaleDateString(isFa() ? 'fa-IR' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
      var ownerTitle = prof.accountType === 'organization' && prof.organizationName
        ? (prof.organizationName + (prof.displayName ? ' · ' + prof.displayName : '') + (prof.roleTitle ? ' (' + prof.roleTitle + ')' : ''))
        : ((prof.displayName || st.email || 'Jabio User'));

      var rowsHtml = list.map(function (it, idx) {
        var m = parseMetaFromQ(it.q);
        var coords = (m.lat && m.lon) ? (Number(m.lat).toFixed(4) + ', ' + Number(m.lon).toFixed(4)) : '—';
        var dt = it.updatedAt || it.createdAt;
        var dtFmt = dt ? new Date(dt).toLocaleDateString(isFa() ? 'fa-IR' : 'en-GB') : '—';
        return '<tr>' +
          '<td>' + (idx + 1) + '</td>' +
          '<td><strong>' + escH(it.name || cityLabel(m.city)) + '</strong>' + (it.notes ? '<div style="font-size:11px;color:#475569;margin-top:2px">' + escH(it.notes) + '</div>' : '') + '</td>' +
          '<td>' + escH(cityLabel(it.city || m.city)) + '</td>' +
          '<td>' + escH(it.type || m.type) + '</td>' +
          '<td><strong>' + (typeof it.score === 'number' ? escH(it.score) + ' / 100' : '—') + '</strong></td>' +
          '<td dir="ltr">' + escH(coords) + '</td>' +
          '<td>' + escH(dtFmt) + '</td>' +
          '</tr>';
      }).join('');

      sheet.innerHTML =
        '<div class="hb-pr-head">' +
          '<div>' +
            '<div class="hb-pr-brand">Jabio · ' + escH(tr('Saved Location Intelligence Portfolio', 'گزارش تجمیعی تحلیل‌های مکانی جابیو')) + '</div>' +
            '<div class="hb-pr-meta">' + escH(tr('Prepared for: ', 'تهیه‌شده برای: ') + ownerTitle) + (st.email ? ' · ' + escH(st.email) : '') + '</div>' +
            (prof.accountType === 'organization' && prof.industry ? '<div class="hb-pr-meta">' + escH(tr('Sector: ', 'حوزه فعالیت: ') + prof.industry) + '</div>' : '') +
          '</div>' +
          '<div class="hb-pr-meta" style="text-align:end">' +
            '<div>' + escH(tr('Report Date: ', 'تاریخ گزارش: ') + dateStr) + '</div>' +
            '<div>' + escH(tr('Total locations: ', 'تعداد نقاط: ') + list.length) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="hb-pr-summary">' +
          '<div class="hb-pr-kpi"><small>' + escH(tr('Locations Included', 'تعداد نقاط بررسی‌شده')) + '</small><b>' + list.length + '</b></div>' +
          '<div class="hb-pr-kpi"><small>' + escH(tr('Average Score', 'میانگین امتیاز')) + '</small><b>' + avgScore + '</b></div>' +
          '<div class="hb-pr-kpi"><small>' + escH(tr('Cities Covered', 'تعداد شهرها')) + '</small><b>' + Object.keys(uniqueCities).length + '</b></div>' +
        '</div>' +
        '<table class="hb-pr-table">' +
          '<thead><tr>' +
            '<th>#</th>' +
            '<th>' + escH(tr('Location Name & Notes', 'نام مکان و یادداشت')) + '</th>' +
            '<th>' + escH(tr('City', 'شهر')) + '</th>' +
            '<th>' + escH(tr('Category', 'دسته‌بندی')) + '</th>' +
            '<th>' + escH(tr('Score', 'امتیاز')) + '</th>' +
            '<th>' + escH(tr('Coordinates', 'مختصات')) + '</th>' +
            '<th>' + escH(tr('Saved Date', 'تاریخ ذخیره')) + '</th>' +
          '</tr></thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
        '<div class="hb-pr-foot">' +
          '<span>' + escH(tr('Generated by Jabio Location Intelligence', 'تولیدشده توسط سامانه هوش مکانی جابیو')) + '</span>' +
          '<span>' + escH(dateStr) + '</span>' +
        '</div>';

      sheet.setAttribute('aria-hidden', 'false');
      setTimeout(function () { window.print(); }, 60);
    }

    function renderAnalysesList() {
      var listEl = document.getElementById('accAnalysesList');
      if (!listEl) return;
      var searchEl = document.getElementById('accAnalysesSearch');
      var term = searchEl ? searchEl.value.trim().toLowerCase() : '';
      var all = window.JabioAccount.items() || [];
      var filtered = all.filter(function (it) {
        if (!term) return true;
        var m = parseMetaFromQ(it.q);
        var hay = ((it.name || '') + ' ' + cityLabel(it.city || m.city) + ' ' + (it.type || m.type) + ' ' + (it.notes || '')).toLowerCase();
        return hay.indexOf(term) >= 0;
      });

      if (!filtered.length) {
        listEl.innerHTML =
          '<div class="hb-empty-box">' +
            '<h3>' + escH(all.length ? tr('No matching analyses', 'تحلیل مطابقی پیدا نشد') : tr('No saved analyses yet', 'هنوز تحلیلی ذخیره نکرده‌اید')) + '</h3>' +
            '<p>' + escH(tr('Run a location analysis on the map and click “Save this analysis” to store it here and export PDF reports.', 'در ابزار نقشه یک نقطه را تحلیل کنید و گزینه «ذخیره این تحلیل» را بزنید تا در پروفایل شما ذخیره شود و خروجی PDF بگیرید.')) + '</p>' +
            '<a class="hb-btn hb-btn-primary" href="/jabio.html">' + escH(tr('Start your first analysis', 'شروع اولین تحلیل مکان')) + '</a>' +
          '</div>';
        return;
      }

      listEl.innerHTML = filtered.map(function (it) {
        var m = parseMetaFromQ(it.q);
        var id = it.accountId || it.id;
        var checked = selectedForPdf[id] ? ' checked' : '';
        var dt = it.updatedAt || it.createdAt;
        var dtFmt = dt ? new Date(dt).toLocaleDateString(isFa() ? 'fa-IR' : 'en-GB') : '';
        return '<article class="hb-anl-row" data-anl-id="' + escH(id) + '">' +
          '<div class="hb-anl-top">' +
            '<label class="hb-anl-check">' +
              '<input type="checkbox" data-pdf-check="' + escH(id) + '"' + checked + '>' +
              '<div>' +
                '<div class="hb-anl-name">' + escH(it.name || cityLabel(m.city)) + '</div>' +
                '<div class="hb-anl-meta">' + escH(cityLabel(it.city || m.city) + ' · ' + (it.type || m.type) + (dtFmt ? ' · ' + dtFmt : '')) + '</div>' +
              '</div>' +
            '</label>' +
            '<div class="hb-anl-score">' + (typeof it.score === 'number' ? escH(it.score) : '—') + '</div>' +
          '</div>' +
          '<div class="hb-anl-edit">' +
            '<input class="hb-input" type="text" maxlength="80" value="' + escH(it.name || '') + '" data-anl-name="' + escH(id) + '" aria-label="Analysis name">' +
            '<input class="hb-input" type="text" maxlength="200" value="' + escH(it.notes || '') + '" data-anl-notes="' + escH(id) + '" placeholder="' + escH(tr('Optional field note…', 'یادداشت اختیاری بازدید میدانی…')) + '">' +
            '<button type="button" class="hb-btn hb-btn-ghost hb-btn-sm" data-anl-save="' + escH(id) + '">' + escH(tr('Save', 'ذخیره')) + '</button>' +
          '</div>' +
          '<div class="hb-anl-actions">' +
            '<a class="hb-btn hb-btn-primary hb-btn-sm" href="/report.html?' + escH(it.q) + '&autoprint=1">' + escH(tr('Export PDF Report', 'خروجی PDF گزارش')) + '</a>' +
            '<a class="hb-btn hb-btn-ghost hb-btn-sm" href="/report.html?' + escH(it.q) + '">' + escH(tr('Preview report', 'مشاهده گزارش')) + '</a>' +
            '<a class="hb-btn hb-btn-ghost hb-btn-sm" href="/jabio.html?m=spot&' + escH(it.q) + '">' + escH(tr('Open on map', 'باز کردن روی نقشه')) + '</a>' +
            '<button type="button" class="hb-btn hb-btn-danger hb-btn-sm" data-anl-del="' + escH(id) + '">' + escH(tr('Delete', 'حذف')) + '</button>' +
          '</div>' +
        '</article>';
      }).join('');
    }

    function renderAccountView() {
      var st = window.JabioAccount.state();
      if (accLoading) accLoading.hidden = !st.loading;
      if (st.loading) return;

      var signedIn = Boolean(st && st.authenticated);
      accGuest.hidden = signedIn;
      accAuth.hidden = !signedIn;
      if (!signedIn) return;

      var prof = st.profile || {};
      var labelName = (prof.displayName || '').trim() || (st.email ? st.email.split('@')[0] : 'Jabio');
      var avatarEl = document.getElementById('accAvatar');
      if (avatarEl) {
        if (st.photoURL) {
          avatarEl.innerHTML = '<img src="' + escH(st.photoURL) + '" alt="' + escH(labelName) + '" referrerpolicy="no-referrer">';
        } else {
          avatarEl.textContent = labelName.charAt(0).toUpperCase();
        }
      }

      var heroNameEl = document.getElementById('accHeroName');
      if (heroNameEl) heroNameEl.textContent = labelName;
      var heroModeEl = document.getElementById('accHeroMode');
      if (heroModeEl) {
        heroModeEl.textContent = prof.accountType === 'organization'
          ? tr('Organization Profile', 'پروفایل سازمانی')
          : tr('Personal Profile', 'پروفایل شخصی');
      }

      var heroOrgEl = document.getElementById('accHeroOrg');
      if (heroOrgEl) {
        if (prof.accountType === 'organization' && (prof.organizationName || prof.roleTitle)) {
          heroOrgEl.hidden = false;
          heroOrgEl.textContent = [prof.organizationName, prof.roleTitle, prof.industry].filter(Boolean).join(' · ');
        } else {
          heroOrgEl.hidden = true;
        }
      }

      var metaEl = document.getElementById('accHeroMeta');
      if (metaEl) {
        var parts = [];
        if (st.email) parts.push('<span>' + escH(st.email) + (st.emailVerified ? ' ✓' : '') + '</span>');
        if (st.phoneDisplay) parts.push('<span dir="ltr">' + escH(st.phoneDisplay) + (st.phoneVerified ? ' ✓' : '') + '</span>');
        if (st.authProvider === 'google') parts.push('<span class="hb-status-text ok">' + escH(tr('Verified by Google', 'تاییدشده با گوگل')) + '</span>');
        metaEl.innerHTML = parts.join('');
      }

      var quickMap = document.getElementById('accQuickMap');
      if (quickMap && prof.preferredCity) {
        quickMap.href = '/jabio.html?c=' + encodeURIComponent(prof.preferredCity) + (prof.preferredCategory ? '&t=' + encodeURIComponent(prof.preferredCategory) : '');
      }

      // Sync form inputs
      setProfileModeUI(prof.accountType || 'personal');
      var fields = [
        ['accDisplayName', prof.displayName || ''],
        ['accPhone', st.phoneDisplay || st.phone || ''],
        ['accPreferredCity', prof.preferredCity || 'tehran'],
        ['accPreferredCategory', prof.preferredCategory || ''],
        ['accPreferredLang', prof.preferredLang || 'fa'],
        ['accOrgName', prof.organizationName || ''],
        ['accRoleTitle', prof.roleTitle || ''],
        ['accIndustry', prof.industry || ''],
        ['accBranchCount', prof.branchCount || '']
      ];
      fields.forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (el && !el.dataset.dirty) el.value = pair[1];
      });

      // Org metrics ribbon
      var items = window.JabioAccount.items() || [];
      var orgRibbon = document.getElementById('accOrgRibbon');
      if (orgRibbon) {
        orgRibbon.hidden = prof.accountType !== 'organization';
        if (prof.accountType === 'organization') {
          var scores = items.map(function (x) { return typeof x.score === 'number' ? x.score : null; }).filter(function (v) { return v !== null; });
          var avg = scores.length ? Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length) : '—';
          var cities = {};
          items.forEach(function (x) { cities[x.city || parseMetaFromQ(x.q).city] = true; });
          document.getElementById('orgStatCount').textContent = String(items.length);
          document.getElementById('orgStatAvg').textContent = String(avg);
          document.getElementById('orgStatCities').textContent = String(Object.keys(cities).length);
          document.getElementById('orgStatBranches').textContent = prof.branchCount || '—';
        }
      }

      // Saved analyses counts + local import button
      var countEl = document.getElementById('accSavedCount');
      if (countEl) countEl.textContent = String(items.length);
      var sumEl = document.getElementById('accSavedSummary');
      if (sumEl) {
        sumEl.textContent = tr(
          'You have ' + items.length + ' saved location analyses synced to your account.',
          'شما هم‌اکنون ' + items.length + ' تحلیل مکان ذخیره‌شده در حساب کاربری خود دارید.'
        );
      }
      var importBtn = document.getElementById('accImportLocalBtn');
      if (importBtn) {
        var localSaves = readLocalSaves();
        importBtn.hidden = !localSaves.length;
      }
      renderAnalysesList();

      // Security & verification tab
      var secEmailVal = document.getElementById('secEmailVal');
      var secEmailStatus = document.getElementById('secEmailStatus');
      var secVerifyEmailBtn = document.getElementById('secVerifyEmailBtn');
      if (secEmailVal) secEmailVal.textContent = st.email || '—';
      if (secEmailStatus) {
        secEmailStatus.textContent = st.emailVerified ? tr('Verified', 'تایید شده') : tr('Pending verification', 'در انتظار تایید');
        secEmailStatus.className = 'hb-status-text ' + (st.emailVerified ? 'ok' : 'warn');
      }
      if (secVerifyEmailBtn) {
        secVerifyEmailBtn.hidden = st.emailVerified || st.authProvider === 'google';
      }

      var secPhoneVal = document.getElementById('secPhoneVal');
      var secPhoneStatus = document.getElementById('secPhoneStatus');
      var secVerifyPhoneBtn = document.getElementById('secVerifyPhoneBtn');
      if (secPhoneVal) secPhoneVal.textContent = st.phoneDisplay || tr('Not set — add in Profile tab', 'ثبت نشده — در تب پروفایل اضافه کنید');
      if (secPhoneStatus) {
        if (!st.phone) {
          secPhoneStatus.textContent = '';
        } else {
          secPhoneStatus.textContent = st.phoneVerified ? tr('Verified', 'تایید شده') : tr('Not verified yet', 'هنوز تایید نشده');
          secPhoneStatus.className = 'hb-status-text ' + (st.phoneVerified ? 'ok' : 'warn');
        }
      }
      if (secVerifyPhoneBtn) {
        secVerifyPhoneBtn.hidden = !st.phone || st.phoneVerified || st.authProvider === 'google';
      }

      var secProviderVal = document.getElementById('secProviderVal');
      if (secProviderVal) {
        secProviderVal.textContent = st.authProvider === 'google'
          ? tr('Google Account (Firebase Auth + Cloud Firestore)', 'حساب گوگل (تایید واقعی فایربیس و دیتابیس ابری)')
          : tr('Email / Mobile Phone + Password', 'ایمیل یا شماره موبایل + رمز عبور');
      }

      var isGoogle = st.authProvider === 'google';
      var pwWrap = document.getElementById('secPasswordWrap');
      var gNote = document.getElementById('secGoogleNote');
      if (pwWrap) pwWrap.hidden = isGoogle;
      if (gNote) gNote.hidden = !isGoogle;
      var delPwWrap = document.getElementById('accDelPwWrap');
      if (delPwWrap) delPwWrap.hidden = isGoogle;
    }

    window.JabioAccount.ready.then(renderAccountView);
    document.addEventListener('jabio-account', renderAccountView);
    document.addEventListener('ga-lang', renderAccountView);

    // Save adaptive profile
    var profileForm = document.getElementById('accProfileForm');
    if (profileForm) {
      profileForm.addEventListener('input', function (e) {
        if (e.target && e.target.id) e.target.dataset.dirty = '1';
      });
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = document.getElementById('accProfileMsg');
        var payload = {
          accountType: selectedMode,
          displayName: (document.getElementById('accDisplayName').value || '').trim(),
          phone: (document.getElementById('accPhone').value || '').trim(),
          preferredCity: document.getElementById('accPreferredCity').value,
          preferredCategory: document.getElementById('accPreferredCategory').value,
          preferredLang: document.getElementById('accPreferredLang').value,
          organizationName: (document.getElementById('accOrgName').value || '').trim(),
          roleTitle: (document.getElementById('accRoleTitle').value || '').trim(),
          industry: (document.getElementById('accIndustry').value || '').trim(),
          branchCount: (document.getElementById('accBranchCount').value || '').trim()
        };
        window.JabioAccount.updateProfile(payload)
          .then(function () {
            [].forEach.call(profileForm.querySelectorAll('[data-dirty]'), function (el) { delete el.dataset.dirty; });
            if (window.GA_LANG && payload.preferredLang && payload.preferredLang !== document.documentElement.lang) {
              window.GA_LANG.apply(payload.preferredLang);
            }
            setMsg(msg, tr('Profile settings saved successfully.', 'تغییرات پروفایل با موفقیت ذخیره شد.'), 'ok');
          })
          .catch(function (err) {
            var code = err && err.message;
            var txt = code === 'invalid_phone'
              ? tr('Enter a valid mobile number (e.g. 09123456789).', 'شماره موبایل معتبر وارد کنید (مثلاً 09123456789).')
              : code === 'phone_exists'
                ? tr('This mobile number is already used by another account.', 'این شماره موبایل قبلاً به حساب دیگری متصل شده است.')
                : tr('Could not save profile changes.', 'ذخیره تغییرات پروفایل انجام نشد.');
            setMsg(msg, txt, 'err', code || 'load_fail');
          });
      });
    }

    // Saved analyses search, rename/note, delete, PDF selection & portfolio export
    var searchInput = document.getElementById('accAnalysesSearch');
    if (searchInput) searchInput.addEventListener('input', renderAnalysesList);

    var analysesList = document.getElementById('accAnalysesList');
    if (analysesList) {
      analysesList.addEventListener('change', function (e) {
        var chk = e.target.closest('[data-pdf-check]');
        if (chk) selectedForPdf[chk.getAttribute('data-pdf-check')] = chk.checked;
      });
      analysesList.addEventListener('click', function (e) {
        var saveBtn = e.target.closest('[data-anl-save]');
        var delBtn = e.target.closest('[data-anl-del]');
        var msg = document.getElementById('accAnalysesMsg');
        if (saveBtn) {
          var id = saveBtn.getAttribute('data-anl-save');
          var nameIn = analysesList.querySelector('[data-anl-name="' + id + '"]');
          var noteIn = analysesList.querySelector('[data-anl-notes="' + id + '"]');
          var nextName = nameIn ? nameIn.value.trim() : '';
          if (!nextName) {
            setMsg(msg, tr('Location name cannot be empty.', 'نام مکان نمی‌تواند خالی باشد.'), 'err', 'validation', nameIn);
            return;
          }
          saveBtn.disabled = true;
          window.JabioAccount.updateAnalysis(id, { name: nextName, notes: noteIn ? noteIn.value.trim() : '' })
            .then(function () { setMsg(msg, tr('Analysis updated.', 'تغییرات تحلیل ذخیره شد.'), 'ok'); })
            .catch(function () { setMsg(msg, tr('Could not update analysis.', 'به‌روزرسانی تحلیل انجام نشد.'), 'err', 'load_fail'); })
            .finally(function () { saveBtn.disabled = false; });
        } else if (delBtn) {
          var did = delBtn.getAttribute('data-anl-del');
          delBtn.disabled = true;
          window.JabioAccount.remove(did)
            .then(function () {
              delete selectedForPdf[did];
              setMsg(msg, tr('Analysis removed from your account.', 'تحلیل از حساب کاربری حذف شد.'), 'ok');
            })
            .catch(function () { setMsg(msg, tr('Could not remove analysis.', 'حذف تحلیل انجام نشد.'), 'err', 'load_fail'); })
            .finally(function () { delBtn.disabled = false; });
        }
      });
    }

    function exportSelectedOrAllPdf() {
      var all = window.JabioAccount.items() || [];
      var picked = all.filter(function (x) { return selectedForPdf[x.accountId || x.id]; });
      buildPrintPortfolio(picked.length ? picked : all);
    }
    var quickPdfBtn = document.getElementById('accQuickPdfBtn');
    if (quickPdfBtn) quickPdfBtn.addEventListener('click', exportSelectedOrAllPdf);
    var printPortBtn = document.getElementById('accPrintPortfolioBtn');
    if (printPortBtn) printPortBtn.addEventListener('click', exportSelectedOrAllPdf);

    var importBtnEl = document.getElementById('accImportLocalBtn');
    if (importBtnEl) {
      importBtnEl.addEventListener('click', async function () {
        var local = readLocalSaves();
        var existing = window.JabioAccount.items() || [];
        var msg = document.getElementById('accAnalysesMsg');
        importBtnEl.disabled = true;
        var added = 0;
        try {
          for (var i = 0; i < local.length; i++) {
            var it = local[i];
            if (it && it.q && !existing.some(function (x) { return x.q === it.q; })) {
              await window.JabioAccount.add(it);
              added++;
            }
          }
          setMsg(msg, tr(added + ' saved analyses imported to your account.', added + ' تحلیل از مرورگر به حساب کاربری شما منتقل شد.'), 'ok');
        } catch (err) {
          setMsg(msg, tr('Import failed. Please try again.', 'انتقال تحلیل‌ها انجام نشد.'), 'err', 'load_fail');
        } finally {
          importBtnEl.disabled = false;
        }
      });
    }

    // Security tab: inline Email / Phone OTP verification
    function openOtpFlow(channel) {
      activeOtpChannel = channel;
      var box = document.getElementById('secOtpBox');
      var title = document.getElementById('secOtpTitle');
      var prevBox = document.getElementById('secOtpPreview');
      var prevLbl = document.getElementById('secOtpPreviewLabel');
      var prevCode = document.getElementById('secOtpPreviewCode');
      var otpMsg = document.getElementById('secOtpMsg');
      box.hidden = false;
      title.textContent = channel === 'phone'
        ? tr('Verify your mobile number via 6-digit SMS code', 'تایید شماره موبایل با کد پیامکی ۶ رقمی')
        : tr('Verify your email via 6-digit code', 'تایید ایمیل با کد ۶ رقمی');
      setMsg(otpMsg, tr('Sending verification code…', 'در حال ارسال کد تایید…'), 'info');
      window.JabioAccount.requestVerification(channel)
        .then(function (res) {
          if (res && res.previewCode) {
            prevBox.hidden = false;
            prevLbl.textContent = channel === 'phone'
              ? tr('SMS key not set — test code:', 'کلید پیامک تنظیم نشده — کد آزمایشی:')
              : tr('SMTP not set — test code:', 'کلید SMTP تنظیم نشده — کد آزمایشی:');
            prevCode.textContent = res.previewCode;
            setMsg(otpMsg, tr('Enter the 6-digit code shown above.', 'کد ۶ رقمی نمایش‌داده‌شده را وارد و تایید کنید.'), 'info');
          } else {
            prevBox.hidden = true;
            setMsg(otpMsg, tr('Verification code sent. Enter it below within 15 minutes.', 'کد تایید ارسال شد. آن را ظرف ۱۵ دقیقه وارد کنید.'), 'ok');
          }
        })
        .catch(function (err) {
          var isRate = err && err.message === 'rate_limited';
          setMsg(otpMsg, isRate
            ? tr('Too many requests. Wait a few minutes.', 'تعداد درخواست‌ها زیاد است؛ کمی صبر کنید.')
            : tr('Could not send verification code.', 'ارسال کد تایید انجام نشد.'), 'err', isRate ? 'rate_limited' : 'load_fail');
        });
    }

    var vEmailBtn = document.getElementById('secVerifyEmailBtn');
    if (vEmailBtn) vEmailBtn.addEventListener('click', function () { openOtpFlow('email'); });
    var vPhoneBtn = document.getElementById('secVerifyPhoneBtn');
    if (vPhoneBtn) vPhoneBtn.addEventListener('click', function () { openOtpFlow('phone'); });

    var secOtpForm = document.getElementById('secOtpForm');
    if (secOtpForm) {
      secOtpForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var otpInp = document.getElementById('secOtpInput');
        var code = toLatin(otpInp.value).replace(/\s+/g, '');
        var otpMsg = document.getElementById('secOtpMsg');
        if (!/^\d{6}$/.test(code)) {
          setMsg(otpMsg, tr('Enter the 6-digit verification code.', 'کد ۶ رقمی را کامل وارد کنید.'), 'err', 'invalid_code', otpInp);
          return;
        }
        window.JabioAccount.confirmVerification(activeOtpChannel, code)
          .then(function () {
            secOtpForm.reset();
            setMsg(otpMsg, tr('Verified successfully!', 'تایید هویت با موفقیت انجام شد!'), 'ok');
            setTimeout(function () { document.getElementById('secOtpBox').hidden = true; }, 1200);
          })
          .catch(function (err) {
            setMsg(otpMsg, tr('Code is invalid or expired.', 'کد واردشده نامعتبر یا منقضی است.'), 'err', err && err.message === 'expired_code' ? 'expired_code' : 'invalid_code', otpInp);
          });
      });
    }

    var pwForm = document.getElementById('accPasswordForm');
    if (pwForm) {
      pwForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = document.getElementById('accPwMsg');
        var cur = document.getElementById('accCurPw').value;
        var nw = document.getElementById('accNewPw').value;
        var nw2 = document.getElementById('accNewPw2').value;
        if (!cur || nw.length < 10) {
          setMsg(msg, tr('Enter your current password and a new password of at least 10 characters.', 'رمز فعلی و رمز جدید حداقل ۱۰ کاراکتری را وارد کنید.'), 'err', 'invalid_password', !cur ? document.getElementById('accCurPw') : document.getElementById('accNewPw'));
          return;
        }
        if (nw !== nw2) {
          setMsg(msg, tr('New passwords do not match.', 'تکرار رمز عبور جدید مطابقت ندارد.'), 'err', 'validation', document.getElementById('accNewPw2'));
          return;
        }
        window.JabioAccount.changePassword(cur, nw)
          .then(function () {
            pwForm.reset();
            setMsg(msg, tr('Password updated successfully and your session has been refreshed.', 'رمز عبور با موفقیت تغییر کرد و نشست شما تازه‌سازی شد.'), 'ok');
          })
          .catch(function (err) {
            var code = err && err.message;
            var m = code === 'invalid_credentials'
              ? tr('Current password is incorrect.', 'رمز عبور فعلی نادرست است.')
              : code === 'invalid_password'
                ? tr('Choose a stronger, non-numeric password of at least 10 characters.', 'رمز عبور جدید باید حداقل ۱۰ کاراکتر، غیرعددی و غیرمعمول باشد.')
                : tr('Could not update password.', 'تغییر رمز عبور انجام نشد.');
            setMsg(msg, m, 'err', code || 'load_fail');
          });
      });
    }

    var signOutBtn = document.getElementById('accSignOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', function () {
        window.JabioAccount.logout().then(function () { location.href = '/'; });
      });
    }

    var delForm = document.getElementById('accDeleteForm');
    if (delForm) {
      delForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = document.getElementById('accDelMsg');
        var st = window.JabioAccount.state();
        var pwInput = document.getElementById('accDelPw');
        var pw = pwInput.value;
        if (st.authProvider !== 'google' && !pw) {
          setMsg(msg, tr('Please enter your current password to confirm deletion.', 'برای تایید حذف حساب، رمز عبور فعلی خود را وارد کنید.'), 'err', 'invalid_credentials', pwInput);
          return;
        }
        window.JabioAccount.deleteAccount(pw)
          .then(function () {
            setMsg(msg, tr('Your account has been permanently deleted. Redirecting…', 'حساب کاربری شما با موفقیت حذف شد. در حال انتقال…'), 'ok');
            setTimeout(function () { location.href = '/'; }, 1200);
          })
          .catch(function (err) {
            var code = err && err.message;
            var m = code === 'invalid_credentials'
              ? tr('Incorrect password.', 'رمز عبور واردشده نادرست است.')
              : tr('Could not delete account.', 'حذف حساب ممکن نشد.');
            setMsg(msg, m, 'err', code || 'load_fail', pwInput);
          });
      });
    }
  }

  /* ── 6. Dual-Channel Forgot Password Flow (/forgot-password) ───────── */
  var resetReqForm = document.getElementById('resetReqForm');
  var resetConfirmForm = document.getElementById('resetConfirmForm');
  if (resetReqForm && resetConfirmForm && window.JabioAccount) {
    var chBtns = [].slice.call(document.querySelectorAll('[data-reset-channel]'));
    var idInput = document.getElementById('rsIdentifier');
    var idLabel = document.getElementById('rsIdentifierLabel');
    var previewBox = document.getElementById('rsPreviewBox');
    var previewLbl = document.getElementById('rsPreviewLabel');
    var previewCode = document.getElementById('rsPreviewCode');
    var activeChannel = (document.querySelector('[data-initial-channel]') || {}).getAttribute
      ? (document.querySelector('[data-initial-channel]').getAttribute('data-initial-channel') || 'email')
      : 'email';

    function toLatinDigits(s) {
      var fa = '۰۱۲۳۴۵۶۷۸۹', ar = '٠١٢٣٤٥٦٧٨٩';
      return String(s || '')
        .replace(/[۰-۹]/g, function (d) { return String(fa.indexOf(d)); })
        .replace(/[٠-٩]/g, function (d) { return String(ar.indexOf(d)); });
    }
    function validPhone(v) {
      var c = toLatinDigits(v).replace(/[\s\-().]/g, '');
      return /^(09\d{9}|9\d{9}|00989\d{9}|989\d{9}|\+989\d{9}|\+[1-9]\d{8,14})$/.test(c);
    }
    function setChannel(ch) {
      activeChannel = ch === 'phone' ? 'phone' : 'email';
      chBtns.forEach(function (b) {
        var on = b.getAttribute('data-reset-channel') === activeChannel;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', String(on));
      });
      if (idLabel) {
        idLabel.textContent = activeChannel === 'phone'
          ? tr('Registered mobile number', 'شماره موبایل ثبت‌شده')
          : tr('Account email address', 'ایمیل حساب کاربری');
      }
      if (idInput) {
        idInput.type = activeChannel === 'phone' ? 'tel' : 'email';
        idInput.autocomplete = activeChannel === 'phone' ? 'tel' : 'email';
        idInput.placeholder = activeChannel === 'phone' ? '0912 345 6789' : 'your@email.com';
      }
      if (previewBox) previewBox.hidden = true;
    }

    chBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setChannel(btn.getAttribute('data-reset-channel'));
      });
    });
    document.addEventListener('ga-lang', function () { setChannel(activeChannel); });
    setChannel(activeChannel);

    resetReqForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('rsReqMsg');
      var identifier = (idInput.value || '').trim();
      if (activeChannel === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
        setMsg(msg, tr('Enter a valid email address.', 'یک آدرس ایمیل معتبر وارد کنید.'), 'err', 'validation', idInput);
        return;
      }
      if (activeChannel === 'phone' && !validPhone(identifier)) {
        setMsg(msg, tr('Enter a valid mobile number (e.g. 09123456789).', 'یک شماره موبایل معتبر وارد کنید (مثلاً 09123456789).'), 'err', 'invalid_phone', idInput);
        return;
      }

      window.JabioAccount.requestPasswordReset(identifier, activeChannel)
        .then(function (res) {
          if (res && res.previewCode) {
            previewBox.hidden = false;
            previewLbl.textContent = activeChannel === 'phone'
              ? tr('SMS key not configured — test recovery code:', 'کلید پیامک تنظیم نشده — کد بازیابی آزمایشی:')
              : tr('SMTP not configured — test recovery code:', 'کلید SMTP تنظیم نشده — کد بازیابی آزمایشی:');
            previewCode.textContent = res.previewCode;
            setMsg(msg, tr(
              'A 6-digit recovery code was generated. Use the test code shown above in Step 2 within 15 minutes.',
              'کد بازیابی ۶ رقمی ایجاد شد. کد نمایش‌داده‌شده در بالا را ظرف ۱۵ دقیقه در مرحله ۲ وارد کنید.'
            ), 'ok');
          } else {
            previewBox.hidden = true;
            var channelMsg = activeChannel === 'phone'
              ? tr('If an account exists for this mobile number, a 6-digit recovery SMS has been sent.', 'در صورت وجود حساب با این شماره موبایل، کد بازیابی ۶ رقمی ارسال شد.')
              : tr('If an account exists for this email, a 6-digit recovery code has been sent.', 'در صورت وجود حساب با این ایمیل، کد بازیابی ۶ رقمی ارسال شد.');
            var configNote = res && res.configured === false
              ? (activeChannel === 'phone'
                ? tr(' (SMS provider is in preview mode—make sure this phone number is registered on an account.)', ' (سرویس پیامک در حالت آزمایشی است؛ اگر کدی نمایش داده نشد، مطمئن شوید این شماره قبلاً در حسابی ثبت شده باشد.)')
                : tr(' (SMTP is in preview mode—make sure this email is registered on an account.)', ' (سرویس ایمیل در حالت آزمایشی است؛ اگر کدی نمایش داده نشد، مطمئن شوید این ایمیل قبلاً ثبت شده باشد.)'))
              : '';
            setMsg(msg, channelMsg + configNote, 'info');
          }
        })
        .catch(function (err) {
          var isRate = err && err.message === 'rate_limited';
          var m = isRate
            ? tr('Too many attempts. Please wait a few minutes.', 'تعداد تلاش‌ها زیاد است. چند دقیقه دیگر تلاش کنید.')
            : tr('Could not process reset request.', 'درخواست بازیابی انجام نشد.');
          setMsg(msg, m, 'err', isRate ? 'rate_limited' : 'load_fail');
        });
    });

    resetConfirmForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = document.getElementById('rsConfirmMsg');
      var identifier = (idInput.value || '').trim();
      var codeInput = document.getElementById('rsCode');
      var pwInput = document.getElementById('rsNewPw');
      var pw2Input = document.getElementById('rsNewPw2');
      var code = toLatinDigits(codeInput.value || '').replace(/\s+/g, '');
      var pw = pwInput.value;
      var pw2 = pw2Input.value;

      if (!identifier) {
        setMsg(msg, tr('Enter your email or mobile number in Step 1 first.', 'ابتدا ایمیل یا شماره موبایل خود را در مرحله ۱ وارد کنید.'), 'err', 'validation', idInput);
        return;
      }
      if (!/^\d{6}$/.test(code) || pw.length < 10) {
        setMsg(msg, tr('Enter the 6-digit code and a new password of at least 10 characters.', 'کد ۶ رقمی و رمز عبور جدید حداقل ۱۰ کاراکتری را وارد کنید.'), 'err', !/^\d{6}$/.test(code) ? 'invalid_code' : 'invalid_password', !/^\d{6}$/.test(code) ? codeInput : pwInput);
        return;
      }
      if (pw !== pw2) {
        setMsg(msg, tr('New passwords do not match.', 'تکرار رمز عبور جدید مطابقت ندارد.'), 'err', 'validation', pw2Input);
        return;
      }

      window.JabioAccount.confirmPasswordReset(identifier, code, pw, activeChannel)
        .then(function () {
          resetConfirmForm.reset();
          setMsg(msg, tr('Password updated! Redirecting to sign in…', 'رمز عبور جدید با موفقیت ثبت شد! در حال انتقال به صفحه ورود…'), 'ok');
          setTimeout(function () { location.href = '/login.html?identifier=' + encodeURIComponent(identifier); }, 1300);
        })
        .catch(function (err) {
          var codeName = err && err.message;
          var m = codeName === 'rate_limited'
            ? tr('Too many attempts. Please wait before trying again.', 'تعداد تلاش‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید.')
            : codeName === 'invalid_password'
              ? tr('Choose a unique, non-numeric password of at least 10 characters.', 'یک رمز عبور جدید، غیرعددی و حداقل ۱۰ کاراکتری انتخاب کنید.')
              : tr('The 6-digit recovery code is invalid or has expired.', 'کد بازیابی ۶ رقمی نامعتبر است یا منقضی شده است.');
          setMsg(msg, m, 'err', codeName || 'invalid_code');
        });
    });
  }
})();

