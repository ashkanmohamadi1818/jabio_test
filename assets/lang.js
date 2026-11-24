/* Language switching for the pages that load base.css.
   Swaps every [data-en]/[data-fa] pair, flips direction, remembers the choice and fires
   "ga-lang" so pages that draw their own content can redraw it. */
(function () {
  'use strict';
  var html = document.documentElement;
  var overlay = document.getElementById('langOverlay'), btn = document.getElementById('langToggleBtn'), label = document.getElementById('langLabel');

  function setMeta(sel, val) {
    if (!val) return;
    var m = document.querySelector(sel);
    if (m) m.setAttribute('content', val);
  }

  function apply(lang, silent) {
    var fa = lang === 'fa';
    try { localStorage.setItem('ga_lang', lang); } catch (e) {}
    html.lang = lang; html.dir = fa ? 'rtl' : 'ltr';
    if (label) label.textContent = fa ? 'FA' : 'EN';
    [].forEach.call(document.querySelectorAll('[data-en]'), function (el) {
      var t = el.getAttribute(fa ? 'data-fa' : 'data-en');
      if (t != null) el.textContent = t;
    });
    [].forEach.call(document.querySelectorAll('[data-en-placeholder]'), function (el) {
      el.placeholder = el.getAttribute(fa ? 'data-fa-placeholder' : 'data-en-placeholder') || '';
    });
    [].forEach.call(document.querySelectorAll('.lang-option'), function (o) { o.classList.toggle('active', o.getAttribute('data-lang') === lang); });
    var t = document.documentElement.getAttribute('data-title-' + lang);
    if (t) {
      document.title = t;
      setMeta('meta[property="og:title"]', t);
      setMeta('meta[name="twitter:title"]', t);
    }
    var d = document.documentElement.getAttribute('data-desc-' + lang);
    if (d) {
      setMeta('meta[name="description"]', d);
      setMeta('meta[property="og:description"]', d);
      setMeta('meta[name="twitter:description"]', d);
    }
    setMeta('meta[property="og:locale"]', fa ? 'fa_IR' : 'en_US');
    if (!silent) document.dispatchEvent(new CustomEvent('ga-lang', { detail: lang }));
  }
  if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); var o = overlay.classList.toggle('open'); btn.setAttribute('aria-expanded', String(o)); });
  var back = document.getElementById('langBackdrop');
  if (back) back.addEventListener('click', function () { overlay.classList.remove('open'); if (btn) btn.setAttribute('aria-expanded', 'false'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay) overlay.classList.remove('open'); });
  [].forEach.call(document.querySelectorAll('.lang-option'), function (o) {
    o.addEventListener('click', function () { apply(o.getAttribute('data-lang')); overlay.classList.remove('open'); });
  });
  var urlLang = null;
  try {
    var qp = new URLSearchParams(window.location.search).get('lang');
    if (qp === 'fa' || qp === 'en') urlLang = qp;
  } catch (e) {}
  var saved = urlLang || 'en';
  if (!urlLang) {
    try { saved = localStorage.getItem('ga_lang') || 'en'; } catch (e) {}
  }
  if (saved !== 'en' || urlLang) apply(saved, true);
  /* scroll reveal */
  var rev = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }); }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
    [].forEach.call(rev, function (el) { io.observe(el); });
  } else { [].forEach.call(rev, function (el) { el.classList.add('visible'); }); }
  window.GA_LANG = { apply: apply, get: function () { return html.lang; } };
})();
