(() => {
  'use strict';
  const D = window.GalpiHistoryData, V = window.GalpiHistoryViz;
  const host = () => document.querySelector('#content');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const btn = (text, action, attrs = '') => `<button type="button" class="btn ${action==='zoom'?'hl-zoom-control':''}" data-hl="${action}" ${attrs}>${text}</button>`;
  const qs = rotation => ({ order: [0, 1, 2].map(i => (i + rotation) % 3), selected: null, attempts: 0, resolved: false, correct: false, missed: false, message: '' });
  const basicState = i => ({ step: 0, prediction: null, scene: 0, seen: [], lowSeen: [], low: null, view: 'oil', hide: false, completed: false, questions: D.topics[i].questions.map((_, j) => qs((i + j) % 3)), sentences: ['', '', ''] });
  const m = {
    mode: 'basic', topic: 0, teacher: false, reveal: false, zoom: false, results: false, notice: '', copy: '',
    basic: D.topics.map((_, i) => basicState(i)),
    research: [
      { first: 1, second: 3, completed: false, question: qs(1) },
      { low: 0, completed: false, question: qs(2) },
      { cause: 0, metric: 'count', year: 1998, completed: false, question: qs(1) },
      { theme: 0, completed: false, judgments: [0, 1].map(() => ({ initial: '', evidence: [], reason: '', counter: '', final: '', checks: [] })) }
    ]
  };
  const canReveal = () => !m.teacher || m.reveal;
  function sourceLinks(keys) { return `<details class="hl-sources"><summary>역사 설명의 출처 보기</summary>${keys.map(key => { const s = D.sources[key]; return `<a href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a>`; }).join('')}<p>설명·도식은 학습을 위해 새로 작성한 요약입니다. 원문 사료의 직접 인용이나 실제 자금 규모를 나타내지 않습니다.</p></details>`; }
  function qMarkup(q, state, key) {
    const parts = key.split('-'), basicQuestion = parts[0] === 'b';
    const label = basicQuestion ? `개념 확인 ${+parts[2] + 1} / 3` : '자료 해석 · 개념 확인';
    const status = !state.message ? '' : state.resolved && !canReveal() ? 'waiting' : state.correct ? 'correct' : 'retry';
    return `<section class="hl-question" data-feedback="${status}"><p class="hl-question-label">${label}</p><h3 tabindex="-1" id="hl-question-title">${q.prompt}</h3><p class="hl-answer-instruction">답을 하나 고른 뒤 선택을 확인하세요.</p><div class="hl-answer-grid">${state.order.map((index, option) => btn(`<span class="hl-choice-number" aria-hidden="true">${option + 1}</span><span>${q.options[index]}</span>`, 'answer', `data-key="${key}" data-value="${option}" aria-pressed="${state.selected === option}" ${state.resolved ? 'disabled' : ''}`)).join('')}</div>${!state.resolved ? btn('선택 확인하기', 'check', `data-key="${key}"`) : btn('같은 개념 다시 확인하기', 'retry', `data-key="${key}"`)}${state.message ? `<div class="hl-feedback" role="status"><strong>${status === 'waiting' ? '교사 공개 대기' : status === 'correct' ? '✓ 정답입니다' : '↻ 다시 생각해 보세요'}</strong><p>${state.resolved && !canReveal() ? '확인한 결과를 교사가 공개합니다.' : esc(state.message)}</p></div>` : ''}${state.resolved && canReveal() ? `<details ${state.correct ? '' : 'open'}><summary>정확한 관계 확인하기</summary><p>${q.explain}</p></details>` : ''}</section>`;
  }
  function currentQuestion(key) {
    const [mode, topic, index] = key.split('-');
    if (mode === 'b') return [D.topics[+topic].questions[+index], m.basic[+topic].questions[+index]];
    const questions = [
      { prompt: '1962년과 1982년 중화학 공업 비중의 차이는?', options: ['26.5%p 증가', '26.5% 감소', '절대 생산량이 반드시 26.5배 증가'], correct: 0, hint: '55.1에서 28.6을 빼세요. 비중의 차이는 퍼센트포인트(%p)입니다.', explain: '55.1% − 28.6% = 26.5%p입니다. 비중 증가만으로 절대 생산량의 증가 폭을 알 수는 없습니다.' },
      { prompt: '제공된 무역 수지 자료에서 적자에서 흑자로 바뀐 첫해는?', options: ['1986년', '1983년', '1990년'], correct: 0, hint: '0보다 작은 값에서 0보다 큰 값으로 바뀐 곳을 찾아보세요.', explain: '1985년 −8.52억 달러에서 1986년 +31.30억 달러로 전환됩니다. 이 계열은 경상 수지가 아닌 무역 수지입니다.' },
      { prompt: '1996년 대비 1998년 실업자 수의 변화는?', options: ['1,055천 명 증가', '1,055% 증가', '성장률과 실업자 수의 단위가 같음'], correct: 0, hint: '1,490에서 435를 빼고 표의 단위인 천 명을 붙이세요.', explain: '1,490 − 435 = 1,055천 명, 즉 105만 5천 명 증가입니다. 성장률(%)과 인원(천 명)은 별개의 지표입니다.' }
    ];
    return [questions[+topic], m.research[+topic].question];
  }
  function topicScenes(i) { return i === 2 ? D.crisisFlow : D.topics[i].scenes; }
  function diagram(i, state) {
    const scenes = topicScenes(i), scene = scenes[state.scene];
    const flow = `<div class="hl-flow" aria-label="설명 과정">${scenes.map((x, n) => `<span class="${state.scene === n ? 'hl-current' : ''}">${n <= state.scene ? x.title : `${n + 1}번째 관계`}</span>`).join('<span class="hl-arrow" aria-hidden="true">→</span>')}</div>`;
    if (i === 1 && state.view === 'lows') return `<h3>세 조건을 하나씩 열어 보세요.</h3><div class="hl-low-cards">${D.lows.map((x, j) => btn(`${V.icon(x.icon)}<span>${x.title}</span>${state.lowSeen.includes(j) ? '<small>확인 ✓</small>' : ''}`, 'low-card', `data-value="${j}" aria-pressed="${state.low === j}"`)).join('')}</div>${state.low !== null ? `<div class="hl-scene"><h3>${D.lows[state.low].effect}</h3>${!state.hide && canReveal() ? `<p>${D.lows[state.low].context}</p>` : '<p class="ex-caption">설명이 가려졌습니다. 그림과 조건을 보고 관계를 설명해 보세요.</p>'}</div>` : '<p>세 카드 중 하나를 선택해 주세요.</p>'}${state.lowSeen.length === 3 ? '<div class="hl-combined"><span>유리한 국제 여건 세 가지</span><b aria-hidden="true">→</b><span>수출 성장에 도움</span><b aria-hidden="true">→</b><strong>3저 호황</strong></div><p class="ex-caption">국내 산업·정책·대외 수요 등 다른 조건도 함께 작용했습니다.</p>' : `<p>확인한 조건 ${state.lowSeen.length}/3</p>`}`;
    return `${flow}<section class="hl-scene">${V.icon(scene.icon, scene.title)}<div><p class="hl-step-count">그림 ${state.scene + 1}/${scenes.length}</p><h3>${scene.title}</h3>${scene.tags ? `<div class="hl-tags">${scene.tags.map(t => `<span>${t}</span>`).join('')}</div>` : ''}${!state.hide && canReveal() ? `<p>${scene.text}</p>` : '<p class="ex-caption">설명이 가려졌습니다. 그림의 의미를 먼저 설명해 보세요.</p>'}</div></section><div class="hl-actions">${btn('← 앞 그림', 'scene-prev', state.scene === 0 ? 'disabled' : '')}${btn(state.scene + 1 === scenes.length ? '마지막 그림 확인 ✓' : '다음 그림 →', 'scene-next', state.scene + 1 === scenes.length ? 'disabled' : '')}${btn(state.hide ? '설명 다시 보기' : '설명 가리기', 'hide-explanation', `aria-pressed="${state.hide}"`)}</div>${i === 0 && state.scene === 1 ? `<h3>실제 비중도 달라졌을까요?</h3>${V.industry([D.industry[1], D.industry[3]], D.sources.industry)}<p class="ex-caption">비중의 변화이며 절대 생산량을 뜻하지 않습니다. 연도별 분석은 심화편에서 확인합니다.</p>` : ''}${i === 2 ? '<p class="ex-caption">단순화한 금융 흐름입니다. 그림·화살표의 크기는 실제 금액이나 거래량을 뜻하지 않습니다.</p>' : ''}`;
  }
  function basic() {
    const i = m.topic, s = m.basic[i], topic = D.topics[i], n = s.step;
    const steps = `<ol class="hl-step-nav">${D.steps.map((t, j) => `<li ${n === j ? 'aria-current="step"' : ''}><span>${j < n ? '✓' : j + 1}</span>${t}</li>`).join('')}</ol>`;
    let body;
    if (n === 0) body = `<div class="studio-history-opening"><div>${V.icon(['factory','oil','bank','people'][i])}<span class="studio-eyebrow">나의 생각에서 출발하기</span></div><section><h2>${topic.intro}</h2><p>예상에는 점수를 매기지 않습니다. 생각을 고르고 그림으로 확인해 보세요.</p><div class="hl-answer-grid">${topic.predictions.map((x, j) => btn(x, 'predict', `data-value="${j}" aria-pressed="${s.prediction === j}"`)).join('')}</div></section></div>`;
    else if (n === 1) body = `<h2>${topic.question}</h2>${i === 1 ? `<div class="ex-options">${btn('A · 석유값이 오르면', 'world-view', `data-value="oil" aria-pressed="${s.view === 'oil'}"`)}${btn('B · 3저의 유리한 조건', 'world-view', `data-value="lows" aria-pressed="${s.view === 'lows'}"`)}</div>` : ''}${diagram(i, s)}`;
    else body = `${n === 3 ? '<p class="hl-recall"><strong>그림과 해설을 가렸습니다.</strong> 기억에서 관계를 꺼내 보세요. 필요하면 이전 단계로 돌아가 확인할 수 있습니다.</p>' : ''}${qMarkup(topic.questions[n - 2], s.questions[n - 2], `b-${i}-${n - 2}`)}${n === 4 && i === 2 ? `<h3>1998년의 경제와 삶</h3><figure><div class="hl-stat-cards"><div>경제 성장률<strong>${D.crisis[2][1]}%</strong></div><div>실업자 수<strong>${D.crisis[2][3] / 10}만 명</strong></div><div>실업률<strong>${D.crisis[2][2].toFixed(1)}%</strong></div></div>${V.source(D.sources.crisis)}</figure><p class="ex-caption">위기의 원인을 한 지표만으로 판단하지 않습니다. 심화편에서 변화 추이를 비교해 보세요.</p>` : ''}${n === 4 && i === 3 ? `<h3>성과와 한계를 함께 설명해 보세요.</h3>${['대한민국 경제 성장의 성과는', '경제 성장 과정에서 발생한 문제는', '두 가지를 함께 고려하면'].map((t, j) => `<label class="ex-field">${t}<textarea data-hl-sentence="${j}" maxlength="400" placeholder="자신의 말로 한 문장을 완성하세요.">${esc(s.sentences[j])}</textarea></label>`).join('')}<div class="hl-timeline">${['산업화', '석유 파동', '3저 호황', '외환위기'].map(t => `<span>${t}</span>`).join('<span aria-hidden="true">→</span>')}</div><p class="ex-caption">시간 순서이며 앞 사건이 다음 사건의 유일한 원인이라는 뜻은 아닙니다.</p>` : ''}`;
    return `${steps}<div class="hl-workspace">${body}</div>${m.notice ? `<p class="hl-feedback" role="status">${esc(m.notice)}</p>` : ''}<div class="hl-actions">${n > 0 ? btn('← 이전 단계', 'previous') : ''}${n < 4 ? btn('다음 단계 →', 'next') : btn(s.completed ? '주제 완료 ✓ · 결과 확인' : '이 주제 학습 마치기', 'complete-basic')}${btn('이 주제 다시 시작하기', 'restart-topic')}</div>${s.completed ? `<aside class="hl-completion"><h3>이해한 원리를 실제 자료에 적용해 볼까요?</h3>${btn(`${D.researchTitles[i]}로 →`, 'switch-mode', 'data-value="research"')}${i < 3 ? btn('다음 기본 주제 →', 'topic', `data-value="${i + 1}"`) : btn('기본편 학습 결과', 'results')}</aside>` : ''}${sourceLinks(i === 0 ? ['policy'] : i === 1 ? ['oil', 'lows'] : i === 2 ? ['imf', 'repayment'] : ['policy', 'labor'])}`;
  }
  function yearOptions(rows, selected) { return rows.map((r, i) => `<option value="${i}" ${selected === i ? 'selected' : ''}>${r[0]}년</option>`).join(''); }
  function finishResearch(i) { return `${qMarkup(currentQuestion(`r-${i}`)[0], m.research[i].question, `r-${i}`)}${m.notice ? `<p class="hl-feedback" role="status">${esc(m.notice)}</p>` : ''}${btn(m.research[i].completed ? '연구 완료 ✓ · 결과 확인' : '이 연구 활동 마치기', 'complete-research')}`; }
  function industryResearch() {
    const s = m.research[0], a = D.industry[s.first], b = D.industry[s.second], delta = Math.round((b[1] - a[1]) * 10) / 10;
    return `<h2>산업의 비중은 어떻게 달라졌을까요?</h2><p>두 연도를 골라 중화학 공업과 경공업의 비중을 비교하세요.</p><div class="hl-select-row"><label class="ex-field">첫 시점<select data-hl-select="first">${yearOptions(D.industry, s.first)}</select></label><label class="ex-field">두 번째 시점<select data-hl-select="second">${yearOptions(D.industry, s.second)}</select></label></div>${V.industry(D.industry, D.sources.industry, [a[0], b[0]])}<p class="hl-feedback" role="status">${a[0]}년 ${a[1].toFixed(1)}% → ${b[0]}년 ${b[1].toFixed(1)}%<br>중화학 공업 비중 ${delta > 0 ? '+' : ''}${delta.toFixed(1)}%p · ${delta === 0 ? '같음' : delta > 0 ? '증가' : '감소'}</p><details><summary>관련 정책과 해석의 주의점</summary><p>1960년대 수출 중심 경공업 성장과 1970년대 중화학 공업 육성 등이 산업 구조 변화에 영향을 주었습니다. 비중 증가는 전체에서 차지하는 몫의 변화이며 절대 생산량의 변화와 같지 않습니다.</p></details><p class="hl-inquiry">탐구: 중화학 공업 비중이 높아진 배경과 한국 경제에 준 영향을 설명해 보세요.</p>${finishResearch(0)}${sourceLinks(['policy'])}`;
  }
  function worldResearch() {
    const s = m.research[1];
    return `<h2>같은 한국 경제가 왜 위기와 호황을 겪었을까요?</h2><div class="hl-two-cards"><section><h3>제1차 석유 파동 · 1973~1974년</h3>${V.icon('oil')}<p>중동 전쟁과 산유국의 정책이 공급에 영향을 주며 유가가 급등했습니다. 한국은 수입 에너지 비용과 국제 경기 침체의 영향을 받았습니다.</p></section><section><h3>제2차 석유 파동 · 1978~1980년</h3>${V.icon('factory')}<p>이란 혁명 등으로 공급이 불안해졌습니다. 국내 중화학 공업의 과잉·중복 투자 문제와 물가 부담 등이 맞물렸습니다.</p></section></div><h3>3저의 각 조건 확인</h3><div class="ex-options">${D.lows.map((x, i) => btn(x.title, 'research-low', `data-value="${i}" aria-pressed="${s.low === i}"`)).join('')}</div><p class="hl-feedback">${D.lows[s.low].effect}<br>${D.lows[s.low].context}</p>${V.diverging(D.trade, '무역 수지 · 1983~1990년', '억 달러', D.sources.trade, 100)}<p class="ex-caption">0 위의 양수는 흑자, 음수는 적자입니다. 흑자라는 사실만으로 모두의 생활이 개선되었다고 판단하지 않습니다. 1989~1990년의 변화도 함께 확인하세요.</p><p class="hl-inquiry">탐구: 1986~1988년의 개선을 오직 3저만으로 설명할 수 있을까요?</p>${finishResearch(1)}${sourceLinks(['oil', 'lows'])}`;
  }
  function crisisResearch() {
    const s = m.research[2], selected = D.crisis.find(r => r[0] === s.year);
    return `<h2>국내 취약성과 국제 충격은 어떻게 연결됐을까요?</h2><div class="hl-cause-menu">${D.crisisFlow.map((x, i) => btn(x.cause, 'cause', `data-value="${i}" aria-pressed="${s.cause === i}"`)).join('')}</div><section class="hl-scene">${V.icon(D.crisisFlow[s.cause].icon)}<div><h3>${D.crisisFlow[s.cause].title}</h3><p>${D.crisisFlow[s.cause].text}</p><div class="hl-flow">${(s.cause < 2 ? ['해외 금융기관', '국내 금융기관', '기업'] : s.cause < 4 ? ['해외 자금 회수·차입 어려움', '국내 외화 부족'] : ['외화 부족 대응', '정부의 IMF 지원 요청']).map(x => `<span>${x}</span>`).join('<span aria-hidden="true">→</span>')}</div></div></section><p class="ex-caption">학습용 금융 흐름이며 화살표의 굵기나 그림의 크기가 실제 거래 규모는 아닙니다. 여러 국내외 요인이 결합한 위기입니다.</p>${canReveal() ? `${V.diverging(D.crisis.map(r => [r[0], r[1]]), '경제 성장률', '%', D.sources.crisis, 15)}<label class="ex-field">함께 볼 별도 지표<select data-hl-select="metric"><option value="count" ${s.metric === 'count' ? 'selected' : ''}>실업자 수 · 천 명</option><option value="rate" ${s.metric === 'rate' ? 'selected' : ''}>실업률 · %</option></select></label>${V.amounts(D.crisis.map(r => [r[0], s.metric === 'count' ? r[3] : r[2]]), s.metric === 'count' ? '실업자 수' : '실업률', s.metric === 'count' ? '천 명' : '%', D.sources.crisis, s.metric === 'count' ? 1600 : 8)}<label class="ex-field">한 해의 지표 확인<select data-hl-select="year">${D.crisis.map(r => `<option value="${r[0]}" ${s.year === r[0] ? 'selected' : ''}>${r[0]}년</option>`).join('')}</select></label><p class="hl-feedback">${s.year}년 · 성장률 ${selected[1].toFixed(1)}% / 실업률 ${selected[2].toFixed(1)}% / 실업자 ${selected[3].toLocaleString('ko-KR')}천 명</p>` : '<p class="ex-empty">지표 변화를 예측한 뒤 교사의 현재 결과 공개로 확인하세요.</p>'}<details><summary>위기 극복과 사회의 변화</summary><p>IMF 지원과 경제 구조 조정, 정부와 국민의 대응, 금 모으기 운동 등 여러 노력이 이루어졌습니다. IMF 차입금은 2001년에 조기 상환했지만 회복 과정의 실업과 노동시장 변화도 함께 검토해야 합니다. 금 모으기 운동만으로 모든 외환 문제를 해결한 것은 아닙니다.</p></details><p class="hl-inquiry">탐구: 경제적 회복과 국민이 겪은 사회적 부담을 함께 살펴야 하는 이유는?</p>${finishResearch(2)}${sourceLinks(['imf', 'repayment'])}`;
  }
  function judgmentResearch() {
    const r = m.research[3], s = r.judgments[r.theme];
    return `<h2>성장과 회복의 성과·한계를 어떻게 평가할까요?</h2>${window.GalpiLearningArt.pathway([['people','나의 최초 의견',`<span data-hl-visual="initial">${s.initial.trim()?'작성한 생각을 돌아봐요':'먼저 생각을 기록해요'}</span>`],['certificate','자료와 근거',`<span data-hl-visual="evidence">${s.evidence.length}개 자료 선택</span>`],['idea','나의 최종 판단',`<span data-hl-visual="final">${s.final.trim()?'근거와 함께 비교해요':'자료를 읽고 판단해요'}</span>`]])}<div class="ex-options">${['A · 국가 주도 경제 개발', 'B · 외환위기 극복'].map((t, i) => btn(t, 'theme', `data-value="${i}" aria-pressed="${r.theme === i}"`)).join('')}</div><label class="ex-field">1 · 나의 최초 의견<textarea data-hl-draft="initial" maxlength="800" placeholder="성과와 한계에 대한 최초 생각을 써 보세요.">${esc(s.initial)}</textarea></label><h3>2 · 주장을 뒷받침할 자료 선택</h3><p class="ex-caption">교과서 관련 주제를 새로 요약한 자료 카드입니다. 원사료의 인용문이나 교과서 페이지를 복제한 자료는 아닙니다.</p><div class="hl-archive">${D.archive.map(x => `<article><label class="hl-evidence-label"><input type="checkbox" data-hl-evidence="${x.id}" ${s.evidence.includes(x.id) ? 'checked' : ''}><span>${x.id} · ${x.title}</span></label><p>${x.text}</p><small>관련 교과서 ${x.pages} · ${x.lens}</small>${x.record?`<details class="hl-record"><summary>${x.record.title}</summary><p>${x.record.date} · ${x.record.text}</p><a href="${D.sources[x.record.source].url}" target="_blank" rel="noopener">${D.sources[x.record.source].label} 원문 ↗</a><p>${x.record.question}</p></details>`:''}<details><summary>관련 역사 설명의 출처</summary><a href="${D.sources[x.source].url}" target="_blank" rel="noopener">${D.sources[x.source].label} ↗</a></details></article>`).join('')}</div><label class="ex-field">3 · 선택한 자료가 내 주장을 뒷받침하는 이유<textarea data-hl-draft="reason" maxlength="1000">${esc(s.reason)}</textarea></label><label class="ex-field">4 · 다른 관점과 모둠 토론에서 확인한 점<textarea data-hl-draft="counter" maxlength="800" placeholder="누가 다른 영향을 받았는지, 자료가 충분한지 생각해 보세요.">${esc(s.counter)}</textarea></label><label class="ex-field">5 · 나의 최종 판단<textarea data-hl-draft="final" maxlength="1000">${esc(s.final)}</textarea></label><div class="hl-two-cards"><section><h3>최초 의견</h3><p class="hl-user-copy" data-hl-preview="initial">${esc(s.initial || '아직 작성하지 않았습니다.')}</p></section><section><h3>최종 판단</h3><p class="hl-user-copy" data-hl-preview="final">${esc(s.final || '아직 작성하지 않았습니다.')}</p></section></div><fieldset class="hl-selfcheck"><legend>나의 논증 점검 · 의견에 정오 점수를 매기지 않습니다.</legend>${['역사적 사실과 의견을 구분했다', '자료의 단위와 시점을 확인했다', '자료가 주장을 지지하는 이유를 설명했다', '다른 주체·관점을 고려했다'].map((t, i) => `<label><input type="checkbox" data-hl-selfcheck="${i}" ${s.checks.includes(i) ? 'checked' : ''}>${t}</label>`).join('')}</fieldset><details><summary>선택 확장 · 두 경제위기 비교</summary><div class="hl-two-cards"><section><h3>석유 파동</h3><p>국제 에너지 공급 충격 → 생산비·물가 부담. 국내의 산업 구조와 투자 상황도 검토합니다.</p></section><section><h3>1997 외환위기</h3><p>국제 자금 흐름의 변화와 기업·금융 취약성 → 외화 유동성 부족. 금융·기업 구조 조정과 사회적 부담을 검토합니다.</p></section></div><p>국제 충격의 종류, 국내 취약성, 정부의 대응, 국민 생활의 영향을 기준으로 비교하세요.</p></details>${m.notice ? `<p class="hl-feedback" role="status">${esc(m.notice)}</p>` : ''}${btn(r.completed ? '연구 완료 ✓ · 결과 확인' : '이 연구 활동 마치기', 'complete-research')}`;
  }
  function updateJudgmentVisual() {
    const draft=m.research[3].judgments[m.research[3].theme];
    const copy={initial:draft.initial.trim()?'작성한 생각을 돌아봐요':'먼저 생각을 기록해요',evidence:draft.evidence.length+'개 자료 선택',final:draft.final.trim()?'근거와 함께 비교해요':'자료를 읽고 판단해요'};
    Object.entries(copy).forEach(([key,text])=>{const node=host().querySelector(`[data-hl-visual="${key}"]`);if(node)node.textContent=text;});
  }
  function resultsText() {
    const lines = ['갈피 · 대한민국 경제 변화 연구소', m.mode === 'basic' ? '개념 이해편 (기본)' : '자료 탐구편 (심화)'];
    if (m.mode === 'basic') {
      m.basic.forEach((s, i) => { lines.push(`${D.titles[i]}: ${s.completed ? '완료' : '학습 중'} / 정답 ${s.questions.filter(q => q.correct).length}/3`); const missed = s.questions.map((q, j) => q.missed || q.resolved && !q.correct ? D.topics[i].questions[j].prompt : null).filter(Boolean); if (missed.length) lines.push(`다시 확인: ${missed.join(' / ')}`); if (i === 3) s.sentences.forEach((t, j) => { if (t.trim()) lines.push(`${['성과', '문제', '나의 판단'][j]}: ${t}`); }); });
    } else {
      m.research.forEach((s, i) => lines.push(`${D.researchTitles[i]}: ${s.completed ? '완료' : '탐구 중'}`));
      m.research[3].judgments.forEach((s, i) => { if (s.initial || s.final || s.evidence.length) lines.push(`주제 ${i === 0 ? '국가 주도 경제 개발' : '외환위기 극복'}`, `최초 의견: ${s.initial}`, `선택 자료: ${s.evidence.map(id => `${id} ${D.archive.find(x => x.id === id).title}`).join(', ')}`, `근거: ${s.reason}`, `다른 관점: ${s.counter}`, `최종 판단: ${s.final}`); });
    }
    return lines.join('\n');
  }
  function results() {
    const text = resultsText(), completed = (m.mode === 'basic' ? m.basic : m.research).filter(x => x.completed).length;
    const correct = m.basic.flatMap(x => x.questions).filter(q => q.correct).length, checked = m.basic.flatMap(x => x.questions).filter(q => q.resolved).length;
    return `<h2>이번 화면에서 확인한 학습 결과</h2><p>완료한 ${m.mode === 'basic' ? '주제' : '연구 활동'} ${completed}/4${m.mode === 'basic' ? ` · 확인한 문항 ${checked}/12 · 정답 ${correct}개` : ''}</p><p class="ex-caption">정답 수는 현재 풀이 기준입니다. 힌트 후 재시도할 수 있으며 한 번이라도 틀렸던 개념은 복습 목록에 남습니다. 주제·연구 의견의 방향은 자동 채점하지 않습니다.</p><textarea id="hl-copy" class="hl-result-copy" readonly aria-label="텍스트로 가져갈 학습 결과">${esc(text)}</textarea><div class="hl-actions">${btn('결과 텍스트 복사', 'copy')}${btn('학습으로 돌아가기', 'resume')}</div>${m.copy ? `<p role="status">${esc(m.copy)}</p>` : ''}`;
  }
  function render(focus) {
    const basicMode = m.mode === 'basic', labels = basicMode ? D.titles : D.researchTitles;
    host().innerHTML = `<section class="history-lab expansion learning-v2 ${m.zoom ? 'hl-projector' : ''}" data-mode="${m.mode}" data-topic="${m.topic}"><div class="ex-top"><button type="button" class="btn" data-action="goHome">← 전체 콘텐츠</button><div class="hl-top-controls">${window.GalpiCurriculum.teacher('history', 'data-hl-teacher', m.teacher)}${m.teacher ? btn(m.reveal ? '현재 결과 다시 가리기' : '현재 결과 공개', 'reveal') : ''}${btn(m.zoom ? '화면 크기 원래대로' : '큰 화면에서 확대', 'zoom', `aria-pressed="${m.zoom}"`)}</div></div><header class="ex-heading learning-header"><div><div class="curriculum-card"><p class="curriculum-path"><span>한국사2</span><span><span aria-hidden="true">/ </span>Ⅱ. 대한민국의 발전 / Ⅲ. 오늘날의 대한민국</span></p><p class="curriculum-detail"><span>경제 변화와 국민의 삶</span><span>112~116쪽 · 136~137쪽</span></p></div><h1>대한민국 경제 변화 연구소 <small>${basicMode ? '(기본)' : '(심화)'}</small></h1><p>${basicMode ? '그림으로 이해하는 한국 경제사' : '데이터와 사료로 탐구하는 한국 경제사'}</p></div>${window.GalpiLabUI.illustration('history')}</header><div class="hl-mode-links">${btn(basicMode ? '관련 심화 자료로 →' : '관련 기본 개념으로 →', 'switch-mode', `data-value="${basicMode ? 'research' : 'basic'}"`)}${btn('학습 결과', 'results')}</div><div class="ex-tabs hl-tabs" role="tablist" aria-label="${basicMode ? '기본 주제' : '심화 연구'}">${labels.map((t, i) => `<button type="button" id="hl-tab-${i}" role="tab" data-hl="topic" data-value="${i}" aria-controls="hl-panel" aria-selected="${m.topic === i}" tabindex="${m.topic === i ? '0' : '-1'}"><small>0${i + 1}${(basicMode ? m.basic : m.research)[i].completed ? ' ✓' : ''}</small>${t}</button>`).join('')}</div><div class="hl-location"><span>${m.results ? '학습 결과' : `0${m.topic + 1} · ${labels[m.topic]}`}</span><span>${basicMode ? '개념 이해편' : '자료 탐구편'}</span></div><div id="hl-panel" role="tabpanel" aria-labelledby="hl-tab-${m.topic}">${m.results ? results() : basicMode ? basic() : [industryResearch, worldResearch, crisisResearch, judgmentResearch][m.topic]()}</div><p class="ex-caption">활동은 현재 탭에만 임시로 남습니다. 새로고침하면 초기화됩니다. 이름·학번은 쓰지 마세요.</p></section>`;
    window.GalpiLabUI.mount(host());
    if(focus){const target=document.querySelector(focus);if(target){if(/^H[1-6]$/.test(target.tagName))target.tabIndex=-1;target.focus({preventScroll:true});}}
  }
  function open(mode = 'basic', topic = D.keys[m.topic]) {
    m.mode = mode === 'research' ? 'research' : 'basic';
    m.topic = Math.max(0, D.keys.indexOf(topic)); m.results = false; m.notice = ''; m.reveal = false;
    if (m.mode === 'basic' && m.basic[m.topic].step === 1 && !m.basic[m.topic].seen.length) m.basic[m.topic].seen.push(0);
    document.body.classList.remove('teacher-mode'); setNav('history');
    const hash = `#history-${m.mode}/${D.keys[m.topic]}`;
    if (location.hash !== hash) location.hash = hash;
    render(); host().focus({ preventScroll: true }); scrollTo(0, 0);
  }
  function answerCheck(key) {
    const [q, s] = currentQuestion(key);
    if (s.selected === null) { s.message = '먼저 답을 선택해 주세요.'; return; }
    s.attempts++;
    const correct = s.order[s.selected] === q.correct;
    if (correct) { s.resolved = true; s.correct = true; s.message = '맞았습니다. 관계를 자신의 말로 설명해 보세요.'; }
    else { s.missed = true; s.correct = false; s.message = s.attempts === 1 ? `힌트: ${q.hint} 선택을 바꿔 다시 확인할 수 있습니다.` : `정확한 관계: ${q.explain}`; s.resolved = s.attempts >= 2; }
  }
  document.addEventListener('click', async event => {
    const b = event.target.closest('.history-lab [data-hl]'); if (!b) return;
    const action = b.dataset.hl, value = b.dataset.value, s = m.basic[m.topic]; m.notice = ''; m.copy = '';
    if (action === 'topic') { open(m.mode, D.keys[+value]); document.querySelector(`#hl-tab-${value}`)?.focus({ preventScroll: true }); return; }
    if (action === 'switch-mode') { open(value, D.keys[m.topic]); return; }
    if (action === 'predict') s.prediction = +value;
    else if (action === 'scene-next') { s.scene = Math.min(topicScenes(m.topic).length - 1, s.scene + 1); if (!s.seen.includes(s.scene)) s.seen.push(s.scene); m.reveal = false; }
    else if (action === 'scene-prev') { s.scene = Math.max(0, s.scene - 1); m.reveal = false; }
    else if (action === 'hide-explanation') s.hide = !s.hide;
    else if (action === 'world-view') { s.view = value; m.reveal = false; }
    else if (action === 'low-card') { s.low = +value; if (!s.lowSeen.includes(+value)) s.lowSeen.push(+value); m.reveal = false; }
    else if (action === 'research-low') m.research[1].low = +value;
    else if (action === 'cause') { m.research[2].cause = +value; m.reveal = false; }
    else if (action === 'theme') m.research[3].theme = +value;
    else if (action === 'answer') { const [, q] = currentQuestion(b.dataset.key); if (!q.resolved) { q.selected = +value; q.message = ''; } }
    else if (action === 'check') answerCheck(b.dataset.key);
    else if (action === 'retry') { const [, q] = currentQuestion(b.dataset.key); Object.assign(q, { selected: null, attempts: 0, resolved: false, correct: false, message: '' }); const [mode,topic]=b.dataset.key.split('-');(mode==='b'?m.basic:m.research)[+topic].completed=false; }
    else if (action === 'previous') { s.step = Math.max(0, s.step - 1); m.reveal = false; }
    else if (action === 'next') {
      if (s.step === 0 && s.prediction === null) m.notice = '예상을 하나 골라 주세요. 모르겠다면 관계부터 확인하는 선택도 가능합니다.';
      else if (s.step === 1 && s.seen.length < topicScenes(m.topic).length) m.notice = '다음 그림을 눌러 모든 관계를 먼저 확인해 주세요.';
      else if (s.step === 1 && m.topic === 1 && s.lowSeen.length < 3) m.notice = 'B · 3저의 유리한 조건에서 세 카드를 모두 확인해 주세요.';
      else if (s.step >= 2 && !s.questions[s.step - 2].resolved) m.notice = '현재 질문의 답을 선택하고 확인해 주세요. 힌트 뒤에도 재시도할 수 있습니다.';
      else { s.step = Math.min(4, s.step + 1); if (s.step === 1 && !s.seen.includes(0)) s.seen.push(0); m.reveal = false; }
    } else if (action === 'restart-topic') { m.basic[m.topic] = basicState(m.topic); m.reveal = false; }
    else if (action === 'complete-basic') {
      if (!s.questions[2].resolved) m.notice = '마지막 역사 연결 질문을 먼저 확인해 주세요.';
      else if (m.topic === 3 && s.sentences.some(x => !x.trim())) m.notice = '성과·문제·나의 판단 세 문장을 완성해 주세요. 의견의 방향에는 정오 점수를 매기지 않습니다.';
      else if (s.completed) { m.results = true; }
      else s.completed = true;
    } else if (action === 'complete-research') {
      const r = m.research[m.topic];
      if (m.topic < 3 && !r.question.resolved) m.notice = '자료 해석 질문을 먼저 확인해 주세요.';
      else if (m.topic === 3) {
        const draft = r.judgments[r.theme];
        if (!draft.initial.trim()) m.notice = '최초 의견을 먼저 작성해 주세요.';
        else if (!draft.evidence.length) m.notice = '주장을 뒷받침할 자료를 하나 이상 선택해 주세요.';
        else if (!draft.reason.trim()) m.notice = '자료가 주장을 뒷받침하는 이유를 설명해 주세요.';
        else if (!draft.counter.trim()) m.notice = '다른 관점이나 모둠 토론에서 확인한 점을 작성해 주세요.';
        else if (!draft.final.trim()) m.notice = '최종 판단을 작성해 주세요.';
        else { if (r.completed) m.results = true; r.completed = true; }
      } else { if (r.completed) m.results = true; r.completed = true; }
    } else if (action === 'results') m.results = true;
    else if (action === 'resume') m.results = false;
    else if (action === 'reveal') m.reveal = !m.reveal;
    else if (action === 'zoom') m.zoom = !m.zoom;
    else if (action === 'copy') {
      const text = resultsText();
      try { await navigator.clipboard.writeText(text); m.copy = '결과 텍스트를 복사했습니다.'; }
      catch (_) { const field = document.querySelector('#hl-copy'); field.focus(); field.select(); m.copy = '텍스트를 선택했습니다. 기기의 복사 기능으로 가져갈 수 있습니다.'; const message = document.createElement('p'); message.setAttribute('role', 'status'); message.textContent = m.copy; field.after(message); return; }
    }
    render(['next', 'previous', 'scene-next', 'scene-prev', 'check'].includes(action) ? '#hl-question-title, #hl-panel h2, #hl-panel h3' : `[data-hl="${action}"]${value !== undefined ? `[data-value="${value}"]` : ''}`);
  });
  document.addEventListener('input', event => {
    const t = event.target; if (!t.closest('.history-lab')) return;
    if (t.matches('[data-hl-sentence]')) {m.basic[m.topic].sentences[+t.dataset.hlSentence] = t.value;if(!t.value.trim())m.basic[m.topic].completed=false;}
    if (t.matches('[data-hl-draft]')) { const r = m.research[3]; r.judgments[r.theme][t.dataset.hlDraft] = t.value; r.completed = false;const preview=document.querySelector(`[data-hl-preview="${t.dataset.hlDraft}"]`);if(preview)preview.textContent=t.value||'아직 작성하지 않았습니다.'; updateJudgmentVisual(); }
  });
  document.addEventListener('change', event => {
    const t = event.target; if (!t.closest('.history-lab')) return;
    if (t.matches('[data-hl-teacher]')) { m.teacher = t.checked; m.reveal = false; render('[data-hl-teacher]'); }
    if (t.matches('[data-hl-select]')) { const r = m.research[m.topic], key = t.dataset.hlSelect; r[key] = ['first', 'second', 'year'].includes(key) ? +t.value : t.value; m.reveal = false; render(`[data-hl-select="${key}"]`); }
    if (t.matches('[data-hl-evidence]')) { const r = m.research[3], draft = r.judgments[r.theme], id = t.dataset.hlEvidence; draft.evidence = t.checked ? [...new Set([...draft.evidence, id])] : draft.evidence.filter(x => x !== id); r.completed = false; updateJudgmentVisual(); }
    if (t.matches('[data-hl-selfcheck]')) { const r = m.research[3], draft = r.judgments[r.theme], index = +t.dataset.hlSelfcheck; draft.checks = t.checked ? [...new Set([...draft.checks, index])] : draft.checks.filter(x => x !== index); }
  });
  document.addEventListener('keydown', event => {
    const t = event.target.closest('.history-lab [role="tab"]'); if (!t || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const i = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (+t.dataset.value + (event.key === 'ArrowRight' ? 1 : 3)) % 4;
    open(m.mode, D.keys[i]); document.querySelector(`#hl-tab-${i}`)?.focus({ preventScroll: true });
  });
  window.GalpiHistory = { open, snapshot: () => JSON.parse(JSON.stringify(m)) };
  document.addEventListener('DOMContentLoaded', () => { const match = location.hash.match(/^#history-(basic|research)(?:\/([^/]+))?$/); if (match) open(match[1], match[2] || D.keys[0]); });
})();
