#!/usr/bin/env python3
"""
Construye el ejecutable de Space First AID con PyInstaller.

    pip install pyinstaller pillow
    python herramientas/construir_ejecutable.py

Resultado en dist/:
  - Windows: SpaceFirstAID.exe
  - macOS:   SpaceFirstAID (doble clic: se abre en la Terminal) y un .zip para compartir
  - Linux:   SpaceFirstAID

Cada sistema construye su propio ejecutable (el de Windows se arma en Windows).
El flujo de GitHub (.github/workflows/ejecutables.yml) los arma los tres solo.
Las bases de datos del ejecutable se guardan en la carpeta del usuario:
  macOS  ~/Library/Application Support/Space First AID
  Windows %APPDATA%\\Space First AID
  Linux  ~/.local/share/Space First AID
"""
import os, platform, shutil, subprocess, sys, zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SEP = os.pathsep                       # ";" en Windows, ":" en macOS y Linux
NOMBRE = "SpaceFirstAID"


def main():
    os.chdir(RAIZ)
    # --motor: solo el motor (Python + SQLite), sin pantalla, para el programa de escritorio
    # de Electron (escritorio/), que trae su propia pantalla en React.
    solo_motor = "--motor" in sys.argv
    datos = [("datos", "datos"), ("nave/esquema.sql", "nave")] + ([] if solo_motor else [("app", "app")])
    salida = str(RAIZ / "escritorio" / "motor") if solo_motor else "dist"
    cmd = [sys.executable, "-m", "PyInstaller", "iniciar.py", "--onefile", "--console", "--noconfirm", "--clean",
           "--name", NOMBRE, "--distpath", salida, "--workpath", "build", "--specpath", "build",
           "--collect-submodules", "nave", "--collect-submodules", "tierra"]
    for src, dst in datos:
        cmd += ["--add-data", f"{RAIZ / src}{SEP}{dst}"]
    icono = RAIZ / "app" / "media" / "icono.png"
    if icono.exists():
        cmd += ["--icon", str(icono)]          # PyInstaller lo convierte a .ico / .icns con Pillow
    print("Construyendo:", " ".join(cmd[3:8]), "…")
    subprocess.run(cmd, check=True)

    if solo_motor:
        print(f"\nMotor listo en {salida}")
        return
    exe = RAIZ / "dist" / (NOMBRE + (".exe" if os.name == "nt" else ""))
    sistema = {"Darwin": "macOS", "Windows": "Windows", "Linux": "Linux"}.get(platform.system(), platform.system())
    arq = platform.machine().lower().replace("x86_64", "x64").replace("amd64", "x64")
    paquete = RAIZ / "dist" / f"{NOMBRE}-{sistema}-{arq}.zip"
    leeme = ("Space First AID\n\n"
             "1. Abre el programa con doble clic.\n"
             "2. Se abre una ventana de texto (déjala abierta) y el navegador con la app.\n"
             "3. Para apagar, cierra esa ventana.\n\n"
             "Funciona sin internet. La nave queda en http://localhost:8000 y el centro de control en http://localhost:8766.\n"
             "Los datos se guardan en la carpeta «Space First AID» de tu usuario.\n")
    if sistema == "macOS":
        leeme += ("\nmacOS: si dice que el desarrollador no está identificado, haz clic derecho en el programa → Abrir → Abrir.\n")
    with zipfile.ZipFile(paquete, "w", zipfile.ZIP_DEFLATED) as z:
        info = zipfile.ZipInfo(exe.name)
        info.external_attr = 0o755 << 16       # conserva el permiso de ejecución
        info.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(info, exe.read_bytes())
        z.writestr("LEEME.txt", leeme)
    print(f"\nListo: {exe}  ({exe.stat().st_size / 1e6:.0f} MB)\nPara compartir: {paquete}")


if __name__ == "__main__":
    if not shutil.which("pyinstaller") and subprocess.run([sys.executable, "-c", "import PyInstaller"]).returncode:
        sys.exit("Falta PyInstaller: pip install pyinstaller pillow")
    main()
