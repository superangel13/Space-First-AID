'use strict';
/* ================= encabezado: marca, reloj de misión, intro ================= */
(()=>{const R=70,p=d=>[100+R*Math.cos(d*Math.PI/180),100+R*Math.sin(d*Math.PI/180)],a=p(-28),b=p(278),s=p(-44);
  $('#mkRing').setAttribute('d',`M ${a[0].toFixed(2)} ${a[1].toFixed(2)} A ${R} ${R} 0 1 1 ${b[0].toFixed(2)} ${b[1].toFixed(2)}`);$('#mkSat').setAttribute('cx',s[0]);$('#mkSat').setAttribute('cy',s[1])})();
const metTick=()=>{const d=new Date();$('#met').textContent=`DÍA ${DAY} · ${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}:${String(d.getUTCSeconds()).padStart(2,'0')} UTC`};metTick();setInterval(metTick,1000);
(()=>{const I=$('#intro'),V=$('#introV');let done=false;const end=()=>{if(done)return;done=true;I.classList.add('out');setTimeout(()=>{I.hidden=true;try{V.pause()}catch(e){}},750)};
  let seen=false;try{seen=sessionStorage.getItem('sfa4.intro')==='1';sessionStorage.setItem('sfa4.intro','1')}catch(e){}
  if(seen||RM){I.hidden=true;return}
  V.addEventListener('ended',()=>setTimeout(end,200));V.addEventListener('error',end);$('#skip').onclick=end;I.onclick=end;
  const pr=V.play();if(pr&&pr.catch)pr.catch(end);setTimeout(end,7200)})();

