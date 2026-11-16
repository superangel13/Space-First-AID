'use strict';
/* ===== alerta en grande ===== */
let BIG=null,BIGT=null;
function bigAlert(a){if(BIG===a.key)return;BIG=a.key;const c=CREW.find(x=>x.id===a.id),r=a.res;
  $('#bigBx').innerHTML=`<div class="hd2"><span class="ico">!</span><div><span class="cap" style="color:#FF9AA6">Alerta crítica · ${esc(who(a.id))}${c?' · '+esc(c.r):''}</span><h2 id="bigT">${esc(aName(a))}</h2></div></div>
   ${r?`<p style="font-size:17px;font-weight:800">${esc(presentas(r))}</p>${r.red.length?`<p style="color:#FF9AA6;font-weight:800">Señal de alarma: ${esc(r.red.join(' · '))}</p>`:''}<div class="why2"><span class="cap">De dónde viene</span>${r.cr.filter(x=>x.w).map(x=>`<div><span style="color:var(--bad)">●</span><span><b>${esc(x.n)}</b> · ${esc(x.w)}</span></div>`).join('')}</div>`:`<p style="font-size:17px;font-weight:800">${esc(a.val||'')}</p>`}
   <div><span class="cap">Qué hacer ahora</span><ol style="margin-top:8px">${aSteps(a).map(s=>`<li>${esc(s)}</li>`).join('')}</ol></div>
   <p class="note">${r?esc(r.k.src.map(s=>s.t).join(' · ')):'Guía rápida de signos vitales'} · Enviada a la Tierra con prioridad 1.</p>
   <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" id="bigOk" type="button" style="background:#fff">Entendido, la estamos atendiendo</button><button class="btn ghost" id="bigGo" type="button">Abrir el centro de alertas</button></div>`;
  $('#bigal').hidden=false;$('#bigOk').focus();
  const loop=()=>{siren(2);buzz([200,100,200]);sirenaAnim(2)};loop();clearInterval(BIGT);BIGT=setInterval(loop,4500);
  const close=()=>{$('#bigal').hidden=true;clearInterval(BIGT);a.seen=true;BIG=null;refreshAlertUI()};$('#bigOk').onclick=close;$('#bigGo').onclick=()=>{close();location.hash='alertas'}}
function maybeBig(a){if(a.lvl>=2&&!a.seen)bigAlert(a)}

