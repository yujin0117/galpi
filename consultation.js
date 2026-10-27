(() => {
 "use strict";
 const $ = selector => document.querySelector(selector);
 const $$ = selector => [...document.querySelectorAll(selector)];
 const STORAGE_KEY = "galpi.consultation.private.v1";
 const times = ["09:00","10:00","11:40","11:50","12:50","13:50","14:50"];
 const schedules = {
  "2026-10-22":["10:00","12:50","13:50","14:50"],
  "2026-10-27":["10:00","11:40","11:50","12:50","13:50","14:50"],
  "2026-10-28":["09:00","10:00","11:40","11:50","12:50","13:50"],
  "2026-10-29":["09:00","10:00","11:40","11:50","12:50","13:50"],
  "2026-11-03":["10:00","11:40","11:50","12:50","13:50","14:50"],
  "2026-11-04":["09:00","10:00","11:40","11:50","12:50"],
  "2026-11-05":["10:00","11:40","11:50","12:50","13:50"],
  "2026-11-10":["10:00","11:40","11:50","12:50","13:50","14:50"],
  "2026-11-11":["09:00","10:00","11:40","11:50","12:50"],
  "2026-11-12":["10:00","11:40","11:50","12:50","13:50"]
 };
 const privateSlots=Object.entries(schedules).flatMap(([date,ts])=>ts.map(time=>({date,time})));
 const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value)&&
   !Number.isNaN(Date.parse(value+"T00:00:00Z"))&&new Date(value+"T00:00:00Z").toISOString().slice(0,10)===value;
 const validTime = value => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
 const fmtDate = date => date.slice(5).replace("-","/");
 const todayInKorea = () => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const nowInKorea = () => new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Seoul",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date());
 const myState = {entries:[],slots:privateSlots,period:"all",month:"2026-10",selected:"2026-10-27",published:{version:1,slots:[],updatedAt:null}};
 let displayView="student";

 function message(text,error=false){const m=$("#appMessage");m.textContent=text;m.hidden=!text;m.classList.toggle("error",error);}
 function inputText(text){return String(text??"").trim();}
 function validateEntry(row) {
  if(!row || !validDate(row.date)||!validTime(row.time))return false;
  if(!["1차","2차"].includes(row.round) || !["예약","완료","취소"].includes(row.status))return false;
  if(!inputText(row.name) || inputText(row.name).length>30)return false;
  return true;
 }
 function sanitizeEntry(row){
  return {
   id:typeof row.id==="string"&&row.id.length<100?row.id:Math.random().toString(36).slice(2),
   date:row.date,time:row.time,name:inputText(row.name),
   classNo:/^[0-9]{1,2}$/.test(inputText(row.classNo))?inputText(row.classNo):"",
   round:row.round,status:row.status
  };
 }
 function loadLocal(){
  try{
   const raw=localStorage.getItem(STORAGE_KEY);
   if(!raw)return;
   const data=JSON.parse(raw);
   if(!Array.isArray(data.entries)||!Array.isArray(data.slots))throw new Error("잘못된 저장 형식");
   myState.entries=data.entries.filter(validateEntry).map(sanitizeEntry);
   myState.slots=data.slots.filter(s=>s && validDate(s.date) && validTime(s.time)).map(s=>({date:s.date,time:s.time}));
  }catch(e){message("이전에 저장된 교사용 데이터를 불러올 수 없습니다. 백업 파일을 확인해 주세요.",true);}
 }
 function persist(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,entries:myState.entries,slots:myState.slots}));}
  catch(e){message("이 기기의 저장 공간을 사용할 수 없습니다. '내 명단 백업'을 이용해 자료를 보관하세요.",true);}
 }
 function downloadJson(filename,data){
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),2500);
 }
 function select(view){
  displayView=view;
  $("#studentView").hidden=view!=="student";$("#teacherView").hidden=view!=="teacher";
  $$(".mode-nav button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.view===view)));
  location.hash=view;
  message("");
  if(view==="student")renderStudent();else renderTeacher();
 }
 function cellEntries(date,time) {
  return myState.entries.filter(e=>e.date===date&&e.time===time&&e.status!=="취소").sort((a,b)=>
    a.round.localeCompare(b.round,"ko") || a.name.localeCompare(b.name,"ko"));
 }
 function canAdd(date,time,round,exceptId=null){
  const current=myState.entries.filter(e=>e.date===date&&e.time===time&&e.status!=="취소"&&e.id!==exceptId);
  return round==="2차"?current.length===0: current.length<2&&current.every(e=>e.round==="1차");
 }
 function currentDates(){
  const [y,m]=myState.month.split("-").map(Number);
  return {y,m};
 }
 function mk(tag,className,text){
  const x=document.createElement(tag);
  if(className)x.className=className;
  if(text!==undefined)x.textContent=text;
  return x;
 }
 function renderStudent(){
  const {y,m}=currentDates();
  $("#monthHeading").textContent=y+"년 "+m+"월";
  const root=$("#monthlyCalendar");root.replaceChildren();
  ["일","월","화","수","목","금","토"].forEach(d=>root.append(mk("div","weekday",d)));
  const first=new Date(y,m-1,1).getDay(),days=new Date(y,m,0).getDate();
  for(let i=0;i<first;i++){const blank=mk("button","day-button","");blank.disabled=true;root.append(blank);}
  for(let i=1;i<=days;i++){
   const date=[y,String(m).padStart(2,"0"),String(i).padStart(2,"0")].join("-");
   const daySlots=myState.published.slots.filter(s=>s.date===date);
   const btn=mk("button","day-button"+(daySlots.length?" has-entries":"")+(date===myState.selected?" active":""),"");
   btn.type="button";btn.append(mk("strong","",i));
   if(daySlots.length)btn.append(mk("small","",daySlots.length+"개 시간대"));
   btn.addEventListener("click",()=>{myState.selected=date;renderStudent();});
   root.append(btn);
  }
  $("#dayHeading").textContent=myState.selected+" 상담 현황";
  const wrapper=$("#dayEntries");wrapper.replaceChildren();
  const list=myState.published.slots.filter(s=>s.date===myState.selected).sort((a,b)=>a.time.localeCompare(b.time));
  if(!myState.published.updatedAt){
    $("#daySubtitle").textContent="아직 학생용 현황이 공개되지 않았습니다.";
    wrapper.append(mk("p","small-muted","선생님이 공개 데이터를 등록하면 이곳에 상담 일정이 표시됩니다."));
    return;
  }
  $("#daySubtitle").textContent="마지막 공개: "+myState.published.updatedAt.slice(0,16).replace("T"," ")+" (한국 시간 표시가 아닐 수 있음)";
  if(!list.length){wrapper.append(mk("p","small-muted","선택한 날짜에 공개된 상담 시간대가 없습니다."));return;}
  list.forEach(s=>{
   const row=mk("div","detail-row"),summary=mk("div"),strong=mk("strong","",s.time);
   let status="신청 가능",pill="free";
   if(s.booked>0){status="예약됨";pill="booked";}
   if(s.remaining===0){status=s.completed===s.count?"상담 완료":"예약 마감";pill=s.completed===s.count?"complete":"booked";}
   if(s.booked===0&&s.completed>0&&s.remaining>0){status="일부 완료 · 추가 가능";pill="free";}
   if(s.booked===0&&s.completed>0&&s.remaining===0){status="상담 완료";pill="complete";}
   if(s.booked>0 && s.completed>0 && s.remaining===0){status="일부 완료";pill="booked";}
   if(s.remaining>0&&s.booked>0){status="추가 가능";pill="free";}
   const note = s.count===0 ? "현재 예약자 없음" : "예약 "+s.booked+"명 · 완료 "+s.completed+"명 · 추가 "+s.remaining+"명";
   summary.append(strong,mk("small","",note));
   const past= s.date<todayInKorea()||(s.date===todayInKorea()&&s.time<nowInKorea());
   if(past&&s.booked>0)summary.append(mk("small","","예정 시간이 지남 · 실제 완료 여부는 교사 확인"));
   row.append(summary,mk("span","pill "+pill,status));wrapper.append(row);
  });
 }
 function renderTeacher(){
  const root=$("#teacherTable");root.replaceChildren();
  const allDates=Object.keys(schedules);
  const dates=allDates.filter(d=>myState.period==="oct"?d<"2026-11-01":myState.period==="novEarly"?d>="2026-11-03"&&d<="2026-11-05":myState.period==="novLate"?d>="2026-11-10":true);
  const table=mk("table","consult-matrix");
  const head=mk("thead"),heading=mk("tr");
  ["시간",...dates.map(fmtDate)].forEach(label=>heading.append(mk("th","",label)));
  head.append(heading);table.append(head);
  const body=mk("tbody");
  times.forEach(time=>{
   const tr=mk("tr");tr.append(mk("th","",time));
   dates.forEach(date=>{
    const td=mk("td"),enabled=myState.slots.some(s=>s.date===date&&s.time===time);
    const items=cellEntries(date,time);
    items.forEach(e=>{
     const btn=mk("button","cell-entry "+(e.status==="완료"?"complete":e.round==="2차"?"second":"first"),e.name+" ("+e.round+")"+(e.status==="완료"?" ✓":""));
     btn.type="button";btn.title="상담 정보 수정";
     btn.addEventListener("click",()=>loadForm(e));
     td.append(btn);
    });
    if(enabled&&(!items.length || (items.length===1 && items[0].round==="1차"))){
     const btn=mk("button","cell-empty"+(items.length?" split":""),items.length?"＋ (1차)":"＋ 예약 추가");
     btn.type="button";btn.addEventListener("click",()=>newForm(date,time,items.length?"1차":"1차"));td.append(btn);
    }else if(!enabled){
     const btn=mk("button","cell-empty","—");btn.type="button";btn.title="상담 시간대 추가";
     btn.addEventListener("click",()=>newForm(date,time));td.append(btn);
    }
    tr.append(td);
   });body.append(tr);
  });table.append(body);root.append(table);
 }
 function newForm(date="",time="",round="1차",scroll=true){
  const f=$("#entryForm");f.reset();f.elements.id.value="";
  f.elements.date.value=date||"2026-10-27";f.elements.time.value=time||"10:00";
  f.elements.round.value=round;$("#formHeading").textContent="상담 등록";$("#deleteEntry").hidden=true;
  if(scroll)$("#entryForm").scrollIntoView({behavior:"smooth",block:"center"});
 }
 function loadForm(entry){
  const f=$("#entryForm");
  ["id","date","time","name","classNo","round","status"].forEach(key=>{f.elements[key].value=entry[key]||"";});
  $("#formHeading").textContent="상담 정보 수정";
  $("#deleteEntry").hidden=false;
  $("#entryForm").scrollIntoView({behavior:"smooth",block:"center"});
 }
 function saveForm(event){
  event.preventDefault();
  const f=event.currentTarget, row={};
  ["id","date","time","name","classNo","round","status"].forEach(key=>row[key]=inputText(f.elements[key].value));
  row.id=row.id || (Date.now().toString(36)+Math.random().toString(36).slice(2,9));
  if(!validateEntry(row)){message("날짜, 시간, 이름, 상담 차수와 상태를 확인해 주세요.",true);return;}
  if(row.status!=="취소"&&!canAdd(row.date,row.time,row.round,row.id)){
   message("해당 시간대 정원이 찼습니다. 1차는 최대 2명, 2차는 1명만 배정할 수 있습니다.",true);return;
  }
  const index=myState.entries.findIndex(e=>e.id===row.id);
  if(index>=0)myState.entries[index]=row;else myState.entries.push(row);
  if(!myState.slots.some(s=>s.date===row.date&&s.time===row.time))
    myState.slots.push({date:row.date,time:row.time});
  persist();renderTeacher();newForm(row.date,row.time);message(row.name+" 학생의 상담 정보를 저장했습니다. 아직 학생용 공개 화면에는 반영되지 않았습니다.");
 }
 function makePublicData(){
  return {version:1,updatedAt:new Date().toISOString(),slots:myState.slots
   .map(slot=>{
    const all=cellEntries(slot.date,slot.time);
    const booked=all.filter(e=>e.status==="예약").length,completed=all.filter(e=>e.status==="완료").length;
    const second=all.some(e=>e.round==="2차");
    const capacity=second?1:2;
    return {date:slot.date,time:slot.time,count:all.length,booked,completed,remaining:Math.max(0,capacity-all.length)};
   }).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time))};
 }
 function isPublicPayload(x){
  return x&&x.version===1&&Array.isArray(x.slots)&&x.slots.length<=2000&&x.slots.every(s=>
    validDate(s.date)&&validTime(s.time)&&["count","booked","completed","remaining"].every(k=>Number.isInteger(s[k])&&s[k]>=0&&s[k]<=30));
 }
 async function loadPublished(){
  try{
   const r=await fetch("consultation-public.json?x="+Date.now(),{cache:"no-store"});
   if(!r.ok)throw new Error("HTTP "+r.status);
   const data=await r.json();
   if(!isPublicPayload(data))throw new Error("format");
   myState.published=data;
   renderStudent();
  }catch(e){myState.published={version:1,updatedAt:null,slots:[]};renderStudent();message("학생용 공개 현황을 읽지 못했습니다. 공개 데이터 파일을 확인해 주세요.",true);}
 }
 $("#refreshPublic").addEventListener("click",loadPublished);
 $("#monthBack").addEventListener("click",()=>{
  const {y,m}=currentDates(),d=new Date(y,m-2,1);
  myState.month=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
  myState.selected=myState.month+"-01";renderStudent();
 });
 $("#monthForward").addEventListener("click",()=>{
  const {y,m}=currentDates(),d=new Date(y,m,1);
  myState.month=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");
  myState.selected=myState.month+"-01";renderStudent();
 });
 $$(".mode-nav button").forEach(btn=>btn.addEventListener("click",()=>select(btn.dataset.view)));
 $("#periodSelect").addEventListener("change",e=>{myState.period=e.target.value;renderTeacher();});
 $("#newEntry").addEventListener("click",()=>newForm());
 $("#cancelEdit").addEventListener("click",()=>newForm());
 $("#entryForm").addEventListener("submit",saveForm);
 $("#deleteEntry").addEventListener("click",()=>{
  const id=$("#entryForm").elements.id.value;
  const entry=myState.entries.find(e=>e.id===id);
  if(!entry)return;
  if(!confirm(entry.name+" 학생의 이 상담 예약을 삭제할까요?"))return;
  myState.entries=myState.entries.filter(e=>e.id!==id);persist();renderTeacher();newForm();
  message("해당 상담 기록을 삭제했습니다. 공개 파일은 다시 만들어야 학생에게 반영됩니다.");
 });
 $("#exportBackup").addEventListener("click",()=>{
  downloadJson("GALPI_교사용_상담명단_비공개_"+todayInKorea()+".json",
   {version:1,entries:myState.entries,slots:myState.slots});
  message("교사용 백업 파일을 내려받았습니다. 실명이 포함되어 있으니 외부에 공유하지 마세요.");
 });
 $("#importBackup").addEventListener("change",async event=>{
  const file=event.target.files?.[0];if(!file)return;
  try{
   if(file.size>1024*1024)throw Error("파일이 너무 큽니다.");
   const obj=JSON.parse(await file.text());
   if(obj.version!==1||!Array.isArray(obj.entries)||!Array.isArray(obj.slots))throw Error("백업 형식이 아닙니다.");
   if(obj.entries.length>500||obj.slots.length>500)throw Error("너무 많은 일정입니다.");
   if(obj.entries.some(row=>!validateEntry(row)))throw Error("상담 데이터에 잘못된 값이 있습니다.");
   if(obj.slots.some(row=>!row||!validDate(row.date)||!validTime(row.time)))throw Error("시간대 데이터에 잘못된 값이 있습니다.");
   if(!confirm("현재 기기에 저장된 상담 명단을 선택한 백업 파일로 교체할까요?"))return;
   myState.entries=obj.entries.map(sanitizeEntry);myState.slots=obj.slots.map(({date,time})=>({date,time}));
   persist();renderTeacher();newForm();
   message(myState.entries.length+"건의 상담을 불러왔습니다. 학생용 공개 데이터는 별도로 만들어야 합니다.");
  }catch(e){message("백업 파일을 불러오지 못했습니다: "+e.message,true);}
  finally{event.target.value="";}
 });
 $("#exportPublic").addEventListener("click",()=>{
  if(!myState.entries.length){message("기존 구글 캘린더 예약을 등록한 뒤 공개 파일을 만드세요. 빈 데이터는 예약이 가능한 것으로 잘못 보일 수 있습니다.",true);return;}
  const sanitized=makePublicData();
  downloadJson("consultation-public.json",sanitized);
  message("학생용 파일을 만들었습니다. 학생 이름·학번은 포함되지 않습니다. GitHub의 consultation-public.json 파일을 교체해야 학생 화면도 바뀝니다.");
 });
 $("#clearLocal").addEventListener("click",()=>{
  if(!confirm("이 기기에서만 저장한 모든 교사용 상담 명단을 지울까요? 복구하려면 백업 파일이 필요합니다."))return;
  try{localStorage.removeItem(STORAGE_KEY);}catch(_){}
  myState.entries=[];myState.slots=privateSlots.map(s=>({...s}));
  renderTeacher();newForm();message("이 기기에서 저장한 교사용 자료를 초기화했습니다.");
 });
 loadLocal();
 const hash=location.hash.slice(1);
 select(hash==="teacher"?"teacher":"student");
 newForm("2026-10-27","10:00","1차",false);
 loadPublished();
})();