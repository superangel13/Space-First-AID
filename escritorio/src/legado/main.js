'use strict';
/* ================= entrada y salida de cada vista =================
   La navegación la maneja React (src/App.jsx): decide qué sección se ve.
   Aquí queda lo que cada vista necesita al entrar o salir, y el repintado
   de lo que vive en lienzos, SVG y 3D. Al final avisa a React (SFA.bump). */
let CUR='panel';
function alCambiarRuta(v){
  if(v!=='orbita')abortGame();if(v!=='mision')MS.run=false;if(!['alcance','trazo','letra_c','amsler'].includes(v))pararManos();
  CUR=v;
  if(PRUEBAS_RUTAS.includes(v)&&S.ultPrueba!==v){S.ultPrueba=v;save()}
  window.scrollTo(0,0);render()}
function render(){renderPickers();
  ({panel:renderPanel,tripulacion:renderPersona,valoracion:()=>{renderSintomas();renderMuestras()},animo:renderMente,orbita:()=>{W=0;renderOrbita()},
    alcance:()=>renderManos('alcance'),trazo:()=>renderManos('trazo'),letra_c:()=>renderManos('letra_c'),amsler:()=>renderManos('amsler'),
    alertas:renderAlertas,mision:renderMision,midia:renderMiDia,referencias:renderEvidence})[CUR]();
  refreshAlertUI();vizKick();SFA.bump()}
let rz;window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(CUR==='orbita'){W=0;sizeCanvas()}if(CUR==='tripulacion')drawChart(cur(),S.metric)},150)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#modal').hidden=true;SFA.emit('escape')}});
/* signos vitales del sensor: se guardan en SQLite cada 15 s */
function enviarSignos(){const lote=CREW.filter(c=>LV[c.id].on).map(c=>({tripulante:c.id,v:LV[c.id].v}));if(lote.length)API.post('signos',{lote}).catch(()=>{})}
AL.init=true;
syncClinAll(true).then(()=>{AL.init=false;refreshAlertUI();SFA.bump()});
startPing();setInterval(liveTick,250);setInterval(()=>syncClinAll(false),10000);setInterval(enviarSignos,15000);
window.calibrarPantalla=calibrarPantalla;
