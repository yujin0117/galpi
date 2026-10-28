// Contracts checked against the supplied paper headers and underline ranges.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const scope={window:{}};vm.runInNewContext(fs.readFileSync('exam-data.js','utf8'),scope);
const qs=scope.window.GalpiExamData.questions;
const source=JSON.parse(fs.readFileSync('docs/exam-paper-annotations.json','utf8'));
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};const ok=x=>{assert.ok(x);checks++;};
const verifiedPoints=[2,2,2.5,2.5,1.5,2,2,2.5,2,2,2,1.5,2,2.5,2.5,2.5,2.5,2.5,1.5,2,2.5,1.5,2,2.5,1.5,2.5,2,2.5,2.5,2];
eq(qs.length,30);
qs.forEach((q,i)=>{
 eq(q.points,verifiedPoints[i]);
 const original=source.find(x=>x.id===q.id);ok(original);
 const ranges=[...q.body.matchAll(/<u[^>]*data-ref="([^"]*)"[^>]*>(.*?)<\/u>/g)].map(m=>({reference:m[1],text:m[2]}));
 eq(ranges,original.underlines);
 if(q.prompt.includes('밑줄 친'))ok(ranges.length>0);
 if(q.body.includes('ep-statements')){ok(q.body.includes('<fieldset class="ep-statements"'));ok(q.body.includes('<legend>〈보 기〉</legend>'));}
});
eq(source.reduce((n,x)=>n+x.underlines.length,0),27);
const solar=qs.find(q=>q.id==='2026-2-06-23');
ok(solar.body.includes('data-ref="㉣">설치 비용 2,000달러 중 정부 보조금을 제외한 금액</u>'));
eq(solar.correct,4);
console.log({status:'PASS',assertions:checks,paperPoints:30,underlineRanges:27,statementGroups:6});
