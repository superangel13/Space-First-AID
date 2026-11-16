'use strict';
/* ================= PRUEBAS =================
   Una sola sección con todas las pruebas médicas, en este orden:
   1 ¿Cómo te sientes?  2 Órbita (PVT)  3 Seguir puntos  4 Círculo con la mano
   5 La C abierta  6 Rejilla de Amsler. Cada resultado lo interpreta Python. */
const PRUEBAS_RUTAS=['animo','orbita','alcance','trazo','letra_c'];
async function enviarPrueba(c,prueba,puntaje,detalle){
  try{const r=await API.post('pruebas',{tripulante:c.id,prueba,puntaje,detalle:detalle||{},dia:DAY});sondearEnlace();return r}
  catch(e){toast('No se pudo guardar la prueba: '+e.message);return null}}
function marcarSubnav(v){const on=PRUEBAS_RUTAS.includes(v);$('#pruebasNav').hidden=!on;
  $$('#pruebasNav a').forEach(a=>a.setAttribute('aria-current',a.getAttribute('href')==='#'+v?'page':'false'));
  if(on&&S.ultPrueba!==v){S.ultPrueba=v;save()}}
