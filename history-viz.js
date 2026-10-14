(() => {
  'use strict';
  const drawings = {
    shirt: '<path d="M29 16L12 26l8 15 11-6v29h34V35l11 6 8-15-17-10c-5 11-23 11-28 0Z"/>',
    factory: '<path d="M10 66V34l20 9V30l20 13V30l22 13V16h10v50Z"/><path d="M20 53h10m10 0h10m10 0h10M76 10V5"/>',
    ship: '<path d="M8 53h78L72 70H25Z"/><path d="M28 53V29h44v24M39 29V17h20v12M15 77q8-8 16 0t16 0t16 0t16 0"/>',
    oil: '<rect x="21" y="19" width="52" height="49" rx="8"/><path d="M21 30h52M21 55h52M47 34q-20 21 0 19 20 2 0-19Z"/>',
    bank: '<path d="M12 27L48 9l36 18ZM16 73h64M20 35v28m18-28v28m18-28v28m18-28v28"/>',
    currency: '<circle cx="48" cy="43" r="30"/><path d="M57 28c-18-13-34 8-10 16s7 23-9 11M48 17v52"/>',
    wallet: '<rect x="14" y="23" width="68" height="47" rx="8"/><path d="M14 30l48-15 8 15M82 40H60v16h22"/><circle cx="68" cy="48" r="2"/>',
    people: '<circle cx="48" cy="24" r="10"/><circle cx="23" cy="35" r="8"/><circle cx="73" cy="35" r="8"/><path d="M33 68V48q15-16 30 0v20M10 70V53q13-10 23 0M63 53q10-10 23 0v17"/>'
  };
  function icon(key, label = '') { return `<svg class="hl-icon" viewBox="0 0 96 88" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${drawings[key] || drawings.factory}</svg>`; }
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
