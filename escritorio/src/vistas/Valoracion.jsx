// Sección Valoración: registro de síntomas tocando el cuerpo (sin escribir) y muestras de laboratorio.
// Lo capturado se manda al motor clínico en Python, que lo cruza con signos, pruebas y muestras.
import { useEffect, useReducer, useRef, useState } from 'react';
import { useLatido } from '../bus.js';
import { ResumenAvisos } from '../componentes/Avisos.jsx';
import Muestras from '../componentes/Muestras.jsx';

// Zonas que se pueden tocar en la silueta, de frente y de espalda.
const ZONAS = {
  f: [['head', 'ellipse', 100, 34, 24, 28], ['eyes', 'rect', 80, 30, 40, 10], ['throat', 'rect', 88, 62, 24, 20], ['chest', 'rect', 66, 84, 68, 62], ['abd', 'rect', 70, 148, 60, 52], ['pelvis', 'rect', 72, 202, 56, 34], ['arms', 'arms'], ['legs', 'legs']],
  b: [['headb', 'rect', 82, 40, 36, 40], ['upback', 'rect', 66, 84, 68, 60], ['lowback', 'rect', 72, 146, 56, 46], ['flank', 'flank'], ['legsb', 'legs']],
};
const SILUETA = 'M100 8c14 0 24 11 24 26 0 12-6 21-14 25v8c18 2 34 8 38 22l10 70c2 12 4 30 6 44 1 8-8 10-10 2l-10-60-4 4 2 46c0 8-2 14-4 22l-6 150c0 10-14 10-14 0l-6-130h-4l-6 130c0 10-14 10-14 0l-6-150c-2-8-4-14-4-22l2-46-4-4-10 60c-2 8-11 6-10-2 2-14 4-32 6-44l10-70c4-14 20-20 38-22v-8c-8-4-14-13-14-25 0-15 10-26 24-26z';
const colorNivel = v => (v >= 7 ? 'var(--bad)' : v >= 4 ? 'var(--warn)' : 'var(--good)');

function Zona({ z, clase, elegir }) {
  const [id, tipo, ...a] = z;
  const p = { className: clase, onClick: () => elegir(id) };
  if (tipo === 'ellipse') return <ellipse {...p} cx={a[0]} cy={a[1]} rx={a[2]} ry={a[3]} />;
  if (tipo === 'rect') return <rect {...p} x={a[0]} y={a[1]} width={a[2]} height={a[3]} rx="12" />;
  if (tipo === 'arms') return <g {...p}><path d="M60 92l-14 66-8 76 14 2 12-76 10-50z" /><path d="M140 92l14 66 8 76-14 2-12-76-10-50z" /></g>;
  if (tipo === 'legs') return <g {...p}><rect x="70" y="240" width="28" height="170" rx="12" /><rect x="102" y="240" width="28" height="170" rx="12" /></g>;
  return <g {...p}><ellipse cx="66" cy="168" rx="12" ry="20" /><ellipse cx="134" cy="168" rx="12" ry="20" /></g>;
}

function Opciones({ opciones, valor, elegir }) {
  return (
    <div className="mini-seg">
      {opciones.map(([k, texto]) => <button type="button" key={String(k)} aria-pressed={valor === k} onClick={() => elegir(k)}>{texto}</button>)}
    </div>
  );
}

function RegistroSintomas({ N }) {
  useLatido();
  const [, repintar] = useReducer(n => n + 1, 0);
  const [lado, setLado] = useState('f');
  const [zona, setZona] = useState(null);
  const espera = useRef(null);
  const { SX, SXZ, SXQ, NIV, ONS } = N;
  const c = N.cur(), estado = N.sxState(c), R = estado.cur;

  // Tras cada cambio: guardar y pedir al motor una vista previa (sin levantar alertas todavía).
  const cambio = () => {
    N.save(); repintar();
    clearTimeout(espera.current);
    espera.current = setTimeout(() => { N.evaluarServidor(c).then(() => N.render()).catch(() => {}); }, 250);
  };
  useEffect(() => () => clearTimeout(espera.current), []);

  const presente = id => R.items[id] && R.items[id].v > 0;
  const zonaActiva = z => (z === 'gen' ? SXZ.gen[1] : (SXZ.f[z] || SXZ.b[z] || [0, []])[1]).some(presente);
  const Z = zona === 'gen' ? SXZ.gen : zona ? (SXZ[lado][zona] || SXZ.f[zona] || SXZ.b[zona]) : null;
  const ids = Object.keys(R.items).filter(presente);
  const preguntas = Object.entries(SXQ).filter(([, q]) => q.if.some(presente));

  const alternar = id => {
    if (presente(id)) delete R.items[id];
    else R.items[id] = { v: 5, on: 'hoy', pat: SX[id].pain ? 'va' : null };
    N.snd(620, 0.05); cambio();
  };
  const guardar = async () => {
    const res = await N.syncClin(c, false, true);            // evalúa en Python y guarda el reporte en SQLite
    const principal = res.find(r => r.lvl), nivel = principal ? principal.lvl : 0;
    const texto = ids.length
      ? `${ids.length} síntoma${ids.length > 1 ? 's' : ''}: ${ids.map(id => SX[id].n.toLowerCase()).join(', ')}${principal ? ` → ${principal.k.n}` : ''}`
      : 'Sin síntomas';
    estado.hist.unshift({ t: Date.now(), txt: texto, lvl: nivel, items: JSON.parse(JSON.stringify(estado.cur)) });
    estado.hist.length = Math.min(estado.hist.length, 60);
    N.qpush({
      p: nivel >= 2 ? 1 : 2, c: `Registro de síntomas de ${c.n}${principal ? ` · ${principal.k.n}` : ''}`,
      data: { tipo: 'sintomas', tripulante: c.n, registro: estado.cur, evaluacion: res.filter(r => r.hit).map(r => ({ condicion: r.k.n, indicios: r.hit, nivel: r.lvl, senal_alarma: r.red })) },
    });
    N.save();
    N.toast(principal ? `${principal.lvl >= 2 ? 'Alerta' : 'Advertencia'}: ${principal.k.n}` : 'Registro guardado');
    N.render();
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
            <path d={SILUETA} fill="#121A24" stroke="#26344A" strokeWidth="1.5" />
            {ZONAS[lado].map(z => <Zona key={z[0]} z={z} elegir={setZona} clase={['rg', zonaActiva(z[0]) && 'on', zona === z[0] && 'sel'].filter(Boolean).join(' ')} />)}
            <text x="100" y="418" textAnchor="middle" fill="#5A6576" fontSize="11" fontFamily="Manrope" fontWeight="700">{lado === 'f' ? 'FRENTE' : 'ESPALDA'}</text>
          </svg>
          <button className="btn ghost sm" type="button" onClick={() => setZona('gen')}>Síntomas generales, sueño y ánimo</button>
        </div>

        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <div className="card pad" style={{ display: 'grid', gap: 12 }}>
            <div className="rowb"><h3>{Z ? Z[0] : 'Elige una zona del cuerpo'}</h3><span className="cap">Toca lo que sientes</span></div>
            <div className="sxc">
              {Z ? Z[1].map(id => <button type="button" key={id} aria-pressed={!!presente(id)} onClick={() => alternar(id)}>{SX[id].n}</button>)
                : <p className="muted small">Toca la zona donde sientes algo, o “Síntomas generales”.</p>}
            </div>
          </div>
          <div className="card pad" style={{ display: 'grid', gap: 10 }}>
            <div className="rowb"><h3>Tu registro</h3><span className="cap">{ids.length ? `${ids.length} síntoma${ids.length > 1 ? 's' : ''}` : 'Vacío'}</span></div>
            <div style={{ display: 'grid', gap: 8 }}>
              {ids.length ? ids.map(id => {
                const x = R.items[id];
                return (
                  <div className="sxi" key={id}>
                    <div className="rowb"><b>{SX[id].n}</b><button className="btn ghost sm" type="button" aria-label="Quitar" onClick={() => { delete R.items[id]; cambio(); }}>Quitar</button></div>
                    <div className="sl">
                      <span className="muted small">0</span>
                      <input type="range" min="1" max="10" value={x.v} aria-label="Intensidad" onChange={e => { x.v = +e.target.value; cambio(); }} />
                      <span className="muted small">10</span>
                      <span className="lv" style={{ color: colorNivel(x.v) }}>{x.v}/10 · {NIV(x.v)}</span>
                    </div>
                    {SX[id].pain && <Opciones opciones={[['va', 'Va y viene'], ['const', 'Constante']]} valor={x.pat} elegir={p => { x.pat = p; cambio(); }} />}
                    <Opciones opciones={Object.entries(ONS).map(([k, l]) => [k, l[0].toUpperCase() + l.slice(1)])} valor={x.on} elegir={o => { x.on = o; cambio(); }} />
                  </div>
                );
              }) : <p className="muted small">Aún no hay síntomas. Si todo está bien, no necesitas registrar nada.</p>}
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {preguntas.map(([k, q]) => (
                <div className="qcard" key={k}><span>{q.n}</span><Opciones opciones={[[true, 'Sí'], [false, 'No']]} valor={R.q[k]} elegir={v => { R.q[k] = v; cambio(); }} /></div>
              ))}
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
          <a className="btn ghost sm" href="#tripulacion" style={{ justifySelf: 'start' }}>Ver avisos completos</a>
        </div>
      </div>
      <Historial N={N} estado={estado} />
    </>
  );
}

function Historial({ N, estado }) {
  return (
    <div className="card pad" style={{ display: 'grid', gap: 10 }}>
      <h3>Historial de registros</h3>
      <div className="alog">
        {estado.hist.length ? estado.hist.slice(0, 20).map((h, i) => (
          <div key={i}><time>{N.hhmm(h.t)}</time><i style={{ background: ['#34E39A', '#F5B841', '#FF5468'][h.lvl] }} /><span>{h.txt}</span></div>
        )) : <p className="muted small">Sin registros todavía.</p>}
      </div>
    </div>
  );
}

export default function Valoracion({ oculto, N }) {
  return (
    <section className="page" id="v-valoracion" hidden={oculto}>
      <div className="ptitle">
        <div>
          <span className="cap">Síntomas y muestras · se procesa en Python</span>
          <h1>Valoración</h1>
          <p>Registra cómo te sientes tocando el cuerpo y captura los resultados de orina, sangre y saliva. Todo se cruza en el motor clínico de la nave.</p>
        </div>
        <div className="pick" data-pick="" />
      </div>
      {N && <RegistroSintomas N={N} />}
      <Muestras N={N} visible={!oculto} />
    </section>
  );
}
