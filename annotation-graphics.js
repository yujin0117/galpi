'use strict';

(() => {
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  function bounds(points) {
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (const {x, y} of points) {
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
    return {left, top, right, bottom, width: right - left, height: bottom - top};
  }
  function segmentDistance(p, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t);
  }
  function inside(p, polygon) {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) result = !result;
    }
    return result;
  }
  function polygon(shape, a, b) {
    const {left, top, width, height} = bounds([a, b]);
    let pairs;
    if (shape === 'triangle') pairs = [[.5, 0], [1, 1], [0, 1]];
    else if (shape === 'star') pairs = Array.from({length: 10}, (_, i) => {
      const angle = i * Math.PI / 5 - Math.PI / 2, radius = i % 2 ? .22 : .5;
      return [.5 + Math.cos(angle) * radius, .5 + Math.sin(angle) * radius];
    });
    else if (shape === 'heart') pairs = Array.from({length: 41}, (_, i) => {
      const t = i * Math.PI / 20;
      return [.5 + .5 * Math.sin(t) ** 3, .46 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 34];
    });
    else if (shape === 'ellipse' || shape === 'circle') pairs = Array.from({length: 49}, (_, i) => {
      const t = i * Math.PI / 24;
      return [.5 + Math.cos(t) / 2, .5 + Math.sin(t) / 2];
    });
    else pairs = [[0, 0], [1, 0], [1, 1], [0, 1]];
    return pairs.map(([x, y]) => ({x: left + x * width, y: top + y * height}));
  }
  function recognize(points) {
    const a = points[0], b = points.at(-1), box = bounds(points);
    const span = Math.max(box.width, box.height);
    if (points.length < 5 || span < 25) return null;
    if (distance(a, b) > span * .8 && points.every(p => segmentDistance(p, a, b) < Math.max(4, span * .055))) {
      return {shape: 'line', points: [a, b]};
    }
    if (Math.min(box.width, box.height) < 20 || distance(a, b) > span * .19) return null;
    const corners = [{x: box.left, y: box.top}, {x: box.right, y: box.top}, {x: box.right, y: box.bottom}, {x: box.left, y: box.bottom}];
    const fractionNear = (outline, tolerance) => points.filter(p =>
      outline.some((v, i) => segmentDistance(p, v, outline[(i + 1) % outline.length]) < tolerance)).length / points.length;
    if (corners.every(c => points.some(p => distance(p, c) < span * .14)) && fractionNear(corners, span * .07) > .84) {
      return {shape: 'rectangle', points: [corners[0], corners[2]]};
    }
    const triangle = polygon('triangle', corners[0], corners[2]);
    if (triangle.every(c => points.some(p => distance(p, c) < span * .13)) && fractionNear(triangle, span * .065) > .86) {
      return {shape: 'triangle', points: [corners[0], corners[2]]};
    }
    const oval = polygon('ellipse', corners[0], corners[2]);
    if (fractionNear(oval, span * .085) > .87 && oval.filter((_, i) => i % 6 === 0).every(c => points.some(p => distance(p, c) < span * .2))) {
      return {shape: 'ellipse', points: [corners[0], corners[2]]};
    }
    return null;
  }
  function shapePoints(item, points) {
    return ['line', 'arrow'].includes(item.shape) ? points : polygon(item.shape, points[0], points.at(-1));
  }
  function draw(ctx, item, points) {
    if (!points?.length) return;
    const a = points[0], b = points.at(-1);
    ctx.save();
    ctx.strokeStyle = ctx.fillStyle = item.color;
    ctx.lineWidth = item.width;
    ctx.lineJoin = ctx.lineCap = 'round';
    if (item.type === 'text') {
      ctx.font = '600 ' + item.width + 'px system-ui, sans-serif';
      ctx.textBaseline = 'top';
      item.text.split('\n').forEach((line, i) => ctx.fillText(line, a.x, a.y + item.width * 1.3 * i));
    } else if (item.type === 'shape') {
      const outline = shapePoints(item, points);
      ctx.beginPath();
      ctx.moveTo(outline[0].x, outline[0].y);
      for (const p of outline.slice(1)) ctx.lineTo(p.x, p.y);
      if (item.shape === 'arrow') {
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const head = Math.min(distance(a, b) * .45, Math.max(9, item.width * 4));
        for (const sign of [-1, 1]) {
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - head * Math.cos(angle + sign * .58), b.y - head * Math.sin(angle + sign * .58));
        }
      } else if (item.shape !== 'line') {
        ctx.closePath();
        if (item.fill) {
          ctx.globalAlpha = item.opacity;
          ctx.fillStyle = item.fillColor;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      ctx.stroke();
    } else if (item.type === 'pen' || item.type === 'pencil') {
      ctx.globalAlpha = item.type === 'pencil' ? .67 : 1;
      const radius = p => item.width * (.34 + .32 * (p.pressure || .5));
      ctx.beginPath();
      ctx.arc(a.x, a.y, radius(a), 0, 2 * Math.PI);
      ctx.fill();
      for (let i = 1; i < points.length; i++) {
        const from = points[i - 1], to = points[i];
        ctx.beginPath();
        ctx.lineWidth = radius(to) + radius(from);
        ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      }
    } else {
      ctx.globalAlpha = item.opacity;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      for (let i = 1; i < points.length - 1; i++) {
        const p = points[i], next = points[i + 1];
        ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
      }
      if (points.length === 1) ctx.lineTo(a.x + .01, a.y);
      else ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  const api = {bounds, distance, segmentDistance, inside, recognize, shapePoints, draw};
  if (typeof module === 'object') module.exports = api;
  else window.GalpiBoardGraphics = api;
})();
