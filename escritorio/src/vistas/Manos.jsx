// Sección Manos
// Estructura transcrita de la versión web original (app/index.html).
export default function Manos({ oculto }) {
  return (
    <>
    <section className={"page"} id={"v-manos"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"} id={"mnCap"} />
          <h1 id={"mnTitle"} />
          <p id={"mnDesc"} />
        </div>
        <div className={"pick"} data-pick="" />
      </div>
      <div className={"mngrid"}>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
          <div className={"mnbar"}>
            <div className={"seg"} id={"mnModo"} role={"group"} aria-label={"Cómo se controla"}>
              <button type={"button"} data-m={"puntero"}>
                {"Ratón o dedo"}
              </button>
              <button type={"button"} data-m={"camara"}>
                {"Cámara (mano)"}
              </button>
            </div>
            <div className={"seg"} id={"mnOjo"} role={"group"} aria-label={"Ojo"} hidden>
              <button type={"button"} data-o={"OI"}>
                {"Ojo izquierdo"}
              </button>
              <button type={"button"} data-o={"OD"}>
                {"Ojo derecho"}
              </button>
            </div>
            <button className={"btn go sm"} id={"mnGo"} type={"button"}>
              {"Iniciar"}
            </button>
          </div>
          <div className={"mnstage"} id={"mnStage"}>
            <video id={"mnVideo"} playsInline muted hidden />
            <canvas id={"mnCanvas"} width={"720"} height={"480"} />
          </div>
          <div className={"dirs"} id={"mnDirs"} hidden>
            <button type={"button"} data-d={"3"} aria-label={"Arriba"}>
              {"↑"}
            </button>
            <button type={"button"} data-d={"2"} aria-label={"Izquierda"}>
              {"←"}
            </button>
            <button type={"button"} data-d={"0"} aria-label={"Derecha"}>
              {"→"}
            </button>
            <button type={"button"} data-d={"1"} aria-label={"Abajo"}>
              {"↓"}
            </button>
          </div>
          <div className={"row"} id={"mnCtl"} hidden />
          <p className={"small muted"} id={"mnStatus"} />
        </div>
        <div style={{"display": "grid", "gap": "18px", "alignContent": "start"}}>
          <div className={"card pad"} style={{"display": "grid", "gap": "10px"}}>
            <div className={"rowb"}>
              <h3>
                {"Resultado"}
              </h3>
              <span className={"cap"}>
                {"Interpretado por Python"}
              </span>
            </div>
            <div id={"mnRes"} className={"small muted"}>
              {"Completa la prueba para ver tu puntaje contra tu línea base (tus primeras 3 sesiones)."}
            </div>
          </div>
          <div className={"card pad"} style={{"display": "grid", "gap": "10px"}}>
            <h3>
              {"Cómo se califica"}
            </h3>
            <div id={"mnScore"} className={"small"} />
          </div>
          <div className={"card pad"} style={{"display": "grid", "gap": "10px"}}>
            <div className={"rowb"}>
              <h3>
                {"Historial"}
              </h3>
              <span className={"cap"} id={"mnHistN"} />
            </div>
            <div id={"mnHist"} className={"alog"} />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
