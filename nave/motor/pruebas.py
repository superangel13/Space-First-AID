"""Interpreta las pruebas. Todas (menos «¿Cómo te sientes?») dan una calificación
de 0 a 100 %. Con menos de 70 % se manda una alerta y se afecta el sistema:
  - Órbita (PVT): sueño (fatiga crónica de misión)
  - Coordinación ojo-mano: musculoesquelético y cognitivo
  - Prueba de visión: neuro-ocular (SANS)"""
from statistics import median

LIMITE = 70
PRUEBAS = {
    "pvt": {"n": "Órbita · PVT", "unidad": "%", "afecta": "el sueño (fatiga crónica de misión)"},
    "alcance": {"n": "Coordinación ojo-mano", "unidad": "%", "afecta": "los sistemas musculoesquelético y cognitivo"},
    "trazo": {"n": "Círculo con la mano", "unidad": "%", "afecta": "la motricidad fina"},
    "vision_c": {"n": "Prueba de visión", "unidad": "%", "afecta": "el sistema neuro-ocular (SANS)"},
    "animo": {"n": "¿Cómo te sientes?", "unidad": "", "afecta": None},
    "bart": {"n": "Globos (riesgo)", "unidad": "%", "afecta": None},
    "ert": {"n": "Emociones", "unidad": "%", "afecta": None},
    "nback": {"n": "Memoria 2-back", "unidad": "%", "afecta": None},
}


def interpretar(prueba, puntaje, detalle, historial):
    meta = PRUEBAS.get(prueba, {"n": prueba, "unidad": "", "afecta": None})
    base_h = [h for h in historial if h is not None][:3]
    base = median(base_h) if base_h else None
    nivel, msg = 0, ""
    if prueba == "animo" or puntaje is None:
        msg = "Registro guardado."
    elif puntaje < LIMITE:
        nivel = 1
        msg = f"Calificación de {round(puntaje)} %: menos de {LIMITE} %. Se manda una alerta"
        msg += f" y se afecta {meta['afecta']}." if meta.get("afecta") else "."
    else:
        msg = f"Calificación de {round(puntaje)} %: dentro de lo esperado."
        if base:
            dif = (puntaje - base) / abs(base) * 100
            msg += f" ({'+' if dif >= 0 else ''}{dif:.0f} % contra tu línea base)."
    return {"prueba": prueba, "nombre": meta["n"], "unidad": meta["unidad"], "puntaje": puntaje, "base": base,
            "nivel": nivel, "mensaje": msg, "limite": LIMITE}
