// Alertas que se ven en cualquier sección: la barra superior con la más importante
// y la ventana grande que sale con cada alerta crítica hasta que alguien la atiende.
import { useCallback, useEffect, useState } from 'react';
import { SFA, useEvento, useLatido } from '../bus.js';

export function BarraAlerta({ N, ruta }) {
  useLatido();
  const activas = N ? N.AL.list : [];
  const principal = activas.find(a => a.lvl >= 2) || activas[0];
  if (!principal || ruta === 'alertas') return <div className="abar" id="abar" hidden role="alert" />;
  return (
    <div className={'abar' + (principal.lvl < 2 ? ' w' : '')} id="abar" role="alert" onClick={() => { window.location.hash = 'alertas'; }}>
      <div className="wrap">
        <span className="pul" />
        <b>{principal.lvl >= 2 ? 'ALERTA' : 'AVISO'} · {N.who(principal.id)}</b>
        <span className="at">{N.aName(principal)}{principal.val ? ' · ' + principal.val : ''}{activas.length > 1 ? ` · y ${activas.length - 1} más` : ''}</span>
        <span className="btn sm" style={{ background: '#fff', color: '#05070A' }}>Ver</span>
      </div>
    </div>
  );
}

export function AlertaGrande({ N }) {
  const [a, setA] = useState(null);
  useEvento('alerta-grande', useCallback(nueva => setA(previa => (previa && previa.key === nueva.key ? previa : nueva)), []));
  // Mientras esté abierta, la sirena suena y gira cada 4.5 s.
  useEffect(() => {
    if (!a || !N) return undefined;
    const sonar = () => { N.siren(2); N.buzz([200, 100, 200]); SFA.emit('sirena', 2); };
    sonar();
    const t = setInterval(sonar, 4500);
    return () => clearInterval(t);
  }, [a, N]);

  if (!a || !N) return <div className="bigal" id="bigal" hidden role="alertdialog" aria-modal="true" />;
  const c = N.CREW.find(x => x.id === a.id), r = a.res;
  const cerrar = () => { a.seen = true; setA(null); N.render(); };
  return (
    <div className="bigal" id="bigal" role="alertdialog" aria-modal="true" aria-labelledby="bigT">
      <div className="bx">
        <div className="hd2">
          <span className="ico">!</span>
          <div><span className="cap" style={{ color: '#FF9AA6' }}>Alerta crítica · {N.who(a.id)}{c ? ' · ' + c.r : ''}</span><h2 id="bigT">{N.aName(a)}</h2></div>
        </div>
        {r ? (
          <>
            <p style={{ fontSize: 17, fontWeight: 800 }}>{r.presentas}</p>
            {r.red.length > 0 && <p style={{ color: '#FF9AA6', fontWeight: 800 }}>Señal de alarma: {r.red.join(' · ')}</p>}
            <div className="why2">
              <span className="cap">De dónde viene</span>
              {r.cr.filter(x => x.w).map((x, i) => <div key={i}><span style={{ color: 'var(--bad)' }}>●</span><span><b>{x.n}</b> · {x.w}</span></div>)}
            </div>
          </>
        ) : <p style={{ fontSize: 17, fontWeight: 800 }}>{a.val || ''}</p>}
        <div><span className="cap">Qué hacer ahora</span><ol style={{ marginTop: 8 }}>{N.aSteps(a).map((s, i) => <li key={i}>{s}</li>)}</ol></div>
        <p className="note">{r ? r.k.src.map(s => s.t).join(' · ') : 'Guía rápida de signos vitales'} · Enviada a la Tierra con prioridad 1.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" type="button" style={{ background: '#fff' }} autoFocus onClick={cerrar}>Entendido, la estamos atendiendo</button>
          <button className="btn ghost" type="button" onClick={() => { cerrar(); window.location.hash = 'alertas'; }}>Abrir el centro de alertas</button>
        </div>
      </div>
    </div>
  );
}
