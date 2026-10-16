/* Production-condition infographic and reusable country scenes.
   Decisions stay in GalpiTradeLearning; all numbers use original textbook data. */
(() => {
  'use strict';
  const D = window.GalpiTradeData.textbook;
  const names = ['갑국','을국'];
  const choices = ['갑국','을국','상품마다 다르다'];
  const scene=(country,hero=false)=>window.GalpiLearningArt.country(country,hero);
  function good(i) { return window.GalpiLearningArt.good(i).replace('learning-good','tc-good'); }
  function countryCard(i, selected, reveal) {
    return `<article class="tc-country ${selected===i?'is-picked':''} ${reveal&&i===0?'is-lower':''}" aria-label="${names[i]} 생산 조건"><header><span class="tc-country-dot" aria-hidden="true">${i?'B':'A'}</span><h3>${names[i]}</h3>${selected===i?'<span class="tc-picked">나의 선택</span>':''}</header>${scene(i)}<div class="tc-country-data"><p>재화 1단위 생산 비용 <small>(달러)</small></p>${D.costs[i].map((value,g)=>`<div class="tc-cost-row ${reveal&&i===0?'is-low-cost':''}">${good(g)}<span>${g?'Y':'X'}재</span><strong class="tc-cost-number">${value}<small>달러</small></strong>${reveal&&i===0?'<span class="tc-low-tag">✓ 낮은 비용</span>':''}</div>`).join('')}</div></article>`;
  }
  function comparisons() {
    return `<div class="tc-cost-comparison" aria-label="정답 판단에 사용한 생산비">${[0,1].map(g=>`<div><strong>${g?'Y':'X'}재</strong><span class="tc-low-value">갑국 <b>${D.costs[0][g]}</b></span><span aria-label="보다 작음">&lt;</span><span>을국 <b>${D.costs[1][g]}</b></span><small>${D.costs[1][g]-D.costs[0][g]}달러 더 적음</small></div>`).join('')}</div>`;
  }
  function question(m) {
    const s=m.learning, revealed=s.checked[0]&&(!m.teacher||m.lessonReveal);
    return `<section class="tc-question" aria-label="답 선택"><p class="tc-eyebrow">생각하고 선택하기</p><h3><span class="tc-q" aria-hidden="true">Q</span>어느 나라가 두 상품 모두<br class="tc-desktop-break"> 더 낮은 비용으로 생산할 수 있을까요?</h3><div class="tc-choices" role="group" aria-label="국가 선택">${choices.map((name,i)=>`<button type="button" data-tl="learn-answer" data-value="${i}" aria-pressed="${s.answers[0]===i}" class="tc-choice ${s.answers[0]===i?'is-picked':''}"><span class="tc-radio" aria-hidden="true"></span>${name}</button>`).join('')}</div><button type="button" class="tc-primary" data-tl="learn-check">${s.checked[0]?'선택 다시 확인하기':'선택 결과 확인'} <span aria-hidden="true">→</span></button>${s.feedback?`<p class="tc-hint" role="status">${s.feedback}</p>`:''}${s.checked[0]&&!revealed?'<p class="tc-awaiting" role="status">선택을 확인했습니다. 교사가 현재 단계 결과를 공개하면 판단 근거를 함께 볼 수 있어요.</p>':''}</section>`;
  }
  function feedback(m) {
    if (!m.learning.checked[0] || m.teacher&&!m.lessonReveal) return `<aside class="tc-before-feedback"><span aria-hidden="true">↔</span><p>같은 재화끼리 생산비를 비교해 보세요.<br>선택을 확인하면 판단 근거가 이어집니다.</p></aside>`;
    return `<aside class="tc-feedback" aria-label="정답과 시각적 해설"><header role="status"><span class="tc-success" aria-hidden="true">✓</span><div><p>정답 확인</p><h3 tabindex="-1" id="tc-feedback-title">정답입니다!</h3></div></header><div class="tc-why"><h4>왜 그럴까요?</h4><p>같은 상품을 만드는 데 드는 비용을 비교해요.</p>${comparisons()}<p class="tc-key-concept">갑국은 두 상품 모두 더 낮은 비용으로 생산할 수 있어 <strong>절대우위</strong>를 가집니다.</p></div><div class="tc-next-thought"><h4>그런데, 왜 서로 무역할까요?</h4><p>더 적게 포기하는 상품을 비교하면 새로운 차이가 보입니다.</p><button type="button" class="tc-primary" data-tl="learn-next">다음 단계 · 기회비용 비교 <span aria-hidden="true">→</span></button></div></aside>`;
  }
  function render(m) {
    const s=m.learning,reveal=s.checked[0]&&(!m.teacher||m.lessonReveal);
    return `<div class="tc-activity ${reveal?'tc-revealed':''}"><section class="tc-workspace"><div class="tc-lesson-heading"><span class="tc-lesson-number">01</span><div><h2>생산 조건 비교</h2><p>두 나라가 같은 상품을 만드는 데 필요한 비용을 비교해 볼까요?</p></div><span class="tc-inner-count">개념 1 / 4</span></div><div class="tc-learning-main"><div class="tc-production"><div class="tc-country-pair">${names.map((_,i)=>countryCard(i,s.answers[0],reveal)).join('')}</div><p class="tc-material-note">X재·Y재의 그림은 재화를 구분하기 위한 시각적 기호입니다.</p><details class="tc-source"><summary>생산 조건을 표로 확인</summary><table><caption>${D.source}</caption><thead><tr><th>재화</th><th>갑국</th><th>을국</th></tr></thead><tbody>${[0,1].map(g=>`<tr><th>${g?'Y':'X'}재</th><td>${D.costs[0][g]}</td><td>${D.costs[1][g]}</td></tr>`).join('')}</tbody></table><p>교과서 예제의 공통 자원 비용 모형입니다. 자유 실험의 노동시간 모형과 구분합니다.</p></details></div><div class="tc-response">${question(m)}${feedback(m)}</div></div></section></div>`;
  }
  window.GalpiTradeCompare = {render};
})();
