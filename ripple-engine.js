/* 화면과 영구 저장에 의존하지 않는 선택의 파장 응답 상태. */
(() => {
  'use strict';

  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  function itemFor(id) {
    const data = window.GalpiRippleData;
    if (!data || typeof id !== 'string') return null;
    return data.questions.find(item => item.id === id) || data.effects.find(item => item.id === id) || null;
  }
  function createState() {
    return {answers: {}, checked: {}, first: {}, attempts: {}};
  }
  function select(state, id, index) {
    const item = itemFor(id);
    const count = item && (item.options ? item.options.length : 2);
    if (!item || state.checked[id] || !Number.isInteger(index) || index < 0 || index >= count) return false;
    state.answers[id] = index;
    return true;
  }
  function check(state, id) {
    const item = itemFor(id);
    if (!item || state.checked[id] || !own(state.answers, id)) return false;
    const answer = state.answers[id];
    const count = item.options ? item.options.length : 2;
    if (!Number.isInteger(answer) || answer < 0 || answer >= count) return false;
    state.checked[id] = true;
    if (!own(state.first, id)) state.first[id] = answer;
    state.attempts[id] = (state.attempts[id] || 0) + 1;
    return true;
  }
  function retry(state, id) {
    if (!itemFor(id) || !state.checked[id]) return false;
    delete state.answers[id];
    delete state.checked[id];
    return true;
  }
  function result(state) {
    const questions = window.GalpiRippleData.questions;
    const answered = questions.filter(item => own(state.first, item.id));
    const current = questions.filter(item => state.checked[item.id] && own(state.answers, item.id));
    const wrong = answered.filter(item => state.first[item.id] !== item.correct);
    return {
      score: answered.filter(item => state.first[item.id] === item.correct).length,
      total: questions.length,
      answered: answered.length,
      complete: answered.length === questions.length,
      currentScore: current.filter(item => state.answers[item.id] === item.correct).length,
      currentAnswered: current.length,
      currentComplete: current.length === questions.length,
      wrongIds: wrong.map(item => item.id),
      resolvedWrongIds: wrong.filter(item => state.checked[item.id] && state.answers[item.id] === item.correct).map(item => item.id),
      remainingIds: questions.filter(item => !own(state.first, item.id)).map(item => item.id)
    };
  }
  function restart(state) {
    Object.assign(state, createState());
    return state;
  }

  window.GalpiRippleEngine = Object.freeze({createState, select, check, retry, result, restart});
})();
