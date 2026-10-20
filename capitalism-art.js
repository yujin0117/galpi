/* Original SVG learning scenes. The size of a shape is not an economic quantity. */
(() => {
  'use strict';
  const ink='var(--diagram-ink,#355B50)',sage='var(--diagram-green,#6CA18B)',sand='var(--diagram-gold,#E6BF75)',cream='var(--learning-surface,#FFFFFF)',blue='var(--diagram-blue,#87AEC8)';
  const person=(x,y,color=sage)=>`<g transform="translate(${x} ${y})"><circle cx="0" cy="0" r="10" fill="#d9b58a"/><path d="M-15 47V23q15-20 30 0v24" fill="${color}"/><path d="M-6 47v17m12-17v17" stroke="${ink}" stroke-width="6"/></g>`;
  const factory=(x,y)=>`<g transform="translate(${x} ${y})"><path d="M0 80V30l35 18V25l35 23V0h16v80Z" fill="${sage}"/><path d="M12 57h13m17 0h13m17 0h8" stroke="${cream}" stroke-width="10"/></g>`;
  function era(n){
    const scenes=[
      `<path d="M0 208q70-18 145 0t145 0t250 0v52H0" fill="#cee0d6"/><path d="M42 190h254l-37 43H82Z" fill="${ink}"/><path d="M140 187V34m79 153V58" stroke="#8c7750" stroke-width="6"/><path d="M145 42q62 18 45 80h-45Z" fill="#f4e5bc"/><path d="M135 48q-48 22-45 81h45Zm90 20q45 16 40 59h-40Z" fill="${cream}"/><path d="M80 158h50v30H80Zm54-9h40v39h-40Zm43 9h42v30h-42Z" fill="${sand}" stroke="${cream}" stroke-width="3"/><path d="M331 202V91h142v111Z" fill="#e8d8b9"/><path d="m319 94 83-48 83 48" fill="${sage}"/><path d="M355 200v-70h39v70m26-64h29v30h-29Z" fill="${blue}"/><path d="M312 210h196" stroke="${ink}" stroke-width="5"/>${person(494,153,blue)}<circle cx="322" cy="176" r="13" fill="#d9b468"/><circle cx="308" cy="192" r="13" fill="#e2c184"/><path d="m40 234 74-5m155 14 82-4" stroke="#a0bdb0" stroke-width="3"/>`,
      `<path d="M32 213V98l64 29V92l64 35V65h25v148Z" fill="${sage}"/><path d="M53 166h22m22 0h22m22 0h22" stroke="${cream}" stroke-width="16"/><path d="M160 54q-22-15 0-29 26-9 29 8 25-8 34 7" fill="#d3d9c9"/><rect x="231" y="126" width="100" height="62" rx="12" fill="${sand}"/><circle cx="249" cy="194" r="35" fill="#edf0de" stroke="${ink}" stroke-width="8"/><path d="M249 162v64m-32-32h64m-54-23 46 46m-46 0 46-46" stroke="${sage}" stroke-width="4"/><path d="M286 166h90m-44-39v62" stroke="${ink}" stroke-width="7"/><path d="M383 92h105v115H383Z" fill="#d6c7a6"/><path d="M391 103h89v73h-89Z" fill="#f6edd3"/><path d="M401 106v67m12-67v67m12-67v67m12-67v67m12-67v67m12-67v67" stroke="${blue}" stroke-width="4"/><path d="M380 188h111" stroke="${ink}" stroke-width="5"/>${person(352,147,blue)}<path d="M26 234h480" stroke="#b8c8af" stroke-width="4"/>`,
      `<path d="M35 93h151v106H35Z" fill="#d7ddd0"/><path d="m53 121 36 27 26-10 48 40" fill="none" stroke="#a97d62" stroke-width="6"/><path d="m147 178 16 0v-17" fill="none" stroke="#a97d62" stroke-width="5"/>${person(60,200,'#aab6a6')}${person(104,200,'#99aba4')}<path d="M242 219V132h253v87" fill="#dfc49a"/><path d="M262 219v-56q0-22 22-22t22 22v56m35 0v-56q0-22 22-22t22 22v56m35 0v-56q0-22 22-22t22 22v56" fill="${cream}"/><path d="M232 127h271m-252-9h233" stroke="${ink}" stroke-width="7"/><path d="M363 110V35m0 0h83l-83 22m45-22v56" fill="none" stroke="${sage}" stroke-width="5"/><path d="M398 91h20v17h-20Z" fill="${sand}"/>${person(224,174,ink)}<path d="M207 172h35" stroke="${sand}" stroke-width="5"/><path d="M198 239h314" stroke="#b8c8af" stroke-width="4"/>`,
      `<path d="m62 211 24-106h48l25 106M70 175h80M80 139h61M99 103V61h22v42" stroke="${ink}" stroke-width="7" fill="none"/><path d="M183 115h63q9 0 9 9v84h-81v-84q0-9 9-9" fill="${sand}"/><path d="M174 142h81m-81 41h81" stroke="#a98c5e" stroke-width="5"/><path d="M214 151q-24 29 0 29t0-29" fill="${cream}"/><path d="m180 81 26-26 19 16 35-38m-19 0h19v20" stroke="#a97d62" stroke-width="5" fill="none"/><path d="M321 114h169l-16-30H337Z" fill="${sage}"/><path d="M333 119h146v95H333Z" fill="#e8d8ba"/><path d="M345 142h52v52h-52Zm75 0h42v72h-42Z" fill="${blue}"/>${person(305,167,ink)}<path d="M289 151h34v28h-34Z" fill="${cream}"/><path d="M309 217h203" stroke="#b8c8af" stroke-width="4"/>`
    ];
    return `<svg class="cp-era-art" viewBox="0 0 540 270" aria-hidden="true"><path d="M8 244V119C24 26 119 7 221 35 357-18 486 28 532 122v122Z" fill="${['#edf1e2','#e7efea','#f1ecde','#edf0e5'][n]}"/><circle cx="470" cy="45" r="21" fill="#e8ce95"/>${scenes[n]}</svg>`;
  }
  function system(plan=false){
    return `<svg class="cp-system-art" viewBox="0 0 540 330" aria-hidden="true"><rect x="6" y="8" width="528" height="312" rx="35" fill="${plan?'#f4eee0':'#edf3e6'}"/>${plan?`<path d="m213 73 57-28 57 28Z" fill="${ink}"/><path d="M224 82h92v55h-92Z" fill="${sand}"/><path d="M238 91v37m21-37v37m21-37v37m21-37v37" stroke="${cream}" stroke-width="10"/><text x="270" y="30" text-anchor="middle">정부의 계획</text><path d="M270 141v6m0 30v9H116v22m154-22h154v22" fill="none" stroke="${ink}" stroke-width="4"/><path d="m109 199 7 11 7-11m294 0 7 11 7-11" fill="none" stroke="${ink}" stroke-width="4"/>${factory(66,201)}${person(424,220,blue)}<text x="270" y="168" text-anchor="middle" class="cp-art-small">생산량·자원 배분 결정</text><text x="110" y="310" text-anchor="middle">생산자</text><text x="425" y="310" text-anchor="middle">소비자</text>`:`${factory(51,120)}${person(439,146,blue)}<circle cx="280" cy="156" r="61" fill="${cream}" stroke="#bbcdad" stroke-width="2"/><text x="280" y="151" text-anchor="middle">시장</text><text x="280" y="181" text-anchor="middle">가격</text><path d="M149 139h59m-12-8 12 8-12 8M421 139h-61m12-8-12 8 12 8M209 183h-60m12-8-12 8 12 8M360 183h61m-12-8 12 8-12 8" fill="none" stroke="${ink}" stroke-width="4"/><text x="93" y="251" text-anchor="middle">생산자</text><text x="439" y="251" text-anchor="middle">소비자</text><text x="270" y="283" text-anchor="middle" class="cp-art-small">자유로운 선택과 거래</text>`}</svg>`;
  }
  // Presentation only: each frame follows the existing era explanation, without changing its data.
  const frames = [
    [
      {title:'넓어진 교역망과 상업 자본',nodes:[['voyage','신항로 개척'],['currency','금·은 유입'],['shop','상업 자본 성장']]},
      {title:'상품을 유통하며 이윤을 추구해요',nodes:[['voyage','넓어진 교역망'],['shop','상품 유통'],['wallet','이윤 추구']]},
      {title:'중상주의 정책으로 상공업을 지원해요',nodes:[['bank','절대 왕정'],['voyage','수출 장려·수입 억제'],['factory','자국 산업 보호']]}
    ],
    [
      {title:'생산 방식이 달라져요',nodes:[['idea','산업 혁명'],['factory','공장제 기계 공업'],['shirt','대량 생산']]},
      {title:'이윤 창출의 중심이 제조업으로',nodes:[['factory','기계로 상품 생산'],['shirt','제조업'],['currency','이윤 추구']]},
      {title:'작은 정부와 자유로운 경제활동',nodes:[['bank','정부 개입 최소화'],['shop','개인의 경제적 자유']],connectors:['→']}
    ],
    [
      {title:'두 배경을 함께 살펴봐요',nodes:[['factory','독과점 등 시장의 배분 문제'],['people','대공황·불황·실업']],connectors:['+']},
      {title:'정부 지출로 불황에 대응해요',nodes:[['bank','정부 지출'],['factory','일자리 확대'],['bag','소비 확대']]},
      {title:'시장경제를 바탕으로 정부 역할 확대',nodes:[['shop','시장경제 기반'],['bank','공공사업·사회 보장']],connectors:['+']}
    ],
    [
      {title:'하나의 사건이 아닌 여러 배경',nodes:[['oil','석유 파동·스태그플레이션'],['bank','정부 실패·정책의 한계']],connectors:['+']},
      {title:'과도한 정부 개입을 비판해요',nodes:[['bank','지나친 정부 개입 비판'],['shop','시장 기능 강조']],connectors:['→']},
      {title:'정부 역할을 줄이는 정책들',nodes:[['wallet','세금 감면·복지 축소'],['factory','민영화·규제 완화']],connectors:['+']}
    ]
  ];
  function connectionScene(kind){return window.GalpiLearningArt.scene(kind);}
  function connection(eraIndex, step) {
    const frame=frames[eraIndex][step],list=frame.connectors?.includes('+')?'ul':'ol';
    return `<figure class="cp-connection" data-era="${eraIndex}" data-step="${step}"><figcaption><span>그림으로 연결하기 · ${step+1} / 3</span><strong>${frame.title}</strong></figcaption><${list} style="--cp-nodes:${frame.nodes.length}" aria-label="${frame.title}">${frame.nodes.map(([kind,label],i)=>`<li>${connectionScene(kind)}<strong>${label}</strong>${i<frame.nodes.length-1?`<span class="cp-connection-arrow" aria-hidden="true">${frame.connectors?.[i]||'→'}</span>`:''}</li>`).join('')}</${list}></figure>`;
  }
  function keyword(index) {
    const drawings=[
      `<path d="M8 47V23l24-13 24 13v24" fill="#e8d8b9"/><path d="M8 23h48M24 47V30h16v17" fill="none" stroke="${ink}" stroke-width="3"/><circle cx="46" cy="42" r="7" fill="${sand}"/><path d="m41 47-7 7m3-3 3 3" stroke="${ink}" stroke-width="3"/>`,
      `<path d="M31 51V27m0 0L15 13m16 14 18-14M15 13v10m0-10h10m24 0H39m10 0v10" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M22 39h19v17H22Z" fill="${sand}"/><path d="M28 39v-5h7v5" stroke="${ink}" stroke-width="2" fill="none"/>`,
      `<ellipse cx="28" cy="48" rx="18" ry="6" fill="${sand}"/><path d="M10 39v9m36-9v9" stroke="${ink}" stroke-width="2"/><ellipse cx="28" cy="39" rx="18" ry="6" fill="#ead2a3"/><path d="m22 25 11-11 8 6 12-12m-10 0h10v10" stroke="${ink}" stroke-width="3" fill="none"/>`,
      `<path d="M5 29h23v23H5Zm31 0h23v23H36Z" fill="#e8d8b9"/><path d="M3 29h27l-4-12H7Zm31 0h27l-4-12H38Z" fill="${sage}"/><path d="M10 36h13m18 0h13" stroke="${cream}" stroke-width="4"/><path d="m25 8 7-5 7 5m-14 1h14" stroke="${ink}" stroke-width="2" fill="none"/>`
    ];
    return `<svg viewBox="0 0 64 64" aria-hidden="true" class="cp-keyword-icon">${drawings[index]}</svg>`;
  }
  window.GalpiCapitalismArt={era,system,connection,keyword};
})();
