// Sección MiDia
// Estructura transcrita de la versión web original (app/index.html).
export default function MiDia({ oculto }) {
  return (
    <>
    <section className={"page"} id={"v-midia"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"}>
            {"Herramientas de la tripulación"}
          </span>
          <h1>
            {"Mi día"}
          </h1>
          <p>
            {"Lo práctico para cada tripulante: metas del día, agenda, una pausa para respirar, el aire de la nave y mensajes a casa."}
          </p>
        </div>
        <div className={"pick"} data-pick="" />
      </div>
      <div className={"dgrid3"}>
        <div className={"card pad"} style={{"display": "grid", "gap": "14px"}}>
          <h3>
            {"Metas de hoy"}
          </h3>
          <div className={"dr"}>
            <div id={"dRing"} />
            <div className={"dbtns"} id={"dBtns"} />
          </div>
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
          <div className={"rowb"}>
            <h3>
              {"Agenda"}
            </h3>
            <span className={"cap"} id={"agNow"} />
          </div>
          <div className={"ag"} id={"ag"} />
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "10px"}}>
          <h3>
            {"Respira"}
          </h3>
          <p className={"muted small"}>
            {"Dos minutos para bajar el ritmo antes de dormir o después de una tarea pesada."}
          </p>
          <div className={"breath"}>
            <div className={"bc"} id={"bc"}>
              <b id={"bcT"}>
                {"Listo"}
              </b>
            </div>
            <button className={"btn go sm"} id={"bcBtn"} type={"button"}>
              {"Empezar · 2 min"}
            </button>
            <span className={"muted small"} id={"bcN"} />
          </div>
        </div>
      </div>
      <div className={"two"}>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
          <div className={"rowb"}>
            <h3>
              {"Aire y entorno de la nave"}
            </h3>
            <span className={"cap"}>
              {"Simulado"}
            </span>
          </div>
          <div className={"gauges"} data-env="" />
        </div>
        <div className={"card pad msgs"}>
          <h3>
            {"Mensaje a casa"}
          </h3>
          <p className={"muted small"}>
            {"Privado: viaja cifrado por el enlace y la app no lo lee. Llega con el retraso de la señal."}
          </p>
          <textarea id={"msgT"} placeholder={"Escribe a tu familia…"} maxLength={"400"} />
          <div>
            <button className={"btn go sm"} id={"msgB"} type={"button"}>
              {"Enviar"}
            </button>
          </div>
          <div className={"msgs"} id={"msgL"} />
        </div>
      </div>
    </section>
    </>
  );
}
