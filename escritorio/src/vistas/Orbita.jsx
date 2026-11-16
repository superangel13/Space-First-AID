// Sección Orbita
// Estructura transcrita de la versión web original (app/index.html).
export default function Orbita({ oculto }) {
  return (
    <>
    <section className={"page"} id={"v-orbita"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"}>
            {"Juego diario · por dentro es la prueba de reacción de NASA"}
          </span>
          <h1>
            {"Órbita"}
          </h1>
          <span className={"pvt-sub"}>
            {"PVT (psychomotor vigilance test) · prueba de vigilancia psicomotora"}
          </span>
        </div>
        <div className={"pick"} data-pick="" />
      </div>
      <div className={"stage"}>
        <canvas id={"game"} aria-label={"Órbita: toca cuando se encienda el anillo"} />
        <div className={"hud"} id={"hud"} hidden>
          <div>
            <span className={"cap"}>
              {"Puntos"}
            </span>
            <span className={"num"} id={"hScore"}>
              {"0"}
            </span>
            <span className={"ghost"} id={"hGhost"} />
          </div>
          <div style={{"textAlign": "center"}}>
            <span className={"combo"} id={"hCombo"} />
          </div>
          <div className={"hud-r"}>
            <span className={"cap"} id={"hMode"} />
            <span className={"num"} id={"hTime"}>
              {"3:00"}
            </span>
          </div>
        </div>
        <div className={"overlay"} id={"gOver"}>
          <div className={"obox"} id={"gBox"} />
        </div>
      </div>
      <div className={"hub"}>
        <div className={"card pad pilot"} id={"hPilot"} />
        <div className={"card pad"} id={"hMis"} style={{"display": "grid", "gap": "12px"}} />
        <div className={"card pad"} id={"hRec"} style={{"display": "grid", "gap": "14px"}} />
        <div className={"card pad span2"} style={{"display": "grid", "gap": "6px"}}>
          <div className={"rowb"}>
            <h3>
              {"Ruta a la Luna"}
            </h3>
            <span className={"cap"} id={"routeCap"} />
          </div>
          <svg id={"route"} viewBox={"0 0 760 190"} role={"img"} aria-label={"Ruta de la Tierra a la Luna"} />
          <div className={"rlab"}>
            <span>
              {"Tierra"}
            </span>
            <span id={"routeNext"} style={{"textAlign": "center"}} />
            <span>
              {"Luna"}
            </span>
          </div>
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px", "justifyItems": "start"}}>
          <span className={"cap"}>
            {"Postal de la ruta"}
          </span>
          <div id={"postalNow"} style={{"width": "100%"}} />
        </div>
        <div className={"card pad span2"} style={{"display": "grid", "gap": "12px"}}>
          <div className={"rowb"}>
            <h3>
              {"Bitácora"}
            </h3>
            <span className={"cap"} id={"logN"} />
          </div>
          <div className={"logg"} id={"logg"} />
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "16px"}}>
          <h3>
            {"Color del anillo"}
          </h3>
          <div className={"skins"} id={"skins"} />
          <p className={"muted small"}>
            {"Se desbloquean al subir de rango o en las cápsulas de suministros."}
          </p>
          <div style={{"borderTop": "1px solid var(--line)", "paddingTop": "14px", "display": "grid", "gap": "6px"}}>
            <h3 style={{"fontSize": "16px"}}>
              {"Tu privacidad"}
            </h3>
            <p className={"muted small"}>
              {"Puntos, insignias y tiempos son tuyos. A la Tierra solo va si estás "}
              <b style={{"color": "var(--text)"}}>
                {"en forma"}
              </b>
              {" o "}
              <b style={{"color": "var(--text)"}}>
                {"necesitas descanso"}
              </b>
              {", salvo que compartas más en "}
              <a href={"#enlace"}>
                {"Enlace"}
              </a>
              {". Nadie ve tu puntaje."}
            </p>
          </div>
        </div>
        <div className={"card pad span2"} style={{"display": "grid", "gap": "12px"}}>
          <div className={"rowb"}>
            <h3>
              {"Insignias"}
            </h3>
            <span className={"cap"} id={"badgeN"} />
          </div>
          <div className={"badges"} id={"badges"} />
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "10px"}}>
          <span className={"cap"}>
            {"Cómo mide sin preguntar"}
          </span>
          <p className={"small"} style={{"lineHeight": "1.6"}}>
            {"El turno oficial sigue las reglas de la "}
            <b>
              {"PVT-B"}
            </b>
            {" de NASA: 3 minutos, el anillo se enciende cada 1 a 4 s, una respuesta de 355 ms o más es un lapso y una de menos de 100 ms es anticipación. Es la prueba más sensible a la falta de sueño."}
          </p>
          <p className={"small muted"} id={"pvtSrc"} />
        </div>
      </div>
    </section>
    </>
  );
}
