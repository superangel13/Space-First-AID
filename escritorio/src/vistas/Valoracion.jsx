// Sección Valoracion
// Estructura transcrita de la versión web original (app/index.html).
export default function Valoracion({ oculto }) {
  return (
    <>
    <section className={"page"} id={"v-valoracion"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"}>
            {"Síntomas y muestras · se procesa en Python"}
          </span>
          <h1>
            {"Valoración"}
          </h1>
          <p>
            {"Registra cómo te sientes tocando el cuerpo y captura los resultados de orina, sangre y saliva. Todo se cruza en el motor clínico de la nave."}
          </p>
        </div>
        <div className={"pick"} data-pick="" />
      </div>
      <div className={"sgrid"}>
        <div className={"card pad bm"} style={{"display": "grid", "gap": "10px"}}>
          <div className={"rowb"}>
            <h3>
              {"Toca la zona"}
            </h3>
            <div className={"seg"} id={"bmSide"}>
              <button type={"button"} data-s={"f"} aria-pressed={"true"}>
                {"Frente"}
              </button>
              <button type={"button"} data-s={"b"} aria-pressed={"false"}>
                {"Espalda"}
              </button>
            </div>
          </div>
          <svg id={"bmSvg"} viewBox={"0 0 200 420"} aria-label={"Mapa del cuerpo"} />
          <button className={"btn ghost sm"} id={"bmGen"} type={"button"}>
            {"Síntomas generales, sueño y ánimo"}
          </button>
        </div>
        <div style={{"display": "grid", "gap": "14px", "alignContent": "start"}}>
          <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
            <div className={"rowb"}>
              <h3 id={"sxZone"}>
                {"Elige una zona"}
              </h3>
              <span className={"cap"}>
                {"Toca lo que sientes"}
              </span>
            </div>
            <div className={"sxc"} id={"sxChips"} />
          </div>
          <div className={"card pad"} style={{"display": "grid", "gap": "10px"}}>
            <div className={"rowb"}>
              <h3>
                {"Tu registro"}
              </h3>
              <span className={"cap"} id={"sxN"} />
            </div>
            <div id={"sxList"} style={{"display": "grid", "gap": "8px"}} />
            <div id={"sxQ"} style={{"display": "grid", "gap": "8px"}} />
            <div style={{"display": "flex", "gap": "8px", "flexWrap": "wrap"}}>
              <button className={"btn go"} id={"sxSend"} type={"button"}>
                {"Guardar y evaluar"}
              </button>
              <button className={"btn ghost sm"} id={"sxClear"} type={"button"}>
                {"Borrar todo"}
              </button>
            </div>
          </div>
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "10px", "alignContent": "start"}}>
          <div className={"rowb"}>
            <h3>
              {"Lo que el sistema ve"}
            </h3>
            <span className={"cap"}>
              {"Resumen"}
            </span>
          </div>
          <div id={"dxMini"} style={{"display": "grid", "gap": "8px"}} />
          <a className={"btn ghost sm"} href={"#tripulacion"} style={{"justifySelf": "start"}}>
            {"Ver avisos completos"}
          </a>
        </div>
      </div>
      <div className={"card pad mu"} id={"muestras"}>
        <div className={"rowb"}>
          <div>
            <span className={"cap"}>
              {"Laboratorio"}
            </span>
            <h2 style={{"fontSize": "22px", "marginTop": "4px"}}>
              {"Muestras de orina, sangre y saliva"}
            </h2>
          </div>
          <div className={"seg"} id={"muTipo"} role={"group"} aria-label={"Tipo de muestra"} />
        </div>
        <p className={"muted small"} id={"muInfo"} />
        <div className={"mugrid"}>
          <form className={"muform"} id={"muForm"} autoComplete={"off"} />
          <div style={{"display": "grid", "gap": "12px", "alignContent": "start"}}>
            <h3>
              {"Resultados vigentes"}
            </h3>
            <div id={"muVig"} style={{"display": "grid", "gap": "10px"}} />
          </div>
        </div>
      </div>
      <div className={"card pad"} style={{"display": "grid", "gap": "10px"}}>
        <h3>
          {"Historial de registros"}
        </h3>
        <div className={"alog"} id={"sxHist"} />
      </div>
    </section>
    </>
  );
}
