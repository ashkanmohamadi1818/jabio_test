import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  reauthenticateWithPopup,
  signOut as fbSignOut,
  deleteUser,
  onAuthStateChanged
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
let db;
try {
  db = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  db = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write'
};

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    }
  }
}
testConnection();

const VALID_CITIES = new Set([
  'tehran', 'mashhad', 'isfahan', 'shiraz', 'tabriz', 'karaj', 'ahvaz',
  'qom', 'kermanshah', 'rasht', 'urmia', 'yazd', 'kerman', 'bandarabbas', 'ardabil'
]);

function randomId(prefix) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return prefix + '_' + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function parseQueryMeta(q) {
  try {
    const sp = new URLSearchParams(String(q || ''));
    const c = sp.get('c') || sp.get('city') || 'tehran';
    const t = sp.get('t') || sp.get('type') || 'cafe';
    return {
      city: VALID_CITIES.has(c) ? c : 'tehran',
      type: String(t).slice(0, 40) || 'cafe'
    };
  } catch {
    return { city: 'tehran', type: 'cafe' };
  }
}

function tsToIso(val) {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  return new Date().toISOString();
}

function formatPhoneDisplay(e164) {
  if (!e164) return '';
  if (e164.startsWith('+989') && e164.length === 13) {
    const local = '0' + e164.slice(3);
    return local.slice(0, 4) + ' ' + local.slice(4, 7) + ' ' + local.slice(7);
  }
  return e164;
}

function normalizePhone(raw) {
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  const cleaned = String(raw || '')
    .replace(/[۰-۹]/g, (d) => String(persian.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(arabic.indexOf(d)))
    .replace(/[\s\-().]/g, '');
  if (!cleaned) return '';
  if (/^09\d{9}$/.test(cleaned)) return '+98' + cleaned.slice(1);
  if (/^9\d{9}$/.test(cleaned)) return '+98' + cleaned;
  if (/^00989\d{9}$/.test(cleaned)) return '+98' + cleaned.slice(4);
  if (/^989\d{9}$/.test(cleaned)) return '+' + cleaned;
  if (/^\+989\d{9}$/.test(cleaned)) return cleaned;
  if (/^\+[1-9]\d{8,14}$/.test(cleaned)) return cleaned;
  return '';
}

function mapDocToState(user, data) {
  const preferredLang = data.preferredLang === 'en' ? 'en' : 'fa';
  const preferredCity = VALID_CITIES.has(data.preferredCity) ? data.preferredCity : 'tehran';
  const accountType = data.accountType === 'organization' ? 'organization' : 'personal';
  return {
    authenticated: true,
    uid: user.uid,
    email: user.email || data.email || '',
    emailVerified: Boolean(user.emailVerified),
    phone: data.phone || '',
    phoneDisplay: formatPhoneDisplay(data.phone || ''),
    phoneVerified: Boolean(data.phoneVerified),
    photoURL: data.photoURL || user.photoURL || '',
    authProvider: 'google',
    createdAt: tsToIso(data.createdAt),
    profile: {
      displayName: data.displayName || user.displayName || (user.email ? user.email.split('@')[0] : 'Jabio'),
      accountType,
      preferredCity,
      preferredCategory: data.preferredCategory || '',
      preferredLang,
      organizationName: data.organizationName || '',
      roleTitle: data.roleTitle || '',
      industry: data.industry || '',
      branchCount: data.branchCount || ''
    }
  };
}

async function ensureUserProfile(user, initialOverrides = {}) {
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);
  let snap;
  try {
    snap = await getDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  if (snap && snap.exists()) {
    return mapDocToState(user, snap.data());
  }

  const lang = (() => {
    try {
      return localStorage.getItem('ga_lang') === 'en' ? 'en' : 'fa';
    } catch {
      return 'fa';
    }
  })();

  const newDoc = {
    uid: user.uid,
    email: user.email || '',
    emailVerified: Boolean(user.emailVerified),
    phone: '',
    phoneVerified: false,
    displayName: String(initialOverrides.displayName || user.displayName || (user.email ? user.email.split('@')[0] : 'Jabio')).slice(0, 80),
    photoURL: String(user.photoURL || '').slice(0, 500),
    authProvider: 'google',
    accountType: initialOverrides.accountType === 'organization' ? 'organization' : 'personal',
    preferredCity: VALID_CITIES.has(initialOverrides.preferredCity) ? initialOverrides.preferredCity : 'tehran',
    preferredCategory: String(initialOverrides.preferredCategory || '').slice(0, 40),
    preferredLang: lang,
    organizationName: String(initialOverrides.organizationName || '').slice(0, 100),
    roleTitle: String(initialOverrides.roleTitle || '').slice(0, 80),
    industry: String(initialOverrides.industry || '').slice(0, 80),
    branchCount: String(initialOverrides.branchCount || '').slice(0, 32),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(ref, newDoc);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
  return mapDocToState(user, { ...newDoc, createdAt: new Date().toISOString() });
}

async function updateUserProfile(updates) {
  const user = auth.currentUser;
  if (!user) throw new Error('authentication_required');
  const path = `users/${user.uid}`;
  const ref = doc(db, 'users', user.uid);

  const patch = { updatedAt: serverTimestamp() };
  if (typeof updates.displayName === 'string') patch.displayName = updates.displayName.trim().slice(0, 80);
  if (updates.accountType === 'organization' || updates.accountType === 'personal') patch.accountType = updates.accountType;
  if (typeof updates.preferredCity === 'string' && VALID_CITIES.has(updates.preferredCity)) patch.preferredCity = updates.preferredCity;
  if (typeof updates.preferredCategory === 'string') patch.preferredCategory = updates.preferredCategory.slice(0, 40);
  if (updates.preferredLang === 'fa' || updates.preferredLang === 'en') patch.preferredLang = updates.preferredLang;
  if (typeof updates.organizationName === 'string') patch.organizationName = updates.organizationName.trim().slice(0, 100);
  if (typeof updates.roleTitle === 'string') patch.roleTitle = updates.roleTitle.trim().slice(0, 80);
  if (typeof updates.industry === 'string') patch.industry = updates.industry.trim().slice(0, 80);
  if (typeof updates.branchCount === 'string') patch.branchCount = updates.branchCount.trim().slice(0, 32);
  if (typeof updates.phone === 'string') {
    const raw = updates.phone.trim();
    if (!raw) {
      patch.phone = '';
      patch.phoneVerified = false;
    } else {
      const norm = normalizePhone(raw);
      if (!norm) throw new Error('invalid_phone');
      patch.phone = norm;
      patch.phoneVerified = false;
    }
  }

  try {
    await updateDoc(ref, patch);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }

  let fresh;
  try {
    fresh = await getDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
  return mapDocToState(user, (fresh && fresh.data()) || {});
}

async function listAnalyses() {
  const user = auth.currentUser;
  if (!user) return [];
  const path = `users/${user.uid}/analyses`;
  try {
    const qRef = query(collection(db, 'users', user.uid, 'analyses'), where('ownerId', '==', user.uid));
    const snap = await getDocs(qRef);
    const rows = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      rows.push({
        accountId: docSnap.id,
        id: docSnap.id,
        name: d.name || 'Saved spot',
        q: d.q || '',
        city: d.city || 'tehran',
        type: d.type || 'cafe',
        score: typeof d.score === 'number' ? d.score : null,
        method: d.method || 'jabio-v1',
        notes: d.notes || '',
        createdAt: tsToIso(d.createdAt),
        updatedAt: tsToIso(d.updatedAt)
      });
    });
    rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return rows;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

async function addAnalysis(entry) {
  const user = auth.currentUser;
  if (!user) throw new Error('authentication_required');
  const id = randomId('anl');
  const path = `users/${user.uid}/analyses/${id}`;
  const meta = parseQueryMeta(entry.q);
  const city = entry.city && VALID_CITIES.has(entry.city) ? entry.city : meta.city;
  const type = String(entry.type || meta.type).slice(0, 40) || 'cafe';
  const rawQ = String(entry.q || '').trim().slice(0, 600);
  const safeQ = rawQ.length >= 5 ? rawQ : `c=${city}&t=${type}`;
  const payload = {
    id,
    ownerId: user.uid,
    name: String(entry.name || 'Saved spot').trim().slice(0, 80) || 'Saved spot',
    q: safeQ,
    city,
    type,
    score: typeof entry.score === 'number' && Number.isFinite(entry.score) ? Math.max(0, Math.min(100, Math.round(entry.score))) : null,
    method: String(entry.method || 'jabio-v1').slice(0, 64),
    notes: typeof entry.notes === 'string' ? entry.notes.trim().slice(0, 500) : '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(doc(db, 'users', user.uid, 'analyses', id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
  const now = new Date().toISOString();
  return { ...payload, accountId: id, createdAt: now, updatedAt: now };
}

async function updateAnalysis(id, updates) {
  const user = auth.currentUser;
  if (!user) throw new Error('authentication_required');
  const path = `users/${user.uid}/analyses/${id}`;
  const patch = { updatedAt: serverTimestamp() };
  if (typeof updates.name === 'string' && updates.name.trim()) {
    patch.name = updates.name.trim().slice(0, 80);
  }
  if (typeof updates.notes === 'string') {
    patch.notes = updates.notes.trim().slice(0, 500);
  }
  try {
    await updateDoc(doc(db, 'users', user.uid, 'analyses', id), patch);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
  return true;
}

async function deleteAnalysis(id) {
  const user = auth.currentUser;
  if (!user) throw new Error('authentication_required');
  const path = `users/${user.uid}/analyses/${id}`;
  try {
    await deleteDoc(doc(db, 'users', user.uid, 'analyses', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
  return true;
}

async function signInWithGoogle(initialOverrides = {}) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  const profileState = await ensureUserProfile(cred.user, initialOverrides);
  const items = await listAnalyses();
  return { state: profileState, items };
}

async function deleteGoogleAccount() {
  const user = auth.currentUser;
  if (!user) throw new Error('authentication_required');

  // Delete all user analyses first
  const items = await listAnalyses();
  for (const item of items) {
    await deleteAnalysis(item.accountId);
  }
  // Delete user profile document
  try {
    await deleteDoc(doc(db, 'users', user.uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}`);
  }
  // Delete Firebase Auth user (re-authenticate via popup if needed)
  try {
    await deleteUser(user);
  } catch (err) {
    if (err && err.code === 'auth/requires-recent-login') {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      await deleteUser(user);
    } else {
      throw err;
    }
  }
  return true;
}

async function signOut() {
  await fbSignOut(auth);
}

function getCurrentUser() {
  return auth.currentUser;
}

function waitForInitialAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

window.JabioFirebase = {
  signInWithGoogle,
  signOut,
  getCurrentUser,
  waitForInitialAuth,
  onAuthChange,
  ensureUserProfile,
  updateUserProfile,
  listAnalyses,
  addAnalysis,
  updateAnalysis,
  deleteAnalysis,
  deleteGoogleAccount
};
