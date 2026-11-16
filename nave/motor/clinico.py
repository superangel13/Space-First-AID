"""
MOTOR CLÍNICO · metodología del documento «Parámetros completo» del equipo
---------------------------------------------------------------------------
Cada problema (datos/problemas.json) tiene:
  signos y síntomas (indicadores), sistema afectado, explicación,
  contramedida y protocolo, y parámetros estables.

    Algunos indicadores (2 o más)  = alerta
    Todos los indicadores          = emergencia con el protocolo

Los indicadores salen de lo que la nave sabe de cada tripulante: síntomas y
signos registrados, muestras de orina, sangre y saliva, pruebas (Órbita PVT,
coordinación ojo-mano, prueba de visión), registro personal (carga de trabajo,
estrés PSS-10, ánimo y trabajo en equipo), horas de sueño y el contexto de la
misión (microgravedad, pérdida ósea, tormenta solar, dosímetro).

También calcula cómo está cada sistema del cuerpo (0 a 100): inmunológico,
cardiovascular, neuro-ocular, cognitivo-conductual, radiación y musculoesquelético.
"""
from ..datos import cargar

DOC = "Documento de parámetros"


def base():
    return cargar("problemas")


def _sintomas_catalogo():
    return {s["id"]: s for s in base()["sintomas"]}


class Contexto:
    def __init__(self, d, labs, auto, pruebas):
        self.d = d
        self.items = d.get("sintomas") or {}
        self.labs = labs or {}
        self.auto = auto or {}
        self.pruebas = pruebas or {}
        self.sl = (d.get("dia_sensor") or {}).get("sl")
        self.agua = (d.get("dia") or {}).get("water")
        self.cat = _sintomas_catalogo()

    def sx(self, i):
        x = self.items.get(i)
        return x if x and (x.get("v") or 0) > 0 else None

    def sx_texto(self, i):
        x = self.sx(i)
        if not x:
            return None
        n = self.cat.get(i, {}).get("n", i)
        return f"{n}: lo registraste ({x['v']}/10)"

    def lab(self, analitos, direccion):
        for a in analitos:
            r = self.labs.get(a)
            if not r:
                continue
            ok = (direccion == "alto" and r.get("lado") == "alto") or (direccion == "bajo" and r.get("lado") == "bajo") \
                or (direccion == "bajo_meta" and (r.get("lado") == "bajo" or r.get("meta") == "bajo_meta"))
            if ok:
                origen = "laboratorio en Tierra" if r.get("origen") == "tierra" else "análisis a bordo"
                return f"Muestra {r.get('codigo', '')}: {r['nombre'].lower()} {r['valor']} {r.get('unidad', '')} ({origen})".replace("  ", " ")
        return None


def _indicador(ind, I):
    t = ind["tipo"]
    if t == "sintoma":
        return I.sx_texto(ind["id"])
    if t == "sin_sintomas":
        c = I.sx("cefalea")
        if any(I.sx(i) for i in ind.get("ids", [])) or (c and c["v"] > ind.get("cefalea_max", 6)):
            return None
        return "Sin cefalea intensa ni zumbido de oído registrados"
    if t == "sueno":
        if I.sl is not None and I.sl < ind["max"]:
            return f"Sensor: dormiste {I.sl:.1f} h (parámetro: 7 h o más)"
        return I.sx_texto("mal_sueno")
    if t == "auto":
        v = I.auto.get(ind["id"])
        nombre = base()["autoreporte"][ind["id"]]["n"]
        if v is not None:
            if "mayor" in ind and v > ind["mayor"]:
                return f"Registro personal · {nombre}: {v:g}"
            if "menor_igual" in ind and v <= ind["menor_igual"]:
                return f"Registro personal · {nombre}: {v:g} de 10"
        return I.sx_texto(ind["o_sintoma"]) if ind.get("o_sintoma") else None
    if t == "prueba":
        v = I.pruebas.get(ind["id"])
        if v is not None and v < ind["menor"]:
            nombres = {"pvt": "Órbita (PVT)", "alcance": "Coordinación ojo-mano", "vision_c": "Prueba de visión"}
            return f"{nombres.get(ind['id'], ind['id'])}: {round(v)} % (menos de {ind['menor']} %)"
        return None
    if t == "lab":
        return I.lab(ind["analitos"], ind["dir"])
    if t == "contexto":
        k = ind["id"]
        v = I.d.get(k)
        if k == "agua_ml":
            v = I.agua
            if v is not None and v <= ind["max"]:
                return f"Hoy llevas {v / 1000:.1f} L de agua"
            o = ind.get("o_lab")
            return I.lab(o["analitos"], o["dir"]) if o else None
        if k in ("tormenta", "dosimetro"):
            if v:
                return "Tormenta solar en curso o reciente" if k == "tormenta" else "El dosímetro marcó dosis alta"
            return None
        if v is None:
            return None
        if "min" in ind and v >= ind["min"]:
            if k == "dias_microgravedad":
                return f"{round(v)} días en microgravedad ({v / 30:.1f} meses)"
            if k == "hueso_pct":
                return f"Pérdida ósea estimada {v:.1f} % (modelo de la misión)"
            return f"{k}: {v}"
        return None
    return None


def _contexto_labs(p, I):
    out = []
    for aid, r in I.labs.items():
        if p["id"] in (r.get("problemas") or []) and r.get("nivel"):
            out.append(f"Muestra {r.get('codigo', '')}: {r['nombre']} {r['valor']} {r.get('unidad', '')} · {r['texto']}")
    return out


def _presentas(n, hit, total, lvl):
    if lvl == 2:
        return f"Presentas todos los indicadores de {n.lower()} ({hit} de {total}). Se activa el protocolo de emergencia."
    if lvl == 1:
        return f"Presentas {hit} de {total} indicadores de {n.lower()}. Si aparecen todos, se activa la emergencia."
    return "Un indicador aislado: no basta para una alerta." if hit else ""


def calcular_sistemas(res, I, d):
    """Estado de cada sistema del cuerpo, de 0 a 100."""
    B = base()
    pen = {s: 0.0 for s in B["sistemas"]}
    motivos = {s: [] for s in B["sistemas"]}
    prob_sis = {p["id"]: p["sistemas"] for p in B["problemas"]}
    for r in res:
        for s in r["k"]["sistemas"]:
            if r["lvl"] == 2:
                pen[s] += 60
            elif r["lvl"] == 1:
                pen[s] += 15 + 25 * r["hit"] / r["total"]
            elif r["hit"]:
                pen[s] += 4
            if r["lvl"]:
                motivos[s].append(r["k"]["n"])
    for aid, lab in I.labs.items():
        if lab.get("nivel"):
            for p in lab.get("problemas") or []:
                for s in prob_sis.get(p, []):
                    pen[s] += 6
    pr = I.pruebas
    if pr.get("alcance") is not None and pr["alcance"] < 70:
        pen["musculo"] += 15; pen["cognitivo"] += 15
        motivos["musculo"].append("Coordinación ojo-mano baja"); motivos["cognitivo"].append("Coordinación ojo-mano baja")
    if pr.get("vision_c") is not None and pr["vision_c"] < 70:
        pen["neuro_ocular"] += 20; motivos["neuro_ocular"].append("Prueba de visión baja")
    if pr.get("pvt") is not None and pr["pvt"] < 70:
        pen["cognitivo"] += 20; motivos["cognitivo"].append("Órbita (PVT) baja: sueño")
    a = I.auto
    if a.get("pss") is not None:
        pen["inmunologico"] += 15 if a["pss"] >= 27 else 8 if a["pss"] >= 14 else 0
    if a.get("carga") is not None and a["carga"] > 70:
        pen["cognitivo"] += 10
    for k in ("animo", "equipo"):
        if a.get(k) is not None and a[k] <= 4:
            pen["cognitivo"] += 10
    dosis = d.get("dosis_msv")
    if dosis:
        pen["radiacion"] += min(40, dosis / 600 * 40)
    if d.get("tormenta"):
        pen["radiacion"] += 30; motivos["radiacion"].append("Tormenta solar")
    out = {}
    for s, info in B["sistemas"].items():
        v = max(0, min(100, round(100 - pen[s])))
        out[s] = {"n": info["nombre"], "col": info["color"], "valor": v,
                  "nivel": 0 if v >= 80 else 1 if v >= 60 else 2, "motivos": motivos[s][:4]}
    return out


def evaluar(contexto, labs=None, auto=None, pruebas=None):
    """Evalúa los problemas del documento. Devuelve (resultados, sistemas)."""
    B = base()
    I = Contexto(contexto, labs, auto, pruebas)
    nombres_sis = {k: v["nombre"] for k, v in B["sistemas"].items()}
    res = []
    for p in B["problemas"]:
        cr = []
        for ind in p["indicadores"]:
            try:
                w = _indicador(ind, I)
            except Exception:
                w = None
            cr.append({"n": ind["n"], "w": w, "s": f"{DOC} · {p['sistema_doc']}"})
        hit, total = sum(1 for x in cr if x["w"]), len(cr)
        lvl = 2 if hit == total else 1 if hit >= 2 else 0
        if p.get("requiere") and not any(cr[i]["w"] for i in p["requiere"]):
            lvl = 0                      # sin la exposición necesaria no aplica (p. ej., radiación sin tormenta)
        k = {"id": p["id"], "n": p["n"], "sys": " · ".join(nombres_sis[s] for s in p["sistemas"]), "sistemas": p["sistemas"],
             "part": p["parte"], "note": p["explicacion"], "explicacion": p["explicacion"], "steps": p["protocolo"],
             "protocolo": p["protocolo"], "parametros": p["parametros"], "urgent": True,
             "src": [B["fuentes"][f] for f in p["fuentes"]] + [B["fuentes"]["tabla"]]}
        r = {"k": k, "cr": cr, "hit": hit, "total": total, "red": [], "ctx": _contexto_labs(p, I), "lvl": lvl, "desc": [], "gate": []}
        r["presentas"] = _presentas(p["n"], hit, total, lvl)
        res.append(r)
    res.sort(key=lambda r: (-r["lvl"], -r["hit"] / r["total"]))
    return res, calcular_sistemas(res, I, contexto)
