'use strict';
/* ================= puntuaciones ================= */
const SC={
  sleep:(c,e)=>e.sl==null?null:clamp(Math.round(e.sl/8*100),0,100),
  heart:(c,e)=>e.hr==null?null:clamp(Math.round(100-Math.max(0,(e.hr-c.base.hr)/c.base.hr*100)*4),0,100),
  mind:(c,e)=>e.rt==null?null:clamp(Math.round(100-Math.max(0,e.rt/c.base.rt-1)*400),0,100),
  oxy:(c,e)=>e.sp==null?null:clamp(Math.round(100-Math.max(0,c.base.sp-e.sp)*12),0,100),
};
const readyE=(c,e)=>{const s=SC.sleep(c,e),h=SC.heart(c,e),m=SC.mind(c,e);return s==null||h==null||m==null?null:Math.round(s*.35+m*.35+h*.3)};
const ready=c=>readyE(c,today(c));
const lvlR=v=>v==null?'none':v>=70?'good':v>=45?'warn':'bad';
const COL={good:'#34E39A',warn:'#F5B841',bad:'#FF5468',none:'#5A6576'};
function eyeState(c){const e=[c.vis.OI,c.vis.OD];if(e.some(x=>x.am==='marcas'||(x.lc!=null&&x.lc<=4)))return{l:'warn',w:'Cambio'};if(e.some(x=>x.am==null||x.lc==null))return{l:'none',w:'Pendiente'};return{l:'good',w:'Sin cambios'}}
function alerts(c){const e=today(c),a=[];
  if(c.noData&&e.sl==null)a.push({l:'none',k:'nodata',t:'Sin datos hoy',do:'Ponte el sensor y haz tu turno de Órbita.'});
  if(e.sp!=null&&e.sp<=c.base.sp-4)a.push({l:'bad',k:'oxy',t:`Oxígeno ${e.sp} %`,do:'Siéntate, respira lento y vuelve a medir en 2 minutos. Si sigue bajo, avisa al oficial médico.'});
  if(eyeState(c).l==='warn')a.push({l:'warn',k:'eye',t:'Cambio en la vista',do:'Repite la revisión de ojos mañana a la misma hora y avisa al oficial médico.'});
  const m=SC.mind(c,e);if(m!=null&&m<70)a.push({l:'warn',k:'mind',t:'Atención más lenta',do:'Antes de una tarea delicada, toma un descanso corto o pide doble verificación.'});
  const s=SC.sleep(c,e);if(s!=null&&s<80)a.push({l:'warn',k:'sleep',t:'Durmió poco',do:'Esta noche adelanta 30 minutos la hora de dormir y evita pantallas antes.'});
  const h=SC.heart(c,e);if(h!=null&&h<70)a.push({l:'warn',k:'heart',t:'Pulso alto en reposo',do:'Bebe agua y vuelve a medir el pulso en reposo.'});
  return a}
function estadoDe(c){const A=alerts(c),r=ready(c);if(r==null)return{l:'none',t:'Sin datos'};if(A.some(a=>a.l==='bad'))return{l:'bad',t:'Revisar ahora'};const L=lvlR(r);if(L==='bad')return{l:'bad',t:'Descansar'};if(L==='warn'||A.some(a=>a.l==='warn'))return{l:'warn',t:'Ve a tu ritmo'};return{l:'good',t:'En forma'}}

