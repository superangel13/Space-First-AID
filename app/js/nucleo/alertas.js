'use strict';
/* =====================================================================
   ALERTAS: detección automática, simulación de casos y guía
   ===================================================================== */
const AT={
 hipo:{n:'Presión baja',part:'heart',steps:['Detén la actividad y recuéstate o sujétate en horizontal.','Eleva las piernas.','Bebe líquidos con sal si puedes.','Repite la medición en 5 minutos y avisa al oficial médico.']},
 hiper:{n:'Presión alta',part:'heart',steps:['Reposa 5 minutos y repite la medición.','Pregunta por dolor de cabeza fuerte, cambios en la vista o dolor de pecho.','Revisa si tomó su medicamento a tiempo.','Si sigue alta, avisa al oficial médico.']},
 taqui:{n:'Pulso muy rápido',part:'heart',steps:['Detén la actividad física y respira lento.','Revisa que el sensor esté bien colocado.','Pregunta por palpitaciones, mareo o dolor de pecho.','Si no baja en 10 minutos, avisa al oficial médico.']},
 bradi:{n:'Pulso muy lento',part:'heart',steps:['Revisa si está dormido o en reposo profundo: puede ser normal.','Pregúntale cómo se siente y busca mareo o desmayo.','Mide la presión.','Si hay síntomas, avisa al oficial médico.']},
 desat:{n:'Oxígeno bajo',part:'lungs',steps:['Revisa el sensor y vuelve a medir.','Siéntate y respira lento y profundo.','Revisa el aire de la cabina (CO₂ y oxígeno).','Si sigue bajo: oxígeno de emergencia y aviso al oficial médico.']},
 fiebre:{n:'Fiebre',part:'body',steps:['Aíslate en tu cabina; cubrebocas en áreas comunes.','Bebe agua y descansa.','Mide temperatura y oxígeno cada 4 horas.','El oficial médico decide si hay medicamento.']},
 resp:{n:'Respiración rápida',part:'lungs',steps:['Siéntate y respira lento.','Revisa oxígeno y aire de la cabina.','Si hay falta de aire, avisa al oficial médico.']},
 mareo:{n:'Mareo espacial',part:'ear',steps:['Detén la actividad y sujétate a un punto fijo.','Mira un punto fijo y mantén la cabeza quieta.','Ten una bolsa a la mano.','Bebe en sorbos pequeños y descansa 1 a 2 horas.']},
 estres:{n:'Estrés alto',part:'brain',steps:['Busca un lugar tranquilo.','Haz la respiración guiada de Mi día (2 minutos).','Si quieres, agenda una llamada privada con la Tierra.','Ajusta la carga de trabajo de hoy.']},
 calculo:{n:'Dolor renal',part:'kidney',steps:['Reposo y analgésico según el oficial médico.','Bebe agua: meta de 3 L hoy.','Ultrasonido portátil y muestra de orina.','Si hay fiebre o no puedes orinar: emergencia.']},
 sans:{n:'Cambio en la vista',part:'eyes',steps:['Repite la revisión de ojos (sección Visión).','Usa lentes de ajuste si ves borroso de cerca.','Avisa al oficial médico; se reporta a la Tierra.','Repite la revisión cada semana.']},
 caida:{n:'Caída en la superficie',part:'legs',steps:['No te muevas: revisa dolor en cadera, piernas y muñecas.','Revisa la presión del traje.','Tu compañero te ayuda a levantarte de lado.','Si duele la cadera o la pierna: inmoviliza y regresa a la base.']},
 tormenta:{n:'Tormenta solar',part:'body',steps:['Suspende toda actividad fuera de la base.','Toda la tripulación al refugio blindado.','Revisa tu dosímetro cada hora.','Quédate hasta que termine la alerta.']},
 co2:{n:'CO₂ alto en la cabina',part:null,steps:['Revisa el sistema que limpia el aire.','Aumenta la ventilación del módulo.','Si hay dolor de cabeza o falta de aire, cambia de módulo.','Avisa al centro de control.']},
};
const AL={list:[],hist:[],init:true,snooze:{},training:false,trainT:null};
const who=id=>id==='nave'?'Nave':(CREW.find(c=>c.id===id)||{}).n;
const aName=a=>a.name||AT[a.type].n;
const aSteps=a=>a.steps||AT[a.type].steps;
const aPart=a=>a.part!==undefined?a.part:AT[a.type]&&AT[a.type].part;
const ago=t=>{const s=Math.round((Date.now()-t)/1000);return s<60?`hace ${s} s`:`hace ${Math.round(s/60)} min`};
const hhmm=t=>{const d=new Date(t);return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')+':'+String(d.getUTCSeconds()).padStart(2,'0')};
function siren(l){if(!S.sound)return;if(l>=2)[0,420,840].forEach(d=>setTimeout(()=>{snd(880,.2,'square',.05);setTimeout(()=>snd(660,.2,'square',.05),170)},d));else{snd(740,.14,'sine',.09);setTimeout(()=>snd(988,.16,'sine',.09),140)}}
function raise(o){const key=o.id+':'+o.type;if(AL.snooze[key]&&AL.snooze[key]>Date.now()&&!o.force)return null;
  let a=AL.list.find(x=>x.key===key);
  if(a){a.val=o.val||a.val;a.okSince=null;if(o.res)a.res=o.res;if(o.name)a.name=o.name;if(o.urgent!=null)a.urgent=o.urgent;if(o.lvl<a.lvl&&o.src==='clin')a.lvl=o.lvl;if(o.lvl>a.lvl){a.lvl=o.lvl;if(o.lvl>a.max){a.max=o.lvl;a.seen=false;if(!o.quiet){guardarAlerta(a);notify(a)}}}return a}
  a={key,id:o.id,type:o.type,lvl:o.lvl,max:o.lvl,val:o.val||'',src:o.src||'auto',t0:Date.now(),name:o.name,steps:o.steps,part:o.part,done:[],okSince:null,res:o.res,urgent:!!o.urgent};
  AL.list.unshift(a);AL.hist.unshift({t:Date.now(),id:a.id,txt:aName(a)+(a.val?' · '+a.val:''),lvl:a.lvl,ev:'Nueva'});
  if(!AL.init&&!o.quiet){guardarAlerta(a);notify(a)}
  refreshAlertUI();return a}
function guardarAlerta(a){API.post('alertas',{clave:a.key,tripulante:a.id,quien:who(a.id),nivel:a.lvl,titulo:aName(a),detalle:[a.val,...(a.res?a.res.cr.filter(x=>x.w).map(x=>x.w):[])].filter(Boolean).join(' · ')}).then(sondearEnlace).catch(()=>{})}
function notify(a){siren(a.lvl);sirenaAnim(a.lvl);buzz(a.lvl>=2?[120,80,120]:60);toast(`${a.lvl>=2?'Alerta':'Aviso'}: ${who(a.id)} · ${aName(a)}`);setTimeout(()=>maybeBig(a),30)}
function closeA(a,why){AL.list=AL.list.filter(x=>x!==a);API.post('alertas/cerrar',{clave:a.key,motivo:why,estado:why==='Atendida'?'atendida':'cerrada'}).catch(()=>{});AL.hist.unshift({t:Date.now(),id:a.id,txt:aName(a),lvl:0,ev:why});
  if(why==='Atendida'){AL.snooze[a.key]=Date.now()+120000;if(a.id==='nave'){if(a.type==='tormenta')SHIP.tormenta=false;if(a.type==='co2')SHIP.co2=false}else{const L=LV[a.id];L.scen='normal';if(['desat','taqui','hipo','hiper','bradi','fiebre','resp'].includes(a.type))L.fix=true}}
  refreshAlertUI()}
function checkAlerts(){const seen=new Set();
  CREW.forEach(c=>{const L=LV[c.id];if(!L.on)return;const v=L.v,r=Math.round,o=[];
    const bl=Math.max(vLvl('sbp',v.sbp),vLvl('dbp',v.dbp));if(v.sbp<90&&bl)o.push(['hipo',bl,`Presión ${r(v.sbp)}/${r(v.dbp)}`]);else if(bl)o.push(['hiper',bl,`Presión ${r(v.sbp)}/${r(v.dbp)}`]);
    const hl=vLvl('hr',v.hr);if(hl)o.push([v.hr>=100?'taqui':'bradi',hl,`Pulso ${r(v.hr)} lpm`]);
    const sl=vLvl('spo2',v.spo2);if(sl)o.push(['desat',sl,`SpO₂ ${r(v.spo2)} %`]);
    const tl=vLvl('temp',v.temp);if(tl)o.push(['fiebre',tl,`${v.temp.toFixed(1)} °C`]);
    const rl=vLvl('rr',v.rr);if(rl&&!o.some(x=>x[0]==='desat'))o.push(['resp',rl,`${r(v.rr)} por min`]);
    o.forEach(([t,l,val])=>{seen.add(c.id+':'+t);raise({id:c.id,type:t,lvl:l,val})});
  });
  if(ENV.co2>5000){seen.add('nave:co2');raise({id:'nave',type:'co2',lvl:ENV.co2>6000?2:1,val:`${fmt(ENV.co2)} ppm`})}
  if(SHIP.tormenta){seen.add('nave:tormenta');raise({id:'nave',type:'tormenta',lvl:2,val:`${fmt(ENV.rad)} µSv/h`})}
  AL.list.filter(a=>a.src==='auto'||a.src==='vision').forEach(a=>{if(seen.has(a.key))return;if(a.type==='tormenta'&&SHIP.tormenta)return;a.okSince=a.okSince||Date.now();if(Date.now()-a.okSince>4000)closeA(a,'Se normalizó')});
  if(AL.init){AL.init=false}
  refreshAlertUI()}
function applyScen(id,key){const c=CREW.find(x=>x.id===id),L=LV[id],sc=SCN[key];if(!L.on){L.on=true}L.scen=key;L.fix=false;AL.snooze={};
  if(key==='normal'){sxState(c).cur={items:{},q:{}}}
  if(sc.sx){const st=sxState(c);st.cur=JSON.parse(JSON.stringify(sc.sx));st.hist.unshift({t:Date.now(),txt:`Caso simulado: ${sc.n}`,lvl:0})}
  if(sc.vis){const v=c.vis[S.eye];v.am='marcas';v.amPct=6.5;v.amMarks=[188,189,208,209,210,229];v.lm=(c.fd30[S.eye].lm||0)+.2;v.lc=4;v.near=10}
  if(sc.mood){const M=mindState(c);for(let d=DAY-2;d<=DAY;d++){const i=M.ci.findIndex(x=>x.d===d),o={d,val:-.55,en:-.4,team:2};if(i>=0)M.ci[i]=o;else M.ci.push(o)}if(c.days[DAY-1].rt)c.days[DAY-1].rt=Math.round(c.base.rt*1.12)}
  save();setTimeout(()=>{syncClin(c);render()},1200);
  toast(key==='normal'?`${c.n}: de regreso a la normalidad`:`Caso simulado: ${c.n} · ${sc.n}${sc.sx||sc.vis||sc.mood?' · el motor clínico lo evalúa':''}`);render()}
function shipScen(k){SHIP[k]=!SHIP[k];AL.snooze={};if(k==='tormenta'&&SHIP.tormenta)MS.storms.push({t:DAY,dur:1.2});toast(SHIP[k]?(k==='tormenta'?'Tormenta solar simulada':'Falla simulada en la limpieza de aire'):'La nave vuelve a la normalidad');render()}
function randomCase(){const keys=Object.keys(SCN).filter(k=>k!=='normal'),cs=CREW.filter(c=>LV[c.id].scen==='normal');if(Math.random()<.12){shipScen(Math.random()<.5?'tormenta':'co2');return}const c=(cs.length?cs:CREW)[Math.floor(Math.random()*(cs.length||CREW.length))];S.sel=c.id;applyScen(c.id,keys[Math.floor(Math.random()*keys.length)])}
function setTraining(on){AL.training=on;clearInterval(AL.trainT);if(on){AL.trainT=setInterval(()=>{if(!AL.list.some(a=>a.lvl>=2))randomCase()},45000);randomCase()}render()}
function refreshAlertUI(){const act=AL.list,crit=act.filter(a=>a.lvl>=2),top=crit[0]||act[0];
  $$('[data-abdg]').forEach(b=>{b.hidden=!act.length;b.textContent=act.length;b.classList.toggle('w',!crit.length)});
  const bar=$('#abar');if(!top||CUR==='alertas'){bar.hidden=true}else{bar.hidden=false;bar.classList.toggle('w',top.lvl<2);$('#abarT').textContent=`${top.lvl>=2?'ALERTA':'AVISO'} · ${who(top.id)}`;$('#abarX').textContent=`${aName(top)}${top.val?' · '+top.val:''}${act.length>1?` · y ${act.length-1} más`:''}`}
  const sig=act.map(a=>a.key+a.lvl).join('|');if(sig===AL.sig)return;AL.sig=sig;
  if(CUR==='alertas')renderAlertas();else if(CUR==='panel'){renderBioTexts()}else if(CUR==='tripulacion'){renderCrewGrid()}}
$('#abar').onclick=()=>location.hash='alertas';

