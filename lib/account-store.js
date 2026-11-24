/* Persistent server-side account store for Jabio email/phone auth, profiles, OTP codes, and saved analyses.
   Uses atomic JSON file persistence in .data/ so accounts survive server restarts without external DB setup. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', '.data');
const STORE_PATH = path.join(DATA_DIR, 'jabio-accounts.json');

const VALID_CITIES = new Set([
  'tehran', 'mashhad', 'isfahan', 'shiraz', 'tabriz', 'karaj', 'ahvaz',
  'qom', 'kermanshah', 'rasht', 'urmia', 'yazd', 'kerman', 'bandarabbas', 'ardabil'
]);

const VALID_CATEGORIES = new Set([
  '', 'cafe', 'restaurant', 'fastfood', 'bakery', 'grocery', 'pharmacy',
  'clinic', 'salon', 'gym', 'clothing', 'electronics', 'bookstore',
  'pet', 'flower', 'hardware', 'tutoring', 'laundry'
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

function toLatinDigits(str) {
  return String(str == null ? '' : str)
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

function isValidEmail(raw) {
  const s = String(raw || '').trim().toLowerCase();
  return s.length >= 5 && s.length <= 160 && EMAIL_RE.test(s);
}

function normalizeEmail(raw) {
  return String(raw || '').trim().toLowerCase();
}

function normalizePhone(raw) {
  const cleaned = toLatinDigits(raw).replace(/[\s\-().]/g, '');
  if (!cleaned) return '';
  if (/^09\d{9}$/.test(cleaned)) return '+98' + cleaned.slice(1);
  if (/^9\d{9}$/.test(cleaned)) return '+98' + cleaned;
  if (/^00989\d{9}$/.test(cleaned)) return '+98' + cleaned.slice(4);
  if (/^989\d{9}$/.test(cleaned)) return '+' + cleaned;
  if (/^\+989\d{9}$/.test(cleaned)) return cleaned;
  if (/^\+[1-9]\d{8,14}$/.test(cleaned)) return cleaned;
  return '';
}

function formatPhoneDisplay(e164) {
  if (!e164) return '';
  if (e164.startsWith('+989') && e164.length === 13) {
    const local = '0' + e164.slice(3);
    return local.slice(0, 4) + ' ' + local.slice(4, 7) + ' ' + local.slice(7);
  }
  return e164;
}

function parseQueryMeta(q) {
  try {
    const sp = new URLSearchParams(String(q || ''));
    const city = VALID_CITIES.has(sp.get('c')) ? sp.get('c') : (VALID_CITIES.has(sp.get('city')) ? sp.get('city') : 'tehran');
    const type = sp.get('t') || sp.get('type') || 'cafe';
    return { city, type: String(type).slice(0, 40) };
  } catch {
    return { city: 'tehran', type: 'cafe' };
  }
}

function sanitizeProfile(input, existing = {}) {
  const src = input && typeof input === 'object' ? input : {};
  const accountType = src.accountType === 'organization' || (src.accountType == null && existing.accountType === 'organization')
    ? 'organization'
    : 'personal';

  const displayName = typeof src.displayName === 'string'
    ? src.displayName.trim().slice(0, 80)
    : (existing.displayName || '');

  const preferredCity = typeof src.preferredCity === 'string' && VALID_CITIES.has(src.preferredCity)
    ? src.preferredCity
    : (existing.preferredCity && VALID_CITIES.has(existing.preferredCity) ? existing.preferredCity : 'tehran');

  const preferredCategory = typeof src.preferredCategory === 'string' && VALID_CATEGORIES.has(src.preferredCategory)
    ? src.preferredCategory
    : (existing.preferredCategory || '');

  const preferredLang = src.preferredLang === 'en' || src.preferredLang === 'fa'
    ? src.preferredLang
    : (existing.preferredLang === 'en' || existing.preferredLang === 'fa' ? existing.preferredLang : 'fa');

  const organizationName = typeof src.organizationName === 'string'
    ? src.organizationName.trim().slice(0, 100)
    : (existing.organizationName || '');

  const roleTitle = typeof src.roleTitle === 'string'
    ? src.roleTitle.trim().slice(0, 80)
    : (existing.roleTitle || '');

  const industry = typeof src.industry === 'string'
    ? src.industry.trim().slice(0, 80)
    : (existing.industry || '');

  const branchCount = typeof src.branchCount === 'string'
    ? src.branchCount.trim().slice(0, 32)
    : (existing.branchCount || '');

  return {
    displayName,
    accountType,
    preferredCity,
    preferredCategory,
    preferredLang,
    organizationName,
    roleTitle,
    industry,
    branchCount
  };
}

function defaultState() {
  return {
    version: 2,
    users: {},
    sessions: {},
    analyses: [],
    inquiries: []
  };
}

class AccountStore {
  constructor() {
    this.data = defaultState();
    this.resetCodes = new Map();
    this.verifyCodes = new Map();
    this.load();
  }

  load() {
    try {
      if (!fs.existsSync(STORE_PATH)) return;
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        this.data = {
          version: 2,
          users: parsed.users && typeof parsed.users === 'object' ? parsed.users : {},
          sessions: parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {},
          analyses: Array.isArray(parsed.analyses) ? parsed.analyses : [],
          inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : []
        };
        this.pruneSessions();
      }
    } catch (err) {
      console.error('Could not load account store, initializing fresh store:', err.message);
      this.data = defaultState();
    }
  }

  save() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = STORE_PATH + '.' + process.pid + '.' + Date.now() + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), { mode: 0o600 });
      fs.renameSync(tmp, STORE_PATH);
    } catch (err) {
      console.error('Failed to persist account store:', err.message);
    }
  }

  pruneSessions() {
    const now = Date.now();
    let changed = false;
    for (const [sid, s] of Object.entries(this.data.sessions)) {
      if (!s || !s.exp || s.exp < now || !this.data.users[s.email]) {
        delete this.data.sessions[sid];
        changed = true;
      }
    }
    if (changed) this.save();
  }

  getUserByEmail(email) {
    const key = normalizeEmail(email);
    return key ? this.data.users[key] || null : null;
  }

  getUserByPhone(phone) {
    const norm = normalizePhone(phone);
    if (!norm) return null;
    for (const user of Object.values(this.data.users)) {
      if (user && user.phone === norm) return user;
    }
    return null;
  }

  getUserByIdentifier(identifier) {
    const raw = String(identifier || '').trim();
    if (!raw) return null;
    if (raw.includes('@')) return this.getUserByEmail(raw);
    return this.getUserByPhone(raw);
  }

  createUser({ email, phone, passwordHash, profile }) {
    const normEmail = normalizeEmail(email);
    const normPhone = phone ? normalizePhone(phone) : '';
    const now = new Date().toISOString();
    const uid = 'usr_' + crypto.randomBytes(10).toString('hex');
    const cleanProfile = sanitizeProfile(profile || {}, {
      displayName: (profile && profile.displayName) || normEmail.split('@')[0],
      preferredCity: 'tehran',
      preferredLang: 'fa',
      accountType: 'personal'
    });
    const user = {
      uid,
      email: normEmail,
      emailVerified: false,
      phone: normPhone,
      phoneVerified: false,
      authProvider: 'password',
      passwordHash,
      profile: cleanProfile,
      createdAt: now,
      updatedAt: now
    };
    this.data.users[normEmail] = user;
    this.save();
    return user;
  }

  updateUser(email, updater) {
    const user = this.getUserByEmail(email);
    if (!user) return null;
    updater(user);
    user.updatedAt = new Date().toISOString();
    this.save();
    return user;
  }

  deleteUser(email) {
    const key = normalizeEmail(email);
    delete this.data.users[key];
    for (const [sid, s] of Object.entries(this.data.sessions)) {
      if (s && s.email === key) delete this.data.sessions[sid];
    }
    this.data.analyses = this.data.analyses.filter((a) => a.email !== key);
    this.save();
  }

  createSession(email, ttlMs) {
    const sid = crypto.randomBytes(24).toString('base64url');
    this.data.sessions[sid] = {
      email: normalizeEmail(email),
      exp: Date.now() + ttlMs
    };
    this.save();
    return sid;
  }

  getSession(sid) {
    if (!sid || !this.data.sessions[sid]) return null;
    const s = this.data.sessions[sid];
    if (s.exp < Date.now()) {
      delete this.data.sessions[sid];
      this.save();
      return null;
    }
    const user = this.getUserByEmail(s.email);
    if (!user) {
      delete this.data.sessions[sid];
      this.save();
      return null;
    }
    return { sid, email: s.email, user };
  }

  deleteSession(sid) {
    if (sid && this.data.sessions[sid]) {
      delete this.data.sessions[sid];
      this.save();
    }
  }

  revokeUserSessions(email) {
    const key = normalizeEmail(email);
    let changed = false;
    for (const [sid, s] of Object.entries(this.data.sessions)) {
      if (s && s.email === key) {
        delete this.data.sessions[sid];
        changed = true;
      }
    }
    if (changed) this.save();
  }

  listAnalyses(email) {
    const key = normalizeEmail(email);
    return this.data.analyses
      .filter((a) => a.email === key)
      .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
  }

  addAnalysis(email, payload) {
    const key = normalizeEmail(email);
    const meta = parseQueryMeta(payload.q);
    const now = new Date().toISOString();
    const item = {
      id: 'anl_' + crypto.randomBytes(8).toString('hex'),
      email: key,
      name: String(payload.name || '').trim().slice(0, 80) || 'Saved spot',
      q: String(payload.q || '').trim().slice(0, 600),
      city: payload.city && VALID_CITIES.has(payload.city) ? payload.city : meta.city,
      type: payload.type ? String(payload.type).slice(0, 40) : meta.type,
      score: typeof payload.score === 'number' && Number.isFinite(payload.score) ? Math.max(0, Math.min(100, Math.round(payload.score))) : null,
      method: String(payload.method || 'jabio-v1').slice(0, 64),
      notes: typeof payload.notes === 'string' ? payload.notes.trim().slice(0, 500) : '',
      createdAt: now,
      updatedAt: now
    };
    this.data.analyses.push(item);
    this.save();
    return item;
  }

  updateAnalysis(email, id, updates) {
    const key = normalizeEmail(email);
    const item = this.data.analyses.find((a) => a.email === key && a.id === id);
    if (!item) return null;
    if (typeof updates.name === 'string' && updates.name.trim()) {
      item.name = updates.name.trim().slice(0, 80);
    }
    if (typeof updates.notes === 'string') {
      item.notes = updates.notes.trim().slice(0, 500);
    }
    item.updatedAt = new Date().toISOString();
    this.save();
    return item;
  }

  deleteAnalysis(email, id) {
    const key = normalizeEmail(email);
    const before = this.data.analyses.length;
    this.data.analyses = this.data.analyses.filter((a) => !(a.email === key && a.id === id));
    if (this.data.analyses.length !== before) {
      this.save();
      return true;
    }
    return false;
  }

  addInquiry(inquiry) {
    this.data.inquiries.push(inquiry);
    if (this.data.inquiries.length > 500) this.data.inquiries.shift();
    this.save();
  }

  // ── Time-limited 6-digit OTP codes (hashed at rest in memory) ─────────
  generateCode(map, key, meta, ttlMs = 15 * 60 * 1000) {
    const num = crypto.randomInt(100000, 1000000);
    const code = String(num);
    const codeHash = crypto.createHash('sha256').update(code).digest();
    map.set(key, {
      codeHash,
      exp: Date.now() + ttlMs,
      attempts: 0,
      meta: meta || {}
    });
    return code;
  }

  verifyCode(map, key, rawCode) {
    const rec = map.get(key);
    if (!rec) return { ok: false, reason: 'invalid_code' };
    if (rec.exp < Date.now()) {
      map.delete(key);
      return { ok: false, reason: 'expired_code' };
    }
    rec.attempts += 1;
    if (rec.attempts > 5) {
      map.delete(key);
      return { ok: false, reason: 'rate_limited' };
    }
    const clean = toLatinDigits(rawCode).replace(/\s+/g, '');
    if (!/^\d{6}$/.test(clean)) return { ok: false, reason: 'invalid_code' };
    const hash = crypto.createHash('sha256').update(clean).digest();
    if (!crypto.timingSafeEqual(rec.codeHash, hash)) {
      return { ok: false, reason: 'invalid_code' };
    }
    map.delete(key);
    return { ok: true, meta: rec.meta };
  }

  publicUser(user) {
    if (!user) return null;
    const items = this.listAnalyses(user.email);
    return {
      authenticated: true,
      uid: user.uid,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
      phone: user.phone || '',
      phoneDisplay: formatPhoneDisplay(user.phone || ''),
      phoneVerified: Boolean(user.phoneVerified),
      authProvider: user.authProvider || 'password',
      profile: sanitizeProfile(user.profile || {}),
      analysesCount: items.length,
      createdAt: user.createdAt
    };
  }
}

module.exports = {
  AccountStore,
  VALID_CITIES,
  VALID_CATEGORIES,
  toLatinDigits,
  isValidEmail,
  normalizeEmail,
  normalizePhone,
  formatPhoneDisplay,
  sanitizeProfile
};
