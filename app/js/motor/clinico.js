'use strict';
/* =====================================================================
   MOTOR CLÍNICO · lado de la pantalla
   Aquí solo están los síntomas y las preguntas del registro. La evaluación
   (16 condiciones del ISS Medical Checklist de NASA, tríadas, capa de
   descarte y cruce con muestras de laboratorio) la hace Python en
   nave/motor/clinico.py. La pantalla le manda el contexto y pinta el resultado.
   ===================================================================== */
const SX={
 cefalea:{n:'Dolor de cabeza',pain:1},giro:{n:'Sensación de giro al mover la cabeza'},mareo:{n:'Mareo'},
 vision_cerca:{n:'Veo borroso de cerca'},vision_dist:{n:'Líneas torcidas o manchas en la vista'},ojo_arena:{n:'Sensación de arena en el ojo',pain:1},ojo_rojo:{n:'Ojo rojo o lagrimeo'},luz:{n:'Me molesta la luz'},
 garganta:{n:'Dolor de garganta',pain:1},congestion:{n:'Nariz tapada o cara hinchada'},tos:{n:'Tos'},rigidez_cuello:{n:'Cuello rígido'},zumbido:{n:'Zumbido en los oídos'},
 dolor_pecho:{n:'Dolor u opresión en el pecho',pain:1},falta_aire:{n:'Falta de aire'},palpitaciones:{n:'Palpitaciones'},
 nausea:{n:'Náusea'},vomito:{n:'Vómito'},estomago:{n:'Malestar de estómago o sin apetito'},dolor_abd:{n:'Dolor en el abdomen bajo',pain:1},diarrea:{n:'Diarrea'},
 ardor_orina:{n:'Ardor o dolor al orinar'},orina_frec:{n:'Orinar seguido, poco o con dificultad'},ingle:{n:'Pesadez en la ingle',pain:1},
 dolor_lumbar:{n:'Dolor en la espalda baja',pain:1},costado:{n:'Dolor en un costado (zona del riñón)',pain:1},espasmo:{n:'Espasmos o rigidez en la espalda'},irradia:{n:'El dolor baja a las piernas'},
 dolor_articular:{n:'Dolor en una articulación o hueso',pain:1},hinchazon:{n:'Hinchazón'},no_mover:{n:'No puedo mover o apoyar'},hormigueo:{n:'Hormigueo o adormecimiento'},deformidad:{n:'Se ve deformado'},
 ardor_piel:{n:'Ardor u hormigueo en una franja de piel o labio'},ampollas:{n:'Ampollas o llagas'},
 fiebre:{n:'Fiebre o escalofríos'},sudor:{n:'Sudor'},fatiga:{n:'Cansancio fuera de lo normal'},saliva:{n:'Exceso de saliva'},
 insomnio:{n:'Me cuesta dormir o despierto mucho'},animo_bajo:{n:'Ánimo bajo'},ansiedad:{n:'Ansiedad o tensión'},irritable:{n:'Irritable o con ganas de aislarme'},dano:{n:'Pensamientos de hacerme daño'},
};
const SXZ={
 f:{head:['Cabeza',['cefalea','giro','mareo']],eyes:['Ojos',['vision_cerca','vision_dist','ojo_arena','ojo_rojo','luz']],throat:['Nariz, garganta y oídos',['garganta','congestion','tos','zumbido']],chest:['Pecho',['dolor_pecho','falta_aire','palpitaciones','tos']],abd:['Abdomen',['nausea','vomito','estomago','dolor_abd','diarrea']],pelvis:['Pelvis e ingle',['ardor_orina','orina_frec','ingle']],arms:['Brazos y manos',['dolor_articular','hinchazon','no_mover','hormigueo','deformidad','ardor_piel','ampollas']],legs:['Piernas y rodillas',['dolor_articular','hinchazon','no_mover','hormigueo','deformidad']]},
 b:{headb:['Nuca y cuello',['rigidez_cuello','cefalea']],upback:['Espalda alta',['espasmo','dolor_articular']],lowback:['Espalda baja',['dolor_lumbar','espasmo','irradia']],flank:['Costados (riñones)',['costado']],legsb:['Piernas (atrás)',['dolor_articular','hormigueo','hinchazon']]},
 gen:['Generales, sueño y ánimo',['fiebre','sudor','fatiga','saliva','mareo','insomnio','animo_bajo','ansiedad','irritable','dano','ardor_piel','ampollas']]};
const SXQ={orina_sangre:{n:'¿Tu orina se ve turbia o con sangre?',if:['ardor_orina','orina_frec','costado','dolor_lumbar','ingle','dolor_abd']},
 encoger:{n:'¿El dolor mejora al encogerte (rodillas al pecho)?',if:['dolor_lumbar','espasmo']},
 caida:{n:'¿Te caíste o te golpeaste?',if:['dolor_articular','no_mover','deformidad','hinchazon','dolor_lumbar','irradia']},
 eva24:{n:'¿Hiciste caminata espacial (EVA) en las últimas 24 h?',if:['dolor_articular','hormigueo','fatiga','mareo']}};
const NIV=v=>v>=7?'intenso':v>=4?'moderado':'leve';
const ONS={hoy:'desde hoy',d13:'desde hace 1 a 3 días',mas:'desde hace más de 3 días'};
function sxState(c){S.sx=S.sx||{};return S.sx[c.id]=S.sx[c.id]||{cur:{items:{},q:{}},hist:[]}}
const sxw=x=>`lo reportaste: ${x.v}/10 (${NIV(x.v)})${x.pat?x.pat==='va'?', va y viene':', constante':''}${x.on?', '+ONS[x.on]:''}`;
SXQ.esfuerzo={n:'¿Empezó tras un esfuerzo o ejercicio?',if:['dolor_articular','hinchazon','dolor_lumbar','espasmo']};
SXQ.grav3={n:'¿Cambiaste de gravedad en los últimos 3 días (despegue, descenso o llegada)?',if:['nausea','vomito','giro','mareo','dolor_lumbar','espasmo','estomago']};

const EV={},LABS={};
const R0=id=>({k:{id,n:'',sys:'',steps:[],src:[],part:null},cr:[0,1,2].map(()=>({n:'—',w:null,s:''})),hit:0,red:[],ctx:[],lvl:0,desc:[],gate:[],presentas:''});
function contexto(c){const R=sxState(c).cur,L=LV[c.id],e=today(c),D=dayState(c),mm=moodStats(c),z=mzAt(DAY),otros={};
  ['cefalea'].forEach(id=>{otros[id]=CREW.filter(x=>x.id!==c.id&&sxState(x).cur.items[id]&&sxState(x).cur.items[id].v>0).map(x=>x.n)});
  return{tripulante:{id:c.id,n:c.n,hx:c.hx,vis:c.vis,fd30:{OI:{lm:c.vis.OI.lm0??0,near:5},OD:{lm:c.vis.OD.lm0??0,near:5}}},sintomas:R.items,preguntas:R.q,sensor:{conectado:!!L.on,v:L.v},
    dia_sensor:{sl:e.sl,rt:e.rt},dia:{water:D.water,ex:D.ex},mente:mm,hueso_pct:mBone(c,DAY),gravedad:z.g,dia_mision:DAY,
    co2_ppm:ENV.co2,rad_usvh:ENV.rad,tormenta:!!SHIP.tormenta,atencion_pct:SC.mind(c,e),pvt_base_ms:c.base.rt,otros,hora_utc:new Date().getUTCHours()}}
function evalKB(c){return EV[c.id]||[]}
const clinDe=(c,id)=>evalKB(c).find(x=>x.k.id===id)||R0(id);
function presentas(r){return r.presentas||''}
async function evaluarServidor(c,reporte){const r=await API.post('evaluar',{tripulante:c.id,contexto:contexto(c),reporte:!!reporte});EV[c.id]=r.resultados;LABS[c.id]=r.labs||{};return r.resultados}
function aplicarClin(c,R,quiet){const seen=new Set();
  R.filter(r=>r.lvl).forEach(r=>{const type='cx-'+r.k.id;seen.add(c.id+':'+type);raise({id:c.id,type,lvl:r.lvl,name:(r.lvl>=2?'':'Advertencia: ')+r.k.n,val:r.red.length&&r.hit<3?'señal de alarma':`${r.hit} de 3 indicios`,steps:r.k.steps,part:r.k.part,src:'clin',force:true,quiet,res:r,urgent:!!r.k.urgent})});
  AL.list.filter(a=>a.src==='clin'&&a.id===c.id&&!seen.has(a.key)).forEach(a=>closeA(a,'Ya no cumple los criterios'))}
function refrescarClin(){if(!$('#v-tripulacion').hidden)renderDx();if(!$('#v-valoracion').hidden)renderDxMini();if(!$('#v-mente').hidden)triadaMente(cur())}
const _evalT={};
function syncClin(c,quiet,reporte){clearTimeout(_evalT[c.id]);return new Promise(ok=>{_evalT[c.id]=setTimeout(()=>evaluarServidor(c,reporte).then(R=>{aplicarClin(c,R,quiet);if(c.id===S.sel)refrescarClin();ok(R)}).catch(e=>{console.warn('Motor clínico:',e.message);ok(evalKB(c))}),120)})}
async function syncClinAll(quiet){await Promise.all(CREW.map(c=>evaluarServidor(c).then(R=>aplicarClin(c,R,quiet)).catch(()=>{})));if(!quiet)refrescarClin()}
