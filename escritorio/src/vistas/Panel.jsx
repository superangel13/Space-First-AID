// Sección Panel
// Estructura transcrita de la versión web original (app/index.html).
import { GuiaDeSueno, ResumenTripulacion } from '../componentes/PanelResumen.jsx';

export default function Panel({ oculto, N }) {
  return (
    <>
    <section className={"page"} id={"v-panel"} hidden={oculto}>
      <div className={"card twin"}>
        <div className={"rowb"}>
          <div>
            <span className={"cap"}>
              {"Gemelo digital de la tripulación · en vivo"}
            </span>
            <h2 style={{"fontSize": "22px", "marginTop": "4px"}}>
              {"Toca a una persona para ver su estado"}
            </h2>
          </div>
          <div className={"cleg"}>
            <span>
              <i style={{"background": "#5FD3F3"}} />
              {"En rango"}
            </span>
            <span>
              <i style={{"background": "#F5B841"}} />
              {"Advertencia"}
            </span>
            <span>
              <i style={{"background": "#FF5468"}} />
              {"Alerta"}
            </span>
            <span id={"bioG"} className={"muted"} />
          </div>
        </div>
        <div className={"av3d"} id={"av3d"}>
          <div id={"l3"} />
          <span className={"hint"}>
            {"Arrastra para girar · toca a una persona"}
          </span>
        </div>
        <div className={"twin-sel"}>
          <div className={"bwho"}>
            <span className={"cap"} id={"bioCap"} />
            <h2 id={"bioName"} />
            <span className={"st"} id={"bioSt"} />
          </div>
          <div id={"bioV"} />
          <div className={"twin-act"}>
            <a className={"btn go sm"} href={"#valoracion"}>
              {"Registrar síntomas"}
            </a>
            <a className={"btn ghost sm"} href={"#tripulacion"}>
              {"Ver su detalle"}
            </a>
          </div>
        </div>
      </div>
      <ResumenTripulacion N={N} />
      <GuiaDeSueno N={N} />
      <div className={"card pad"}>
        <div className={"rowb"}>
          <h3>
            {"Misión · día "}
            <span id={"tlDay"} />
            {" de "}
            <span id={"tlLen"} />
          </h3>
          <a className={"btn ghost sm"} href={"#mision"}>
            {"Abrir la trayectoria →"}
          </a>
        </div>
        <div className={"mini-m"} style={{"marginTop": "12px"}}>
          <svg className={"msvg"} id={"miniSvg"} viewBox={"0 0 1400 330"} aria-label={"Posición de la nave"} />
          <div className={"mtiles"} id={"miniTiles"} style={{"gridTemplateColumns": "repeat(2,minmax(0,1fr))", "marginTop": "0"}} />
        </div>
        <div className={"rowb"} style={{"marginTop": "18px"}}>
          <span className={"cap"}>
            {"Revisiones de ojos del calendario de NASA en la ISS"}
          </span>
        </div>
        <div className={"tl"} id={"tl"} />
      </div>
      <div className={"card pad"} id={"medConsole"} hidden style={{"display": "grid", "gap": "14px"}}>
        <div className={"rowb"}>
          <div>
            <span className={"cap"}>
              {"Solo vista médico en Tierra"}
            </span>
            <h3 style={{"marginTop": "4px"}}>
              {"Consola de la tripulación · valores exactos"}
            </h3>
          </div>
          <button className={"btn ghost sm"} id={"csvBtn"} type={"button"}>
            {"Ver datos en CSV"}
          </button>
        </div>
        <div className={"tscroll"}>
          <table className={"tbl"} id={"medTbl"} />
        </div>
        <p className={"note"}>
          {"Entre paréntesis: cambio contra la mediana de los días 1 a 14 de cada persona. Color: más de 1 o 2 desviaciones de su propia variación (z)."}
        </p>
      </div>
      <p className={"note"}>
        {"Prototipo con datos de ejemplo. El índice de preparación es una fórmula de este prototipo (sueño 35 %, atención 35 %, corazón 30 %) que compara a cada persona con su propia línea base. Los círculos de cada tripulante están en Tripulación."}
      </p>
    </section>
    </>
  );
}
