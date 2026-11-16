'use strict';
/* ================= ÓRBITA ================= */
const RANKS=[[0,'Cadete'],[1500,'Navegante'],[4000,'Piloto'],[8000,'Especialista'],[14000,'Comandante'],[22000,'Veterano orbital'],[32000,'Explorador lunar'],[45000,'Leyenda lunar']];
const SKINS=[{k:'verde',h:'#34E39A',n:'Verde misión',req:0},{k:'aurora',h:'#5FD3F3',n:'Aurora',req:1},{k:'solar',h:'#F7D154',n:'Solar',req:2},{k:'nebulosa',h:'#A28CFF',n:'Nebulosa',req:3},{k:'nova',h:'#FF6B7D',n:'Nova',req:5},{k:'hielo',h:'#D6E6FF',n:'Hielo lunar',crate:true},{k:'plasma',h:'#FF8A3D',n:'Plasma',crate:true}];
const ROUTE=[
 {n:'Tierra',f:'La Estación Espacial Internacional tiene tripulación sin interrupción desde el 2 de noviembre de 2000.',s:'NASA'},
 {n:'Lanzamiento',f:'Para mantenerse en órbita, la ISS viaja a unos 28,000 km/h.',s:'NASA'},
 {n:'Órbita baja',f:'La ISS da una vuelta a la Tierra cada 90 minutos: su tripulación ve unos 16 amaneceres al día.',s:'NASA'},
 {n:'Sueño en órbita',f:'En la ISS, los astronautas durmieron en promedio 6.1 horas por noche (21 astronautas medidos con actigrafía).',s:'NASA · reporte de evidencia de sueño'},
 {n:'Cinturones de Van Allen',f:'Son zonas de partículas atrapadas por el campo magnético de la Tierra; las misiones Apolo los cruzaron rápido para limitar la dosis.',s:'NASA'},
 {n:'Inyección translunar',f:'Apolo 11 despegó el 16 de julio de 1969 y entró en órbita lunar tres días después.',s:'NASA'},
 {n:'Espacio profundo',f:'Una señal de radio tarda cerca de 1.3 segundos en llegar de la Luna a la Tierra.',s:'NASA'},
 {n:'Escudo de radiación',f:'NASA limita la dosis de radiación de toda la carrera de un astronauta a 600 mSv.',s:'NASA-STD-3001'},
 {n:'Punto medio',f:'La Luna está en promedio a 384,400 km de la Tierra.',s:'NASA'},
 {n:'Esfera lunar',f:'En la Luna pesas cerca de una sexta parte de lo que pesas en la Tierra.',s:'NASA'},
 {n:'Órbita lunar',f:'Apolo 8, en diciembre de 1968, fue la primera misión con tripulación en orbitar la Luna.',s:'NASA'},
 {n:'Descenso',f:'El módulo Eagle de Apolo 11 alunizó el 20 de julio de 1969 en el Mar de la Tranquilidad.',s:'NASA'},
 {n:'Polo sur lunar',f:'NASA eligió la región del polo sur lunar para Artemis por el posible hielo de agua en cráteres en sombra permanente.',s:'NASA'},
 {n:'Luna',f:'Doce astronautas de NASA caminaron sobre la Luna entre 1969 y 1972.',s:'NASA'},
];
const BADGES=[['first','Primer contacto','Tu primer turno oficial'],['streak3','Constancia','3 días seguidos'],['streak7','Semana perfecta','7 días seguidos'],['streak30','Rutina de hierro','30 días seguidos'],['clean','Mano firme','Turno oficial sin anticipaciones'],['gold','Cápsula dorada','Consigue una cápsula ×3'],['combo10','Hiperfoco','Llega a combo ×10'],['reflex','Reflejos','5 respuestas de menos de 250 ms'],['dodge','Esquiva','Esquiva 5 meteoros en arcade'],['collector','Coleccionista','Reúne 8 postales'],['moon','Alunizaje','Completa la ruta a la Luna'],['crew','Tripulación unida','Los 6 juegan el mismo día']];
const MIS={oficial:{t:'Completa tu turno oficial',goal:1,xp:150},combo8:{t:'Logra un combo de ×8',goal:8,xp:120},gold2:{t:'Consigue 2 cápsulas doradas',goal:2,xp:120},fast5:{t:'5 respuestas de menos de 250 ms en una partida',goal:5,xp:120},arcade2:{t:'Juega 2 partidas de arcade',goal:2,xp:100},dodge4:{t:'Esquiva 4 meteoros rojos',goal:4,xp:120},score:{t:'Suma 15,000 puntos en una partida',goal:15000,xp:120}};
const SEED={grover:{xp:16400,runs:118,bo:21400,ba:13200,st:12,pl:1,rt:9,mc:14,fa:212,b:['first','streak3','streak7','clean','gold','reflex','collector']},
 vale:{xp:24800,runs:142,bo:23800,ba:14900,st:20,pl:1,rt:12,mc:16,fa:205,b:['first','streak3','streak7','clean','gold','combo10','reflex','collector']},
 cam:{xp:7200,runs:61,bo:17600,ba:9800,st:6,pl:0,rt:5,mc:9,fa:231,b:['first','streak3','clean','gold']},
 payan:{xp:41000,runs:196,bo:27100,ba:17400,st:30,pl:1,rt:13,mc:22,fa:188,b:['first','streak3','streak7','streak30','clean','gold','combo10','reflex','dodge','collector','moon']},
 david:{xp:9800,runs:80,bo:19200,ba:11800,st:4,pl:1,rt:6,mc:11,fa:226,b:['first','streak3','gold']},
 carlos:{xp:2100,runs:24,bo:12100,ba:7200,st:0,pl:0,rt:2,mc:6,fa:259,b:['first']}};
const lin=(b,d)=>Array.from({length:d+1},(_,i)=>Math.round(b*i/d));
const playedToday=g=>g.days.includes(DAY);
function game(c=cur()){let g=S.games[c.id];if(!g){const o=SEED[c.id]||{xp:0,runs:0,bo:0,ba:0,st:0,pl:0,rt:0,mc:0,fa:300,b:[]},end=o.pl?DAY:DAY-1,days=[];for(let d=end-o.st+1;d<=end;d++)days.push(d);
  g=S.games[c.id]={xp:o.xp,runs:o.runs,best:{oficial:o.bo,arcade:o.ba},tl:{oficial:lin(o.bo,180),arcade:lin(o.ba,60)},streak:o.st,shields:Math.min(3,Math.floor(o.st/7)),days,badges:o.b.slice(),skin:'verde',owned:['verde'],route:o.rt,maxCombo:o.mc,fastest:o.fa,mday:null}}
  if(g.mday!==DAY){const R=rng(DAY*31+CREW.indexOf(c)),pool=['combo8','gold2','fast5','arcade2','dodge4','score'],a=pool.splice(Math.floor(R()*pool.length),1)[0],b=pool[Math.floor(R()*pool.length)];
    g.mday=DAY;g.mis=['oficial',a,b];g.mprog={oficial:playedToday(g)?1:0};g.mdone=playedToday(g)?['oficial']:[];g.crate=null;g.arcadeToday=0}
  return g}
const rankOf=xp=>{let i=0;RANKS.forEach((r,j)=>{if(xp>=r[0])i=j});return i};
const skinCol=g=>(SKINS.find(s=>s.k===g.skin)||SKINS[0]).h;
function emblem(i,col,size=78){const hex=Array.from({length:6},(_,k)=>{const a=-Math.PI/2+k*Math.PI/3;return[40+33*Math.cos(a),40+33*Math.sin(a)]}).map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ');
  const chev=Array.from({length:Math.min(i+1,4)},(_,k)=>`<path d="M27 ${54-k*7} L40 ${47-k*7} L53 ${54-k*7}" fill="none" stroke="${col}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const stars=i>=4?Array.from({length:i-3},(_,k)=>`<circle cx="${40+(k-(i-4)/2)*9}" cy="22" r="2.6" fill="${col}"/>`).join(''):'';
  return `<svg width="${size}" height="${size}" viewBox="0 0 80 80" aria-hidden="true"><defs><radialGradient id="emg" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="${col}" stop-opacity=".35"/><stop offset="1" stop-color="${col}" stop-opacity=".04"/></radialGradient></defs><polygon points="${hex}" fill="url(#emg)" stroke="${col}" stroke-width="2.5"/>${chev}${stars}</svg>`}
const capsuleSVG=open=>`<svg viewBox="0 0 70 70" aria-hidden="true"><ellipse cx="35" cy="60" rx="22" ry="4" fill="#000" opacity=".45"/><rect x="14" y="28" width="42" height="30" rx="8" fill="#2A2410" stroke="#F7D154" stroke-width="2.5"/><path d="M14 40h42" stroke="#F7D154" stroke-width="1.6" opacity=".6"/><g transform="${open?'rotate(-32 11 30)':''}"><rect x="11" y="18" width="48" height="12" rx="5" fill="#3A3214" stroke="#F7D154" stroke-width="2.5"/></g><circle cx="35" cy="47" r="4" fill="#F7D154"/>${open?'<g fill="#F7D154"><circle cx="24" cy="12" r="2"/><circle cx="46" cy="8" r="2.4"/><circle cx="35" cy="4" r="1.6"/></g>':''}</svg>`;
const SHIELD='<svg width="14" height="14" viewBox="0 0 24 24" fill="#5FD3F3"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z"/></svg>';
const FLAME='<svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.4-5.2.2 1.7 1 2.7 2.1 3.2C11 8.5 11 5 12 2z"/></svg>';

/* sonido */
let AC=null;
function snd(f,d=.09,type='sine',v=.13,slide=0){if(!S.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02)}catch(e){}}
const chord=(fs,gap=90)=>fs.forEach((f,i)=>setTimeout(()=>snd(f,.18,'sine',.11),i*gap));
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};

/* hub del juego */
function renderOrbita(keepOverlay){const c=cur(),g=game(c),ri=rankOf(g.xp),nx=RANKS[ri+1],col=skinCol(g),pr=nx?(g.xp-RANKS[ri][0])/(nx[0]-RANKS[ri][0]):1;
  const wk=Array.from({length:7},(_,i)=>DAY-6+i).map(d=>`<div><i class="${g.days.includes(d)?'on':''} ${d===DAY&&!g.days.includes(d)?'td':''}">${g.days.includes(d)?FLAME:''}</i>D${d}</div>`).join('');
  $('#hPilot').innerHTML=`<div class="prow">${emblem(ri,col)}<div style="flex:1;min-width:0;display:grid;gap:6px"><span class="cap">Rango ${ri+1} de ${RANKS.length}</span><h2 style="font-size:24px">${RANKS[ri][1]}</h2><div class="xp"><i style="width:${Math.round(pr*100)}%"></i></div><span class="muted small">${fmt(g.xp)} XP${nx?` · faltan ${fmt(nx[0]-g.xp)} para ${nx[1]}`:' · rango máximo'}</span></div></div>
    <div style="display:grid;gap:10px"><div class="rowb" style="align-items:center"><div class="stl"><svg width="26" height="26" viewBox="0 0 24 24" fill="#FF7A45"><path d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.4-5.2.2 1.7 1 2.7 2.1 3.2C11 8.5 11 5 12 2z"/></svg><span class="num">${g.streak}</span><span class="muted small" style="font-weight:700">día${g.streak===1?'':'s'} seguidos</span></div><span class="shields" title="Un escudo protege tu racha si fallas un día">${SHIELD.repeat(g.shields)} ${g.shields} escudo${g.shields===1?'':'s'}</span></div><div class="wk">${wk}</div></div>`;
  const mrow=k=>{const m=MIS[k],p=Math.min(m.goal,g.mprog[k]||0),dn=g.mdone.includes(k);return `<div class="mrow ${dn?'done':''}"><span class="ck">${dn?'✓':''}</span><div><div>${m.t}</div><div class="pb"><i style="width:${p/m.goal*100}%"></i></div></div><span class="xr">${dn?'Hecho':'+'+m.xp+' XP'}</span></div>`};
  const all=g.mis.every(k=>g.mdone.includes(k));
  $('#hMis').innerHTML=`<div class="rowb"><h3>Misiones de hoy</h3><span class="cap">${g.mdone.length} de 3</span></div><div class="mlst">${g.mis.map(mrow).join('')}</div>
    <div class="crate ${all&&!g.crate?'shake':''}" style="${all?'':'opacity:.6'}">${capsuleSVG(!!g.crate)}<b style="font-size:14px">${g.crate?'Cápsula abierta: <span class="reward">'+esc(g.crate)+'</span>':all?'¡Cápsula de suministros lista!':'Cápsula de suministros'}</b><span class="muted small">${g.crate?'Vuelve mañana por otra.':all?'Ábrela para ganar un premio sorpresa.':'Completa las 3 misiones para abrirla.'}</span>${all&&!g.crate?'<button class="btn go sm" id="crateBtn" type="button">Abrir cápsula</button>':''}</div>`;
  if($('#crateBtn'))$('#crateBtn').onclick=()=>openCrate();
  const played=CREW.filter(x=>playedToday(game(x))).length;
  $('#hRec').innerHTML=`<h3>Tus récords</h3><div class="recs"><div><span class="cap">Turno oficial</span><span class="num">${fmt(g.best.oficial)}</span></div><div><span class="cap">Arcade</span><span class="num">${fmt(g.best.arcade)}</span></div><div><span class="cap">Combo máx.</span><span class="num">×${g.maxCombo}</span></div><div><span class="cap">Más rápida</span><span class="num">${g.fastest} ms</span></div></div>
    <div style="display:grid;gap:8px;border-top:1px solid var(--line);padding-top:14px"><span class="cap">Meta de la tripulación hoy</span><div class="team">${CREW.map(x=>{const on=playedToday(game(x));return `<i class="${on?'on':''}" title="${esc(x.n)}" ${on?'':`style="color:${x.col}"`}>${x.n[0]}</i>`}).join('')}</div><span class="muted small">${played===CREW.length?'¡Los 6 completaron su turno!':`${played} de ${CREW.length}. Se cuenta quién jugó, nunca los puntajes.`}</span></div>`;
  drawRoute(g,col);$('#postalNow').innerHTML=postalHTML(Math.min(S.logSel??g.route,g.route));
  $('#logN').textContent=`${g.route+1} de ${ROUTE.length} postales`;
  $('#logg').innerHTML=ROUTE.map((r,i)=>i<=g.route?`<button class="lc" type="button" data-i="${i}" aria-pressed="${(S.logSel??g.route)===i}"><span class="n">${String(i+1).padStart(2,'0')}</span>${esc(r.n)}</button>`:`<button class="lc" type="button" disabled><span class="n">${String(i+1).padStart(2,'0')}</span>Bloqueada</button>`).join('');
  $$('#logg .lc:not(:disabled)').forEach(b=>b.onclick=()=>{S.logSel=+b.dataset.i;renderOrbita(true)});
  $('#badgeN').textContent=`${g.badges.length} de ${BADGES.length}`;
  $('#badges').innerHTML=BADGES.map(([k,n,d])=>{const on=g.badges.includes(k);return `<div class="badge ${on?'':'off'}" title="${esc(d)}"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" fill="${on?col+'26':'#18202A'}" stroke="${on?col:'#243041'}" stroke-width="2"/><path d="M22 11l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L22 27.5l-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="${on?col:'#243041'}"/></svg>${n}<span>${d}</span></div>`}).join('');
  $('#skins').innerHTML=SKINS.map(s=>{const owned=s.crate?g.owned.includes(s.k):rankOf(g.xp)>=s.req;return `<button type="button" data-k="${s.k}" aria-pressed="${g.skin===s.k}" ${owned?'':'disabled'} title="${esc(s.n)}${owned?'':s.crate?' · solo en cápsulas':' · se desbloquea en '+RANKS[s.req][1]}" aria-label="${esc(s.n)}"><span style="background:${s.h}"></span></button>`}).join('');
  $$('#skins button:not(:disabled)').forEach(b=>b.onclick=()=>{g.skin=b.dataset.k;save();renderOrbita(true);snd(660,.08);snd(990,.1)});
  $('#pvtSrc').innerHTML=`${sLink('pvtb')} · ${sLink('cog')} · ${sLink('sleep')}`;
  if(!keepOverlay&&(!GS||GS.done))renderMenu();sizeCanvas();kick()}
function drawRoute(g,col){const N=ROUTE.length,X=i=>40+i*(680/(N-1)),Y=i=>136-Math.sin(i/(N-1)*Math.PI)*82;let r=`<defs><radialGradient id="rE" cx=".35" cy=".35"><stop offset="0" stop-color="#7FB2FF"/><stop offset="1" stop-color="#1D3F8A"/></radialGradient><radialGradient id="rM" cx=".35" cy=".35"><stop offset="0" stop-color="#E8EDF3"/><stop offset="1" stop-color="#7C8794"/></radialGradient></defs>`;
  const path=i0=>ROUTE.slice(0,i0+1).map((_,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(i).toFixed(1)).join(' ');
  r+=`<path d="${path(N-1)}" fill="none" stroke="#1E2733" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/><path d="${path(g.route)}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  r+=`<circle cx="${X(0)}" cy="${Y(0)}" r="36" fill="none" stroke="#8B3FB8" stroke-width="7" opacity=".4"/><circle cx="${X(0)}" cy="${Y(0)}" r="27" fill="none" stroke="#B8414F" stroke-width="5" opacity=".5"/><circle cx="${X(0)}" cy="${Y(0)}" r="20" fill="url(#rE)"/><circle cx="${X(N-1)}" cy="${Y(N-1)}" r="26" fill="none" stroke="#8A93A3" stroke-dasharray="2 4" opacity=".6"/><circle cx="${X(N-1)}" cy="${Y(N-1)}" r="16" fill="url(#rM)"/>`;
  ROUTE.forEach((n,i)=>{if(i===0||i===N-1)return;const dn=i<=g.route,cu=i===g.route;r+=`<circle cx="${X(i)}" cy="${Y(i)}" r="${cu?8:5}" fill="${dn?col:'#11161D'}" stroke="${dn?col:'#2A3442'}" stroke-width="2"/>`});
  const i=g.route;r+=`<g transform="translate(${X(i)} ${Y(i)})">${RM?'':`<circle r="14" fill="none" stroke="${col}" opacity=".5"><animate attributeName="r" values="10;22;10" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0;.6" dur="2.2s" repeatCount="indefinite"/></circle>`}<path d="M -7 -18 L 7 -18 L 0 -10 Z" fill="${col}"/></g>`;
  const tx=clamp(X(i),70,690);r+=`<text x="${tx}" y="${Y(i)-26}" text-anchor="middle" fill="#EEF2F6" font-size="14" font-weight="800" font-family="Manrope">${esc(ROUTE[i].n)}</text>`;
  $('#route').innerHTML=r;$('#routeCap').textContent=g.route>=N-1?'Ruta completada':`Etapa ${g.route+1} de ${N}`;$('#routeNext').textContent=g.route>=N-1?'¡Llegaste a la Luna!':`Siguiente: ${ROUTE[g.route+1].n}`}
const postalHTML=(i,flip)=>{const r=ROUTE[i];return `<div class="postal ${flip?'flip':''}"><span class="pn">${String(i+1).padStart(2,'0')}</span><span class="cap" style="color:var(--sleep)">Postal ${i+1} de ${ROUTE.length}</span><h3>${esc(r.n)}</h3><p>${esc(r.f)}</p><span class="src">Fuente: ${esc(r.s)}</span></div>`};
function openCrate(onDone){const g=game();if(g.crate)return;const box=$('#hMis .crate');if(box)box.classList.add('shake');snd(300,.3,'triangle',.08,400);
  setTimeout(()=>{const R=Math.random(),locked=SKINS.filter(s=>s.crate&&!g.owned.includes(s.k));let rew;
    if(locked.length&&R<.45){const s=locked[Math.floor(Math.random()*locked.length)];g.owned.push(s.k);rew=`Color ${s.n}`}
    else if(R<.7&&g.shields<3){g.shields++;rew='Escudo de racha'}
    else{const x=300+Math.round(Math.random()*4)*50;g.xp+=x;rew=`+${x} XP`}
    g.crate=rew;save();chord([523,659,784,1047],80);burst(skinCol(g),90,true);renderOrbita(true);toast('Cápsula de suministros: '+rew);if(onDone)onDone(rew)},900)}

/* menú del juego */
function renderMenu(){const c=cur(),g=game(c),done=playedToday(g),ri=rankOf(g.xp);$('#hud').hidden=true;
  $('#gBox').innerHTML=`<span class="cap">${esc(c.n)} · ${RANKS[ri][1]} · racha de ${g.streak} día${g.streak===1?'':'s'}</span><h2>${done?'Turno de hoy completado':'Listo para la misión de hoy'}</h2>
   <div class="modes"><button class="mode main" id="mOf" type="button" ${done?'disabled':''}><span class="mt">Cuenta para tu salud</span><b>Turno oficial</b><span class="md">3 minutos · una vez al día</span><span class="mr" style="color:${done?'var(--muted)':'var(--good)'}">${done?'✓ Hecho · vuelve mañana':`+500 XP · bono de racha · avanzas a ${esc(ROUTE[Math.min(ROUTE.length-1,g.route+1)].n)}`}</span></button>
   <button class="mode" id="mAr" type="button"><span class="mt alt">Solo diversión · no se mide</span><b>Arcade</b><span class="md">60 segundos · sin límite</span><span class="mr" style="color:var(--rad)">Esquiva meteoros rojos, atrapa cápsulas doradas</span></button></div>
   <p class="muted small">Toca la pantalla o presiona Espacio cuando se encienda el anillo. Si te adelantas, pierdes el combo.</p>
   <button class="btn ghost sm" id="sndBtn" type="button">${S.sound?'Sonido: activado':'Sonido: apagado'}</button>`;
  if(!done)$('#mOf').onclick=()=>start('oficial');$('#mAr').onclick=()=>start('arcade');$('#sndBtn').onclick=()=>{S.sound=!S.sound;save();renderMenu();snd(660,.08)};$('#gOver').hidden=false;$('#gOver').classList.remove('end')}

/* motor */
const cv=$('#game'),cx=cv.getContext('2d');let W=0,H=0,stars=[],parts=[],pops=[],waves=[],shake=0,GS=null,loop=false,bgG=null,craters=[];
function sizeCanvas(){const r=cv.getBoundingClientRect();if(r.width<10)return;if(Math.abs(W-r.width)<1&&Math.abs(H-r.height)<1)return;const d=Math.min(2,window.devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*d);cv.height=Math.round(H*d);cx.setTransform(d,0,0,d,0,0);
  stars=[];[120,60,26].forEach((n,l)=>{for(let i=0;i<n;i++)stars.push({x:Math.random()*W,y:Math.random()*H,l,tw:Math.random()*6})});
  bgG=cx.createRadialGradient(W*.5,H*.55,0,W*.5,H*.55,Math.max(W,H)*.8);bgG.addColorStop(0,'#0B111A');bgG.addColorStop(1,'#020305');
  const R=rng(7);craters=Array.from({length:14},()=>({a:R()*6.28,d:.15+R()*.68,s:.035+R()*.08}))}
function kick(){if(!loop){loop=true;requestAnimationFrame(frame)}}
function frame(t){if(CUR!=='orbita'){loop=false;return}if(!W)sizeCanvas();if(W){if(GS&&!GS.done)update(t);draw(t)}requestAnimationFrame(frame)}
function orb(x,y,r,stops,glow){if(r<2)return;const g=cx.createRadialGradient(x-r*.35,y-r*.35,r*.1,x,y,r);stops.forEach(([o,c])=>g.addColorStop(o,c));if(glow){cx.shadowColor=glow;cx.shadowBlur=Math.min(60,r*.35)}cx.fillStyle=g;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill();cx.shadowBlur=0}
function draw(t){const g=game(),run=GS&&!GS.done,col=run&&GS.hyper?'#F7D154':skinCol(g),p=g.route/(ROUTE.length-1);
  cx.save();if(shake>.4){cx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.86}else shake=0;
  cx.fillStyle=bgG||'#020305';cx.fillRect(-30,-30,W+60,H+60);
  const er=Math.max(H*.14,H*(.72-.52*p));orb(W*.02,H*1.08,er,[[0,'#5B9DFF'],[.6,'#1C3E86'],[1,'#0A1A3A']],'rgba(95,211,243,.55)');
  const mr=Math.min(W,H)*(.045+.16*p),mx=W*.86,my=H*.2;orb(mx,my,mr,[[0,'#F1F4F8'],[.7,'#9AA4B1'],[1,'#5E6875']],'rgba(238,242,246,.25)');
  cx.fillStyle='rgba(70,78,90,.22)';craters.forEach(k=>{cx.beginPath();cx.arc(mx+Math.cos(k.a)*k.d*mr,my+Math.sin(k.a)*k.d*mr,k.s*mr,0,7);cx.fill()});
  const warp=run&&GS.hyper,sp=run?(warp?6:1.3):.22;
  cx.fillStyle='#EEF2F6';for(const s of stars){s.x-=(s.l+1)*.35*sp;if(s.x<-10){s.x=W+10;s.y=Math.random()*H}cx.globalAlpha=.16+s.l*.22+.1*Math.sin(t/700+s.tw);if(warp)cx.fillRect(s.x,s.y,(s.l+1)*7,(s.l+1)*.7);else cx.fillRect(s.x,s.y,s.l*.6+.8,s.l*.6+.8)}cx.globalAlpha=1;
  const X=W/2,Y=H/2+(W<600?24:12),R=Math.min(W,H)*(W<600?.15:.16);
  cx.save();cx.translate(X,Y);cx.rotate(t/16000);cx.strokeStyle='#1A2330';cx.lineWidth=1.2;for(let i=0;i<72;i++){const a=i/72*Math.PI*2,r1=R*1.95,r2=r1+(i%6?5:12);cx.beginPath();cx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);cx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);cx.stroke()}cx.restore();
  cx.lineCap='round';cx.lineWidth=4;cx.strokeStyle='#121922';cx.beginPath();cx.arc(X,Y,R*1.62,0,7);cx.stroke();
  if(run){const left=1-clamp((t-GS.t0)/(GS.dur*1000),0,1);cx.strokeStyle=col;cx.globalAlpha=.75;cx.beginPath();cx.arc(X,Y,R*1.62,-Math.PI/2,-Math.PI/2+left*Math.PI*2);cx.stroke();cx.globalAlpha=1}
  for(let i=0;i<10;i++){const a0=-Math.PI/2+i*Math.PI/5+.06,a1=a0+Math.PI/5-.12,on=run&&GS.combo>i;cx.strokeStyle=on?col:'#151C26';cx.lineWidth=on?6:4;cx.beginPath();cx.arc(X,Y,R*1.32,a0,a1);cx.stroke()}
  cx.lineWidth=10;cx.strokeStyle='#1A2230';cx.beginPath();cx.arc(X,Y,R,0,7);cx.stroke();
  const ph=run?GS.phase:'idle';cx.textAlign='center';cx.textBaseline='middle';
  if(ph==='stim'){const el=t-GS.stimAt,k=GS.kind,cc=k==='gold'?'#F7D154':k==='decoy'?'#FF5468':col;
    const gr=cx.createRadialGradient(X,Y,R*.3,X,Y,R*1.5);gr.addColorStop(0,cc+'50');gr.addColorStop(1,cc+'00');cx.fillStyle=gr;cx.beginPath();cx.arc(X,Y,R*1.5,0,7);cx.fill();
    cx.shadowColor=cc;cx.shadowBlur=26;cx.strokeStyle=cc;cx.lineWidth=12;if(k==='decoy'){cx.setLineDash([14,10]);cx.lineDashOffset=-t/20}
    cx.beginPath();cx.arc(X,Y,R,0,7);cx.stroke();cx.setLineDash([]);cx.shadowBlur=0;
    cx.lineWidth=2;cx.globalAlpha=Math.max(0,1-el/500);cx.beginPath();cx.arc(X,Y,R+el/5,0,7);cx.stroke();cx.globalAlpha=1;
    if(k==='decoy'){cx.fillStyle='#FF5468';cx.font=`700 ${Math.round(R*.5)}px Sora, sans-serif`;cx.fillText('✕',X,Y-4);cx.font='800 12px Manrope, sans-serif';cx.fillText('NO TOQUES',X,Y+R*.44)}
    else{cx.fillStyle='#FFFFFF';cx.font=`600 ${Math.round(R*.44)}px Sora, sans-serif`;cx.fillText(String(Math.round(el)).padStart(3,'0'),X,Y);if(k==='gold'){cx.fillStyle='#F7D154';cx.font='800 12px Manrope, sans-serif';cx.fillText('CÁPSULA ×3',X,Y+R*.44)}}}
  else if(ph==='fb'&&GS.fb){const f=GS.fb,a=clamp(1-(t-f.t)/(GS.mode==='oficial'?1000:600),0,1);cx.globalAlpha=Math.min(1,a*1.6);
    if(f.rt!=null){const cc=f.lapse?'#8B96A6':f.gold?'#F7D154':f.rt<250?col:'#EEF2F6';cx.fillStyle=cc;cx.font=`600 ${Math.round(R*.4)}px Sora, sans-serif`;cx.fillText(f.rt+' ms',X,Y-4);cx.font='800 12.5px Manrope, sans-serif';cx.fillText(f.gold?'CÁPSULA DORADA ×3':f.lapse?'LAPSO':f.rt<250?'EXCELENTE':'BIEN',X,Y+R*.4)}
    else{cx.fillStyle=f.col;cx.font=`700 ${Math.round(R*.2)}px Sora, sans-serif`;cx.fillText(f.txt,X,Y)}cx.globalAlpha=1}
  else if(ph==='idle'){const pu=.5+.5*Math.sin(t/600);cx.strokeStyle=col;cx.globalAlpha=.22+.35*pu;cx.lineWidth=10;cx.beginPath();cx.arc(X,Y,R,0,7);cx.stroke();cx.globalAlpha=1}
  else{cx.fillStyle='#2A3442';cx.beginPath();cx.arc(X,Y,4,0,7);cx.fill()}
  waves=waves.filter(w=>w.l>0);for(const w of waves){w.r+=w.v;w.l-=1;cx.globalAlpha=w.l/40;cx.strokeStyle=w.c;cx.lineWidth=3;cx.beginPath();cx.arc(X,Y,w.r,0,7);cx.stroke()}cx.globalAlpha=1;
  parts=parts.filter(p=>p.l>0);for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.vx*=.955;q.vy*=.955;q.vy+=q.g||0;q.l-=1;cx.globalAlpha=Math.min(1,q.l/40);cx.fillStyle=q.c;cx.beginPath();cx.arc(X+q.x,Y+q.y,q.s,0,7);cx.fill()}cx.globalAlpha=1;
  pops=pops.filter(q=>q.l>0);for(const q of pops){q.y-=.7;q.l-=1;cx.globalAlpha=Math.min(1,q.l/30);cx.fillStyle=q.c;cx.font=`800 ${q.s}px Sora, sans-serif`;cx.fillText(q.t,X,Y-R*1.08+q.y)}cx.globalAlpha=1;
  cx.restore()}
function burst(col,n=40,conf){const R=Math.min(W,H)*.16;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*6+2;parts.push({x:Math.cos(a)*R,y:Math.sin(a)*R,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:40+Math.random()*30,s:Math.random()*2.6+1,c:conf?['#34E39A','#5B9DFF','#F7D154','#FF6B7D','#A28CFF'][i%5]:col,g:conf?.08:0})}}
const pop=(t,c,s=20)=>pops.push({t,c,s,y:0,l:55});
const col0=()=>skinCol(game());
function start(mode){sizeCanvas();snd(1,.01);const g=game();GS={mode,t0:performance.now()+900,dur:mode==='oficial'?180:60,phase:'wait',nextAt:0,rts:[],lapses:0,fs:0,score:0,disp:0,combo:0,maxCombo:0,fast:0,golds:0,dodged:0,decoyHits:0,missed:0,hyper:false,tl:[],best:g.tl[mode],done:false,fb:null};
  GS.nextAt=GS.t0+1000+Math.random()*2000;$('#gOver').hidden=true;$('#hud').hidden=false;$('#hMode').textContent=mode==='oficial'?'Turno oficial':'Arcade';$('#hScore').textContent='0';$('#hGhost').textContent='';$('#hCombo').className='combo';$('#hTime').textContent=mode==='oficial'?'3:00':'1:00';
  pop('PREPÁRATE',col0(),22);chord([440,554,659],120);kick()}
function isi(el){return GS.mode==='oficial'?Math.random()*3000:Math.max(220,800-el*7)+Math.random()*Math.max(450,1300-el*12)}
function update(now){const el=(now-GS.t0)/1000;if(el<0)return;if(el>=GS.dur){finish();return}
  const sec=Math.floor(el);if(GS.tl[sec]==null)GS.tl[sec]=GS.score;
  if(GS.phase==='wait'&&now>=GS.nextAt){GS.phase='stim';GS.stimAt=now;GS.kind=GS.mode==='arcade'?(el>4&&Math.random()<.17?'decoy':Math.random()<.14?'gold':'normal'):'normal'}
  else if(GS.phase==='stim'){const age=now-GS.stimAt;
    if(GS.kind==='decoy'&&age>950){GS.dodged++;GS.score+=60;pop('ESQUIVADO +60','#8B96A6',16);snd(392,.08,'triangle',.08);toFb(now,300,null)}
    else if(GS.mode==='arcade'&&GS.kind!=='decoy'&&age>1400){GS.missed++;breakCombo();pop('SE ESCAPÓ','#8B96A6',16);snd(180,.15,'triangle',.06);toFb(now,300,null)}
    else if(GS.mode==='oficial'&&age>=30000){GS.rts.push(30000);GS.lapses++;breakCombo();toFb(now,1000,{txt:'Sin respuesta',col:'#8B96A6',t:now})}}
  else if(GS.phase==='fb'&&now>=GS.fbUntil){GS.phase='wait';GS.nextAt=now+isi(el)}
  GS.disp+=(GS.score-GS.disp)*.18;if(Math.abs(GS.score-GS.disp)<1)GS.disp=GS.score;$('#hScore').textContent=fmt(GS.disp);
  const left=Math.max(0,GS.dur-el);$('#hTime').textContent=`${Math.floor(left/60)}:${String(Math.floor(left%60)).padStart(2,'0')}`;
  if(GS.best&&GS.best.length){const b=GS.best[Math.min(sec,GS.best.length-1)]||0,dlt=GS.score-b,gh=$('#hGhost');gh.textContent=`${dlt>=0?'+':'−'}${fmt(Math.abs(dlt))} vs tu récord`;gh.style.color=dlt>=0?'#34E39A':'#FF6B7D'}}
function toFb(now,ms,fb){GS.phase='fb';GS.fbUntil=now+ms;if(fb!==undefined)GS.fb=fb}
function breakCombo(){if(GS.combo>=5)pop('COMBO PERDIDO','#FF6B7D',15);GS.combo=0;GS.hyper=false;comboUI()}
function comboUI(){const el=$('#hCombo');if(GS.combo>=3){el.textContent=GS.hyper?`HIPERFOCO ×${GS.combo}`:`COMBO ×${GS.combo}`;el.className='combo on'+(GS.hyper?' hy':'')}else el.className='combo'}
function respond(now){if(!GS||GS.done||now<GS.t0)return;
  if(GS.phase==='stim'){const rt=Math.round(now-GS.stimAt);
    if(GS.kind==='decoy'){GS.decoyHits++;breakCombo();shake=14;snd(110,.28,'sawtooth',.06,-60);buzz(70);toFb(now,600,{txt:'¡Era un meteoro!',col:'#FF5468',t:now});return}
    if(rt<100){falseStart(now);return}
    GS.rts.push(rt);const lapse=rt>=355,col=col0();let pts,gold=false;
    if(lapse){GS.lapses++;breakCombo();pts=25;snd(260,.12,'triangle',.07)}
    else{GS.combo++;GS.maxCombo=Math.max(GS.maxCombo,GS.combo);if(rt<250)GS.fast++;
      gold=GS.mode==='arcade'?GS.kind==='gold':Math.random()<.1;if(gold)GS.golds++;
      if(GS.combo===10&&!GS.hyper){GS.hyper=true;pop('¡HIPERFOCO!','#F7D154',26);chord([660,880,1100,1320],70);burst('#F7D154',60,true)}
      const mult=(1+Math.min(GS.combo,10)*.1)*(GS.hyper?1.25:1);pts=Math.round((100+(355-rt)*1.6)*mult*(gold?3:1));
      snd(420+Math.max(0,355-rt)*2.6,.09,'sine',.13);if(gold)setTimeout(()=>chord([1047,1319,1568],60),60);if(GS.combo===5)setTimeout(()=>snd(880,.12),80);
      burst(gold||GS.hyper?'#F7D154':col,gold?90:26+Math.min(GS.combo,10)*3);waves.push({r:Math.min(W,H)*.16,v:3.2,l:40,c:gold?'#F7D154':col});buzz(12)}
    GS.score+=pts;pop('+'+fmt(pts),gold?'#F7D154':'#EEF2F6',gold?26:20);comboUI();
    toFb(now,GS.mode==='oficial'?1000:420,{rt,pts,lapse,gold,t:now})}
  else falseStart(now)}
function falseStart(now){GS.fs++;breakCombo();shake=11;snd(140,.16,'square',.05);buzz(40);
  if(GS.phase==='stim')toFb(now,GS.mode==='oficial'?1000:420,{txt:'¡Muy pronto!',col:'#FF5468',t:now});
  else{GS.fb={txt:'¡Muy pronto!',col:'#FF5468',t:now};if(GS.phase==='wait'){GS.phase='fb';GS.fbUntil=now+500}}}
cv.addEventListener('pointerdown',e=>{e.preventDefault();respond(performance.now())});
document.addEventListener('keydown',e=>{if(CUR!=='orbita'||!GS||GS.done)return;if(e.code==='Space'||e.code==='Enter'){e.preventDefault();if(!e.repeat)respond(performance.now())}});
function abortGame(){if(GS&&!GS.done)GS=null}

/* fin del turno */
function finish(){const c=cur(),g=game(c),G2=GS;G2.done=true;
  const valid=G2.rts.filter(x=>x<30000),med=median(G2.rts),speed=valid.length?mean(valid.map(x=>1000/x)):0,perf=Math.round(100*(1-(G2.lapses+G2.fs)/Math.max(1,G2.rts.length+G2.fs)));
  const oldXP=g.xp,oldR=rankOf(g.xp),first=G2.mode==='oficial'&&!playedToday(g);let xp=Math.round(G2.score/20),streakB=0,newPost=null;
  if(first){if(!g.days.includes(DAY-1)&&g.shields>0&&g.days.includes(DAY-2)){g.shields--;g.days.push(DAY-1)}
    g.streak=g.days.includes(DAY-1)?g.streak+1:1;g.days.push(DAY);if(g.streak%7===0)g.shields=Math.min(3,g.shields+1);
    streakB=Math.min(g.streak,30)*10;xp+=500+streakB;if(g.route<ROUTE.length-1){g.route++;newPost=g.route;S.logSel=null}
    if(med!=null){const e=c.days[DAY-1];e.rt=Math.round(med);e.lap=G2.lapses;e.fs=G2.fs;S.rt[c.id]={rt:e.rt,lap:e.lap,fs:e.fs}}}
  if(G2.mode==='arcade')g.arcadeToday++;
  g.runs++;const newBest=G2.score>g.best[G2.mode];if(newBest){g.best[G2.mode]=G2.score;g.tl[G2.mode]=G2.tl.map(x=>x||0)}
  g.maxCombo=Math.max(g.maxCombo,G2.maxCombo);if(valid.length)g.fastest=Math.min(g.fastest,Math.min(...valid));
  const upd={oficial:G2.mode==='oficial'?1:0,combo8:G2.maxCombo,gold2:G2.golds,fast5:G2.fast,arcade2:G2.mode==='arcade'?1:0,dodge4:G2.dodged,score:G2.score},sum=['gold2','arcade2','dodge4'];
  const newly=[];g.mis.forEach(k=>{if(g.mdone.includes(k))return;g.mprog[k]=sum.includes(k)?(g.mprog[k]||0)+upd[k]:Math.max(g.mprog[k]||0,upd[k]);if(g.mprog[k]>=MIS[k].goal){g.mdone.push(k);newly.push(k);xp+=MIS[k].xp}});
  g.xp+=xp;
  const nb=[],give=k=>{if(!g.badges.includes(k)){g.badges.push(k);nb.push(k)}};
  if(G2.mode==='oficial')give('first');if(g.streak>=3)give('streak3');if(g.streak>=7)give('streak7');if(g.streak>=30)give('streak30');if(G2.mode==='oficial'&&G2.fs===0&&G2.rts.length>=10)give('clean');if(G2.golds>0)give('gold');if(G2.maxCombo>=10)give('combo10');if(G2.fast>=5)give('reflex');if(G2.dodged>=5)give('dodge');if(g.route+1>=8)give('collector');if(g.route>=ROUTE.length-1)give('moon');if(CREW.every(x=>playedToday(game(x))))give('crew');
  save();const nr=rankOf(g.xp),up=nr>oldR,nx=RANKS[nr+1],span=(nx?nx[0]:g.xp+1)-RANKS[nr][0],pct=nx?(g.xp-RANKS[nr][0])/span*100:100,from=up?0:clamp((oldXP-RANKS[nr][0])/span*100,0,100),ms=SC.mind(c,today(c));
  if(first){qpush({p:2,c:`Estado general de ${c.n}: ${estadoDe(c).t.toLowerCase()}`});if(med!=null)enviarPrueba(c,'pvt',Math.round(med),{lapsos:G2.lapses,anticipaciones:G2.fs,respuestas:G2.rts.length}).then(r=>{if(r&&r.nivel)toast('PVT: '+r.mensaje)})}
  renderOrbita(true);
  const all=g.mis.every(k=>g.mdone.includes(k));
  $('#gBox').innerHTML=`<span class="cap">${G2.mode==='oficial'?'Turno oficial completado · día '+DAY:'Arcade terminado'}</span>
   <div style="display:grid;gap:8px;justify-items:center"><span class="big" id="endScore">0</span><span class="muted" style="font-weight:700">puntos${newBest?'<span class="rec">Nuevo récord</span>':''}</span></div>
   <div class="res"><div><span class="cap">Capturas</span><span class="num">${valid.length}</span></div><div><span class="cap">Combo máx.</span><span class="num">×${G2.maxCombo}</span></div><div><span class="cap">XP ganada</span><span class="num">+${fmt(xp)}</span></div></div>
   <div class="xpb"><div class="rowb"><b>${up?'<span style="color:var(--good)">¡Subiste a '+RANKS[nr][1]+'!</span>':RANKS[nr][1]}</b><span class="muted small">${fmt(g.xp)} XP${streakB?` · bono de racha +${streakB}`:''}</span></div><div class="xp"><i id="endXp" style="width:${from}%"></i></div></div>
   <div class="mlst">${g.mis.map(k=>`<div class="mrow ${g.mdone.includes(k)?'done':''}"><span class="ck">${g.mdone.includes(k)?'✓':''}</span><span>${MIS[k].t}</span><span class="xr">${newly.includes(k)?'+'+MIS[k].xp+' XP':g.mdone.includes(k)?'Hecho':`${fmt(Math.min(MIS[k].goal,g.mprog[k]||0))}/${fmt(MIS[k].goal)}`}</span></div>`).join('')}</div>
   ${newPost!=null?`<span class="cap" style="color:var(--sleep)">Nueva etapa desbloqueada</span>${postalHTML(newPost,true)}`:''}
   ${all&&!g.crate?`<div class="crate shake" id="endCrate">${capsuleSVG(false)}<b>¡Completaste las 3 misiones!</b><button class="btn go sm" id="crate2" type="button">Abrir cápsula de suministros</button></div>`:''}
   ${nb.length?`<p class="muted small">Insignia nueva: <b style="color:var(--text)">${nb.map(k=>BADGES.find(b=>b[0]===k)[1]).join(', ')}</b></p>`:''}
   ${G2.mode==='oficial'?(S.role==='med'?`<div class="res" style="grid-template-columns:repeat(4,minmax(0,1fr))"><div><span class="cap">Mediana</span><span class="num">${med??'—'}</span></div><div><span class="cap">1/TR</span><span class="num">${speed.toFixed(2)}</span></div><div><span class="cap">Lapsos</span><span class="num">${G2.lapses}</span></div><div><span class="cap">Anticip.</span><span class="num">${G2.fs}</span></div></div><p class="note">PVT-B · puntaje de desempeño ${perf} % · línea base ${c.base.rt} ms</p>`:`<p class="small" style="color:${ms!=null&&ms<70?'var(--warn)':'var(--good)'};font-weight:800">${ms==null?'':ms>=70?'Tu atención está como siempre.':'Tu atención está más lenta que tu normal. Si puedes, descansa un poco.'}</p>`):''}
   <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn go" id="again" type="button">Jugar arcade</button><button class="btn ghost" id="back" type="button">Volver al menú</button></div>`;
  $('#hud').hidden=true;$('#gOver').hidden=false;$('#gOver').classList.add('end');$('#gOver').scrollTop=0;
  const es=$('#endScore'),t0=performance.now(),to=G2.score;const st=t=>{const p=Math.min(1,(t-t0)/1300),e=1-Math.pow(1-p,3);es.textContent=fmt(to*e);if(p<1)requestAnimationFrame(st)};requestAnimationFrame(st);
  setTimeout(()=>{const x=$('#endXp');if(x)x.style.width=pct+'%'},300);
  $('#again').onclick=()=>start('arcade');$('#back').onclick=()=>{GS=null;renderOrbita()};
  if($('#crate2'))$('#crate2').onclick=()=>{$('#crate2').disabled=true;openCrate(rew=>{const b=$('#endCrate');if(b)b.innerHTML=`${capsuleSVG(true)}<b>Cápsula de suministros</b><span class="reward" style="font-size:18px">${esc(rew)}</span>`})};
  chord(newBest?[523,659,784,1047]:[523,659,784],110);burst(col0(),newBest?120:60,newBest);if(up)setTimeout(()=>{toast(`Nuevo rango: ${RANKS[nr][1]}`);burst('#F7D154',120,true);chord([659,880,1175,1568],90)},900);
  if(newPost!=null)setTimeout(()=>snd(1320,.25,'sine',.08),600)}

