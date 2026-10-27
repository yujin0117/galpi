/* GALPI consultation module: no personal records or passwords in public source. */
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const firebaseConfig = window.GALPI_CONSULTATION_CONFIG;
const showNotice = (message, error=false) => {
  const box=$("#notice"); box.textContent=message || "";box.classList.toggle("error", error);
};
const escapeHTML = value => String(value??"").replace(/[&<>"']/g, ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const todaySeoul = () => new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
let year=2026, month=10, daySelected=null;
let publicSlots=[], auth=null, functions=null, fns=null, authenticatedUser=null;
// Student credentials are validated only by a server-side callable function.
function selectPage(page){
  $$(".consult-nav [data-page]").forEach(btn=>btn.setAttribute("aria-current",btn.dataset.page===page?"page":"false"));
  $$(".consult-page").forEach(sec=>sec.hidden=sec.id!=="page-"+page);
  if(page==="teacher" && authenticatedUser) loadTeacher();
  if(page==="mine" && authenticatedUser) loadMine();
  history.replaceState(null,"","#"+page);
  showNotice("");
}
function drawCalendar(){
  $("#monthLabel").textContent=year+"년 "+month+"월";
  const grid=$("#calendarGrid");
  grid.replaceChildren();
  ["일","월","화","수","목","금","토"].forEach(label=>{
    const elem=document.createElement("span"); elem.className="weekday";elem.textContent=label;grid.append(elem);
  });
  const weekStart=new Date(year,month-1,1).getDay();
  const last=new Date(year,month,0).getDate();
  for(let blank=0;blank<weekStart;blank++){const cell=document.createElement("button");cell.className="calendar-day";cell.disabled=true;cell.setAttribute("aria-hidden","true");grid.append(cell);}
  for(let d=1;d<=last;d++){
    const date=[year,String(month).padStart(2,"0"),String(d).padStart(2,"0")].join("-");
    const dayEntries=publicSlots.filter(v=>v.date===date);
    const button=document.createElement("button");button.type="button";
    button.className="calendar-day"+(date===daySelected?" selected":"")+(date===todaySeoul()?" today":"");
    const n=document.createElement("strong");n.textContent=d;button.append(n);
    if(dayEntries.length){const small=document.createElement("small");small.textContent=dayEntries.length+"개 시간대";button.append(small);}
    button.addEventListener("click",()=>{daySelected=date;drawCalendar();drawDay()});grid.append(button);
  }
}
function showSlotStatus(slot){
  const active=slot.reserved || 0, done=slot.completed || 0;
  if(active===0 && done>0) return ["상담 완료","done"];
  if(slot.isFull) return ["예약 마감","full"];
  if(active>0) return ["추가 가능","open"];
  return ["예약 가능","open"];
}
function drawDay(){
  const section=$("#dayDetails");
  if(!daySelected){section.innerHTML='<h3>날짜를 선택하세요</h3><p class="muted">상담 시간과 예약 상태를 확인할 수 있어요.</p>';return;}
  const todaySlots=publicSlots.filter(s=>s.date===daySelected).sort((a,b)=>a.time.localeCompare(b.time));
  section.innerHTML="<h3>"+escapeHTML(daySelected)+" 상담 시간</h3>";
  const list=document.createElement("div");list.className="slot-list";
  if(!todaySlots.length){const p=document.createElement("p");p.className="muted";p.textContent="표시할 예약 시간대가 없습니다. 예약 내역과 시간대를 등록한 후 보여집니다.";list.append(p);}
  todaySlots.forEach(s=>{
    const [label,kind]=showSlotStatus(s);
    const row=document.createElement("div");row.className="slot-row";
    const a=document.createElement("div");
    const strong=document.createElement("strong");strong.textContent=s.time;
    const detail=document.createElement("span");detail.textContent=" · "+(s.secondRound?"2차 10분":("1차 "+(s.firstRound||0)+"/2명"));
    a.append(strong,detail);
    const badge=document.createElement("span");badge.className="state-pill "+(kind==="open"?"":kind);badge.textContent=label;
    row.append(a,badge);list.append(row);
  });
  section.append(list);
}
async function fetchPublic(){
  if(!functions){drawCalendar();drawDay();return;}
  try{
    const from=[year,String(month).padStart(2,"0"),"01"].join("-");
    const to=[year,String(month).padStart(2,"0"),String(new Date(year,month,0).getDate()).padStart(2,"0")].join("-");
    const result=await fns.call(functions,"publicCalendar")({from,to});
    publicSlots=result.data?.slots||[];
    drawCalendar();drawDay();
  }catch(e){showNotice("월간 예약 현황을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.",true);}
}
function resetBookingForm(){
  $("#bookingForm").reset();
  $("#bookingForm [name=bookingId]").value="";
}
function showMyBookings(data){
  const box=$("#myBookings");box.replaceChildren();
  const student=data.student;
  $("#studentGreeting").textContent=student?.name+" 학생";
  $("#studentSession").hidden=false;
  $("#studentLogin").hidden=true;$("#studentActivate").hidden=true;$("#showActivate").hidden=true;
  const bookings=data.bookings||[];
  if(!bookings.length){box.innerHTML='<p class="muted">등록된 상담 일정이 없습니다. 선생님께 예약 반영 여부를 확인해 주세요.</p>';return;}
  bookings.forEach(b=>{
    const card=document.createElement("article");card.className="booking-card";
    const h=document.createElement("h4");h.textContent=b.round+" · "+b.date+" "+b.time;
    const p=document.createElement("p");p.textContent="상태: "+(b.status==="완료"?"상담 완료":(b.status==="취소"?"취소":"예약됨"))+" · 장소: 2교무실 유진쌤 자리";
    card.append(h,p);box.append(card);
  });
}
async function loadMine(){
  if(!functions||!authenticatedUser)return;
  try{
    const result=await fns.call(functions,"myBookings")({});
    if(result.data?.student) showMyBookings(result.data);
  }catch(e){
    if(!$("#page-mine").hidden)showNotice("학생 예약 조회 권한이 없습니다. 학생 계정으로 로그인해 주세요.",true);
  }
}
function renderTeacher(bookings){
  const box=$("#teacherBookings");box.className="admin-list";box.replaceChildren();
  const table=document.createElement("table");table.className="admin-table";
  table.innerHTML="<thead><tr><th>날짜</th><th>시간</th><th>학번</th><th>이름</th><th>차수</th><th>상태</th><th>관리</th></tr></thead>";
  const body=document.createElement("tbody");
  bookings.forEach(b=>{
    const tr=document.createElement("tr");
    [b.date,b.time,b.studentId,b.studentName,b.round,b.status].forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.append(td);});
    const td=document.createElement("td");const btn=document.createElement("button");btn.type="button";btn.textContent="수정";
    btn.addEventListener("click",()=>{
      const form=$("#bookingForm");
      ["bookingId","studentId","studentName","date","time","round","status"].forEach(key=>{form.elements[key].value=key==="bookingId"?b.id:b[key]});
      form.scrollIntoView({behavior:"smooth",block:"center"});
    });td.append(btn);tr.append(td);body.append(tr);
  });
  if(!bookings.length){const tr=document.createElement("tr");const td=document.createElement("td");td.colSpan=7;td.textContent="등록된 상담이 없습니다.";tr.append(td);body.append(tr);}
  table.append(body);box.append(table);
}
async function loadTeacher(){
  if(!authenticatedUser||!functions)return;
  try{
    const result=await fns.call(functions,"teacherBookings")({});
    $("#teacherLoginBox").hidden=true;$("#teacherPanel").hidden=false;
    renderTeacher(result.data?.bookings||[]);
  }catch(e){
    $("#teacherPanel").hidden=true;$("#teacherLoginBox").hidden=false;
  }
}
function explainError(error){
  const code=error?.code||"";
  if(code.includes("wrong-password")||code.includes("invalid-credential")||code.includes("user-not-found"))return "학번 또는 비밀번호가 맞지 않습니다.";
  if(code.includes("too-many-requests")||code.includes("resource-exhausted"))return "시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  if(code.includes("permission-denied"))return "접근 권한이 없습니다.";
  if(code.includes("failed-precondition"))return "초기 설정이나 인증코드를 확인해 주세요.";
  if(code.includes("already-exists"))return "이미 등록된 학번입니다. 로그인하거나 선생님에게 재설정 코드를 요청해 주세요.";
  if(code.includes("invalid-argument"))return "입력 내용을 확인해 주세요.";
  return "요청을 처리하지 못했습니다. 입력값을 확인한 뒤 다시 시도해 주세요.";
}
async function initFirebase(){
  if(!firebaseConfig?.apiKey||!firebaseConfig?.projectId||!firebaseConfig?.appId){
    showNotice("현재 상담 관리 서비스는 초기 설정 중입니다. 실제 로그인·예약 조회는 Firebase를 연결한 뒤 이용할 수 있습니다.");
    drawCalendar();return;
  }
  try{
    const version="12.4.0";
    const [appLib,authLib,funLib]=await Promise.all([
      import("https://www.gstatic.com/firebasejs/"+version+"/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/"+version+"/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/"+version+"/firebase-functions.js")
    ]);
    const app=appLib.initializeApp(firebaseConfig);
    auth=authLib.getAuth(app);
    functions=funLib.getFunctions(app,"asia-northeast3");
    fns={...authLib,call:funLib.httpsCallable};
    authLib.onAuthStateChanged(auth,user=>{
      authenticatedUser=user;
      if(user){if(!$("#page-teacher").hidden)loadTeacher();if(!$("#page-mine").hidden)loadMine();}
    });
    await fetchPublic();
  }catch(e){showNotice("서버 연결 오류입니다. 설정과 배포 상태를 확인해 주세요.",true);}
}
$$(".consult-nav [data-page]").forEach(b=>b.addEventListener("click",()=>selectPage(b.dataset.page)));
$("#monthPrev").addEventListener("click",()=>{month--;if(month===0){month=12;year--;}daySelected=null;fetchPublic();});
$("#monthNext").addEventListener("click",()=>{month++;if(month===13){month=1;year++;}daySelected=null;fetchPublic();});
$("#showActivate").addEventListener("click",()=>{$("#studentActivate").hidden=false;$("#studentLogin").hidden=true;$("#showActivate").hidden=true;showNotice("");});
$("#backToLogin").addEventListener("click",()=>{$("#studentActivate").hidden=true;$("#studentLogin").hidden=false;$("#showActivate").hidden=false;});
$("#studentLogin").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!auth){showNotice("서비스 인증 기능을 연결한 뒤 이용할 수 있습니다.",true);return;}
  const fd=new FormData(e.target);
  try{
    const result=await fns.call(functions,"studentLogin")({studentId:String(fd.get("studentId")),password:String(fd.get("password"))});
    await fns.signInWithCustomToken(auth,result.data.token);
    e.target.reset();await loadMine();showNotice("");
  }catch(err){showNotice(explainError(err),true);}
});
$("#studentActivate").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!functions){showNotice("서비스 인증 기능을 연결한 뒤 이용할 수 있습니다.",true);return;}
  const fd=new FormData(e.target);
  if(fd.get("password")!==fd.get("confirm")){showNotice("비밀번호 확인이 일치하지 않습니다.",true);return;}
  try{
    await fns.call(functions,"activateStudent")({
      studentId:String(fd.get("studentId")).trim(),
      activationCode:String(fd.get("activationCode")).trim(),
      password:String(fd.get("password"))
    });
    const login=await fns.call(functions,"studentLogin")({studentId:String(fd.get("studentId")),password:String(fd.get("password"))});
    await fns.signInWithCustomToken(auth,login.data.token);
    e.target.reset();await loadMine();showNotice("비밀번호를 설정했습니다. 다음부터는 학번과 비밀번호로 로그인하세요.");
  }catch(err){showNotice(explainError(err),true);}
});
$("#teacherLogin").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!auth){showNotice("Firebase 인증 연결이 필요합니다.",true);return;}
  const fd=new FormData(e.target);
  try{
    await fns.signInWithEmailAndPassword(auth,String(fd.get("email")).trim(),String(fd.get("password")));
    const result=await fns.call(functions,"teacherBookings")({});
    $("#teacherPanel").hidden=false;$("#teacherLoginBox").hidden=true;
    renderTeacher(result.data?.bookings||[]);
    e.target.reset();showNotice("");
  }catch(err){showNotice(explainError(err),true);}
});
$("#studentLogout").addEventListener("click",async()=>{
  if(auth)await fns.signOut(auth);
  $("#studentSession").hidden=true;$("#studentLogin").hidden=false;$("#showActivate").hidden=false;
  $("#myBookings").innerHTML='<p class="muted">로그인 후에만 개인 예약 정보를 볼 수 있습니다.</p>';
});
$("#teacherLogout").addEventListener("click",async()=>{
  if(auth)await fns.signOut(auth);
  $("#teacherPanel").hidden=true;$("#teacherLoginBox").hidden=false;showNotice("");
});
$("#inviteForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!functions)return;
  const f=new FormData(e.target);
  try{
    const result=await fns.call(functions,"createStudentInvite")({
      studentId:String(f.get("studentId")).trim(),studentName:String(f.get("studentName")).trim(),classNo:String(f.get("classNo")).trim()
    });
    $("#inviteResult").textContent="학번 "+String(f.get("studentId"))+" · 초기 인증코드: "+result.data.activationCode+" (1회만 표시)";
    showNotice("초기 인증코드를 발급했습니다. 학생에게 개별 전달하세요.");
  }catch(err){showNotice(explainError(err),true);}
});
$("#bookingForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!functions)return;
  const f=new FormData(e.target),data={};
  ["bookingId","studentId","studentName","date","time","round","status"].forEach(key=>data[key]=String(f.get(key)||"").trim());
  try{
    await fns.call(functions,"saveBooking")(data);
    resetBookingForm();await loadTeacher();await fetchPublic();showNotice("상담 정보가 저장됐습니다.");
  }catch(err){showNotice(explainError(err),true);}
});
$("#initializeSlots").addEventListener("click",async()=>{
  if(!functions)return;
  if(!window.confirm("2026년 상담 시간대 기본 틀을 생성할까요? 기존 예약은 그대로 유지됩니다."))return;
  try{
    const result=await fns.call(functions,"initialize2026Slots")({});
    await fetchPublic();
    showNotice("상담 시간대 "+result.data.created+"개를 확인하고 등록했습니다.");
  }catch(error){showNotice(explainError(error),true);}
});
$("#bookingReset").addEventListener("click",resetBookingForm);
const route=location.hash.slice(1);
selectPage(["mine","teacher","public"].includes(route)?route:"public");
initFirebase();