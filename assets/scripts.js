// Kenniz — shared scripts. All behaviors guarded against missing nodes.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------- year stamp --------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -------- mobile menu --------
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const opening = menu.classList.contains('hidden');
      menu.classList.toggle('hidden', !opening);
      toggle.setAttribute('aria-expanded', String(opening));
      toggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
      if (iconOpen && iconClose) {
        iconOpen.classList.toggle('hidden', opening);
        iconClose.classList.toggle('hidden', !opening);
      }
    });
    menu.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
        iconOpen?.classList.remove('hidden');
        iconClose?.classList.add('hidden');
      })
    );
  }

  // -------- scroll progress bar --------
  const progress = document.getElementById('progress-bar');
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
      progress.style.width = pct + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // -------- reveal on scroll --------
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // -------- animated counters --------
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = prefix + value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => {
      const v = parseFloat(el.dataset.count);
      const d = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = (el.dataset.prefix || '') + v.toFixed(d) + (el.dataset.suffix || '');
    });
  }

  // -------- typing effect --------
  const typingEl = document.querySelector('[data-typing]');
  if (typingEl && !reduceMotion) {
    const words = JSON.parse(typingEl.dataset.typing || '[]');
    if (words.length) {
      let wi = 0, ci = 0, deleting = false;
      const tick = () => {
        const word = words[wi];
        if (!deleting) {
          ci++;
          typingEl.textContent = word.slice(0, ci);
          if (ci === word.length) { deleting = true; setTimeout(tick, 1800); return; }
        } else {
          ci--;
          typingEl.textContent = word.slice(0, ci);
          if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
        }
        setTimeout(tick, deleting ? 40 : 90);
      };
      tick();
    }
  } else if (typingEl) {
    const words = JSON.parse(typingEl.dataset.typing || '[]');
    if (words[0]) typingEl.textContent = words[0];
    typingEl.classList.remove('typing');
  }

  // -------- mouse spotlight on hero / spotlight hosts --------
  if (!reduceMotion) {
    document.querySelectorAll('.spotlight-host').forEach((host) => {
      host.addEventListener('mousemove', (e) => {
        const rect = host.getBoundingClientRect();
        host.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        host.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  // -------- button shimmer follow --------
  if (!reduceMotion) {
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        btn.style.setProperty('--my', `${e.clientY - rect.top}px`);
      });
    });
  }

  // -------- magnetic buttons --------
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-magnet]').forEach((btn) => {
      const strength = 0.25;
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // -------- 3D tilt cards --------
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.classList.add('tilt');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--tx', `${x * 8}deg`);
        card.style.setProperty('--ty', `${-y * 8}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--tx', '0deg');
        card.style.setProperty('--ty', '0deg');
      });
    });
  }

  // -------- floating particles (background) --------
  if (!reduceMotion) {
    const layer = document.getElementById('particles');
    if (layer) {
      const count = window.innerWidth < 640 ? 10 : 24;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = 16 + Math.random() * 18 + 's';
        p.style.animationDelay = -Math.random() * 30 + 's';
        p.style.opacity = (0.3 + Math.random() * 0.7).toString();
        layer.appendChild(p);
      }
    }
  }

  // -------- work-filter --------
  const works = document.querySelectorAll('[data-work]');
  const filters = document.querySelectorAll('[data-filter]');
  if (filters.length && works.length) {
    const setActive = (btn, active) => {
      btn.classList.toggle('btn', active);
      btn.classList.toggle('btn-primary', active);
      btn.classList.toggle('!py-2', active);
      btn.classList.toggle('!px-4', active);
      btn.classList.toggle('!text-sm', active);
      btn.classList.toggle('chip-tool', !active);
    };
    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-filter');
        filters.forEach((b) => setActive(b, b === btn));
        works.forEach((card) => {
          const tags = (card.getAttribute('data-work') || '').split(',');
          const show = target === 'all' || tags.includes(target);
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // -------- case-study modals --------
  const modalOverlay = document.getElementById('case-modal');
  const modalContent = document.getElementById('case-modal-content');
  if (modalOverlay && modalContent) {
    const close = () => modalOverlay.classList.remove('is-open');
    document.querySelectorAll('[data-case]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const tpl = card.querySelector('template[data-case-detail]');
        modalContent.innerHTML = tpl ? tpl.innerHTML : card.innerHTML;
        modalOverlay.classList.add('is-open');
      });
    });
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    modalOverlay.querySelector('[data-close]')?.addEventListener('click', close);
  }

  // -------- ROI calculator --------
  const roiRoot = document.getElementById('roi');
  if (roiRoot) {
    const hoursEl = roiRoot.querySelector('[data-roi-hours]');
    const rateEl = roiRoot.querySelector('[data-roi-rate]');
    const weeklyOut = roiRoot.querySelector('[data-roi-weekly]');
    const yearlyOut = roiRoot.querySelector('[data-roi-yearly]');
    const breakOut = roiRoot.querySelector('[data-roi-break]');
    const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const compute = () => {
      const hours = Math.max(0, parseFloat(hoursEl.value) || 0);
      const rate = Math.max(0, parseFloat(rateEl.value) || 0);
      const weekly = hours * rate;
      const yearly = weekly * 52;
      const startingPrice = 1200;
      const breakEven = weekly > 0 ? Math.ceil(startingPrice / weekly) : Infinity;
      if (weeklyOut) weeklyOut.textContent = fmt(weekly);
      if (yearlyOut) yearlyOut.textContent = fmt(yearly);
      if (breakOut) breakOut.textContent = isFinite(breakEven) ? `${breakEven} weeks` : '—';
    };
    [hoursEl, rateEl].forEach((el) => el?.addEventListener('input', compute));
    compute();
  }

  // -------- copy-to-clipboard --------
  const toast = document.getElementById('toast');
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-shown');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('is-shown'), 1800);
  };
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied ' + text);
      } catch {
        showToast('Could not copy');
      }
    });
  });
})();
