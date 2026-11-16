// Muestras de orina, sangre y saliva (sección Valoración).
// El tripulante captura el análisis previo hecho con el equipo de a bordo. La muestra se
// manda a la Tierra; cuando el laboratorio captura su resultado, regresa por el enlace y
// ese manda sobre el de a bordo. Los rangos están en datos/muestras.json.
import { useCallback, useEffect, useState } from 'react';
import { API } from '../api.js';
import { useLatido } from '../bus.js';

const ahoraLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
const COLOR_NIVEL = ['var(--good)', 'var(--warn)', 'var(--bad)'];

const porSexo = (v, sexo) => (v && typeof v === 'object' ? v[sexo === 'f' ? 'm' : 'h'] : v);
function textoRango(a, sexo) {
  if (a.basal) return 'se compara con tu basal';
  const lo = porSexo(a.min, sexo), hi = porSexo(a.max, sexo);
  return lo != null && hi != null ? `${lo}–${hi}` : hi != null ? `menos de ${hi}` : lo != null ? `más de ${lo}` : '';
}

function Campo({ a, valor, cambiar, P, sexo }) {
  if (a.tipo === 'cual') {
    const escala = P[a.escala] || P.escala_cualitativa;
    return (
      <label className="fl">{a.nombre}
        <select value={valor ?? ''} onChange={e => cambiar(e.target.value)}>
          <option value="">—</option>{escala.map(o => <option key={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  return (
    <label className="fl" title={a.espacio || ''}>{a.nombre}{a.unidad && <span className="muted"> ({a.unidad})</span>}
      <input type="number" step="any" inputMode="decimal" placeholder={textoRango(a, sexo)} value={valor ?? ''} onChange={e => cambiar(e.target.value)} />
    </label>
  );
}

function Vigente({ m, tipos }) {
  const res = m.resultado || {};
  const fuera = Object.values(res.analitos || {}).filter(x => x.nivel || x.fuera);
  return (
    <div className={'muv l' + m.nivel}>
      <div className="rowb">
        <div><b>{m.codigo}</b> · {tipos[m.tipo].nombre}</div>
        <span className={'org ' + m.origen}>{m.origen === 'tierra' ? 'Laboratorio en Tierra · vigente' : 'Análisis a bordo · previo'}</span>
      </div>
      <p className="small">{res.resumen}</p>
      {fuera.length > 0 && (
        <ul className="small">{fuera.map((x, i) => <li key={i}><b>{x.nombre}</b>: {String(x.valor)} {x.unidad} · {x.texto}</li>)}</ul>
      )}
      <span className="muted small">{new Date(m.tomada).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span>
    </div>
  );
}

export default function Muestras({ N, visible }) {
  useLatido();
  const P = window.PMU;
  const [tipo, setTipo] = useState('orina');
  const [valores, setValores] = useState({});
  const [tomada, setTomada] = useState(ahoraLocal);
  const [mensaje, setMensaje] = useState(null);         // { texto, color }
  const [vigentes, setVigentes] = useState([]);
  const persona = N ? N.S.sel : null;

  const cargar = useCallback(async () => {
    if (!persona) return;
    try { setVigentes((await API.get('muestras/' + persona)).vigentes); } catch (e) { /* sin conexión con el motor */ }
  }, [persona]);
  // Se recargan al cambiar de persona y cada 6 s mientras la sección está abierta (por si llega el resultado de la Tierra).
  useEffect(() => {
    if (!visible) return undefined;
    cargar();
    const t = setInterval(cargar, 6000);
    return () => clearInterval(t);
  }, [visible, cargar]);

  if (!N || !P) return null;
  const T = P.tipos[tipo];

  const ejemplo = alterado => {
    const sexo = N.cur().sex, v = {};
    T.analitos.forEach((a, i) => {
      if (a.tipo === 'cual') { v[a.id] = alterado && i % 2 === 0 ? (P[a.escala] || P.escala_cualitativa)[1] : a.normal; return; }
      if (a.basal) return;
      let lo = porSexo(a.min, sexo), hi = porSexo(a.max, sexo);
      if (lo == null) lo = hi * 0.5;
      if (hi == null) hi = lo * 1.6;
      const dec = String(a.paso || 1).includes('.') ? String(a.paso).split('.')[1].length : 0;
      let x = lo + (hi - lo) * (0.35 + Math.random() * 0.3);
      if (a.meta_min != null) x = Math.max(x, a.meta_min + (a.meta_max ? (a.meta_max - a.meta_min) / 2 : 0.3));
      if (alterado && i % 2 === 0) x = a.min == null || (a.max != null && i % 4 === 0) ? hi * 1.3 : lo * 0.7;
      v[a.id] = x.toFixed(dec);
    });
    setValores(v);
  };

  const guardar = async e => {
    e.preventDefault();
    const limpio = {};
    T.analitos.forEach(a => { const x = valores[a.id]; if (x !== undefined && x !== '') limpio[a.id] = a.tipo === 'cual' ? x : +x; });
    if (!Object.keys(limpio).length) { setMensaje({ texto: 'Captura al menos un valor.', color: 'var(--warn)' }); return; }
    setMensaje({ texto: 'Guardando y analizando en Python…' });
    try {
      const c = N.cur();
      const r = await API.post('muestras', { tripulante: c.id, tipo, valores: limpio, tomada: new Date(tomada).toISOString() });
      setMensaje({ texto: `${r.codigo} · ${r.resumen} · en cola para la Tierra`, color: COLOR_NIVEL[r.nivel] });
      N.toast(`Muestra ${r.codigo} guardada`);
      setValores({});
      N.sondearEnlace();
      await cargar();
      N.syncClin(c);                                  // el motor clínico cruza el resultado
    } catch (err) { setMensaje({ texto: err.message, color: 'var(--bad)' }); }
  };

  return (
    <div className="card pad mu" id="muestras">
      <div className="rowb">
        <div><span className="cap">Laboratorio</span><h2 style={{ fontSize: 22, marginTop: 4 }}>Muestras de orina, sangre y saliva</h2></div>
        <div className="seg" role="group" aria-label="Tipo de muestra">
          {Object.entries(P.tipos).map(([k, t]) => (
            <button type="button" key={k} aria-pressed={k === tipo} onClick={() => { setTipo(k); setValores({}); setMensaje(null); }}>{t.nombre}</button>
          ))}
        </div>
      </div>
      <p className="muted small">Equipo a bordo: <b>{T.equipo_a_bordo}</b>. Rangos del documento de parámetros{N.cur().sex ? ` para ${N.cur().sex === 'f' ? 'mujer' : 'hombre'}` : ''}. {P.regla_origen}</p>
      <div className="mugrid">
        <form className="muform" autoComplete="off" onSubmit={guardar}>
          <div className="mufields">
            {T.analitos.map(a => <Campo key={a.id} a={a} P={P} sexo={N.cur().sex} valor={valores[a.id]} cambiar={x => setValores({ ...valores, [a.id]: x })} />)}
          </div>
          <label className="fl">Fecha y hora de la toma<input type="datetime-local" value={tomada} onChange={e => setTomada(e.target.value)} /></label>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="btn go" type="submit">Guardar análisis de a bordo y enviar a la Tierra</button>
            <button className="btn ghost sm" type="button" onClick={() => ejemplo(false)}>Ejemplo normal</button>
            <button className="btn ghost sm" type="button" onClick={() => ejemplo(true)}>Ejemplo alterado</button>
          </div>
          <p className="small" role="status">{mensaje && <b style={{ color: mensaje.color }}>{mensaje.texto}</b>}</p>
        </form>
        <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <h3>Resultados vigentes</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {vigentes.length
              ? vigentes.slice(0, 8).map(m => <Vigente key={m.id} m={m} tipos={P.tipos} />)
              : <p className="muted small">Sin muestras todavía para esta persona.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
