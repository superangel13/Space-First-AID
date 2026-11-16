'use strict';
/* ================= navegación =================
   Panel · Tripulación · Valoración · Pruebas (6 pruebas) · Misión · Mi día
   Alertas se abre con la sirena; Referencias con el botón chico del pie. */
const VISTA_DE={panel:'panel',tripulacion:'tripulacion',valoracion:'valoracion',animo:'mente',orbita:'orbita',alcance:'manos',trazo:'manos',letra_c:'manos',amsler:'manos',alertas:'alertas',mision:'mision',midia:'midia',referencias:'referencias'};
const SECCIONES=['panel','tripulacion','valoracion','mente','orbita','manos','alertas','mision','midia','referencias'];
const ALIAS={persona:'tripulacion',sintomas:'valoracion',mente:'animo',vision:'letra_c',evidencia:'referencias',detalle:'tripulacion'};
const SHEETV=['mision','midia','alertas','referencias'];
let CUR='panel';
function route(){let v=location.hash.slice(1);if(v==='mas')return;v=ALIAS[v]||v;
  if(v==='pruebas'){location.replace('#'+(S.ultPrueba||'animo'));return}
  if(!VISTA_DE[v])v='panel';$('#sheet').hidden=true;
  if(v!=='orbita')abortGame();if(v!=='mision')MS.run=false;if(!['alcance','trazo','letra_c','amsler'].includes(v))pararManos();
  CUR=v;const sec=VISTA_DE[v];SECCIONES.forEach(x=>$('#v-'+x).hidden=x!==sec);
  const grupo=PRUEBAS_RUTAS.includes(v)?'pruebas':v;
  $$('nav.tabs a,.bottom a,.sheet a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+grupo?'page':'false'));
  $('#moreBtn').setAttribute('aria-current',SHEETV.includes(v)?'page':'false');marcarSubnav(v);window.scrollTo(0,0);render()}
function render(){$$('.role button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.r===S.role));renderPickers();
  ({panel:renderPanel,tripulacion:renderPersona,valoracion:()=>{renderSintomas();renderMuestras()},animo:renderMente,orbita:()=>{W=0;renderOrbita()},
    alcance:()=>renderManos('alcance'),trazo:()=>renderManos('trazo'),letra_c:()=>renderManos('letra_c'),amsler:()=>renderManos('amsler'),
    alertas:renderAlertas,mision:renderMision,midia:renderMiDia,referencias:renderEvidence})[CUR]();
  renderLinkChip();refreshAlertUI();sirenaEstado();vizKick()}
window.addEventListener('hashchange',route);
$('#moreBtn').onclick=e=>{e.preventDefault();$('#sheet').hidden=false};$('#sheet').onclick=e=>{if(e.target.id==='sheet')$('#sheet').hidden=true};
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(CUR==='orbita'){W=0;sizeCanvas()}if(CUR==='tripulacion')drawChart(cur(),S.metric)},150)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#modal').hidden=true;$('#sheet').hidden=true;$('#enlacePanel').hidden=true}});
/* pie: misión actual y botón para registrar una nueva */
$('#pieMis').textContent=`${MISION.nombre} · ${DESTINO.nombre||MISION.destino} · día ${DAY} de ${LEN}`;
$('#nuevaMision').onclick=async()=>{if(!confirm('¿Terminar esta misión y registrar una nueva? Se borran los datos de la misión actual en esta nave (lo ya enviado a la Tierra se conserva allá).'))return;
  try{await API.del('mision');location.hash='';location.reload()}catch(e){toast('No se pudo: '+e.message)}};
/* signos vitales del sensor: se guardan en SQLite cada 15 s */
function enviarSignos(){const lote=CREW.filter(c=>LV[c.id].on).map(c=>({tripulante:c.id,v:LV[c.id].v}));if(lote.length)API.post('signos',{lote}).catch(()=>{})}
AL.init=true;
syncClinAll(true).then(()=>{AL.init=false;refreshAlertUI();if(!$('#v-tripulacion').hidden)renderDx()});
route();startPing();setInterval(liveTick,250);setInterval(()=>syncClinAll(false),10000);setInterval(enviarSignos,15000);
