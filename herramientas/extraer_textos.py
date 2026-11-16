"""Saca todos los textos en español que puede ver la persona usuaria.

Recorre la pantalla (escritorio/src), los datos (datos/*.json) y el motor (nave/, tierra/),
y escribe herramientas/i18n/textos_es.json con cada texto único y dónde aparece.
Los textos con partes que cambian (${x} en JavaScript, {x} en Python) quedan como
plantillas con {0}, {1}…, que el traductor reconoce en la pantalla.

    python3 herramientas/extraer_textos.py
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "herramientas" / "i18n" / "textos_es.json"

ACENTO = re.compile(r"[áéíóúñüÁÉÍÓÚÑÜ¿¡]")
PALABRAS_ES = re.compile(
    r"\b(de|la|el|los|las|que|con|para|sin|por|del|una|uno|en|y|es|se|al|su|sus|más|menos|no|si|o|a|un|hay|está|son|tu|te|ver|cada|todo|todos|día|días)\b",
    re.I,
)
CODIGO = re.compile(r"(=>|[{};]|\bvar\(|\bpx\b|^#|\.js\b|\.json\b|https?:|^\s*[.#]?[a-z0-9_-]+\s*$|^[\w.-]+/[\w./-]+$)")
ETIQUETA = re.compile(r"<[^>]*>")
INTERP_JS = re.compile(r"\$\{(?:[^{}]|\{[^{}]*\})*\}")


def parece_texto(s):
    s = s.strip()
    if len(s) < 2 or not re.search(r"[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}", s):
        return False
    if s.startswith(("http", "/api", "/datos", "./", "../", "data:", "M ", "M0", "M1")):
        return False
    if CODIGO.search(s) and not ACENTO.search(s):
        return False
    if ACENTO.search(s) or PALABRAS_ES.search(s):
        return True
    # Palabra con mayúscula inicial (etiquetas, títulos): «Panel», «Pulso».
    return bool(re.match(r"^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s|$)", s))


def fragmentos(cadena, plantilla=False):
    """Parte una cadena en los trozos de texto que acaban como nodos en la pantalla."""
    out = []
    if plantilla:
        # Cada ${…} es una parte variable: si el trozo entre etiquetas tiene texto y variables,
        # se guarda como plantilla «Día {0} de {1}».
        for trozo in ETIQUETA.split(cadena):
            if not trozo.strip():
                continue
            vars_ = INTERP_JS.findall(trozo)
            if vars_:
                i = 0

                def rep(_m):
                    nonlocal i
                    i += 1
                    return "{%d}" % (i - 1)

                p = INTERP_JS.sub(rep, trozo).strip()
                literal = re.sub(r"\{\d+\}", "", p)
                if parece_texto(literal):
                    out.append(p)
                for t in INTERP_JS.split(trozo):
                    if parece_texto(t):
                        out.append(t.strip())
            elif parece_texto(trozo):
                out.append(trozo.strip())
    else:
        for trozo in ETIQUETA.split(cadena):
            if parece_texto(trozo):
                out.append(trozo.strip())
    return out


CADENA_JS = re.compile(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`", re.S)
TEXTO_JSX = re.compile(r">([^<>{}]*[A-Za-zÁÉÍÓÚáéíóúñÑ][^<>{}]*)<")
ATRIB_JSX = re.compile(r"\b(?:title|placeholder|aria-label|alt|label)=\"([^\"]+)\"")
COMENTARIO = re.compile(r"/\*.*?\*/|(?<![:'\"\\])//[^\n]*", re.S)


def de_js(texto):
    texto = COMENTARIO.sub("", texto)
    out = []
    for m in CADENA_JS.finditer(texto):
        simple = m.group(1) if m.group(1) is not None else m.group(2)
        if simple is not None:
            out += fragmentos(simple.replace("\\'", "'").replace('\\"', '"'))
        else:
            out += fragmentos(m.group(3), plantilla=True)
    for m in TEXTO_JSX.finditer(texto):
        t = " ".join(m.group(1).split())
        if parece_texto(t):
            out.append(t)
    for m in ATRIB_JSX.finditer(texto):
        if parece_texto(m.group(1)):
            out.append(m.group(1))
    # JSX con variables en medio: «Simular en {c.n}» → «Simular en {0}»
    for m in re.finditer(r">([^<>]*\{[^<>]*\}[^<>]*)<", texto):
        crudo = m.group(1)
        if "=>" in crudo or "&&" in crudo or "?" in crudo:
            continue
        i = 0

        def rep(_m):
            nonlocal i
            i += 1
            return "{%d}" % (i - 1)

        p = " ".join(re.sub(r"\{[^{}]*\}", rep, crudo).split())
        if parece_texto(re.sub(r"\{\d+\}", "", p)):
            out.append(p)
    return out


CADENA_PY = re.compile(r"(f?)(\"\"\"(.*?)\"\"\"|'''(.*?)'''|\"((?:[^\"\\\n]|\\.)*)\"|'((?:[^'\\\n]|\\.)*)')", re.S)


def de_py(texto):
    out = []
    for m in CADENA_PY.finditer(texto):
        es_f = m.group(1) == "f"
        s = next(g for g in m.groups()[2:] if g is not None)
        if m.group(2).startswith(('"""', "'''")):
            continue  # docstrings
        if es_f:
            i = 0

            def rep(_m):
                nonlocal i
                i += 1
                return "{%d}" % (i - 1)

            s = re.sub(r"\{[^{}]*\}", rep, s)
        for t in fragmentos(s):
            out.append(t)
    return out


def de_json(valor, out):
    if isinstance(valor, str):
        if parece_texto(valor) and not valor.startswith("http"):
            out += fragmentos(valor)
    elif isinstance(valor, list):
        for v in valor:
            de_json(v, out)
    elif isinstance(valor, dict):
        for k, v in valor.items():
            if k in ("u", "url", "id", "color", "icono", "zona", "sys", "part", "parte", "tipo", "clase"):
                continue
            de_json(v, out)


def main():
    textos = {}

    def anotar(lista, origen):
        for t in lista:
            t = " ".join(t.split())
            if t:
                textos.setdefault(t, set()).add(origen)

    for f in sorted((RAIZ / "escritorio" / "src").rglob("*")):
        if f.suffix in (".js", ".jsx"):
            anotar(de_js(f.read_text(encoding="utf-8")), str(f.relative_to(RAIZ)))
    for f in sorted((RAIZ / "datos").glob("*.json")):
        out = []
        de_json(json.loads(f.read_text(encoding="utf-8")), out)
        anotar(out, str(f.relative_to(RAIZ)))
    for f in [*sorted((RAIZ / "nave").rglob("*.py")), RAIZ / "tierra" / "centro_control.py"]:
        anotar(de_py(f.read_text(encoding="utf-8")), str(f.relative_to(RAIZ)))
    anotar(fragmentos((RAIZ / "escritorio" / "index.html").read_text(encoding="utf-8")), "escritorio/index.html")

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    datos = {t: sorted(o) for t, o in sorted(textos.items(), key=lambda kv: (sorted(kv[1])[0], kv[0]))}
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=0), encoding="utf-8")
    print(len(datos), "textos →", SALIDA.relative_to(RAIZ), "·", sum(len(t) for t in datos), "caracteres")


if __name__ == "__main__":
    main()
