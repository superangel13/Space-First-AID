'use strict';
/* ================= SIRENA DE ALERTAS =================
   El dibujo y la animación son del componente de React (src/estructura/Encabezado.jsx).
   Aquí solo se avisa cuándo debe girar:
   - Aviso nuevo: 0.6 s.  - Emergencia: 1.5 s, y se repite cada 5 s mientras nadie la atienda. */
function sirenaAnim(lvl){if(RM&&lvl<2)return;SFA.emit('sirena',lvl)}
setInterval(()=>{if(AL.list.some(a=>a.lvl>=2&&!a.seen))sirenaAnim(2)},5000);
