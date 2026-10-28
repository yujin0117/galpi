// Ensure the source-PDF visual assets remain present, intact, and correctly paired.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const scope={window:{}};vm.runInNewContext(fs.readFileSync('exam-data.js','utf8'),scope);
const questions=scope.window.GalpiExamData.questions;
const materials=JSON.parse(fs.readFileSync('docs/exam-original-materials.json','utf8'));
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};const ok=x=>{assert.ok(x);checks++;};
eq(materials.length,8);
eq(new Set(materials.map(x=>x.questionId)).size,7);
for(const m of materials){
 ok(fs.existsSync(m.image));
 const bytes=fs.readFileSync(m.image);
 eq(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 eq([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],m.size);
 eq(crypto.createHash('sha256').update(bytes).digest('hex'),m.sha256);
 ok(questions.find(q=>q.id===m.questionId)?.body.includes(m.image));
}
const references=new Set(questions.flatMap(q=>[...q.body.matchAll(/src="(assets\/exams\/materials\/[^" ]+)"/g)].map(m=>m[1])));
eq(references.size,8);
ok([...references].every(path=>materials.some(m=>m.image===path)));
ok(questions.every(q=>!q.body.includes('<svg')&&!q.body.includes('\uFFFD')));
console.log({status:'PASS',assertions:checks,sourceVisuals:8,questionsWithSourceVisuals:7});
