/* Living City Traffic Overlay for Jabio Hero Panorama:
   Projects continuously moving vehicles strictly inside the pixel-calibrated
   empty asphalt carriageways of hero-city-day.jpg and hero-city-night.jpg
   (1376x768) using exact object-fit: cover (50% 44%) projection. */
(function () {
  'use strict';
  var cv = document.getElementById('heroTraffic');
  if (!cv) return;
  var media = cv.parentElement;
  var ctx = cv.getContext('2d');
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  var dayImg = media.querySelector('.hm-photo.is-day');
  var nightImg = media.querySelector('.hm-photo.is-night');

  // Calibrated road carriageways verified directly against 1376x768 asphalt geometry
  var LANES = [
    // Center Grand Boulevard — toward viewer (left carriageway)
    {
      dir: 'toward',
      axis: 'x',
      speed: 0.052,
      count: 14,
      maxSpread: 0.0040,
      pts: [
        [0.5030, 0.460], [0.5015, 0.500], [0.4990, 0.550], [0.4965, 0.600],
        [0.4940, 0.650], [0.4910, 0.700], [0.4885, 0.750], [0.4870, 0.768]
      ]
    },
    // Center Grand Boulevard — away toward Azadi (right carriageway)
    {
      dir: 'away',
      axis: 'x',
      speed: 0.048,
      count: 14,
      maxSpread: 0.0040,
      pts: [
        [0.5260, 0.768], [0.5220, 0.750], [0.5190, 0.700], [0.5165, 0.650],
        [0.5145, 0.600], [0.5125, 0.550], [0.5105, 0.500], [0.5085, 0.460]
      ]
    },
    // Right Diagonal Boulevard — toward viewer (left carriageway)
    {
      dir: 'toward',
      axis: 'x',
      speed: 0.046,
      count: 13,
      maxSpread: 0.0038,
      pts: [
        [0.766, 0.465], [0.758, 0.500], [0.749, 0.550], [0.737, 0.600],
        [0.724, 0.650], [0.711, 0.700], [0.700, 0.750], [0.693, 0.785], [0.689, 0.802]
      ]
    },
    // Right Diagonal Boulevard — away (right carriageway)
    {
      dir: 'away',
      axis: 'x',
      speed: 0.044,
      count: 13,
      maxSpread: 0.0038,
      pts: [
        [0.733, 0.802], [0.731, 0.785], [0.730, 0.750], [0.733, 0.700],
        [0.739, 0.650], [0.748, 0.600], [0.757, 0.550], [0.765, 0.500], [0.770, 0.465]
      ]
    },
    // Left Diagonal Avenue — toward viewer (left carriageway)
    {
      dir: 'toward',
      axis: 'x',
      speed: 0.046,
      count: 8,
      maxSpread: 0.0018,
      pts: [
        [0.270, 0.465], [0.259, 0.500], [0.246, 0.550], [0.233, 0.600],
        [0.220, 0.650], [0.207, 0.700], [0.202, 0.715]
      ]
    },
    // Left Diagonal Avenue — away (right carriageway)
    {
      dir: 'away',
      axis: 'x',
      speed: 0.044,
      count: 8,
      maxSpread: 0.0018,
      pts: [
        [0.211, 0.715], [0.215, 0.700], [0.227, 0.650], [0.239, 0.600],
        [0.252, 0.550], [0.264, 0.500], [0.273, 0.465]
      ]
    },
    // Right Intersection Cross-Street — westbound (strictly inside open intersection asphalt)
    {
      dir: 'cross',
      axis: 'y',
      speed: 0.145,
      count: 4,
      maxSpread: 0.0018,
      pts: [[0.758, 0.804], [0.715, 0.799], [0.672, 0.795]]
    },
    // Right Intersection Cross-Street — eastbound (strictly inside open intersection asphalt)
    {
      dir: 'cross',
      axis: 'y',
      speed: 0.140,
      count: 4,
      maxSpread: 0.0018,
      pts: [[0.672, 0.809], [0.715, 0.814], [0.758, 0.819]]
    }
  ];

  var imgW = 1376, imgH = 768;

  // Precompute arc lengths in image pixel space for uniform screen-space travel
  function buildSegments() {
    LANES.forEach(function (lane) {
      var segs = [];
      var total = 0;
      for (var i = 0; i < lane.pts.length - 1; i++) {
        var ax = lane.pts[i][0], ay = lane.pts[i][1];
        var bx = lane.pts[i + 1][0], by = lane.pts[i + 1][1];
        var dxPx = (bx - ax) * imgW;
        var dyPx = (by - ay) * imgH;
        var len = Math.hypot(dxPx, dyPx);
        segs.push({
          ax: ax, ay: ay, bx: bx, by: by,
          len: len,
          start: total,
          ang: Math.atan2(dyPx, dxPx)
        });
        total += len;
      }
      lane.segs = segs;
      lane.total = total || 1;
    });
  }

  buildSegments();

  function depthFactor(y) {
    return Math.max(0.08, Math.min(1.0, (y - 0.45) / 0.33));
  }

  function sampleLane(lane, u, normSub) {
    var d = ((u % 1) + 1) % 1 * lane.total;
    var seg = lane.segs[lane.segs.length - 1];
    for (var i = 0; i < lane.segs.length; i++) {
      if (d <= lane.segs[i].start + lane.segs[i].len) {
        seg = lane.segs[i];
        break;
      }
    }
    var local = seg.len ? (d - seg.start) / seg.len : 0;
    var x = seg.ax + (seg.bx - seg.ax) * local;
    var y = seg.ay + (seg.by - seg.ay) * local;
    var depth = depthFactor(y);
    var spread = normSub * lane.maxSpread * depth;
    if (lane.axis === 'y') {
      y += spread;
    } else {
      x += spread;
    }
    return { x: x, y: y, ang: seg.ang, depth: depth };
  }

  function mulberry32(a) {
    return function () {
      var t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var DAY_BODIES = ['#F4F6F9', '#E2E6EC', '#CBD2DC', '#3A414E', '#1F242D', '#E2AE3B', '#9BA5B4'];
  var rnd = mulberry32(9021);
  var cars = [];

  LANES.forEach(function (lane, laneIdx) {
    for (var i = 0; i < lane.count; i++) {
      var basePos = (i + rnd() * 0.55) / lane.count;
      // Pick clean left or right sub-lane inside [-1, 1] of maxSpread
      var normSub = (i % 2 === 0 ? -1 : 1) * (0.45 + rnd() * 0.45);
      cars.push({
        lane: laneIdx,
        u: basePos,
        speed: lane.speed * (0.82 + rnd() * 0.36),
        normSub: normSub,
        body: DAY_BODIES[Math.floor(rnd() * DAY_BODIES.length)],
        scaleMul: 0.85 + rnd() * 0.30
      });
    }
  });

  var W = 0, H = 0, DPR = 1, raf = 0, vis = true, last = performance.now();

  function syncNaturalAspect() {
    var ref = (dayImg && dayImg.naturalWidth) ? dayImg : (nightImg && nightImg.naturalWidth ? nightImg : null);
    if (ref && ref.naturalWidth && ref.naturalHeight && (ref.naturalWidth !== imgW || ref.naturalHeight !== imgH)) {
      imgW = ref.naturalWidth;
      imgH = ref.naturalHeight;
      buildSegments();
    }
  }

  if (dayImg) dayImg.addEventListener('load', syncNaturalAspect);
  if (nightImg) nightImg.addEventListener('load', syncNaturalAspect);
  syncNaturalAspect();

  function size() {
    var r = media.getBoundingClientRect();
    if (!r.width || !r.height) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width;
    H = r.height;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
  }

  function isLight() { return document.documentElement.getAttribute('data-theme') === 'light'; }

  function render(now) {
    if (!W) size();
    if (!W) return;

    var dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
    last = now;
    var tSec = now / 1000;
    var light = isLight();

    // Exact object-fit: cover; object-position: 50% 44% transform
    var coverScale = Math.max(W / imgW, H / imgH);
    var drawW = imgW * coverScale;
    var drawH = imgH * coverScale;
    var offX = (W - drawW) * 0.5;
    var offY = (H - drawH) * 0.44;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < cars.length; i++) {
      var car = cars[i];
      var lane = LANES[car.lane];
      var samplePre = sampleLane(lane, car.u, car.normSub);

      // Perspective speed: distant vehicles move naturally slower in screen space
      var perspSpeed = car.speed * (0.28 + samplePre.depth * 1.15);
      car.u = (car.u + perspSpeed * dt) % 1;

      var pos = sampleLane(lane, car.u, car.normSub);
      var sx = offX + pos.x * drawW;
      var sy = offY + pos.y * drawH;
      if (sx < -24 || sx > W + 24 || sy < -24 || sy > H + 24) continue;

      // Smooth fade at road endpoints so cars emerge and vanish cleanly within asphalt
      var edgeFade = Math.min(1, car.u / 0.08, (1 - car.u) / 0.08);
      if (edgeFade <= 0.02) continue;

      var carLen = (2.4 + pos.depth * 5.2) * (drawW / 1376) * car.scaleMul;
      var carWid = carLen * 0.50;

      ctx.save();
      ctx.globalAlpha = edgeFade;
      ctx.translate(sx, sy);
      ctx.rotate(pos.ang);

      if (light) {
        // Daytime: scale-accurate miniature vehicle + soft asphalt shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
        ctx.fillRect(-carLen * 0.5 + 0.7, -carWid * 0.5 + 1.0, carLen, carWid);

        ctx.fillStyle = car.body;
        ctx.fillRect(-carLen * 0.5, -carWid * 0.5, carLen, carWid);

        ctx.fillStyle = 'rgba(20, 28, 40, 0.48)';
        ctx.fillRect(carLen * 0.08, -carWid * 0.36, carLen * 0.24, carWid * 0.72);
      } else {
        // Nighttime: headlights on oncoming lanes, red taillights on receding lanes
        var isHead = lane.dir === 'toward' || lane.dir === 'cross';
        var isTail = lane.dir === 'away' || lane.dir === 'cross';

        ctx.fillStyle = 'rgba(16, 20, 30, 0.82)';
        ctx.fillRect(-carLen * 0.5, -carWid * 0.48, carLen, carWid * 0.96);

        if (isHead) {
          var coneLen = carLen * (2.4 + pos.depth * 1.1);
          var beam = ctx.createLinearGradient(carLen * 0.45, 0, carLen * 0.45 + coneLen, 0);
          beam.addColorStop(0, 'rgba(255, 236, 179, 0.44)');
          beam.addColorStop(0.55, 'rgba(255, 226, 150, 0.14)');
          beam.addColorStop(1, 'transparent');
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(carLen * 0.45, -carWid * 0.40);
          ctx.lineTo(carLen * 0.45 + coneLen, -carWid * 1.05);
          ctx.lineTo(carLen * 0.45 + coneLen, carWid * 1.05);
          ctx.lineTo(carLen * 0.45, carWid * 0.40);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#FFF5D6';
          var hlR = Math.max(0.85, carWid * 0.24);
          ctx.beginPath();
          ctx.arc(carLen * 0.48, -carWid * 0.30, hlR, 0, Math.PI * 2);
          ctx.arc(carLen * 0.48, carWid * 0.30, hlR, 0, Math.PI * 2);
          ctx.fill();
        }

        if (isTail) {
          var trail = ctx.createLinearGradient(-carLen * 0.45, 0, -carLen * 2.1, 0);
          trail.addColorStop(0, 'rgba(255, 74, 74, 0.46)');
          trail.addColorStop(1, 'transparent');
          ctx.strokeStyle = trail;
          ctx.lineWidth = Math.max(1, carWid * 0.34);
          ctx.beginPath();
          ctx.moveTo(-carLen * 0.45, -carWid * 0.28);
          ctx.lineTo(-carLen * 1.85, -carWid * 0.28);
          ctx.moveTo(-carLen * 0.45, carWid * 0.28);
          ctx.lineTo(-carLen * 1.85, carWid * 0.28);
          ctx.stroke();

          ctx.fillStyle = '#FF5252';
          var tlR = Math.max(0.8, carWid * 0.22);
          ctx.beginPath();
          ctx.arc(-carLen * 0.48, -carWid * 0.28, tlR, 0, Math.PI * 2);
          ctx.arc(-carLen * 0.48, carWid * 0.28, tlR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // Subtle aviation beacon pulse at Milad Tower spire tip in night mode
    if (!light) {
      var mx = offX + 0.573 * drawW;
      var my = offY + 0.200 * drawH;
      var pulse = 0.5 + 0.5 * Math.sin(tSec * 2.5);
      if (pulse > 0.35) {
        var r = (3 + pulse * 5) * (drawW / 1376);
        var g = ctx.createRadialGradient(mx, my, 0, mx, my, r);
        g.addColorStop(0, 'rgba(255, 92, 92, ' + (0.75 * pulse) + ')');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(mx, my, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function loop(now) {
    if (!vis) {
      raf = 0;
      return;
    }
    render(now);
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', size);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      vis = es[0].isIntersecting;
      if (vis && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    }).observe(media);
  }

  size();
  raf = requestAnimationFrame(loop);
})();
