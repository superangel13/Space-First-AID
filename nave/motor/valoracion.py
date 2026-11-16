"""Interpreta muestras de orina, sangre y saliva con los rangos del documento de
parámetros (datos/muestras.json). Los rangos pueden ser distintos para hombre y mujer.
Regla: si una muestra tiene resultado del laboratorio en Tierra, ese manda sobre el
análisis previo hecho a bordo."""
from ..datos import cargar


def parametros():
    return cargar("muestras")


def _por_sexo(v, sexo):
    if isinstance(v, dict):
        return v.get("m" if sexo == "f" else "h")
    return v


def rango(a, sexo):
    return _por_sexo(a.get("min"), sexo), _por_sexo(a.get("max"), sexo)


def texto_rango(a, sexo):
    lo, hi = rango(a, sexo)
    u = a.get("unidad", "")
    if a.get("basal"):
        return "se compara con tu basal"
    if lo is not None and hi is not None:
        return f"{lo} a {hi} {u}".strip()
    if hi is not None:
        return f"menos de {hi} {u}".strip()
    if lo is not None:
        return f"más de {lo} {u}".strip()
    return ""


def interpretar_analito(a, valor, sexo):
    """{valor, nivel, lado, texto, nombre, unidad, problemas} o None."""
    if valor in (None, ""):
        return None
    base = {"nombre": a["nombre"], "unidad": a.get("unidad", ""), "problemas": a.get("problemas", [])}
    if a["tipo"] == "cual":
        normal = a.get("normal")
        anormal = str(valor) != normal
        return dict(base, valor=valor, nivel=1 if anormal else 0, lado="alto" if anormal else None,
                    texto=(f"{valor}: {a.get('sube', '')}" if anormal else f"{valor} (normal)"))
    try:
        v = float(valor)
    except (TypeError, ValueError):
        return None
    if a.get("basal"):
        return dict(base, valor=v, nivel=0, lado=None, texto="Registrado: se compara con tu basal")
    lo, hi = rango(a, sexo)
    lado = "bajo" if lo is not None and v < lo else "alto" if hi is not None and v > hi else None
    if lado == "alto" and a.get("solo_baja"):
        lado = None
    meta = None
    if a.get("meta_min") is not None and v < a["meta_min"]:
        meta = "bajo_meta"
    if a.get("meta_max") is not None and v > a["meta_max"]:
        meta = "alto_meta"
    nivel = 0
    if lado:
        nivel = 1
        lim = lo if lado == "bajo" else hi
        if lim and abs(v - lim) / abs(lim) > 0.25:      # muy lejos del rango
            nivel = 2
    if lado == "bajo":
        texto = f"Bajo ({texto_rango(a, sexo)}): {a.get('baja', '')}"
    elif lado == "alto":
        texto = f"Alto ({texto_rango(a, sexo)}): {a.get('sube', '')}"
    elif meta:
        texto = f"Dentro del rango, pero fuera de la meta en el espacio ({a.get('espacio', '')})"
    else:
        texto = f"Dentro del rango ({texto_rango(a, sexo)})"
    return dict(base, valor=v, nivel=nivel, lado=lado, meta=meta, texto=texto)


def interpretar(tipo, valores, sexo=None):
    P = parametros()["tipos"][tipo]
    res, nivel = {}, 0
    for a in P["analitos"]:
        r = interpretar_analito(a, valores.get(a["id"]), sexo)
        if r:
            res[a["id"]] = r
            nivel = max(nivel, r["nivel"])
    fuera = [r["nombre"] for r in res.values() if r["nivel"]]
    resumen = "Todo dentro del rango" if not fuera else "Fuera de rango: " + ", ".join(fuera)
    return {"analitos": res, "nivel": nivel, "resumen": resumen}


def vigentes(muestras):
    """Por código, Tierra gana sobre a bordo; entre iguales, la más reciente."""
    por_codigo = {}
    for m in muestras:
        k = m["codigo"]
        prev = por_codigo.get(k)
        rank = (1 if m["origen"] == "tierra" else 0, m["id"])
        if not prev or rank > (1 if prev["origen"] == "tierra" else 0, prev["id"]):
            por_codigo[k] = m
    return sorted(por_codigo.values(), key=lambda m: m["id"], reverse=True)


def labs_para_motor(muestras_vigentes):
    """Último valor de cada analito (para que el motor clínico lo cruce)."""
    out = {}
    for m in muestras_vigentes:
        for aid, r in ((m.get("resultado") or {}).get("analitos") or {}).items():
            if aid not in out:
                out[aid] = dict(r, origen=m["origen"], codigo=m["codigo"])
    return out
