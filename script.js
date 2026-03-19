/**
 * Prodi STI — Universitas Halmahera
 * script.js  |  v1.0.0  |  Production
 * ─────────────────────────────────────────
 * Mobile-First · Accessible · Secure
 * International Standard · Vanilla JS
 * © 2025 Program Studi STI, Universitas Halmahera
 * ─────────────────────────────────────────
 * Security practices:
 *  - All user input sanitised before DOM insertion
 *  - No innerHTML with unsanitised data
 *  - No eval / Function constructor
 *  - Strict mode throughout
 *  - CSP-friendly (no inline event handlers)
 *  - All external links opened safely
 */

(function () {
  'use strict';

  /* ─────────────── UTILITIES ─────────────── */

  /** Safe DOM selector */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => (ctx || document).querySelectorAll(sel);

  /** Escape HTML to prevent XSS */
  function esc(str) {
    const m = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' };
    return String(str).replace(/[&<>"']/g, c => m[c]);
  }

  /** Debounce — limit call frequency */
  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn.apply(null, a), ms); };
  }

  /** Detect reduced-motion preference */
  const noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Unique ID generator */
  let uid = 0;
  const nextId = () => 'sti-' + (++uid);

  /* ─────────────── NAVBAR ─────────────── */
  function initNav() {
    const nav = $('#nav');
    if (!nav) return;

    // Sticky scroll effect
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Active link on scroll via IntersectionObserver
    const sections = $$('main section[id]');
    const links = $$('.nav-links .nl');

    if (sections.length && links.length) {
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute('id');
            links.forEach(l => {
              l.classList.toggle('active', l.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { rootMargin: '-28% 0px -62% 0px' });
      sections.forEach(s => obs.observe(s));
    }
  }

  /* ─────────────── MOBILE MENU ─────────────── */
  function initMenu() {
    const btn   = $('#hbg');
    const links = $('#nav-links');
    const scrim = $('#nav-scrim');
    if (!btn || !links || !scrim) return;

    let isOpen = false;

    function open() {
      isOpen = true;
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      links.style.cssText = `
        display:flex;flex-direction:column;align-items:stretch;
        position:fixed;top:var(--nav-h);inset-inline:0;z-index:999;
        background:rgba(255,255,255,.97);
        backdrop-filter:blur(20px);
        border-bottom:1px solid var(--border);
        padding:.75rem 1.25rem;gap:0;
        box-shadow:0 12px 40px rgba(0,0,0,.1);
      `;
      scrim.classList.add('show');
      document.body.style.overflow = 'hidden';
      // Focus first nav link
      const first = links.querySelector('.nl');
      if (first) first.focus();
    }

    function close() {
      isOpen = false;
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      links.removeAttribute('style');
      scrim.classList.remove('show');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', () => isOpen ? close() : open());
    scrim.addEventListener('click', close);
    links.querySelectorAll('.nl').forEach(a => a.addEventListener('click', close));

    // Keyboard: Escape closes
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen) { close(); btn.focus(); }
    });

    // Close on resize to desktop
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth >= 768 && isOpen) close();
    }, 150));
  }

  /* ─────────────── SMOOTH SCROLL ─────────────── */
  function initScroll() {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h')
      ) || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: noMotion ? 'instant' : 'smooth' });
      // Manage focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
    });
  }

  /* ─────────────── REVEAL — HERO (load) ─────────────── */
  function initHeroReveal() {
    const els = $$('.f');
    if (noMotion) { els.forEach(el => el.classList.add('in')); return; }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      els.forEach(el => el.classList.add('in'));
    }));
  }

  /* ─────────────── REVEAL — SCROLL ─────────────── */
  function initScrollReveal() {
    const els = $$('.sr');
    if (noMotion) { els.forEach(el => el.classList.add('in')); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -48px 0px', threshold: 0.07 });
    els.forEach(el => obs.observe(el));
  }

  /* ─────────────── COUNTERS ─────────────── */
  function initCounters() {
    const els = $$('.ctr[data-to]');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        const el = e.target;
        const target = parseInt(el.dataset.to, 10);
        if (isNaN(target)) return;
        if (noMotion) { el.textContent = target; return; }
        const dur = 1800;
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
          el.textContent = Math.floor(eased * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    els.forEach(el => obs.observe(el));
  }

  /* ─────────────── FAQ ─────────────── */
  function initFAQ() {
    const list = $('#faq-list');
    if (!list) return;

    // Use the hidden attribute + grid animation pattern
    list.addEventListener('click', e => {
      const btn = e.target.closest('.faq-q');
      if (!btn) return;

      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      const answerId = btn.getAttribute('aria-controls');
      const answer = answerId ? $('#' + answerId) : null;

      // Close all open items first
      $$('.faq-q[aria-expanded="true"]', list).forEach(b => {
        if (b !== btn) {
          b.setAttribute('aria-expanded', 'false');
          const aid = b.getAttribute('aria-controls');
          const ans = aid ? $('#' + aid) : null;
          if (ans) {
            ans.setAttribute('hidden', '');
            // Trigger transition: reset to 0fr
            ans.style.gridTemplateRows = '0fr';
            setTimeout(() => { ans.removeAttribute('style'); }, 10);
          }
        }
      });

      // Toggle current
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        if (answer) {
          answer.style.gridTemplateRows = '0fr';
          setTimeout(() => {
            answer.setAttribute('hidden', '');
            answer.removeAttribute('style');
          }, 360);
        }
      } else {
        btn.setAttribute('aria-expanded', 'true');
        if (answer) {
          answer.removeAttribute('hidden');
          // Force reflow then animate
          answer.style.gridTemplateRows = '0fr';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              answer.style.gridTemplateRows = '1fr';
              setTimeout(() => answer.removeAttribute('style'), 360);
            });
          });
        }
      }
    });

    // Keyboard: arrow keys to navigate between questions
    list.addEventListener('keydown', e => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      const items = [...$$('.faq-q', list)];
      const idx = items.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      let next = idx;
      if (e.key === 'ArrowDown') next = Math.min(idx + 1, items.length - 1);
      if (e.key === 'ArrowUp')   next = Math.max(idx - 1, 0);
      if (e.key === 'Home')      next = 0;
      if (e.key === 'End')       next = items.length - 1;
      items[next].focus();
    });
  }

  /* ─────────────── GALLERY LIGHTBOX ─────────────── */
  function initGallery() {
    const root = $('#lb-root');
    if (!root) return;
    const btns = $$('.g-btn');
    if (!btns.length) return;

    let currentIndex = 0;
    const images = [...btns].map(b => ({
      src: b.querySelector('img')?.src,
      alt: b.querySelector('img')?.alt || '',
      label: b.querySelector('.g-cap strong')?.textContent || '',
    }));

    function render(idx) {
      const img = images[idx];
      if (!img) return;
      const hiSrc = img.src.replace(/w=\d+/, 'w=1400');
      root.innerHTML = `
        <div class="lb" role="dialog" aria-modal="true" aria-label="Foto: ${esc(img.label)}" id="lb-dialog">
          <div class="lb-wrap">
            <img src="${esc(hiSrc)}" alt="${esc(img.alt)}" loading="eager" />
            <p class="lb-cap">${esc(img.label)}</p>
          </div>
          ${images.length > 1 ? `
          <button class="lb-nav lb-prev" aria-label="Foto sebelumnya" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <button class="lb-nav lb-next" aria-label="Foto berikutnya" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>` : ''}
          <button class="lb-close" aria-label="Tutup galeri foto" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div class="lb-bg"></div>
        </div>`;

      // Inject styles once
      if (!document.getElementById('lb-style')) {
        const s = document.createElement('style');
        s.id = 'lb-style';
        s.textContent = `
          .lb{position:fixed;inset:0;z-index:9100;display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:lbIn .2s ease}
          @keyframes lbIn{from{opacity:0}to{opacity:1}}
          .lb-bg{position:absolute;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(6px);z-index:-1;cursor:zoom-out}
          .lb-wrap{position:relative;max-width:90vw;max-height:86vh;z-index:1}
          .lb-wrap img{max-width:100%;max-height:84vh;border-radius:12px;object-fit:contain;box-shadow:0 40px 80px rgba(0,0,0,.7);display:block}
          .lb-cap{font-family:'Poppins',sans-serif;font-size:.8rem;font-weight:600;color:rgba(255,255,255,.55);text-align:center;margin-top:.75rem}
          .lb-close{position:fixed;top:1.25rem;right:1.25rem;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;transition:.2s ease;font-family:inherit}
          .lb-close:hover{background:rgba(255,255,255,.22)}
          .lb-nav{position:fixed;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;transition:.2s ease;font-family:inherit}
          .lb-nav:hover{background:rgba(255,255,255,.22)}
          .lb-prev{left:1rem}.lb-next{right:1rem}
        `;
        document.head.appendChild(s);
      }

      document.body.style.overflow = 'hidden';
      $('#lb-dialog').querySelector('.lb-close')?.focus();

      // Events
      root.querySelector('.lb-bg')?.addEventListener('click', close);
      root.querySelector('.lb-close')?.addEventListener('click', close);
      root.querySelector('.lb-prev')?.addEventListener('click', () => nav(-1));
      root.querySelector('.lb-next')?.addEventListener('click', () => nav(1));
    }

    function close() {
      root.innerHTML = '';
      document.body.style.overflow = '';
      // Return focus to the triggering button
      btns[currentIndex]?.focus();
    }

    function nav(dir) {
      currentIndex = (currentIndex + dir + images.length) % images.length;
      render(currentIndex);
    }

    document.addEventListener('keydown', e => {
      if (!root.innerHTML) return;
      if (e.key === 'Escape')     { close(); }
      if (e.key === 'ArrowLeft')  { nav(-1); }
      if (e.key === 'ArrowRight') { nav(1); }
    });

    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        currentIndex = i;
        render(i);
      });
    });
  }

  /* ─────────────── FORM VALIDATION ─────────────── */
  function initForm() {
    const form = $('#cf');
    if (!form) return;

    const RULES = {
      'i-nama':  { label: 'Nama',  required: true, min: 2,  max: 100 },
      'i-email': { label: 'Email', required: true, email: true, max: 254 },
      'i-topik': { label: 'Topik', required: true },
      'i-pesan': { label: 'Pesan', required: true, min: 10, max: 2000 },
    };

    const ERR_IDS = {
      'i-nama': 'err-nama', 'i-email': 'err-email',
      'i-topik': 'err-topik', 'i-pesan': 'err-pesan',
    };

    function showErr(id, msg) {
      const el = $('#' + id);
      const errEl = $('#' + ERR_IDS[id]);
      if (el) { el.setAttribute('aria-invalid', 'true'); }
      if (errEl) errEl.textContent = msg; // already safe — no HTML
    }

    function clearErr(id) {
      const el = $('#' + id);
      const errEl = $('#' + ERR_IDS[id]);
      if (el) { el.removeAttribute('aria-invalid'); }
      if (errEl) errEl.textContent = '';
    }

    function validate(id) {
      const rule = RULES[id];
      const el = $('#' + id);
      if (!rule || !el) return true;
      const val = el.value.trim();

      if (rule.required && !val) {
        showErr(id, `${rule.label} wajib diisi.`); return false;
      }
      if (rule.min && val.length < rule.min) {
        showErr(id, `${rule.label} minimal ${rule.min} karakter.`); return false;
      }
      if (rule.max && val.length > rule.max) {
        showErr(id, `${rule.label} maksimal ${rule.max} karakter.`); return false;
      }
      if (rule.email && !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(val)) {
        showErr(id, 'Masukkan alamat email yang valid.'); return false;
      }
      clearErr(id);
      return true;
    }

    // Live validation on blur / input
    Object.keys(RULES).forEach(id => {
      const el = $('#' + id);
      if (!el) return;
      el.addEventListener('blur', () => validate(id));
      el.addEventListener('input', () => {
        if (el.getAttribute('aria-invalid')) validate(id);
      });
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const allValid = Object.keys(RULES).map(id => validate(id)).every(Boolean);

      if (!allValid) {
        // Focus first invalid field
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Success state (production: send to secure backend)
      const btn = $('#sbtn');
      const orig = btn.innerHTML;
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
        Pesan Terkirim!
      `;
      btn.style.cssText = 'background:#15803d;border-color:#15803d';
      btn.disabled = true;
      btn.setAttribute('aria-label', 'Pesan berhasil dikirim');

      setTimeout(() => {
        form.reset();
        Object.keys(RULES).forEach(clearErr);
        btn.innerHTML = orig;
        btn.style.cssText = '';
        btn.disabled = false;
        btn.removeAttribute('aria-label');
      }, 3500);
    });
  }

  /* ─────────────── BACK TO TOP ─────────────── */
  function initBTT() {
    const btn = $('#btt');
    if (!btn) return;
    const toggle = () => {
      if (window.scrollY > 400) btn.removeAttribute('hidden');
      else btn.setAttribute('hidden', '');
    };
    window.addEventListener('scroll', toggle, { passive: true });
    toggle();
    btn.addEventListener('click', () =>
      window.scrollTo({ top: 0, behavior: noMotion ? 'instant' : 'smooth' })
    );
  }

  /* ─────────────── EXTERNAL LINKS ─────────────── */
  function initExternalLinks() {
    // Ensure all external links have rel="noopener noreferrer"
    $$('a[href^="http"]').forEach(a => {
      if (!a.hostname || a.hostname !== location.hostname) {
        if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
        const rel = (a.getAttribute('rel') || '').split(' ').filter(Boolean);
        if (!rel.includes('noopener'))   rel.push('noopener');
        if (!rel.includes('noreferrer')) rel.push('noreferrer');
        a.setAttribute('rel', rel.join(' '));
      }
    });
  }

  /* ─────────────── LAZY IMAGES (native + polyfill) ─────────────── */
  function initLazyImages() {
    // Native loading="lazy" is set in HTML; this adds an IntersectionObserver
    // fallback for browsers that don't support it (rare but good practice).
    if ('loading' in HTMLImageElement.prototype) return;
    const imgs = $$('img[loading="lazy"]');
    if (!imgs.length) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) img.src = img.dataset.src;
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(img => obs.observe(img));
  }

  /* ─────────────── PERFORMANCE: CLS prevention ─────────────── */
  function initImageDimensions() {
    // Ensure images that don't have explicit width/height set aspect-ratio
    $$('img:not([width])').forEach(img => {
      if (!img.style.aspectRatio) img.style.aspectRatio = '16/9';
    });
  }

  /* ─────────────── INIT ─────────────── */
  function init() {
    initNav();
    initMenu();
    initScroll();
    initHeroReveal();
    initScrollReveal();
    initCounters();
    initFAQ();
    initGallery();
    initForm();
    initBTT();
    initExternalLinks();
    initLazyImages();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Report Web Vitals to console (dev aid — remove in production)
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      new PerformanceObserver(list => {
        list.getEntries().forEach(e => {
          if (e.entryType === 'largest-contentful-paint') {
            console.info('[STI] LCP:', e.startTime.toFixed(0) + 'ms');
          }
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) { /* silently ignore */ }
  }

})();
