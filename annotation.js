'use strict';

(() => {
  const host = document.querySelector('#content');
  if (!host) return;

  const store = window.GalpiBoardStore.createStore();
  const G = window.GalpiBoardGraphics;
  const tools = {view: '보기', pen: '펜', marker: '형광펜', pencil: '연필', shape: '도형', eraser: '지우개', select: '올가미', text: '텍스트', laser: '레이저'};
  const shapes = {line: '직선', arrow: '화살표', circle: '원', ellipse: '타원', square: '정사각형', rectangle: '직사각형', triangle: '삼각형', star: '별', heart: '하트'};
  const palette = {'#18242a': '검정', '#ce333c': '빨강', '#2354be': '파랑', '#087451': '초록', '#f5cd35': '노랑', '#764abc': '보라', '#ffffff': '흰색'};
  const style = {
    pen: {color: '#ce333c', width: 3}, marker: {color: '#f5cd35', width: 16, opacity: .34},
    pencil: {color: '#18242a', width: 2}, shape: {color: '#2354be', width: 3, fill: false, fillColor: '#f5cd35', opacity: .22},
    text: {color: '#18242a', width: 24}
  };
  const ui = document.createElement('aside');
  ui.className = 'galpi-board';
  ui.hidden = true;
  ui.setAttribute('aria-label', '교실 판서');
  const button = (action, title, extra = '') => `<button type="button" data-board-action="${action}" ${extra}>${title}</button>`;
  ui.innerHTML = `
    ${button('open', '<span aria-hidden="true">✎</span>판서하기', 'class="board-launch" aria-controls="galpi-board-panel" aria-expanded="false"')}
    <div id="galpi-board-panel" class="board-panel" hidden>
      <div class="board-row">
        ${button('grip', '↔ 이동', 'class="board-grip" aria-label="판서 도구 이동" title="드래그 또는 방향키로 이동"')}
        ${Object.entries(tools).map(([key, label]) => button('tool-' + key, label, 'aria-pressed="false"')).join('')}
        ${button('close', '접기', 'class="board-close"')}
      </div>
      <div class="board-row" data-board="shape" hidden>
        <label>도형 <select data-setting="shape">${Object.entries(shapes).map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select></label>
        <label><input type="checkbox" data-setting="fill"> 채우기</label>
        <label>채움 색 <input type="color" value="#f5cd35" data-setting="fillColor"></label>
      </div>
      <details class="board-options" data-board="style"><summary>색상·두께 설정</summary>
        <div class="board-row">
          <div class="board-swatches" aria-label="빠른 색상">${Object.entries(palette).map(([hex, label]) => button('color-' + hex, '', `class="board-swatch" style="--swatch:${hex};--swatch-ink:${['#f5cd35', '#ffffff'].includes(hex) ? '#18242a' : '#fff'}" aria-label="${label}" title="${label}" aria-pressed="false"`)).join('')}</div>
          <label>색상 <input type="color" data-setting="color"></label>
          <label>HEX <input type="text" data-setting="hex" maxlength="7" placeholder="#2354be"></label>
        </div>
        <div class="board-row">
          <label><span data-board="size-label">두께</span><input type="range" data-setting="width"><output data-board="width"></output></label>
          <label data-board="opacity-row">불투명도 <input type="range" min="10" max="80" data-setting="opacity"><output data-board="opacity"></output></label>
        </div>
      </details>
      <div class="board-row">
        ${button('undo', '실행 취소')}${button('redo', '다시 실행')}${button('original', '보정 취소', 'hidden')}
        ${button('edit', '글 편집', 'hidden')}${button('delete', '선택 삭제', 'hidden')}
        ${button('visibility', '필기 숨기기', 'aria-pressed="false"')}
        ${button('clear', '현재 화면 지우기')}
      </div>
      <details class="board-options"><summary>위치·입력·저장</summary>
        <div class="board-row">
          <label><input type="checkbox" data-setting="finger" checked> 손가락 필기</label>
          <label>자동 보정 <select data-setting="recognition"><option value="shape">정형 도형</option><option value="outline">손그림 윤곽</option><option value="off">끄기</option></select></label>
          ${button('left', '왼쪽 아래')}${button('center', '아래 가운데')}${button('right', '오른쪽 아래')}
          ${button('export', '필기 화면 PNG 저장')}${button('reset', '전체 판서 초기화')}
        </div>
      </details>
      <p class="board-status" role="status" data-board="status"></p>
    </div>`;
  const canvas = document.createElement('canvas');
  canvas.className = 'galpi-board-ink';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  const dialog = document.createElement('dialog');
  dialog.className = 'board-dialog';
  dialog.innerHTML = '<form method="dialog"><label for="board-note">판서 텍스트</label><textarea id="board-note" rows="3" maxlength="220"></textarea><div class="board-row"><button value="save">적용</button><button value="cancel">취소</button></div></form>';
  document.body.append(canvas, ui, dialog);

  const ctx = canvas.getContext('2d');
  const baseInk = document.createElement('canvas');
  const baseCtx = baseInk.getContext('2d');
  let paintedItems, geometryVersion = 0, paintedGeometry;
  const action = name => ui.querySelector(`[data-board-action="${name}"]`);
  const setting = name => ui.querySelector(`[data-setting="${name}"]`);
  const part = name => ui.querySelector(`[data-board="${name}"]`);
  const panel = ui.querySelector('.board-panel');
  const launch = action('open');
  const note = dialog.querySelector('textarea');
  const anchorSelectors = [
    '[data-board-anchor]', '.ep-choices > button', '.learning-choices button', '.hl-answer-grid > button',
    '.ep-prompt', '.question-title', '.tl-question', '.learning-feedback', '.ep-feedback', '.hl-feedback',
    '.ep-evidence', '.learning-evidence', '.ep-original', 'figure', 'table', 'svg', 'img',
    'h2', 'h3', 'h4', 'p', 'li', 'label', 'button', 'section'
  ];
  let scope, state, anchors = new Map(), activeTool = 'view', shape = 'line', recognition = 'shape';
  let expanded = false, concealed = false, finger = true, position, preset = 'right';
  let gesture, selection = new Set(), textEdit, laser, laserTimer, frame, loadRenderer, layoutDirty = true;
  let dimensions, boundsCache = new Map(), viewport = {width: 0, height: 0}, cursorClick = false;

  const size = new ResizeObserver(() => { layoutDirty = true; schedule(); });
  size.observe(ui);
  function getScope() {
    const lesson = host.querySelector('.learning-v2');
    const tab = lesson?.querySelector('[role="tabpanel"]');
    if (!tab) return null;
    const exam = tab.querySelector('.ep-question[data-question-id]');
    const question = tab.querySelector('[data-board-question]');
    const target = exam || (question?.matches('.learning-question-card') ? question : tab);
    const keyedScreen = tab.dataset.boardScreen || tab.querySelector('[data-board-screen]')?.dataset.boardScreen || '';
    const steps = ['.step-marker', '.cost-example-modes [aria-pressed="true"]', '.cost-lesson-steps [aria-current="step"]',
      '.tg-steps [aria-current="step"]', '.hl-step-nav [aria-current="step"]', '.hl-step-count',
      '.fl-products [aria-pressed="true"]', '.fl-sequence [aria-current="step"]', '[data-tl="case"][aria-pressed="true"]',
      '.tl-presets [aria-pressed="true"]', '[data-rb="actor"][aria-pressed="true"]', '[data-rb="right"][aria-pressed="true"]',
      '[data-rb="effect"][aria-pressed="true"]', '[data-cp="era"][aria-pressed="true"]', '[data-cp="detail"][aria-pressed="true"]',
      '.cp-system-check .cp-eyebrow', '.ep-mode-nav [aria-pressed="true"]'];
    const stepKey = exam || question ? [] : steps.map(selector => tab.querySelector(selector)?.textContent.trim() || '');
    const key = JSON.stringify([tab.id, tab.getAttribute('aria-labelledby'), keyedScreen,
      exam ? 'exam' : question ? 'question' : 'screen', exam?.dataset.questionId || question?.dataset.boardQuestion || '', stepKey]);
    const number = exam?.querySelector('.ep-original-number')?.textContent.trim().replace(/\D/g, '')
      || question?.querySelector('.learning-question-meta strong')?.textContent.trim().match(/^\d+/)?.[0];
    return {key, target, number, title: lesson.querySelector('h1')?.textContent.trim() || '학습 화면'};
  }

  function refreshScope() {
    const previous = scope;
    scope = getScope();
    if (previous?.key !== scope?.key) {
      if (dialog.open) dialog.close('cancel');
      cancelGesture();
      selection.clear();
      clearTimeout(laserTimer);
      laser = null;
      state = scope && store.screen(scope.key);
      part('status').textContent = '';
    }
    if (previous?.target !== scope?.target) {
      if (previous) size.unobserve(previous.target);
      if (scope) size.observe(scope.target);
    }
    anchors = new Map();
    boundsCache = new Map();
    if (scope) {
      const used = new Set();
      anchors.set('root', scope.target);
      for (const selector of anchorSelectors) {
        for (const [i, el] of [...scope.target.querySelectorAll(selector)].entries()) {
          if (used.has(el)) continue;
          used.add(el);
          const id = el.dataset.boardAnchor ?? el.id;
          const key = id ? selector + ':' + id : selector + ':' + i;
          anchors.set(key, el);
        }
      }
    }
    ui.hidden = !scope;
    layoutDirty = true;
    sync();
    schedule();
  }
  new MutationObserver(refreshScope).observe(host, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'aria-current', 'aria-pressed', 'data-board-screen']
  });

  function setPosition() {
    if (ui.hidden) return;
    const width = ui.offsetWidth, height = ui.offsetHeight, margin = 12;
    const maxX = Math.max(margin, viewport.width - width - margin);
    const maxY = Math.max(margin, viewport.height - height - margin);
    const x = position?.x ?? (preset === 'left' ? margin : preset === 'center' ? (viewport.width - width) / 2 : maxX);
    const y = position?.y ?? (viewport.height - height - (preset === 'right' ? 108 : 24));
    ui.style.left = Math.max(margin, Math.min(maxX, x)) + 'px';
    ui.style.top = Math.max(margin, Math.min(maxY, y)) + 'px';
  }

  function sync() {
    launch.hidden = expanded;
    launch.setAttribute('aria-expanded', String(expanded));
    panel.hidden = !expanded;
    canvas.hidden = !scope || concealed;
    canvas.toggleAttribute('data-drawing', Boolean(scope && expanded && activeTool !== 'view' && !concealed));
    canvas.toggleAttribute('data-pen-only', !finger);
    action('visibility').textContent = concealed ? '필기 다시 표시' : '필기 숨기기';
    action('visibility').setAttribute('aria-pressed', String(concealed));
    action('clear').disabled = !state?.items.length;
    action('undo').disabled = !state?.undo.length;
    action('redo').disabled = !state?.redo.length;
    action('original').hidden = !state?.items.some(item => item.original);
    action('delete').hidden = !selection.size;
    action('edit').hidden = selection.size !== 1 || !state?.items.some(item => selection.has(item) && item.type === 'text');
    part('shape').hidden = activeTool !== 'shape';
    part('style').hidden = !style[activeTool];
    for (const name of Object.keys(tools)) action('tool-' + name).setAttribute('aria-pressed', String(activeTool === name));
    const current = style[activeTool];
    if (!current) return;
    const color = current.color;
    setting('color').value = color;
    setting('hex').value = color;
    for (const hex of Object.keys(palette)) action('color-' + hex).setAttribute('aria-pressed', String(color === hex));
    const width = setting('width');
    width.min = {marker: 4, text: 12}[activeTool] || 1;
    width.max = {marker: 40, text: 64}[activeTool] || 16;
    width.value = current.width;
    part('size-label').textContent = activeTool === 'text' ? '글자 크기' : '두께';
    part('width').textContent = current.width;
    part('opacity-row').hidden = current.opacity === undefined;
    if (current.opacity !== undefined) {
      setting('opacity').value = Math.round(current.opacity * 100);
      part('opacity').textContent = setting('opacity').value + '%';
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(paint);
  }
  function box(key) {
    if (!boundsCache.has(key)) {
      const el = anchors.get(key);
      const closed = el?.closest('details:not([open])');
      const rect = closed && closed !== el && !el.closest('summary') ? null : el?.getBoundingClientRect();
      boundsCache.set(key, rect?.width && rect.height ? rect : null);
    }
    return boundsCache.get(key);
  }
  const normalized = (p, r) => ({x: (p.x - r.left) / r.width, y: (p.y - r.top) / r.height, pressure: p.pressure});
  const projected = (p, r) => ({x: r.left + p.x * r.width, y: r.top + p.y * r.height, pressure: p.pressure});
  const locate = (item, getter = box) => {
    const rect = getter(item.anchor);
    return rect && item.points.map(point => projected(point, rect));
  };
  function chooseAnchor(p) {
    for (const key of anchors.keys()) {
      if (key === 'root') continue;
      const r = box(key);
      if (r && p.x >= r.left - 3 && p.x <= r.right + 3 && p.y >= r.top - 3 && p.y <= r.bottom + 3) return key;
    }
    return 'root';
  }
  function itemBox(item, points) {
    if (item.type === 'text') {
      ctx.save();
      ctx.font = '600 ' + item.width + 'px system-ui, sans-serif';
      const lines = item.text.split('\n');
      const w = Math.max(...lines.map(line => ctx.measureText(line).width));
      ctx.restore();
      return G.bounds([points[0], {x: points[0].x + w, y: points[0].y + lines.length * item.width * 1.3}]);
    }
    return G.bounds(item.type === 'shape' ? G.shapePoints(item, points) : points);
  }
  function selectionBox() {
    const all = [];
    for (const item of selection) {
      const points = locate(item);
      if (!points) continue;
      const {left, top, right, bottom} = itemBox(item, points);
      all.push({x: left - 7, y: top - 7}, {x: right + 7, y: bottom + 7});
    }
    return all.length ? G.bounds(all) : null;
  }
  function drawCommitted(context, edit) {
    for (const item of state.items) {
      if (edit?.erased?.has(item)) continue;
      const shown = edit?.transformed?.get(item) || item;
      const points = locate(shown);
      if (!points || !points.length) continue;
      const r = itemBox(shown, points), margin = shown.width * 4;
      if (r.right + margin >= 0 && r.bottom + margin >= 0 && r.left - margin <= viewport.width && r.top - margin <= viewport.height) {
        G.draw(context, shown, points);
      }
    }
  }
  function paint() {
    frame = 0;
    if (layoutDirty) {
      boundsCache = new Map();
      geometryVersion++;
      viewport = {width: document.documentElement.clientWidth, height: window.innerHeight};
      setPosition();
      layoutDirty = false;
    }
    if (!scope || concealed) return;
    const scale = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(canvas.clientWidth * scale), height = Math.round(canvas.clientHeight * scale);
    if (!dimensions || dimensions.width !== width || dimensions.height !== height) {
      canvas.width = width;
      canvas.height = height;
      baseInk.width = width;
      baseInk.height = height;
      geometryVersion++;
      dimensions = {width, height};
    }
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width / scale, height / scale);
    const r = box('root');
    if (!r) return;
    canvas.style.clipPath = 'inset(' + [
      Math.max(0, r.top), Math.max(0, width / scale - r.right),
      Math.max(0, height / scale - r.bottom), Math.max(0, r.left)
    ].map(value => value + 'px').join(' ') + ')';
    ctx.save();
    ctx.beginPath();
    ctx.rect(r.left, r.top, r.width, r.height);
    ctx.clip();
    if (gesture?.transformed?.size || gesture?.erased?.size) drawCommitted(ctx, gesture);
    else {
      if (paintedItems !== state.items || paintedGeometry !== geometryVersion) {
        baseCtx.setTransform(scale, 0, 0, scale, 0, 0);
        baseCtx.clearRect(0, 0, width / scale, height / scale);
        drawCommitted(baseCtx);
        paintedItems = state.items;
        paintedGeometry = geometryVersion;
      }
      ctx.drawImage(baseInk, 0, 0, width / scale, height / scale);
    }
    if (gesture?.item) G.draw(ctx, gesture.item, locate(gesture.item));
    if (gesture?.lasso?.length > 1) {
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#00462a';
      ctx.moveTo(gesture.lasso[0].x, gesture.lasso[0].y);
      gesture.lasso.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const selected = activeTool === 'select' && !gesture && selectionBox();
    if (selected) {
      ctx.strokeStyle = '#00462a';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(selected.left, selected.top, selected.width, selected.height);
      ctx.setLineDash([]);
      ctx.fillStyle = '#00462a';
      ctx.fillRect(selected.right - 5, selected.bottom - 5, 10, 10);
    }
    if (laser) {
      ctx.fillStyle = '#e43b45';
      ctx.beginPath();
      ctx.arc(laser.x, laser.y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  const point = e => ({x: e.clientX, y: e.clientY, pressure: e.pointerType === 'pen' ? e.pressure : .5});
  function contains(r, p, pad = 0) {
    return p.x >= r.left - pad && p.x <= r.right + pad && p.y >= r.top - pad && p.y <= r.bottom + pad;
  }
  function hit(item, p) {
    const points = locate(item);
    if (!points) return false;
    const r = itemBox(item, points);
    if (!contains(r, p, 10)) return false;
    if (item.type === 'text') return true;
    const outline = item.type === 'shape' ? G.shapePoints(item, points) : points;
    const radius = Math.max(9, item.width / 2 + 4);
    if (item.fill && G.inside(p, outline)) return true;
    return outline.some((end, i) => G.segmentDistance(p, outline[i - 1] || end, end) <= radius)
      || (item.type === 'shape' && G.segmentDistance(p, outline[0], outline.at(-1)) <= radius);
  }
  function commit(items, keepSelection = false) {
    store.commit(state, items);
    if (!keepSelection) selection.clear();
    sync();
    schedule();
  }
  function cancelGesture() {
    if (!gesture) return;
    clearTimeout(gesture.hold);
    if (canvas.hasPointerCapture(gesture.id)) canvas.releasePointerCapture(gesture.id);
    gesture = null;
  }
  function showLaser(p) {
    laser = p;
    clearTimeout(laserTimer);
    laserTimer = setTimeout(() => { laser = null; schedule(); }, 650);
  }

  function addPoint(p) {
    const g = gesture;
    const delta = G.distance(g.last, p);
    if (g.erased) {
      for (const item of state.items) if (hit(item, p)) g.erased.add(item);
    } else if (g.lasso && delta >= 2) {
      g.lasso.push(p);
    } else if (g.transform) {
      const {left, top, width, height} = g.transform;
      const dx = p.x - g.start.x, dy = p.y - g.start.y;
      const sx = g.resize ? Math.max(.2, (width + dx) / width) : 1;
      const sy = g.resize ? Math.max(.2, (height + dy) / height) : 1;
      for (const item of selection) {
        const points = locate(item), r = box(item.anchor);
        if (!points || !r) continue;
        const move = q => normalized({...q, x: left + (q.x - left) * sx + (g.resize ? 0 : dx), y: top + (q.y - top) * sy + (g.resize ? 0 : dy)}, r);
        const next = {...item, points: points.map(move)};
        if (item.type === 'text' && g.resize) next.width = Math.min(110, Math.max(9, Math.round(item.width * Math.min(sx, sy))));
        if (item.original) {
          next.original = {...item.original, points: locate(item.original).map(move)};
        }
        g.transformed.set(item, next);
      }
    } else if (g.item && !g.item.original) {
      const r = box(g.item.anchor);
      if (!r) return;
      if (g.item.type === 'shape') {
        if (['circle', 'square'].includes(g.item.shape)) {
          const side = Math.max(Math.abs(p.x - g.start.x), Math.abs(p.y - g.start.y));
          p = {x: g.start.x + side * (Math.sign(p.x - g.start.x) || 1), y: g.start.y + side * (Math.sign(p.y - g.start.y) || 1)};
        }
        g.item.points[1] = normalized(p, r);
      } else if (delta >= 1.25) {
        g.item.points.push(normalized(p, r));
        clearTimeout(g.hold);
        if (recognition !== 'off' && activeTool !== 'marker') {
          g.hold = setTimeout(() => {
            if (gesture !== g) return;
            const points = locate(g.item), match = G.recognize(points || []);
            if (!match) return;
            const original = g.item;
            if (recognition === 'outline') {
              const smoothed = points.map((q, i) => {
                const a = points[i - 1], b = points[i + 1];
                return a && b ? {...q, x: (a.x + 2 * q.x + b.x) / 4, y: (a.y + 2 * q.y + b.y) / 4} : q;
              });
              g.item = {...original, points: smoothed.map(q => normalized(q, r)), original};
            } else {
              g.item = {...original, type: 'shape', shape: match.shape, points: match.points.map(q => normalized(q, r)), original};
            }
            schedule();
          }, 650);
        }
      }
    } else if (activeTool === 'laser') {
      showLaser(p);
    }
    if (delta >= 1.25) g.last = p;
  }

  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0 || (e.pointerType === 'touch' && !finger)) return;
    if (gesture && e.pointerType === 'pen' && gesture.pointerType === 'touch') cancelGesture();
    if (gesture) return;
    const p = point(e), root = box('root');
    if (!root || !contains(root, p)) return;
    e.preventDefault();
    const anchor = chooseAnchor(p);
    const position = normalized(p, box(anchor));
    if (activeTool === 'text') {
      const existing = [...state.items].reverse().find(item => item.type === 'text' && hit(item, p));
      editText(existing, anchor, position);
      return;
    }
    const g = {id: e.pointerId, pointerType: e.pointerType, start: p, last: p};
    gesture = g;
    if (activeTool === 'select') {
      const r = selectionBox();
      if (r && contains(r, p)) {
        g.transform = r;
        g.resize = Math.hypot(p.x - r.right, p.y - r.bottom) <= 16;
        g.transformed = new Map();
      } else g.lasso = [p];
    } else if (activeTool === 'eraser') g.erased = new Set();
    else if (activeTool !== 'laser') {
      g.item = {...style[activeTool], type: activeTool, anchor, points: [position]};
      if (activeTool === 'shape') {
        g.item.shape = shape;
        g.item.points.push(position);
      }
    }
    canvas.setPointerCapture(e.pointerId);
    addPoint(p);
    schedule();
  });

  canvas.addEventListener('pointermove', e => {
    if (gesture?.id !== e.pointerId) return;
    const samples = e.getCoalescedEvents?.();
    for (const event of samples?.length ? samples : [e]) addPoint(point(event));
    schedule();
  });
  canvas.addEventListener('pointerup', e => {
    const g = gesture;
    if (g?.id !== e.pointerId) return;
    if (G.distance(g.last, point(e)) >= 1.25) addPoint(point(e));
    cancelGesture();
    if (g.item) commit([...state.items, g.item]);
    if (g.erased?.size) commit(state.items.filter(item => !g.erased.has(item)));
    if (g.transformed?.size) {
      selection = new Set(g.transformed.values());
      commit(state.items.map(item => g.transformed.get(item) || item), true);
    }
    if (g.lasso) {
      if (g.lasso.length < 4 || G.distance(g.start, g.last) < 5 && G.bounds(g.lasso).width < 8) {
        const item = [...state.items].reverse().find(item => hit(item, g.last));
        selection = new Set(item ? [item] : []);
      } else {
        selection = new Set(state.items.filter(item => {
          const points = locate(item);
          if (!points) return false;
          const r = itemBox(item, points);
          const samples = item.type === 'shape' ? G.shapePoints(item, points) : points;
          return samples.some(p => G.inside(p, g.lasso))
            || G.inside({x: r.left + r.width / 2, y: r.top + r.height / 2}, g.lasso);
        }));
      }
      sync();
    }
    schedule();
  });
  for (const event of ['pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(event, e => {
      if (gesture?.id !== e.pointerId) return;
      cancelGesture();
      schedule();
    });
  }

  function editText(item, anchor, position) {
    textEdit = {item, anchor, position};
    note.value = item?.text || '';
    dialog.returnValue = '';
    dialog.showModal();
    note.focus();
  }
  dialog.addEventListener('close', () => {
    const edit = textEdit;
    textEdit = null;
    if (!state || dialog.returnValue !== 'save' || !note.value.trim() || !edit) return;
    const {item, anchor, position} = edit;
    const next = item ? {...item, text: note.value.trim()} :
      {...style.text, type: 'text', text: note.value.trim(), anchor, points: [position]};
    commit(item ? state.items.map(x => x === item ? next : x) : [...state.items, next]);
  });

  let drag;
  for (const grip of [launch, action('grip')]) {
    grip.addEventListener('pointerdown', e => {
      if (e.button !== 0 || drag) return;
      const r = ui.getBoundingClientRect();
      drag = {id: e.pointerId, x: e.clientX, y: e.clientY, left: r.left, top: r.top,
        time: performance.now(), moved: false, hold: grip === launch};
      grip.setPointerCapture(e.pointerId);
    });
    grip.addEventListener('pointermove', e => {
      if (drag?.id !== e.pointerId) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (drag.hold && performance.now() - drag.time < 320) return;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true;
      position = {x: drag.left + dx, y: drag.top + dy};
      setPosition();
      position = {x: ui.offsetLeft, y: ui.offsetTop};
    });
    for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) grip.addEventListener(event, e => {
      if (drag?.id !== e.pointerId) return;
      cursorClick = drag.moved && event === 'pointerup';
      if (cursorClick) setTimeout(() => { cursorClick = false; }, 0);
      drag = null;
    });
    grip.addEventListener('contextmenu', e => e.preventDefault());
    grip.addEventListener('keydown', e => {
      const delta = {ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24]}[e.key];
      if (!delta) return;
      e.preventDefault();
      position = {x: ui.offsetLeft + delta[0], y: ui.offsetTop + delta[1]};
      setPosition();
      position = {x: ui.offsetLeft, y: ui.offsetTop};
    });
  }

  function setStyle(name, value) {
    if (!style[activeTool]) return;
    style[activeTool][name] = value;
    sync();
  }
  ui.addEventListener('input', e => {
    const input = e.target;
    switch (input.dataset.setting) {
      case 'color': setStyle('color', input.value); break;
      case 'width': setStyle('width', Number(input.value)); break;
      case 'opacity': setStyle('opacity', Number(input.value) / 100); break;
      case 'fill': style.shape.fill = input.checked; break;
      case 'fillColor': style.shape.fillColor = input.value; break;
      case 'shape': shape = input.value; break;
      case 'recognition': recognition = input.value; break;
      case 'finger': finger = input.checked; sync(); break;
    }
  });
  ui.addEventListener('change', e => {
    if (e.target !== setting('hex')) return;
    const raw = e.target.value.trim().replace(/^#/, '');
    if (/^[0-9a-f]{6}$/i.test(raw)) setStyle('color', '#' + raw.toLowerCase());
    else sync();
  });

  ui.addEventListener('click', e => {
    const b = e.target.closest('[data-board-action]');
    if (!b || !state) return;
    const name = b.dataset.boardAction;
    if (name === 'open' && cursorClick) return;
    cancelGesture();
    if (name.startsWith('tool-')) {
      activeTool = name.slice(5);
      selection.clear();
      if (activeTool !== 'view') concealed = false;
    } else if (name.startsWith('color-')) setStyle('color', name.slice(6));
    else if (['left', 'center', 'right'].includes(name)) { preset = name; position = null; }
    else if (name === 'open') { expanded = true; activeTool = 'view'; }
    else if (name === 'close') { expanded = false; activeTool = 'view'; selection.clear(); }
    else if (name === 'visibility') { concealed = !concealed; selection.clear(); }
    else if (name === 'clear') commit([]);
    else if (name === 'reset' && window.confirm('모든 학습 화면의 판서를 지울까요?')) {
      store.clear();
      state = store.screen(scope.key);
      selection.clear();
    } else if (name === 'undo' || name === 'redo') {
      store[name](state);
      selection.clear();
    } else if (name === 'delete') commit(state.items.filter(item => !selection.has(item)));
    else if (name === 'edit') editText([...selection][0]);
    else if (name === 'original') {
      const index = state.items.findLastIndex(item => item.original);
      if (index !== -1) commit(state.items.map((item, i) => i === index ? item.original : item));
    } else if (name === 'export') void exportPng();
    sync();
    layoutDirty = true;
    schedule();
    if (name === 'open') action('tool-view').focus({preventScroll: true});
    if (name === 'close') launch.focus({preventScroll: true});
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && expanded && !dialog.open && scope) {
      if (activeTool === 'view') action('close').click();
      else action('tool-view').click();
    }
  });

  function renderer() {
    if (!loadRenderer) {
      loadRenderer = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'assets/vendor/html2canvas-1.4.1.min.js';
        script.onload = () => resolve(window.html2canvas);
        script.onerror = () => { script.remove(); loadRenderer = null; reject(new Error('renderer')); };
        document.head.append(script);
      });
    }
    return loadRenderer;
  }

  function exportDimensions(root) {
    const width = Math.ceil(root.width), height = Math.ceil(root.height);
    return {width, height, scale: Math.min(2, Math.sqrt(12000000 / (width * height)), 4096 / Math.max(width, height)),
      backgroundColor: '#ffffff', logging: false, windowHeight: window.innerHeight, scrollX: window.scrollX, scrollY: window.scrollY,
      ignoreElements: el => el.matches('details:not([open]) > :not(summary), script, .galpi-board, .galpi-board-ink, .board-dialog, [data-ep="check"], [data-ep="retry"], .ep-question-nav, .ep-quiz-actions, .learning-feedback-actions, .learning-question-actions, .hl-actions')};
  }

  async function exportPng() {
    const button = action('export');
    button.disabled = true;
    part('status').textContent = 'PNG를 만드는 중이에요…';
    const exporting = scope;
    try {
      const render = await renderer();
      await document.fonts?.ready;
      if (scope !== exporting && (scope?.key !== exporting.key || scope?.target !== exporting.target)) throw new Error('screen changed');
      const target = exporting.target, root = target.getBoundingClientRect();
      const ink = concealed ? [] : state.items.flatMap(item => {
        const r = box(item.anchor);
        if (!r?.width || !r.height) return [];
        return [{item, points: item.points.map(p => {
          const q = projected(p, r);
          return {...q, x: q.x - root.left, y: q.y - root.top};
        })}];
      });
      const options = exportDimensions(root);
      const result = await render(target, options);
      const out = result.getContext('2d');
      out.setTransform(options.scale, 0, 0, options.scale, 0, 0);
      for (const {item, points} of ink) G.draw(out, item, points);
      const blob = await new Promise(resolve => result.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('empty image');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = '갈피_판서_' + exporting.title.replace(/[<>:"/\\|?*]/g, '') + (exporting.number ? '_' + Number(exporting.number) + '번문제' : '') + '_' + new Date().toLocaleDateString('sv-SE') + '.png';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 60000);
      part('status').textContent = '필기 화면 PNG를 저장했어요.';
    } catch {
      part('status').textContent = 'PNG를 만들지 못했어요. 화면을 그대로 두고 다시 시도해 주세요.';
    } finally {
      button.disabled = false;
      layoutDirty = true;
      schedule();
    }
  }

  const relayout = () => { layoutDirty = true; schedule(); };
  window.addEventListener('scroll', relayout, {capture: true, passive: true});
  window.addEventListener('resize', relayout, {passive: true});
  window.visualViewport?.addEventListener('resize', relayout, {passive: true});
  window.visualViewport?.addEventListener('scroll', relayout, {passive: true});
  refreshScope();
})();
