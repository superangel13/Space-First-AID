"""Interpreta muestras de orina, sangre y saliva con datos/muestras.json.
Regla: si una muestra tiene resultado del laboratorio en Tierra, ese manda
sobre el análisis previo hecho a bordo."""
from ..datos import cargar

ESCALA = ["negativo", "trazas", "+", "++", "+++"]


def parametros():
    return cargar("muestras")


def _fuera(v, rango, lado):
    if not rango:
        return False
    lo, hi = rango
    return (lo is not None and v < lo) if lado == "bajo" else (hi is not None and v > hi)


def interpretar_analito(a, valor):
    """Devuelve {valor, nivel, texto, alto} para un analito."""
    if valor in (None, ""):
        return None
    if a["tipo"] == "cual":
        if valor not in ESCALA:
            return None
        i = ESCALA.index(valor)
        nivel = 2 if "critico_desde" in a and i >= ESCALA.index(a["critico_desde"]) else \
                1 if "aviso_desde" in a and i >= ESCALA.index(a["aviso_desde"]) else 0
        texto = "Negativo" if i == 0 else f"Positivo ({valor})" if nivel else f"{valor}"
        return {"valor": valor, "nivel": nivel, "texto": texto + (f" · {a['nota']}" if nivel and a.get("nota") else ""), "alto": nivel > 0}
    try:
        v = float(valor)
    except (TypeError, ValueError):
        return None
    nivel, lado = 0, None
    for lado_ in ("bajo", "alto"):
        if _fuera(v, a.get("critico"), lado_):
            nivel, lado = 2, lado_
            break
    if not nivel:
        for lado_ in ("bajo", "alto"):
            if _fuera(v, a.get("aviso"), lado_):
                nivel, lado = 1, lado_
                break
    if not nivel:
        for lado_ in ("bajo", "alto"):
            if _fuera(v, a.get("normal"), lado_):
                lado = lado_
                break
    lo, hi = a.get("normal", [None, None])
    rango = f"normal {lo} a {hi} {a.get('unidad', '')}".strip()
    if lado is None:
        texto = f"Dentro de lo normal ({rango})"
    else:
        texto = f"{'Alto' if lado == 'alto' else 'Bajo'} ({rango})"
        if lado == "alto" and a.get("nota_alto"):
            texto += f" · {a['nota_alto']}"
    return {"valor": v, "nivel": nivel, "texto": texto, "alto": lado == "alto", "fuera": lado is not None}


def interpretar(tipo, valores):
    P = parametros()["tipos"][tipo]
    res, nivel = {}, 0
    for a in P["analitos"]:
        r = interpretar_analito(a, valores.get(a["id"]))
        if r:
            r["nombre"] = a["nombre"]
            r["unidad"] = a.get("unidad", "")
            res[a["id"]] = r
            nivel = max(nivel, r["nivel"])
    fuera = [r["nombre"] for r in res.values() if r["nivel"] or r.get("fuera")]
    resumen = "Todo dentro de lo normal" if not fuera else "Fuera de rango: " + ", ".join(fuera)
    return {"analitos": res, "nivel": nivel, "resumen": resumen}


def vigentes(muestras):
    """De todas las muestras de un tripulante, se queda con la versión que manda:
    por código, Tierra gana sobre a bordo; entre iguales, la más reciente."""
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
    for m in muestras_vigentes:                       # ya vienen de la más nueva a la más vieja
        for aid, r in ((m.get("resultado") or {}).get("analitos") or {}).items():
            if aid not in out:
                out[aid] = dict(r, origen=m["origen"], codigo=m["codigo"])
    return out
