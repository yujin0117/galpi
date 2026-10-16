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
    return `<div class="lab-country-heading studio-country-heading"><span class="lab-country-emblem">${window.GalpiLearningArt.country(i)}</span><div><span class="lab-country-tag">가상의 나라 ${i === 0 ? 'A' : 'B'}</span><h${level}>${title}</h${level}></div></div>`;
  }

  function head(number, title, description, kind = 'controls') {
    return `<header class="lab-card-head"><span class="lab-section-icon">${icon(kind)}</span><div><p class="lab-eyebrow">${number}</p><h3>${title}</h3>${description ? `<p>${description}</p>` : ''}</div></header>`;
  }
  function navigation(type, current, completed = []) {
    const list = type === 'trade' ? trade : intervention, prefix = type === 'trade' ? 'tl' : 'il';
    return `<div class="ex-tabs ${type === 'trade' ? 'tl-tabs' : ''} lab-tabs" style="--studio-tabs:${list.length}" role="tablist" aria-label="${type === 'trade' ? '무역 학습 메뉴' : '정부 개입 실험'}">${list.map(([title, desc], i) => `<button type="button" id="${prefix}-tab-${i}" role="tab" aria-label="${String(i+1).padStart(2,'0')} ${title}${completed.includes(i)?' · 완료':''}" data-${prefix}="tab" data-i="${i}" aria-selected="${current === i}" aria-controls="${prefix}-panel" tabindex="${current === i ? 0 : -1}"><span class="lab-tab-number">${completed.includes(i)?'✓':String(i + 1).padStart(2, '0')}</span><span class="lab-tab-copy"><strong>${title}</strong><small>${desc}</small></span>${current === i ? '<span class="lab-current">현재</span>' : completed.includes(i)?'<span class="lab-current lab-complete">완료</span>':''}</button>`).join('')}</div><div class="lab-location" aria-live="polite"><strong>${String(current + 1).padStart(2, '0')} ${list[current][0]}</strong><span class="lab-location-count">${current + 1} / ${list.length}</span><button type="button" class="lab-menu-jump" data-lab-menu aria-label="학습 메뉴로 돌아가기">메뉴 ↑</button></div>`;
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
    const offset=Math.ceil((root.querySelector('.lab-location')?.getBoundingClientRect().height||0)+(root.querySelector('.lab-step-links')?.getBoundingClientRect().height||0)+24);
    steps.forEach(s=>s.style.scrollMarginTop=offset+'px');
    const visible = new Map();
    observer = new IntersectionObserver(entries => {
      entries.forEach(e => visible.set(e.target.id, e.isIntersecting));
      const first = [...steps].find(s => visible.get(s.id));
      if (first) setCurrent(first.id);
    }, { rootMargin: `-${offset+1}px 0px -35% 0px` });
    steps.forEach(s => observer.observe(s));
    root.querySelectorAll('.lab-step-links a,.lab-jump-result').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); setCurrent(a.hash.slice(1));
      const section = root.querySelector(a.hash); section?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      section?.focus({ preventScroll: true });
    }));
  }
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function illustration(type) {
    if(type==='trade')return window.GalpiLearningArt.country(1,true).replace('class="tc-scene tc-harbor"','class="learning-illustration"');
    const sceneKind = {cost:'tteokbokki',finance:'wallet',intervention:'bank',ripple:'shirt',history:'factory'}[type];
    if (sceneKind) return window.GalpiLearningArt.scene(sceneKind).replace('class="learning-scene-art hl-icon"','class="learning-illustration"');
    const art = type === 'trade'
      ? '<path d="M19 70h163l-22 25H44Z" fill="#15573c"/><path d="M137 70V43h23v27M143 43V29h9v14" fill="#dce7de"/><path d="M50 70V51h28v19M80 70V48h28v22M73 48V29h29v19M110 70V51h25v19" fill="#cda86b" stroke="#fffaf1" stroke-width="2"/><path d="M20 103q15-6 30 0t30 0t30 0t30 0t30 0" fill="none" stroke="#acc4b6" stroke-width="2"/><path d="M30 23h27m-8-6 8 6-8 6M160 15h-27m8-6-8 6 8 6" fill="none" stroke="#829e8b" stroke-width="2"/>'
      : type === 'ripple'
      ? '<path d="m78 25 22 10 22-10 34 24-18 22-16-12v44H78V59L62 71 44 49Z" fill="#d6e4d5" stroke="#70997b" stroke-width="2"/><path d="M92 36q8 12 16 0M86 83h28" fill="none" stroke="#70997b" stroke-width="2"/><circle cx="33" cy="90" r="13" fill="#f0dfbb"/><path d="m27 90 4 4 8-9M160 26l10 5-10 5" fill="none" stroke="#657c6a" stroke-width="2"/>'
      : '<rect x="61" y="17" width="80" height="91" rx="12" fill="#e7eee1" stroke="#70967b" stroke-width="2"/><rect x="72" y="29" width="58" height="21" rx="4" fill="#fffdf7"/><path d="M75 65h13m-6-6v12M105 65h18M75 87h13M105 84h18m-18 6h18" stroke="#365e45" stroke-width="3"/><circle cx="153" cy="88" r="17" fill="#ead2a3"/><path d="M149 78v19m8-16h-6q-7 2 1 7t-2 6" fill="none" stroke="#967848" stroke-width="2"/>';
    return `<svg class="learning-illustration" viewBox="0 0 200 120" aria-hidden="true">${art}</svg>`;
  }
  function header(key, title, description) {
    return `<header class="learning-header"><div><div class="learning-curriculum">${window.GalpiCurriculum.header(key)}</div><h1>${title}</h1><p class="learning-goal">${description}</p></div>${illustration(key)}</header>`;
  }
  function explanation(content, title = '풀이 과정 자세히 보기') {
    return `<details class="learning-explanation"><summary>${title}</summary><div>${content}</div></details>`;
  }
  function summary(content, title = '내 선택 다시 보기', open = false) {
    return `<details class="learning-selection-summary" ${open ? 'open' : ''}><summary>${title}</summary><div>${content}</div></details>`;
  }
  function brief(content) {
    const text = String(content).replace(/<[^>]+>/g, '').trim();
    return escape(text.length < 150 ? text : text.split(/(?<=[.!?])\s/)[0]);
  }
  function choice({text,index,selected,checked,correct,attributes=''}) {
    return `<button type="button" class="learning-choice answer-option ${selected?'active':''} ${checked&&correct?'correct is-correct':''} ${checked&&selected&&!correct?'wrong is-wrong':''}" ${attributes} aria-pressed="${selected}" ${checked?'disabled':''}><span class="key">${index+1}</span><span class="learning-choice-text">${text}</span>${checked&&(correct||selected)?`<span class="learning-choice-state">${correct?'✓ 정답':'× 나의 선택'}</span>`:''}</button>`;
  }
  function feedback({correct,answer,selected,explain,wrongReason='',next='',visual=''}) {
    return `<section class="learning-feedback ${correct?'is-success':'is-incorrect'}" aria-label="정답과 풀이"><div class="learning-feedback-title" role="status"><span class="learning-feedback-mark" aria-hidden="true">${correct?'✓':'!'}</span><div><p>정답 확인</p><h3>${correct?'정답입니다!':'다시 생각해 볼까요?'}</h3></div></div><div class="learning-answer-comparison">${!correct?`<div><small>내가 선택한 답</small><strong>${selected}</strong></div>`:''}<div><small>정답</small><strong>${answer}</strong></div></div>${visual}<p class="learning-core-reason">${brief(explain)}</p>${wrongReason?explanation(wrongReason,'선택한 답의 힌트 보기'):''}${explanation(explain)}${!correct?'<p class="learning-retry-note">세트를 마치면 틀린 문제만 다시 풀 수 있어요.</p>':''}<div class="learning-feedback-actions">${next}</div></section>`;
  }
  function question({number,total,topic,prompt,evidence='',choices='',action='',feedback:answer='',retry=false}) {
    return `<section class="learning-question-card"><header class="learning-question-meta"><span>${retry?'오답 다시 풀기':'문제 연습'} <strong>${String(number).padStart(2,'0')} / ${String(total).padStart(2,'0')}</strong></span><span>${topic}</span></header><div class="learning-question-progress" role="progressbar" aria-label="현재 문제" aria-valuenow="${number}" aria-valuemin="0" aria-valuemax="${total}"><span style="width:${number/total*100}%"></span></div><div class="learning-question-layout"><section class="learning-question-main" aria-label="문제와 답 선택"><p class="learning-overline">생각하고 선택해 보세요</p>${prompt}${evidence?`<div class="learning-evidence">${evidence}</div>`:''}<div class="learning-choices" role="group" aria-label="답 선택">${choices}</div><div class="learning-question-actions">${action}</div></section><aside class="learning-feedback-column">${answer||`<div class="learning-waiting-feedback">${icon('question')}<h3>내 선택의 근거는 무엇일까요?</h3><p>답을 선택하고 확인하면<br>핵심 근거와 풀이를 볼 수 있어요.</p></div>`}</aside></div></section>`;
  }
  function result({title,score,total,good,weak,actions,caption=''}) {
    return `<section class="learning-result"><header><p class="learning-overline">학습 결과</p><h2>${title}</h2><p>확인한 개념을 돌아보고 다음 학습을 정해 보세요.</p></header><div class="learning-result-grid"><div class="learning-result-score"><div class="learning-score-ring" style="--learning-rate:${score/total*100}%"><div><strong>${score}<small> / ${total}</small></strong><span>문제 정답</span></div></div><p>${Math.round(score/total*100)}% · ${caption||'이번에 푼 문제 기준'}</p></div><div class="learning-result-concepts"><section>${icon('check')}<h3>잘 이해한 개념</h3><p>${good}</p></section><section>${icon('question')}<h3>다시 확인할 개념</h3><p>${weak}</p></section></div></div><div class="learning-result-actions">${actions}</div></section>`;
  }
  function stepNav(items,current,{idPrefix,panel,attribute,label,extraClass='',completed=[]}) {
    return `<div class="learning-nav-wrap"><div class="learning-step-nav ${extraClass}" style="--studio-tabs:${items.length}" role="tablist" aria-label="${label}">${items.map(([key,title],i)=>`<button type="button" role="tab" id="${idPrefix}-${key}" aria-controls="${panel}" aria-selected="${current===i}" tabindex="${current===i?0:-1}" ${attribute(key,i)}><span class="learning-step-number">${completed.includes(i)?'✓':String(i+1).padStart(2,'0')}</span><span>${title}</span>${completed.includes(i)?'<span class="sr-only">확인 완료</span>':''}</button>`).join('')}</div></div>`;
  }
  function bars(title, rows, {unit='',max=null}={}) {
    const scale=max||Math.max(1,...rows.map(r=>Math.abs(r.value))),diverging=rows.some(r=>r.value<0);
    return `<figure class="studio-value-chart ${diverging?'is-diverging':''}"><figcaption>${escape(title)}${unit?` <small>단위: ${escape(unit)}${diverging?' · 음수 ← 0 → 양수':''}</small>`:''}</figcaption>${rows.map((r,i)=>`<div class="studio-value-row"><span>${escape(r.label)}</span><div class="studio-value-track"><i style="width:${Math.min(100,Math.abs(r.value)/scale*100)*(diverging?.5:1)}%;${diverging?`${r.value<0?'right':'left'}:50%;`: ''}--bar-color:${r.value<0?'#b67757':r.color||['#8ca17a','#176145'][i%2]}"></i></div><strong>${r.value<0?'−':''}${escape(r.text||Math.abs(r.value).toLocaleString('ko-KR'))}</strong></div>`).join('')}</figure>`;
  }
  function evidence(rows, format) {
    return `<div class="studio-evidence-options">${rows.map((r,i)=>`<article><header>${window.GalpiLearningArt.scene(['bag','wallet','certificate'][i%3])}<strong>${escape(r.name)}</strong></header><dl><div><dt>편익</dt><dd>${format(r.benefit)}</dd></div><div><dt>가격</dt><dd>${format(r.cost)}</dd></div></dl></article>`).join('')}</div>`;
  }
  function mount(root) {
    root.querySelectorAll('[role=tablist]').forEach(list=>{
      const active=list.querySelector('[aria-selected=true]');
      if(active&&list.scrollWidth>list.clientWidth)list.scrollLeft=Math.max(0,active.offsetLeft-list.offsetLeft-list.clientWidth/2+active.clientWidth/2);
    });
    watchSteps(root);
  }
  window.GalpiLabUI = { icon, country, head, navigation, footer, watchSteps, illustration, header, choice, question, feedback, explanation, summary, result, stepNav, mount, brief, bars, evidence };
})();
