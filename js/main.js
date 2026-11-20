(function () {
  'use strict';

  var WA_NUMBER = '6281234567890';

  var STOCK = [
    { name: 'Toyota Fortuner GR 2.8L', type: 'suv', trans: 'matic', meta: 'SUV · Matic · 2022', km: 'KM 70 rb', price: "400 Juta'an Up", dp: 'DP 75 jt · Angs 11,1 jt x 5th', tag: 'Flagship SUV', img: 'assets/img/stock/fortuner-gr-2022.jpg' },
    { name: 'Innova Zenix Q Hybrid', type: 'mpv', trans: 'matic', meta: 'MPV · Matic · 2023', km: 'KM 41 rb', price: "400 Juta'an Up", dp: 'DP 40 jt · Angs 12,9 jt x 5th', tag: 'Modelista Hybrid', img: 'assets/img/stock/innova-zenix-q-2023.jpg' },
    { name: 'Honda CR-V Prestige Turbo', type: 'suv', trans: 'matic', meta: 'SUV · Matic · 2022', km: 'KM 30 rb', price: "400 Juta'an Up", dp: 'DP 100 jt · Angs 9,3 jt x 5th', tag: 'Turbo Sensing', img: 'assets/img/stock/crv-prestige-2022.jpg' },
    { name: 'Xpander Cross Premium', type: 'suv', trans: 'matic', meta: 'SUV · Matic · 2024', km: 'KM 21 rb', price: "300 Juta'an Up", dp: 'DP 65 jt · Angs 6,9 jt x 5th', tag: 'Matic 2024', img: 'assets/img/stock/xpander-cross-2024.jpg' },
    { name: 'Toyota Innova G 2.4L Diesel', type: 'mpv', trans: 'matic', meta: 'MPV · Matic · 2023', km: 'KM 40 rb', price: "300 Juta'an Up", dp: 'DP 47 jt · Angs 9,3 jt x 5th', tag: 'Diesel Matic', img: 'assets/img/stock/innova-g-diesel-2023.jpg' },
    { name: 'All New Avanza E 1.3L (I)', type: 'mpv', trans: 'matic', meta: 'MPV · Matic · 2023', km: 'KM 60 rb', price: "100 Juta'an Up", dp: 'DP 7 jt · Angs 5,4 jt x 5th', tag: 'DP 7 Jt', img: 'assets/img/stock/avanza-e-2023-1.jpg' },
    { name: 'All New Avanza E 1.3L (II)', type: 'mpv', trans: 'matic', meta: 'MPV · Matic · 2023', km: 'KM 41 rb', price: "100 Juta'an Up", dp: 'DP 7 jt · Angs 5,4 jt x 5th', tag: 'DP 7 Jt', img: 'assets/img/stock/avanza-e-2023-2.jpg' },
    { name: 'All New Xenia X 1.3L', type: 'mpv', trans: 'manual', meta: 'MPV · Manual · 2022', km: 'KM 90 rb', price: "100 Juta'an Up", dp: 'DP 20 jt · Angs 4,5 jt x 5th', tag: 'Manual 2022', img: 'assets/img/stock/xenia-x-2022.jpg' },
    { name: 'All New Honda Brio E', type: 'hatchback', trans: 'manual', meta: 'Hatchback · Manual · 2023', km: 'KM 45 rb', price: "100 Juta'an Up", dp: 'DP 45 jt · Angs 3,6 jt x 5th', tag: 'Manual 2023', img: 'assets/img/stock/brio-e-2023.jpg' },
    { name: 'Honda Brio E 1.2L Merah', type: 'hatchback', trans: 'manual', meta: 'Hatchback · Manual · 2018', km: 'KM 60 rb', price: "100 Juta'an Up", dp: 'DP 5 jt · Angs 3,6 jt x 5th', tag: 'DP 5 Jt', img: 'assets/img/stock/brio-e-2018-merah.jpg' },
    { name: 'Honda Brio E 1.2L Putih', type: 'hatchback', trans: 'manual', meta: 'Hatchback · Manual · 2018', km: 'KM 100 rb', price: "100 Juta'an Up", dp: 'DP 5 jt · Angs 3,6 jt x 5th', tag: 'DP 5 Jt', img: 'assets/img/stock/brio-e-2018-putih.jpg' },
    { name: 'Suzuki Ertiga GX 1.4L', type: 'mpv', trans: 'manual', meta: 'MPV · Manual · 2014', km: 'KM 160 rb', price: "100 Juta'an Up", dp: 'DP 35 jt · Angs 3,2 jt x 4th', tag: 'Ertiga GX', img: 'assets/img/stock/ertiga-gx-2014.jpg' },
    { name: 'Toyota Agya G 1.0L', type: 'hatchback', trans: 'manual', meta: 'Hatchback · Manual · 2014', km: 'KM 100 rb', price: "90 Juta'an Up", dp: 'DP 35 jt · Angs 2,1 jt x 4th', tag: 'DP 35 Jt', img: 'assets/img/stock/agya-g-2014.jpg' }
  ];

  function waUrl(title) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('Halo Garasi 05, saya tertarik dengan ' + title);
  }

  // ---------- Render Ready Stock ----------
  var stockGrid = document.getElementById('stockGrid');
  var stockTriggers = [];
  var currentCat = 'all';
  var currentTrans = 'all';

  function renderStock() {
    if (!stockGrid) return;
    var items = STOCK.filter(function (c) {
      var matchCat = currentCat === 'all' || c.type === currentCat;
      var matchTrans = currentTrans === 'all' || c.trans === currentTrans;
      return matchCat && matchTrans;
    });

    if (items.length === 0) {
      stockGrid.innerHTML = '<p class="stock-empty">Tidak ada unit yang sesuai dengan kombinasi filter tersebut.</p>';
      return;
    }

    stockGrid.innerHTML = items.map(function (c) {
      return (
        '<article class="car">' +
          '<button type="button" class="car__media js-lb" data-src="' + c.img + '" data-title="' + c.name + '" data-credit="' + c.dp + '">' +
            '<span class="car__tag">' + c.tag + '</span>' +
            '<div class="car__img"><img src="' + c.img + '" alt="' + c.name + '" loading="lazy"></div>' +
          '</button>' +
          '<div class="car__info">' +
            '<div>' +
              '<h3>' + c.name + '</h3>' +
              '<p class="car__spec">' + c.meta + ' &bull; ' + c.km + '</p>' +
              '<span class="car__credit-hint">' + c.dp + '</span>' +
            '</div>' +
            '<div class="car__price">' +
              '<strong>' + c.price + '</strong>' +
              '<div class="car__actions">' +
                '<button type="button" class="car__quick-view js-lb" data-src="' + c.img + '" data-title="' + c.name + '" data-credit="' + c.dp + '">Detail</button>' +
                '<a href="' + waUrl(c.name) + '" target="_blank" rel="noopener">Tanya WA &rarr;</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }
  renderStock();

  document.querySelectorAll('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-filter]').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      currentCat = btn.getAttribute('data-filter');
      renderStock();
    });
  });

  document.querySelectorAll('[data-trans]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('[data-trans]').forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      currentTrans = btn.getAttribute('data-trans');
      renderStock();
    });
  });

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
        lenis.scrollTo(el, { offset: 0 });
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
