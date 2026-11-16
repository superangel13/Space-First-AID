// Barra roja con la alerta más importante
// Estructura transcrita de la versión web original (app/index.html).
export default function BarraAlerta() {
  return (
    <>
    <div className={"abar"} id={"abar"} hidden role={"alert"}>
      <div className={"wrap"}>
        <span className={"pul"} />
        <b id={"abarT"} />
        <span className={"at"} id={"abarX"} />
        <span className={"btn sm"} style={{"background": "#fff", "color": "#05070A"}}>
          {"Ver"}
        </span>
      </div>
    </div>
    </>
  );
}
