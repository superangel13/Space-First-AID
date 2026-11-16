'use strict';
/* ================= utilidades ================= */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=n=>Math.round(n).toLocaleString('es-MX');
const median=a=>{const s=a.filter(x=>x!=null).sort((x,y)=>x-y),n=s.length;return n?(n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2):null};
const quant=(a,q)=>{const s=a.filter(x=>x!=null).sort((x,y)=>x-y);return s[clamp(Math.round(q*(s.length-1)),0,s.length-1)]};
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const sdev=a=>{const m=mean(a);return Math.sqrt(mean(a.map(x=>(x-m)**2)))};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const store={get(k,d){return Object.prototype.hasOwnProperty.call(ESTADO,k)?ESTADO[k]:d},set(k,v){ESTADO[k]=v;guardarEstado(k)},clear(){Object.keys(ESTADO).forEach(k=>{delete ESTADO[k]})}};
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const DAY=MISION.dia_actual,LEN=MISION.duracion,DESTINO=MISION.destino_info||{};

