'use strict';
/* =====================================================================
   ENTORNO DE LA NAVE (indicadores semicirculares)
   ===================================================================== */
function gauge(v,lo,hi,warn,bad,col,lab,val,inv){const p=clamp((v-lo)/(hi-lo),0,1),a=Math.PI*(1-p),x=60+46*Math.cos(a),y=60-46*Math.sin(a),l=inv?(v<=bad?2:v<=warn?1:0):(v>=bad?2:v>=warn?1:0),cc=['#34E39A','#F5B841','#FF5468'][l]||col;
  return `<div class="gg"><svg viewBox="0 0 120 70"><path d="M 14 60 A 46 46 0 0 1 106 60" fill="none" stroke="#1E2733" stroke-width="9" stroke-linecap="round"/><path d="M 14 60 A 46 46 0 ${p>.5?0:0} 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="${cc}" stroke-width="9" stroke-linecap="round"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#05070A" stroke="${cc}" stroke-width="2.5"/></svg><b style="color:${l?cc:'var(--text)'}">${val}</b><span>${lab}</span></div>`}
function updateEnv(){const els=$$('[data-env]').filter(e=>e.offsetParent);if(!els.length)return;const E=ENV;
  const h=gauge(E.co2,0,8000,4000,5000,'','CO₂ en cabina',fmt(E.co2)+' ppm')+gauge(E.o2,19,23,20.4,19.8,'','Oxígeno',E.o2.toFixed(1)+' %',true)+gauge(E.p,95,105,200,200,'','Presión',E.p.toFixed(1)+' kPa')+gauge(E.t,16,30,27,29,'','Temperatura',E.t.toFixed(1)+' °C')+gauge(E.h,0,100,70,80,'','Humedad',Math.round(E.h)+' %')+gauge(Math.log10(Math.max(1,E.rad)),0,3.5,2,2.7,'','Radiación',fmt(E.rad)+' µSv/h');
  els.forEach(e=>e.innerHTML=h)}

