/* Editable learning graphics: shared SVG primitives, no generated bitmap assets.
   Text, values and learning state stay in the HTML owned by each activity. */
(() => {
  'use strict';
  const c = Object.freeze({
    ink:'var(--diagram-ink,#355B50)', green:'var(--diagram-green,#6CA18B)',
    blue:'var(--diagram-blue,#87AEC8)', coral:'var(--diagram-coral,#DA967E)',
    gold:'var(--diagram-gold,#E6BF75)', violet:'var(--diagram-violet,#ADA2CE)',
    soft:'var(--diagram-soft,#EAF3EE)', paper:'var(--learning-surface,#FFFFFF)'
  });
  const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const group=body=>`<g fill="none" stroke="${c.ink}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
  const rect=(x,y,w,h,fill,rx=4)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
  const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  const factory=`<path d="M48 130V79l35 18V73l35 18V51h22v79Z" fill="${c.blue}"/><path d="M140 130V90h48v40" fill="${c.gold}"/><path d="M62 108h12m18 0h12m18 0h8" stroke="${c.paper}" stroke-width="8"/><path d="M154 106h18v24"/>`;
  const shirt=`<path d="m96 43 31 12 31-12 34 25-20 24-14-11v53H96V81L82 92 62 68Z" fill="${c.coral}"/><path d="M113 50q14 23 28 0"/><path d="M112 112h30" stroke="${c.paper}" stroke-width="6"/>`;
  const ship=`<path d="M42 105h172l-26 32H71Z" fill="${c.blue}"/>${rect(67,80,35,25,c.gold,1)}${rect(105,80,35,25,c.coral,1)}${rect(89,53,35,26,c.green,1)}${rect(145,80,24,25,c.gold,1)}<path d="M179 105V67h23v38m-13-38V51" fill="${c.paper}"/><path d="M43 148q16-7 32 0t32 0t32 0t32 0t32 0" stroke="${c.blue}"/>`;
  const voyage=`<path d="M44 112h169l-25 28H72Z" fill="${c.blue}"/><path d="M119 112V28m45 84V47"/><path d="M124 35v57h35q7-40-35-57Z" fill="${c.gold}"/><path d="M114 42v50H80q-5-34 34-50Zm55 13v37h26q4-28-26-37Z" fill="${c.paper}"/><path d="M47 150q16-6 32 0t32 0t32 0t32 0t32 0" stroke="${c.blue}"/>`;
  const person=(x,y,fill)=>`${circle(x,y,11,c.paper)}<path d="M${x-18} 132v-22q18-18 36 0v22Z" fill="${fill}"/>`;
  const ticket=`<path d="M56 57h144v23a13 13 0 0 0 0 26v24H56v-24a13 13 0 0 0 0-26Z" fill="${c.coral}"/><path d="M158 59v69" stroke-dasharray="4 5"/><path d="m98 79 29 15-29 15Z" fill="${c.paper}"/><path d="M175 81v26" stroke="${c.paper}" stroke-width="5"/>`;
  const coin=(x,y,r=24)=>`${circle(x,y,r,c.gold)}<path d="M${x} ${y-13}v26m-10-20h20m-20 8h20m-20-8 5 20 5-12 5 12 5-20" stroke-width="1.6"/>`;
  const drawings=Object.freeze({
    factory, shirt, ship, voyage, ticket,
    cinema:`${rect(44,35,168,88,c.blue,5)}${rect(52,43,152,72,c.paper,2)}<path d="m115 61 31 18-31 18Z" fill="${c.coral}"/>${[66,108,150,192].map(x=>rect(x-12,132,24,15,c.gold,4)).join('')}`,
    work:`<path d="m89 40 19 12h40l19-12 22 89H67Z" fill="${c.blue}"/><path d="M108 52v-8a20 20 0 0 1 40 0v8M99 88h58v26H99Z" fill="${c.paper}"/>${rect(147,101,65,40,c.gold,3)}<path d="m149 104 30 20 30-20"/>`,
    oil:`${rect(111,51,76,84,c.gold,7)}<path d="M111 72h76m-76 42h76M143 40h15v11"/><path d="M149 80q-20 24 0 27t0-27Z" fill="${c.paper}"/><path d="M59 65v66m-12-50h24m-18-44h12v28H53Z" fill="${c.blue}"/>`,
    bank:`<path d="m48 67 80-36 80 36Z" fill="${c.blue}"/><path d="M59 75h138v52H59Z" fill="${c.paper}"/><path d="M78 81v38m33-38v38m33-38v38m33-38v38" stroke="${c.green}" stroke-width="12"/><path d="M48 134h160" stroke-width="6"/>`,
    currency:coin(108,88,43)+rect(153,110,50,18,c.blue,3)+`<path d="M151 134h56"/>`,
    wallet:`${rect(56,64,144,74,c.green,9)}<path d="m68 64 88-29 20 29" fill="${c.gold}"/><path d="M199 85h-43v30h43" fill="${c.paper}"/>${circle(169,100,3,c.ink)}`,
    people:person(72,81,c.blue)+person(183,81,c.coral)+person(127,62,c.green),
    uniform:`<path d="m96 43 31 12 31-12 34 25-20 24-14-11v53H96V81L82 92 62 68Z" fill="${c.blue}"/><path d="m110 49 17 30 17-30M127 80v54" stroke="${c.paper}" stroke-width="4"/><path d="m125 67-6 24 8 10 8-10-6-24Z" fill="${c.gold}"/>`,
    shop:`${rect(57,68,142,68,c.paper,3)}<path d="M48 69h160l-15-30H63Z" fill="${c.coral}"/><path d="m83 40-4 28m37-28-1 28m36-28 2 28m28-28 4 28" stroke="${c.paper}" stroke-width="12"/>${rect(70,86,53,34,c.blue,2)}${rect(145,86,37,50,c.gold,2)}`,
    cotton:`<path d="M128 139V75m0 30-31-19m31 7 29-21" stroke="${c.green}" stroke-width="4"/><path d="M124 119q-32-35-50-18 8 29 50 18m6-21q14-31 42-19-3 28-42 19" fill="${c.green}" stroke="none"/><path d="M105 63c-20 5-23-23-6-30 7-21 31-18 36-2 22-2 31 21 16 32 1 21-32 25-46 0Z" fill="${c.paper}"/>`,
    truck:`${rect(44,54,112,72,c.blue,3)}<path d="M156 80h29l27 28v18h-56Z" fill="${c.gold}"/><path d="M166 89h16l16 17h-32Z" fill="${c.paper}"/>${circle(76,131,13,c.ink)}${circle(183,131,13,c.ink)}${circle(76,131,5,c.paper)}${circle(183,131,5,c.paper)}`,
    bag:`<path d="M74 65h108l12 72H62Z" fill="${c.violet}"/><path d="M101 65V53a27 27 0 0 1 54 0v12"/><path d="m108 101 13 13 25-28" stroke="${c.paper}" stroke-width="5"/>`,
    bottle:`<path d="M113 32h30v20l15 18v67H98V70l15-18Z" fill="${c.blue}"/>${rect(111,26,34,16,c.green,2)}${rect(100,82,56,31,c.paper,1)}<path d="m119 96 9-7 9 7-9 8Z" fill="${c.green}"/>`,
    message:`${rect(91,28,75,113,c.blue,9)}${rect(99,39,59,84,c.paper,3)}<path d="M111 60h36v26h-23l-13 11Z" fill="${c.violet}"/><path d="M118 69h22m-22 8h15" stroke="${c.paper}"/><path d="M120 132h18"/>`,
    certificate:`<path d="M79 28h91l15 18v94H79Z" fill="${c.paper}"/><path d="M170 28v19h15" fill="${c.gold}"/><path d="M96 59h57m-57 13h57m-57 13h35" stroke="${c.blue}" stroke-width="4"/>${circle(149,113,16,c.green)}<path d="m141 113 6 6 11-14" stroke="${c.paper}" stroke-width="3"/>`,
    idea:`<path d="M111 107c-3-24-25-30-19-54 12-38 68-32 71 3 3 23-18 31-21 51Z" fill="${c.gold}"/><path d="M112 111h30m-30 10h30m-26 10h22M127 105V77l-11-12m11 12 12-12M68 61H57m126 0h12M82 31l-7-10m96 10 7-10"/>`,
    tteokbokki:`<path d="M54 89h148q-5 49-74 49T54 89Z" fill="${c.paper}"/><ellipse cx="128" cy="89" rx="74" ry="23" fill="${c.coral}"/><path d="m82 82 20 10m10-22 14 14m8 10 23-5m6-13 19 12m-75 10 14 10" stroke="${c.gold}" stroke-width="10"/><path d="m84 57 23-30m34 31 24-31"/>`,
    gimbap:`<ellipse cx="128" cy="134" rx="88" ry="11" fill="${c.soft}" stroke="none"/>`+[72,128,184].map((x,i)=>`<g transform="translate(${x} ${101-i%2*12})">${circle(0,0,25,c.green)}${circle(0,0,19,c.paper)}${rect(-9,-9,9,11,c.coral,0)}${rect(2,-6,9,13,c.gold,0)}${rect(-8,5,9,7,c.green,0)}</g>`).join(''),
    lunch:`${rect(46,55,164,84,c.blue,11)}${rect(55,64,88,65,c.paper,6)}${rect(153,65,47,27,c.green,3)}${rect(153,102,47,27,c.coral,3)}`,
    pollution:factory+`<path d="M128 44q-15-11-3-22 13-12 25-3 23-9 28 10 23 17-1 22" fill="${c.violet}" stroke="none"/>`,
    flood:`<path d="M49 111V74l31-23 30 23v37m28 0V74l30-23 30 23v37" fill="${c.paper}"/><path d="m42 75 38-27 37 27m14 0 37-27 37 27" stroke="${c.coral}" stroke-width="5"/><path d="M28 124q17-10 34 0t34 0t34 0t34 0t34 0t34 0m-204 13q17-10 34 0t34 0t34 0t34 0t34 0t34 0" stroke="${c.blue}" stroke-width="6"/>`,
    protected:`<path d="M49 105V74l31-23 30 23v31m28 0V74l30-23 30 23v31" fill="${c.paper}"/><path d="m42 75 38-27 37 27m14 0 37-27 37 27" stroke="${c.coral}" stroke-width="5"/>${rect(27,110,202,15,c.green,1)}<path d="M28 140q17-8 34 0t34 0t34 0t34 0t34 0t34 0" stroke="${c.blue}" stroke-width="5"/>`
  });
  function scene(kind='factory',label='') {
    return `<svg class="learning-scene-art hl-icon" viewBox="0 0 256 168" preserveAspectRatio="xMidYMid meet" ${label?`role="img" aria-label="${esc(label)}"`:'aria-hidden="true"'}>${group(drawings[kind]||drawings.factory)}</svg>`;
  }
  function good(i=0,className='') {
    const body=i===0?`<path d="m10 19 22-11 22 11v27L32 57 10 46Z" fill="${c.gold}"/><path d="m10 19 22 12 22-12M32 31v26M21 14l22 11v12"/>`:`${rect(12,17,40,37,c.blue,4)}<path d="m12 17 7-9h26l7 9M23 8v9m18-9v9"/><path d="m23 35 7 7 12-14" stroke="${c.paper}" stroke-width="3"/>`;
    return `<svg class="learning-good ${esc(className)}" viewBox="0 0 64 64" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${group(body)}</svg>`;
  }
  function countryScene(country,hero=false) {
    // Both fictional countries use the same production symbols. Their costs come from HTML data.
    const color=country?c.blue:c.green;
    const body=hero?`<g transform="translate(42 -4) scale(1.05)">${ship}</g>`:`${circle(81,89,53,c.paper)}<path d="M28 89h106M81 36q-36 53 0 106m0-106q36 53 0 106M37 63h88M37 115h88" stroke="${color}"/><path d="M158 130V80l32 17V76l31 18V53h20v77Z" fill="${color}"/><path d="M174 112h12m16 0h12m16 0h6" stroke="${c.paper}" stroke-width="8"/>${rect(254,99,36,31,c.gold,3)}${rect(276,68,31,28,c.violet,3)}`;
    return `<svg class="tc-scene ${hero?'tc-harbor':''}" viewBox="0 0 340 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${group(body)}</svg>`;
  }
  function world(i=0){return countryScene(i).replace('class="tc-scene "','class="learning-world"');}
  function pathway(items,connectors=[]) {
    return `<ol class="studio-pathway" aria-label="개념의 연결">${items.map(([kind,title,copy],i)=>`<li>${scene(kind)}<div><strong>${title}</strong>${copy?`<p>${copy}</p>`:''}</div>${i<items.length-1?`<span class="studio-path-connector" aria-hidden="true">${connectors[i]||'→'}</span>`:''}</li>`).join('')}</ol>`;
  }
  window.GalpiLearningArt=Object.freeze({world,good,scene,pathway,country:countryScene});
})();
