// Dispositivos médicos de a bordo conectados a Space First AID.
//  - Bio-Monitor (Agencia Espacial Canadiense): camiseta y banda con pulso, oxígeno, presión, temperatura y respiración.
//  - Actígrafo: reloj de muñeca que mide el sueño.
//  - Bio-Analyzer (Agencia Espacial Canadiense): analiza gotas de sangre, orina y saliva.
// El astronauta no captura los valores: llegan de los dispositivos (en este prototipo, simulados)
// y se comparan con los rangos del documento de parámetros. Las animaciones se hicieron con Remotion.
import { useCallback, useEffect, useState } from 'react';
import { API } from '../api.js';
import { useLatido } from '../bus.js';

const porSexo = (v, sexo) => (v && typeof v === 'object' ? v[sexo === 'f' ? 'm' : 'h'] : v);
function textoRango(a, sexo) {
  if (a.basal) return 'vs. tu basal';
  const lo = porSexo(a.min, sexo), hi = porSexo(a.max, sexo);
  return lo != null && hi != null ? `${lo}–${hi}` : hi != null ? `< ${hi}` : lo != null ? `> ${lo}` : '';
}

/** Lectura simulada del Bio-Analyzer, dentro del rango de la persona. */
function lecturaNormal(T, sexo, P) {
  const v = {};
  T.analitos.forEach(a => {
    if (a.tipo === 'cual') { v[a.id] = a.normal; return; }
    if (a.basal) return;
    let lo = porSexo(a.min, sexo), hi = porSexo(a.max, sexo);
    if (lo == null) lo = hi * 0.5;
    if (hi == null) hi = lo * 1.6;
    let x = lo + (hi - lo) * (0.35 + Math.random() * 0.3);
    if (a.meta_min != null) x = Math.max(x, a.meta_min + (a.meta_max ? (a.meta_max - a.meta_min) / 2 : 0.3));
    const dec = String(a.paso || 1).includes('.') ? String(a.paso).split('.')[1].length : 0;
    v[a.id] = +x.toFixed(dec);
  });
  return v;
}

function Tarjeta({ video, nombre, agencia, estado, children }) {
  return (
    <div className="disp">
      <div className="disp-vid">
        <video src={video} autoPlay muted loop playsInline />
        <span className={'disp-est ' + (estado.ok ? 'ok' : 'off')}><i />{estado.texto}</span>
      </div>
      <div className="disp-cuerpo">
        <div><b>{nombre}</b><span className="cap">{agencia}</span></div>
        {children}
      </div>
    </div>
  );
}

const Fila = ({ n, v, u, mal }) => <div className="drow"><span>{n}</span><b style={{ color: mal ? 'var(--bad)' : undefined }}>{v}<small> {u}</small></b></div>;

export default function Dispositivos({ N, visible }) {
  useLatido();
  const P = window.PMU;
  const [vig, setVig] = useState([]);
  const [analizando, setAnalizando] = useState(null);
  const persona = N ? N.S.sel : null;
  const [, tic] = useState(0);

  const cargar = useCallback(async () => {
    if (!persona) return [];
    try { const r = (await API.get('muestras/' + persona)).vigentes; setVig(r); return r; } catch (e) { return []; }
  }, [persona]);

  const analizar = useCallback(async (tipo, silencio) => {
    const c = N.cur();
    setAnalizando(tipo);
    try {
      const r = await API.post('muestras', { tripulante: c.id, tipo, valores: lecturaNormal(P.tipos[tipo], c.sex, P) });
      if (!silencio) N.toast(`Bio-Analyzer · ${P.tipos[tipo].nombre}: ${r.resumen}`);
      await cargar(); N.syncClin(c);
    } finally { setAnalizando(null); }
  }, [N, P, cargar]);

  // Al abrir: si el Bio-Analyzer no tiene lecturas de esta persona, sincroniza las tres muestras.
  useEffect(() => {
    if (!visible || !N) return undefined;
    let vivo = true;
    cargar().then(async r => {
      if (!vivo) return;
      for (const tipo of Object.keys(P.tipos)) if (!r.some(m => m.tipo === tipo)) await analizar(tipo, true);
    });
    const t = setInterval(() => { tic(x => x + 1); cargar(); }, 6000);
    return () => { vivo = false; clearInterval(t); };
  }, [visible, persona]);   // eslint-disable-line react-hooks/exhaustive-deps

  if (!N || !P) return null;
  const c = N.cur(), L = N.LV[c.id], v = L.v, e = N.today(c);
  const nivel = (k, x) => N.vLvl(k, x) > 0;
  const semana = c.days.slice(-7).map(d => d.sl).filter(x => x != null);
  const ultimaDe = tipo => vig.find(m => m.tipo === tipo);

  return (
    <div className="card pad" style={{ display: 'grid', gap: 14 }}>
      <div className="rowb">
        <div><span className="cap">Datos que llegan solos · sin capturar a mano</span><h2 style={{ fontSize: 22, marginTop: 4 }}>Dispositivos conectados de {c.n}</h2></div>
        <span className="tagx">Lecturas simuladas</span>
      </div>
      <div className="dispgrid">
        <Tarjeta video="media/disp-biomonitor.mp4" nombre="Bio-Monitor" agencia="Camiseta inteligente · Agencia Espacial Canadiense"
          estado={L.on ? { ok: true, texto: 'Conectado · en vivo' } : { ok: false, texto: 'Sin señal del sensor' }}>
          {L.on ? <>
            <Fila n="Pulso" v={Math.round(v.hr)} u="lpm" mal={nivel('hr', v.hr)} />
            <Fila n="Oxígeno en sangre" v={Math.round(v.spo2)} u="%" mal={nivel('spo2', v.spo2)} />
            <Fila n="Presión" v={`${Math.round(v.sbp)}/${Math.round(v.dbp)}`} u="mmHg" mal={nivel('sbp', v.sbp) || nivel('dbp', v.dbp)} />
            <Fila n="Temperatura" v={v.temp.toFixed(1)} u="°C" mal={nivel('temp', v.temp)} />
            <Fila n="Respiración" v={Math.round(v.rr)} u="por min" mal={nivel('rr', v.rr)} />
          </> : <p className="muted small">Revisa que la camiseta esté puesta y la banda encendida.</p>}
        </Tarjeta>
        <Tarjeta video="media/disp-actigrafo.mp4" nombre="Actígrafo" agencia="Reloj de muñeca · sueño y actividad"
          estado={{ ok: e.sl != null, texto: e.sl != null ? 'Conectado · sincronizado hoy 06:00' : 'Sin datos de anoche' }}>
          <Fila n="Sueño anoche" v={e.sl != null ? e.sl.toFixed(1) : '—'} u="h" mal={e.sl != null && e.sl < 7} />
          <Fila n="Promedio 7 días" v={semana.length ? N.mean(semana).toFixed(1) : '—'} u="h" mal={semana.length && N.mean(semana) < 7} />
          <Fila n="Parámetro estable" v="7 h o más" u="" />
        </Tarjeta>
        <Tarjeta video="media/disp-bioanalyzer.mp4" nombre="Bio-Analyzer" agencia="Sangre, orina y saliva · Agencia Espacial Canadiense"
          estado={analizando ? { ok: true, texto: 'Analizando muestra…' } : { ok: true, texto: 'Conectado · listo' }}>
          {Object.entries(P.tipos).map(([tipo, T]) => {
            const m = ultimaDe(tipo);
            return (
              <div className="drow" key={tipo}>
                <span>{T.nombre}</span>
                <b style={{ color: m && m.nivel ? 'var(--bad)' : 'var(--good)' }}>{m ? (m.nivel ? 'Fuera de rango' : 'En rango') : '—'}<small> {m ? `· ${m.codigo}${m.origen === 'tierra' ? ' · Tierra' : ''}` : ''}</small></b>
              </div>
            );
          })}
          <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {Object.entries(P.tipos).map(([tipo, T]) => (
              <button key={tipo} className="btn ghost sm" type="button" disabled={!!analizando} onClick={() => analizar(tipo)}>Analizar {T.nombre.split(' ')[0].toLowerCase()}</button>
            ))}
          </div>
        </Tarjeta>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <h3>Resultados del Bio-Analyzer · rangos del documento de parámetros{c.sex ? ` (${c.sex === 'f' ? 'mujer' : 'hombre'})` : ''}</h3>
        <p className="muted small">{P.regla_origen}</p>
        <div className="labgrid">
          {Object.entries(P.tipos).map(([tipo, T]) => {
            const m = ultimaDe(tipo), an = m ? (m.resultado.analitos || {}) : {};
            return (
              <div className="labcol" key={tipo}>
                <div className="rowb"><b>{T.nombre}</b><span className="cap">{m ? m.codigo : 'sin lectura'}</span></div>
                {T.analitos.filter(a => an[a.id]).map(a => {
                  const r = an[a.id];
                  return (
                    <div className="labrow" key={a.id} title={r.texto}>
                      <span>{a.nombre}</span>
                      <b style={{ color: r.nivel ? 'var(--bad)' : 'var(--text)' }}>{String(r.valor)} <small>{a.unidad}</small></b>
                      <em>{textoRango(a, c.sex)}</em>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
