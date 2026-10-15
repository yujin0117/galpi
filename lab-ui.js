/* Presentation shared by the two social studies laboratories. */
(() => {
  'use strict';
  const countryNames = ['갑국', '을국'];
  const trade = [
    ['생산 조건 비교', '생산비와 기회비용'], ['특화와 무역', '선택하고 교환하기'],
    ['자유 무역 실험', '내 조건으로 실험'], ['무역과 지속가능발전', '자료로 판단하기'], ['문제 연습', '7문제로 확인']
  ];
  const intervention = [['교복 담합', '경쟁과 가격'], ['공공재 공급', '혜택과 비용 부담'], ['외부 효과', '시장과 사회의 비용']];
  function icon(kind) {
    const paths = {
      question: '<path d="M8 9a4 4 0 1 1 6 3.5c-1.5 1-2 1.5-2 3"/><path d="M12 19h.01"/>',
      controls: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
      result: '<path d="M4 4v16h16M8 16v-4M13 16V8M18 16V5"/>',
      exchange: '<path d="M3 8h17l-4-4M21 16H4l4 4"/>',
      check: '<path d="m5 12 4 4L19 6"/><rect x="2" y="2" width="20" height="20" rx="5"/>'
    };
    return `<svg viewBox="0 0 24 24" class="lab-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[kind] || paths.question}</svg>`;
  }
  function country(i, title = countryNames[i], level = 3) {
    const skyline = i === 0 ? '<path d="M5 27V17l7-5 7 5v10M19 27V20h8v7M9 27v-6h6v6"/>' : '<path d="M5 27V19h8v8M13 27V12l7-4 7 4v15M18 27v-8h5v8"/>';
    return `<div class="lab-country-heading"><span class="lab-country-emblem"><svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round">${skyline}<path d="M3 28h26"/><circle cx="7" cy="7" r="2"/></svg></span><div><span class="lab-country-tag">가상의 나라 ${i === 0 ? 'A' : 'B'}</span><h${level}>${title}</h${level}></div></div>`;
  }
  function head(number, title, description, kind = 'controls') {
    return `<header class="lab-card-head"><span class="lab-section-icon">${icon(kind)}</span><div><p class="lab-eyebrow">${number}</p><h3>${title}</h3>${description ? `<p>${description}</p>` : ''}</div></header>`;
  }
  function navigation(type, current) {
    const list = type === 'trade' ? trade : intervention, prefix = type === 'trade' ? 'tl' : 'il';
    return `<div class="lab-menu-heading"><h2>학습 메뉴</h2><p>번호를 눌러 이동할 수 있어요.</p></div><div class="ex-tabs ${type === 'trade' ? 'tl-tabs' : ''} lab-tabs" role="tablist" aria-label="${type === 'trade' ? '무역 학습 메뉴' : '정부 개입 실험'}">${list.map(([title, desc], i) => `<button type="button" id="${prefix}-tab-${i}" role="tab" data-${prefix}="tab" data-i="${i}" aria-selected="${current === i}" aria-controls="${prefix}-panel" tabindex="${current === i ? 0 : -1}"><span class="lab-tab-number">${String(i + 1).padStart(2, '0')}</span><span class="lab-tab-copy"><strong>${title}</strong><small>${desc}</small></span>${current === i ? '<span class="lab-current">현재</span>' : ''}</button>`).join('')}</div><div class="lab-location" aria-live="polite"><span>${type === 'trade' ? '무역의 갈피' : '정부의 개입 실험실'}</span><span aria-hidden="true">/</span><strong>${String(current + 1).padStart(2, '0')} ${list[current][0]}</strong><span class="lab-location-count">${current + 1} / ${list.length}</span><button type="button" class="lab-menu-jump" data-lab-menu aria-label="학습 메뉴로 돌아가기">메뉴 ↑</button></div>`;
  }
  function footer(type, current) {
    const list = type === 'trade' ? trade : intervention, prefix = type === 'trade' ? 'tl' : 'il';
    const previous = type === 'trade' && current === 4 ? 1 : current - 1;
    const next = type === 'trade' && current === 1 ? 4 : current + 1;
    const link = (i, forward) => `<button type="button" class="lab-page-link ${forward ? 'lab-page-next' : ''}" data-${prefix}="tab" data-i="${i}"><small>${forward ? type === 'trade' && current === 1 ? '다음 기본 학습' : '다음 메뉴' : '이전 메뉴'}</small><strong>${forward ? '' : '← '}${String(i + 1).padStart(2, '0')} ${list[i][0]}${forward ? ' →' : ''}</strong></button>`;
    return `<nav class="lab-page-nav" aria-label="학습 메뉴 이동">${previous >= 0 ? link(previous, false) : '<p>조건을 바꾸며 결과를 비교해 보세요.</p>'}${next < list.length ? link(next, true) : '<p>위의 메뉴에서 다른 활동으로 이동할 수 있어요.</p>'}</nav>`;
  }
  let observer;
  function watchSteps(root) {
    observer?.disconnect();
    root.querySelector('[data-lab-menu]')?.addEventListener('click', () => {
      const current = root.querySelector('.lab-tabs [aria-selected=true]');
      current?.scrollIntoView({ block: 'center', behavior: 'instant' });
      current?.focus({ preventScroll: true });
    });
    const steps = root.querySelectorAll('[data-lab-section]'), links = root.querySelectorAll('.lab-step-links a');
    if (!steps.length) return;
    const setCurrent = id => links.forEach(a => { if (a.hash === '#' + id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    const visible = new Map();
    observer = new IntersectionObserver(entries => {
      entries.forEach(e => visible.set(e.target.id, e.isIntersecting));
      const first = [...steps].find(s => visible.get(s.id));
      if (first) setCurrent(first.id);
    }, { rootMargin: '-135px 0px -35% 0px' });
    steps.forEach(s => observer.observe(s));
    root.querySelectorAll('.lab-step-links a,.lab-jump-result').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); setCurrent(a.hash.slice(1));
      const section = root.querySelector(a.hash); section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      section?.focus({ preventScroll: true });
    }));
  }
  window.GalpiLabUI = { icon, country, head, navigation, footer, watchSteps };
})();
