'use strict';
/* ===== alerta en grande =====
   Toda alerta crítica sin atender abre la ventana grande, en cualquier sección.
   La ventana es el componente de React src/componentes/AlertasFlotantes.jsx. */
function bigAlert(a){SFA.emit('alerta-grande',a)}
function maybeBig(a){if(a.lvl>=2&&!a.seen)bigAlert(a)}
