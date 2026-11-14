/* Opportunity-cost learning sequence. Page-memory state; no storage or network. */
(() => {
 'use strict';
 const U=()=>window.GalpiLabUI;
 const won=n=>`${Math.round(n).toLocaleString('ko-KR')}원`;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const step=(title,formula,why,equation)=>({title,formula,why,equation});
 const basic=[
  {topic:'명시적 비용',prompt:'영화를 선택할 때 실제로 지출하는 명시적 비용은 얼마일까요?',options:[8000,16000,24000,0],answerValue:8000,formula:['명시적 비용 = 선택을 위해 실제로 지출하는 금액'],explain:'영화표에 직접 지불하는 8,000원이 명시적 비용이에요. 다른 비용은 없어요.',steps:[step('실제로 나가는 돈을 찾아요','명시적 비용 = 실제 지출액','아르바이트 수입은 받지 못하는 돈이고, 영화표 값은 실제로 내는 돈이에요. 지금은 실제 지출만 묻고 있어요.','영화표 값 8,000원 = 명시적 비용 8,000원')]},
  {topic:'암묵적 비용',prompt:'영화를 선택하면서 포기하는 암묵적 비용은 얼마일까요?',options:[8000,16000,24000,0],answerValue:16000,formula:['암묵적 비용 = 포기한 아르바이트에서 얻을 수 있었던 수입'],explain:'영화를 보는 같은 2시간 동안 아르바이트를 할 수 없으므로, 받을 수 있었던 수입 16,000원을 포기해요.',steps:[step('돈을 내지는 않아도 포기한 기회가 있어요','암묵적 비용 = 포기한 최선의 대안에서 얻을 수 있었던 가치','포기한 대안은 아르바이트예요. 다른 비용이 없으므로 받을 수 있었던 수입 전체를 포기해요. 영화표 값과 구분해 보세요.','포기한 아르바이트 수입 16,000원 = 암묵적 비용 16,000원')]},
  {topic:'기회비용',prompt:'영화를 선택할 때의 기회비용은 얼마일까요?',options:[8000,16000,24000,30000],answerValue:24000,formula:['기회비용 = 명시적 비용 + 암묵적 비용'],explain:'영화표 값 8,000원 + 포기한 아르바이트 수입 16,000원 = 기회비용 24,000원이에요.',steps:[step('두 종류의 비용을 합해요','기회비용 = 명시적 비용 + 암묵적 비용','영화 선택에는 실제 지출과 포기한 기회가 모두 있어요. 영화를 고르는 순간 영화표 값은 나가고, 일했다면 들어올 돈도 놓쳐요. 두 일이 같은 선택에서 생기므로 비용을 더해요.','8,000원 + 16,000원 = 24,000원')]},
  {topic:'순편익',prompt:'영화의 편익이 30,000원이라면, 영화 선택의 순편익은 얼마일까요?',conditions:[['영화의 편익',30000],['앞에서 구한 기회비용',24000]],note:'편익은 실제로 받는 돈이 아니라, 선택으로 얻는 만족이나 이익을 금전적으로 평가한 값이에요.',options:[6000,22000,14000,30000],answerValue:6000,formula:['순편익 = 편익 − 기회비용'],explain:'영화의 만족을 평가한 편익 30,000원에서 기회비용 24,000원을 빼면 순편익은 6,000원이에요.',steps:[step('얻는 편익에서 전체 비용을 빼요','순편익 = 편익 − 기회비용','영화표 값만 빼면 포기한 아르바이트 수입이 빠져요. 앞에서 구한 기회비용 전체를 빼야 순편익을 알 수 있어요.','30,000원 − 24,000원 = 6,000원')]}
 ];
 const applied=[
  {topic:'암묵적 비용',prompt:'떡볶이를 선택할 때의 암묵적 비용은 얼마일까요?',options:[2500,4500,7000,5000],answerValue:2500,formula:['암묵적 비용 = 포기한 김밥의 편익 − 김밥 가격'],explain:'김밥을 먹었다면 얻었을 7,000원의 편익에서, 지불했을 가격 4,500원을 뺀 이익 2,500원을 포기해요.',steps:[step('포기한 김밥을 기준으로 계산해요','이 사례의 암묵적 비용 = 김밥의 편익 − 김밥 가격','김밥을 먹지 않으면 만족감은 얻지 못하지만, 김밥 가격도 내지 않아요. 실제로 포기하는 이익은 둘의 차이예요.','7,000원 − 4,500원 = 2,500원')]},
  {topic:'기회비용',prompt:'떡볶이를 선택할 때의 기회비용은 얼마일까요?',options:[5000,2500,7500,12000],answerValue:7500,formula:['기회비용 = 명시적 비용 + 암묵적 비용'],explain:'떡볶이 가격 5,000원에, 김밥을 포기한 암묵적 비용 2,500원을 더해요.',steps:[step('포기한 메뉴의 암묵적 비용을 구해요','암묵적 비용 = 김밥의 편익 − 김밥 가격','김밥의 편익 전체가 아니라 가격을 뺀 이익을 포기해요.','7,000원 − 4,500원 = 2,500원'),step('두 비용을 더해요','기회비용 = 명시적 비용 + 암묵적 비용','떡볶이에 실제로 지출한 돈과 김밥을 포기한 이익을 모두 포함해요.','5,000원 + 2,500원 = 7,500원')]},
  {topic:'암묵적 비용',prompt:'반대로 김밥을 선택한다면, 암묵적 비용은 얼마일까요?',options:[2500,4000,5000,9000],answerValue:4000,formula:['암묵적 비용 = 포기한 떡볶이의 편익 − 떡볶이 가격'],explain:'이번에는 김밥을 선택했으므로 포기한 대안은 떡볶이예요. 떡볶이의 9,000원 − 5,000원 = 4,000원을 포기해요.',steps:[step('선택 기준이 바뀌면 포기한 메뉴도 바뀌어요','암묵적 비용 = 포기한 대안의 편익 − 그 대안의 가격','김밥 가격이 아니라, 포기한 떡볶이의 편익과 가격으로 계산해요.','9,000원 − 5,000원 = 4,000원')]},
  {topic:'합리적 선택',prompt:'기회비용과 순편익을 비교하면 어느 메뉴의 선택이 합리적일까요?',options:['떡볶이','김밥','두 메뉴가 같다','자료가 부족하다'],answerValue:'떡볶이',formula:['순편익 = 편익 − 기회비용'],explain:'떡볶이의 순편익은 1,500원, 김밥은 −1,500원이에요. 이 사례에서는 순편익이 더 큰 떡볶이가 합리적인 선택이에요.',steps:[step('메뉴별 순편익을 비교해요','순편익 = 편익 − 기회비용','편익과 가격이 다른 두 메뉴를 가격만으로 판단하지 않고, 포기한 기회까지 고려한 순편익으로 비교해요.','떡볶이: 9,000원 − 7,500원 = 1,500원<br>김밥: 7,000원 − 8,500원 = −1,500원')]}
 ];
 const order=['explicit','forgone','implicit','opportunity','benefit','net','rational','sunk','application-cost','application-net'];
 function createState(){return {mode:'basic',positions:{basic:0,applied:0},answers:{basic:Array(4).fill(null),applied:Array(4).fill(null)},checked:{basic:Array(4).fill(false),applied:Array(4).fill(false)},bridgeSeen:false};}
 function art(name){return window.GalpiLearningArt.scene(name).replace('class="learning-scene-art hl-icon"','class="cost-lesson-art"');}
 function guide(q){return `<ol class="cost-guide-steps">${q.steps.map(s=>`<li><h4>${s.title}</h4><p class="cost-guide-formula">${s.formula}</p><p>${s.why}</p><p class="cost-guide-calculation">${s.equation}</p></li>`).join('')}</ol>`;}
 function formulas(q){return `<section class="cost-formulas" aria-label="${q.type==='sunk'?'판단 기준':'기본 공식'}"><h4>${q.type==='sunk'?'판단 기준':'이번 단계의 기본 공식'}</h4>${q.formula.map(t=>`<p>${t}</p>`).join('')}</section>`;}
 function conditions(rows){return rows?.length?`<dl class="cost-conditions">${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${typeof value==='number'?won(value):value}</dd></div>`).join('')}</dl>`:'';}
 function implicitWalkthrough(){
  const questions=[
   {
    title:'포기한 김밥에서 무엇을 잃었을까요?',
    explanation:'김밥을 먹지 않아서 7,000원어치 만족을 놓쳤지만, 김밥 값 4,500원도 내지 않았어요. 그래서 김밥을 먹었다면 남았을 이득만큼 포기한 거예요.',
    equation:'김밥의 편익 7,000원 − 김밥 값 4,500원 = 암묵적 비용 2,500원'
   },
   {
    title:'두 비용을 왜 더할까요?',
    explanation:'떡볶이를 고르면서 떡볶이 값을 실제로 냈고, 동시에 김밥을 먹었다면 얻었을 이득도 놓쳤어요. 두 가지 모두 떡볶이 선택 때문에 생긴 비용이에요.',
    equation:'떡볶이 값 5,000원 + 포기한 이득 2,500원 = 기회비용 7,500원'
   },
   {
    title:'순편익은 이제 어느 쪽을 볼까요?',
    explanation:'이번에는 선택한 떡볶이를 봐요. 떡볶이에서 얻은 만족을 금액으로 평가한 편익에서, 앞에서 구한 전체 비용을 빼요.',
    equation:'떡볶이 편익 9,000원 − 기회비용 7,500원 = 순편익 1,500원'
   }
  ];
  return `<section class="cost-implicit-walkthrough" aria-label="암묵적 비용부터 순편익까지">
   <p class="cost-walkthrough-case"><strong>선택한 쪽</strong> 떡볶이 <strong>포기한 쪽</strong> 김밥</p>
   <p>떡볶이와 김밥 중 하나만 먹을 수 있어요. 떡볶이를 골랐다고 생각하고, 포기한 김밥에서 시작해 선택한 떡볶이의 순편익까지 계산해 봐요.</p>
   <ol class="cost-walkthrough-flow">${questions.map((q,i)=>`<li>
    <span class="cost-flow-number" aria-hidden="true">${i+1}</span>
    <div><h3>${q.title}</h3><p class="cost-walkthrough-equation">${q.equation}</p><p>${q.explanation}</p></div>
   </li>`).join('')}</ol>
  </section>`;
 }
 function bridge(where='example'){
  return `<section class="cost-price-bridge" data-board-screen="cost-price-bridge" aria-labelledby="cost-bridge-title">
   <h2 id="cost-bridge-title">포기한 대안에서 얻을 수 있었던 이득</h2>
   <p><strong>암묵적 비용</strong>은 선택하지 않은 대안 중 가장 유리한 것에서 얻을 수 있었던 이득이에요. 그 대안을 선택할 때만 드는 돈이 있다면, 편익에서 그 돈을 빼서 얼마가 남았을지 계산해요.</p>
   <p>영화 예제에서는 아르바이트를 하는 데 별도 비용이 없었으므로, 받을 수 있었던 16,000원 전체가 암묵적 비용이었어요.</p>
   ${implicitWalkthrough()}
   <p class="cost-source">미래엔 『통합사회2』 75쪽 사례의 수치와 개념을 바탕으로 새로 설명했습니다.</p>
   <button type="button" class="btn primary" data-action="costPriceReady">${where==='quiz'?'문제 풀기':'응용 예제로'} →</button>
  </section>`;
 }
 function exampleAlternative({name,role,illustration,rows,active}){
  return `<section class="cost-alternative${active?' is-relevant':''}">
   <div class="cost-alternative-heading">${illustration}<div>${role?`<span class="cost-choice-role">${role}</span>`:''}<h4>${name}</h4></div></div>
   <dl>${rows.map(([label,value])=>`<div><dt>${label}</dt><dd>${won(value)}</dd></div>`).join('')}</dl>
  </section>`;
 }
 function reference(mode,i){
  const basicMode=mode==='basic';
  const roles=i===3&&!basicMode?['첫 번째 대안','두 번째 대안']:i===2&&!basicMode?['포기한 대안','선택한 대안']:['선택한 대안','포기한 대안'];
  const examples=basicMode
   ? [['영화 관람',art('cinema'),[['영화표 가격',8000]]],['아르바이트',art('work'),[['받을 수입',16000]]]]
   : [['떡볶이',art('tteokbokki'),[['편익',9000],['가격',5000]]],['김밥',art('gimbap'),[['편익',7000],['가격',4500]]]];
  const active=basicMode?[[0],[1],[0,1],[]][i]:[[1],[0,1],[0],[0,1]][i];
  return `<section class="cost-reference" aria-label="예제에서 주어진 자료">
   <h3>비교할 대안</h3>
   <p class="cost-time">${basicMode?'토요일 오후 2시간 · 두 활동 중 하나만 선택 · 추가 비용 없음':'두 메뉴 중 하나만 선택 · 편익은 만족이나 이익을 금액으로 평가한 값'}</p>
   <div class="cost-alternatives">${examples.map(([name,illustration,rows],j)=>exampleAlternative({name,illustration,rows,role:roles[j],active:active.includes(j)})).join('')}</div>
   ${qConditions(mode,i)}
  </section>`;
 }
 function qConditions(mode,i){
  if(mode!=='basic'||i!==3)return '';
  const q=basic[i];
  return `<div class="cost-given">${conditions(q.conditions)}<p class="cost-benefit-note">${q.note}</p></div>`;
 }
 function lessonCalculation(mode,i){
  if(mode!=='basic'||i<2)return '';
  // Read values from the existing example data; grading and formulas are unchanged.
  return U().calculation(i===2?[
   {label:basic[0].topic,value:won(basic[0].answerValue),art:'ticket'},
   {label:basic[1].topic,value:won(basic[1].answerValue),art:'work'},
   {label:basic[2].topic,value:won(basic[2].answerValue),art:'certificate'}
  ]:[
   {label:'편익',value:won(basic[3].conditions[0][1]),art:'idea'},
   {label:basic[2].topic,value:won(basic[2].answerValue),art:'certificate'},
   {label:basic[3].topic,value:won(basic[3].answerValue),art:'wallet'}
  ],[i===2?'+':'−','=']);
 }
 function lessonCue(mode,i){
  const cues=mode==='basic'
   ? ['선택한 영화의 표 값을 보세요.','포기한 아르바이트에서 들어왔을 돈을 보세요.','영화표에 낸 돈과 아르바이트에서 포기한 이득을 함께 보세요.','선택한 영화의 편익에서 영화 선택의 기회비용을 빼 보세요.']
   : ['포기한 김밥의 편익과 김밥 가격을 보세요.','떡볶이에 낸 돈에, 김밥을 포기한 이득을 더해 보세요.','이번에는 김밥을 골랐어요. 포기한 떡볶이의 편익과 가격을 보세요.','두 메뉴를 각각 골랐을 때의 순편익을 비교해 보세요.'];
  return `<p class="cost-lesson-cue">${cues[i]}</p>`;
 }
 function renderLesson(m){
  const mode=m.mode,list=mode==='basic'?basic:applied,i=m.positions[mode],q=list[i],selected=m.answers[mode][i],checked=m.checked[mode][i],correct=selected!==null&&q.options[selected]===q.answerValue;
  const modes=`<nav class="cost-example-modes" aria-label="예제 선택"><button type="button" data-action="costMode" data-mode="basic" aria-pressed="${mode==='basic'}">01 기본 · 영화와 아르바이트</button><button type="button" data-action="costMode" data-mode="applied" aria-pressed="${mode==='applied'}">02 응용 · 떡볶이와 김밥</button></nav>`;
  if(mode==='applied'&&!m.bridgeSeen)return modes+bridge();
  return `${modes}<article class="cost-lesson-sheet">
   <nav class="cost-lesson-steps" aria-label="예제의 네 단계">${list.map((x,j)=>`<button type="button" data-action="costStep" data-i="${j}" aria-current="${j===i?'step':'false'}"><span>${j+1}</span>${x.topic}</button>`).join('')}</nav>
   <header class="cost-lesson-heading"><h2>${mode==='basic'?'영화를 선택하면 무엇을 포기할까요?':'포기한 메뉴에도 가격이 있다면?'}</h2>${mode==='applied'?'<p class="cost-source">미래엔 『통합사회2』 75쪽</p>':''}</header>
   <div class="cost-lesson-layout">${reference(mode,i)}<section class="cost-lesson-work" aria-labelledby="cost-lesson-question">
   <h3 id="cost-lesson-question" tabindex="-1">${q.prompt}</h3>${lessonCue(mode,i)}<div class="cost-lesson-choices" role="group" aria-label="답 선택">${q.options.map((value,j)=>U().choice({text:typeof value==='number'?won(value):value,index:j,selected:selected===j,checked,correct:value===q.answerValue,attributes:`data-action="costAnswer" data-i="${j}"`})).join('')}</div>${checked?`<section class="cost-lesson-feedback ${correct?'is-success':'is-incorrect'}" role="status"><strong>${correct?'✓ 정답이에요':'! 정답과 이유를 확인해요'}</strong><p>${q.explain}</p>${lessonCalculation(mode,i)}${formulas(q)}</section><details class="learning-explanation"><summary>풀이 힌트 자세히 보기</summary><div>${guide(q)}</div></details>`:`<button type="button" class="btn primary" data-action="costCheck" ${selected===null?'disabled':''}>정답 확인</button>`}<div class="cost-lesson-actions"><button type="button" class="btn" data-action="costPrev" ${i===0?'disabled':''}>← 이전 단계</button>${checked?'<button type="button" class="cost-text-action" data-action="costRetry">다시 풀기</button>':''}${checked?`<button type="button" class="btn primary" data-action="costNext">${i<3?'다음 단계 →':mode==='basic'?'응용 예제로 →':'문제 연습으로 →'}</button>`:''}</div>${mode==='basic'&&m.checked.basic.every(Boolean)?`<p class="cost-completion">확인한 흐름: 명시적 비용 8,000원 + 암묵적 비용 16,000원 = 기회비용 24,000원<br>편익 30,000원 − 기회비용 24,000원 = 순편익 6,000원</p>`:''}${mode==='applied'&&i===3&&checked?'<p class="cost-source">교과서 사례 계산 결과: 떡볶이 기회비용 7,500원·순편익 1,500원 / 김밥 기회비용 8,500원·순편익 −1,500원</p>':''}</section></div></article>`;
 }
 function handle(action,data,m){
  const mode=m.mode,i=m.positions[mode],list=mode==='basic'?basic:applied;
  if(action==='costMode'){m.mode=data.mode;return 'navigate';}
  if(action==='costPriceReady'){m.bridgeSeen=true;return 'navigate';}
  if(action==='costStep'){m.positions[mode]=Number(data.i);return 'navigate';}
  if(action==='costAnswer'){if(!m.checked[mode][i])m.answers[mode][i]=Number(data.i);return 'update';}
  if(action==='costCheck'){if(m.answers[mode][i]!==null)m.checked[mode][i]=true;return 'feedback';}
  if(action==='costRetry'){m.checked[mode][i]=false;m.answers[mode][i]=null;return 'update';}
  if(action==='costPrev'){m.positions[mode]=Math.max(0,i-1);return 'navigate';}
  if(action==='costNext'){
   if(!m.checked[mode][i])return 'update';
   if(i<list.length-1)m.positions[mode]++;
   else if(mode==='basic')m.mode='applied';
   else return 'practice';
   return 'navigate';
  }
  return null;
 }
 function question(type,id,{randMoney,numericOptions,shuffle}){
  const price=randMoney(12,20),income=randMoney(24,40),gain=randMoney(4,12),benefit=price+income+gain;
  const q={id,type,topic:'',phase:id<2?'기초 구분':id<4?'비용 계산':id<6?'편익과 순편익':id<8?'선택과 판단':'종합 응용',facts:{price,income,benefit},situation:'',prompt:'',conditions:[],formula:[],steps:[],explain:'',options:[],correct:0};
  const numeric=(value,distractors)=>{q.answerValue=value;q.options=numericOptions(value,distractors);q.correct=q.options.indexOf(won(value));};
  const choice=(answer,options)=>{q.answerValue=answer;q.options=shuffle(options);q.correct=q.options.indexOf(answer);};
  const movieStory='토요일 오후 2시간 동안 영화 관람과 아르바이트 중 하나만 할 수 있어요. 영화를 선택했으며, 영화표 값 외의 다른 비용은 없어요.';
  const costFormula='기회비용 = 명시적 비용 + 암묵적 비용',netFormula='순편익 = 편익 − 기회비용';
  if(type==='explicit'){
   q.topic='명시적 비용';q.situation=movieStory;q.prompt='영화를 선택할 때의 명시적 비용은 얼마일까요?';q.conditions=[['영화표 값 (실제 지출)',price],['포기한 아르바이트 수입',income]];numeric(price,[income,price+income,0]);q.formula=['명시적 비용 = 실제로 지출하는 금액'];q.explain=`실제로 지불하는 영화표 값 ${won(price)}이 명시적 비용이에요.`;q.steps=[step('직접 내는 돈을 구분해요',q.formula[0],'아르바이트 수입은 받지 못하는 돈이고, 영화표 값은 직접 내는 돈이에요.',`${won(price)} = 명시적 비용`)];
  }else if(type==='forgone'){
   q.topic='포기한 대안 구분';q.situation=movieStory;q.prompt='영화를 선택하면서 포기한 기회의 가치는 무엇일까요?';q.conditions=[['영화표 값',price],['아르바이트를 하면 받을 수입',income]];choice('아르바이트로 받을 수 있었던 수입',['아르바이트로 받을 수 있었던 수입','직접 지불하는 영화표 값','영화를 보며 얻는 만족','영화표를 예매한 날짜']);q.formula=['선택한 대안: 영화 / 포기한 대안: 아르바이트'];q.explain='같은 시간에 아르바이트를 할 수 없으므로, 그 일을 했다면 받을 수입을 포기해요.';q.steps=[step('선택과 포기를 나란히 놓아요','암묵적 비용은 포기한 최선의 대안에서 얻을 수 있었던 가치','영화표 값은 선택한 영화에 지출하는 비용이고, 아르바이트 수입은 포기한 활동에서 얻을 수 있었던 가치예요.',`선택: 영화 / 포기: 아르바이트 수입 ${won(income)}`)];
  }else if(type==='implicit'){
   q.topic='암묵적 비용';q.situation=movieStory;q.prompt='영화 선택의 암묵적 비용은 얼마일까요?';q.conditions=[['영화표 값',price],['포기한 아르바이트 수입',income],['아르바이트에 드는 다른 비용',0]];numeric(income,[price,income+price,0]);q.formula=['이 문제의 암묵적 비용 = 포기한 아르바이트 수입'];q.explain=`아르바이트에는 다른 비용이 없으므로, 받을 수 있었던 수입 ${won(income)} 전체가 암묵적 비용이에요.`;q.steps=[step('포기한 활동의 수입을 확인해요',q.formula[0],'이번 문제는 포기한 활동에 다른 비용이 없어요. 따라서 수입에서 추가로 뺄 금액도 없어요.',`포기한 수입 ${won(income)} = 암묵적 비용`)];
  }else if(type==='opportunity'){
   q.topic='기회비용';q.situation=movieStory;q.prompt='영화를 선택할 때의 기회비용은 얼마일까요?';q.conditions=[['영화표 값 (명시적 비용)',price],['포기한 아르바이트 수입 (암묵적 비용)',income]];numeric(price+income,[price,income,0]);q.formula=[costFormula];q.explain='영화표에 실제로 지출한 돈과 아르바이트를 포기한 수입을 더해요.';q.steps=[step('두 종류의 비용을 합해요',costFormula,'기회비용은 실제 지출만이 아니에요. 영화표 값과 포기한 아르바이트 수입을 모두 고려해요.',`${won(price)} + ${won(income)} = ${won(price+income)}`)];
  }else if(type==='benefit'){
   q.topic='편익의 의미';q.situation='영화에서 얻을 만족과 즐거움을 금전적으로 평가했어요. 이 값은 실제로 받는 돈이 아니라 영화 선택의 편익이에요.';q.prompt='영화를 선택할 때의 편익은 얼마일까요?';q.conditions=[['영화의 편익 (만족·즐거움의 금전 평가)',benefit],['영화표 값',price],['포기한 아르바이트 수입',income]];numeric(benefit,[price,income,price+income]);q.formula=['편익 = 선택으로 얻는 만족이나 이익을 평가한 값'];q.explain=`만족과 즐거움을 평가한 ${won(benefit)}이 편익이에요. 영화표 값이나 포기한 수입과는 구분해요.`;q.steps=[step('얻는 것과 비용을 구분해요',q.formula[0],'편익은 선택으로 얻는 만족이나 이익이에요. 표에서 영화의 만족을 평가한 금액을 찾으면 돼요.',`영화의 편익 = ${won(benefit)}`)];
  }else if(type==='net'){
   q.topic='순편익';q.situation=movieStory+' 영화의 편익은 만족감을 금전적으로 평가한 값이에요.';q.prompt='영화를 선택할 때의 순편익은 얼마일까요?';q.conditions=[['영화의 편익 (만족의 금전 평가)',benefit],['영화표 값 (명시적 비용)',price],['포기한 수입 (암묵적 비용)',income]];numeric(benefit-price-income,[benefit-price,benefit-income,price+income]);q.formula=[costFormula,netFormula];q.explain='얻는 편익에서 실제 지출과 포기한 수입을 모두 포함한 기회비용을 빼요.';q.steps=[step('기회비용을 먼저 구해요',costFormula,'앞에서 배운 명시적 비용과 암묵적 비용을 더해요.',`${won(price)} + ${won(income)} = ${won(price+income)}`),step('편익에서 기회비용을 빼요',netFormula,'편익에서 영화표 값만 빼면 아르바이트를 포기한 비용이 빠져요.',`${won(benefit)} − ${won(price+income)} = ${won(benefit-price-income)}`)];
  }else if(type==='rational'){
   const delta=randMoney(4,12)*(randMoney(0,1)===0?-1:1);q.facts.benefit=price+income+delta;q.facts.netMovie=delta;q.facts.netWork=-delta;
   q.topic='합리적 선택';q.situation='영화와 아르바이트 중 하나를 선택하려고 해요. 두 활동의 편익에서 각각의 기회비용을 뺀 순편익을 이미 계산해 두었어요.';q.prompt='이미 계산한 순편익을 비교하면 어느 선택이 더 합리적일까요?';q.conditions=[['영화 선택의 순편익',delta],['아르바이트 선택의 순편익',-delta]];choice(delta>0?'영화 관람':'아르바이트',['영화 관람','아르바이트','두 선택이 같다','자료가 부족하다']);q.formula=[netFormula,'합리적 선택: 순편익이 더 큰 대안'];q.explain='이 문제는 새로운 비용을 계산하지 않고, 이미 주어진 순편익을 비교하면 돼요.';q.steps=[step('두 순편익 중 큰 값을 찾아요','합리적 선택 = 순편익이 더 큰 대안','순편익은 포기한 기회까지 반영한 값이에요. 음수보다 양수인 선택의 순편익이 더 커요.',`영화 ${won(delta)} / 아르바이트 ${won(-delta)} → ${q.answerValue}`)];
  }else if(type==='sunk'){
   const paid=randMoney(10,20);q.facts.paid=paid;q.topic='매몰 비용';q.situation=`체험 수업료 ${won(paid)}을 미리 냈지만, 지금은 수업에 갈지 고민하고 있어요. 이미 낸 수업료는 환불·양도·재판매가 모두 불가능해요.`;q.prompt='앞으로 수업에 갈지 결정할 때 제외해야 할 항목은 무엇일까요?';choice('이미 지불해 회수할 수 없는 수업료',['이미 지불해 회수할 수 없는 수업료','앞으로 필요한 교통비','앞으로 이동에 들일 시간','참여하면 얻을 만족감']);q.formula=['매몰 비용: 이미 지불했고 회수할 수 없는 비용'];q.explain='이미 낸 수업료는 어떤 선택을 해도 돌아오지 않으므로, 앞으로의 선택에서 제외해요.';q.steps=[step('결정에 따라 달라지는지 확인해요',q.formula[0],'수업에 가도 가지 않아도 수업료는 돌려받지 못해요. 반면 교통비·시간·만족감은 앞으로의 선택에 따라 달라져요.',`회수할 수 없는 ${won(paid)} → 매몰 비용`)];
  }else{
   const chosenPrice=randMoney(8,14),otherPrice=randMoney(6,12),implicit=randMoney(4,10),otherBenefit=otherPrice+implicit,delta=randMoney(2,8),chosenBenefit=chosenPrice+implicit+delta;
   Object.assign(q.facts,{chosenPrice,otherPrice,otherBenefit,implicit,chosenBenefit});q.requiresBridge=true;q.topic=type==='application-cost'?'기회비용':'순편익';q.situation='점심으로 떡볶이와 김밥 중 하나만 먹을 수 있어요. 떡볶이를 선택했으므로 김밥을 먹을 기회를 포기해요.';q.prompt=type==='application-cost'?'떡볶이 선택의 기회비용은 얼마일까요?':'떡볶이 선택의 순편익은 얼마일까요?';q.conditions=[['선택한 떡볶이 가격 (실제 지출)',chosenPrice],['포기한 김밥의 편익 (만족의 금전 평가)',otherBenefit],['포기한 김밥 가격 (먹지 않으면 내지 않는 돈)',otherPrice]];if(type==='application-net')q.conditions.unshift(['선택한 떡볶이의 편익 (만족의 금전 평가)',chosenBenefit]);
   q.formula=['암묵적 비용 = 포기한 김밥의 편익 − 김밥 가격',costFormula];q.steps=[step('김밥을 포기한 암묵적 비용을 구해요',q.formula[0],'김밥을 먹지 않으면 만족을 얻지 못하지만 가격도 내지 않아요. 앞에서 배운 대로 편익에서 가격을 빼요.',`${won(otherBenefit)} − ${won(otherPrice)} = ${won(implicit)}`),step('떡볶이의 명시적 비용과 더해요',costFormula,'선택한 떡볶이의 가격에 포기한 김밥의 이익을 더해요.',`${won(chosenPrice)} + ${won(implicit)} = ${won(chosenPrice+implicit)}`)];
   if(type==='application-cost'){numeric(chosenPrice+implicit,[chosenPrice,implicit,chosenPrice+otherBenefit]);q.explain='가격이 있는 포기한 대안은 편익에서 가격을 빼서 암묵적 비용을 구한 뒤, 선택한 메뉴의 명시적 비용과 더해요.';}
   else{numeric(delta,[chosenBenefit-chosenPrice,chosenPrice+implicit,chosenBenefit]);q.formula.push(netFormula);q.steps.push(step('편익에서 기회비용을 빼요',netFormula,'지금 묻는 것은 순편익이므로, 앞에서 구한 기회비용을 선택한 떡볶이의 편익에서 빼야 해요.',`${won(chosenBenefit)} − ${won(chosenPrice+implicit)} = ${won(delta)}`));q.explain='포기한 김밥의 암묵적 비용, 떡볶이의 기회비용을 차례로 구하고 마지막에 순편익을 계산해요.';}
  }
  q.wrongReasons=q.options.map((_,i)=>i===q.correct?'':'선택한 대안과 포기한 대안을 먼저 구분하고, 지금 묻는 개념에 맞는 공식을 확인해 보세요.');return q;
 }
 function renderPractice(q,z){
  const choices=q.options.map((text,i)=>U().choice({text:esc(text),index:i,selected:z.selected===i,checked:z.checked,correct:q.correct===i,attributes:`data-answer="${i}"`})).join('');
  const feedback=z.checked?U().feedback({correct:z.selected===q.correct,answer:esc(q.options[q.correct]),selected:esc(q.options[z.selected]),explain:q.explain,visual:formulas(q),guide:guide(q),wrongReason:z.selected!==q.correct?q.wrongReasons[z.selected]:'',next:`<button type="button" class="btn primary" data-action="nextQ">${z.index===z.questions.length-1?'학습 결과 확인':'다음 문제 →'}</button>`}):'';
  return U().question({boardKey:window.GalpiBoardStore.questionKey(q),number:z.index+1,total:z.questions.length,topic:q.topic,prompt:`<p class="cost-kicker">${q.phase}</p><p class="cost-situation">${q.situation}</p><h2 class="question-title">${q.prompt}</h2>`,evidence:conditions(q.conditions)+(q.requiresBridge?'<details class="cost-compact-help"><summary>포기한 대안의 가격을 빼는 이유</summary><p>그 대안을 선택하지 않으면 편익을 얻지 못하지만 가격도 내지 않아요. 따라서 편익에서 가격을 뺀 이익을 포기해요.</p></details>':''),choices,feedback,action:z.checked?'':`<button type="button" class="btn primary" data-action="grade" ${z.selected===null?'disabled':''}>정답 확인</button>`,retry:z.mode==='retry'})+'<p class="learning-privacy">문제와 풀이 결과는 새로고침하면 초기화됩니다.</p>';
 }
 window.GalpiCostLearning={art,basic,applied,order,createState,renderLesson,bridge,implicitWalkthrough,handle,question,renderPractice};
})();
