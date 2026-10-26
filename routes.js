/* Existing learning routes remain usable; the retired numeric lab opens government roles. */
(()=>{
 const routes={capitalism:['.capitalism',()=>window.GalpiCapitalism.open()],toolkit:['.toolkit',()=>window.GalpiToolkit.open()],ripple:['.ripple',()=>window.GalpiRipple.open()],finance:['.finance',()=>window.GalpiFinance.open()],intervention:[null,()=>window.GalpiRipple.openGovernment()],trade:['.trade',()=>window.GalpiTrade.open()]};
 function openRoute(){
  const value=location.hash.slice(1),historyRoute=value.match(/^history-(basic|research)(?:\/([^/]+))?$/);
  if(historyRoute){const mode=historyRoute[1],key=historyRoute[2]||'industry',topic=Math.max(0,window.GalpiHistoryData.keys.indexOf(key)),view=document.querySelector('#content .history-lab');if(!view||view.dataset.mode!==mode||+view.dataset.topic!==topic)window.GalpiHistory.open(mode,key);return;}
  const route=routes[value];if(route&&(!route[0]||!document.querySelector('#content '+route[0])))route[1]();
 }
 window.addEventListener('hashchange',openRoute);
 document.addEventListener('DOMContentLoaded',openRoute);
})();
