'use strict';
/* ================= PRUEBAS =================
   Una sola sección con todas las pruebas médicas, en este orden:
   1 ¿Cómo te sientes?  2 Órbita (PVT)  3 Seguir puntos  4 Círculo con la mano
   5 La C abierta  6 Rejilla de Amsler. Cada resultado lo interpreta Python. */
const PRUEBAS_RUTAS=['animo','orbita','alcance','trazo','letra_c'];
async function enviarPrueba(c,prueba,puntaje,detalle){
  try{const r=await API.post('pruebas',{tripulante:c.id,prueba,puntaje,detalle:detalle||{},dia:DAY});sondearEnlace();
    /* menos de 70 %: alerta y afecta los sistemas del tripulante (el motor en Python lo recalcula) */
    const PASOS={pvt:['Respetar el periodo de sueño','Mover las tareas críticas si suben los lapsos','Evitar tareas críticas en las 2 a 4 h después de despertar'],
      alcance:['Repetir la prueba más tarde','Evitar tareas de precisión hasta repetirla','Revisar sueño, fatiga y adaptación sensoriomotora'],
      vision_c:['Usar las gafas de corrección de a bordo','Hacer OCT o ultrasonido ocular si cambia la visión','Mandar las imágenes al oftalmólogo en la Tierra'],
      trazo:['Repetir la prueba más tarde','Revisar fatiga y coordinación']};
    const k='prueba-'+prueba;
    if(r&&r.nivel)raise({id:c.id,type:k,lvl:1,name:`${r.nombre} menor a 70 %`,val:`${Math.round(puntaje)} %`,steps:PASOS[prueba]||['Repetir la prueba'],part:prueba==='vision_c'?'eyes':'brain',src:'prueba',force:true});
    else{const a=AL.list.find(x=>x.key===c.id+':'+k);if(a)closeA(a,'Prueba de nuevo en rango')}
    syncClin(c);return r}
  catch(e){toast('No se pudo guardar la prueba: '+e.message);return null}}
function marcarSubnav(v){const on=PRUEBAS_RUTAS.includes(v);$('#pruebasNav').hidden=!on;
  $$('#pruebasNav a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+v?'page':'false'));
  if(on&&S.ultPrueba!==v){S.ultPrueba=v;save()}}
