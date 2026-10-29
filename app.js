
'use strict';
// GALPI v1 — all interaction state remains in page memory. No network, cookies or storage.
const app = document.querySelector('#app');
const root = document.querySelector('#content');
const announcer = document.querySelector('#statusAnnouncer');
const state = {
  view: 'home', filter: 'all', tab: 'concept', teacher: false,
  conceptStep: 0, costLesson: window.GalpiCostLearning.createState(),
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
    ['자본주의의 갈피','68~73쪽 · 자본주의의 발달과 시장경제','capitalism'],
    ['기회비용 계산 실험실','74~75쪽 · 합리적 선택','ready'],
    ['선택의 파장','78~83쪽 · 시장 참여자의 역할과 책임','ripple'],
    ['금융 생활 시뮬레이터','84~89쪽 · 자산 관리','finance'],
    ['무역의 갈피 · 비교우위 무역 시뮬레이터','90~95쪽 · 국제 분업과 무역','trade']
  ],
  history: [
    ['대한민국 경제 변화 연구소 (기본)','그림으로 이해하는 한국 경제사','historyBasic'],
    ['대한민국 경제 변화 연구소 (심화)','데이터와 사료로 탐구하는 한국 경제사','historyResearch'],
    ['한반도 평화 연대기','남북 관계와 통일 정책','soon']
  ]
};
function setNav(which){document.querySelectorAll('.topnav [data-nav]').forEach(el=>{el.classList.toggle('nav-active',el.dataset.nav===which);});}
function courseCard(which){
  const social=which==='social';const arr=courses[which];
  return `<article class="subject-card ${social?'':'history'}"><div class="subject-card-head"><div><h3>${social?'통합사회2':'한국사2'}</h3><p>${social?'Ⅲ. 시장경제와 지속가능발전':'대한민국의 발전 · 오늘날의 대한민국'}</p></div><span class="subject-label" aria-hidden="true">${social?'◈':'⌑'}</span></div><div class="module-list">${arr.map(([n,desc,status])=>`<div class="module-row"><div><strong>${n}</strong><small>${desc}</small></div>${['ready','capitalism','ripple','finance','trade','historyBasic','historyResearch'].includes(status)?`<button type="button" data-action="${({capitalism:'openCapitalism',ripple:'openRipple',finance:'openFinance',trade:'openTrade',historyBasic:'openHistoryBasic',historyResearch:'openHistoryResearch'})[status]||'openModule'}">시작하기 →</button>`:`<span class="soon" aria-label="추후 추가 예정">준비 중</span>`}</div>`).join('')}</div></article>`;
}
function renderHome(){
  setNav(state.filter==='all'?'home':state.filter);
  const isAll=state.filter==='all';
  root.innerHTML=`${isAll?window.GalpiBanner.render():window.GalpiBanner.subject(state.filter)}${isAll?'<div class="home-section-head"><h2>학습 콘텐츠</h2><small>하나씩 펼쳐 보는 개념의 갈피</small></div>':''}<section class="subject-grid" aria-label="과목별 학습 콘텐츠">${isAll||state.filter==='social'?courseCard('social'):''}${isAll||state.filter==='history'?courseCard('history'):''}</section><aside class="note-panel"><strong>일곱 가지 학습 갈피를 펼쳐 보세요.</strong> 통합사회2의 다섯 콘텐츠와 한국사2 ‘대한민국 경제 변화 연구소’ 기본편·심화편을 이용할 수 있습니다. 기본편은 그림으로 관계를 이해하고, 심화편은 자료로 근거를 탐구합니다.</aside>`;
}
function switchTab(tab){state.tab=tab; renderModule();document.querySelector(`[data-tab="${tab}"][role=tab]`)?.focus({preventScroll:true});announce(document.querySelector(`[data-tab="${tab}"][role=tab]`)?.textContent+' 화면');}
function renderModule(){
  setNav('social');document.body.classList.toggle('teacher-mode',state.teacher);
  const U=window.GalpiLabUI,tabs=[['concept','개념 이해'],['textbook','예제 학습'],['simulate','자유 실험'],['quiz','문제 연습'],['results','학습 결과']],current=tabs.findIndex(x=>x[0]===state.tab);
  root.innerHTML=`<section class="learning-v2 learning-cost"><div class="learning-toolbar"><button type="button" class="page-return" data-action="goHome">← 전체 콘텐츠</button>${window.GalpiCurriculum.teacher('cost','id="teacherToggle"',state.teacher)}</div>${U.header('cost','기회비용 계산 실험실','선택의 숨은 비용을 발견하고, 더 합리적인 선택을 탐색해요.')}${state.teacher?'<p class="teacher-strip">교사 시연 · 답을 선택하고 정답을 확인한 뒤, 다음 단계로 직접 이동합니다.</p>':''}${U.stepNav(tabs,current,{idPrefix:'tab',panel:'moduleBody',attribute:key=>`data-tab="${key}"`,label:'학습 메뉴',extraClass:'module-tabs',completed:state.completed?[3,4]:[]})}<div id="moduleBody" role="tabpanel" aria-labelledby="tab-${state.tab}" tabindex="-1">${renderTab()}</div></section>`;U.mount(root);
}
function renderTab(){switch(state.tab){case 'concept':return renderConcept();case 'textbook':return renderTextbook();case 'simulate':return renderSimulation();case 'quiz':return window.GalpiExamPractice.wrap('cost',renderQuiz(),state.teacher);case 'results':return renderResults();default:return renderConcept()}}
function renderBody(){
  const el=document.querySelector('#moduleBody');if(!el)return;
  const active=document.activeElement;
  const action=active?.dataset?.action, answer=active?.dataset?.answer, lessonIndex=active?.dataset?.i, lessonMode=active?.dataset?.mode;
  el.innerHTML=renderTab();
  window.GalpiLabUI.mount(root);
  const next=answer!==undefined?el.querySelector(`[data-answer="${answer}"]`):action?el.querySelector(`[data-action="${action}"]${lessonIndex!==undefined?`[data-i="${lessonIndex}"]`:lessonMode?`[data-mode="${lessonMode}"]`:""}`):null;
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
function renderConcept(){const s=conceptSteps[state.conceptStep];return `<div class="main-grid"><section class="panel">${title('핵심 개념 익히기','교과서 74~75쪽 · 개념을 한 단계씩 살펴보세요.')}<div class="concept-summary"><div class="step-marker">STEP ${state.conceptStep+1} / ${conceptSteps.length}</div><h3 class="step-title">${s.heading}</h3><p class="step-body">${s.body}</p><div class="formula-em">${s.phrase}</div></div><div class="step-actions"><button type="button" class="btn" data-action="conceptPrev" ${state.conceptStep===0?'disabled':''}>이전</button><button type="button" class="btn primary" data-action="conceptNext">${state.conceptStep===3?'처음부터 보기':'다음 개념 →'}</button></div></section><aside class="panel">${title('알아 두기','기회비용을 이해하는 세 가지 핵심 문장')}${window.GalpiLearningArt.pathway([['wallet','명시적 비용','선택하면서 실제로 지출하는 비용'],['bag','암묵적 비용','포기한 최선의 대안에서 얻을 수 있었던 가치'],['certificate','기회비용','명시적 비용과 암묵적 비용을 함께 고려']],['+','='])}<p class="formula-note">* 비용·편익을 금액으로 비교하는 문제에서는 모든 수치를 동일한 기준으로 환산하여 계산합니다.</p><div class="row-actions"><button type="button" class="btn secondary" data-tab="textbook">기본 예제로 확인 →</button></div></aside></div>`}
function renderTextbook(){return window.GalpiCostLearning.renderLesson(state.costLesson);}
function getRows(){return state.simulation.slice(0,state.third?3:2).map(o=>({...o,base:o.benefit-o.cost}));}
function compute(rows){const chosen=rows.map((x,i)=>{const otherBest=Math.max(0,...rows.filter((_,j)=>i!==j).map(o=>o.base));const implicit=otherBest;return {...x,implicit,opp:x.cost+implicit,net:x.benefit-(x.cost+implicit)}});const best=Math.max(0,...rows.map(x=>x.base));return {rows:chosen,bestIds:chosen.map((x,i)=>x.base===best?i:null).filter(x=>x!==null),none:best===0};}
function simInput(i,field,id,value){
 const key=`${i}:${field}`,error=state.inputErrors[key];
 return `<input id="${id}" type="number" min="0" max="1000000" step="1" inputmode="numeric" data-sim="${key}" value="${esc(state.drafts[key]??value)}" aria-describedby="inputRange ${id}-error" aria-invalid="${!!error}"><p id="${id}-error" class="input-error" ${error?'':'hidden'}>${error||''}</p>`;
}
function renderSimulation(){const rows=getRows();return `<div class="main-grid wide-narrow"><section class="panel">${title('조건을 직접 바꿔 보세요','편익과 가격을 조정하면 결과가 실시간으로 달라집니다.')}<div class="teacher-strip">금액은 원 단위입니다. 학습용 가상 상황이며, 대안 1·2의 처음 값은 교과서 75쪽 사례, 대안 3은 창작 예시입니다.</div><p id="inputRange" class="input-note">0~1,000,000원의 정수를 입력하세요. 아무것도 선택하지 않기의 편익·가격은 모두 0원입니다.</p>${rows.map((item,i)=>`<div class="sim-option"><div class="option-title"><span class="studio-option-art">${window.GalpiLearningArt.scene(['tteokbokki','gimbap','lunch'][i])}</span><h3>대안 ${i+1} · ${item.name}</h3><small>값 직접 입력</small></div><div class="number-row"><label for="price${i}">가격 (명시적 비용)</label><div>${simInput(i,'cost',`price${i}`,item.cost)}</div></div><div class="number-row"><label for="benefit${i}">편익 (금전 가치 환산)</label><div>${simInput(i,'benefit',`benefit${i}`,item.benefit)}</div></div></div>`).join('')}<div class="row-actions"><button type="button" class="btn secondary" data-action="toggleThird">${state.third?'세 번째 대안 제거':'세 번째 대안 추가 +'}</button><button type="button" class="btn" data-action="resetSim">교과서 값으로 초기화</button></div></section><section class="panel">${title('계산 결과','선택한 대안과 포기한 대안의 가치를 비교해 보세요.')}<div id="simOutput">${simulationOutput()}</div></section></div>`}
function simulationOutput(){if(Object.keys(state.inputErrors).some(key=>Number(key.split(':')[0])<(state.third?3:2)))return `<div class="empty" role="status"><h3>입력값을 확인해 주세요.</h3><p>표시된 오류를 수정하면 계산 결과가 다시 나타납니다.</p></div>`;const {rows,bestIds,none}=compute(getRows());const max=Math.max(1000,...rows.map(x=>Math.abs(x.base)));const chart=rows.map((x,i)=>`<div class="bar-group ${bestIds.includes(i)?'best':''}"><span class="bar-label">${x.name.split(' ')[0]}</span><div class="bar-track" title="가격을 뺀 편익 ${won(x.base)}"><div class="bar-fill" style="width:${Math.max(0,x.base)/max*100}%"></div></div><b>${won(x.base)}</b></div>`).join('');return `<div class="visual-box"><h4>편익 − 명시적 비용 비교</h4><div class="bar-chart">${chart}</div><p class="formula-note">막대는 0원 이상의 값을 표시합니다. 오른쪽 금액으로 음수도 확인할 수 있어요.</p></div><div class="sim-result"><h3>대안별 기회비용</h3>${rows.map(x=>`<p class="outcome"><strong>${x.name}</strong><br>명시적 비용 ${won(x.cost)} + 암묵적 비용 ${won(x.implicit)} = <b>${won(x.opp)}</b><br>순편익 ${won(x.net)}</p>`).join('<hr style="border:0;border-top:1px solid #dce4da;margin:13px 0">')}<p style="font-weight:750;font-size:15px;color:var(--green)">${none?(bestIds.length?`동률인 가장 유리한 선택: ${bestIds.map(i=>rows[i].name).join(' 또는 ')} 또는 아무것도 선택하지 않기`:'현재 가장 유리한 선택: 아무것도 선택하지 않기'):`현재 가장 유리한 선택: ${bestIds.map(i=>rows[i].name).join(' 또는 ')}`}</p><p class="formula-note">동률이면 복수의 선택을 함께 표시합니다. 포기하는 대안에 ‘아무것도 선택하지 않기(0원)’를 포함해 계산합니다.</p></div>`}
function updateSim(){const el=document.querySelector('#simOutput');if(el)el.innerHTML=simulationOutput();}
const randMoney = (lo,hi)=>rand(lo,hi)*500;
function numericOptions(correct,distractors=[]){const s=new Set([correct]);distractors.filter(Number.isFinite).forEach(v=>{if(s.size<4)s.add(v)});let step=500;while(s.size<4){const alt=correct+(s.size%2===0?-1:1)*step;if(!s.has(alt))s.add(alt);step+=500;}return shuffle([...s]).map(won)}
function buildQuestion(type,id){return window.GalpiCostLearning.question(type,id,{randMoney,numericOptions,shuffle});}
function createQuiz(){const q=window.GalpiCostLearning.order.map((type,i)=>buildQuestion(type,i));state.quiz={mode:'normal',questions:q,index:0,answers:Array(q.length).fill(null),selected:null,checked:false,initialScore:null};state.completed=null;}
function renderQuiz(){const U=window.GalpiLabUI,C=window.GalpiCostLearning;
 if(!state.quiz)return `<section class="learning-start-card cost-practice-start">${U.illustration('cost')}<div><p class="learning-overline">문제 연습 · 10문항</p><h2>배운 내용을 문제로 풀어볼까요?</h2><button type="button" class="btn primary" data-action="startQuiz">10문제 시작하기 →</button></div></section>`;
 const z=state.quiz,q=z.questions[z.index];
 if(q.requiresBridge&&!state.costLesson.bridgeSeen)return `<p class="cost-kicker">문제 연습 ${z.index+1} / ${z.questions.length} · 응용 준비</p>`+C.bridge('quiz');
 return C.renderPractice(q,z);
}
function grade(){const qz=state.quiz;if(!qz||qz.selected===null||qz.checked)return;qz.checked=true;qz.answers[qz.index]=qz.selected;renderBody();announce(qz.selected===qz.questions[qz.index].correct?'정답입니다. 해설이 표시되었습니다.':'오답입니다. 해설이 표시되었습니다.');}
function nextQuestion(){const qz=state.quiz;if(!qz||!qz.checked)return;if(qz.index===qz.questions.length-1){const score=qz.questions.filter((q,i)=>qz.answers[i]===q.correct).length;state.completed={questions:qz.questions,answers:[...qz.answers],score,total:qz.questions.length,mode:qz.mode,original:qz.initialScore};state.quiz=null;state.tab='results';renderModule();root.focus({preventScroll:true});announce('학습 결과를 확인하세요.');return;}qz.index++;qz.selected=null;qz.checked=false;renderBody();document.querySelector('#moduleBody')?.focus({preventScroll:true});}
function renderResults(){const c=state.completed,U=window.GalpiLabUI;if(!c)return `<section class="learning-start-card"><div><p class="learning-overline">학습 결과</p><h2>아직 학습 결과가 없어요.</h2><p>문제 연습을 완료하면 정답률과 다시 살펴볼 개념을 확인할 수 있습니다.</p><button type="button" class="btn primary" data-action="startQuiz">문제 풀러 가기 →</button></div></section>`;
 const wrong=c.questions.filter((q,i)=>c.answers[i]!==q.correct),weak=[...new Set(wrong.map(q=>q.topic))],good=[...new Set(c.questions.filter((q,i)=>c.answers[i]===q.correct).map(q=>q.topic))].filter(topic=>!weak.includes(topic));
 return U.result({record:{session:c,title:'기회비용 계산 실험실',kind:'기초 연습',teacher:state.teacher,retry:c.mode==='retry',complete:true,items:c.questions.map((q,i)=>({label:i+1,correct:c.answers[i]===q.correct,detail:q.topic||q.type}))},title:c.mode==='retry'?'틀린 문제 복습 결과':'기회비용 계산 실험실',score:c.score,total:c.total,good:good.length?good.join(' · '):'다시 풀며 개념을 확인해 보세요.',weak:weak.length?weak.join(' · '):'이번 세트에서 틀린 문제가 없습니다.',caption:c.mode==='retry'?`최초 풀이 ${c.original.score}/${c.original.total} · 이번 오답 복습 기준`:'이번에 푼 문제 기준',actions:`<button type="button" class="btn secondary" data-action="retryWrong" ${wrong.length===0?'disabled':''}>틀린 문제 다시 풀기 (${wrong.length})</button><button type="button" class="btn primary" data-action="startQuiz">새로운 문제 풀기 →</button>`})+'<p class="learning-privacy">완료한 학습 기록은 PNG로 저장할 수 있습니다. 이름·학번 등 개인정보는 수집하지 않습니다.</p>';
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
  const lessonAction=window.GalpiCostLearning.handle(cmd.dataset.action,cmd.dataset,state.costLesson);
  if(lessonAction){
    if(lessonAction==='practice'){state.tab='quiz';renderModule();}
    else {renderBody();if(lessonAction==='navigate'){const heading=root.querySelector('#cost-lesson-question,#cost-bridge-title,.learning-question-card');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:'instant'});}}else if(lessonAction==='feedback'){const feedback=root.querySelector('.cost-lesson-feedback');if(feedback){feedback.tabIndex=-1;feedback.focus({preventScroll:true});feedback.scrollIntoView({block:'nearest',behavior:'instant'});}}}
    return;
  }

  switch(cmd.dataset.action){
    case 'openCapitalism':window.GalpiCapitalism.open();break;case 'openHistoryBasic':window.GalpiHistory.open('basic','industry');break;case 'openHistoryResearch':window.GalpiHistory.open('research','industry');break;case 'openIntervention':window.GalpiRipple.openGovernment();break;case 'openTrade':window.GalpiTrade.open();break;case 'openFinance':window.GalpiFinance.open();break;case 'openRipple':window.GalpiRipple.open();break;case 'openModule':openModule();break;case 'goHome':goHome();break;
    case 'conceptPrev':state.conceptStep=Math.max(0,state.conceptStep-1);renderBody();break;
    case 'conceptNext':state.conceptStep=(state.conceptStep+1)%conceptSteps.length;renderBody();break;
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

