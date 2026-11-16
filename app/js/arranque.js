'use strict';
/* ================= arranque =================
   1) Pregunta al servidor si hay una misión registrada.
   2) Si no hay, muestra el registro inicial (o la misión demo).
   3) Si hay, carga parámetros y estado, y después los módulos de la app en orden. */
const MODULOS=[
 'nucleo/utilidades.js','datos/fuentes.js','nucleo/tripulacion.js','nucleo/puntuaciones.js','ui/anillos.js','ui/encabezado.js',
 'ui/selector.js','vistas/panel.js','vistas/persona.js','juegos/orbita.js','juegos/calibracion.js','juegos/manos.js','vistas/enlace.js',
 'vistas/referencias.js','nucleo/signos.js','nucleo/alertas.js','nucleo/predicciones.js','vistas/mision.js','ui/cuerpo3d.js',
 'vistas/alertas.js','ui/ambiente.js','vistas/midia.js','motor/clinico.js','vistas/sintomas.js','vistas/muestras.js',
 'ui/alerta_grande.js','ui/sirena.js','ui/circadiano.js','juegos/mente.js','nucleo/enlace.js','vistas/pruebas.js','main.js'];
function cargarScript(src){return new Promise((ok,mal)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>mal(new Error('No se pudo cargar '+src));document.body.appendChild(s)})}
async function iniciarApp(m){
  window.MISION=m.mision;window.TRIP=m.tripulantes;window.DESTINOS=m.destinos;
  const [est,umb,mu]=await Promise.all([API.get('estado'),fetch('/datos/umbrales.json').then(r=>r.json()),fetch('/datos/muestras.json').then(r=>r.json())]);
  window.ESTADO=est||{};window.UMB=umb;window.PMU=mu;
  document.body.classList.add('app-on');
  for(const f of MODULOS)await cargarScript('js/'+f);
}
(async()=>{
  let m;
  try{m=await API.get('mision')}
  catch(e){document.body.innerHTML='<div class="sinsrv"><h1>No hay conexión con el servidor de la nave</h1><p>Abre una terminal en la carpeta del proyecto y corre:</p><pre>python3 iniciar.py</pre><p>Después recarga esta página.</p></div>';return}
  if(!m.mision){mostrarRegistro(m.destinos);return}
  try{await iniciarApp(m)}catch(e){console.error(e);toastSimple('Error al cargar: '+e.message)}
})();
function toastSimple(t){const d=document.createElement('div');d.className='toast on';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),5000)}
