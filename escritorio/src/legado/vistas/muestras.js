'use strict';
/* ================= MUESTRAS DE ORINA, SANGRE Y SALIVA =================
   El tripulante captura el análisis previo hecho con el equipo de a bordo.
   La muestra se manda a la Tierra; cuando el laboratorio captura su
   resultado, regresa por el enlace y ese manda sobre el de a bordo.
   Los rangos están en datos/muestras.json (de ejemplo por ahora). */
const MU={tipo:'orina',cache:{}};
const ESC_CUAL=()=>PMU.escala_cualitativa;
function campoMuestra(a){const id='mu_'+a.id;
  if(a.tipo==='cual')return `<label class="fl">${esc(a.nombre)}<select id="${id}" data-a="${a.id}"><option value="">—</option>${ESC_CUAL().map(o=>`<option>${o}</option>`).join('')}</select></label>`;
  const lo=a.normal?a.normal[0]:'',hi=a.normal?a.normal[1]:'';
  return `<label class="fl">${esc(a.nombre)}${a.unidad?` <span class="muted">(${esc(a.unidad)})</span>`:''}<input id="${id}" data-a="${a.id}" type="number" step="any" inputmode="decimal" placeholder="normal ${lo}–${hi}"></label>`}
function renderMuestras(){const P=PMU.tipos[MU.tipo];
  $('#muTipo').innerHTML=Object.entries(PMU.tipos).map(([k,t])=>`<button type="button" data-t="${k}" aria-pressed="${k===MU.tipo}">${esc(t.nombre)}</button>`).join('');
  $$('#muTipo button').forEach(b=>b.onclick=()=>{MU.tipo=b.dataset.t;renderMuestras()});
  $('#muInfo').innerHTML=`Equipo a bordo: <b>${esc(P.equipo_a_bordo)}</b>. ${esc(PMU.regla_origen)} <span class="tagx">Parámetros de ejemplo</span>`;
  $('#muForm').innerHTML=`<div class="mufields">${P.analitos.map(campoMuestra).join('')}</div>
    <label class="fl">Fecha y hora de la toma<input id="muTomada" type="datetime-local" value="${new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16)}"></label>
    <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn go" type="submit">Guardar análisis de a bordo y enviar a la Tierra</button><button class="btn ghost sm" type="button" id="muEjN">Ejemplo normal</button><button class="btn ghost sm" type="button" id="muEjA">Ejemplo alterado</button></div>
    <p class="small" id="muMsg" role="status"></p>`;
  $('#muEjN').onclick=()=>ejemploMuestra(false);$('#muEjA').onclick=()=>ejemploMuestra(true);
  $('#muForm').onsubmit=async e=>{e.preventDefault();const c=cur(),valores={};
    $$('#muForm [data-a]').forEach(i=>{if(i.value!=='')valores[i.dataset.a]=i.tagName==='SELECT'?i.value:+i.value});
    if(!Object.keys(valores).length){$('#muMsg').innerHTML='<span style="color:var(--warn)">Captura al menos un valor.</span>';return}
    $('#muMsg').textContent='Guardando y analizando en Python…';
    try{const r=await API.post('muestras',{tripulante:c.id,tipo:MU.tipo,valores,tomada:new Date($('#muTomada').value).toISOString()});
      $('#muMsg').innerHTML=`<b style="color:${r.nivel>=2?'var(--bad)':r.nivel?'var(--warn)':'var(--good)'}">${esc(r.codigo)} · ${esc(r.resumen)}</b> · en cola para la Tierra`;
      toast(`Muestra ${r.codigo} guardada`);$$('#muForm [data-a]').forEach(i=>i.value='');sondearEnlace();await cargarVigentes(c);syncClin(c)}
    catch(err){$('#muMsg').innerHTML=`<span style="color:var(--bad)">${esc(err.message)}</span>`}};
  cargarVigentes(cur())}
function ejemploMuestra(alterado){const P=PMU.tipos[MU.tipo];
  P.analitos.forEach(a=>{const i=$('#mu_'+a.id);if(!i)return;
    if(a.tipo==='cual'){i.value=alterado&&['sangre','leucocitos','nitritos','vzv'].includes(a.id)?(a.id==='sangre'?'++':'+'):'negativo';return}
    const[lo,hi]=a.normal,mid=lo+(hi-lo)*(.35+Math.random()*.3),alto=alterado&&['calcio','leucocitos_s','cortisol','densidad'].includes(a.id);
    const v=alto?hi*(a.id==='densidad'?1.006:1.35):mid,dec=String(a.paso||1).includes('.')?String(a.paso).split('.')[1].length:0;i.value=v.toFixed(dec)})}
async function cargarVigentes(c){try{const r=await API.get('muestras/'+c.id);MU.cache[c.id]=r;
  $('#muVig').innerHTML=r.vigentes.length?r.vigentes.slice(0,8).map(m=>{const res=m.resultado||{},an=Object.values(res.analitos||{}).filter(x=>x.nivel||x.fuera);
    return `<div class="muv l${m.nivel}"><div class="rowb"><div><b>${esc(m.codigo)}</b> · ${esc(PMU.tipos[m.tipo].nombre)}</div><span class="org ${m.origen}">${m.origen==='tierra'?'Laboratorio en Tierra · vigente':'Análisis a bordo · previo'}</span></div>
      <p class="small">${esc(res.resumen||'')}</p>${an.length?`<ul class="small">${an.map(x=>`<li><b>${esc(x.nombre)}</b>: ${esc(String(x.valor))} ${esc(x.unidad||'')} · ${esc(x.texto)}</li>`).join('')}</ul>`:''}
      <span class="muted small">${new Date(m.tomada).toLocaleString('es-MX',{dateStyle:'short',timeStyle:'short'})}</span></div>`}).join(''):'<p class="muted small">Sin muestras todavía para esta persona.</p>'}catch(e){}}
