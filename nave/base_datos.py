"""Acceso a SQLite (nave.db). Una conexión por operación: simple y segura con hilos."""
import json, sqlite3, threading, datetime
from contextlib import contextmanager
from . import config

_lock = threading.Lock()


def ahora():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def iniciar():
    config.BD.parent.mkdir(parents=True, exist_ok=True)
    with conexion() as con:
        con.executescript((config.RAIZ / "nave" / "esquema.sql").read_text(encoding="utf-8"))


@contextmanager
def conexion():
    con = sqlite3.connect(config.BD, timeout=10)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    try:
        with _lock:
            yield con
            con.commit()
    finally:
        con.close()


def filas(sql, args=()):
    with conexion() as con:
        return [dict(r) for r in con.execute(sql, args).fetchall()]


def fila(sql, args=()):
    r = filas(sql, args)
    return r[0] if r else None


def ejecutar(sql, args=()):
    with conexion() as con:
        cur = con.execute(sql, args)
        return cur.lastrowid


def js(v):
    return json.dumps(v, ensure_ascii=False)


def dejs(v, defecto=None):
    try:
        return json.loads(v) if v else defecto
    except (TypeError, ValueError):
        return defecto
