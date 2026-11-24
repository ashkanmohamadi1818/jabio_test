/* Jabio: site-wide behaviour.
   ─────────────────────────────────────────────────────────────────────
   YOUR DETAILS: fill these in and every contact link on the site appears.
   Anything left empty stays hidden, so visitors never reach a dead address. */
window.GA_SITE = {
  email: '',      /* e.g. 'you@example.com'; also turns on the contact form */
  linkedin: '',   /* full URL */
  github: '',     /* full URL */
  twitter: '',    /* full URL */
  youtube: '',    /* full URL */
  analytics: ''   /* address of your counter, e.g. 'https://stats.example.com/e' (see tools/stats_server.py). Empty = nothing is measured and no notice is shown */
};

(function () {
  'use strict';
  var S = window.GA_SITE;
  function all(sel) { return [].slice.call(document.querySelectorAll(sel)); }
  function isFA() { return document.documentElement.lang === 'fa'; }

  /* social + email links: shown only when a real address is set */
  all('[data-social]').forEach(function (a) {
    var key = a.getAttribute('data-social'), v = S[key];
    if (!v) { a.remove(); return; }
    a.href = key === 'email' ? 'mailto:' + v : v;
    if (key !== 'email') { a.target = '_blank'; a.rel = 'noopener'; }
    var val = a.querySelector('[data-social-value]');
    if (val) val.textContent = v.replace(/^https?:\/\/(www\.)?/, '');
    if (a.hasAttribute('data-social-self')) a.textContent = v;
  });
  all('.ds-footer-social').forEach(function (b) { if (!b.children.length) b.remove(); });

  /* contact form: opens the visitor's mail app, addressed to S.email */
  var form = document.getElementById('contactForm');
  if (form) {
    var note = document.getElementById('contactNote');
    var send = document.getElementById('contactSend');
    if (!S.email) {
      send.disabled = true;
      note.hidden = false;
    } else {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        var d = new FormData(form);
        location.href = 'mailto:' + S.email +
          '?subject=' + encodeURIComponent('Jabio: ' + d.get('name')) +
          '&body=' + encodeURIComponent(d.get('message') + '\n\n' + d.get('name') + ' <' + d.get('email') + '>');
      });
    }
  }

  /* phone menu for pages without their own burger */
  var nav = document.querySelector('.nav');
  if (nav && !nav.querySelector('.nav-burger') && nav.querySelector('.nav-center')) {
    var b = document.createElement('button');
    b.className = 'nav-burger ds-burger';
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', 'Open menu');
    b.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      b.setAttribute('aria-expanded', String(nav.classList.toggle('menu-open')));
    });
    document.addEventListener('click', function () {
      nav.classList.remove('menu-open');
      b.setAttribute('aria-expanded', 'false');
    });
    nav.querySelector('.nav-right').appendChild(b);
  }

  /* light / dark button, next to the language button on every page */
  var SUN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.300v2.200M2.500 12h2.200M19.300 12h2.200M5.300 5.300l1.550 1.550M17.150 17.150l1.550 1.550M18.700 5.300l-1.550 1.550M6.850 17.150L5.300 18.700" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  var MOON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.500 14.300A8.500 8.500 0 019.700 3.500a8.500 8.500 0 1010.800 10.800z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  var html = document.documentElement;
  function theme() { return html.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function applyTheme(next) {
    var changed = theme() !== next;
    if (next === 'light') html.setAttribute('data-theme', 'light'); else html.removeAttribute('data-theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = next === 'light' ? '#F4F5F7' : '#000000';
    if (label) label();
    if (changed) document.dispatchEvent(new CustomEvent('ga-theme', { detail: next }));
  }
  var langBtn = document.querySelector('.lang-btn');
  if (langBtn) {
    var tb = document.createElement('button');
    tb.className = 'theme-btn';
    tb.type = 'button';
    var label = function () {
      var toLight = theme() === 'dark';
      tb.innerHTML = toLight ? SUN : MOON;
      var t = isFA() ? (toLight ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره') : (toLight ? 'Switch to light mode' : 'Switch to dark mode');
      tb.setAttribute('aria-label', t);
      tb.title = t;
      tb.setAttribute('aria-pressed', String(!toLight));
    };
    label();
    tb.addEventListener('click', function () {
      var next = theme() === 'dark' ? 'light' : 'dark';
      html.classList.add('theme-anim');
      setTimeout(function () { html.classList.remove('theme-anim'); }, 320);
      applyTheme(next);
      try { localStorage.setItem('ga_theme', next); } catch (e) {}
    });
    new MutationObserver(label).observe(html, { attributes: true, attributeFilter: ['lang'] });
    /* some bars space exactly their children, so the pair travels together */
    if (langBtn.parentElement.classList.contains('nav-right')) {
      langBtn.parentElement.insertBefore(tb, langBtn);
    } else {
      var pair = document.createElement('span');
      pair.className = 'theme-pair';
      langBtn.parentElement.insertBefore(pair, langBtn);
      pair.appendChild(tb);
      pair.appendChild(langBtn);
    }
  }
  applyTheme(theme());
  window.addEventListener('storage', function (e) {
    if (e.key === 'ga_theme' || e.key === null) applyTheme(e.newValue === 'dark' ? 'dark' : 'light');
  });

  /* optional usage counts: off unless S.analytics is set. Sends only an event name, the page, language, theme and,
     for Jabio, the city and business type. Never coordinates. Respects Do Not Track and Global Privacy Control. */
  var off = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  window.GA_TRACK = function (name, props) {
    if (!S.analytics || off) return;
    var body = { e: name, page: location.pathname.split('/').pop() || 'index.html', lang: isFA() ? 'fa' : 'en', theme: theme() };
    ['city', 'type', 'mode'].forEach(function (k) { if (props && typeof props[k] === 'string') body[k] = props[k]; });
    try {
      var data = JSON.stringify(body);
      if (!(navigator.sendBeacon && navigator.sendBeacon(S.analytics, new Blob([data], { type: 'text/plain' })))) fetch(S.analytics, { method: 'POST', body: data, keepalive: true, mode: 'no-cors' }).catch(function () {});
    } catch (e) {}
  };
  if (S.analytics && !off) {
    window.GA_TRACK('view');
    var seen = false; try { seen = localStorage.getItem('ga_notice') === '1'; } catch (e) {}
    if (!seen) {
      var n = document.createElement('div');
      n.className = 'ga-notice'; n.setAttribute('role', 'note');
      n.innerHTML = '<span></span><a href="privacy.html"></a><button type="button"></button>';
      var fill = function () {
        n.children[0].textContent = isFA() ? 'برای بهتر شدن سایت، فقط شمارش ناشناس بازدید می‌کنیم؛ بدون کوکی و بدون ثبت مختصات.' : 'To improve the site we count visits anonymously: no cookies, and never your map locations.';
        n.children[1].textContent = isFA() ? 'جزئیات' : 'Details'; n.children[2].textContent = isFA() ? 'متوجه شدم' : 'Got it';
      };
      fill(); document.addEventListener('ga-lang', fill);
      n.children[2].addEventListener('click', function () { try { localStorage.setItem('ga_notice', '1'); } catch (e) {} n.remove(); });
      document.body.appendChild(n);
    }
  }

  /* sync top-bar Sign in button to Account Settings when signed in */
  function syncNavAccount() {
    var link = document.querySelector('[data-nav-account], .nav-right a.btn-ghost[href="login.html"], .nav-right a.btn-ghost[href="/login.html"]');
    if (!link || !window.JabioAccount) return;
    var st = window.JabioAccount.state();
    if (st && st.authenticated) {
      link.href = '/account';
      link.setAttribute('data-en', 'Account');
      link.setAttribute('data-fa', 'حساب کاربری');
      link.textContent = isFA() ? 'حساب کاربری' : 'Account';
    }
  }
  if (window.JabioAccount) {
    window.JabioAccount.ready.then(syncNavAccount);
    document.addEventListener('jabio-account', syncNavAccount);
  }

  /* ── Site-wide soft-rounded dropdowns for every <select> ─────────────── */
  (function initRoundedSelects() {
    var ddSeq = 0;
    var active = null;
    var registry = [];
    var valueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    var idxDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
    var CHEV = '<svg class="jb-dd-chev" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5.5 7.75 10 12.25l4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var CHECK = '<svg class="jb-dd-check" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 10.5 8.2 14.2 15.5 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function escH(s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function closeActive(returnFocus) {
      if (!active) return;
      var cur = active;
      active = null;
      cur.menu.hidden = true;
      cur.trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus && cur.trigger && cur.trigger.offsetParent !== null) cur.trigger.focus();
    }
    function position(inst) {
      var rect = inst.trigger.getBoundingClientRect();
      if (!rect.width && !rect.height) { closeActive(false); return; }
      var gap = 8;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var vw = window.innerWidth || document.documentElement.clientWidth;
      var spaceBelow = vh - rect.bottom - gap - 12;
      var spaceAbove = rect.top - gap - 12;
      var openUp = spaceBelow < 190 && spaceAbove > spaceBelow;
      var maxH = Math.max(110, Math.min(264, openUp ? spaceAbove : spaceBelow));
      var w = Math.min(rect.width, vw - 16);
      var left = Math.max(8, Math.min(rect.left, vw - w - 8));
      inst.menu.classList.toggle('is-up', openUp);
      inst.menu.style.width = w + 'px';
      inst.menu.style.left = left + 'px';
      inst.menu.style.maxHeight = maxH + 'px';
      if (openUp) {
        inst.menu.style.top = 'auto';
        inst.menu.style.bottom = (vh - rect.top + gap) + 'px';
      } else {
        inst.menu.style.bottom = 'auto';
        inst.menu.style.top = (rect.bottom + gap) + 'px';
      }
    }
    function openInst(inst) {
      if (inst.sel.disabled) return;
      if (active && active !== inst) closeActive(false);
      inst.sync(true);
      active = inst;
      inst.menu.hidden = false;
      inst.trigger.setAttribute('aria-expanded', 'true');
      position(inst);
      var selected = inst.menu.querySelector('.jb-dd-opt[aria-selected="true"]');
      if (selected && selected.scrollIntoView) selected.scrollIntoView({ block: 'nearest' });
    }
    function enhance(sel) {
      if (!sel || sel._jbDd || sel.multiple || sel.size > 1 || sel.hasAttribute('data-native-select')) return;
      if (!sel.parentNode) return;
      sel._jbDd = true;
      var uid = 'jbDdMenu' + (++ddSeq);
      sel.classList.add('jb-dd-native');
      sel.setAttribute('tabindex', '-1');
      sel.setAttribute('aria-hidden', 'true');

      var dd = document.createElement('div');
      dd.className = 'jb-dd';
      dd.innerHTML =
        '<button type="button" class="jb-dd-trigger" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + uid + '">' +
          '<span class="jb-dd-label"></span>' + CHEV +
        '</button>';
      sel.insertAdjacentElement('afterend', dd);

      var trigger = dd.querySelector('.jb-dd-trigger');
      var labelEl = dd.querySelector('.jb-dd-label');
      var menu = document.createElement('div');
      menu.className = 'jb-dd-menu';
      menu.id = uid;
      menu.setAttribute('role', 'listbox');
      menu.hidden = true;
      document.body.appendChild(menu);

      var lastSig = '';
      var inst = { sel: sel, dd: dd, trigger: trigger, menu: menu, sync: sync };

      function buildOptionsHtml() {
        var idx = sel.selectedIndex;
        var out = [];
        function renderOpt(opt, optIndex) {
          var isSel = optIndex === idx;
          out.push(
            '<button type="button" class="jb-dd-opt" role="option" data-idx="' + optIndex + '" aria-selected="' + (isSel ? 'true' : 'false') + '"' + (opt.disabled ? ' disabled' : '') + '>' +
              '<span>' + escH(opt.textContent) + '</span>' + CHECK +
            '</button>'
          );
        }
        var flatIdx = 0;
        [].forEach.call(sel.children, function (child) {
          if (child.tagName === 'OPTGROUP') {
            if (child.label) out.push('<div class="jb-dd-group">' + escH(child.label) + '</div>');
            [].forEach.call(child.children, function (o) {
              if (o.tagName === 'OPTION') renderOpt(o, flatIdx++);
            });
          } else if (child.tagName === 'OPTION') {
            renderOpt(child, flatIdx++);
          }
        });
        return out.join('');
      }
      function sync(force) {
        trigger.disabled = !!sel.disabled;
        var opts = sel.options;
        var cur = opts && sel.selectedIndex >= 0 ? opts[sel.selectedIndex] : (opts && opts[0]);
        var txt = cur ? cur.textContent : '';
        var sig = (sel.disabled ? '1' : '0') + '|' + sel.selectedIndex + '|' + [].map.call(opts || [], function (o) {
          return (o.disabled ? '1' : '0') + ':' + o.value + ':' + o.textContent;
        }).join('\u001f');
        if (!force && sig === lastSig) return;
        lastSig = sig;
        labelEl.textContent = txt;
        menu.innerHTML = buildOptionsHtml();
      }
      function chooseByIndex(optIndex) {
        if (optIndex < 0 || optIndex >= sel.options.length) return;
        var opt = sel.options[optIndex];
        if (!opt || opt.disabled) return;
        var changed = sel.selectedIndex !== optIndex;
        if (idxDesc && idxDesc.set) idxDesc.set.call(sel, optIndex);
        else sel.selectedIndex = optIndex;
        sync(true);
        closeActive(true);
        if (changed) {
          sel.dispatchEvent(new Event('input', { bubbles: true }));
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      if (valueDesc && valueDesc.get && valueDesc.set) {
        try {
          Object.defineProperty(sel, 'value', {
            configurable: true,
            get: function () { return valueDesc.get.call(this); },
            set: function (v) { valueDesc.set.call(this, v); sync(false); }
          });
        } catch (e) {}
      }
      if (idxDesc && idxDesc.get && idxDesc.set) {
        try {
          Object.defineProperty(sel, 'selectedIndex', {
            configurable: true,
            get: function () { return idxDesc.get.call(this); },
            set: function (v) { idxDesc.set.call(this, v); sync(false); }
          });
        } catch (e) {}
      }
      try {
        sel.focus = function (opts) { trigger.focus(opts); };
      } catch (e) {}

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (active === inst) closeActive(false);
        else openInst(inst);
      });
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
          if (active !== inst) {
            e.preventDefault();
            openInst(inst);
            var target = menu.querySelector('.jb-dd-opt[aria-selected="true"]:not(:disabled)') || menu.querySelector('.jb-dd-opt:not(:disabled)');
            if (target) target.focus();
          }
        } else if (e.key === 'Escape' && active === inst) {
          e.preventDefault();
          closeActive(false);
        }
      });
      menu.addEventListener('click', function (e) {
        var btn = e.target.closest('.jb-dd-opt');
        if (!btn || btn.disabled) return;
        e.stopPropagation();
        chooseByIndex(parseInt(btn.getAttribute('data-idx'), 10));
      });
      menu.addEventListener('keydown', function (e) {
        var items = [].slice.call(menu.querySelectorAll('.jb-dd-opt:not(:disabled)'));
        if (!items.length) return;
        var curIdx = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          items[(curIdx + 1 + items.length) % items.length].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          items[(curIdx - 1 + items.length) % items.length].focus();
        } else if (e.key === 'Home') {
          e.preventDefault();
          items[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeActive(true);
        } else if (e.key === 'Tab') {
          closeActive(false);
        }
      });

      var wrapLabel = sel.closest('label');
      if (wrapLabel) {
        wrapLabel.addEventListener('click', function (e) {
          if (dd.contains(e.target)) return;
          e.preventDefault();
          trigger.focus();
          if (active === inst) closeActive(false);
          else openInst(inst);
        });
      }
      if (sel.id) {
        all('label[for="' + sel.id + '"]').forEach(function (lbl) {
          if (lbl === wrapLabel) return;
          lbl.addEventListener('click', function (e) {
            e.preventDefault();
            trigger.focus();
            if (active === inst) closeActive(false);
            else openInst(inst);
          });
        });
      }
      if (sel.form) {
        sel.form.addEventListener('reset', function () { setTimeout(function () { sync(true); }, 0); });
      }
      sel.addEventListener('change', function () { sync(false); });
      sel.addEventListener('input', function () { sync(false); });
      new MutationObserver(function () { sync(false); }).observe(sel, {
        childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled', 'selected', 'label']
      });

      registry.push(inst);
      sync(true);
    }

    function enhanceAll(root) {
      var scope = root && root.querySelectorAll ? root : document;
      [].forEach.call(scope.querySelectorAll('select'), enhance);
    }
    function syncAll() {
      registry.forEach(function (inst) { inst.sync(true); });
    }

    document.addEventListener('click', function (e) {
      if (!active) return;
      if (!active.dd.contains(e.target) && !active.menu.contains(e.target)) closeActive(false);
    });
    document.addEventListener('toggle', function () {
      if (active && active.trigger.offsetParent === null) closeActive(false);
    }, true);
    window.addEventListener('scroll', function (e) {
      if (!active) return;
      if (active.menu.contains(e.target)) return;
      if (active.trigger.offsetParent === null) { closeActive(false); return; }
      var r = active.trigger.getBoundingClientRect();
      if (r.bottom < 0 || r.top > (window.innerHeight || 0)) closeActive(false);
      else position(active);
    }, true);
    window.addEventListener('resize', function () {
      if (active) position(active);
    });
    document.addEventListener('ga-lang', function () {
      setTimeout(syncAll, 0);
    });

    function boot() {
      enhanceAll(document);
      if (document.body) {
        new MutationObserver(function (mutations) {
          mutations.forEach(function (m) {
            [].forEach.call(m.addedNodes, function (node) {
              if (!node || node.nodeType !== 1) return;
              if (node.tagName === 'SELECT') enhance(node);
              else if (node.querySelectorAll) enhanceAll(node);
            });
          });
        }).observe(document.body, { childList: true, subtree: true });
      }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
    window.JABIO_DD = { enhance: enhanceAll, sync: syncAll };
  })();

  window.GA_isFA = isFA;
})();

