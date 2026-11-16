// Space First AID · aplicación (React)
// 1) Animación de entrada.
// 2) Pregunta al motor de la nave (Python) si hay una misión registrada:
//    - si no hay, muestra el registro inicial (o la misión demo);
//    - si hay, carga parámetros y estado y abre directo el Panel.
// 3) Las secciones se conectan como páginas: #panel, #tripulacion, #tripulacion/<persona>,
//    #valoracion, #animo, #orbita, #alcance, #trazo, #letra_c, #alertas, #mision, #referencias.
import { useEffect, useState } from 'react';
import { API } from './api.js';
import { useEvento, useLatido } from './bus.js';
import Registro from './Registro.jsx';
import Intro from './estructura/Intro.jsx';
import Encabezado from './estructura/Encabezado.jsx';
import { AlertaGrande, BarraAlerta } from './componentes/AlertasFlotantes.jsx';
import SelectorLateral from './componentes/SelectorLateral.jsx';
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

const SECCION_DE = {
  panel: 'panel', tripulacion: 'tripulacion', valoracion: 'valoracion', animo: 'mente', orbita: 'orbita',
  alcance: 'manos', trazo: 'manos', letra_c: 'manos', alertas: 'alertas', mision: 'mision', referencias: 'referencias',
};
const ALIAS = { persona: 'tripulacion', sintomas: 'valoracion', mente: 'animo', vision: 'letra_c', evidencia: 'referencias', detalle: 'tripulacion', midia: 'panel', amsler: 'letra_c' };
const ES_PRUEBA = id => PRUEBAS.some(([p]) => p === id);

/** Lee la ruta: { ruta: 'tripulacion', persona: 'grover' | null } */
function leerRuta() {
  let [v, persona] = window.location.hash.slice(1).split('/');
  v = ALIAS[v] || v;
  if (v === 'pruebas') {
    const ultima = window.ESTADO && window.ESTADO.state && window.ESTADO.state.ultPrueba;
    v = ES_PRUEBA(ultima) ? ultima : 'animo';
    window.history.replaceState(null, '', '#' + v);
  }
  return { ruta: SECCION_DE[v] ? v : 'panel', persona: v === 'tripulacion' && persona ? decodeURIComponent(persona) : null };
}

function useRuta() {
  const [r, setR] = useState(leerRuta);
  useEffect(() => {
    const alCambiar = () => { if (window.location.hash !== '#mas') setR(leerRuta()); };
    window.addEventListener('hashchange', alCambiar);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, []);
  return r;
}

/** En vista «Médico en Tierra», sin señal no llegan datos nuevos: se avisa y se manda a la bitácora del enlace. */
function AvisoMedicoSinSenal({ N, abrirBitacora }) {
  useLatido();
  const [visto, setVisto] = useState(false);
  const sinSenal = !!N && N.S.role === 'med' && !N.S.online && !N.LINK.primera;
  useEffect(() => {
    if (sinSenal && !visto) { setVisto(true); abrirBitacora(); }
    if (!sinSenal) setVisto(false);
  }, [sinSenal]);   // eslint-disable-line react-hooks/exhaustive-deps
  if (!sinSenal) return null;
  return (
    <div className="medoff" role="status">
      <div className="wrap">
        <b>Sin conexión con la nave</b>
        <span>La vista del médico no recibe datos nuevos. La nave los sigue guardando en la bitácora y los manda cuando vuelva la señal ({N.LINK.pendientes || 0} en espera).</span>
        <button className="btn sm" type="button" onClick={abrirBitacora}>Ver la bitácora</button>
      </div>
    </div>
  );
}

function Aplicacion() {
  const { ruta, persona } = useRuta();
  const [N, setN] = useState(null);
  const [enlace, setEnlace] = useState(false);
  const seccion = SECCION_DE[ruta];
  const grupo = ES_PRUEBA(ruta) ? 'pruebas' : ruta;

  useEffect(() => { import('virtual:nucleo').then(setN); }, []);
  // Al abrir la página de una persona, esa persona queda seleccionada.
  useEffect(() => {
    if (!N) return;
    if (persona && N.CREW.some(c => c.id === persona) && N.S.sel !== persona) { N.S.sel = persona; N.save(); }
    N.alCambiarRuta(ruta);
  }, [N, ruta, persona]);
  useEvento('escape', () => setEnlace(false));

  const lateral = seccion !== 'panel' && !(seccion === 'tripulacion' && !persona) && seccion !== 'referencias' && seccion !== 'mision';
  const alCambiarPersona = id => { if (seccion === 'tripulacion') window.location.hash = 'tripulacion/' + id; };

  return (
    <>
      <Encabezado N={N} grupo={grupo} abrirEnlace={() => setEnlace(true)} />
      <BarraAlerta N={N} ruta={ruta} />
      <AvisoMedicoSinSenal N={N} abrirBitacora={() => setEnlace(true)} />
      <main className={'wrap' + (lateral ? ' con-lateral' : '')}>
        <SelectorLateral N={N} visible={lateral} alCambiar={alCambiarPersona} />
        <div className="contenido">
          <Subnav ruta={ruta} />
          <Panel oculto={seccion !== 'panel'} N={N} />
          <Tripulacion oculto={seccion !== 'tripulacion'} N={N} persona={persona} />
          <Orbita oculto={seccion !== 'orbita'} />
          <Manos oculto={seccion !== 'manos'} />
          <Valoracion oculto={seccion !== 'valoracion'} N={N} />
          <Mente oculto={seccion !== 'mente'} />
          <Alertas oculto={seccion !== 'alertas'} />
          <Mision oculto={seccion !== 'mision'} />
          <MiDia oculto />
          <Referencias oculto={seccion !== 'referencias'} />
          <Pie N={N} />
        </div>
      </main>
      <PanelEnlace N={N} abierto={enlace} cerrar={() => setEnlace(false)} />
      <NavInferior grupo={grupo} />
      <Capas />
      <AlertaGrande N={N} />
    </>
  );
}

export default function App() {
  const [fase, setFase] = useState('cargando');   // cargando | sin-motor | registro | app
  const [introLista, setIntroLista] = useState(false);
  const [destinos, setDestinos] = useState([]);

  useEffect(() => {
    (async () => {
      let m;
      try {
        [m, window.PROB, window.ACC] = await Promise.all([API.get('mision'), fetch('/datos/problemas.json').then(r => r.json()), fetch('/datos/accidentes.json').then(r => r.json())]);
      } catch (e) { setFase('sin-motor'); return; }
      if (!m.mision) { setDestinos(m.destinos); setFase('registro'); return; }
      try {
        const [estado, umbrales, muestras] = await Promise.all([
          API.get('estado'), fetch('/datos/umbrales.json').then(r => r.json()), fetch('/datos/muestras.json').then(r => r.json()),
        ]);
        Object.assign(window, { MISION: m.mision, TRIP: m.tripulantes, DESTINOS: m.destinos, ESTADO: estado || {}, UMB: umbrales, PMU: muestras });
        setFase('app');
      } catch (e) { setFase('sin-motor'); }
    })();
  }, []);

  let pantalla = null;
  if (fase === 'sin-motor') {
    pantalla = (
      <div className="sinsrv">
        <h1>No hay conexión con el motor de la nave</h1>
        <p>El motor en Python no responde. Cierra el programa y vuelve a abrirlo.</p>
        <button className="btn go" type="button" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  } else if (fase === 'registro' && introLista) pantalla = <Registro destinos={destinos} />;
  else if (fase === 'app' && introLista) pantalla = <Aplicacion />;
  return (
    <>
      <Intro alTerminar={() => setIntroLista(true)} />
      {pantalla}
    </>
  );
}
