// Sección Mision
// Estructura transcrita de la versión web original (app/index.html).
export default function Mision({ oculto }) {
  return (
    <>
    <section className={"page"} id={"v-mision"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"} id={"mCapT"}>
            {"Trayectoria y entorno"}
          </span>
          <h1 id={"mH1"}>
            {"Misión"}
          </h1>
          <p id={"mP"} />
        </div>
      </div>
      <div className={"card pad"}>
        <svg className={"msvg"} id={"mSvg"} viewBox={"0 0 1400 330"} role={"img"} aria-label={"Trayectoria Tierra–Luna"} />
        <div className={"zbar"} id={"zBar"} />
        <div className={"cleg"} id={"zLeg"} style={{"marginTop": "10px"}} />
        <div className={"mctl"}>
          <button className={"btn go sm"} id={"mPlay"} type={"button"} />
          <div className={"seg"} id={"mSpd"} role={"group"} aria-label={"Velocidad"}>
            <button type={"button"} data-s={"1"}>
              {"1 día/s"}
            </button>
            <button type={"button"} data-s={"5"}>
              {"5 días/s"}
            </button>
            <button type={"button"} data-s={"20"}>
              {"20 días/s"}
            </button>
          </div>
          <input type={"range"} id={"mScrub"} min={"0"} max={"100"} step={"0.01"} aria-label={"Día de la misión"} />
          <button className={"btn ghost sm"} id={"mToday"} type={"button"}>
            {"Ir a hoy"}
          </button>
          <button className={"btn ghost sm"} id={"mStormBtn"} type={"button"} style={{"color": "var(--rad)"}}>
            {"Simular tormenta solar"}
          </button>
        </div>
        <div className={"mtiles"} id={"mTiles"} />
        <p className={"note"} style={{"marginTop": "12px"}}>
          {"Modelo educativo. Datos publicados: límite de carrera de 600 mSv (NASA), unos 1.8 mSv por día en el espacio profundo (medido por la nave del rover Curiosity) y pérdida ósea de 1 a 1.5 % por mes en microgravedad (NASA). Las demás tasas por zona son aproximaciones del modelo; el efecto de la gravedad lunar en el hueso aún no se conoce y el modelo usa la mitad."}
        </p>
      </div>
      <div className={"two"}>
        <div className={"card pad"} style={{"display": "grid", "gap": "14px"}}>
          <div className={"rowb"}>
            <h3>
              {"Cada tripulante en este punto"}
            </h3>
            <span className={"cap"} id={"mCrewCap"} />
          </div>
          <div className={"bars"} id={"mCrew"} />
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
          <h3>
            {"Bitácora del viaje"}
          </h3>
          <div className={"alog"} id={"mLog"} />
        </div>
      </div>
    </section>
    </>
  );
}
