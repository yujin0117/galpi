/* Capitalism review: isolated page-memory state, existing shared learning UI. */
(() => {
  'use strict';
  const D=window.GalpiCapitalismData,A=window.GalpiCapitalismArt,U=window.GalpiLabUI;
  const host=()=>document.querySelector('#content');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const btn=(text,action,attrs='',primary=false)=>`<button type="button" class="btn ${primary?'primary':''}" data-cp="${action}" ${attrs}>${text}</button>`;
  const labels=['등장 배경','핵심 경제적 특징','시장과 정부의 관계'];
  const m={tab:0,era:0,detail:0,seen:[1,0,0,0],overview:false,teacher:false,reveal:false,system:0,systemAnswers:[null,null,null],systemChecked:[false,false,false],quiz:null,review:false};
  function detail(i){
    const e=D.eras[i],copy=[e.background,e.feature,e.government][m.detail];
    return `<section class="cp-era-detail" aria-labelledby="cp-era-title"><div class="cp-detail-visual">${A.connection(i,m.detail)}<details class="cp-era-context"><summary>시대 전체 흐름 보기</summary><div class="cp-cause-flow">${e.links.map(t=>`<span>${esc(t)}</span>`).join('<b aria-hidden="true">→</b>')}</div></details></div><div class="cp-detail-copy"><p class="cp-eyebrow">${e.time} · ${e.pages}</p><h2 id="cp-era-title" tabindex="-1">${e.name}</h2><ol class="cp-detail-steps" aria-label="시대별 설명 순서">${labels.map((t,j)=>`<li>${btn(`<span>${j+1}</span>${t}`,'detail',`data-value="${j}" aria-pressed="${j===m.detail}"`)}</li>`).join('')}</ol><h3>${labels[m.detail]}</h3>${copy.map(t=>`<p>${t}</p>`).join('')}${i===3&&m.detail===0?'<p class="cp-term"><strong>스태그플레이션</strong> · 경기 침체와 물가 상승이 동시에 나타나는 상태</p>':''}<div class="cp-detail-actions">${btn('← 이전 설명','back-detail',m.detail===0?'disabled':'')}${btn(m.detail<2?'다음 설명 →':i<3?'다음 시대 →':'네 시대 한눈에 비교 ↓','next-detail','',true)}</div><p class="cp-small">설명 ${m.detail+1} / 3 · 다른 시대도 자유롭게 선택할 수 있어요.</p></div></section>`;
  }
  function timeline(){
    return `<section class="cp-definition" aria-labelledby="cp-definition-title"><header><p class="cp-eyebrow">개념 정의 · 68쪽</p><h2 id="cp-definition-title">자본주의의 의미</h2></header><p class="cp-definition-text"><strong>사유 재산</strong>을 바탕으로 시장에서 <strong>자유로운 경제활동</strong>을 보장하는 경제 체제예요.</p><h3>자본주의를 이해하는 핵심 키워드</h3><ul class="cp-keywords">${["사유 재산권","경제활동의 자유","사적 이익 추구","자유로운 경쟁"].map((text,i)=>`<li>${A.keyword(i)}<span>${text}</span></li>`).join('')}</ul></section><header class="cp-section-heading"><div><p class="cp-eyebrow">01 · 자본주의의 변화</p><h2>자본주의는 왜 변화했을까?</h2></div><span>시대를 눌러 살펴보세요</span></header><ol class="cp-timeline" aria-label="자본주의의 대표적 역사 흐름">${D.eras.map((e,i)=>`<li>${btn(`${A.era(i)}<span class="cp-era-label"><span class="cp-era-number">0${i+1}</span><span><strong>${e.name}</strong><small>${e.time}</small></span>${m.seen[i]===7?'<span class="cp-era-read" aria-label="세 설명 확인">✓</span>':''}</span>`,'era',`data-value="${i}" aria-pressed="${m.era===i}" aria-controls="cp-era-title"`)}${i===m.era?detail(i):''}</li>`).join('')}</ol><p class="cp-small cp-history-note">자본주의의 대표적인 전개 흐름이에요. 같은 시기에 모든 국가가 동일한 방식으로 경제를 운영했다는 뜻은 아닙니다.</p><details class="cp-overview" ${m.overview?'open':''}><summary>네 시대 한눈에 비교</summary><div class="table-scroll"><table><caption>경제활동의 중심과 시장·정부의 관계 · 69~71쪽</caption><thead><tr><th scope="col">시대</th><th scope="col">핵심 특징</th><th scope="col">시장과 정부</th></tr></thead><tbody>${D.eras.map(e=>`<tr><th scope="row">${e.name}</th><td>${e.focus}</td><td>${e.role}</td></tr>`).join('')}</tbody></table></div><section class="cp-failure-comparison" aria-labelledby="cp-failure-title"><header><p class="cp-eyebrow">한눈에 비교 · 70~71쪽</p><h3 id="cp-failure-title">시장 실패와 정부 실패, 무엇이 다를까요?</h3><p>어떤 조정 방식에서 한계가 나타났는지 비교해요.</p></header><div class="cp-failure-pair"><article><header><span class="cp-failure-symbol">${window.GalpiLearningArt.scene('shop')}</span><div><p>시장에 맡겼을 때</p><h4>시장 실패</h4></div></header><p class="cp-failure-meaning">시장에 맡겨도 자원이 효율적으로 배분되지 못하는 상태</p><div class="cp-failure-response"><span aria-hidden="true">↓</span><small>당시 강조된 대응</small><strong>정부의 적극적인 개입</strong><span class="cp-era-connection">수정 자본주의의 등장 배경</span></div></article><article><header><span class="cp-failure-symbol">${window.GalpiLearningArt.scene('bank')}</span><div><p>정부가 개입했을 때</p><h4>정부 실패</h4></div></header><p class="cp-failure-meaning">문제 개선을 위한 정부 개입이 문제를 충분히 해결하지 못하거나 악화시키는 현상</p><div class="cp-failure-response"><span aria-hidden="true">↓</span><small>당시 강조된 대응</small><strong>시장 기능의 강조</strong><span class="cp-era-connection">신자유주의의 등장 배경</span></div></article></div></section></details><div class="cp-page-actions">${btn('02 경제 체제 비교로 →','tab','data-value="1"',true)}</div><aside class="cp-history-link"><div><p class="cp-eyebrow">선택 연계</p><strong>한국사2와 연결해서 보기</strong><p>1970년대 석유 파동은 당시 대한민국 경제에도 영향을 미쳤습니다.</p></div><button type="button" class="learning-related-link" data-cp="history">석유 파동과 한국 경제 <span aria-hidden="true">↗</span></button></aside>`;
  }
  function systemCheck(){
    const i=m.system,q=D.checks[i],selected=m.systemAnswers[i],checked=m.systemChecked[i];
    return `<section class="cp-system-check"><header><p class="cp-eyebrow">구분 확인 ${i+1} / 3</p><h3>어떤 경제 체제일까요?</h3></header><p class="cp-check-prompt">${q.prompt}</p><div class="cp-system-choices">${['시장경제 체제','계획경제 체제','혼합 경제 체제'].map((t,j)=>btn(t,'system-answer',`data-value="${j}" aria-pressed="${selected===j}" ${checked?'disabled':''}`)).join('')}</div>${checked?`<div class="cp-check-feedback ${selected===q.correct?'is-correct':'is-wrong'}" role="status"><strong>${selected===q.correct?'✓ 맞았어요!':'! 다시 구분해 볼까요?'}</strong><p>${q.explain}</p>${selected!==q.correct?btn('다시 고르기','system-retry'):''}</div>`:btn('선택 확인하기','system-check',selected===null?'disabled':'',true)}<div class="cp-page-actions">${btn('← 이전 확인','system-prev',i===0?'disabled':'')}${i<2?btn('다음 확인 →','system-next','',true):btn('03 개념 이해도 점검 →','tab','data-value="2"',true)}</div></section>`;
  }
  function systems(){
    return `<section class="cp-economic-problems" aria-labelledby="cp-economic-title"><header class="cp-section-heading"><div><p class="cp-eyebrow">02 · 경제 체제 비교</p><h2>경제 문제, 누가 어떻게 결정할까요?</h2></div></header><header><p class="cp-eyebrow">개념 연결 · 72쪽</p><h3 id="cp-economic-title">기본적인 경제 문제</h3><p>경제 체제는 사회가 기본적인 경제 문제를 해결하는 제도나 방식이에요.</p></header><ol>${[['shirt','무엇을 얼마나','생산할 대상과 양','생산할 것인가?'],['factory','어떻게','생산 방법','생산할 것인가?'],['people','누구를 위하여','분배 대상','생산할 것인가?']].map(([art,title,label,end],i)=>`<li><span class="cp-problem-art">${window.GalpiLearningArt.scene(art)}</span><div><small>0${i+1} · ${label}</small><h4>${title}<span>${end}</span></h4></div></li>`).join('')}</ol><p class="cp-problem-bridge">이 문제를 <strong>시장 가격과 자유로운 선택</strong>으로 해결할까요, <strong>정부의 계획과 통제</strong>로 해결할까요?</p></section><div class="cp-systems-grid">${D.systems.map((s,i)=>`<figure><header><span class="cp-system-letter">${i?'B':'A'}</span><h3>${s.name}</h3></header>${A.system(!!i)}<figcaption><strong>${s.flow}</strong><p>${s.summary}</p></figcaption><dl><div><dt>기본 원리</dt><dd>${s.basis}</dd></div><div><dt>기대하는 점</dt><dd>${s.strength}</dd></div><div><dt>한계</dt><dd>${s.limit}</dd></div></dl></figure>`).join('')}</div><section class="cp-mixed"><header><p class="cp-eyebrow">두 원리를 비교한 뒤, 오늘날의 경제로</p><h2>시장을 바탕으로, 정부 역할을 함께</h2></header><div class="cp-mixed-diagram"><div class="cp-market-foundation">${window.GalpiLearningArt.scene('shop')}<strong>시장경제를 기반으로</strong><span>가격 · 자유로운 선택 · 경쟁과 거래</span></div><span class="cp-mixed-plus" aria-hidden="true">+</span><div class="cp-government-role">${window.GalpiLearningArt.scene('bank')}<strong>정부의 경제적 역할</strong><span>계획경제의 요소가 일부 결합</span></div><div class="cp-mixed-result"><span aria-hidden="true">↓</span><h3>혼합 경제 체제</h3><p>오늘날 대부분 국가에서 나타나는 형태예요.<br>정부 규제가 있다는 이유만으로 계획경제라고 판단하지 않아요.</p></div></div></section><section class="cp-perspectives"><h3>시장과 정부를 바라보는 두 관점 <small>73쪽</small></h3><div><article><strong>시장의 자동 조정 기능 강조</strong><p>자유로운 경쟁과 선택을 통해 자원이 효율적으로 배분될 것을 중시해요.</p></article><article><strong>정부의 적극적 개입 강조</strong><p>정부가 불황·실업에 대응하고 사회 구성원의 생활을 뒷받침할 것을 중시해요.</p></article></div><p class="cp-small">두 관점의 차이를 비교하는 활동이에요. 어느 한 관점을 의견의 정답으로 채점하지 않아요.</p></section>${systemCheck()}`;
  }
  const newQuiz=(ids=D.quiz.map(q=>q.id),retry=false)=>({ids:[...ids],index:0,responses:Array(ids.length).fill(null),selection:null,sequence:[],retry,result:false});
  const question=()=>D.quiz.find(q=>q.id===m.quiz.ids[m.quiz.index]);
  function grade(){
    const z=m.quiz;if(!z||z.result)return;
    const q=question(),answer=q.type==='order'?[...z.sequence]:z.selection;
    if(z.responses[z.index]||q.type==='order'&&answer.length!==4||q.type!=='order'&&answer===null)return;
    z.responses[z.index]={answer,correct:D.evaluate(q.id,answer)};m.reveal=true;
  }
  const answerText=(q,a)=>q.type==='order'?a.map(i=>q.options[i]).join(' → '):q.options[a];
  function quizResult(){
    const z=m.quiz,score=z.responses.filter(r=>r?.correct).length,good=z.ids.filter((_,i)=>z.responses[i]?.correct).map(id=>D.quiz.find(q=>q.id===id).topic),weak=z.ids.filter((_,i)=>!z.responses[i]?.correct).map(id=>D.quiz.find(q=>q.id===id).topic);
    return U.result({title:'배운 개념을 다시 짚어 봐요.',score,total:z.ids.length,good:good.join(' · ')||'이번에는 개념을 다시 살펴보고 재도전해 보세요.',weak:weak.join(' · ')||'이번 문항의 개념을 모두 확인했어요.',caption:z.retry?'이번 오답 재풀이 기준':'이번 7문항 기준',actions:`${weak.length?btn(`틀린 문항 다시 풀기 (${weak.length})`,'retry','',true)+btn('틀린 문항·해설 보기','review'):''}${btn('전체 다시 풀기','restart')}`})+(m.review&&weak.length?`<section class="cp-missed"><h3>다시 확인할 문항</h3>${z.ids.map((id,i)=>{const q=D.quiz.find(x=>x.id===id),r=z.responses[i];return r.correct?'':`<details open><summary>${q.topic} · ${q.pages}</summary><p>${q.prompt}</p><p>나의 답: ${esc(answerText(q,r.answer))}</p><p><strong>정답: ${esc(answerText(q,q.correct))}</strong></p><p>${q.explain}</p></details>`;}).join('')}</section>`:'');
  }
  function quiz(){return window.GalpiExamPractice.wrap('capitalism',quizBase(),m.teacher);}
  function quizBase(){
    if(!m.quiz)return `<section class="learning-start-card"><div class="cp-quiz-intro"><p class="cp-eyebrow">03 · 개념 이해도 점검</p><h2>7문항으로 개념을 연결해 볼까요?</h2><p>역사적 전개부터 경제 체제까지, 한 문항씩 확인해요.<br>정답 개수와 다시 살펴볼 개념은 이 화면에만 남아요.</p><div class="cp-quiz-topics"><span>역사 순서</span><span>시대별 특징</span><span>경제 체제</span></div>${btn('7문항 시작하기 →','start','',true)}</div></section>`;
    const z=m.quiz;if(z.result)return quizResult();
    const q=question(),response=z.responses[z.index],checked=!!response,show=checked&&(!m.teacher||m.reveal);
    const sequence=q.type==='order'?`<ol class="cp-order-slots" aria-label="내가 선택한 순서">${[0,1,2,3].map((_,i)=>`<li><span>${i+1}</span>${z.sequence[i]===undefined?'선택해 주세요':esc(q.options[z.sequence[i]])}</li>`).join('')}</ol><p class="cp-small">아래 시대를 순서대로 눌러 위 칸을 채워 보세요.</p>`:'';
    const choices=q.type==='order'?`<div class="cp-order-choices">${[2,0,3,1].map(i=>btn(q.options[i],'quiz-answer',`data-value="${i}" aria-pressed="${z.sequence.includes(i)}" ${checked||z.sequence.includes(i)?'disabled':''}`)).join('')}</div>${!checked&&z.sequence.length?btn('마지막 선택 되돌리기','undo'):''}`:q.options.map((text,i)=>U.choice({text,index:i,selected:z.selection===i,checked:show,correct:q.correct===i,attributes:`data-cp="quiz-answer" data-value="${i}" ${checked&&!show?'disabled':''}`})).join('');
    const feedback=show?U.feedback({correct:response.correct,answer:answerText(q,q.correct),selected:answerText(q,response.answer),explain:q.explain,next:btn(z.index===z.ids.length-1?'학습 결과 확인':'다음 문제 →','quiz-next','',true)}):'';
    return U.question({number:z.index+1,total:z.ids.length,topic:q.topic,prompt:`<h2 class="question-title">${q.prompt}</h2>`,evidence:sequence+(q.evidence?`<div class="cp-quiz-evidence">${q.evidence.map(t=>`<p>${t}</p>`).join('')}</div>`:''),choices,feedback,action:m.teacher&&!show?btn('선택 결과 공개','release',q.type==='order'?z.sequence.length!==4?'disabled':'':z.selection===null?'disabled':'',true):'',retry:z.retry})+`<p class="cp-small">교과서 ${q.pages} · ${m.teacher?'선택 결과 공개를 누르면':q.type==='order'?'네 시대를 모두 선택하면':'답을 선택하면'} 피드백이 나타나요. 자동으로 다음 문제로 넘어가지 않아요.</p>`;
  }
  function render(focus){
    const completed=[...(m.seen.every(n=>n===7)?[0]:[]),...(m.systemChecked.every((v,i)=>v&&m.systemAnswers[i]===D.checks[i].correct)?[1]:[]),...(m.quiz?.result?[2]:[])];
    host().innerHTML=`<section class="capitalism learning-v2"><div class="learning-toolbar">${btn('← 전체 콘텐츠','home')}${window.GalpiCurriculum.teacher('capitalism','data-cp-teacher',m.teacher)}</div>${U.header('capitalism','자본주의의 갈피','자본주의는 어떻게 변화했고, 경제 문제는 어떻게 해결할까요?')}${U.stepNav([['0','자본주의의 변화'],['1','경제 체제 비교'],['2','개념 이해도 점검']],m.tab,{idPrefix:'cp-tab',panel:'cp-panel',attribute:key=>`data-cp="tab" data-value="${key}"`,label:'자본주의 학습 메뉴',completed})}<div id="cp-panel" role="tabpanel" aria-labelledby="cp-tab-${m.tab}">${[timeline,systems,quiz][m.tab]()}</div><p class="cp-source">${D.source}</p><p class="cp-small">그림과 설명은 학습을 위해 새로 구성했습니다. 활동은 현재 페이지 메모리에만 남으며 새로고침하면 초기화됩니다.</p></section>`;
    U.mount(host());
    if(focus){const node=host().querySelector(focus);if(node){if(!node.matches('button,input,a,select,textarea'))node.tabIndex=-1;node.focus({preventScroll:true});}}
  }
  function open(){document.body.classList.remove('teacher-mode');setNav('social');if(location.hash!=='#capitalism')location.hash='capitalism';render();host().focus({preventScroll:true});scrollTo({top:0,behavior:'instant'});}
  document.addEventListener('click',event=>{
    const b=event.target.closest('.capitalism [data-cp]');if(!b)return;
    const a=b.dataset.cp,value=Number(b.dataset.value);let focus,showOverview=false;
    if(a==='home'){goHome();return;}
    if(a==='history'){window.GalpiHistory.open('basic','international');return;}
    if(a==='tab'){m.tab=value;render(`#cp-tab-${value}`);return;}
    if(a==='era'){m.era=value;m.detail=0;m.seen[value]|=1;focus=`[data-cp=era][data-value="${value}"]`;}
    if(a==='detail'){m.detail=value;m.seen[m.era]|=1<<value;focus=`[data-cp=detail][data-value="${value}"]`;}
    if(a==='back-detail'){m.detail=Math.max(0,m.detail-1);focus='#cp-era-title';}
    if(a==='next-detail'){
      if(m.detail<2)m.detail++;
      else if(m.era<3){m.era++;m.detail=0;}
      else {m.overview=true;showOverview=true;}
      m.seen[m.era]|=1<<m.detail;focus='#cp-era-title';
    }
    if(a==='system-answer'){m.systemAnswers[m.system]=value;m.systemChecked[m.system]=false;focus=`[data-cp=system-answer][data-value="${value}"]`;}
    if(a==='system-check'){if(m.systemAnswers[m.system]===null)return;m.systemChecked[m.system]=true;focus='.cp-check-feedback';}
    if(a==='system-retry'){m.systemChecked[m.system]=false;focus='[data-cp=system-answer]';}
    if(a==='system-prev')m.system=Math.max(0,m.system-1);
    if(a==='system-next')m.system=Math.min(2,m.system+1);
    if(a==='start'||a==='restart'){m.quiz=newQuiz();m.review=false;m.reveal=false;focus='.question-title';}
    if(a==='retry'){m.quiz=newQuiz(m.quiz.ids.filter((_,i)=>!m.quiz.responses[i].correct),true);m.review=false;m.reveal=false;focus='.question-title';}
    if(a==='review'){m.review=!m.review;focus='.cp-missed h3';}
    if(a==='quiz-answer'){
      const z=m.quiz;if(!z||z.result||z.responses[z.index])return;
      if(question().type==='order'){if(z.sequence.includes(value))return;z.sequence.push(value);}else z.selection=value;
      if(!m.teacher)grade();
      focus=m.quiz.responses[m.quiz.index]?'.learning-feedback-title h3':m.teacher&&question().type!=='order'?'[data-cp=release]':'.cp-order-slots';
    }
    if(a==='undo')m.quiz.sequence.pop();
    if(a==='release'){grade();m.reveal=true;focus='.learning-feedback-title h3';}
    if(a==='quiz-next'){
      const z=m.quiz;if(!z.responses[z.index]||m.teacher&&!m.reveal)return;
      if(z.index===z.ids.length-1){z.result=true;focus='.learning-result h2';}
      else {z.index++;z.selection=null;z.sequence=[];m.reveal=false;focus='.question-title';}
    }
    render(focus);
    if(['start','restart','retry','quiz-next'].includes(a)){host().querySelector(m.quiz?.result?'.learning-result':'.learning-question-card')?.scrollIntoView({block:'start',behavior:'instant'});}
    if(showOverview)host().querySelector('.cp-overview').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
  document.addEventListener('change',event=>{if(event.target.matches('[data-cp-teacher]')){m.teacher=event.target.checked;m.reveal=false;render('[data-cp-teacher]');}});
  document.addEventListener('keydown',event=>{const t=event.target.closest('.capitalism [role=tab]');if(!t||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();m.tab=event.key==='Home'?0:event.key==='End'?2:(Number(t.dataset.value)+(event.key==='ArrowRight'?1:2))%3;render(`#cp-tab-${m.tab}`);});
  window.GalpiCapitalism={open};
  document.addEventListener('DOMContentLoaded',()=>{if(location.hash==='#capitalism')open();});
})();
