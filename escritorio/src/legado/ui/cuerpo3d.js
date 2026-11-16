'use strict';
/* =====================================================================
   GEMELO DIGITAL 3D DE TODA LA TRIPULACIÓN
   Malla anatómica propia (superficie implícita + marching cubes, generada
   con generar_cuerpo.py) con sombreado holográfico y órganos internos.
   ===================================================================== */
const T3={figs:[],drag:null,yaw:{},idle:0,camX:0,camZ:5};
const ORGS={heart:[[0.028,1.29,0.05,.042,.048,.04]],lungs:[[-0.066,1.31,0,.046,.088,.044],[0.066,1.31,0,.046,.088,.044]],brain:[[0,1.655,0,.066,.058,.074]],eyes:[[-0.03,1.625,0.083,.014,.014,.014],[0.03,1.625,0.083,.014,.014,.014]],ear:[[-0.084,1.62,0,.012,.022,.016],[0.084,1.62,0,.012,.022,.016]],kidney:[[-0.056,1.08,-0.045,.026,.042,.024],[0.056,1.08,-0.045,.026,.042,.024]],spine:[[0,1.19,-0.07,.016,.28,.016]],legs:[[-0.094,0.7,0,.022,.2,.022],[0.094,0.7,0,.022,.2,.022],[-0.104,0.3,-0.01,.018,.19,.018],[0.104,0.3,-0.01,.018,.19,.018]],bones:[[0,1.19,-0.07,.016,.28,.016],[0,0.93,-0.02,.11,.05,.06],[-0.094,0.7,0,.022,.2,.022],[0.094,0.7,0,.022,.2,.022]],body:[]};
const HV='varying vec3 vN;varying vec3 vV;varying float vY;void main(){vY=position.y;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}';
const HF='uniform vec3 uCol;uniform float uT;uniform float uA;uniform float uP;varying vec3 vN;varying vec3 vV;varying float vY;void main(){float f=pow(1.0-abs(dot(normalize(vN),normalize(vV))),2.1);float s=fract(uT*0.2)*2.1-0.1;float band=smoothstep(0.035,0.0,abs(vY-s));float ln=smoothstep(0.93,1.0,abs(sin(vY*95.0)))*0.16;vec3 c=uCol*(0.05+f*1.45+band*0.75+ln+uP*0.25);gl_FragColor=vec4(c,(0.04+f*0.85+band*0.35+ln*0.5+uP*0.12)*uA);}';
function b64a(s,T){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new T(u.buffer)}
function bodyGeo(){const M=window.BODY_MESH,p=b64a(M.v,Int16Array),n=b64a(M.n,Int8Array),ix=b64a(M.i,M.i32?Uint32Array:Uint16Array),g=new THREE.BufferGeometry(),pf=new Float32Array(p.length),nf=new Float32Array(n.length);
  for(let i=0;i<p.length;i++)pf[i]=p[i]/16000;for(let i=0;i<n.length;i++)nf[i]=n[i]/127;g.setAttribute('position',new THREE.BufferAttribute(pf,3));g.setAttribute('normal',new THREE.BufferAttribute(nf,3));g.setIndex(new THREE.BufferAttribute(ix,1));return g}
const HAS3=typeof THREE!=='undefined',CYAN=HAS3&&new THREE.Color(0x5FD3F3),AMB=HAS3&&new THREE.Color(0xF5B841),RED=HAS3&&new THREE.Color(0xFF5468),GRY=HAS3&&new THREE.Color(0x5A6576);
function t3Build(){const host=$('#av3d');if(T3.R||T3.fb)return;
  try{if(typeof THREE==='undefined'||!window.BODY_MESH)throw 0;T3.R=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){T3.fb=true;host.insertAdjacentHTML('afterbegin','<svg id="av2d" viewBox="0 0 360 440" style="width:100%;height:100%"></svg>');return}
  const R=T3.R,W=host.clientWidth||900,H=host.clientHeight||460;R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.setSize(W,H);host.prepend(R.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(26,W/H,.1,60),geo=bodyGeo(),sph=new THREE.SphereGeometry(1,22,16);
  const floor=new THREE.Mesh(new THREE.RingGeometry(.3,3.4,96,1),new THREE.MeshBasicMaterial({color:0x5FD3F3,transparent:true,opacity:.035,side:THREE.DoubleSide,depthWrite:false}));floor.rotation.x=-Math.PI/2;scene.add(floor);
  for(let r=.8;r<3.5;r+=.6){const g=new THREE.Mesh(new THREE.RingGeometry(r,r+.004,128),new THREE.MeshBasicMaterial({color:0x5FD3F3,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));g.rotation.x=-Math.PI/2;scene.add(g)}
  CREW.forEach((c,i)=>{const grp=new THREE.Group(),x=(i-(CREW.length-1)/2)*.68;grp.position.set(x,0,-Math.abs(x)*.18);scene.add(grp);
    const mat=new THREE.ShaderMaterial({uniforms:{uCol:{value:CYAN.clone()},uT:{value:0},uA:{value:1},uP:{value:0}},vertexShader:HV,fragmentShader:HF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    const body=new THREE.Mesh(geo,mat);grp.add(body);
    const org={};Object.entries(ORGS).forEach(([k,arr])=>{org[k]=arr.map(o=>{const m=new THREE.Mesh(sph,new THREE.MeshBasicMaterial({color:0x5FD3F3,transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(o[0],o[1],o[2]);m.scale.set(o[3],o[4],o[5]);grp.add(m);
      const h=new THREE.Mesh(sph,new THREE.MeshBasicMaterial({color:0xFF5468,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));h.position.copy(m.position);h.scale.set(o[3]*2,o[4]*1.6,o[5]*2);grp.add(h);m.userData.h=h;return m})});
    const ring=new THREE.Mesh(new THREE.RingGeometry(.2,.215,64),new THREE.MeshBasicMaterial({color:0x5FD3F3,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.004;grp.add(ring);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(.2,48),new THREE.MeshBasicMaterial({color:0x5FD3F3,transparent:true,opacity:.08,depthWrite:false}));disc.rotation.x=-Math.PI/2;disc.position.y=.003;grp.add(disc);
    T3.figs.push({c,grp,mat,org,ring,disc,x});T3.yaw[c.id]=-x*.25});
  Object.assign(T3,{scene,cam,host});
  const el=R.domElement;let down=null;
  el.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,yaw:T3.yaw[S.sel]||0};T3.idle=0});
  window.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;if(Math.abs(dx)>5){T3.drag=true;T3.yaw[S.sel]=down.yaw+dx*.012}});
  window.addEventListener('pointerup',e=>{if(down&&!T3.drag)t3Pick(e.clientX,e.clientY);down=null;T3.drag=false});
  new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){R.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()}}).observe(host)}
function t3Pick(cx,cy){const r=T3.host.getBoundingClientRect(),v=new THREE.Vector3();let best=null,bd=1e9;T3.figs.forEach(f=>{v.set(f.grp.position.x,.95,f.grp.position.z).project(T3.cam);const sx=(v.x*.5+.5)*r.width+r.left,sy=(-v.y*.5+.5)*r.height+r.top,d=Math.abs(sx-cx)+Math.abs(sy-cy)*.25;if(d<bd){bd=d;best=f}});
  if(best&&bd<r.width*.09&&best.c.id!==S.sel){S.sel=best.c.id;save();snd(660,.06);renderBio()}}
function partsFor(id){const m={};AL.list.forEach(a=>{if(a.id!==id&&!(a.id==='nave'&&a.type==='tormenta'))return;const p=aPart(a);if(!p)return;m[p]=Math.max(m[p]||0,a.lvl)});return m}
function t3Frame(time,dt){if(T3.fb){if(T3.fbk!==S.sel+AL.list.length){T3.fbk=S.sel+AL.list.length;drawBody(cur(),$('#av2d'))}return}if(!T3.R)return;
  const w=T3.host.clientWidth,h=T3.host.clientHeight,asp=w/h,tf=Math.tan(13*Math.PI/180),sel=T3.figs.find(f=>f.c.id===S.sel)||T3.figs[0],narrow=asp<1.5;
  const zH=1.08/tf,zW=(Math.abs(T3.figs[0].x)+.42)/(tf*asp),tz=narrow?zH*.92:Math.max(zH,zW),tx=narrow?sel.x:sel.x*.18;
  T3.camX+=(tx-T3.camX)*(1-Math.exp(-dt*3));T3.camZ+=(tz-T3.camZ)*(1-Math.exp(-dt*3));T3.cam.position.set(T3.camX,1.02,T3.camZ);T3.cam.lookAt(T3.camX,.93,0);
  T3.idle+=dt;const labs=[],tags=[],v=new THREE.Vector3();
  T3.figs.forEach(f=>{const c=f.c,L=LV[c.id],pm=partsFor(c.id),mx=Object.values(pm).length?Math.max(...Object.values(pm)):0,isS=f===sel,st=estadoDe(c),pulse=.5+.5*Math.sin(time*(L.on?L.v.hr/60:1)*Math.PI*2);
    const col=!L.on&&!mx?GRY:mx>=2?RED:mx===1?AMB:CYAN;f.mat.uniforms.uCol.value.lerp(col,1-Math.exp(-dt*4));f.mat.uniforms.uT.value=time+f.x;f.mat.uniforms.uA.value+=((isS?1:.5)-f.mat.uniforms.uA.value)*(1-Math.exp(-dt*5));f.mat.uniforms.uP.value=mx>=2?pulse*.6:0;
    if(isS&&!T3.drag&&T3.idle>2.5)T3.yaw[c.id]+=dt*.22;f.grp.rotation.y=T3.yaw[c.id];f.grp.position.y=Math.sin(time*1.1+f.x*3)*.006;
    Object.entries(f.org).forEach(([k,arr])=>{const l=pm[k];arr.forEach(m=>{if(l){const cc=l>=2?RED:AMB;m.material.color.copy(cc);m.material.opacity=.55+.35*pulse;m.userData.h.material.color.copy(cc);m.userData.h.material.opacity=.12+.18*pulse}else{m.material.color.copy(CYAN);m.material.opacity=isS?.11:.05;m.userData.h.material.opacity=0}})});
    const rc=mx>=2?RED:mx===1?AMB:!L.on?GRY:CYAN;f.ring.material.color.copy(rc);f.disc.material.color.copy(rc);f.ring.material.opacity=isS?.95:.45;f.disc.material.opacity=isS?.18+.06*pulse:.06;f.ring.scale.setScalar(isS?1.12+.04*Math.sin(time*2):1);
    v.set(f.grp.position.x,-.02,f.grp.position.z).project(T3.cam);const lx=(v.x*.5+.5)*w,ly=(-v.y*.5+.5)*h;
    if(lx>-40&&lx<w+40)labs.push({c,x:lx,y:Math.min(ly+6,h-46),isS,lvl:mx,L});
    if(isS){v.set(f.grp.position.x,1.86,f.grp.position.z).project(T3.cam);T3.selTop={c,x:(v.x*.5+.5)*w,y:Math.max(14,(-v.y*.5+.5)*h)}}
    if(isS)AL.list.filter(a=>(a.id===c.id||(a.id==='nave'&&a.type==='tormenta'))&&aPart(a)).forEach((a,i)=>{const k=aPart(a),o=(f.org[k]&&f.org[k][0])||null,p=o?o.position.clone():new THREE.Vector3(0,1.1,0);f.grp.localToWorld(p);p.project(T3.cam);tags.push({x:(p.x*.5+.5)*w,y:(-p.y*.5+.5)*h,a,i})})});
  T3.R.render(T3.scene,T3.cam);
  $('#l3').innerHTML=(T3.selTop?`<div class="tsel" style="left:${T3.selTop.x}px;top:${T3.selTop.y}px;--pc:${T3.selTop.c.col}"><b>${esc(T3.selTop.c.n)}</b><span>seleccionado</span><i></i></div>`:'')+labs.map(o=>`<div class="tlab ${o.isS?'sel':''}" data-id="${o.c.id}" style="left:${o.x}px;top:${o.y}px"><b>${esc(o.c.n)}</b><span style="${o.lvl>=2?'background:rgba(255,84,104,.18);color:#FF8A98':o.lvl?'background:rgba(245,184,65,.16);color:#F5B841':!o.L.on?'background:var(--s3);color:var(--muted)':'background:rgba(95,211,243,.12);color:#5FD3F3'}">${o.lvl>=2?'Alerta':o.lvl?'Advertencia':!o.L.on?'Sin sensor':Math.round(o.L.v.hr)+' lpm'}</span></div>`).join('')+
   tags.map(o=>{const side=o.x<w/2?-1:1;return `<span class="ltag" style="left:${clamp(o.x+side*(narrow?60:110),110,w-110)}px;top:${clamp(o.y-6+o.i*28,24,h-40)}px;color:${o.a.lvl>=2?'#FF8A98':'#F5B841'};border-color:${o.a.lvl>=2?'rgba(255,84,104,.6)':'rgba(245,184,65,.5)'}">${esc(aName(o.a))}</span>`}).join('');
  $$('#l3 .tlab').forEach(el=>el.onclick=()=>{if(S.sel!==el.dataset.id){S.sel=el.dataset.id;save();renderBio()}})}
function renderBio(){const c=cur(),z=mzAt(DAY);t3Build();
  $('#bioV').innerHTML=offBox(c)+`<div class="vgrid5">${VORDER.map(k=>vtile(c,k)).join('')}</div>`;bindRecon($('#v-panel'));
  $('#bioG').textContent=`${z.n} · ${z.g.toFixed(2)} g`;renderBioTexts();updateVitals()}
function renderBioTexts(){const c=cur(),act=AL.list.filter(a=>a.id===c.id),s=estadoDe(c);$('#bioCap').textContent=`${c.r} · seleccionada`.replace('seleccionada',c.sex==='f'?'seleccionada':'seleccionado');$('#bioName').textContent=c.n;
  const st=$('#bioSt');if(act.length){const l=Math.max(...act.map(a=>a.lvl));st.className='st '+(l>=2?'bad':'warn');st.textContent=`${act.length} ${act.length>1?'avisos':'aviso'}: ${act.map(aName).join(', ')}`}else{st.className='st '+s.l;st.textContent=s.t}}

/* bucle visual compartido (ECG + 3D) */
let vizOn=false,vizLast=0;function vizKick(){if(!vizOn){vizOn=true;vizLast=0;requestAnimationFrame(viz)}}
function viz(ts){if(!['panel','tripulacion','alertas'].includes(CUR)){vizOn=false;return}const dt=vizLast?Math.min(.1,(ts-vizLast)/1000):.016;vizLast=ts;drawECGs(dt);if(CUR==='panel'){try{t3Frame(ts/1000,dt)}catch(e){console.error(e)}}if(CUR==='tripulacion'){try{t3SoloFrame(ts/1000,dt)}catch(e){console.error(e)}}requestAnimationFrame(viz)}


/* ===== modelo 3D de una sola persona (sección Tripulación) ===== */
const T3S={yaw:0,drag:false,idle:0};
function t3SoloBuild(){const host=$('#solo3d');if(!host||T3S.R||T3S.fb)return;
  try{if(!HAS3||!window.BODY_MESH)throw 0;T3S.R=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){T3S.fb=true;host.innerHTML='<svg id="solo2d" viewBox="0 0 360 440" style="width:100%;height:100%"></svg>';return}
  const R=T3S.R,W=host.clientWidth||420,H=host.clientHeight||420;R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.setSize(W,H);host.appendChild(R.domElement);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(22,W/H,.1,30),geo=bodyGeo(),sph=new THREE.SphereGeometry(1,22,16);
  cam.position.set(0,1.0,5.2);cam.lookAt(0,.9,0);
  for(let r=.3;r<1.4;r+=.35){const g=new THREE.Mesh(new THREE.RingGeometry(r,r+.004,96),new THREE.MeshBasicMaterial({color:0x5FD3F3,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}));g.rotation.x=-Math.PI/2;scene.add(g)}
  const grp=new THREE.Group();scene.add(grp);
  const mat=new THREE.ShaderMaterial({uniforms:{uCol:{value:CYAN.clone()},uT:{value:0},uA:{value:1},uP:{value:0}},vertexShader:HV,fragmentShader:HF,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  grp.add(new THREE.Mesh(geo,mat));
  const org={};Object.entries(ORGS).forEach(([k,arr])=>{org[k]=arr.map(o=>{const m=new THREE.Mesh(sph,new THREE.MeshBasicMaterial({color:0x5FD3F3,transparent:true,opacity:.1,blending:THREE.AdditiveBlending,depthWrite:false}));m.position.set(o[0],o[1],o[2]);m.scale.set(o[3],o[4],o[5]);grp.add(m);
    const h=new THREE.Mesh(sph,new THREE.MeshBasicMaterial({color:0xFF5468,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));h.position.copy(m.position);h.scale.set(o[3]*2,o[4]*1.6,o[5]*2);grp.add(h);m.userData.h=h;return m})});
  Object.assign(T3S,{scene,cam,grp,mat,org,host});
  const el=R.domElement;let down=null;
  el.addEventListener('pointerdown',e=>{down={x:e.clientX,yaw:T3S.yaw};T3S.idle=0;el.setPointerCapture(e.pointerId)});
  el.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;if(Math.abs(dx)>3){T3S.drag=true;T3S.yaw=down.yaw+dx*.012}});
  el.addEventListener('pointerup',()=>{down=null;T3S.drag=false});
  new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){R.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()}}).observe(host)}
function t3SoloKick(){t3SoloBuild();const c=cur(),pm=partsFor(c.id),ks=Object.keys(pm);
  const NOM={heart:'corazón',lungs:'pulmones',brain:'cerebro',eyes:'ojos',ear:'oído',kidney:'riñones',spine:'columna',legs:'piernas',bones:'huesos',body:'cuerpo'};
  $('#soloCap').textContent=`${c.n} · arrastra para girar`;
  $('#soloLeg').innerHTML=ks.length?ks.map(k=>`<span><i style="background:${pm[k]>=2?'#FF5468':'#F5B841'}"></i>${NOM[k]||k}</span>`).join(''):'<span><i style="background:#5FD3F3"></i>Sin zonas con aviso</span>';vizKick()}
function t3SoloFrame(time,dt){if(T3S.fb){const k=S.sel+AL.list.length;if(T3S.fbk!==k){T3S.fbk=k;drawBody(cur(),$('#solo2d'))}return}if(!T3S.R)return;
  const c=cur(),L=LV[c.id],pm=partsFor(c.id),mx=Object.values(pm).length?Math.max(...Object.values(pm)):0,pulse=.5+.5*Math.sin(time*(L.on?L.v.hr/60:1)*Math.PI*2);
  const col=!L.on&&!mx?GRY:mx>=2?RED:mx===1?AMB:CYAN;T3S.mat.uniforms.uCol.value.lerp(col,1-Math.exp(-dt*4));T3S.mat.uniforms.uT.value=time;T3S.mat.uniforms.uP.value=mx>=2?pulse*.6:0;
  T3S.idle+=dt;if(!T3S.drag&&T3S.idle>2)T3S.yaw+=dt*.3;T3S.grp.rotation.y=T3S.yaw;T3S.grp.position.y=Math.sin(time*1.1)*.006;
  Object.entries(T3S.org).forEach(([k,arr])=>{const l=pm[k];arr.forEach(m=>{if(l){const cc=l>=2?RED:AMB;m.material.color.copy(cc);m.material.opacity=.55+.35*pulse;m.userData.h.material.color.copy(cc);m.userData.h.material.opacity=.12+.18*pulse}else{m.material.color.copy(CYAN);m.material.opacity=.12;m.userData.h.material.opacity=0}})});
  T3S.R.render(T3S.scene,T3S.cam)}
