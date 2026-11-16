// Sección Referencias
// Estructura transcrita de la versión web original (app/index.html).
export default function Referencias({ oculto }) {
  return (
    <>
    <section className={"page"} id={"v-referencias"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"}>
            {"Totalmente verificable · solo NASA y ESA"}
          </span>
          <h1>
            {"Los 4 puntos que resolvemos"}
          </h1>
          <p>
            {"Cada uno parte de un hueco documentado en el sistema médico de NASA para misiones lejanas y se apoya en fuentes oficiales. A = norma, documento oficial o estudio sólido. B = estudio en pocos astronautas."}
          </p>
        </div>
      </div>
      <div className={"fgrid"} id={"focus4"} />
      <div className={"two"}>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
          <h3>
            {"Qué es real y qué es de ejemplo"}
          </h3>
          <ul className={"sim"} id={"simList"} />
          <div>
            <button className={"btn ghost sm"} id={"resetBtn"} type={"button"}>
              {"Reiniciar la demostración"}
            </button>
          </div>
        </div>
        <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
          <h3>
            {"Fuentes"}
          </h3>
          <ul className={"srcs"} id={"srcs"} />
        </div>
      </div>
    </section>
    </>
  );
}
