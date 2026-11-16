// Círculos de los 6 sistemas del cuerpo (los calcula el motor en Python):
// inmunológico, cardiovascular, neuro-ocular, cognitivo-conductual, radiación y musculoesquelético.
import Anillo from './Anillo.jsx';

const NIVEL = ['Bien', 'Atención', 'Alerta'];
const COLOR_NIVEL = ['var(--good)', 'var(--warn)', 'var(--bad)'];

/** Un círculo por sistema. `sis`: { inmunologico: {n, col, valor, nivel, motivos}, ... } */
export function CirculosSistemas({ N, sis, tam = 92, detalle = true }) {
  if (!sis) return <p className="muted small">Calculando el estado de los sistemas…</p>;
  return (
    <div className="sisgrid" style={{ '--sis-tam': tam + 'px' }}>
      {N.SIS_ORDEN.map(k => {
        const s = sis[k];
        return (
          <div className="sis" key={k} title={s.motivos.length ? s.motivos.join(' · ') : 'Sin hallazgos'}>
            <Anillo tam={tam} grosor={Math.max(7, tam / 11)} items={[{ pct: s.valor, col: s.nivel === 2 ? '#FF5468' : s.col }]}>
              <div className="rv" style={{ fontSize: tam / 3.6 }}>{s.valor}</div>
            </Anillo>
            <b>{s.n}</b>
            {detalle && <span style={{ color: COLOR_NIVEL[s.nivel] }}>{NIVEL[s.nivel]}{s.motivos.length ? ' · ' + s.motivos[0] : ''}</span>}
          </div>
        );
      })}
    </div>
  );
}

/** Promedio de toda la tripulación por sistema. */
export function promedioTripulacion(N) {
  const conDatos = N.CREW.filter(c => N.SIS[c.id]);
  if (!conDatos.length) return null;
  const out = {};
  N.SIS_ORDEN.forEach(k => {
    const base = N.SIS[conDatos[0].id][k];
    const valor = Math.round(N.mean(conDatos.map(c => N.SIS[c.id][k].valor)));
    const motivos = conDatos.filter(c => N.SIS[c.id][k].nivel).map(c => c.n);
    out[k] = { ...base, valor, nivel: valor >= 80 ? 0 : valor >= 60 ? 1 : 2, motivos };
  });
  return out;
}

/** Barras compactas (tarjetas de la tripulación). */
export function BarrasSistemas({ N, sis }) {
  if (!sis) return null;
  return (
    <div className="sisbar">
      {N.SIS_ORDEN.map(k => {
        const s = sis[k];
        return (
          <div key={k}>
            <span>{s.n}</span>
            <i><em style={{ width: s.valor + '%', background: s.nivel === 2 ? '#FF5468' : s.nivel === 1 ? '#F5B841' : s.col }} /></i>
            <b>{s.valor}</b>
          </div>
        );
      })}
    </div>
  );
}
