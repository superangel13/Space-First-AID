'use strict';
/* ================= RITMO CIRCADIANO · guía de sueño =================
   En el espacio se pierde la noción del día y la noche: en la Estación
   Espacial hay unos 16 amaneceres al día y en la Luna el día dura unos
   29.5 días terrestres. El reloj del cuerpo se guía por la luz, así que la
   app marca un día de 24 h (hora UTC de la misión) con fases de luz:
   azul para despertar, blanca de día, cálida antes de dormir y oscuridad. */
const FASES_LUZ=[
  {de:6,a:7,n:'Despertar',luz:'Luz azul brillante',col:'#7FB2FF',tip:'Prende la luz azul de la cabina y abre la cortina: le dice a tu cuerpo que empezó el día.'},
  {de:7,a:19.5,n:'Día',luz:'Luz blanca',col:'#F7D154',tip:'Mantén luz blanca intensa mientras trabajas y haz tu ejercicio antes de la tarde.'},
  {de:19.5,a:21.5,n:'Preparar el sueño',luz:'Luz cálida y tenue',col:'#FF9F5A',tip:'Cambia a luz cálida, baja las pantallas y evita el ejercicio intenso. Prueba la respiración guiada.'},
  {de:21.5,a:30,n:'Dormir',luz:'Oscuridad',col:'#5B6CFF',tip:'Antifaz y tapones si hay luz o ruido. Duerme en tu saco, a la misma hora todos los días: meta de 8 h.'}];
function faseLuz(h){const x=h<6?h+24:h;return FASES_LUZ.find(f=>x>=f.de&&x<f.a)||FASES_LUZ[3]}
function afuera(){const z=mzAt(DAY);
  if(z.id==='leo')return{t:'Afuera: unos 16 amaneceres al día',d:'La Estación da una vuelta a la Tierra cada 90 minutos: 45 de luz y 45 de oscuridad. Por eso la luz de la cabina es la que marca el día.',orb:90};
  if(z.id==='sur')return{t:'Afuera: un día lunar dura unos 29.5 días',d:'En la base hay cerca de dos semanas seguidas de luz solar y dos de oscuridad. Sin la cabina, el cuerpo no sabría qué hora es.',orb:0};
  return{t:'Afuera: no hay día ni noche de 24 h',d:'En el viaje la nave puede estar con sol todo el tiempo. Tu día lo marcan la luz de la cabina y el horario de la tripulación.',orb:0}}
function circSVG(h){const f=faseLuz(h),R=92,C=110,ang=x=>(x/24)*Math.PI*2-Math.PI/2,P=(x,r)=>[C+r*Math.cos(ang(x)),C+r*Math.sin(ang(x))];
  const arc=(a,b,r)=>{const p0=P(a,r),p1=P(b,r),lg=((b-a+24)%24)>12?1:0;return `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A ${r} ${r} 0 ${lg} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`};
  const seg=FASES_LUZ.map(x=>`<path d="${arc(x.de%24,x.a%24,R)}" stroke="${x.col}" stroke-width="12" fill="none" stroke-linecap="butt" opacity="${x===f?1:.35}"/>`).join('');
  const ticks=Array.from({length:24},(_,i)=>{const a=P(i,R-14),b=P(i,R-(i%6?18:24));return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="#2A3442" stroke-width="${i%6?1:2}"/>`}).join('');
  const lab=[0,6,12,18].map(i=>{const p=P(i,R-34);return `<text x="${p[0].toFixed(1)}" y="${(p[1]+4).toFixed(1)}" text-anchor="middle" fill="#5A6576" font-size="11" font-weight="800" font-family="Manrope">${String(i).padStart(2,'0')}</text>`}).join('');
  const sp=P(h,R),noche=f.n==='Dormir';
  const estrellas=noche?Array.from({length:14},(_,i)=>{const r=rng(i*7+3),x=C+(r()-.5)*96,y=C+(r()-.5)*96;return `<circle class="cst" style="animation-delay:${(r()*3).toFixed(1)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(r()*1.1+.5).toFixed(1)}" fill="#fff"/>`}).join(''):'';
  return `<svg viewBox="0 0 220 220" class="circsvg" role="img" aria-label="Reloj de luz de 24 horas">
    <defs><radialGradient id="cielo" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${f.col}" stop-opacity=".55"/><stop offset="1" stop-color="#05070A" stop-opacity="0"/></radialGradient></defs>
    <circle cx="${C}" cy="${C}" r="${R+12}" fill="#0B0F14" stroke="#18212B"/><circle class="cglow" cx="${C}" cy="${C}" r="${R-26}" fill="url(#cielo)"/>${estrellas}${ticks}${lab}${seg}
    <line x1="${C}" y1="${C}" x2="${sp[0].toFixed(1)}" y2="${sp[1].toFixed(1)}" stroke="#EEF2F6" stroke-width="2" opacity=".5"/>
    <g transform="translate(${sp[0].toFixed(1)} ${sp[1].toFixed(1)})"><circle class="cpulse" r="14" fill="${f.col}" opacity=".25"/>${noche?`<path d="M3-8a8 8 0 1 0 5 13 6.5 6.5 0 1 1-5-13z" fill="#E6EBFF"/>`:`<circle r="8" fill="${f.col}"/>`}</g>
    <text x="${C}" y="${C-4}" text-anchor="middle" fill="#EEF2F6" font-size="26" font-weight="700" font-family="Sora">${String(Math.floor(h)).padStart(2,'0')}:${String(Math.floor((h%1)*60)).padStart(2,'0')}</text>
    <text x="${C}" y="${C+16}" text-anchor="middle" fill="#8B96A6" font-size="10.5" font-weight="800" letter-spacing="1.5" font-family="Manrope">UTC · MISIÓN</text></svg>`}
function orbitaMini(a){if(!a.orb)return'';return `<svg viewBox="0 0 120 120" class="orbmini" aria-hidden="true"><defs><linearGradient id="term" x1="0" x2="1"><stop offset=".5" stop-color="#1D3F8A"/><stop offset=".5" stop-color="#05070A"/></linearGradient></defs>
  <circle cx="60" cy="60" r="26" fill="url(#term)" stroke="#2C8F86" stroke-opacity=".4"/><circle cx="60" cy="60" r="44" fill="none" stroke="#243041" stroke-dasharray="2 4"/>
  <g class="orbgira"><circle cx="104" cy="60" r="4.5" fill="#EEF2F6"/></g></svg>`}
function renderCirc(){const el=$('#circ');if(!el)return;const d=new Date(),h=d.getUTCHours()+d.getUTCMinutes()/60,f=faseLuz(h),a=afuera();
  const sueno=CREW.map(c=>today(c).sl).filter(x=>x!=null),prom=sueno.length?mean(sueno):null;
  const hDormir=((21.5-h)+24)%24,hh=Math.floor(hDormir),mm=Math.round((hDormir-hh)*60);
  el.innerHTML=`<div class="circ-dial">${circSVG(h)}</div>
   <div class="circ-txt"><span class="cap">Ritmo circadiano · guía de sueño</span><h2>${esc(f.n)}: <span style="color:${f.col}">${esc(f.luz.toLowerCase())}</span></h2>
     <p>${esc(f.tip)}</p>
     <div class="circ-k"><div><span class="cap">Hora de dormir</span><b class="num">21:30</b><small>${f.n==='Dormir'?'ahora':`en ${hh} h ${mm} min`}</small></div><div><span class="cap">Despertar</span><b class="num">06:00</b><small>8.5 h para dormir</small></div><div><span class="cap">Anoche</span><b class="num">${prom!=null?prom.toFixed(1)+' h':'—'}</b><small>promedio de la tripulación</small></div></div>
     <div class="circ-out">${orbitaMini(a)}<div><b>${esc(a.t)}</b><p class="muted small">${esc(a.d)}</p></div></div>
     <div class="circ-act"><a class="btn ghost sm" href="#midia">Respiración guiada antes de dormir</a></div></div>`}
setInterval(()=>{if(CUR==='panel')renderCirc()},30000);
