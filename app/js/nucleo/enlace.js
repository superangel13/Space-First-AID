'use strict';
/* ===== enlace con la Tierra =====
   Lo maneja el servidor de la nave (Python, nave/enlace.py): guarda la cola en
   SQLite y la envía por prioridad cuando el centro de control responde.
   La pantalla solo consulta el estado y agrega paquetes. */
let queue=[];
const LINK={en_linea:false,sin_senal:false,pendientes:0,enviados:0,tierra_url:'',primera:true};
async function sondearEnlace(){
  try{const r=await API.get('enlace'),was=LINK.en_linea;Object.assign(LINK,r);
    queue=(r.ultimos||[]).map(x=>({p:x.prioridad,c:x.resumen,s:x.enviado?1:0,t:x.creado}));
    S.online=!!r.en_linea;
    if(!LINK.primera&&was!==S.online)toast(S.online?'Conexión con el centro de control: enviando por prioridad':'Sin conexión: todo se guarda en la nave');
    LINK.primera=false}
  catch(e){S.online=false;LINK.en_linea=false}
  renderLinkChip();if(!$('#enlacePanel').hidden)renderEnlace()}
function qpush(o){API.post('enlace/cola',{prioridad:o.p||3,resumen:o.c,datos:o.data||null}).then(sondearEnlace).catch(()=>{});return o}
function flush(){}
let pingT=null;
function startPing(){clearInterval(pingT);sondearEnlace();pingT=setInterval(sondearEnlace,3000)}
async function toggleLink(){
  try{const r=await API.post('enlace/modo',{sin_senal:!LINK.sin_senal});Object.assign(LINK,r);S.online=!!r.en_linea;
    toast(LINK.sin_senal?'Pérdida de señal simulada: todo se guarda en la nave':'Buscando de nuevo al centro de control…');
    setTimeout(sondearEnlace,800)}catch(e){toast('No se pudo cambiar el enlace: '+e.message)}
  renderEnlace();renderLinkChip()}
