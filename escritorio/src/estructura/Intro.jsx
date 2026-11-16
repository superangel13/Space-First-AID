// Video de entrada con el logo
// Estructura transcrita de la versión web original (app/index.html).
export default function Intro() {
  return (
    <>
    <div id={"intro"} aria-hidden={"true"}>
      <video id={"introV"} src={"media/logo-reveal.mp4"} muted playsInline preload={"auto"} />
      <button type={"button"} id={"skip"}>
        {"Saltar intro"}
      </button>
    </div>
    </>
  );
}
