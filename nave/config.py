"""Configuración de la nave. Todo se puede cambiar con variables de entorno,
así el mismo código corre en tu computadora, empaquetado como ejecutable o
en un servidor con dominio."""
import os
import sys
from pathlib import Path

# ¿Corre como ejecutable (PyInstaller)? Entonces los archivos de la app vienen
# dentro del paquete (solo lectura) y las bases de datos van a una carpeta del usuario.
EMPAQUETADO = getattr(sys, "frozen", False)
RAIZ = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent.parent))
APP = RAIZ / "app"                                       # pantalla (HTML, CSS, JS)
DATOS = RAIZ / "datos"                                   # parámetros en JSON


def carpeta_usuario():
    """Donde se guardan las bases de datos cuando corre como ejecutable."""
    if sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support"
    elif os.name == "nt":
        base = Path(os.environ.get("APPDATA") or Path.home())
    else:
        base = Path(os.environ.get("XDG_DATA_HOME") or Path.home() / ".local" / "share")
    d = base / "Space First AID"
    d.mkdir(parents=True, exist_ok=True)
    return d


HOST = os.environ.get("NAVE_HOST", "127.0.0.1")         # 0.0.0.0 en un servidor
PUERTO = int(os.environ.get("NAVE_PUERTO") or os.environ.get("PORT") or 8000)
BD = Path(os.environ.get("NAVE_BD") or (carpeta_usuario() / "nave.db" if EMPAQUETADO else RAIZ / "nave" / "nave.db"))
TIERRA_URL = os.environ.get("TIERRA_URL", "http://127.0.0.1:8766").rstrip("/")
INTERVALO_ENLACE_S = float(os.environ.get("NAVE_INTERVALO_ENLACE", 4))
