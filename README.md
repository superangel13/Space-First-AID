# Space First AID

**Apoyo médico a bordo para tripulaciones en misiones lejanas.** Proyecto para el NASA Space Apps Challenge 2026.

Cuando la Tierra está lejos o se pierde la señal, la tripulación tiene que detectar y atender sola los problemas de salud. Space First AID junta en una sola herramienta los signos vitales, los síntomas, los datos de los dispositivos de NASA (actígrafo, Bio-Monitor y Bio-Analyzer) y las pruebas de atención y visión. Los cruza con **10 problemas de salud de vuelos largos** (documento de parámetros del equipo, basado en fuentes de NASA) y avisa con tiempo, con el protocolo y la contramedida. Todo funciona **sin internet** en la computadora de la nave y se sincroniza con el centro de control en la Tierra cuando hay señal.

## Versión principal: programa de escritorio (React + Electron)

La versión más nueva es el programa de escritorio en [`escritorio/`](escritorio/README.md): pantalla en **React**, ventana en **Electron** y motor en **Python + SQLite** incluido.

## Cómo instalarlo

No hace falta instalar Python ni nada más: el programa trae todo y funciona sin internet.

1. Entra a **[Releases](https://github.com/superangel13/Space-First-AID/releases/latest)**.
2. En **Assets**, descarga el archivo de tu sistema:

| Sistema | Archivo | Pasos |
|---|---|---|
| **macOS** (Apple Silicon: M1, M2, M3, M4) | El que termina en `-arm64-mac.zip` | 1. Doble clic al `.zip` para descomprimirlo. 2. Arrastra **Space First AID** a **Aplicaciones**. 3. Ábrelo con clic derecho → **Abrir** → **Abrir**. Si macOS no deja abrirlo: **Ajustes del Sistema → Privacidad y seguridad → «Abrir de todos modos»**. |
| **Windows** 10 u 11 | El `.exe` con `Setup` en el nombre (instalador) o el otro `.exe` (portable, sin instalar) | 1. Doble clic al archivo. 2. Si aparece «Windows protegió tu PC»: **Más información → Ejecutar de todas formas**. 3. El instalador deja un acceso directo en el escritorio y en el menú Inicio. |
| **Linux** (x64) | El que termina en `.AppImage` | En la terminal, dentro de la carpeta de descargas: `chmod +x *.AppImage` y luego `./Space*.AppImage`. |

3. La primera vez se ve la animación de entrada, se **elige el idioma (español o English)** y después el **registro de la misión** (destino Luna, Marte u otro; tripulantes de 20 años o más). También puedes elegir **Ver misión demo**.
4. Para las pruebas con la mano, el programa pide permiso para usar la **cámara**.

**Idioma:** toda la plataforma está en español y en inglés. Se elige al abrirla por primera vez y se cambia en cualquier momento con el botón **ES | EN** del encabezado. El traductor está en `app/i18n/` y el diccionario se arma con `herramientas/extraer_textos.py` y `herramientas/i18n/fusionar.py`.

Los avisos de macOS y Windows aparecen porque el programa no está firmado con un certificado de pago. No es un virus.

Si macOS dice que la app «está dañada», ábrela una vez con este comando en la Terminal:

```bash
xattr -cr "/Applications/Space First AID.app"
```

**Dónde guarda los datos:** macOS en `~/Library/Application Support/Space First AID`, Windows en `%APPDATA%\Space First AID` y Linux en `~/.local/share/Space First AID`. Para empezar de cero, borra esa carpeta.

### Correrlo desde el código

Necesitas Node 20 o más nuevo y Python 3.9 o más nuevo:

```bash
git clone https://github.com/superangel13/Space-First-AID.git
cd Space-First-AID/escritorio
npm install
npm run inicio
```

## Qué hace

| Sección | Qué hace |
|---|---|
| **Panel** | Círculos por sistema del cuerpo (inmunológico, cardiovascular, neuro-ocular, cognitivo, radiación, músculo y hueso), gemelo digital 3D, guía de sueño circadiano y datos del trayecto: gravedad, radiación y distancia |
| **Tripulación** | Lista con círculos por sistema; al tocar a una persona se abre su página con modelo 3D, signos vitales, avisos y perfil previo al vuelo |
| **Valoración** | Mapa del cuerpo para registrar signos y síntomas; registro personal (carga de trabajo, estrés PSS-10, ánimo, equipo); datos del **actígrafo, Bio-Monitor y Bio-Analyzer** (sangre, orina y saliva); simulador de emergencias; simulador de **accidentes** con protocolos basados en *NASA Human System Risks* |
| **Pruebas** | ¿Cómo te sientes?, Órbita (PVT), coordinación ojo-mano y prueba de visión con la cámara. Menos de 70 % manda una alerta y afecta los sistemas |
| **Alertas** | Algunos indicadores de un problema = alerta. **Todos** = ventana de emergencia con el protocolo paso a paso y animaciones. Tormenta solar → todos al refugio |
| **Enlace con la Tierra** | Cola por prioridad (alertas, resúmenes, detalle). Sin señal, la vista del médico avisa y todo queda en la bitácora |

Los datos de los dispositivos y los tripulantes de la demo son **simulados**: en una misión real llegarían de los equipos a bordo.

## Versión web (anterior, solo Python)

### Cómo correrlo (versión web)

Solo necesitas **Python 3.9 o más nuevo**. No hay que instalar nada más.

```bash
python3 iniciar.py
```

Se prenden dos servidores y se abre el navegador:

| Parte | Dirección | Qué es |
|---|---|---|
| **Nave** | http://localhost:8000 | La app de la tripulación, con su base de datos `nave/nave.db` |
| **Centro de control (Tierra)** | http://localhost:8766 | Recibe los paquetes y es donde el laboratorio captura resultados (`tierra/tierra.db`) |

Otras formas de arrancar:

```bash
python3 iniciar.py --solo-nave        # la Tierra corre en otra computadora
python3 -m nave.servidor              # solo la nave
python3 -m tierra.centro_control      # solo el centro de control
```

Para una demo con dos computadoras en el mismo wifi, una corre la nave y la otra la Tierra:

```bash
TIERRA_URL=http://IP-DE-LA-OTRA:8766 python3 iniciar.py --solo-nave
```

Al apagar el wifi, la nave sigue funcionando y guarda todo en la cola. Al volver la señal, envía lo pendiente por prioridad.

## Ejecutable de la versión web (sin instalar Python)

En **Releases** también están los archivos `SpaceFirstAID-<sistema>.zip`. Son la versión web anterior, que se abre en el navegador:

| Sistema | Archivo | Cómo abrirlo |
|---|---|---|
| Windows | `SpaceFirstAID.exe` | Doble clic. Si Windows SmartScreen avisa: «Más información» → «Ejecutar de todas formas» |
| macOS (Apple Silicon) | `SpaceFirstAID` | Doble clic: se abre en la Terminal. Si dice que el desarrollador no está identificado: clic derecho → Abrir → Abrir |
| Linux | `SpaceFirstAID` | `./SpaceFirstAID` |

Se abre una ventana de texto, que hay que dejar abierta, y el navegador con la app. Para apagarla, se cierra esa ventana. El programa incluye Python, SQLite, la pantalla y el detector de manos, y funciona sin internet.

Los datos se guardan en la carpeta del usuario:

- **macOS:** `~/Library/Application Support/Space First AID`
- **Windows:** `%APPDATA%\Space First AID`
- **Linux:** `~/.local/share/Space First AID`

### Construirlo tú

Cada sistema construye su propio ejecutable: el de Windows se arma en Windows.

```bash
pip install pyinstaller pillow
python herramientas/construir_ejecutable.py      # resultado en dist/
```

El flujo `.github/workflows/ejecutables.yml` arma los tres sistemas en GitHub Actions cada vez que se sube a `main`. Al crear una etiqueta `v1.0.0`, además los publica en Releases.

## Programa de escritorio (React + Electron)

En la carpeta [`escritorio/`](escritorio/README.md) está la misma app como programa de escritorio: la pantalla en **React**, la ventana en **Electron** y el mismo motor en **Python + SQLite**, incluido dentro del programa.

```bash
cd escritorio
npm install
npm run inicio
```

### Primer uso (versión web)

1. **Registro de la misión:** nombre, destino (opciones preestablecidas), duración, fecha de inicio y de 1 a 6 tripulantes con su rol, sexo, edad, condición física y antecedentes médicos.
2. O **Ver misión demo:** Luna ida y vuelta, 180 días, día 42, con Grover, Payán, Valentina y Camilia (datos inventados).

Del registro dependen las vigilancias por antecedente, la trayectoria y las zonas de gravedad y radiación.

### Secciones (versión web anterior)

| Sección | Qué hace |
|---|---|
| **Panel** | Estado de toda la tripulación (un solo círculo), gemelo digital 3D, guía de sueño por **ritmo circadiano** y posición de la misión |
| **Tripulación** | Círculos de salud de cada persona; al tocar uno se abre su detalle: signos vitales en vivo, modelo 3D, **avisos y riesgos** del motor clínico, tendencias y perfil previo al vuelo |
| **Valoración** | Registro de síntomas tocando el cuerpo, y **muestras de orina, sangre y saliva** (análisis a bordo; el resultado del laboratorio en Tierra lo reemplaza al llegar) |
| **Pruebas** | 1 ¿Cómo te sientes? · 2 Órbita, PVT (*psychomotor vigilance test*, prueba de vigilancia psicomotora) · 3 Seguir puntos con la mano · 4 Círculo con la mano · 5 La C abierta · 6 Rejilla de Amsler |
| **Misión** | Trayectoria según el destino, gravedad, radiación y retraso de la señal |
| **Mi día** | Metas, agenda, respiración guiada, aire de la nave y mensajes a casa |
| **Sirena** (arriba a la derecha) | Centro de alertas. Gira 0.6 s con un aviso y 1.5 s con una emergencia, y se repite mientras no se atienda. Toda alerta crítica abre una ventana en cualquier sección |
| **Botón de conexión** | Enlace con la Tierra: cola por prioridad y simulación de pérdida de señal |

Las pruebas 3 y 4 se juegan con el ratón, el dedo o **la cámara**. MediaPipe detecta la punta del dedo índice, y el modelo viene incluido en `app/vendor/mediapipe`, así que funciona sin internet.

## Cómo está hecho

```
space-first-aid/
├── iniciar.py              ← arranca la nave y la Tierra
├── app/                    ← la pantalla (HTML, CSS y JavaScript, sin frameworks)
│   ├── index.html
│   ├── css/                ← estilos.css (base) y secciones.css
│   ├── js/
│   │   ├── arranque.js     ← registro o carga de la app
│   │   ├── nucleo/         ← API, utilidades, tripulación, signos, alertas, enlace
│   │   ├── vistas/         ← panel, tripulación, valoración, muestras, pruebas, misión…
│   │   ├── juegos/         ← Órbita (PVT), pruebas de mano y vista, mente
│   │   ├── motor/          ← síntomas y preguntas (la evaluación la hace Python)
│   │   └── ui/             ← 3D, sirena, ritmo circadiano, alerta grande
│   ├── vendor/             ← three.js, fuentes, cuerpo 3D y MediaPipe (todo local)
│   └── media/              ← video del logo
├── nave/                   ← servidor de la nave (Python, solo biblioteca estándar)
│   ├── servidor.py         ← HTTP + API /api/...
│   ├── base_datos.py, esquema.sql   ← SQLite
│   ├── enlace.py           ← cola por prioridad y sincronización con la Tierra
│   └── motor/              ← clinico.py (16 condiciones), signos.py, valoracion.py, pruebas.py
├── tierra/centro_control.py   ← centro de control + laboratorio (SQLite)
├── datos/                  ← parámetros en JSON: umbrales, destinos, muestras, misión demo
├── herramientas/           ← prueba_motor.py (falsas alarmas) y generar_cuerpo.py (malla 3D)
└── docs/                   ← inventario de datos y fuentes
```

- **Pantalla:** HTML, CSS y JavaScript. Captura y muestra, pero no decide.
- **Procesamiento:** Python. El motor clínico, los umbrales de signos vitales, la interpretación de muestras y la comparación de pruebas contra la línea base de cada persona.
- **Base de datos:** SQLite (`nave.db` en la nave y `tierra.db` en la Tierra). Se crean solas al arrancar.
- **Parámetros:** todos en `datos/*.json`. Cambiar un umbral ahí lo cambia para Python y para la pantalla.

### Motor clínico (`nave/motor/clinico.py`)

Usa como única metodología el **documento de parámetros del equipo** (`datos/problemas.json` y `datos/muestras.json`): 10 problemas de vuelos largos (mareo espacial, SANS, redistribución de fluidos, pérdida ósea, inmunodisregulación, fatiga crónica, deterioro conductual, cálculo renal, estrés por aislamiento y pródromo por radiación). Cada uno tiene signos y síntomas, sistema afectado, explicación, contramedida o protocolo y parámetros estables.

- **2 o más indicadores** = alerta.
- **Todos los indicadores** = emergencia con ventana y protocolo.
- Los indicadores pueden ser síntomas, sueño, autorreporte, pruebas, laboratorio (Bio-Analyzer, con rangos por sexo) o contexto de la misión (días en microgravedad, tormenta solar).
- Cada sistema del cuerpo se califica de 0 a 100.

```bash
python3 herramientas/prueba_motor.py
```

La prueba revisa que una persona sana no tenga alertas, que un síntoma solo no genere alerta y que cada uno de los 10 problemas llegue a emergencia con todos sus indicadores.

## Publicarlo en línea (Render)

El archivo `render.yaml` ya trae la configuración:

1. Entra a [render.com](https://render.com) con tu cuenta de GitHub.
2. Ve a **New → Blueprint** y elige este repositorio.
3. Da clic en **Apply**.

En unos minutos queda en `https://space-first-aid.onrender.com` (o el nombre que asigne Render):

- La app de la nave está en `/`.
- El centro de control de la Tierra está en `/tierra/`.

El sitio arranca con la misión demo cargada. En el plan gratis se "duerme" si nadie entra en un rato: la primera visita tarda unos 30 a 50 segundos. Al reiniciarse, vuelve a la misión demo.

## Subirlo a otro servidor con dominio

El mismo código corre en un servidor. Se configura con variables de entorno:

| Variable | Para qué | Valor por defecto |
|---|---|---|
| `PORT` o `NAVE_PUERTO` | Puerto de la nave | 8000 |
| `NAVE_HOST` | `0.0.0.0` para aceptar conexiones de fuera | 127.0.0.1 |
| `NAVE_BD` | Ruta de la base de datos (en un disco que no se borre) | `nave/nave.db` |
| `TIERRA_URL` | Dirección del centro de control | http://127.0.0.1:8766 |
| `TIERRA_PUERTO`, `TIERRA_HOST`, `TIERRA_BD` | Lo mismo para el centro de control | 8766 · 127.0.0.1 · `tierra/tierra.db` |

Antes de publicarlo hay que cuidar dos cosas:

- **HTTPS:** el navegador solo permite la cámara con HTTPS (o en `localhost`).
- **Acceso:** con datos médicos reales, agrega inicio de sesión antes de exponerlo a internet.

## Datos y fuentes

- Solo fuentes de NASA y asociadas, de acceso abierto. La lista está en la sección **Referencias** de la app y en `docs/inventario_datos.html`.
- Los tripulantes, sus signos vitales y la misión demo son **de ejemplo**. Los signos vitales llegarían del sensor portátil.
- Los rangos de orina, sangre y saliva (`datos/muestras.json`) salen del documento de parámetros del equipo. Los umbrales de signos vitales (`datos/umbrales.json`) son de NASA y del equipo.
- Los protocolos de accidentes (`datos/accidentes.json`) se basan en [NASA Human System Risks](https://www.nasa.gov/hhp/human-system-risks/).
- Las reglas orientan y priorizan. **No sustituyen al cirujano de vuelo.**

## Uso de inteligencia artificial

Las reglas de NASA Space Apps piden declararlo:

- **Código:** escrito por el equipo con ayuda de Claude (Anthropic), un asistente de programación. Lo usamos para estructurar el proyecto, escribir y depurar el código en Python y JavaScript, y verificar fuentes. Los commits hechos con su ayuda lo indican con la línea `Co-Authored-By: Claude`.
- **La idea, el diseño de la solución y las decisiones médicas y de datos son del equipo.** Las reglas clínicas salen de documentos de NASA citados en la app.
- **Imágenes:** el logo y el ícono son del equipo. Los videos de los dispositivos se hicieron con código (Remotion), no con IA generativa.
- **La app no usa IA para decidir:** el motor clínico son reglas fijas y verificables, tomadas del documento de parámetros del equipo.

## Licencia

Apache 2.0 (ver `LICENSE`).

### Licencias de terceros

- three.js (MIT)
- MediaPipe Tasks Vision y el modelo de manos (Apache 2.0)
- Fuentes Manrope y Sora (SIL Open Font License)
