// Sección Valoración: lo que registra el tripulante y la simulación de emergencias.
//  - Signos y síntomas tocando el cuerpo (catálogo del documento de parámetros).
//  - Registro personal: carga de trabajo, estrés (PSS-10), ánimo y trabajo en equipo.
//  - Muestras de orina, sangre y saliva con los rangos del documento.
//  - Simulación de emergencias: se elige un problema y se alteran los datos del tripulante.
// Todo se manda al motor clínico en Python.
import { useEffect, useReducer, useRef, useState } from 'react';
import { API } from '../api.js';
import { useLatido } from '../bus.js';
import { ResumenAvisos } from '../componentes/Avisos.jsx';
import Dispositivos from '../componentes/Dispositivos.jsx';
import Accidentes from '../componentes/Accidentes.jsx';

// El cuerpo está dibujado con las zonas mismas: lo que se ve es exactamente lo que se toca.
const BRAZOS = (
  <><rect x="34" y="90" width="22" height="138" rx="11" transform="rotate(9 45 159)" /><rect x="144" y="90" width="22" height="138" rx="11" transform="rotate(-9 155 159)" /></>
);
const PIERNAS = <><rect x="70" y="234" width="28" height="172" rx="13" /><rect x="102" y="234" width="28" height="172" rx="13" /></>;
const ZONAS = {
  f: [
    ['piel', <g>{BRAZOS}</g>], ['piernas', <g>{PIERNAS}</g>],
    ['cabeza', <circle cx="100" cy="38" r="26" />], ['cara', <ellipse cx="100" cy="44" rx="15" ry="13" />],
    ['cuello', <rect x="90" y="64" width="20" height="18" rx="6" />], ['gen', <rect x="60" y="82" width="80" height="66" rx="20" />],
    ['abd', <rect x="64" y="148" width="72" height="50" rx="14" />], ['pelvis', <rect x="64" y="198" width="72" height="38" rx="14" />],
  ],
  b: [
    ['piel', <g>{BRAZOS}<rect x="60" y="82" width="80" height="66" rx="20" /></g>], ['piernas', <g>{PIERNAS}</g>],
    ['cabeza', <g><circle cx="100" cy="38" r="26" /><rect x="90" y="64" width="20" height="18" rx="6" /></g>],
    ['pelvis', <g><rect x="64" y="148" width="72" height="50" rx="14" /><rect x="64" y="198" width="72" height="38" rx="14" /></g>],
  ],
};
const colorNivel = v => (v >= 7 ? 'var(--bad)' : v >= 4 ? 'var(--warn)' : 'var(--good)');

function Zona({ id, forma, clase, elegir }) {
  return <g className={clase} onClick={() => elegir(id)}>{forma}</g>;
}

function Opciones({ opciones, valor, elegir }) {
  return (
    <div className="mini-seg">
      {opciones.map(([k, texto]) => <button type="button" key={String(k)} aria-pressed={valor === k} onClick={() => elegir(k)}>{texto}</button>)}
    </div>
  );
}

/* ---------- signos y síntomas ---------- */
function RegistroSintomas({ N }) {
  const [, repintar] = useReducer(n => n + 1, 0);
  const [lado, setLado] = useState('f');
  const [zona, setZona] = useState(null);
  const espera = useRef(null);
  const P = window.PROB, { SX, NIV, ONS } = N;
  const c = N.cur(), estado = N.sxState(c), R = estado.cur;

  const cambio = () => {
    N.save(); repintar();
    clearTimeout(espera.current);
    espera.current = setTimeout(() => { N.evaluarServidor(c).then(() => N.render()).catch(() => {}); }, 250);
  };
  useEffect(() => () => clearTimeout(espera.current), []);

  const presente = id => R.items[id] && R.items[id].v > 0;
  const deZona = z => P.sintomas.filter(x => x.zona === z);
  const zonaActiva = z => deZona(z).some(x => presente(x.id));
  const ids = Object.keys(R.items).filter(presente);
  const alternar = id => {
    if (presente(id)) delete R.items[id]; else R.items[id] = { v: 5, on: 'hoy', pat: SX[id].pain ? 'va' : null };
    N.snd(620, 0.05); cambio();
  };
  const guardar = async () => {
    const res = await N.syncClin(c, false, true);
    const principal = res.find(r => r.lvl), nivel = principal ? principal.lvl : 0;
    const texto = ids.length ? `${ids.length} registrado${ids.length > 1 ? 's' : ''}: ${ids.map(id => SX[id].n.toLowerCase()).join(', ')}${principal ? ` → ${principal.k.n}` : ''}` : 'Sin signos ni síntomas';
    estado.hist.unshift({ t: Date.now(), txt: texto, lvl: nivel });
    estado.hist.length = Math.min(estado.hist.length, 60);
    N.qpush({ p: nivel >= 2 ? 1 : 2, c: `Registro de signos y síntomas de ${c.n}${principal ? ` · ${principal.k.n}` : ''}`, data: { tipo: 'sintomas', tripulante: c.n, registro: estado.cur } });
    N.save(); N.toast(principal ? `${principal.lvl >= 2 ? 'Emergencia' : 'Alerta'}: ${principal.k.n}` : 'Registro guardado'); N.render();
  };
  const borrar = () => { estado.cur = { items: {}, q: {} }; N.save(); N.syncClin(c); N.toast('Registro borrado'); repintar(); };

  return (
    <>
      <div className="sgrid">
        <div className="card pad bm" style={{ display: 'grid', gap: 10 }}>
          <div className="rowb">
            <h3>Toca la zona</h3>
            <div className="seg">
              <button type="button" aria-pressed={lado === 'f'} onClick={() => { setLado('f'); setZona(null); }}>Frente</button>
              <button type="button" aria-pressed={lado === 'b'} onClick={() => { setLado('b'); setZona(null); }}>Espalda</button>
            </div>
          </div>
          <svg id="bmSvg" viewBox="0 0 200 420" aria-label="Mapa del cuerpo">
            {ZONAS[lado].map(([id, forma], i) => <Zona key={i} id={id} forma={forma} elegir={setZona} clase={['rg', zonaActiva(id) && 'on', zona === id && 'sel'].filter(Boolean).join(' ')} />)}
            <text x="100" y="418" textAnchor="middle" fill="#5A6576" fontSize="11" fontFamily="Manrope" fontWeight="700">{lado === 'f' ? 'FRENTE' : 'ESPALDA'}</text>
          </svg>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn ghost sm" type="button" onClick={() => setZona('gen')}>Generales y sueño</button>
            <button className="btn ghost sm" type="button" onClick={() => setZona('mente')}>Ánimo y conducta</button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div className="card pad" style={{ display: 'grid', gap: 12 }}>
            <div className="rowb"><h3>{zona ? P.zonas[zona] : 'Elige una zona del cuerpo'}</h3><span className="cap">Signos y síntomas</span></div>
            <div className="sxc">
              {zona ? deZona(zona).map(x => (
                <button type="button" key={x.id} aria-pressed={!!presente(x.id)} onClick={() => alternar(x.id)}>
                  {x.n}<small className="sxk">{x.clase === 'signo' ? 'signo' : 'síntoma'}</small>
                </button>
              )) : <p className="muted small">Toca la zona donde notas algo, o «Generales y sueño» / «Ánimo y conducta».</p>}
            </div>
          </div>
          <div className="card pad" style={{ display: 'grid', gap: 10 }}>
            <div className="rowb"><h3>Tu registro</h3><span className="cap">{ids.length ? `${ids.length} registrado${ids.length > 1 ? 's' : ''}` : 'Vacío'}</span></div>
            <div style={{ display: 'grid', gap: 8 }}>
              {ids.length ? ids.map(id => {
                const x = R.items[id];
                return (
                  <div className="sxi" key={id}>
                    <div className="rowb"><b>{SX[id].n}</b><button className="btn ghost sm" type="button" onClick={() => { delete R.items[id]; cambio(); }}>Quitar</button></div>
                    <div className="sl">
                      <span className="muted small">1</span>
                      <input type="range" min="1" max="10" value={x.v} aria-label="Intensidad" onChange={e => { x.v = +e.target.value; cambio(); }} />
                      <span className="muted small">10</span>
                      <span className="lv" style={{ color: colorNivel(x.v) }}>{x.v}/10 · {NIV(x.v)}</span>
                    </div>
                    <Opciones opciones={Object.entries(ONS).map(([k, l]) => [k, l[0].toUpperCase() + l.slice(1)])} valor={x.on} elegir={o => { x.on = o; cambio(); }} />
                  </div>
                );
              }) : <p className="muted small">Aún no hay nada registrado. Si todo está bien, no necesitas registrar nada.</p>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn go" type="button" onClick={guardar}>Guardar y evaluar</button>
              <button className="btn ghost sm" type="button" onClick={borrar}>Borrar todo</button>
            </div>
          </div>
        </div>

        <div className="card pad" style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
          <div className="rowb"><h3>Lo que el sistema ve</h3><span className="cap">Resumen</span></div>
          <ResumenAvisos N={N} />
          <a className="btn ghost sm" href={'#tripulacion/' + c.id} style={{ justifySelf: 'start' }}>Ver avisos completos</a>
        </div>
      </div>
      <div className="card pad" style={{ display: 'grid', gap: 10 }}>
        <h3>Historial de registros</h3>
        <div className="alog">
          {estado.hist.length ? estado.hist.slice(0, 20).map((h, i) => (
            <div key={i}><time>{N.hhmm(h.t)}</time><i style={{ background: ['#34E39A', '#F5B841', '#FF5468'][h.lvl] }} /><span>{h.txt}</span></div>
          )) : <p className="muted small">Sin registros todavía.</p>}
        </div>
      </div>
    </>
  );
}

/* ---------- registro personal ---------- */
export function RegistroPersonal({ N }) {
  const c = N.cur(), A = window.PROB.autoreporte, previo = N.AUTO[c.id] || {};
  const inicial = () => ({ carga: previo.carga ?? 50, pss: previo.pss ?? 10, animo: previo.animo ?? 7, equipo: previo.equipo ?? 7 });
  const [v, setV] = useState(inicial);
  const [msg, setMsg] = useState('');
  useEffect(() => { setV(inicial()); setMsg(''); }, [c.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  const nivelPss = x => (x <= 13 ? ['bajo', 'var(--good)'] : x <= 26 ? ['moderado', 'var(--warn)'] : ['alto', 'var(--bad)']);
  const aviso = k => {
    const x = v[k];
    if (k === 'carga') return x > 70 ? ['Si sube: ' + A.carga.sube, 'var(--warn)'] : x < 20 ? ['Si baja: ' + A.carga.baja, 'var(--warn)'] : null;
    if (k === 'pss') return x > 13 ? ['Si sube: ' + A.pss.sube, nivelPss(x)[1]] : null;
    return x <= 4 ? ['Si baja: ' + A[k].baja, 'var(--warn)'] : null;
  };
  const guardar = async () => {
    setMsg('Guardando y evaluando en Python…');
    try { await API.post('autoreporte', { tripulante: c.id, ...v }); await N.syncClin(c); setMsg('Guardado. El motor ya lo tomó en cuenta.'); N.toast('Registro personal guardado'); }
    catch (e) { setMsg(e.message); }
  };
  return (
    <div className="card pad" style={{ display: 'grid', gap: 14 }}>
      <div className="rowb"><div><span className="cap">Lo registra el tripulante</span><h2 style={{ fontSize: 22, marginTop: 4 }}>Registro personal</h2></div><span className="cap">Inmunológico · cognitivo-conductual</span></div>
      <div className="autogrid">
        {['carga', 'pss', 'animo', 'equipo'].map(k => {
          const m = A[k], av = aviso(k);
          return (
            <div className="auto" key={k}>
              <div className="rowb"><b>{m.n}</b><span className="num">{v[k]}<small> / {m.max}</small>{k === 'pss' && <em style={{ color: nivelPss(v.pss)[1] }}> · {nivelPss(v.pss)[0]}</em>}</span></div>
              <input type="range" min={m.min} max={m.max} step={m.paso} value={v[k]} aria-label={m.n} onChange={e => setV({ ...v, [k]: +e.target.value })} />
              <p className="small" style={{ color: av ? av[1] : 'var(--muted)' }}>{av ? av[0] : k === 'pss' ? '0–13 bajo · 14–26 moderado · 27–40 alto' : k === 'carga' ? 'NASA-TLX: 0 a 100, sin aumento sobre tu basal' : 'Estable respecto a tu basal'}</p>
            </div>
          );
        })}
      </div>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}><button className="btn go" type="button" onClick={guardar}>Guardar registro personal</button><span className="small muted">{msg}</span></div>
    </div>
  );
}

/* ---------- simulación de emergencias ---------- */
function Simulador({ N }) {
  const c = N.cur(), P = window.PROB.problemas;
  const [pid, setPid] = useState(P[0].id);
  const [modo, setModo] = useState('completo');
  const [ocupado, setOcupado] = useState(false);
  const sim = N.S.sim[c.id];
  const p = P.find(x => x.id === pid);
  const simular = async () => {
    setOcupado(true);
    try { await N.simularProblema(c, pid, modo); N.toast(`Simulación: ${p.n} en ${c.n}`); } catch (e) { N.toast('No se pudo simular: ' + e.message); }
    setOcupado(false);
  };
  const quitar = async () => { setOcupado(true); try { await N.quitarSimulacion(c); N.toast(`${c.n}: de regreso a la normalidad`); } finally { setOcupado(false); } };
  return (
    <div className="card pad sim" style={{ display: 'grid', gap: 14 }}>
      <div className="rowb"><div><span className="cap">Para practicar</span><h2 style={{ fontSize: 22, marginTop: 4 }}>Simulación de emergencias</h2></div><span className="tagx">Datos simulados</span></div>
      <p className="muted small">Elige un problema del documento de parámetros. Los datos de {c.n} se alteran (signos, síntomas, muestras, registro personal y pruebas) y el motor en Python los evalúa: con algunos signos y síntomas manda una alerta; con todos, abre la ventana de emergencia con el protocolo.</p>
      <div className="simgrid">
        <label className="fl">Problema
          <select value={pid} onChange={e => setPid(e.target.value)}>{P.map(x => <option key={x.id} value={x.id}>{x.n}</option>)}</select>
        </label>
        <div className="fl"><span>Cuántos indicadores</span>
          <div className="seg">
            <button type="button" aria-pressed={modo === 'parcial'} onClick={() => setModo('parcial')}>Algunos (alerta)</button>
            <button type="button" aria-pressed={modo === 'completo'} onClick={() => setModo('completo')}>Todos (emergencia)</button>
          </div>
        </div>
      </div>
      <div className="simind">
        <span className="cap">Se alterará</span>
        <ul className="small">{(modo === 'completo' ? p.indicadores : p.indicadores.slice(0, Math.max(2, Math.floor(p.indicadores.length / 2)))).map((x, i) => <li key={i}>{x.n}</li>)}</ul>
      </div>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button className="btn go" type="button" disabled={ocupado} onClick={simular}>Simular en {c.n}</button>
        <button className="btn ghost sm" type="button" disabled={ocupado} style={{ color: 'var(--rad)' }} onClick={() => N.shipScen('tormenta')}>{N.SHIP.tormenta ? 'Terminar tormenta solar' : 'Simular tormenta de radiación (refugio)'}</button>
        {sim && <button className="btn ghost sm" type="button" disabled={ocupado} onClick={quitar}>Quitar simulación de {c.n}</button>}
      </div>
      {sim && <p className="small" style={{ color: 'var(--warn)' }}>Simulación activa en {c.n}: {P.find(x => x.id === sim.problema).n} ({sim.modo === 'completo' ? 'todos los indicadores' : 'algunos indicadores'}).</p>}
    </div>
  );
}

export default function Valoracion({ oculto, N }) {
  useLatido();
  return (
    <section className="page" id="v-valoracion" hidden={oculto}>
      <div className="ptitle">
        <div>
          <span className="cap">Signos, síntomas, registro personal y muestras · se procesa en Python</span>
          <h1>Valoración</h1>
          <p>Registra lo que notas tocando el cuerpo y tu registro personal; los signos vitales, el sueño y las muestras llegan solos de los dispositivos. Todo se cruza con el documento de parámetros en el motor clínico de la nave.</p>
        </div>
      </div>
      {N && <RegistroSintomas N={N} />}
      {N && <RegistroPersonal N={N} />}
      <Dispositivos N={N} visible={!oculto} />
      {N && <Simulador N={N} />}
      {N && <Accidentes N={N} />}
    </section>
  );
}
