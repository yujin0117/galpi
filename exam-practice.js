/* Shared past-paper practice, isolated from each laboratory's calculations. */
(()=>{'use strict';
const E=window.GalpiExamEngine,D=window.GalpiExamData,states={};
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let materialDialog,materialOpener,materialZoom=1,materialFit=0;
function drawMaterial(fit=false){
 if(!materialDialog?.open)return;
 const img=materialDialog.querySelector('img'),area=materialDialog.querySelector('.ep-viewer-scroll');
 if(!img.naturalWidth)return;
 if(fit||!materialFit)materialFit=Math.min(img.naturalWidth,Math.max(160,area.clientWidth-24));
 img.style.width=Math.round(materialFit*materialZoom)+'px';
 materialDialog.querySelector('output').textContent=Math.round(materialZoom*100)+'%';
 materialDialog.querySelector('[data-material-action="less"]').disabled=materialZoom<=1;
 materialDialog.querySelector('[data-material-action="more"]').disabled=materialZoom>=3;
}
function openMaterial(button){
 const src=button.dataset.src;
 if(!/^assets\/exams\/materials\/[a-zA-Z0-9-]+\.png$/.test(src))return;
 if(!materialDialog){
  materialDialog=document.createElement('dialog');materialDialog.className='ep-material-viewer';
  materialDialog.setAttribute('aria-labelledby','ep-material-title');
  materialDialog.innerHTML='<header><h2 id="ep-material-title"></h2><button type="button" data-material-action="close" autofocus>닫기 ×</button></header><div class="ep-viewer-tools" role="group" aria-label="자료 확대 조절"><button type="button" data-material-action="less" aria-label="자료 축소">−</button><output aria-live="polite" aria-label="확대 비율">100%</output><button type="button" data-material-action="more" aria-label="자료 확대">＋</button><button type="button" data-material-action="fit">화면에 맞춤</button></div><div class="ep-viewer-scroll" role="region" aria-label="원본 자료 이미지. 확대한 뒤 가로와 세로로 이동할 수 있어요." tabindex="0"><img alt=""></div><p>출제 원문 자료예요. 확대하면 이미지 영역 안에서 좌우로 이동할 수 있어요.</p>';
  document.body.append(materialDialog);
  materialDialog.addEventListener('click',e=>{
   const action=e.target.closest('[data-material-action]')?.dataset.materialAction;
   if(action==='close')materialDialog.close();
   else if(action==='more'||action==='less'){materialZoom=Math.min(3,Math.max(1,materialZoom+(action==='more'?.5:-.5)));drawMaterial();}
   else if(action==='fit'){materialZoom=1;drawMaterial(true);}
  });
  materialDialog.addEventListener('close',()=>{if(materialOpener?.isConnected)materialOpener.focus({preventScroll:true});});
  materialDialog.querySelector('img').addEventListener('load',()=>drawMaterial(true));
  window.addEventListener('resize',()=>drawMaterial(true));
 }
 materialOpener=button;materialZoom=1;materialFit=0;
 materialDialog.querySelector('h2').textContent=button.dataset.title;
 const img=materialDialog.querySelector('img');img.alt=button.dataset.alt;img.style.width='';img.src=src;
 materialDialog.showModal();drawMaterial(true);
}
const levels=['','개념 확인','개념 적용','자료·종합 판단'];
function state(module){return states[module]||(states[module]={active:module==='finance',base:'',teacher:false,revealed:{},filters:{year:'',grade:'',level:''},count:5,quiz:E.create(),notice:''});}
function source(q){return `${q.year}년 ${q.month}월 · 고${q.grade} 전국연합학력평가 · ${q.number}번`;}
const btn=(label,action,extra='')=>{const primary=extra.includes('class="btn primary"');return `<button type="button" class="btn${primary?' primary':''}" data-ep="${action}" ${extra.replace('class="btn primary"','')}>${label}</button>`;};
function filtered(module){return E.pool(D.questions,module,state(module).filters);}
function visible(s,id){return !!s.quiz.checked[id]&&(!s.teacher||s.revealed[id]);}
function intro(module){const s=state(module),all=E.pool(D.questions,module),items=filtered(module),years=[...new Set(all.map(q=>q.year))].sort(),grades=[...new Set(all.map(q=>q.grade))].sort();
const select=(key,label,options)=>`<label>${label}<select data-ep-filter="${key}"><option value="">전체</option>${options.map(([value,text])=>`<option value="${value}" ${s.filters[key]==value?'selected':''}>${text}</option>`).join('')}</select></label>`;
return `<header class="ep-heading"><p class="ep-kicker">실제 출제 자료로 연습</p><h2 tabindex="-1">배운 개념을 기출문제에 적용해 볼까요?</h2><p>현재 단원과 연결되는 ${all.length}문항을 담았어요. 문제마다 연도·학년·월·번호를 확인할 수 있어요.</p></header><div class="ep-filters">${select('year','연도',years.map(x=>[x,x+'년']))}${select('grade','학년',grades.map(x=>[x,'고'+x]))}${select('level','문제 유형',[1,2,3].map(x=>[x,levels[x]]))}<label>문항 수<select data-ep-count>${[5,10,99].map(n=>`<option value="${n}" ${s.count===n?'selected':''}>${n===99?'전체':n+'문항까지'}</option>`).join('')}</select></label></div><div class="ep-start"><p role="status">현재 조건에 맞는 문제 <strong>${items.length}개</strong> · 이번에는 ${Math.min(s.count,items.length)}문항</p>${btn(s.quiz.ids.length?'새 세트 시작하기 →':'기출문제 시작하기 →','start',`class="btn primary" ${!items.length?'disabled':''}`)}${s.quiz.ids.length?btn('풀던 문제 이어하기','resume'):''}</div><details class="ep-source-list"><summary>출처별 문항 찾아보기 (${items.length})</summary><ul>${items.map(q=>`<li>${btn(esc(source(q))+'<span>'+esc(q.topic)+'</span>','single',`data-id="${q.id}"`)}</li>`).join('')}</ul></details><p class="ep-note">문제 유형은 갈피의 분류이며 실제 정답률이 아니에요. 원문 수치·정답·보기 순서는 유지하고, 지문과 자료의 표시를 웹 화면에 맞게 재구성했어요.</p>`;
}
function feedback(q,s){if(!visible(s,q.id))return '';const correct=s.quiz.answers[q.id]===q.correct;return `<section class="ep-feedback ${correct?'is-correct':'is-wrong'}" aria-label="기출 정답과 해설" tabindex="-1"><h3><span aria-hidden="true">${correct?'✓':'!'}</span> ${correct?'정답이에요!':'정답과 근거를 확인해요'}</h3><p class="ep-answer">정답 <strong>${q.correct+1}번</strong>${!correct?` · 나의 선택 ${s.quiz.answers[q.id]+1}번`:''}</p><p>${esc(q.summary)}</p><p class="ep-answer">핵심 개념 · ${esc(q.topic)}</p>${!correct?`<div class="ep-picked"><strong>내가 고른 ${s.quiz.answers[q.id]+1}번은 왜 아닐까요?</strong><p>${esc(q.reasons[s.quiz.answers[q.id]])}</p></div>`:''}<details class="ep-explanation"><summary>풀이 과정을 차근차근 보기</summary><ol>${q.steps.map(x=>`<li><h4>${esc(x.title)}</h4><p>${esc(x.text)}</p>${x.formula?`<p class="ep-formula">${esc(x.formula)}</p>`:''}</li>`).join('')}</ol></details><details class="ep-explanation"><summary>다섯 선택지의 근거 확인</summary><ol class="ep-option-reasons">${q.reasons.map((x,i)=>`<li><strong>${i+1}번 · ${i===q.correct?'정답 선택지':'다른 선택지'}</strong><p>${esc(x)}</p></li>`).join('')}</ol></details>${btn('같은 문제 다시 풀기','retry')}</section>`;}
function choices(q,selected,show,checked){
 const columns=q.choiceColumns,rows=columns&&q.options.map(x=>x.split(' / '));
 const aligned=columns?.length&&rows.every(row=>row.length===columns.length);
 const combination=!aligned&&q.options.every(x=>/^[ㄱㄴㄷㄹ㉠㉡㉢㉣,\s]+$/.test(x));
 const heading=aligned?`<div class="ep-choice-columns" aria-hidden="true"><span></span><span class="ep-choice-values">${columns.map(x=>`<span>${esc(x)}</span>`).join('')}</span></div>`:'';
 return `<div class="ep-choices ${aligned?'ep-column-choices':combination?'ep-combination-choices':''}" role="group" aria-label="기출 답 선택">${heading}${q.options.map((x,i)=>{
  const number=String.fromCharCode(0x2460+i),label=aligned?`aria-label="${number} ${esc(rows[i].map((cell,j)=>columns[j]+' '+cell).join(', '))}"`:'';
  const value=aligned?`<span class="ep-choice-values">${rows[i].map(cell=>`<span>${esc(cell)}</span>`).join('')}</span>`:`<span>${esc(x)}</span>`;
  return btn(`<span class="ep-choice-number">${number}</span>${value}${show&&i===q.correct?'<small>✓ 정답</small>':show&&i===selected&&i!==q.correct?'<small>! 나의 선택</small>':''}`,'answer',`data-index="${i}" ${label} aria-pressed="${selected===i}" ${checked?'disabled':''} data-status="${show&&i===q.correct?'correct':show&&i===selected?'wrong':''}"`);
 }).join('')}</div>`;
}
function question(module){const s=state(module),z=s.quiz,q=D.questions.find(x=>x.id===z.ids[z.pos]),show=visible(s,q.id),selected=z.answers[q.id];
return `<div class="ep-question-top"><span>기출문제 ${z.pos+1} / ${z.ids.length}${z.review?' · 오답 복습':''}</span>${btn('다른 조건으로 고르기','choose')}</div><nav class="ep-question-nav" aria-label="기출문제 번호">${z.ids.map((id,i)=>btn(String(i+1).padStart(2,'0')+(visible(s,id)?(z.answers[id]===D.questions.find(x=>x.id===id).correct?' ✓':' !'):''),'jump',`data-index="${i}" aria-current="${i===z.pos?'step':'false'}" aria-label="세트 ${i+1}번 문제"`)).join('')}</nav><article class="ep-question" data-question-id="${q.id}" data-points="${q.points}" aria-labelledby="ep-title-${module}"><header class="ep-source"><p>${esc(source(q))}</p><span class="ep-source-kind">${levels[q.level]}${q.linked?' · 연계 기출':''}</span><span class="ep-points">[${esc(q.points)}점]</span></header><h2 id="ep-title-${module}" class="${q.prompt.length>23&&q.prompt.length<=28?'ep-stem-medium':''}" tabindex="-1"><span class="ep-original-number">${q.number}.</span> <span class="ep-prompt">${esc(q.prompt)}</span></h2><div class="ep-evidence">${q.body}</div>${choices(q,selected,show,z.checked[q.id])}${!show?btn(s.teacher?'정답·해설 공개':'정답 확인','check',`class="btn primary" ${selected===undefined?'disabled':''}`):''}${feedback(q,s)}<details class="ep-original"><summary>출제 원문 확인</summary><p>${esc(source(q))} · 사용자 제공 문제지에서 해당 문항을 확인했어요.</p><a href="${q.image}" target="_blank" rel="noopener">원문을 크게 보기 ↗</a><img src="${q.image}" alt="${esc(source(q))} 출제 원문. 위 본문과 동일한 질문과 자료, 선택지를 담고 있어요." loading="lazy"></details></article><div class="ep-actions">${btn('← 이전 문제','previous',z.pos===0?'disabled':'')}${btn(z.pos===z.ids.length-1?'학습 결과 보기 →':'다음 문제 →','next',`class="btn primary" ${!show?'disabled':''}`)}</div>${s.notice?`<p class="ep-notice" role="status">${esc(s.notice)}</p>`:''}`;
}
function results(module){const s=state(module),r=E.result(s.quiz,D.questions),ids=Object.keys(s.quiz.first),names={capitalism:'자본주의의 갈피',cost:'기회비용 계산 실험실',ripple:'선택의 파장',finance:'돈의 갈피',trade:'무역의 갈피'},items=ids.map((id,i)=>{const q=D.questions.find(x=>x.id===id);return {label:i+1,correct:s.quiz.first[id]===q.correct,detail:source(q)};}),weak=[...new Set(ids.filter(id=>s.quiz.first[id]!==D.questions.find(q=>q.id===id).correct).map(id=>D.questions.find(q=>q.id===id).topic))];
return `<section class="ep-results">${window.GalpiLearningRecord.render({session:s.resultSession,title:names[module],subject:'통합사회2',kind:'기출문제',teacher:s.teacher,score:r.score,total:r.total,complete:!!s.originalIds?.length&&s.originalIds.every(id=>Object.hasOwn(s.quiz.first,id)),items,good:[...new Set(ids.filter(id=>s.quiz.first[id]===D.questions.find(q=>q.id===id).correct).map(id=>D.questions.find(q=>q.id===id).topic))].filter(t=>!weak.includes(t)).join(' · '),weak:weak.join(' · '),caption:'이번 세트 · 각 문항의 첫 답변 기준',actions:btn(`틀린 같은 문제 다시 풀기 (${r.wrong.length})`,'review',r.wrong.length?'':'disabled')+btn('다른 기출문제 고르기','choose','class="btn primary"')})}<p>재도전해도 최초 정답 수는 바뀌지 않아요.${r.wrong.length?` 처음 틀린 ${r.wrong.length}문항 중 지금 다시 맞힌 문제는 ${r.resolved.length}개예요.`:''}</p><details open><summary>이번에 푼 문항과 출처</summary><ul class="ep-result-sources">${Object.keys(s.quiz.first).map(id=>{const q=D.questions.find(x=>x.id===id),correct=s.quiz.first[id]===q.correct;return `<li><span>${correct?'✓ 정답':'! 다시 확인'}</span><p>${esc(source(q))}<small>${esc(q.topic)}</small></p>${btn('문항·해설','show',`data-id="${id}"`)}</li>`;}).join('')}</ul></details></section>`;}
function inner(module){const s=state(module),total=E.pool(D.questions,module).length;return `${s.base?`<div class="ep-mode-nav" role="group" aria-label="연습 종류"><button type="button" data-ep="mode-basic" aria-pressed="${!s.active}">기초 연습</button><button type="button" data-ep="mode-exam" aria-pressed="${s.active}">기출문제 <span>${total}</span></button></div>`:''}${!s.active?s.base:`<div class="ep-exam-content">${s.teacher?'<p class="ep-teacher">교사 시연 · 답을 선택한 뒤 정답·해설을 직접 공개해요.</p>':''}${s.quiz.result?results(module):s.choosing||!s.quiz.ids.length?intro(module):question(module)}<p class="ep-note">수치와 답은 출제 당시의 문항 조건을 따릅니다. 응답은 현재 페이지에만 남고 새로고침하면 초기화돼요.</p></div>`}`;}
function wrap(module,base='',teacher=false,defaultBasic=false){if(!E.pool(D.questions,module).length)return base;const s=state(module);if(defaultBasic&&!s.initialModeSet){s.active=false;s.initialModeSet=true;}s.base=base;if(s.teacher!==teacher){s.teacher=teacher;s.revealed={};}return `<section class="exam-practice" data-exam-module="${module}">${inner(module)}</section>`;}
function update(host,module,target=''){host.innerHTML=inner(module);if(target){const el=host.querySelector(target);if(el){if(!el.hasAttribute('tabindex'))el.tabIndex=-1;el.focus({preventScroll:true});el.scrollIntoView({block:target==='.ep-source'?'start':'nearest',behavior:'instant'});}}}
function begin(s,items){if(!E.start(s.quiz,items))return;s.resultSession={};s.originalIds=[...items];s.revealed={};s.choosing=false;s.notice='';}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ep]'),host=b?.closest('[data-exam-module]');if(!host||b.disabled)return;const module=host.dataset.examModule,s=state(module),z=s.quiz,a=b.dataset.ep,q=D.questions.find(x=>x.id===z.ids[z.pos]);let target='',position=window.scrollY;
if(a==='material-open'){openMaterial(b);return;}
else if(a==='mode-basic'){s.active=false;target='.ep-mode-nav';}
else if(a==='mode-exam'){s.active=true;target='.ep-mode-nav';}
else if(a==='start'){begin(s,E.draw(filtered(module),s.count,z.seen));target='.ep-source';}
else if(a==='single'){const item=filtered(module).find(x=>x.id===b.dataset.id);if(!item)return;begin(s,[item.id]);target='.ep-source';}
else if(a==='choose'){s.choosing=true;target='.ep-heading h2';}
else if(a==='resume'){s.choosing=false;target='.ep-source';}
else if(a==='answer'){if(!q||!E.select(z,q.id,+b.dataset.index,q.options.length))return;}
else if(a==='check'){if(!q||z.answers[q.id]===undefined)return;E.check(z,q.id);s.revealed[q.id]=true;target='.ep-feedback';}
else if(a==='retry'){E.retry(z,q.id);delete s.revealed[q.id];target='.ep-choices';}
else if(a==='previous'){z.pos=Math.max(0,z.pos-1);s.notice='';target='.ep-source';}
else if(a==='jump'){const i=+b.dataset.index;if(!z.ids[i])return;z.pos=i;z.result=false;s.notice='';target='.ep-source';}
else if(a==='next'){if(!q||!visible(s,q.id))return;if(z.pos<z.ids.length-1)z.pos++;else{const missing=z.ids.findIndex(id=>!z.checked[id]);if(missing>=0){z.pos=missing;s.notice='아직 확인하지 않은 문제를 먼저 풀어 보세요.';}else z.result=true;}target=z.result?'.ep-results h2':'.ep-source';}
else if(a==='review'){if(!E.review(z,D.questions))return;s.revealed={};target='.ep-source';}
else if(a==='show'){const id=b.dataset.id;if(!z.ids.includes(id))z.ids.push(id);z.pos=z.ids.indexOf(id);z.result=false;s.choosing=false;target='.ep-source';}
else return;update(host,module,target);if(!target){host.querySelector(`[data-ep="${a}"]${b.dataset.index!==undefined?`[data-index="${b.dataset.index}"]`:''}`)?.focus({preventScroll:true});window.scrollTo({top:position,behavior:'instant'});}const announce=document.querySelector('#statusAnnouncer');if(announce&&a==='check')announce.textContent='정답과 해설이 표시되었어요.';
});
document.addEventListener('change',e=>{const t=e.target,host=t.closest('[data-exam-module]');if(!host||(!t.matches('[data-ep-filter]')&&!t.matches('[data-ep-count]')))return;const s=state(host.dataset.examModule);if(t.matches('[data-ep-filter]'))s.filters[t.dataset.epFilter]=t.value;else s.count=+t.value;update(host,host.dataset.examModule);host.querySelector(t.matches('[data-ep-filter]')?`[data-ep-filter="${t.dataset.epFilter}"]`:'[data-ep-count]')?.focus({preventScroll:true});});
window.GalpiExamPractice=Object.freeze({wrap});
})();
