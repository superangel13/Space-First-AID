#!/usr/bin/env python3
"""
Space First AID · arranque
Prende la nave (puerto 8000) y el centro de control en Tierra (puerto 8766)
y abre la pantalla en el navegador.

    python3 iniciar.py              # las dos partes en esta computadora
    python3 iniciar.py --solo-nave  # solo la nave (la Tierra corre en otra computadora)
    python3 iniciar.py --sin-navegador
"""
import os, subprocess, sys, time, webbrowser
from pathlib import Path

RAIZ = Path(__file__).resolve().parent


def main():
    args = set(sys.argv[1:])
    procesos = []
    # PORT (lo usan los servicios de hosting) es solo para la nave; la Tierra usa TIERRA_PUERTO.
    env_tierra = {k: v for k, v in os.environ.items() if k != "PORT"}
    if "--solo-nave" not in args:
        procesos.append(subprocess.Popen([sys.executable, "-m", "tierra.centro_control"], cwd=RAIZ, env=env_tierra))
    procesos.append(subprocess.Popen([sys.executable, "-m", "nave.servidor"], cwd=RAIZ))
    puerto = os.environ.get("PORT") or os.environ.get("NAVE_PUERTO", "8000")
    time.sleep(1.2)
    if "--sin-navegador" not in args:
        webbrowser.open(f"http://localhost:{puerto}")
    print("\nSpace First AID funcionando. Ctrl+C para apagar.\n")
    try:
        while all(p.poll() is None for p in procesos):
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        for p in procesos:
            p.terminate()


if __name__ == "__main__":
    main()
