'use strict';
/* ================= SIRENA DE ALERTAS (arriba a la derecha) =================
   - Aviso nuevo: se ilumina y gira 0.6 s.
   - Emergencia: se ilumina y gira 1.5 s, y se repite cada 5 s mientras
     nadie la atienda (además sale la ventana grande en cualquier sección).
   - Al tocarla se abre el centro de alertas. */
let _sirT=null;
function sirenaAnim(lvl){const s=$('#sirena');if(!s||RM&&lvl<2)return;
  s.classList.remove('gira','emerg');void s.offsetWidth;
  s.classList.add(lvl>=2?'emerg':'gira');clearTimeout(_sirT);
  _sirT=setTimeout(()=>s.classList.remove('gira','emerg'),lvl>=2?1500:600)}
function sirenaEstado(){const s=$('#sirena');if(!s)return;const act=AL.list,crit=act.filter(a=>a.lvl>=2);
  s.classList.toggle('hay',act.length>0);s.classList.toggle('critica',crit.length>0);
  s.setAttribute('aria-label',act.length?`Alertas: ${act.length} activas${crit.length?`, ${crit.length} críticas`:''}`:'Alertas: sin alertas activas')}
$('#sirena').onclick=()=>{location.hash='alertas'};
/* emergencia sin atender: la sirena vuelve a girar cada 5 s */
setInterval(()=>{sirenaEstado();if(AL.list.some(a=>a.lvl>=2&&!a.seen))sirenaAnim(2)},5000);
