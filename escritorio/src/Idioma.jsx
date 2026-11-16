// Idioma de la app (español / English).
// La traducción la hace app/i18n/traductor.js sobre toda la pantalla; aquí están:
//  - la pantalla para elegir idioma la primera vez que se abre la app;
//  - el botón ES | EN para cambiarlo en cualquier momento.
import { useEffect, useState } from 'react';

const I18N = () => window.SFA_I18N;

export function useIdioma() {
  const [id, setId] = useState(() => (I18N() ? I18N().idioma() : 'es'));
  useEffect(() => {
    const alCambiar = e => setId(e.detail);
    window.addEventListener('sfa-idioma', alCambiar);
    return () => window.removeEventListener('sfa-idioma', alCambiar);
  }, []);
  return id;
}

export const idiomaElegido = () => !!(I18N() && I18N().elegido());
export const ponerIdioma = id => { if (I18N()) I18N().poner(id); };

/** Botón para cambiar de idioma (encabezado y registro). */
export function SelectorIdioma({ className = '' }) {
  const id = useIdioma();
  return (
    <div className={'role idioma ' + className} role="group" aria-label="Idioma · Language" data-no-traducir>
      <button type="button" aria-pressed={id === 'es'} title="Español" onClick={() => ponerIdioma('es')}>ES</button>
      <button type="button" aria-pressed={id === 'en'} title="English" onClick={() => ponerIdioma('en')}>EN</button>
    </div>
  );
}

/** Pantalla de inicio: se elige el idioma una vez; después se cambia con el botón ES | EN. */
export function ElegirIdioma({ alElegir }) {
  const elegir = id => { ponerIdioma(id); alElegir(id); };
  return (
    <div className="idioma-pantalla" data-no-traducir>
      <div className="idioma-caja">
        <svg className="mark" width="64" height="64" viewBox="0 0 200 200" fill="none" aria-hidden="true">
          <circle cx="100" cy="100" r="78" stroke="#F2F5F8" strokeWidth="15" />
          <path d="M 22 112 L 70 112 C 74 112 76 104 80 104 C 84 104 86 112 90 112 L 98 112 L 104 122 L 124 30 L 134 132 L 140 112 L 150 112 C 156 112 158 102 164 102 C 170 102 172 112 178 112" stroke="#34E39A" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1>Elige tu idioma</h1>
        <p className="muted">Choose your language</p>
        <div className="idioma-botones">
          <button type="button" className="btn go" onClick={() => elegir('es')} autoFocus>
            <b>Español</b><span>Toda la plataforma en español</span>
          </button>
          <button type="button" className="btn go" onClick={() => elegir('en')}>
            <b>English</b><span>The whole platform in English</span>
          </button>
        </div>
        <p className="small muted">Puedes cambiarlo cuando quieras con el botón ES | EN · You can change it anytime with the ES | EN button</p>
      </div>
    </div>
  );
}
