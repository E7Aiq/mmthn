document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroWordReveal();
  initFadeUp();
  initScrollReveal();
  initCardTilt();
  initAccordions();
  initStatsCounter();
  initScrollProgress();
});

/* ────────────────────────────────────────────
   1. NAVIGATION — smart sticky + auto-hide
──────────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const overlay = document.querySelector('.nav__overlay');

  if (!nav) return;

  let lastY = window.scrollY;
  let ticking = false;

  function updateNav() {
    const currentY = window.scrollY;
    const scrolled = currentY > 50;

    nav.classList.toggle('is-scrolled', scrolled);

    // Hide nav when scrolling down, reveal when scrolling up
    if (currentY > lastY && currentY > 200 && !overlay?.classList.contains('is-open')) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }

    lastY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });

  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.classList.toggle('is-open');
      overlay.classList.toggle('is-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', isOpen);
      // Ensure nav is always visible when menu is open
      nav.classList.remove('nav--hidden');
    });

    overlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__overlay-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });
}

/* ────────────────────────────────────────────
   2. HERO — Cinematic word-by-word clip reveal
──────────────────────────────────────────── */
function initHeroWordReveal() {
  const headline = document.querySelector('.hero__headline');
  if (!headline) return;

  // Split words preserving HTML structure
  function splitWords(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const fragment = document.createDocumentFragment();
      const parts = text.split(/(\s+)/);
      parts.forEach(part => {
        if (/\s+/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
        } else if (part) {
          const wrap = document.createElement('span');
          wrap.className = 'word-wrap';
          const word = document.createElement('span');
          word.className = 'word';
          word.textContent = part;
          wrap.appendChild(word);
          fragment.appendChild(wrap);
        }
      });
      node.parentNode.replaceChild(fragment, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'SPAN') {
      // Recurse into element children
      Array.from(node.childNodes).forEach(child => splitWords(child));
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
      // Wrap span content too (like .lime-underline)
      Array.from(node.childNodes).forEach(child => splitWords(child));
    }
  }

  Array.from(headline.childNodes).forEach(child => splitWords(child));

  // Animate all words with staggered delays
  const words = headline.querySelectorAll('.word');
  let baseDelay = 120; // ms after page load

  words.forEach((word, i) => {
    setTimeout(() => {
      word.classList.add('is-revealed');
    }, baseDelay + i * 80);
  });

  // Fade in headline's non-word siblings sequentially
  const heroContent = document.querySelector('.hero__content');
  if (heroContent) {
    const fadeItems = heroContent.querySelectorAll('.fade-up');
    fadeItems.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('is-visible');
      }, 300 + i * 150);
    });
  }
}

/* ────────────────────────────────────────────
   3. SCROLL REVEAL — fade-up via IntersectionObserver
──────────────────────────────────────────── */
function initFadeUp() {
  const elements = document.querySelectorAll('.fade-up');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

  elements.forEach(el => observer.observe(el));
}

function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
        setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -48px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ────────────────────────────────────────────
   4. CARD TILT — 3D magnetic hover for cards
──────────────────────────────────────────── */
function initCardTilt() {
  const cards = document.querySelectorAll('.path-card, .benefit-card, .step, .vision-item');
  if (!cards.length) return;

  const TILT_MAX = 10; // degrees
  const SCALE = 1.03;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      const rotX = -dy * TILT_MAX;
      const rotY = dx * TILT_MAX;

      card.style.transform =
        `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE})`;
      card.style.transition = 'transform 0.08s linear, box-shadow 0.2s ease';
      card.style.boxShadow = `
        ${-rotY * 1.5}px ${rotX * 1.5}px 30px rgba(14, 14, 18, 0.15),
        0 8px 24px rgba(198, 241, 53, 0.1)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease';
    });
  });
}

/* ────────────────────────────────────────────
   5. ACCORDIONS
──────────────────────────────────────────── */
function initAccordions() {
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const isOpen = item.classList.contains('is-open');

      const parent = item.closest('.accordion');
      if (parent?.dataset.single !== 'false') {
        parent?.querySelectorAll('.accordion__item.is-open').forEach(open => {
          if (open !== item) {
            open.classList.remove('is-open');
            open.querySelector('.accordion__trigger')?.setAttribute('aria-expanded', 'false');
          }
        });
      }

      item.classList.toggle('is-open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen);
    });
  });
}

/* ────────────────────────────────────────────
   6. STATS COUNTER
──────────────────────────────────────────── */
function initStatsCounter() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const isPercent = el.dataset.percent === 'true';
        animateCount(el, target, 1500, prefix, suffix, isPercent);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCount(el, target, duration = 1500, prefix = '', suffix = '', isPercent = false) {
  const start = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(easeOutQuart(progress) * target);

    if (isPercent) {
      el.textContent = prefix + value.toLocaleString('ar-SA') + '%';
    } else {
      el.textContent = prefix + value.toLocaleString('ar-SA') + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/* ────────────────────────────────────────────
   7. SCROLL PROGRESS BAR
──────────────────────────────────────────── */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ────────────────────────────────────────────
   8. CELEBRATION + SUCCESS STATE (called from forms.js)
──────────────────────────────────────────── */
function triggerCelebration() {
  if (typeof confetti !== 'function') return;
  const colors = ['#C6F135', '#0E0E12', '#E84C1E', '#ffffff'];

  // Initial burst
  confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 }, colors });

  // Side cannons
  setTimeout(() => confetti({ particleCount: 80, angle: 60,  spread: 70, origin: { x: 0, y: 0.6 }, colors }), 300);
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors }), 500);

  // Finale shower
  setTimeout(() => confetti({ particleCount: 200, spread: 160, origin: { y: 0.3 }, colors, gravity: 0.6 }), 800);
}

function showSuccessState(formElement, storageKey) {
  triggerCelebration();

  formElement.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  formElement.style.opacity = '0';
  formElement.style.transform = 'scale(0.95) translateY(-20px)';
  formElement.style.filter = 'blur(4px)';

  setTimeout(() => {
    if (storageKey) localStorage.setItem(storageKey, 'true');

    formElement.parentElement.innerHTML = `
      <div class="success-state">
        <div class="success-state__ring">
          <div class="success-state__circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
        <h2 class="success-state__title">تم التسجيل بنجاح!</h2>
        <p class="success-state__subtitle">شكراً لانضمامك إلى ممتهن — سنتواصل معك قريباً.</p>
        <div class="success-state__divider"></div>
        <p class="success-state__note">تابعنا على منصاتنا للبقاء على اطلاع بآخر المستجدات</p>
      </div>
    `;
  }, 500);
}

// Export for ES module forms.js to use
if (typeof window !== 'undefined') {
  window.showSuccessState = showSuccessState;
  window.triggerCelebration = triggerCelebration;
}
