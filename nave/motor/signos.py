"""Clasifica signos vitales con los umbrales de datos/umbrales.json.
0 = normal, 1 = aviso, 2 = crítico."""
from ..datos import umbrales


def nivel(clave, valor):
    if valor is None:
        return 0
    u = umbrales()["signos"].get(clave)
    if not u:
        return 0
    v = valor if clave == "temp" else round(valor)
    igual = u.get("critico_incluye_igual", False)
    if "critico_alto" in u and v >= u["critico_alto"]:
        return 2
    if "critico_bajo" in u and (v <= u["critico_bajo"] if igual else v < u["critico_bajo"]):
        return 2
    if "aviso_alto" in u and v >= u["aviso_alto"]:
        return 1
    if "aviso_bajo" in u and v < u["aviso_bajo"]:
        return 1
    return 0


def evaluar(v):
    """v: {hr, spo2, sbp, dbp, temp, rr} -> {clave: nivel, 'max': nivel}"""
    r = {k: nivel(k, v.get(k)) for k in ("hr", "spo2", "sbp", "dbp", "temp", "rr")}
    r["bp"] = max(r["sbp"], r["dbp"])
    r["max"] = max(r.values())
    return r
