'use strict';
/* ================= tripulación (datos de ejemplo, semilla fija) ================= */
const CREW=TRIP.map(t=>{const m=t.sim||{};return{id:t.id,n:t.nombre,r:t.rol,col:t.color,sex:t.sexo,edad:t.edad,fit:t.condicion||'media',hx:t.antecedentes||[],notas:t.notas||'',
  hr:m.hr||62,sl:m.sl||7.3,rt:m.rt||290,sp:m.sp||98,prior:m.prior||20,rate:m.rate||.47,eva:!!m.eva||/caminata/i.test(t.rol),ev:m.ev||{},noData:!!m.noData,sim:m,
  vis:m.vis?JSON.parse(JSON.stringify(m.vis)):{OI:{am:'ok',lc:6},OD:{am:'ok',lc:6}}}});
CREW.forEach((c,ci)=>{const R=rng(ci*977+13),n=a=>(R()+R()+R()-1.5)*a;let dose=c.prior;c.days=[];
  c.fd30={OI:{am:'ok',lc:6},OD:{am:'ok',lc:6}};
  for(let d=1;d<=DAY;d++){const late=Math.max(0,(d-(DAY-10))/10),e={d};
    e.sl=+clamp(c.sl+n(.7)+(c.ev.sl||0)*late,4.4,9.2).toFixed(1);
    e.hr=Math.round(c.hr+n(2.6)+(c.ev.hr||0)*c.hr*late);
    e.rt=Math.round(c.rt+n(12)+(c.ev.rt||0)*c.rt*late);
    e.sp=clamp(Math.round(c.sp+n(1)),96,100);
    if(d===DAY&&c.ev.spToday)e.sp=c.sp+c.ev.spToday;
    e.lap=Math.max(0,Math.round((e.rt-c.rt)/14+R()*1.5));
    e.fs=R()<.25?1:0;
    dose+=c.rate+n(.06)+(d===27?1.6:0)+(c.eva&&(d===12||d===25||d===38)?.9:0);e.dose=+dose.toFixed(1);
    c.days.push(e)}
  if(c.noData){const e=c.days[DAY-1];e.sl=e.hr=e.rt=e.sp=e.lap=e.fs=null}
  const b=c.days.slice(0,14);c.base={};c.band={};c.sd={};
  ['sl','hr','rt','sp','lap'].forEach(k=>{const v=b.map(e=>e[k]);c.base[k]=+median(v).toFixed(k==='sl'?1:0);c.band[k]=[quant(v,.1),quant(v,.9)];c.sd[k]=sdev(v)||1})});

const S=Object.assign({lmode:(location.protocol==='file:'||/^(localhost|127\.0\.0\.1)$/.test(location.hostname))?'real':'sim',earthUrl:'http://localhost:8766',forceOff:false,sel:CREW[0].id,metric:'ready',role:'crew',online:false,dest:'luna',eye:'OI',prof:{},vis:{},priv:{1:false,2:false,3:true},sound:true,games:{},rt:{},logSel:null},store.get('state',{}));
CREW.forEach(c=>{if(S.prof[c.id])Object.assign(c,S.prof[c.id]);if(S.vis[c.id])c.vis=S.vis[c.id];if(S.rt&&S.rt[c.id])Object.assign(c.days[DAY-1],S.rt[c.id])});
function save(){CREW.forEach(c=>{S.prof[c.id]={hx:c.hx,fit:c.fit};S.vis[c.id]=c.vis});store.set('state',S)}
const cur=()=>CREW.find(c=>c.id===S.sel)||CREW[0];
const today=c=>c.days[DAY-1];

