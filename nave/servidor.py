#!/usr/bin/env python3
"""
Space First AID · servidor de la nave
-------------------------------------
- Sirve la pantalla (carpeta app/) y los parámetros (carpeta datos/).
- Guarda todo en SQLite (nave/nave.db).
- Procesa en Python: motor clínico, signos vitales, muestras y pruebas.
- Envía a la Tierra por prioridad cuando hay señal (nave/enlace.py).

Uso:  python3 -m nave.servidor        (desde la carpeta del proyecto)
Solo usa la biblioteca estándar de Python 3.
"""
import datetime, json, mimetypes, re, sys, unicodedata, urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

from . import config, base_datos as bd, enlace
from .datos import cargar, destinos
from .motor import clinico, signos, valoracion, pruebas

COLORES = ["#5B9DFF", "#34E39A", "#F5B841", "#FF6B7D", "#A28CFF", "#5FD3F3"]


class ErrorAPI(Exception):
    def __init__(self, codigo, mensaje):
        super().__init__(mensaje)
        self.codigo = codigo


# ------------------------------------------------------------------ misión
def _slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "", t)[:16] or "t"


def _dia_actual(m):
    ini = datetime.date.fromisoformat(m["fecha_inicio"])
    return max(1, min(m["duracion"], (datetime.date.today() - ini).days + 1))


def _sim_defecto(t, i, destino):
    fit = t.get("condicion") or "media"
    hx = t.get("antecedentes") or []
    return {"hr": {"alta": 55, "media": 62, "baja": 68}.get(fit, 62) + (i % 3), "sl": 7.3, "rt": 288 + i * 3, "sp": 98,
            "prior": 20 + i * 8, "rate": 0.42 if destino == "orbita_baja" else 0.47, "ev": {},
            "bp": [134, 86] if "presion" in hx else [116, 75], "temp": 36.6, "rr": 14}


def leer_mision():
    m = bd.fila("SELECT * FROM mision WHERE id=1")
    if not m:
        return {"mision": None, "destinos": cargar("destinos")}
    tr = bd.filas("SELECT * FROM tripulantes ORDER BY orden")
    for t in tr:
        t["antecedentes"] = bd.dejs(t["antecedentes"], [])
        t["sim"] = bd.dejs(t["sim"], {})
    m["dia_actual"] = _dia_actual(m)
    m["destino_info"] = destinos().get(m["destino"])
    return {"mision": m, "tripulantes": tr, "destinos": cargar("destinos")}


def _borrar_todo(con):
    for t in ("evaluaciones", "reportes_sintomas", "signos", "pruebas", "muestras", "alertas", "estado", "autoreportes", "tripulantes", "mision"):
        con.execute(f"DELETE FROM {t}")


def crear_mision(d, demo=False):
    nombre = (d.get("nombre") or "").strip() or "Misión sin nombre"
    destino = d.get("destino")
    if destino not in destinos():
        raise ErrorAPI(400, "Elige un destino de la lista")
    dur = int(d.get("duracion") or destinos()[destino]["duracion_defecto"])
    if dur < 1 or dur > 1000:
        raise ErrorAPI(400, "La duración debe estar entre 1 y 1000 días")
    tr = d.get("tripulantes") or []
    if not 1 <= len(tr) <= 6:
        raise ErrorAPI(400, "Registra de 1 a 6 tripulantes")
    if d.get("dia_actual"):
        ini = datetime.date.today() - datetime.timedelta(days=int(d["dia_actual"]) - 1)
    else:
        ini = datetime.date.fromisoformat(d.get("fecha_inicio") or datetime.date.today().isoformat())
    ids = set()
    with bd.conexion() as con:
        _borrar_todo(con)
        con.execute("INSERT INTO mision(id,nombre,destino,duracion,fecha_inicio,demo,creada) VALUES(1,?,?,?,?,?,?)",
                    (nombre, destino, dur, ini.isoformat(), 1 if demo else 0, bd.ahora()))
        for i, t in enumerate(tr):
            n = (t.get("nombre") or "").strip()
            if not n:
                raise ErrorAPI(400, f"Falta el nombre del tripulante {i + 1}")
            if t.get("edad") not in (None, "") and int(t["edad"]) < 20:
                raise ErrorAPI(400, f"La edad de {n} no puede ser menor a 20 años")
            tid = t.get("id") or _slug(n)
            while tid in ids:
                tid += str(i)
            ids.add(tid)
            con.execute("INSERT INTO tripulantes(id,orden,nombre,rol,sexo,edad,condicion,antecedentes,notas,color,sim) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                        (tid, i, n, (t.get("rol") or "Tripulante").strip(), t.get("sexo"), t.get("edad"), t.get("condicion") or "media",
                         bd.js(t.get("antecedentes") or []), t.get("notas"), t.get("color") or COLORES[i % 6],
                         bd.js(t.get("sim") or _sim_defecto(t, i, destino))))
    enlace.encolar(2, f"Nueva misión registrada: {nombre} · {destinos()[destino]['nombre']} · {dur} días · {len(tr)} tripulantes",
                   {"tipo": "mision", "nombre": nombre, "destino": destino, "duracion": dur,
                    "tripulantes": [{"nombre": t.get("nombre"), "rol": t.get("rol")} for t in tr]})
    return leer_mision()


# ------------------------------------------------------------------ muestras
def _codigo(tipo):
    pref = {"orina": "ORI", "sangre": "SAN", "saliva": "SAL"}[tipo]
    n = bd.fila("SELECT COUNT(DISTINCT codigo) n FROM muestras WHERE tipo=?", (tipo,))["n"] + 1
    return f"{pref}-{n:04d}"


def guardar_muestra(d, origen="a_bordo"):
    tipo = d.get("tipo")
    if tipo not in ("orina", "sangre", "saliva"):
        raise ErrorAPI(400, "Tipo de muestra inválido")
    tid = d.get("tripulante")
    if not bd.fila("SELECT id FROM tripulantes WHERE id=?", (tid,)):
        raise ErrorAPI(400, "Tripulante desconocido")
    valores = {k: v for k, v in (d.get("valores") or {}).items() if v not in (None, "")}
    if not valores:
        raise ErrorAPI(400, "Captura al menos un valor")
    sexo = (bd.fila("SELECT sexo FROM tripulantes WHERE id=?", (tid,)) or {}).get("sexo")
    res = valoracion.interpretar(tipo, valores, sexo)
    codigo = d.get("codigo") or _codigo(tipo)
    mid = bd.ejecutar("INSERT INTO muestras(codigo,tripulante,tipo,origen,tomada,registrada,valores,resultado,nivel) VALUES(?,?,?,?,?,?,?,?,?)",
                      (codigo, tid, tipo, origen, d.get("tomada") or bd.ahora(), bd.ahora(), bd.js(valores), bd.js(res), res["nivel"]))
    nombre = bd.fila("SELECT nombre FROM tripulantes WHERE id=?", (tid,))["nombre"]
    if origen == "a_bordo":
        enlace.encolar(1 if res["nivel"] >= 2 else 2,
                       f"Muestra de {tipo} {codigo} de {nombre} (análisis a bordo): {res['resumen']}",
                       {"tipo": "muestra", "tripulante": nombre, "tripulante_id": tid, "codigo": codigo, "muestra": tipo,
                        "valores": valores, "resultado": res["resumen"], "nivel": res["nivel"]})
    return dict(id=mid, codigo=codigo, origen=origen, **res)


def resultado_de_tierra(r):
    """Llega del centro de control: un resultado de laboratorio para una muestra."""
    try:
        guardar_muestra({"tipo": r["muestra"], "tripulante": r["tripulante_id"], "codigo": r["codigo"],
                         "valores": r["valores"], "tomada": r.get("tomada")}, origen="tierra")
    except Exception as e:
        print("No se pudo aplicar un resultado de Tierra:", e, file=sys.stderr)


def muestras_de(tid):
    todas = bd.filas("SELECT * FROM muestras WHERE tripulante=? ORDER BY id", (tid,))
    for m in todas:
        m["valores"] = bd.dejs(m["valores"], {})
        m["resultado"] = bd.dejs(m["resultado"], {})
    return todas


# ------------------------------------------------------------------ motor
def ultimo_autoreporte(tid):
    r = bd.fila("SELECT carga, pss, animo, equipo, creado FROM autoreportes WHERE tripulante=? ORDER BY id DESC LIMIT 1", (tid,))
    return r or {}


def ultimas_pruebas(tid):
    """Última calificación (0-100 %) de cada prueba."""
    out = {}
    for r in bd.filas("SELECT prueba, puntaje FROM pruebas WHERE tripulante=? ORDER BY id", (tid,)):
        out[r["prueba"]] = r["puntaje"]
    return out


def evaluar(d):
    tid = d.get("tripulante")
    ctx = d.get("contexto") or {}
    labs = valoracion.labs_para_motor(valoracion.vigentes(muestras_de(tid))) if tid else {}
    auto, pr = ultimo_autoreporte(tid), ultimas_pruebas(tid)
    res, sistemas = clinico.evaluar(ctx, labs, auto, pr)
    if d.get("reporte"):
        bd.ejecutar("INSERT INTO reportes_sintomas(tripulante,creado,sintomas,preguntas) VALUES(?,?,?,?)",
                    (tid, bd.ahora(), bd.js(ctx.get("sintomas") or {}), bd.js(ctx.get("preguntas") or {})))
    act = [r for r in res if r["lvl"]]
    resumen = ", ".join(f"{r['k']['n']} ({'alerta' if r['lvl'] == 2 else 'advertencia'})" for r in act) or "Sin hallazgos"
    ult = bd.fila("SELECT resumen FROM evaluaciones WHERE tripulante=? ORDER BY id DESC LIMIT 1", (tid,))
    if not ult or ult["resumen"] != resumen:
        bd.ejecutar("INSERT INTO evaluaciones(tripulante,creado,nivel,resumen,resultado) VALUES(?,?,?,?,?)",
                    (tid, bd.ahora(), max([r["lvl"] for r in res] or [0]), resumen, bd.js(act)))
    return {"resultados": res, "labs": labs, "sistemas": sistemas, "autoreporte": auto, "pruebas": pr}


def guardar_prueba(d):
    tid, prueba = d.get("tripulante"), d.get("prueba")
    if not tid or not prueba:
        raise ErrorAPI(400, "Faltan tripulante o prueba")
    hist = [r["puntaje"] for r in bd.filas("SELECT puntaje FROM pruebas WHERE tripulante=? AND prueba=? ORDER BY id", (tid, prueba))]
    r = pruebas.interpretar(prueba, d.get("puntaje"), d.get("detalle") or {}, hist)
    bd.ejecutar("INSERT INTO pruebas(tripulante,creado,dia,prueba,puntaje,nivel,detalle) VALUES(?,?,?,?,?,?,?)",
                (tid, bd.ahora(), d.get("dia"), prueba, d.get("puntaje"), r["nivel"], bd.js(d.get("detalle") or {})))
    t = bd.fila("SELECT nombre FROM tripulantes WHERE id=?", (tid,))
    enlace.encolar(1 if r["nivel"] >= 2 else 2 if r["nivel"] else 3,
                   f"{r['nombre']} de {t['nombre'] if t else tid}: {d.get('puntaje')} {r['unidad']} · {r['mensaje'][:90]}",
                   {"tipo": "prueba", "tripulante": t["nombre"] if t else tid, "prueba": prueba, "puntaje": d.get("puntaje"), "nivel": r["nivel"]})
    r["historial"] = hist + [d.get("puntaje")]
    return r


def guardar_autoreporte(d, simulado=False):
    tid = d.get("tripulante")
    if not bd.fila("SELECT id FROM tripulantes WHERE id=?", (tid,)):
        raise ErrorAPI(400, "Tripulante desconocido")
    v = {}
    for k, (lo, hi) in {"carga": (0, 100), "pss": (0, 40), "animo": (1, 10), "equipo": (1, 10)}.items():
        x = d.get(k)
        if x in (None, ""):
            continue
        x = float(x)
        if not lo <= x <= hi:
            raise ErrorAPI(400, f"{k} debe estar entre {lo} y {hi}")
        v[k] = x
    if not v:
        raise ErrorAPI(400, "Registra al menos un valor")
    previo = ultimo_autoreporte(tid)
    fila = {k: v.get(k, previo.get(k)) for k in ("carga", "pss", "animo", "equipo")}
    bd.ejecutar("INSERT INTO autoreportes(tripulante,creado,carga,pss,animo,equipo,simulado) VALUES(?,?,?,?,?,?,?)",
                (tid, bd.ahora(), fila["carga"], fila["pss"], fila["animo"], fila["equipo"], 1 if simulado else 0))
    if not simulado:
        nombre = bd.fila("SELECT nombre FROM tripulantes WHERE id=?", (tid,))["nombre"]
        enlace.encolar(3, f"Registro personal de {nombre}: carga {fila['carga']}, estrés {fila['pss']}, ánimo {fila['animo']}, equipo {fila['equipo']}",
                       {"tipo": "autoreporte", "tripulante": nombre, **fila})
    return fila


def _valor_fuera(a, direccion, sexo):
    lo, hi = valoracion.rango(a, sexo)
    if direccion == "alto":
        return round((hi or (lo or 1) * 2) * 1.3, 3)
    if direccion == "bajo":
        return round((lo or 1) * 0.6, 3)
    return round(a["meta_min"] - (a["meta_min"] - (lo or 0)) * 0.5, 3)   # bajo_meta


def simular(d):
    """Altera los datos de un tripulante para un problema del documento.
    parcial = algunos indicadores (alerta) · completo = todos (emergencia)."""
    tid, pid, modo = d.get("tripulante"), d.get("problema"), d.get("modo") or "completo"
    t = bd.fila("SELECT * FROM tripulantes WHERE id=?", (tid,))
    p = next((x for x in clinico.base()["problemas"] if x["id"] == pid), None)
    if not t or not p:
        raise ErrorAPI(400, "Elige un tripulante y un problema")
    inds = p["indicadores"]
    if modo == "parcial":
        inds = inds[:max(2, len(inds) // 2)] if len(inds) > 2 else inds[:2]
    sintomas, contexto, labs, auto, pruebas_sim = {}, {}, {}, {}, {}
    analitos = {a["id"]: (tipo, a) for tipo, T in valoracion.parametros()["tipos"].items() for a in T["analitos"]}
    for ind in inds:
        t_ = ind["tipo"]
        if t_ == "sintoma":
            sintomas[ind["id"]] = {"v": 7, "on": "hoy"}
        elif t_ == "sueno":
            contexto["sl"] = 5.4
        elif t_ == "auto":
            auto[ind["id"]] = ind["mayor"] + 8 if "mayor" in ind else 3
        elif t_ == "prueba":
            pruebas_sim[ind["id"]] = 55
        elif t_ == "lab" or (t_ == "contexto" and ind.get("o_lab")):
            spec = ind if t_ == "lab" else ind["o_lab"]
            aid = spec["analitos"][0]
            tipo, a = analitos[aid]
            labs.setdefault(tipo, {})[aid] = _valor_fuera(a, spec["dir"], t["sexo"])
            if t_ == "contexto":
                contexto["agua_ml"] = 1250
        elif t_ == "contexto":
            k = ind["id"]
            contexto[{"dias_microgravedad": "dias_microgravedad", "hueso_pct": "hueso_pct"}.get(k, k)] = \
                True if k in ("tormenta", "dosimetro") else ind.get("min", 0) * 1.2
    for tipo, valores in labs.items():
        guardar_muestra({"tipo": tipo, "tripulante": tid, "valores": valores, "codigo": f"SIM-{tipo[:3].upper()}-{tid[:4].upper()}"})
    if auto:
        guardar_autoreporte(dict(auto, tripulante=tid), simulado=True)
    for k, v in pruebas_sim.items():
        bd.ejecutar("INSERT INTO pruebas(tripulante,creado,dia,prueba,puntaje,nivel,detalle) VALUES(?,?,?,?,?,?,?)",
                    (tid, bd.ahora(), None, k, v, 1, bd.js({"simulada": True})))
    enlace.encolar(2, f"Simulación de emergencia: {p['n']} en {t['nombre']} ({modo})", {"tipo": "simulacion", "tripulante": t["nombre"], "problema": p["n"], "modo": modo})
    return {"problema": pid, "modo": modo, "sintomas": sintomas, "contexto": contexto}


def borrar_simulacion(tid):
    with bd.conexion() as con:
        con.execute("DELETE FROM muestras WHERE tripulante=? AND codigo LIKE 'SIM-%'", (tid,))
        con.execute("DELETE FROM autoreportes WHERE tripulante=? AND simulado=1", (tid,))
        con.execute("DELETE FROM pruebas WHERE tripulante=? AND detalle LIKE '%simulada%'", (tid,))
    return {"ok": True}


# ------------------------------------------------------------------ HTTP
class Manejador(BaseHTTPRequestHandler):
    server_version = "SpaceFirstAID/1.0"

    def log_message(self, *a):
        pass

    def _enviar(self, codigo, cuerpo, tipo="application/json; charset=utf-8"):
        b = cuerpo if isinstance(cuerpo, bytes) else json.dumps(cuerpo, ensure_ascii=False).encode()
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def _cuerpo(self):
        n = int(self.headers.get("Content-Length") or 0)
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n))
        except ValueError:
            raise ErrorAPI(400, "JSON inválido")

    def _archivo(self, base, ruta):
        p = (base / ruta).resolve()
        if base.resolve() not in p.parents and p != base.resolve():
            return self._enviar(404, {"error": "No existe"})
        if p.is_dir():
            p = p / "index.html"
        if not p.is_file():
            return self._enviar(404, {"error": "No existe"})
        tipo = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
        if p.suffix == ".mjs":
            tipo = "text/javascript"
        if p.suffix == ".task":
            tipo = "application/octet-stream"
        if tipo.startswith("text/") or tipo in ("application/javascript", "application/json"):
            tipo += "; charset=utf-8"
        self._enviar(200, p.read_bytes(), tipo)

    def _tierra(self, metodo):
        """Muestra el centro de control de la Tierra dentro del mismo sitio (/tierra/)."""
        if not self.path.startswith("/tierra/"):                # /tierra -> /tierra/ (enlaces relativos)
            self.send_response(301)
            self.send_header("Location", "/tierra/")
            self.end_headers()
            return
        resto = self.path[len("/tierra"):]
        n = int(self.headers.get("Content-Length") or 0)
        cuerpo = self.rfile.read(n) if n else None
        req = urllib.request.Request(config.TIERRA_URL + resto, data=cuerpo, method=metodo,
                                     headers={"Content-Type": self.headers.get("Content-Type") or "application/x-www-form-urlencoded"})
        try:
            with urllib.request.urlopen(req, timeout=8) as r:
                return self._enviar(r.status, r.read(), r.headers.get("Content-Type") or "text/html; charset=utf-8")
        except urllib.error.HTTPError as e:
            return self._enviar(e.code, e.read(), e.headers.get("Content-Type") or "text/plain; charset=utf-8")
        except Exception:
            return self._enviar(503, "<h1>El centro de control no responde</h1><p>Sin señal con la Tierra.</p>".encode(), "text/html; charset=utf-8")

    def _manejar(self, metodo):
        u = urlparse(self.path)
        ruta = u.path
        if ruta == "/tierra" or ruta.startswith("/tierra/"):
            return self._tierra(metodo)
        try:
            if ruta.startswith("/api/"):
                datos = self._cuerpo() if metodo in ("POST", "PUT") else {}
                return self._enviar(200, self._api(metodo, ruta[5:].strip("/"), datos, parse_qs(u.query)))
            if metodo != "GET":
                return self._enviar(405, {"error": "Método no permitido"})
            if ruta.startswith("/datos/"):
                return self._archivo(config.DATOS, ruta[7:])
            return self._archivo(config.APP, ruta.lstrip("/") or "index.html")
        except ErrorAPI as e:
            return self._enviar(e.codigo, {"error": str(e)})
        except Exception as e:                                   # error inesperado: se informa sin tumbar el servidor
            print("Error:", repr(e), file=sys.stderr)
            return self._enviar(500, {"error": "Error interno del servidor", "detalle": str(e)[:200]})

    def do_GET(self):
        self._manejar("GET")

    def do_POST(self):
        self._manejar("POST")

    def do_PUT(self):
        self._manejar("PUT")

    def do_DELETE(self):
        self._manejar("DELETE")

    # --- rutas de la API ---
    def _api(self, m, r, d, q):
        partes = r.split("/")
        if r == "salud":
            return {"ok": True, "nave": "Space First AID", "hora": bd.ahora(), "enlace": enlace.resumen()}
        if r == "mision":
            if m == "GET":
                return leer_mision()
            if m == "POST":
                return crear_mision(d)
            if m == "DELETE":
                with bd.conexion() as con:
                    _borrar_todo(con)
                return {"ok": True}
        if r == "mision/demo" and m == "POST":
            return crear_mision(cargar("mision_demo"), demo=True)
        if r == "estado" and m == "GET":
            return {x["clave"]: bd.dejs(x["valor"]) for x in bd.filas("SELECT clave,valor FROM estado WHERE clave NOT LIKE '\\_%' ESCAPE '\\'")}
        if partes[0] == "estado" and len(partes) == 2 and m == "PUT":
            bd.ejecutar("INSERT OR REPLACE INTO estado(clave,valor,actualizado) VALUES(?,?,?)", (partes[1], bd.js(d), bd.ahora()))
            return {"ok": True}
        if r == "evaluar" and m == "POST":
            return evaluar(d)
        if r == "signos" and m == "POST":
            lote = d.get("lote") or [d]
            out = {}
            for x in lote:
                v = x.get("v") or {}
                niv = signos.evaluar(v)
                bd.ejecutar("INSERT INTO signos(tripulante,creado,hr,spo2,sbp,dbp,temp,rr,nivel) VALUES(?,?,?,?,?,?,?,?,?)",
                            (x.get("tripulante"), bd.ahora(), v.get("hr"), v.get("spo2"), v.get("sbp"), v.get("dbp"), v.get("temp"), v.get("rr"), niv["max"]))
                out[x.get("tripulante")] = niv
            return {"niveles": out}
        if partes[0] == "signos" and len(partes) == 2 and m == "GET":
            n = min(500, int((q.get("n") or ["60"])[0]))
            return {"signos": bd.filas("SELECT * FROM signos WHERE tripulante=? ORDER BY id DESC LIMIT ?", (partes[1], n))}
        if r == "autoreporte" and m == "POST":
            return guardar_autoreporte(d)
        if partes[0] == "autoreporte" and len(partes) == 2 and m == "GET":
            return {"ultimo": ultimo_autoreporte(partes[1]),
                    "historial": bd.filas("SELECT * FROM autoreportes WHERE tripulante=? AND simulado=0 ORDER BY id DESC LIMIT 30", (partes[1],))}
        if r == "simular" and m == "POST":
            return simular(d)
        if partes[0] == "simular" and len(partes) == 2 and m == "DELETE":
            return borrar_simulacion(partes[1])
        if r == "problemas" and m == "GET":
            return clinico.base()
        if r == "pruebas" and m == "POST":
            return guardar_prueba(d)
        if partes[0] == "pruebas" and len(partes) == 2 and m == "GET":
            rows = bd.filas("SELECT * FROM pruebas WHERE tripulante=? ORDER BY id DESC LIMIT 100", (partes[1],))
            for x in rows:
                x["detalle"] = bd.dejs(x["detalle"], {})
            return {"pruebas": rows}
        if r == "muestras" and m == "POST":
            return guardar_muestra(d)
        if partes[0] == "muestras" and len(partes) == 2 and m == "GET":
            todas = muestras_de(partes[1])
            return {"vigentes": valoracion.vigentes(todas), "historial": list(reversed(todas))}
        if r == "alertas" and m == "POST":
            ya = bd.fila("SELECT id,nivel FROM alertas WHERE clave=? AND estado='activa'", (d.get("clave"),))
            if ya and ya["nivel"] >= int(d.get("nivel") or 1):
                return {"ok": True, "id": ya["id"], "nueva": False}
            aid = bd.ejecutar("INSERT INTO alertas(clave,tripulante,creada,nivel,titulo,detalle) VALUES(?,?,?,?,?,?)",
                              (d.get("clave"), d.get("tripulante"), bd.ahora(), int(d.get("nivel") or 1), d.get("titulo") or "Alerta", d.get("detalle")))
            enlace.encolar(1 if int(d.get("nivel") or 1) >= 2 else 2, f"{'ALERTA' if int(d.get('nivel') or 1) >= 2 else 'Aviso'}: {d.get('quien') or ''} · {d.get('titulo')}",
                           {"tipo": "alerta", "tripulante": d.get("quien"), "nivel": d.get("nivel"), "detalle": d.get("detalle")})
            return {"ok": True, "id": aid, "nueva": True}
        if r == "alertas/cerrar" and m == "POST":
            bd.ejecutar("UPDATE alertas SET estado=?, cerrada=?, motivo=? WHERE clave=? AND estado='activa'",
                        (d.get("estado") or "cerrada", bd.ahora(), d.get("motivo"), d.get("clave")))
            return {"ok": True}
        if r == "alertas" and m == "GET":
            return {"alertas": bd.filas("SELECT * FROM alertas ORDER BY id DESC LIMIT 100")}
        if r == "enlace" and m == "GET":
            return enlace.resumen()
        if r == "enlace/cola" and m == "POST":
            return {"id": enlace.encolar(d.get("prioridad") or 3, d.get("resumen") or "Paquete", d.get("datos"))}
        if r == "enlace/modo" and m == "POST":
            enlace.ESTADO["sin_senal"] = bool(d.get("sin_senal"))
            if enlace.ESTADO["sin_senal"]:
                enlace.ESTADO["en_linea"] = False
            return enlace.resumen()
        raise ErrorAPI(404, f"Ruta desconocida: {m} /api/{r}")


def crear_servidor():
    """Prepara la base de datos, arranca el enlace y devuelve el servidor (sin bloquear)."""
    bd.iniciar()
    if config.DEMO_AUTOMATICA and not bd.fila("SELECT id FROM mision WHERE id=1"):
        crear_mision(cargar("mision_demo"), demo=True)          # sitio en línea: listo para los jueces
    enlace._al_recibir_resultado = resultado_de_tierra
    enlace.arrancar()
    srv = ThreadingHTTPServer((config.HOST, config.PUERTO), Manejador)
    print(f"Nave lista en http://localhost:{config.PUERTO}  ·  base de datos: {config.BD}  ·  Tierra: {config.TIERRA_URL}")
    return srv


def main():
    srv = crear_servidor()
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
