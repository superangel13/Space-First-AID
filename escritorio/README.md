# Space First AID · programa de escritorio (React + Electron)

La misma app, como programa de escritorio:

- **Electron** abre la ventana y arranca el motor.
- **React** (con Vite) es la pantalla.
- **El motor sigue siendo Python + SQLite** (`../nave`, `../tierra`): motor clínico, signos vitales, muestras, pruebas y enlace con la Tierra. En el programa empaquetado va incluido, así que no hace falta instalar Python.

Funciona sin internet: todo corre en la computadora.

## Usarlo en desarrollo

Necesitas Node 20 o más nuevo y Python 3.9 o más nuevo.

```bash
npm install
npm run inicio
```

`npm run inicio` compila la pantalla y abre Electron, que arranca el motor con `python3 ../iniciar.py` en un puerto libre.

Para trabajar solo en la pantalla, con recarga automática:

```bash
python3 ../iniciar.py --sin-navegador   # el motor, en otra terminal
npm run dev                             # la pantalla en http://localhost:5173
```

## Construir el programa

```bash
pip install pyinstaller pillow
python ../herramientas/construir_ejecutable.py --motor   # deja el motor en escritorio/motor/
npm run empaquetar                                       # deja el programa en escritorio/salida/
```

| Sistema | Resultado en `salida/` |
|---|---|
| macOS | `Space First AID.app` y un `.zip` para compartir |
| Windows | Instalador `.exe` y versión portable |
| Linux | `.AppImage` |

Cada sistema construye el suyo. El flujo `.github/workflows/ejecutables.yml` arma los tres en GitHub.

El programa no está firmado. En otra computadora, macOS y Windows muestran un aviso la primera vez: en Mac se abre con clic derecho → Abrir; en Windows, con «Más información» → «Ejecutar de todas formas».

## Cómo está organizado

```
escritorio/
├── electron/main.cjs        ← arranca el motor, abre la ventana y lo apaga al salir
├── index.html               ← entrada de Vite
├── vite.config.js           ← une el núcleo en un módulo (virtual:nucleo)
├── herramientas/            ← copiar_recursos.mjs y html_a_jsx.py
└── src/
    ├── main.jsx, App.jsx    ← arranque: ¿hay misión? → registro o aplicación; rutas
    ├── Registro.jsx         ← registro inicial de la misión
    ├── api.js, bus.js       ← comunicación con el motor y puente núcleo ↔ React
    ├── estructura/          ← encabezado con sirena, subnavegación, pie, panel de enlace, navegación inferior
    ├── componentes/         ← tripulación, avisos y riesgos, muestras, resumen del panel, guía de sueño, alertas
    ├── vistas/              ← las 10 secciones en JSX
    └── legado/              ← núcleo de la app: simulación de sensores, alertas, 3D, juegos y gráficas
```

### Qué es React y qué es núcleo

**Componentes de React (estado y pintado en React):**

- Registro de misión.
- Encabezado: secciones, botón de conexión, vista tripulante o médico, y sirena.
- Subnavegación de Pruebas, pie y navegación inferior.
- Panel de enlace con la Tierra.
- Resumen de la tripulación y guía de sueño (ritmo circadiano).
- Círculos de cada tripulante, y avisos y riesgos.
- Muestras de orina, sangre y saliva.
- Barra de alerta y ventana de alerta crítica.

**Secciones en JSX cuyo contenido dinámico lo pinta el núcleo (`src/legado/`):**

- Gemelo 3D y modelo 3D por persona (three.js).
- Detalle de la persona (métricas y gráfica de tendencia).
- Registro de síntomas con el mapa del cuerpo.
- ¿Cómo te sientes? y juegos de cognición.
- Órbita (PVT) y pruebas de mano y vista (lienzos).
- Centro de alertas, Misión, Mi día y Referencias.

El núcleo avisa a React cuando algo cambia (`SFA.bump()`), y React le avisa al núcleo cuando cambia la sección (`alCambiarRuta`). El siguiente paso es ir pasando esas secciones a componentes, una por una.
