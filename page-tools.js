/* Global navigation aid, independent of each activity's learning state. */
(() => {
  'use strict';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'page-top';
  button.hidden = true;
  button.setAttribute('aria-label', '페이지 맨 위로 이동');
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14M6 13l6-6 6 6M12 7v14"/></svg><span>맨 위</span>';
  document.body.append(button);
  let pending = false;
  const refresh = () => {
    pending = false;
    button.hidden = window.scrollY < 280 || !!document.fullscreenElement;
  };
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(refresh); } };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  document.addEventListener('fullscreenchange', schedule);
  button.addEventListener('click', () => {
    document.getElementById('brandHome')?.focus({preventScroll:true});
    window.scrollTo({top:0, behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  refresh();
})();
