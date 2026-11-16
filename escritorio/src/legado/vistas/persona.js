'use strict';
/* ================= PERSONA ================= */
const MI={ready:'<path d="M12 3a9 9 0 1 1-9 9" stroke-linecap="round"/><path d="M12 7a5 5 0 1 1-5 5" stroke-linecap="round"/>',sleep:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',oxy:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',mind:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',rad:'<circle cx="12" cy="12" r="2"/><path d="M12 3a9 9 0 0 1 7.8 4.5L14 10.8M4.2 7.5A9 9 0 0 1 12 3M12 21a9 9 0 0 1-7.8-4.5L10 13.2M19.8 16.5A9 9 0 0 1 12 21"/>',eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>'};
const MET={ready:{n:'Preparación',col:'#34E39A',sub:'hoy'},sleep:{n:'Sueño',col:'#5B9DFF',k:'sl',sub:'meta 8 h',f:v=>(+v).toFixed(1)+' h'},heart:{n:'Corazón',col:'#FF6B7D',k:'hr',sub:'pulso en reposo',f:v=>v+' lpm'},oxy:{n:'Oxígeno',col:'#5FD3F3',k:'sp',sub:'SpO₂',f:v=>v+' %'},mind:{n:'Atención',col:'#A28CFF',k:'rt',sub:'Órbita · PVT-B',f:v=>v+' ms'},rad:{n:'Radiación',col:'#F7D154',k:'dose',sub:'de 600 mSv',f:v=>(+v).toFixed(0)+' mSv'},eye:{n:'Visión',col:'#2DD4BF',sub:'SANS'}};
const MKEYS=['ready','sleep','mind','heart','oxy','rad','eye'];
function mPct(c,k){const e=today(c);return k==='ready'?ready(c):k==='rad'?Math.round(e.dose/600*100):k==='eye'?{good:100,warn:55,none:null}[eyeState(c).l]:SC[k](c,e)}
function mVal(c,k){const e=today(c);if(k==='ready'){const r=ready(c);return r==null?'—':r+' %'}if(k==='eye')return eyeState(c).w;const v=e[MET[k].k];return v==null?'—':MET[k].f(v)}
function mLvl(c,k){if(k==='eye')return eyeState(c).l;if(k==='rad'){const p=mPct(c,k);return p>=80?'bad':p>=50?'warn':'good'}if(k==='oxy'){const e=today(c);return e.sp==null?'none':e.sp<=c.base.sp-4?'bad':e.sp<=c.base.sp-2?'warn':'good'}return lvlR(mPct(c,k))}
function info(c,k){const L=mLvl(c,k),p=mPct(c,k);
  const A=k==='ready'?alerts(c).filter(a=>a.l!=='none'):[],mixed=L==='good'&&A.length>0;
  if(k==='ready')return{title:p==null?'Faltan las mediciones de hoy':mixed?'Bien, con algo que vigilar':L==='good'?'Todo listo para un día exigente':L==='warn'?'Ve a tu ritmo hoy':'Hoy prioriza descansar',
    say:p==null?'Ponte el sensor y haz tu turno de Órbita para calcular tu preparación.':mixed?`Tu preparación es buena, pero hoy hay que vigilar: ${A.map(a=>a.t.toLowerCase()).join(', ')}.`:L==='good'?'Tu sueño, tu atención y tu corazón están en tu rango habitual.':'Algo está por debajo de tu normal. Abajo ves qué está bajando y qué hacer.',
    why:`Combina sueño (35 %), atención (35 %) y pulso en reposo (30 %) frente a tu propia línea base. Fórmula de este prototipo; comparar contra uno mismo sigue el enfoque del ${sLink('cdss')}.`};
  if(p==null&&k!=='eye')return{title:'Sin datos de hoy',say:'Ponte el sensor para registrar esta métrica.',why:''};
  const v=mVal(c,k),b=c.base;
  return{sleep:{title:L==='good'?'Dormiste bien':'Dormiste menos de lo que necesitas',say:`Anoche dormiste ${v}; tu normal es ${b.sl} h. ${L==='good'?'Sigue con tu horario.':'Esta noche adelanta tu hora de dormir. Tu turno de Órbita dirá si te está afectando.'}`,why:`En la ISS los astronautas durmieron en promedio 6.1 h; un adulto con tiempo de sobra duerme cerca de 8.5 h. ${sLink('sleep')}`},
    mind:{title:L==='good'?'Tu atención está como siempre':'Tu atención está más lenta',say:`Tu tiempo de reacción típico hoy fue ${v} (tu normal: ${b.rt} ms). ${L==='good'?'Bien.':'Suele pasar con poco sueño o mucha carga. Antes de algo delicado, toma un descanso corto.'}`,why:`Medido con el juego Órbita, que aplica la prueba de reacción PVT-B de NASA sin preguntarte cómo te sientes. ${sLink('pvtb')} · ${sLink('cog')}`},
    heart:{title:L==='good'?'Tu corazón está en calma':'Tu pulso en reposo está alto',say:`Tu pulso en reposo es ${v} (tu normal: ${b.hr} lpm). ${L==='good'?'Todo bien.':'Puede ser cansancio, estrés o deshidratación. Bebe agua y vuelve a medir en reposo.'}`,why:`Se compara con tu propia línea base de los primeros 14 días. ${sLink('cdss')}`},
    oxy:{title:L==='good'?'Oxígeno normal':L==='warn'?'Tu oxígeno bajó un poco':'Tu oxígeno está bajo',say:`Tu saturación es ${v} (tu normal: ${b.sp} %). ${L==='good'?'Todo bien.':'Siéntate, respira lento y vuelve a medir en 2 minutos. Si sigue igual, avisa al oficial médico.'}`,why:`Regla del prototipo: aviso si baja 4 puntos de tu línea base; el oficial médico puede ajustarla. ${sLink('cdss')}`},
    rad:{title:'Dosis de radiación acumulada',say:`Llevas ${v} en toda tu carrera: ${p} % del límite. ${p<50?'Vas bien.':'Reduce el tiempo en zonas con poco blindaje.'}`,why:`Límite de carrera de NASA: 600 mSv. Las dosis de esta demostración son de ejemplo. ${sLink('cancer')}`},
    eye:{title:L==='good'?'Tus ojos no muestran cambios':L==='warn'?'Notaste un cambio en la vista':'Revisión de ojos pendiente',say:L==='good'?'Las dos pruebas salieron bien en ambos ojos.':L==='warn'?'Repite la revisión mañana a la misma hora y avisa al oficial médico.':'Toma dos minutos por ojo. Hazla en la sección Visión.',why:`Mismas pruebas y calendario que en la ISS. ${sLink('sanshw')}`}}[k]}
/* Detalle de la persona: lo que pinta el núcleo dentro de la página de React
   (signos vitales en vivo, perfil previo al vuelo y modelo 3D). */
function renderPersona(){if(!$('#pVit'))return;const c=cur();
  $('#pVit').innerHTML=offBox(c)+`<div class="vgrid5">${VORDER.map(x=>vtile(c,x)).join('')}</div>`;$('#pVitCap').textContent=LV[c.id].on?'Sensor portátil · en vivo':'Sin señal';bindRecon($('#pVit'));updateVitals();
  renderProfile(c);t3SoloKick()}

/* gráfica con banda de línea base y cursor */
let CH=null;
function drawChart(c,k){const svg=$('#chart'),W=Math.max(300,svg.clientWidth||640),H=230,pl=42,pr=16,pt=16,pb=30;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);$('#tip').hidden=true;
  const days=c.days.slice(-21),key=k==='ready'?null:MET[k].k;
  if(k==='eye'){CH=null;$('#cTitle').textContent='Visión · revisiones';svg.innerHTML=`<text x="${W/2}" y="${H/2-8}" fill="#8B96A6" text-anchor="middle" font-size="14" font-family="Manrope" font-weight="700">La vista se revisa en días programados, no a diario.</text><text x="${W/2}" y="${H/2+16}" fill="#5A6576" text-anchor="middle" font-size="13" font-family="Manrope">Día 30 completado · siguen el día 90 y R-30</text>`;$('#cLeg').innerHTML='';return}
  const vals=days.map(e=>k==='ready'?readyE(c,e):e[key]),ok=vals.filter(v=>v!=null);
  $('#cTitle').textContent=MET[k].n+' · tendencia';
  if(ok.length<2){svg.innerHTML='';CH=null;return}
  const F=(k==='ready'||['sl','rt','hr','sp'].includes(key))?fc(c,k==='ready'?'ready':key):null,NP=F?7:0;
  let lo0=Math.min(...ok,...(F?F.proj:[])),hi0=Math.max(...ok,...(F?F.proj:[]));if(key&&c.band[key]){lo0=Math.min(lo0,c.band[key][0]);hi0=Math.max(hi0,c.band[key][1])}if(k==='ready'){lo0=Math.min(lo0,40);hi0=Math.min(100,hi0)}
  const padv=(hi0-lo0)*.18||1,lo=lo0-padv,hi=k==='ready'?Math.min(104,hi0+padv):hi0+padv,X=i=>pl+i*(W-pl-pr)/(days.length-1+NP),Y=v=>pt+(1-(v-lo)/(hi-lo))*(H-pt-pb),col=k==='ready'?'#34E39A':MET[k].col;
  const raw=(hi-lo)/4,mag=Math.pow(10,Math.floor(Math.log10(raw))),step=[1,2,2.5,5,10].map(m=>m*mag).find(s=>s>=raw),ticks=[];for(let v=Math.ceil(lo/step)*step;v<=hi;v+=step)ticks.push(+v.toFixed(4));
  const ff=v=>step<1?v.toFixed(1):Math.round(v);
  let g=`<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".32"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs>`;
  ticks.forEach(v=>{const y=Y(v);g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" stroke="#151D27"/><text x="${pl-8}" y="${y+4}" fill="#5A6576" font-size="11" text-anchor="end" font-family="Manrope" font-weight="600">${ff(v)}</text>`});
  if(key&&c.band[key]){const[b0,b1]=c.band[key];g+=`<rect x="${pl}" width="${W-pl-pr}" y="${Y(b1)}" height="${Math.max(2,Y(b0)-Y(b1))}" fill="#EEF2F6" opacity=".05" rx="4"/><line x1="${pl}" x2="${W-pr}" y1="${Y(c.base[key])}" y2="${Y(c.base[key])}" stroke="#8B96A6" stroke-dasharray="4 5" opacity=".8"/>`}
  if(k==='ready')g+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(70)}" y2="${Y(70)}" stroke="#34E39A" stroke-dasharray="4 5" opacity=".5"/>`;
  if(key==='dose'){const i=days.findIndex(e=>e.d===27);if(i>=0)g+=`<line x1="${X(i)}" x2="${X(i)}" y1="${pt}" y2="${H-pb}" stroke="#F7D154" stroke-dasharray="3 4" opacity=".6"/><text x="${X(i)+6}" y="${pt+12}" fill="#F7D154" font-size="11" font-family="Manrope" font-weight="700">Evento solar (ejemplo)</text>`}
  const pts=vals.map((v,i)=>v==null?null:[X(i),Y(v),v,days[i].d]).filter(Boolean);
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  g+=`<path d="${d} L ${pts[pts.length-1][0]} ${H-pb} L ${pts[0][0]} ${H-pb} Z" fill="url(#ga)"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
  if(key&&key!=='dose'){const b=c.base[key];pts.forEach(p=>{const v=p[2],bad=key==='sp'?v<=b-4:key==='sl'?v<6.4:key==='rt'?v>b*1.075:key==='hr'?v>b*1.075:false;if(bad)g+=`<path d="M ${p[0]} ${p[1]-17} l 7 12 h -14 z" fill="#F5B841"/>`})}
  if(k==='ready')pts.forEach(p=>{if(p[2]<70)g+=`<path d="M ${p[0]} ${p[1]-17} l 7 12 h -14 z" fill="#F5B841"/>`});
  const L=pts[pts.length-1];
  if(F){const n0=days.length-1,pp=F.proj.map((v,i)=>[X(n0+1+i),Y(k==='ready'?Math.min(100,v):v)]),dd=`M ${L[0].toFixed(1)} ${L[1].toFixed(1)} `+pp.map(p=>`L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    g+=`<rect x="${X(n0)}" y="${pt}" width="${W-pr-X(n0)}" height="${H-pt-pb}" fill="#EEF2F6" opacity=".03"/><path d="${dd}" fill="none" stroke="${col}" stroke-width="2.4" stroke-dasharray="6 6" opacity=".8"/><circle cx="${pp[6][0]}" cy="${pp[6][1]}" r="4" fill="#05070A" stroke="${col}" stroke-width="2"/><text x="${X(n0)+8}" y="${pt+12}" fill="#8B96A6" font-size="11" font-family="Manrope" font-weight="800">PRONÓSTICO</text>`;
    pp.forEach((p,i)=>pts.push([p[0],p[1],k==='ready'?Math.round(Math.min(100,F.proj[i])):key==='sl'?+F.proj[i].toFixed(1):Math.round(F.proj[i]),DAY+1+i,true]))}
  g+=`<circle cx="${L[0]}" cy="${L[1]}" r="11" fill="${col}" opacity=".18"/><circle cx="${L[0]}" cy="${L[1]}" r="5" fill="${col}"/>`;
  days.forEach((e,i)=>{if(i%5===0||i===days.length-1)g+=`<text x="${X(i)}" y="${H-9}" fill="#5A6576" font-size="11" text-anchor="middle" font-family="Manrope" font-weight="600">D${e.d}</text>`});
  if(F)g+=`<text x="${X(days.length-1+7)}" y="${H-9}" fill="#5A6576" font-size="11" text-anchor="end" font-family="Manrope" font-weight="600">D${DAY+7}</text>`;
  g+=`<line class="cross" x1="0" x2="0" y1="${pt}" y2="${H-pb}" stroke="#EEF2F6" opacity="0" stroke-width="1"/><circle class="hdot" r="6" fill="#05070A" stroke="${col}" stroke-width="3" opacity="0"/>`;
  svg.innerHTML=g;CH={W,H,pts,f:k==='ready'?v=>v+' %':MET[k].f};
  const dash=c2=>`<i style="background:none;border-top:2px dashed ${c2};height:0;border-radius:0"></i>`;
  $('#cLeg').innerHTML=(key&&key!=='dose'?`<span><i style="background:rgba(238,242,246,.14)"></i>Tu rango habitual (días 1 a 14)</span><span>${dash('#8B96A6')}Tu normal</span>`:k==='ready'?`<span>${dash('#34E39A')}70 % = buen día</span>`:'')+(key!=='dose'?`<span><i style="background:#F5B841;clip-path:polygon(50% 0,100% 100%,0 100%)"></i>Fuera de lo normal</span>`:'')+(F?`<span>${dash(col)}Pronóstico 7 días (tendencia de 10 días)</span>`:'')}
const chartEl=$('#chart');
if(chartEl)chartEl.addEventListener('pointermove',ev=>{if(!CH)return;const r=chartEl.getBoundingClientRect(),x=(ev.clientX-r.left)/r.width*CH.W;let best=CH.pts[0];CH.pts.forEach(p=>{if(Math.abs(p[0]-x)<Math.abs(best[0]-x))best=p});
  const tip=$('#tip');tip.hidden=false;tip.style.left=(best[0]/CH.W*r.width)+'px';tip.style.top=(best[1]/CH.H*r.height)+'px';tip.innerHTML=`<span>Día ${best[3]}${best[4]?' · pronóstico':''}</span>${esc(CH.f(best[2]))}`;
  const cl=$('#chart .cross'),hd=$('#chart .hdot');if(!cl||!hd)return;cl.setAttribute('x1',best[0]);cl.setAttribute('x2',best[0]);cl.setAttribute('opacity',.25);hd.setAttribute('cx',best[0]);hd.setAttribute('cy',best[1]);hd.setAttribute('opacity',1)});
if(chartEl)chartEl.addEventListener('pointerleave',()=>{$('#tip').hidden=true;const cl=$('#chart .cross'),hd=$('#chart .hdot');if(cl)cl.setAttribute('opacity',0);if(hd)hd.setAttribute('opacity',0)});
function renderPMed(c){const el=$('#pMed');el.hidden=S.role!=='med';if(el.hidden)return;const e=today(c);
  const rows=[['Sueño','sl','h',1,-1],['Pulso en reposo','hr','lpm',0,1],['SpO₂','sp','%',0,-1],['PVT-B mediana','rt','ms',0,1],['Lapsos ≥355 ms','lap','',0,1]];
  el.innerHTML=`<div class="rowb"><div><span class="cap">Solo vista médico en Tierra</span><h3 style="margin-top:4px">${esc(c.n)} · valores exactos del día ${DAY}</h3></div></div><div class="tscroll"><table class="tbl" style="min-width:560px"><thead><tr><th>Medida</th><th>Hoy</th><th>Mediana D1–14</th><th>Rango p10–p90</th><th>Cambio</th><th>z</th></tr></thead><tbody>`+
    rows.map(([n,k,u,dec,dir])=>{const v=e[k],b=c.base[k],z=v==null?null:(v-b)/c.sd[k],f=x=>x==null?'—':(+x).toFixed(dec);return `<tr><td>${n}</td><td class="${zc(c,k,v,dir)}">${f(v)} ${u}</td><td>${f(b)}</td><td>${f(c.band[k][0])}–${f(c.band[k][1])}</td><td>${v==null||!b?'—':((v-b)/b*100>=0?'+':'')+((v-b)/b*100).toFixed(1)+' %'}</td><td class="${zc(c,k,v,dir)}">${z==null?'—':(z>=0?'+':'')+z.toFixed(2)}</td></tr>`}).join('')+
    `<tr><td>Dosis acumulada</td><td>${e.dose.toFixed(1)} mSv</td><td colspan="2">${(e.dose/600*100).toFixed(1)} % del límite de carrera</td><td colspan="2">ejemplo</td></tr></tbody></table></div><p class="note">z = cuántas desviaciones típicas se aleja hoy de su propia variación en los días 1 a 14.</p>`}

/* mapa del cuerpo */
function zones(c){const z=[],e=today(c),add=(id,l,col,why)=>z.push({id,l,col,why});
  const ms=SC.mind(c,e),ss=SC.sleep(c,e);
  if(ms!=null&&(ms<70||(ss!=null&&ss<80)))add('head','Sueño y atención','#A28CFF','Por debajo de su normal');else add('head','Aislamiento','#A28CFF','Seguimiento con Órbita');
  if(eyeState(c).l==='warn'||c.hx.includes('ojo'))add('eyes','Visión',eyeState(c).l==='warn'?'#F5B841':'#2DD4BF',eyeState(c).l==='warn'?'Cambio en la revisión':'Vigilancia por antecedente');
  if(c.hx.includes('apnea'))add('airway','Vía aérea','#5B9DFF','Apnea leve');
  if(c.hx.includes('coagulo'))add('neck','Coagulación','#FF5468','Antecedente de trombosis');
  if(e.sp!=null&&e.sp<=c.base.sp-4)add('lungs','Oxígeno','#5FD3F3','Saturación baja hoy');
  if((SC.heart(c,e)??100)<70||c.hx.includes('presion')||c.hx.includes('arritmia'))add('heart','Corazón','#FF6B7D',c.hx.includes('presion')?'Hipertensión':c.hx.includes('arritmia')?'Arritmia tratada':'Pulso en reposo alto');
  if(c.hx.includes('columna'))add('spine','Columna','#F5B841','Hernia de disco');
  if(c.hx.includes('rinon'))add('kidney','Riñón','#F7D154','Antecedente de cálculos');
  if(c.hx.includes('cadera'))add('hip','Cadera','#F5B841','Prótesis');
  return z}
const ZP={head:[180,36],eyes:[180,56],airway:[180,72],neck:[180,88],lungs:[164,132],heart:[194,128],spine:[180,176],kidney:[196,206],hip:[180,258]};
const ZLEFT=['head','airway','neck','lungs','spine'];
function drawBody(c,target){const Z=zones(c),O='#2A3442';
  const L=(a,b,w)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke-width="${w}"/>`;
  const limbs=w=>[L([146,106],[130,190],w),L([130,190],[124,262],w*.86),L([214,106],[230,190],w),L([230,190],[236,262],w*.86),L([167,268],[163,350],w*1.3),L([163,350],[161,424],w*1.05),L([193,268],[197,350],w*1.3),L([197,350],[199,424],w*1.05)].join('');
  const torso='M142 98 Q180 86 218 98 Q227 140 222 178 Q217 214 206 240 L154 240 Q143 214 138 178 Q133 140 142 98 Z',pelvis='M154 236 L206 236 Q215 256 205 272 Q180 284 155 272 Q145 256 154 236 Z';
  let g=`<defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A2230"/><stop offset="1" stop-color="#11171F"/></linearGradient><linearGradient id="scan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34E39A" stop-opacity="0"/><stop offset=".85" stop-color="#34E39A" stop-opacity=".16"/><stop offset="1" stop-color="#34E39A" stop-opacity="0"/></linearGradient></defs>`;
  g+=`<g stroke="${O}" stroke-linecap="round" fill="none">${limbs(20)}</g><g stroke="#161D27" stroke-linecap="round" fill="none">${limbs(17)}</g>`;
  g+=`<g fill="url(#bg1)" stroke="${O}" stroke-width="1.6"><path d="${pelvis}"/><path d="${torso}"/><rect x="170" y="74" width="20" height="22" rx="7"/><circle cx="180" cy="48" r="27"/></g>`;
  g+=`<g stroke="#212A36" stroke-width="1" fill="none"><path d="M180 100 V236"/><path d="M152 150 Q180 160 208 150"/><path d="M156 196 Q180 204 204 196"/></g>`;
  if(!RM)g+=`<rect x="100" width="160" height="56" fill="url(#scan)"><animate attributeName="y" values="-40;420" dur="4.5s" repeatCount="indefinite"/></rect>`;
  const left=Z.filter(z=>ZLEFT.includes(z.id)),right=Z.filter(z=>!ZLEFT.includes(z.id));
  [[left,8,'start',112],[right,352,'end',248]].forEach(([arr,tx,anc,lx])=>{arr.sort((a,b)=>ZP[a.id][1]-ZP[b.id][1]);let last=-99;arr.forEach(z=>{const p=ZP[z.id],y=Math.max(p[1],last+32);last=y;
    g+=`<path d="M ${p[0]} ${p[1]} L ${lx} ${y} L ${anc==='start'?tx+96:tx-96} ${y}" fill="none" stroke="${z.col}" stroke-width="1.1" opacity=".55"/>`;
    g+=`<text x="${tx}" y="${y-5}" text-anchor="${anc}" fill="${z.col}" font-size="12.5" font-weight="800" font-family="Manrope">${esc(z.l)}</text><text x="${tx}" y="${y+11}" text-anchor="${anc}" fill="#8B96A6" font-size="10.5" font-weight="600" font-family="Manrope">${esc(z.why.length>20?z.why.slice(0,19)+'…':z.why)}</text>`})});
  Z.forEach(z=>{const p=ZP[z.id];g+=`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="${z.col}"/>`+(RM?'':`<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="none" stroke="${z.col}" stroke-width="2"><animate attributeName="r" values="6;16" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2.2s" repeatCount="indefinite"/></circle>`)});
  if(target){target.innerHTML=g;return}
  $('#bodymap').innerHTML=g;$('#zN').textContent=Z.length+' zona'+(Z.length===1?'':'s');
  $('#zl').innerHTML=Z.map(z=>`<div><i style="background:${z.col}"></i><span><b>${esc(z.l)}</b> <span class="muted">· ${esc(z.why)}</span></span></div>`).join('')}

/* perfil previo al vuelo: antecedentes → vigilancias */
const HX=ANTECEDENTES;
const FIT=[['alta','Condición física alta'],['media','Condición media'],['baja','Condición baja']];
const RULES=[
 {k:c=>c.hx.includes('rinon'),l:'warn',t:'Riñón',tip:'Bebe agua repartida en el día.',d:'Hidratación durante el día y prueba de orina periódica.',w:'En microgravedad el hueso libera calcio y se bebe menos. NASA aprueba este antecedente con vigilancia y es uno de los escenarios del CDSS.',s:['waiver','kidney']},
 {k:c=>c.hx.includes('ojo'),l:'warn',t:'Visión',tip:'Haz tu revisión de ojos semanal.',d:'Revisión de ojos semanal, además de los días 30, 90 y R-30.',w:'NASA encontró que la genética y las vitaminas B hacen a algunos astronautas más propensos a cambios oculares.',s:['zwart','sanshw']},
 {k:c=>c.fit==='baja',l:'warn',t:'Defensas',tip:'Cumple tu rutina de ejercicio de hoy.',d:'Cumplir la rutina de ejercicio aeróbico y de fuerza.',w:'En 22 astronautas de la ISS, una mejor condición física previa se asoció con menos reactivación de virus latentes.',s:['agha']},
 {k:c=>c.sex==='f',l:'none',t:'Regreso a la Tierra',d:'Al aterrizar, incorporarse por etapas y con líquidos.',w:'El mareo al ponerse de pie después del vuelo fue más frecuente en mujeres en los datos de NASA.',s:['sex']},
 {k:c=>c.hx.includes('coagulo'),l:'bad',t:'Coagulación',tip:'Revisa si hay dolor o hinchazón en cuello, brazos o piernas.',d:'Ultrasonido programado y señales de alarma: dolor o hinchazón en cuello, brazos o piernas.',w:'En la ISS se detectó un coágulo en la yugular de un astronauta, tratado con guía desde la Tierra.',s:['clot','waiver']},
 {k:c=>c.hx.includes('arritmia'),l:'warn',t:'Ritmo cardiaco',tip:'Registra tu pulso hoy.',d:'Registro diario del pulso y guía si hay palpitaciones.',w:'Tras 6 meses en la ISS la aurícula izquierda cambia de forma temporal. NASA aprueba arritmias tratadas con seguimiento.',s:['af','waiver']},
 {k:c=>c.hx.includes('presion'),l:'none',t:'Presión arterial',tip:'Toma tu medicamento a la misma hora.',d:'Medición dos veces por semana y medicamento a la misma hora.',w:'NASA ha aprobado astronautas con hipertensión y antihipertensivos a bordo.',s:['waiver']},
 {k:c=>c.hx.includes('cadera'),l:'warn',t:'Articulación',d:'Ejercicios de carga sin interrupciones.',w:'NASA ha aprobado astronautas con reemplazo de cadera, vigilando la pérdida ósea.',s:['waiver','std']},
 {k:c=>c.hx.includes('columna'),l:'warn',t:'Columna',d:'Reportar dolor o adormecimiento; cuidado en lanzamiento, aterrizaje y caminatas espaciales.',w:'La columna se alarga en microgravedad y las cargas pueden agravar una hernia.',s:['waiver']},
 {k:c=>c.hx.includes('apnea'),l:'warn',t:'Sueño',tip:'Haz tu turno de Órbita: muestra si el sueño te está afectando.',d:'Turno diario de Órbita: si tu atención baja varios días, ajustar el descanso.',w:'NASA aprueba la apnea leve, pero en vuelo se duerme menos que en la Tierra.',s:['waiver','sleep']},
];
function renderProfile(c){const P=RULES.filter(r=>r.k(c));$('#pN').textContent=P.length?P.length+' vigilancia'+(P.length>1?'s':''):'Plan general';
  $('#hx').innerHTML=HX.map(([k,l])=>`<button type="button" data-k="${k}" aria-pressed="${c.hx.includes(k)}">${l}</button>`).join('');
  $('#fit').innerHTML=FIT.map(([k,l])=>`<button type="button" data-k="${k}" aria-pressed="${c.fit===k}">${l}</button>`).join('');
  $$('#hx button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;c.hx=c.hx.includes(k)?c.hx.filter(x=>x!==k):[...c.hx,k];save();renderPersona()});
  $$('#fit button').forEach(b=>b.onclick=()=>{c.fit=b.dataset.k;save();renderPersona()});
  $('#watch').innerHTML=P.map(r=>`<div class="wi"><span style="width:10px;height:10px;border-radius:50%;background:${COL[r.l]}"></span><span class="t">${r.t}</span><span class="ev ${SRC[r.s[0]].ev}">${SRC[r.s[0]].ev}</span><p>${r.d}</p><details><summary>Por qué</summary><p>${r.w}</p><p style="margin-top:6px">${r.s.map(sLink).join(' · ')}</p></details></div>`).join('')||'<p class="muted small">Sin antecedentes marcados.</p>'}

