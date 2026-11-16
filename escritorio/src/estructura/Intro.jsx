// Video de entrada con el logo. Se ve al abrir la app (antes del registro o del panel);
// al terminar, o con «Saltar intro», llama a `alTerminar`.
import { useEffect, useRef, useState } from 'react';

export default function Intro({ alTerminar }) {
  const video = useRef(null);
  const [saliendo, setSaliendo] = useState(false);
  const [oculto, setOculto] = useState(() => {
    let vista = false;
    try { vista = sessionStorage.getItem('sfa.intro') === '1'; } catch (e) { /* sin almacenamiento */ }
    return vista || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const terminado = useRef(false);

  const terminar = () => {
    if (terminado.current) return;
    terminado.current = true;
    try { sessionStorage.setItem('sfa.intro', '1'); } catch (e) { /* sin almacenamiento */ }
    setSaliendo(true);
    setTimeout(() => { setOculto(true); try { video.current.pause(); } catch (e) { /* ya estaba en pausa */ } if (alTerminar) alTerminar(); }, 750);
  };

  useEffect(() => {
    if (oculto) { terminado.current = true; if (alTerminar) alTerminar(); return undefined; }
    const v = video.current;
    const p = v.play();
    if (p && p.catch) p.catch(terminar);
    const t = setTimeout(terminar, 7200);
    return () => clearTimeout(t);
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  if (oculto) return null;
  return (
    <div id="intro" className={saliendo ? 'out' : ''} aria-hidden="true" onClick={terminar}>
      <video id="introV" ref={video} src="media/logo-reveal.mp4" muted playsInline preload="auto" onEnded={() => setTimeout(terminar, 200)} onError={terminar} />
      <button type="button" id="skip" onClick={terminar}>Saltar intro</button>
    </div>
  );
}
