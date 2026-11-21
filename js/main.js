(function () {
  'use strict';

  var WA_NUMBER = '6281234567890';

  var STOCK = window.GARASI_STOCK || [];

  function waUrl(title) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Halo Garasi 05, saya tertarik dengan ' + title);
  }

  // ---------- Render Ready Stock & Filter Lengkap ----------
  var stockGrid = document.getElementById('stockGrid');
  var fSearch = document.getElementById('fSearch');
  var fBrand = document.getElementById('fBrand');
  var fPrice = document.getElementById('fPrice');
  var fYear = document.getElementById('fYear');
  var fTrans = document.getElementById('fTrans');
  var fType = document.getElementById('fType');
  var fReset = document.getElementById('fReset');
  var heroCount = document.getElementById('heroCount');

  var BRANDS = ['Toyota', 'Honda', 'Suzuki', 'Daihatsu', 'Mitsubishi'];
  var MODEL_BRAND = {
    fortuner: 'Toyota', innova: 'Toyota', avanza: 'Toyota', agya: 'Toyota',
    xenia: 'Daihatsu', brio: 'Honda', 'cr-v': 'Honda',
    xpander: 'Mitsubishi', ertiga: 'Suzuki'
  };
  var PRICE_RANGES = [
    { v: 'le100', label: 'Hingga 100 juta', test: function (n) { return n <= 100; } },
    { v: '101-300', label: '100 - 300 juta', test: function (n) { return n > 100 && n <= 300; } },
    { v: 'gt300', label: 'Di atas 300 juta', test: function (n) { return n > 300; } }
  ];

  function brandOf(name) {
    var low = name.toLowerCase(), i, k;
    for (i = 0; i < BRANDS.length; i++) if (low.indexOf(BRANDS[i].toLowerCase()) === 0) return BRANDS[i];
    for (k in MODEL_BRAND) if (low.indexOf(k) !== -1) return MODEL_BRAND[k];
    return 'Lainnya';
  }

  function yearOf(meta) {
    var m = (meta || '').match(/\b(19\d\d|20\d\d)\b/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function approxPriceOf(p) {
    var m = (p || '').match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  // Isi dropdown filter
  if (fBrand) {
    BRANDS.forEach(function (b) {
      var opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      fBrand.appendChild(opt);
    });
  }
  if (fPrice) {
    PRICE_RANGES.forEach(function (r) {
      var opt = document.createElement('option');
      opt.value = r.v;
      opt.textContent = r.label;
      fPrice.appendChild(opt);
    });
  }
  if (fYear) {
    var years = [];
    STOCK.forEach(function (c) {
      var y = yearOf(c.meta);
      if (y && years.indexOf(y) === -1) years.push(y);
    });
    years.sort(function (a, b) { return b - a; });
    years.forEach(function (y) {
      var opt = document.createElement('option');
      opt.value = String(y);
      opt.textContent = String(y);
      fYear.appendChild(opt);
    });
  }

  function renderStock() {
    if (!stockGrid) return;

    var q = (fSearch ? fSearch.value : '').trim().toLowerCase();
    var selBrand = fBrand ? fBrand.value : 'all';
    var selPrice = fPrice ? fPrice.value : 'all';
    var selYear = fYear ? fYear.value : 'all';
    var selTrans = fTrans ? fTrans.value : 'all';
    var selType = fType ? fType.value : 'all';

    var items = STOCK.filter(function (c) {
      if (q) {
        var hay = (c.name + ' ' + (c.meta || '') + ' ' + brandOf(c.name)).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      if (selBrand !== 'all' && brandOf(c.name) !== selBrand) return false;
      if (selType !== 'all' && c.type !== selType) return false;
      if (selTrans !== 'all' && c.trans !== selTrans) return false;
      if (selYear !== 'all' && String(yearOf(c.meta)) !== selYear) return false;
      if (selPrice !== 'all') {
        var num = approxPriceOf(c.price);
        var rule = null;
        for (var i = 0; i < PRICE_RANGES.length; i++) {
          if (PRICE_RANGES[i].v === selPrice) { rule = PRICE_RANGES[i]; break; }
        }
        if (rule && !rule.test(num)) return false;
      }
      return true;
    });

    if (heroCount) heroCount.textContent = items.length;

    if (items.length === 0) {
      stockGrid.innerHTML = '<p class="stock-empty">Tidak ada unit yang sesuai dengan kombinasi pencarian dan filter tersebut.</p>';
      return;
    }

    stockGrid.innerHTML = items.map(function (c) {
      var kredit = c.dp.replace(' · ', ' / ');
      return (
        '<article class="car">' +
          '<button type="button" class="car__media js-lb" data-src="' + c.img + '" data-title="' + c.name + '" data-credit="' + c.dp + '">' +
            '<div class="car__img"><img src="' + c.img + '" alt="' + c.name + '" loading="lazy"></div>' +
          '</button>' +
          '<div class="car__info">' +
            '<div class="car__head">' +
              '<h3>' + c.name + '</h3>' +
              '<p class="car__spec">' + c.meta + '</p>' +
            '</div>' +
            '<div class="car__notes">' +
              '<span class="car__label">Keterangan</span>' +
              '<ul class="car__bullets">' +
                '<li>Kondisi bersih rapi interior eksterior</li>' +
                '<li>' + c.km + ' on going</li>' +
                '<li>Surat lengkap, taat pajak</li>' +
                '<li>Mesin sehat, kaki senyap</li>' +
              '</ul>' +
            '</div>' +
            '<div class="car__deal">' +
              '<div class="car__deal-item">' +
                '<span class="car__label">Kredit</span>' +
                '<strong class="car__kredit-val">' + kredit + '</strong>' +
              '</div>' +
              '<div class="car__deal-item">' +
                '<span class="car__label">Harga</span>' +
                '<strong class="car__price-val">' + c.price + '</strong>' +
              '</div>' +
            '</div>' +
            '<div class="car__actions">' +
              '<button type="button" class="car__quick-view js-lb" data-src="' + c.img + '" data-title="' + c.name + '" data-credit="' + c.dp + '">Lihat Poster</button>' +
              '<a href="' + waUrl(c.name) + '" target="_blank" rel="noopener">Tanya WA &rarr;</a>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }
  renderStock();

  [fSearch, fBrand, fPrice, fYear, fTrans, fType].forEach(function (el) {
    if (!el) return;
    el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', renderStock);
  });

  if (fReset) {
    fReset.addEventListener('click', function () {
      if (fSearch) fSearch.value = '';
      if (fBrand) fBrand.value = 'all';
      if (fPrice) fPrice.value = 'all';
      if (fYear) fYear.value = 'all';
      if (fTrans) fTrans.value = 'all';
      if (fType) fType.value = 'all';
      renderStock();
    });
  }

  // ---------- Render Serah Terima (27 foto) ----------
  var handoverGrid = document.getElementById('handoverGrid');
  var toggleHandover = document.getElementById('toggleHandover');
  var TOTAL = 27;
  var INITIAL = 8;
  var expanded = false;

  if (handoverGrid) {
    var out = '';
    for (var i = 1; i <= TOTAL; i++) {
      var n = i < 10 ? '0' + i : '' + i;
      var src = 'assets/img/serah-terima/serah-terima-' + n + '.jpg';
      out +=
        '<button type="button" class="handover__item js-lb' + (i > INITIAL ? ' is-hidden' : '') + '" data-src="' + src + '" data-title="Serah Terima Garasi 05 #' + n + '">' +
          '<img src="' + src + '" alt="Serah terima unit Garasi 05 #' + n + '" loading="lazy">' +
        '</button>';
    }
    handoverGrid.innerHTML = out;
  }

  if (toggleHandover && handoverGrid) {
    toggleHandover.addEventListener('click', function () {
      expanded = !expanded;
      handoverGrid.querySelectorAll('.handover__item').forEach(function (el, idx) {
        if (idx >= INITIAL) el.classList.toggle('is-hidden', !expanded);
      });
      toggleHandover.innerHTML = (expanded ? 'Tampilkan lebih sedikit ' : 'Lihat semua serah terima (' + TOTAL + ') ') + '<i></i>';
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
  }

  // ---------- Minimalist Lightbox ----------
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbTitle = document.getElementById('lbTitle');
  var lbWa = document.getElementById('lbWa');

  function closeLb() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('.js-lb');
    if (t) {
      lbImg.src = t.getAttribute('data-src');
      lbImg.alt = t.getAttribute('data-title') || '';
      var title = t.getAttribute('data-title') || '';
      var credit = t.getAttribute('data-credit') ? ' (' + t.getAttribute('data-credit') + ')' : '';
      lbTitle.textContent = title + credit;
      lbWa.href = waUrl(title);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      return;
    }
    if (e.target.closest('[data-lb-close]')) closeLb();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb && lb.classList.contains('is-open')) closeLb();
  });

  // ---------- Floating WhatsApp Scroll Trigger ----------
  var floatWa = document.querySelector('.float-wa');
  if (floatWa) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      if (y > 320) {
        floatWa.classList.add('is-visible');
      } else {
        floatWa.classList.remove('is-visible');
      }
    }, { passive: true });
  }

  // ---------- GSAP + Lenis (Persis gaya halus sebelumnya) ----------
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (!hasGsap) return;

  gsap.registerPlugin(ScrollTrigger);

  var lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var el = document.querySelector(id);
        if (!el) return;
        e.preventDefault();
        nav.classList.add('is-hidden');
        lenis.scrollTo(el, {
          offset: 0,
          onComplete: function () {
            lastY = window.scrollY || window.pageYOffset;
            nav.classList.remove('is-hidden');
          }
        });
      });
    });
  }

  var nav = document.getElementById('nav');
  var lastY = 0;
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: function (self) {
      var y = self.scroll();
      nav.classList.toggle('is-solid', y > window.innerHeight * 0.6);
      nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight * 0.9);
      lastY = y;
    }
  });

  if (reduce) return;

  document.querySelectorAll('[data-split]').forEach(function (el) {
    var parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map(function (p) {
      return '<span class="line"><span class="line__inner">' + p.trim() + '</span></span>';
    }).join('');
  });

  var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero__media', { clipPath: 'inset(0 0 100% 0)', duration: 1.5, ease: 'power3.inOut' }, 0)
    .from('.hero__media img', { scale: 1.12, duration: 2.2, ease: 'power2.out' }, 0)
    .from('.hero .eyebrow', { opacity: 0, y: 16, duration: 0.9 }, 0.35)
    .from('.hero__title .line__inner', { yPercent: 110, duration: 1.2, stagger: 0.14 }, 0.45)
    .from('.hero__meta', { opacity: 0, y: 20, duration: 1 }, 1.0)
    .from('.hero__scroll', { opacity: 0, duration: 1 }, 1.3)
    .from('.nav', { opacity: 0, duration: 1, clearProps: 'opacity' }, 0.75);

  document.querySelectorAll('[data-split]').forEach(function (el) {
    if (el.closest('.hero')) return;
    gsap.from(el.querySelectorAll('.line__inner'), {
      yPercent: 110,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: 'top 85%', once: true }
    });
  });

  gsap.utils.toArray('[data-fade]').forEach(function (el) {
    gsap.from(el, {
      opacity: 0, y: 24, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, {
      opacity: 0, y: 44, duration: 1.05, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  gsap.utils.toArray('[data-mask]').forEach(function (el) {
    gsap.fromTo(el,
      { clipPath: 'inset(0 0 100% 0)' },
      {
        clipPath: 'inset(0 0 0% 0)', duration: 1.35, ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }
    );
  });

  gsap.utils.toArray('[data-parallax]').forEach(function (el) {
    var amt = parseFloat(el.getAttribute('data-parallax')) || 0.08;
    var host = el.closest('section') || el.parentElement;
    var isHero = el.classList.contains('hero__media');
    gsap.fromTo(el,
      { yPercent: isHero ? 0 : -amt * 100 },
      {
        yPercent: amt * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: isHero ? host : el.parentElement,
          start: isHero ? 'top top' : 'top bottom',
          end: isHero ? 'bottom top' : 'bottom top',
          scrub: true
        }
      }
    );
  });

  gsap.utils.toArray('[data-scale]').forEach(function (el) {
    gsap.fromTo(el,
      { scale: 1.08 },
      {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top 90%', end: 'center center', scrub: true }
      }
    );
  });

  gsap.utils.toArray('[data-hshift]').forEach(function (el) {
    var dist = parseFloat(el.getAttribute('data-hshift')) || -60;
    gsap.fromTo(el,
      { x: -dist },
      {
        x: dist, ease: 'none',
        scrollTrigger: { trigger: el.closest('.showcase__stage'), start: 'top bottom', end: 'bottom top', scrub: true }
      }
    );
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
