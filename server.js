const express = require('express');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { CITIES, CITIES_BY_ID, BIZ_TYPES } = require('./lib/cities-engine');
const { BLOG_POSTS } = require('./lib/content-data');
const ssrPages = require('./lib/ssr-pages');

const {
  AccountStore,
  VALID_CITIES,
  VALID_CATEGORIES,
  toLatinDigits,
  isValidEmail,
  normalizeEmail,
  normalizePhone,
  formatPhoneDisplay,
  sanitizeProfile
} = require('./lib/account-store');
const {
  isSmtpConfigured,
  isSmsConfigured,
  sendEmailCode,
  sendSmsCode
} = require('./lib/delivery');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const SESSION_COOKIE = 'jabio_sid';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const COMMON_PASSWORDS = new Set([
  '1234567890', '0123456789', '12345678910', 'password12', 'password123',
  'qwerty1234', 'qwertyuiop', 'letmein123', 'admin12345', 'welcome123',
  'aaaaaaaaaa', '1111111111', '0000000000'
]);

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.use(express.json({ limit: '64kb' }));
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid_json' });
  }
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'payload_too_large' });
  }
  return next(err);
});

// Persistent server-side account store (.data/jabio-accounts.json) + rate-limit tracker
const store = new AccountStore();
const attempts = new Map(); // ipHash -> { count: number, started: number }

function invalidateUserSessions(email, keepSid = null) {
  const key = normalizeEmail(email);
  let changed = false;
  for (const [sid, sess] of Object.entries(store.data.sessions)) {
    if (sess && sess.email === key && sid !== keepSid) {
      delete store.data.sessions[sid];
      changed = true;
    }
  }
  if (changed) store.save();
}

function parseCookies(header) {
  const out = {};
  if (!header || typeof header !== 'string') return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        out[key] = decodeURIComponent(val);
      } catch {
        out[key] = val;
      }
    }
  }
  return out;
}

function setSessionCookie(req, res, sid) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(sid)}`,
    'HttpOnly',
    'Path=/',
    'Max-Age=1209600'
  ];
  if (req.secure || req.get('x-forwarded-proto') === 'https') {
    parts.push('SameSite=None', 'Secure', 'Partitioned');
  } else {
    parts.push('SameSite=Lax');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

function createSession(email = null) {
  const sid = crypto.randomBytes(32).toString('hex');
  const csrf = crypto.randomBytes(24).toString('hex');
  const session = {
    email: email ? normalizeEmail(email) : null,
    csrf,
    createdAt: Date.now(),
    exp: Date.now() + SESSION_TTL_MS
  };
  store.data.sessions[sid] = session;
  store.save();
  return { sid, session };
}

function getOrCreateSession(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const existingSid = cookies[SESSION_COOKIE];
  const existing = existingSid && store.data.sessions[existingSid];
  if (existing && existing.exp > Date.now() && existing.csrf) {
    return { sid: existingSid, session: existing };
  }
  if (existingSid && store.data.sessions[existingSid]) {
    delete store.data.sessions[existingSid];
  }
  const created = createSession(null);
  setSessionCookie(req, res, created.sid);
  return created;
}

function rotateSession(req, res, oldSid, email) {
  if (oldSid && store.data.sessions[oldSid]) {
    delete store.data.sessions[oldSid];
  }
  const created = createSession(email);
  setSessionCookie(req, res, created.sid);
  return created;
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false;
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hashHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function cleanEmail(raw) {
  if (typeof raw !== 'string') return null;
  const value = normalizeEmail(raw);
  if (!isValidEmail(value)) return null;
  return value;
}

function validPassword(password, email) {
  if (typeof password !== 'string') return false;
  if (password.length < 10 || password.length > 256) return false;
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) return false;
  if (/^\d+$/.test(password)) return false;
  const local = (email || '').split('@')[0];
  if (local && local.length >= 4 && lower === local) return false;
  return true;
}

function isRateLimited(req, bucket = 'auth', maxCount = 30) {
  const ip = req.ip || req.socket?.remoteAddress || '';
  const key = crypto.createHash('sha256').update(`${ip}|${bucket}`).digest('hex');
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  let entry = attempts.get(key);
  if (!entry || now - entry.started > windowMs) {
    entry = { count: 0, started: now };
  }
  entry.count += 1;
  attempts.set(key, entry);
  return entry.count > maxCount;
}

function validAnalysisData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  if (typeof data.q !== 'string' || data.q.length === 0 || data.q.length > 2000) return false;
  return JSON.stringify(data).length <= 8000;
}

function formatAnalysisRow(item) {
  return {
    id: item.id,
    data: {
      name: item.name,
      q: item.q,
      city: item.city,
      type: item.type,
      score: item.score,
      method: item.method,
      notes: item.notes || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }
  };
}

function getAuthenticatedUser(req) {
  if (!req.session || !req.session.email) return null;
  return store.getUserByEmail(req.session.email);
}

// API middleware: session + CSRF enforcement on mutating requests
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  const { sid, session } = getOrCreateSession(req, res);
  req.sessionId = sid;
  req.session = session;

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    const headerToken = req.get('x-csrftoken') || '';
    if (!safeEqual(headerToken, session.csrf)) {
      return res.status(403).json({ error: 'csrf_failed' });
    }
  }
  return next();
});

app.get('/api/session', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.json({
      authenticated: false,
      email: null,
      phone: '',
      profile: null,
      smtpConfigured: isSmtpConfigured(),
      smsConfigured: isSmsConfigured(),
      csrf: req.session.csrf
    });
  }
  return res.json({
    ...store.publicUser(user),
    smtpConfigured: isSmtpConfigured(),
    smsConfigured: isSmsConfigured(),
    csrf: req.session.csrf
  });
});

app.post('/api/register', async (req, res) => {
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const email = cleanEmail(body.email);
  const password = body.password;
  if (!email || !validPassword(password, email)) {
    return res.status(400).json({ error: 'invalid_registration' });
  }
  if (store.getUserByEmail(email)) {
    return res.status(409).json({ error: 'account_exists' });
  }

  let phone = '';
  if (typeof body.phone === 'string' && body.phone.trim()) {
    phone = normalizePhone(body.phone);
    if (!phone) {
      return res.status(400).json({ error: 'invalid_phone' });
    }
    if (store.getUserByPhone(phone)) {
      return res.status(409).json({ error: 'phone_exists' });
    }
  }

  const profileInput = sanitizeProfile({
    displayName: typeof body.displayName === 'string' ? body.displayName : email.split('@')[0],
    accountType: body.accountType === 'organization' ? 'organization' : 'personal',
    preferredCity: body.preferredCity || 'tehran',
    preferredCategory: body.preferredCategory || '',
    preferredLang: body.preferredLang === 'en' ? 'en' : 'fa',
    organizationName: body.organizationName || '',
    roleTitle: body.roleTitle || '',
    industry: body.industry || '',
    branchCount: body.branchCount || ''
  });

  const user = store.createUser({
    email,
    phone,
    passwordHash: hashPassword(password),
    profile: profileInput
  });

  const rotated = rotateSession(req, res, req.sessionId, email);

  // Issue 6-digit email verification code
  const code = store.generateCode(store.verifyCodes, `email:${email}`, { email, channel: 'email' });
  const delivery = await sendEmailCode({
    to: email,
    code,
    purpose: 'verify',
    lang: profileInput.preferredLang
  });

  return res.status(201).json({
    ...store.publicUser(user),
    verification: {
      channel: 'email',
      delivered: delivery.delivered,
      configured: delivery.configured,
      previewCode: delivery.previewCode || null,
      expiresInMinutes: 15
    },
    csrf: rotated.session.csrf
  });
});

app.post('/api/login', (req, res) => {
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const rawIdentifier = typeof body.identifier === 'string' && body.identifier.trim()
    ? body.identifier.trim()
    : (typeof body.email === 'string' ? body.email.trim() : '');
  const password = body.password;
  if (!rawIdentifier || typeof password !== 'string' || !password) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const user = store.getUserByIdentifier(rawIdentifier);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }

  const rotated = rotateSession(req, res, req.sessionId, user.email);
  return res.json({
    ...store.publicUser(user),
    csrf: rotated.session.csrf
  });
});

app.post('/api/logout', (req, res) => {
  const rotated = rotateSession(req, res, req.sessionId, null);
  return res.json({
    authenticated: false,
    csrf: rotated.session.csrf
  });
});

// ── Email & Phone Verification Codes ────────────────────────────────────────
app.post('/api/verification/request', async (req, res) => {
  if (isRateLimited(req, 'verify', 15)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const channel = body.channel === 'phone' ? 'phone' : 'email';

  if (channel === 'phone') {
    const rawPhone = typeof body.phone === 'string' && body.phone.trim() ? body.phone : user.phone;
    const normPhone = normalizePhone(rawPhone);
    if (!normPhone) {
      return res.status(400).json({ error: 'invalid_phone' });
    }
    const existingOwner = store.getUserByPhone(normPhone);
    if (existingOwner && existingOwner.email !== user.email) {
      return res.status(409).json({ error: 'phone_exists' });
    }
    if (user.phone !== normPhone) {
      store.updateUser(user.email, (u) => {
        u.phone = normPhone;
        u.phoneVerified = false;
      });
    }
    const code = store.generateCode(store.verifyCodes, `phone:${user.email}`, { email: user.email, phone: normPhone, channel: 'phone' });
    const delivery = await sendSmsCode({ to: normPhone, code, purpose: 'verify' });
    return res.json({
      ok: true,
      channel: 'phone',
      target: formatPhoneDisplay(normPhone),
      delivered: delivery.delivered,
      configured: delivery.configured,
      previewCode: delivery.previewCode || null,
      expiresInMinutes: 15
    });
  }

  const code = store.generateCode(store.verifyCodes, `email:${user.email}`, { email: user.email, channel: 'email' });
  const delivery = await sendEmailCode({
    to: user.email,
    code,
    purpose: 'verify',
    lang: (user.profile && user.profile.preferredLang) || 'fa'
  });
  return res.json({
    ok: true,
    channel: 'email',
    target: user.email,
    delivered: delivery.delivered,
    configured: delivery.configured,
    previewCode: delivery.previewCode || null,
    expiresInMinutes: 15
  });
});

app.post('/api/verification/confirm', (req, res) => {
  if (isRateLimited(req, 'verify', 20)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const channel = body.channel === 'phone' ? 'phone' : 'email';
  const code = typeof body.code === 'string' ? body.code.trim() : '';
  const result = store.verifyCode(store.verifyCodes, `${channel}:${user.email}`, code);
  if (!result.ok) {
    return res.status(result.reason === 'rate_limited' ? 429 : 400).json({ error: result.reason });
  }
  store.updateUser(user.email, (u) => {
    if (channel === 'phone') {
      if (result.meta && result.meta.phone) u.phone = result.meta.phone;
      u.phoneVerified = true;
    } else {
      u.emailVerified = true;
    }
  });
  const updated = store.getUserByEmail(user.email);
  return res.json({ ok: true, ...store.publicUser(updated) });
});

// ── Profile & Account Settings ──────────────────────────────────────────────
app.get('/api/account/profile', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  return res.json(store.publicUser(user));
});

app.patch('/api/account/profile', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (body.displayName !== undefined && (typeof body.displayName !== 'string' || body.displayName.trim().length > 80)) {
    return res.status(400).json({ error: 'invalid_display_name' });
  }
  if (body.preferredCity !== undefined && (typeof body.preferredCity !== 'string' || !VALID_CITIES.has(body.preferredCity))) {
    return res.status(400).json({ error: 'invalid_city' });
  }
  if (body.preferredCategory !== undefined && (typeof body.preferredCategory !== 'string' || !VALID_CATEGORIES.has(body.preferredCategory))) {
    return res.status(400).json({ error: 'invalid_category' });
  }
  if (body.preferredLang !== undefined && body.preferredLang !== 'en' && body.preferredLang !== 'fa') {
    return res.status(400).json({ error: 'invalid_lang' });
  }
  if (body.accountType !== undefined && body.accountType !== 'personal' && body.accountType !== 'organization') {
    return res.status(400).json({ error: 'invalid_account_type' });
  }

  let nextPhone = user.phone || '';
  let phoneChanged = false;
  if (body.phone !== undefined) {
    const raw = typeof body.phone === 'string' ? body.phone.trim() : '';
    if (!raw) {
      phoneChanged = nextPhone !== '';
      nextPhone = '';
    } else {
      const norm = normalizePhone(raw);
      if (!norm) {
        return res.status(400).json({ error: 'invalid_phone' });
      }
      const existingOwner = store.getUserByPhone(norm);
      if (existingOwner && existingOwner.email !== user.email) {
        return res.status(409).json({ error: 'phone_exists' });
      }
      phoneChanged = nextPhone !== norm;
      nextPhone = norm;
    }
  }

  const updated = store.updateUser(user.email, (u) => {
    u.profile = sanitizeProfile(body, u.profile || {});
    if (body.phone !== undefined) {
      u.phone = nextPhone;
      if (phoneChanged) u.phoneVerified = false;
    }
  });
  return res.json({ ok: true, ...store.publicUser(updated) });
});

app.post('/api/account/password', (req, res) => {
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (!verifyPassword(body.currentPassword, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  if (!validPassword(body.newPassword, user.email)) {
    return res.status(400).json({ error: 'invalid_password' });
  }
  store.updateUser(user.email, (u) => {
    u.passwordHash = hashPassword(body.newPassword);
  });
  const rotated = rotateSession(req, res, req.sessionId, user.email);
  invalidateUserSessions(user.email, rotated.sid);
  return res.json({ ok: true, csrf: rotated.session.csrf });
});

app.delete('/api/account', (req, res) => {
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (!verifyPassword(body.password, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const email = user.email;
  store.deleteUser(email);
  const rotated = rotateSession(req, res, req.sessionId, null);
  return res.json({ deleted: true, csrf: rotated.session.csrf });
});

// ── Dual-Channel Password Recovery (Email & Phone) ──────────────────────────
app.post('/api/password-reset/request', async (req, res) => {
  if (isRateLimited(req, 'reset', 15)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const rawIdentifier = typeof body.identifier === 'string' && body.identifier.trim()
    ? body.identifier.trim()
    : (typeof body.email === 'string' ? body.email.trim() : (typeof body.phone === 'string' ? body.phone.trim() : ''));
  const explicitChannel = body.channel === 'phone' ? 'phone' : body.channel === 'email' ? 'email' : (rawIdentifier.includes('@') ? 'email' : 'phone');

  if (explicitChannel === 'email') {
    const email = cleanEmail(rawIdentifier);
    if (!email) return res.status(400).json({ error: 'invalid_email' });
    const user = store.getUserByEmail(email);
    let delivery = { delivered: false, configured: isSmtpConfigured(), previewCode: null };
    if (user) {
      const code = store.generateCode(store.resetCodes, `email:${email}`, { email: user.email, channel: 'email' });
      delivery = await sendEmailCode({
        to: email,
        code,
        purpose: 'reset',
        lang: (user.profile && user.profile.preferredLang) || 'fa'
      });
    }
    return res.json({
      ok: true,
      channel: 'email',
      smtpConfigured: isSmtpConfigured(),
      configured: delivery.configured,
      delivered: delivery.delivered,
      previewCode: delivery.previewCode || null,
      expiresInMinutes: 15
    });
  }

  const normPhone = normalizePhone(rawIdentifier);
  if (!normPhone) return res.status(400).json({ error: 'invalid_phone' });
  const user = store.getUserByPhone(normPhone);
  let delivery = { delivered: false, configured: isSmsConfigured(), previewCode: null };
  if (user) {
    const code = store.generateCode(store.resetCodes, `phone:${normPhone}`, { email: user.email, phone: normPhone, channel: 'phone' });
    delivery = await sendSmsCode({ to: normPhone, code, purpose: 'reset' });
  }
  return res.json({
    ok: true,
    channel: 'phone',
    smsConfigured: isSmsConfigured(),
    configured: delivery.configured,
    delivered: delivery.delivered,
    previewCode: delivery.previewCode || null,
    expiresInMinutes: 15
  });
});

app.post('/api/password-reset/confirm', (req, res) => {
  if (isRateLimited(req, 'reset', 20)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const rawIdentifier = typeof body.identifier === 'string' && body.identifier.trim()
    ? body.identifier.trim()
    : (typeof body.email === 'string' ? body.email.trim() : (typeof body.phone === 'string' ? body.phone.trim() : ''));
  const channel = body.channel === 'phone' ? 'phone' : body.channel === 'email' ? 'email' : (rawIdentifier.includes('@') ? 'email' : 'phone');
  const code = toLatinDigits(typeof body.code === 'string' ? body.code.trim() : '').replace(/\s+/g, '');
  const newPassword = body.newPassword;

  let key = '';
  let user = null;
  if (channel === 'email') {
    const email = cleanEmail(rawIdentifier);
    if (!email) return res.status(400).json({ error: 'invalid_or_expired_code' });
    key = `email:${email}`;
    user = store.getUserByEmail(email);
  } else {
    const normPhone = normalizePhone(rawIdentifier);
    if (!normPhone) return res.status(400).json({ error: 'invalid_or_expired_code' });
    key = `phone:${normPhone}`;
    user = store.getUserByPhone(normPhone);
  }

  if (!user || !code) {
    return res.status(400).json({ error: 'invalid_or_expired_code' });
  }

  const check = store.verifyCode(store.resetCodes, key, code);
  if (!check.ok) {
    return res.status(check.reason === 'rate_limited' ? 429 : 400).json({ error: 'invalid_or_expired_code' });
  }

  if (!validPassword(newPassword, user.email)) {
    return res.status(400).json({ error: 'invalid_password' });
  }

  store.updateUser(user.email, (u) => {
    u.passwordHash = hashPassword(newPassword);
    if (channel === 'email') u.emailVerified = true;
    if (channel === 'phone') u.phoneVerified = true;
  });
  invalidateUserSessions(user.email);
  const rotated = rotateSession(req, res, req.sessionId, null);
  return res.json({ ok: true, email: user.email, csrf: rotated.session.csrf });
});

app.post('/api/pricing/inquiry', (req, res) => {
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = cleanEmail(body.email);
  const plan = body.plan === 'enterprise' ? 'enterprise' : body.plan === 'pro' ? 'pro' : null;
  const billing = body.billing === 'annual' ? 'annual' : 'monthly';
  const city = typeof body.city === 'string' && CITIES_BY_ID.has(body.city) ? body.city : 'tehran';
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 1000) : '';
  if (name.length < 2 || name.length > 80 || !email || !plan) {
    return res.status(400).json({ error: 'invalid_inquiry' });
  }
  const entry = {
    id: 'inq_' + crypto.randomBytes(6).toString('hex'),
    name,
    email,
    plan,
    billing,
    city,
    note,
    createdAt: new Date().toISOString()
  };
  store.addInquiry(entry);
  return res.status(201).json({ ok: true, id: entry.id });
});

app.get('/api/analyses', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const items = store.listAnalyses(user.email).map(formatAnalysisRow);
  return res.json({ items });
});

app.post('/api/analyses', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const data = req.body && typeof req.body === 'object' ? req.body.data : null;
  if (!validAnalysisData(data)) {
    return res.status(400).json({ error: 'invalid_analysis' });
  }
  const entry = store.addAnalysis(user.email, data);
  return res.status(201).json(formatAnalysisRow(entry));
});

app.patch('/api/analyses/:id', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const name = typeof body.name === 'string' ? body.name.trim() : undefined;
  const notes = typeof body.notes === 'string' ? body.notes : undefined;
  if (name !== undefined && (!name || name.length > 80)) {
    return res.status(400).json({ error: 'invalid_name' });
  }
  const updated = store.updateAnalysis(user.email, req.params.id, { name, notes });
  if (!updated) {
    return res.status(404).json({ error: 'not_found' });
  }
  return res.json(formatAnalysisRow(updated));
});

app.delete('/api/analyses/:id', (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  const removed = store.deleteAnalysis(user.email, req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'not_found' });
  }
  return res.json({ deleted: true });
});

// Self-hosted Three.js modules for 3D character rendering
app.use('/assets/vendor/three/build', express.static(path.join(__dirname, 'node_modules/three/build'), {
  index: false,
  fallthrough: false,
  maxAge: '7d'
}));
app.use('/assets/vendor/three/jsm', express.static(path.join(__dirname, 'node_modules/three/examples/jsm'), {
  index: false,
  fallthrough: false,
  maxAge: '7d'
}));

// Static assets under /assets with SEO-friendly cache headers
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  index: false,
  fallthrough: false,
  setHeaders(res, filePath) {
    if (/\.(?:woff2|png|jpe?g|webp|svg|ico)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    } else if (/\.(?:css|js)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
  }
}));

// Generated editorial photography & spatial visuals for Hub pages
app.use('/src/assets/images', express.static(path.join(__dirname, 'src/assets/images'), {
  index: false,
  fallthrough: false,
  maxAge: '7d'
}));

// ── SEO helpers: dynamic origin, sitemap.xml, robots.txt, and HTML metadata resolution ──
const NOINDEX_PAGES = new Set(['login.html', 'signup.html', 'saved.html', 'report.html', '404.html']);
const SITEMAP_PAGES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/jabio.html', changefreq: 'weekly', priority: '0.95' },
  { path: '/compare.html', changefreq: 'weekly', priority: '0.85' },
  { path: '/categories.html', changefreq: 'monthly', priority: '0.85' },
  { path: '/examples.html', changefreq: 'monthly', priority: '0.80' },
  { path: '/guide.html', changefreq: 'monthly', priority: '0.80' },
  { path: '/faq.html', changefreq: 'monthly', priority: '0.75' },
  { path: '/sources.html', changefreq: 'monthly', priority: '0.70' },
  { path: '/survey.html', changefreq: 'monthly', priority: '0.65' },
  { path: '/about.html', changefreq: 'monthly', priority: '0.65' },
  { path: '/contact.html', changefreq: 'yearly', priority: '0.55' },
  { path: '/privacy.html', changefreq: 'yearly', priority: '0.35' },
  { path: '/terms.html', changefreq: 'yearly', priority: '0.35' }
];

function getBaseUrl(req) {
  const configured = (process.env.SITE_URL || process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  const host = req.get('host');
  if (!host) return 'http://localhost:3000';
  const proto = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : req.protocol;
  return `${proto}://${host}`;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sendSeoHtml(req, res, fileName, statusCode = 200) {
  const fullPath = path.join(__dirname, fileName);
  let html;
  try {
    html = fs.readFileSync(fullPath, 'utf8');
  } catch {
    return res.status(404).send('Not Found');
  }

  const baseUrl = getBaseUrl(req);
  const pagePath = fileName === 'index.html' ? '/' : `/${fileName}`;
  const reqLang = req.query && (req.query.lang === 'fa' || req.query.lang === 'en') ? req.query.lang : null;
  const canonicalUrl = reqLang ? `${baseUrl}${pagePath}?lang=${reqLang}` : `${baseUrl}${pagePath}`;

  if (NOINDEX_PAGES.has(fileName) || statusCode === 404) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }

  // Resolve origin placeholders across canonical, hreflang, OpenGraph, Twitter, and JSON-LD
  html = html.replace(/__SITE_URL__/g, baseUrl);
  html = html.replace(/__CANONICAL_URL__/g, escapeAttr(canonicalUrl));

  // Server-side Persian metadata when crawled with ?lang=fa so bots receive native Persian head tags
  if (reqLang === 'fa') {
    const titleMatch = html.match(/data-title-fa="([^"]*)"/);
    const descMatch = html.match(/data-desc-fa="([^"]*)"/);
    const faTitle = titleMatch ? titleMatch[1] : null;
    const faDesc = descMatch ? descMatch[1] : null;

    html = html.replace(/<html\s+lang="en"\s+dir="ltr"/, '<html lang="fa" dir="rtl"');
    if (faTitle) {
      html = html
        .replace(/<title>[^<]*<\/title>/, `<title>${faTitle}</title>`)
        .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${faTitle}$2`)
        .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${faTitle}$2`);
    }
    if (faDesc) {
      html = html
        .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${faDesc}$2`)
        .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${faDesc}$2`)
        .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/, `$1${faDesc}$2`);
    }
    html = html
      .replace(/(<meta\s+property="og:locale"\s+content=")en_US(")/, '$1fa_IR$2')
      .replace(/(<meta\s+property="og:locale:alternate"\s+content=")fa_IR(")/, '$1en_US$2');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(statusCode).send(html);
}

function reqLangOf(req) {
  return req.query && req.query.lang === 'fa' ? 'fa' : 'en';
}

function sendRendered(res, html, opts = {}) {
  if (!html) return false;
  if (opts.noindex) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cache-Control', 'no-store');
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(opts.status || 200).send(html);
  return true;
}

app.get('/robots.txt', (req, res) => {
  const baseUrl = getBaseUrl(req);
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /report.html',
    'Disallow: /saved.html',
    'Disallow: /login.html',
    'Disallow: /signup.html',
    'Disallow: /account',
    'Disallow: /forgot-password',
    '',
    `Sitemap: ${baseUrl}/sitemap.xml`,
    ''
  ].join('\n');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(body);
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = getBaseUrl(req);
  const lastmod = '2026-11-21';

  const allEntries = [
    ...SITEMAP_PAGES,
    { path: '/cities', changefreq: 'weekly', priority: '0.92' },
    { path: '/blog', changefreq: 'weekly', priority: '0.88' },
    { path: '/pricing', changefreq: 'monthly', priority: '0.85' },
    { path: '/methodology', changefreq: 'monthly', priority: '0.82' },
    { path: '/changelog', changefreq: 'monthly', priority: '0.75' },
    ...BLOG_POSTS.map((p) => ({ path: `/blog/${p.slug}`, changefreq: 'monthly', priority: '0.80' })),
    ...CITIES.map((c) => ({ path: `/cities/${c.id}`, changefreq: 'weekly', priority: '0.88' })),
    ...CITIES.flatMap((c) =>
      BIZ_TYPES.map((b) => ({ path: `/cities/${c.id}/${b.id}`, changefreq: 'monthly', priority: '0.80' }))
    )
  ];

  const urls = allEntries.map((p) => {
    const loc = `${baseUrl}${p.path}`;
    const enUrl = `${loc}?lang=en`;
    const faUrl = `${loc}?lang=fa`;
    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enUrl)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="fa-IR" href="${escapeXml(faUrl)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(loc)}"/>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${p.changefreq}</changefreq>`,
      `    <priority>${p.priority}</priority>`,
      '  </url>'
    ].join('\n');
  }).join('\n');
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    '</urlset>',
    ''
  ].join('\n');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

// ── SSR Hub Routes: Cities (15), City×Category (150), Blog, Methodology, Changelog, Pricing, Account ──
app.get('/cities', (req, res) => {
  const html = ssrPages.renderCitiesIndex(req, getBaseUrl(req), reqLangOf(req));
  return sendRendered(res, html);
});

app.get('/cities/:city', (req, res, next) => {
  const cityId = String(req.params.city || '').toLowerCase();
  const html = ssrPages.renderCityDetail(req, getBaseUrl(req), reqLangOf(req), cityId);
  if (!html) return next();
  return sendRendered(res, html);
});

app.get('/cities/:city/:category', (req, res, next) => {
  const cityId = String(req.params.city || '').toLowerCase();
  const catId = String(req.params.category || '').toLowerCase();
  const html = ssrPages.renderCityCategory(req, getBaseUrl(req), reqLangOf(req), cityId, catId);
  if (!html) return next();
  return sendRendered(res, html);
});

app.get('/blog', (req, res) => {
  const html = ssrPages.renderBlogIndex(req, getBaseUrl(req), reqLangOf(req));
  return sendRendered(res, html);
});

app.get('/blog/:slug', (req, res, next) => {
  const slug = String(req.params.slug || '').toLowerCase();
  const html = ssrPages.renderBlogArticle(req, getBaseUrl(req), reqLangOf(req), slug);
  if (!html) return next();
  return sendRendered(res, html);
});

app.get('/methodology', (req, res) => {
  const html = ssrPages.renderMethodology(req, getBaseUrl(req), reqLangOf(req));
  return sendRendered(res, html);
});

app.get('/changelog', (req, res) => {
  const html = ssrPages.renderChangelog(req, getBaseUrl(req), reqLangOf(req));
  return sendRendered(res, html);
});

app.get('/pricing', (req, res) => {
  const html = ssrPages.renderPricing(req, getBaseUrl(req), reqLangOf(req));
  return sendRendered(res, html);
});

app.get('/account', (req, res) => {
  const html = ssrPages.renderAccount(req, getBaseUrl(req), reqLangOf(req));
  return sendRendered(res, html, { noindex: true });
});

app.get('/forgot-password', (req, res) => {
  const html = ssrPages.renderForgotPassword(req, getBaseUrl(req), reqLangOf(req));
  return sendRendered(res, html, { noindex: true });
});

// Whitelisted static root pages (matching server/urls.py)
const allowedPages = new Set(
  fs.readdirSync(__dirname).filter((name) =>
    /^[a-zA-Z0-9_-]+\.html$/.test(name) || name === 'robots.txt' || name === 'sitemap.xml'
  )
);

app.get('/', (req, res) => {
  return sendSeoHtml(req, res, 'index.html');
});

// Permanent redirect /index.html -> / to prevent homepage duplicate content
app.get('/index.html', (req, res) => {
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
  return res.redirect(301, `/${qs}`);
});

app.get(/^\/([a-zA-Z0-9_-]+\.(?:html|txt|xml))$/, (req, res, next) => {
  const name = req.params[0];
  if (!allowedPages.has(name)) {
    return next();
  }
  if (name.endsWith('.html')) {
    return sendSeoHtml(req, res, name);
  }
  return res.sendFile(path.join(__dirname, name));
});

app.use((err, req, res, next) => {
  if (err && err.status === 404) {
    return next();
  }
  console.error(err);
  return res.status(500).json({ error: 'internal_error' });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'not_found' });
  }
  const notFoundPage = path.join(__dirname, '404.html');
  if (fs.existsSync(notFoundPage)) {
    return sendSeoHtml(req, res, '404.html', 404);
  }
  return res.status(404).send('Not Found');
});

app.listen(PORT, HOST, () => {
  console.log(`Jabio server listening on http://${HOST}:${PORT}`);
});
