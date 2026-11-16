// Panel: el círculo principal de toda la tripulación y la guía de sueño por ritmo circadiano.
import { useEffect, useState } from 'react';
import { useLatido } from '../bus.js';
import Anillo from './Anillo.jsx';

const lista = a => a.map(x => x.c.n).join(', ').replace(/, ([^,]*)$/, ' y $1');

/** Estado de toda la tripulación en un solo círculo, y qué conviene hacer hoy. */
export function ResumenTripulacion({ N }) {
  useLatido();
  const [ancho, setAncho] = useState(window.innerWidth);
  useEffect(() => {
    const f = () => setAncho(window.innerWidth);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  if (!N) return <div className="card hero" />;
  const { CREW, SC } = N;
  const conDatos = CREW.filter(c => N.ready(c) != null);
  const promedio = f => Math.round(N.mean(conDatos.map(f)));
  const sueno = promedio(c => SC.sleep(c, N.today(c))), atencion = promedio(c => SC.mind(c, N.today(c)));
  const corazon = promedio(c => SC.heart(c, N.today(c))), total = promedio(N.ready);
  const estados = CREW.map(c => ({ c, s: N.estadoDe(c) }));
  const enForma = estados.filter(x => x.s.l === 'good').length;
  const revisar = estados.filter(x => x.s.l === 'bad' || x.s.l === 'warn');
  const sinDatos = estados.filter(x => x.s.l === 'none');
  const tam = ancho < 760 ? 210 : 236;
  const orden = { bad: 0, warn: 1, none: 2 };
  const acciones = CREW.flatMap(c => N.alerts(c).map(a => ({ c, a }))).sort((x, y) => orden[x.a.l] - orden[y.a.l]).slice(0, 4);
  return (
    <div className="card hero">
      <Anillo tam={tam} grosor={tam < 230 ? 15 : 17} hueco={5} items={[{ pct: sueno, col: '#5B9DFF' }, { pct: atencion, col: '#A28CFF' }, { pct: corazon, col: '#FF6B7D' }]}>
        <div><div className="rv" style={{ fontSize: tam < 230 ? 46 : 54 }}>{total}<small>%</small></div><div className="ru">tripulación</div></div>
      </Anillo>
      <div>
        <span className="cap">Día {N.DAY} de {N.LEN} · misión de larga duración</span>
        <h1>{enForma === CREW.length ? 'Toda la tripulación está en forma' : `${enForma} de ${CREW.length} en forma hoy`}</h1>
        <p className="muted">
          {revisar.length ? `Conviene revisar a ${lista(revisar)}.` : 'Sueño, atención y corazón dentro del rango de cada persona.'}
          {sinDatos.length ? ` ${lista(sinDatos)} no tiene datos de hoy.` : ''}
        </p>
        <div className="lg3">
          {[['Sueño', sueno, '#5B9DFF'], ['Atención', atencion, '#A28CFF'], ['Corazón', corazon, '#FF6B7D']].map(([n, v, col]) => (
            <div key={n}><span className="k"><i style={{ background: col }} />{n}</span><span className="num">{v}</span></div>
          ))}
        </div>
      </div>
      <div className="hside">
        <span className="cap" style={{ display: 'block', marginBottom: 10 }}>Hoy conviene</span>
        <div className="actions">
          {acciones.length ? acciones.map(({ c, a }, i) => (
            <div key={i} className={'act ' + a.l}><span className="ic" style={{ color: c.col }}>{c.n[0]}</span><div><b>{c.n} · {a.t}</b><span className="t">{a.do}</span></div></div>
          )) : (
            <div className="act good"><span className="ic">✓</span><div><b>Nada urgente</b><span className="t">Mantengan horarios de sueño y turnos de Órbita.</span></div></div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Ritmo circadiano · guía de sueño ----------
   En el espacio se pierde la noción del día y la noche (unos 16 amaneceres al día en la
   Estación; en la Luna el día dura unos 29.5 días). La app marca un día de 24 h (hora UTC
   de la misión) con fases de luz: azul para despertar, blanca de día, cálida antes de dormir
   y oscuridad. Las fases vienen del núcleo (FASES_LUZ). */
function RelojDeLuz({ N, h }) {
  const f = N.faseLuz(h), R = 92, C = 110;
  const ang = x => (x / 24) * Math.PI * 2 - Math.PI / 2;
  const P = (x, r) => [C + r * Math.cos(ang(x)), C + r * Math.sin(ang(x))];
  const arco = (a, b, r) => {
    const p0 = P(a, r), p1 = P(b, r), largo = ((b - a + 24) % 24) > 12 ? 1 : 0;
    return `M ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} A ${r} ${r} 0 ${largo} 1 ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
  };
  const sol = P(h, R), noche = f.n === 'Dormir';
  const azar = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  return (
    <svg viewBox="0 0 220 220" className="circsvg" role="img" aria-label="Reloj de luz de 24 horas">
      <defs>
        <radialGradient id="cielo" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor={f.col} stopOpacity=".55" /><stop offset="1" stopColor="#05070A" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx={C} cy={C} r={R + 12} fill="#0B0F14" stroke="#18212B" />
      <circle className="cglow" cx={C} cy={C} r={R - 26} fill="url(#cielo)" />
      {noche && Array.from({ length: 14 }, (_, i) => (
        <circle key={i} className="cst" style={{ animationDelay: (azar(i) * 3).toFixed(1) + 's' }} cx={(C + (azar(i + 20) - 0.5) * 96).toFixed(0)} cy={(C + (azar(i + 40) - 0.5) * 96).toFixed(0)} r={(azar(i + 60) * 1.1 + 0.5).toFixed(1)} fill="#fff" />
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const a = P(i, R - 14), b = P(i, R - (i % 6 ? 18 : 24));
        return <line key={i} x1={a[0].toFixed(1)} y1={a[1].toFixed(1)} x2={b[0].toFixed(1)} y2={b[1].toFixed(1)} stroke="#2A3442" strokeWidth={i % 6 ? 1 : 2} />;
      })}
      {[0, 6, 12, 18].map(i => {
        const p = P(i, R - 34);
        return <text key={i} x={p[0].toFixed(1)} y={(p[1] + 4).toFixed(1)} textAnchor="middle" fill="#5A6576" fontSize="11" fontWeight="800" fontFamily="Manrope">{String(i).padStart(2, '0')}</text>;
      })}
      {N.FASES_LUZ.map(x => <path key={x.n} d={arco(x.de % 24, x.a % 24, R)} stroke={x.col} strokeWidth="12" fill="none" opacity={x === f ? 1 : 0.35} />)}
      <line x1={C} y1={C} x2={sol[0].toFixed(1)} y2={sol[1].toFixed(1)} stroke="#EEF2F6" strokeWidth="2" opacity=".5" />
      <g transform={`translate(${sol[0].toFixed(1)} ${sol[1].toFixed(1)})`}>
        <circle className="cpulse" r="14" fill={f.col} opacity=".25" />
        {noche ? <path d="M3-8a8 8 0 1 0 5 13 6.5 6.5 0 1 1-5-13z" fill="#E6EBFF" /> : <circle r="8" fill={f.col} />}
      </g>
      <text x={C} y={C - 4} textAnchor="middle" fill="#EEF2F6" fontSize="26" fontWeight="700" fontFamily="Sora">{String(Math.floor(h)).padStart(2, '0')}:{String(Math.floor((h % 1) * 60)).padStart(2, '0')}</text>
      <text x={C} y={C + 16} textAnchor="middle" fill="#8B96A6" fontSize="10.5" fontWeight="800" letterSpacing="1.5" fontFamily="Manrope">UTC · MISIÓN</text>
    </svg>
  );
}

const OrbitaMini = () => (
  <svg viewBox="0 0 120 120" className="orbmini" aria-hidden="true">
    <defs><linearGradient id="term" x1="0" x2="1"><stop offset=".5" stopColor="#1D3F8A" /><stop offset=".5" stopColor="#05070A" /></linearGradient></defs>
    <circle cx="60" cy="60" r="26" fill="url(#term)" stroke="#2C8F86" strokeOpacity=".4" />
    <circle cx="60" cy="60" r="44" fill="none" stroke="#243041" strokeDasharray="2 4" />
    <g className="orbgira"><circle cx="104" cy="60" r="4.5" fill="#EEF2F6" /></g>
  </svg>
);

export function GuiaDeSueno({ N }) {
  const [, tic] = useState(0);
  useEffect(() => { const t = setInterval(() => tic(x => x + 1), 30000); return () => clearInterval(t); }, []);
  if (!N) return <div className="card circ" id="circ" />;
  const d = new Date(), h = d.getUTCHours() + d.getUTCMinutes() / 60;
  const f = N.faseLuz(h), fuera = N.afuera();
  const horas = N.CREW.map(c => N.today(c).sl).filter(x => x != null);
  const promedio = horas.length ? N.mean(horas) : null;
  const falta = ((21.5 - h) + 24) % 24, hh = Math.floor(falta), mm = Math.round((falta - hh) * 60);
  return (
    <div className="card circ" id="circ">
      <div className="circ-dial"><RelojDeLuz N={N} h={h} /></div>
      <div className="circ-txt">
        <span className="cap">Ritmo circadiano · guía de sueño</span>
        <h2>{f.n}: <span style={{ color: f.col }}>{f.luz.toLowerCase()}</span></h2>
        <p>{f.tip}</p>
        <div className="circ-k">
          <div><span className="cap">Hora de dormir</span><b className="num">21:30</b><small>{f.n === 'Dormir' ? 'ahora' : `en ${hh} h ${mm} min`}</small></div>
          <div><span className="cap">Despertar</span><b className="num">06:00</b><small>8.5 h para dormir</small></div>
          <div><span className="cap">Anoche</span><b className="num">{promedio != null ? promedio.toFixed(1) + ' h' : '—'}</b><small>promedio de la tripulación</small></div>
        </div>
        <div className="circ-out">{fuera.orb ? <OrbitaMini /> : null}<div><b>{fuera.t}</b><p className="muted small">{fuera.d}</p></div></div>
        <div className="circ-act"><a className="btn ghost sm" href="#midia">Respiración guiada antes de dormir</a></div>
      </div>
    </div>
  );
}
