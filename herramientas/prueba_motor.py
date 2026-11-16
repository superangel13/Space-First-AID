#!/usr/bin/env python3
"""Prueba de falsas alarmas del motor clínico (Python).
Persona sana + cada síntoma solo + cada par de síntomas + casos clínicos típicos.
Uso: python3 herramientas/prueba_motor.py [--json]"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from nave.motor import clinico

BASE = {"tripulante": {"id": "x", "hx": [], "vis": {"OI": {"am": "ok", "lm": 0, "near": 5}, "OD": {"am": "ok", "lm": 0, "near": 5}},
                       "fd30": {"OI": {"lm": 0, "near": 5}, "OD": {"lm": 0, "near": 5}}},
        "sensor": {"conectado": True, "v": {"hr": 62, "sbp": 116, "dbp": 75, "temp": 36.6, "spo2": 98, "rr": 14}},
        "dia_sensor": {"sl": 7.3, "rt": 290}, "dia": {"water": 2500, "ex": 90}, "mente": {"val": .4, "team": 4, "cog": 100},
        "hueso_pct": .9, "gravedad": .17, "dia_mision": 42, "co2_ppm": 2300, "rad_usvh": 25, "tormenta": False,
        "atencion_pct": 95, "pvt_base_ms": 290}


def run(items, q=None):
    ctx = dict(BASE, sintomas=items, preguntas=q or {})
    return [r["k"]["id"] + ("!" if r["lvl"] == 2 else "") for r in clinico.evaluar(ctx) if r["lvl"] >= 1]


def P(v, pat=None, on="hoy"):
    return {"v": v, "pat": pat, "on": on}


CASOS = {
    "Cálculo renal típico (cólico, náusea, orina con sangre)": ({"costado": P(8, "va"), "nausea": P(5)}, {"orina_sangre": True}, "renal!"),
    "Cálculo renal incompleto (cólico y náusea)": ({"costado": P(6, "va"), "nausea": P(4)}, {}, "renal"),
    "Infección urinaria (ardor, orinar seguido, fiebre)": ({"ardor_orina": P(6), "orina_frec": P(5), "fiebre": P(5)}, {}, "uti!"),
    "Mareo espacial tras descenso": ({"nausea": P(6), "giro": P(7), "sudor": P(4)}, {"grav3": True}, "sms!"),
    "Caída en la Luna con dolor intenso y sin poder apoyar": ({"dolor_articular": P(8, "const"), "no_mover": P(7)}, {"caida": True}, "fractura!"),
    "Descompresión tras caminata espacial": ({"dolor_articular": P(6, "const"), "hormigueo": P(5)}, {"eva24": True}, "dcs!"),
    "Dolor de pecho con falta de aire": ({"dolor_pecho": P(6), "falta_aire": P(5)}, {}, "pecho"),
    "Infección respiratoria": ({"tos": P(5), "garganta": P(5), "fiebre": P(5)}, {}, "resp!"),
    "Herpes (ardor en franja y ampollas)": ({"ardor_piel": P(5), "ampollas": P(5)}, {}, "herpes"),
}


def main():
    ids = [i for i in clinico.SX if i != "dano"]
    out = {"base": run({}), "single": {}, "pairs": 0, "pairsWarn": 0, "byCond": {}, "casos": {}}
    for a in ids:
        r = run({a: P(5, "va" if a in PAIN else None)})
        if r:
            out["single"][a] = r
    for i, a in enumerate(ids):
        for b in ids[i + 1:]:
            r = [x for x in run({a: P(5, "va" if a in PAIN else None), b: P(5, "va" if b in PAIN else None)}) if x not in out["base"]]
            out["pairs"] += 1
            if r:
                out["pairsWarn"] += 1
                for x in r:
                    out["byCond"].setdefault(x.rstrip("!"), []).append(f"{a}+{b}")
    fallos = 0
    for n, (it, q, esperado) in CASOS.items():
        r = run(it, q)
        ok = esperado in r
        fallos += not ok
        out["casos"][n] = {"resultado": r, "esperado": esperado, "ok": ok}
    if "--json" in sys.argv:
        print(json.dumps(out, ensure_ascii=False))
        return
    print(f"Persona sana: {out['base'] or 'sin hallazgos'}")
    print(f"Síntomas solos con hallazgo: {out['single'] or 'ninguno'}")
    print(f"Pares de síntomas: {out['pairs']} · con advertencia: {out['pairsWarn']}")
    for k, v in out["byCond"].items():
        print(f"  {k}: {len(v)} pares")
    for n, c in out["casos"].items():
        print(f"  {'OK ' if c['ok'] else 'FALLA'} {n} → {c['resultado']}")
    sys.exit(1 if fallos or out["base"] or out["single"] else 0)


PAIN = {"cefalea", "ojo_arena", "garganta", "dolor_pecho", "dolor_abd", "ingle", "dolor_lumbar", "costado", "dolor_articular"}
if __name__ == "__main__":
    main()
