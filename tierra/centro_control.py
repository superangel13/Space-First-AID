#!/usr/bin/env python3
"""
Space First AID · Centro de control en la Tierra
------------------------------------------------
- Recibe los paquetes que la nave envía cuando hay señal y los guarda en SQLite (tierra.db).
- Muestra un tablero que se actualiza solo.
- El laboratorio captura aquí los resultados de las muestras (orina, sangre, saliva)
  que mandó la nave. La nave los baja en su siguiente contacto y reemplazan al
  análisis previo hecho a bordo.

Uso:  python3 -m tierra.centro_control        (desde la carpeta del proyecto)
Solo usa la biblioteca estándar de Python 3.
"""
import datetime, html, json, os, sqlite3, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

EMPAQUETADO = getattr(sys, "frozen", False)
RAIZ = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent.parent))


def _bd_defecto():
    if not EMPAQUETADO:
        return Path(__file__).with_name("tierra.db")
    from nave.config import carpeta_usuario          # misma carpeta de datos del usuario
    return carpeta_usuario() / "tierra.db"


BD = Path(os.environ.get("TIERRA_BD") or _bd_defecto())
HOST = os.environ.get("TIERRA_HOST", "127.0.0.1")
PUERTO = int(os.environ.get("TIERRA_PUERTO") or os.environ.get("PORT") or 8766)
PARAM = json.loads((RAIZ / "datos" / "muestras.json").read_text(encoding="utf-8"))


def ahora():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def db():
    con = sqlite3.connect(BD, timeout=10)
    con.row_factory = sqlite3.Row
    con.executescript("""
    CREATE TABLE IF NOT EXISTS paquetes(id INTEGER PRIMARY KEY AUTOINCREMENT, recibido TEXT, creado TEXT, mision TEXT,
        prioridad INTEGER, resumen TEXT, tripulante TEXT, tipo TEXT, datos TEXT);
    CREATE TABLE IF NOT EXISTS muestras(codigo TEXT PRIMARY KEY, recibida TEXT, mision TEXT, tripulante TEXT,
        tripulante_id TEXT, tipo TEXT, a_bordo TEXT, resultado_a_bordo TEXT);
    CREATE TABLE IF NOT EXISTS resultados(id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT, capturado TEXT,
        muestra TEXT, tripulante_id TEXT, valores TEXT);
    """)
    return con


def esc(s):
    return html.escape(str(s if s is not None else ""))


CSS = """body{margin:0;background:#05070A;color:#EEF2F6;font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}
.w{max-width:1150px;margin:0 auto;padding:24px}h1{font-size:28px;margin:0 0 4px}h2{font-size:19px;margin:28px 0 10px}.m{color:#8B96A6}
.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:18px 0}.k div{background:#0E131A;border:1px solid #18212B;border-radius:16px;padding:14px}
.k b{display:block;font-size:28px}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:10px;border-bottom:1px solid #18212B;vertical-align:top}
th{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8B96A6}.p{font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;white-space:nowrap}
.p1{background:rgba(255,84,104,.16);color:#FF5468}.p2{background:rgba(245,184,65,.16);color:#F5B841}.p3{background:#18202A;color:#8B96A6}.ok{background:rgba(52,227,154,.14);color:#34E39A}
details{color:#8B96A6}pre{white-space:pre-wrap;font-size:12px;background:#0B0F14;padding:10px;border-radius:10px;max-height:240px;overflow:auto}
form.lab{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-top:10px;background:#0B0F14;border:1px solid #18212B;border-radius:14px;padding:14px}
label{display:grid;gap:4px;font-size:12px;color:#8B96A6}input,select{background:#11161D;border:1px solid #243041;color:#EEF2F6;border-radius:10px;padding:8px 10px;font:inherit}
button{background:#34E39A;color:#05070A;border:0;border-radius:10px;padding:10px 16px;font-weight:800;cursor:pointer;align-self:end}"""


def tablero(aviso=""):
    con = db()
    rows = con.execute("SELECT * FROM paquetes ORDER BY id DESC LIMIT 100").fetchall()
    tot = con.execute("SELECT COUNT(*) FROM paquetes").fetchone()[0]
    p1 = con.execute("SELECT COUNT(*) FROM paquetes WHERE prioridad=1").fetchone()[0]
    mu = con.execute("SELECT m.*, (SELECT COUNT(*) FROM resultados r WHERE r.codigo=m.codigo) hecho FROM muestras m ORDER BY recibida DESC").fetchall()
    con.close()
    pend = [m for m in mu if not m["hecho"]]
    tr = "".join(
        f"<tr><td>{esc(r['recibido'][11:19])}</td><td><span class='p p{r['prioridad']}'>{['', 'Alerta', 'Resumen', 'Detalle'][r['prioridad'] if r['prioridad'] in (1, 2, 3) else 3]}</span></td>"
        f"<td>{esc(r['tripulante'] or '—')}</td><td>{esc(r['resumen'])}"
        + (f"<details><summary>Datos</summary><pre>{esc(json.dumps(json.loads(r['datos']), ensure_ascii=False, indent=2))}</pre></details>" if r["datos"] not in (None, "null", "{}") else "")
        + "</td></tr>" for r in rows) or "<tr><td colspan=4 class='m'>Aún no llegan paquetes de la nave.</td></tr>"

    def form(m):
        P = PARAM["tipos"][m["tipo"]]
        ab = json.loads(m["a_bordo"] or "{}")
        campos = []
        for a in P["analitos"]:
            if a["tipo"] == "cual":
                op = "".join(f"<option {'selected' if ab.get(a['id']) == o else ''}>{o}</option>" for o in [""] + PARAM["escala_cualitativa"])
                campos.append(f"<label>{esc(a['nombre'])}<select name='{a['id']}'>{op}</select></label>")
            else:
                campos.append(f"<label>{esc(a['nombre'])} {esc(a.get('unidad', ''))}<input name='{a['id']}' inputmode='decimal' value='{esc(ab.get(a['id'], ''))}'></label>")
        return (f"<details open><summary><b>{esc(m['codigo'])}</b> · {esc(P['nombre'])} de {esc(m['tripulante'])} · a bordo: {esc(m['resultado_a_bordo'])}</summary>"
                f"<form class='lab' method='post' action='resultado'><input type='hidden' name='codigo' value='{esc(m['codigo'])}'>{''.join(campos)}"
                f"<button>Enviar resultado de laboratorio</button></form></details>")

    lab = "".join(form(m) for m in pend) or "<p class='m'>No hay muestras pendientes de laboratorio.</p>"
    hechas = "".join(f"<tr><td>{esc(m['codigo'])}</td><td>{esc(m['tripulante'])}</td><td>{esc(m['tipo'])}</td><td><span class='p ok'>Resultado enviado a la nave</span></td></tr>" for m in mu if m["hecho"])
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Centro de control · Space First AID</title><style>{CSS}</style></head><body><div class="w">
<h1>Centro de control · Space First AID</h1><p class="m">Paquetes de la nave y laboratorio. Base de datos: {esc(BD.name)}. <a href="./" style="color:#5FD3F3">Actualizar</a></p>
{f"<p class='p ok' style='display:inline-block;padding:8px 12px'>{esc(aviso)}</p>" if aviso else ""}
<div class="k"><div>Paquetes<b>{tot}</b></div><div>Alertas<b style="color:#FF5468">{p1}</b></div><div>Muestras por analizar<b style="color:#F5B841">{len(pend)}</b></div>
<div>Último paquete<b style="font-size:16px">{esc(rows[0]['recibido'][11:19]) if rows else '—'}</b></div></div>
<h2>Laboratorio · muestras recibidas</h2><p class="m">Captura el resultado del laboratorio. La nave lo recibe en su siguiente contacto y reemplaza al análisis hecho a bordo.</p>
{lab}{f"<table style='margin-top:12px'><tbody>{hechas}</tbody></table>" if hechas else ""}
<h2>Paquetes recibidos</h2><table><thead><tr><th>Recibido</th><th>Prioridad</th><th>Tripulante</th><th>Resumen</th></tr></thead><tbody>{tr}</tbody></table>
</div><script>setTimeout(()=>{{if(!document.querySelector('form.lab :focus'))location.reload()}},6000)</script></body></html>"""


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, code, obj):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _html(self, s, code=200):
        b = s.encode()
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/api/ping":
            return self._json(200, {"ok": True, "centro": "Tierra", "hora": ahora()})
        if u.path == "/api/paquetes":
            con = db()
            rows = [dict(r) for r in con.execute("SELECT * FROM paquetes ORDER BY id DESC LIMIT 200")]
            con.close()
            return self._json(200, rows)
        if u.path == "/api/resultados":
            desde = int((parse_qs(u.query).get("desde") or ["0"])[0] or 0)
            con = db()
            rows = [dict(r, valores=json.loads(r["valores"])) for r in con.execute("SELECT * FROM resultados WHERE id>? ORDER BY id", (desde,))]
            con.close()
            return self._json(200, {"resultados": rows})
        avisos = {"ok": "Resultado guardado. Se enviará a la nave en el siguiente contacto."}
        return self._html(tablero(avisos.get((parse_qs(u.query).get("aviso") or [""])[0], "")))

    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b""
        if self.path.rstrip("/").endswith("/resultado"):
            f = {k: v[0] for k, v in parse_qs(raw.decode()).items() if v and v[0].strip()}
            codigo = f.pop("codigo", None)
            con = db()
            m = con.execute("SELECT * FROM muestras WHERE codigo=?", (codigo,)).fetchone()
            if m and f:
                con.execute("INSERT INTO resultados(codigo,capturado,muestra,tripulante_id,valores) VALUES(?,?,?,?,?)",
                            (codigo, ahora(), m["tipo"], m["tripulante_id"], json.dumps(f, ensure_ascii=False)))
                con.commit()
            con.close()
            self.send_response(303)
            self.send_header("Location", "./?aviso=ok")
            self.end_headers()
            return
        if not self.path.startswith("/api/paquetes"):
            return self._json(404, {"ok": False})
        try:
            p = json.loads(raw or b"{}")
        except ValueError:
            return self._json(400, {"ok": False, "error": "JSON inválido"})
        d = p.get("datos") or {}
        con = db()
        con.execute("INSERT INTO paquetes(recibido,creado,mision,prioridad,resumen,tripulante,tipo,datos) VALUES(?,?,?,?,?,?,?,?)",
                    (ahora(), p.get("creado"), p.get("mision"), int(p.get("prioridad") or 3), p.get("resumen"),
                     d.get("tripulante"), d.get("tipo"), json.dumps(d, ensure_ascii=False)))
        if d.get("tipo") == "muestra" and d.get("codigo"):
            con.execute("INSERT OR IGNORE INTO muestras(codigo,recibida,mision,tripulante,tripulante_id,tipo,a_bordo,resultado_a_bordo) VALUES(?,?,?,?,?,?,?,?)",
                        (d["codigo"], ahora(), p.get("mision"), d.get("tripulante"), d.get("tripulante_id"), d.get("muestra"),
                         json.dumps(d.get("valores") or {}, ensure_ascii=False), d.get("resultado")))
        con.commit()
        con.close()
        print(f"[{datetime.datetime.now():%H:%M:%S}] P{p.get('prioridad')} · {p.get('resumen')}")
        return self._json(200, {"ok": True})


def crear_servidor():
    db().close()
    print(f"Centro de control en http://localhost:{PUERTO}  ·  base de datos: {BD}")
    return ThreadingHTTPServer((HOST, PUERTO), H)


def main():
    try:
        crear_servidor().serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
