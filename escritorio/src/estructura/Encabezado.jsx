// Encabezado: marca, secciones, conexión con la Tierra, vista (tripulante o médico) y sirena de alertas.
import { useCallback, useEffect, useState } from 'react';
import { useEvento, useLatido } from '../bus.js';
import { SelectorIdioma } from '../Idioma.jsx';

export const SECCIONES = [
  ['panel', 'Panel'], ['tripulacion', 'Tripulación'], ['valoracion', 'Valoración'],
  ['pruebas', 'Pruebas'], ['mision', 'Misión'],
];

/** Sirena: gira 0.6 s con un aviso y 1.5 s con una emergencia (se repite mientras no se atienda). */
function Sirena({ N }) {
  const [anim, setAnim] = useState(null);
  useEvento('sirena', useCallback(nivel => setAnim({ nivel, k: Date.now() }), []));
  useEffect(() => {
    if (!anim) return undefined;
    const t = setTimeout(() => setAnim(null), anim.nivel >= 2 ? 1500 : 600);
    return () => clearTimeout(t);
  }, [anim]);
  const activas = N ? N.AL.list : [];
  const criticas = activas.filter(a => a.lvl >= 2);
  const clase = ['sirena', activas.length && 'hay', criticas.length && 'critica', anim && (anim.nivel >= 2 ? 'emerg' : 'gira')].filter(Boolean).join(' ');
  const etiqueta = activas.length
    ? `Alertas: ${activas.length} activas${criticas.length ? `, ${criticas.length} críticas` : ''}`
    : 'Alertas: sin alertas activas';
  return (
    <button className={clase} id="sirena" type="button" aria-label={etiqueta} title="Centro de alertas" onClick={() => { window.location.hash = 'alertas'; }}>
      <span key={anim ? anim.k : 'quieta'} style={{ display: 'contents' }}>
        <span className="sir-luz" />
        <svg className="sir-ic" viewBox="0 0 48 48" aria-hidden="true">
          <path className="sir-base" d="M8 40h32v4H8z" />
          <path className="sir-domo" d="M13 40V25a11 11 0 0 1 22 0v15z" />
          <path className="sir-brillo" d="M18 27a6 6 0 0 1 5-6" fill="none" strokeWidth="3" strokeLinecap="round" />
          <g className="sir-rayos" strokeWidth="3" strokeLinecap="round"><path d="M24 4v5M9 10l3.5 3.5M39 10l-3.5 3.5M3 23h5M40 23h5" /></g>
        </svg>
      </span>
      {activas.length > 0 && <span className={'bdg' + (criticas.length ? '' : ' w')}>{activas.length}</span>}
    </button>
  );
}

export default function Encabezado({ N, grupo, abrirEnlace }) {
  useLatido();
  const enLinea = !!(N && N.S.online);
  const pendientes = N ? (N.LINK.pendientes || 0) : 0;
  const rol = N ? N.S.role : 'crew';
  const cambiarRol = r => {
    if (!N || N.S.role === r) return;
    N.S.role = r; N.save(); N.render();
    N.toast(r === 'med' ? 'Vista médico en Tierra: valores exactos y línea base' : 'Vista tripulante: lo esencial y qué hacer');
  };
  return (
    <header className="top">
      <div className="wrap hd">
        <a className="brand" href="#panel" aria-label="Space First AID, inicio">
          <svg className="mark" width="34" height="34" viewBox="0 0 200 200" fill="none" aria-hidden="true">
            <path id="mkRing" stroke="#F2F5F8" strokeWidth="15" strokeLinecap="round" />
            <path className="pl" d="M 22 112 L 70 112 C 74 112 76 104 80 104 C 84 104 86 112 90 112 L 98 112 L 104 122 L 124 30 L 134 132 L 140 112 L 150 112 C 156 112 158 102 164 102 C 170 102 172 112 178 112" stroke="#34E39A" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
            <circle id="mkSat" r="10" fill="#34E39A" />
          </svg>
          <b>SPACE FIRST <span>AID</span></b>
        </a>
        <nav className="tabs" aria-label="Secciones">
          {SECCIONES.map(([id, nombre]) => (
            <a key={id} href={'#' + id} aria-current={grupo === id ? 'page' : 'false'}>{nombre}</a>
          ))}
        </nav>
        <div className="hright">
          <span className="met" id="met" />
          <button className="chip" id="linkChip" type="button" title="Estado del enlace con la Tierra" onClick={abrirEnlace}>
            <span className={'dot' + (enLinea ? '' : ' w')} />
            <span id="linkTxt">{enLinea ? (pendientes ? `Enviando · ${pendientes}` : 'Con señal') : `Sin señal · ${pendientes} en cola`}</span>
          </button>
          <div className="role" role="group" aria-label="Vista">
            <button type="button" aria-pressed={rol === 'crew'} onClick={() => cambiarRol('crew')}><span className="l">Tripulante</span><span className="s">Tripulante</span></button>
            <button type="button" aria-pressed={rol === 'med'} onClick={() => cambiarRol('med')}><span className="l">Médico en Tierra</span><span className="s">Médico</span></button>
          </div>
          <SelectorIdioma />
          <Sirena N={N} />
        </div>
      </div>
    </header>
  );
}
