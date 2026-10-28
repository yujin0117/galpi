/* 선택의 파장: 교과서 중심 기초 학습. 모든 응답은 현재 탭 메모리에만 유지. */
(() => {
  'use strict';
  const D = window.GalpiRippleData, E = window.GalpiRippleEngine;
  const U = () => window.GalpiLabUI;
  const root = () => document.querySelector('#content');
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const m = {tab:'roles', actor:0, right:0, effect:0, teacher:false, revealed:{}, responses:E.createState(), quiz:null, results:false, notice:''};
  const tabs = [['roles','주체별 역할'],['effects','외부 효과'],['practice','핵심 확인']];
  const actorKeywords = ['공정 경쟁·공공재','사회적 책임·혁신','노동·협력·권리','합리적·윤리적 소비'];
  function button(text, action, value='', {primary=false, disabled=false, extra=''}={}) {
    return `<button type="button" class="btn ${primary?'primary rb-next':''}" data-rb="${action}" data-value="${esc(value)}" ${disabled?'disabled':''} ${extra}>${text}</button>`;
  }
  const art = kind => window.GalpiLearningArt.scene(kind).replace('learning-scene-art hl-icon','learning-scene-art');
  function lightArt() {
    return '<svg viewBox="0 0 160 110" aria-hidden="true"><g fill="none" stroke="var(--diagram-ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M25 94V51L55 28l30 23v43" fill="var(--diagram-soft)"/><path d="M42 94V67h22v27M93 94V24h30v12"/><path d="M113 36h20l-4 12h-12Z" fill="var(--diagram-gold)"/><path d="m113 60-6 7m16-5v10m10-12 6 7" stroke="var(--diagram-gold)"/><path d="M18 95h128"/></g></svg>';
  }
  function outcomeArt(positive) {
    return `<svg viewBox="0 0 160 110" aria-hidden="true"><g fill="none" stroke="var(--diagram-ink)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${positive?'<circle cx="80" cy="55" r="33" fill="var(--diagram-soft)"/><path d="m63 55 12 12 24-26"/>':'<path d="m80 20 39 69H41Z" fill="var(--learning-danger-soft)"/><path d="M80 43v22m0 11v1"/>'}</g></svg>`;
  }
  function source(text) { return `<p class="rb-source">${esc(text)} · 핵심 내용을 학습용으로 재구성했어요.</p>`; }
  function rightArt(kind) {
    const people='<circle cx="56" cy="36" r="9" fill="#f0d7af"/><path d="M39 76V62q0-14 17-14t17 14v14" fill="#8db5c4"/><circle cx="104" cy="36" r="9" fill="#f0d7af"/><path d="M87 76V62q0-14 17-14t17 14v14" fill="#82ab9b"/>';
    const scene=kind==='organize'?'<circle cx="80" cy="22" r="9" fill="#f0d7af"/><path d="M65 57V47q0-13 15-13t15 13v10" fill="#d9b66d"/>'+people+'<path d="m68 65 12 7 12-7"/><path d="M30 87q50 15 100 0" stroke-dasharray="3 6"/>':kind==='bargain'?people+'<path d="M29 76h102v9H29z" fill="#e9c887"/><path d="M41 85v12m78-12v12"/><path d="M68 62h24v13H68z" fill="#fff"/><path d="M58 9h44v20H86l-6 6v-6H58z" fill="#fff"/><path d="M68 18h24"/>':people+'<path d="M70 35V16h42v27H87l-8 7v-7h-9z" fill="#e9c887"/><path d="M91 24v10m-5-5h10"/><path d="M80 44v42M37 84h23m41 0h23"/>';
    return `<svg viewBox="0 0 160 110" aria-hidden="true"><g fill="none" stroke="#355e51" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${scene}</g></svg>`;
  }
  function roleItem(item,index) {
    const points=item.points?`<dl class="rb-key-points">${item.points.map(p=>`<div><dt>${esc(p.label)}</dt><dd>${esc(p.text)}</dd></div>`).join('')}</dl>`:'';
    const policies=item.policies?`<div class="rb-policy-pair">${item.policies.map(p=>`<div class="rb-policy-link rb-policy-${p.kind}"><span>${esc(p.label)}</span><span class="rb-policy-direction">${esc(p.action)} <span aria-hidden="true">→</span></span><strong>${esc(p.text)}</strong></div>`).join('')}</div>`:'';
    return `<article><header class="rb-role-item-title"><span aria-hidden="true">${String(index+1).padStart(2,'0')}</span><h3>${esc(item.title)}</h3></header><p class="rb-role-brief">${esc(item.text)}</p>${points}${policies}</article>`;
  }
  function workerRights() {
    const current=D.rights[m.right];
    return `<section class="rb-rights-studio" aria-labelledby="rb-rights-title"><header class="rb-rights-heading"><p class="rb-kicker">노동자의 권리 · 교과서 81쪽</p><h3 id="rb-rights-title">모이고, 의논하고, 행동할 권리</h3><p>그림을 눌러 노동 3권을 살펴보세요.</p></header><div class="rb-rights" role="group" aria-label="노동 3권 선택">${D.rights.map((r,i)=>button(`${rightArt(r.id)}<span class="rb-right-label"><span class="rb-right-short">${esc(r.short)}</span><strong>${esc(r.name)}</strong></span><span class="rb-right-mark" aria-hidden="true">${i===m.right?'✓':'+'}</span>`,'right',i,{extra:`aria-pressed="${i===m.right}" aria-controls="rb-right-note"`})).join('')}</div><div class="rb-right-detail" id="rb-right-note" role="region" aria-label="${esc(current.name)} 쉬운 설명"><div class="rb-right-scene">${rightArt(current.id)}<p>${esc(current.speech)}</p></div><div class="rb-right-explanation"><h4>${esc(current.name)}<span>${esc(current.short)}</span></h4><p>${esc(current.text)}</p><p class="rb-right-example"><strong>이런 모습이에요</strong>${esc(current.example)}</p><dl class="rb-word-help"><dt>${esc(current.term)}</dt><dd>${esc(current.meaning)}</dd></dl>${current.note?`<p class="rb-right-caution">${esc(current.note)}</p>`:''}</div></div></section>`;
  }
  function roles() {
    const a=D.actors[m.actor];
    const items=a.items.filter(item=>!(a.id==='company'&&item.title==='ESG 경영'));
    const rights=a.id==='worker'?workerRights():'';
    const esg=a.id==='company'?'<div class="rb-esg" aria-label="ESG 경영의 세 요소"><span><strong>E</strong> 친환경</span><span><strong>S</strong> 사회적 책임</span><span><strong>G</strong> 건전한 지배 구조</span></div><p>ESG 경영: 세 요소를 고려한 지속가능한 기업 운영</p>':'';
    const example=`<figure class="rb-example">${art(a.example.art)}<figcaption><h3>${esc(a.example.title)}</h3><p>${esc(a.example.text)}</p></figcaption></figure>`;
    return `<p class="rb-intro">주체를 선택하고 핵심 역할을 살펴보세요.</p><div class="rb-role-layout"><nav class="rb-actors" aria-label="경제 주체 선택">${D.actors.map((x,i)=>`<button type="button" class="rb-actor" data-rb="actor" data-value="${i}" aria-pressed="${i===m.actor}"><span class="rb-actor-art">${art(x.art)}</span><strong>${esc(x.name)}</strong><span>${actorKeywords[i]}</span></button>`).join('')}</nav><section class="rb-role-panel" aria-labelledby="rb-role-title"><header class="rb-role-heading">${art(a.art)}<div><small>${esc(a.pages)}</small><h2 id="rb-role-title" tabindex="-1">${esc(a.name)}의 역할</h2><p>${esc(a.summary)}</p></div></header><div class="rb-role-items rb-role-items--${a.id}">${items.map(roleItem).join('')}</div>${esg}${a.id==='worker'?rights+example:example}<div class="rb-role-footer">${button('← 이전 주체','actor',m.actor-1,{disabled:m.actor===0})}${m.actor<3?button('다음 주체 →','actor',m.actor+1,{primary:true}):button('외부 효과 알아보기 →','tab','effects',{primary:true})}</div></section></div>`;
  }
  function revealed(id) { return !!m.responses.checked[id]&&(!m.teacher||!!m.revealed[id]); }
  function checked(id) { return !!m.responses.checked[id]; }
  function selected(id) { return own(m.responses.answers,id)?m.responses.answers[id]:null; }
  function choices(item, options) {
    return options.map((text,i)=>U().choice({text:esc(text),index:i,selected:selected(item.id)===i,checked:revealed(item.id),correct:i===item.correct,attributes:`data-rb="answer" data-id="${item.id}" data-value="${i}" ${checked(item.id)&&!revealed(item.id)?'disabled':''}`})).join('');
  }
  function confirm(item) {
    if(revealed(item.id)) return '';
    return button(m.teacher?'정답·해설 공개':'선택 확인하기','check',item.id,{primary:true,disabled:selected(item.id)===null});
  }
  function feedback(item,options) {
    if(!revealed(item.id))return '';
    const correct=selected(item.id)===item.correct;
    return `<section class="rb-feedback ${correct?'is-correct':'is-incorrect'}" aria-label="정답과 해설" tabindex="-1"><div class="rb-feedback-title" role="status"><span aria-hidden="true">${correct?'✓':'!'}</span><strong>${correct?'정답이에요!':'정답과 이유를 확인해요'}</strong></div>${!correct?`<p>나의 선택: <strong>${esc(options[selected(item.id)])}</strong></p>`:''}<p>정답: <strong>${esc(options[item.correct])}</strong></p><p>${esc(item.explain)}</p>${button('다시 풀기','retry',item.id)}</section>`;
  }
  function effects() {
    const item=D.effects[m.effect],positive=item.id==='positive',options=['긍정적 외부 효과','부정적 외부 효과'];
    return `<p class="rb-intro">외부 효과는 다른 사람에게 의도하지 않은 이익이나 손해를 주면서, 그 영향에 대한 대가를 받거나 지불하지 않는 경우예요.</p><nav class="rb-effect-tabs" aria-label="외부 효과 사례">${D.effects.map((x,i)=>button(`${i+1}. ${i===0?'골목의 옥외등':'공장의 소음·오염'}`,'effect',i,{extra:`aria-pressed="${m.effect===i}"`})).join('')}</nav><div class="rb-effect-layout"><section class="rb-effect-story" aria-labelledby="rb-effect-title"><p class="rb-kicker">교과서 76쪽 · 사례 ${m.effect+1} / 2</p><h2 id="rb-effect-title" tabindex="-1">${esc(item.title)}</h2><p>${esc(item.story)}</p><ol class="rb-relation" aria-label="행동과 다른 사람에게 미친 영향"><li>${positive?lightArt():art('factory')}<strong>${esc(item.actor)}</strong><span>경제활동</span></li><li>${art('people')}<strong>${esc(item.affected)}</strong><span>직접 거래에 참여하지 않은 사람</span></li><li>${outcomeArt(positive)}<strong>${positive?'이익':'피해'}</strong><span>${esc(item.impact)}</span></li></ol><p class="rb-condition"><strong>대가·보상은?</strong><br>${esc(item.exchange)}</p></section><aside class="rb-effect-question" aria-labelledby="rb-effect-question"><h3 id="rb-effect-question">어떤 외부 효과일까요?</h3><div class="learning-choices" role="group" aria-label="외부 효과 유형 선택">${choices(item,options)}</div><div class="rb-actions">${confirm(item)}</div>${feedback(item,options)}${revealed(item.id)?`<section class="rb-policy"><h3>정부는 어떻게 대응할까요?</h3><p>${esc(item.quantity)}</p><strong>${esc(item.policy.title)}</strong><p>${esc(item.policy.text)}</p></section>`:''}</aside></div><div class="rb-actions">${button('← 이전 사례','effect',0,{disabled:m.effect===0})}${m.effect===0?button('다음 사례 →','effect',1,{primary:true}):button('핵심 확인으로 →','tab','practice',{primary:true})}</div>${source(item.pages)}`;
  }
  function startQuiz(review=false) {
    const ids=review?E.result(m.responses).wrongIds:D.questions.map(q=>q.id);
    if(!ids.length)return;
    if(review) ids.forEach(id=>{E.retry(m.responses,id);delete m.revealed[id];});
    m.quiz={ids:[...ids],pos:0,review};m.results=false;m.notice='';
  }
  function results() {
    const r=E.result(m.responses),wrong=new Set(r.wrongIds),weak=[...new Set(D.questions.filter(q=>wrong.has(q.id)).map(q=>q.topic))];
    const good=[...new Set(D.questions.filter(q=>!wrong.has(q.id)).map(q=>q.topic))].filter(t=>!weak.includes(t));
    return `<div class="rb-practice">${U().result({title:'선택의 파장 · 핵심 확인',score:r.score,total:r.total,good:esc(good.join(' · ')||'복습하면서 다시 확인해 보세요.'),weak:esc(weak.join(' · ')||'처음 확인에서 모든 문제를 맞혔어요.'),caption:'각 문항을 처음 확인했을 때의 답 기준',actions:button(`처음 틀린 문제 다시 풀기 (${r.wrongIds.length})`,'review','',{disabled:!r.wrongIds.length})+button('처음부터 다시 풀기','restart','',{primary:true})})}<p class="rb-result-summary">${r.wrongIds.length?`처음 틀린 ${r.wrongIds.length}문제 중 현재 다시 맞힌 문제는 ${r.resolvedWrongIds.length}개예요. 최초 정답 수는 재도전해도 바뀌지 않아요.`:'확인한 개념을 일상 속 사례에서도 찾아보세요.'}</p><div class="rb-result-actions">${button('주체별 역할 다시 보기','tab','roles')}${button('외부 효과 다시 보기','tab','effects')}</div></div>`;
  }
  function practice() {
    if(m.results&&E.result(m.responses).complete)return results();
    if(!m.quiz)return `<section class="learning-start-card"><div><p class="learning-overline">교과서 핵심 확인</p><h2 tabindex="-1" id="rb-practice-title">배운 내용을 문제로 풀어볼까요?</h2>${button('10문제 시작하기 →','start','',{primary:true})}</div></section>`;
    const z=m.quiz,q=D.questions.find(x=>x.id===z.ids[z.pos]);
    const currentChecked=checked(q.id),show=revealed(q.id);
    const material=q.material?`<p>${esc(q.material)}</p>`:'';
    const evidence=q.art?`<figure class="rb-question-art">${art(q.art)}<figcaption>${material||`<p>${esc(q.pages)}</p>`}</figcaption></figure>${material?`<p class="rb-kicker">${esc(q.pages)}</p>`:''}`:`${material}<p class="rb-kicker">${esc(q.pages)}</p>`;
    const finish=z.pos===z.ids.length-1;
    return `<div class="rb-practice"><nav class="rb-question-index" aria-label="${z.review?'오답 복습':'확인 문제'} 번호">${z.ids.map((id,i)=>{const item=D.questions.find(x=>x.id===id),visible=revealed(id),status=visible?(selected(id)===item.correct?'correct':'wrong'):'unanswered';return button(String(D.questions.indexOf(item)+1).padStart(2,'0'),'question',i,{extra:`aria-label="${D.questions.indexOf(item)+1}번 문제${visible?status==='correct'?' · 정답 확인':' · 오답 확인':''}" ${z.pos===i?'aria-current="step"':''} data-status="${status}"`});}).join('')}</nav>${m.notice?`<p role="status" class="rb-notice">${esc(m.notice)}</p>`:''}${U().question({number:z.pos+1,total:z.ids.length,topic:esc(q.topic),retry:z.review,prompt:`<h2 class="question-title" id="rb-practice-title" tabindex="-1">${esc(q.prompt)}</h2>`,evidence,choices:choices(q,q.options),action:confirm(q),feedback:show?feedback(q,q.options):'<div class="learning-waiting-feedback"><h3>답을 고른 뒤 확인해요</h3><p>정답과 짧은 이유가 여기에 표시돼요.</p></div>'})}<div class="rb-actions">${button('← 이전 문제','question',z.pos-1,{disabled:z.pos===0})}${button(finish?'학습 결과 보기 →':'다음 문제 →','next','',{primary:true,disabled:!currentChecked||!show})}</div></div>`;
  }
  function render() {
    const r=E.result(m.responses);
    root().innerHTML=`<section class="ripple ripple-basic learning-v2 ${m.teacher?'rb-teacher':''}"><div class="learning-toolbar"><button type="button" class="page-return" data-action="goHome">← 전체 콘텐츠</button>${window.GalpiCurriculum.teacher('ripple','data-rb-teacher',m.teacher)}</div><header class="learning-header"><div>${window.GalpiCurriculum.header('ripple')}<h1>선택의 파장</h1><p>시장 참여자의 역할과 외부 효과를 알아봐요.</p></div></header>${m.teacher?'<p class="teacher-strip">교사 시연 · 문제와 그림을 먼저 살펴보고, 정답·해설 공개를 눌러 확인하세요.</p>':''}${U().stepNav(tabs,tabs.findIndex(x=>x[0]===m.tab),{idPrefix:'rb-tab',panel:'rb-panel',attribute:key=>`data-rb="tab" data-value="${key}"`,label:'선택의 파장 학습 메뉴',completed:r.complete?[2]:[]})}<div id="rb-panel" role="tabpanel" aria-labelledby="rb-tab-${m.tab}" tabindex="-1">${m.tab==='roles'?roles():m.tab==='effects'?effects():window.GalpiExamPractice.wrap('ripple',practice(),m.teacher)}</div><p class="rb-source">미래엔 『통합사회2』 78~82쪽 · 연결 개념 76쪽 / 지도서 128~129·140~141쪽을 바탕으로 재구성했어요.<br>응답은 현재 탭에만 남고 새로고침하면 초기화돼요. 이름·학번은 입력하지 않아요.</p></section>`;
    U().mount(root());
  }
  function focus(target,scroll='nearest') {
    const el=root().querySelector(target);if(!el)return;
    if(!el.matches('button,input,select,textarea,a[href],[tabindex]'))el.tabIndex=-1;
    el.focus({preventScroll:true});el.scrollIntoView({block:scroll,behavior:'instant'});
  }
  function announce(text) { const el=document.querySelector('#statusAnnouncer');if(el)el.textContent=text; }
  function open() {
    document.body.classList.remove('teacher-mode');setNav('social');
    if(location.hash!=='#ripple')location.hash='ripple';
    render();root().focus({preventScroll:true});U().startScreen();
  }
  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-rb]');if(!b||b.disabled||!root().contains(b))return;
    const {rb:action,value,id}=b.dataset,position=window.scrollY;let target='',scroll='nearest',message='';
    if(action==='tab'&&tabs.some(x=>x[0]===value)){m.tab=value;m.notice='';target='#rb-panel';scroll='start';}
    else if(action==='actor'&&Number.isInteger(+value)&&D.actors[+value]){m.actor=+value;target='#rb-role-title';scroll='start';}
    else if(action==='right'&&D.rights[+value]){m.right=+value;message=D.rights[m.right].name+' 설명이 표시되었어요.';}
    else if(action==='effect'&&D.effects[+value]){m.effect=+value;target='#rb-effect-title';scroll='start';}
    else if(action==='answer'){if(!E.select(m.responses,id,+value))return;message='답을 선택했어요. 확인 버튼을 눌러 주세요.';}
    else if(action==='check'){
      if(selected(value)===null)return;E.check(m.responses,value);m.revealed[value]=true;target='.rb-feedback';message='정답과 해설이 표시되었어요.';
    }
    else if(action==='retry'){E.retry(m.responses,value);delete m.revealed[value];target=m.tab==='effects'?'#rb-effect-question':'#rb-practice-title';message='같은 문제를 다시 풀어 보세요.';}
    else if(action==='start'){startQuiz();target='#rb-practice-title';scroll='start';}
    else if(action==='review'){startQuiz(true);target='#rb-practice-title';scroll='start';}
    else if(action==='restart'){E.restart(m.responses);m.revealed={};startQuiz();target='#rb-practice-title';scroll='start';}
    else if(action==='question'&&m.quiz&&m.quiz.ids[+value]){m.quiz.pos=+value;m.notice='';target='#rb-practice-title';scroll='start';}
    else if(action==='next'&&m.quiz){
      const z=m.quiz,id=z.ids[z.pos];if(!revealed(id))return;
      if(z.pos<z.ids.length-1){z.pos++;m.notice='';target='#rb-practice-title';scroll='start';}
      else if(E.result(m.responses).complete){m.results=true;target='.learning-result';scroll='start';}
      else{const missing=z.ids.findIndex(key=>!own(m.responses.first,key));if(missing<0)return;z.pos=missing;m.notice='아직 확인하지 않은 문제를 풀고 결과를 확인해요.';target='#rb-practice-title';scroll='start';}
    }else return;
    render();
    if(action==='tab'){U().startScreen();focus('#rb-panel','nearest');}
    else if(target){if(target==='.learning-result'){root().querySelector(target)?.setAttribute('tabindex','-1');}focus(target,scroll);}
    else {const same=[...root().querySelectorAll('[data-rb]')].find(x=>x.dataset.rb===action&&x.dataset.value===value&&x.dataset.id===id);same?.focus({preventScroll:true});window.scrollTo({top:position,behavior:'instant'});}
    if(message)announce(message);
  });
  document.addEventListener('change',event=>{if(!event.target.matches('[data-rb-teacher]'))return;m.teacher=event.target.checked;m.revealed={};render();focus('[data-rb-teacher]');announce(m.teacher?'교사 시연 모드가 켜졌어요. 정답과 해설은 공개 버튼으로 확인해요.':'교사 시연 모드가 꺼졌어요.');});
  document.addEventListener('keydown',event=>{
    if(!event.target.matches('[data-rb="tab"][role=tab]'))return;
    const i=tabs.findIndex(x=>x[0]===m.tab),index=event.key==='ArrowRight'?(i+1)%3:event.key==='ArrowLeft'?(i+2)%3:event.key==='Home'?0:event.key==='End'?2:null;
    if(index===null)return;event.preventDefault();m.tab=tabs[index][0];render();focus(`#rb-tab-${m.tab}`);
  });
  function openGovernment() {m.tab='roles';m.actor=0;history.replaceState(null,'',location.pathname+location.search+'#ripple');open();}
  window.GalpiRipple=Object.freeze({open,openGovernment,snapshot:()=>JSON.parse(JSON.stringify(m))});
  document.addEventListener('DOMContentLoaded',()=>{if(location.hash==='#ripple')open();});
})();
