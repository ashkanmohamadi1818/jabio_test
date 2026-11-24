/* Unified Jabio Account Layer: merges Firebase Google Auth + Cloud Firestore with Express persistent Email/Phone Auth.
   Provides a single event-driven API (window.JabioAccount) across login, profile, saved analyses, map, and printable reports. */
(function () {
  'use strict';

  var PROFILE_CACHE_KEY = 'jabio_profile_branding_v1';
  var state = {
    loading: true,
    authenticated: false,
    unavailable: false,
    uid: null,
    email: null,
    emailVerified: false,
    phone: '',
    phoneDisplay: '',
    phoneVerified: false,
    photoURL: '',
    authProvider: null, // 'google' | 'password'
    profile: null,
    smtpConfigured: false,
    smsConfigured: false,
    csrf: ''
  };
  var items = [];
  var firebaseLoadPromise = null;

  function cacheBranding() {
    try {
      if (state.authenticated && state.profile) {
        sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({
          displayName: state.profile.displayName || '',
          email: state.email || '',
          accountType: state.profile.accountType || 'personal',
          organizationName: state.profile.organizationName || '',
          roleTitle: state.profile.roleTitle || '',
          industry: state.profile.industry || ''
        }));
      } else {
        sessionStorage.removeItem(PROFILE_CACHE_KEY);
      }
    } catch (e) {}
  }

  function emit() {
    cacheBranding();
    document.dispatchEvent(new CustomEvent('jabio-account', { detail: { state: state, items: items } }));
  }

  function loadFirebaseBundle() {
    if (window.JabioFirebase) return Promise.resolve(window.JabioFirebase);
    if (firebaseLoadPromise) return firebaseLoadPromise;
    firebaseLoadPromise = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = '/assets/firebase-client.bundle.js?v=fb-2';
      s.async = true;
      s.onload = function () { resolve(window.JabioFirebase || null); };
      s.onerror = function () { resolve(null); };
      document.head.appendChild(s);
    });
    return firebaseLoadPromise;
  }

  async function req(url, opts) {
    opts = opts || {};
    var headers = {};
    if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
    if (opts.method && opts.method !== 'GET' && state.csrf) headers['X-CSRFToken'] = state.csrf;
    var r = await fetch(url, {
      method: opts.method || 'GET',
      credentials: 'same-origin',
      headers: headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
    });
    var data = {};
    try { data = await r.json(); } catch (e) {}
    if (data && data.csrf) state.csrf = data.csrf;
    if (!r.ok) {
      var err = new Error(data.error || ('http_' + r.status));
      err.status = r.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function applyServerUser(d) {
    state.authenticated = Boolean(d && d.authenticated);
    state.uid = d.uid || null;
    state.email = d.email || null;
    state.emailVerified = Boolean(d.emailVerified);
    state.phone = d.phone || '';
    state.phoneDisplay = d.phoneDisplay || '';
    state.phoneVerified = Boolean(d.phoneVerified);
    state.photoURL = d.photoURL || '';
    state.authProvider = state.authenticated ? (d.authProvider || 'password') : null;
    state.profile = d.profile || null;
    if (typeof d.smtpConfigured === 'boolean') state.smtpConfigured = d.smtpConfigured;
    if (typeof d.smsConfigured === 'boolean') state.smsConfigured = d.smsConfigured;
  }

  function applyGoogleState(gState, gItems) {
    state.authenticated = true;
    state.unavailable = false;
    state.uid = gState.uid;
    state.email = gState.email;
    state.emailVerified = Boolean(gState.emailVerified);
    state.phone = gState.phone || '';
    state.phoneDisplay = gState.phoneDisplay || '';
    state.phoneVerified = Boolean(gState.phoneVerified);
    state.photoURL = gState.photoURL || '';
    state.authProvider = 'google';
    state.profile = gState.profile;
    if (Array.isArray(gItems)) items = gItems;
  }

  function clearUser() {
    state.authenticated = false;
    state.uid = null;
    state.email = null;
    state.emailVerified = false;
    state.phone = '';
    state.phoneDisplay = '';
    state.phoneVerified = false;
    state.photoURL = '';
    state.authProvider = null;
    state.profile = null;
    items = [];
  }

  async function loadServerAnalyses() {
    if (!state.authenticated || state.authProvider !== 'password') {
      return items;
    }
    var d = await req('/api/analyses');
    items = (d.items || []).map(function (x) {
      return Object.assign({}, x.data || {}, { accountId: x.id, id: x.id });
    });
    return items;
  }

  async function refresh() {
    state.loading = true;
    var serverChecked = false;
    try {
      var d = await req('/api/session');
      state.unavailable = false;
      state.smtpConfigured = Boolean(d.smtpConfigured);
      state.smsConfigured = Boolean(d.smsConfigured);
      if (d.authenticated) {
        applyServerUser(d);
        await loadServerAnalyses();
        serverChecked = true;
      }
    } catch (e) {
      state.unavailable = true;
    }

    if (!serverChecked) {
      try {
        var fb = await loadFirebaseBundle();
        if (fb) {
          var fbUser = await fb.waitForInitialAuth();
          if (fbUser) {
            var gState = await fb.ensureUserProfile(fbUser);
            var gItems = await fb.listAnalyses();
            applyGoogleState(gState, gItems);
          } else {
            clearUser();
          }
        } else {
          clearUser();
        }
      } catch (e) {
        clearUser();
      }
    }

    state.loading = false;
    emit();
    return state;
  }

  var ready = refresh();

  async function auth(mode, identifierOrEmail, password, extra) {
    await ready;
    // Sign out of Firebase if switching to email/phone login
    if (window.JabioFirebase && window.JabioFirebase.getCurrentUser()) {
      try { await window.JabioFirebase.signOut(); } catch (e) {}
    }
    var body = Object.assign({}, extra || {}, { password: password });
    if (mode === 'register') {
      body.email = identifierOrEmail;
    } else {
      body.identifier = identifierOrEmail;
      body.email = identifierOrEmail;
    }
    var d = await req(mode === 'register' ? '/api/register' : '/api/login', { method: 'POST', body: body });
    applyServerUser(d);
    await loadServerAnalyses();
    emit();
    return d;
  }

  async function signInWithGoogle(initialOverrides) {
    await ready;
    var fb = await loadFirebaseBundle();
    if (!fb) {
      throw new Error('firebase_unavailable');
    }
    // Clear Express password session if any
    if (state.authProvider === 'password') {
      try { await req('/api/logout', { method: 'POST' }); } catch (e) {}
    }
    var res = await fb.signInWithGoogle(initialOverrides || {});
    applyGoogleState(res.state, res.items);
    emit();
    return state;
  }

  async function logout() {
    await ready;
    if (state.authProvider === 'google' && window.JabioFirebase) {
      try { await window.JabioFirebase.signOut(); } catch (e) {}
    }
    try { await req('/api/logout', { method: 'POST' }); } catch (e) {}
    clearUser();
    emit();
  }

  async function requestVerification(channel, phone) {
    await ready;
    var body = { channel: channel === 'phone' ? 'phone' : 'email' };
    if (phone) body.phone = phone;
    return req('/api/verification/request', { method: 'POST', body: body });
  }

  async function confirmVerification(channel, code) {
    await ready;
    var d = await req('/api/verification/confirm', {
      method: 'POST',
      body: { channel: channel === 'phone' ? 'phone' : 'email', code: code }
    });
    applyServerUser(d);
    emit();
    return d;
  }

  async function updateProfile(payload) {
    await ready;
    if (state.authProvider === 'google' && window.JabioFirebase) {
      var updatedState = await window.JabioFirebase.updateUserProfile(payload);
      applyGoogleState(updatedState, items);
      emit();
      return state;
    }
    var d = await req('/api/account/profile', { method: 'PATCH', body: payload });
    applyServerUser(d);
    emit();
    return d;
  }

  async function changePassword(currentPassword, newPassword) {
    await ready;
    return req('/api/account/password', {
      method: 'POST',
      body: { currentPassword: currentPassword, newPassword: newPassword }
    });
  }

  async function deleteAccount(password) {
    await ready;
    if (state.authProvider === 'google' && window.JabioFirebase) {
      await window.JabioFirebase.deleteGoogleAccount();
      clearUser();
      emit();
      return { deleted: true };
    }
    var d = await req('/api/account', { method: 'DELETE', body: { password: password } });
    clearUser();
    emit();
    return d;
  }

  async function requestPasswordReset(identifier, channel) {
    await ready;
    return req('/api/password-reset/request', {
      method: 'POST',
      body: {
        identifier: identifier,
        email: channel === 'email' ? identifier : undefined,
        phone: channel === 'phone' ? identifier : undefined,
        channel: channel || (String(identifier || '').indexOf('@') >= 0 ? 'email' : 'phone')
      }
    });
  }

  async function confirmPasswordReset(identifier, code, newPassword, channel) {
    await ready;
    return req('/api/password-reset/confirm', {
      method: 'POST',
      body: {
        identifier: identifier,
        email: channel === 'email' ? identifier : undefined,
        phone: channel === 'phone' ? identifier : undefined,
        channel: channel || (String(identifier || '').indexOf('@') >= 0 ? 'email' : 'phone'),
        code: code,
        newPassword: newPassword
      }
    });
  }

  async function add(entry) {
    await ready;
    if (state.authProvider === 'google' && window.JabioFirebase) {
      var created = await window.JabioFirebase.addAnalysis(entry);
      items.unshift(created);
      emit();
      return created;
    }
    var d = await req('/api/analyses', { method: 'POST', body: { data: entry } });
    var row = Object.assign({}, d.data || entry, { accountId: d.id, id: d.id });
    items.unshift(row);
    emit();
    return row;
  }

  async function rename(id, name) {
    return updateAnalysis(id, { name: name });
  }

  async function updateAnalysis(id, updates) {
    await ready;
    if (state.authProvider === 'google' && window.JabioFirebase) {
      await window.JabioFirebase.updateAnalysis(id, updates);
      items.forEach(function (x) {
        if (x.accountId === id) {
          if (updates.name) x.name = updates.name;
          if (typeof updates.notes === 'string') x.notes = updates.notes;
          x.updatedAt = new Date().toISOString();
        }
      });
      emit();
      return;
    }
    var d = await req('/api/analyses/' + encodeURIComponent(id), { method: 'PATCH', body: updates });
    items.forEach(function (x) {
      if (x.accountId === id) Object.assign(x, d.data || updates);
    });
    emit();
  }

  async function remove(id) {
    await ready;
    if (state.authProvider === 'google' && window.JabioFirebase) {
      await window.JabioFirebase.deleteAnalysis(id);
      items = items.filter(function (x) { return x.accountId !== id; });
      emit();
      return;
    }
    await req('/api/analyses/' + encodeURIComponent(id), { method: 'DELETE' });
    items = items.filter(function (x) { return x.accountId !== id; });
    emit();
  }

  async function submitPricingInquiry(payload) {
    await ready;
    return req('/api/pricing/inquiry', { method: 'POST', body: payload });
  }

  function getCachedBranding() {
    if (state.authenticated && state.profile) {
      return {
        displayName: state.profile.displayName || '',
        email: state.email || '',
        accountType: state.profile.accountType || 'personal',
        organizationName: state.profile.organizationName || '',
        roleTitle: state.profile.roleTitle || '',
        industry: state.profile.industry || ''
      };
    }
    try {
      return JSON.parse(sessionStorage.getItem(PROFILE_CACHE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  window.JabioAccount = {
    ready: ready,
    refresh: refresh,
    state: function () { return state; },
    items: function () { return items.slice(); },
    auth: auth,
    signInWithGoogle: signInWithGoogle,
    logout: logout,
    requestVerification: requestVerification,
    confirmVerification: confirmVerification,
    updateProfile: updateProfile,
    changePassword: changePassword,
    deleteAccount: deleteAccount,
    requestPasswordReset: requestPasswordReset,
    confirmPasswordReset: confirmPasswordReset,
    add: add,
    rename: rename,
    updateAnalysis: updateAnalysis,
    remove: remove,
    submitPricingInquiry: submitPricingInquiry,
    getCachedBranding: getCachedBranding
  };
})();
