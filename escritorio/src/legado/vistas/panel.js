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
  const D=CREW.filter(c=>ready(c)!=null),av=f=>Math.round(mean(D.map(f)));
  const rS=av(c=>SC.sleep(c,today(c))),rM=av(c=>SC.mind(c,today(c))),rH=av(c=>SC.heart(c,today(c))),rR=av(ready);
  const st=CREW.map(c=>({c,s:estadoDe(c)})),ok=st.filter(x=>x.s.l==='good').length,need=st.filter(x=>x.s.l==='bad'||x.s.l==='warn'),none=st.filter(x=>x.s.l==='none');
  const big=innerWidth<760?210:236;
  $('#heroRing').innerHTML=ring(big,[{pct:rS,col:'#5B9DFF'},{pct:rM,col:'#A28CFF'},{pct:rH,col:'#FF6B7D'}],big<230?15:17,`<div><div class="rv" style="font-size:${big<230?46:54}px" data-count="${rR}" data-suf="<small>%</small>">${rR}<small>%</small></div><div class="ru">tripulación</div></div>`,5);
  $('#heroCap').textContent=`Día ${DAY} de ${LEN} · misión de larga duración`;
  $('#heroTitle').textContent=ok===CREW.length?'Toda la tripulación está en forma':`${ok} de ${CREW.length} en forma hoy`;
  const list=a=>a.map(x=>x.c.n).join(', ').replace(/, ([^,]*)$/,' y $1');
  $('#heroSub').textContent=(need.length?`Conviene revisar a ${list(need)}.`:'Sueño, atención y corazón dentro del rango de cada persona.')+(none.length?` ${list(none)} no tiene datos de hoy.`:'');
  $('#heroLg').innerHTML=[['Sueño',rS,'#5B9DFF'],['Atención',rM,'#A28CFF'],['Corazón',rH,'#FF6B7D']].map(([n,v,cl])=>`<div><span class="k"><i style="background:${cl}"></i>${n}</span><span class="num" data-count="${v}">${v}</span></div>`).join('');
  const acts=[];CREW.forEach(c=>alerts(c).forEach(a=>acts.push({c,a})));const pri={bad:0,warn:1,none:2};acts.sort((x,y)=>pri[x.a.l]-pri[y.a.l]);
  $('#heroAct').innerHTML=acts.slice(0,4).map(({c,a})=>`<div class="act ${a.l}"><span class="ic" style="color:${c.col}">${c.n[0]}</span><div><b>${esc(c.n)} · ${esc(a.t)}</b><span class="t">${esc(a.do)}</span></div></div>`).join('')||'<div class="act good"><span class="ic">✓</span><div><b>Nada urgente</b><span class="t">Mantengan horarios de sueño y turnos de Órbita.</span></div></div>';
  $('#tlDay').textContent=DAY;$('#tlLen').textContent=LEN;const pc=d=>(d/LEN*100).toFixed(2)+'%';
  $('#tl').innerHTML=`<div class="tl-track"><i style="width:${pc(DAY)}"></i></div><span class="tl-end" style="left:0">Día 0</span><span class="tl-end" style="right:0">Regreso · ${LEN}</span>`+
    [[30,'Ojos · día 30',DAY>=30],[90,'Ojos · día 90',DAY>=90],[LEN-30,'Ojos · R-30',DAY>=LEN-30]].filter(([d],i)=>d>0&&d<LEN&&(i<2?d<LEN-30:true)).map(([d,l,dn])=>`<div class="tl-m ${dn?'done':''}" style="left:${pc(d)}"><span class="d">${ICO.eye}</span><span class="lb">${l}</span></div>`).join('')+
    `<div class="tl-m today" style="left:${pc(DAY)}"><span class="d"></span><span class="lb">Hoy · día ${DAY}</span></div>`;
  renderConsole();
  renderBio();renderMini();renderCirc();updateVitals();animate($('.hero'))}
function zc(c,k,v,dir){if(v==null)return'';const z=(v-c.base[k])/c.sd[k],bad=dir>0?z:-z;return bad>=2?'b':bad>=1?'w':''}
function renderConsole(){const el=$('#medConsole');el.hidden=S.role!=='med';if(el.hidden)return;
  const d=(c,k,v,dec=0)=>{if(v==null)return'—';const b=c.base[k],p=(v-b)/b*100;return `${dec?v.toFixed(dec):v}<small>(${p>=0?'+':''}${p.toFixed(1)} %)</small>`};
  $('#medTbl').innerHTML=`<thead><tr><th>Persona</th><th>Preparación</th><th>Sueño h</th><th>FC reposo lpm</th><th>SpO₂ %</th><th>PVT-B mediana ms</th><th>Lapsos ≥355</th><th>Dosis mSv</th><th>Visión OI / OD</th></tr></thead><tbody>`+
   CREW.map(c=>{const e=today(c),v=c.vis;return `<tr><td><span style="color:${c.col}">●</span> ${esc(c.n)}</td><td class="${{bad:'b',warn:'w'}[lvlR(ready(c))]||''}">${ready(c)??'—'}</td><td class="${zc(c,'sl',e.sl,-1)}">${d(c,'sl',e.sl,1)}</td><td class="${zc(c,'hr',e.hr,1)}">${d(c,'hr',e.hr)}</td><td class="${e.sp!=null&&e.sp<=c.base.sp-4?'b':zc(c,'sp',e.sp,-1)}">${d(c,'sp',e.sp)}</td><td class="${zc(c,'rt',e.rt,1)}">${d(c,'rt',e.rt)}</td><td class="${zc(c,'lap',e.lap,1)}">${e.lap??'—'}<small>base ${c.base.lap}</small></td><td>${e.dose.toFixed(1)}<small>${(e.dose/600*100).toFixed(1)} % de 600</small></td><td class="${eyeState(c).l==='warn'?'w':''}">${v.OI.lc??'—'}/6 · ${v.OD.lc??'—'}/6<small>Amsler ${v.OI.am??'—'} / ${v.OD.am??'—'}</small></td></tr>`}).join('')+'</tbody>'}
function csv(){const h='persona,dia,preparacion,sueno_h,fc_reposo_lpm,spo2_pct,pvtb_mediana_ms,lapsos,anticipaciones,dosis_mSv';
  return [h,...CREW.flatMap(c=>c.days.map(e=>[c.n,e.d,readyE(c,e)??'',e.sl??'',e.hr??'',e.sp??'',e.rt??'',e.lap??'',e.fs??'',e.dose].join(',')))].join('\n')}
$('#csvBtn').onclick=()=>{$('#mTitle').textContent=`Datos de la tripulación · días 1 a ${DAY} (${CREW.length*DAY} filas)`;$('#mText').value=csv();$('#modal').hidden=false;$('#mText').focus();$('#mText').select()};
$('#mClose').onclick=()=>$('#modal').hidden=true;$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').hidden=true};


/* círculos de cada tripulante (sección Tripulación) */
function renderCrewGrid(){
  $('#crewgrid').innerHTML=CREW.map(c=>{const e=today(c),r=ready(c),s=estadoDe(c),A=alerts(c).filter(a=>a.l!=='none');
    const it=[{pct:SC.sleep(c,e),col:'#5B9DFF'},{pct:SC.mind(c,e),col:'#A28CFF'},{pct:SC.heart(c,e),col:'#FF6B7D'}];
    return `<button class="cc" data-id="${c.id}" type="button" style="--pc:${c.col}"><div class="cc-h"><span class="av" style="color:${c.col}">${c.n[0]}</span><div class="cc-n"><b>${esc(c.n)}</b><span>${esc(c.r)}</span></div><span class="st ${s.l}">${s.t}</span></div>
      <div class="cc-m">${ring(124,it,10,`<div class="rv" style="font-size:30px">${r==null?'—':r+'<small>%</small>'}</div>`,3)}<div class="cc-l">${[['Sueño',it[0].pct,'#5B9DFF'],['Atención',it[1].pct,'#A28CFF'],['Corazón',it[2].pct,'#FF6B7D']].map(([n,v,cl])=>`<div><i style="background:${cl}"></i><span>${n}</span><b>${v??'—'}</b></div>`).join('')}</div></div>
      <div class="cc-v" data-ccv="${c.id}"></div>
      <div class="cc-a">${A.map(a=>`<span class="ch ${a.l}">${ICO.warn}${esc(a.t)}</span>`).join('')||(r==null?'<span class="ch">Sensor desconectado</span>':'<span class="ch g">Todo en su rango</span>')}</div>
      <div class="cc-s">${spark(c)}<span>7 días</span></div></button>`}).join('');
  $$('#crewgrid .cc').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.id===S.sel);b.onclick=()=>{if(S.sel!==b.dataset.id){S.sel=b.dataset.id;S.metric='ready';save();renderPersona()}const h=$('#selHead');if(h)h.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'})}});
  updateVitals();animate($('#crewgrid'))}
function renderSelHead(){const c=cur(),s=estadoDe(c);$('#selHead').innerHTML=`<span class="cap">Detalle de</span><b style="color:${c.col}">${esc(c.n)}</b><span class="st ${s.l}">${esc(s.t)}</span>`}
