'use strict';
/* ================= anillos y números animados ================= */
function ringSVG(size,items,stroke,gap){let s=`<svg class="rsvg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">`;
  items.forEach((it,i)=>{const r=size/2-stroke/2-i*(stroke+gap);if(r<=stroke/2)return;const C=2*Math.PI*r;
    s+=`<circle cx="${size/2}" cy="${size/2}" r="${r.toFixed(2)}" fill="none" stroke="${it.col}" stroke-opacity="${it.pct==null?.07:.16}" stroke-width="${stroke}"/>`;
    if(it.pct!=null){const p=clamp(it.pct,0,100);s+=`<circle class="fg" cx="${size/2}" cy="${size/2}" r="${r.toFixed(2)}" fill="none" stroke="${it.col}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C*(1-p/100)).toFixed(2)}"/>`}});
  return s+'</svg>'}
const ring=(size,items,stroke,center,gap=4)=>`<div class="ring" style="width:${size}px;height:${size}px">${ringSVG(size,items,stroke,gap)}<div class="rin">${center||''}</div></div>`;
function animate(root){if(!root||RM)return;
  root.querySelectorAll('circle.fg').forEach(el=>{const to=el.getAttribute('stroke-dashoffset'),C=el.getAttribute('stroke-dasharray');el.style.transition='none';el.setAttribute('stroke-dashoffset',C);el.getBoundingClientRect();el.style.transition='';requestAnimationFrame(()=>el.setAttribute('stroke-dashoffset',to))});
  root.querySelectorAll('[data-count]').forEach(el=>{const to=+el.dataset.count,suf=el.dataset.suf||'',t0=performance.now();
    const st=t=>{const p=Math.min(1,(t-t0)/1000),e=1-Math.pow(1-p,3);el.innerHTML=Math.round(to*e).toLocaleString('es-MX')+suf;if(p<1)requestAnimationFrame(st)};requestAnimationFrame(st)})}
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2800)};

