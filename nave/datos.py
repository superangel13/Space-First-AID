"""Lee los parámetros de la carpeta datos/ (los mismos que usa la pantalla)."""
import json
from functools import lru_cache
from . import config


@lru_cache(maxsize=None)
def cargar(nombre):
    return json.loads((config.DATOS / f"{nombre}.json").read_text(encoding="utf-8"))


def umbrales():
    return cargar("umbrales")


def destinos():
    return {d["id"]: d for d in cargar("destinos")}
