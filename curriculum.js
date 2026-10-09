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
    header(key) {
      const lesson = lessons[key];
      if (!lesson) throw new Error(`Unknown GALPI lesson: ${key}`);
      return `<p class="curriculum-path"><span>통합사회2</span><span class="curriculum-chapter"><span aria-hidden="true">/ </span>Ⅲ. 시장경제와 지속가능발전</span></p><p class="curriculum-detail"><span>${lesson.unit}</span><span class="curriculum-pages">${lesson.pages}${lesson.note ? ` · ${lesson.note}` : ''}</span></p>`;
    }
  });
})();
