'use strict';
/* =====================================================================
   PRUEBAS DE MANO Y VISTA  (basadas en la página de entrenamiento
   sensoriomotor del equipo, rediseñadas y con mejor calificación)
   - Seguir puntos con la mano: coordinación ojo-mano
   - Círculo con la mano: motricidad fina
   - La C abierta: agudeza y contraste, sigue hasta que fallas
   - Rejilla de Amsler: cambios en la retina (SANS)
   Se juegan con el ratón, el dedo o la cámara (MediaPipe detecta la punta
   del dedo índice; el modelo viene incluido en vendor/ y no necesita internet).
   Cada resultado se manda a Python, que lo compara con tu línea base.
   ===================================================================== */
const MW=720,MH=480;
const MN={
  alcance:{n:'Seguir puntos con la mano',cap:'Coordinación ojo-mano',d:'Lleva la punta del dedo índice (o el puntero) a cada punto y quédate encima hasta que se llene el anillo. Cuentan la rapidez, qué tan centrado llegas y que no te salgas antes de tiempo.',
    score:'<b>100 puntos por punto</b> si llegas en menos de 0.8 s y al centro. Baja con el tiempo (a los 4 s vale 30 %) y con la distancia al centro (hasta −40 %). <b>Cada salida antes de completar resta 5</b> y un punto que no alcanzas en 5 s vale 0. El puntaje final es el promedio de 12 puntos.'},
  trazo:{n:'Círculo con la mano',cap:'Motricidad fina',d:'Toca el punto verde y recorre el círculo completo con la punta del dedo o el puntero, sin salirte de la línea.',
    score:'<b>Precisión</b>: el error medio contra la línea (0 px = 100 %, 40 px o más = 0 %). <b>Vuelta completa</b>: si no terminas, se multiplica por lo que recorriste. <b>Tiempo</b>: hasta 10 s no resta; después baja hasta la mitad a los 30 s. <b>Regresar en sentido contrario</b> resta 3 puntos cada vez.'},
  letra_c:{n:'La C abierta',cap:'Agudeza y contraste visual',d:'Indica hacia dónde está la abertura de la C con las flechas (teclado o botones). Cada acierto la hace más pequeña; después, más tenue. Sigue hasta que fallas 2 veces seguidas. Tienes 5 s por respuesta. Siéntate a 50 cm de la pantalla.',
    score:'Cada acierto suma más entre más pequeña o tenue es la C. <b>Responder lento resta</b> (después de 1.5 s) y <b>una respuesta sin contestar en 5 s cuenta como error</b>. Se calcula también la agudeza aproximada en logMAR con la calibración de la pantalla.'},
  amsler:{n:'Rejilla de Amsler',cap:'SANS · retina',d:'Tápate un ojo y mira fijo el punto central a 30 cm. Si alguna zona se ve ondulada, borrosa o falta, márcala tocándola. Luego repite con el otro ojo.',
    score:'Se cuenta cuántas zonas marcaste. <b>0 zonas = normal</b>. Cualquier zona marcada es un aviso para repetir con el otro ojo y revisar con el oficial médico (protocolo SANS de la ISS).'}};
const TR={modo:'puntero',stream:null,lm:null,raf:null,ex:null,ptr:null,test:'alcance',ojo:'OD',last:null,cargando:false};

function renderManos(test){TR.test=test||TR.test;const t=MN[TR.test],c=cur();
  $('#mnCap').textContent=`Pruebas · ${t.cap}`;$('#mnTitle').textContent=t.n;$('#mnDesc').textContent=t.d;$('#mnScore').innerHTML=t.score;
  $('#mnOjo').hidden=!['amsler','letra_c'].includes(TR.test);
  $$('#mnOjo button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.o===TR.ojo);b.onclick=()=>{TR.ojo=b.dataset.o;renderManos()}});
  $$('#mnModo button').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.m===TR.modo);b.onclick=()=>b.dataset.m==='camara'?activarCamara():usarPuntero()});
  $('#mnModo').hidden=['letra_c','amsler'].includes(TR.test);
  $('#mnGo').onclick=iniciarPrueba;
  if(!TR.ex)mnStatus(TR.modo==='camara'?'Modo cámara: el punto azul sigue la punta de tu dedo índice.':'Modo puntero: ratón, lápiz o dedo en la pantalla.');
  const cv=$('#mnCanvas'),pos=e=>{const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)*MW/r.width,y:(e.clientY-r.top)*MH/r.height}};
  cv.onpointermove=e=>{if(TR.modo==='puntero')TR.ptr=pos(e)};
  cv.onpointerdown=e=>{const p=pos(e);if(TR.modo==='puntero')TR.ptr=p;if(TR.ex&&TR.ex.click)TR.ex.click(p)};
  cv.onpointerleave=()=>{if(TR.modo==='puntero')TR.ptr=null};
  historialManos(c);
  if(!TR.raf)TR.raf=requestAnimationFrame(mnLoop)}
function mnStatus(t){$('#mnStatus').innerHTML=t}
function usarPuntero(){if(TR.stream){TR.stream.getTracks().forEach(t=>t.stop());TR.stream=null}TR.modo='puntero';$('#mnVideo').hidden=true;renderManos()}
async function activarCamara(){if(TR.modo==='camara'||TR.cargando)return;TR.cargando=true;mnStatus('Pidiendo acceso a la cámara…');
  try{TR.stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode:'user'}})}
  catch(e){TR.cargando=false;mnStatus('⚠ No se pudo usar la cámara (permiso negado o no hay cámara). La prueba funciona con el ratón o el dedo.');return}
  const v=$('#mnVideo');v.srcObject=TR.stream;v.hidden=false;await v.play().catch(()=>{});
  mnStatus('Cargando el detector de manos (incluido en la app, sin internet)…');
  try{const urlManos='/vendor/mediapipe/vision_bundle.mjs',V=await import(/* @vite-ignore */urlManos);const fs=await V.FilesetResolver.forVisionTasks('/vendor/mediapipe/wasm');
    TR.lm=await V.HandLandmarker.createFromOptions(fs,{baseOptions:{modelAssetPath:'/vendor/mediapipe/hand_landmarker.task',delegate:'GPU'},runningMode:'VIDEO',numHands:1});
    TR.modo='camara';mnStatus('Modo cámara: levanta la mano frente a la cámara. El punto azul sigue la punta de tu dedo índice.')}
  catch(e){console.warn(e);mnStatus('⚠ No se pudo cargar el detector de manos. Se usa el puntero.');TR.stream.getTracks().forEach(t=>t.stop());TR.stream=null;v.hidden=true;TR.modo='puntero'}
  TR.cargando=false;renderManos()}
function pararManos(){pararEjercicio();if(TR.raf){cancelAnimationFrame(TR.raf);TR.raf=null}}
function pararEjercicio(){TR.ex=null;$('#mnCtl').hidden=true;$('#mnCtl').innerHTML='';$('#mnDirs').hidden=true;document.removeEventListener('keydown',teclaC)}
function mnLoop(ts){if(CUR!==TR.test){TR.raf=null;return}
  if(TR.modo==='camara'&&TR.lm){const v=$('#mnVideo');if(v.readyState>=2&&v.currentTime!==TR.last){TR.last=v.currentTime;
    try{const r=TR.lm.detectForVideo(v,ts),p=r.landmarks&&r.landmarks[0]&&r.landmarks[0][8];TR.ptr=p?{x:(1-p.x)*MW,y:p.y*MH}:null}catch(e){}}}
  const ctx=$('#mnCanvas').getContext('2d');
  if(TR.ex){TR.ex.update(ts);TR.ex.draw(ctx);if(TR.ex.done()){const r=TR.ex.result();pararEjercicio();terminarPrueba(r)}}else reposo(ctx);
  if(TR.ptr&&!(TR.ex&&TR.ex.sinPuntero)){ctx.beginPath();ctx.arc(TR.ptr.x,TR.ptr.y,9,0,7);ctx.fillStyle='rgba(91,157,255,.95)';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke()}
  TR.raf=requestAnimationFrame(mnLoop)}
function fondo(ctx,claro){ctx.clearRect(0,0,MW,MH);if(claro){ctx.fillStyle='#F4F6FB';ctx.fillRect(0,0,MW,MH)}else if(TR.modo!=='camara'){const g=ctx.createRadialGradient(MW/2,MH/2,40,MW/2,MH/2,MW*.7);g.addColorStop(0,'#0F1622');g.addColorStop(1,'#05070A');ctx.fillStyle=g;ctx.fillRect(0,0,MW,MH)}else{ctx.fillStyle='rgba(5,7,10,.35)';ctx.fillRect(0,0,MW,MH)}}
function txt(ctx,t,x,y,size,col,peso){ctx.fillStyle=col||'#EEF2F6';ctx.font=`${peso||700} ${size||16}px Manrope,system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y)}
function reposo(ctx){fondo(ctx,TR.test==='amsler'||TR.test==='letra_c');const cl=TR.test==='amsler'||TR.test==='letra_c';txt(ctx,MN[TR.test].n,MW/2,MH/2-14,24,cl?'#1D2440':'#EEF2F6',800);txt(ctx,'Presiona «Iniciar»',MW/2,MH/2+20,15,cl?'#5B6687':'#8B96A6')}
function iniciarPrueba(){pararEjercicio();try{snd(1,.01)}catch(e){}TR.ex=({alcance:exAlcance,trazo:exTrazo,letra_c:exLetraC,amsler:exAmsler})[TR.test]();$('#mnRes').innerHTML='<span class="muted">Prueba en curso…</span>'}

/* ---- 1. Seguir puntos ---- */
function exAlcance(){const N=12,R=34,DW=280,LIM=5000;let i=0,tg=null,t0=0,dw=0,last=performance.now(),fin=false,sal=0,dentro=false,dmin=1e9;const pts=[],tiempos=[],precis=[];let fallos=0;
  const sig=()=>{if(i>=N){fin=true;return}tg={x:70+Math.random()*(MW-140),y:70+Math.random()*(MH-140)};t0=performance.now();dw=0;dentro=false;dmin=1e9;i++};sig();
  return{update(now){const dt=now-last;last=now;if(fin)return;const p=TR.ptr,d=p?Math.hypot(p.x-tg.x,p.y-tg.y):1e9;
      if(d<R){if(!dentro){dentro=true;dmin=Math.min(dmin,d)}dmin=Math.min(dmin,d);dw+=dt;
        if(dw>=DW){const t=now-t0-DW,ft=t<=800?1:Math.max(.3,1-(t-800)/3200*.7),fp=1-Math.min(1,dmin/R)*.4,v=Math.round(100*ft*fp);pts.push(v);tiempos.push(t);precis.push(dmin);snd(520+v*3,.06);sig()}}
      else{if(dentro&&dw>60){sal++;snd(200,.05,'triangle',.05)}dentro=false;dw=0}
      if(now-t0>LIM){fallos++;pts.push(0);snd(150,.12,'triangle',.06);sig()}},
    draw(ctx){fondo(ctx);if(!tg)return;const g=ctx.createRadialGradient(tg.x,tg.y,4,tg.x,tg.y,R*1.6);g.addColorStop(0,'rgba(52,227,154,.35)');g.addColorStop(1,'rgba(52,227,154,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(tg.x,tg.y,R*1.6,0,7);ctx.fill();
      ctx.beginPath();ctx.arc(tg.x,tg.y,R,0,7);ctx.strokeStyle='#34E39A';ctx.lineWidth=3;ctx.stroke();ctx.beginPath();ctx.arc(tg.x,tg.y,4,0,7);ctx.fillStyle='#34E39A';ctx.fill();
      if(dw>0){ctx.beginPath();ctx.arc(tg.x,tg.y,R+8,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,dw/DW));ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.stroke()}
      const left=Math.max(0,1-(performance.now()-t0)/LIM);ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(40,MH-22,MW-80,5);ctx.fillStyle=left<.3?'#FF5468':'#5B9DFF';ctx.fillRect(40,MH-22,(MW-80)*left,5);
      txt(ctx,`Punto ${i} de ${N}`,MW/2,26,14,'#8B96A6');if(pts.length)txt(ctx,`${Math.round(mean(pts))} pts`,MW-60,26,14,'#EEF2F6',800)},
    done:()=>fin,
    result(){const sc=Math.max(0,Math.round(mean(pts)-sal*5/N));return{prueba:'alcance',puntaje:sc,unidad:'pts',detalle:{aciertos:tiempos.length,fallos,salidas:sal,tiempo_medio_ms:tiempos.length?Math.round(mean(tiempos)):null,distancia_media_px:precis.length?+mean(precis).toFixed(1):null},
      texto:`${tiempos.length} de ${N} puntos · ${fallos} sin alcanzar · ${sal} salidas · tiempo medio ${tiempos.length?Math.round(mean(tiempos)):'—'} ms · ${precis.length?mean(precis).toFixed(0):'—'} px del centro`}}}}

/* ---- 2. Círculo con la mano ---- */
function exTrazo(){const cx=MW/2,cy=MH/2,R=160,sx=cx,sy=cy-R;let empezo=false,acc=0,prev=null,errs=[],t0=0,fin=false,agot=false,reversa=0,dirPrev=0;const path=[];
  return{update(now){if(fin)return;const p=TR.ptr;
      if(!empezo){if(p&&Math.hypot(p.x-sx,p.y-sy)<24){empezo=true;t0=now;prev=Math.atan2(p.y-cy,p.x-cx);snd(660,.06)}return}
      if(now-t0>30000){fin=true;agot=true;return}if(!p)return;
      const a=Math.atan2(p.y-cy,p.x-cx);let d=a-prev;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;
      if(Math.abs(d)>.02){const s=Math.sign(d);if(dirPrev&&s!==dirPrev&&Math.abs(acc)>.3)reversa++;dirPrev=s}
      acc+=d;prev=a;errs.push(Math.abs(Math.hypot(p.x-cx,p.y-cy)-R));path.push(p);if(Math.abs(acc)>=2*Math.PI)fin=true},
    draw(ctx){fondo(ctx);ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.strokeStyle='rgba(238,242,246,.14)';ctx.lineWidth=26;ctx.stroke();ctx.strokeStyle='rgba(238,242,246,.5)';ctx.lineWidth=2;ctx.stroke();
      if(path.length>1){ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#5B9DFF';ctx.lineWidth=3;ctx.lineJoin='round';ctx.stroke()}
      if(!empezo){ctx.beginPath();ctx.arc(sx,sy,16,0,7);ctx.fillStyle='#34E39A';ctx.fill();txt(ctx,'Toca el punto verde para empezar',cx,cy,16,'#8B96A6')}
      else{const pc=Math.min(100,Math.abs(acc)/(2*Math.PI)*100);txt(ctx,`${pc.toFixed(0)} %`,cx,cy-8,30,'#EEF2F6',800);txt(ctx,`${((performance.now()-t0)/1000).toFixed(1)} s`,cx,cy+24,14,'#8B96A6')}},
    done:()=>fin,
    result(){const m=errs.length?mean(errs):99,cov=Math.min(1,Math.abs(acc)/(2*Math.PI)),t=(performance.now()-t0)/1000,fp=Math.max(0,1-m/40),ft=t<=10?1:Math.max(.5,1-(t-10)/20*.5);
      const sc=Math.max(0,Math.round(100*fp*cov*ft-reversa*3));
      return{prueba:'trazo',puntaje:sc,unidad:'pts',detalle:{error_medio_px:+m.toFixed(1),vuelta_pct:Math.round(cov*100),segundos:+t.toFixed(1),reversas:reversa,tiempo_agotado:agot},
        texto:`${agot?'Tiempo agotado · ':''}${Math.round(cov*100)} % de la vuelta · error medio ${m.toFixed(1)} px · ${t.toFixed(1)} s${reversa?` · ${reversa} regresos`:''}`}}}}

/* ---- 3. La C abierta (sigue hasta que fallas) ---- */
let _respC=null;
function teclaC(e){const m={ArrowUp:3,ArrowRight:0,ArrowDown:1,ArrowLeft:2}[e.key];if(m!==undefined&&_respC){e.preventDefault();_respC(m)}}
function exLetraC(){let fase='tam',tam=110,con=1,dir=0,mal=0,mejor=null,mejorC=null,fin=false,fb=0,fbOk=true,t0=performance.now(),pts=0,aciertos=0,lentas=0;const LIM=5000;
  const nueva=()=>{dir=Math.floor(Math.random()*4);t0=performance.now()};nueva();
  const resp=d=>{if(fin)return;const ok=d===dir,t=performance.now()-t0;fbOk=ok;fb=performance.now();
    if(ok){aciertos++;const dif=fase==='tam'?Math.log2(110/tam)+1:Math.log2(1/con)+4,pen=t>1500?Math.min(.6,(t-1500)/3500*.6):0;if(pen)lentas++;pts+=Math.round(10*dif*(1-pen));snd(700,.05)}else snd(180,.1,'triangle',.06);
    if(fase==='tam'){if(ok){mejor=tam;mal=0;tam=Math.round(tam*.78);if(tam<6){fase='con';mal=0}}else if(++mal>=2){fase='con';mal=0}}
    else{if(ok){mejorC=con;mal=0;con*=.6;if(con<.008)fin=true}else if(++mal>=2)fin=true}
    nueva()};
  _respC=resp;$('#mnDirs').hidden=false;$$('#mnDirs [data-d]').forEach(b=>b.onclick=()=>resp(+b.dataset.d));document.addEventListener('keydown',teclaC);
  return{sinPuntero:true,update(now){if(!fin&&now-t0>LIM)resp(-1)},
    draw(ctx){fondo(ctx,true);const s=fase==='tam'?tam:70,c=fase==='tam'?1:con,g=Math.round(244*(1-c));
      ctx.save();ctx.translate(MW/2,MH/2);ctx.rotate(dir*Math.PI/2);ctx.strokeStyle=`rgb(${g},${g},${Math.min(251,g+7)})`;ctx.lineWidth=s/5;
      const r=s/2-s/10,gap=Math.asin(Math.min(1,(s/5)/(2*r)))*1.1;ctx.beginPath();ctx.arc(0,0,r,gap,2*Math.PI-gap);ctx.stroke();ctx.restore();
      txt(ctx,fase==='tam'?'Agudeza: ¿hacia dónde abre la C?':'Contraste: ¿hacia dónde abre la C?',MW/2,30,15,'#5B6687');txt(ctx,`${pts} pts · ojo ${TR.ojo==='OI'?'izquierdo':'derecho'}`,MW-90,30,13,'#5B6687');
      const left=Math.max(0,1-(performance.now()-t0)/LIM);ctx.fillStyle='#DDE2EC';ctx.fillRect(40,MH-22,MW-80,5);ctx.fillStyle=left<.3?'#D6404F':'#5B9DFF';ctx.fillRect(40,MH-22,(MW-80)*left,5);
      if(performance.now()-fb<350)txt(ctx,fbOk?'✓':'✗',MW-40,MH/2,34,fbOk?'#1F9D63':'#D6404F',800)},
    done:()=>fin,
    result(){const gap=(mejor||120)/5/pxmm(),am=Math.atan(gap/500)*180/Math.PI*60,lm=Math.max(-.3,Math.log10(am)),cc=mejorC?+(mejorC*100).toFixed(1):100;
      return{prueba:'vision_c',puntaje:pts,unidad:'pts',detalle:{ojo:TR.ojo,c_minima_px:mejor,logmar:+lm.toFixed(2),contraste_pct:cc,aciertos,lentas},logmar:+lm.toFixed(2),
        texto:`Ojo ${TR.ojo==='OI'?'izquierdo':'derecho'} · C más pequeña ${mejor??'—'} px (≈ logMAR ${lm.toFixed(2)}) · contraste mínimo ${cc} % · ${aciertos} aciertos${lentas?` · ${lentas} lentas`:''}`}}}}

/* ---- 4. Rejilla de Amsler ---- */
function exAmsler(){const n=20,cell=20,gx=(MW-n*cell)/2,gy=(MH-n*cell)/2,mk=new Set();let fin=false;
  const ctl=$('#mnCtl');ctl.hidden=false;ctl.innerHTML='<button class="btn ghost sm" id="amOk" type="button">Todo se ve recto y completo</button><button class="btn go sm" id="amFin" type="button">Terminar (ya marqué las zonas)</button>';
  $('#amOk').onclick=()=>{mk.clear();fin=true};$('#amFin').onclick=()=>{fin=true};
  return{sinPuntero:false,update(){},
    click(p){const i=Math.floor((p.x-gx)/cell),j=Math.floor((p.y-gy)/cell);if(i<0||j<0||i>=n||j>=n)return;const k=i+','+j;mk.has(k)?mk.delete(k):mk.add(k)},
    draw(ctx){fondo(ctx,true);ctx.fillStyle='rgba(214,64,79,.35)';mk.forEach(k=>{const[i,j]=k.split(',').map(Number);ctx.fillRect(gx+i*cell,gy+j*cell,cell,cell)});
      ctx.strokeStyle='#1D2440';ctx.lineWidth=1;for(let i=0;i<=n;i++){ctx.beginPath();ctx.moveTo(gx+i*cell,gy);ctx.lineTo(gx+i*cell,gy+n*cell);ctx.stroke();ctx.beginPath();ctx.moveTo(gx,gy+i*cell);ctx.lineTo(gx+n*cell,gy+i*cell);ctx.stroke()}
      ctx.beginPath();ctx.arc(MW/2,MH/2,5,0,7);ctx.fillStyle='#1D2440';ctx.fill();txt(ctx,`Ojo ${TR.ojo==='OI'?'izquierdo':'derecho'}: mira solo el punto central`,MW/2,22,14,'#5B6687')},
    done:()=>fin,
    result(){return{prueba:'amsler',puntaje:mk.size,unidad:'zonas',detalle:{ojo:TR.ojo,zonas:[...mk]},texto:`Ojo ${TR.ojo==='OI'?'izquierdo':'derecho'}: ${mk.size?mk.size+' zonas alteradas':'sin alteraciones'}`}}}}

/* ---- resultado: se guarda en la persona y se interpreta en Python ---- */
async function terminarPrueba(r){const c=cur(),v=c.vis[TR.ojo]||(c.vis[TR.ojo]={});
  if(r.prueba==='amsler'){v.am=r.puntaje?'marcas':'ok';v.amPct=r.puntaje/400*100;v.amMarks=r.detalle.zonas}
  if(r.prueba==='vision_c'){if(v.lm0==null)v.lm0=r.logmar;v.lm=r.logmar;v.lc=Math.max(1,Math.min(6,Math.round(6-Math.log2(Math.max(1,r.detalle.contraste_pct)))))}
  save();
  $('#mnRes').innerHTML=`<div class="big num">${r.puntaje} <span class="muted" style="font-size:15px">${r.unidad}</span></div><p class="small">${esc(r.texto)}</p><p class="small muted">Interpretando en Python…</p>`;
  const R=await enviarPrueba(c,r.prueba,r.puntaje,r.detalle);
  if(R){$('#mnRes').innerHTML=`<div class="banner b${R.nivel}"><div><div class="big num">${r.puntaje} <span style="font-size:15px">${r.unidad}</span></div><div class="small">${esc(r.texto)}</div><div style="margin-top:6px;font-weight:700">${esc(R.mensaje)}</div>${R.base!=null?`<div class="small muted">Tu línea base: ${Math.round(R.base)} ${r.unidad}</div>`:''}</div></div>`;if(R.nivel)toast(`${MN[TR.test].n}: ${R.mensaje}`)}
  syncClin(c);historialManos(c)}
const PRU_ID={alcance:'alcance',trazo:'trazo',letra_c:'vision_c',amsler:'amsler'};
async function historialManos(c){const id=PRU_ID[TR.test];try{const r=await API.get('pruebas/'+c.id),h=r.pruebas.filter(x=>x.prueba===id);
  $('#mnHistN').textContent=h.length?`${h.length} sesiones`:'';
  $('#mnHist').innerHTML=h.slice(0,10).map(x=>`<div><time>D${x.dia??'—'}</time><i style="background:${['#34E39A','#F5B841','#FF5468'][x.nivel]}"></i><span>${x.puntaje} ${MN[TR.test].n==='Rejilla de Amsler'?'zonas':'pts'}${x.detalle&&x.detalle.ojo?` · ojo ${x.detalle.ojo==='OI'?'izq.':'der.'}`:''}</span></div>`).join('')||'<p class="muted small">Sin sesiones todavía: la primera será tu línea base.</p>'}catch(e){}}
