const assert=require('node:assert/strict'),L=require('../finance-learning.js'),E=require('../finance-engine.js'),R=require('../learning-record.js');
let assertions=0;const eq=(a,b)=>{assert.deepEqual(a,b);assertions++;};
const data=L.data;eq(data.questions.length,14);eq(new Set(data.questions.map(q=>q.id)).size,14);eq(Object.isFrozen(data.questions),true);eq(L.sale(10000,12000),2000);eq(L.sale(10000,8000),-2000);eq(data.protection.limit,100000000);
for(const q of data.questions){
 for(let mask=0;mask<2**q.options.length;mask++){
  const answer=q.options.map((_,i)=>i).filter(i=>mask&(1<<i)),z=L.start();for(const n of answer)L.select(z,q.id,n);
  eq(L.check(z,q.id),!!answer.length);eq(L.correct(q,answer),JSON.stringify(answer)===JSON.stringify([...q.correct].sort()));
  if(answer.length){eq(L.result(z).items.find(x=>x.id===q.id).correct,JSON.stringify([...z.answers[q.id]].sort())===JSON.stringify([...q.correct].sort()));eq(L.select(z,q.id,0),false);eq(L.check(z,q.id),false);const first=[...z.first[q.id]];L.retry(z,q.id);q.correct.forEach(n=>L.select(z,q.id,n));L.check(z,q.id);eq(z.first[q.id],first);}
 }
 eq(L.correct(q,[...q.correct].reverse()),true);eq(L.correct(q,[...q.correct,...q.correct]),false);eq(L.correct(q,[-1]),false);eq(L.correct(q,[q.options.length]),false);
}
let z=L.start();eq(L.result(z).complete,false);eq(L.select(z,'unknown',0),false);eq(L.select(z,data.questions[0].id,-1),false);
for(const q of data.questions){q.correct.forEach(n=>L.select(z,q.id,n));L.check(z,q.id);}eq(L.result(z).score,14);eq(L.result(z).complete,true);eq(L.review(z),false);eq(R.prepare({session:z,title:'돈의 갈피',...L.result(z)}).perfect,true);
z=L.start();for(const [i,q] of data.questions.entries()){(i===0?[(q.correct[0]+1)%q.options.length]:q.correct).forEach(n=>L.select(z,q.id,n));L.check(z,q.id);}eq(L.result(z).score,13);eq(L.review(z),true);eq(z.ids.length,1);const q=data.questions[0];q.correct.forEach(n=>L.select(z,q.id,n));L.check(z,q.id);eq(L.result(z).score,13);eq(R.prepare({session:z,title:'돈의 갈피',...L.result(z)}).sticker,null);eq(L.start().first,{});
// Independent known-value baselines: existing simulation math is not rewritten by this change.
for(const [id,total] of [['rates',986000],['inflation',1022000],['recession',928000],['recovery',1069000]])eq(E.simulate([20,30,30,20],id).total,total);
eq(E.valid([20,30,30,20]),true);eq(E.valid([20,30,30,25]),false);eq(E.liquidity([20,30,30,20],[200000,100000,0,0]).available,301250);eq(E.liquidity([20,30,30,20],[0,0,0,200000]).deferred,194808);

console.log({status:'PASS',assertions,newConceptQuestions:14,originalEngineAndData:'unchanged'});
