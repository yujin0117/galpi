const R=require('../learning-record.js'),assert=require('node:assert/strict');let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const make=(score=10,total=10,extra={})=>({session:{},title:'선택의 파장',score,total,complete:true,items:Array.from({length:total},(_,i)=>({label:i+1,correct:i<score})),...extra});
eq(R.stickers.length,8);eq(new Set(R.stickers.map(x=>x.id)).size,8);eq(R.stickers.some(x=>x.id==='classic-c'),false);
for(let n=0;n<8;n++){const input=make(),first=R.prepare(input,()=>n/8),again=R.prepare(input,()=>((n+1)%8)/8);eq(first.sticker.id,R.stickers[n].id);eq(again.sticker.id,first.sticker.id);eq(again.id,first.id);eq(first.date,again.date);}
for(const input of [make(8),make(0),make(7,7,{complete:false}),make(7,7,{teacher:true}),make(1,1,{retry:true}),make(12,12,{rewardEligible:false}),make(0,0),make(10,10,{items:[]})]){eq(R.prepare(input).sticker,null);eq(R.normalize(input).perfect,false);}
for(const n of [1,5,7,10,12,30]){const x=R.prepare(make(n,n));eq(x.perfect,true);eq(x.items.length,n);}
const session={},first=R.prepare(make(7,7,{session}),()=>.5),teacher=R.prepare(make(7,7,{session,teacher:true})),student=R.prepare(make(7,7,{session}),()=>0);eq(teacher.sticker,null);eq(student.sticker.id,first.sticker.id);
const HTML=R.render(make(8,10));eq(HTML.includes('gr-sticker'),false);eq(HTML.includes('80%'),false);eq(HTML.includes('8</strong><span>/ 10'),true);eq(HTML.includes('9, 10번'),true);
for(const x of R.stickers)eq(require('fs').existsSync(x.src),true);
console.log({status:'PASS',assertions:checks,stickerVariants:8});
