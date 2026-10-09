/* Classroom data lives only in memory. Pure operations are also testable with Node. */
(function(root){
'use strict';
function integer(raw,min,max,label){if(!/^\d+$/.test(String(raw).trim()))throw Error(`${label}: 정수를 입력하세요.`);const n=Number(raw);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(`${label}: ${min}~${max} 사이로 입력하세요.`);return n;}
function exclusions(raw,max){const out=new Set();if(!String(raw).trim())return [];for(const piece of String(raw).split(',')){const t=piece.trim();if(!/^\d+(?:\s*-\s*\d+)?$/.test(t))throw Error('제외 번호는 쉼표와 범위로 입력하세요. 예: 3, 7, 12-14');const [a,b=a]=t.split('-').map(x=>integer(x,1,max,'제외 번호'));if(a>b)throw Error('범위의 시작 번호가 끝 번호보다 큽니다.');for(let n=a;n<=b;n++)out.add(n);}return [...out].sort((a,b)=>a-b);}
function setup(max,base,today){max=integer(max,1,500,'최대 출석번호');const basic=exclusions(base,max),daily=exclusions(today,max),excluded=new Set([...basic,...daily]);return {max,basic,daily,participants:Array.from({length:max},(_,i)=>i+1).filter(n=>!excluded.has(n))};}
function random(n){if(root.crypto?.getRandomValues){const a=new Uint32Array(1),limit=4294967296-4294967296%n;do{root.crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n;}throw Error('이 브라우저에서는 안전한 무작위 추첨을 지원하지 않습니다.');}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=random(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function groups(students,count,leaders){count=integer(count,1,students.length,'조 개수');const a=shuffle(students),q=Math.floor(a.length/count),r=a.length%count;let offset=0;return Array.from({length:count},(_,i)=>{const members=a.slice(offset,offset+=q+(i<r?1:0));return {name:`${i+1}조`,members,leader:leaders?members[random(members.length)]:null};});}
const api={integer,exclusions,setup,random,shuffle,groups};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GalpiToolkitEngine=Object.freeze(api);
})(globalThis);
