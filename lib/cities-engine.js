'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const Jabio = require(path.join(ROOT, 'assets/jabio-engine.js'));

// Load cities index (window.GA_CITIES & window.GA_SNAPSHOT) safely in a sandboxed VM context
function loadCitiesMeta() {
  const src = fs.readFileSync(path.join(ROOT, 'assets/data/cities/index.js'), 'utf8');
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx, { filename: 'cities-index.js' });
  return {
    cities: Array.isArray(ctx.window.GA_CITIES) ? ctx.window.GA_CITIES : [],
    snapshot: typeof ctx.window.GA_SNAPSHOT === 'string' ? ctx.window.GA_SNAPSHOT : '2026-11-04'
  };
}

const { cities: CITIES, snapshot: SNAPSHOT } = loadCitiesMeta();
const CITIES_BY_ID = new Map(CITIES.map((c) => [c.id, c]));

const BIZ_TYPES = [
  {
    id: 'restaurant',
    group: 'food',
    color: '#ED4545',
    en: 'Restaurant',
    fa: 'رستوران',
    pluralEn: 'Restaurants',
    pluralFa: 'رستوران‌ها',
    descEn: 'Sit-down dining, fast casual, and delivery kitchens driven by offices, retail corridors, and transit hubs.',
    descFa: 'رستوران‌ها، فست‌فودها و آشپزخانه‌های ارسال غذا که به دفاتر، محورهای تجاری و حمل‌ونقل وابسته‌اند.'
  },
  {
    id: 'cafe',
    group: 'food',
    color: '#EDB545',
    en: 'Café',
    fa: 'کافه',
    pluralEn: 'Cafés',
    pluralFa: 'کافه‌ها',
    descEn: 'Specialty coffee shops, bakeries, and hangouts thriving near universities, offices, parks, and walkable streets.',
    descFa: 'کافه‌های تخصصی، بیکری‌ها و فضاهای گفتگو که در نزدیکی دانشگاه‌ها، دفاتر، پارک‌ها و خیابان‌های پیاده‌محور رونق می‌گیرند.'
  },
  {
    id: 'grocery',
    group: 'retail',
    color: '#45ED45',
    en: 'Grocery & Supermarket',
    fa: 'سوپرمارکت و خواربار',
    pluralEn: 'Supermarkets & Groceries',
    pluralFa: 'سوپرمارکت‌ها و خواربارفروشی‌ها',
    descEn: 'Daily essentials, hypermarkets, and neighbourhood convenience stores anchored by residential density.',
    descFa: 'فروشگاه‌های مایحتاج روزانه، هایپرمارکت‌ها و سوپرمارکت‌های محلی متکی بر تراکم سکونت و دسترسی سریع.'
  },
  {
    id: 'fashion',
    group: 'retail',
    color: '#ED45E1',
    en: 'Fashion & Clothing',
    fa: 'پوشاک و مد',
    pluralEn: 'Clothing Stores',
    pluralFa: 'فروشگاه‌های پوشاک',
    descEn: 'Apparel, footwear, and accessory boutiques benefiting from shopping clusters, malls, and high street visibility.',
    descFa: 'بوتیک‌های پوشاک، کیف و کفش که از مجاورت با مراکز خرید، راسته‌های تجاری و دید بالای خیابان سود می‌برند.'
  },
  {
    id: 'beauty',
    group: 'retail',
    color: '#EB84BB',
    en: 'Beauty & Salon',
    fa: 'آرایشی و سالن زیبایی',
    pluralEn: 'Beauty Salons',
    pluralFa: 'سالن‌های زیبایی و آرایشی',
    descEn: 'Hair salons, skincare studios, and cosmetics shops balancing residential catchments with commercial convenience.',
    descFa: 'سالن‌های زیبایی، کلینیک‌های پوست و فروشگاه‌های آرایشی با تکیه بر جمعیت محلی و دسترسی تجاری.'
  },
  {
    id: 'pharmacy',
    group: 'health',
    color: '#61EFC0',
    en: 'Pharmacy',
    fa: 'داروخانه',
    pluralEn: 'Pharmacies',
    pluralFa: 'داروخانه‌ها',
    descEn: 'Community and specialty pharmacies positioned near clinics, hospitals, dense neighbourhoods, and transit stops.',
    descFa: 'داروخانه‌های محلی و تخصصی در مجاورت درمانگاه‌ها، بیمارستان‌ها، بافت مسکونی پرتراکم و ایستگاه‌ها.'
  },
  {
    id: 'clinic',
    group: 'health',
    color: '#4588ED',
    en: 'Clinic & Medical',
    fa: 'کلینیک و مرکز درمانی',
    pluralEn: 'Clinics',
    pluralFa: 'کلینیک‌ها و مطب‌ها',
    descEn: 'Dental offices, medical clinics, and diagnostic labs needing accessible transit and balanced resident catchments.',
    descFa: 'مطب‌ها، کلینیک‌های دندانپزشکی و مراکز تشخیصی نیازمند دسترسی حمل‌ونقلی آسان و پوشش جمعیتی مناسب.'
  },
  {
    id: 'fitness',
    group: 'health',
    color: '#4545ED',
    en: 'Gym & Fitness',
    fa: 'باشگاه ورزشی',
    pluralEn: 'Gyms & Fitness Clubs',
    pluralFa: 'باشگاه‌های ورزشی',
    descEn: 'Fitness clubs, pilates studios, and sports complexes serving nearby residents, office workers, and students.',
    descFa: 'باشگاه‌های بدنسازی، پیلاتس و استودیوهای ورزشی در دسترس ساکنان، کارمندان و دانشجویان.'
  },
  {
    id: 'education',
    group: 'education',
    color: '#CBF27D',
    en: 'Training & Education',
    fa: 'آموزشگاه',
    pluralEn: 'Training Institutes',
    pluralFa: 'آموزشگاه‌ها',
    descEn: 'Language schools, exam prep centres, and skill academies positioned close to schools, universities, and transit.',
    descFa: 'آموزشگاه‌های زبان، کنکور، هنر و مهارت در مجاورت مدارس، دانشگاه‌ها و مسیرهای حمل‌ونقل عمومی.'
  },
  {
    id: 'services',
    group: 'services',
    color: '#9AA3B5',
    en: 'Service Company',
    fa: 'دفتر و خدمات',
    pluralEn: 'Service Offices',
    pluralFa: 'شرکت‌ها و دفاتر خدماتی',
    descEn: 'Agencies, notary/legal offices, travel desks, and B2B services concentrated around offices, banks, and civic hubs.',
    descFa: 'دفاتر خدماتی، حقوقی، آژانس‌ها و کسب‌وکارهای B2B در نزدیکی مراکز اداری، بانک‌ها و نهادهای شهری.'
  }
];

const BIZ_BY_ID = new Map(BIZ_TYPES.map((b) => [b.id, b]));

// Caches for prepared city rasters and computed analyses
const preparedCityCache = new Map(); // cityId -> PreparedCity
const areaAnalysisCache = new Map(); // `${cityId}:${typeId}` -> SummaryObject
const cityOverviewCache = new Map(); // cityId -> CityOverviewObject

function loadPreparedCity(cityId) {
  if (!CITIES_BY_ID.has(cityId)) return null;
  if (preparedCityCache.has(cityId)) return preparedCityCache.get(cityId);

  const filePath = path.join(ROOT, 'assets/data/cities', `${cityId}.js`);
  if (!fs.existsSync(filePath)) return null;

  const src = fs.readFileSync(filePath, 'utf8');
  let rawData = null;
  const ctx = {
    GA_CITY(data) {
      rawData = data;
    }
  };
  ctx.window = ctx;
  ctx.globalThis = ctx;
  vm.runInNewContext(src, ctx, { filename: `${cityId}.js` });
  if (!rawData) return null;

  const prepared = Jabio.prepare(rawData);
  preparedCityCache.set(cityId, prepared);
  return prepared;
}

function countCategoryPois(prepared, typeId) {
  const cats = Jabio.BIZ[typeId] || [];
  let count = 0;
  for (const cat of cats) {
    const arr = prepared.d.poi[cat];
    if (arr) count += Math.floor(arr.length / 2);
  }
  return count;
}

function getCityCategoryAnalysis(cityId, typeId) {
  const meta = CITIES_BY_ID.get(cityId);
  const biz = BIZ_BY_ID.get(typeId);
  if (!meta || !biz) return null;

  const key = `${cityId}:${typeId}`;
  if (areaAnalysisCache.has(key)) return areaAnalysisCache.get(key);

  const C = loadPreparedCity(cityId);
  if (!C) return null;

  const radius = 1000;
  const opts = {
    type: typeId,
    r: radius,
    audience: [],
    priorities: [],
    strategy: 'balance'
  };
  const result = Jabio.topAreas(C, opts, 6);
  const weights = result.weights.top;
  const poiCount = countCategoryPois(C, typeId);

  // Enrich each top area with exact nearby rival counts & estimated residents
  const areas = result.areas.map((area, index) => {
    const rivalCats = Object.keys(Jabio.compOf(typeId, opts));
    const directRivals = Jabio.near(C, rivalCats, area.lat, area.lon, radius).length;
    const transitStops = Jabio.near(C, ['transit'], area.lat, area.lon, radius).length;
    const rawPop = Math.round(Jabio._x.layer(C, '@pop').length ? (function () {
      const rc = Jabio._x.radiusCells(radius);
      const cell = area.cell;
      const d = C.d;
      // Use direct cell neighborhood sum from discField if accessible via analyzePoint or approximation
      const ptAnalysis = Jabio.analyzePoint(C, area.lat, area.lon, opts);
      return ptAnalysis ? ptAnalysis.residents : 0;
    })() : 0);

    return {
      rank: index + 1,
      lat: Number(area.lat.toFixed(5)),
      lon: Number(area.lon.toFixed(5)),
      score: area.score,
      level: area.level,
      pop: area.pop,
      demand: area.demand,
      access: area.access,
      comp: area.comp,
      room: area.room,
      gap: area.gap,
      quadrant: area.quadrant,
      range: area.range,
      complete: area.complete,
      aff: area.aff,
      place: area.place,
      directRivals,
      transitStops,
      residents: rawPop
    };
  });

  const avgTopScore = areas.length
    ? Math.round(areas.reduce((sum, a) => sum + a.score, 0) / areas.length)
    : 0;

  const summary = {
    city: meta,
    biz,
    radius,
    snapshot: SNAPSHOT,
    poiCount,
    cityPlaces: C.places,
    cityBuildings: C.buildings,
    coverage: C.coverage,
    hasAff: C.hasAff,
    weights: {
      pop: Math.round(weights.pop * 100),
      demand: Math.round(weights.demand * 100),
      access: Math.round(weights.access * 100),
      comp: Math.round(weights.comp * 100)
    },
    avgTopScore,
    bestScore: areas.length ? areas[0].score : 0,
    relaxed: result.relaxed,
    thinSkipped: result.thinSkipped,
    areas
  };

  areaAnalysisCache.set(key, summary);
  return summary;
}

function getCityOverview(cityId) {
  const meta = CITIES_BY_ID.get(cityId);
  if (!meta) return null;
  if (cityOverviewCache.has(cityId)) return cityOverviewCache.get(cityId);

  const categorySummaries = BIZ_TYPES.map((biz) => {
    const analysis = getCityCategoryAnalysis(cityId, biz.id);
    const top = analysis && analysis.areas.length ? analysis.areas[0] : null;
    return {
      biz,
      poiCount: analysis ? analysis.poiCount : 0,
      bestScore: analysis ? analysis.bestScore : 0,
      avgTopScore: analysis ? analysis.avgTopScore : 0,
      topPlace: top ? top.place : null,
      topLat: top ? top.lat : meta.lat,
      topLon: top ? top.lon : meta.lon,
      topLevel: top ? top.level : 'mixed'
    };
  });

  // Sort copy for featured highlights
  const topCategories = [...categorySummaries]
    .sort((a, b) => b.bestScore - a.bestScore)
    .slice(0, 4);

  // Deduplicate featured neighborhoods across top categories
  const seenNames = new Set();
  const hotspots = [];
  for (const cat of categorySummaries) {
    if (cat.topPlace && !seenNames.has(cat.topPlace.en)) {
      seenNames.add(cat.topPlace.en);
      hotspots.push({
        en: cat.topPlace.en,
        fa: cat.topPlace.fa,
        score: cat.bestScore,
        biz: cat.biz,
        lat: cat.topLat,
        lon: cat.topLon
      });
    }
    if (hotspots.length >= 6) break;
  }

  const overview = {
    city: meta,
    snapshot: SNAPSHOT,
    categories: categorySummaries,
    topCategories,
    hotspots
  };

  cityOverviewCache.set(cityId, overview);
  return overview;
}

function getGlobalTotals() {
  return {
    cityCount: CITIES.length,
    categoryCount: BIZ_TYPES.length,
    totalPois: CITIES.reduce((s, c) => s + (c.pois || 0), 0),
    totalBuildings: CITIES.reduce((s, c) => s + (c.buildings || 0), 0),
    totalPeople: CITIES.reduce((s, c) => s + (c.people || 0), 0),
    richCount: CITIES.filter((c) => c.coverage === 'rich').length,
    partialCount: CITIES.filter((c) => c.coverage === 'partial').length,
    thinCount: CITIES.filter((c) => c.coverage === 'thin').length,
    snapshot: SNAPSHOT
  };
}

function getMethodologyWeights() {
  return BIZ_TYPES.map((biz) => {
    const w = Jabio.weights(biz.id, { audience: [], priorities: [], strategy: 'balance' });
    const topDrivers = Object.entries(w.drivers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => ({ key: k, pct: Math.round(v * 100) }));
    return {
      biz,
      pop: Math.round(w.top.pop * 100),
      demand: Math.round(w.top.demand * 100),
      access: Math.round(w.top.access * 100),
      comp: Math.round(w.top.comp * 100),
      topDrivers
    };
  });
}

module.exports = {
  CITIES,
  CITIES_BY_ID,
  SNAPSHOT,
  BIZ_TYPES,
  BIZ_BY_ID,
  getCityCategoryAnalysis,
  getCityOverview,
  getGlobalTotals,
  getMethodologyWeights
};
