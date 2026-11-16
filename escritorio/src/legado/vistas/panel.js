'use strict';
/* ================= PANEL (toda la tripulación) =================
   Solo el círculo principal de la tripulación. Los círculos de cada persona
   están en la sección Tripulación (renderCrewGrid). */
const ICO={warn:'<svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1l5 9H1z" fill="currentColor"/></svg>',eye:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>'};
function spark(c){const days=c.days.slice(-7),v=days.map(e=>readyE(c,e)),W=200,H=34,ok=v.filter(x=>x!=null);if(ok.length<2)return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"></svg>`;
  const lo=Math.min(40,...ok),hi=100,X=i=>4+i*(W-8)/(v.length-1),Y=x=>3+(1-(x-lo)/(hi-lo))*(H-6);const pts=v.map((x,i)=>x==null?null:[X(i),Y(x)]).filter(Boolean),col=COL[lvlR(ok[ok.length-1])];
  const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' '),L=pts[pts.length-1];
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="${d} L ${L[0]} ${H} L ${pts[0][0]} ${H} Z" fill="${col}" opacity=".12"/><path d="${d}" fill="none" stroke="${col}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`}
function renderPanel(){
  $('#tlDay').textContent=DAY;$('#tlLen').textContent=LEN;const pc=d=>(d/LEN*100).toFixed(2)+'%';
  $('#tl').innerHTML=`<div class="tl-track"><i style="width:${pc(DAY)}"></i></div><span class="tl-end" style="left:0">Día 0</span><span class="tl-end" style="right:0">Regreso · ${LEN}</span>`+
    [[30,'Ojos · día 30',DAY>=30],[90,'Ojos · día 90',DAY>=90],[LEN-30,'Ojos · R-30',DAY>=LEN-30]].filter(([d],i)=>d>0&&d<LEN&&(i<2?d<LEN-30:true)).map(([d,l,dn])=>`<div class="tl-m ${dn?'done':''}" style="left:${pc(d)}"><span class="d">${ICO.eye}</span><span class="lb">${l}</span></div>`).join('')+
    `<div class="tl-m today" style="left:${pc(DAY)}"><span class="d"></span><span class="lb">Hoy · día ${DAY}</span></div>`;
  renderConsole();
  renderBio();renderMini();updateVitals()}
function zc(c,k,v,dir){if(v==null)return'';const z=(v-c.base[k])/c.sd[k],bad=dir>0?z:-z;return bad>=2?'b':bad>=1?'w':''}
function renderConsole(){const el=$('#medConsole');el.hidden=S.role!=='med';if(el.hidden)return;
  const d=(c,k,v,dec=0)=>{if(v==null)return'—';const b=c.base[k],p=(v-b)/b*100;return `${dec?v.toFixed(dec):v}<small>(${p>=0?'+':''}${p.toFixed(1)} %)</small>`};
  $('#medTbl').innerHTML=`<thead><tr><th>Persona</th><th>Preparación</th><th>Sueño h</th><th>FC reposo lpm</th><th>SpO₂ %</th><th>PVT-B mediana ms</th><th>Lapsos ≥355</th><th>Dosis mSv</th><th>Visión OI / OD</th></tr></thead><tbody>`+
   CREW.map(c=>{const e=today(c),v=c.vis;return `<tr><td><span style="color:${c.col}">●</span> ${esc(c.n)}</td><td class="${{bad:'b',warn:'w'}[lvlR(ready(c))]||''}">${ready(c)??'—'}</td><td class="${zc(c,'sl',e.sl,-1)}">${d(c,'sl',e.sl,1)}</td><td class="${zc(c,'hr',e.hr,1)}">${d(c,'hr',e.hr)}</td><td class="${e.sp!=null&&e.sp<=c.base.sp-4?'b':zc(c,'sp',e.sp,-1)}">${d(c,'sp',e.sp)}</td><td class="${zc(c,'rt',e.rt,1)}">${d(c,'rt',e.rt)}</td><td class="${zc(c,'lap',e.lap,1)}">${e.lap??'—'}<small>base ${c.base.lap}</small></td><td>${e.dose.toFixed(1)}<small>${(e.dose/600*100).toFixed(1)} % de 600</small></td><td class="${eyeState(c).l==='warn'?'w':''}">${v.OI.lc??'—'}/6 · ${v.OD.lc??'—'}/6<small>Amsler ${v.OI.am??'—'} / ${v.OD.am??'—'}</small></td></tr>`}).join('')+'</tbody>'}
function csv(){const h='persona,dia,preparacion,sueno_h,fc_reposo_lpm,spo2_pct,pvtb_mediana_ms,lapsos,anticipaciones,dosis_mSv';
  return [h,...CREW.flatMap(c=>c.days.map(e=>[c.n,e.d,readyE(c,e)??'',e.sl??'',e.hr??'',e.sp??'',e.rt??'',e.lap??'',e.fs??'',e.dose].join(',')))].join('\n')}
$('#csvBtn').onclick=()=>{$('#mTitle').textContent=`Datos de la tripulación · días 1 a ${DAY} (${CREW.length*DAY} filas)`;$('#mText').value=csv();$('#modal').hidden=false;$('#mText').focus();$('#mText').select()};
$('#mClose').onclick=()=>$('#modal').hidden=true;$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').hidden=true};


/* los círculos de cada tripulante y el encabezado del detalle son componentes de React (src/componentes/Tripulantes.jsx) */
function renderCrewGrid(){SFA.bump()}
function renderSelHead(){}
