/* 안내 페이지(치료·검사별 페이지)용 스크립트: 머리말 그림자와 모바일 메뉴만 다룬다.
   첫 화면(index.html)은 script.js를 쓴다. */
(function () {
  const headerEl = document.querySelector('.site-header');
  const nav = document.getElementById('site-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!headerEl || !nav || !toggle) return;
  const label = toggle.querySelector('.sr-only');
  const icon = toggle.querySelector('use');

  const onScroll = () => headerEl.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = open => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? '메뉴 닫기' : '메뉴 열기';
    if (icon) icon.setAttribute('href', open ? '#i-close' : '#i-menu');
  };

  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
})();
