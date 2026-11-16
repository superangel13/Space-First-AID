// Sección Alertas
// Estructura transcrita de la versión web original (app/index.html).
export default function Alertas({ oculto }) {
  return (
    <>
    <section className={"page"} id={"v-alertas"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"}>
            {"Detecta, predice y guía"}
          </span>
          <h1>
            {"Centro de alertas"}
          </h1>
          <p>
            {"Las alertas salen solas de los signos vitales en vivo, de las revisiones de ojos, del entorno de la nave y de los pronósticos. Cada una dice qué hacer en pasos simples y se envía a la Tierra con prioridad."}
          </p>
        </div>
        <div style={{"display": "flex", "gap": "10px", "flexWrap": "wrap"}}>
          <button className={"btn go"} id={"genCase"} type={"button"}>
            {"Generar caso aleatorio"}
          </button>
          <button className={"btn ghost"} id={"trainBtn"} type={"button"} />
        </div>
      </div>
      <div className={"akpi"} id={"aKpi"} />
      <div className={"agrid"}>
        <div style={{"display": "grid", "gap": "14px"}} id={"aList"} />
        <div className={"card pad"} style={{"display": "grid", "gap": "14px"}}>
          <div>
            <h3>
              {"Simulador de casos"}
            </h3>
            <p className={"muted small"} style={{"marginTop": "4px"}}>
              {"Elige a una persona y una situación. Sus signos vitales cambian poco a poco y el sistema la detecta solo."}
            </p>
          </div>
          <div className={"pick"} data-pick="" />
          <div className={"scen"} id={"scenP"} />
          <span className={"cap"}>
            {"Toda la nave"}
          </span>
          <div className={"scen"} id={"scenS"} />
          <button className={"btn ghost sm"} id={"scenReset"} type={"button"}>
            {"Regresar a todos a la normalidad"}
          </button>
        </div>
      </div>
      <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
        <div className={"rowb"}>
          <h3>
            {"Pronósticos"}
          </h3>
          <span className={"cap"}>
            {"Tendencia de los últimos 10 días · próximos 7"}
          </span>
        </div>
        <p className={"muted small"}>
          {"Si la tendencia sigue igual, esto es lo que podría pasar. Puedes convertir un pronóstico en alerta preventiva."}
        </p>
        <div className={"pgrid2"} id={"aPred"} />
      </div>
      <div className={"two"}>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
          <div className={"rowb"}>
            <h3>
              {"Entorno de la nave"}
            </h3>
            <span className={"cap"}>
              {"Simulado"}
            </span>
          </div>
          <div className={"gauges"} data-env="" />
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
          <h3>
            {"Bitácora de alertas"}
          </h3>
          <div className={"alog"} id={"aLog"} />
        </div>
      </div>
    </section>
    </>
  );
}
