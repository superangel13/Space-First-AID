'use strict';
/* ===== registro de síntomas ===== */
const SXS={side:'f',zone:null};
const BMR={f:[['head','ellipse',100,34,24,28],['eyes','rect',80,30,40,10],['throat','rect',88,62,24,20],['chest','rect',66,84,68,62],['abd','rect',70,148,60,52],['pelvis','rect',72,202,56,34],['arms','arms'],['legs','legs']],b:[['headb','rect',82,40,36,40],['upback','rect',66,84,68,60],['lowback','rect',72,146,56,46],['flank','flank'],['legsb','legs']]};
function bodySil(){return `<path d="M100 8c14 0 24 11 24 26 0 12-6 21-14 25v8c18 2 34 8 38 22l10 70c2 12 4 30 6 44 1 8-8 10-10 2l-10-60-4 4 2 46c0 8-2 14-4 22l-6 150c0 10-14 10-14 0l-6-130h-4l-6 130c0 10-14 10-14 0l-6-150c-2-8-4-14-4-22l2-46-4-4-10 60c-2 8-11 6-10-2 2-14 4-32 6-44l10-70c4-14 20-20 38-22v-8c-8-4-14-13-14-25 0-15 10-26 24-26z" fill="#121A24" stroke="#26344A" stroke-width="1.5"/>`}
function bmShape(z){const[id,t,...a]=z;if(t==='ellipse')return `<ellipse class="rg" data-z="${id}" cx="${a[0]}" cy="${a[1]}" rx="${a[2]}" ry="${a[3]}"/>`;if(t==='rect')return `<rect class="rg" data-z="${id}" x="${a[0]}" y="${a[1]}" width="${a[2]}" height="${a[3]}" rx="12"/>`;
  if(t==='arms')return `<g class="rg" data-z="${id}"><path d="M60 92l-14 66-8 76 14 2 12-76 10-50z"/><path d="M140 92l14 66 8 76-14 2-12-76-10-50z"/></g>`;
  if(t==='legs')return `<g class="rg" data-z="${id}"><rect x="70" y="240" width="28" height="170" rx="12"/><rect x="102" y="240" width="28" height="170" rx="12"/></g>`;
  if(t==='flank')return `<g class="rg" data-z="${id}"><ellipse cx="66" cy="168" rx="12" ry="20"/><ellipse cx="134" cy="168" rx="12" ry="20"/></g>`}
function zoneOn(c,z){const items=sxState(c).cur.items,list=z==='gen'?SXZ.gen[1]:(SXZ.f[z]||SXZ.b[z]||[0,[]])[1];return list.some(id=>items[id]&&items[id].v>0)}
function renderSintomas(){const c=cur(),R=sxState(c).cur;
  $$('#bmSide button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.s===SXS.side);b.onclick=()=>{SXS.side=b.dataset.s;SXS.zone=null;renderSintomas()}});
  $('#bmSvg').innerHTML=bodySil()+BMR[SXS.side].map(bmShape).join('')+`<text x="100" y="418" text-anchor="middle" fill="#5A6576" font-size="11" font-family="Manrope" font-weight="700">${SXS.side==='f'?'FRENTE':'ESPALDA'}</text>`;
  $$('#bmSvg .rg').forEach(g=>{const z=g.dataset.z;g.classList.toggle('on',zoneOn(c,z));g.classList.toggle('sel',SXS.zone===z);g.onclick=()=>{SXS.zone=z;renderSintomas()}});
  $('#bmGen').onclick=()=>{SXS.zone='gen';renderSintomas()};
  const Z=SXS.zone==='gen'?SXZ.gen:SXS.zone?(SXZ[SXS.side][SXS.zone]||SXZ.f[SXS.zone]||SXZ.b[SXS.zone]):null;
  $('#sxZone').textContent=Z?Z[0]:'Elige una zona del cuerpo';
  $('#sxChips').innerHTML=Z?Z[1].map(id=>`<button type="button" data-sx="${id}" aria-pressed="${!!(R.items[id]&&R.items[id].v>0)}">${esc(SX[id].n)}</button>`).join(''):'<p class="muted small">Toca la zona donde sientes algo, o “Síntomas generales”.</p>';
  $$('#sxChips [data-sx]').forEach(b=>b.onclick=()=>{const id=b.dataset.sx;if(R.items[id]&&R.items[id].v>0)delete R.items[id];else R.items[id]={v:5,on:'hoy',pat:SX[id].pain?'va':null};save();snd(620,.05);renderSintomas()});
  const ids=Object.keys(R.items).filter(id=>R.items[id].v>0);
  $('#sxN').textContent=ids.length?`${ids.length} síntoma${ids.length>1?'s':''}`:'Vacío';
  $('#sxList').innerHTML=ids.length?ids.map(id=>{const x=R.items[id];return `<div class="sxi"><div class="rowb"><b>${esc(SX[id].n)}</b><button class="btn ghost sm" data-rm="${id}" type="button" aria-label="Quitar">Quitar</button></div>
     <div class="sl"><span class="muted small">0</span><input type="range" min="1" max="10" value="${x.v}" data-v="${id}" aria-label="Intensidad"><span class="muted small">10</span><span class="lv" style="color:${x.v>=7?'var(--bad)':x.v>=4?'var(--warn)':'var(--good)'}">${x.v}/10 · ${NIV(x.v)}</span></div>
     ${SX[id].pain?`<div class="mini-seg"><button type="button" data-p="${id}:va" aria-pressed="${x.pat==='va'}">Va y viene</button><button type="button" data-p="${id}:const" aria-pressed="${x.pat==='const'}">Constante</button></div>`:''}
     <div class="mini-seg">${Object.entries(ONS).map(([k,l])=>`<button type="button" data-o="${id}:${k}" aria-pressed="${x.on===k}">${l[0].toUpperCase()+l.slice(1)}</button>`).join('')}</div></div>`}).join(''):'<p class="muted small">Aún no hay síntomas. Si todo está bien, no necesitas registrar nada.</p>';
  $$('#sxList [data-rm]').forEach(b=>b.onclick=()=>{delete R.items[b.dataset.rm];save();renderSintomas()});
  $$('#sxList [data-v]').forEach(i=>{i.oninput=()=>{R.items[i.dataset.v].v=+i.value;const lv=i.parentNode.querySelector('.lv'),v=+i.value;lv.textContent=`${v}/10 · ${NIV(v)}`;lv.style.color=v>=7?'var(--bad)':v>=4?'var(--warn)':'var(--good)'};i.onchange=()=>{save();renderSintomas()}});
  $$('#sxList [data-p]').forEach(b=>b.onclick=()=>{const[id,p]=b.dataset.p.split(':');R.items[id].pat=p;save();renderSintomas()});
  $$('#sxList [data-o]').forEach(b=>b.onclick=()=>{const[id,o]=b.dataset.o.split(':');R.items[id].on=o;save();renderSintomas()});
  const qs=Object.entries(SXQ).filter(([k,q])=>q.if.some(id=>R.items[id]&&R.items[id].v>0));
  $('#sxQ').innerHTML=qs.map(([k,q])=>`<div class="qcard"><span>${esc(q.n)}</span><div class="mini-seg"><button type="button" data-q="${k}:1" aria-pressed="${R.q[k]===true}">Sí</button><button type="button" data-q="${k}:0" aria-pressed="${R.q[k]===false}">No</button></div></div>`).join('');
  $$('#sxQ [data-q]').forEach(b=>b.onclick=()=>{const[k,v]=b.dataset.q.split(':');R.q[k]=v==='1';save();renderSintomas()});
  renderDxMini();
  $('#sxHist').innerHTML=sxState(c).hist.slice(0,20).map(h=>`<div><time>${hhmm(h.t)}</time><i style="background:${['#34E39A','#F5B841','#FF5468'][h.lvl]}"></i><span>${esc(h.txt)}</span></div>`).join('')||'<p class="muted small">Sin registros todavía.</p>'}
function critHTML(r){return `<div class="crit">${r.cr.map(x=>`<div><span class="${x.w?'ok':'muted'}">${x.w?'●':'○'}</span><span><b>${esc(x.n)}</b>${x.w?`<small>${esc(x.w)}</small>`:''}<small style="opacity:.75">Fuente: ${esc(x.s)}</small></span></div>`).join('')}</div>`}
function dxCard(r,open){const lv=r.lvl;return `<div class="dxc l${lv}"><div class="rowb"><div><span class="cap">${esc(r.k.sys)}</span><h3 style="font-size:17px;margin-top:2px">${esc(r.k.n)}</h3></div><div style="display:grid;justify-items:end;gap:4px"><span class="tri">${[0,1,2].map(i=>`<i class="${i<r.hit?'on':''}"></i>`).join('')}</span><span class="cap" style="color:${lv===2?'var(--bad)':lv===1?'var(--warn)':'var(--muted)'}">${lv===2?'Alerta':lv===1?'Advertencia':`${r.hit} de 3`}</span></div></div>
  <p style="font-weight:800">${esc(presentas(r))}</p>${r.desc&&r.desc.length&&r.lvl?`<p class="small" style="color:var(--muted)"><b style="color:var(--text)">Nivel reducido:</b> ${esc(r.desc.join(' · '))}</p>`:''}${r.red.length?`<p class="small" style="color:var(--bad);font-weight:800">Señal de alarma: ${esc(r.red.join(' · '))}</p>`:''}${critHTML(r)}
  ${r.ctx.length?`<div class="small muted"><b style="color:var(--text)">Contexto que suma riesgo:</b> ${esc(r.ctx.join(' · '))}</div>`:''}${r.k.note?`<p class="note">${esc(r.k.note)}</p>`:''}
  ${lv||open?`<details ${lv===2?'open':''}><summary class="small" style="cursor:pointer;font-weight:800">Protocolo de NASA (${r.k.steps.length} pasos)</summary><ol class="small" style="margin:8px 0 0;padding-left:20px;display:grid;gap:4px">${r.k.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details>`:''}
  <div class="srcl">${r.k.src.map(s=>s.u?`<a href="${s.u}" target="_blank" rel="noopener">${esc(s.t)}</a>`:`<span class="small muted" style="padding:5px 10px;border-radius:999px;background:var(--s1)">${esc(s.t)}</span>`).join('')}</div></div>`}
function renderDxMini(){const R=evalKB(cur()).filter(r=>r.lvl||r.red.length);$('#dxMini').innerHTML=R.length?R.map(r=>`<div class="act ${r.lvl>=2?'bad':'warn'}"><span class="ic">!</span><div><b>${esc(r.k.n)}</b><span class="t">${esc(presentas(r))}</span></div></div>`).join(''):'<div class="act good"><span class="ic">✓</span><div><b>Sin advertencias</b><span class="t">El motor no encuentra 2 de 3 indicios de ninguna condición.</span></div></div>'}
function renderDx(){const c=cur(),R=evalKB(c),act=R.filter(r=>r.hit||r.red.length);
  const groups={};act.forEach(r=>(groups[r.k.sys]=groups[r.k.sys]||[]).push(r));
  $('#dxList').innerHTML=act.length?Object.entries(groups).map(([g,rs])=>`<span class="sysh">${esc(g)}</span>${rs.map(r=>dxCard(r)).join('')}`).join(''):'<div class="dxc"><b>Sin indicios</b><p class="muted small">Con lo registrado y los datos de los sensores no hay ninguna condición con indicios. Las condiciones se evalúan con tus síntomas, tus signos vitales, tus pruebas y el contexto de la misión.</p></div>'}
$('#sxSend').onclick=async()=>{const c=cur(),st=sxState(c),R=await syncClin(c,false,true),items=Object.keys(st.cur.items).filter(id=>st.cur.items[id].v>0);
  const top=R.find(r=>r.lvl),lvl=top?top.lvl:0,txt=items.length?`${items.length} síntoma${items.length>1?'s':''}: ${items.map(id=>SX[id].n.toLowerCase()).join(', ')}${top?` → ${top.k.n}`:''}`:'Sin síntomas';
  st.hist.unshift({t:Date.now(),txt,lvl,items:JSON.parse(JSON.stringify(st.cur))});st.hist.length=Math.min(st.hist.length,60);
  qpush({p:lvl>=2?1:2,c:`Registro de síntomas de ${c.n}${top?` · ${top.k.n}`:''}`,data:{tipo:'sintomas',tripulante:c.n,registro:st.cur,evaluacion:R.filter(r=>r.hit).map(r=>({condicion:r.k.n,indicios:r.hit,nivel:r.lvl,senal_alarma:r.red}))}});
  save();toast(top?`${top.lvl>=2?'Alerta':'Advertencia'}: ${top.k.n}`:'Registro guardado');renderSintomas()};
$('#sxClear').onclick=()=>{const st=sxState(cur());st.cur={items:{},q:{}};save();syncClin(cur());renderSintomas();toast('Registro borrado')};

