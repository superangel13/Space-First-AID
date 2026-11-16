// Sección Tripulación: los círculos de salud de cada persona y el encabezado del detalle.
import { useLatido } from '../bus.js';
import Anillo, { Chispa, IconoAviso } from './Anillo.jsx';

const INDICES = [['Sueño', '#5B9DFF'], ['Atención', '#A28CFF'], ['Corazón', '#FF6B7D']];

function TarjetaTripulante({ N, c }) {
  const e = N.today(c), r = N.ready(c), s = N.estadoDe(c);
  const avisos = N.alerts(c).filter(a => a.l !== 'none');
  const valores = [N.SC.sleep(c, e), N.SC.mind(c, e), N.SC.heart(c, e)];
  const items = valores.map((pct, i) => ({ pct, col: INDICES[i][1] }));
  const elegir = () => {
    if (N.S.sel !== c.id) { N.S.sel = c.id; N.S.metric = 'ready'; N.save(); N.render(); }
    const h = document.getElementById('selHead');
    if (h) h.scrollIntoView({ behavior: N.RM ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <button className="cc" type="button" aria-pressed={c.id === N.S.sel} style={{ '--pc': c.col }} onClick={elegir}>
      <div className="cc-h">
        <span className="av" style={{ color: c.col }}>{c.n[0]}</span>
        <div className="cc-n"><b>{c.n}</b><span>{c.r}</span></div>
        <span className={'st ' + s.l}>{s.t}</span>
      </div>
      <div className="cc-m">
        <Anillo tam={124} items={items} grosor={10} hueco={3}>
          <div className="rv" style={{ fontSize: 30 }}>{r == null ? '—' : <>{r}<small>%</small></>}</div>
        </Anillo>
        <div className="cc-l">
          {INDICES.map(([nombre, col], i) => (
            <div key={nombre}><i style={{ background: col }} /><span>{nombre}</span><b>{valores[i] ?? '—'}</b></div>
          ))}
        </div>
      </div>
      {/* signos vitales en vivo: los actualiza el núcleo 4 veces por segundo */}
      <div className="cc-v" data-ccv={c.id} />
      <div className="cc-a">
        {avisos.length
          ? avisos.map((a, i) => <span key={i} className={'ch ' + a.l}><IconoAviso />{a.t}</span>)
          : r == null ? <span className="ch">Sensor desconectado</span> : <span className="ch g">Todo en su rango</span>}
      </div>
      <div className="cc-s"><Chispa N={N} c={c} /><span>7 días</span></div>
    </button>
  );
}

export function CirculosTripulacion({ N }) {
  useLatido();
  return (
    <div className="crewgrid" id="crewgrid">
      {N && N.CREW.map(c => <TarjetaTripulante key={c.id} N={N} c={c} />)}
    </div>
  );
}

export function EncabezadoDetalle({ N }) {
  useLatido();
  if (!N) return <div className="selhead" id="selHead" />;
  const c = N.cur(), s = N.estadoDe(c);
  return (
    <div className="selhead" id="selHead">
      <span className="cap">Detalle de</span><b style={{ color: c.col }}>{c.n}</b><span className={'st ' + s.l}>{s.t}</span>
    </div>
  );
}
