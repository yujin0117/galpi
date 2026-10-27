/* GALPI 상담표 내보내기. 교사용 데이터는 서버에 전송하지 않고 이 기기에서만 렌더링합니다. */
(() => {
 "use strict";
 const ONE_DAY=86400000;
 const KOREAN_FONT='"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif';
 const colors={
  ink:"#193448", navy:"#193a51",line:"#dbe6e5",muted:"#73838a",green:"#dcf4e6",
  greenInk:"#246b50",blue:"#e6f1ff",blueInk:"#305c89",
  purple:"#efe7fc",purpleInk:"#6e5299",paper:"#ffffff",empty:"#f5f8f7"
 };
 const dateLabel=d=>{
  const date=new Date(d+"T00:00:00Z");
  const day=Number.isNaN(date.getTime())?"":("일월화수목금토")[date.getUTCDay()];
  return d.slice(5).replace("-","/")+"("+day+")";
 };
 const fileDate=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 function periods(model){
  const all=[...new Set([...Object.keys(model.schedules),...model.slots.map(s=>s.date),...model.entries.map(s=>s.date)])].filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
  const period=model.period;
  const dates=all.filter(d=>period==="oct"?d<"2026-11-01":period==="novEarly"?d>="2026-11-03"&&d<="2026-11-05":period==="novLate"?d>="2026-11-10":true);
  const allTimes=[...new Set([...model.times,...model.slots.map(s=>s.time),...model.entries.map(s=>s.time)])].filter(t=>/^\d{2}:\d{2}$/.test(t)).sort();
  const times=allTimes.filter(time=>dates.some(date=>model.slots.some(s=>s.date===date&&s.time===time)||model.entries.some(e=>e.date===date&&e.time===time)));
  return {dates,times};
 }
 const itemsAt=(entries,date,time)=>entries.filter(e=>e.date===date&&e.time===time&&e.status!=="취소").sort((a,b)=>a.round.localeCompare(b.round,"ko")||a.name.localeCompare(b.name,"ko"));
 const isScheduled=(slots,date,time)=>slots.some(e=>e.date===date&&e.time===time);
 const nameLine=e=>e.name+(e.classNo?" · "+e.classNo+"반":"")+" ("+e.round+")"+(e.status==="완료"?" ✓":"");
 const tokenType=e=>e.status==="완료"?"complete":e.round==="2차"?"second":"first";

 const el=(tag,className="",value)=>{const node=document.createElement(tag);if(className)node.className=className;if(value!==undefined)node.textContent=value;return node;};
 function createPrintSheet(model){
  const {dates,times}=periods(model);
  if(!dates.length||!times.length)throw Error("내보낼 일정이 없습니다.");
  const sheet=el("section","galpi-print-sheet");
  sheet.id="galpiPrintDocument";
  const h=el("header","galpi-print-header");
  const inner=el("div");inner.append(el("div","galpi-print-brand","GALPI / CLASSROOM MANAGEMENT"),el("h1","","심화탐구 상담 일정표"));
  const periodText=model.period==="all"?"전체 일정":dates[0].slice(5).replace("-","/")+" – "+dates.at(-1).slice(5).replace("-","/");
  inner.append(el("p","","2026학년도 · "+periodText+" · 2교무실 유진쌤 자리"));
  const privateLabel=el("div","galpi-private-mark","교사용 · 학생 실명 포함");
  h.append(inner,privateLabel);sheet.append(h);
  const legend=el("div","galpi-print-legend","● 1차 (5분)　● 2차 (10분)　● 상담 완료　 |　"+"생성일 "+fileDate()+"  ·  외부 공유 금지");
  sheet.append(legend);
  const table=el("table","galpi-print-table"),head=el("thead"),hr=el("tr");
  hr.append(el("th","","시간"));
  dates.forEach(date=>hr.append(el("th","",dateLabel(date))));
  head.append(hr);table.append(head);
  const body=el("tbody");
  for(const time of times){
   const tr=el("tr");tr.append(el("th","",time));
   for(const date of dates){
    const td=el("td");
    const current=itemsAt(model.entries,date,time),scheduled=isScheduled(model.slots,date,time);
    if(!current.length)td.append(el("div","galpi-print-empty",scheduled?"예약 없음":"—"));
    else current.forEach(e=>td.append(el("div","galpi-print-booking "+tokenType(e),nameLine(e))));
    tr.append(td);
   }
   body.append(tr);
  }
  table.append(body);sheet.append(table);
  const footer=el("p","galpi-print-footer","이 문서에는 학생 개인정보가 포함되어 있습니다. 공개 GitHub 저장소·학생 단체방에 업로드하지 마세요.");
  sheet.append(footer);
  return sheet;
 }
 function printPDF(model){
  const old=document.getElementById("galpiPrintDocument");if(old)old.remove();
  const sheet=createPrintSheet(model);document.body.append(sheet);
  let removed=false;
  const clear=()=>{if(!removed){removed=true;sheet.remove();window.removeEventListener("afterprint",clear);}};
  window.addEventListener("afterprint",clear);
  try{window.print();}catch(err){clear();throw err;}
 }
 function roundedRect(ctx,x,y,w,h,r,fill){
  ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();
 }
 function fitText(ctx,value,maxWidth){
  const text=String(value);
  if(ctx.measureText(text).width<=maxWidth)return text;
  let candidate=text;while(candidate.length>1&&ctx.measureText(candidate+"…").width>maxWidth)candidate=candidate.slice(0,-1);
  return candidate+"…";
 }
 function drawText(ctx,text,x,y,maxWidth,fill,font,align="left"){
  ctx.fillStyle=fill;ctx.font=font;ctx.textAlign=align;ctx.fillText(fitText(ctx,text,maxWidth),x,y);
 }
 function makeCanvas(model){
  const {dates,times}=periods(model);
  if(!dates.length||!times.length)throw Error("내보낼 상담 일정이 없습니다.");
  if(dates.length>15||times.length>14)throw Error("날짜 또는 시간대가 너무 많습니다. 기간을 나누어 저장해 주세요.");
  const W=3508,H=2480,margin=94,top=310,bottom=135;
  const usableH=H-top-bottom;
  const headerH=105,rowH=Math.min(250,(usableH-headerH)/times.length);
  const col0=164,colW=(W-2*margin-col0)/dates.length;
  const canvas=document.createElement("canvas");
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext("2d");
  if(!ctx)throw Error("이 브라우저에서 PNG를 그릴 수 없습니다.");
  ctx.fillStyle=colors.paper;ctx.fillRect(0,0,W,H);
  drawText(ctx,"GALPI / CLASSROOM MANAGEMENT",margin,95,1900,"#287d62","bold 27px "+KOREAN_FONT);
  drawText(ctx,"심화탐구 상담 일정표",margin,178,2050,colors.ink,"bold 72px "+KOREAN_FONT);
  const range=model.period==="all"?"전체 일정":dateLabel(dates[0])+" – "+dateLabel(dates.at(-1));
  drawText(ctx,"2026학년도  ·  "+range+"  ·  2교무실 유진쌤 자리",margin,242,2200,colors.muted,"34px "+KOREAN_FONT);
  roundedRect(ctx,W-810,112,710,86,21,"#fff0eb");
  drawText(ctx,"교사용 · 학생 실명 포함",W-455,168,640,"#a34b31","bold 35px "+KOREAN_FONT,"center");
  drawText(ctx,"파랑 1차 (5분)    보라 2차 (10분)    초록 상담 완료",margin,293,W-200,colors.muted,"bold 28px "+KOREAN_FONT);
  ctx.fillStyle=colors.navy;ctx.fillRect(margin,top,W-2*margin,headerH);
  drawText(ctx,"시간",margin+col0/2,top+68,col0-16,"#fff","bold 33px "+KOREAN_FONT,"center");
  dates.forEach((date,i)=>{
   const x=margin+col0+i*colW;
   ctx.strokeStyle="rgba(255,255,255,.22)";
   ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,top+headerH);ctx.stroke();
   drawText(ctx,dateLabel(date),x+colW/2,top+68,colW-16,"#fff","bold "+(dates.length>=10?27:33)+"px "+KOREAN_FONT,"center");
  });
  times.forEach((time,j)=>{
   const y=top+headerH+j*rowH;
   ctx.fillStyle="#f3f7f6";ctx.fillRect(margin,y,col0,rowH);
   drawText(ctx,time,margin+col0/2,y+rowH/2+12,col0-12,colors.ink,"bold 34px "+KOREAN_FONT,"center");
   dates.forEach((date,i)=>{
    const x=margin+col0+i*colW;
    const items=itemsAt(model.entries,date,time);
    const scheduled=isScheduled(model.slots,date,time);
    ctx.fillStyle="#fff";ctx.fillRect(x,y,colW,rowH);
    if(!items.length){
     drawText(ctx,scheduled?"예약 없음":"—",x+colW/2,y+rowH/2+9,colW-18,colors.muted,"24px "+KOREAN_FONT,"center");
    }else{
     const len=items.length,innerGap=9,marginCell=10;
     const maxH=(rowH-2*marginCell-(len-1)*innerGap)/len;
     items.forEach((e,k)=>{
      const bx=x+marginCell,by=y+marginCell+k*(maxH+innerGap),bw=colW-2*marginCell;
      const type=tokenType(e);
      roundedRect(ctx,bx,by,bw,maxH,11,type==="complete"?colors.green:type==="second"?colors.purple:colors.blue);
      const ink=type==="complete"?colors.greenInk:type==="second"?colors.purpleInk:colors.blueInk;
      const nameFont=Math.min(33,Math.max(22,colW/10));
      drawText(ctx,e.name,bx+bw/2,by+maxH/2+nameFont*0.16,bw-16,ink,"bold "+nameFont+"px "+KOREAN_FONT,"center");
      const sub=(e.classNo?e.classNo+"반 · ":"")+e.round+(e.status==="완료"?" · 완료":"");
      drawText(ctx,sub,bx+bw/2,by+maxH/2+nameFont*0.16+Math.min(42,maxH*.28),bw-18,ink,"bold "+Math.min(25,Math.max(17,colW/13))+"px "+KOREAN_FONT,"center");
     });
    }
    ctx.strokeStyle=colors.line;ctx.lineWidth=2;ctx.strokeRect(x,y,colW,rowH);
   });
   ctx.strokeStyle=colors.line;ctx.lineWidth=2;ctx.strokeRect(margin,y,col0,rowH);
  });
  const finalY=top+headerH+times.length*rowH;
  drawText(ctx,"생성일 "+fileDate()+"  |  개인정보 포함 · GitHub 및 공개 학생 화면에 업로드 금지",margin,Math.min(H-60,finalY+72),W-2*margin,colors.muted,"29px "+KOREAN_FONT);
  return canvas;
 }
 async function savePNG(model){
  if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  const canvas=makeCanvas(model);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
  if(!blob)throw Error("이미지 저장에 실패했습니다.");
  const url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download="GALPI_교사용_상담표_비공개_"+fileDate()+".png";
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
 }
 window.GALPIConsultationExporter={savePNG,printPDF};
})();
