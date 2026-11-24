'use strict';

function escHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escAttr(value) {
  return escHtml(value);
}

function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

function bi(en, fa, lang) {
  return lang === 'fa' ? fa : en;
}

function biSpan(en, fa, lang, tag = 'span', extra = '') {
  const txt = bi(en, fa, lang);
  const attrs = extra ? ` ${extra}` : '';
  return `<${tag}${attrs} data-en="${escAttr(en)}" data-fa="${escAttr(fa)}">${escHtml(txt)}</${tag}>`;
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
function fmtNum(n, lang) {
  const formatted = Number(n || 0).toLocaleString('en-US');
  if (lang !== 'fa') return formatted;
  return formatted.replace(/\d/g, (d) => FA_DIGITS[Number(d)]).replace(/,/g, '٬');
}

function biNum(n, lang, suffixEn = '', suffixFa = '') {
  const en = `${fmtNum(n, 'en')}${suffixEn}`;
  const fa = `${fmtNum(n, 'fa')}${suffixFa}`;
  return biSpan(en, fa, lang);
}

function renderBreadcrumbs(crumbs, lang) {
  if (!crumbs || !crumbs.length) return '';
  const items = crumbs.map((c, idx) => {
    const isLast = idx === crumbs.length - 1;
    const label = biSpan(c.en, c.fa, lang);
    const sep = idx > 0 ? '<span class="hb-sep" aria-hidden="true">/</span>' : '';
    if (isLast || !c.href) {
      return `${sep}<span aria-current="page">${label}</span>`;
    }
    return `${sep}<a href="${escAttr(c.href)}">${label}</a>`;
  });
  return `<nav class="hb-crumb" aria-label="Breadcrumb">${items.join('')}</nav>`;
}

function renderPage({
  req,
  baseUrl,
  routePath,
  lang,
  titleEn,
  titleFa,
  descEn,
  descFa,
  noindex = false,
  ogType = 'website',
  ogImage = null,
  activeNav = '',
  schemaGraph = [],
  bodyHtml = '',
  extraScripts = ''
}) {
  const isFa = lang === 'fa';
  const htmlLang = isFa ? 'fa' : 'en';
  const htmlDir = isFa ? 'rtl' : 'ltr';
  const activeTitle = isFa ? titleFa : titleEn;
  const activeDesc = isFa ? descFa : descEn;
  const reqLang = req.query && (req.query.lang === 'fa' || req.query.lang === 'en') ? req.query.lang : null;
  const canonicalUrl = reqLang ? `${baseUrl}${routePath}?lang=${reqLang}` : `${baseUrl}${routePath}`;
  const enUrl = `${baseUrl}${routePath}?lang=en`;
  const faUrl = `${baseUrl}${routePath}?lang=fa`;
  const defaultUrl = `${baseUrl}${routePath}`;
  const resolvedOgImage = ogImage ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`) : `${baseUrl}/assets/og.png`;
  const resolvedOgAlt = ogImage ? activeTitle : 'Jabio – Right Business, Right Place';

  const robotsContent = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1';

  const navItems = [
    { id: 'home', href: '/', en: 'Home', fa: 'خانه' },
    { id: 'analyze', href: '/jabio.html', en: 'Analyze', fa: 'تحلیل مکان' },
    { id: 'cities', href: '/cities', en: 'Cities', fa: 'شهرها' },
    { id: 'blog', href: '/blog', en: 'Blog', fa: 'وبلاگ' },
    { id: 'pricing', href: '/pricing', en: 'Pricing', fa: 'تعرفه‌ها' },
    { id: 'saved', href: '/saved.html', en: 'Saved', fa: 'ذخیره‌شده‌ها' }
  ];

  const navLinksHtml = navItems
    .map((item) => {
      const cls = item.id === activeNav ? 'nav-item active' : 'nav-item';
      return `<a class="${cls}" href="${item.href}" data-en="${escAttr(item.en)}" data-fa="${escAttr(item.fa)}">${escHtml(bi(item.en, item.fa, lang))}</a>`;
    })
    .join('\n    ');

  const jsonLdBlock = schemaGraph.length
    ? `<script type="application/ld+json" data-seo-schema="1">${safeJsonLd({ '@context': 'https://schema.org', '@graph': schemaGraph })}</script>`
    : '';

  const hreflangBlock = noindex
    ? ''
    : `
<link rel="canonical" href="${escAttr(canonicalUrl)}">
<link rel="alternate" hreflang="en" href="${escAttr(enUrl)}">
<link rel="alternate" hreflang="fa-IR" href="${escAttr(faUrl)}">
<link rel="alternate" hreflang="x-default" href="${escAttr(defaultUrl)}">`;

  return `<!DOCTYPE html>
<html lang="${htmlLang}" dir="${htmlDir}" data-title-en="${escAttr(titleEn)}" data-title-fa="${escAttr(titleFa)}" data-desc-en="${escAttr(descEn)}" data-desc-fa="${escAttr(descFa)}">
<head>
<meta charset="UTF-8"/>
<script>document.documentElement.setAttribute('data-theme','light');try{if(localStorage.getItem('ga_theme')==='dark')document.documentElement.removeAttribute('data-theme')}catch(e){}</script>
<script>try{var ql=new URLSearchParams(location.search).get('lang');var lg=ql==='fa'||ql==='en'?ql:(localStorage.getItem('ga_lang')||document.documentElement.lang);if(lg==='fa'){var d=document.documentElement;d.lang='fa';d.dir='rtl';['Regular','Bold'].forEach(function(w){var l=document.createElement('link');l.rel='preload';l.as='font';l.type='font/woff2';l.crossOrigin='';l.href='/assets/fonts/Vazirmatn-'+w+'.woff2';document.head.appendChild(l);});}}catch(e){}</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<meta name="theme-color" content="#F4F5F7"/>
<meta name="color-scheme" content="light dark"/>
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="apple-touch-icon" href="/assets/favicon.png">
<title>${escHtml(activeTitle)}</title>
<meta name="description" content="${escAttr(activeDesc)}">
<meta name="robots" content="${robotsContent}">${hreflangBlock}
<meta property="og:type" content="${escAttr(ogType)}">
<meta property="og:site_name" content="Jabio">
<meta property="og:locale" content="${isFa ? 'fa_IR' : 'en_US'}">
<meta property="og:locale:alternate" content="${isFa ? 'en_US' : 'fa_IR'}">
<meta property="og:title" content="${escAttr(activeTitle)}">
<meta property="og:description" content="${escAttr(activeDesc)}">
<meta property="og:url" content="${escAttr(canonicalUrl)}">
<meta property="og:image" content="${escAttr(resolvedOgImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escAttr(resolvedOgAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escAttr(activeTitle)}">
<meta name="twitter:description" content="${escAttr(activeDesc)}">
<meta name="twitter:image" content="${escAttr(resolvedOgImage)}">
<link rel="stylesheet" href="/assets/base.css">
<link rel="stylesheet" href="/assets/shared.css?v=dd-1">
<link rel="stylesheet" href="/assets/design-system.css">
<link rel="stylesheet" href="/assets/theme-light.css">
<link rel="stylesheet" href="/assets/content.css">
<link rel="stylesheet" href="/assets/pages.css?v=2">
<link rel="stylesheet" href="/assets/hub.css?v=6">
${jsonLdBlock}
</head>
<body>

<nav class="nav" id="mainNav">
  <a class="nav-logo" href="/" aria-label="Jabio home">
    <div class="nav-logo-icon"><img class="brand-img" src="/assets/logo.png" alt="" width="56" height="46"></div>
    <span class="brand-word" dir="ltr" lang="en" translate="no"><i>ja</i><b>bio</b></span>
  </a>
  <div class="nav-center">
    ${navLinksHtml}
  </div>
  <div class="nav-right">
    <button class="lang-btn" id="langToggleBtn" aria-label="Switch language" aria-expanded="false"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20" stroke="currentColor" stroke-width="1.8"/></svg><span id="langLabel">${isFa ? 'FA' : 'EN'}</span></button>
    <a class="btn-ghost" href="/login.html" data-nav-account data-en="Sign in" data-fa="ورود">${escHtml(bi('Sign in', 'ورود', lang))}</a>
    <a class="btn-primary" href="/jabio.html" data-en="Start analysis" data-fa="شروع تحلیل">${escHtml(bi('Start analysis', 'شروع تحلیل', lang))}</a>
  </div>
</nav>

<div class="lang-overlay" id="langOverlay">
  <div class="lang-backdrop" id="langBackdrop"></div>
  <div class="lang-panel">
    <div class="lang-option${!isFa ? ' active' : ''}" data-lang="en"><span class="lang-flag">🇬🇧</span><div><div class="lang-label">English</div></div></div>
    <div class="lang-option${isFa ? ' active' : ''}" data-lang="fa"><span class="lang-flag">🇮🇷</span><div><div class="lang-label fa-text">فارسی</div></div></div>
  </div>
</div>

${bodyHtml}

<footer class="ds-footer">
  <div class="ds-footer-card">
    <div class="ds-footer-main">
      <div class="ds-footer-brand">
        <div class="ds-footer-mark"><img class="brand-img" src="/assets/logo.png" alt="" width="34" height="28"><span class="brand-word" dir="ltr" lang="en" translate="no"><i>ja</i><b>bio</b></span></div>
        <p class="ds-footer-sub" data-en="Location intelligence for Iranian businesses." data-fa="هوش مکانی برای کسب‌وکارهای ایرانی.">${escHtml(bi('Location intelligence for Iranian businesses.', 'هوش مکانی برای کسب‌وکارهای ایرانی.', lang))}</p>
        <a class="ds-footer-mail" href="#" data-social="email" data-social-self></a>
        <div class="ds-footer-social"><a href="#" data-social="github" aria-label="github" title="github"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg></a><a href="#" data-social="twitter" aria-label="twitter" title="twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a><a href="#" data-social="linkedin" aria-label="linkedin" title="linkedin"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56z"/></svg></a><a href="#" data-social="youtube" aria-label="youtube" title="youtube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12z"/></svg></a></div>
      </div>
      <div class="ds-footer-col">
        <h3 data-en="Product" data-fa="محصول">${escHtml(bi('Product', 'محصول', lang))}</h3>
        <a href="/jabio.html" data-en="Analyze a location" data-fa="تحلیل مکان">${escHtml(bi('Analyze a location', 'تحلیل مکان', lang))}</a>
        <a href="/cities" data-en="15 Iranian cities" data-fa="۱۵ شهر ایران">${escHtml(bi('15 Iranian cities', '۱۵ شهر ایران', lang))}</a>
        <a href="/categories.html" data-en="Business categories" data-fa="دسته‌بندی کسب‌وکارها">${escHtml(bi('Business categories', 'دسته‌بندی کسب‌وکارها', lang))}</a>
        <a href="/compare.html" data-en="Compare locations" data-fa="مقایسه مکان‌ها">${escHtml(bi('Compare locations', 'مقایسه مکان‌ها', lang))}</a>
        <a href="/pricing" data-en="Pricing &amp; plans" data-fa="تعرفه‌ها و پلن‌ها">${escHtml(bi('Pricing & plans', 'تعرفه‌ها و پلن‌ها', lang))}</a>
      </div>
      <div class="ds-footer-col">
        <h3 data-en="Learn" data-fa="یادگیری">${escHtml(bi('Learn', 'یادگیری', lang))}</h3>
        <a href="/blog" data-en="Blog &amp; articles" data-fa="وبلاگ و مقالات">${escHtml(bi('Blog & articles', 'وبلاگ و مقالات', lang))}</a>
        <a href="/methodology" data-en="Scoring methodology" data-fa="روش‌شناسی مدل">${escHtml(bi('Scoring methodology', 'روش‌شناسی مدل', lang))}</a>
        <a href="/guide.html" data-en="Location field guide" data-fa="راهنمای انتخاب مکان">${escHtml(bi('Location field guide', 'راهنمای انتخاب مکان', lang))}</a>
        <a href="/examples.html" data-en="Worked examples" data-fa="نمونه تحلیل">${escHtml(bi('Worked examples', 'نمونه تحلیل', lang))}</a>
        <a href="/faq.html" data-en="FAQ" data-fa="سوالات پرتکرار">${escHtml(bi('FAQ', 'سوالات پرتکرار', lang))}</a>
      </div>
      <div class="ds-footer-col">
        <h3 data-en="About" data-fa="درباره">${escHtml(bi('About', 'درباره', lang))}</h3>
        <a href="/about.html" data-en="About Jabio" data-fa="درباره جابیو">${escHtml(bi('About Jabio', 'درباره جابیو', lang))}</a>
        <a href="/changelog" data-en="Data updates &amp; changelog" data-fa="به‌روزرسانی داده‌ها">${escHtml(bi('Data updates & changelog', 'به‌روزرسانی داده‌ها', lang))}</a>
        <a href="/sources.html" data-en="Data sources &amp; licenses" data-fa="منابع و مجوز داده‌ها">${escHtml(bi('Data sources & licenses', 'منابع و مجوز داده‌ها', lang))}</a>
        <a href="/account" data-en="Account settings" data-fa="تنظیمات حساب">${escHtml(bi('Account settings', 'تنظیمات حساب', lang))}</a>
        <a href="/contact.html" data-en="Contact" data-fa="تماس">${escHtml(bi('Contact', 'تماس', lang))}</a>
        <a href="/privacy.html" data-en="Privacy" data-fa="حریم خصوصی">${escHtml(bi('Privacy', 'حریم خصوصی', lang))}</a>
      </div>
    </div>
    <div class="ds-footer-bar">
      <div class="ds-footer-copy" data-en="© 2026 Jabio. All rights reserved." data-fa="© ۲۰۲۶ جابیو. کلیه حقوق برای جابیو محفوظ است.">${escHtml(bi('© 2026 Jabio. All rights reserved.', '© ۲۰۲۶ جابیو. کلیه حقوق برای جابیو محفوظ است.', lang))}</div>
      <div class="ds-footer-credit" dir="ltr" lang="en" translate="no">Product by <strong>Ashkan</strong></div>
    </div>
  </div>
</footer>

<script src="/assets/lang.js"></script>
<script src="/assets/account.js"></script>
<script src="/assets/site.js?v=dd-1"></script>
${extraScripts}
</body>
</html>`;
}

module.exports = {
  escHtml,
  escAttr,
  safeJsonLd,
  bi,
  biSpan,
  fmtNum,
  biNum,
  renderBreadcrumbs,
  renderPage
};
