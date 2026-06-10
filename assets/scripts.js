// Shared scripts for Kenniz portfolio.

(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
        if (iconOpen && iconClose) {
          iconOpen.classList.remove('hidden');
          iconClose.classList.add('hidden');
        }
      })
    );
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  const works = document.querySelectorAll('[data-work]');
  const filters = document.querySelectorAll('[data-filter]');
  if (filters.length && works.length) {
    const setActive = (btn, active) => {
      // Active = primary button; inactive = ghost chip.
      btn.classList.toggle('btn', active);
      btn.classList.toggle('btn-primary', active);
      btn.classList.toggle('!py-2', active);
      btn.classList.toggle('!px-4', active);
      btn.classList.toggle('!text-sm', active);
      btn.classList.toggle('chip-tool', !active);
      btn.classList.toggle('cursor-pointer', !active);
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
})();
