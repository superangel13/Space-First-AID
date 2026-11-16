#!/usr/bin/env python3
"""
Space First AID · arranque
Prende la nave y el centro de control en Tierra en un solo programa y abre
la pantalla en el navegador. Es el mismo punto de entrada del ejecutable.

    python3 iniciar.py              # nave + Tierra en esta computadora
    python3 iniciar.py --solo-nave  # solo la nave (la Tierra corre en otra computadora: usa TIERRA_URL)
    python3 iniciar.py --sin-navegador

Si el puerto 8000 u 8766 está ocupado, usa el siguiente libre. Si ya hay una
nave de Space First AID corriendo, solo abre el navegador en ella.
"""
import json, os, socket, sys, threading, time, urllib.request, webbrowser


def _libre(puerto, host="127.0.0.1"):
    for p in range(puerto, puerto + 30):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((host, p))
                return p
            except OSError:
                continue
    raise SystemExit(f"No hay puertos libres a partir de {puerto}")


def _nave_existente(puerto):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{puerto}/api/salud", timeout=1.5) as r:
            return json.loads(r.read()).get("nave") == "Space First AID"
    except Exception:
        return False


def main():
    args = set(sys.argv[1:])
    puerto_nave = int(os.environ.get("NAVE_PUERTO") or os.environ.get("PORT") or 8000)
    if _nave_existente(puerto_nave):
        print(f"Space First AID ya está corriendo: abriendo http://localhost:{puerto_nave}")
        if "--sin-navegador" not in args:
            webbrowser.open(f"http://localhost:{puerto_nave}")
        return

    hilos = []
    if "--solo-nave" not in args:
        puerto_tierra = _libre(int(os.environ.get("TIERRA_PUERTO") or 8766))
        os.environ["TIERRA_PUERTO"] = str(puerto_tierra)
        os.environ.setdefault("TIERRA_URL", f"http://127.0.0.1:{puerto_tierra}")
        from tierra import centro_control
        hilos.append(centro_control.crear_servidor())
    puerto_nave = _libre(puerto_nave)
    os.environ["NAVE_PUERTO"] = str(puerto_nave)
    from nave import servidor                        # lee la configuración ya ajustada
    hilos.append(servidor.crear_servidor())
    for srv in hilos:
        threading.Thread(target=srv.serve_forever, daemon=True).start()

    url = f"http://localhost:{puerto_nave}"
    print(f"\nSpace First AID funcionando en {url}")
    print("Deja esta ventana abierta mientras usas la app. Para apagar: Ctrl+C o cierra la ventana.\n")
    if "--sin-navegador" not in args:
        time.sleep(0.6)
        webbrowser.open(url)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nApagando Space First AID…")
        for srv in hilos:
            srv.shutdown()


if __name__ == "__main__":
    main()
