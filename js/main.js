(function () {
  'use strict';

  var WA_NUMBER = '6281234567890';
  var STOCK = window.GARASI_STOCK || [];
  var TYPE_LABELS = { suv: 'SUV', mpv: 'MPV', hatchback: 'Hatchback' };

  function waUrl(title) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Halo Garasi 05, saya tertarik dengan ' + title);
  }

  function yearOf(meta) {
    var m = (meta || '').match(/\b(19\d\d|20\d\d)\b/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function approxPriceOf(p) {
    var m = (p || '').match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  // ---------- Card HTML Builder (Bersih tanpa kotak DP rame) ----------
  function buildCarCard(c) {
    var yr = yearOf(c.meta) || '-';
    var trLabel = c.trans === 'matic' ? 'Matic' : 'Manual';
    var catLabel = TYPE_LABELS[c.type] || c.type.toUpperCase();
    var kmClean = (c.km || '').replace(/^KM\s*/i, '');

    return (
      '<article class="car">' +
        '<div class="car__media-wrap">' +
          '<button type="button" class="car__media js-lb" data-src="' + c.img + '" data-title="' + c.name + '" data-credit="' + c.dp + '">' +
            '<div class="car__img"><img src="' + c.img + '" alt="' + c.name + '" loading="lazy"></div>' +
          '</button>' +
          '<button type="button" class="car__poster-btn js-lb" data-src="' + c.img + '" data-title="' + c.name + '" data-credit="' + c.dp + '" title="Lihat Poster Lengkap" aria-label="Lihat Poster Lengkap">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="car__body">' +
          '<h3 class="car__title">' + c.name + '</h3>' +
          '<div class="car__specs-row">' +
            '<div class="car__spec-cell"><strong>' + yr + '</strong><span>Tahun</span></div>' +
            '<div class="car__spec-cell"><strong>' + trLabel + '</strong><span>Transmisi</span></div>' +
            '<div class="car__spec-cell"><strong>' + catLabel + '</strong><span>Kategori</span></div>' +
            '<div class="car__spec-cell"><strong>' + kmClean + '</strong><span>Kilometer</span></div>' +
          '</div>' +
          '<div class="car__footer">' +
            '<div class="car__price-wrap">' +
              '<strong class="car__price-val">' + c.price + '</strong>' +
            '</div>' +
            '<button type="button" class="btn-card-red js-lb" data-src="' + c.img + '" data-title="' + c.name + '" data-credit="' + c.dp + '">Detail <span>&rarr;</span></button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  // ---------- 1. Beranda: Tampilkan 3 Unit Pilihan Saja ----------
  var homeStockGrid = document.getElementById('homeStockGrid');
  if (homeStockGrid) {
    homeStockGrid.innerHTML = STOCK.slice(0, 3).map(buildCarCard).join('');
  }

  // ---------- 2. Halaman Katalog: Semua 13 Unit + Search & Filter ----------
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

  if (stockGrid) {
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

    // Baca query ?type=suv / mpv / hatchback dari URL jika ada
    try {
      var params = new URLSearchParams(window.location.search);
      var urlType = params.get('type');
      if (urlType && fType) fType.value = urlType;
    } catch (err) {}

    function renderStock() {
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
        stockGrid.innerHTML = '<p class="stock-empty">Tidak ada unit yang sesuai dengan pencarian dan filter Anda.</p>';
        return;
      }

      stockGrid.innerHTML = items.map(buildCarCard).join('');
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
      var labelSpan = toggleHandover.querySelector('span');
      if (labelSpan) {
        labelSpan.textContent = expanded ? 'Tampilkan lebih sedikit' : 'Lihat semua serah terima (' + TOTAL + ')';
      }
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
  }

  // ---------- Interactive FAQ Accordion ----------
  document.querySelectorAll('.faq-item__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('is-open');
        var b = other.querySelector('.faq-item__btn');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    });
  });

  // ---------- Lightbox ----------
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lbImg');
  var lbTitle = document.getElementById('lbTitle');
  var lbWa = document.getElementById('lbWa');

  function closeLb() {
    if (!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('.js-lb');
    if (t && lb) {
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

  // ---------- GSAP + Lenis ----------
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (!hasGsap) return;

  gsap.registerPlugin(ScrollTrigger);

  var nav = document.getElementById('nav');
  var isCatalogPage = document.querySelector('.page-catalog') !== null;
  var lastY = 0;

  var lenis = null;
  if (!reduce && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
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
        if (nav) nav.classList.add('is-hidden');
        lenis.scrollTo(el, {
          offset: -20,
          onComplete: function () {
            lastY = window.scrollY || window.pageYOffset;
            if (nav) nav.classList.remove('is-hidden');
          }
        });
      });
    });
  }

  if (nav) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) {
        var y = self.scroll();
        if (!isCatalogPage) {
          nav.classList.toggle('is-solid', y > window.innerHeight * 0.5);
        }
        nav.classList.toggle('is-hidden', y > lastY && y > 320);
        lastY = y;
      }
    });
  }

  if (reduce) return;

  if (document.querySelector('.hero__media-panel')) {
    var heroVideo = document.querySelector('.hero__video');
    if (heroVideo) {
      heroVideo.muted = true;
      var p = heroVideo.play();
      if (p && typeof p.catch === 'function') {
        p.catch(function () {});
      }
    }

    var heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.hero__media-panel', { opacity: 0, scale: 1.04, duration: 1.1 }, 0)
      .from('.hero__title', { opacity: 0, y: 24, duration: 0.85 }, 0.2)
      .from('.hero__desc', { opacity: 0, y: 16, duration: 0.75 }, 0.4)
      .from('.hero__actions', { opacity: 0, y: 14, duration: 0.75 }, 0.55)
      .from('.hero__partners', { opacity: 0, y: 12, duration: 0.75 }, 0.7);
  }

  gsap.utils.toArray('[data-fade]').forEach(function (el) {
    gsap.from(el, {
      opacity: 0,
      y: 22,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
