// Alertas que se ven en cualquier sección:
//  - la barra superior con la más importante;
//  - la ventana de emergencia, que sale cuando un problema cumple TODOS sus signos y síntomas
//    (o con la tormenta de radiación). Explica qué pasó, qué sistemas se afectaron y el
//    protocolo y la contramedida del documento de parámetros, paso a paso y con animaciones.
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
        <b>{principal.lvl >= 2 ? 'EMERGENCIA' : 'ALERTA'} · {N.who(principal.id)}</b>
        <span className="at">{N.aName(principal)}{principal.val ? ' · ' + principal.val : ''}{activas.length > 1 ? ` · y ${activas.length - 1} más` : ''}</span>
        <span className="btn sm" style={{ background: '#fff', color: '#05070A' }}>Ver</span>
      </div>
    </div>
  );
}

/* Icono animado según lo que pide cada paso del protocolo. */
function iconoPaso(texto) {
  const t = texto.toLowerCase();
  if (/refugio|blindad/.test(t)) return 'refugio';
  if (/agua|hidrat|líquido|beber|orina/.test(t)) return 'agua';
  if (/dorm|sueño|siesta|melatonina|luz/.test(t)) return 'sueno';
  if (/ejercicio|ared|carga|resistivo/.test(t)) return 'ejercicio';
  if (/ultrasonido|oct|imagen|dxa|biometr|medir|muestra|vigilar|registrar|prueba/.test(t)) return 'medir';
  if (/antiem|analges|antivir|vitamina|citrato|zoledr|botiquín|medic/.test(t)) return 'medicina';
  if (/mover|cabeza|orientación|eva|suspender/.test(t)) return 'quieto';
  if (/familia|grupo|conferencia|diario|comida|mensaje/.test(t)) return 'equipo';
  return 'paso';
}
const ICONOS = {
  refugio: <><path d="M6 22 L24 8 L42 22 V40 H6 Z" className="an-borde" /><circle cx="24" cy="30" r="5" className="an-punto" /></>,
  agua: <path d="M24 6 C24 6 12 22 12 30 a12 12 0 0 0 24 0 C36 22 24 6 24 6Z" className="an-gota" />,
  sueno: <path d="M30 8 a16 16 0 1 0 10 26 a13 13 0 0 1 -10 -26Z" className="an-luna" />,
  ejercicio: <><rect x="6" y="20" width="6" height="10" rx="2" className="an-pesa" /><rect x="36" y="20" width="6" height="10" rx="2" className="an-pesa" /><path d="M12 25 H36" className="an-borde" /></>,
  medir: <><path d="M4 26 H14 L18 16 L24 36 L30 12 L34 26 H44" className="an-ecg" /></>,
  medicina: <><rect x="8" y="17" width="32" height="14" rx="7" className="an-borde" /><path d="M24 17 V31" className="an-borde" /><circle cx="16" cy="24" r="3" className="an-punto" /></>,
  quieto: <><circle cx="24" cy="12" r="5" className="an-borde" /><path d="M24 17 V32 M16 24 H32 M24 32 L18 42 M24 32 L30 42" className="an-borde an-flota" /></>,
  equipo: <><circle cx="16" cy="18" r="5" className="an-borde" /><circle cx="32" cy="18" r="5" className="an-borde" /><path d="M8 38 C8 30 24 30 24 38 M24 38 C24 30 40 30 40 38" className="an-borde" /></>,
  paso: <path d="M10 24 L20 34 L38 14" className="an-check" />,
};

function PasoAnimado({ texto, i, activo, hecho }) {
  const tipo = iconoPaso(texto);
  return (
    <li className={'pasoA' + (activo ? ' act' : '') + (hecho ? ' ok' : '')} style={{ animationDelay: i * 0.12 + 's' }}>
      <svg viewBox="0 0 48 48" className={'pico pico-' + tipo} aria-hidden="true">{ICONOS[tipo]}</svg>
      <span><b>Paso {i + 1}.</b> {texto}</span>
    </li>
  );
}

/** Animación sencilla de la escena: el sistema atacado se ilumina en una silueta. */
function Escena({ partes, tormenta }) {
  const zonas = { brain: [100, 30], eyes: [100, 34], ear: [116, 34], heart: [108, 92], lungs: [100, 92], kidney: [100, 150], bones: [100, 230], spine: [100, 130], legs: [100, 300], body: [100, 140] };
  return (
    <svg viewBox="0 0 200 360" className="escena" aria-hidden="true">
      {tormenta && Array.from({ length: 9 }, (_, i) => <line key={i} className="rayo" x1={20 + i * 20} y1="-10" x2={i * 20} y2="60" style={{ animationDelay: i * 0.18 + 's' }} />)}
      <path className="silu" d="M100 8c14 0 24 11 24 26 0 12-6 21-14 25v8c18 2 34 8 38 22l10 70c2 12 4 30 6 44 1 8-8 10-10 2l-10-60-4 4 2 46c0 8-2 14-4 22l-6 100c0 10-14 10-14 0l-6-90h-4l-6 90c0 10-14 10-14 0l-6-100c-2-8-4-14-4-22l2-46-4-4-10 60c-2 8-11 6-10-2 2-14 4-32 6-44l10-70c4-14 20-20 38-22v-8c-8-4-14-13-14-25 0-15 10-26 24-26z" />
      {partes.map(p => { const z = zonas[p] || zonas.body; return <circle key={p} className="foco" cx={z[0]} cy={z[1]} r={p === 'body' ? 46 : 16} />; })}
      {tormenta && <path className="escudo" d="M30 200 Q100 150 170 200 L170 350 L30 350 Z" />}
    </svg>
  );
}

export function AlertaGrande({ N }) {
  const [a, setA] = useState(null);
  const [paso, setPaso] = useState(0);
  useEvento('alerta-grande', useCallback(nueva => setA(previa => (previa && previa.key === nueva.key ? previa : nueva)), []));
  useEffect(() => { setPaso(0); }, [a && a.key]);   // eslint-disable-line react-hooks/exhaustive-deps
  // Mientras esté abierta, la sirena suena y gira cada 4.5 s; los pasos se van iluminando.
  useEffect(() => {
    if (!a || !N) return undefined;
    const sonar = () => { N.siren(2); N.buzz([200, 100, 200]); SFA.emit('sirena', 2); };
    sonar();
    const t = setInterval(sonar, 4500);
    const p = setInterval(() => setPaso(x => x + 1), 2200);
    return () => { clearInterval(t); clearInterval(p); };
  }, [a, N]);

  if (!a || !N) return <div className="bigal" id="bigal" hidden role="alertdialog" aria-modal="true" />;
  const c = N.CREW.find(x => x.id === a.id), r = a.res, tormenta = a.type === 'tormenta';
  const pasos = N.aSteps(a);
  const sistemas = r ? r.k.sistemas.map(s => window.PROB.sistemas[s].nombre) : tormenta ? ['Radiación', 'Inmunológico'] : [];
  const partes = r ? [r.k.part] : tormenta ? ['body'] : [];
  const cerrar = () => { a.seen = true; setA(null); N.render(); };
  return (
    <div className="bigal" id="bigal" role="alertdialog" aria-modal="true" aria-labelledby="bigT">
      <div className="bx bx-emerg">
        <div className="hd2">
          <span className="ico">!</span>
          <div><span className="cap" style={{ color: '#FF9AA6' }}>Emergencia · {N.who(a.id)}{c ? ' · ' + c.r : ''}</span><h2 id="bigT">{tormenta ? 'Tormenta de radiación: todos al refugio' : N.aName(a)}</h2></div>
        </div>
        <div className="emerg-grid">
          <Escena partes={partes} tormenta={tormenta} />
          <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
            <div><span className="cap">Qué pasó</span>
              <p style={{ fontWeight: 800, marginTop: 4 }}>{r ? r.presentas : `Radiación en la cabina: ${a.val}. Evento de partículas solares en curso.`}</p>
              {r && <p className="small muted" style={{ marginTop: 4 }}>{r.k.explicacion}</p>}
            </div>
            <div><span className="cap">Sistemas atacados</span>
              <div className="sischips">{sistemas.map(s => <span key={s} className="ch bad">{s}</span>)}</div>
            </div>
            {r && (
              <div className="why2"><span className="cap">Signos y síntomas que lo confirman</span>
                {r.cr.filter(x => x.w).map((x, i) => <div key={i}><span style={{ color: 'var(--bad)' }}>●</span><span><b>{x.n}</b> · {x.w}</span></div>)}
              </div>
            )}
          </div>
        </div>
        <div><span className="cap">Protocolo y contramedida</span>
          <ol className="pasosA">{pasos.map((s, i) => <PasoAnimado key={i} texto={s} i={i} activo={i === paso % pasos.length} hecho={i < paso % pasos.length} />)}</ol>
        </div>
        {r && r.k.parametros && (
          <details><summary className="small" style={{ cursor: 'pointer', fontWeight: 800 }}>Parámetros estables a vigilar</summary>
            <ul className="small" style={{ marginTop: 6 }}>{r.k.parametros.map((x, i) => <li key={i}>{x}</li>)}</ul></details>
        )}
        <p className="note">{r ? r.k.src.map(s => s.t).join(' · ') : 'NASA-STD-3001 · documento de parámetros'} · Enviada a la Tierra con prioridad 1.</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn" type="button" style={{ background: '#fff' }} autoFocus onClick={cerrar}>Entendido, la estamos atendiendo</button>
          <button className="btn ghost" type="button" onClick={() => { cerrar(); window.location.hash = 'alertas'; }}>Abrir el centro de alertas</button>
        </div>
      </div>
    </div>
  );
}
