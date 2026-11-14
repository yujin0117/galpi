/* The core lesson uses the same exact-fraction engine as the trade workshop. */
(() => {
  'use strict';
  const E = window.GalpiTradeEngine;
  const B = window.GalpiTradeData.textbook;
  const names = ['갑국', '을국'];
  const goods = ['X재', 'Y재'];
  const conditions = E.conditions(B.costs);
  const correct = [conditions.absolute[0], ...conditions.comparative];
  const special = names.map((_, country) => conditions.comparative.indexOf(country));
  const production = special.map(good => goods.map((_, index) => E.F(good === index ? B.units : 0)));
  const trade = E.exchange(B.costs, production, conditions.comparative[0], B.ratio, B.quantity);
  const labels = ['생산비 비교', 'X재의 기회비용', 'Y재의 기회비용', '비교우위 정리'];
  const questions = [
    '어느 나라가 X재와 Y재 모두 더 적은 비용으로 생산할까요?',
    'X재 1단위를 만들 때 Y재를 더 적게 포기하는 나라는?',
    'Y재 1단위를 만들 때 X재를 더 적게 포기하는 나라는?'
  ];
  const explanations = [
    '갑국의 생산비가 X재와 Y재 모두 더 낮아요. 갑국은 두 재화에 절대우위가 있어요.',
    '을국은 Y재 3/4단위, 갑국은 Y재 2단위를 포기해요. 을국이 덜 포기하므로 X재에 비교우위가 있어요.',
    '갑국은 X재 1/2단위, 을국은 X재 4/3단위를 포기해요. 갑국이 덜 포기하므로 Y재에 비교우위가 있어요.'
  ];
  const shown = m => !m.teacher || m.lessonReveal;

  function initial() {
    return {
      compareStep: 0, answers: [null, null, null], checked: [false, false, false],
      feedback: '', focusGood: 0, bookFeedback: '', picks: [null, null], tradePhase: 'specialize', exchanged: false
    };
  }

  function button(label, action, { primary = false, attrs = '' } = {}) {
    return `<button type="button" class="btn${primary ? ' tg-primary' : ''}" data-tl="${action}" ${attrs}>${label}</button>`;
  }

  function good(index) {
    return `<span class="tg-good">${window.GalpiLearningArt.good(index)}${goods[index]}</span>`;
  }

  function table(kind, { active = -1, winners = false, visible = true, bars = false } = {}) {
    const opportunity = kind === 'opportunity';
    const preferred = opportunity ? conditions.comparative : conditions.absolute;
    const caption = opportunity ? '기회비용 · 다른 재화의 포기량' : '생산비 · 재화 1단위당';
    const maxCost = Math.max(...B.costs.flat());
    const rows = goods.map((_, index) => {
      const cells = names.map((_, country) => {
        const cost = conditions.oc[country][index];
        const value = opportunity ? `${goods[1 - index]} <b>${E.text(cost)}</b>단위` : `<b>${B.costs[country][index]}</b>달러`;
        const best = winners && visible && preferred[index] === country;
        return `<td${best ? ' class="tg-best"' : ''}>${visible ? value : '공개 전'}${bars && active === index ? `<span class="tg-cost-bar" aria-hidden="true"><i style="--share:${B.costs[country][index] / maxCost * 100}%"></i></span>` : ''}${best ? `<small>${opportunity ? '비교우위' : '절대우위'}</small>` : ''}</td>`;
      }).join('');
      return `<tr${active === index ? ' class="tg-active-row"' : ''}><th scope="row">${good(index)}</th>${cells}</tr>`;
    }).join('');
    return `<table class="tg-table"><caption>${caption}</caption><thead><tr><th scope="col">만드는 재화</th><th scope="col">갑국</th><th scope="col">을국</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function glossary(terms) {
    return `<dl class="tg-glossary">${terms.map(([term, description]) =>
      `<div><dt>${term}</dt><dd>${description}</dd></div>`).join('')}</dl>`;
  }

  function compareQuestion(m, step) {
    const s = m.learning;
    const selected = s.answers[step];
    const checked = s.checked[step];
    const ready = checked && shown(m);
    const options = step === 0 ? [...names, '재화마다 다르다'] : names;
    const message = s.feedback || (checked ? shown(m) ? explanations[step] : '선택을 확인했어요. 교사가 현재 단계를 공개하면 풀이를 볼 수 있어요.' : '');
    return `<section class="tg-check" aria-labelledby="tg-question">
      <h3 id="tg-question" tabindex="-1">${questions[step]}</h3>
      <div class="tg-choices" role="group" aria-label="답 선택">${options.map((label, index) => button(label, 'learn-answer', {
        attrs: `data-value="${index}" aria-pressed="${selected === index}"`
      })).join('')}</div>
      ${message ? `<p class="tg-feedback${ready ? ' tg-correct' : ''}" role="status">${ready ? '<strong>✓ 정답</strong> ' : ''}${message}</p>` : '<p class="tg-note">나라를 고르고 선택을 확인해 보세요.</p>'}
      <div class="tg-actions">
        ${step > 0 ? button('← 이전 단계', 'learn-prev') : ''}
        ${ready ? button(step === 2 ? '비교우위 정리 →' : '다음 단계 →', 'learn-next', {primary: true})
          : button('선택 확인하기', 'learn-check', {primary: true, attrs: selected === null ? 'disabled' : ''})}
      </div>
    </section>`;
  }

  function calculation(step) {
    const goodIndex = step - 1;
    const other = 1 - goodIndex;
    const examples = names.map((name, index) =>
      `${name} ${B.costs[index][goodIndex]} ÷ ${B.costs[index][other]} = ${E.text(conditions.oc[index][goodIndex])}`);
    return `<p class="tg-note"><strong>${goods[goodIndex]}의 기회비용</strong> = ${goods[goodIndex]} 생산비 ÷ ${goods[other]} 생산비<br>${examples.join(' · ')} (${goods[other]} 단위)</p>`;
  }

  function reference(label, content) {
    return `<details class="tg-reference"><summary>${label}</summary><div class="tg-reference-body">${content}</div></details>`;
  }

  const compareTerms = [
    ['절대우위', '같은 재화를 더 적은 비용으로 만들어요.'],
    ['기회비용', '재화 1단위를 만들려고 포기하는 다른 재화의 양이에요.'],
    ['비교우위', '같은 재화를 만들 때 다른 재화를 더 적게 포기해요.']
  ];

  function summary(m) {
    const visible = shown(m);
    return `<div class="tg-summary-sheet">
      <div class="tg-findings">
        <div><h3>절대우위 <small>생산비가 더 낮은 쪽</small></h3>
          <p>${visible ? '<strong>갑국</strong>이 X재와 Y재 모두 더 낮은 비용으로 만들어요.' : '같은 재화의 생산비를 나라별로 비교해 보세요.'}</p></div>
        <div><h3>비교우위 <small>기회비용이 더 낮은 쪽</small></h3>
          <p>${visible ? '<strong>을국은 X재</strong>, <strong>갑국은 Y재</strong>를 만들 때 상대국보다 덜 포기해요.' : '교사가 공개하면 비교우위와 특화 방향을 확인할 수 있어요.'}</p></div>
      </div>
      <div class="tg-data-pair">
        ${table('cost', {winners: visible})}
        ${table('opportunity', {winners: true, visible})}
      </div>
      ${visible ? '<p class="tg-takeaway">그래서 갑국은 Y재, 을국은 X재에 특화할 수 있어요.</p>' : ''}
      <div class="tg-actions">
        ${button('← 이전 단계', 'learn-prev')}
        ${button('특화와 무역으로 →', 'tab', {primary: true, attrs: 'data-i="1"'})}
      </div>
      ${reference('용어와 계산 근거', glossary(compareTerms) + (visible ? calculation(1) + calculation(2) : ''))}
    </div>`;
  }

  function comparisonMaterial(m, step) {
    const s = m.learning;
    return step === 0
      ? `<div class="tg-row-picks" role="group" aria-label="비교할 재화">${goods.map((_, i) => button(good(i), 'learn-good', {
        attrs: `data-value="${i}" aria-pressed="${s.focusGood === i}"`
      })).join('')}</div>${table('cost', {active: s.focusGood, winners: shown(m) && s.checked[0], bars: true})}`
      : `${table('opportunity', {active: step - 1, visible: shown(m)})}
        ${!shown(m) ? '<p class="tg-note">생산비를 보고 포기량을 예상해 보세요.</p>' : ''}
        ${reference('생산비와 계산 근거', table('cost') + (shown(m) ? calculation(step) : ''))}`;
  }

  function compare(m) {
    const s = m.learning;
    const step = s.compareStep;
    const progress = labels.map((label, index) =>
      `<li${step === index ? ' aria-current="step"' : ''}><span>${index < step ? '✓' : index + 1}</span>${label}</li>`).join('');
    const titles = ['두 나라의 생산비를 비교해요', 'X재를 만들 때 무엇을 포기할까요?', 'Y재를 만들 때 무엇을 포기할까요?', '절대우위와 비교우위는 기준이 달라요'];
    return `<div class="tg-core" id="tg-lesson">
      <ol class="tg-steps" aria-label="생산 조건 비교 단계">${progress}</ol>
      <h2 id="tg-lesson-title" tabindex="-1">${titles[step]}</h2>
      ${step === 3 ? summary(m) : `<div class="tg-compare-work">
        <section class="tg-material" aria-label="두 나라의 비교 자료">${comparisonMaterial(m, step)}</section>
        ${compareQuestion(m, step)}
      </div>${reference('절대우위·기회비용·비교우위 용어 보기', glossary(compareTerms))}`}
      <p class="tg-source">수업 자료 8~9쪽 · 생산비는 달러, 기회비용은 포기하는 재화의 단위로 읽어요.</p>
    </div>`;
  }

  function exchangeDiagram(exchanged) {
    const holdings = exchanged ? trade.after : production;
    return `<div class="tg-exchange-flow${exchanged ? ' tg-exchanged' : ''}" role="group" aria-label="두 나라의 보유량과 교환 방향">
      ${names.map((name, index) => `<div class="tg-producer">
        <strong>${name}</strong>
        <div class="tg-holdings">${holdings[index].map((quantity, i) =>
          `<span>${good(i)} <b>${E.text(quantity)}</b>단위</span>`).join('')}</div>
      </div>`).join('')}
      <div class="tg-transfers">
        <div class="tg-transfer tg-transfer-east" role="img" aria-label="갑국이 을국에 Y재 1단위를 보냅니다">
          <span class="tg-transfer-arrow" aria-hidden="true">→</span>
          <span class="tg-transfer-good" aria-hidden="true">${good(1)} 1단위</span>
        </div>
        <div class="tg-transfer tg-transfer-west" role="img" aria-label="을국이 갑국에 X재 1단위를 보냅니다">
          <span class="tg-transfer-arrow" aria-hidden="true">←</span>
          <span class="tg-transfer-good" aria-hidden="true">${good(0)} 1단위</span>
        </div>
      </div>
    </div>`;
  }

  function tradeResult() {
    return `<p class="tg-takeaway"><strong>두 나라 모두 X재 1단위와 Y재 1단위를 얻어요.</strong> 직접 만들 때와 같은 묶음인데, 생산비는 각각 1달러 줄어요.</p>

      <table class="tg-table tg-result-table">
        <caption>같은 소비 묶음을 얻는 데 드는 생산비</caption>
        <thead><tr><th scope="col">나라</th><th scope="col">직접 생산</th><th scope="col">특화 후 교환</th><th scope="col">절약</th></tr></thead>
        <tbody>${names.map((name, index) => `<tr><th scope="row">${name}</th>
          <td>${E.text(trade.autarky[index])}달러</td><td>${E.text(trade.used[index])}달러</td>
          <td class="tg-best"><b>${E.text(trade.gains[index])}</b>달러</td></tr>`).join('')}</tbody>
      </table>
`;
  }

  const bookTerms = [
    ['특화', '생산에 유리한 재화에 집중해요.'],
    ['국제 분업', '나라별로 서로 다른 재화의 생산을 맡아요.'],
    ['무역', '나라 사이에 재화나 서비스를 거래해요.']
  ];

  function specialization(m) {
    const s = m.learning;
    const visible = shown(m);
    const complete = s.picks.every(value => value !== null);
    return `<h2 id="tg-lesson-title" tabindex="-1">두 나라는 무엇에 특화할까요?</h2>
      <p class="tg-intro">X재와 Y재를 만들 때 <strong>포기하는 양이 더 적은 쪽</strong>을 찾아, 나라별로 한 재화를 골라 보세요.</p>
      <div class="tg-compare-work">
        <section class="tg-material" aria-label="특화 판단 자료">
          ${table('opportunity', {visible})}
          ${!visible ? '<p class="tg-note">교사가 공개하기 전에는 아래에서 생산비를 펼쳐 포기량을 예상해 보세요.</p>' : ''}
          ${reference('조건 다시 보기 · 생산비', table('cost'))}
        </section>
        <section class="tg-check" aria-labelledby="tg-specialization-title">
          <h3 id="tg-specialization-title">나라별 특화 방향 선택</h3>
          ${names.map((name, country) => `<div class="tg-country-choice" role="group" aria-label="${name}의 특화 재화">
            <strong>${name}</strong><div class="tg-choices">${goods.map((_, i) => button(good(i), 'book-pick', {
              attrs: `data-country="${country}" data-value="${i}" aria-pressed="${s.picks[country] === i}"`
            })).join('')}</div></div>`).join('')}
          ${s.bookFeedback ? `<p class="tg-feedback" role="status">${s.bookFeedback}</p>` : ''}
          ${!complete || !visible ? `<p class="tg-note">${!complete ? '두 나라의 재화를 모두 골라 주세요.' : '교사가 공개하면 선택을 확인할 수 있어요.'}</p>` : ''}
          <div class="tg-actions">${button('선택 확인하고 교환으로 →', 'book-start', {primary: true, attrs: complete && visible ? '' : 'disabled'})}</div>
        </section>
      </div>`;
  }

  function exchangeScene(m) {
    const visible = shown(m);
    const exchanged = m.learning.exchanged;
    return `<h2 id="tg-lesson-title" tabindex="-1">한 단위씩 주고받으면 무엇이 달라질까요?</h2>
      <p class="tg-intro">${visible ? '갑국은 Y재, 을국은 X재에 특화해요. 각 재화를 만들 때 상대국보다 덜 포기하기 때문이에요.' : '각 나라가 어떤 재화를 생산해 건네면 좋을지 먼저 예상해 보세요.'}</p>
      <section class="tg-book-action" aria-labelledby="tg-stock-heading">
        <h3 class="tg-book-caption" id="tg-stock-heading" tabindex="-1">${exchanged && visible ? '교환 후 보유량' : '교환 전 보유량'}</h3>
        ${visible ? `${exchangeDiagram(exchanged)}
          <p class="tg-note">${exchanged
            ? '갑국은 Y재를 보내고 X재를 받았어요. 을국은 X재를 보내고 Y재를 받았어요.'
            : '갑국의 Y재 하나와 을국의 X재 하나가 서로 반대 방향으로 이동해요.'}</p>` : '<p class="tg-note">교사가 현재 단계를 공개하면 교환 실험을 시작할 수 있어요.</p>'}
        ${exchanged && visible ? `<div class="tg-book-result" role="region" aria-label="교환 결과">${tradeResult()}</div>` : ''}
        <div class="tg-actions">
          ${button('← 특화 선택', 'book-back')}
          ${button(exchanged ? '교환 전으로 돌아가기' : '1:1로 교환해 보기 →', 'book-exchange', {
            primary: !exchanged, attrs: visible ? '' : 'disabled'
          })}
          ${exchanged && visible ? button('문제 연습으로 →', 'tab', {primary: true, attrs: 'data-i="4"'}) : ''}
        </div>
        ${exchanged && visible ? reference('왜 두 나라 모두 이익일까요?', '<p class="tg-note">X재 1단위의 교환값은 Y재 1단위예요. 을국은 X재를 만들며 포기한 Y재 3/4단위보다 많이 받고, 갑국은 X재를 직접 만들 때 포기할 Y재 2단위보다 적게 줘요.</p><p class="tg-note">갑국은 Y재 2단위(1×2), 을국은 X재 2단위(3×2)를 생산하는 데 든 비용이에요.</p>') : ''}
      </section>
      ${reference('교환의 근거 · 기회비용과 생산비', `<div class="tg-data-pair">${table('opportunity', {winners: true, visible})}${table('cost')}</div>`)}`;
  }

  function book(m) {
    const exchanging = m.learning.tradePhase === 'exchange';
    return `<div class="tg-core" id="tg-lesson" data-board-screen="${exchanging ? 'trade-exchange' : 'trade-specialization'}">
      <ol class="tg-steps tg-book-steps" aria-label="특화와 무역 단계">
        <li${exchanging ? '' : ' aria-current="step"'}><span>${exchanging ? '✓' : '1'}</span>특화 방향 선택</li>
        <li${exchanging ? ' aria-current="step"' : ''}><span>2</span>1:1 교환 실험</li>
      </ol>
      ${exchanging ? exchangeScene(m) : specialization(m)}
      ${reference('특화·국제 분업·무역 용어 보기', glossary(bookTerms))}
      <p class="tg-source">수업 자료 8~10쪽 · 운송비와 관세를 제외하고 1:1로 교환하는 학습용 예제입니다.</p>
    </div>`;
  }

  async function exchange(m, buttonElement) {
    const s = m.learning;
    const ignored = {handled: true, render: false};
    if (!shown(m) || buttonElement.getAttribute('aria-disabled') === 'true') return ignored;
    if (s.exchanged) {
      s.exchanged = false;
      return {handled: true, focus: '[data-tl="book-exchange"]'};
    }

    const diagram = buttonElement.closest('.tg-book-action')?.querySelector('.tg-exchange-flow');
    if (typeof diagram?.animate === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      buttonElement.setAttribute('aria-disabled', 'true');
      buttonElement.textContent = '교환 중…';
      diagram.scrollIntoView({block: 'nearest', behavior: 'instant'});
      const cargo = [...diagram.querySelectorAll('.tg-transfer-good')];
      const journey = [{left: '0%', transform: 'translateX(0)'}, {left: '100%', transform: 'translateX(-100%)'}];
      await Promise.allSettled(cargo.map((token, index) =>
        token.animate(index === 0 ? journey : [...journey].reverse(), {
          duration: 1050, easing: 'ease-in-out', fill: 'forwards'
        }).finished));
    }
    if (!buttonElement.isConnected) return ignored;
    s.exchanged = true;
    return {handled: true, focus: '#tg-stock-heading', scroll: {selector: '#tg-stock-heading', block: 'nearest'}};
  }

  function handle(m, action, element) {
    const s = m.learning;
    const step = s.compareStep;
    let focus;
    let scroll;

    switch (action) {
      case 'learn-good':
        s.focusGood = Number(element.dataset.value);
        focus = `[data-tl="learn-good"][data-value="${s.focusGood}"]`;
        break;
      case 'book-pick': {
        const {country, value} = element.dataset;
        s.picks[Number(country)] = Number(value);
        s.bookFeedback = '';
        focus = `[data-tl="book-pick"][data-country="${country}"][data-value="${value}"]`;
        break;
      }
      case 'book-start':
        if (!shown(m) || s.picks.includes(null)) return {handled: true, render: false};
        if (!s.picks.every((value, index) => value === special[index])) {
          s.bookFeedback = '같은 재화의 행에서 더 적게 포기하는 나라를 찾아보세요. X재와 Y재를 각각 비교하면 돼요.';
          focus = '[data-tl="book-start"]';
          break;
        }
        s.tradePhase = 'exchange';
        focus = '#tg-lesson-title';
        scroll = {selector: '#tg-lesson', block: 'start'};
        break;
      case 'book-back':
        s.tradePhase = 'specialize';
        focus = '#tg-lesson-title';
        scroll = {selector: '#tg-lesson', block: 'start'};
        break;
      case 'learn-answer':
        s.answers[step] = Number(element.dataset.value);
        s.checked[step] = false;
        s.feedback = '';
        focus = `[data-tl="learn-answer"][data-value="${element.dataset.value}"]`;
        break;
      case 'learn-check':
        if (s.answers[step] === null) return {handled: true, focus: '.tg-choices button'};
        s.checked[step] = s.answers[step] === correct[step];
        s.feedback = s.checked[step] ? '' : step === 0
          ? '같은 재화의 달러 금액을 갑국과 을국끼리 비교해 보세요.'
          : `${goods[step - 1]} 행에서 포기하는 ${goods[2 - step]}의 양이 더 작은 쪽을 찾아보세요.`;
        focus = s.checked[step] && shown(m) ? '[data-tl="learn-next"]' : '[data-tl="learn-check"]';
        break;
      case 'learn-next':
      case 'learn-prev':
        if (action === 'learn-next' && (!s.checked[step] || !shown(m))) return {handled: true};
        s.compareStep += action === 'learn-next' ? 1 : -1;
        s.feedback = '';
        m.lessonReveal = false;
        focus = s.compareStep === 3 ? '#tg-lesson-title' : '#tg-question';
        scroll = {selector: '#tg-lesson', block: 'start'};
        break;
      case 'lesson-reveal':
        m.lessonReveal = !m.lessonReveal;
        focus = '[data-tl="lesson-reveal"]';
        break;
      default:
        return {handled: false};
    }
    return {handled: true, focus, scroll};
  }

  window.GalpiTradeLearning = {initial, compare, book, exchange, handle};
})();
