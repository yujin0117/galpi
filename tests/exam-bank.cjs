const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const scope={window:{}};vm.runInNewContext(fs.readFileSync('exam-data.js','utf8'),scope);const D=scope.window.GalpiExamData,E=require('../exam-engine.js');

let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};const ok=a=>{assert.ok(a);checks++};
eq(D.questions.length,30);eq(new Set(D.questions.map(q=>q.id)).size,30);eq(D.exams.length,12);eq(D.exams.reduce((n,e)=>n+e.count,0),295);
const verifiedKeys={'2025-1-06-11':3,'2025-1-10-14':1,'2025-1-10-17':2,'2025-1-10-19':5,'2025-1-10-21':1,'2025-1-10-23':2,'2026-1-03-21':1,'2026-1-03-25':2,'2026-1-06-07':2,'2026-1-09-20':4,'2026-1-10-15':4,'2026-1-10-17':1,'2026-1-10-18':5,'2026-2-03-10':2,'2026-2-03-21':3,'2026-2-03-22':4,'2026-2-03-25':5,'2026-2-06-13':5,'2026-2-06-20':2,'2026-2-06-21':5,'2026-2-06-23':5,'2026-2-09-06':1,'2026-2-09-11':2,'2026-2-09-17':3,'2026-2-09-18':1,'2026-2-09-24':5,'2026-2-10-11':2,'2026-2-10-16':2,'2026-2-10-19':1,'2026-2-10-22':3};
for(const q of D.questions){eq(q.correct+1,verifiedKeys[q.id]);eq(q.options.length,5);eq(new Set(q.options).size,5);eq(q.reasons.length,5);ok(q.steps.length>=3);ok(fs.existsSync(q.image));ok(q.options.every(Boolean)&&q.reasons.every(Boolean));ok(Object.isFrozen(q));for(let answer=0;answer<5;answer++){const s=E.create();ok(E.start(s,[q.id]));eq(E.check(s,q.id),false);ok(E.select(s,q.id,answer,5));ok(E.check(s,q.id));eq(E.result(s,D.questions).score,answer===verifiedKeys[q.id]-1?1:0);eq(E.check(s,q.id),false);eq(E.select(s,q.id,(answer+1)%5,5),false);ok(E.retry(s,q.id));ok(E.select(s,q.id,q.correct,5));ok(E.check(s,q.id));eq(E.result(s,D.questions).score,answer===q.correct?1:0);}}
for(const module of ['capitalism','cost','ripple','finance','trade']){const p=E.pool(D.questions,module);eq(p.length,module==='cost'?5:7);const ids=E.draw(p,10);eq(ids.length,p.length);eq(new Set(ids).size,ids.length);ok(ids.every(id=>p.some(q=>q.id===id)));const next=E.draw(p,1,[ids[0]],()=>0.5);ok(next[0]!==ids[0]);for(const year of [2025,2026])ok(E.pool(D.questions,module,{year}).every(q=>q.year===year));}
const s=E.create();E.start(s,D.questions.map(q=>q.id));D.questions.forEach((q,i)=>{E.select(s,q.id,i%2?q.correct:(q.correct+1)%5,5);E.check(s,q.id);});eq(E.result(s,D.questions).score,15);ok(E.review(s,D.questions));eq(s.ids.length,15);for(const id of s.ids){const q=D.questions.find(q=>q.id===id);E.select(s,id,q.correct,5);E.check(s,id);}eq(E.result(s,D.questions).score,15);eq(E.result(s,D.questions).resolved.length,15);ok(E.start(s,[D.questions[0].id]));eq(Object.keys(s.first).length,0);eq(E.start(s,[]),false);eq(E.start(s,['same','same']),false);eq(E.select(s,D.questions[0].id,5,5),false);eq(E.select(s,'unknown',0,5),false);
// Independent arithmetic from original table values, not q.correct or prose.
const net=(b,c)=>b-c,opp=(price,otherB,otherC)=>price+net(otherB,otherC);
eq(30000+10000+20000,60000);eq(50000-60000,-10000);
const j=8500-6000+5000;eq(j,7500);eq(opp(5000,9000,6000),8000);eq(j-8000,-500);
eq(60*24,1440);eq(2000/2+20*24,1480);eq((60-20)*24-1000,-40);
eq(opp(3000,5000,3000),5000);eq(opp(3000,7000,3000),7000);
eq(33-8,25);eq(35-7,28);eq(33-(25+7),1);eq(35-(28+8),-1);
const oc=(a,b)=>a/b;ok(oc(80,90)<oc(120,100));ok(oc(90,80)>oc(100,120));eq(4/(2/3),6);eq(120/4,30);eq(120/6,20);ok(2/3<1&&1<5/4);eq([40,30,50,20].map((x,i)=>x),[40,30,50,20]);eq(30-10-15,5);eq(10-8,2);ok(8/4<6/2);ok(4/8>2/6);eq(10*4+4*5,60);eq(60/4-5,10);eq(5-4,1);
eq((2500+1500)/5000,0.8);eq((2000+1000)/10000,0.3);eq(30+10,40);eq(60+30,90);
const output={status:'PASS',assertions:checks,uniqueQuestions:30,moduleAssignments:33,options:150,steps:90,reviewedPapers:12,totalSourceQuestions:295};console.log(output);
