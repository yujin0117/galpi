'use strict';

const assert = require('node:assert/strict');
const {createStore, questionKey} = require('../annotation-store.js');
const {recognize, inside, shapePoints, bounds} = require('../annotation-graphics.js');

const a = {id: 1}, b = {id: 1};
assert.equal(questionKey(a), questionKey(a), 'retry retains the original object identity');
assert.notEqual(questionKey(a), questionKey(b), 'a new generated set cannot reuse an old key');

const store = createStore(), first = store.screen('cost/practice/' + questionKey(a));
const second = store.screen('cost/practice/' + questionKey(b));
const exam = store.screen('cost/exam/first');
const stroke = {type: 'pen', points: [{x: .2, y: .5}]};
store.commit(first, [stroke]);
assert.equal(store.screen('cost/practice/' + questionKey(a)).items[0], stroke);
assert.deepEqual(second.items, []);
assert.deepEqual(exam.items, []);
store.commit(first, []);
store.undo(first);
assert.deepEqual(first.items, [stroke]);
store.redo(first);
assert.deepEqual(first.items, []);
store.undo(first);
store.commit(first, [stroke, stroke]);
assert.equal(first.redo.length, 0);
store.clear();
assert.deepEqual(store.screen('cost/practice/' + questionKey(a)).items, []);

const line = Array.from({length: 30}, (_, i) => ({x: i * 3, y: 25 + Math.sin(i) * 2}));
assert.equal(recognize(line)?.shape, 'line');
const drawShape = shape => {
  const outline = shapePoints({shape}, [{x: 5, y: 5}, {x: 105, y: 75}]);
  return outline.flatMap((p, i) => Array.from({length: 6}, (_, j) => {
    const next = outline[(i + 1) % outline.length];
    return {x: p.x + (next.x - p.x) * j / 6, y: p.y + (next.y - p.y) * j / 6};
  }));
};
for (const shape of ['ellipse', 'rectangle', 'triangle']) assert.equal(recognize(drawShape(shape))?.shape, shape);
assert.equal(recognize([{x: 1, y: 1}, {x: 7, y: 5}]), null);
assert.equal(inside({x: 50, y: 40}, drawShape('rectangle')), true);
assert.equal(inside({x: 150, y: 40}, drawShape('rectangle')), false);
assert.equal(bounds(drawShape('star')).width > 80, true);
console.log('Annotation state, generated question isolation, undo/redo, lasso geometry and shape recognition passed.');
