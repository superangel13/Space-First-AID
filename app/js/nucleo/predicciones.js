'use strict';
/* =====================================================================
   PRONÓSTICOS (regresión lineal sobre 10 días → 7 días)
   ===================================================================== */
function linfit(y){const n=y.length,mx=(n-1)/2,my=mean(y);let sxy=0,sxx=0,syy=0;y.forEach((v,i)=>{sxy+=(i-mx)*(v-my);sxx+=(i-mx)**2;syy+=(v-my)**2});const m=sxx?sxy/sxx:0;return{m,b:my-m*mx,r2:syy&&sxx?(sxy*sxy)/(sxx*syy):0}}
function fc(c,key,N=10,Hh=7){const h=c.days.slice(-N).map(e=>key==='ready'?readyE(c,e):e[key]);if(h.filter(v=>v!=null).length<6)return null;const idx=h.map((v,i)=>v==null?null:i).filter(i=>i!=null),y=idx.map(i=>h[i]);
  const L=linfit(y),last=idx.length-1;return{h,L,proj:Array.from({length:Hh},(_,i)=>L.b+L.m*(last+1+i)),last:h[idx[last]]}}
const PR=[
 {key:'sl',n:'Sueño',dir:-1,thr:c=>6.4,f:v=>v.toFixed(1)+' h',msg:'podría dormir menos de 6.4 h por noche',part:'brain',steps:['Adelanta 30 minutos la hora de dormir.','Evita pantallas y luz intensa antes de dormir.','Revisa la agenda: menos tareas nocturnas.']},
 {key:'rt',n:'Atención',dir:1,thr:c=>c.base.rt*1.075,f:v=>Math.round(v)+' ms',msg:'su tiempo de reacción podría salir de su rango',part:'brain',steps:['Haz el turno de Órbita cada día a la misma hora.','Doble verificación en tareas delicadas.','Revisa sueño y carga de trabajo.']},
 {key:'hr',n:'Pulso en reposo',dir:1,thr:c=>c.base.hr*1.075,f:v=>Math.round(v)+' lpm',msg:'su pulso en reposo podría seguir subiendo',part:'heart',steps:['Mide el pulso en reposo al despertar.','Bebe agua repartida en el día.','Si sigue subiendo, revisión con el oficial médico.']},
 {key:'ready',n:'Preparación',dir:-1,thr:c=>70,f:v=>Math.round(v)+' %',msg:'su preparación podría bajar de 70 %',part:'brain',steps:['Prioriza el descanso esta semana.','Reparte las tareas exigentes con la tripulación.']},
];
function predictions(){const out=[];CREW.forEach(c=>PR.forEach(p=>{const F=fc(c,p.key);if(!F||F.L.r2<.2)return;const thr=p.thr(c);if(p.dir<0?F.L.m>=0:F.L.m<=0)return;
  const now=p.dir<0?F.last<thr:F.last>thr,day=F.proj.findIndex(v=>p.dir<0?v<thr:v>thr);if(day<0&&!now)return;
  out.push({c,p,F,thr,inDays:now?0:day+1,conf:F.L.r2>.6?'alta':F.L.r2>.35?'media':'baja'})}));return out.sort((a,b)=>a.inDays-b.inDays||b.F.L.r2-a.F.L.r2)}
function predSVG(P){const h=P.F.h,pr=P.F.proj,all=[...h.filter(v=>v!=null),...pr,P.thr],lo=Math.min(...all),hi=Math.max(...all),sp=(hi-lo)||1,N=h.length+pr.length-1,X=i=>4+i/N*292,Y=v=>66-(v-lo)/sp*58;
  const hp=h.map((v,i)=>v==null?null:[X(i),Y(v)]).filter(Boolean),lastI=h.length-1;const d1=hp.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const d2=`M ${hp[hp.length-1][0].toFixed(1)} ${hp[hp.length-1][1].toFixed(1)} `+pr.map((v,i)=>'L '+X(lastI+1+i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ');
  const col=PR.indexOf(P.p)===2?'#FF6B7D':P.p.key==='sl'?'#5B9DFF':P.p.key==='rt'?'#A28CFF':'#34E39A',ci=P.inDays>0?lastI+P.inDays:lastI;
  return `<svg viewBox="0 0 300 74" preserveAspectRatio="none" aria-hidden="true"><rect x="${X(lastI)}" y="0" width="${300-X(lastI)}" height="74" fill="#fff" opacity=".03"/><line x1="0" x2="300" y1="${Y(P.thr)}" y2="${Y(P.thr)}" stroke="#F5B841" stroke-dasharray="3 4" opacity=".8"/><path d="${d1}" fill="none" stroke="${col}" stroke-width="2.2" stroke-linejoin="round"/><path d="${d2}" fill="none" stroke="${col}" stroke-width="2.2" stroke-dasharray="5 5" opacity=".85"/><circle cx="${X(ci)}" cy="${Y(P.thr)}" r="4.5" fill="#F5B841"/></svg>`}

