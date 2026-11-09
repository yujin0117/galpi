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
      feedback: '', exchanged: false
    };
  }

  function button(label, action, { primary = false, attrs = '' } = {}) {
    return `<button type="button" class="btn${primary ? ' tg-primary' : ''}" data-tl="${action}" ${attrs}>${label}</button>`;
  }

  function good(index) {
    return `<span class="tg-good">${window.GalpiLearningArt.good(index)}${goods[index]}</span>`;
  }

  function table(kind, { active = -1, winners = false, visible = true } = {}) {
    const opportunity = kind === 'opportunity';
    const preferred = opportunity ? conditions.comparative : conditions.absolute;
    const caption = opportunity ? '기회비용 · 다른 재화의 포기량' : '생산비 · 재화 1단위당';
    const rows = goods.map((_, index) => {
      const cells = names.map((_, country) => {
        const cost = conditions.oc[country][index];
        const value = opportunity ? `${goods[1 - index]} <b>${E.text(cost)}</b>단위` : `<b>${B.costs[country][index]}</b>달러`;
        const best = winners && visible && preferred[index] === country;
        return `<td${best ? ' class="tg-best"' : ''}>${visible ? value : '공개 전'}${best ? `<small>${opportunity ? '비교우위' : '절대우위'}</small>` : ''}</td>`;
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
    const previous = step > 0 ? button('← 이전 단계', 'learn-prev') : '';
    const message = s.feedback || (checked ? shown(m) ? explanations[step] : '선택을 확인했어요. 교사가 현재 단계를 공개하면 풀이를 볼 수 있어요.' : '');
    return `<section class="tg-check" aria-labelledby="tg-question">
      <p class="tg-kicker">생각해 볼 질문</p>
      <h3 id="tg-question" tabindex="-1">${questions[step]}</h3>
      <div class="tg-choices" role="group" aria-label="답 선택">${options.map((label, index) => button(label, 'learn-answer', {
        attrs: `data-value="${index}" aria-pressed="${selected === index}"`
      })).join('')}</div>
      ${message ? `<p class="tg-feedback${ready ? ' tg-correct' : ''}" role="status">${ready ? '<strong>✓ 정답</strong> ' : ''}${message}</p>` : ''}
      <div class="tg-actions">
        ${previous}
        ${button('선택 확인하기', 'learn-check', {primary: !ready, attrs: selected === null ? 'disabled' : ''})}
        ${button('다음 단계 →', 'learn-next', {primary: ready, attrs: ready ? '' : 'disabled'})}
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

  function compare(m) {
    const step = m.learning.compareStep;
    const summary = step === 3;
    const showResults = shown(m);
    const progress = labels.map((label, index) =>
      `<li${step === index ? ' aria-current="step"' : ''}><span>${index + 1}</span>${label}</li>`).join('');
    const tables = `<div class="tg-data">
      ${table('cost', {winners: showResults && (summary || (step === 0 && m.learning.checked[0]))})}
      ${step > 0 ? table('opportunity', {active: summary ? -1 : step - 1, winners: summary, visible: showResults}) : ''}
    </div>`;
    return `<div class="tg-core" id="tg-lesson">
      <ol class="tg-steps" aria-label="생산 조건 비교 단계">${progress}</ol>
      <h2 id="tg-lesson-title" tabindex="-1">${summary ? '생산비와 포기량을 나란히 비교해요' : step === 0 ? '생산비가 더 낮으면, 무역할 이유가 없을까요?' : '갑국이 둘 다 더 싸게 만드는데, 왜 무역할까요?'}</h2>
      ${glossary([
        ['절대우위', '같은 재화를 더 적은 비용으로 만들어요.'],
        ['기회비용', '여기서는 재화 1단위를 만들려고 포기하는 다른 재화의 양이에요.'],
        ['비교우위', '같은 재화를 만들 때 다른 재화를 더 적게 포기해요.']
      ])}
      ${summary ? `
        ${tables}
        ${showResults ? '<p class="tg-takeaway"><strong>갑국은 두 재화 모두 절대우위예요.</strong> 하지만 Y재는 갑국이, X재는 을국이 더 적게 포기하며 만들어요. 그래서 서로 다른 재화에 특화할 수 있어요.</p>' : '<p class="tg-note">교사가 현재 단계를 공개하면 비교우위와 특화 방향을 볼 수 있어요.</p>'}
        <div class="tg-actions">${button('← 이전 단계', 'learn-prev')}${button('특화와 무역으로 →', 'tab', {primary: true, attrs: 'data-i="1"'})}</div>
        <p class="tg-note">다음 화면에서도 두 나라의 기회비용을 다시 볼 수 있어요.</p>
      ` : `<div class="tg-compare-work">
        <div>${tables}${step > 0 && showResults ? calculation(step) : ''}</div>
        ${compareQuestion(m, step)}
      </div>`}
      <p class="tg-source">수업 자료 8~9쪽 · 생산비는 달러, 기회비용은 포기하는 재화의 단위로 읽어요.</p>
    </div>`;
  }

  function exchangeDiagram() {
    return `<div class="tg-exchange-flow" aria-label="두 나라의 특화 생산과 1 대 1 교환">
      ${names.map((name, index) => {
        const makes = special[index];
        return `<div class="tg-producer"><strong>${name}</strong><span>${good(makes)} ${B.units}단위 생산</span></div>`;
      }).join('')}
      <ul class="tg-transfers">
        <li><span>갑국</span><strong>→ Y재 1단위 →</strong><span>을국</span></li>
        <li><span>갑국</span><strong>← X재 1단위 ←</strong><span>을국</span></li>
      </ul>
    </div>`;
  }

  function tradeResult() {
    return `<p class="tg-takeaway"><strong>두 나라 모두 X재 1단위와 Y재 1단위를 얻어요.</strong> 직접 만들 때와 같은 묶음인데, 생산비는 각각 1달러 줄어요.</p>
      <p class="tg-note">X재 1단위의 교환값은 Y재 1단위예요. 을국은 X재를 만들며 포기한 Y재 3/4단위보다 많이 받고, 갑국은 X재를 직접 만들 때 포기할 Y재 2단위보다 적게 줘요.</p>
      <table class="tg-table tg-result-table">
        <caption>같은 소비 묶음을 얻는 데 드는 생산비</caption>
        <thead><tr><th scope="col">나라</th><th scope="col">직접 생산</th><th scope="col">특화 후 교환</th><th scope="col">절약</th></tr></thead>
        <tbody>${names.map((name, index) => `<tr><th scope="row">${name}</th>
          <td>${E.text(trade.autarky[index])}달러</td><td>${E.text(trade.used[index])}달러</td>
          <td class="tg-best"><b>${E.text(trade.gains[index])}</b>달러</td></tr>`).join('')}</tbody>
      </table>
      <p class="tg-note">갑국은 Y재 2단위(1×2), 을국은 X재 2단위(3×2)를 생산하는 데 든 비용이에요.</p>`;
  }

  function book(m) {
    const visible = shown(m);
    const exchanged = m.learning.exchanged;
    return `<div class="tg-core" id="tg-lesson">
      <h2 id="tg-lesson-title" tabindex="-1">각자 덜 포기하는 재화를 만들면 어떻게 될까요?</h2>
      ${glossary([
        ['특화', '생산에 유리한 재화에 집중해요.'],
        ['국제 분업', '나라별로 서로 다른 재화의 생산을 맡아요.'],
        ['무역', '나라 사이에 재화나 서비스를 거래해요.']
      ])}
      <div class="tg-book-work">
        <section class="tg-check tg-specialization" aria-labelledby="tg-specialization-title">
          <h3 id="tg-specialization-title"><span class="tg-step-badge">1</span> 기회비용으로 특화 방향 찾기</h3>
          ${table('opportunity', {winners: true, visible})}
          ${visible ? '<p class="tg-note"><strong>갑국은 Y재, 을국은 X재에 특화해요.</strong> 각 재화를 만들 때 상대국보다 덜 포기하기 때문이에요.</p>' : '<p class="tg-note">교사가 현재 단계를 공개하면 특화 방향을 확인할 수 있어요.</p>'}
          ${table('cost')}
        </section>
        <section class="tg-check tg-book-action" aria-labelledby="tg-exchange-title">
          <h3 id="tg-exchange-title"><span class="tg-step-badge">2</span> 한 단위씩 주고받기</h3>
          ${visible ? `<p class="tg-book-caption">교환하기 전 생산량</p>
            ${exchangeDiagram()}
            <p class="tg-note">X재와 Y재를 하나씩 직접 만들 때보다 생산비가 줄어드는지 확인해 보세요.</p>`
            : '<p class="tg-note">각 나라가 어떤 재화를 생산해 건네면 좋을지 먼저 예상해 보세요.</p>'}
          <div class="tg-actions">${button(exchanged ? '교환 전으로 돌아가기' : '1:1로 교환해 보기 →', 'book-exchange', {
            primary: !exchanged, attrs: visible ? '' : 'disabled'
          })}${exchanged && visible ? button('문제 연습으로 →', 'tab', {primary: true, attrs: 'data-i="4"'}) : ''}</div>
          ${exchanged && visible ? `<div class="tg-book-result" tabindex="-1" role="region" aria-label="교환 결과">${tradeResult()}</div>` : ''}
        </section>
      </div>
      <p class="tg-source">수업 자료 8~10쪽 · 운송비와 관세를 제외하고 1:1로 교환하는 학습용 예제입니다.</p>
    </div>`;
  }

  function handle(m, action, element) {
    const s = m.learning;
    const step = s.compareStep;
    let focus;
    let scroll;

    switch (action) {
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
      case 'book-exchange':
        if (!shown(m)) return {handled: true};
        s.exchanged = !s.exchanged;
        focus = s.exchanged ? '.tg-book-result' : '[data-tl="book-exchange"]';
        if (s.exchanged) scroll = {selector: focus, block: 'nearest'};
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

  window.GalpiTradeLearning = {initial, compare, book, handle};
})();
