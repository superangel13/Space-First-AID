'use strict';
/* =====================================================================
   MISIÓN A LA LUNA: trayectoria, zonas y proyección por tripulante
   ===================================================================== */
const MZ_TODAS=[
 {id:'atm',n:'Despegue',ph:'Salida de la Tierra',dur:.02,g:3,dr:.01,km:[0,200],c:'#2F6FB5',w:2,d:'Aceleración de hasta unas 3 g al atravesar la atmósfera.'},
 {id:'leo',n:'Órbita baja terrestre',ph:'Salida de la Tierra',dur:1,g:0,dr:.5,km:[400,400],c:'#2C8F86',w:2.6,d:'Por debajo de los cinturones de Van Allen, donde orbita la ISS. Empieza la microgravedad.'},
 {id:'vin',n:'Cinturón interno de Van Allen',ph:'Salida de la Tierra',dur:.06,g:0,dr:15,km:[1000,6000],c:'#B8414F',w:3.6,d:'Protones atrapados por el campo magnético: la dosis sube mucho y se cruza rápido.'},
 {id:'slot',n:'Región entre cinturones',ph:'Salida de la Tierra',dur:.05,g:0,dr:2,km:[6000,13000],c:'#5A4B8F',w:2.4,d:'Zona con menos partículas atrapadas.'},
 {id:'vout',n:'Cinturón externo de Van Allen',ph:'Salida de la Tierra',dur:.12,g:0,dr:8,km:[13000,60000],c:'#8B3FB8',w:3.6,d:'Electrones de alta energía atrapados: segunda zona de radiación alta.'},
 {id:'mag',n:'Magnetosfera exterior',ph:'Salida de la Tierra',dur:.8,g:0,dr:1,km:[60000,120000],c:'#3A4F9C',w:3,d:'El campo magnético de la Tierra todavía desvía parte de las partículas solares.'},
 {id:'cis',n:'Espacio cislunar',ph:'Tránsito a la Luna',dur:2,g:0,dr:1.8,km:[120000,370000],c:'#1D3557',w:13,d:'Sin la protección magnética de la Tierra: rayos cósmicos todo el tiempo (cerca de 1.8 mSv por día).'},
 {id:'lor',n:'Órbita lunar',ph:'Llegada a la Luna',dur:1.5,g:0,dr:1.4,km:[384400,384400],c:'#4A5568',w:4,d:'Preparación del descenso. La Luna tapa parte del cielo y baja un poco la radiación.'},
 {id:'dsc',n:'Descenso',ph:'Llegada a la Luna',dur:.05,g:.17,dr:1.4,km:[384400,384400],c:'#8A93A3',w:2,d:'Primer cambio de gravedad tras días en microgravedad: cuidado con el equilibrio.'},
 {id:'sur',n:'Base en la superficie lunar',ph:'Estancia en la Luna',dur:0,g:.17,dr:.6,km:[384400,384400],c:'#6B7280',w:44,d:'Gravedad de 0.17 g. Sin atmósfera ni campo magnético: el refugio de la base es clave en tormentas solares.'},
 {id:'asc',n:'Despegue lunar',ph:'Regreso',dur:1.5,g:0,dr:1.4,km:[384400,384400],c:'#4A5568',w:3,d:'Ascenso a órbita lunar y salida hacia la Tierra.'},
 {id:'ret',n:'Regreso cislunar',ph:'Regreso',dur:3,g:0,dr:1.8,km:[384400,60000],c:'#1D3557',w:12,d:'Tres días de vuelta por el espacio profundo.'},
 {id:'ree',n:'Reentrada',ph:'Regreso',dur:.05,g:4,dr:.01,km:[200,0],c:'#C0532D',w:2,d:'Desaceleración intensa y regreso a 1 g: la presión puede bajar al ponerse de pie.'},
];
/* las zonas dependen del destino registrado (datos/destinos.json) */
const MZ=(()=>{const ids=DESTINO.zonas||MZ_TODAS.map(z=>z.id),est=DESTINO.zona_estancia||'sur',L=MZ_TODAS.filter(z=>ids.includes(z.id)).map(z=>({...z,...((DESTINO.ajustes||{})[z.id]||{})}));
  if(est==='lor'){const z=L.find(x=>x.id==='lor');z.n=DESTINO.id==='luna_orbita'?'Estación en órbita lunar':'Órbita lunar';z.ph='Estancia en la Luna';z.w=30}
  if(est==='leo'){const z=L.find(x=>x.id==='leo');z.n='Estación en órbita baja';z.ph='Estancia en órbita';z.w=60}
  const fijo=L.filter(z=>z.id!==est).reduce((a,z)=>a+z.dur,0),e=L.find(z=>z.id===est);e.dur=Math.max(.5,LEN-fijo);
  if(fijo>=LEN){const k=(LEN-.5)/fijo;L.forEach(z=>{if(z!==e)z.dur*=k})}
  let t=0;L.forEach(z=>{z.start=t;t+=z.dur;z.end=t});return L})();
const PROT=new Set(['atm','leo','vin','slot','vout','mag','ree']);
const MS={t:DAY,run:false,speed:5,storms:[],log:[],last:0,lastZ:null};
const mzAt=t=>MZ.find(z=>t>=z.start&&t<z.end)||MZ[MZ.length-1];
const zf=(z,t)=>clamp((t-z.start)/(z.dur||1),0,1);
const kmAt=t=>{const z=mzAt(t),f=zf(z,t);return z.km[0]+(z.km[1]-z.km[0])*f};
const stormOn=t=>MS.storms.some(s=>t>=s.t&&t<s.t+s.dur)&&!PROT.has(mzAt(t).id);
const drAt=t=>mzAt(t).dr+(stormOn(t)?250:0);
function mDose(t){let d=0;MZ.forEach(z=>{if(t>z.start)d+=Math.min(t,z.end)-z.start>0?(Math.min(t,z.end)-z.start)*z.dr:0});MS.storms.forEach(s=>{const a=Math.max(s.t,0),b=Math.min(s.t+s.dur,t);if(b>a&&!PROT.has(mzAt(a).id))d+=(b-a)*250});return d}
function mBone(c,t){const k=c.fit==='alta'?.75:c.fit==='baja'?1.3:1;let b=0;MZ.forEach(z=>{if(t<=z.start)return;const dd=Math.min(t,z.end)-z.start,r=z.g<.05?1.25:z.g<.5?.625:0;b+=dd*r/30});return b*k}
const doseAt=(c,t)=>c.prior+mDose(t)*(c.eva?1.1:1);
const ME=[170,180],MM=[1250,160],OUT=[[440,110],[760,-30],[1050,0],[1186,118]],RET=[[1196,205],[1000,330],[600,330],[245,226]];
const cub=(P,u)=>{const v=1-u;return[0,1].map(i=>v*v*v*P[0][i]+3*v*v*u*P[1][i]+3*v*u*u*P[2][i]+u*u*u*P[3][i])};
const lerp=(a,b,f)=>[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];
function shipPos(t){const z=mzAt(t),f=zf(z,t),a0=-.43,rad=r=>[ME[0]+r*Math.cos(a0),ME[1]+r*Math.sin(a0)],aIn=Math.atan2(OUT[3][1]-MM[1],OUT[3][0]-MM[0]);
  switch(z.id){case'atm':return rad(58+f*10);case'leo':{const a=a0+f*Math.PI*4;return[ME[0]+72*Math.cos(a),ME[1]+72*Math.sin(a)]}
   case'vin':return rad(76+f*36);case'slot':return rad(112+f*14);case'vout':return rad(126+f*34);case'mag':return lerp(rad(160),OUT[0],f);case'cis':return cub(OUT,f);
   case'lor':{const a=aIn+f*Math.PI*4;return[MM[0]+70*Math.cos(a),MM[1]+70*Math.sin(a)]}case'dsc':return lerp([MM[0]+70*Math.cos(aIn),MM[1]+70*Math.sin(aIn)],[MM[0],MM[1]-44],f);
   case'sur':return[MM[0],MM[1]-44];case'asc':return lerp([MM[0],MM[1]-44],RET[0],f);case'ret':return cub(RET,f);default:return lerp(RET[3],[ME[0]+44,ME[1]+40],f)}}
function missionSVG(mini){const R=rng(99);let st='';for(let i=0;i<(mini?70:130);i++)st+=`<circle cx="${(R()*1400).toFixed(0)}" cy="${(R()*330).toFixed(0)}" r="${(R()*1.4+.4).toFixed(1)}" fill="#fff" opacity="${(R()*.5+.15).toFixed(2)}"/>`;
  const E=ME,M=MM,fs=mini?28:17,path=P=>`M ${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]}, ${P[2][0]} ${P[2][1]}, ${P[3][0]} ${P[3][1]}`;
  return `<defs><radialGradient id="gE${mini?'m':''}" cx=".35" cy=".35"><stop offset="0" stop-color="#7FB2FF"/><stop offset=".65" stop-color="#1D4FA8"/><stop offset="1" stop-color="#0A1A3A"/></radialGradient><radialGradient id="gM${mini?'m':''}" cx=".35" cy=".35"><stop offset="0" stop-color="#F1F4F8"/><stop offset=".7" stop-color="#9AA4B1"/><stop offset="1" stop-color="#5E6875"/></radialGradient><radialGradient id="gS${mini?'m':''}"><stop offset="0" stop-color="#F7D154" stop-opacity=".55"/><stop offset="1" stop-color="#F7D154" stop-opacity="0"/></radialGradient></defs>${st}
  <path d="M ${E[0]-40} ${E[1]-125} C ${E[0]+90} ${E[1]-160}, 450 ${E[1]-95}, 460 ${E[1]} C 450 ${E[1]+95}, ${E[0]+90} ${E[1]+160}, ${E[0]-40} ${E[1]+125}" fill="rgba(80,170,200,.06)" stroke="#5AA9C8" stroke-dasharray="6 6" stroke-width="1.5" opacity=".7"/>
  <circle cx="${E[0]}" cy="${E[1]}" r="142" fill="none" stroke="#8B3FB8" stroke-width="30" opacity=".42"/><circle cx="${E[0]}" cy="${E[1]}" r="98" fill="none" stroke="#B8414F" stroke-width="20" opacity=".5"/>
  <circle cx="${E[0]}" cy="${E[1]}" r="66" fill="none" stroke="#7FD0FF" stroke-width="3" opacity=".5"/><circle cx="${E[0]}" cy="${E[1]}" r="60" fill="url(#gE${mini?'m':''})"/>
  <path d="M ${E[0]-34} ${E[1]-18} q 25 -25 45 0 q 10 25 -15 40 q -30 5 -30 -40" fill="#3F9A4A" opacity=".75"/><ellipse cx="${E[0]}" cy="${E[1]-52}" rx="28" ry="7" fill="#E8F2FF" opacity=".8"/>
  <path d="${path(OUT)}" fill="none" stroke="#3D5A8A" stroke-width="2.5" stroke-dasharray="10 10"/><path d="${path(RET)}" fill="none" stroke="#3D5A8A" stroke-width="2" stroke-dasharray="4 10" opacity=".7"/>
  <circle cx="${M[0]}" cy="${M[1]}" r="70" fill="none" stroke="#8A93A3" stroke-dasharray="3 7" opacity=".55"/><circle cx="${M[0]}" cy="${M[1]}" r="42" fill="url(#gM${mini?'m':''})"/>
  <circle cx="${M[0]-12}" cy="${M[1]+8}" r="7" fill="#7C8794" opacity=".55"/><circle cx="${M[0]+14}" cy="${M[1]-10}" r="5" fill="#7C8794" opacity=".55"/><circle cx="${M[0]+6}" cy="${M[1]+20}" r="4" fill="#7C8794" opacity=".5"/>
  ${mini?'':`<text x="${E[0]-55}" y="${E[1]-162}" fill="#C08AF0" font-size="${fs}" font-family="Manrope" font-weight="700">cinturón externo</text><text x="${E[0]+42}" y="${E[1]-106}" fill="#F08A96" font-size="${fs-1}" font-family="Manrope" font-weight="700">cinturón interno</text><text x="372" y="${E[1]-112}" fill="#5AA9C8" font-size="${fs-1}" font-family="Manrope" font-weight="700">magnetosfera</text><text x="760" y="${E[1]-24}" text-anchor="middle" fill="#8B96A6" font-size="${fs}" font-family="Manrope" font-weight="700">espacio cislunar · 384,400 km</text>`}
  <text x="${E[0]}" y="318" text-anchor="middle" fill="#8B96A6" font-size="${fs}" font-family="Manrope" font-weight="800">Tierra · 1 g</text><text x="${M[0]}" y="318" text-anchor="middle" fill="#8B96A6" font-size="${fs}" font-family="Manrope" font-weight="800">${DESTINO.planeta==='Marte'?'Marte · 0.38 g':'Luna · 0.17 g'}</text>
  <g class="mStorm" opacity="0"><circle cx="1330" cy="40" r="80" fill="url(#gS${mini?'m':''})"/>${Array.from({length:12},(_,i)=>`<line x1="${600+i*58}" y1="${24+(i%4)*16}" x2="${570+i*58}" y2="${78+(i%4)*16}" stroke="#F7D154" stroke-width="2" opacity=".75"/>`).join('')}<text x="760" y="30" text-anchor="middle" fill="#F7D154" font-size="${fs+2}" font-family="Manrope" font-weight="800">TORMENTA SOLAR</text></g>
  <g class="mShip"><circle r="${mini?26:20}" fill="#34E39A" opacity=".18"><animate attributeName="r" values="${mini?'16;34;16':'12;26;12'}" dur="2s" repeatCount="indefinite"/></circle><circle r="${mini?13:9}" fill="#fff" stroke="#34E39A" stroke-width="${mini?5:3.5}"/></g>`}
function placeShip(svg,t){const p=shipPos(t),g=svg.querySelector('.mShip');if(g)g.setAttribute('transform',`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`);const s=svg.querySelector('.mStorm');if(s)s.setAttribute('opacity',stormOn(t)||(SHIP.tormenta&&Math.abs(t-DAY)<.5)?1:0)}
const fmtKm=k=>k<1000?Math.round(k)+' km':fmt(k)+' km';
const fmtDl=t=>{const s=kmAt(t)/299792.458;return s<.05?'menos de 0.1 s':s.toFixed(1)+' s'};
function mTilesHTML(t,full){const z=mzAt(t),dr=drAt(t);return [['Fase',z.ph],['Zona',z.n],['Gravedad',z.g>=1?z.g.toFixed(0)+' g':z.g>0?z.g.toFixed(2)+' g · gravedad parcial':'Microgravedad (0 g)'],['Radiación ahora',`<span class="${dr>=5?'hot':''}">${dr<1?dr.toFixed(2):dr.toFixed(1)} mSv/día</span>`],...(full?[['Día de misión',`${t.toFixed(1)} de ${LEN}`],['Distancia a la Tierra',fmtKm(kmAt(t))],['Retraso de la señal',fmtDl(t)],['Dosis de la misión',`${mDose(t).toFixed(0)} mSv`]]:[['Distancia a la Tierra',fmtKm(kmAt(t))],['Retraso de la señal',fmtDl(t)]])].map(([k,v])=>`<div><span class="cap">${k}</span><span class="num" style="font-size:${String(v).length>18?15:19}px">${v}</span></div>`).join('')}
function renderMision(){const svg=$('#mSvg');if(!svg.dataset.ok){svg.innerHTML=missionSVG(false);svg.dataset.ok=1}
  $('#zBar').innerHTML=MZ.map(z=>`<i style="flex:${z.w};background:${z.c}" data-z="${z.id}" title="${esc(z.n)}"></i>`).join('')+`<span class="zcur today" id="zToday"></span><span class="zcur" id="zCur"></span>`;
  $('#zLeg').innerHTML=MZ.filter(z=>!['atm','dsc','ree'].includes(z.id)).map(z=>`<span><i style="background:${z.c}"></i>${esc(z.n)}</span>`).join('');
  $$('#zBar [data-z]').forEach(el=>el.onclick=()=>{const z=MZ.find(x=>x.id===el.dataset.z);MS.t=z.start+Math.min(.5,z.dur/2);MS.run=false;mUI()});
  $$('#mSpd button').forEach(b=>{b.setAttribute('aria-pressed',+b.dataset.s===MS.speed);b.onclick=()=>{MS.speed=+b.dataset.s;$$('#mSpd button').forEach(x=>x.setAttribute('aria-pressed',x===b))}});
  $('#mPlay').onclick=()=>{if(MS.t>=LEN-.01)MS.t=0;MS.run=!MS.run;MS.last=0;mUI();if(MS.run)requestAnimationFrame(mFrame)};
  $('#mScrub').oninput=e=>{MS.run=false;MS.t=+e.target.value;mUI()};
  $('#mToday').onclick=()=>{MS.run=false;MS.t=DAY;mUI()};
  $('#mStormBtn').onclick=()=>{MS.storms.push({t:MS.t,dur:1.2});mlog(`Tormenta solar simulada en día ${MS.t.toFixed(1)}${PROT.has(mzAt(MS.t).id)?' · la magnetosfera protege a la nave':' · tripulación al refugio'}`,PROT.has(mzAt(MS.t).id)?1:2);if(Math.abs(MS.t-DAY)<1&&!SHIP.tormenta)shipScen('tormenta');mUI()};
  $('#mH1').textContent=DESTINO.nombre||'Misión';$('#mCapT').textContent=`Trayectoria y entorno · ${LEN} días`;$('#mP').textContent=DESTINO.descripcion||'';$('#mScrub').max=LEN;$('#mToday').textContent=`Ir a hoy (día ${DAY})`;
  if(!MS.log.length)mlog(`Día ${DAY}: ${mzAt(DAY).n.toLowerCase()}`,0);mUI()}
function mlog(txt,l){MS.log.unshift({d:MS.t,txt,l});MS.log.length=Math.min(MS.log.length,40);if($('#mLog'))$('#mLog').innerHTML=MS.log.map(x=>`<div><time>D${x.d.toFixed(1)}</time><i style="background:${['#5A6576','#F5B841','#FF5468'][x.l]}"></i><span>${esc(x.txt)}</span></div>`).join('')}
function mUI(){if(CUR!=='mision')return;const t=MS.t,z=mzAt(t);placeShip($('#mSvg'),t);
  const tot=MZ.reduce((a,x)=>a+x.w,0),pos=tt=>{let acc=0;for(const x of MZ){if(tt<x.end){acc+=x.w*zf(x,tt);break}acc+=x.w}return acc/tot*100};$('#zCur').style.left=pos(t)+'%';$('#zToday').style.left=pos(DAY)+'%';
  $('#mTiles').innerHTML=mTilesHTML(t,true);$('#mPlay').textContent=MS.run?'Pausar':t>=LEN-.01?'Repetir viaje':'Reproducir viaje';const sc=$('#mScrub');if(document.activeElement!==sc)sc.value=t;
  if(MS.lastZ!==z.id){if(MS.lastZ&&MS.run)mlog(`Entra a: ${z.n}`,PROT.has(z.id)||z.dr<5?0:1);MS.lastZ=z.id}
  $('#mCrewCap').textContent=`Día ${t.toFixed(0)} · al regreso (día ${LEN})`;
  $('#mCrew').innerHTML=CREW.map(c=>{const d=doseAt(c,t),dE=doseAt(c,LEN),b=mBone(c,t),bE=mBone(c,LEN);return `<div class="brow"><b style="color:${c.col}">${esc(c.n)}</b><div style="display:grid;gap:8px"><div><div class="btrk"><i style="width:${Math.min(100,d/600*100)}%;background:${d/600>.8?'#FF5468':d/600>.5?'#F5B841':'#F7D154'}"></i><em style="left:${Math.min(100,dE/600*100)}%" title="Al regreso"></em></div><div class="bsub">Radiación de carrera ${d.toFixed(0)} mSv (${(d/6).toFixed(0)} %) · al regreso ${dE.toFixed(0)} mSv</div></div><div><div class="btrk"><i style="width:${Math.min(100,b/10*100)}%;background:#A28CFF"></i><em style="left:${Math.min(100,bE/10*100)}%"></em></div><div class="bsub">Pérdida ósea estimada ${b.toFixed(1)} % · al regreso ${bE.toFixed(1)} %</div></div></div></div>`}).join('')}
function mFrame(ts){if(!MS.run||CUR!=='mision')return;const dt=MS.last?Math.min(.1,(ts-MS.last)/1000):0;MS.last=ts;const before=stormOn(MS.t);MS.t=Math.min(LEN,MS.t+dt*MS.speed*(MS.t<5.5||(MS.t>LEN-4&&MS.t<LEN)?.08:1));
  if(MS.t>=LEN){MS.run=false;mlog('Amerizaje: fin de la misión',0)}mUI();requestAnimationFrame(mFrame)}
function renderMini(){const svg=$('#miniSvg');if(!svg.dataset.ok){svg.innerHTML=missionSVG(true);svg.dataset.ok=1}placeShip(svg,DAY);$('#miniTiles').innerHTML=mTilesHTML(DAY,false)}

