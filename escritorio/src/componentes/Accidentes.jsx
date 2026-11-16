// Protocolo y simulación de accidentes, con los Human System Risks de NASA
// (https://www.nasa.gov/hhp/human-system-risks/). Sigue el mismo sistema de las emergencias:
// se elige el accidente, se alteran los signos vitales del tripulante y se abre la ventana
// con el protocolo del accidente.
import { useState } from 'react';
import { useLatido } from '../bus.js';

export default function Accidentes({ N }) {
  useLatido();
  const A = window.ACC;
  const [aid, setAid] = useState(A ? A.accidentes[0].id : '');
  if (!N || !A) return null;
  const c = N.cur(), acc = A.accidentes.find(x => x.id === aid);
  const activo = N.S.acc && N.S.acc[c.id];
  return (
    <div className="card pad sim" style={{ display: 'grid', gap: 14 }}>
      <div className="rowb">
        <div><span className="cap">Riesgos humanos del vuelo espacial · NASA</span><h2 style={{ fontSize: 22, marginTop: 4 }}>Protocolo y simulación de accidentes</h2></div>
        <a className="btn ghost sm" href={A.fuente} target="_blank" rel="noopener">Fuente: NASA Human System Risks</a>
      </div>
      <p className="muted small">Elige un accidente: los signos vitales de {c.n} cambian y se abre la ventana con el protocolo del accidente, igual que en las emergencias.</p>
      <div className="simgrid">
        <label className="fl">Accidente
          <select value={aid} onChange={e => setAid(e.target.value)}>{A.accidentes.map(x => <option key={x.id} value={x.id}>{x.n}</option>)}</select>
        </label>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn go" type="button" onClick={() => N.simularAccidente(c, acc)}>Simular en {c.n}</button>
          {activo && <button className="btn ghost sm" type="button" onClick={() => N.quitarAccidente(c)}>Quitar accidente</button>}
        </div>
      </div>
      <div className="accprev">
        <b>{acc.n}</b>
        <p className="small">{acc.que_es}</p>
        <span className="cap">Protocolo</span>
        <ol className="small">{acc.protocolo.map((p, i) => <li key={i}>{p}</li>)}</ol>
        <a className="small" href={acc.u} target="_blank" rel="noopener">{acc.riesgo} (NASA)</a>
      </div>
      <details>
        <summary className="small" style={{ cursor: 'pointer', fontWeight: 800 }}>Ver todos los protocolos de accidentes ({A.accidentes.length})</summary>
        <div className="acclist">
          {A.accidentes.map(x => (
            <div key={x.id} className="accprev">
              <b>{x.n}</b><p className="small muted">{x.que_es}</p>
              <ol className="small">{x.protocolo.map((p, i) => <li key={i}>{p}</li>)}</ol>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
