document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /** Mobile nav toggle */
  const toggle = document.querySelector('.mobile-nav-toggle');
  const icon = toggle && toggle.querySelector('i');
  function toggleNav(force) {
    const open = document.body.classList.toggle('mobile-nav-active', force);
    if (icon) icon.className = open ? 'bi bi-x' : 'bi bi-list';
  }
  if (toggle) toggle.addEventListener('click', () => toggleNav());
  document
    .querySelectorAll('#navbar a')
    .forEach((a) => a.addEventListener('click', () => toggleNav(false)));
  const navbar = document.getElementById('navbar');
  if (navbar)
    navbar.addEventListener('click', (e) => {
      if (e.target === navbar) toggleNav(false);
    });

  /** AOS */
  if (window.AOS) {
    AOS.init({ duration: 900, easing: 'ease-in-out', once: true, offset: 30 });
    window.addEventListener('load', () => AOS.refresh());
  }

  /** Projects swiper */
  let projSwiper = null;
  if (window.Swiper) {
    projSwiper = new Swiper('.projects-slider', {
      speed: 600,
      rewind: true,
      watchOverflow: false,
      slidesPerView: 1,
      spaceBetween: 20,
      navigation: { nextEl: '.proj-next', prevEl: '.proj-prev' },
      breakpoints: { 992: { slidesPerView: 2, spaceBetween: 40 } },
    });
  }

  /** Swipe hint (mobile): shows briefly when the slider enters the viewport */
  const hint = document.querySelector('.swipe-hint');
  if (hint) {
    const hideHint = () => hint.classList.remove('show');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        hint.classList.add('show');
        setTimeout(hideHint, 3000);
        io.disconnect();
      },
      { threshold: 0.6 },
    );
    io.observe(hint.parentElement);
    if (projSwiper) projSwiper.on('touchStart', hideHint);
  }

  /** Project cards: tap toggles the hover state on touch devices */
  const cards = document.querySelectorAll('.project-card');
  cards.forEach((card) =>
    card.addEventListener('click', (e) => {
      if (!window.matchMedia('(hover: none)').matches || e.target.closest('a')) return;
      const wasActive = card.classList.contains('is-active');
      cards.forEach((c) => c.classList.remove('is-active'));
      if (!wasActive) card.classList.add('is-active');
    }),
  );

  /** Scroll hint: fade out while scrolling the hero */
  const scrollHint = document.querySelector('.scroll-down');
  if (scrollHint) {
    const fade = () => {
      const p = Math.min(window.scrollY / (window.innerHeight * 0.5), 1);
      scrollHint.style.opacity = 1 - p;
      scrollHint.style.setProperty('--sd-shift', p * 20 + 'px');
      scrollHint.style.pointerEvents = p >= 1 ? 'none' : '';
    };
    window.addEventListener('scroll', fade, { passive: true });
    window.addEventListener('resize', fade);
    fade();
  }

  /** Scroll-spy: highlight the current section in the menu */
  const links = [...document.querySelectorAll('#navbar a')];
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting)
          links.forEach((l) => l.classList.toggle('active', l.hash === '#' + e.target.id));
      }),
    { rootMargin: '-45% 0px -50% 0px' },
  );
  [document.getElementById('hero'), ...links.map((l) => document.querySelector(l.hash))].forEach(
    (s) => s && spy.observe(s),
  );

  /** Timeline: fill line + dates on scroll, boxes appear gradually */
  const timeline = document.getElementById('timeline');
  if (timeline) {
    const fill = timeline.querySelector('.tl-fill');
    const items = [...timeline.querySelectorAll('.tl-item')];
    const desktop = window.matchMedia('(min-width: 1200px)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const EASE = 0.12;
    let target = 0,
      current = 0,
      raf = null;

    const tick = () => {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.5) current = target;
      fill.style.height = current + 'px';
      items.forEach((item) => {
        const dotY = item.offsetTop + (desktop.matches ? item.offsetHeight / 2 : 14);
        const reached = current >= dotY;
        item.classList.toggle('show', reached);
        item.classList.toggle('active', reached);
      });
      raf = current === target ? null : requestAnimationFrame(tick);
    };

    const update = () => {
      const rect = timeline.getBoundingClientRect();
      target = Math.min(Math.max(window.innerHeight * 0.6 - rect.top, 0), rect.height);
      if (reduce) current = target;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
});
