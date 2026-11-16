'use strict';
/* ================= selector de persona y vista ================= */
function renderPickers(){const c=cur();$$('[data-pick]').forEach(el=>{el.innerHTML=CREW.map(x=>{const s=estadoDe(x);return `<button type="button" data-id="${x.id}" aria-pressed="${x.id===c.id}"><span class="av" style="color:${x.col}">${x.n[0]}</span>${esc(x.n)}<span class="pd" style="background:${COL[s.l]}"></span></button>`}).join('');
  el.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(GS&&!GS.done)return toast('Termina tu turno antes de cambiar de persona');S.sel=b.dataset.id;save();render()})})}

