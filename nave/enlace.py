"""Enlace con la Tierra.

Un hilo en segundo plano revisa cada pocos segundos si el centro de control
responde. Si responde, envía la cola por prioridad (1 alertas, 2 resúmenes,
3 detalle) y baja los resultados de laboratorio que capturaron en Tierra.
Si no responde, todo se queda guardado en nave.db y se reintenta después.
"""
import json, threading, time, urllib.request, urllib.error
from . import config, base_datos as bd

ESTADO = {"sin_senal": False, "en_linea": False, "ultimo_contacto": None, "error": None}
_al_recibir_resultado = None          # lo asigna el servidor (procesa muestras de Tierra)


def encolar(prioridad, resumen, datos=None):
    return bd.ejecutar("INSERT INTO cola_enlace(creado,prioridad,resumen,datos) VALUES(?,?,?,?)",
                       (bd.ahora(), int(prioridad), resumen, bd.js(datos or {})))


def resumen():
    pend = bd.fila("SELECT COUNT(*) n FROM cola_enlace WHERE enviado IS NULL")["n"]
    env = bd.fila("SELECT COUNT(*) n FROM cola_enlace WHERE enviado IS NOT NULL")["n"]
    ult = bd.filas("SELECT id,creado,prioridad,resumen,enviado FROM cola_enlace ORDER BY id DESC LIMIT 30")
    return dict(ESTADO, tierra_url=config.TIERRA_URL, pendientes=pend, enviados=env, ultimos=ult)


def _http(metodo, ruta, cuerpo=None, espera=3):
    datos = json.dumps(cuerpo, ensure_ascii=False).encode() if cuerpo is not None else None
    req = urllib.request.Request(config.TIERRA_URL + ruta, data=datos, method=metodo,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=espera) as r:
        return json.loads(r.read() or b"{}")


def _mision():
    m = bd.fila("SELECT nombre, destino FROM mision WHERE id=1")
    return m or {"nombre": "Sin misión", "destino": ""}


def _ciclo():
    if ESTADO["sin_senal"]:
        ESTADO["en_linea"] = False
        return
    try:
        _http("GET", "/api/ping", espera=2)
    except Exception as e:                       # sin conexión
        ESTADO["en_linea"] = False
        ESTADO["error"] = str(e)[:120]
        return
    ESTADO.update(en_linea=True, ultimo_contacto=bd.ahora(), error=None)
    m = _mision()
    pend = bd.filas("SELECT * FROM cola_enlace WHERE enviado IS NULL ORDER BY prioridad, id LIMIT 25")
    for p in pend:
        if ESTADO["sin_senal"]:
            return
        try:
            _http("POST", "/api/paquetes", {"nave": "Space First AID", "mision": m["nombre"], "destino": m["destino"],
                                            "creado": p["creado"], "prioridad": p["prioridad"], "resumen": p["resumen"],
                                            "datos": bd.dejs(p["datos"], {})})
            bd.ejecutar("UPDATE cola_enlace SET enviado=?, intentos=intentos+1 WHERE id=?", (bd.ahora(), p["id"]))
        except Exception:
            bd.ejecutar("UPDATE cola_enlace SET intentos=intentos+1 WHERE id=?", (p["id"],))
            break
    # resultados de laboratorio capturados en Tierra
    try:
        desde = int(bd.dejs((bd.fila("SELECT valor FROM estado WHERE clave='_tierra_resultado'") or {}).get("valor"), 0) or 0)
        nuevos = _http("GET", f"/api/resultados?desde={desde}")
        for r in nuevos.get("resultados", []):
            if _al_recibir_resultado:
                _al_recibir_resultado(r)
            desde = max(desde, int(r["id"]))
        bd.ejecutar("INSERT OR REPLACE INTO estado(clave,valor,actualizado) VALUES('_tierra_resultado',?,?)", (str(desde), bd.ahora()))
    except Exception:
        pass


def _bucle():
    while True:
        try:
            _ciclo()
        except Exception as e:
            ESTADO["error"] = str(e)[:120]
        time.sleep(config.INTERVALO_ENLACE_S)


def arrancar():
    threading.Thread(target=_bucle, name="enlace-tierra", daemon=True).start()
