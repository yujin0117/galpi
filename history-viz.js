(() => {
  'use strict';
  function icon(key, label = '') { return window.GalpiLearningArt.scene(key, label); }
  function source(item) { return `<figcaption class="hl-source">${item.label}${item.note ? `<details><summary>자료 기준과 확인 범위</summary><p>${item.note}</p></details>` : ''}</figcaption>`; }
  function industry(rows, item, selected = []) {
    return `<figure class="hl-chart"><div class="hl-legend"><span><i class="hl-heavy"></i>중화학 공업</span><span><i class="hl-light"></i>경공업</span><span>단위: % · 합계 100%</span></div>${rows.map(([year, heavy, light]) => `<div class="hl-stack-row ${selected.includes(year)?'hl-selected-year':''}"><strong>${year}${selected.includes(year)?'<small>비교</small>':''}</strong><div class="hl-stack" role="img" aria-label="${year}년 중화학 공업 ${heavy.toFixed(1)}%, 경공업 ${light.toFixed(1)}%"><span class="hl-heavy" style="width:${heavy}%">${heavy.toFixed(1)}</span><span class="hl-light" style="width:${light}%">${light.toFixed(1)}</span></div></div>`).join('')}${source(item)}<details><summary>수치 표로 확인하기</summary><div class="ex-table"><table><caption>산업 구조 비중 · %</caption><thead><tr><th>연도</th><th>중화학</th><th>경공업</th></tr></thead><tbody>${rows.map(row => `<tr>${row.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div></details></figure>`;
  }
  function diverging(rows, title, unit, sourceItem, limit) {
    return `<figure class="hl-chart"><h3>${title}</h3><div class="hl-legend"><span>← 음수</span><span>0</span><span>양수 →</span><span>단위: ${unit}</span></div>${rows.map(([year, value]) => `<div class="hl-diverge-row"><strong>${year}</strong><div class="hl-diverge" role="img" aria-label="${year}년 ${value < 0 ? '음수' : '양수'} ${value} ${unit}"><i class="hl-zero"></i><span class="${value < 0 ? 'hl-negative' : 'hl-positive'}" style="width:${Math.abs(value) / limit * 50}%;${value < 0 ? 'right' : 'left'}:50%"></span></div><span class="hl-number">${value > 0 ? '+' : ''}${unit === '억 달러' ? value.toFixed(2) : value.toFixed(1)}</span></div>`).join('')}${source(sourceItem)}</figure>`;
  }
  function amounts(rows, title, unit, sourceItem, limit) {
    return `<figure class="hl-chart"><h3>${title} · ${unit}</h3>${rows.map(([year, value]) => `<div class="hl-diverge-row"><strong>${year}</strong><div class="hl-amount" role="img" aria-label="${year}년 ${value} ${unit}"><span style="width:${value / limit * 100}%"></span></div><span class="hl-number">${value.toLocaleString('ko-KR')}</span></div>`).join('')}${source(sourceItem)}</figure>`;
  }
  window.GalpiHistoryViz = { icon, source, industry, diverging, amounts };
})();
