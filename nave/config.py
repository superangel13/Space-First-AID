"""Configuración de la nave. Todo se puede cambiar con variables de entorno,
así el mismo código corre en tu computadora o en un servidor con dominio."""
import os
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent          # carpeta del proyecto
APP = RAIZ / "app"                                       # pantalla (HTML, CSS, JS)
DATOS = RAIZ / "datos"                                   # parámetros en JSON

HOST = os.environ.get("NAVE_HOST", "127.0.0.1")         # 0.0.0.0 en un servidor
PUERTO = int(os.environ.get("PORT") or os.environ.get("NAVE_PUERTO") or 8000)
BD = Path(os.environ.get("NAVE_BD", RAIZ / "nave" / "nave.db"))
TIERRA_URL = os.environ.get("TIERRA_URL", "http://127.0.0.1:8766").rstrip("/")
INTERVALO_ENLACE_S = float(os.environ.get("NAVE_INTERVALO_ENLACE", 4))
