// Panel de enlace con la Tierra (se abre con el botón de conexión del encabezado).
// La cola y el envío por prioridad los maneja el motor en Python; aquí solo se muestran.
import { useLatido } from '../bus.js';

const RETARDO = {
  luna_base: 'Retardo ≈ 1.3 s', luna_orbita: 'Retardo ≈ 1.3 s', luna_sobrevuelo: 'Retardo ≈ 1.3 s', orbita_baja: 'Retardo menor a 0.1 s',
};
const COLOR_PRIORIDAD = ['#FF5468', '#F5B841', '#8B96A6'];
const ETIQUETA = { 1: 'Alerta', 2: 'Resumen', 3: 'Detalle' };

function DibujoEnlace({ enLinea, pendientes, animar }) {
  return (
    <svg id="linkSvg" viewBox="0 0 560 170" aria-hidden="true">
      <defs>
        <radialGradient id="le" cx=".35" cy=".35">
          <stop offset="0" stopColor="#7FB2FF" /><stop offset=".7" stopColor="#1D3F8A" /><stop offset="1" stopColor="#0A1A3A" />
        </radialGradient>
      </defs>
      <line x1="104" y1="85" x2="462" y2="85" stroke={enLinea ? '#34E39A' : '#2A3442'} strokeWidth="2" strokeDasharray={enLinea ? '0' : '6 8'} opacity={enLinea ? 0.4 : 1} />
      {enLinea && animar && (
        <line x1="104" y1="85" x2="462" y2="85" stroke="#34E39A" strokeWidth="2" strokeDasharray="4 14">
          <animate attributeName="stroke-dashoffset" values="0;-36" dur="1s" repeatCount="indefinite" />
        </line>
      )}
      <g transform="translate(60 85)">
        <circle r="42" fill="#11161D" stroke="#243041" />
        <path d="M-18 6 L-5 -13 L15 -13 L21 0 L15 13 L-5 13 Z" fill="#1B2430" stroke="#EEF2F6" strokeWidth="2" />
        <rect x="-34" y="-5" width="12" height="10" rx="2" fill="#5B9DFF" /><rect x="24" y="-5" width="12" height="10" rx="2" fill="#5B9DFF" />
      </g>
      {pendientes.slice(0, 8).map((q, i) => (
        <circle key={q.id || i} cx={30 + (i % 4) * 14} cy={143 + Math.floor(i / 4) * 13} r="5" fill={COLOR_PRIORIDAD[q.p - 1] || COLOR_PRIORIDAD[2]} />
      ))}
      <g transform="translate(504 85)">
        <circle r="44" fill="url(#le)" /><circle r="44" fill="none" stroke="#5FD3F3" strokeOpacity=".35" strokeWidth="5" />
      </g>
      <text x="283" y="66" textAnchor="middle" fill={enLinea ? '#34E39A' : '#F5B841'} fontSize="13" fontWeight="800" fontFamily="Manrope">
        {enLinea ? 'CON SEÑAL' : 'SIN SEÑAL · se guarda en la nave'}
      </text>
    </svg>
  );
}

export default function PanelEnlace({ N, abierto, cerrar }) {
  useLatido();
  if (!N) return null;
  const { LINK, S } = N;
  const cola = N.queue || [];
  const pendientes = cola.filter(q => !q.s).sort((a, b) => a.p - b.p);
  const privacidad = k => e => {
    S.priv[k] = e.target.checked; N.save(); N.render();
    N.toast(e.target.checked ? 'Compartirás esto con la Tierra' : 'Esto se queda en la nave');
  };
  return (
    <div className="dlg" id="enlacePanel" hidden={!abierto} role="dialog" aria-modal="true" aria-labelledby="enlT" onClick={e => { if (e.target === e.currentTarget) cerrar(); }}>
      <div className="card pad dlg-in">
        <div className="rowb">
          <div><span className="cap">Funciona sin señal</span><h2 id="enlT">Enlace con la Tierra</h2></div>
          <button className="btn ghost sm" type="button" onClick={cerrar}>Cerrar</button>
        </div>
        <p className="muted small">Todo se guarda primero en la nave (SQLite). Cuando hay señal, el motor en Python lo envía por prioridad: alertas, luego resúmenes y al final el detalle. Los resultados del laboratorio en Tierra regresan por el mismo enlace.</p>
        <DibujoEnlace enLinea={!!S.online} pendientes={pendientes} animar={!N.RM} />
        <div className="lrow"><span>Nave · {LINK.pendientes || 0} en cola</span><span>{RETARDO[window.MISION.destino] || ''}</span><span>Centro de control</span></div>
        <div className="enl-ctl">
          <button className="btn go sm" type="button" onClick={() => N.toggleLink()}>{LINK.sin_senal ? 'Recuperar señal' : 'Simular pérdida de señal'}</button>
          <a className="btn ghost sm" href="/tierra/" target="_blank" rel="noopener">Abrir el centro de control (Tierra)</a>
          <span className="small">
            {LINK.sin_senal ? <><b style={{ color: 'var(--warn)' }}>Pérdida de señal simulada</b>: todo se guarda en la nave.</>
              : LINK.en_linea ? <><b style={{ color: 'var(--good)' }}>Conectado</b> con el centro de control · {LINK.enviados} paquetes entregados</>
                : <><b style={{ color: 'var(--warn)' }}>Sin conexión</b> con el centro de control: {LINK.pendientes} en cola, se reintenta solo.</>}
          </span>
        </div>
        <div className="q">
          {cola.length ? cola.map((q, i) => (
            <div className="qi" key={q.id || i}>
              <span className={'pr p' + q.p}>{ETIQUETA[q.p] || 'Detalle'}</span>
              <span>{q.c}</span>
              <span style={{ fontSize: '12.5px', fontWeight: 800, color: q.s ? 'var(--good)' : S.online ? 'var(--text)' : 'var(--muted)' }}>{q.s ? '✓ Enviado' : S.online ? 'Enviando…' : 'En espera'}</span>
            </div>
          )) : <p className="muted small">Aún no hay paquetes.</p>}
        </div>
        <details className="enl-priv">
          <summary>Qué ve la Tierra</summary>
          <label className="sw"><input type="checkbox" checked disabled readOnly /><div><b>Estado general y alertas</b><p className="muted small">Siempre activo: es lo mínimo que el equipo necesita.</p></div></label>
          <label className="sw"><input type="checkbox" checked={!!S.priv[1]} onChange={privacidad(1)} /><div><b>Detalle de Órbita</b><p className="muted small">Tiempos de reacción de cada turno oficial.</p></div></label>
          <label className="sw"><input type="checkbox" checked={!!S.priv[2]} onChange={privacidad(2)} /><div><b>Antecedentes</b><p className="muted small">Para que el médico de vuelo revise tu plan.</p></div></label>
          <label className="sw"><input type="checkbox" checked={!!S.priv[3]} onChange={privacidad(3)} /><div><b>Revisiones de ojos</b><p className="muted small">Recomendado: ayuda a detectar SANS a tiempo.</p></div></label>
        </details>
      </div>
    </div>
  );
}
