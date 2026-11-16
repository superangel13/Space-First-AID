'use strict';
/* =====================================================================
   MOTOR CLÍNICO · lado de la pantalla
   Aquí solo están los síntomas y las preguntas del registro. La evaluación
   (16 condiciones del ISS Medical Checklist de NASA, tríadas, capa de
   descarte y cruce con muestras de laboratorio) la hace Python en
   nave/motor/clinico.py. La pantalla le manda el contexto y pinta el resultado.
   ===================================================================== */
/* Catálogo de signos y síntomas del documento de parámetros (datos/problemas.json) */
const SX=Object.fromEntries(PROB.sintomas.map(x=>[x.id,{n:x.n,pain:!!x.dolor,clase:x.clase,zona:x.zona}]));
const SXQ={};
const NIV=v=>v>=7?'intenso':v>=4?'moderado':'leve';
const ONS={hoy:'desde hoy',d13:'desde hace 1 a 3 días',mas:'desde hace más de 3 días'};
function sxState(c){S.sx=S.sx||{};const st=S.sx[c.id]=S.sx[c.id]||{cur:{items:{},q:{}},hist:[]};
  Object.keys(st.cur.items).forEach(id=>{if(!SX[id])delete st.cur.items[id]});return st}
const EV={},LABS={},SIS={},AUTO={},PRU={};
S.sim=S.sim||{};
const R0=id=>({k:{id,n:'',sys:'',steps:[],src:[],part:null},cr:[0,1,2].map(()=>({n:'—',w:null,s:''})),hit:0,red:[],ctx:[],lvl:0,desc:[],gate:[],presentas:''});
/* días en microgravedad hasta hoy, según la trayectoria de la misión */
function diasMicrogravedad(t){let d=0;MZ.forEach(z=>{if(t>z.start&&z.g<.05)d+=Math.min(t,z.end)-z.start});return d}
function contexto(c){const R=sxState(c).cur,L=LV[c.id],e=today(c),D=dayState(c),sim=(S.sim[c.id]||{}).contexto||{};
  return{tripulante:{id:c.id,n:c.n,hx:c.hx,sexo:c.sex},sintomas:R.items,sensor:{conectado:!!L.on,v:L.v},
    dia_sensor:{sl:sim.sl??e.sl},dia:{water:sim.agua_ml??D.water,ex:D.ex},hueso_pct:sim.hueso_pct??mBone(c,DAY),
    dias_microgravedad:sim.dias_microgravedad??diasMicrogravedad(DAY),gravedad:mzAt(DAY).g,dia_mision:DAY,
    tormenta:!!(SHIP.tormenta||sim.tormenta),dosimetro:!!(SHIP.tormenta||sim.dosimetro),dosis_msv:today(c).dose}}
function evalKB(c){return EV[c.id]||[]}
const clinDe=(c,id)=>evalKB(c).find(x=>x.k.id===id)||R0(id);
function presentas(r){return r.presentas||''}
async function evaluarServidor(c,reporte){const r=await API.post('evaluar',{tripulante:c.id,contexto:contexto(c),reporte:!!reporte});EV[c.id]=r.resultados;LABS[c.id]=r.labs||{};SIS[c.id]=r.sistemas;AUTO[c.id]=r.autoreporte||{};PRU[c.id]=r.pruebas||{};SFA.bump();return r.resultados}
function aplicarClin(c,R,quiet){const seen=new Set();
  R.filter(r=>r.lvl).forEach(r=>{const type='cx-'+r.k.id;seen.add(c.id+':'+type);raise({id:c.id,type,lvl:r.lvl,name:(r.lvl>=2?'':'Advertencia: ')+r.k.n,val:`${r.hit} de ${r.total} indicadores`,steps:r.k.steps,part:r.k.part,src:'clin',force:true,quiet,res:r,urgent:!!r.k.urgent})});
  AL.list.filter(a=>a.src==='clin'&&a.id===c.id&&!seen.has(a.key)).forEach(a=>closeA(a,'Ya no cumple los criterios'))}
function refrescarClin(){SFA.bump()}
const _evalT={};
function syncClin(c,quiet,reporte){clearTimeout(_evalT[c.id]);return new Promise(ok=>{_evalT[c.id]=setTimeout(()=>evaluarServidor(c,reporte).then(R=>{aplicarClin(c,R,quiet);if(c.id===S.sel)refrescarClin();ok(R)}).catch(e=>{console.warn('Motor clínico:',e.message);ok(evalKB(c))}),120)})}
async function syncClinAll(quiet){await Promise.all(CREW.map(c=>evaluarServidor(c).then(R=>aplicarClin(c,R,quiet)).catch(()=>{})));if(!quiet)refrescarClin()}

/* ---------- simulación de emergencias (sección Valoración) ----------
   Python altera los datos del tripulante para el problema elegido (muestras,
   registro personal y pruebas); aquí se agregan los signos y síntomas y el contexto. */
async function simularProblema(c,problema,modo){
  const r=await API.post('simular',{tripulante:c.id,problema,modo});
  const st=sxState(c);Object.entries(r.sintomas).forEach(([id,x])=>{st.cur.items[id]={v:x.v,on:'hoy',pat:SX[id]&&SX[id].pain?'va':null}});
  S.sim[c.id]={problema,modo,contexto:r.contexto};
  if(r.contexto.tormenta&&!SHIP.tormenta)shipScen('tormenta');
  save();const R=await syncClin(c,false,true);SFA.bump();return R}
async function quitarSimulacion(c){await API.del('simular/'+c.id);delete S.sim[c.id];sxState(c).cur={items:{},q:{}};
  if(SHIP.tormenta&&!Object.values(S.sim).some(x=>x.contexto&&x.contexto.tormenta))shipScen('tormenta');
  save();await syncClin(c);SFA.bump()}
