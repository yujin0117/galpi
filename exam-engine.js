/* Verified source questions: page-memory responses and unbiased set selection. */
(function(g){'use strict';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function create(){return {ids:[],pos:0,answers:{},checked:{},first:{},review:false,result:false,seen:[]};}
function shuffle(items,rng=Math.random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pool(data,module,filters={}){return data.filter(q=>q.modules.includes(module)&&(!filters.year||q.year===+filters.year)&&(!filters.grade||q.grade===+filters.grade)&&(!filters.level||q.level===+filters.level));}
function draw(items,count,seen=[],rng=Math.random){const used=new Set(seen),fresh=shuffle(items.filter(q=>!used.has(q.id)),rng),old=shuffle(items.filter(q=>used.has(q.id)),rng);return [...fresh,...old].slice(0,Math.min(Math.max(0,count),items.length)).map(q=>q.id);}
function start(s,ids){if(!ids.length||new Set(ids).size!==ids.length)return false;s.ids=[...ids];s.pos=0;s.answers={};s.checked={};s.first={};s.review=false;s.result=false;s.seen=[...new Set([...s.seen,...ids])];return true;}
function select(s,id,value,options){if(!s.ids.includes(id)||s.checked[id]||!Number.isInteger(value)||value<0||value>=options)return false;s.answers[id]=value;return true;}
function check(s,id){if(!s.ids.includes(id)||!own(s.answers,id)||s.checked[id])return false;s.checked[id]=true;if(!own(s.first,id))s.first[id]=s.answers[id];return true;}
function retry(s,id){if(!s.ids.includes(id))return false;delete s.answers[id];delete s.checked[id];return true;}
function result(s,data){const map=new Map(data.map(q=>[q.id,q])),ids=Object.keys(s.first).filter(id=>map.has(id)),wrong=ids.filter(id=>s.first[id]!==map.get(id).correct);return {total:ids.length,score:ids.filter(id=>s.first[id]===map.get(id).correct).length,wrong,resolved:wrong.filter(id=>s.checked[id]&&s.answers[id]===map.get(id).correct)};}
function review(s,data){const r=result(s,data);if(!r.wrong.length)return false;s.ids=[...r.wrong];s.pos=0;s.review=true;s.result=false;s.ids.forEach(id=>retry(s,id));return true;}
const api=Object.freeze({create,shuffle,pool,draw,start,select,check,retry,result,review});if(typeof module==='object'&&module.exports)module.exports=api;else g.GalpiExamEngine=api;
})(typeof window==='undefined'?globalThis:window);
