#!/usr/bin/env python3
"""Prueba del motor clínico con la metodología del documento de parámetros.
- Una persona sana no debe tener alertas.
- Cada signo o síntoma solo no debe dar alerta (se necesitan 2 o más indicadores).
- Con todos los indicadores de un problema se activa la emergencia (nivel 2).
Uso: python3 herramientas/prueba_motor.py"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from nave.motor import clinico

SANO = {"sintomas": {}, "dia_sensor": {"sl": 7.4}, "dia": {"water": 2500}, "hueso_pct": 0.9, "dias_microgravedad": 10}


def alertas(ctx, labs=None, auto=None, pruebas=None):
    res, _ = clinico.evaluar(ctx, labs or {}, auto or {}, pruebas or {})
    return {r["k"]["id"]: r["lvl"] for r in res if r["lvl"]}


def completo(p):
    """Datos que cumplen todos los indicadores de un problema."""
    ctx = dict(SANO, sintomas={}, dia=dict(SANO["dia"]), dia_sensor=dict(SANO["dia_sensor"]))
    labs, auto, pruebas = {}, {}, {}
    for ind in p["indicadores"]:
        t = ind["tipo"]
        if t == "sintoma":
            ctx["sintomas"][ind["id"]] = {"v": 7}
        elif t == "sueno":
            ctx["dia_sensor"]["sl"] = 5.5
        elif t == "auto":
            auto[ind["id"]] = ind["mayor"] + 5 if "mayor" in ind else 3
        elif t == "prueba":
            pruebas[ind["id"]] = 50
        elif t == "lab":
            for a in ind["analitos"]:
                labs[a] = {"nombre": a, "valor": 1, "lado": "alto" if ind["dir"] == "alto" else "bajo", "meta": "bajo_meta", "problemas": []}
        elif t == "contexto":
            if ind["id"] == "agua_ml":
                ctx["dia"]["water"] = 1000
            elif ind["id"] in ("tormenta", "dosimetro"):
                ctx[ind["id"]] = True
            else:
                ctx[ind["id"]] = ind["min"] * 1.2
    return ctx, labs, auto, pruebas


def main():
    fallos = 0
    base = alertas(SANO)
    print("Persona sana:", base or "sin alertas")
    fallos += bool(base)
    solos = {s["id"]: alertas(dict(SANO, sintomas={s["id"]: {"v": 6}})) for s in clinico.base()["sintomas"]}
    con = {k: v for k, v in solos.items() if v}
    print("Signos o síntomas solos con alerta:", con or "ninguno")
    fallos += bool(con)
    for p in clinico.base()["problemas"]:
        r = alertas(*completo(p))
        ok = r.get(p["id"]) == 2
        fallos += not ok
        print(f"  {'OK ' if ok else 'FALLA'} {p['n']}: todos los indicadores → {'emergencia' if ok else r.get(p['id'])}")
    sys.exit(1 if fallos else 0)


if __name__ == "__main__":
    main()
