'use strict';
/* =====================================================================
   SIGNOS VITALES EN VIVO (sensor portátil simulado)
   ===================================================================== */
const BASEV=Object.fromEntries(CREW.map(c=>[c.id,{sbp:(c.sim.bp||[116,75])[0],dbp:(c.sim.bp||[116,75])[1],temp:c.sim.temp||36.6,rr:c.sim.rr||14}]));
const VMETA={hr:{s:'Pulso',u:'lpm',col:'#FF6B7D'},spo2:{s:'Oxígeno',u:'% SpO₂',col:'#5FD3F3'},bp:{s:'Presión',u:'mmHg',col:'#A28CFF'},temp:{s:'Temperatura',u:'°C',col:'#F7D154'},rr:{s:'Respiración',u:'por min',col:'#34E39A'}};
const VORDER=['hr','spo2','bp','temp','rr'];
const SCN={
 normal:{n:'Normal',d:'Sin cambios',t:b=>b},
 hipo:{n:'Presión baja',d:'Mareo al moverse',t:b=>({...b,sbp:76,dbp:44,hr:b.hr+34})},
 hiper:{n:'Presión alta',d:'Dolor de cabeza',t:b=>({...b,sbp:172,dbp:104,hr:b.hr+8})},
 taqui:{n:'Pulso muy rápido',d:'Palpitaciones',t:b=>({...b,hr:148,rr:b.rr+4})},
 bradi:{n:'Pulso muy lento',d:'Cansancio, mareo',t:b=>({...b,hr:36,sbp:b.sbp-12})},
 desat:{n:'Oxígeno bajo',d:'Falta de aire',t:b=>({...b,spo2:86,rr:27,hr:b.hr+22})},
 fiebre:{n:'Fiebre',d:'Infección',t:b=>({...b,temp:38.9,hr:b.hr+18,rr:20})},
 mareo:{n:'Mareo espacial',d:'Reporta náusea y giro',sx:{items:{nausea:{v:6,on:'hoy'},giro:{v:7,on:'hoy'},sudor:{v:4,on:'hoy'}},q:{grav3:true}},t:b=>({...b,hr:b.hr+10})},
 estres:{n:'Ánimo y convivencia',d:'Check-ins bajos',mood:true,t:b=>({...b,hr:b.hr+14,rr:b.rr+4})},
 calculo:{n:'Dolor renal',d:'Reporta cólico y náusea',sx:{items:{costado:{v:8,pat:'va',on:'hoy'},nausea:{v:5,on:'hoy'},ardor_orina:{v:4,on:'hoy'}},q:{orina_sangre:true}},t:b=>({...b,hr:b.hr+18,sbp:b.sbp+12})},
 renal2:{n:'Renal incompleto',d:'2 de 3: advertencia',sx:{items:{costado:{v:5,pat:'va',on:'d13'},nausea:{v:3,on:'hoy'}},q:{}},t:b=>b},
 sans:{n:'Vista borrosa',d:'Reporta y pruebas',sx:{items:{vision_cerca:{v:5,on:'mas'}},q:{}},vis:true,t:b=>b},
 caida:{n:'Caída en la Luna',d:'Dolor intenso, no apoya',sx:{items:{dolor_articular:{v:8,pat:'const',on:'hoy'},no_mover:{v:7,on:'hoy'},hinchazon:{v:5,on:'hoy'}},q:{caida:true}},t:b=>({...b,hr:b.hr+25})},
 dcs:{n:'Tras caminata (DCS)',d:'Dolor articular y hormigueo',sx:{items:{dolor_articular:{v:6,pat:'const',on:'hoy'},hormigueo:{v:5,on:'hoy'}},q:{eva24:true}},t:b=>({...b,hr:b.hr+12})},
 espalda:{n:'Dolor de espalda',d:'Adaptación',sx:{items:{dolor_lumbar:{v:5,pat:'const',on:'d13'},espasmo:{v:5,on:'d13'}},q:{encoger:true}},t:b=>b},
};
const LV={};
function vBase(c){const e=today(c),b=BASEV[c.id],fix=LV[c.id]&&LV[c.id].fix;return{hr:fix||e.hr==null?c.base.hr:e.hr,spo2:fix||e.sp==null?c.base.sp:e.sp,sbp:b.sbp,dbp:b.dbp,temp:b.temp,rr:b.rr}}
CREW.forEach(c=>{LV[c.id]={on:!c.noData,scen:'normal',fix:false,phase:Math.random()};const b=vBase(c);LV[c.id].v={...b};LV[c.id].hist={hr:Array(60).fill(b.hr),spo2:Array(60).fill(b.spo2),bp:Array(60).fill(b.sbp),temp:Array(60).fill(b.temp),rr:Array(60).fill(b.rr)}});
const SHIP={tormenta:false,co2:false};
const ENV={co2:2300,o2:20.9,p:101.3,t:22.4,h:44,rad:25};
function vLvl(k,v){if(v==null)return 0;const u=UMB.signos[k];if(!u)return 0;if(k!=='temp')v=Math.round(v);
  if(u.critico_alto!=null&&v>=u.critico_alto)return 2;if(u.critico_bajo!=null&&(u.critico_incluye_igual?v<=u.critico_bajo:v<u.critico_bajo))return 2;
  if(u.aviso_alto!=null&&v>=u.aviso_alto)return 1;if(u.aviso_bajo!=null&&v<u.aviso_bajo)return 1;return 0}
function tileLvl(id,k){const L=LV[id];if(!L.on)return 0;const v=L.v;return k==='bp'?Math.max(vLvl('sbp',v.sbp),vLvl('dbp',v.dbp)):vLvl(k,v[k])}
function vText(id,k){const L=LV[id];if(!L.on)return'—';const v=L.v;return k==='bp'?`${Math.round(v.sbp)}/${Math.round(v.dbp)}`:k==='temp'?v.temp.toFixed(1):Math.round(v[k])}
function vtile(c,k){const m=VMETA[k],id=c.id;return `<div class="vt" data-vt="${id}:${k}"><div class="vh"><span class="cap" style="color:${m.col}">${m.s}</span><span class="vl" data-vl="${id}:${k}"></span></div><div class="vrow"><span class="vv" data-vv="${id}:${k}">${vText(id,k)}</span><span class="vu">${m.u}</span></div>${k==='hr'?`<canvas class="ecg" data-ecg="${id}"></canvas>`:`<svg class="sp" data-vs="${id}:${k}" viewBox="0 0 100 28" preserveAspectRatio="none"></svg>`}</div>`}
function offBox(c){return LV[c.id].on?'':`<div class="offbox"><b>Sensor desconectado</b><span class="muted small">No llegan signos vitales de ${esc(c.n)} desde esta mañana.</span><button class="btn go sm" data-recon="${c.id}" type="button">Reconectar sensor</button></div>`}
function bindRecon(root){(root||document).querySelectorAll('[data-recon]').forEach(b=>b.onclick=()=>{LV[b.dataset.recon].on=true;toast('Sensor reconectado: llegan datos otra vez');render()})}
function updateVitals(){
  $$('[data-vv]').forEach(el=>{const[id,k]=el.dataset.vv.split(':');el.textContent=vText(id,k)});
  $$('[data-vt]').forEach(el=>{const[id,k]=el.dataset.vt.split(':'),l=LV[id].on?tileLvl(id,k):-1;el.classList.toggle('w',l===1);el.classList.toggle('b',l===2);el.classList.toggle('off',l<0)});
  $$('[data-vl]').forEach(el=>{const[id,k]=el.dataset.vl.split(':'),l=LV[id].on?tileLvl(id,k):-1;el.textContent=l<0?'Sin señal':['Normal','Vigilar','Alerta'][l]});
  $$('[data-vs]').forEach(el=>{const[id,k]=el.dataset.vs.split(':'),h=LV[id].hist[k];if(!LV[id].on){el.innerHTML='';return}const ms={hr:8,spo2:4,bp:10,temp:.6,rr:4}[k],lo0=Math.min(...h),hi0=Math.max(...h),mid=(lo0+hi0)/2,sp=Math.max(hi0-lo0,ms),lo=mid-sp/2;const d=h.map((v,i)=>(i?'L':'M')+(i/(h.length-1)*100).toFixed(1)+' '+(25-(v-lo)/sp*22).toFixed(1)).join(' ');el.innerHTML=`<path d="${d}" fill="none" stroke="${VMETA[k].col}" stroke-width="1.6" vector-effect="non-scaling-stroke"/>`});
  $$('[data-ccv]').forEach(el=>{const id=el.dataset.ccv,L=LV[id];el.innerHTML=L.on?['hr','spo2','bp'].map(k=>`<span class="${['','w','b'][tileLvl(id,k)]}">${VMETA[k].s}<b>${vText(id,k)}</b></span>`).join(''):'<span>Sensor desconectado</span>'})}
let tickN=0;
function liveTick(){tickN++;const sec=tickN%4===0;
  CREW.forEach(c=>{const L=LV[c.id];if(!L.on)return;const T=SCN[L.scen].t(vBase(c)),nz=a=>(Math.random()-.5)*2*a,N={hr:.7,spo2:.12,sbp:.7,dbp:.5,temp:.01,rr:.25};
    Object.keys(N).forEach(k=>{L.v[k]+=(T[k]-L.v[k])*.07+nz(N[k])});L.v.spo2=Math.min(100,L.v.spo2);
    if(sec){['hr','spo2','temp','rr'].forEach(k=>{L.hist[k].push(L.v[k]);L.hist[k].shift()});L.hist.bp.push(L.v.sbp);L.hist.bp.shift()}});
  const tg={co2:SHIP.co2?6400:2300,rad:SHIP.tormenta?1900:25,o2:SHIP.co2?20.2:20.9};ENV.co2+=(tg.co2-ENV.co2)*.05+(Math.random()-.5)*20;ENV.rad+=(tg.rad-ENV.rad)*.06+(Math.random()-.5)*.8;ENV.o2+=(tg.o2-ENV.o2)*.05+(Math.random()-.5)*.01;ENV.t+=(22.4-ENV.t)*.02+(Math.random()-.5)*.02;ENV.h+=(44-ENV.h)*.02+(Math.random()-.5)*.1;ENV.p+=(101.3-ENV.p)*.05+(Math.random()-.5)*.02;
  if(sec){checkAlerts();updateVitals();updateEnv();if(CUR==='alertas'&&tickN%8===0)renderAlertTimers()}}

/* ECG: misma forma de onda del código de la tripulación */
function ecgShape(p){const g=(c,w,a)=>a*Math.exp(-((p-c)**2)/(2*w*w));return g(.18,.025,.12)+g(.30,.008,-.12)+g(.32,.01,1)+g(.34,.008,-.25)+g(.56,.04,.25)}
const ECGB=new WeakMap();
function drawECGs(dt){$$('canvas[data-ecg]').forEach(cv=>{if(!cv.offsetParent)return;const id=cv.dataset.ecg,L=LV[id],dpr=Math.min(2,devicePixelRatio||1),w=Math.round(cv.clientWidth*dpr),h=Math.round(cv.clientHeight*dpr);if(!w||!h)return;if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;ECGB.delete(cv)}
  let st=ECGB.get(cv);if(!st){st={buf:new Array(Math.round(w/dpr)).fill(0),ph:Math.random()};ECGB.set(cv,st)}
  const n=Math.max(1,Math.round(dt*120));for(let i=0;i<n;i++){st.ph=(st.ph+(L.on?L.v.hr:0)/60/120)%1;st.buf.push(L.on?ecgShape(st.ph)+(Math.random()-.5)*.02:0);st.buf.shift()}
  const x=cv.getContext('2d'),l=L.on?tileLvl(id,'hr'):-1,col=l<0?'#2A3442':['#FF6B7D','#F5B841','#FF5468'][l];x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);
  x.strokeStyle='rgba(255,255,255,.05)';x.lineWidth=1;for(let gx=0;gx<w/dpr;gx+=12){x.beginPath();x.moveTo(gx,0);x.lineTo(gx,h/dpr);x.stroke()}
  x.strokeStyle=col;x.lineWidth=1.8;x.shadowColor=col;x.shadowBlur=6;x.beginPath();const H2=h/dpr;st.buf.forEach((y,i)=>{const yy=H2*.72-y*H2*.62;i?x.lineTo(i,yy):x.moveTo(i,yy)});x.stroke();x.shadowBlur=0})}

