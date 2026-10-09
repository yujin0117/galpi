/* One replaceable slot. Future notice/sponsored renderers must be reviewed before activation.
   Sponsored content requires clear advertising disclosure, separation from learning content,
   and applicable legal/privacy review. No tracking or advertising SDK is included. */
(()=>{
'use strict';
const slot=Object.freeze({type:'brand',title:['갈피를 잡으면,','이해가 시작된다.'],description:'역사의 흐름을 읽고, 사회의 원리를 이해하다.'});
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
window.GalpiBanner=Object.freeze({
render(data=slot){
 if(data.type!=='brand')return ''; // Only the approved brand type is currently enabled.
 return `<section class="brand-banner" data-banner-type="brand" aria-labelledby="banner-title"><img class="banner-landscape" src="assets/landscape.svg" width="1200" height="360" alt="" aria-hidden="true" fetchpriority="high" decoding="async"><div class="banner-copy"><p class="banner-eyebrow">GALPI · A CLEARER PERSPECTIVE</p><h1 id="banner-title">${data.title.map(t=>`<span>${escape(t)}</span>`).join('')}</h1><p class="banner-description">${escape(data.description)}</p></div></section>`;
},
subject(kind){const social=kind==='social';return `<section class="subject-intro"><div><p class="subject-eyebrow">${social?'INTEGRATED SOCIAL STUDIES':'KOREAN HISTORY'}</p><h1>${social?'통합사회2':'한국사2'}</h1><p class="subject-description">${social?'선택하고, 실험하며 사회의 원리를 발견하다.':'사건을 따라가며, 역사의 맥락을 발견하다.'}</p></div><svg class="subject-accent" viewBox="0 0 120 72" fill="none" aria-hidden="true">${social?'<path d="M12 58H108M20 60V12"/><path d="M26 48L48 32L70 40L99 15"/><circle cx="48" cy="32" r="4"/><circle cx="70" cy="40" r="4"/><circle cx="99" cy="15" r="4"/>':'<path d="M12 36H108M32 20V52M60 26V46M88 16V56"/><circle cx="32" cy="36" r="4"/><circle cx="60" cy="36" r="4"/><circle cx="88" cy="36" r="4"/>'}</svg></section>`;}
});
})();
