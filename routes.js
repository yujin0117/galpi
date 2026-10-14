/* Preserve existing hash routes and allow direct history activity entry. */
(()=>{
 const routes={toolkit:['.toolkit',()=>window.GalpiToolkit.open()],ripple:['.ripple',()=>window.GalpiRipple.open()],finance:['.finance',()=>window.GalpiFinance.open()],intervention:['.intervention',()=>window.GalpiIntervention.open()],trade:['.trade',()=>window.GalpiTrade.open()]};
 window.addEventListener('hashchange',()=>{
  const value=location.hash.slice(1),history=value.match(/^history-(basic|research)(?:\/([^/]+))?$/);
  if(history){const mode=history[1],key=history[2]||'industry',topic=Math.max(0,window.GalpiHistoryData.keys.indexOf(key)),view=document.querySelector('#content .history-lab');if(!view||view.dataset.mode!==mode||+view.dataset.topic!==topic)window.GalpiHistory.open(mode,key);return;}
  const route=routes[value];if(route&&!document.querySelector('#content '+route[0]))route[1]();
 });
})();
