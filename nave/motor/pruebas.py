"""Interpreta las pruebas (Órbita PVT, visión, coordinación, ánimo, juegos de
cognición) comparando con la línea base personal: las primeras sesiones."""
from statistics import median
from ..datos import umbrales

PRUEBAS = {
    "pvt":      {"n": "Órbita · PVT", "menor_mejor": True, "unidad": "ms"},
    "alcance":  {"n": "Seguir puntos con la mano", "menor_mejor": False, "unidad": "pts"},
    "trazo":    {"n": "Círculo con la mano", "menor_mejor": False, "unidad": "pts"},
    "vision_c": {"n": "La C abierta (agudeza y contraste)", "menor_mejor": False, "unidad": "pts"},
    "amsler":   {"n": "Rejilla de Amsler", "menor_mejor": True, "unidad": "zonas"},
    "animo":    {"n": "¿Cómo te sientes?", "menor_mejor": False, "unidad": "/100"},
    "bart":     {"n": "Globos (riesgo)", "menor_mejor": False, "unidad": "pts"},
    "ert":      {"n": "Emociones", "menor_mejor": False, "unidad": "%"},
    "nback":    {"n": "Memoria 2-back", "menor_mejor": False, "unidad": "%"},
}


def interpretar(prueba, puntaje, detalle, historial):
    """historial: puntajes anteriores (del más viejo al más nuevo)."""
    U = umbrales()["pruebas"]
    meta = PRUEBAS.get(prueba, {"n": prueba, "menor_mejor": False, "unidad": ""})
    base_h = [h for h in historial if h is not None][: U["sesiones_base"]]
    base = median(base_h) if base_h else None
    nivel, msg, dif = 0, "", None
    if prueba == "amsler":
        nivel = 1 if (puntaje or 0) > 0 else 0
        msg = ("Marcaste zonas alteradas. Puede ser un cambio en la retina (SANS): repite con el otro ojo y avisa al oficial médico."
               if nivel else "Sin distorsiones. Repite cada semana con cada ojo.")
    elif prueba == "pvt":
        lap = (detalle or {}).get("lapsos", 0) or 0
        if lap >= U["pvt_lapsos_critico"]:
            nivel, msg = 2, f"{lap} lapsos (respuestas de más de {U['pvt_lapso_ms']} ms): señal fuerte de fatiga. Evita tareas críticas y descansa."
        elif lap >= U["pvt_lapsos_aviso"]:
            nivel, msg = 1, f"{lap} lapsos: tu atención está más lenta de lo normal. Revisa tu sueño."
    if base not in (None, 0) and puntaje is not None and prueba != "amsler":
        dif = (puntaje - base) / abs(base) * 100
        peor = dif if meta["menor_mejor"] else -dif
        if peor > U["peor_que_base_pct"] and nivel == 0:
            nivel = 1
            msg = (f"Tu resultado es {peor:.0f} % peor que tu línea base. Puede deberse a fatiga, poco sueño o adaptación "
                   f"sensoriomotora. Repite mañana; si sigue igual 3 sesiones, avisa al oficial médico.")
        elif not msg:
            msg = f"Dentro de tu rango habitual ({'+' if dif > 0 else ''}{dif:.0f} % contra tu línea base)."
    elif not msg:
        msg = "Primera sesión: se guarda como parte de tu línea base."
    if prueba == "vision_c" and (detalle or {}).get("contraste_pct", 0) > U["contraste_alto_pct"] and nivel == 0:
        nivel = 1
        msg += " El contraste mínimo que distingues es alto: conviene un examen de vista."
    return {"prueba": prueba, "nombre": meta["n"], "unidad": meta["unidad"], "puntaje": puntaje, "base": base,
            "diferencia_pct": None if dif is None else round(dif, 1), "nivel": nivel, "mensaje": msg}
