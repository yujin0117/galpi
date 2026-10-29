/* Learning records: presentation/export only. Grading stays in each content engine. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GalpiLearningRecord=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const stickers=Object.freeze([
 ['classic-a','클래식 A · 왕관과 월계수'],['classic-b','클래식 B · 리본과 책'],
 ['cat-a','고양이 A · 책 위의 고양이'],['cat-b','고양이 B · 포스트잇'],['cat-c','고양이 C · 트로피'],
 ['rabbit-a','토끼 A · 노트와 연필'],['rabbit-b','토끼 B · 하트'],['rabbit-c','토끼 C · 스티키 노트']
].map(([id,label])=>Object.freeze({id,label,src:'assets/achievement-stickers/'+id+'.png'})));
const sessions=new WeakMap(),records=new Map();let serial=0;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=x=>String(x??'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
function normalize(input){
 const items=Array.isArray(input.items)?input.items.map((x,i)=>Object.freeze({label:String(x.label??i+1),correct:x.correct===true,detail:plain(x.detail||'')})):[];
 const total=input.total,score=input.score;
 const valid=Number.isInteger(total)&&total>0&&Number.isInteger(score)&&score>=0&&score<=total&&items.length===total&&items.filter(x=>x.correct).length===score;
 const complete=valid&&input.complete===true;
 return Object.freeze({...input,title:plain(input.title),good:plain(input.good),weak:plain(input.weak),caption:plain(input.caption),items:Object.freeze(items),valid,complete,perfect:complete&&score===total&&!input.teacher&&!input.retry&&input.rewardEligible!==false});
}
function prepare(input,random=Math.random){
 const r=normalize(input),key=input.session;
 if(!key||typeof key!=='object')throw new Error('결과 기록에 학습 세트가 필요합니다.');
 let s=sessions.get(key);if(!s){s={id:'gr-'+(++serial),sticker:null,date:null};sessions.set(key,s);}
 if(r.complete&&!s.date)s.date=new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'});
 if(r.perfect&&!s.sticker)s.sticker=stickers[Math.max(0,Math.min(7,Math.floor(random()*8)))];
 const record=Object.freeze({...r,id:s.id,date:s.date||'',sticker:r.perfect?s.sticker:null});records.set(s.id,record);return record;
}
function render(input){
 const r=prepare(input),wrong=r.items.filter(x=>!x.correct),kind=r.teacher?'교사 시연':r.retry?'오답 복습':r.kind||'문제 연습';
 return `<section class="learning-result gr-result" data-gr-record="${r.id}" data-sticker="${r.sticker?.id||''}" aria-label="학습 결과"><header class="gr-heading"><p>나의 학습 기록 <span>${esc(kind)}</span></p><h2 tabindex="-1">${esc(r.title)}</h2></header><div class="gr-hero"><div><p class="gr-eyebrow">${r.complete?'이번에 맞힌 문항':'현재까지 맞힌 문항'}</p><p class="gr-fraction"><strong>${r.score}</strong><span>/ ${r.total}</span></p><h3>${r.complete?r.score===r.total?`${r.total}문항을 모두 맞혔어요.`:'차근차근, 배움을 쌓고 있어요.':'문제를 마치고 기록을 남겨요.'}</h3><p class="gr-caption">${esc(r.caption||'이번 세트의 풀이 기준')}</p></div>${r.sticker?`<img class="gr-sticker" src="${r.sticker.src}" alt="모두 맞힌 기념 스티커 · ${r.sticker.label}" width="180" height="180">`:''}</div><div class="gr-section-head"><h3>문항별 기록</h3><p><span>✓ 맞힌 문항</span> <span>↻ 다시 볼 문항</span></p></div><ol class="gr-questions">${r.items.map(x=>`<li class="${x.correct?'is-correct':'is-revisit'}" title="${esc(x.detail)}"><span>${esc(x.label.padStart(2,'0'))}</span><b aria-label="${x.correct?'정답':'다시 확인'}">${x.correct?'✓':'↻'}</b></li>`).join('')}</ol><div class="gr-reflection"><section><h3>잘 이해한 개념</h3><p>${esc(r.good||'다시 풀며 개념을 확인해 보세요.')}</p></section><section><h3>${wrong.length?'다시 확인할 문항 · '+wrong.map(x=>x.label).join(', ')+'번':'오늘의 갈피'}</h3><p>${esc(r.weak||(wrong.length?'풀이를 확인하고 한 번 더 도전해 보세요.':'배운 개념을 다음 문제에도 연결해 보세요.'))}</p></section></div><div class="gr-save"><button type="button" class="btn primary" data-gr-save="${r.id}" ${!r.complete?'disabled':''}>학습 기록 PNG 저장 ↓</button><p data-gr-status role="status">${r.complete?'이름·학번 없이 지금의 기록을 이미지로 저장해요.':'모든 문항을 확인한 뒤 PNG로 저장할 수 있어요.'}</p></div><div class="learning-result-actions gr-actions">${input.actions||''}</div></section>`;
}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('이미지를 불러오지 못했어요. 연결을 확인하고 다시 저장해 주세요.'));img.src=src;});}
async function canvasFor(r){
 if(!r?.complete)throw new Error('모든 문항을 마친 뒤 저장할 수 있어요.');
 await document.fonts.ready;
 const [logo,sticker]=await Promise.all([loadImage('assets/brand/logo-approved.png'),r.sticker?loadImage(r.sticker.src):Promise.resolve(null)]);
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=Math.max(1350,1070+Math.ceil(r.total/5)*92);
 const c=canvas.getContext('2d'),W=1080,H=canvas.height,P=76,ink='#1F2933',green='#00462A',muted='#64748B';
 const font=(size,weight=400)=>{c.font=`${weight} ${size}px Pretendard, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`;};
 const text=(s,x,y,size=24,weight=400,color=ink)=>{font(size,weight);c.fillStyle=color;c.fillText(s,x,y);};
 const line=(y)=>{c.strokeStyle='#D6DFDA';c.lineWidth=1.5;c.beginPath();c.moveTo(P,y);c.lineTo(W-P,y);c.stroke();};
 const rounded=(x,y,w,h,fill,stroke,radius=12)=>{c.beginPath();c.roundRect(x,y,w,h,radius);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}};
 const wrap=(s,x,y,maxWidth,size=24,weight=400,color=ink,lineHeight=size*1.5)=>{font(size,weight);let row='',yy=y;const flush=()=>{text(row.trimEnd(),x,yy,size,weight,color);row='';yy+=lineHeight;};for(const paragraph of String(s).split('\n')){for(const token of paragraph.match(/\S+\s*/g)||[]){if(row&&c.measureText(row+token.trimEnd()).width>maxWidth)flush();if(c.measureText(token.trimEnd()).width>maxWidth){for(const ch of token){if(row&&c.measureText(row+ch).width>maxWidth)flush();row+=ch;}}else row+=token;}flush();}return yy;};
 c.fillStyle='#FFFFFF';c.fillRect(0,0,W,H);c.fillStyle=green;c.fillRect(P,0,44,12);
 c.drawImage(logo,P,48,164,164*logo.height/logo.width);text('나의 학습 기록',W-P-225,88,29,650,green);text('한 갈피씩, 쌓이는 배움',W-P-225,122,21,400,muted);line(177);
 text(r.subject||'통합사회2',P,224,22,500,muted);
 let y=wrap(r.title,P,275,W-P*2,38,750,green,49);text((r.teacher?'교사 시연':r.retry?'오답 복습':r.kind||'문제 연습')+' · '+r.total+'문항',P,y+8,22,500,muted);y+=72;
 text('이번에 맞힌 문항',P,y,23,500,muted);text(String(r.score),P,y+122,128,700,green);font(128,700);const fw=c.measureText(String(r.score)).width;text('/ '+r.total,P+fw+18,y+115,51,400,muted);
 if(sticker){const fit=Math.min(245/sticker.width,245/sticker.height);c.drawImage(sticker,W-P-255,y-12,sticker.width*fit,sticker.height*fit);}
 y+=179;text(r.score===r.total?`${r.total}문항을 모두 맞혔어요.`:'차근차근, 배움을 쌓고 있어요.',P,y,30,650,green);y=wrap(r.caption||'이번 세트의 풀이 기준',P,y+42,W-P*2,21,400,muted,30)+32;line(y);y+=54;
 text(r.kind==='기출문제'?'세트 문항별 기록':'문항별 기록',P,y,28,650,green);text('✓ 맞힌 문항    ↻ 다시 볼 문항',W-P-340,y,21,400,muted);y+=26;
 const gap=14,cw=(W-P*2-gap*4)/5;
 r.items.forEach((q,i)=>{const xx=P+(i%5)*(cw+gap),yy=y+Math.floor(i/5)*92;rounded(xx,yy,cw,76,q.correct?'#EAF3EE':'#FFFCF5',q.correct?null:'#D9BE88');text(q.label.padStart(2,'0'),xx+20,yy+48,27,650,q.correct?green:'#815F2D');text(q.correct?'✓':'↻',xx+cw-43,yy+48,28,500,q.correct?green:'#815F2D');});
 y+=Math.ceil(r.total/5)*92+31;
 text('잘 이해한 개념',P,y,21,600,muted);y=wrap(r.good||'다시 풀며 개념을 확인해 보세요.',P,y+38,W-P*2,25,550,ink,36)+18;
 const wrong=r.items.filter(x=>!x.correct);text(wrong.length?'다시 확인할 문항 · '+wrong.map(x=>x.label).join(', ')+'번':'오늘의 갈피',P,y,21,600,muted);y=wrap(r.weak||(wrong.length?'풀이를 확인하고 한 번 더 도전해 보세요.':'배운 개념을 다음 문제에도 연결해 보세요.'),P,y+38,W-P*2,25,500,ink,36);
 // Long concept names grow the canvas instead of colliding with the footer.
 const footerY=Math.max(y+64,H-140);
 if(footerY+140>H){const copy=document.createElement('canvas');copy.width=W;copy.height=footerY+140;const cc=copy.getContext('2d');cc.fillStyle='#fff';cc.fillRect(0,0,copy.width,copy.height);cc.drawImage(canvas,0,0);canvas.height=copy.height;c.drawImage(copy,0,0);}
 line(footerY);text('학습일  '+r.date,P,footerY+39,20,400,muted);text(r.teacher?'교사 시연 기록':r.retry?'오답 복습 기록':'학습 세트 기록',W-P-210,footerY+39,20,500,muted);text('역사의 흐름을 읽고, 사회의 원리를 이해하다.',P,footerY+91,19,400,muted);
 return canvas;
}
async function png(r){const canvas=await canvasFor(r);const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG 저장에 실패했어요. 다시 시도해 주세요.')),'image/png'));return {blob,canvas};}
if(typeof document!=='undefined')document.addEventListener('click',async e=>{
 const button=e.target.closest('[data-gr-save]');if(!button||button.disabled)return;
 const section=button.closest('[data-gr-record]'),status=section.querySelector('[data-gr-status]'),r=records.get(button.dataset.grSave);button.disabled=true;status.textContent='학습 기록을 이미지로 만드는 중이에요…';
 try{const {blob}=await png(r),url=URL.createObjectURL(blob),filename=`GALPI_${r.title.replace(/[^가-힣a-zA-Z0-9]/g,'_')}_${r.score}of${r.total}.png`;
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();status.textContent='PNG를 저장했어요. 아래 미리보기에서도 확인할 수 있어요.';
  let dialog=document.querySelector('#gr-download-preview');if(dialog)dialog.remove();dialog=document.createElement('dialog');dialog.id='gr-download-preview';dialog.className='gr-preview';dialog.setAttribute('aria-labelledby','gr-preview-title');dialog.innerHTML=`<header><h2 id="gr-preview-title">저장한 학습 기록</h2><button type="button" class="btn" data-gr-close autofocus>닫기 ×</button></header><img src="${url}" alt="${esc(r.title)} 학습 기록 · ${r.score}/${r.total}${r.sticker?' · '+r.sticker.label:''}"><a class="btn primary" href="${url}" download="${filename}">PNG 다시 저장 ↓</a>`;document.body.append(dialog);dialog.querySelector('[data-gr-close]').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{URL.revokeObjectURL(url);dialog.remove();if(button.isConnected)button.focus();},{once:true});dialog.showModal();
 }catch(error){status.textContent=error.message||'저장하지 못했어요. 다시 시도해 주세요.';}finally{button.disabled=false;}
});
return Object.freeze({stickers,normalize,prepare,render,canvasFor,png});
});
