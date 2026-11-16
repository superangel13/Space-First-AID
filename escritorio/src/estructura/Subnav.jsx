// Subnavegación de la sección Pruebas: las 6 pruebas en el orden en que conviene hacerlas.
export const PRUEBAS = [
  ['animo', '¿Cómo te sientes?'], ['orbita', 'Órbita · PVT'], ['alcance', 'Coordinación ojo-mano'],
  ['trazo', 'Círculo con la mano'], ['letra_c', 'Prueba de visión'],
];

export default function Subnav({ ruta }) {
  const visible = PRUEBAS.some(([id]) => id === ruta);
  return (
    <nav className="subnav" id="pruebasNav" hidden={!visible} aria-label="Pruebas">
      {PRUEBAS.map(([id, nombre], i) => (
        <a key={id} href={'#' + id} aria-current={ruta === id ? 'page' : 'false'}><b>{i + 1}</b>{nombre}</a>
      ))}
    </nav>
  );
}
