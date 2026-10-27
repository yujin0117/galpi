"use strict";
/* GALPI consultation backend. Personal records never reside in public GitHub assets.
   All sensitive reads/writes use Admin SDK and role checks. */
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, FieldValue, Timestamp} = require("firebase-admin/firestore");
const {getAuth} = require("firebase-admin/auth");
const crypto = require("node:crypto");
const {promisify} = require("node:util");
const scrypt = promisify(crypto.scrypt);
initializeApp();
const db=getFirestore(), userAuth=getAuth();
const options={region:"asia-northeast3",maxInstances:5};
const STUDENT_ID=/^[0-9]{4,8}$/;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const TIME=/^(?:[01]\d|2[0-3]):[0-5]\d$/;
const rounds=new Set(["1차","2차"]), statuses=new Set(["예약","완료","취소"]);
const derivePassword=async(password,salt)=>(await scrypt(password,salt,64,{N:16384,r:8,p:1,maxmem:67108864})).toString("hex");
const string=(value,max=100)=>typeof value==="string"?value.trim().slice(0,max):"";
const invalid=message=>{throw new HttpsError("invalid-argument",message);};
const unauthorized=()=>{throw new HttpsError("permission-denied","권한이 없습니다.");};
function validatedDate(s){if(!DATE.test(s)||new Date(s+"T12:00:00Z").toISOString().slice(0,10)!==s)invalid("올바른 날짜가 아닙니다.");return s;}
function validatedId(v){const id=string(v,10);if(!STUDENT_ID.test(id))invalid("학번을 확인해 주세요.");return id;}
function validateTime(v){const time=string(v,5);if(!TIME.test(time))invalid("시간을 확인해 주세요.");return time;}
function validatePassword(v){if(typeof v!=="string"||v.length<10||v.length>100)invalid("비밀번호는 10~100자 사이로 입력해 주세요.");return v;}
async function isTeacher(uid){return Boolean(uid&&(await db.doc("admins/"+uid).get()).exists);}
async function assertTeacher(request){if(!request.auth||!(await isTeacher(request.auth.uid)))unauthorized();}
const hash=value=>crypto.createHash("sha256").update(value).digest("hex");
const safeEqual=(a,b)=>{if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;return crypto.timingSafeEqual(Buffer.from(a),Buffer.from(b));};
const byDateTime=(a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.studentId.localeCompare(b.studentId);
exports.createStudentInvite=onCall(options,async req=>{
  await assertTeacher(req);
  const studentId=validatedId(req.data?.studentId),name=string(req.data?.studentName,30),classNo=string(req.data?.classNo,2);
  if(!name||!/^[0-9]{1,2}$/.test(classNo))invalid("이름과 반을 확인해 주세요.");
  const activationCode=crypto.randomBytes(20).toString("hex");
  const expiresAt=Timestamp.fromMillis(Date.now()+30*86400000);
  await db.doc("invites/"+studentId).set({studentId,studentName:name,classNo,
    codeHash:hash(activationCode),status:"ready",createdAt:FieldValue.serverTimestamp(),expiresAt});
  return {activationCode,expiresAt:expiresAt.toDate().toISOString()};
});
exports.activateStudent=onCall({...options,memory:"256MiB"},async req=>{
  const studentId=validatedId(req.data?.studentId);
  const code=string(req.data?.activationCode,120);
  const password=validatePassword(req.data?.password);
  const inviteRef=db.doc("invites/"+studentId);
  const token=crypto.randomBytes(16).toString("hex");
  const now=Date.now();
  // Claim the one-time code in a Firestore transaction to prevent parallel redemptions.
  let invite;
  await db.runTransaction(async tx=>{
    const snap=await tx.get(inviteRef);
    if(!snap.exists)throw new HttpsError("failed-precondition","인증코드를 확인해 주세요.");
    const data=snap.data();
    if(data.status!=="ready"||!data.expiresAt||data.expiresAt.toMillis()<now||
      !safeEqual(hash(code),data.codeHash))
      throw new HttpsError("failed-precondition","인증코드가 틀리거나 만료되었습니다.");
    invite=data;
    tx.update(inviteRef,{status:"redeeming",reservationToken:token,reservedAt:FieldValue.serverTimestamp()});
  });
  let uid=null,created=false;
  try{
    const secretRef=db.doc("studentSecrets/"+studentId);
    const previous=await secretRef.get();
    if(previous.exists){uid=previous.data().uid;await userAuth.updateUser(uid,{displayName:invite.studentName});}
    else{const user=await userAuth.createUser({displayName:invite.studentName});uid=user.uid;created=true;}
    const salt=crypto.randomBytes(32).toString("hex");
    const passwordHash=await derivePassword(password,salt);
    await db.doc("students/"+uid).set({studentId,name:invite.studentName,classNo:invite.classNo,
      updatedAt:FieldValue.serverTimestamp()},{merge:true});
    await secretRef.set({uid,salt,passwordHash,failedLogins:0,lockUntil:null,updatedAt:FieldValue.serverTimestamp()});
    await inviteRef.update({status:"redeemed",redeemedAt:FieldValue.serverTimestamp(),codeHash:FieldValue.delete(),reservationToken:FieldValue.delete()});
    if(!created)await userAuth.revokeRefreshTokens(uid);
    return {ok:true};
  }catch(error){
    if(created && uid){try{await userAuth.deleteUser(uid);}catch(_ignore){}}
    await db.runTransaction(async tx=>{
      const snap=await tx.get(inviteRef);
      if(snap.exists&&snap.data().reservationToken===token)tx.update(inviteRef,{status:"ready",reservationToken:FieldValue.delete()});
    }).catch(()=>{});
    if(error instanceof HttpsError)throw error;
    throw new HttpsError("internal","계정 설정에 실패했습니다. 선생님에게 문의해 주세요.");
  }
});
// Authenticate student ID/password only on the server; Firebase Auth receives a custom token.
// A raw student password is never stored or published.
exports.studentLogin=onCall(options,async req=>{
  const studentId=validatedId(req.data?.studentId);
  const password=validatePassword(req.data?.password);
  const ref=db.doc("studentSecrets/"+studentId),snap=await ref.get();
  // Avoid disclosing whether a specific ID exists.
  if(!snap.exists){
    await derivePassword(password,"unknown-user-dummy-salt");
    throw new HttpsError("unauthenticated","학번 또는 비밀번호를 확인해 주세요.");
  }
  const secret=snap.data();
  if(secret.lockUntil&&secret.lockUntil.toMillis()>Date.now())
    throw new HttpsError("resource-exhausted","로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.");
  const actual=await derivePassword(password,secret.salt);
  if(!safeEqual(actual,secret.passwordHash)){
    const count=(secret.failedLogins||0)+1;
    await ref.update({failedLogins:count,lockUntil:count>=5?Timestamp.fromMillis(Date.now()+15*60000):null});
    throw new HttpsError("unauthenticated","학번 또는 비밀번호를 확인해 주세요.");
  }
  await ref.update({failedLogins:0,lockUntil:null});
  const token=await userAuth.createCustomToken(secret.uid);
  return {token};
});
exports.myBookings=onCall(options,async req=>{
  if(!req.auth)throw new HttpsError("unauthenticated","로그인이 필요합니다.");
  const student=(await db.doc("students/"+req.auth.uid).get());
  if(!student.exists)unauthorized();
  const id=student.data().studentId;
  const snapshot=await db.collection("bookings").where("studentId","==",id).get();
  return {student:{name:student.data().name,classNo:student.data().classNo},
    bookings:snapshot.docs.map(x=>({id:x.id,...x.data()})).sort(byDateTime).map(({id,date,time,round,status})=>({id,date,time,round,status}))};
});
exports.teacherBookings=onCall(options,async req=>{
  await assertTeacher(req);
  const s=await db.collection("bookings").get();
  return {bookings:s.docs.map(d=>({id:d.id,...d.data()})).map(b=>({
    id:b.id,date:b.date,time:b.time,studentId:b.studentId,studentName:b.studentName,
    round:b.round,status:b.status,classNo:b.classNo||""
  })).sort(byDateTime)};
});
exports.saveBooking=onCall(options,async req=>{
  await assertTeacher(req);
  const data=req.data||{};
  const id=validatedId(data.studentId),studentName=string(data.studentName,30);
  if(!studentName)invalid("학생 이름이 필요합니다.");
  const date=validatedDate(string(data.date,10)),time=validateTime(data.time);
  const round=string(data.round,3),status=string(data.status,3);
  if(!rounds.has(round)||!statuses.has(status))invalid("상담 차수와 상태를 확인해 주세요.");
  const bookingId=string(data.bookingId,100);
  if(bookingId&&!/^[A-Za-z0-9_-]{5,100}$/.test(bookingId))invalid("예약 번호가 잘못되었습니다.");
  const monthItems=await db.collection("bookings").where("date","==",date).get();
  const existing=monthItems.docs.filter(d=>d.id!==bookingId && d.data().time===time&&d.data().status!=="취소");
  if(status!=="취소"){
    const firstCount=existing.filter(d=>d.data().round==="1차").length;
    const secondCount=existing.filter(d=>d.data().round==="2차").length;
    if((round==="2차"&&existing.length)||(round==="1차"&&(firstCount>=2||secondCount>0)))
      throw new HttpsError("failed-precondition","같은 시간대의 예약 정원이 찼습니다.");
  }
  // Reusing an existing ID is permitted only for a valid existing booking.
  const ref=bookingId?db.doc("bookings/"+bookingId):db.collection("bookings").doc();
  if(bookingId&&!(await ref.get()).exists)throw new HttpsError("not-found","수정할 예약을 찾지 못했습니다.");
  await ref.set({date,time,studentId:id,studentName,round,status,
    updatedAt:FieldValue.serverTimestamp()},{merge:true});
  await db.doc("slots/"+date+"_"+time.replace(":","")).set({date,time,enabled:true,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  return {ok:true,id:ref.id};
});
exports.publicCalendar=onCall(options,async req=>{
  const from=validatedDate(string(req.data?.from,10)),to=validatedDate(string(req.data?.to,10));
  const days=(Date.parse(to+"T00:00:00Z")-Date.parse(from+"T00:00:00Z"))/86400000;
  if(days<0||days>35)invalid("한 달 범위만 조회할 수 있습니다.");
  const [bookings,slots]=await Promise.all([
    db.collection("bookings").where("date",">=",from).where("date","<=",to).get(),
    db.collection("slots").where("date",">=",from).where("date","<=",to).get()
  ]);
  const map=new Map();
  const get=(date,time)=>{const key=date+"_"+time;if(!map.has(key))map.set(key,{date,time,firstRound:0,secondRound:0,reserved:0,completed:0,isFull:false});return map.get(key);};
  slots.forEach(doc=>{if(doc.data().enabled)get(doc.data().date,doc.data().time);});
  bookings.forEach(doc=>{
    const b=doc.data();if(b.status==="취소")return;
    const slot=get(b.date,b.time);
    if(b.round==="1차")slot.firstRound++;else slot.secondRound++;
    if(b.status==="완료")slot.completed++;else slot.reserved++;
  });
  const result=[...map.values()].map(v=>({...v,isFull:v.secondRound>0||v.firstRound>=2})).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  return {slots:result};
});
exports.initialize2026Slots=onCall(options,async req=>{
  await assertTeacher(req);
  const days=["2026-10-22","2026-10-27","2026-10-28","2026-10-29","2026-11-03","2026-11-04","2026-11-05","2026-11-10","2026-11-11","2026-11-12"];
  const batch=db.batch();let count=0;
  for(const date of days){
    const wd=new Date(date+"T12:00:00Z").getUTCDay();
    const times=(wd===3?["09:00","10:00","11:40","11:50","12:50","13:50"]:wd===2?["10:00","11:40","11:50","12:50","13:50","14:50"]:["10:00","11:40","11:50","12:50","13:50"]);
    for(const time of times){const ref=db.doc("slots/"+date+"_"+time.replace(":",""));batch.set(ref,{date,time,enabled:true},{merge:true});count++;}
  }
  await batch.commit();return {created:count};
});
