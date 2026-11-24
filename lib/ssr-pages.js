'use strict';

const {
  CITIES,
  BIZ_TYPES,
  SNAPSHOT,
  getCityCategoryAnalysis,
  getCityOverview,
  getGlobalTotals,
  getMethodologyWeights
} = require('./cities-engine');
const {
  BLOG_CATEGORIES,
  BLOG_POSTS,
  BLOG_BY_SLUG,
  CHANGELOG_RELEASES,
  ROADMAP_ITEMS,
  PRICING_PLANS,
  PRICING_MATRIX,
  PRICING_FAQ
} = require('./content-data');
const {
  escHtml,
  escAttr,
  bi,
  biSpan,
  fmtNum,
  biNum,
  renderBreadcrumbs,
  renderPage
} = require('./ssr-layout');

const IMG = {
  cities: '/src/assets/images/cities_iran_aerial_1795255638814.jpg',
  storefront: '/src/assets/images/tehran_commercial_storefront_1795257170882.jpg',
  iranStorefront: '/src/assets/images/tehran_commercial_storefront_1795257170882.jpg',
  iranRentDesk: '/src/assets/images/iran_rent_breakeven_desk_1795259952535.jpg',
  iranFootfall: '/src/assets/images/iran_boulevard_foot_traffic_1795259953265.jpg',
  iranInspection: '/src/assets/images/iran_shop_lease_inspection_1795259954443.jpg',
  iranTehranSkyline: '/src/assets/images/tehran_districts_skyline_panorama_1795259953116.jpg',
  iranCafeCluster: '/src/assets/images/iran_specialty_cafe_terrace_1795259953012.jpg',
  blueprint: '/src/assets/images/commercial_lease_blueprint_1795255639374.jpg',
  footfall: '/src/assets/images/urban_foot_traffic_street_1795255638879.jpg',
  spatial: '/src/assets/images/spatial_grid_intelligence_1795255638753.jpg'
};

const BLOG_COVERS = {
  'how-to-choose-shop-location': IMG.iranStorefront,
  'rent-break-even-calculation': IMG.iranRentDesk,
  'foot-traffic-vs-visibility': IMG.iranFootfall,
  'common-commercial-lease-mistakes': IMG.iranInspection,
  'tehran-commercial-districts-guide': IMG.iranTehranSkyline,
  'opening-cafe-or-restaurant-guide': IMG.iranCafeCluster
};

const COV_LABELS = {
  rich: { en: 'Rich data', fa: 'داده غنی' },
  partial: { en: 'Partial data', fa: 'داده نسبی' },
  thin: { en: 'Thin data', fa: 'داده محدود' }
};

const LEVEL_LABELS = {
  strong: { en: 'Strong', fa: 'قوی' },
  promising: { en: 'Promising', fa: 'امیدوارکننده' },
  mixed: { en: 'Mixed', fa: 'متوسط' },
  weak: { en: 'Weak', fa: 'ضعیف' }
};

const QUAD_LABELS = {
  hot: { en: 'Hot opportunity', fa: 'فرصت داغ' },
  niche: { en: 'Small niche', fa: 'بازار کوچک' },
  watch: { en: 'Balanced', fa: 'متعادل' },
  risk: { en: 'High competition', fa: 'اشباع بالا' }
};

const DRIVER_LABELS = {
  residents: { en: 'Residents', fa: 'ساکنان' },
  office: { en: 'Offices', fa: 'دفاتر و ادارات' },
  school: { en: 'Schools', fa: 'مدارس' },
  university: { en: 'Universities', fa: 'دانشگاه‌ها' },
  retail: { en: 'Shops', fa: 'فروشگاه‌ها' },
  mall: { en: 'Malls', fa: 'مراکز خرید' },
  tourism: { en: 'Hotels & sights', fa: 'گردشگری' },
  transit: { en: 'Transit stops', fa: 'ایستگاه‌ها' },
  bank: { en: 'Banks', fa: 'بانک‌ها' },
  civic: { en: 'Civic offices', fa: 'ادارات دولتی' },
  park: { en: 'Parks', fa: 'پارک‌ها' },
  health: { en: 'Health centres', fa: 'مراکز درمانی' },
  leisure: { en: 'Sport & leisure', fa: 'ورزش و تفریح' }
};

const MAX_POIS = Math.max(...CITIES.map((c) => c.pois), 1);

function renderCoverageLabel(cov, lang) {
  const lbl = COV_LABELS[cov] || COV_LABELS.partial;
  return `<span class="hb-cov ${escAttr(cov)}" data-en="${escAttr(lbl.en)}" data-fa="${escAttr(lbl.fa)}">${escHtml(bi(lbl.en, lbl.fa, lang))}</span>`;
}

function renderScoreRing(score, level, lang, size = 'md') {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  const r = 27;
  const circ = +(2 * Math.PI * r).toFixed(2);
  const offset = +(circ * (1 - s / 100)).toFixed(2);
  const sizeCls = size === 'lg' ? ' lg' : '';
  return `<div class="hb-ring${sizeCls}" aria-label="${escAttr(`${s} out of 100`)}">
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle class="hb-ring-bg" cx="32" cy="32" r="${r}"/>
      <circle class="hb-ring-fg hb-lv-${escAttr(level || 'mixed')}" cx="32" cy="32" r="${r}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
    </svg>
    <span class="hb-ring-val">${biNum(s, lang)}</span>
  </div>`;
}

function densityPercent(pois) {
  return Math.max(10, Math.min(100, Math.round((Math.log10(Math.max(pois, 10)) / Math.log10(MAX_POIS)) * 100)));
}

// ── 1. /cities — 15-City Atlas Directory ────────────────────────────────────
function renderCitiesIndex(req, baseUrl, lang) {
  const totals = getGlobalTotals();
  const titleEn = '15 Iranian Cities Location Intelligence Directory – Jabio';
  const titleFa = 'راهنمای تحلیل مکانی ۱۵ شهر ایران – جابیو';
  const descEn = 'Explore real business location statistics, mapped places, building coverage, and category scores across 15 Iranian cities including Tehran, Mashhad, Isfahan, Shiraz, and Tabriz.';
  const descFa = 'بررسی آمار واقعی مکان‌ها، ساختمان‌ها، پوشش داده و تحلیل محله‌های تجاری ۱۵ شهر ایران شامل تهران، مشهد، اصفهان، شیراز، تبریز و کرج در جابیو.';

  const featuredIds = ['tehran', 'mashhad', 'isfahan'];
  const featuredBento = featuredIds.map((id, idx) => {
    const c = CITIES.find((x) => x.id === id);
    if (!c) return '';
    const isLead = idx === 0;
    const pct = densityPercent(c.pois);
    const cats = (isLead ? ['cafe', 'restaurant', 'pharmacy', 'grocery', 'fashion', 'clinic'] : ['cafe', 'restaurant', 'pharmacy'])
      .map((tid) => {
        const b = BIZ_TYPES.find((x) => x.id === tid);
        return `<a class="hb-muted-link" href="/cities/${c.id}/${b.id}">${biSpan(b.en, b.fa, lang)}</a>`;
      }).join(' · ');

    return `
      <article class="hb-card${isLead ? ' hb-bento-lead' : ''}">
        <div class="hb-city-top">
          <div>
            <div class="hb-meta-row" style="margin-bottom:6px">
              ${renderCoverageLabel(c.coverage, lang)}
              <span aria-hidden="true">·</span>
              <span>${c.districts ? biSpan('22 districts + footfall', '۲۲ منطقه + مدل تردد', lang) : biSpan('250 m urban grid', 'شبکه تحلیلی ۲۵۰ متری', lang)}</span>
            </div>
            <h3 class="hb-city-name" style="font-size:${isLead ? '24px' : '20px'}">${biSpan(c.en, c.fa, lang)}</h3>
          </div>
          <a class="hb-link" href="/cities/${c.id}">${biSpan('Explore →', 'تحلیل شهر ←', lang)}</a>
        </div>
        <div class="hb-meter-wrap">
          <div class="hb-meter-head">
            <span>${biSpan('Mapped data density', 'تراکم داده ثبت‌شده', lang)}</span>
            <span>${biNum(c.pois, lang, ' places', ' مکان')}</span>
          </div>
          <div class="hb-meter"><i style="width:${pct}%"></i></div>
        </div>
        <div class="hb-city-stats">
          <div class="hb-city-stat">
            <b>${biNum(c.pois, lang)}</b>
            <span>${biSpan('Places', 'مکان ثبت‌شده', lang)}</span>
          </div>
          <div class="hb-city-stat">
            <b>${biNum(c.buildings, lang)}</b>
            <span>${biSpan('Buildings', 'ساختمان', lang)}</span>
          </div>
          <div class="hb-city-stat">
            <b>${biNum(Math.round(c.people / 1000), lang, 'k', ' هزار')}</b>
            <span>${biSpan('Residents', 'جمعیت مدل', lang)}</span>
          </div>
        </div>
        <div class="hb-city-cats">${cats}</div>
      </article>`;
  }).join('');

  const cityCards = CITIES.map((c) => {
    const pct = densityPercent(c.pois);
    const quickCats = ['cafe', 'restaurant', 'grocery', 'pharmacy'].map((tid) => {
      const b = BIZ_TYPES.find((x) => x.id === tid);
      return `<a class="hb-muted-link" href="/cities/${c.id}/${b.id}">${biSpan(b.en, b.fa, lang)}</a>`;
    }).join(' · ');

    return `
      <div class="hb-card" data-city-card data-name="${escAttr(`${c.en} ${c.fa} ${c.id}`.toLowerCase())}" data-cov="${escAttr(c.coverage)}">
        <div class="hb-city-top">
          <div>
            <h2 class="hb-city-name">${biSpan(c.en, c.fa, lang)}</h2>
            <div class="hb-city-sub">${c.districts ? biSpan('22 districts + D5 footfall', '۲۲ منطقه + مدل تردد منطقه ۵', lang) : biSpan('250 m urban scoring grid', 'شبکه تحلیلی ۲۵۰ متری', lang)}</div>
          </div>
          ${renderCoverageLabel(c.coverage, lang)}
        </div>
        <div class="hb-meter-wrap">
          <div class="hb-meter"><i style="width:${pct}%"></i></div>
        </div>
        <div class="hb-city-stats">
          <div class="hb-city-stat">
            <b>${biNum(c.pois, lang)}</b>
            <span>${biSpan('Places', 'مکان ثبت‌شده', lang)}</span>
          </div>
          <div class="hb-city-stat">
            <b>${biNum(c.buildings, lang)}</b>
            <span>${biSpan('Buildings', 'ساختمان', lang)}</span>
          </div>
          <div class="hb-city-stat">
            <b>${biNum(Math.round(c.people / 1000), lang, 'k', ' هزار')}</b>
            <span>${biSpan('Residents', 'جمعیت مدل', lang)}</span>
          </div>
        </div>
        <div class="hb-city-links">
          <a class="hb-link" href="/cities/${c.id}">${biSpan(`Explore ${c.en} →`, `تحلیل شهر ${c.fa} ←`, lang)}</a>
          <a class="hb-muted-link" href="/jabio.html?c=${c.id}">${biSpan('Open map', 'نقشه زنده', lang)}</a>
        </div>
        <div class="hb-city-cats">${quickCats}</div>
      </div>`;
  }).join('');

  const schemaGraph = [
    {
      '@type': 'CollectionPage',
      name: bi(titleEn, titleFa, lang),
      url: `${baseUrl}/cities`,
      inLanguage: ['en', 'fa']
    },
    {
      '@type': 'ItemList',
      itemListElement: CITIES.map((c, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: bi(`${c.en} Location Analysis`, `تحلیل مکانی ${c.fa}`, lang),
        url: `${baseUrl}/cities/${c.id}`
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jabio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: bi('Cities', 'شهرها', lang), item: `${baseUrl}/cities` }
      ]
    }
  ];

  const bodyHtml = `
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([{ en: 'Home', fa: 'خانه', href: '/' }, { en: 'Cities', fa: 'شهرها' }], lang)}

  <header class="hb-stage">
    <img class="hb-stage-img" src="${IMG.cities}" alt="${escAttr(bi('Aerial golden-hour view of an Iranian metropolitan boulevard and urban grid', 'نمای هوایی بلوار و بافت شهری کلان‌شهرهای ایران در ساعت طلایی', lang))}" referrerpolicy="no-referrer" loading="eager">
    <div class="hb-stage-scrim" aria-hidden="true"></div>
    <div class="hb-stage-body">
      <p class="hb-kicker">${biSpan(`Urban Atlas · Snapshot ${totals.snapshot}`, `اطلس شهری ایران · نسخه داده ${totals.snapshot}`, lang)}</p>
      <h1 class="hb-h1">${biSpan('15 Iranian Cities, Scored Block by Block', 'تحلیل مکانی ۱۵ شهر ایران، بلوک به بلوک', lang)}</h1>
      <p class="hb-lead">${biSpan(
        'Inspect real mapped businesses, building density, data coverage, and live ranked neighbourhoods across all 10 commercial categories before signing a lease.',
        'آمار واقعی مغازه‌ها، تراکم ساختمان، سطح پوشش داده و برترین محله‌های هر ۱۰ صنف تجاری را در ۱۵ کلان‌شهر ایران بررسی کنید و مستقیم وارد نقشه زنده شوید.',
        lang
      )}</p>
      <div class="hb-hero-actions">
        <a class="hb-btn hb-btn-primary" href="/jabio.html">${biSpan('Open interactive map', 'ورود به نقشه تعاملی', lang)}</a>
        <a class="hb-btn hb-btn-ghost" href="/methodology">${biSpan('How scores work', 'روش‌شناسی امتیازدهی', lang)}</a>
      </div>
    </div>
  </header>

  <section class="hb-ribbon" aria-label="Dataset summary">
    <div class="hb-ribbon-item">
      <span class="hb-ribbon-val">${biNum(totals.cityCount, lang)}</span>
      <span class="hb-ribbon-lbl">${biSpan('Covered cities', 'شهر تحت پوشش', lang)}</span>
    </div>
    <div class="hb-ribbon-item">
      <span class="hb-ribbon-val">${biNum(totals.totalPois, lang)}</span>
      <span class="hb-ribbon-lbl">${biSpan('Mapped places (OSM + Overture)', 'مکان ثبت‌شده (OSM + Overture)', lang)}</span>
    </div>
    <div class="hb-ribbon-item">
      <span class="hb-ribbon-val">${biNum(totals.totalBuildings, lang)}</span>
      <span class="hb-ribbon-lbl">${biSpan('Building footprints', 'ساختمان ثبت‌شده', lang)}</span>
    </div>
    <div class="hb-ribbon-item">
      <span class="hb-ribbon-val">${biNum(totals.cityCount * totals.categoryCount, lang)}</span>
      <span class="hb-ribbon-lbl">${biSpan('City × business guides', 'صفحه ترکیبی شهر و صنف', lang)}</span>
    </div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('Flagship Metropolitan Markets', 'کلان‌شهرهای شاخص با پوشش داده غنی', lang)}</h2>
      <p class="hb-sec-sub">${biSpan('Highest street-level business completeness', 'بیشترین کامل‌بودن داده در سطح خیابان و محله', lang)}</p>
    </div>
    <div class="hb-bento-cities">${featuredBento}</div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('All 15 Covered Cities', 'فهرست کامل ۱۵ شهر تحت پوشش', lang)}</h2>
      <p class="hb-sec-sub">${biSpan('Filter by name or dataset completeness', 'جستجو بر اساس نام شهر یا سطح پوشش داده', lang)}</p>
    </div>
    <div class="ct-bar" data-cities-filter>
      <label class="ct-search">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input type="search" id="citySearch" data-en-placeholder="Search city (e.g. Tehran, Shiraz)…" data-fa-placeholder="جستجوی شهر (مثلاً تهران، شیراز)…" placeholder="${escAttr(bi('Search city (e.g. Tehran, Shiraz)…', 'جستجوی شهر (مثلاً تهران، شیراز)…', lang))}">
      </label>
      <div class="ct-chips" role="group" aria-label="Coverage filter">
        <button type="button" class="ct-chip on" data-cov-btn="all">${biSpan(`All (${totals.cityCount})`, `همه (${fmtNum(totals.cityCount, 'fa')})`, lang)}</button>
        <button type="button" class="ct-chip" data-cov-btn="rich">${biSpan(`Rich data (${totals.richCount})`, `داده غنی (${fmtNum(totals.richCount, 'fa')})`, lang)}</button>
        <button type="button" class="ct-chip" data-cov-btn="partial">${biSpan(`Partial (${totals.partialCount})`, `داده نسبی (${fmtNum(totals.partialCount, 'fa')})`, lang)}</button>
        <button type="button" class="ct-chip" data-cov-btn="thin">${biSpan(`Thin (${totals.thinCount})`, `داده محدود (${fmtNum(totals.thinCount, 'fa')})`, lang)}</button>
      </div>
    </div>

    <div class="hb-grid-3" id="citiesGrid">${cityCards}</div>
    <div class="ct-empty" id="citiesEmpty" hidden>${biSpan('No matching city found.', 'شهری با این مشخصات پیدا نشد.', lang)}</div>
  </section>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: '/cities',
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    activeNav: 'cities',
    schemaGraph,
    bodyHtml,
    extraScripts: '<script src="/assets/hub-client.js?v=2"></script>'
  });
}

// ── 2. /cities/:city — Dedicated City Hub ───────────────────────────────────
function renderCityDetail(req, baseUrl, lang, cityId) {
  const overview = getCityOverview(cityId);
  if (!overview) return null;
  const c = overview.city;

  const titleEn = `Best Business Locations in ${c.en} – City Location Analysis | Jabio`;
  const titleFa = `بهترین مناطق برای باز کردن مغازه در ${c.fa} – تحلیل مکانی ${c.fa} | جابیو`;
  const descEn = `Data-backed location intelligence for ${c.en}: ${fmtNum(c.pois, 'en')} mapped places, ${fmtNum(c.buildings, 'en')} buildings, and top-ranked areas for cafés, restaurants, supermarkets, pharmacies, and more.`;
  const descFa = `تحلیل مکانی و انتخاب بهترین محله برای کسب‌وکار در ${c.fa}: بررسی ${fmtNum(c.pois, 'fa')} مکان ثبت‌شده، ${fmtNum(c.buildings, 'fa')} ساختمان و امتیاز واقعی ۱۰ صنف اصلی روی نقشه جابیو.`;

  const catCards = overview.categories.map((item) => {
    const b = item.biz;
    const placeLabelEn = item.topPlace ? `Top block near ${item.topPlace.en}` : 'Explore top 6 ranked blocks';
    const placeLabelFa = item.topPlace ? `برترین محدوده: نزدیک ${item.topPlace.fa}` : 'مشاهده ۶ محدوده برتر';
    return `
      <a class="hb-card hb-cat-card" href="/cities/${c.id}/${b.id}">
        <div class="hb-cat-head">
          <div>
            <h3 class="hb-cat-name">${biSpan(b.en, b.fa, lang)}</h3>
            <p class="hb-cat-place">${biSpan(placeLabelEn, placeLabelFa, lang)}</p>
          </div>
          ${renderScoreRing(item.bestScore, item.topLevel, lang)}
        </div>
        <div class="hb-cat-foot">
          <span>${biSpan(`${fmtNum(item.poiCount, 'en')} mapped in ${c.en}`, `${fmtNum(item.poiCount, 'fa')} مورد ثبت‌شده در ${c.fa}`, lang)}</span>
          <span class="hb-link">${biSpan('View guide →', 'مشاهده تحلیل ←', lang)}</span>
        </div>
      </a>`;
  }).join('');

  const hotspotCards = overview.hotspots.map((h, idx) => `
    <article class="hb-card hb-cat-card">
      <div class="hb-cat-head">
        <div>
          <div class="hb-rank">${biSpan(`Hotspot 0${idx + 1} · ${h.biz.en}`, `نقطه پرتقاضا ${fmtNum(idx + 1, 'fa')} · ${h.biz.fa}`, lang)}</div>
          <h3 class="hb-cat-name">${biSpan(h.en, h.fa, lang)}</h3>
          <p class="hb-cat-place">${biSpan(`Top-scored block for ${h.biz.en} in ${c.en}`, `بالاترین امتیاز برای ${h.biz.fa} در ${c.fa}`, lang)}</p>
        </div>
        ${renderScoreRing(h.score, 'strong', lang)}
      </div>
      <div class="hb-cat-foot">
        <a class="hb-link" href="/jabio.html?c=${c.id}&lat=${h.lat}&lon=${h.lon}&r=1000&t=${h.biz.id}">${biSpan('Inspect on map →', 'بررسی روی نقشه ←', lang)}</a>
        <a class="hb-muted-link" href="/cities/${c.id}/${h.biz.id}">${biSpan(`All ${h.biz.en} spots`, `همه نقاط ${h.biz.fa}`, lang)}</a>
      </div>
    </article>`).join('');

  const siblingCities = CITIES.map((other) => {
    const cls = other.id === c.id ? 'hb-link-item active' : 'hb-link-item';
    return `<a class="${cls}" href="/cities/${other.id}">${biSpan(other.en, other.fa, lang)}</a>`;
  }).join('');

  const schemaGraph = [
    {
      '@type': 'WebPage',
      name: bi(titleEn, titleFa, lang),
      description: bi(descEn, descFa, lang),
      url: `${baseUrl}/cities/${c.id}`,
      inLanguage: ['en', 'fa']
    },
    {
      '@type': 'ItemList',
      name: bi(`Business Categories in ${c.en}`, `اصناف تحلیل‌شده در ${c.fa}`, lang),
      itemListElement: BIZ_TYPES.map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: bi(`Best ${b.en} locations in ${c.en}`, `بهترین مناطق ${b.fa} در ${c.fa}`, lang),
        url: `${baseUrl}/cities/${c.id}/${b.id}`
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jabio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: bi('Cities', 'شهرها', lang), item: `${baseUrl}/cities` },
        { '@type': 'ListItem', position: 3, name: bi(c.en, c.fa, lang), item: `${baseUrl}/cities/${c.id}` }
      ]
    }
  ];

  const bodyHtml = `
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([
    { en: 'Home', fa: 'خانه', href: '/' },
    { en: 'Cities', fa: 'شهرها', href: '/cities' },
    { en: c.en, fa: c.fa }
  ], lang)}

  <header class="hb-split-hero">
    <div class="hb-split-copy">
      <p class="hb-kicker">${renderCoverageLabel(c.coverage, lang)} <span aria-hidden="true">·</span> ${biSpan(`Snapshot ${overview.snapshot}`, `نسخه داده ${overview.snapshot}`, lang)}</p>
      <h1 class="hb-h1">${biSpan(`Best Business Locations in ${c.en}`, `تحلیل مکانی و بهترین مناطق کسب‌وکار در ${c.fa}`, lang)}</h1>
      <p class="hb-lead">${biSpan(
        `Every 250 m block in ${c.en} is scored using ${fmtNum(c.pois, 'en')} mapped places, ${fmtNum(c.buildings, 'en')} building footprints, street access, and WorldPop population models. Pick a category below or explore the live map.`,
        `هر بلوک ۲۵۰ متری در ${c.fa} بر اساس ${fmtNum(c.pois, 'fa')} مکان ثبت‌شده، ${fmtNum(c.buildings, 'fa')} ساختمان، شبکه دسترسی و مدل جمعیت WorldPop امتیازدهی شده است. صنف مورد نظر خود را انتخاب کنید یا مستقیم وارد نقشه زنده شوید.`,
        lang
      )}</p>
      <div class="hb-hero-actions">
        <a class="hb-btn hb-btn-primary" href="/jabio.html?c=${c.id}">${biSpan(`Analyze ${c.en} on live map`, `تحلیل زنده ${c.fa} روی نقشه`, lang)}</a>
        <a class="hb-btn hb-btn-ghost" href="/compare.html">${biSpan('Compare candidate shops', 'مقایسه چند مغازه', lang)}</a>
      </div>
    </div>

    <div class="hb-split-media">
      <img src="${IMG.cities}" alt="${escAttr(bi(`Urban commercial blocks and avenues in ${c.en}`, `بافت شهری و محورهای تجاری ${c.fa}`, lang))}" referrerpolicy="no-referrer" loading="eager">
      <div class="hb-media-scrim" aria-hidden="true"></div>
      <div class="hb-media-overlay">
        <div class="hb-overlay-grid">
          <div class="hb-overlay-stat">
            <b>${biNum(c.pois, lang)}</b>
            <span>${biSpan('Mapped places', 'مکان ثبت‌شده', lang)}</span>
          </div>
          <div class="hb-overlay-stat">
            <b>${biNum(c.buildings, lang)}</b>
            <span>${biSpan('Buildings', 'ساختمان', lang)}</span>
          </div>
          <div class="hb-overlay-stat">
            <b>${biNum(Math.round(c.people / 1000), lang, 'k', ' هزار')}</b>
            <span>${biSpan('Residents', 'جمعیت مدل', lang)}</span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan(`Score by Business Category in ${c.en}`, `امتیاز برترین محدوده به تفکیک صنف در ${c.fa}`, lang)}</h2>
      <p class="hb-sec-sub">${biSpan('Top 250 m block score (0–100) computed live from Jabio Engine', 'امتیاز بهترین بلوک ۲۵۰ متری (۰ تا ۱۰۰) از موتور واقعی جابیو', lang)}</p>
    </div>
    <div class="hb-grid-3">${catCards}</div>
  </section>

  ${overview.hotspots.length ? `
  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan(`High-Demand Neighbourhoods in ${c.en}`, `محله‌های پرتقاضا در ${c.fa}`, lang)}</h2>
      <p class="hb-sec-sub">${biSpan('Jump directly to exact coordinates inside the live analyzer', 'باز کردن مختصات دقیق هر محله روی نقشه تحلیل', lang)}</p>
    </div>
    <div class="hb-grid-3">${hotspotCards}</div>
  </section>` : ''}

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('Explore Other Iranian Cities', 'تحلیل سایر شهرهای ایران', lang)}</h2>
      <a class="hb-link" href="/cities">${biSpan('All 15 cities →', 'همه ۱۵ شهر ←', lang)}</a>
    </div>
    <div class="hb-link-grid">${siblingCities}</div>
  </section>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: `/cities/${c.id}`,
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    activeNav: 'cities',
    schemaGraph,
    bodyHtml
  });
}

// ── 3. /cities/:city/:category — Programmatic SEO City × Business Page ──────
function renderCityCategory(req, baseUrl, lang, cityId, categoryId) {
  const analysis = getCityCategoryAnalysis(cityId, categoryId);
  if (!analysis) return null;

  const { city: c, biz: b, areas, weights } = analysis;
  const titleEn = `Best Area to Open a ${b.en} in ${c.en} – Location Score & Map | Jabio`;
  const titleFa = `بهترین محله برای باز کردن ${b.fa} در ${c.fa} – امتیاز مکانی و نقشه | جابیو`;
  const descEn = `Where to open a ${b.en.toLowerCase()} in ${c.en}? Compare the top ${areas.length} ranked neighbourhoods scored from ${fmtNum(analysis.poiCount, 'en')} mapped rivals, local demand, population, and access on Jabio.`;
  const descFa = `بهترین منطقه برای راه‌اندازی ${b.fa} در ${c.fa} کجاست؟ بررسی ${fmtNum(areas.length, 'fa')} محدوده برتر بر اساس ${fmtNum(analysis.poiCount, 'fa')} رقیب ثبت‌شده، تراکم جمعیت، تقاضا و دسترسی روی نقشه جابیو.`;

  function renderPillarBars(a) {
    return `
      <div class="hb-bars">
        <div class="hb-bar-row">
          <div class="hb-bar-lbl"><span>${biSpan(`Population (${weights.pop}%)`, `جمعیت (${fmtNum(weights.pop, 'fa')}٪)`, lang)}</span><b>${biNum(a.pop, lang)}</b></div>
          <div class="hb-bar-track"><div class="hb-bar-fill" style="width:${a.pop}%"></div></div>
        </div>
        <div class="hb-bar-row">
          <div class="hb-bar-lbl"><span>${biSpan(`Demand (${weights.demand}%)`, `تقاضا (${fmtNum(weights.demand, 'fa')}٪)`, lang)}</span><b>${biNum(a.demand, lang)}</b></div>
          <div class="hb-bar-track"><div class="hb-bar-fill" style="width:${a.demand}%"></div></div>
        </div>
        <div class="hb-bar-row">
          <div class="hb-bar-lbl"><span>${biSpan(`Access (${weights.access}%)`, `دسترسی (${fmtNum(weights.access, 'fa')}٪)`, lang)}</span><b>${biNum(a.access, lang)}</b></div>
          <div class="hb-bar-track"><div class="hb-bar-fill" style="width:${a.access}%"></div></div>
        </div>
        <div class="hb-bar-row">
          <div class="hb-bar-lbl"><span>${biSpan(`Room beside rivals (${weights.comp}%)`, `ظرفیت کنار رقبا (${fmtNum(weights.comp, 'fa')}٪)`, lang)}</span><b>${biNum(a.room, lang)}</b></div>
          <div class="hb-bar-track"><div class="hb-bar-fill" style="width:${a.room}%"></div></div>
        </div>
      </div>`;
  }

  const topArea = areas[0];
  const restAreas = areas.slice(1);

  let topSpotHtml = '';
  if (topArea) {
    const lv = LEVEL_LABELS[topArea.level] || LEVEL_LABELS.mixed;
    const qd = QUAD_LABELS[topArea.quadrant] || QUAD_LABELS.watch;
    const placeEn = topArea.place ? `Near ${topArea.place.en}` : `Zone #1 (${topArea.lat}, ${topArea.lon})`;
    const placeFa = topArea.place ? `محدوده ${topArea.place.fa}` : 'محدوده برتر شماره ۱';
    const mapHref = `/jabio.html?c=${c.id}&lat=${topArea.lat}&lon=${topArea.lon}&r=1000&t=${b.id}`;
    const reportHref = `/report.html?c=${c.id}&lat=${topArea.lat}&lon=${topArea.lon}&r=1000&t=${b.id}`;

    topSpotHtml = `
      <article class="hb-card hb-top-spot">
        <div class="hb-spot-lead">
          ${renderScoreRing(topArea.score, topArea.level, lang, 'lg')}
          <div>
            <div class="hb-rank">${biSpan(`Top Ranked #1 · ${lv.en} · ${qd.en}`, `رتبه اول · ${lv.fa} · ${qd.fa}`, lang)}</div>
            <h3 class="hb-area-title" style="font-size:23px">${biSpan(placeEn, placeFa, lang)}</h3>
            <div class="hb-area-meta">${biSpan(
              `Plausible range ${topArea.range.low}–${topArea.range.high} · ${topArea.directRivals} rivals · ${topArea.transitStops} transit stops`,
              `بازه محتمل ${fmtNum(topArea.range.low, 'fa')} تا ${fmtNum(topArea.range.high, 'fa')} · ${fmtNum(topArea.directRivals, 'fa')} رقیب · ${fmtNum(topArea.transitStops, 'fa')} ایستگاه`,
              lang
            )}</div>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px">
              <a class="hb-btn hb-btn-primary" href="${mapHref}">${biSpan('Inspect on live map', 'بررسی دقیق روی نقشه', lang)}</a>
              <a class="hb-btn hb-btn-ghost" href="${reportHref}">${biSpan('Printable report', 'گزارش چاپی', lang)}</a>
            </div>
          </div>
        </div>
        <div>
          ${renderPillarBars(topArea)}
          <div class="hb-area-foot" style="margin-top:16px">
            <span>${biSpan(`~${fmtNum(topArea.residents, 'en')} estimated residents within 1 km`, `حدود ${fmtNum(topArea.residents, 'fa')} ساکن در شعاع ۱ کیلومتر`, lang)}</span>
            <span>${biSpan('1,000 m Gaussian catchment', 'شعاع تحلیل ۱۰۰۰ متر', lang)}</span>
          </div>
        </div>
      </article>`;
  }

  const areaCards = restAreas.map((a) => {
    const lv = LEVEL_LABELS[a.level] || LEVEL_LABELS.mixed;
    const qd = QUAD_LABELS[a.quadrant] || QUAD_LABELS.watch;
    const placeEn = a.place ? `Near ${a.place.en}` : `Zone #${a.rank} (${a.lat}, ${a.lon})`;
    const placeFa = a.place ? `محدوده ${a.place.fa}` : `محدوده شماره ${fmtNum(a.rank, 'fa')}`;
    const mapHref = `/jabio.html?c=${c.id}&lat=${a.lat}&lon=${a.lon}&r=1000&t=${b.id}`;
    const reportHref = `/report.html?c=${c.id}&lat=${a.lat}&lon=${a.lon}&r=1000&t=${b.id}`;

    return `
      <article class="hb-card hb-area-card">
        <div class="hb-area-head">
          <div>
            <div class="hb-rank">${biSpan(`Rank #${a.rank} · ${lv.en} · ${qd.en}`, `رتبه ${fmtNum(a.rank, 'fa')} · ${lv.fa} · ${qd.fa}`, lang)}</div>
            <h3 class="hb-area-title">${biSpan(placeEn, placeFa, lang)}</h3>
            <div class="hb-area-meta">${biSpan(
              `Range ${a.range.low}–${a.range.high} · ${a.directRivals} rivals · ${a.transitStops} stops`,
              `بازه ${fmtNum(a.range.low, 'fa')}–${fmtNum(a.range.high, 'fa')} · ${fmtNum(a.directRivals, 'fa')} رقیب · ${fmtNum(a.transitStops, 'fa')} ایستگاه`,
              lang
            )}</div>
          </div>
          ${renderScoreRing(a.score, a.level, lang)}
        </div>
        ${renderPillarBars(a)}
        <div class="hb-area-foot">
          <span>${biSpan(`~${fmtNum(a.residents, 'en')} residents / 1 km`, `حدود ${fmtNum(a.residents, 'fa')} ساکن در ۱ کیلومتر`, lang)}</span>
          <div style="display:flex;gap:14px">
            <a class="hb-link" href="${mapHref}">${biSpan('Analyze on map →', 'بررسی روی نقشه ←', lang)}</a>
            <a class="hb-muted-link" href="${reportHref}">${biSpan('Report', 'گزارش', lang)}</a>
          </div>
        </div>
      </article>`;
  }).join('');

  const otherCats = BIZ_TYPES.map((other) => {
    const cls = other.id === b.id ? 'hb-link-item active' : 'hb-link-item';
    return `<a class="${cls}" href="/cities/${c.id}/${other.id}">${biSpan(other.en, other.fa, lang)}</a>`;
  }).join('');

  const otherCities = CITIES.map((other) => {
    const cls = other.id === c.id ? 'hb-link-item active' : 'hb-link-item';
    return `<a class="${cls}" href="/cities/${other.id}/${b.id}">${biSpan(`${b.en} in ${other.en}`, `${b.fa} در ${other.fa}`, lang)}</a>`;
  }).join('');

  const schemaGraph = [
    {
      '@type': 'WebPage',
      name: bi(titleEn, titleFa, lang),
      description: bi(descEn, descFa, lang),
      url: `${baseUrl}/cities/${c.id}/${b.id}`,
      inLanguage: ['en', 'fa']
    },
    {
      '@type': 'ItemList',
      name: bi(`Top ${b.en} Areas in ${c.en}`, `برترین مناطق ${b.fa} در ${c.fa}`, lang),
      itemListElement: areas.map((a) => ({
        '@type': 'ListItem',
        position: a.rank,
        name: a.place ? bi(a.place.en, a.place.fa, lang) : `#${a.rank}`,
        url: `${baseUrl}/jabio.html?c=${c.id}&lat=${a.lat}&lon=${a.lon}&r=1000&t=${b.id}`
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jabio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: bi('Cities', 'شهرها', lang), item: `${baseUrl}/cities` },
        { '@type': 'ListItem', position: 3, name: bi(c.en, c.fa, lang), item: `${baseUrl}/cities/${c.id}` },
        { '@type': 'ListItem', position: 4, name: bi(b.en, b.fa, lang), item: `${baseUrl}/cities/${c.id}/${b.id}` }
      ]
    }
  ];

  const bodyHtml = `
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([
    { en: 'Home', fa: 'خانه', href: '/' },
    { en: 'Cities', fa: 'شهرها', href: '/cities' },
    { en: c.en, fa: c.fa, href: `/cities/${c.id}` },
    { en: b.en, fa: b.fa }
  ], lang)}

  <header class="hb-split-hero">
    <div class="hb-split-copy">
      <p class="hb-kicker">${renderCoverageLabel(analysis.coverage, lang)} <span aria-hidden="true">·</span> ${biSpan(`1 km radius · Snapshot ${analysis.snapshot}`, `شعاع ۱ کیلومتر · نسخه ${analysis.snapshot}`, lang)}</p>
      <h1 class="hb-h1">${biSpan(`Best Areas to Open a ${b.en} in ${c.en}`, `بهترین محله برای باز کردن ${b.fa} در ${c.fa}`, lang)}</h1>
      <p class="hb-lead">${biSpan(b.descEn, b.descFa, lang)}</p>
      <div class="hb-hero-actions">
        <a class="hb-btn hb-btn-primary" href="/jabio.html?c=${c.id}&t=${b.id}&run=1">${biSpan(`Open ${b.en} heatmap`, `نقشه حرارتی ${b.fa} در ${c.fa}`, lang)}</a>
        <a class="hb-btn hb-btn-ghost" href="/cities/${c.id}">${biSpan(`All categories in ${c.en}`, `همه اصناف در ${c.fa}`, lang)}</a>
      </div>
    </div>

    <div class="hb-split-media">
      <img src="${IMG.storefront}" alt="${escAttr(bi(`Commercial storefront and urban street environment for ${b.en} in ${c.en}`, `نمای تجاری و خیابان مناسب برای ${b.fa} در ${c.fa}`, lang))}" referrerpolicy="no-referrer" loading="eager">
      <div class="hb-media-scrim" aria-hidden="true"></div>
      <div class="hb-media-overlay">
        <div class="hb-overlay-score-row">
          <div>
            <div style="font-size:12px;color:rgba(255,255,255,.72);margin-bottom:4px">${biSpan(`Top block in ${c.en}`, `بالاترین امتیاز در ${c.fa}`, lang)}</div>
            <div style="font-size:17px;font-weight:700">${biSpan(`${fmtNum(analysis.poiCount, 'en')} mapped ${b.pluralEn.toLowerCase()}`, `${fmtNum(analysis.poiCount, 'fa')} ${b.pluralFa} ثبت‌شده`, lang)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.68);margin-top:4px">${biSpan(
              `Weights: Pop ${weights.pop}% · Demand ${weights.demand}% · Access ${weights.access}% · Room ${weights.comp}%`,
              `وزن‌ها: جمعیت ${fmtNum(weights.pop, 'fa')}٪ · تقاضا ${fmtNum(weights.demand, 'fa')}٪ · دسترسی ${fmtNum(weights.access, 'fa')}٪ · رقابت ${fmtNum(weights.comp, 'fa')}٪`,
              lang
            )}</div>
          </div>
          ${renderScoreRing(analysis.bestScore, topArea ? topArea.level : 'strong', lang)}
        </div>
      </div>
    </div>
  </header>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan(`Top ${areas.length} Ranked Areas for ${b.en} in ${c.en}`, `${fmtNum(areas.length, 'fa')} محدوده برتر برای ${b.fa} در ${c.fa}`, lang)}</h2>
      <p class="hb-sec-sub">${biSpan('Balanced competition strategy · Real OSM + Overture + WorldPop counts', 'استراتژی رقابت متعادل · محاسبه‌شده از داده‌های واقعی شهری', lang)}</p>
    </div>
    ${topSpotHtml}
    <div class="hb-grid-2">${areaCards}</div>
  </section>

  <section class="hb-sec">
    <div class="hb-advisory">
      <div>
        <h2 class="hb-h2" style="margin-bottom:10px">${biSpan('Before you sign a lease in this area', 'پیش از امضای قرارداد اجاره در این محدوده', lang)}</h2>
        <p style="margin:0;font-size:14.5px;line-height:1.85;color:var(--c-text2)">${biSpan(
          `Jabio scores compare each block against the busiest parts of ${c.en} (top 2% = 100). Rent, shop frontage, and real foot traffic are not included—use these ${areas.length} areas as your field-visit shortlist and stress-test rent break-even before committing.`,
          `امتیازهای جابیو هر بلوک را با پررونق‌ترین بخش‌های ${c.fa} مقایسه می‌کنند (۲٪ برتر = ۱۰۰). اجاره، برِ مغازه و تردد واقعی پیاده در مدل نیست؛ از این ${fmtNum(areas.length, 'fa')} محدوده برای ساخت فهرست کوتاه بازدید میدانی استفاده کنید و نقطه سربه‌سر اجاره را بسنجید.`,
          lang
        )}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;min-width:220px">
        <a class="hb-btn hb-btn-primary" href="/methodology">${biSpan('Scoring methodology', 'روش‌شناسی امتیازدهی', lang)}</a>
        <a class="hb-btn hb-btn-ghost" href="/blog/rent-break-even-calculation">${biSpan('Rent break-even guide', 'محاسبه نقطه سربه‌سر اجاره', lang)}</a>
      </div>
    </div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan(`Other Business Categories in ${c.en}`, `سایر اصناف در ${c.fa}`, lang)}</h2>
    </div>
    <div class="hb-link-grid">${otherCats}</div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan(`Explore ${b.en} in Other Cities`, `مکان‌یابی ${b.fa} در شهرهای دیگر`, lang)}</h2>
    </div>
    <div class="hb-link-grid">${otherCities}</div>
  </section>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: `/cities/${c.id}/${b.id}`,
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    activeNav: 'cities',
    schemaGraph,
    bodyHtml
  });
}

// ── 4. /blog — Editorial Magazine Front Page ────────────────────────────────
function renderBlogIndex(req, baseUrl, lang) {
  const titleEn = 'Location Intelligence Blog & Retail Field Guides – Jabio';
  const titleFa = 'وبلاگ و مقالات آموزشی مکان‌یابی و انتخاب مغازه – جابیو';
  const descEn = 'Practical, data-grounded articles on choosing commercial shop locations in Iran, calculating rent break-even, evaluating foot traffic, and avoiding commercial leasing mistakes.';
  const descFa = 'مقالات کاربردی و تخصصی درباره انتخاب موقعیت مغازه در ایران، محاسبه نقطه سربه‌سر اجاره، بررسی تردد پیاده و اشتباهات رایج در اجاره ملک تجاری.';

  const catMap = new Map(BLOG_CATEGORIES.map((c) => [c.id, c]));
  const lead = BLOG_POSTS[0];
  const rest = BLOG_POSTS.slice(1);
  const leadCat = catMap.get(lead.category);
  const leadCover = BLOG_COVERS[lead.slug] || IMG.iranStorefront;

  const filterButtons = BLOG_CATEGORIES.map((cat, i) =>
    `<button type="button" class="ct-chip${i === 0 ? ' on' : ''}" data-blog-cat="${cat.id}">${biSpan(cat.en, cat.fa, lang)}</button>`
  ).join('');

  const postCards = rest.map((post) => {
    const cat = catMap.get(post.category);
    const cover = BLOG_COVERS[post.slug] || IMG.blueprint;
    return `
      <a class="hb-card hb-post-card" href="/blog/${post.slug}" data-blog-card data-cat="${post.category}" data-q="${escAttr(`${post.title.en} ${post.title.fa} ${post.excerpt.en} ${post.excerpt.fa}`.toLowerCase())}">
        <div class="hb-post-thumb">
          <img src="${cover}" alt="${escAttr(bi(post.title.en, post.title.fa, lang))}" referrerpolicy="no-referrer" loading="lazy">
        </div>
        <div class="hb-post-body">
          <div class="hb-meta-row">
            <span class="hb-meta-accent">${biSpan(cat.en, cat.fa, lang)}</span>
            <span aria-hidden="true">·</span>
            <span>${biSpan(post.date, post.dateFa, lang)}</span>
            <span aria-hidden="true">·</span>
            <span>${biSpan(`${post.readMins} min read`, `${fmtNum(post.readMins, 'fa')} دقیقه`, lang)}</span>
          </div>
          <h2 class="hb-post-title">${biSpan(post.title.en, post.title.fa, lang)}</h2>
          <p class="hb-post-excerpt">${biSpan(post.excerpt.en, post.excerpt.fa, lang)}</p>
          <span class="hb-link" style="font-size:13.5px">${biSpan('Read article →', 'مطالعه مقاله ←', lang)}</span>
        </div>
      </a>`;
  }).join('');

  const schemaGraph = [
    {
      '@type': 'Blog',
      name: bi(titleEn, titleFa, lang),
      description: bi(descEn, descFa, lang),
      url: `${baseUrl}/blog`,
      inLanguage: ['en', 'fa'],
      blogPost: BLOG_POSTS.map((p) => ({
        '@type': 'BlogPosting',
        headline: bi(p.title.en, p.title.fa, lang),
        datePublished: p.date,
        url: `${baseUrl}/blog/${p.slug}`
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jabio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: bi('Blog', 'وبلاگ', lang), item: `${baseUrl}/blog` }
      ]
    }
  ];

  const bodyHtml = `
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([{ en: 'Home', fa: 'خانه', href: '/' }, { en: 'Blog', fa: 'وبلاگ' }], lang)}

  <header class="hb-hero-clean">
    <p class="hb-kicker">${biSpan('Jabio Editorial · Field Guides', 'تحریریه جابیو · راهنماهای عملی مکان‌یابی', lang)}</p>
    <h1 class="hb-h1">${biSpan('Location Intelligence & Commercial Leasing Guides', 'مقالات آموزشی انتخاب مغازه و تحلیل بازار شهری', lang)}</h1>
    <p class="hb-lead">${biSpan(
      'Plain-spoken playbooks for choosing a commercial storefront, stress-testing rent against neighbourhood demand, and reading urban data before signing a lease.',
      'راهنماهای عملی و داده‌محور برای انتخاب موقعیت مغازه، سنجش اجاره با تقاضای واقعی محله، تحلیل تردد پیاده و پرهیز از اشتباهات پرهزینه در اجاره ملک تجاری.',
      lang
    )}</p>
  </header>

  <section class="hb-card hb-mag-lead" data-blog-card data-cat="${lead.category}" data-q="${escAttr(`${lead.title.en} ${lead.title.fa} ${lead.excerpt.en} ${lead.excerpt.fa}`.toLowerCase())}">
    <div class="hb-mag-media">
      <img src="${leadCover}" alt="${escAttr(bi(lead.title.en, lead.title.fa, lang))}" referrerpolicy="no-referrer" loading="eager">
    </div>
    <div class="hb-mag-content">
      <div class="hb-meta-row">
        <span class="hb-meta-accent">${biSpan(`Featured · ${leadCat.en}`, `مقاله شاخص · ${leadCat.fa}`, lang)}</span>
        <span aria-hidden="true">·</span>
        <span>${biSpan(lead.date, lead.dateFa, lang)}</span>
        <span aria-hidden="true">·</span>
        <span>${biSpan(`${lead.readMins} min read`, `${fmtNum(lead.readMins, 'fa')} دقیقه مطالعه`, lang)}</span>
      </div>
      <h2 class="hb-lead-title">${biSpan(lead.title.en, lead.title.fa, lang)}</h2>
      <p style="font-size:15px;line-height:1.85;color:var(--c-text2);margin:0">${biSpan(lead.excerpt.en, lead.excerpt.fa, lang)}</p>
      <div class="hb-takeaway">
        <span class="hb-takeaway-lbl">${biSpan('Key takeaway', 'نکته کلیدی مقاله', lang)}</span>
        ${biSpan(lead.keyTakeaway.en, lead.keyTakeaway.fa, lang)}
      </div>
      <div>
        <a class="hb-btn hb-btn-primary" href="/blog/${lead.slug}">${biSpan('Read full guide', 'مطالعه راهنمای کامل', lang)}</a>
      </div>
    </div>
  </section>

  <div class="ct-bar" data-blog-filter>
    <label class="ct-search">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      <input type="search" id="blogSearch" data-en-placeholder="Search articles…" data-fa-placeholder="جستجو در مقالات…" placeholder="${escAttr(bi('Search articles…', 'جستجو در مقالات…', lang))}">
    </label>
    <div class="ct-chips" role="group" aria-label="Article categories">${filterButtons}</div>
  </div>

  <section class="hb-grid-3" id="blogGrid">${postCards}</section>
  <div class="ct-empty" id="blogEmpty" hidden>${biSpan('No articles match your filter.', 'مقاله‌ای با این فیلتر پیدا نشد.', lang)}</div>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: '/blog',
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    ogImage: leadCover,
    activeNav: 'blog',
    schemaGraph,
    bodyHtml,
    extraScripts: '<script src="/assets/hub-client.js?v=3"></script>'
  });
}

// ── 5. /blog/:slug — Asymmetric 70/30 Editorial Reading Canvas ──────────────
function renderBlogArticle(req, baseUrl, lang, slug) {
  const post = BLOG_BY_SLUG.get(slug);
  if (!post) return null;

  const cat = BLOG_CATEGORIES.find((c) => c.id === post.category) || BLOG_CATEGORIES[0];
  const cover = BLOG_COVERS[post.slug] || IMG.iranStorefront;
  const titleEn = `${post.title.en} – Jabio Blog`;
  const titleFa = `${post.title.fa} – وبلاگ جابیو`;
  const descEn = post.excerpt.en;
  const descFa = post.excerpt.fa;

  const tocItems = post.sections.map((s) => ({
    id: s.id,
    en: s.heading.en,
    fa: s.heading.fa
  }));
  if (post.checklist) {
    tocItems.push({ id: 'field-checklist', en: post.checklist.titleEn, fa: post.checklist.titleFa });
  }
  if (post.faq && post.faq.length) {
    tocItems.push({ id: 'faq', en: 'Frequently Asked Questions', fa: 'سوالات متداول' });
  }
  const tocLinks = tocItems.map((t) =>
    `<a href="#${escAttr(t.id)}">${biSpan(t.en, t.fa, lang)}</a>`
  ).join('');

  const sectionsHtml = post.sections.map((s) => {
    const paras = (s.paragraphs && s.paragraphs.en ? s.paragraphs.en : []).map((pEn, idx) => {
      const pFa = s.paragraphs.fa[idx] || pEn;
      return `<p>${biSpan(pEn, pFa, lang)}</p>`;
    }).join('');

    const bullets = s.bullets
      ? `<ul>${s.bullets.en.map((bEn, idx) => `<li>${biSpan(bEn, s.bullets.fa[idx] || bEn, lang)}</li>`).join('')}</ul>`
      : '';

    const tableHtml = s.table
      ? `<div class="hb-table-wrap">
          <table class="hb-compare-table">
            <caption>${biSpan(s.table.captionEn, s.table.captionFa, lang)}</caption>
            <thead>
              <tr>${s.table.headersEn.map((hEn, i) => `<th scope="col">${biSpan(hEn, s.table.headersFa[i] || hEn, lang)}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${s.table.rowsEn.map((rowEn, rIdx) => {
                const rowFa = s.table.rowsFa[rIdx] || rowEn;
                return `<tr>${rowEn.map((cellEn, cIdx) => (cIdx === 0
                  ? `<th scope="row">${biSpan(cellEn, rowFa[cIdx] || cellEn, lang)}</th>`
                  : `<td>${biSpan(cellEn, rowFa[cIdx] || cellEn, lang)}</td>`)).join('')}</tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>`
      : '';

    const tipHtml = s.tip
      ? `<div class="hb-pro-tip">
          <span class="hb-pro-tip-lbl">${biSpan(s.tip.labelEn, s.tip.labelFa, lang)}</span>
          <p>${biSpan(s.tip.en, s.tip.fa, lang)}</p>
        </div>`
      : '';

    const linksHtml = s.internalLinks && s.internalLinks.length
      ? `<div class="hb-inline-links" aria-label="Related Jabio tools">
          ${s.internalLinks.map((lnk) => `<a class="hb-inline-link" href="${escAttr(lnk.href)}">${biSpan(lnk.en, lnk.fa, lang)}</a>`).join('')}
        </div>`
      : '';

    return `
      <section id="${escAttr(s.id)}">
        <h2>${biSpan(s.heading.en, s.heading.fa, lang)}</h2>
        ${paras}
        ${bullets}
        ${tableHtml}
        ${tipHtml}
        ${linksHtml}
      </section>`;
  }).join('');

  const checklistHtml = post.checklist
    ? `<section id="field-checklist" class="hb-checklist-box" data-checklist-slug="${escAttr(post.slug)}">
        <div class="hb-check-head">
          <div>
            <h2 style="margin:0 0 6px">${biSpan(post.checklist.titleEn, post.checklist.titleFa, lang)}</h2>
            <p class="hb-check-sub">${biSpan(post.checklist.subtitleEn, post.checklist.subtitleFa, lang)}</p>
          </div>
          <div class="hb-check-meta">
            <span class="hb-check-count" data-checklist-count>${biSpan(`0 of ${post.checklist.items.length} done`, `۰ از ${fmtNum(post.checklist.items.length, 'fa')} مورد بررسی شد`, lang)}</span>
            <button type="button" class="hb-check-reset" data-checklist-reset>${biSpan('Reset', 'پاک‌سازی', lang)}</button>
          </div>
        </div>
        <div class="hb-check-bar" aria-hidden="true"><i data-checklist-bar style="width:0%"></i></div>
        <div class="hb-check-list">
          ${post.checklist.items.map((item) => `
            <label class="hb-check-item">
              <input type="checkbox" data-check-item="${escAttr(item.id)}">
              <span>${biSpan(item.en, item.fa, lang)}</span>
            </label>`).join('')}
        </div>
      </section>`
    : '';

  const faqHtml = post.faq && post.faq.length
    ? `<section id="faq" class="hb-faq-sec">
        <h2>${biSpan('Frequently Asked Questions', 'سوالات متداول', lang)}</h2>
        <div class="hb-faq-list">
          ${post.faq.map((f, idx) => `
            <details class="hb-faq-item"${idx === 0 ? ' open' : ''}>
              <summary>${biSpan(f.qEn, f.qFa, lang)}</summary>
              <div class="hb-faq-ans">${biSpan(f.aEn, f.aFa, lang)}</div>
            </details>`).join('')}
        </div>
      </section>`
    : '';

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3).map((r) => {
    const rCover = BLOG_COVERS[r.slug] || IMG.iranStorefront;
    return `
      <a class="hb-card hb-post-card" href="/blog/${r.slug}">
        <div class="hb-post-thumb">
          <img src="${rCover}" alt="${escAttr(bi(r.title.en, r.title.fa, lang))}" referrerpolicy="no-referrer" loading="lazy">
        </div>
        <div class="hb-post-body">
          <div class="hb-meta-row"><span>${biSpan(r.date, r.dateFa, lang)}</span><span aria-hidden="true">·</span><span>${biSpan(`${r.readMins} min`, `${fmtNum(r.readMins, 'fa')} دقیقه`, lang)}</span></div>
          <strong class="hb-post-title" style="font-size:16px">${biSpan(r.title.en, r.title.fa, lang)}</strong>
        </div>
      </a>`;
  }).join('');

  const langKey = lang === 'fa' ? 'fa' : 'en';
  const fullText = [
    post.title[langKey],
    post.excerpt[langKey],
    post.keyTakeaway[langKey],
    ...post.sections.flatMap((s) => [
      s.heading[langKey],
      ...(s.paragraphs ? s.paragraphs[langKey] : []),
      ...(s.bullets ? s.bullets[langKey] : []),
      ...(s.tip ? [s.tip[langKey]] : [])
    ]),
    ...(post.faq ? post.faq.flatMap((f) => [lang === 'fa' ? f.qFa : f.qEn, lang === 'fa' ? f.aFa : f.aEn]) : [])
  ].join(' ');
  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;

  const schemaGraph = [
    {
      '@type': 'BlogPosting',
      headline: bi(post.title.en, post.title.fa, lang),
      description: bi(post.excerpt.en, post.excerpt.fa, lang),
      image: `${baseUrl}${cover}`,
      wordCount,
      datePublished: post.date,
      dateModified: post.date,
      author: { '@type': 'Organization', name: 'Jabio' },
      publisher: { '@type': 'Organization', name: 'Jabio', logo: { '@type': 'ImageObject', url: `${baseUrl}/assets/logo.png` } },
      mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
      inLanguage: lang === 'fa' ? 'fa-IR' : 'en'
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jabio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: bi('Blog', 'وبلاگ', lang), item: `${baseUrl}/blog` },
        { '@type': 'ListItem', position: 3, name: bi(post.title.en, post.title.fa, lang), item: `${baseUrl}/blog/${post.slug}` }
      ]
    }
  ];

  if (post.faq && post.faq.length) {
    schemaGraph.push({
      '@type': 'FAQPage',
      mainEntity: post.faq.map((f) => ({
        '@type': 'Question',
        name: bi(f.qEn, f.qFa, lang),
        acceptedAnswer: {
          '@type': 'Answer',
          text: bi(f.aEn, f.aFa, lang)
        }
      }))
    });
  }

  const bodyHtml = `
<div class="hb-progress" aria-hidden="true"><div class="hb-progress-bar" id="readProgress"></div></div>
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([
    { en: 'Home', fa: 'خانه', href: '/' },
    { en: 'Blog', fa: 'وبلاگ', href: '/blog' },
    { en: post.title.en, fa: post.title.fa }
  ], lang)}

  <header style="max-width:860px">
    <p class="hb-kicker">
      <span class="hb-meta-accent">${biSpan(cat.en, cat.fa, lang)}</span>
      <span aria-hidden="true">·</span>
      <span>${biSpan(post.date, post.dateFa, lang)}</span>
      <span aria-hidden="true">·</span>
      <span>${biSpan(`${post.readMins} min read`, `${fmtNum(post.readMins, 'fa')} دقیقه مطالعه`, lang)}</span>
    </p>
    <h1 class="hb-h1">${biSpan(post.title.en, post.title.fa, lang)}</h1>
    <p class="hb-lead">${biSpan(post.excerpt.en, post.excerpt.fa, lang)}</p>
  </header>

  <figure class="hb-article-cover">
    <img src="${cover}" alt="${escAttr(bi(post.title.en, post.title.fa, lang))}" referrerpolicy="no-referrer" loading="eager">
  </figure>

  <div class="hb-article-grid">
    <article class="hb-prose" data-reading-article>
      <div class="hb-takeaway" style="margin-bottom:32px">
        <span class="hb-takeaway-lbl">${biSpan('Quick summary', 'خلاصه خودمونی و سریع', lang)}</span>
        ${biSpan(post.keyTakeaway.en, post.keyTakeaway.fa, lang)}
      </div>
      ${sectionsHtml}
      ${checklistHtml}
      ${faqHtml}
    </article>

    <aside class="hb-aside">
      <div class="hb-card">
        <div style="font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:10px">${biSpan('In this guide', 'فهرست مطالب', lang)}</div>
        <nav class="hb-toc" id="articleToc">${tocLinks}</nav>
      </div>
      <div class="hb-card" style="background:radial-gradient(ellipse 90% 80% at 100% 0%,rgba(172,247,240,.14),transparent 65%),var(--hb-surface)">
        <div style="font-size:13px;font-weight:700;color:var(--hb-teal);margin-bottom:8px">${biSpan('Put it into practice', 'اجرا روی نقشه واقعی', lang)}</div>
        <p style="font-size:13.5px;line-height:1.75;color:var(--c-text2);margin:0 0 16px">${biSpan('Test these numbers directly on real Iranian city blocks in Jabio.', 'این شاخص‌ها رو همین الان روی بلوک‌های واقعی شهرتون در جابیو امتحان کنید.', lang)}</p>
        <a class="hb-btn hb-btn-primary" style="width:100%" href="${escAttr(post.cta.href)}">${biSpan(post.cta.en, post.cta.fa, lang)}</a>
      </div>
    </aside>
  </div>

  <section class="hb-sec" style="margin-top:60px">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('Continue Reading', 'مقالات مرتبط', lang)}</h2>
      <a class="hb-link" href="/blog">${biSpan('All articles →', 'همه مقالات ←', lang)}</a>
    </div>
    <div class="hb-grid-3">${related}</div>
  </section>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: `/blog/${post.slug}`,
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    ogType: 'article',
    ogImage: cover,
    activeNav: 'blog',
    schemaGraph,
    bodyHtml,
    extraScripts: '<script src="/assets/hub-client.js?v=3"></script>'
  });
}

// ── 6. /methodology — Scientific Spatial Model & Validation ─────────────────
function renderMethodology(req, baseUrl, lang) {
  const weights = getMethodologyWeights();
  const titleEn = 'Scoring Methodology, Formula & Model Validation – Jabio';
  const titleFa = 'روش‌شناسی علمی، فرمول امتیازدهی و دقت مدل – جابیو';
  const descEn = 'Full technical documentation of Jabio’s Method v2 scoring formula: 250 m spatial grid, Gaussian distance decay, per-business weights, saturation curve, validation checks, and honest limits.';
  const descFa = 'مستندات کامل و شفاف فرمول امتیازدهی جابیو (نسخه ۲): شبکه ۲۵۰ متری، افت فاصله گاوسی، جدول وزن هر ۱۰ صنف، منحنی اشباع رقبا، اعتبارسنجی مدل و محدودیت‌های صادقانه.';

  const weightRows = weights.map((row) => {
    const driversStrEn = row.topDrivers.map((d) => `${(DRIVER_LABELS[d.key] || { en: d.key }).en} (${d.pct}%)`).join(', ');
    const driversStrFa = row.topDrivers.map((d) => `${(DRIVER_LABELS[d.key] || { fa: d.key }).fa} (${fmtNum(d.pct, 'fa')}٪)`).join('، ');
    return `
      <tr>
        <th scope="row"><a href="/cities/tehran/${row.biz.id}">${biSpan(row.biz.en, row.biz.fa, lang)}</a></th>
        <td>
          <div class="hb-wstack" aria-hidden="true">
            <span class="hb-ws-pop" style="width:${row.pop}%"></span>
            <span class="hb-ws-dem" style="width:${row.demand}%"></span>
            <span class="hb-ws-acc" style="width:${row.access}%"></span>
            <span class="hb-ws-cmp" style="width:${row.comp}%"></span>
          </div>
        </td>
        <td>${biNum(row.pop, lang, '%', '٪')}</td>
        <td>${biNum(row.demand, lang, '%', '٪')}</td>
        <td>${biNum(row.access, lang, '%', '٪')}</td>
        <td>${biNum(row.comp, lang, '%', '٪')}</td>
        <td>${biSpan(driversStrEn, driversStrFa, lang)}</td>
      </tr>`;
  }).join('');

  const schemaGraph = [
    {
      '@type': 'TechArticle',
      headline: bi(titleEn, titleFa, lang),
      description: bi(descEn, descFa, lang),
      url: `${baseUrl}/methodology`,
      inLanguage: ['en', 'fa'],
      author: { '@type': 'Organization', name: 'Jabio' }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jabio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: bi('Methodology', 'روش‌شناسی مدل', lang), item: `${baseUrl}/methodology` }
      ]
    }
  ];

  const bodyHtml = `
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([{ en: 'Home', fa: 'خانه', href: '/' }, { en: 'Methodology', fa: 'روش‌شناسی مدل' }], lang)}

  <header class="hb-split-hero">
    <div class="hb-split-copy">
      <p class="hb-kicker">${biSpan(`Scoring Engine Method v2 · Snapshot ${SNAPSHOT}`, `موتور امتیازدهی نسخه ۲ · اسنپ‌شات ${SNAPSHOT}`, lang)}</p>
      <h1 class="hb-h1">${biSpan('How Jabio Scores Every 250 m Urban Block', 'روش‌شناسی امتیازدهی جابیو و حدود اعتبار مدل', lang)}</h1>
      <p class="hb-lead">${biSpan(
        'Every score is deterministically calculated from real mapped businesses, building footprints, road networks, and population grids—never opaque black-box ratings. Here is the complete mathematical model and its honest boundaries.',
        'هر عدد در جابیو از شمارش و طول واقعی داده‌های شهری روی شبکه ۲۵۰ متری محاسبه می‌شود، نه الگوریتم‌های جعبه‌سیاه یا اعداد تصادفی. در این صفحه فرمول دقیق، جدول وزن اصناف و حدود اعتبار مدل را شفاف می‌بینید.',
        lang
      )}</p>
      <div class="hb-hero-actions">
        <a class="hb-btn hb-btn-primary" href="/jabio.html">${biSpan('Try the engine live', 'آزمایش موتور روی نقشه', lang)}</a>
        <a class="hb-btn hb-btn-ghost" href="/sources.html">${biSpan('Data sources & licenses', 'منابع و مجوز داده‌ها', lang)}</a>
      </div>
    </div>

    <div class="hb-split-media">
      <img src="${IMG.spatial}" alt="${escAttr(bi('Isometric 250 meter urban block spatial scoring grid visualization', 'مدل فضایی شبکه ۲۵۰ متری بلوک‌های شهری جابیو', lang))}" referrerpolicy="no-referrer" loading="eager">
      <div class="hb-media-scrim" aria-hidden="true"></div>
      <div class="hb-media-overlay">
        <div class="hb-overlay-grid">
          <div class="hb-overlay-stat">
            <b>250 m</b>
            <span>${biSpan('Grid resolution', 'دقت شبکه مکانی', lang)}</span>
          </div>
          <div class="hb-overlay-stat">
            <b>4</b>
            <span>${biSpan('Weighted pillars', 'ستون امتیازدهی', lang)}</span>
          </div>
          <div class="hb-overlay-stat">
            <b>98th</b>
            <span>${biSpan('City normalization', 'صدک نرمال‌سازی', lang)}</span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('01. The Four-Pillar Scoring Architecture', '۰۱. معماری چهارستونه امتیازدهی', lang)}</h2>
      <p class="hb-sec-sub">${biSpan('Weighted linear combination normalized to 0–100 per city', 'ترکیب خطی وزن‌دار و نرمال‌شده روی مقیاس ۰ تا ۱۰۰ در هر شهر', lang)}</p>
    </div>

    <div class="hb-pillars">
      <div class="hb-pillar">
        <span class="hb-pillar-num">01</span>
        <h3>${biSpan('Population', 'جمعیت و ساکنان', lang)}</h3>
        <p>${biSpan('WorldPop residential density + building footprint mass inside your catchment.', 'چگالی جمعیت WorldPop به‌همراه حجم ساختمان‌های مسکونی در شعاع انتخابی.', lang)}</p>
      </div>
      <div class="hb-pillar">
        <span class="hb-pillar-num">02</span>
        <h3>${biSpan('Demand Generators', 'محرک‌های تقاضا', lang)}</h3>
        <p>${biSpan('Category-specific attractors: offices, universities, clinics, malls, and active retail.', 'جاذبه‌های مختص هر صنف: دفاتر، دانشگاه‌ها، مراکز درمانی، پاساژها و بافت تجاری.', lang)}</p>
      </div>
      <div class="hb-pillar">
        <span class="hb-pillar-num">03</span>
        <h3>${biSpan('Street & Transit Access', 'دسترسی و حمل‌ونقل', lang)}</h3>
        <p>${biSpan('Metro, BRT, bus stops, and primary arterial road visibility weighted by distance.', 'ایستگاه‌های مترو و اتوبوس به‌همراه نزدیکی به محورهای اصلی شهری.', lang)}</p>
      </div>
      <div class="hb-pillar">
        <span class="hb-pillar-num">04</span>
        <h3>${biSpan('Room Beside Rivals', 'ظرفیت بازار کنار رقبا', lang)}</h3>
        <p>${biSpan('Demand-adjusted saturation score separating underserved demand from crowded streets.', 'سنجش اشباع نسبی بر اساس تقاضای واقعی، نه صرفاً شمارش خام رقبا.', lang)}</p>
      </div>
    </div>

    <div class="hb-formula">
      Score = w_pop · Population + w_demand · Demand + w_access · Access + w_comp · RoomBesideRivals
    </div>

    <div class="hb-grid-2">
      <div class="hb-card">
        <h3 style="margin:0 0 10px;font-size:17px">${biSpan('Gaussian Distance Decay (250 m Grid)', 'افت فاصله گاوسی روی شبکه ۲۵۰ متری', lang)}</h3>
        <p style="margin:0;font-size:14.5px;line-height:1.85;color:var(--c-text2)">${biSpan(
          'Things right next to your storefront matter more than places at the far edge of your radius. Every input layer is convolved with a Gaussian kernel (sigma = radius ÷ 2), falling to ~13% weight at the outer edge, then normalized against the 98th percentile of built-up blocks in the same city (= 100).',
          'امکانات چسبیده به مغازه شما وزن بیشتری از نقاط لبه‌ی شعاع دارند. هر لایه با هسته گاوسی (sigma = شعاع ÷ ۲) هموار می‌شود تا وزن در لبه شعاع به حدود ۱۳٪ برسد، سپس نسبت به صدک ۹۸ همان شهر روی مقیاس ۰ تا ۱۰۰ نرمال‌سازی می‌شود.',
          lang
        )}</p>
      </div>
      <div class="hb-card">
        <h3 style="margin:0 0 10px;font-size:17px">${biSpan('Demand-Adjusted Room Beside Rivals', 'ظرفیت بازار در کنار رقبا (اشباع نسبی)', lang)}</h3>
        <p style="margin:0;font-size:14.5px;line-height:1.85;color:var(--c-text2)">${biSpan(
          'Raw rival counts mislead because busy areas naturally hold more shops. Jabio learns from each city how many rivals a given demand level typically carries: 50 means normal saturation, above 50 signals room to enter, and below 50 signals crowding. Blocks with Demand < 40 are guarded out so empty zones never masquerade as opportunities.',
          'شمارش خام رقبا گمراه‌کننده است چون محله‌های پرتقاضا طبیعتاً مغازه بیشتری دارند. جابیو از خودِ شهر یاد می‌گیرد هر سطح تقاضا معمولاً چند رقیب را تحمل می‌کند: ۵۰ یعنی تعادل معمول، بالاتر از ۵۰ یعنی فضای ورود وجود دارد و زیر ۵۰ نشانه اشباع است. همچنین بلوک‌های با تقاضای زیر ۴۰ فیلتر می‌شوند.',
          lang
        )}</p>
      </div>
    </div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('02. Per-Business Weight Matrix', '۰۲. جدول و نمودار وزن‌دهی هر ۱۰ صنف', lang)}</h2>
      <p class="hb-sec-sub">${biSpan('Balanced strategy defaults · "Away from rivals" raises Room weight to 35%', 'وزن‌های پیش‌فرض استراتژی متعادل · در حالت «دور از رقبا» وزن رقابت به ۳۵٪ می‌رسد', lang)}</p>
    </div>
    <div class="hb-wlegend">
      <span><i class="hb-ws-pop"></i>${biSpan('Population', 'جمعیت', lang)}</span>
      <span><i class="hb-ws-dem"></i>${biSpan('Demand', 'تقاضا', lang)}</span>
      <span><i class="hb-ws-acc"></i>${biSpan('Access', 'دسترسی', lang)}</span>
      <span><i class="hb-ws-cmp"></i>${biSpan('Room beside rivals', 'ظرفیت رقابت', lang)}</span>
    </div>
    <div class="pg-tablewrap">
      <table class="pg-table">
        <thead>
          <tr>
            <th>${biSpan('Business category', 'صنف', lang)}</th>
            <th>${biSpan('Balance', 'توزیع وزن', lang)}</th>
            <th>${biSpan('Pop', 'جمعیت', lang)}</th>
            <th>${biSpan('Demand', 'تقاضا', lang)}</th>
            <th>${biSpan('Access', 'دسترسی', lang)}</th>
            <th>${biSpan('Room', 'رقابت', lang)}</th>
            <th>${biSpan('Primary demand drivers', 'محرک‌های اصلی تقاضا', lang)}</th>
          </tr>
        </thead>
        <tbody>${weightRows}</tbody>
      </table>
    </div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('03. Uncertainty Band, Validation & Honest Limits', '۰۳. بازه خطا، اعتبارسنجی و محدودیت‌های صادقانه', lang)}</h2>
    </div>
    <div class="hb-grid-3">
      <div class="hb-card">
        <div class="hb-pillar-num" style="margin-bottom:8px">±30%</div>
        <h3 style="margin:0 0 8px;font-size:16px">${biSpan('Plausible Uncertainty Band', 'بازه محتمل خطای امتیاز', lang)}</h3>
        <p style="margin:0;font-size:13.5px;line-height:1.8;color:var(--c-text2)">${biSpan(
          'Every spot reports a low–high score range recalculated under ±30% population model error and ±10% to ±30% OSM completeness uncertainty depending on city coverage.',
          'برای هر نقطه بازه پایین تا بالا محاسبه می‌شود تا ببینید در صورت ±۳۰٪ خطای مدل جمعیت و ۱۰٪ تا ۳۰٪ ناقص‌بودن داده‌های OSM، امتیاز در چه بازه‌ای تغییر می‌کند.',
          lang
        )}</p>
      </div>
      <div class="hb-card">
        <div class="hb-pillar-num" style="margin-bottom:8px">30%</div>
        <h3 style="margin:0 0 8px;font-size:16px">${biSpan('Local Completeness Guard', 'سنجش کامل‌بودن داده در محله', lang)}</h3>
        <p style="margin:0;font-size:13.5px;line-height:1.8;color:var(--c-text2)">${biSpan(
          'Where mapped shops per resident drop below 30% of the city benchmark, Jabio flags the block as thinly mapped and excludes it from top rankings so unmapped streets never look falsely empty.',
          'در بلوک‌هایی که نسبت مغازه‌های ثبت‌شده به جمعیت کمتر از ۳۰٪ استاندارد شهر باشد، جابیو هشدار نقص داده می‌دهد و آن بلوک را از رتبه‌بندی برتر کنار می‌گذارد.',
          lang
        )}</p>
      </div>
      <div class="hb-card">
        <div class="hb-pillar-num" style="margin-bottom:8px">0%</div>
        <h3 style="margin:0 0 8px;font-size:16px">${biSpan('What Is Not in the Model', 'چه چیزهایی در مدل نیست؟', lang)}</h3>
        <p style="margin:0;font-size:13.5px;line-height:1.8;color:var(--c-text2)">${biSpan(
          'Commercial rent, shopfront width, exact pedestrian headcounts (outside the experimental Tehran D5 model), and competitor profitability are not measured. Always validate top spots on foot.',
          'اجاره و رهن، عرض دهنه مغازه، شمارش واقعی عابران (جز مدل آزمایشی منطقه ۵ تهران) و سودآوری رقبا در مدل وجود ندارد. امتیاز جابیو برای ساخت فهرست کوتاه بازدید میدانی است.',
          lang
        )}</p>
      </div>
    </div>
  </section>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: '/methodology',
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    schemaGraph,
    bodyHtml
  });
}

// ── 7. /changelog — Data Snapshots, Releases & Roadmap ──────────────────────
function renderChangelog(req, baseUrl, lang) {
  const totals = getGlobalTotals();
  const titleEn = 'Data Updates, Changelog & Roadmap – Jabio';
  const titleFa = 'به‌روزرسانی داده‌ها، تغییرات و نقشه راه – جابیو';
  const descEn = 'Track when Jabio’s 15 Iranian city datasets were last refreshed, explore engine upgrades, check city data coverage grades, and see upcoming layers and cities.';
  const descFa = 'تاریخچه دقیق به‌روزرسانی داده‌های ۱۵ شهر ایران، تغییرات موتور امتیازدهی، وضعیت پوشش داده‌ها و نقشه راه شهرها و لایه‌های آینده جابیو.';

  const releasesHtml = CHANGELOG_RELEASES.map((rel) => `
    <article class="hb-card hb-release">
      <div class="hb-rel-meta">
        <span class="hb-rel-ver">${escHtml(rel.version)}</span>
        <span class="hb-rel-date">${biSpan(rel.date, rel.dateFa, lang)}</span>
        <span class="hb-rel-tag">${biSpan(rel.tagEn, rel.tagFa, lang)}</span>
      </div>
      <div>
        <h2 style="font-size:19px;font-weight:700;margin:0;color:var(--c-text)">${biSpan(rel.title.en, rel.title.fa, lang)}</h2>
        <ul class="hb-rel-list">
          ${rel.items.en.map((itemEn, idx) => `<li>${biSpan(itemEn, rel.items.fa[idx] || itemEn, lang)}</li>`).join('')}
        </ul>
      </div>
    </article>`).join('');

  const roadmapHtml = ROADMAP_ITEMS.map((item, idx) => `
    <article class="hb-card">
      <div class="hb-meta-row" style="margin-bottom:10px">
        <span class="hb-pillar-num" style="font-size:22px">0${idx + 1}</span>
        <span aria-hidden="true">·</span>
        <strong style="color:var(--c-text)">${biSpan(item.quarter.en, item.quarter.fa, lang)}</strong>
        <span aria-hidden="true">·</span>
        <span class="hb-meta-accent">${biSpan(item.status.en, item.status.fa, lang)}</span>
      </div>
      <h3 style="font-size:17px;margin:0 0 8px;color:var(--c-text)">${biSpan(item.title.en, item.title.fa, lang)}</h3>
      <p style="margin:0;font-size:13.5px;line-height:1.8;color:var(--c-text2)">${biSpan(item.desc.en, item.desc.fa, lang)}</p>
    </article>`).join('');

  const cityStatusRows = CITIES.map((c) => {
    const pct = densityPercent(c.pois);
    return `
      <tr>
        <th scope="row"><a href="/cities/${c.id}">${biSpan(c.en, c.fa, lang)}</a></th>
        <td>${biNum(c.pois, lang)}</td>
        <td>${biNum(c.buildings, lang)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="hb-meter" style="width:96px;flex:0 0 96px"><i style="width:${pct}%"></i></div>
            ${renderCoverageLabel(c.coverage, lang)}
          </div>
        </td>
        <td>${c.districts ? biSpan('Districts + Affluence + D5 Footfall', 'مناطق + رفاه + تردد منطقه ۵', lang) : biSpan('Standard OSM + Overture + WorldPop', 'استاندارد OSM + Overture + WorldPop', lang)}</td>
      </tr>`;
  }).join('');

  const schemaGraph = [
    {
      '@type': 'WebPage',
      name: bi(titleEn, titleFa, lang),
      description: bi(descEn, descFa, lang),
      url: `${baseUrl}/changelog`,
      inLanguage: ['en', 'fa']
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jabio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: bi('Changelog', 'به‌روزرسانی‌ها', lang), item: `${baseUrl}/changelog` }
      ]
    }
  ];

  const bodyHtml = `
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([{ en: 'Home', fa: 'خانه', href: '/' }, { en: 'Changelog & Roadmap', fa: 'تغییرات و نقشه راه' }], lang)}

  <header class="hb-split-hero">
    <div class="hb-split-copy">
      <p class="hb-kicker">${biSpan(`Latest city data snapshot: ${SNAPSHOT}`, `آخرین اسنپ‌شات داده شهرها: ${SNAPSHOT}`, lang)}</p>
      <h1 class="hb-h1">${biSpan('Data Updates, Release Log & Roadmap', 'تاریخچه به‌روزرسانی داده‌ها و نقشه راه', lang)}</h1>
      <p class="hb-lead">${biSpan(
        'Transparent log of every OpenStreetMap and Overture refresh, scoring engine milestone, city coverage grade, and upcoming geospatial layers.',
        'گزارش شفاف تمام به‌روزرسانی‌های داده‌های شهری، ارتقاهای موتور امتیازدهی، وضعیت پوشش هر ۱۵ شهر و قابلیت‌های در دست ساخت جابیو.',
        lang
      )}</p>
      <div class="hb-hero-actions">
        <a class="hb-btn hb-btn-primary" href="/cities">${biSpan('Browse 15 cities', 'مشاهده ۱۵ شهر', lang)}</a>
        <a class="hb-btn hb-btn-ghost" href="/survey.html">${biSpan('Contribute missing shops', 'ثبت مغازه‌های جاافتاده', lang)}</a>
      </div>
    </div>

    <div class="hb-split-media">
      <img src="${IMG.spatial}" alt="${escAttr(bi('Spatial dataset model representing Jabio city layers and updates', 'نمای مدل داده‌های مکانی و لایه‌های شهری جابیو', lang))}" referrerpolicy="no-referrer" loading="eager">
      <div class="hb-media-scrim" aria-hidden="true"></div>
      <div class="hb-media-overlay">
        <div class="hb-overlay-grid">
          <div class="hb-overlay-stat">
            <b>v2.4</b>
            <span>${biSpan('Current release', 'نسخه فعلی', lang)}</span>
          </div>
          <div class="hb-overlay-stat">
            <b>${biNum(totals.cityCount, lang)}</b>
            <span>${biSpan('Live cities', 'شهر فعال', lang)}</span>
          </div>
          <div class="hb-overlay-stat">
            <b>${escHtml(SNAPSHOT)}</b>
            <span>${biSpan('Data snapshot', 'تاریخ اسنپ‌شات', lang)}</span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <section class="hb-sec">
    <div class="hb-sec-head"><h2 class="hb-h2">${biSpan('Release History', 'تاریخچه انتشارها', lang)}</h2></div>
    <div class="hb-vtimeline">${releasesHtml}</div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('Upcoming Roadmap', 'نقشه راه آینده', lang)}</h2>
      <p class="hb-sec-sub">${biSpan('What we are building next for analysts and retailers', 'لایه‌ها و شهرهایی که در دست توسعه هستند', lang)}</p>
    </div>
    <div class="hb-grid-3">${roadmapHtml}</div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('Current 15-City Dataset Health', 'وضعیت فعلی داده‌های ۱۵ شهر', lang)}</h2>
      <p class="hb-sec-sub">${biSpan(`Snapshot ${SNAPSHOT}`, `نسخه ${SNAPSHOT}`, lang)}</p>
    </div>
    <div class="pg-tablewrap">
      <table class="pg-table">
        <thead>
          <tr>
            <th>${biSpan('City', 'شهر', lang)}</th>
            <th>${biSpan('Mapped places', 'مکان‌ها', lang)}</th>
            <th>${biSpan('Buildings', 'ساختمان‌ها', lang)}</th>
            <th>${biSpan('Coverage & density', 'تراکم و پوشش داده', lang)}</th>
            <th>${biSpan('Active layers', 'لایه‌های فعال', lang)}</th>
          </tr>
        </thead>
        <tbody>${cityStatusRows}</tbody>
      </table>
    </div>
  </section>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: '/changelog',
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    schemaGraph,
    bodyHtml
  });
}

// ── 8. /pricing — Free / Pro / Enterprise Toman Plans ───────────────────────
function renderPricing(req, baseUrl, lang) {
  const titleEn = 'Pricing & Plans (Free, Pro & Enterprise) – Jabio';
  const titleFa = 'تعرفه‌ها و پلن‌های جابیو (رایگان، حرفه‌ای و سازمانی)';
  const descEn = 'Compare Jabio Free, Pro (490,000 Toman/mo), and Enterprise & Real-Estate Agency plans with transparent Toman pricing, feature matrix, and FAQ.';
  const descFa = 'مقایسه شفاف پلن‌های رایگان، حرفه‌ای (۴۹۰٬۰۰۰ تومان ماهانه) و سازمانی جابیو برای کسب‌وکارها، برندهای زنجیره‌ای و مشاوران املاک تجاری.';

  const planCards = PRICING_PLANS.map((p) => {
    const feats = p.features.en.map((fEn, idx) =>
      `<li>${biSpan(fEn, p.features.fa[idx] || fEn, lang)}</li>`
    ).join('');

    const isFree = p.id === 'free';
    const ctaBtn = isFree
      ? `<a class="hb-btn hb-btn-ghost" style="width:100%" href="${p.ctaHref}">${biSpan(p.cta.en, p.cta.fa, lang)}</a>`
      : `<button type="button" class="hb-btn ${p.recommended ? 'hb-btn-primary' : 'hb-btn-ghost'}" style="width:100%" data-select-plan="${p.id}">${biSpan(p.cta.en, p.cta.fa, lang)}</button>`;

    return `
      <article class="hb-card hb-plan${p.recommended ? ' featured' : ''}">
        <div>
          ${p.recommended ? `<div class="hb-plan-badge">${biSpan('Recommended for founders & analysts', 'پیشنهاد برای کسب‌وکارها و تحلیل‌گران', lang)}</div>` : `<div style="height:20px" aria-hidden="true"></div>`}
          <h2 style="font-size:23px;font-weight:800;margin:4px 0 6px;color:var(--c-text)">${biSpan(p.name.en, p.name.fa, lang)}</h2>
          <p style="margin:0;font-size:13.5px;color:var(--c-text3);line-height:1.65">${biSpan(p.audience.en, p.audience.fa, lang)}</p>
        </div>
        <div style="padding:18px 0;border-top:1px solid var(--hb-line);border-bottom:1px solid var(--hb-line)">
          <div class="hb-price" data-plan-price="${p.id}" data-monthly-en="${escAttr(p.monthlyLabel.en)}" data-monthly-fa="${escAttr(p.monthlyLabel.fa)}" data-annual-en="${escAttr(p.annualLabel.en)}" data-annual-fa="${escAttr(p.annualLabel.fa)}">
            ${biSpan(p.monthlyLabel.en, p.monthlyLabel.fa, lang)}
          </div>
          <div class="hb-price-sub">${biSpan(p.period.en, p.period.fa, lang)}</div>
        </div>
        <ul class="hb-plan-list">${feats}</ul>
        <div style="margin-top:12px">${ctaBtn}</div>
      </article>`;
  }).join('');

  const matrixRows = PRICING_MATRIX.map((r) => `
    <tr>
      <th scope="row">${biSpan(r.feature.en, r.feature.fa, lang)}</th>
      <td>${biSpan(r.free.en, r.free.fa, lang)}</td>
      <td class="hb-table-pro"><strong>${biSpan(r.pro.en, r.pro.fa, lang)}</strong></td>
      <td>${biSpan(r.ent.en, r.ent.fa, lang)}</td>
    </tr>`).join('');

  const faqItems = PRICING_FAQ.map((f) => `
    <details class="pg-q">
      <summary>${biSpan(f.q.en, f.q.fa, lang)}</summary>
      <p>${biSpan(f.a.en, f.a.fa, lang)}</p>
    </details>`).join('');

  const cityOptions = CITIES.map((c) =>
    `<option value="${c.id}">${escHtml(bi(c.en, c.fa, lang))}</option>`
  ).join('');

  const schemaGraph = [
    {
      '@type': 'SoftwareApplication',
      name: 'Jabio',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: PRICING_PLANS.map((p) => ({
        '@type': 'Offer',
        name: bi(p.name.en, p.name.fa, lang),
        price: p.monthlyToman,
        priceCurrency: 'IRR',
        url: `${baseUrl}/pricing`
      }))
    },
    {
      '@type': 'FAQPage',
      mainEntity: PRICING_FAQ.map((f) => ({
        '@type': 'Question',
        name: bi(f.q.en, f.q.fa, lang),
        acceptedAnswer: { '@type': 'Answer', text: bi(f.a.en, f.a.fa, lang) }
      }))
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Jabio', item: `${baseUrl}/` },
        { '@type': 'ListItem', position: 2, name: bi('Pricing', 'تعرفه‌ها', lang), item: `${baseUrl}/pricing` }
      ]
    }
  ];

  const bodyHtml = `
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([{ en: 'Home', fa: 'خانه', href: '/' }, { en: 'Pricing', fa: 'تعرفه‌ها' }], lang)}

  <header class="hb-hero-center">
    <p class="hb-kicker">${biSpan('Transparent Toman Pricing · No Hidden Fees', 'تعرفه‌های شفاف تومانی · بدون هزینه پنهان', lang)}</p>
    <h1 class="hb-h1">${biSpan('Start Free, Scale When You Expand', 'رایگان شروع کنید، حرفه‌ای تصمیم بگیرید', lang)}</h1>
    <p class="hb-lead">${biSpan(
      'Core city maps and location scoring are free for every business owner. Upgrade to Pro for unlimited comparisons and full analyst PDFs, or Enterprise for retail chains and commercial real-estate agencies.',
      'تحلیل نقشه هر ۱۵ شهر برای همه صاحبان کسب‌وکار رایگان است. برای مقایسه نامحدود، گزارش‌های PDF کامل و دسترسی تیمی می‌توانید پلن حرفه‌ای یا سازمانی را انتخاب کنید.',
      lang
    )}</p>
  </header>

  <div class="hb-billing-bar">
    <div class="hb-billing-wrap" role="group" aria-label="Billing cycle" id="billingToggle">
      <button type="button" class="hb-bill-btn on" data-billing="monthly">${biSpan('Monthly', 'ماهانه', lang)}</button>
      <button type="button" class="hb-bill-btn" data-billing="annual">${biSpan('Annual', 'سالانه', lang)}</button>
      <span class="hb-save-note">${biSpan('Save 20% annually', '۲۰٪ تخفیف سالانه', lang)}</span>
    </div>
  </div>

  <section class="hb-sec hb-grid-3">${planCards}</section>

  <section class="hb-sec">
    <div class="hb-sec-head">
      <h2 class="hb-h2">${biSpan('Compare All Capabilities', 'مقایسه کامل امکانات پلن‌ها', lang)}</h2>
      <p class="hb-sec-sub">${biSpan('Concrete limits for every tier', 'سقف دقیق و شفاف قابلیت‌ها در هر پلن', lang)}</p>
    </div>
    <div class="pg-tablewrap">
      <table class="pg-table">
        <thead>
          <tr>
            <th>${biSpan('Capability', 'قابلیت', lang)}</th>
            <th>${biSpan('Free', 'رایگان', lang)}</th>
            <th class="hb-table-pro">${biSpan('Pro', 'حرفه‌ای', lang)}</th>
            <th>${biSpan('Enterprise', 'سازمانی', lang)}</th>
          </tr>
        </thead>
        <tbody>${matrixRows}</tbody>
      </table>
    </div>
  </section>

  <section class="hb-sec" id="pricing-inquiry">
    <div class="hb-card hb-consult-split">
      <div class="hb-consult-aside">
        <img src="${IMG.blueprint}" alt="${escAttr(bi('Urban site selection map and commercial planning desk', 'نقشه تحلیل مکان و برنامه‌ریزی شعب تجاری', lang))}" referrerpolicy="no-referrer" loading="lazy">
        <div class="hb-consult-aside-in">
          <div style="font-size:12.5px;font-weight:600;color:#ACF7F0">${biSpan('Pro & Enterprise Activation', 'فعال‌سازی پلن حرفه‌ای و سازمانی', lang)}</div>
          <h2 style="font-size:26px;font-weight:800;line-height:1.35;margin:0;color:#FFFFFF">${biSpan('Need multi-branch analysis or agency seats?', 'به‌دنبال تحلیل چندشعبه‌ای یا دسترسی تیمی هستید؟', lang)}</h2>
          <p style="font-size:14px;line-height:1.8;color:rgba(255,255,255,.78);margin:0">${biSpan(
            'Share your target city and business type. Our team prepares a tailored activation or custom dataset quote within one business day—with zero upfront payment required.',
            'شهر و صنف فعالیت خود را ثبت کنید تا تیم جابیو ظرف یک روز کاری فعال‌سازی پلن یا پیش‌فاکتور اختصاصی برند شما را ارسال کند.',
            lang
          )}</p>
        </div>
        <div class="hb-consult-aside-in" style="padding-top:18px;border-top:1px solid rgba(255,255,255,.14);font-size:13px;color:rgba(255,255,255,.84)">
          <div>${biSpan('✓ Response within 1 business day', '✓ پاسخ‌گویی ظرف ۱ روز کاری', lang)}</div>
          <div>${biSpan('✓ Official invoice available for companies', '✓ امکان صدور فاکتور رسمی برای شرکت‌ها', lang)}</div>
          <div>${biSpan('✓ Custom city layers & API onboarding', '✓ راه‌اندازی لایه‌های اختصاصی و API', lang)}</div>
        </div>
      </div>

      <div class="hb-consult-form-wrap">
        <form class="hb-form" id="pricingForm" novalidate>
          <div class="hb-form-row">
            <div class="hb-field">
              <label class="hb-label" for="pqName">${biSpan('Full name', 'نام و نام خانوادگی', lang)}</label>
              <input class="hb-input" id="pqName" name="name" type="text" required maxlength="80" data-en-placeholder="Your name" data-fa-placeholder="نام شما" placeholder="${escAttr(bi('Your name', 'نام شما', lang))}">
            </div>
            <div class="hb-field">
              <label class="hb-label" for="pqEmail">${biSpan('Email address', 'ایمیل', lang)}</label>
              <input class="hb-input" id="pqEmail" name="email" type="email" required maxlength="150" placeholder="you@company.ir">
            </div>
          </div>
          <div class="hb-form-row">
            <div class="hb-field">
              <label class="hb-label" for="pqPlan">${biSpan('Plan', 'پلن مورد نظر', lang)}</label>
              <select class="hb-select" id="pqPlan" name="plan">
                <option value="pro">${escHtml(bi('Pro (490,000 Toman/mo)', 'حرفه‌ای (۴۹۰٬۰۰۰ تومان ماهانه)', lang))}</option>
                <option value="enterprise">${escHtml(bi('Enterprise & Real-Estate Agencies', 'سازمانی و مشاوران املاک', lang))}</option>
              </select>
            </div>
            <div class="hb-field">
              <label class="hb-label" for="pqCity">${biSpan('Primary city', 'شهر اصلی فعالیت', lang)}</label>
              <select class="hb-select" id="pqCity" name="city">${cityOptions}</select>
            </div>
          </div>
          <div class="hb-field">
            <label class="hb-label" for="pqNote">${biSpan('Tell us about your business or team (optional)', 'توضیح کوتاه درباره کسب‌وکار یا تیم شما (اختیاری)', lang)}</label>
            <textarea class="hb-textarea" id="pqNote" name="note" maxlength="1000" data-en-placeholder="Number of branches, target business type, or custom reporting needs…" data-fa-placeholder="مثلاً تعداد شعب، نوع صنف یا نیاز گزارش اختصاصی…" placeholder="${escAttr(bi('Number of branches, target business type, or custom reporting needs…', 'مثلاً تعداد شعب، نوع صنف یا نیاز گزارش اختصاصی…', lang))}"></textarea>
          </div>
          <input type="hidden" id="pqBilling" name="billing" value="monthly">
          <div class="hb-msg" id="pqMsg" role="status" aria-live="polite"></div>
          <div>
            <button class="hb-btn hb-btn-primary" type="submit" id="pqSubmit">${biSpan('Submit request', 'ثبت درخواست', lang)}</button>
          </div>
        </form>
      </div>
    </div>
  </section>

  <section class="hb-sec">
    <div class="hb-sec-head"><h2 class="hb-h2">${biSpan('Pricing FAQ', 'سوالات متداول تعرفه‌ها', lang)}</h2></div>
    <div class="pg-faq">${faqItems}</div>
  </section>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: '/pricing',
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    activeNav: 'pricing',
    schemaGraph,
    bodyHtml,
    extraScripts: '<script src="/assets/hub-client.js?v=2"></script>'
  });
}

// ── 9. /account — Adaptive Personal & Organizational Profile Workspace (noindex) ──
function renderAccount(req, baseUrl, lang) {
  const titleEn = 'User Profile & Saved Analyses – Jabio';
  const titleFa = 'پروفایل کاربری و تحلیل‌های ذخیره‌شده – جابیو';
  const descEn = 'Manage your Jabio personal or organizational profile, verification status, saved analyses, and professional PDF reports.';
  const descFa = 'مدیریت پروفایل شخصی یا سازمانی، تایید ایمیل و شماره تماس، تحلیل‌های ذخیره‌شده و خروجی PDF حرفه‌ای در جابیو.';

  const cityOptions = CITIES.map((c) =>
    `<option value="${c.id}">${escHtml(bi(c.en, c.fa, lang))}</option>`
  ).join('');

  const catOptions = [
    `<option value="">${escHtml(bi('All categories', 'همه دسته‌بندی‌ها', lang))}</option>`,
    ...BIZ_TYPES.map((b) => `<option value="${b.id}">${escHtml(bi(b.en, b.fa, lang))}</option>`)
  ].join('');

  const bodyHtml = `
<main class="wrap hb-wrap">
  <div class="hb-no-print">
    ${renderBreadcrumbs([{ en: 'Home', fa: 'خانه', href: '/' }, { en: 'Account & Profile', fa: 'پروفایل کاربری' }], lang)}

    <header class="hb-hero-clean">
      <p class="hb-kicker">${biSpan('Jabio Account Workspace', 'فضای اختصاصی حساب کاربری جابیو', lang)}</p>
      <h1 class="hb-h1">${biSpan('User Profile &amp; Saved Analyses', 'پروفایل کاربری و تحلیل‌های من', lang)}</h1>
      <p class="hb-lead">${biSpan('Switch between Personal and Organizational profiles, verify your email or phone, manage saved locations, and export print-ready PDF reports.', 'پروفایل شخصی یا سازمانی خود را تنظیم کنید، ایمیل و شماره موبایل را تایید نمایید و از تحلیل‌های ذخیره‌شده خود خروجی PDF حرفه‌ای بگیرید.', lang)}</p>
    </header>

    <div class="hb-auth-split" id="accGuestCard" hidden>
      <div class="hb-card">
        <div class="hb-meta-accent" style="font-size:13px;margin-bottom:8px">${biSpan('Cloud-synced workspace', 'همگام‌سازی ابری و پایدار', lang)}</div>
        <h2 class="hb-h2" style="margin-bottom:12px">${biSpan('Sign in to access your profile', 'برای دسترسی به پروفایل وارد شوید', lang)}</h2>
        <p style="font-size:14.5px;line-height:1.85;color:var(--c-text2);margin:0 0 22px">${biSpan(
          'Sign in with your email, mobile number, or verified Google account to manage your adaptive profile and export your saved location analyses as PDF reports.',
          'با ایمیل، شماره موبایل یا حساب تاییدشده گوگل وارد شوید تا پروفایل شخصی یا سازمانی خود را مدیریت کنید و از تحلیل‌های ذخیره‌شده خود خروجی چاپی و PDF بگیرید.',
          lang
        )}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a class="hb-btn hb-btn-primary" href="/login.html">${biSpan('Sign in', 'ورود به حساب', lang)}</a>
          <a class="hb-btn hb-btn-ghost" href="/login.html?register=1">${biSpan('Create account', 'ساخت حساب جدید', lang)}</a>
          <a class="hb-btn hb-btn-ghost" href="/forgot-password">${biSpan('Recover password', 'بازیابی رمز عبور', lang)}</a>
        </div>
      </div>
      <div class="hb-card" style="background:var(--hb-surface-hi)">
        <h3 style="font-size:16px;margin:0 0 14px;color:var(--c-text)">${biSpan('Included in your Jabio account', 'امکانات حساب کاربری جابیو', lang)}</h3>
        <ul class="hb-plan-list">
          <li>${biSpan('Real Google verification with Cloud Firestore persistence', 'تایید واقعی حساب گوگل و ذخیره‌سازی ابری پایدار', lang)}</li>
          <li>${biSpan('Sign in and password recovery via both email and mobile phone', 'ورود و بازیابی رمز عبور از طریق ایمیل و شماره موبایل', lang)}</li>
          <li>${biSpan('Adaptive Personal &amp; Organizational profile modes', 'پروفایل تطبیقی ساده (شخصی) و سازمانی (کسب‌وکار)', lang)}</li>
          <li>${biSpan('Professional print &amp; PDF export for single and portfolio analyses', 'خروجی چاپی و PDF حرفه‌ای برای هر تحلیل و گزارش تجمیعی', lang)}</li>
        </ul>
      </div>
    </div>

    <div id="accLoadingCard" class="hb-card" style="margin-bottom:24px">
      <div class="hb-skel-row"></div>
      <div class="hb-skel-row short"></div>
    </div>

    <div id="accAuthView" hidden>
      <div class="hb-profile-banner">
        <div class="hb-profile-id">
          <div class="hb-avatar" id="accAvatar" aria-hidden="true">J</div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <div style="font-size:21px;font-weight:800;color:var(--c-text)" id="accHeroName">Jabio</div>
              <span class="hb-status-text" id="accHeroMode"></span>
            </div>
            <div style="font-size:13.5px;color:var(--c-text2);margin-top:2px" id="accHeroOrg" hidden></div>
            <div class="hb-id-meta" id="accHeroMeta"></div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <a class="hb-btn hb-btn-primary" id="accQuickMap" href="/jabio.html">${biSpan('Open city map', 'نقشه شهر من', lang)}</a>
          <button type="button" class="hb-btn hb-btn-ghost" id="accQuickPdfBtn">${biSpan('Export PDF portfolio', 'خروجی PDF تحلیل‌ها', lang)}</button>
        </div>
      </div>

      <!-- Adaptive Organizational Summary Ribbon (shown only when Organizational mode is active) -->
      <div class="hb-ribbon" id="accOrgRibbon" hidden style="margin-bottom:24px">
        <div class="hb-ribbon-item">
          <span class="hb-ribbon-val" id="orgStatCount">0</span>
          <span class="hb-ribbon-lbl">${biSpan('Saved evaluations', 'تحلیل‌های ذخیره‌شده', lang)}</span>
        </div>
        <div class="hb-ribbon-item">
          <span class="hb-ribbon-val" id="orgStatAvg">—</span>
          <span class="hb-ribbon-lbl">${biSpan('Average location score', 'میانگین امتیاز مکان‌ها', lang)}</span>
        </div>
        <div class="hb-ribbon-item">
          <span class="hb-ribbon-val" id="orgStatCities">0</span>
          <span class="hb-ribbon-lbl">${biSpan('Cities evaluated', 'شهرهای بررسی‌شده', lang)}</span>
        </div>
        <div class="hb-ribbon-item">
          <span class="hb-ribbon-val" id="orgStatBranches">—</span>
          <span class="hb-ribbon-lbl">${biSpan('Target branches', 'تعداد شعب / هدف توسعه', lang)}</span>
        </div>
      </div>

      <div class="hb-account-grid">
        <nav class="hb-account-nav" aria-label="Account sections">
          <button type="button" class="hb-tab-btn on" data-acc-tab="profile">${biSpan('Profile &amp; Mode', 'پروفایل کاربری', lang)}</button>
          <button type="button" class="hb-tab-btn" data-acc-tab="analyses">
            <span>${biSpan('Saved Analyses &amp; PDF', 'تحلیل‌های ذخیره‌شده و PDF', lang)}</span>
            <strong class="hb-tab-count" id="accSavedCount">0</strong>
          </button>
          <button type="button" class="hb-tab-btn" data-acc-tab="security">${biSpan('Verification &amp; Security', 'تایید هویت و امنیت', lang)}</button>
          <button type="button" class="hb-tab-btn" data-acc-tab="danger">${biSpan('Delete Account', 'حذف حساب', lang)}</button>
          <button type="button" class="hb-tab-btn" id="accSignOutBtn" style="color:var(--c-text3)">${biSpan('Sign out', 'خروج از حساب', lang)}</button>
        </nav>

        <div>
          <!-- TAB 1: ADAPTIVE PROFILE (PERSONAL / ORGANIZATIONAL) -->
          <section class="hb-card hb-panel" data-acc-panel="profile">
            <div class="hb-sec-head" style="margin-bottom:20px">
              <div>
                <h2 class="hb-h2">${biSpan('Adaptive User Profile', 'تنظیمات پروفایل کاربری', lang)}</h2>
                <p class="hb-sec-sub" style="margin-top:4px">${biSpan('Choose Personal for a streamlined profile, or Organization to add brand details to your workspace and PDF reports.', 'حالت شخصی برای کاربری ساده و حالت سازمانی برای درج هویت برند و مدیریت توسعه شعب در داشبورد و گزارش‌های PDF است.', lang)}</p>
              </div>
            </div>

            <div class="hb-seg-wrap" role="radiogroup" aria-label="Account profile mode" style="margin-bottom:22px">
              <button type="button" class="hb-seg-btn on" data-prof-mode="personal" aria-checked="true">${biSpan('Personal (Simple)', 'پروفایل شخصی (ساده)', lang)}</button>
              <button type="button" class="hb-seg-btn" data-prof-mode="organization" aria-checked="false">${biSpan('Organization / Business', 'پروفایل سازمانی / کسب‌وکار', lang)}</button>
            </div>

            <form class="hb-form" id="accProfileForm" novalidate>
              <div class="hb-form-row">
                <div class="hb-field">
                  <label class="hb-label" for="accDisplayName">${biSpan('Full name / Display name', 'نام و نام خانوادگی', lang)}</label>
                  <input class="hb-input" id="accDisplayName" name="displayName" type="text" maxlength="80" placeholder="${escAttr(bi('e.g. Ali Rezaei', 'مثلاً علی رضایی', lang))}">
                </div>
                <div class="hb-field">
                  <label class="hb-label" for="accPhone">${biSpan('Mobile phone (for phone login &amp; SMS recovery)', 'شماره موبایل (برای ورود و بازیابی پیامکی)', lang)}</label>
                  <input class="hb-input" id="accPhone" name="phone" type="tel" inputmode="tel" dir="ltr" maxlength="20" placeholder="0912 345 6789">
                </div>
              </div>

              <div class="hb-form-row">
                <div class="hb-field">
                  <label class="hb-label" for="accPreferredCity">${biSpan('Default city', 'شهر پیش‌فرض نقشه', lang)}</label>
                  <select class="hb-select" id="accPreferredCity" name="preferredCity">${cityOptions}</select>
                </div>
                <div class="hb-field">
                  <label class="hb-label" for="accPreferredCategory">${biSpan('Primary business category', 'دسته کسب‌وکار مورد علاقه', lang)}</label>
                  <select class="hb-select" id="accPreferredCategory" name="preferredCategory">${catOptions}</select>
                </div>
              </div>

              <div class="hb-field" style="max-width:340px">
                <label class="hb-label" for="accPreferredLang">${biSpan('Preferred language', 'زبان پیش‌فرض سامانه', lang)}</label>
                <select class="hb-select" id="accPreferredLang" name="preferredLang">
                  <option value="fa">فارسی (Persian)</option>
                  <option value="en">English</option>
                </select>
              </div>

              <!-- Organizational Fields Block -->
              <div class="hb-org-box" id="accOrgSection" hidden>
                <div class="hb-org-head">
                  <h3>${biSpan('Organization &amp; Brand Details', 'اطلاعات سازمان و برند', lang)}</h3>
                  <p>${biSpan('Printed automatically on the header of your exported PDF location reports.', 'این اطلاعات به‌صورت خودکار در سربرگ گزارش‌های چاپی و PDF شما درج می‌شوند.', lang)}</p>
                </div>
                <div class="hb-form-row">
                  <div class="hb-field">
                    <label class="hb-label" for="accOrgName">${biSpan('Company or brand name', 'نام شرکت یا برند', lang)}</label>
                    <input class="hb-input" id="accOrgName" name="organizationName" type="text" maxlength="100" placeholder="${escAttr(bi('e.g. Lamiz Coffee', 'مثلاً کافه لمیز', lang))}">
                  </div>
                  <div class="hb-field">
                    <label class="hb-label" for="accRoleTitle">${biSpan('Your role / title', 'سمت سازمانی', lang)}</label>
                    <input class="hb-input" id="accRoleTitle" name="roleTitle" type="text" maxlength="80" placeholder="${escAttr(bi('e.g. Expansion Manager', 'مثلاً مدیر توسعه شعب', lang))}">
                  </div>
                </div>
                <div class="hb-form-row">
                  <div class="hb-field">
                    <label class="hb-label" for="accIndustry">${biSpan('Industry / activity sector', 'حوزه فعالیت', lang)}</label>
                    <input class="hb-input" id="accIndustry" name="industry" type="text" maxlength="80" placeholder="${escAttr(bi('e.g. Specialty Coffee & Retail', 'مثلاً کافه زنجیره‌ای و خرده‌فروشی', lang))}">
                  </div>
                  <div class="hb-field">
                    <label class="hb-label" for="accBranchCount">${biSpan('Branches / expansion target', 'تعداد شعب یا هدف توسعه', lang)}</label>
                    <input class="hb-input" id="accBranchCount" name="branchCount" type="text" maxlength="32" placeholder="${escAttr(bi('e.g. 5–10 branches', 'مثلاً ۵ تا ۱۰ شعبه', lang))}">
                  </div>
                </div>
              </div>

              <div class="hb-msg" id="accProfileMsg" role="status" aria-live="polite"></div>
              <div><button class="hb-btn hb-btn-primary" type="submit">${biSpan('Save profile changes', 'ذخیره تغییرات پروفایل', lang)}</button></div>
            </form>
          </section>

          <!-- TAB 2: SAVED ANALYSES & PROFESSIONAL PDF EXPORT -->
          <section class="hb-card hb-panel" data-acc-panel="analyses" hidden>
            <div class="hb-sec-head" style="margin-bottom:18px">
              <div>
                <h2 class="hb-h2">${biSpan('Saved Analyses &amp; PDF Reports', 'تحلیل‌های ذخیره‌شده و خروجی PDF', lang)}</h2>
                <p class="hb-sec-sub" style="margin-top:4px" id="accSavedSummary"></p>
              </div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button type="button" class="hb-btn hb-btn-primary" id="accPrintPortfolioBtn">${biSpan('Print / Save PDF Report', 'چاپ / ذخیره گزارش PDF', lang)}</button>
                <button type="button" class="hb-btn hb-btn-ghost" id="accImportLocalBtn" hidden>${biSpan('Import browser saves', 'انتقال ذخیره‌های مرورگر', lang)}</button>
              </div>
            </div>

            <div class="hb-analyses-bar">
              <input class="hb-input" id="accAnalysesSearch" type="search" placeholder="${escAttr(bi('Search by location name, city, or category…', 'جستجو بر اساس نام مکان، شهر یا دسته‌بندی…', lang))}">
              <a class="hb-btn hb-btn-ghost" href="/jabio.html">${biSpan('+ New analysis', '+ تحلیل جدید', lang)}</a>
            </div>

            <div class="hb-msg" id="accAnalysesMsg" role="status" aria-live="polite" style="margin-bottom:14px"></div>
            <div id="accAnalysesList" class="hb-analyses-list"></div>
          </section>

          <!-- TAB 3: IDENTITY VERIFICATION & PASSWORD SECURITY -->
          <section class="hb-card hb-panel" data-acc-panel="security" hidden>
            <div class="hb-sec-head" style="margin-bottom:20px">
              <h2 class="hb-h2">${biSpan('Verification &amp; Account Security', 'تایید هویت و امنیت حساب', lang)}</h2>
            </div>

            <div class="hb-verify-grid">
              <!-- Email verification row -->
              <div class="hb-verify-row">
                <div>
                  <div class="hb-verify-title">${biSpan('Email address', 'آدرس ایمیل', lang)}</div>
                  <div class="hb-verify-val" id="secEmailVal">—</div>
                  <div class="hb-status-text" id="secEmailStatus"></div>
                </div>
                <button type="button" class="hb-btn hb-btn-ghost" id="secVerifyEmailBtn" hidden>${biSpan('Verify email', 'تایید ایمیل', lang)}</button>
              </div>

              <!-- Phone verification row -->
              <div class="hb-verify-row">
                <div>
                  <div class="hb-verify-title">${biSpan('Mobile phone', 'شماره موبایل', lang)}</div>
                  <div class="hb-verify-val" dir="ltr" id="secPhoneVal">—</div>
                  <div class="hb-status-text" id="secPhoneStatus"></div>
                </div>
                <button type="button" class="hb-btn hb-btn-ghost" id="secVerifyPhoneBtn" hidden>${biSpan('Verify via SMS', 'تایید پیامکی', lang)}</button>
              </div>

              <!-- Sign-in method row -->
              <div class="hb-verify-row">
                <div>
                  <div class="hb-verify-title">${biSpan('Sign-in provider', 'روش احراز هویت', lang)}</div>
                  <div class="hb-verify-val" id="secProviderVal">—</div>
                </div>
              </div>
            </div>

            <!-- Inline 6-digit verification box inside Security tab -->
            <div class="hb-inline-otp" id="secOtpBox" hidden>
              <div style="font-size:14px;font-weight:700;color:var(--c-text)" id="secOtpTitle"></div>
              <div class="hb-preview-banner" id="secOtpPreview" hidden>
                <span id="secOtpPreviewLabel"></span>
                <strong id="secOtpPreviewCode"></strong>
              </div>
              <form class="hb-otp-row" id="secOtpForm" novalidate>
                <input class="hb-input hb-otp-field" id="secOtpInput" type="text" inputmode="numeric" maxlength="6" placeholder="••••••">
                <button type="submit" class="hb-btn hb-btn-primary">${biSpan('Confirm code', 'تایید کد', lang)}</button>
              </form>
              <div class="hb-msg" id="secOtpMsg" role="status" aria-live="polite"></div>
            </div>

            <div id="secGoogleNote" class="hb-msg info" style="margin-top:20px" hidden>
              ${biSpan('Your account is verified through Google. Password management is handled directly in your Google Account security settings.', 'حساب شما از طریق تایید واقعی گوگل متصل است و مدیریت رمز عبور آن مستقیماً از تنظیمات امنیتی حساب گوگل شما انجام می‌شود.', lang)}
            </div>

            <div id="secPasswordWrap" style="margin-top:26px;padding-top:24px;border-top:1px solid var(--hb-line)">
              <h3 style="font-size:16px;margin:0 0 14px;color:var(--c-text)">${biSpan('Change Password', 'تغییر رمز عبور', lang)}</h3>
              <form class="hb-form" id="accPasswordForm" novalidate>
                <div class="hb-field">
                  <label class="hb-label" for="accCurPw">${biSpan('Current password', 'رمز عبور فعلی', lang)}</label>
                  <input class="hb-input" id="accCurPw" type="password" autocomplete="current-password" required>
                </div>
                <div class="hb-form-row">
                  <div class="hb-field">
                    <label class="hb-label" for="accNewPw">${biSpan('New password (min. 10 chars)', 'رمز عبور جدید (حداقل ۱۰ کاراکتر)', lang)}</label>
                    <input class="hb-input" id="accNewPw" type="password" autocomplete="new-password" minlength="10" required>
                  </div>
                  <div class="hb-field">
                    <label class="hb-label" for="accNewPw2">${biSpan('Confirm new password', 'تکرار رمز عبور جدید', lang)}</label>
                    <input class="hb-input" id="accNewPw2" type="password" autocomplete="new-password" minlength="10" required>
                  </div>
                </div>
                <div class="hb-msg" id="accPwMsg" role="status" aria-live="polite"></div>
                <div><button class="hb-btn hb-btn-primary" type="submit">${biSpan('Update password', 'به‌روزرسانی رمز عبور', lang)}</button></div>
              </form>
            </div>
          </section>

          <!-- TAB 4: DELETE ACCOUNT -->
          <section class="hb-card hb-panel" data-acc-panel="danger" hidden>
            <div class="hb-sec-head" style="margin-bottom:18px">
              <h2 class="hb-h2" style="color:#F87171">${biSpan('Delete Account Permanently', 'حذف دائمی حساب کاربری', lang)}</h2>
            </div>
            <p style="font-size:14px;color:var(--c-text2);line-height:1.8;margin:0 0 18px" id="accDelDesc">${biSpan(
              'This permanently removes your user profile and all cloud-synced saved analyses. This action cannot be undone.',
              'با انجام این عملیات، پروفایل کاربری و تمام تحلیل‌های ذخیره‌شده شما به‌صورت دائمی حذف می‌شوند و قابل بازگردانی نیستند.',
              lang
            )}</p>
            <form class="hb-form" id="accDeleteForm" novalidate>
              <div class="hb-field" id="accDelPwWrap" style="max-width:360px">
                <label class="hb-label" for="accDelPw">${biSpan('Current password', 'رمز عبور فعلی برای تایید', lang)}</label>
                <input class="hb-input" id="accDelPw" type="password" autocomplete="current-password">
              </div>
              <div class="hb-msg" id="accDelMsg" role="status" aria-live="polite"></div>
              <div><button class="hb-btn hb-btn-danger" type="submit">${biSpan('Delete my account', 'حذف دائمی حساب', lang)}</button></div>
            </form>
          </section>
        </div>
      </div>
    </div>
  </div>

  <!-- Print / PDF Portfolio Sheet (hidden on screen, rendered cleanly for @media print) -->
  <section class="hb-print-sheet" id="accPrintPortfolio" aria-hidden="true"></section>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: '/account',
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    noindex: true,
    bodyHtml,
    extraScripts: '<script src="/assets/data/cities/index.js"></script><script src="/assets/hub-client.js?v=3"></script>'
  });
}

// ── 10. /forgot-password — Dual-Channel Password Recovery (Email & Phone) ───
function renderForgotPassword(req, baseUrl, lang) {
  const titleEn = 'Password Recovery (Email & Phone) – Jabio';
  const titleFa = 'بازیابی رمز عبور با ایمیل و شماره موبایل – جابیو';
  const descEn = 'Recover your Jabio account password using a time-limited 6-digit verification code sent via email or SMS.';
  const descFa = 'بازیابی رمز عبور حساب جابیو با دریافت کد تایید ۶ رقمی از طریق ایمیل یا پیامک شماره موبایل.';

  const prefillRaw = (req.query && (req.query.identifier || req.query.email || req.query.phone)) || '';
  const prefill = typeof prefillRaw === 'string' ? prefillRaw.slice(0, 150) : '';
  const initialChannel = req.query && req.query.channel === 'phone' ? 'phone' : 'email';

  const bodyHtml = `
<main class="wrap hb-wrap">
  ${renderBreadcrumbs([
    { en: 'Home', fa: 'خانه', href: '/' },
    { en: 'Sign in', fa: 'ورود', href: '/login.html' },
    { en: 'Password recovery', fa: 'بازیابی رمز عبور' }
  ], lang)}

  <div class="hb-auth-split">
    <header class="hb-split-copy" style="align-self:stretch">
      <p class="hb-kicker">${biSpan('Dual-Channel Recovery', 'بازیابی دوکاناله حساب', lang)}</p>
      <h1 class="hb-h1">${biSpan('Reset Your Password', 'بازیابی رمز عبور', lang)}</h1>
      <p class="hb-lead" style="margin-bottom:24px">${biSpan(
        'Choose whether to receive your 6-digit recovery code by email or mobile SMS, then set a new strong password.',
        'روش دریافت کد ۶ رقمی بازیابی (ایمیل یا شماره موبایل) را انتخاب کنید و پس از تایید کد، رمز عبور جدید خود را ثبت نمایید.',
        lang
      )}</p>
      <ul class="hb-plan-list" style="margin-top:auto">
        <li>${biSpan('Supports both registered email addresses and Iranian mobile numbers', 'پشتیبانی کامل از ایمیل و شماره موبایل ثبت‌شده در حساب', lang)}</li>
        <li>${biSpan('6-digit codes expire automatically after 15 minutes (max 5 attempts)', 'کدهای ۶ رقمی پس از ۱۵ دقیقه منقضی می‌شوند (حداکثر ۵ تلاش)', lang)}</li>
        <li>${biSpan('All previous active sessions are automatically signed out upon reset', 'پس از تغییر رمز، تمام نشست‌های قبلی به‌صورت خودکار بسته می‌شوند', lang)}</li>
      </ul>
      <div style="margin-top:24px">
        <a class="hb-link" href="/login.html">${biSpan('← Back to sign in', '→ بازگشت به صفحه ورود', lang)}</a>
      </div>
    </header>

    <div style="display:flex;flex-direction:column;gap:20px" data-initial-channel="${initialChannel}">
      <section class="hb-card">
        <div class="hb-seg-wrap" role="tablist" aria-label="Recovery channel" style="margin-bottom:18px">
          <button type="button" class="hb-seg-btn${initialChannel === 'email' ? ' on' : ''}" data-reset-channel="email" role="tab" aria-selected="${initialChannel === 'email'}">
            ${biSpan('Recover via Email', 'بازیابی با ایمیل', lang)}
          </button>
          <button type="button" class="hb-seg-btn${initialChannel === 'phone' ? ' on' : ''}" data-reset-channel="phone" role="tab" aria-selected="${initialChannel === 'phone'}">
            ${biSpan('Recover via Phone (SMS)', 'بازیابی با شماره موبایل', lang)}
          </button>
        </div>

        <div class="hb-step-head">
          <span class="hb-step-num">01</span>
          <h2 style="font-size:18px;margin:0;color:var(--c-text)">${biSpan('Request 6-digit recovery code', 'درخواست کد بازیابی ۶ رقمی', lang)}</h2>
        </div>
        <form class="hb-form" id="resetReqForm" novalidate>
          <div class="hb-field">
            <label class="hb-label" for="rsIdentifier" id="rsIdentifierLabel">${initialChannel === 'phone' ? biSpan('Registered mobile number', 'شماره موبایل ثبت‌شده', lang) : biSpan('Account email address', 'ایمیل حساب کاربری', lang)}</label>
            <input class="hb-input" id="rsIdentifier" name="identifier" type="${initialChannel === 'phone' ? 'tel' : 'email'}" dir="ltr" value="${escAttr(prefill)}" autocomplete="${initialChannel === 'phone' ? 'tel' : 'email'}" required placeholder="${initialChannel === 'phone' ? '0912 345 6789' : 'your@email.com'}">
          </div>
          <div class="hb-preview-banner" id="rsPreviewBox" hidden>
            <span id="rsPreviewLabel"></span>
            <strong id="rsPreviewCode"></strong>
          </div>
          <div class="hb-msg" id="rsReqMsg" role="status" aria-live="polite"></div>
          <div><button class="hb-btn hb-btn-primary" type="submit" style="width:100%">${biSpan('Send recovery code', 'ارسال کد بازیابی', lang)}</button></div>
        </form>
      </section>

      <section class="hb-card">
        <div class="hb-step-head">
          <span class="hb-step-num">02</span>
          <h2 style="font-size:18px;margin:0;color:var(--c-text)">${biSpan('Enter code &amp; set new password', 'وارد کردن کد و ثبت رمز جدید', lang)}</h2>
        </div>
        <form class="hb-form" id="resetConfirmForm" novalidate>
          <div class="hb-field">
            <label class="hb-label" for="rsCode">${biSpan('6-digit recovery code', 'کد بازیابی ۶ رقمی', lang)}</label>
            <input class="hb-input hb-otp-field" id="rsCode" name="code" type="text" inputmode="numeric" maxlength="6" autocomplete="one-time-code" required placeholder="••••••">
          </div>
          <div class="hb-form-row">
            <div class="hb-field">
              <label class="hb-label" for="rsNewPw">${biSpan('New password (min. 10 chars)', 'رمز عبور جدید (حداقل ۱۰ کاراکتر)', lang)}</label>
              <input class="hb-input" id="rsNewPw" name="newPassword" type="password" autocomplete="new-password" minlength="10" required>
            </div>
            <div class="hb-field">
              <label class="hb-label" for="rsNewPw2">${biSpan('Confirm new password', 'تکرار رمز عبور جدید', lang)}</label>
              <input class="hb-input" id="rsNewPw2" name="newPassword2" type="password" autocomplete="new-password" minlength="10" required>
            </div>
          </div>
          <div class="hb-msg" id="rsConfirmMsg" role="status" aria-live="polite"></div>
          <div><button class="hb-btn hb-btn-ghost" type="submit" style="width:100%">${biSpan('Set new password', 'ثبت رمز عبور جدید', lang)}</button></div>
        </form>
      </section>
    </div>
  </div>
</main>`;

  return renderPage({
    req,
    baseUrl,
    routePath: '/forgot-password',
    lang,
    titleEn,
    titleFa,
    descEn,
    descFa,
    noindex: true,
    bodyHtml,
    extraScripts: '<script src="/assets/hub-client.js?v=3"></script>'
  });
}

module.exports = {
  renderCitiesIndex,
  renderCityDetail,
  renderCityCategory,
  renderBlogIndex,
  renderBlogArticle,
  renderMethodology,
  renderChangelog,
  renderPricing,
  renderAccount,
  renderForgotPassword
};
