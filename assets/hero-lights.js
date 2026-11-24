/* Jabio Hero Full-Width Motion Canvas:
   Architectural oblique urban street grid, 2.5D city blocks, flowing foot-traffic
   & transit light streams, expanding 1 km catchment radar rings, and interactive
   cursor telemetry across the entire header background in both Dark & Light modes. */
(function () {
  'use strict';
  var cv = document.getElementById('heroCanvas');
  if (!cv) return;
  var hero = cv.parentElement;
  var ctx = cv.getContext('2d');
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, DPR = 1, raf = 0, vis = true;
  var mouse = { x: 0.7, y: 0.48, tx: 0.7, ty: 0.48, active: false };
  var ripples = [];
  var blocks = [];
  var roadsH = [];
  var roadsV = [];
  var streams = [];
  var hotspots = [];
  var demandNodes = [];

  function isRtl() { return document.documentElement.dir === 'rtl' || document.documentElement.lang === 'fa'; }
  function isLight() { return document.documentElement.getAttribute('data-theme') === 'light'; }

  function mulberry32(a) {
    return function () {
      var t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildScene() {
    var rnd = mulberry32(1403);
    blocks = [];
    roadsH = [0.14, 0.28, 0.43, 0.59, 0.74, 0.88];
    roadsV = [0.08, 0.19, 0.31, 0.44, 0.57, 0.69, 0.81, 0.92];

    // City blocks inside grid cells with varied architectural footprints and heights
    for (var r = 0; r < roadsH.length - 1; r++) {
      for (var c = 0; c < roadsV.length - 1; c++) {
        var x0 = roadsV[c] + 0.011;
        var y0 = roadsH[r] + 0.014;
        var cw = roadsV[c + 1] - roadsV[c] - 0.022;
        var ch = roadsH[r + 1] - roadsH[r] - 0.028;
        if (cw <= 0.01 || ch <= 0.01) continue;

        var splitX = rnd() > 0.35 ? 2 : 1;
        var splitY = rnd() > 0.52 ? 2 : 1;
        for (var sy = 0; sy < splitY; sy++) {
          for (var sx = 0; sx < splitX; sx++) {
            if (rnd() < 0.08) continue;
            var px = x0 + (sx * cw) / splitX + (splitX > 1 ? 0.004 : 0);
            var py = y0 + (sy * ch) / splitY + (splitY > 1 ? 0.005 : 0);
            var pw = (cw / splitX - (splitX > 1 ? 0.008 : 0)) * (0.82 + rnd() * 0.18);
            var ph = (ch / splitY - (splitY > 1 ? 0.01 : 0)) * (0.80 + rnd() * 0.20);
            var height = 5 + Math.pow(rnd(), 1.5) * 18;
            var accent = rnd() > 0.78 ? 1 : 0;
            blocks.push({
              x: px, y: py, w: pw, h: ph,
              cx: px + pw * 0.5, cy: py + ph * 0.5,
              extrude: height,
              accent: accent,
              phase: rnd() * Math.PI * 2
            });
          }
        }
      }
    }

    // Smooth light/traffic streams moving continuously along avenues
    streams = [];
    var i;
    for (i = 0; i < 24; i++) {
      var horiz = i % 2 === 0;
      var track = horiz
        ? roadsH[Math.floor(rnd() * roadsH.length)]
        : roadsV[Math.floor(rnd() * roadsV.length)];
      streams.push({
        horiz: horiz,
        track: track,
        pos: rnd(),
        speed: (0.045 + rnd() * 0.075) * (rnd() > 0.5 ? 1 : -1),
        len: 0.06 + rnd() * 0.09,
        tone: i % 3
      });
    }

    // Subtle secondary customer demand nodes scattered across the urban grid
    demandNodes = [];
    for (i = 0; i < 26; i++) {
      demandNodes.push({
        x: 0.1 + rnd() * 0.84,
        y: 0.14 + rnd() * 0.72,
        phase: rnd() * Math.PI * 2,
        tone: i % 3
      });
    }

    // Three catchment hotspot centers (computed relative to LTR or RTL reading side)
    hotspots = [
      { rx: 0.69, ry: 0.44, radius: 0.21, tone: 0, main: true, phase: 0 },
      { rx: 0.85, ry: 0.68, radius: 0.13, tone: 1, main: false, phase: 2.1 },
      { rx: 0.52, ry: 0.26, radius: 0.12, tone: 2, main: false, phase: 4.2 }
    ];
  }

  function size() {
    var r = hero.getBoundingClientRect();
    if (!r.width || !r.height) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
  }

  function palette(light) {
    if (light) {
      return {
        bgTop: '#E5EAF2',
        bgBot: '#ECEFF4',
        glowA: 'rgba(11, 122, 117, 0.15)',
        glowB: 'rgba(81, 81, 198, 0.13)',
        glowC: 'rgba(62, 122, 43, 0.10)',
        grid: 'rgba(17, 24, 39, 0.045)',
        road: 'rgba(205, 214, 228, 0.85)',
        roadMajor: 'rgba(191, 203, 222, 0.95)',
        blockSide: '#CFD8E6',
        blockTop: 'rgba(255, 255, 255, 0.92)',
        blockAccent: 'rgba(235, 247, 246, 0.96)',
        blockStroke: 'rgba(17, 24, 39, 0.085)',
        blockLit: 'rgba(11, 122, 117, 0.42)',
        tones: ['#0B7A75', '#5151C6', '#3E7A2B'],
        toneSoft: ['rgba(11, 122, 117, 0.16)', 'rgba(81, 81, 198, 0.14)', 'rgba(62, 122, 43, 0.14)'],
        sweepSoft: 'rgba(11, 122, 117, 0.12)',
        streamHead: '#0B7A75',
        pinCore: '#FFFFFF',
        link: 'rgba(11, 122, 117, 0.22)'
      };
    }
    return {
      bgTop: '#04070E',
      bgBot: '#09101D',
      glowA: 'rgba(172, 247, 240, 0.18)',
      glowB: 'rgba(194, 195, 245, 0.16)',
      glowC: 'rgba(217, 242, 199, 0.11)',
      grid: 'rgba(194, 195, 245, 0.045)',
      road: 'rgba(22, 31, 49, 0.85)',
      roadMajor: 'rgba(31, 43, 68, 0.95)',
      blockSide: '#080D18',
      blockTop: 'rgba(16, 24, 40, 0.94)',
      blockAccent: 'rgba(22, 34, 54, 0.96)',
      blockStroke: 'rgba(255, 255, 255, 0.075)',
      blockLit: 'rgba(172, 247, 240, 0.45)',
      tones: ['#ACF7F0', '#C2C3F5', '#D9F2C7'],
      toneSoft: ['rgba(172, 247, 240, 0.16)', 'rgba(194, 195, 245, 0.14)', 'rgba(217, 242, 199, 0.14)'],
      sweepSoft: 'rgba(172, 247, 240, 0.14)',
      streamHead: '#FFFFFF',
      pinCore: '#04070E',
      link: 'rgba(172, 247, 240, 0.18)'
    };
  }

  function draw(now) {
    if (!W) size();
    if (!W) return;

    var t = reduced ? 0 : now / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    var tiltX = (mouse.x - 0.5) * (reduced ? 0 : 1) + Math.sin(t * 0.25) * 0.22;
    var tiltY = (mouse.y - 0.5) * (reduced ? 0 : 1) + Math.cos(t * 0.2) * 0.18;

    var rtl = isRtl();
    var pal = palette(isLight());
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Rich vertical atmospheric gradient background
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, pal.bgTop);
    bg.addColorStop(1, pal.bgBot);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Soft ambient color clouds positioned on the open visual half
    var focalX = (rtl ? 0.30 : 0.70) * W + tiltX * 24;
    var focalY = 0.44 * H + tiltY * 16;
    var amb1 = ctx.createRadialGradient(focalX, focalY, 10, focalX, focalY, Math.max(W, H) * 0.44);
    amb1.addColorStop(0, pal.glowA);
    amb1.addColorStop(0.5, pal.glowB);
    amb1.addColorStop(1, 'transparent');
    ctx.fillStyle = amb1;
    ctx.fillRect(0, 0, W, H);

    var amb2X = (rtl ? 0.16 : 0.86) * W;
    var amb2 = ctx.createRadialGradient(amb2X, H * 0.72, 10, amb2X, H * 0.72, Math.max(W, H) * 0.32);
    amb2.addColorStop(0, pal.glowC);
    amb2.addColorStop(1, 'transparent');
    ctx.fillStyle = amb2;
    ctx.fillRect(0, 0, W, H);

    // Transformed oblique urban grid layer
    ctx.save();
    ctx.translate(W * 0.5 + tiltX * 14, H * 0.5 + tiltY * 10);
    ctx.rotate(rtl ? 0.11 : -0.11);
    ctx.scale(1.18, 1.08);
    ctx.translate(-W * 0.5, -H * 0.5);

    // Fine coordinate mesh
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gx = 0; gx <= W; gx += 44) {
      ctx.moveTo(gx, -H * 0.2);
      ctx.lineTo(gx, H * 1.2);
    }
    for (var gy = 0; gy <= H; gy += 44) {
      ctx.moveTo(-W * 0.2, gy);
      ctx.lineTo(W * 1.2, gy);
    }
    ctx.stroke();

    // Urban avenues & streets
    ctx.strokeStyle = pal.road;
    ctx.lineWidth = 6;
    ctx.beginPath();
    roadsH.forEach(function (ry, idx) {
      if (idx % 2 === 1) {
        ctx.moveTo(-W * 0.15, ry * H);
        ctx.lineTo(W * 1.15, ry * H);
      }
    });
    roadsV.forEach(function (rx, idx) {
      if (idx % 2 === 1) {
        ctx.moveTo(rx * W, -H * 0.15);
        ctx.lineTo(rx * W, H * 1.15);
      }
    });
    ctx.stroke();

    ctx.strokeStyle = pal.roadMajor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    roadsH.forEach(function (ry, idx) {
      if (idx % 2 === 0) {
        ctx.moveTo(-W * 0.15, ry * H);
        ctx.lineTo(W * 1.15, ry * H);
      }
    });
    roadsV.forEach(function (rx, idx) {
      if (idx % 2 === 0) {
        ctx.moveTo(rx * W, -H * 0.15);
        ctx.lineTo(rx * W, H * 1.15);
      }
    });
    ctx.stroke();

    // Flowing light comets along streets (foot-traffic & transit pulse)
    streams.forEach(function (st) {
      var p = st.pos + (reduced ? 0 : t * st.speed);
      p = ((p % 1.3) + 1.3) % 1.3 - 0.15;
      var dir = st.speed >= 0 ? 1 : -1;
      var x1, y1, x2, y2;
      if (st.horiz) {
        x1 = (p - dir * st.len) * W;
        x2 = p * W;
        y1 = y2 = st.track * H;
      } else {
        x1 = x2 = st.track * W;
        y1 = (p - dir * st.len) * H;
        y2 = p * H;
      }
      var col = pal.tones[st.tone];
      var grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.75, col);
      grad.addColorStop(1, pal.streamHead);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x2, y2, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });

    // Compute world-space hotspots (shifted seamlessly on RTL)
    var pts = hotspots.map(function (hs) {
      var hx = (rtl ? 1 - hs.rx : hs.rx) * W;
      var hy = hs.ry * H;
      var breathe = reduced ? 1 : 0.96 + Math.sin(t * 1.1 + hs.phase) * 0.05;
      return {
        x: hx,
        y: hy,
        rad: Math.min(W, H) * hs.radius * breathe,
        tone: hs.tone,
        main: hs.main,
        phase: hs.phase
      };
    });

    var mainPt = pts[0];

    // 2.5D extruded city blocks with radar-wave edge illumination
    blocks.forEach(function (b) {
      var bx = b.x * W;
      var by = b.y * H;
      var bw = b.w * W;
      var bh = b.h * H;
      var ex = b.extrude + (reduced ? 0 : Math.sin(t * 0.9 + b.phase) * 1.1);
      var dist = Math.hypot(bx + bw * 0.5 - mainPt.x, by + bh * 0.5 - mainPt.y);
      var inZone = dist < mainPt.rad * 1.05;

      // Extruded volume shadow
      ctx.fillStyle = pal.blockSide;
      ctx.fillRect(bx, by, bw, bh);

      // Rooftop face
      ctx.fillStyle = (inZone || b.accent) ? pal.blockAccent : pal.blockTop;
      ctx.fillRect(bx - ex * 0.35, by - ex, bw, bh);

      ctx.strokeStyle = inZone ? pal.blockLit : pal.blockStroke;
      ctx.lineWidth = inZone ? 1.05 : 0.75;
      ctx.strokeRect(bx - ex * 0.35, by - ex, bw, bh);
    });

    // Subtle network sightlines connecting demand clusters to main catchment anchor
    ctx.strokeStyle = pal.link;
    ctx.lineWidth = 1;
    demandNodes.forEach(function (nd) {
      var nx = (rtl ? 1 - nd.x * 0.85 : 0.15 + nd.x * 0.85) * W;
      var ny = nd.y * H;
      var d = Math.hypot(nx - mainPt.x, ny - mainPt.y);
      if (d < Math.min(W, H) * 0.29) {
        ctx.beginPath();
        ctx.moveTo(mainPt.x, mainPt.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
      }
      var pulse = reduced ? 0 : Math.sin(t * 2.2 + nd.phase) * 0.9;
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5 + pulse * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = pal.tones[nd.tone];
      ctx.globalAlpha = 0.65;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Catchment radar rings & glowing beacons
    pts.forEach(function (pt) {
      var col = pal.tones[pt.tone];
      var soft = pal.toneSoft[pt.tone];

      // Soft catchment halo
      var rg = ctx.createRadialGradient(pt.x, pt.y, 4, pt.x, pt.y, pt.rad);
      rg.addColorStop(0, soft);
      rg.addColorStop(0.7, soft);
      rg.addColorStop(1, 'transparent');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.rad, 0, Math.PI * 2);
      ctx.fill();

      // Gentle rotating sweep sector on primary hotspot
      if (pt.main && !reduced) {
        var sweepAng = t * 0.55;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.arc(pt.x, pt.y, pt.rad, sweepAng, sweepAng + 0.85);
        ctx.closePath();
        ctx.fillStyle = pal.sweepSoft;
        ctx.fill();
      }

      // Rotating dashed perimeter ring
      ctx.save();
      ctx.strokeStyle = col;
      ctx.globalAlpha = pt.main ? 0.68 : 0.38;
      ctx.lineWidth = pt.main ? 1.5 : 1.1;
      ctx.setLineDash([6, 6]);
      if (!reduced) ctx.lineDashOffset = (pt.main ? -1 : 1) * t * 14;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.rad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Expanding pulse ring on primary beacon
      if (pt.main && !reduced) {
        var wave = (t * 0.42) % 1;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 12 + wave * pt.rad * 1.15, 0, Math.PI * 2);
        ctx.strokeStyle = col;
        ctx.globalAlpha = (1 - wave) * 0.5;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Beacon pin
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.main ? 7.5 : 5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.main ? 2.8 : 2, 0, Math.PI * 2);
      ctx.fillStyle = pal.pinCore;
      ctx.fill();
    });

    ctx.restore();

    // Screen-space interactive cursor scan reticle + click radar ripples
    if (mouse.active && !reduced) {
      var mx = mouse.x * W;
      var my = mouse.y * H;
      var mg = ctx.createRadialGradient(mx, my, 4, mx, my, 120);
      mg.addColorStop(0, pal.glowA);
      mg.addColorStop(1, 'transparent');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mx, my, 120, 0, Math.PI * 2);
      ctx.fill();
    }

    for (var ri = ripples.length - 1; ri >= 0; ri--) {
      var rp = ripples[ri];
      var age = (now - rp.start) / 1400;
      if (age >= 1) {
        ripples.splice(ri, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(rp.x * W, rp.y * H, 14 + age * 210, 0, Math.PI * 2);
      ctx.strokeStyle = pal.tones[0];
      ctx.globalAlpha = (1 - age) * 0.55;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function loop() {
    if (raf || !vis || reduced) return;
    raf = requestAnimationFrame(function (now) {
      raf = 0;
      draw(now);
      loop();
    });
  }

  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    if (!r.width || !r.height) return;
    mouse.tx = (e.clientX - r.left) / r.width;
    mouse.ty = (e.clientY - r.top) / r.height;
    mouse.active = true;
  }, { passive: true });

  hero.addEventListener('pointerleave', function () {
    mouse.active = false;
    mouse.tx = isRtl() ? 0.30 : 0.70;
    mouse.ty = 0.44;
  });

  hero.addEventListener('pointerdown', function (e) {
    if (e.target && e.target.closest && e.target.closest('a, button')) return;
    var r = hero.getBoundingClientRect();
    if (!r.width || !r.height) return;
    ripples.push({
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
      start: performance.now()
    });
  });

  window.addEventListener('resize', function () { size(); draw(performance.now()); });
  document.addEventListener('ga-theme', function () { draw(performance.now()); });
  document.addEventListener('ga-lang', function () { draw(performance.now()); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      vis = es[0].isIntersecting;
      if (vis && !reduced) loop();
    }).observe(hero);
  }
  new MutationObserver(function () {
    draw(performance.now());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir', 'data-theme'] });

  buildScene();
  size();
  draw(0);
  cv.classList.add('is-ready');
  if (!reduced) loop();
})();
