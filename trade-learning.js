/* Guided presentation reuses the existing exact-fraction trade engine. */
(() => {
  'use strict';
  const E = window.GalpiTradeEngine, D = window.GalpiTradeData, B = D.textbook;
  const names = ['갑국', '을국'], goods = ['X재', 'Y재'], U = window.GalpiLabUI;
  const button = (text, action, attrs = '') => `<button type="button" class="btn" data-tl="${action}" ${attrs}>${text}</button>`;
  const shown = m => !m.teacher || m.lessonReveal;
  function initial() { return { compareStep: 0, answers: [null, null, null], checked: [false, false, false], feedback: '', bookPhase: 0, bookStep: 0, bookMessage: '', caseStages: [0, 0, 0] }; }
  function shape(good, amount = 1) {
    return `${window.GalpiLearningArt.good(good)}<span>${goods[good]} ${amount}단위</span>`;
  }
  function productionBoard(highlight, selected) {
    return `<section class="studio-production" aria-label="두 나라의 생산비 비교"><div class="studio-board-caption"><span>같은 상품, 다른 생산비</span><small>재화 1단위 · 단위: 달러</small></div><div class="studio-country-grid">${B.costs.map((row,i)=>`<article class="studio-country ${selected===i?'is-selected':''}" data-country="${i}"><header><span class="studio-country-letter">${i===0?'A':'B'}</span><h3>${names[i]}</h3>${selected===i?'<span class="studio-my-choice">나의 선택 ✓</span>':''}</header>${window.GalpiLearningArt.world(i)}<div class="studio-costs">${row.map((cost,g)=>`<div>${window.GalpiLearningArt.good(g)}<span>${goods[g]} 1단위<strong>${cost}<small>달러</small></strong></span></div>`).join('')}</div>${highlight&&i===0?'<p class="studio-country-note">✓ 두 재화 모두 생산비가 더 낮아요</p>':''}</article>`).join('')}</div><p class="studio-board-hint">두 나라의 <strong>같은 재화끼리</strong> 생산비를 비교해 보세요.</p><details class="studio-source-table"><summary>생산 조건을 표로도 보기</summary>${conditionTable(highlight,selected)}</details></section>`;
  }
  function group(good, count) { return `<div class="tg-goods">${Array.from({ length: count }, () => `<span>${shape(good)}</span>`).join('')}</div>`; }
  function conditionTable(highlight = false, selected = null) {
    return `<div class="ex-table"><table><caption>${B.source}</caption><thead><tr><th>재화 1단위</th><th>갑국</th><th>을국</th></tr></thead><tbody>${[0, 1].map(i => `<tr><th>${goods[i]}</th><td class="${highlight ? 'tg-highlight' : selected === 0 ? 'learning-country-selected' : ''}">${B.costs[0][i]}달러</td><td class="${selected===1?'learning-country-selected':''}">${B.costs[1][i]}달러</td></tr>`).join('')}</tbody></table></div>`;
  }
  function progress(current, labels) { return `<ol class="tg-progress" aria-label="현재 학습 단계">${labels.map((s, i) => `<li ${current === i ? 'aria-current="step"' : ''}><span>${i < current ? '✓' : i + 1}</span>${s}</li>`).join('')}</ol>`; }
  function opportunity(good) {
    const c = E.conditions(B.costs), other = 1 - good;
    return `<div class="tg-opportunities">${B.costs.map((costs, i) => {
      const f = c.oc[i][good], value = E.num(f), units = Math.ceil(value);
      return `<section class="tg-country">${U.country(i)}<div class="tg-making">${shape(good)}<span aria-hidden="true">→</span><strong>포기하는 ${goods[other]}</strong></div><div class="tg-fraction" role="img" aria-label="${goods[other]} ${E.text(f)}단위를 포기합니다">${Array.from({ length: units }, (_, j) => `<span class="tg-unit">${window.GalpiLearningArt.good(other)}<span class="tg-unit-fill" style="width:${Math.min(1, Math.max(0, value - j)) * 100}%">${window.GalpiLearningArt.good(other)}</span></span>`).join('')}</div><p><strong>${E.text(f)}단위</strong>${f.d !== 1n ? ` (약 ${+value.toFixed(3)}단위)` : ''}</p><details><summary>계산식 확인</summary><p>${goods[good]} 생산비 ${costs[good]} ÷ ${goods[other]} 생산비 ${costs[other]} = ${E.text(f)}</p></details></section>`;
    }).join('')}</div><p class="ex-caption">채운 칸 하나가 재화 1단위입니다. 분수는 정확한 값, 소수는 근삿값이며 비교우위는 정확한 분수로 판정합니다.</p>`;
  }
  function compare(m) {
    const s = m.learning, n = s.compareStep, c = E.conditions(B.costs);
    const questions = ['어느 나라가 두 상품 모두 더 낮은 비용으로 생산할까요?', 'X재 1단위를 만들 때 Y재를 더 적게 포기하는 나라는?', 'Y재 1단위를 만들 때 X재를 더 적게 포기하는 나라는?'];
    const correct = [0, c.comparative[0], c.comparative[1]], explanations = [
      '갑국은 X재 2달러 < 3달러, Y재 1달러 < 4달러로 두 재화 모두 절대우위입니다.',
      '을국은 X재 1단위에 Y재 3/4단위를 포기합니다. 갑국의 2단위보다 적어 X재에 비교우위가 있습니다.',
      '갑국은 Y재 1단위에 X재 1/2단위를 포기합니다. 을국의 4/3단위보다 적어 Y재에 비교우위가 있습니다.'
    ];
    return `${progress(n, ['생산비 비교', 'X재의 포기량', 'Y재의 포기량', '비교우위 정리'])}<h2>${n === 0 ? '더 싸게 만드는 나라부터 찾아볼까요?' : n === 3 ? '잘 만드는 것과 적게 포기하는 것은 달라요.' : '갑국이 둘 다 더 싸게 만드는데, 왜 무역할까요?'}</h2>${n<3?`<h3 class="learning-mobile-question">${questions[n]}</h3>`:''}<div class="learning-compare-layout"><div class="learning-compare-data">${n === 0 ? productionBoard(s.checked[0] && shown(m),s.answers[0]) : n < 3 ? shown(m) ? opportunity(n - 1) : '<p class="ex-empty">포기하는 양을 예측한 뒤 교사가 현재 단계의 그림을 공개합니다.</p>' : `<div class="tg-conclusion"><p>절대우위 · 같은 재화를 <strong>더 낮은 비용</strong>으로 생산</p><p>비교우위 · 다른 재화를 <strong>더 적게 포기</strong>하고 생산</p>${shown(m) ? `<p><strong>갑국 → Y재 / 을국 → X재에 비교우위</strong></p>` : '<p>교사가 현재 단계 공개 버튼으로 비교우위 결과를 보여 줍니다.</p>'}</div>`}</div>${n < 3 ? `<section class="tg-question"><h3>${questions[n]}</h3><div class="ex-options">${[0, 1].map(i => button(names[i], 'learn-answer', `data-value="${i}" aria-pressed="${s.answers[n] === i}"`)).join('')}</div>${button('선택 확인하기', 'learn-check')}${s.feedback ? `<p class="learning-inline-feedback" role="status">! ${s.feedback}</p>` : ''}${s.checked[n] ? shown(m) ? `${U.feedback({correct:true,answer:names[correct[n]],selected:names[s.answers[n]],explain:explanations[n]})}` : '<p role="status">선택을 확인했습니다. 교사의 현재 단계 공개를 기다려 주세요.</p>' : ''}</section>` : '<p>이 결과는 다음 화면의 ‘나의 무역 결정’에 계속 표시됩니다.</p>'}</div><div class="ex-options">${n > 0 ? button('← 이전 단계', 'learn-prev') : ''}${n < 3 ? button('다음 단계 →', 'learn-next') : button('02 특화와 무역으로 →', 'tab', 'data-i="1"')}</div><p class="ex-caption">현재 ${n + 1}/4단계 · ${n < 3 && !s.checked[n] ? '나라를 고르고 선택을 확인해 주세요.' : '이전 선택은 이동해도 유지됩니다.'}</p><details><summary>생산비 모형의 가정</summary><p>교과서 생산비를 고정된 공통 자원 비용으로 해석합니다. 노동시간을 바꾸는 자유 실험과 구분하며 환율·임금·현실의 가격을 예측하지 않습니다.</p></details>`;
  }
  function summary(m) {
    const special=m.book.special;
    return U.summary(`${conditionTable()}<p><strong>비교우위</strong><br>갑국 Y재 · 을국 X재</p><p><strong>내가 선택한 특화</strong><br>${special.map((v,i)=>`${names[i]}: ${v===null?'아직 선택하지 않음':goods[v]}`).join(' / ')}</p><p><strong>고정 교환 조건</strong><br>X재 1단위 ↔ Y재 1단위</p><p class="ex-caption">기본 학습은 생산비·교환 비율·수량을 고정합니다. 직접 조정하려면 03 자유 무역 실험을 이용하세요.</p>`,'나의 무역 결정 · 조건 다시 보기',innerWidth>900).replace('class="learning-selection-summary"','class="learning-selection-summary tg-summary"');
  }
  function book(m) {
    const s = m.learning, b = m.book, n = s.bookStep;
    const p = b.special.map(x => [E.F(x === 0 ? B.units : 0), E.F(x === 1 ? B.units : 0)]);
    const valid = b.special[0] === 1 && b.special[1] === 0;
    const result = valid ? E.exchange(B.costs, p, 1, B.ratio, B.quantity) : null;
    const headings = ['① 무역 이전', '② 비교우위에 맞춰 특화', '③ 상품 교환', '④ 무역 이후의 소비', '⑤ 생산비 절약'];
    const contents = [
      `<p>두 나라 모두 X재 1단위와 Y재 1단위를 직접 만듭니다.</p><div class="tg-opportunities">${B.costs.map((row, i) => `<section class="tg-country">${U.country(i)}${group(0, 1)}${group(1, 1)}<p>직접 생산비 <strong>${row[0] + row[1]}달러</strong></p></section>`).join('')}</div>`,
      `<p>각 나라는 선택한 재화를 2단위씩 생산합니다.</p><div class="tg-opportunities">${b.special.map((x, i) => `<section class="tg-country">${U.country(i,names[i]+' · '+goods[x])}${group(x, B.units)}<p>생산비 <strong>${B.costs[i][x] * B.units}달러</strong></p></section>`).join('')}</div>`,
      `<div class="studio-exchange-scene"><div>${U.country(0)}<span>Y재 1단위를 보내요</span>${shape(1)}</div><div class="studio-shipping">${window.GalpiLearningArt.scene('ship')}<p>← X재 1단위</p><p>Y재 1단위 →</p></div><div>${U.country(1)}<span>X재 1단위를 보내요</span>${shape(0)}</div></div><p>둘 다 1단위를 건네고, 다른 재화 1단위를 받습니다. 교환이 재화를 새로 만들지는 않습니다.</p>`,
      `<div class="tg-opportunities">${names.map((name,i) => `<section class="tg-country">${U.country(i,name+' · 소비할 묶음')}${group(0, 1)}${group(1, 1)}</section>`).join('')}</div><p>무역 이전과 똑같은 X재 1단위·Y재 1단위를 확보했습니다.</p>`,
      result ? `<div class="tg-opportunities">${result.gains.map((g, i) => `<section class="tg-country">${U.country(i)}${U.bars('같은 소비 묶음에 필요한 생산비',[{label:'직접 생산',value:E.num(result.autarky[i])},{label:'특화·교환',value:E.num(result.used[i])}],{unit:'달러'})}<p class="tg-saving"><strong>${E.text(g)}달러 절약</strong></p></section>`).join('')}</div><p>같은 소비 묶음을 얻는 데 두 나라 모두 생산비가 줄었습니다.</p>` : ''
    ];
    return `<h2>${s.bookPhase === 0 ? 'STEP A · 각 나라는 무엇에 특화할까요?' : 'STEP B · 같은 묶음을 얻는 과정을 따라가요.'}</h2><div class="tg-book-layout"><div>${s.bookPhase === 0 ? `<p>비교우위를 확인하고 두 나라의 특화 상품을 각각 골라 주세요.</p><div class="tg-opportunities">${names.map((name, i) => `<section class="tg-country">${U.country(i,name+'의 특화 상품')}<p>비교우위: <strong>${i === 0 ? 'Y재' : 'X재'}</strong></p><div class="ex-options">${[0, 1].map(v => button(goods[v], 'book-choice', `data-country="${i}" data-value="${v}" aria-pressed="${b.special[i] === v}"`)).join('')}</div></section>`).join('')}</div>${s.bookMessage ? `<p class="ex-notice" role="status">${s.bookMessage}</p>` : ''}${button('선택 확인하고 무역 과정 보기 →', 'book-next')}<p class="ex-caption">두 나라의 상품을 선택하면 STEP B로 이동합니다. 틀린 선택도 다시 고칠 수 있습니다.</p>` : `${progress(n, ['무역 이전', '특화', '교환', '소비', '이익'])}<section class="tg-scene" aria-live="polite"><h3 tabindex="-1" id="tg-scene-title">${headings[n]}</h3>${shown(m) ? contents[n] : '<p class="ex-empty">이번 단계에서 무엇이 달라질지 예측해 보세요. 교사가 현재 단계를 공개합니다.</p>'}</section><div class="ex-options">${button(n === 0 ? '← 특화 선택으로' : '← 이전 과정', 'book-prev')}${n < 4 ? button('다음 과정 →', 'book-next') : button('05 문제 연습으로 →', 'tab', 'data-i="4"')}</div><p class="ex-caption">자동으로 넘어가지 않습니다. 확인한 뒤 다음 과정을 눌러 주세요.</p>`}</div>${summary(m)}</div><p class="ex-caption">학습용 생산비 모형 · 교환·운송 비용과 관세를 고려하지 않으며 재화는 나누어 생산·교환할 수 있다고 가정합니다. 원문 대조 전인 사용자 제공 예제입니다.</p>`;
  }
  function handle(m, action, element) {
    const s = m.learning;
    if (action === 'learn-answer') { s.answers[s.compareStep] = +element.dataset.value; s.checked[s.compareStep] = false; s.feedback = ''; }
    else if (action === 'learn-check') {
      const n = s.compareStep, selected = s.answers[n], correct = [0, 1, 0][n];
      if (selected === null) s.feedback = '먼저 갑국 또는 을국을 선택해 주세요.';
      else if (selected !== correct) s.feedback = n === 0 ? '같은 재화의 생산비를 두 나라끼리 비교해 보세요. 선택을 바꿀 수 있습니다.' : '포기하는 다른 재화의 양이 더 적은 나라를 다시 찾아보세요.';
      else { s.checked[n] = true; s.feedback = ''; }
    } else if (action === 'learn-next') {
      if (!s.checked[s.compareStep]) s.feedback = '현재 질문에서 나라를 고르고 선택 확인하기를 눌러 주세요.';
      else if (!shown(m)) s.feedback = '교사가 현재 단계 결과를 공개한 뒤 이동할 수 있습니다.';
      else { s.compareStep = Math.min(3, s.compareStep + 1); s.feedback = ''; m.lessonReveal = false; }
    } else if (action === 'learn-prev') { s.compareStep = Math.max(0, s.compareStep - 1); s.feedback = ''; m.lessonReveal = false; }
    else if (action === 'book-choice') { m.book.special[+element.dataset.country] = +element.dataset.value; s.bookPhase = 0; s.bookStep = 0; s.bookMessage = ''; m.lessonReveal = false; }
    else if (action === 'book-next') {
      if (s.bookPhase === 0) {
        if (m.book.special[0] === null) s.bookMessage = '갑국이 특화할 상품을 선택해 주세요.';
        else if (m.book.special[1] === null) s.bookMessage = '을국의 특화 상품도 선택해 주세요.';
        else if (m.book.special[0] !== 1 || m.book.special[1] !== 0) s.bookMessage = '갑국은 Y재, 을국은 X재를 더 적게 포기하고 만듭니다. 비교우위에 맞게 선택을 바꿔 보세요.';
        else { s.bookPhase = 1; s.bookStep = 0; s.bookMessage = ''; m.lessonReveal = false; }
      } else if (shown(m)) { s.bookStep = Math.min(4, s.bookStep + 1); m.lessonReveal = false; }
      else return { handled: true, focus: '[data-tl="lesson-reveal"]' };
    } else if (action === 'book-prev') { if (s.bookStep === 0) s.bookPhase = 0; else s.bookStep--; m.lessonReveal = false; }
    else if (action === 'lesson-reveal') m.lessonReveal = !m.lessonReveal;
    else return { handled: false };
    return { handled: true, focus: action === 'book-next' && s.bookPhase === 1 ? '#tg-scene-title' : `[data-tl="${action}"]${element.dataset.value !== undefined ? `[data-value="${element.dataset.value}"]` : ''}${element.dataset.country !== undefined ? `[data-country="${element.dataset.country}"]` : ''}` };
  }
  window.GalpiTradeLearning = { initial, compare, book, handle };
})();
