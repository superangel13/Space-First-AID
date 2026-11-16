// Space First AID · aplicación de escritorio (React)
// 1) Pregunta al motor de la nave (Python) si hay una misión registrada.
// 2) Si no hay, muestra el registro inicial (o la misión demo).
// 3) Si hay, carga parámetros y estado, monta las secciones y arranca el núcleo.
import { useEffect, useState } from 'react';
import { API } from './api.js';
import { SFA, useEvento } from './bus.js';
import Registro from './Registro.jsx';
import Intro from './estructura/Intro.jsx';
import Encabezado from './estructura/Encabezado.jsx';
import BarraAlerta from './estructura/BarraAlerta.jsx';
import Subnav, { PRUEBAS } from './estructura/Subnav.jsx';
import Pie from './estructura/Pie.jsx';
import PanelEnlace from './estructura/PanelEnlace.jsx';
import NavInferior from './estructura/NavInferior.jsx';
import Capas from './estructura/Capas.jsx';
import Panel from './vistas/Panel.jsx';
import Tripulacion from './vistas/Tripulacion.jsx';
import Valoracion from './vistas/Valoracion.jsx';
import Mente from './vistas/Mente.jsx';
import Orbita from './vistas/Orbita.jsx';
import Manos from './vistas/Manos.jsx';
import Alertas from './vistas/Alertas.jsx';
import Mision from './vistas/Mision.jsx';
import MiDia from './vistas/MiDia.jsx';
import Referencias from './vistas/Referencias.jsx';

// Cada ruta (#panel, #orbita…) y la sección que muestra.
const SECCION_DE = {
  panel: 'panel', tripulacion: 'tripulacion', valoracion: 'valoracion', animo: 'mente', orbita: 'orbita',
  alcance: 'manos', trazo: 'manos', letra_c: 'manos', amsler: 'manos',
  alertas: 'alertas', mision: 'mision', midia: 'midia', referencias: 'referencias',
};
const ALIAS = { persona: 'tripulacion', sintomas: 'valoracion', mente: 'animo', vision: 'letra_c', evidencia: 'referencias', detalle: 'tripulacion' };
const ES_PRUEBA = id => PRUEBAS.some(([p]) => p === id);

function leerRuta() {
  let v = window.location.hash.slice(1);
  v = ALIAS[v] || v;
  if (v === 'pruebas') {
    const ultima = window.ESTADO && window.ESTADO.state && window.ESTADO.state.ultPrueba;
    v = ES_PRUEBA(ultima) ? ultima : 'animo';
    window.history.replaceState(null, '', '#' + v);
  }
  return SECCION_DE[v] ? v : 'panel';
}

function useRuta() {
  const [ruta, setRuta] = useState(leerRuta);
  useEffect(() => {
    const alCambiar = () => { if (window.location.hash !== '#mas') setRuta(leerRuta()); };
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  return ruta;
}

function Aplicacion() {
  const ruta = useRuta();
  const [N, setN] = useState(null);           // el núcleo, cuando termina de cargar
  const [enlace, setEnlace] = useState(false);
  const seccion = SECCION_DE[ruta];
  const grupo = ES_PRUEBA(ruta) ? 'pruebas' : ruta;

  // El núcleo se carga cuando la estructura ya está en pantalla (usa sus lienzos y contenedores).
  useEffect(() => { import('virtual:nucleo').then(setN); }, []);
  useEffect(() => { if (N) N.alCambiarRuta(ruta); }, [N, ruta]);
  useEvento('escape', () => setEnlace(false));

  return (
    <>
      <Intro />
      <Encabezado N={N} grupo={grupo} abrirEnlace={() => setEnlace(true)} />
      <BarraAlerta />
      <main className="wrap">
        <Subnav ruta={ruta} />
        <Panel oculto={seccion !== 'panel'} />
        <Tripulacion oculto={seccion !== 'tripulacion'} />
        <Orbita oculto={seccion !== 'orbita'} />
        <Manos oculto={seccion !== 'manos'} />
        <Valoracion oculto={seccion !== 'valoracion'} />
        <Mente oculto={seccion !== 'mente'} />
        <Alertas oculto={seccion !== 'alertas'} />
        <Mision oculto={seccion !== 'mision'} />
        <MiDia oculto={seccion !== 'midia'} />
        <Referencias oculto={seccion !== 'referencias'} />
        <Pie N={N} />
      </main>
      <PanelEnlace N={N} abierto={enlace} cerrar={() => setEnlace(false)} />
      <NavInferior grupo={grupo} />
      <Capas />
    </>
  );
}

export default function App() {
  const [fase, setFase] = useState('cargando');   // cargando | sin-motor | registro | app
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    (async () => {
      let m;
      try { m = await API.get('mision'); } catch (e) { setFase('sin-motor'); return; }
      if (!m.mision) { setDestinos(m.destinos); setFase('registro'); return; }
      try {
        const [estado, umbrales, muestras] = await Promise.all([
          API.get('estado'),
          fetch('/datos/umbrales.json').then(r => r.json()),
          fetch('/datos/muestras.json').then(r => r.json()),
        ]);
        Object.assign(window, { MISION: m.mision, TRIP: m.tripulantes, DESTINOS: m.destinos, ESTADO: estado || {}, UMB: umbrales, PMU: muestras });
        setFase('app');
      } catch (e) { setFase('sin-motor'); }
    })();
  }, []);

  if (fase === 'cargando') return <div className="sinsrv"><p>Conectando con el motor de la nave…</p></div>;
  if (fase === 'sin-motor') {
    return (
      <div className="sinsrv">
        <h1>No hay conexión con el motor de la nave</h1>
        <p>El motor en Python no responde. Cierra el programa y vuelve a abrirlo.</p>
        <button className="btn go" type="button" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }
  if (fase === 'registro') return <Registro destinos={destinos} />;
  return <Aplicacion />;
}

export { SFA };
