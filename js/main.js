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
            '<div class="car__img"><img src="' + c.img + '" alt="' + c.name + '" width="640" height="440" loading="lazy"></div>' +
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
      var src = 'assets/img/serah-terima/serah-terima-' + n + '.webp';
      out +=
        '<button type="button" class="handover__item js-lb' + (i > INITIAL ? ' is-hidden' : '') + '" data-src="' + src + '" data-title="Serah Terima Garasi 05 #' + n + '">' +
          '<img src="' + src + '" alt="Serah terima unit Garasi 05 #' + n + '" width="540" height="675" loading="lazy">' +
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

  // ---------- Halaman Artikel & Single Post ----------
  var ARTICLES = window.GARASI_ARTICLES || [];
  var articleGrid = document.getElementById('articleGrid');
  var featuredArticle = document.getElementById('featuredArticle');
  var articleSearch = document.getElementById('articleSearch');
  var articleCats = document.getElementById('articleCats');

  function buildArticleCard(a) {
    var href = 'artikel-detail.html?slug=' + encodeURIComponent(a.slug);
    return (
      '<article class="car article-card">' +
        '<a href="' + href + '" class="car__media-wrap">' +
          '<div class="car__img"><img src="' + a.img + '" alt="' + a.title + '" width="640" height="440" loading="lazy"></div>' +
        '</a>' +
        '<div class="car__body">' +
          '<div class="article-meta">' +
            '<span class="article-cat">' + a.category + '</span>' +
            '<span>' + a.date + ' &bull; ' + a.readTime + '</span>' +
          '</div>' +
          '<h3 class="car__title article-title"><a href="' + href + '">' + a.title + '</a></h3>' +
          '<p class="article-excerpt">' + a.excerpt + '</p>' +
          '<div class="car__footer">' +
            '<span class="article-author">' + a.author + '</span>' +
            '<a href="' + href + '" class="btn-card-red">Baca <span>&rarr;</span></a>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }

  if (articleGrid && ARTICLES.length) {
    var activeCat = 'all';
    var renderArticles = function () {
      var q = articleSearch ? articleSearch.value.trim().toLowerCase() : '';
      var list = ARTICLES.filter(function (a) {
        if (activeCat !== 'all' && a.category !== activeCat) return false;
        if (q && (a.title + ' ' + a.category + ' ' + a.excerpt).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });

      if (featuredArticle) {
        if (activeCat === 'all' && !q && list.length) {
          var f = list[0];
          var fHref = 'artikel-detail.html?slug=' + encodeURIComponent(f.slug);
          featuredArticle.innerHTML =
            '<article class="featured-post">' +
              '<a href="' + fHref + '" class="featured-post__media">' +
                '<img src="' + f.img + '" alt="' + f.title + '" width="800" height="520">' +
              '</a>' +
              '<div class="featured-post__body">' +
                '<div class="article-meta">' +
                  '<span class="article-cat">' + f.category + '</span>' +
                  '<span>' + f.date + ' &bull; ' + f.readTime + '</span>' +
                '</div>' +
                '<h2><a href="' + fHref + '">' + f.title + '</a></h2>' +
                '<p>' + f.excerpt + '</p>' +
                '<a href="' + fHref + '" class="btn-primary-red"><span>Baca Selengkapnya</span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h12m0 0-4-4m4 4-4 4"/></svg></a>' +
              '</div>' +
            '</article>';
          list = list.slice(1);
        } else {
          featuredArticle.innerHTML = '';
        }
      }

      if (!list.length && (!featuredArticle || !featuredArticle.innerHTML)) {
        articleGrid.innerHTML = '<div class="stock-empty">Tidak ada artikel yang cocok dengan pencarian Anda.</div>';
      } else {
        articleGrid.innerHTML = list.map(buildArticleCard).join('');
      }
    };

    if (articleCats) {
      articleCats.addEventListener('click', function (e) {
        var btn = e.target.closest('.cat-pill');
        if (!btn) return;
        articleCats.querySelectorAll('.cat-pill').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        activeCat = btn.getAttribute('data-cat') || 'all';
        renderArticles();
      });
    }
    if (articleSearch) articleSearch.addEventListener('input', renderArticles);
    renderArticles();
  }

  // ---------- Single Post Detail ----------
  var singlePost = document.getElementById('singlePost');
  if (singlePost && ARTICLES.length) {
    var sp = new URLSearchParams(window.location.search);
    var slug = sp.get('slug');
    var post = ARTICLES.find(function (a) { return a.slug === slug; }) || ARTICLES[0];
    document.title = post.title + ' — Garasi 05';

    var crumbTitle = document.getElementById('crumbTitle');
    if (crumbTitle) crumbTitle.textContent = post.title;

    var bodyHtml = (post.content || []).map(function (blk) {
      if (blk.type === 'h2') return '<h2>' + blk.text + '</h2>';
      if (blk.type === 'ul') return '<ul>' + blk.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</ul>';
      if (blk.type === 'tip') return '<div class="post-tip"><strong>Tips Garasi 05:</strong> ' + blk.text + '</div>';
      return '<p>' + blk.text + '</p>';
    }).join('');

    singlePost.innerHTML =
      '<div class="post-header">' +
        '<div class="article-meta">' +
          '<span class="article-cat">' + post.category + '</span>' +
          '<span>' + post.date + ' &bull; ' + post.readTime + '</span>' +
        '</div>' +
        '<h1 class="post-title">' + post.title + '</h1>' +
        '<p class="post-author">Ditulis oleh <strong>' + post.author + '</strong></p>' +
      '</div>' +
      '<div class="post-cover"><img src="' + post.img + '" alt="' + post.title + '" width="960" height="540"></div>' +
      '<div class="post-body">' + bodyHtml + '</div>' +
      '<div class="post-footer-cta">' +
        '<div><strong>Butuh bantuan lebih lanjut?</strong><span>Tanyakan unit atau simulasi kredit langsung ke tim kami.</span></div>' +
        '<a href="' + waUrl(post.title) + '" target="_blank" rel="noopener" class="btn-primary-red"><span>Tanya via WhatsApp</span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10h12m0 0-4-4m4 4-4 4"/></svg></a>' +
      '</div>';

    var others = ARTICLES.filter(function (a) { return a.slug !== post.slug; });
    var sidebarArticles = document.getElementById('sidebarArticles');
    if (sidebarArticles) {
      sidebarArticles.innerHTML = others.slice(0, 4).map(function (a) {
        return '<a href="artikel-detail.html?slug=' + encodeURIComponent(a.slug) + '" class="post-side-item">' +
          '<img src="' + a.img + '" alt="' + a.title + '" width="88" height="64" loading="lazy">' +
          '<div><span>' + a.category + '</span><strong>' + a.title + '</strong></div>' +
        '</a>';
      }).join('');
    }
    var relatedArticles = document.getElementById('relatedArticles');
    if (relatedArticles) {
      relatedArticles.innerHTML = others.slice(0, 3).map(buildArticleCard).join('');
    }
  }

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
      .from('.hero__desc', { y: 12, duration: 0.65 }, 0.1)
      .from('.hero__actions', { y: 12, duration: 0.65 }, 0.2);
  }

  // Lazy-load below-the-fold videos when scrolled near viewport
  var lazyVideos = document.querySelectorAll('.js-lazy-video');
  if (lazyVideos.length && 'IntersectionObserver' in window) {
    var vidObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var v = entry.target;
          v.muted = true;
          v.preload = 'auto';
          var vp = v.play();
          if (vp && typeof vp.catch === 'function') vp.catch(function () {});
          vidObserver.unobserve(v);
        }
      });
    }, { rootMargin: '200px 0px' });
    lazyVideos.forEach(function (v) { vidObserver.observe(v); });
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
