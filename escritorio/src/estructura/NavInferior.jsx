// Navegación inferior (pantallas chicas) y hoja «Más».
import { useState } from 'react';

const Icono = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">{children}</svg>
);
const PRINCIPALES = [
  ['panel', 'Panel', <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" /></>],
  ['tripulacion', 'Tripulación', <><circle cx="8" cy="9" r="3.2" /><circle cx="16.5" cy="9" r="3.2" /><path d="M2.5 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5M11 19c.8-3 3-4.5 5.5-4.5s4.7 1.5 5.5 4.5" /></>],
  ['valoracion', 'Valoración', <><path d="M9 3h6v4H9zM7 5H5v16h14V5h-2" /><path d="M9 13h6M12 10v6" /></>],
  ['pruebas', 'Pruebas', <><ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-25 12 12)" /><circle cx="12" cy="12" r="2.6" /></>],
];
const MAS = [
  ['mision', 'Misión', <><circle cx="5" cy="17" r="3" /><circle cx="19" cy="6" r="2.2" /><path d="M8 15c4-1 7-4 9-7" strokeDasharray="2 2.5" /></>],
  ['alertas', 'Alertas', <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6zM10 19a2 2 0 0 0 4 0" />],
  ['referencias', 'Referencias', <><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h7M9 8h3" /></>],
];

export default function NavInferior({ grupo }) {
  const [hoja, setHoja] = useState(false);
  const enMas = MAS.some(([id]) => id === grupo);
  return (
    <>
      <nav className="bottom" aria-label="Secciones">
        {PRINCIPALES.map(([id, nombre, icono]) => (
          <a key={id} href={'#' + id} aria-current={grupo === id ? 'page' : 'false'}><Icono>{icono}</Icono>{nombre}</a>
        ))}
        <a href="#mas" id="moreBtn" aria-current={enMas ? 'page' : 'false'} onClick={e => { e.preventDefault(); setHoja(true); }}>
          <Icono><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></Icono>Más
        </a>
      </nav>
      <div className="sheet" id="sheet" hidden={!hoja} onClick={() => setHoja(false)}>
        <div className="sh">
          {MAS.map(([id, nombre, icono]) => (
            <a key={id} href={'#' + id} aria-current={grupo === id ? 'page' : 'false'}><Icono>{icono}</Icono>{nombre}</a>
          ))}
        </div>
      </div>
    </>
  );
}
