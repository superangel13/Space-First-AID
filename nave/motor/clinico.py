"""
MOTOR CLÍNICO · estructura del ISS Medical Checklist de NASA (JSC-48522)
------------------------------------------------------------------------
Cada condición tiene 3 indicios (tríada) tomados de los SÍNTOMAS y SIGNOS
del checklist y de las fichas de condición médica de NASA.

    2 de 3 indicios = advertencia      3 de 3 = alerta con el protocolo
    Señal de alarma = alerta directa

Capa de descarte (evita advertencias falsas):
    need: indicios principales (al menos uno debe estar)
    gate: requisito de exposición (sin él, la condición no aplica)
    ex:   criterios de exclusión del checklist o la ficha (bajan un nivel)

Además del reporte de síntomas, el motor usa lo que está en la base de datos
de la nave: signos vitales del sensor y resultados de orina, sangre y saliva.
"""
import datetime
from ..datos import umbrales
from . import signos as SG

HRR = "https://humanresearchroadmap.nasa.gov/Evidence/medicalConditions/{}.pdf"


def CL(p, proc):
    return {"t": f"ISS Medical Checklist de NASA (JSC-48522), «{proc}», pág. {p}", "u": None}


def CD(n, es):
    return {"t": f"NASA · ficha de condición médica: {es}", "u": HRR.format(n)}


SX = {
    "cefalea": "Dolor de cabeza", "giro": "Sensación de giro al mover la cabeza", "mareo": "Mareo",
    "vision_cerca": "Veo borroso de cerca", "vision_dist": "Líneas torcidas o manchas en la vista",
    "ojo_arena": "Sensación de arena en el ojo", "ojo_rojo": "Ojo rojo o lagrimeo", "luz": "Me molesta la luz",
    "garganta": "Dolor de garganta", "congestion": "Nariz tapada o cara hinchada", "tos": "Tos",
    "rigidez_cuello": "Cuello rígido", "zumbido": "Zumbido en los oídos",
    "dolor_pecho": "Dolor u opresión en el pecho", "falta_aire": "Falta de aire", "palpitaciones": "Palpitaciones",
    "nausea": "Náusea", "vomito": "Vómito", "estomago": "Malestar de estómago o sin apetito",
    "dolor_abd": "Dolor en el abdomen bajo", "diarrea": "Diarrea",
    "ardor_orina": "Ardor o dolor al orinar", "orina_frec": "Orinar seguido, poco o con dificultad",
    "ingle": "Pesadez en la ingle", "dolor_lumbar": "Dolor en la espalda baja",
    "costado": "Dolor en un costado (zona del riñón)", "espasmo": "Espasmos o rigidez en la espalda",
    "irradia": "El dolor baja a las piernas", "dolor_articular": "Dolor en una articulación o hueso",
    "hinchazon": "Hinchazón", "no_mover": "No puedo mover o apoyar", "hormigueo": "Hormigueo o adormecimiento",
    "deformidad": "Se ve deformado", "ardor_piel": "Ardor u hormigueo en una franja de piel o labio",
    "ampollas": "Ampollas o llagas", "fiebre": "Fiebre o escalofríos", "sudor": "Sudor",
    "fatiga": "Cansancio fuera de lo normal", "saliva": "Exceso de saliva",
    "insomnio": "Me cuesta dormir o despierto mucho", "animo_bajo": "Ánimo bajo", "ansiedad": "Ansiedad o tensión",
    "irritable": "Irritable o con ganas de aislarme", "dano": "Pensamientos de hacerme daño",
}
NIV = lambda v: "intenso" if v >= 7 else "moderado" if v >= 4 else "leve"
ONS = {"hoy": "desde hoy", "d13": "desde hace 1 a 3 días", "mas": "desde hace más de 3 días"}
ORDEN_CUAL = ["negativo", "trazas", "+", "++", "+++"]


def _sxw(x):
    s = f"lo reportaste: {x['v']}/10 ({NIV(x['v'])})"
    if x.get("pat"):
        s += ", va y viene" if x["pat"] == "va" else ", constante"
    if x.get("on"):
        s += ", " + ONS.get(x["on"], "")
    return s


def _f1(v):
    return f"{v:.1f}"


class Contexto:
    """Todo lo que el motor sabe de un tripulante en este momento."""

    def __init__(self, d, labs=None):
        self.d = d
        U = umbrales()["clinico"]
        self.U = U
        self.c = d.get("tripulante") or {}
        self.items = d.get("sintomas") or {}
        self.preg = d.get("preguntas") or {}
        sen = d.get("sensor") or {}
        self.on = bool(sen.get("conectado"))
        self.v = sen.get("v") or {}
        self.e = d.get("dia_sensor") or {}          # sl (h de sueño), rt (PVT ms)
        self.D = d.get("dia") or {}                 # water (ml), ex (min)
        self.mm = d.get("mente") or {}              # val, team, cog
        self.bone = float(d.get("hueso_pct") or 0)
        self.g = float(d.get("gravedad") if d.get("gravedad") is not None else 1)
        self.day = int(d.get("dia_mision") or 1)
        self.co2 = float(d.get("co2_ppm") or 0)
        self.rad = float(d.get("rad_usvh") or 0)
        self.tormenta = bool(d.get("tormenta"))
        self.mind = d.get("atencion_pct")           # puntaje de atención (PVT) 0-100
        self.base_rt = d.get("pvt_base_ms")
        self.otros = d.get("otros") or {}           # {sintoma: [nombres]}
        self.vis = self.c.get("vis") or {}
        self.fd30 = self.c.get("fd30") or {}
        self.hora_utc = d.get("hora_utc")
        if self.hora_utc is None:
            self.hora_utc = datetime.datetime.now(datetime.timezone.utc).hour
        self.labs = labs or {}                      # {analito: {valor, origen, codigo}}

    # --- lectores ---
    def sx(self, i):
        x = self.items.get(i)
        if x and (x.get("v") or 0) > 0:
            return dict(x, id=i)
        return None

    def q(self, i):
        return self.preg.get(i) is True

    def hx(self, k):
        return k in (self.c.get("hx") or [])

    def fever(self):
        t = self.v.get("temp")
        if self.on and t is not None and t >= self.U["fiebre_c"]:
            return f"Sensor: {t:.1f} °C (fiebre en el checklist: más de {self.U['fiebre_c']} °C)"
        return None

    def ev(self, ids, f=None):
        for i in ids:
            x = self.sx(i)
            if x and (f is None or f(x)):
                return f"{SX[i]}: {_sxw(x)}"
        return None

    def lab(self, analito, desde="+"):
        """Texto si el resultado cualitativo del analito es igual o mayor que 'desde'."""
        r = self.labs.get(analito)
        if not r or r.get("valor") not in ORDEN_CUAL:
            return None
        if ORDEN_CUAL.index(r["valor"]) >= ORDEN_CUAL.index(desde):
            o = "laboratorio en Tierra" if r.get("origen") == "tierra" else "análisis a bordo"
            return f"Muestra {r.get('codigo', '')}: {r['nombre'].lower()} {r['valor']} ({o})"
        return None

    def vit_nivel(self, k):
        if not self.on:
            return 0
        if k == "bp":
            return max(SG.nivel("sbp", self.v.get("sbp")), SG.nivel("dbp", self.v.get("dbp")))
        return SG.nivel(k, self.v.get(k))

    def grav3(self):
        return self.day <= 5 or self.q("grav3")


def _orina_sangre(I):
    if I.q("orina_sangre"):
        return "Respondiste que tu orina se ve turbia o con sangre"
    return I.lab("sangre", "trazas")


def _sl_bajo(I):
    sl = I.e.get("sl")
    return sl is not None and sl < I.U["sueno_bajo_h"]


def _atencion_baja(I):
    return I.mind is not None and I.mind < I.U["atencion_baja_pct"]


# ---------------------------------------------------------------------------
# Base de conocimiento: 16 condiciones
# ---------------------------------------------------------------------------
def _sans_cerca(I):
    t = I.ev(["vision_cerca"])
    if t:
        return t
    ref = (I.fd30.get("OI") or {}).get("near") or 5
    for o in ("OI", "OD"):
        x = I.vis.get(o) or {}
        if x.get("near") is not None and x["near"] > ref + 2:
            return f"Prueba de lectura de cerca: lees letra N{x['near']} (en el día 30 leías N{ref})"
    return None


def _sans_amsler(I):
    for o in ("OI", "OD"):
        x = I.vis.get(o) or {}
        if x.get("am") == "marcas":
            pct = f" ({x['amPct']:.1f} % de la rejilla)" if x.get("amPct") else ""
            return f"Prueba de Amsler, ojo {'izquierdo' if o == 'OI' else 'derecho'}: zonas marcadas{pct}"
    return I.ev(["vision_dist"])


def _sans_agudeza(I):
    for o in ("OI", "OD"):
        x = I.vis.get(o) or {}
        ref = (I.fd30.get(o) or {}).get("lm") or 0
        if x.get("lm") is not None and x["lm"] >= ref + 0.2:
            return (f"Prueba de agudeza, ojo {'izquierdo' if o == 'OI' else 'derecho'}: logMAR {x['lm']:.1f} "
                    f"contra {ref:.1f} en el día 30 (2 líneas o más)")
    return None


def _cefalea_red(I):
    x = I.sx("cefalea")
    if not x:
        return None
    w = [i for i in ("vision_dist", "vision_cerca", "zumbido", "rigidez_cuello", "luz") if I.sx(i)]
    if w:
        return "Dolor de cabeza con señal de alarma del checklist: " + ", ".join(SX[i].lower() for i in w)
    if x["v"] >= I.U["dolor_muy_intenso"]:
        return "Dolor de cabeza intenso"
    return None


def _cefalea_co2(I):
    if I.co2 > I.U["co2_alto_ppm"]:
        return f"Cabina: CO₂ {round(I.co2):,} ppm".replace(",", " ")
    o = I.otros.get("cefalea") or []
    return f"También reportan dolor de cabeza: {', '.join(o)}" if o else None


def _pecho_vitales(I):
    if I.on and (I.vit_nivel("hr") or I.vit_nivel("bp")):
        return f"Sensor: pulso {round(I.v.get('hr', 0))} lpm, presión {round(I.v.get('sbp', 0))}/{round(I.v.get('dbp', 0))}"
    return None


def _cognicion(I):
    if _atencion_baja(I):
        return f"Órbita (PVT-B): {I.e.get('rt')} ms contra {I.base_rt} ms de tu normal"
    cog = I.mm.get("cog")
    if cog is not None and cog < I.U["cognicion_baja_pct"]:
        return f"Juegos de Mente: {round(cog)} % de tu línea base"
    return None


KB = [
    {"id": "renal", "n": "Cálculo renal", "sys": "Riñón y vías urinarias", "part": "kidney", "urgent": 1,
     "src": [CL(366, "KIDNEY STONES"), CD("Nephrolithiasis", "Nefrolitiasis")],
     "t": [["Dolor de costado, espalda baja o ingle que va y viene",
            lambda I: I.ev(["costado", "dolor_lumbar"], lambda x: x.get("pat") == "va") or I.ev(["ingle"]),
            "Checklist · síntomas: “Back/flank pain”, “Contracting pain (pain coming and going)”, “Feeling of heaviness in groin”"],
           ["Cambios al orinar: ardor, orinar seguido u orina turbia o con sangre",
            lambda I: I.ev(["ardor_orina", "orina_frec"]) or _orina_sangre(I),
            "Checklist · síntoma “Painful urination” y signos “Cloudy or bloody urine”, “Frequent or difficult urination”"],
           ["Náusea o vómito", lambda I: I.ev(["nausea", "vomito"]), "Checklist · síntomas: “Nausea”, “Vomiting”"]],
     "ctx": [lambda I: (f"Hoy llevas {I.D['water'] / 1000:.1f} L de agua (meta {I.U['agua_meta_ml'] / 1000:.1f} L): la deshidratación relativa es factor de riesgo según NASA"
                        if I.D.get("water") is not None and I.D["water"] < I.U["agua_baja_ml"] else None),
             lambda I: "Antecedente de cálculos renales" if I.hx("rinon") else None,
             lambda I: f"Pérdida ósea estimada {I.bone:.1f} %: NASA señala que el calcio liberado del hueso favorece los cálculos",
             lambda I: I.lab("sangre", "trazas")],
     "red": [lambda I: ("Dolor intenso con fiebre" if (lambda x: x and x["v"] >= I.U["dolor_muy_intenso"] and (I.fever() or I.sx("fiebre")))(I.sx("costado") or I.sx("dolor_lumbar")) else None)],
     "note": "Si el dolor es constante y hay fiebre, también se evalúa infección urinaria o renal.",
     "steps": ["Analiza la orina con la tira reactiva y anota el resultado.", "Llama al cirujano de vuelo, pero no retrases el tratamiento si el dolor es intenso.",
               "Si puedes beber, toma toda el agua posible; si no, suero intravenoso a 1 L por hora.", "Analgésico y antináusea solo según el cirujano de vuelo.", "Ultrasonido renal si está disponible."],
     "need": [0],
     "ex": [lambda I: ("Dolor constante con fiebre: el checklist lo describe en infección urinaria o renal («Pain is constant»), no en cálculo"
                       if (lambda x: x and x.get("pat") == "const" and (I.fever() or I.sx("fiebre")))(I.sx("costado") or I.sx("dolor_lumbar")) else None)]},

    {"id": "uti", "n": "Infección urinaria o renal", "sys": "Riñón y vías urinarias", "part": "kidney",
     "src": [CL(268, "BLADDER/KIDNEY INFECTION"), CD("Urinary_Tract_Infection", "Infección urinaria")],
     "t": [["Ardor o espasmos al orinar", lambda I: I.ev(["ardor_orina"]), "Checklist · síntomas: “Painful urination”, “Bladder spasms”"],
           ["Orinar seguido y poco, u orina turbia o con sangre",
            lambda I: I.ev(["orina_frec"]) or _orina_sangre(I) or I.lab("nitritos") or I.lab("leucocitos"),
            "Checklist · signos: “Frequent urination”, “Small volume of urine”, “Cloudy or bloody urine”"],
           ["Fiebre o dolor constante de costado",
            lambda I: I.fever() or I.ev(["fiebre"]) or I.ev(["costado", "dolor_lumbar"], lambda x: x.get("pat") == "const"),
            "Checklist · síntomas: “Fever may or may not be present”, “Back pain/flank pain”, “Pain is constant”"]],
     "ctx": [lambda I: f"Poca agua hoy ({I.D['water'] / 1000:.1f} L)" if I.D.get("water") is not None and I.D["water"] < I.U["agua_baja_ml"] else None,
             lambda I: I.lab("nitritos"), lambda I: I.lab("leucocitos")],
     "steps": ["Analiza la orina con la tira reactiva.", "Bebe al menos 1 L extra de agua al día.", "Antibiótico solo según el cirujano de vuelo.", "Mide la temperatura cada 4 horas."],
     "need": [0, 1]},

    {"id": "sms", "n": "Mareo espacial", "sys": "Equilibrio y oído", "part": "ear",
     "src": [CL(376, "MOTION SICKNESS"), CD("Space_Motion_Sickness_(Space_Adaptation)", "Mareo espacial (60 a 80 % de los viajeros en sus primeros 2 a 3 días)")],
     "t": [["Náusea, malestar de estómago o vómito", lambda I: I.ev(["nausea", "estomago", "vomito"]), "Checklist · síntomas: “Stomach awareness”, “Nausea”, “Vomiting”, “Decreased appetite”"],
           ["Sensación de giro que empeora al mover la cabeza", lambda I: I.ev(["giro", "mareo"]), "Checklist · síntoma: “Head-spinning sensation (worsens with head movement)”"],
           ["Sudor, exceso de saliva o dolor de cabeza", lambda I: I.ev(["sudor", "saliva", "cefalea"]), "Checklist · síntomas: “Excess salivation”, “Sweating”, “Headache”"]],
     "ctx": [lambda I: f"Gravedad actual {I.g:.2f} g: cada cambio de gravedad puede provocarlo" if I.g != 1 else None],
     "steps": ["Mantente hidratado y come blando.", "Muévete despacio y limita los movimientos de cabeza.", "Enfría la cabina.", "Antináusea según el caso: leve, o moderado a severo."],
     "need": [0, 1],
     "gate": [lambda I: None if I.grav3() else "Sin cambio de gravedad en los últimos 3 días: la ficha de NASA ubica el mareo espacial en los primeros 2 a 3 días de un cambio de gravedad"]},

    {"id": "espalda", "n": "Dolor de espalda por adaptación", "sys": "Músculo y hueso", "part": "spine",
     "src": [CL(240, "BACK PAIN"), CD("Back_Pain_(Space_Adaptation)", "Dolor de espalda por adaptación (la columna se alarga 1 a 2 %)")],
     "t": [["Dolor en la espalda baja, localizado", lambda I: I.ev(["dolor_lumbar"]), "Ficha NASA: dolor “localized, non-radiating”"],
           ["Espasmos o rigidez en los músculos de la columna", lambda I: I.ev(["espasmo"]), "Ficha NASA: “spasmodic, involving the paravertebral muscles”"],
           ["Mejora al encogerte (rodillas al pecho)", lambda I: "Respondiste que mejora al encogerte" if I.q("encoger") else None,
            "Ficha NASA: alivio con flexión de columna en posición fetal; checklist: “Knee to chest position”"]],
     "red": [lambda I: "Dolor que baja a las piernas con hormigueo o tras una caída: posible lesión de columna" if I.sx("irradia") and (I.sx("hormigueo") or I.q("caida")) else None],
     "note": "Si el dolor baja a las piernas, hay adormecimiento o fue tras una caída, ya no es dolor de adaptación: se escala.",
     "steps": ["Posición de rodillas al pecho.", "Analgésico antiinflamatorio según el cirujano de vuelo.", "Avisa si el dolor baja a las piernas o hay adormecimiento."],
     "need": [0],
     "ex": [lambda I: "Empezó tras una caída: se evalúa como lesión, no como adaptación" if I.q("caida") else None,
            lambda I: "Ya pasó la etapa de adaptación (la ficha de NASA dice que cede en los primeros días): considerar otras causas" if not I.grav3() and I.day > 10 else None]},

    {"id": "esguince", "n": "Esguince o distensión", "sys": "Músculo y hueso", "part": "legs",
     "src": [CL(452, "STRAINS/SPRAINS"), CD("Extremity_Sprains_Strains", "Esguinces y distensiones")],
     "t": [["Dolor en una articulación o músculo", lambda I: I.ev(["dolor_articular"]), "Checklist «STRAINS/SPRAINS»"],
           ["Hinchazón", lambda I: I.ev(["hinchazon"]), "Checklist «STRAINS/SPRAINS»"],
           ["Empezó tras un esfuerzo, ejercicio o golpe",
            lambda I: "Respondiste que empezó tras un esfuerzo o ejercicio" if I.q("esfuerzo") else ("Respondiste que te caíste o golpeaste" if I.q("caida") else None),
            "Checklist «STRAINS/SPRAINS»"]],
     "steps": ["Frío local: toalla con agua fría 10 minutos.", "Reposo de la zona.", "Analgésico según el cirujano de vuelo."],
     "need": [0],
     "ex": [lambda I: "No puedes mover o hay deformidad: se evalúa como posible fractura" if I.sx("no_mover") or I.sx("deformidad") else None]},

    {"id": "fractura", "n": "Posible fractura", "sys": "Músculo y hueso", "part": "legs", "urgent": 1,
     "src": [CL(348, "FRACTURE/DISLOCATION - BROKEN BONE"), CD("Hip_Lower_Extremity_Fracture", "Fractura de cadera o extremidad inferior"), CD("Osteoporosis", "Osteoporosis")],
     "t": [["Caída o golpe fuerte", lambda I: "Respondiste que te caíste o golpeaste" if I.q("caida") else None, "Ficha NASA: caídas durante caminatas en superficie planetaria"],
           ["Dolor intenso en un hueso (7 de 10 o más)", lambda I: I.ev(["dolor_articular", "dolor_lumbar"], lambda x: x["v"] >= I.U["dolor_intenso"]), "Escala numérica de dolor 0 a 10"],
           ["No puedes mover o apoyar, o hay deformidad", lambda I: I.ev(["no_mover", "deformidad"]), "Checklist «FRACTURE/DISLOCATION»"]],
     "ctx": [lambda I: f"Pérdida ósea estimada {I.bone:.1f} %: NASA indica que la pérdida de hueso baja la fuerza necesaria para fracturar",
             lambda I: "Prótesis de cadera" if I.hx("cadera") else None],
     "red": [lambda I: "Deformidad con hormigueo: revisa pulso y sensibilidad más allá de la lesión" if I.ev(["deformidad"]) and I.ev(["hormigueo"]) else None],
     "steps": ["Signos vitales cada 5 minutos.", "No muevas la zona: inmoviliza con férula.", "Revisa pulso y sensibilidad más allá de la lesión.", "Si hay herida, detén el sangrado y cúbrela.", "Llama al cirujano de vuelo."],
     "gate": [lambda I: None if I.q("caida") or I.sx("deformidad") else "Sin caída, golpe ni deformidad: la ficha de NASA dice que una fractura en vuelo requiere un trauma"]},

    {"id": "sans", "n": "Cambio neuro-ocular (SANS)", "sys": "Vista", "part": "eyes",
     "src": [{"t": "NASA · Reporte de evidencia SANS 2022: los astronautas reportaron visión de cerca alterada (desplazamiento hipermetrópico de +0.50 D o más)",
              "u": "https://humanresearchroadmap.nasa.gov/evidence/reports/SANS%20EB%202022%20FINAL_8-15-22.pdf"},
             CD("Visual_Impairment_Intracranial_Hypertension", "Deterioro visual e hipertensión intracraneal"),
             {"t": "NASA · Agudeza y Amsler en la ISS los días 30, 90 y R-30", "u": "https://ntrs.nasa.gov/citations/20180004916"}],
     "t": [["Visión de cerca borrosa", _sans_cerca, "Reporte SANS: “reported changes in their near visual acuity”"],
           ["Cambios en la rejilla de Amsler", _sans_amsler, "Prueba de Amsler del protocolo SANS de la ISS"],
           ["Agudeza menor que en el día 30", _sans_agudeza, "Prueba de agudeza del protocolo SANS de la ISS"]],
     "ctx": [lambda I: f"{I.day} días en la misión, {round(I.g * 100) / 100} g",
             lambda I: "Antecedente de cambios oculares (Zwart 2016: más riesgo con ciertos genotipos)" if I.hx("ojo") else None],
     "red": [lambda I: "Cambio en la vista con dolor de cabeza intenso" if I.ev(["vision_dist"]) and I.ev(["cefalea"], lambda x: x["v"] >= I.U["dolor_intenso"]) else None],
     "steps": ["Repite agudeza y Amsler con cada ojo.", "Usa lentes de ajuste (+) si ves borroso de cerca.", "Ultrasonido ocular y revisión del fondo de ojo u OCT si están disponibles.", "Reporta al cirujano de vuelo y repite la revisión cada semana."]},

    {"id": "cefalea", "n": "Dolor de cabeza", "sys": "Cabeza y sistema nervioso", "part": "brain",
     "src": [CL(358, "HEADACHE"), CD("Headache", "Dolor de cabeza: adaptación al espacio o CO₂ alto")],
     "t": [["Dolor de cabeza", lambda I: I.ev(["cefalea"]), "Checklist «HEADACHE»"],
           ["CO₂ alto o varios tripulantes con dolor de cabeza", _cefalea_co2, "Checklist: si más de un tripulante tiene dolor de cabeza a la vez, muestrear el aire (CO₂ y combustión)"],
           ["Cara hinchada o nariz tapada por el paso de líquidos a la cabeza", lambda I: I.ev(["congestion"]), "Checklist: “headward fluid shift and Space Motion Sickness may lead to headaches”"]],
     "red": [_cefalea_red],
     "note": "Señales de alarma del checklist: cambios en la vista, zumbido de oídos, náusea o vómito sin mareo espacial, cambios de personalidad, cuello rígido, molestia con la luz, o dolor intenso o más frecuente.",
     "steps": ["Revisa el CO₂: si varios tienen dolor, mide el aire con el monitor de CO₂ y el analizador de gases.", "Aumenta la ventilación de tu zona de dormir.",
               "Analgésico leve si no hay señales de alarma.", "Con cualquier señal de alarma: conferencia médica privada y cirujano de vuelo de inmediato."],
     "need": [0]},

    {"id": "dcs", "n": "Enfermedad por descompresión", "sys": "Caminatas espaciales", "part": "legs", "urgent": 1,
     "src": [CL(250, "BENDS - DECOMPRESSION SICKNESS: DCS"), CD("Decompression_Sickness", "Enfermedad por descompresión")],
     "t": [["Caminata espacial en las últimas 24 h", lambda I: "Respondiste que hiciste caminata espacial en las últimas 24 h" if I.q("eva24") else None, "Ficha NASA: riesgo al bajar la presión durante la caminata espacial"],
           ["Dolor en articulaciones o extremidades", lambda I: I.ev(["dolor_articular"]), "Ficha NASA: “joint and limb pain”"],
           ["Hormigueo, adormecimiento, mareo o cansancio inusual", lambda I: I.ev(["hormigueo", "mareo", "fatiga"]), "Ficha NASA: “paresthesias, numbness, dizziness, fatigue”"]],
     "steps": ["Avisa de inmediato al oficial médico y al centro de control.", "Haz el examen de la tarjeta DCS: conciencia, orientación, habla, fuerza, sensibilidad; repítelo.",
               "Oxígeno al 100 % y tratamiento con presión según el cirujano de vuelo."],
     "gate": [lambda I: None if I.q("eva24") else "Sin caminata espacial ni cambio de presión en 24 h: la descompresión requiere esa exposición (ficha de NASA)"]},

    {"id": "resp", "n": "Infección respiratoria", "sys": "Respiración", "part": "lungs",
     "src": [CL(324, "COUGH"), CL(442, "SORE THROAT"), CD("Respiratory_Infection", "Infección respiratoria")],
     "t": [["Tos", lambda I: I.ev(["tos"]), "Checklist «COUGH»"],
           ["Dolor de garganta o nariz tapada", lambda I: I.ev(["garganta", "congestion"]), "Checklist «SORE THROAT» y «NOSE CONGESTION»"],
           ["Fiebre de más de 37.8 °C", lambda I: I.fever() or I.ev(["fiebre"]), "Checklist: “If temperature > 37.8 °C (100 °F), contact Surgeon”"]],
     "steps": ["Bebe más líquidos.", "Si la tos tiene flema o hay fiebre, llama al cirujano de vuelo.", "Mide temperatura y oxígeno cada 4 horas.", "Cubrebocas en áreas comunes."]},

    {"id": "herpes", "n": "Reactivación de herpes", "sys": "Piel y defensas", "part": "body",
     "src": [CD("Herpes_Zoster_Simplex_Reactivation", "Reactivación de herpes zóster o simple")],
     "t": [["Ardor u hormigueo en una franja de piel o en el labio", lambda I: I.ev(["ardor_piel"]), "Ficha NASA: dolor o ardor que puede empezar antes de las ampollas"],
           ["Ampollas o llagas", lambda I: I.ev(["ampollas"]), "Ficha NASA: erupción de ampollas a lo largo del dermatoma; llagas en el labio"],
           ["Defensas bajo presión: dormiste menos de 6 h o hay virus en la saliva",
            lambda I: (f"Sensor: dormiste {I.e['sl']:.1f} h" if _sl_bajo(I) else None) or I.lab("vzv") or I.lab("hsv1") or I.lab("ebv"),
            "NASA: el vuelo espacial reactiva virus latentes (Agha 2020)"]],
     "ctx": [lambda I: I.lab("vzv"), lambda I: I.lab("hsv1"), lambda I: I.lab("ebv")],
     "steps": ["Antiviral idealmente en las primeras 72 horas, según el cirujano de vuelo.", "No toques ni rasques las lesiones.", "Muestra de saliva si está disponible."],
     "need": [0, 1]},

    {"id": "insomnio", "n": "Insomnio", "sys": "Sueño y conducta", "part": "brain",
     "src": [CL(436, "SLEEPING PROBLEMS - INSOMNIA"), CD("Insomnia_(Early_Late)", "Insomnio temprano y tardío")],
     "t": [["Te cuesta dormir o despiertas mucho", lambda I: I.ev(["insomnio"]), "Ficha NASA: dificultad para conciliar o mantener el sueño"],
           ["Dormiste menos de 6 h", lambda I: f"Sensor: dormiste {I.e['sl']:.1f} h anoche" if _sl_bajo(I) else None, "Reporte de sueño de NASA: 6.1 h promedio en la ISS"],
           ["Atención más lenta de día", lambda I: f"Órbita (PVT-B): tu reacción fue {I.e.get('rt')} ms contra {I.base_rt} ms de tu normal" if _atencion_baja(I) else None,
            "La PVT es la prueba más sensible a la falta de sueño (NASA)"]],
     "ctx": [lambda I: "Insomnio tardío (después del día 5): horarios, ruido, luz, temperatura o estrés" if I.day > 5 else "Insomnio temprano (días 1 a 5): suele resolverse al adaptarse"],
     "steps": ["Revisa horario, luz, ruido y temperatura de tu cabina.", "Evita pantallas antes de dormir; usa la guía de sueño del Panel.",
               "Si necesitas medicamento más de unas noches, se decide con el cirujano de vuelo."],
     # El indicio principal es "te cuesta dormir": sin él, dormir poco y reaccionar lento no bastan.
     "need": [0]},

    {"id": "pecho", "n": "Dolor de pecho", "sys": "Corazón", "part": "heart", "urgent": 1,
     "src": [CL(30, "CHEST PAIN - ACUTE")],
     "t": [["Dolor u opresión en el pecho", lambda I: I.ev(["dolor_pecho"]), "Checklist «CHEST PAIN - ACUTE»"],
           ["Falta de aire, sudor o náusea", lambda I: I.ev(["falta_aire", "sudor", "nausea"]), "Checklist «CHEST PAIN - ACUTE»"],
           ["Pulso o presión fuera de rango", _pecho_vitales, "Checklist: signos vitales cada 5 minutos y ECG"]],
     "red": [lambda I: "Dolor de pecho intenso" if (lambda x: x and x["v"] >= I.U["dolor_intenso"])(I.sx("dolor_pecho")) else None],
     "steps": ["Detén toda actividad y avisa al oficial médico.", "Describe el dolor: dónde, cómo es y desde cuándo.", "Signos vitales cada 5 minutos y ECG.", "Llama al cirujano de vuelo; vía intravenosa según indicación."],
     "need": [0]},

    {"id": "radiacion", "n": "Síndrome agudo por radiación", "sys": "Radiación", "part": "body", "urgent": 1,
     "src": [CD("Radiation_Sickness", "Enfermedad por radiación: fase prodrómica con náusea, vómito, fatiga y diarrea")],
     "t": [["Exposición: tormenta solar en curso", lambda I: f"Radiación en la cabina: {round(I.rad)} µSv/h" if I.tormenta else None, "Ficha NASA: riesgo ante un evento de partículas solares"],
           ["Náusea o vómito", lambda I: I.ev(["nausea", "vomito"]), "Ficha NASA: fase prodrómica"],
           ["Cansancio fuera de lo normal o diarrea", lambda I: I.ev(["fatiga", "diarrea"]), "Ficha NASA: fase prodrómica"]],
     "steps": ["Al refugio blindado mientras siga la tormenta.", "Registra la lectura de tu dosímetro.", "Hidratación y antináusea según el cirujano de vuelo.", "Análisis de sangre si está disponible."],
     "gate": [lambda I: None if I.tormenta or I.q("dosis") else "Sin tormenta solar ni dosis alta registrada: la ficha de NASA requiere una exposición aguda"]},

    {"id": "conducta", "n": "Cambio conductual", "sys": "Sueño y conducta", "part": "brain",
     "src": [{"t": "NASA · Reporte de salud conductual (2025): cambio adverso = baja en ánimo, cognición, moral o convivencia que afecta el desempeño",
              "u": "https://humanresearchroadmap.nasa.gov/evidence/reports/HRP-ER-BMED-HFBP-20250210.pdf"}, CL(489, "BEHAVIORAL"), CL(422, "PRIVATE MEDICAL CONFERENCE")],
     "t": [["Ánimo bajo o ansiedad",
            lambda I: (f"Check-in de ánimo: tus últimos días están en {round((I.mm['val'] + 1) * 50)}/100"
                       if I.mm.get("val") is not None and I.mm["val"] < I.U["animo_bajo"] else I.ev(["animo_bajo", "ansiedad"], lambda x: x["v"] >= 4)),
            "Definición NASA: baja en el ánimo"],
           ["Cognición más lenta", _cognicion, "Definición NASA: baja en la cognición"],
           ["Moral o convivencia baja",
            lambda I: (f"Check-in de convivencia: {I.mm['team']:.1f} de 5" if I.mm.get("team") is not None and I.mm["team"] <= I.U["convivencia_baja"] else I.ev(["irritable"])),
            "Definición NASA: baja en la moral o la convivencia"]],
     "red": [lambda I: "Pensamientos de hacerse daño" if I.sx("dano") else None],
     "steps": ["Conferencia médica privada con el psicólogo de vuelo.", "Ajusta la carga de trabajo y el horario de sueño.", "Contacto con familia y actividades en equipo.",
               "Si hay pensamientos de hacerse daño: no quedarse solo y avisar de inmediato al oficial médico."]},

    {"id": "hueso", "n": "Pérdida de hueso y músculo", "sys": "Músculo y hueso", "part": "bones",
     "src": [{"t": "NASA · Reporte de evidencia de osteoporosis: pérdida de densidad ósea de 1 a 1.5 % por mes en misiones largas",
              "u": "https://humanresearchroadmap.nasa.gov/evidence/reports/Osteo.pdf"}, CD("Osteoporosis", "Osteoporosis")],
     "t": [["Pérdida ósea estimada mayor a 1.5 %",
            lambda I: f"Modelo de la misión: {I.bone:.1f} % a la fecha (1 a 1.5 % por mes en microgravedad; en 0.17 g el modelo usa la mitad)" if I.bone > I.U["hueso_perdida_pct"] else None,
            "Reporte de osteoporosis de NASA"],
           ["Ejercicio por debajo de la meta (se evalúa al final del día)",
            lambda I: (f"Mi día: {I.D['ex']} min de ejercicio hoy (meta {I.U['ejercicio_meta_min']})"
                       if I.hora_utc >= I.U["hora_cierre_dia_utc"] and I.D.get("ex") is not None and I.D["ex"] < I.U["ejercicio_bajo_min"] else None),
            "NASA: el ejercicio de resistencia es la principal protección del hueso"],
           ["Caída, o dolor de espalda o articulaciones intenso o de más de 3 días",
            lambda I: "Respondiste que te caíste" if I.q("caida") else I.ev(["dolor_lumbar", "dolor_articular"], lambda x: x["v"] >= I.U["dolor_intenso"] or x.get("on") == "mas"),
            "Ficha NASA de osteoporosis: el problema médico aparece con la fractura"]],
     "ctx": [lambda I: (f"Muestra {I.labs['calcio']['codigo']}: calcio en orina {I.labs['calcio']['valor']} mg/día, arriba de lo normal"
                        if (I.labs.get("calcio") or {}).get("alto") else None)],
     "steps": ["Ejercicio de resistencia todos los días.", "Calcio y vitamina D en la dieta.", "Evita cargas bruscas y saltos en la superficie lunar.", "Densitometría o ultrasonido óseo al regreso."],
     "need": [2]},
]


def _run(fs, I):
    out = []
    for f in fs or []:
        try:
            r = f(I)
        except Exception:
            r = None
        if r:
            out.append(r)
    return out


def _presentas(r):
    k = r["k"]
    miss = [x["n"].lower() for x in r["cr"] if not x["w"]]
    if r["red"] and r["hit"] < 3:
        return f"Presentas una señal de alarma de {k['n'].lower()}: {r['red'][0].lower()}."
    if r["lvl"] == 2:
        return f"Presentas los 3 indicios de {k['n'].lower()}."
    if r["lvl"] == 1:
        return f"Presentas 2 de 3 indicios de {k['n'].lower()}. Si aparece también {' y '.join(miss)}, se vuelve alerta."
    if r["desc"]:
        d = r["desc"][0]
        return f"Se descarta por ahora: {d[0].lower() + d[1:]}."
    return "Un indicio aislado: no basta para una conclusión." if r["hit"] else ""


def evaluar(contexto, labs=None):
    """Evalúa las 16 condiciones. Devuelve la lista ordenada por nivel."""
    I = Contexto(contexto, labs)
    res = []
    for k in KB:
        cr = []
        for n, f, s in k["t"]:
            try:
                w = f(I)
            except Exception:
                w = None
            cr.append({"n": n, "w": w or None, "s": s})
        hit = sum(1 for x in cr if x["w"])
        red, ctx, gate, ex = (_run(k.get(x), I) for x in ("red", "ctx", "gate", "ex"))
        desc = []
        lvl = 2 if hit >= 3 else 1 if hit == 2 else 0
        if gate:
            if lvl:
                desc += gate
            lvl = 0
        elif k.get("need") and not any(cr[i]["w"] for i in k["need"]):
            if lvl:
                desc.append("Falta el indicio principal: " + " o ".join(k["t"][i][0].lower() for i in k["need"]))
            lvl = 0
        elif ex and lvl:
            lvl -= 1
            desc += ex
        if red and not gate:
            lvl = 2
        info = {x: k.get(x) for x in ("id", "n", "sys", "part", "src", "note", "steps")}
        info["urgent"] = bool(k.get("urgent"))
        r = {"k": info, "cr": cr, "hit": hit, "red": [] if gate else red, "ctx": ctx, "lvl": lvl, "desc": desc, "gate": gate}
        r["presentas"] = _presentas(r)
        res.append(r)
    res.sort(key=lambda r: (-r["lvl"], -r["hit"]))
    return res
