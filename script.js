/* Ahmed Shabayek — portfolio. Plain JS, no dependencies. Shared by / and /ar/.
   Text that changes per language is read from data-* attributes in the markup,
   so this file holds no English or Arabic strings. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Theme toggle ---------- */
  var themeBtn = document.querySelector('.theme-btn');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return systemDark.matches ? 'dark' : 'light';
  }

  /* The button's label names the mode it switches TO. */
  function updateThemeLabel() {
    if (!themeBtn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    var label = themeBtn.getAttribute('data-label-' + next);
    if (label) themeBtn.setAttribute('aria-label', label);
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage may be blocked */ }
      updateThemeLabel();
    });
    systemDark.addEventListener('change', updateThemeLabel);
    updateThemeLabel();
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var navList = document.getElementById('nav-list');

  function closeMenu() {
    if (!menuBtn || !navList) return;
    navList.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuBtn && navList) {
    menuBtn.addEventListener('click', function () {
      var open = navList.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navList.classList.contains('open')) { closeMenu(); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.site-nav')) closeMenu();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Current section in nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    var active = null;
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        /* Back in the hero: no section is current, so the highlight is cleared. */
        if (entry.isIntersecting) active = entry.target.classList.contains('hero') ? null : entry.target.id;
      });
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { so.observe(s); });
    var heroTop = document.querySelector('.hero');
    if (heroTop) so.observe(heroTop);
  }

  /* ---------- Film poster ----------
     Phones play the vertical cut (see the <source media> in the markup), so they get the vertical poster too. */
  var film = document.querySelector('.film video[data-poster-tall]');
  if (film && window.matchMedia('(max-width: 600px)').matches) film.poster = film.getAttribute('data-poster-tall');

  /* ---------- Floating WhatsApp button ----------
     Hidden while the hero is on screen (it has its own WhatsApp button) and
     while the contact card is on screen (so it never covers the contact links). */
  var fab = document.querySelector('.wa-fab');
  var hero = document.querySelector('.hero');
  var contact = document.getElementById('contact');
  if (fab && hero && 'IntersectionObserver' in window) {
    var heroVisible = true;
    var contactVisible = false;
    var syncFab = function () {
      var show = !heroVisible && !contactVisible;
      fab.classList.toggle('show', show);
      /* Keep it out of the tab order and the accessibility tree while hidden. */
      if (show) { fab.removeAttribute('tabindex'); fab.removeAttribute('aria-hidden'); }
      else { fab.setAttribute('tabindex', '-1'); fab.setAttribute('aria-hidden', 'true'); }
    };
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === hero) heroVisible = entry.isIntersecting;
        else contactVisible = entry.isIntersecting;
      });
      syncFab();
    }, { threshold: 0.05 });
    fo.observe(hero);
    if (contact) fo.observe(contact);
    syncFab();
  }
})();
