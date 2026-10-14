(function (g) {
  'use strict';
  const freeze = value => { Object.values(value).forEach(v => { if (v && typeof v === 'object') freeze(v); }); return Object.freeze(value); };
  const data = freeze({
    textbook: { costs: [[2, 1], [3, 4]], ratio: 1, quantity: 1, units: 2, source: '사용자 제공 교과서 92쪽 생산비 예제 · 달러' },
    presets: [
      { costs: [[2, 1], [3, 4]], share: [0, 100], exporter: 1, ratio: 1, title: 'A · 한 나라가 두 재화 절대우위', description: '갑국이 둘 다 더 빨리 만듭니다. 그래도 서로 다른 재화에 비교우위가 있는지 확인하세요.' },
      { costs: [[1, 4], [3, 2]], share: [100, 0], exporter: 0, ratio: 1, title: 'B · 서로 다른 절대우위', description: '갑국은 X, 을국은 Y를 더 빨리 만듭니다. 절대우위와 비교우위가 어떻게 연결될까요?' },
      { costs: [[2, 1], [4, 2]], share: [0, 100], exporter: 1, ratio: 2, title: 'C · 기회비용 동률', description: '두 나라의 생산 속도는 달라도 포기하는 재화의 비율은 같습니다. 엄격한 상호 이익 범위가 생길까요?' },
      { costs: [[2, 1], [3, 4]], share: [0, 100], exporter: 1, ratio: 3, title: 'D · 한쪽에 불리한 교환', description: 'X 1단위와 Y 3단위를 교환합니다. 거래는 가능하지만 어느 나라가 자급자족보다 불리해지는지 확인하세요.' }
    ]
  });
  if (typeof module === 'object' && module.exports) module.exports = data; else g.GalpiTradeData = data;
})(typeof window === 'undefined' ? globalThis : window);
