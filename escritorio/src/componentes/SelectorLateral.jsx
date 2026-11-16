// Sección lateral con la persona seleccionada y un desplegable para cambiarla.
// Aparece en todas las secciones menos en el Panel y en la lista de la Tripulación,
// para que siempre quede claro de quién se está hablando.
import { useLatido } from '../bus.js';

export default function SelectorLateral({ N, visible, alCambiar }) {
  useLatido();
  if (!N || !visible) return null;
  const c = N.cur(), s = N.estadoDe(c);
  const cambiar = e => {
    if (N.GS && !N.GS.done) { N.toast('Termina tu turno antes de cambiar de persona'); return; }
    N.S.sel = e.target.value; N.save(); N.render();
    if (alCambiar) alCambiar(e.target.value);
  };
  return (
    <aside className="lateral" aria-label="Tripulante seleccionado" style={{ '--pc': c.col }}>
      <span className="cap">Tripulante</span>
      <div className="lat-who">
        <span className="av" style={{ color: c.col }}>{c.n[0]}</span>
        <div><b>{c.n}</b><span>{c.r}</span></div>
      </div>
      <span className={'st ' + s.l}>{s.t}</span>
      <label className="fl lat-sel">Cambiar a
        <select value={c.id} onChange={cambiar}>
          {N.CREW.map(x => <option key={x.id} value={x.id}>{x.n} · {x.r}</option>)}
        </select>
      </label>
    </aside>
  );
}
