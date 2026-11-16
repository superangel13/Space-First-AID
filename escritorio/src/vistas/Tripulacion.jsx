// Sección Tripulacion
// Estructura transcrita de la versión web original (app/index.html).
import { CirculosTripulacion, EncabezadoDetalle } from '../componentes/Tripulantes.jsx';
import { ListaAvisos } from '../componentes/Avisos.jsx';

export default function Tripulacion({ oculto, N }) {
  return (
    <>
    <section className={"page"} id={"v-tripulacion"} hidden={oculto}>
      <div className={"ptitle"}>
        <div>
          <span className={"cap"}>
            {"Estado de salud de cada tripulante"}
          </span>
          <h1>
            {"Tripulación"}
          </h1>
          <p>
            {"Toca a una persona para ver todo su detalle: signos vitales, avisos y riesgos que detecta el sistema y su modelo 3D."}
          </p>
        </div>
      </div>
      <CirculosTripulacion N={N} />
      <EncabezadoDetalle N={N} />
      <div className={"card phead"}>
        <div className={"who"}>
          <span className={"av xl"} id={"pAv"} />
          <div>
            <span className={"cap"} id={"pRole"} />
            <h1 id={"pName"} />
            <span className={"st"} id={"pSt"} />
          </div>
        </div>
        <div className={"todo"}>
          <span className={"cap"}>
            {"Qué hacer hoy"}
          </span>
          <div className={"actions"} id={"pTodo"} />
        </div>
      </div>
      <div className={"pgrid2"}>
        <div className={"card pad solo"} style={{"display": "grid", "gap": "10px"}}>
          <div className={"rowb"}>
            <h3>
              {"Modelo 3D"}
            </h3>
            <span className={"cap"} id={"soloCap"}>
              {"Arrastra para girar"}
            </span>
          </div>
          <div className={"solo3d"} id={"solo3d"} />
          <div className={"cleg"} id={"soloLeg"} />
        </div>
        <div className={"card pad dxcol"} style={{"display": "grid", "gap": "12px", "alignContent": "start"}}>
          <div className={"rowb"}>
            <h3>
              {"Avisos y riesgos"}
            </h3>
            <span className={"cap"}>
              {"Lo que el sistema ve · motor en Python"}
            </span>
          </div>
          <p className={"muted small"}>
            {"Cada condición del checklist médico de NASA se evalúa con sus 3 indicios: síntomas, signos vitales, pruebas y muestras de laboratorio. 2 de 3 = advertencia, 3 de 3 = alerta."}
          </p>
          <ListaAvisos N={N} />
          <a className={"btn ghost sm"} href={"#valoracion"} style={{"justifySelf": "start"}}>
            {"Registrar síntomas o muestras"}
          </a>
        </div>
      </div>
      <div className={"pgrid"}>
        <div className={"card mlist"} id={"mlist"} role={"group"} aria-label={"Métricas"} />
        <div className={"pcenter"}>
          <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
            <div className={"rowb"}>
              <h3>
                {"Signos vitales en vivo"}
              </h3>
              <span className={"cap"} id={"pVitCap"}>
                {"Sensor portátil"}
              </span>
            </div>
            <div id={"pVit"} />
          </div>
          <div className={"card focus"}>
            <div className={"ftop"}>
              <div id={"bigRing"} />
              <div className={"ftxt"}>
                <span className={"cap"} id={"fCap"} />
                <h2 id={"fTitle"} />
                <p className={"say"} id={"fSay"} />
                <p className={"why"} id={"fWhy"} />
              </div>
            </div>
            <div className={"brk"} id={"fBrk"} />
          </div>
          <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
            <div className={"rowb"}>
              <h3 id={"cTitle"} />
              <span className={"cap"}>
                {"Sensor portátil · últimos 21 días"}
              </span>
            </div>
            <div className={"chartwrap"}>
              <svg id={"chart"} role={"img"} aria-label={"Tendencia"} />
              <div className={"tip"} id={"tip"} hidden />
            </div>
            <div className={"cleg"} id={"cLeg"} />
          </div>
          <div className={"card pad"} id={"pMed"} hidden style={{"display": "grid", "gap": "12px"}} />
        </div>
        <div className={"pright"}>
          <div className={"card pad"} style={{"display": "grid", "gap": "12px"}}>
            <div className={"rowb"}>
              <h3>
                {"Mapa del cuerpo"}
              </h3>
              <span className={"cap"} id={"zN"} />
            </div>
            <svg id={"bodymap"} viewBox={"0 0 360 440"} role={"img"} aria-label={"Zonas del cuerpo con vigilancia"} />
            <div className={"zl"} id={"zl"} />
          </div>
          <div className={"card pad"} style={{"display": "grid", "gap": "14px"}}>
            <div className={"rowb"}>
              <h3>
                {"Perfil previo al vuelo"}
              </h3>
              <span className={"cap"} id={"pN"} />
            </div>
            <p className={"muted small"}>
              {"Marca antecedentes: se activan vigilancias según lo que NASA ha visto en astronautas con antecedentes parecidos."}
            </p>
            <div className={"chips"} id={"hx"} />
            <div className={"chips"} id={"fit"} />
            <div className={"watch"} id={"watch"} />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
