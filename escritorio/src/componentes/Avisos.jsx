// Avisos y riesgos: lo que el motor clínico (Python) encontró para la persona seleccionada.
// Cada condición del checklist médico de NASA se muestra con sus 3 indicios.
import { useLatido } from '../bus.js';

/** Los 3 indicios de una condición: cuáles se cumplen, por qué y de qué fuente salen. */
export function Indicios({ r }) {
  return (
    <div className="crit">
      {r.cr.map((x, i) => (
        <div key={i}>
          <span className={x.w ? 'ok' : 'muted'}>{x.w ? '●' : '○'}</span>
          <span><b>{x.n}</b>{x.w && <small>{x.w}</small>}<small style={{ opacity: 0.75 }}>Fuente: {x.s}</small></span>
        </div>
      ))}
    </div>
  );
}

function TarjetaCondicion({ r }) {
  const nivel = r.lvl;
  return (
    <div className={'dxc l' + nivel}>
      <div className="rowb">
        <div><span className="cap">{r.k.sys}</span><h3 style={{ fontSize: 17, marginTop: 2 }}>{r.k.n}</h3></div>
        <div style={{ display: 'grid', justifyItems: 'end', gap: 4 }}>
          <span className="tri">{[0, 1, 2].map(i => <i key={i} className={i < r.hit ? 'on' : ''} />)}</span>
          <span className="cap" style={{ color: nivel === 2 ? 'var(--bad)' : nivel === 1 ? 'var(--warn)' : 'var(--muted)' }}>
            {nivel === 2 ? 'Alerta' : nivel === 1 ? 'Advertencia' : `${r.hit} de 3`}
          </span>
        </div>
        <p style={{ fontWeight: 800 }}>{r.presentas}</p>
        {r.desc && r.desc.length > 0 && nivel > 0 && (
          <p className="small" style={{ color: 'var(--muted)' }}><b style={{ color: 'var(--text)' }}>Nivel reducido:</b> {r.desc.join(' · ')}</p>
        )}
        {r.red.length > 0 && <p className="small" style={{ color: 'var(--bad)', fontWeight: 800 }}>Señal de alarma: {r.red.join(' · ')}</p>}
        <Indicios r={r} />
        {r.ctx.length > 0 && <div className="small muted"><b style={{ color: 'var(--text)' }}>Contexto que suma riesgo:</b> {r.ctx.join(' · ')}</div>}
        {r.k.note && <p className="note">{r.k.note}</p>}
        {nivel > 0 && (
          <details open={nivel === 2}>
            <summary className="small" style={{ cursor: 'pointer', fontWeight: 800 }}>Protocolo de NASA ({r.k.steps.length} pasos)</summary>
            <ol className="small" style={{ margin: '8px 0 0', paddingLeft: 20, display: 'grid', gap: 4 }}>
              {r.k.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </details>
        )}
        <div className="srcl">
          {r.k.src.map((s, i) => (s.u
            ? <a key={i} href={s.u} target="_blank" rel="noopener">{s.t}</a>
            : <span key={i} className="small muted" style={{ padding: '5px 10px', borderRadius: 999, background: 'var(--s1)' }}>{s.t}</span>))}
        </div>
      </div>
    </div>
  );
}

/** Lista completa, agrupada por sistema del cuerpo (sección Tripulación). */
export function ListaAvisos({ N }) {
  useLatido();
  if (!N) return <div id="dxList" style={{ display: 'grid', gap: 10 }} />;
  const activos = N.evalKB(N.cur()).filter(r => r.hit || r.red.length);
  const grupos = {};
  activos.forEach(r => { (grupos[r.k.sys] = grupos[r.k.sys] || []).push(r); });
  return (
    <div id="dxList" style={{ display: 'grid', gap: 10 }}>
      {activos.length ? Object.entries(grupos).map(([sistema, rs]) => (
        <div key={sistema} style={{ display: 'contents' }}>
          <span className="sysh">{sistema}</span>
          {rs.map(r => <TarjetaCondicion key={r.k.id} r={r} />)}
        </div>
      )) : (
        <div className="dxc"><b>Sin indicios</b><p className="muted small">Con lo registrado y los datos de los sensores no hay ninguna condición con indicios. Las condiciones se evalúan con tus síntomas, tus signos vitales, tus pruebas, tus muestras y el contexto de la misión.</p></div>
      )}
    </div>
  );
}

/** Resumen corto (sección Valoración). */
export function ResumenAvisos({ N }) {
  useLatido();
  if (!N) return <div id="dxMini" style={{ display: 'grid', gap: 8 }} />;
  const R = N.evalKB(N.cur()).filter(r => r.lvl || r.red.length);
  return (
    <div id="dxMini" style={{ display: 'grid', gap: 8 }}>
      {R.length ? R.map(r => (
        <div key={r.k.id} className={'act ' + (r.lvl >= 2 ? 'bad' : 'warn')}><span className="ic">!</span><div><b>{r.k.n}</b><span className="t">{r.presentas}</span></div></div>
      )) : (
        <div className="act good"><span className="ic">✓</span><div><b>Sin advertencias</b><span className="t">El motor no encuentra 2 de 3 indicios de ninguna condición.</span></div></div>
      )}
    </div>
  );
}
