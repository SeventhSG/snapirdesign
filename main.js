/* Snapir Design BG: language switching, navigation, reveals, contact form. */
'use strict';

const FORMSPREE_ID = 'xvzvbebr';
const CONTACT_EMAIL = 'snapirdesignbg@gmail.com';
const I18N = window.SNAPIR_I18N;
const LANGS = ['en', 'bg', 'tr', 'he'];

let currentLang = 'en';
const t = key => I18N[currentLang][key] ?? I18N.en[key] ?? '';

function pickLanguage() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem('snapir-lang');
    if (LANGS.includes(saved)) return saved;
  } catch { /* storage can be blocked; English is the fallback */ }
  return 'en';
}

function setLanguage(lang) {
  currentLang = lang;
  const root = document.documentElement;
  root.lang = lang;
  root.dir = lang === 'he' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => { el.alt = t(el.dataset.i18nAlt); });
  document.querySelectorAll('.lang button').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
  });

  document.title = t('meta.title');
  document.querySelector('meta[name="description"]').content = t('meta.description');

  /* Visible validation messages follow the language too. */
  document.querySelectorAll('.field-error:not([hidden])').forEach(el => { el.textContent = t(el.dataset.key); });

  try { localStorage.setItem('snapir-lang', lang); } catch { /* see pickLanguage */ }
}

function initLanguage() {
  document.querySelectorAll('.lang button').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });
  setLanguage(pickLanguage());
}

function initNav() {
  const nav = document.getElementById('nav');
  new IntersectionObserver(([entry]) => {
    nav.classList.toggle('past-hero', !entry.isIntersecting);
  }, { rootMargin: `-${nav.offsetHeight + 120}px 0px 0px 0px` }).observe(document.querySelector('.hero-pin'));

  const links = document.querySelectorAll('.nav-links a');
  const active = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => active.observe(section));
}

function initMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');

  function setOpen(open) {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    document.getElementById('nav').classList.toggle('menu-open', open);
  }

  btn.addEventListener('click', () => setOpen(menu.hidden));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 1241px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
}

function initReveals() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const formError = document.getElementById('form-error');
  const submit = form.querySelector('button[type="submit"]');

  function setFieldError(input, key) {
    const error = document.getElementById(`${input.id}-error`);
    if (key) {
      error.dataset.key = key;
      error.textContent = t(key);
    }
    error.hidden = !key;
    input.toggleAttribute('aria-invalid', Boolean(key));
    if (key) input.setAttribute('aria-invalid', 'true');
  }

  function validate() {
    const checks = [
      [form.elements.name, value => value ? null : 'contact.error.name'],
      [form.elements.email, value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'contact.error.email'],
      [form.elements.message, value => value ? null : 'contact.error.message']
    ];
    let firstInvalid = null;
    for (const [input, rule] of checks) {
      const key = rule(input.value.trim());
      setFieldError(input, key);
      if (key && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function showSendError() {
    const link = document.createElement('a');
    link.href = `mailto:${CONTACT_EMAIL}`;
    link.textContent = CONTACT_EMAIL;
    formError.replaceChildren(`${t('contact.error.send')} `, link, '.');
    formError.hidden = false;
  }

  ['name', 'email', 'message'].forEach(name => {
    form.elements[name].addEventListener('input', e => setFieldError(e.target, null));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    formError.hidden = true;
    if (!validate()) return;

    submit.disabled = true;
    submit.textContent = t('contact.sending');

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      if (!res.ok) throw new Error(`Formspree responded ${res.status}`);
      form.hidden = true;
      success.hidden = false;
      success.focus();
      form.reset();
    } catch {
      showSendError();
    } finally {
      submit.disabled = false;
      submit.textContent = t('contact.submit');
    }
  });
}

initLanguage();
initNav();
initMenu();
initReveals();
initContactForm();
