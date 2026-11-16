// Sección Mente
// Estructura transcrita de la versión web original (app/index.html).
export default function Mente({ oculto }) {
  return (
    <>
    <section className={"page"} id={"v-mente"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"}>
            {"Salud mental sin vigilancia · batería Cognition de NASA"}
          </span>
          <h1>
            {"¿Cómo te sientes?"}
          </h1>
          <p>
            {"NASA define un cambio conductual como cualquier baja en el ánimo, la cognición, la moral o la convivencia que afecte el desempeño. Aquí se miden esas tres cosas con un check-in de 10 segundos y juegos cortos. Todo se queda en la nave salvo que tú lo compartas."}
          </p>
        </div>
        <div className={"pick"} data-pick="" />
      </div>
      <div className={"mgrid"}>
        <div className={"card pad"} style={{"display": "grid", "gap": "14px"}}>
          <div className={"rowb"}>
            <h3>
              {"Tu clima interior"}
            </h3>
            <span className={"cap"} id={"ciWhen"} />
          </div>
          <p className={"muted small"}>
            {"Arrastra la luz hacia donde estás hoy: a la derecha si te sientes bien, a la izquierda si no tanto; arriba con energía, abajo cansado."}
          </p>
          <div className={"agrid2"} id={"ag2"}>
            <div className={"cross"} />
            <span className={"ax"} style={{"top": "8px", "left": "50%", "transform": "translateX(-50%)"}}>
              {"Con energía"}
            </span>
            <span className={"ax"} style={{"bottom": "8px", "left": "50%", "transform": "translateX(-50%)"}}>
              {"Sin energía"}
            </span>
            <span className={"ax"} style={{"left": "8px", "top": "50%", "transform": "translateY(-50%)"}}>
              {"Mal"}
            </span>
            <span className={"ax"} style={{"right": "8px", "top": "50%", "transform": "translateY(-50%)"}}>
              {"Bien"}
            </span>
            <div className={"orb"} id={"orb"} />
          </div>
          <span className={"cap"}>
            {"¿Cómo está la convivencia hoy?"}
          </span>
          <div className={"lvl5"} id={"team5"} />
          <button className={"btn go"} id={"ciSave"} type={"button"}>
            {"Guardar check-in"}
          </button>
        </div>
        <div style={{"display": "grid", "gap": "18px", "alignContent": "start"}}>
          <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
            <div className={"rowb"}>
              <h3>
                {"Tríada conductual"}
              </h3>
              <span className={"cap"} id={"mtN"} />
            </div>
            <div className={"crit"} id={"mTri"} />
            <p className={"note"} id={"mTriSrc"} />
          </div>
          <div className={"card pad"} style={{"display": "grid", "gap": "10px"}}>
            <div className={"rowb"}>
              <h3>
                {"Últimos 14 días"}
              </h3>
              <span className={"cap"}>
                {"Ánimo · convivencia · cognición"}
              </span>
            </div>
            <svg id={"mChart"} viewBox={"0 0 600 180"} style={{"width": "100%", "height": "auto"}} />
            <div className={"cleg"}>
              <span>
                <i style={{"background": "#A28CFF"}} />
                {"Ánimo"}
              </span>
              <span>
                <i style={{"background": "#34E39A"}} />
                {"Convivencia"}
              </span>
              <span>
                <i style={{"background": "#5FD3F3"}} />
                {"Cognición"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div hidden className={"card pad"} style={{"display": "grid", "gap": "14px"}}>
        <div className={"rowb"}>
          <h3>
            {"Juegos de la mente"}
          </h3>
          <span className={"cap"}>
            {"Versiones cortas de pruebas de la batería Cognition de NASA"}
          </span>
        </div>
        <div className={"games"} id={"games"} />
        <div className={"gstage"} id={"gStage"}>
          <div style={{"textAlign": "center", "color": "var(--muted)"}}>
            {"Elige un juego"}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
