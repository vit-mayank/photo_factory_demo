/* Photo Factory Nepal — demo site interactions (vanilla JS) */
(() => {
  'use strict';

  /* ===== Central configuration — edit contact details here ===== */
  const CONFIG = {
    // Number taken from the public Instagram bio (@photofactory_nepal). Confirm it is WhatsApp-enabled.
    whatsappNumber: '9779851034281',   // international format, digits only
    phoneDisplay: '+977 985-1034281',
    instagramUrl: 'https://www.instagram.com/photofactory_nepal/',
    facebookUrl: 'https://www.facebook.com/photofactorynp/',
    defaultMessage: "Hi Photo Factory Nepal, I'm interested in your photography and cinematography services. I'd like to enquire about availability for my event."
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const waLink = text => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

  /* ===== Apply config to links ===== */
  $$('[data-wa]').forEach(a => a.href = waLink(CONFIG.defaultMessage));
  $$('[data-tel]').forEach(a => {
    a.href = 'tel:+' + CONFIG.whatsappNumber;
    if (a.closest('.foot-contact')) a.textContent = CONFIG.phoneDisplay;
  });
  $$('[data-instagram]').forEach(a => a.href = CONFIG.instagramUrl);
  $$('[data-facebook]').forEach(a => a.href = CONFIG.facebookUrl);
  $('#year').textContent = new Date().getFullYear();

  /* ===== Header state & mobile menu ===== */
  const header = $('.site-header');
  const toggle = $('.menu-toggle');
  const nav = $('#site-nav');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = open => {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); toggle.focus(); } });
  window.matchMedia('(min-width:961px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ===== Active nav link ===== */
  const links = $$('.site-nav li a');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'portfolio', 'services', 'story', 'contact'].forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });

    /* ===== Reveal on scroll ===== */
    const io = new IntersectionObserver((entries, o) => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); o.unobserve(en.target); }
    }), { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    $$('.reveal').forEach(el => io.observe(el));

    /* ===== Floating WhatsApp (mobile) ===== */
    const float = $('.wa-float');
    const hero = $('#home'), cta = $('#contact');
    const state = { hero: true, cta: false };
    const upd = () => float.classList.toggle('show', !state.hero && !state.cta);
    new IntersectionObserver(([e]) => { state.hero = e.isIntersecting; upd(); }, { threshold: .6 }).observe(hero);
    new IntersectionObserver(([e]) => { state.cta = e.isIntersecting; upd(); }, { threshold: .1 }).observe(cta);
  } else {
    $$('.reveal').forEach(el => el.classList.add('in'));
  }

  /* ===== Lightbox ===== */
  const dlg = $('#lightbox');
  const items = $$('#gallery a');
  if (dlg && typeof dlg.showModal === 'function' && items.length) {
    const img = $('.lb-stage img', dlg), cap = $('.lb-cap', dlg), count = $('.lb-count', dlg);
    let idx = 0, opener = null;

    const show = i => {
      idx = (i + items.length) % items.length;
      const a = items[idx], thumb = $('img', a);
      img.classList.add('loading');
      const next = new Image();
      next.onload = () => { img.src = next.src; img.classList.remove('loading'); };
      next.onerror = () => { img.classList.remove('loading'); };
      next.src = a.href;
      img.alt = thumb.alt;
      cap.textContent = a.dataset.caption || '';
      count.textContent = `${idx + 1} / ${items.length}`;
      [idx + 1, idx - 1].forEach(n => { new Image().src = items[(n + items.length) % items.length].href; });
    };
    const open = i => {
      opener = items[i];
      if (!dlg.open) dlg.showModal();
      document.documentElement.classList.add('lb-open');
      show(i);
    };
    const close = () => dlg.open && dlg.close();

    items.forEach((a, i) => a.addEventListener('click', e => { e.preventDefault(); open(i); }));
    $('.lb-close', dlg).addEventListener('click', close);
    $('.lb-prev', dlg).addEventListener('click', () => show(idx - 1));
    $('.lb-next', dlg).addEventListener('click', () => show(idx + 1));
    dlg.addEventListener('close', () => { document.documentElement.classList.remove('lb-open'); opener && opener.focus(); });
    dlg.addEventListener('click', e => { if (e.target === dlg || e.target.classList.contains('lb-stage')) close(); });
    dlg.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });

    // swipe
    let sx = null, sy = 0;
    const stage = $('.lb-stage', dlg);
    stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointerup', e => {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
    stage.addEventListener('pointercancel', () => { sx = null; });
  }

  /* ===== Enquiry form -> WhatsApp ===== */
  const form = $('#enquiry');
  if (form) {
    const status = $('#form-status');
    const date = $('#f-date');
    date.min = new Date().toISOString().split('T')[0];
    const required = $$('[required]', form);

    const clearErr = f => { const w = f.closest('.field'); w.classList.remove('invalid'); f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); const e = $('.err', w); if (e) e.remove(); };
    required.forEach(f => f.addEventListener('input', () => clearErr(f)));

    form.addEventListener('submit', e => {
      e.preventDefault();
      let first = null;
      required.forEach(f => {
        clearErr(f);
        if (!f.value.trim()) {
          const w = f.closest('.field'), msg = document.createElement('span');
          msg.className = 'err'; msg.id = f.id + '-err'; msg.textContent = 'Please complete this field.';
          w.classList.add('invalid'); w.appendChild(msg);
          f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', msg.id);
          first = first || f;
        }
      });
      if (first) {
        status.classList.add('error'); status.textContent = 'Please complete the highlighted fields.'; first.focus(); return;
      }
      status.classList.remove('error');
      const d = new Date(date.value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const note = $('#f-msg').value.trim();
      const text = `Hi Photo Factory Nepal, I'm ${$('#f-name').value.trim()}. I'd like to enquire about ${$('#f-type').value} photography/cinematography on ${d}.` + (note ? `\n\n${note}` : '');
      status.textContent = 'Opening WhatsApp in a new tab — press send there to share your enquiry.';
      window.open(waLink(text), '_blank', 'noopener');
    });
  }
})();
