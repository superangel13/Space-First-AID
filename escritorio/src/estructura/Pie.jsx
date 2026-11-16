// Pie: referencias, misión actual y botón para registrar una misión nueva.
import { API } from '../api.js';

export default function Pie({ N }) {
  const m = window.MISION || {};
  const destino = (m.destino_info && m.destino_info.nombre) || m.destino || '';
  const nuevaMision = async () => {
    if (!window.confirm('¿Terminar esta misión y registrar una nueva? Se borran los datos de la misión actual en esta nave (lo ya enviado a la Tierra se conserva allá).')) return;
    try { await API.del('mision'); window.location.hash = ''; window.location.reload(); }
    catch (e) { if (N) N.toast('No se pudo: ' + e.message); }
  };
  return (
    <footer className="pie">
      <a href="#referencias" className="pie-ref">Referencias y fuentes</a>
      <span>{m.nombre} · {destino} · día {m.dia_actual} de {m.duracion}</span>
      <button type="button" className="pie-ref" onClick={nuevaMision}>Nueva misión</button>
    </footer>
  );
}
