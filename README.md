# Space First AID

**Apoyo médico a bordo para tripulaciones en misiones lejanas.** Proyecto para el NASA Space Apps Challenge 2026.

Cuando la Tierra está lejos o se pierde la señal, la tripulación tiene que detectar y atender sola los problemas de salud. Space First AID junta en una sola herramienta los signos vitales, los síntomas, las muestras de laboratorio y las pruebas de atención y visión. Los cruza con los criterios del **ISS Medical Checklist de NASA** y avisa con tiempo, con el protocolo a seguir. Todo funciona **sin internet** en la computadora de la nave y se sincroniza con el centro de control en la Tierra cuando hay señal.

## Cómo correrlo

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

## Ejecutable (sin instalar Python)

En **Releases** (o en la pestaña **Actions**, si se generó ahí) hay un ejecutable para cada sistema:

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

## Primer uso

1. **Registro de la misión:** nombre, destino (opciones preestablecidas), duración, fecha de inicio y de 1 a 6 tripulantes con su rol, sexo, edad, condición física y antecedentes médicos.
2. O **Ver misión demo:** Luna ida y vuelta, 180 días, día 42, con Grover, Payán, Valentina y Camilia (datos inventados).

Del registro dependen las vigilancias por antecedente, la trayectoria y las zonas de gravedad y radiación.

## Secciones

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

### Motor clínico

Toma 16 condiciones del *ISS Medical Checklist* de NASA (JSC-48522) y sus fichas de condición médica del Human Research Roadmap. Cada una tiene 3 indicios (tríada):

- **2 de 3** = advertencia.
- **3 de 3** = alerta con el protocolo de NASA.
- **Señales de alarma** = alerta directa.
- **Capa de descarte:** el indicio principal es obligatorio, se exige la exposición necesaria (por ejemplo, una caminata espacial para descompresión) y los criterios de exclusión bajan un nivel.

El motor también cruza los resultados de laboratorio. Por ejemplo, la sangre en la orina cuenta para cálculo renal e infección urinaria, y el virus en la saliva cuenta para la reactivación de herpes.

```bash
python3 herramientas/prueba_motor.py
```

Esta prueba evalúa a una persona sana, cada síntoma solo, los 903 pares de síntomas y 9 casos clínicos típicos. Una persona sana y un síntoma aislado no deben generar advertencias.

## Subirlo a un servidor con dominio

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
- **Los rangos de las muestras de orina, sangre y saliva (`datos/muestras.json`) son de ejemplo** y se van a reemplazar por valores de referencia verificados.
- Las reglas orientan y priorizan. **No sustituyen al cirujano de vuelo.**

## Licencia

Apache 2.0 (ver `LICENSE`).

### Licencias de terceros

- three.js (MIT)
- MediaPipe Tasks Vision y el modelo de manos (Apache 2.0)
- Fuentes Manrope y Sora (SIL Open Font License)
