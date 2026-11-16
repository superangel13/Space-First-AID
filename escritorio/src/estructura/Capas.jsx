// Capas flotantes: aviso corto, alerta grande y ventana de datos
// Estructura transcrita de la versión web original (app/index.html).
export default function Capas() {
  return (
    <>
    <div className={"toast"} id={"toast"} role={"status"} aria-live={"polite"} />
    <div className={"bigal"} id={"bigal"} hidden role={"alertdialog"} aria-modal={"true"} aria-labelledby={"bigT"}>
      <div className={"bx"} id={"bigBx"} />
    </div>
    <div className={"modal"} id={"modal"} hidden>
      <div className={"card pad"}>
        <div className={"rowb"}>
          <h3 id={"mTitle"} />
          <button className={"btn ghost sm"} id={"mClose"} type={"button"}>
            {"Cerrar"}
          </button>
        </div>
        <textarea id={"mText"} readOnly />
        <p className={"note"}>
          {"Selecciona y copia. En la misión real esto viaja por el enlace como paquete de detalle."}
        </p>
      </div>
    </div>
    </>
  );
}
