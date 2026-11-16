// Registro inicial de la misión.
// Primero los datos generales (nombre, destino, duración, inicio y cuántos tripulantes).
// Al continuar se despliega una tarjeta por tripulante con su rol, datos y antecedentes
// médicos. Todo se guarda en SQLite a través del motor en Python.
import { useEffect, useRef, useState } from 'react';
import { API } from './api.js';
import { ANTECEDENTES, COLORES, ROLES } from './datos/antecedentes.js';

const tripulanteVacio = i => ({ nombre: '', rol: ROLES[i % ROLES.length], sexo: '', edad: '', condicion: 'media', antecedentes: [], notas: '' });

function TarjetaTripulante({ i, t, cambiar }) {
  const set = k => e => cambiar({ ...t, [k]: e.target.value });
  const marcar = k => e => cambiar({ ...t, antecedentes: e.target.checked ? [...t.antecedentes, k] : t.antecedentes.filter(x => x !== k) });
  return (
    <div className="card pad rc" style={{ '--pc': COLORES[i] }}>
      <div className="rowb"><span className="av" style={{ color: COLORES[i] }}>{(t.nombre || '?')[0]}</span><span className="cap">Tripulante {i + 1}</span></div>
      <label className="fl">Nombre<input maxLength={30} value={t.nombre} onChange={set('nombre')} placeholder="Nombre" /></label>
      <label className="fl">Rol<select value={t.rol} onChange={set('rol')}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></label>
      <div className="reg-row3">
        <label className="fl">Sexo<select value={t.sexo} onChange={set('sexo')}><option value="">—</option><option value="f">Mujer</option><option value="m">Hombre</option></select></label>
        <label className="fl">Edad<input type="number" min={20} max={80} value={t.edad} onChange={set('edad')} onBlur={e => { if (e.target.value !== '' && +e.target.value < 20) cambiar({ ...t, edad: '20' }); }} /></label>
        <label className="fl">Condición física<select value={t.condicion} onChange={set('condicion')}><option value="alta">Alta</option><option value="media">Media</option><option value="baja">Baja</option></select></label>
      </div>
      <div className="fl"><span>Antecedentes médicos</span>
        <div className="hxs">
          {ANTECEDENTES.map(([k, n]) => (
            <label className="hx" key={k}><input type="checkbox" checked={t.antecedentes.includes(k)} onChange={marcar(k)} /><span>{n}</span></label>
          ))}
        </div>
      </div>
      <label className="fl">Otros antecedentes o alergias<input maxLength={140} value={t.notas} onChange={set('notas')} placeholder="Opcional" /></label>
    </div>
  );
}

export default function Registro({ destinos }) {
  const [nombre, setNombre] = useState('');
  const [destino, setDestino] = useState(destinos[0].id);
  const [duracion, setDuracion] = useState(destinos[0].duracion_defecto);
  const [inicio, setInicio] = useState(new Date().toISOString().slice(0, 10));
  const [n, setN] = useState(4);
  const [trip, setTrip] = useState(() => Array.from({ length: 6 }, (_, i) => tripulanteVacio(i)));
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const refTripulacion = useRef(null);
  const d = destinos.find(x => x.id === destino);

  useEffect(() => { if (paso === 2 && refTripulacion.current) refTripulacion.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, [paso]);

  const verDemo = async () => {
    setEnviando(true);
    try { await API.post('mision/demo'); window.location.reload(); }
    catch (e) { setError(e.message); setEnviando(false); }
  };
  const iniciar = async () => {
    setError('');
    const lista = trip.slice(0, n).map((t, i) => ({ ...t, nombre: t.nombre.trim(), edad: t.edad ? +t.edad : null, color: COLORES[i] }));
    if (!nombre.trim()) return setError('Escribe el nombre de la misión.');
    const falta = lista.findIndex(t => !t.nombre);
    if (falta >= 0) return setError(`Falta el nombre del tripulante ${falta + 1}.`);
    if (!(duracion >= 1)) return setError('La duración debe ser de al menos 1 día.');
    const menor = lista.findIndex(t => t.edad != null && t.edad < 20);
    if (menor >= 0) return setError(`La edad del tripulante ${menor + 1} no puede ser menor a 20 años.`);
    setEnviando(true);
    try {
      await API.post('mision', { nombre: nombre.trim(), destino, duracion, fecha_inicio: inicio, tripulantes: lista });
      window.location.reload();
    } catch (e) { setError(e.message); setEnviando(false); }
    return undefined;
  };

  return (
    <div id="registro" className="reg">
      <div className="reg-in">
        <div className="reg-top">
          <svg width="38" height="38" viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <circle cx="100" cy="100" r="70" stroke="#F2F5F8" strokeWidth="15" strokeDasharray="360 80" strokeLinecap="round" />
            <path d="M22 112H70l10-8 10 8h8l6 10 20-92 10 102 8-20h36" stroke="#34E39A" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <b>SPACE FIRST <span>AID</span></b>
        </div>
        <span className="cap">Antes de despegar</span>
        <h1>Registro de la misión</h1>
        <p className="muted">Registra el destino, la duración y a cada tripulante con sus antecedentes médicos. De este registro dependen las vigilancias, los umbrales y la trayectoria.</p>
        <div className="reg-demo card pad">
          <div><b>¿Solo quieres verla funcionar?</b><p className="muted small">Carga una misión ficticia: Luna ida y vuelta, 180 días, con Grover, Payán, Valentina y Camilia (datos inventados).</p></div>
          <button className="btn go" type="button" onClick={verDemo} disabled={enviando}>Ver misión demo</button>
        </div>

        <section className="card pad reg-sec">
          <div className="rowb"><h2>1 · Datos de la misión</h2><span className="cap">{paso === 1 ? 'Paso 1 de 2' : 'Listo'}</span></div>
          <label className="fl">Nombre de la misión<input maxLength={60} placeholder="Ej. Artemis Space Apps" value={nombre} onChange={e => setNombre(e.target.value)} /></label>
          <div className="fl"><span>Destino</span>
            <div className="reg-dest">
              {destinos.map(x => (
                <button type="button" className="dopt" key={x.id} aria-pressed={x.id === destino} onClick={() => { setDestino(x.id); setDuracion(x.duracion_defecto); }}>
                  <b>{x.nombre}</b><span>{x.descripcion}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="reg-row">
            <div className="fl"><span>Duración</span>
              <div className="seg">
                {d.duraciones.map(v => <button type="button" key={v} aria-pressed={+duracion === v} onClick={() => setDuracion(v)}>{v} días</button>)}
              </div>
              <input id="rDurN" type="number" min={1} max={1000} value={duracion} onChange={e => setDuracion(+e.target.value)} aria-label="Duración en días" />
            </div>
            <label className="fl">Fecha de inicio (día 1)<input type="date" value={inicio} onChange={e => setInicio(e.target.value)} /></label>
            <div className="fl"><span>Tripulantes</span>
              <div className="stepper">
                <button type="button" aria-label="Uno menos" onClick={() => setN(Math.max(1, n - 1))}>−</button>
                <b>{n}</b>
                <button type="button" aria-label="Uno más" onClick={() => setN(Math.min(6, n + 1))}>+</button>
              </div>
            </div>
          </div>
          {paso === 1 && <button className="btn go" type="button" onClick={() => setPaso(2)}>Continuar: registrar a la tripulación</button>}
        </section>

        {paso >= 2 && (
          <section className="reg-sec" ref={refTripulacion}>
            <div className="rowb"><h2>2 · Tripulación</h2><span className="cap">{n} {n === 1 ? 'persona' : 'personas'}</span></div>
            <div className="reg-crew">
              {trip.slice(0, n).map((t, i) => (
                <TarjetaTripulante key={i} i={i} t={t} cambiar={nuevo => setTrip(trip.map((x, j) => (j === i ? nuevo : x)))} />
              ))}
            </div>
            <p className="note">Los antecedentes activan vigilancias según lo que NASA aprueba con seguimiento (por ejemplo, cálculos renales: hidratación y prueba de orina periódica).</p>
            <div className="reg-fin">
              <span className="reg-err" role="alert">{error}</span>
              <button className="btn go" type="button" onClick={iniciar} disabled={enviando}>Iniciar misión</button>
            </div>
          </section>
        )}
        {paso === 1 && error && <span className="reg-err" role="alert">{error}</span>}
      </div>
    </div>
  );
}
