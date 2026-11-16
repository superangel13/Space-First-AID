'use strict';
/* ================= REGISTRO INICIAL DE LA MISIÓN =================
   Primero los datos generales (nombre, destino, duración, inicio, cuántos
   tripulantes). Al continuar se despliega una tarjeta por tripulante con su
   rol, datos y antecedentes médicos. Todo se guarda en SQLite vía Python. */
const ANTECEDENTES=[['rinon','Cálculos renales'],['presion','Hipertensión'],['coagulo','Trombosis previa'],['arritmia','Arritmia tratada'],['ojo','Cambios oculares previos'],['cadera','Prótesis de cadera'],['columna','Hernia de disco'],['apnea','Apnea leve']];
const ROLES=['Comandante','Piloto','Oficial médica / médico','Ingeniera / ingeniero de sistemas','Especialista de misión','Especialista en caminatas espaciales'];
const COLS_REG=['#5B9DFF','#34E39A','#F5B841','#FF6B7D','#A28CFF','#5FD3F3'];
function _e(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function mostrarRegistro(destinos){
  const R={nombre:'',destino:destinos[0].id,duracion:destinos[0].duracion_defecto,inicio:new Date().toISOString().slice(0,10),n:4,trip:[],paso:1};
  const host=document.createElement('div');host.id='registro';host.className='reg';document.body.appendChild(host);
  const D=id=>destinos.find(d=>d.id===id);
  const tr=i=>R.trip[i]||(R.trip[i]={nombre:'',rol:ROLES[i%ROLES.length],sexo:'',edad:'',condicion:'media',antecedentes:[],notas:''});
  function pintar(){
    const d=D(R.destino);
    host.innerHTML=`<div class="reg-in">
      <div class="reg-top"><svg width="38" height="38" viewBox="0 0 200 200" fill="none" aria-hidden="true"><circle cx="100" cy="100" r="70" stroke="#F2F5F8" stroke-width="15" stroke-dasharray="360 80" stroke-linecap="round"/><path d="M22 112H70l10-8 10 8h8l6 10 20-92 10 102 8-20h36" stroke="#34E39A" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg><b>SPACE FIRST <span>AID</span></b></div>
      <span class="cap">Antes de despegar</span>
      <h1>Registro de la misión</h1>
      <p class="muted">Registra el destino, la duración y a cada tripulante con sus antecedentes médicos. De este registro dependen las vigilancias, los umbrales y la trayectoria.</p>
      <div class="reg-demo card pad"><div><b>¿Solo quieres verla funcionar?</b><p class="muted small">Carga una misión ficticia: Luna ida y vuelta, 180 días, con Grover, Payán, Valentina y Camilia.</p></div><button class="btn go" id="rDemo" type="button">Ver misión demo</button></div>

      <section class="card pad reg-sec"><div class="rowb"><h2>1 · Datos de la misión</h2><span class="cap">Paso ${R.paso===1?'1 de 2':'listo'}</span></div>
        <label class="fl">Nombre de la misión<input id="rNom" maxlength="60" placeholder="Ej. Artemis Space Apps" value="${_e(R.nombre)}"></label>
        <div class="fl"><span>Destino</span><div class="reg-dest">${destinos.map(x=>`<button type="button" class="dopt" data-d="${x.id}" aria-pressed="${x.id===R.destino}"><b>${_e(x.nombre)}</b><span>${_e(x.descripcion)}</span></button>`).join('')}</div></div>
        <div class="reg-row">
          <div class="fl"><span>Duración</span><div class="seg" id="rDur">${d.duraciones.map(v=>`<button type="button" data-v="${v}" aria-pressed="${+R.duracion===v}">${v} días</button>`).join('')}</div>
            <input id="rDurN" type="number" min="1" max="1000" value="${R.duracion}" aria-label="Duración en días"></div>
          <label class="fl">Fecha de inicio (día 1)<input id="rIni" type="date" value="${R.inicio}"></label>
          <div class="fl"><span>Tripulantes</span><div class="stepper"><button type="button" id="rMenos" aria-label="Uno menos">−</button><b id="rN">${R.n}</b><button type="button" id="rMas" aria-label="Uno más">+</button></div></div>
        </div>
        ${R.paso===1?'<button class="btn go" id="rSig" type="button">Continuar: registrar a la tripulación</button>':''}
      </section>

      ${R.paso>=2?`<section class="reg-sec"><div class="rowb"><h2>2 · Tripulación</h2><span class="cap">${R.n} ${R.n===1?'persona':'personas'}</span></div>
        <div class="reg-crew">${Array.from({length:R.n},(_,i)=>{const t=tr(i);return `<div class="card pad rc" style="--pc:${COLS_REG[i]}" data-i="${i}">
          <div class="rowb"><span class="av" style="color:${COLS_REG[i]}">${_e((t.nombre||'?')[0])}</span><span class="cap">Tripulante ${i+1}</span></div>
          <label class="fl">Nombre<input data-k="nombre" maxlength="30" value="${_e(t.nombre)}" placeholder="Nombre"></label>
          <label class="fl">Rol<select data-k="rol">${ROLES.map(r=>`<option ${r===t.rol?'selected':''}>${_e(r)}</option>`).join('')}</select></label>
          <div class="reg-row3">
            <label class="fl">Sexo<select data-k="sexo"><option value="">—</option><option value="f" ${t.sexo==='f'?'selected':''}>Mujer</option><option value="m" ${t.sexo==='m'?'selected':''}>Hombre</option></select></label>
            <label class="fl">Edad<input data-k="edad" type="number" min="18" max="80" value="${_e(t.edad)}"></label>
            <label class="fl">Condición física<select data-k="condicion">${[['alta','Alta'],['media','Media'],['baja','Baja']].map(([v,n])=>`<option value="${v}" ${t.condicion===v?'selected':''}>${n}</option>`).join('')}</select></label>
          </div>
          <div class="fl"><span>Antecedentes médicos</span><div class="hxs">${ANTECEDENTES.map(([k,n])=>`<label class="hx"><input type="checkbox" data-hx="${k}" ${t.antecedentes.includes(k)?'checked':''}><span>${n}</span></label>`).join('')}</div></div>
          <label class="fl">Otros antecedentes o alergias<input data-k="notas" maxlength="140" value="${_e(t.notas)}" placeholder="Opcional"></label>
        </div>`}).join('')}</div>
        <p class="note">Los antecedentes activan vigilancias según lo que NASA aprueba con seguimiento (por ejemplo, cálculos renales: hidratación y prueba de orina periódica).</p>
        <div class="reg-fin"><span class="reg-err" id="rErr" role="alert"></span><button class="btn go" id="rIr" type="button">Iniciar misión</button></div>
      </section>`:''}
    </div>`;
    const $r=s=>host.querySelector(s),$$r=s=>[...host.querySelectorAll(s)];
    $r('#rNom').oninput=e=>R.nombre=e.target.value;
    $$r('.dopt').forEach(b=>b.onclick=()=>{R.destino=b.dataset.d;R.duracion=D(R.destino).duracion_defecto;pintar()});
    $$r('#rDur button').forEach(b=>b.onclick=()=>{R.duracion=+b.dataset.v;pintar()});
    $r('#rDurN').oninput=e=>{R.duracion=+e.target.value;$$r('#rDur button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.v===R.duracion))};
    $r('#rIni').onchange=e=>R.inicio=e.target.value;
    $r('#rMenos').onclick=()=>{R.n=Math.max(1,R.n-1);pintar()};$r('#rMas').onclick=()=>{R.n=Math.min(6,R.n+1);pintar()};
    if($r('#rSig'))$r('#rSig').onclick=()=>{R.paso=2;pintar();setTimeout(()=>$r('.reg-crew').scrollIntoView({behavior:'smooth',block:'start'}),50)};
    $$r('.rc').forEach(card=>{const t=tr(+card.dataset.i);
      card.querySelectorAll('[data-k]').forEach(inp=>inp.oninput=inp.onchange=()=>{t[inp.dataset.k]=inp.value;if(inp.dataset.k==='nombre')card.querySelector('.av').textContent=(inp.value||'?')[0]});
      card.querySelectorAll('[data-hx]').forEach(cb=>cb.onchange=()=>{t.antecedentes=cb.checked?[...t.antecedentes,cb.dataset.hx]:t.antecedentes.filter(x=>x!==cb.dataset.hx)})});
    $r('#rDemo').onclick=async()=>{$r('#rDemo').disabled=true;try{await API.post('mision/demo');location.reload()}catch(e){alert(e.message);$r('#rDemo').disabled=false}};
    if($r('#rIr'))$r('#rIr').onclick=async()=>{
      const err=$r('#rErr');err.textContent='';
      const trip=R.trip.slice(0,R.n).map((t,i)=>({...t,nombre:t.nombre.trim(),edad:t.edad?+t.edad:null,color:COLS_REG[i]}));
      if(!R.nombre.trim())return err.textContent='Escribe el nombre de la misión.';
      const falta=trip.findIndex(t=>!t.nombre);if(falta>=0)return err.textContent=`Falta el nombre del tripulante ${falta+1}.`;
      if(!(R.duracion>=1))return err.textContent='La duración debe ser de al menos 1 día.';
      $r('#rIr').disabled=true;
      try{await API.post('mision',{nombre:R.nombre.trim(),destino:R.destino,duracion:R.duracion,fecha_inicio:R.inicio,tripulantes:trip});location.reload()}
      catch(e){err.textContent=e.message;$r('#rIr').disabled=false}};
  }
  pintar();
}
