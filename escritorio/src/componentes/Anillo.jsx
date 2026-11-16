// Anillos concéntricos de progreso (sueño, atención, corazón…) y la mini gráfica de 7 días.

/** items: [{ pct: 0-100 o null, col: color }], del anillo de afuera hacia adentro. */
export default function Anillo({ tam, items, grosor, hueco = 4, children }) {
  const circulos = [];
  items.forEach((it, i) => {
    const r = tam / 2 - grosor / 2 - i * (grosor + hueco);
    if (r <= grosor / 2) return;
    const C = 2 * Math.PI * r;
    circulos.push(<circle key={'fondo' + i} cx={tam / 2} cy={tam / 2} r={r.toFixed(2)} fill="none" stroke={it.col} strokeOpacity={it.pct == null ? 0.07 : 0.16} strokeWidth={grosor} />);
    if (it.pct != null) {
      const p = Math.max(0, Math.min(100, it.pct));
      circulos.push(<circle key={'valor' + i} className="fg" cx={tam / 2} cy={tam / 2} r={r.toFixed(2)} fill="none" stroke={it.col} strokeWidth={grosor} strokeLinecap="round" strokeDasharray={C.toFixed(2)} strokeDashoffset={(C * (1 - p / 100)).toFixed(2)} />);
    }
  });
  return (
    <div className="ring" style={{ width: tam, height: tam }}>
      <svg className="rsvg" width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`} aria-hidden="true">{circulos}</svg>
      <div className="rin">{children}</div>
    </div>
  );
}

/** Tendencia de la preparación de los últimos 7 días de una persona. */
export function Chispa({ N, c }) {
  const W = 200, H = 34;
  const v = c.days.slice(-7).map(e => N.readyE(c, e));
  const ok = v.filter(x => x != null);
  if (ok.length < 2) return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" />;
  const lo = Math.min(40, ...ok), hi = 100;
  const X = i => 4 + i * (W - 8) / (v.length - 1);
  const Y = x => 3 + (1 - (x - lo) / (hi - lo)) * (H - 6);
  const pts = v.map((x, i) => (x == null ? null : [X(i), Y(x)])).filter(Boolean);
  const col = N.COL[N.lvlR(ok[ok.length - 1])];
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const fin = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d} L ${fin[0]} ${H} L ${pts[0][0]} ${H} Z`} fill={col} opacity=".12" />
      <path d={d} fill="none" stroke={col} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}

export const IconoAviso = () => (
  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1l5 9H1z" fill="currentColor" /></svg>
);
