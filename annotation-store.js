'use strict';

(() => {
  function createStore() {
    const screens = new Map();
    function screen(key) {
      if (!screens.has(key)) screens.set(key, {items: [], undo: [], redo: []});
      return screens.get(key);
    }
    function commit(state, items) {
      state.undo.push(state.items);
      if (state.undo.length > 60) state.undo.shift();
      state.items = items;
      state.redo.length = 0;
    }
    function travel(state, from, to) {
      if (!state[from].length) return;
      state[to].push(state.items);
      state.items = state[from].pop();
    }
    return {screen, commit, undo: s => travel(s, 'undo', 'redo'), redo: s => travel(s, 'redo', 'undo'), clear: () => screens.clear()};
  }

  const generated = new WeakMap();
  let serial = 0;
  function questionKey(question) {
    if (!generated.has(question)) generated.set(question, 'generated-' + ++serial);
    return generated.get(question);
  }

  const api = {createStore, questionKey};
  if (typeof module === 'object') module.exports = api;
  else window.GalpiBoardStore = api;
})();
