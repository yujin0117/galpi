
'use strict';
// GALPI v1 — all interaction state remains in page memory. No network, cookies or storage.
const app = document.querySelector('#app');
const root = document.querySelector('#content');
const announcer = document.querySelector('#statusAnnouncer');
const state = {
  view: 'home', filter: 'all', tab: 'concept', teacher: false,
  conceptStep: 0, bookStep: 0,
  simulation: [
    {name:'떡볶이 먹기', cost:5000, benefit:9000},
    {name:'김밥 먹기', cost:4500, benefit:7000},
    {name:'도시락 사 먹기', cost:6000, benefit:8000}
  ],
  third: false, quiz: null, completed: null, drafts: {}, inputErrors: {}
};
const won = value => `${Math.round(value).toLocaleString('ko-KR')}원`;
const esc = text => String(text).replace(/[&<>"']/g, a => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[a]));
const rand = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
const pick = arr => arr[rand(0,arr.length-1)];
const shuffle = arr => {const out=[...arr];for(let i=out.length-1;i>0;i--){const j=rand(0,i);[out[i],out[j]]=[out[j],out[i]];}return out;};
const announce = text => {announcer.textContent='';setTimeout(()=>{announcer.textContent=text;},5)};
const title = (name,desc='')=>`<h2 class="subhead">${name}</h2>${desc?`<p class="subtle">${desc}</p>`:''}`;
const courses = {
  social: [
    ['기회비용 계산 실험실','74~75쪽 · 합리적 선택','ready'],
    ['선택의 파장','78~83쪽 · 시장 참여자의 역할과 책임','ripple'],
    ['정부의 개입 실험실','78~79쪽 · 3-3 보완 실험','intervention'],
    ['금융 생활 시뮬레이터','84~89쪽 · 자산 관리','finance'],
    ['무역의 갈피 · 비교우위 무역 시뮬레이터','90~95쪽 · 국제 분업과 무역','trade']
  ],
  history: [
    ['대한민국 경제 변화 연구소','경제 성장 · 석유 파동 · 외환 위기','soon'],
    ['한반도 평화 연대기','남북 관계와 통일 정책','soon']
  ]
};
function setNav(which){document.querySelectorAll('.topnav [data-nav]').forEach(el=>{el.classList.toggle('nav-active',el.dataset.nav===which);});}
function courseCard(which){
  const social=which==='social';const arr=courses[which];
  return `<article class="subject-card ${social?'':'history'}"><div class="subject-card-head"><div><h3>${social?'통합사회2':'한국사2'}</h3><p>${social?'Ⅲ. 시장경제와 지속가능발전':'대한민국의 발전 · 오늘날의 대한민국'}</p></div><span class="subject-label" aria-hidden="true">${social?'◈':'⌑'}</span></div><div class="module-list">${arr.map(([n,desc,status])=>`<div class="module-row"><div><strong>${n}</strong><small>${desc}</small></div>${['ready','ripple','finance','intervention','trade'].includes(status)?`<button type="button" data-action="${({ripple:'openRipple',finance:'openFinance',intervention:'openIntervention',trade:'openTrade'})[status]||'openModule'}">시작하기 →</button>`:`<span class="soon" aria-label="추후 추가 예정">준비 중</span>`}</div>`).join('')}</div></article>`;
}
function renderHome(){
  setNav(state.filter==='all'?'home':state.filter);
  const isAll=state.filter==='all';
  root.innerHTML=`${isAll?window.GalpiBanner.render():window.GalpiBanner.subject(state.filter)}${isAll?'<div class="home-section-head"><h2>학습 콘텐츠</h2><small>하나씩 펼쳐 보는 개념의 갈피</small></div>':''}<section class="subject-grid" aria-label="과목별 학습 콘텐츠">${isAll||state.filter==='social'?courseCard('social'):''}${isAll||state.filter==='history'?courseCard('history'):''}</section><aside class="note-panel"><strong>다섯 가지 갈피를 펼쳐 보세요.</strong> 통합사회2의 ‘기회비용 계산 실험실’, ‘선택의 파장’, ‘금융 생활 시뮬레이터’, ‘정부의 개입 실험실’, ‘무역의 갈피’를 이용할 수 있습니다. 나머지 콘텐츠는 차례대로 추가됩니다.</aside>`;
}
function switchTab(tab){state.tab=tab; renderModule();document.querySelector(`[data-tab="${tab}"][role=tab]`)?.focus({preventScroll:true});announce(document.querySelector(`[data-tab="${tab}"][role=tab]`)?.textContent+' 화면');}
function renderModule(){
  setNav('social');
  document.body.classList.toggle('teacher-mode',state.teacher);
  const tabs=[['concept','개념 이해'],['textbook','교과서 예제'],['simulate','자유 실험'],['quiz','문제 연습'],['results','학습 결과']];
  root.innerHTML=`<div style="margin-top:18px"><button type="button" class="page-return" data-action="goHome">← 전체 콘텐츠</button></div><section class="module-hero"><div>${window.GalpiCurriculum.header('cost')}<h1>기회비용 계산 실험실</h1><p>선택의 숨은 비용을 발견하고, 더 합리적인 선택을 탐색해요.</p></div>${window.GalpiCurriculum.teacher('cost', 'id="teacherToggle"', state.teacher)}</section>${state.teacher?`<div class="teacher-strip"><strong>교사 시연 모드</strong> · 교과서 풀이를 단계별로 공개할 수 있습니다. 학습 기록은 수집하지 않습니다.</div>`:''}<div class="module-tabs" role="tablist" aria-label="학습 단계">${tabs.map(([key,label])=>`<button type="button" role="tab" id="tab-${key}" aria-controls="moduleBody" tabindex="${state.tab===key?0:-1}" aria-selected="${state.tab===key}" class="${state.tab===key?'selected':''}" data-tab="${key}">${label}</button>`).join('')}</div><div id="moduleBody" role="tabpanel" aria-labelledby="tab-${state.tab}" tabindex="-1">${renderTab()}</div>`;
}
function renderTab(){switch(state.tab){case 'concept':return renderConcept();case 'textbook':return renderTextbook();case 'simulate':return renderSimulation();case 'quiz':return renderQuiz();case 'results':return renderResults();default:return renderConcept()}}
function renderBody(){
  const el=document.querySelector('#moduleBody');if(!el)return;
  const active=document.activeElement;
  const action=active?.dataset?.action, answer=active?.dataset?.answer;
  el.innerHTML=renderTab();
  const next=answer!==undefined?el.querySelector(`[data-answer="${answer}"]`):action?el.querySelector(`[data-action="${action}"]`):null;
  if(next&&!next.disabled)next.focus({preventScroll:true});
  else if(action==='grade')el.querySelector('[data-action=nextQ]')?.focus({preventScroll:true});
  else if(action==='nextQ')el.focus({preventScroll:true});
}
const conceptSteps = [
  {heading:'왜 우리는 선택해야 할까요?',body:'우리의 시간과 돈은 한정되어 있지만 원하는 것은 많습니다. 그래서 하나를 선택하면 다른 가능성을 포기하게 됩니다.',phrase:'희소성 → 선택의 필요성'},
  {heading:'포기한 것에도 가치가 있어요.',body:'기회비용은 어떤 대안을 선택하면서 포기한 가치입니다. 직접 지출하는 명시적 비용과, 선택하지 않은 최선의 대안에서 얻을 수 있었던 암묵적 비용을 함께 고려합니다.',phrase:'기회비용 = 명시적 비용 + 암묵적 비용'},
  {heading:'편익과 기회비용을 비교해요.',body:'편익은 선택해서 얻는 만족이나 이득입니다. 편익에서 기회비용을 뺀 순편익을 비교하면 선택의 결과를 더 정확하게 이해할 수 있습니다.',phrase:'순편익 = 편익 − 기회비용'},
  {heading:'매몰 비용은 앞으로의 선택과 구분해요.',body:'이미 지불했고 되돌려 받을 수 없는 돈이나 시간은 매몰 비용입니다. 새로운 선택에서는 앞으로 발생할 비용과 편익을 비교해야 합니다.',phrase:'매몰 비용 → 향후 선택에서 제외'}
];
function renderConcept(){const s=conceptSteps[state.conceptStep];return `<div class="main-grid"><section class="panel">${title('핵심 개념 익히기','교과서 74~75쪽 · 개념을 한 단계씩 살펴보세요.')}<div class="concept-summary"><div class="step-marker">STEP ${state.conceptStep+1} / ${conceptSteps.length}</div><h3 class="step-title">${s.heading}</h3><p class="step-body">${s.body}</p><div class="formula-em">${s.phrase}</div></div><div class="step-actions"><button type="button" class="btn" data-action="conceptPrev" ${state.conceptStep===0?'disabled':''}>이전</button><button type="button" class="btn primary" data-action="conceptNext">${state.conceptStep===3?'처음부터 보기':'다음 개념 →'}</button></div></section><aside class="panel">${title('알아 두기','기회비용을 이해하는 세 가지 핵심 문장')}<div class="visual-box"><p class="definition"><span class="pill">명시적 비용</span><br>선택하면서 실제로 지출하는 비용</p><p class="definition"><span class="pill">암묵적 비용</span><br>포기한 최선의 대안에서 얻을 수 있었던 가치</p><p class="definition"><span class="pill">기회비용</span><br>명시적 비용과 암묵적 비용을 함께 고려</p></div><p class="formula-note">* 비용·편익을 금액으로 비교하는 문제에서는 모든 수치를 동일한 기준으로 환산하여 계산합니다.</p><div class="row-actions"><button type="button" class="btn secondary" data-tab="textbook">교과서 예제로 확인 →</button></div></aside></div>`}
const bookStages = [
  {heading:'선택 상황을 확인해요.',body:'갑은 한 끼 식사로 떡볶이 또는 김밥 중 하나를 선택해야 합니다. 각 메뉴의 편익과 가격을 확인해 봅시다.',html:`<div class="choice-tag">떡볶이 또는 김밥 중 하나를 선택</div>`},
  {heading:'명시적 비용을 찾아요.',body:'직접 지출하는 가격은 명시적 비용입니다.',html:`<p class="visual-equation">떡볶이 <b>5,000원</b> · 김밥 <b>4,500원</b></p>`},
  {heading:'포기한 최선의 대안을 계산해요.',body:'떡볶이를 고르면 김밥을 먹을 기회를 포기합니다. 김밥의 편익에서 가격을 빼면 2,500원입니다. 반대로 김밥을 고르면 떡볶이의 4,000원을 포기합니다.',html:`<div class="visual-equation">김밥의 포기 가치 = ${won(7000)} − ${won(4500)} = <b>${won(2500)}</b></div><div class="visual-equation">떡볶이의 포기 가치 = ${won(9000)} − ${won(5000)} = <b>${won(4000)}</b></div>`},
  {heading:'기회비용과 순편익을 비교해요.',body:'직접 지출하는 비용에 포기한 대안의 가치를 더하면 기회비용이 됩니다.',html:`<p class="visual-equation">떡볶이 = 5,000 + 2,500 = <b>7,500원</b></p><p class="visual-equation">김밥 = 4,500 + 4,000 = <b>8,500원</b></p><p class="visual-equation">떡볶이 순편익 = 9,000 − 7,500 = <b>1,500원</b></p>`},
  {heading:'어떤 선택이 합리적일까요?',body:'교과서의 예제에서 떡볶이는 김밥보다 기회비용이 작고 순편익이 높습니다. 따라서 떡볶이를 선택하는 것이 합리적입니다.',html:`<p class="formula-em">합리적 선택: 떡볶이 먹기 ✓</p>`}
];
function renderTextbook(){const s=bookStages[state.bookStep];return `<div class="main-grid wide-narrow"><section class="panel">${title('교과서 예제','미래엔 통합사회2 75쪽 · 교과서 수치와 정답을 기준으로 제작')}<p class="subtle">갑이 떡볶이와 김밥 중 하나를 고르는 상황입니다.</p><table class="book-table"><thead><tr><th scope="col">구분</th><th scope="col" class="numeric">떡볶이</th><th scope="col" class="numeric">김밥</th></tr></thead><tbody><tr><th scope="row">편익</th><td class="numeric">9,000원</td><td class="numeric">7,000원</td></tr><tr><th scope="row">가격</th><td class="numeric">5,000원</td><td class="numeric">4,500원</td></tr></tbody></table><div class="teacher-strip">${state.teacher?'정답 공개를 단계별로 진행하세요.':'한 단계씩 풀이를 확인할 수 있어요.'}</div><div class="step-actions"><button type="button" class="btn" data-action="bookPrev" ${state.bookStep===0?'disabled':''}>이전 단계</button><button type="button" class="btn primary" data-action="bookNext">${state.bookStep===4?'처음부터 보기':'다음 단계 →'}</button></div></section><section class="panel"><span class="pill">${state.bookStep+1} / ${bookStages.length} 단계</span><h2 class="step-title">${s.heading}</h2><p class="step-body">${s.body}</p><div class="visual-box">${s.html}</div>${state.bookStep>=3?`<div class="table-scroll"><table class="book-table"><caption>교과서 75쪽 계산 결과</caption><thead><tr><th scope="col">메뉴</th><th scope="col" class="numeric">암묵적 비용</th><th scope="col" class="numeric">기회비용</th><th scope="col" class="numeric">순편익</th></tr></thead><tbody><tr><th scope="row">떡볶이</th><td class="numeric">2,500원</td><td class="numeric">7,500원</td><td class="numeric">1,500원</td></tr><tr><th scope="row">김밥</th><td class="numeric">4,000원</td><td class="numeric">8,500원</td><td class="numeric">−1,500원</td></tr></tbody></table></div>`:''}<p class="formula-note">원자료: 미래엔 『통합사회2』 교사용 교과서, 75쪽. 수치와 정답을 기준으로 단계를 재구성했습니다.</p></section></div>`}
function getRows(){return state.simulation.slice(0,state.third?3:2).map(o=>({...o,base:o.benefit-o.cost}));}
function compute(rows){const chosen=rows.map((x,i)=>{const otherBest=Math.max(0,...rows.filter((_,j)=>i!==j).map(o=>o.base));const implicit=otherBest;return {...x,implicit,opp:x.cost+implicit,net:x.benefit-(x.cost+implicit)}});const best=Math.max(0,...rows.map(x=>x.base));return {rows:chosen,bestIds:chosen.map((x,i)=>x.base===best?i:null).filter(x=>x!==null),none:best===0};}
function simInput(i,field,id,value){
 const key=`${i}:${field}`,error=state.inputErrors[key];
 return `<input id="${id}" type="number" min="0" max="1000000" step="1" inputmode="numeric" data-sim="${key}" value="${esc(state.drafts[key]??value)}" aria-describedby="inputRange ${id}-error" aria-invalid="${!!error}"><p id="${id}-error" class="input-error" ${error?'':'hidden'}>${error||''}</p>`;
}
function renderSimulation(){const rows=getRows();return `<div class="main-grid wide-narrow"><section class="panel">${title('조건을 직접 바꿔 보세요','편익과 가격을 조정하면 결과가 실시간으로 달라집니다.')}<div class="teacher-strip">금액은 원 단위입니다. 학습용 가상 상황이며, 대안 1·2의 처음 값은 교과서 75쪽 사례, 대안 3은 창작 예시입니다.</div><p id="inputRange" class="input-note">0~1,000,000원의 정수를 입력하세요. 아무것도 선택하지 않기의 편익·가격은 모두 0원입니다.</p>${rows.map((item,i)=>`<div class="sim-option"><div class="option-title"><h3>대안 ${i+1} · ${item.name}</h3><small>값 직접 입력</small></div><div class="number-row"><label for="price${i}">가격 (명시적 비용)</label><div>${simInput(i,'cost',`price${i}`,item.cost)}</div></div><div class="number-row"><label for="benefit${i}">편익 (금전 가치 환산)</label><div>${simInput(i,'benefit',`benefit${i}`,item.benefit)}</div></div></div>`).join('')}<div class="row-actions"><button type="button" class="btn secondary" data-action="toggleThird">${state.third?'세 번째 대안 제거':'세 번째 대안 추가 +'}</button><button type="button" class="btn" data-action="resetSim">교과서 값으로 초기화</button></div></section><section class="panel">${title('계산 결과','선택한 대안과 포기한 대안의 가치를 비교해 보세요.')}<div id="simOutput">${simulationOutput()}</div></section></div>`}
function simulationOutput(){if(Object.keys(state.inputErrors).some(key=>Number(key.split(':')[0])<(state.third?3:2)))return `<div class="empty" role="status"><h3>입력값을 확인해 주세요.</h3><p>표시된 오류를 수정하면 계산 결과가 다시 나타납니다.</p></div>`;const {rows,bestIds,none}=compute(getRows());const max=Math.max(1000,...rows.map(x=>Math.abs(x.base)));const chart=rows.map((x,i)=>`<div class="bar-group ${bestIds.includes(i)?'best':''}"><span class="bar-label">${x.name.split(' ')[0]}</span><div class="bar-track" title="가격을 뺀 편익 ${won(x.base)}"><div class="bar-fill" style="width:${Math.max(0,x.base)/max*100}%"></div></div><b>${won(x.base)}</b></div>`).join('');return `<div class="visual-box"><h4>편익 − 명시적 비용 비교</h4><div class="bar-chart">${chart}</div><p class="formula-note">막대는 0원 이상의 값을 표시합니다. 오른쪽 금액으로 음수도 확인할 수 있어요.</p></div><div class="sim-result"><h3>대안별 기회비용</h3>${rows.map(x=>`<p class="outcome"><strong>${x.name}</strong><br>명시적 비용 ${won(x.cost)} + 암묵적 비용 ${won(x.implicit)} = <b>${won(x.opp)}</b><br>순편익 ${won(x.net)}</p>`).join('<hr style="border:0;border-top:1px solid #dce4da;margin:13px 0">')}<p style="font-weight:750;font-size:15px;color:var(--green)">${none?(bestIds.length?`동률인 가장 유리한 선택: ${bestIds.map(i=>rows[i].name).join(' 또는 ')} 또는 아무것도 선택하지 않기`:'현재 가장 유리한 선택: 아무것도 선택하지 않기'):`현재 가장 유리한 선택: ${bestIds.map(i=>rows[i].name).join(' 또는 ')}`}</p><p class="formula-note">동률이면 복수의 선택을 함께 표시합니다. 포기하는 대안에 ‘아무것도 선택하지 않기(0원)’를 포함해 계산합니다.</p></div>`}
function updateSim(){const el=document.querySelector('#simOutput');if(el)el.innerHTML=simulationOutput();}
function fmtQuestion(q){return `<h2 class="question-title">${q.prompt}</h2>${q.table?`<div class="table-scroll"><table class="book-table"><thead><tr><th scope="col">대안</th><th scope="col" class="numeric">편익</th><th scope="col" class="numeric">가격</th></tr></thead><tbody>${q.table.map(r=>`<tr><th scope="row">${r.name}</th><td class="numeric">${won(r.benefit)}</td><td class="numeric">${won(r.cost)}</td></tr>`).join('')}</tbody></table></div>`:''}`}
const randMoney = (lo,hi)=>rand(lo,hi)*500;
function numericOptions(correct,distractors=[]){const s=new Set([correct]);distractors.filter(Number.isFinite).forEach(v=>{if(s.size<4)s.add(v)});let step=500;while(s.size<4){const alt=correct+(s.size%2===0?-1:1)*step;if(!s.has(alt))s.add(alt);step+=500;}return shuffle([...s]).map(won)}
function buildQuestion(type,id){
  const price=randMoney(6,22), bPrice=randMoney(6,22);let bNet=randMoney(4,16), aNet=randMoney(4,16);if(aNet===bNet)aNet+=500;
  const benefit=price+aNet,bBenefit=bPrice+bNet;
  const base={id,type,facts:{price,bPrice,bNet,aNet,benefit,bBenefit},topic:'기회비용',correct:0,options:[],explain:'',prompt:''};
  const setNum=(correct,dists)=>{base.answerValue=correct;base.options=numericOptions(correct,dists);base.correct=base.options.indexOf(won(correct));};
  if(type==='explicit'){
    base.topic='명시적 비용';base.prompt=`어느 학생이 영화표에 ${won(price)}을 지불하고 영화를 보기로 했습니다. 이 선택의 명시적 비용은 얼마일까요?`;
    setNum(price,[price+aNet,aNet,benefit]);base.explain=`명시적 비용은 실제로 지출하는 금액입니다. 영화표 값 ${won(price)}이 명시적 비용입니다.`;
  }else if(type==='implicit'){
    base.topic='암묵적 비용';base.prompt=`A를 선택하면 B를 포기해야 합니다. B의 편익은 ${won(bBenefit)}, 가격은 ${won(bPrice)}입니다. B를 포기하며 잃는 암묵적 비용은 얼마일까요?`;
    setNum(bNet,[bPrice,bBenefit,price]);base.explain=`포기한 B의 가치 = 편익 ${won(bBenefit)} − 가격 ${won(bPrice)} = ${won(bNet)}입니다. 이것이 암묵적 비용입니다.`;
  }else if(type==='opportunity'){
    base.topic='기회비용';base.prompt=`A를 선택하면 직접 ${won(price)}을 지출합니다. 포기한 B의 편익은 ${won(bBenefit)}, 가격은 ${won(bPrice)}입니다. A 선택의 기회비용은?`;
    const result=price+bNet;setNum(result,[price,bNet,price+bBenefit]);base.explain=`B를 포기한 가치 ${won(bBenefit)} − ${won(bPrice)} = ${won(bNet)}. 따라서 A의 기회비용은 명시적 비용 ${won(price)} + 암묵적 비용 ${won(bNet)} = ${won(result)}입니다.`;
  }else if(type==='net'){
    base.topic='순편익';base.prompt=`A를 선택할 때 편익 ${won(benefit)}, 명시적 비용 ${won(price)}입니다. 포기한 최선의 대안 B의 가치가 ${won(bNet)}이라면 A의 순편익은?`;
    const result=benefit-(price+bNet);setNum(result,[aNet,benefit-price+bNet,price+bNet]);base.explain=`A의 기회비용 = ${won(price)} + ${won(bNet)} = ${won(price+bNet)}. A의 순편익 = 편익 ${won(benefit)} − 기회비용 ${won(price+bNet)} = ${won(result)}입니다.`;
  }else if(type==='rational'){
    base.topic='합리적 선택';
    const vals=shuffle([randMoney(5,8),randMoney(10,14),randMoney(16,20)]);
    const table=vals.map((v,i)=>{const p=randMoney(5,15);return{name:['A','B','C'][i],cost:p,benefit:p+v}});
    const winner=table.reduce((best,v,i)=>v.benefit-v.cost>table[best].benefit-table[best].cost?i:best,0);
    base.table=table;base.options=['A','B','C','선택하지 않는다'];base.correct=winner;base.answerValue=table[winner].name;
    base.prompt='다음 중 편익과 가격을 고려할 때 가장 합리적인 선택은 무엇일까요?';
    base.explain=`각 대안의 편익−가격은 ${table.map(x=>`${x.name}: ${won(x.benefit-x.cost)}`).join(', ')}입니다. 포기할 가치까지 고려했을 때 순가치가 가장 큰 ${table[winner].name}를 선택하는 것이 합리적입니다.`;
  }else if(type==='sunk'){
    base.topic='매몰 비용';const paid=randMoney(5,20);
    base.prompt=`학생이 이미 ${won(paid)}을 지불했고 환불·양도·재판매할 수 없는 체험 수업을 신청했습니다. 앞으로 수업에 참여할지 결정할 때 고려하지 않아야 할 것은?`;
    const options=['이미 지불해 회수할 수 없는 수업료','앞으로 필요한 교통비','앞으로 얻게 될 만족감','앞으로 이동에 들일 시간'];base.options=shuffle(options);base.correct=base.options.indexOf(options[0]);base.answerValue=options[0];
    base.explain=`이미 지급했고 어떤 선택을 해도 돌려받지 못하는 ${won(paid)}은 매몰 비용입니다. 향후 선택은 앞으로의 편익과 추가 비용을 기준으로 판단해야 합니다.`;
  }
  base.wrongReasons=base.options.map((opt,i)=>i===base.correct?'':wrongReason(base,opt));
  return base;
}
function wrongReason(q,opt){
 const f=q.facts;
 if(q.type==='explicit')return opt===won(f.aNet)?'편익에서 가격을 뺀 값과 직접 지출한 비용을 구분해 보세요.':opt===won(f.benefit)?'얻는 편익을 실제 지출한 금액으로 계산하면 안 됩니다.':'명시적 비용은 영화표에 직접 지출한 금액만 포함합니다.';
 if(q.type==='implicit')return opt===won(f.bPrice)?'포기한 대안의 가격만으로는 그 대안에서 얻을 수 있었던 가치를 알 수 없습니다.':opt===won(f.bBenefit)?'포기한 대안의 편익에서 그 대안의 가격을 빼야 합니다.':'선택한 대안의 가격과 포기한 대안의 가치를 구분해 보세요.';
 if(q.type==='opportunity')return opt===won(f.price)?'직접 지출한 비용만 계산하면 포기한 대안의 가치가 빠집니다.':opt===won(f.bNet)?'암묵적 비용에 선택한 대안의 명시적 비용도 더해야 합니다.':opt===won(f.price+f.bBenefit)?'포기한 대안의 편익 전체를 더하면 그 대안의 가격을 빼지 않은 계산이 됩니다.':'명시적 비용에 포기한 대안의 편익−가격을 더해 보세요.';
 if(q.type==='net')return opt===won(f.aNet)?'편익에서 가격만 빼면 포기한 대안의 가치가 빠집니다.':opt===won(f.benefit-f.price+f.bNet)?'암묵적 비용은 편익에 더하지 않고 빼야 합니다.':opt===won(f.price+f.bNet)?'이 값은 기회비용입니다. 순편익은 편익에서 기회비용을 뺀 값입니다.':'편익에서 명시적 비용과 암묵적 비용을 모두 빼 보세요.';
 if(q.type==='rational'){if(opt==='선택하지 않는다')return '이 문항에는 편익−가격이 0원보다 큰 대안이 있습니다. 아무것도 선택하지 않기의 가치는 0원입니다.';const row=q.table.find(x=>x.name===opt),best=q.table[q.correct];return `${opt}의 편익−가격은 ${won(row.benefit-row.cost)}으로, ${best.name}의 ${won(best.benefit-best.cost)}보다 작습니다.`;}
 return '이 항목은 앞으로의 선택에 따라 달라질 비용 또는 편익이므로 고려해야 합니다. 이미 지불해 회수할 수 없는 비용과 구분해 보세요.';
}
function createQuiz(){const types=shuffle(['explicit','implicit','opportunity','net','rational','sunk','explicit','opportunity','net','rational']);const q=types.map((t,i)=>buildQuestion(t,i));state.quiz={mode:'normal',questions:q,index:0,answers:Array(q.length).fill(null),selected:null,checked:false,initialScore:null};state.completed=null;}
function renderQuiz(){if(!state.quiz)return `<section class="panel"><div class="empty"><span class="pill">PRACTICE</span><h2 class="step-title">문제로 이해도를 확인해 볼까요?</h2><p>개념 구분부터 기회비용과 순편익 계산까지 10문제를 풀어 보세요.<br>정답을 확인하면 풀이 과정과 근거도 볼 수 있습니다.</p><button type="button" class="btn primary" data-action="startQuiz">10문제 시작하기 →</button></div></section>`;
  const qz=state.quiz,q=qz.questions[qz.index];return `<section class="panel" style="max-width:800px;margin:auto"><div class="question-header"><span class="pill">${qz.mode==='retry'?'오답 다시 풀기':'개념 연습'} · ${q.topic}</span><strong class="quiz-meta">${qz.index+1} / ${qz.questions.length}</strong></div><div class="qprogress" role="progressbar" aria-label="문제 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(qz.index/qz.questions.length*100)}"><div style="width:${qz.index/qz.questions.length*100}%"></div></div>${fmtQuestion(q)}<div class="options" role="group" aria-label="답 선택">${q.options.map((opt,i)=>`<button type="button" class="answer-option ${qz.selected===i?'active':''} ${qz.checked&&q.correct===i?'correct':''} ${qz.checked&&qz.selected===i&&i!==q.correct?'wrong':''}" data-answer="${i}" aria-pressed="${qz.selected===i}" ${qz.checked?'disabled':''}><span class="key">${i+1}</span><span>${esc(opt)}${qz.checked?`<span class="answer-state">${q.correct===i?'✓ 정답':qz.selected===i?'× 선택한 답':''}</span>`:''}</span></button>`).join('')}</div>${qz.checked?`<div class="feedback ${qz.selected===q.correct?'':'wrong'}" role="status"><strong>${qz.selected===q.correct?'정답입니다!':'다시 생각해 봐요.'}</strong>${qz.selected===q.correct?'':`<p><b>선택한 답: ${esc(q.options[qz.selected])}</b><br>${q.wrongReasons[qz.selected]}</p>`}<p>${q.explain}</p></div>`:''}<div class="step-actions">${qz.checked?`<button type="button" class="btn primary" data-action="nextQ">${qz.index===qz.questions.length-1?'학습 결과 확인':'다음 문제 →'}</button>`:`<button type="button" class="btn primary" data-action="grade" ${qz.selected===null?'disabled':''}>정답 확인</button>`}</div><p class="formula-note">문제와 풀이 결과는 브라우저를 새로고침하면 초기화됩니다.</p></section>`;
}
function grade(){const qz=state.quiz;if(!qz||qz.selected===null||qz.checked)return;qz.checked=true;qz.answers[qz.index]=qz.selected;renderBody();announce(qz.selected===qz.questions[qz.index].correct?'정답입니다. 해설이 표시되었습니다.':'오답입니다. 해설이 표시되었습니다.');}
function nextQuestion(){const qz=state.quiz;if(!qz||!qz.checked)return;if(qz.index===qz.questions.length-1){const score=qz.questions.filter((q,i)=>qz.answers[i]===q.correct).length;state.completed={questions:qz.questions,answers:[...qz.answers],score,total:qz.questions.length,mode:qz.mode,original:qz.initialScore};state.quiz=null;state.tab='results';renderModule();root.focus({preventScroll:true});announce('학습 결과를 확인하세요.');return;}qz.index++;qz.selected=null;qz.checked=false;renderBody();document.querySelector('#moduleBody')?.focus({preventScroll:true});}
function renderResults(){const c=state.completed;if(!c)return `<section class="panel"><div class="empty"><span class="pill">MY LEARNING REPORT</span><h2 class="step-title">아직 학습 결과가 없어요.</h2><p>문제 연습을 완료하면 정답률과 다시 학습할 개념을 확인할 수 있습니다.</p><button type="button" class="btn primary" data-action="startQuiz">문제 풀러 가기 →</button></div></section>`;
  const wrong=c.questions.filter((q,i)=>c.answers[i]!==q.correct),weak=[...new Set(wrong.map(q=>q.topic))],good=[...new Set(c.questions.filter((q,i)=>c.answers[i]===q.correct).map(q=>q.topic))].filter(topic=>!weak.includes(topic));
  return `<section class="panel" style="max-width:860px;margin:auto"><p class="kicker">MY LEARNING REPORT</p><h2 class="subhead">${c.mode==='retry'?'틀린 문제 복습 결과':'기회비용 계산 실험실 · 학습 결과'}</h2><p class="subtle">${c.mode==='retry'?'방금 다시 푼 문제의 결과입니다.':'학습을 마쳤어요! 이해한 개념과 보완할 개념을 확인해 보세요.'}</p><div class="score-big">${Math.round(c.score/c.total*100)}<small>%</small></div><p class="quiz-meta">${c.total}문제 중 ${c.score}문제 정답${c.mode==='retry'?` · 최초 풀이 정답률 ${Math.round(c.original.score/c.original.total*100)}%`:''}</p><div class="report-grid"><div class="report-box"><strong>잘 이해한 개념</strong><p>${good.length?good.join(' · '):'이번에는 아직 없어요. 다시 도전해 보세요.'}</p></div><div class="report-box"><strong>보완할 개념</strong><p>${weak.length?weak.join(' · '):'좋아요! 이번 세트에서 틀린 문제가 없습니다.'}</p></div></div><div class="note-panel">현재 화면을 <strong>스크린샷으로 저장</strong>해 주세요. 이름·학번 등 개인정보는 입력하거나 수집하지 않습니다.</div><div class="row-actions"><button type="button" class="btn secondary" data-action="retryWrong" ${wrong.length===0?'disabled':''}>틀린 문제 다시 풀기 (${wrong.length})</button><button type="button" class="btn primary" data-action="startQuiz">새로운 문제 풀기 →</button></div></section>`;
}
function retryWrong(){const c=state.completed;if(!c)return;const wrong=c.questions.filter((q,i)=>c.answers[i]!==q.correct);if(!wrong.length)return;state.quiz={mode:'retry',questions:wrong,index:0,answers:Array(wrong.length).fill(null),selected:null,checked:false,initialScore:c.mode==='normal'?{score:c.score,total:c.total}:c.original};state.completed=null;state.tab='quiz';renderModule();}
function resetSim(){state.simulation=[{name:'떡볶이 먹기',cost:5000,benefit:9000},{name:'김밥 먹기',cost:4500,benefit:7000},{name:'도시락 사 먹기',cost:6000,benefit:8000}];state.third=false;state.drafts={};state.inputErrors={};renderBody();}
function goHome(which='all'){history.replaceState(null,'',location.pathname+location.search);state.view='home';document.body.classList.remove('teacher-mode');state.filter=which;renderHome();window.scrollTo({top:0,behavior:'auto'});}
function openModule(){state.view='module';renderModule();root.focus({preventScroll:true});window.scrollTo({top:0,behavior:'auto'});}
app.addEventListener('click',event=>{
  const nav=event.target.closest('[data-nav]');if(nav){if(nav.dataset.nav==='toolkit'){window.GalpiToolkit.open();return;}goHome(nav.dataset.nav==='home'?'all':nav.dataset.nav);return;}
  const tab=event.target.closest('[data-tab]');if(tab){switchTab(tab.dataset.tab);return;}
  const answer=event.target.closest('[data-answer]');if(answer){const qz=state.quiz;if(qz&&!qz.checked){qz.selected=Number(answer.dataset.answer);renderBody();}return;}
  const cmd=event.target.closest('[data-action]');if(!cmd)return;
  switch(cmd.dataset.action){
    case 'openIntervention':window.GalpiIntervention.open();break;case 'openTrade':window.GalpiTrade.open();break;case 'openFinance':window.GalpiFinance.open();break;case 'openRipple':window.GalpiRipple.open();break;case 'openModule':openModule();break;case 'goHome':goHome();break;
    case 'conceptPrev':state.conceptStep=Math.max(0,state.conceptStep-1);renderBody();break;
    case 'conceptNext':state.conceptStep=(state.conceptStep+1)%conceptSteps.length;renderBody();break;
    case 'bookPrev':state.bookStep=Math.max(0,state.bookStep-1);renderBody();break;
    case 'bookNext':state.bookStep=(state.bookStep+1)%bookStages.length;renderBody();break;
    case 'toggleThird':state.third=!state.third;renderBody();break;
    case 'resetSim':resetSim();break;
    case 'startQuiz':createQuiz();state.tab='quiz';renderModule();break;
    case 'grade':grade();break;case 'nextQ':nextQuestion();break;case 'retryWrong':retryWrong();break;
  }
});
app.addEventListener('change',event=>{
  if(event.target.id==='teacherToggle'){state.teacher=event.target.checked;renderModule();document.querySelector('#teacherToggle')?.focus({preventScroll:true});announce(state.teacher?'교사 시연 모드 켜짐':'교사 시연 모드 꺼짐');}
});
function setSimValue(input){
 const key=input.dataset.sim;if(!key)return;
 const [idxStr,field]=key.split(':'),idx=Number(idxStr);
 if(!Number.isInteger(idx)||!state.simulation[idx]||!['cost','benefit'].includes(field))return;
 const raw=input.value,val=Number(raw);state.drafts[key]=raw;
 let error='';
 if(raw.trim()===''||input.validity.badInput)error='금액을 입력하세요.';
 else if(!Number.isFinite(val)||val<0||val>1000000)error='0~1,000,000원 사이로 입력하세요.';
 else if(!Number.isInteger(val))error='원 단위의 정수를 입력하세요.';
 if(error)state.inputErrors[key]=error;
 else {delete state.inputErrors[key];state.simulation[idx][field]=val;}
 input.setAttribute('aria-invalid',String(!!error));
 const note=document.getElementById(`${input.id}-error`);note.textContent=error;note.hidden=!error;
 updateSim();
}
app.addEventListener('input',event=>setSimValue(event.target));
app.addEventListener('change',event=>{if(event.target.dataset.sim){setSimValue(event.target);if(!state.inputErrors[event.target.dataset.sim]){event.target.value=String(Number(event.target.value));state.drafts[event.target.dataset.sim]=event.target.value;}}});
app.addEventListener('keydown',event=>{
 const tab=event.target.closest('[role=tab]');if(!tab||!tab.dataset.tab)return;
 const tabs=[...app.querySelectorAll('[role=tab]')],index=tabs.indexOf(tab);let next;
 if(event.key==='ArrowRight')next=(index+1)%tabs.length;
 if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
 if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
 if(next!==undefined){event.preventDefault();switchTab(tabs[next].dataset.tab);}
});
document.querySelector('#brandHome').addEventListener('click',()=>goHome());
renderHome();

