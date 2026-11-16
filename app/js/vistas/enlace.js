'use strict';
/* ================= ENLACE (panel que abre el botón de conexión) ================= */
const RETARDO={luna_base:'Retardo ≈ 1.3 s',luna_orbita:'Retardo ≈ 1.3 s',luna_sobrevuelo:'Retardo ≈ 1.3 s',orbita_baja:'Retardo menor a 0.1 s'};
function renderLinkSvg(){const pend=queue.filter(q=>!q.s).sort((a,b)=>a.p-b.p),on=S.online;
  let g=`<defs><radialGradient id="le" cx=".35" cy=".35"><stop offset="0" stop-color="#7FB2FF"/><stop offset=".7" stop-color="#1D3F8A"/><stop offset="1" stop-color="#0A1A3A"/></radialGradient></defs>`;
  g+=`<line x1="104" y1="85" x2="462" y2="85" stroke="${on?'#34E39A':'#2A3442'}" stroke-width="2" stroke-dasharray="${on?'0':'6 8'}" opacity="${on?.4:1}"/>`;
  if(on&&!RM)g+=`<line x1="104" y1="85" x2="462" y2="85" stroke="#34E39A" stroke-width="2" stroke-dasharray="4 14"><animate attributeName="stroke-dashoffset" values="0;-36" dur="1s" repeatCount="indefinite"/></line>`;
  g+=`<g transform="translate(60 85)"><circle r="42" fill="#11161D" stroke="#243041"/><path d="M-18 6 L-5 -13 L15 -13 L21 0 L15 13 L-5 13 Z" fill="#1B2430" stroke="#EEF2F6" stroke-width="2"/><rect x="-34" y="-5" width="12" height="10" rx="2" fill="#5B9DFF"/><rect x="24" y="-5" width="12" height="10" rx="2" fill="#5B9DFF"/></g>`;
  pend.slice(0,8).forEach((q,i)=>{g+=`<circle cx="${30+(i%4)*14}" cy="${143+Math.floor(i/4)*13}" r="5" fill="${['#FF5468','#F5B841','#8B96A6'][q.p-1]}"/>`});
  g+=`<g transform="translate(504 85)"><circle r="44" fill="url(#le)"/><circle r="44" fill="none" stroke="#5FD3F3" stroke-opacity=".35" stroke-width="5"/></g>`;
  g+=`<text x="283" y="66" text-anchor="middle" fill="${on?'#34E39A':'#F5B841'}" font-size="13" font-weight="800" font-family="Manrope">${on?'CON SEÑAL':'SIN SEÑAL · se guarda en la nave'}</text>`;
  $('#linkSvg').innerHTML=g}
function renderEnlace(){renderLinkSvg();
  $('#lShip').textContent=`Nave · ${LINK.pendientes||0} en cola`;$('#lDelay').textContent=RETARDO[MISION.destino]||'';
  $('#linkBtn').textContent=LINK.sin_senal?'Recuperar señal':'Simular pérdida de señal';
  const lab={1:'Alerta',2:'Resumen',3:'Detalle'};
  $('#queue').innerHTML=queue.length?queue.map(q=>`<div class="qi"><span class="pr p${q.p}">${lab[q.p]||'Detalle'}</span><span>${esc(q.c)}</span><span style="font-size:12.5px;font-weight:800;color:${q.s?'var(--good)':S.online?'var(--text)':'var(--muted)'}">${q.s?'✓ Enviado':S.online?'Enviando…':'En espera'}</span></div>`).join(''):'<p class="muted small">Aún no hay paquetes.</p>';
  ['1','2','3'].forEach(k=>$('#pr'+k).checked=!!S.priv[k]);
  $('#lStat').innerHTML=LINK.sin_senal?'<b style="color:var(--warn)">Pérdida de señal simulada</b>: todo se guarda en la nave.':
    LINK.en_linea?`<b style="color:var(--good)">Conectado</b> con ${esc(LINK.tierra_url)} · ${LINK.enviados} paquetes entregados`:
    `<b style="color:var(--warn)">Sin conexión</b> con ${esc(LINK.tierra_url||'el centro de control')}: ${LINK.pendientes} en cola, se reintenta solo.`}
function renderLinkChip(){const pend=LINK.pendientes||0;$('#linkDot').className='dot'+(S.online?'':' w');$('#linkTxt').textContent=S.online?(pend?`Enviando · ${pend}`:'Con señal'):`Sin señal · ${pend} en cola`}
function abrirEnlace(){$('#enlacePanel').hidden=false;renderEnlace()}
$('#linkChip').onclick=abrirEnlace;
$("#linkBtn").onclick=()=>toggleLink();
$('#enlCerrar').onclick=()=>$('#enlacePanel').hidden=true;
$('#enlacePanel').onclick=e=>{if(e.target.id==='enlacePanel')$('#enlacePanel').hidden=true};
['1','2','3'].forEach(k=>$('#pr'+k).onchange=e=>{S.priv[k]=e.target.checked;save();toast(e.target.checked?'Compartirás esto con la Tierra':'Esto se queda en la nave')});
