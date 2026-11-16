'use strict';
/* ================= puntuaciones ================= */
const SC={
  sleep:(c,e)=>e.sl==null?null:clamp(Math.round(e.sl/8*100),0,100),
  heart:(c,e)=>e.hr==null?null:clamp(Math.round(100-Math.max(0,(e.hr-c.base.hr)/c.base.hr*100)*4),0,100),
  mind:(c,e)=>e.rt==null?null:clamp(Math.round(100-Math.max(0,e.rt/c.base.rt-1)*400),0,100),
  oxy:(c,e)=>e.sp==null?null:clamp(Math.round(100-Math.max(0,c.base.sp-e.sp)*12),0,100),
};
/* Estado general = promedio de los 6 sistemas del cuerpo (los calcula Python). */
const SIS_ORDEN=['inmunologico','cardiovascular','neuro_ocular','cognitivo','radiacion','musculo'];
const ready=c=>{const s=SIS[c.id];return s?Math.round(mean(SIS_ORDEN.map(k=>s[k].valor))):null};
const readyE=(c,e)=>e===today(c)?ready(c):null;
const lvlR=v=>v==null?'none':v>=70?'good':v>=45?'warn':'bad';
const COL={good:'#34E39A',warn:'#F5B841',bad:'#FF5468',none:'#5A6576'};
function eyeState(c){const e=[c.vis.OI,c.vis.OD];if(e.some(x=>x.am==='marcas'||(x.lc!=null&&x.lc<=4)))return{l:'warn',w:'Cambio'};if(e.some(x=>x.am==null||x.lc==null))return{l:'none',w:'Pendiente'};return{l:'good',w:'Sin cambios'}}
/* Qué conviene hacer: el primer paso del protocolo de cada problema activo */
function alerts(c){return evalKB(c).filter(r=>r.lvl).map(r=>({l:r.lvl>=2?'bad':'warn',k:r.k.id,t:r.k.n,do:r.k.protocolo[0]}))}
function estadoDe(c){const s=SIS[c.id];if(!s)return{l:'none',t:'Sin datos'};const R=evalKB(c);
  if(R.some(r=>r.lvl>=2))return{l:'bad',t:'Emergencia'};const min=Math.min(...SIS_ORDEN.map(k=>s[k].valor));
  if(min<60)return{l:'bad',t:'Revisar ahora'};if(R.some(r=>r.lvl===1)||min<80)return{l:'warn',t:'Ve a tu ritmo'};return{l:'good',t:'En forma'}}
