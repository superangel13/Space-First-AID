"""Arma el diccionario español → inglés que usa la app.

Fuentes (todas en herramientas/i18n/):
  - lote*.txt   «número|English», con el número de textos_es.json (salida de extraer_textos.py);
  - pares.txt   «español<TAB>English», para lo que se agrega a mano (por ejemplo, textos
                que la app arma al vuelo y que window.SFA_I18N.faltan() reporta).
Resultado:
  - herramientas/i18n/en.json  diccionario completo (se conserva lo que ya tenía);
  - app/i18n/en.js             el mismo diccionario para la pantalla (window.SFA_EN).

    python3 herramientas/i18n/fusionar.py
"""
import json
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
DIC = AQUI / "en.json"
JS = RAIZ / "app" / "i18n" / "en.js"


def main():
    dic = json.loads(DIC.read_text(encoding="utf-8")) if DIC.exists() else {}
    textos_f = AQUI / "textos_es.json"
    lotes = sorted(AQUI.glob("lote*.txt"))
    if lotes and textos_f.exists():
        textos = list(json.loads(textos_f.read_text(encoding="utf-8")))
        for f in lotes:
            for linea in f.read_text(encoding="utf-8").splitlines():
                if "|" not in linea:
                    continue
                n, en = linea.split("|", 1)
                if n.strip().isdigit() and en.strip():
                    dic[textos[int(n)]] = en.strip()
    pares = AQUI / "pares.txt"
    if pares.exists():
        for linea in pares.read_text(encoding="utf-8").splitlines():
            if "\t" in linea and not linea.startswith("#"):
                es, en = linea.split("\t", 1)
                if es.strip() and en.strip():
                    dic[" ".join(es.split())] = en.strip()
    dic = dict(sorted(dic.items()))
    DIC.write_text(json.dumps(dic, ensure_ascii=False, indent=0), encoding="utf-8")
    JS.parent.mkdir(parents=True, exist_ok=True)
    JS.write_text(
        "/* Diccionario español → English de Space First AID. Se genera con herramientas/i18n/fusionar.py */\n"
        "window.SFA_EN = " + json.dumps(dic, ensure_ascii=False, indent=0) + ";\n",
        encoding="utf-8",
    )
    print(len(dic), "traducciones →", DIC.relative_to(RAIZ), "y", JS.relative_to(RAIZ))


if __name__ == "__main__":
    main()
