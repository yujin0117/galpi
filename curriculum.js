/* Shared curriculum labels. Learning state and calculations stay in each module. */
(() => {
  'use strict';
  const lessons = Object.freeze({
    cost: { unit: '3-2. 합리적 선택', pages: '74~75쪽' },
    ripple: { unit: '3-3. 시장 참여자의 역할과 책임', pages: '78~83쪽' },
    intervention: { unit: '3-3. 시장 참여자의 역할과 책임', pages: '78~79쪽', note: '보완 실험' },
    finance: { unit: '3-4. 자산 관리와 금융 생활 설계', pages: '84~89쪽' },
    trade: { unit: '3-5. 국제 분업과 무역', pages: '90~95쪽' }
  });
  window.GalpiCurriculum = Object.freeze({
    teacher(key, attributes, checked) {
      return `<div class="teacher-setting"><label><input type="checkbox" ${attributes} ${checked ? 'checked' : ''}><span>교사 시연 모드</span></label><button type="button" class="teacher-help" data-teacher-help="${key}" aria-label="교사 시연 모드 설명" aria-expanded="false" aria-controls="teacher-help-panel"><span aria-hidden="true">?</span></button></div>`;
    },
    header(key) {
      const lesson = lessons[key];
      if (!lesson) throw new Error(`Unknown GALPI lesson: ${key}`);
      return `<div class="curriculum-card" aria-label="단원 정보"><p class="curriculum-path"><span>통합사회2</span><span class="curriculum-chapter"><span aria-hidden="true">/ </span>Ⅲ. 시장경제와 지속가능발전</span></p><p class="curriculum-detail"><span>${lesson.unit}</span><span class="curriculum-pages">${lesson.pages}${lesson.note ? ` · ${lesson.note}` : ''}</span></p></div>`;
    }
  });
  const help = {
    cost: '수업 화면을 함께 보며 풀이를 진행하는 모드입니다. 큰 화면에서 풀이 글자와 버튼이 커집니다. 교과서 예제 탭의 ‘다음 단계’로 풀이를 한 단계씩 보여 주세요. 모바일에서는 크기 변화가 작을 수 있습니다.',
    ripple: '큰 화면에서 설명과 조작 버튼을 키워 함께 보기 편하게 합니다. 선택 후 다음 단계로 이동하며 정보를 살펴보세요. 결과를 자동으로 가리지는 않으며, 의견에 정답을 매기지 않습니다. 모바일에서는 크기 변화가 작을 수 있습니다.',
    finance: '시장 변화 실험에서 자산별 결과를 먼저 가립니다. 학생들이 변화를 예측한 뒤 ‘결과 공개’ 버튼으로 자산별 결과를 차례로 보여 주세요. 모두 공개하면 총액과 구매력도 표시됩니다.',
    intervention: '실험 결과를 가려 학생들이 먼저 예측하도록 합니다. 조건을 정한 뒤 ‘예측 후 결과 공개’를 누르면 결과가 보입니다. 조건을 바꾸면 다시 가려집니다.',
    trade: '생산 조건 비교·특화와 무역·자유 무역 실험에서 결과를 단계별로 가립니다. 기회비용 → 비교우위 → 무역 결과 순서로 공개하세요. 조건을 바꾸면 다시 가려집니다.'
  };
  let panel, trigger;
  function closeHelp(restore = false) {
    if (!panel) return;
    panel.hidden = true;
    trigger?.setAttribute('aria-expanded', 'false');
    if (restore && trigger?.isConnected) trigger.focus();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-teacher-help]');
    if (button) {
      if (button === trigger && panel && !panel.hidden) { closeHelp(); return; }
      closeHelp();
      if (!panel) {
        panel = document.createElement('aside');
        panel.id = 'teacher-help-panel';
        panel.className = 'teacher-help-panel';
        panel.setAttribute('aria-label', '교사 시연 모드 안내');
        panel.innerHTML = '<div><strong>교사 시연 모드 사용법</strong><button type="button" data-close-teacher-help aria-label="설명 닫기">×</button></div><p></p>';
        document.body.append(panel);
      }
      trigger = button;
      panel.querySelector('p').textContent = help[button.dataset.teacherHelp];
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      return;
    }
    if (event.target.closest('[data-close-teacher-help]')) closeHelp(true);
    else if (!event.target.closest('#teacher-help-panel')) closeHelp();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeHelp(true); });
})();
