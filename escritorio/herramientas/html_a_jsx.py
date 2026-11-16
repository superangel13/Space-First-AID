#!/usr/bin/env python3
"""Convierte la estructura de app/index.html en componentes de React (JSX).

Se usó una sola vez para transcribir la pantalla original; queda aquí como
referencia de cómo se generó la primera versión de src/estructura y src/vistas.

    python3 herramientas/html_a_jsx.py ../app/index.html src
"""
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path

VACIOS = {"input", "br", "img", "hr", "meta", "link", "source"}
ETIQUETAS = {"lineargradient": "linearGradient", "radialgradient": "radialGradient", "clippath": "clipPath", "foreignobject": "foreignObject"}
ATRIBUTOS = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "readonly": "readOnly", "maxlength": "maxLength",
    "playsinline": "playsInline", "autocomplete": "autoComplete", "inputmode": "inputMode", "viewbox": "viewBox",
    "preserveaspectratio": "preserveAspectRatio", "stroke-width": "strokeWidth", "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin", "stroke-dasharray": "strokeDasharray", "stroke-opacity": "strokeOpacity",
    "fill-opacity": "fillOpacity", "stop-color": "stopColor", "stop-opacity": "stopOpacity", "text-anchor": "textAnchor",
    "font-size": "fontSize", "font-weight": "fontWeight", "font-family": "fontFamily", "clip-path": "clipPath",
    "checked": "defaultChecked", "value": "defaultValue", "srcset": "srcSet", "crossorigin": "crossOrigin",
}


class Nodo:
    def __init__(self, tag=None, attrs=None, texto=None):
        self.tag, self.attrs, self.texto, self.hijos = tag, attrs or [], texto, []


class Lector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.raiz = Nodo("raiz")
        self.pila = [self.raiz]

    def handle_starttag(self, tag, attrs):
        n = Nodo(tag, attrs)
        self.pila[-1].hijos.append(n)
        if tag not in VACIOS:
            self.pila.append(n)

    def handle_startendtag(self, tag, attrs):
        self.pila[-1].hijos.append(Nodo(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.pila) - 1, 0, -1):
            if self.pila[i].tag == tag:
                del self.pila[i:]
                break

    def handle_data(self, data):
        self.pila[-1].hijos.append(Nodo(texto=data))


def estilo(v):
    partes = []
    for decl in v.split(";"):
        if ":" not in decl:
            continue
        k, val = decl.split(":", 1)
        k, val = k.strip(), val.strip()
        if not k.startswith("--"):
            k = re.sub(r"-([a-z])", lambda m: m.group(1).upper(), k)
        partes.append(f"{json.dumps(k)}: {json.dumps(val, ensure_ascii=False)}")
    return "{{" + ", ".join(partes) + "}}"


def atributos(n, oculto_prop):
    out = []
    for k, v in n.attrs:
        if k == "hidden" and oculto_prop and dict(n.attrs).get("id", "").startswith("v-"):
            continue
        if k == "style":
            out.append(f"style={estilo(v or '')}")
            continue
        nombre = ATRIBUTOS.get(k, k)
        if v is None:
            out.append(f'{nombre}=""' if k.startswith("data-") else nombre)
        else:
            out.append(f"{nombre}={{{json.dumps(v, ensure_ascii=False)}}}")
    if oculto_prop and dict(n.attrs).get("id", "").startswith("v-"):
        out.append("hidden={oculto}")
    return (" " + " ".join(out)) if out else ""


def jsx(n, nivel=2, oculto_prop=False):
    sangria = "  " * nivel
    if n.tag is None:
        t = n.texto
        if not t.strip():
            return "" if "\n" in t else sangria + '{" "}\n'
        ini = " " if t[:1].isspace() and "\n" not in t[: len(t) - len(t.lstrip())] else ""
        fin = " " if t[-1:].isspace() and "\n" not in t[len(t.rstrip()):] else ""
        cuerpo = ini + re.sub(r"\s+", " ", t.strip()) + fin
        return sangria + "{" + json.dumps(cuerpo, ensure_ascii=False) + "}\n"
    tag = ETIQUETAS.get(n.tag, n.tag)
    a = atributos(n, oculto_prop)
    if n.tag in VACIOS or not n.hijos:
        return f"{sangria}<{tag}{a} />\n"
    dentro = "".join(jsx(h, nivel + 1, False) for h in n.hijos)
    return f"{sangria}<{tag}{a}>\n{dentro}{sangria}</{tag}>\n"


def componente(nombre, nodos, comentario, con_oculto=False):
    cuerpo = "".join(jsx(n, 2, con_oculto) for n in nodos)
    firma = "{ oculto }" if con_oculto else ""
    return (f"// {comentario}\n// Estructura transcrita de la versión web original (app/index.html).\n"
            f"export default function {nombre}({firma}) {{\n  return (\n    <>\n{cuerpo}    </>\n  );\n}}\n")


def main():
    origen, destino = Path(sys.argv[1]), Path(sys.argv[2])
    html = origen.read_text(encoding="utf-8")
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    cuerpo = html[html.index("<body>") + 6: html.index("</body>")]
    cuerpo = re.sub(r"<script[^>]*>.*?</script>", "", cuerpo, flags=re.S)
    p = Lector()
    p.feed(cuerpo)
    top = [n for n in p.raiz.hijos if n.tag]

    def por(pred):
        return [n for n in top if pred(dict(n.attrs), n)]

    (destino / "estructura").mkdir(parents=True, exist_ok=True)
    (destino / "vistas").mkdir(parents=True, exist_ok=True)
    escribir = lambda ruta, txt: (destino / ruta).write_text(txt, encoding="utf-8")
    escribir("estructura/Intro.jsx", componente("Intro", por(lambda a, n: a.get("id") == "intro"), "Video de entrada con el logo"))
    escribir("estructura/Encabezado.jsx", componente("Encabezado", por(lambda a, n: n.tag == "header"), "Encabezado: marca, secciones, conexión, vista y sirena"))
    escribir("estructura/BarraAlerta.jsx", componente("BarraAlerta", por(lambda a, n: a.get("id") == "abar"), "Barra roja con la alerta más importante"))
    escribir("estructura/PanelEnlace.jsx", componente("PanelEnlace", por(lambda a, n: a.get("id") == "enlacePanel"), "Panel de enlace con la Tierra"))
    escribir("estructura/NavInferior.jsx", componente("NavInferior", por(lambda a, n: (n.tag == "nav" and "bottom" in a.get("class", "")) or a.get("id") == "sheet"), "Navegación inferior (celular) y hoja «Más»"))
    escribir("estructura/Capas.jsx", componente("Capas", por(lambda a, n: a.get("id") in ("toast", "bigal", "modal")), "Capas flotantes: aviso corto, alerta grande y ventana de datos"))
    principal = next(n for n in top if n.tag == "main")
    hijos = [n for n in principal.hijos if n.tag]
    escribir("estructura/Subnav.jsx", componente("Subnav", [n for n in hijos if n.tag == "nav"], "Subnavegación de la sección Pruebas"))
    escribir("estructura/Pie.jsx", componente("Pie", [n for n in hijos if n.tag == "footer"], "Pie: referencias, misión actual y nueva misión"))
    nombres = {"v-panel": "Panel", "v-tripulacion": "Tripulacion", "v-orbita": "Orbita", "v-manos": "Manos", "v-valoracion": "Valoracion",
               "v-mente": "Mente", "v-alertas": "Alertas", "v-mision": "Mision", "v-midia": "MiDia", "v-referencias": "Referencias"}
    for n in hijos:
        i = dict(n.attrs).get("id")
        if n.tag == "section" and i in nombres:
            escribir(f"vistas/{nombres[i]}.jsx", componente(nombres[i], [n], f"Sección {nombres[i]}", con_oculto=True))
    print("componentes:", sorted(x.name for x in (destino / "estructura").iterdir()) + sorted(x.name for x in (destino / "vistas").iterdir()))


if __name__ == "__main__":
    main()
