'use strict';
/* ===== síntomas y avisos =====
   El registro de síntomas (mapa del cuerpo) y las tarjetas de avisos son componentes
   de React: src/vistas/Valoracion.jsx y src/componentes/Avisos.jsx.
   Aquí queda la lista de indicios en HTML, que todavía usan el centro de alertas
   y la tríada de «¿Cómo te sientes?». */
function critHTML(r){return `<div class="crit">${r.cr.map(x=>`<div><span class="${x.w?'ok':'muted'}">${x.w?'●':'○'}</span><span><b>${esc(x.n)}</b>${x.w?`<small>${esc(x.w)}</small>`:''}<small style="opacity:.75">Fuente: ${esc(x.s)}</small></span></div>`).join('')}</div>`}
function renderSintomas(){SFA.bump()}
function renderDxMini(){SFA.bump()}
function renderDx(){SFA.bump()}
