// Sección Tripulación.
//  #tripulacion        → solo los círculos de cada tripulante (no se muestra ningún detalle).
//  #tripulacion/<id>   → página de detalle de esa persona, como una página aparte.
import { useLatido } from '../bus.js';
import { ListaAvisos } from '../componentes/Avisos.jsx';
import { BarrasSistemas, CirculosSistemas } from '../componentes/Sistemas.jsx';
import { IconoAviso } from '../componentes/Anillo.jsx';

function Tarjeta({ N, c }) {
  const s = N.estadoDe(c), avisos = N.alerts(c), total = N.ready(c);
  return (
    <a className="cc" href={'#tripulacion/' + c.id} style={{ '--pc': c.col }}>
      <div className="cc-h">
        <span className="av" style={{ color: c.col }}>{c.n[0]}</span>
        <div className="cc-n"><b>{c.n}</b><span>{c.r}</span></div>
        <span className={'st ' + s.l}>{s.t}</span>
      </div>
      <div className="cc-tot"><span className="cap">Estado general</span><b className="num">{total == null ? '—' : total + ' %'}</b></div>
      <CirculosSistemas N={N} sis={N.SIS[c.id]} tam={58} detalle={false} />
      <div className="cc-v" data-ccv={c.id} />
      <div className="cc-a">
        {avisos.length ? avisos.map((a, i) => <span key={i} className={'ch ' + a.l}><IconoAviso />{a.t}</span>) : <span className="ch g">Sin alertas</span>}
      </div>
      <span className="cc-ir">Ver su detalle →</span>
    </a>
  );
}

function Lista({ N }) {
  return (
    <>
      <div className="ptitle"><div><span className="cap">Estado de salud de cada tripulante</span><h1>Tripulación</h1>
        <p>Toca a una persona para abrir su página: sistemas del cuerpo, signos vitales, avisos y riesgos, y su modelo 3D.</p></div></div>
      <div className="crewgrid" id="crewgrid">{N && N.CREW.map(c => <Tarjeta key={c.id} N={N} c={c} />)}</div>
    </>
  );
}

function RegistroReciente({ N, c }) {
  const a = N.AUTO[c.id] || {}, p = N.PRU[c.id] || {};
  const filas = [
    ['Carga de trabajo', a.carga, '/100'], ['Estrés (PSS-10)', a.pss, '/40'], ['Estado de ánimo', a.animo, '/10'], ['Trabajo en equipo', a.equipo, '/10'],
    ['Órbita (PVT)', p.pvt, ' %'], ['Coordinación ojo-mano', p.alcance, ' %'], ['Prueba de visión', p.vision_c, ' %'], ['Círculo con la mano', p.trazo, ' %'],
  ];
  return (
    <div className="card pad" style={{ display: 'grid', gap: 10 }}>
      <div className="rowb"><h3>Registro personal y pruebas</h3><span className="cap">Últimos valores</span></div>
      <div className="regtab">
        {filas.map(([n, v, u]) => {
          const bajo = u === ' %' && v != null && v < 70;
          return <div key={n}><span>{n}</span><b style={{ color: bajo ? 'var(--bad)' : undefined }}>{v == null ? '—' : Math.round(v) + u}</b></div>;
        })}
      </div>
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <a className="btn ghost sm" href="#valoracion">Registrar en Valoración</a><a className="btn ghost sm" href="#pruebas">Hacer pruebas</a>
      </div>
    </div>
  );
}

function Detalle({ N }) {
  const c = N.cur(), s = N.estadoDe(c);
  return (
    <>
      <a className="volver" href="#tripulacion">← Toda la tripulación</a>
      <div className="card phead">
        <div className="who"><span className="av xl" style={{ color: c.col }}>{c.n[0]}</span>
          <div><span className="cap">{c.r} · día {N.DAY}</span><h1>{c.n}</h1><span className={'st ' + s.l}>{s.t}</span></div></div>
        <div className="todo"><span className="cap">Qué hacer hoy</span>
          <div className="actions">
            {(N.alerts(c).length ? N.alerts(c) : [{ l: 'good', t: 'Sin alertas', do: 'Mantén tu horario de sueño, hidratación y ejercicio.' }]).slice(0, 4).map((a, i) => (
              <div key={i} className={'act ' + a.l}><span className="ic">{a.l === 'good' ? '✓' : '!'}</span><div><b>{a.t}</b><span className="t">{a.do}</span></div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="card pad" style={{ display: 'grid', gap: 12 }}>
        <div className="rowb"><h3>Sistemas del cuerpo</h3><span className="cap">0 a 100 · calculado en Python con el documento de parámetros</span></div>
        <CirculosSistemas N={N} sis={N.SIS[c.id]} />
      </div>
      <div className="pgrid2">
        <div className="card pad solo" style={{ display: 'grid', gap: 10 }}>
          <div className="rowb"><h3>Modelo 3D</h3><span className="cap" id="soloCap">Arrastra para girar</span></div>
          <div className="solo3d" id="solo3d" /><div className="cleg" id="soloLeg" />
        </div>
        <div className="card pad dxcol" style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <div className="rowb"><h3>Avisos y riesgos</h3><span className="cap">Lo que el sistema ve</span></div>
          <p className="muted small">Cada problema del documento de parámetros se evalúa con sus signos y síntomas: algunos = alerta, todos = emergencia con el protocolo.</p>
          <ListaAvisos N={N} />
        </div>
      </div>
      <div className="two">
        <div className="card pad" style={{ display: 'grid', gap: 12 }}><div className="rowb"><h3>Signos vitales en vivo</h3><span className="cap" id="pVitCap">Sensor portátil</span></div><div id="pVit" /></div>
        <RegistroReciente N={N} c={c} />
      </div>
      <div className="card pad" style={{ display: 'grid', gap: 14 }}>
        <div className="rowb"><h3>Perfil previo al vuelo</h3><span className="cap" id="pN" /></div>
        <div className="chips" id="hx" /><div className="chips" id="fit" /><div className="watch" id="watch" />
      </div>
    </>
  );
}

export default function Tripulacion({ oculto, N, persona }) {
  useLatido();
  return (
    <section className="page" id="v-tripulacion" hidden={oculto}>
      {persona && N ? <Detalle N={N} /> : <Lista N={N} />}
    </section>
  );
}
