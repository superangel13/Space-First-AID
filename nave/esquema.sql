-- Space First AID · base de datos de la nave (SQLite)
-- Se crea sola la primera vez que arranca el servidor.

CREATE TABLE IF NOT EXISTS mision (
  id            INTEGER PRIMARY KEY CHECK (id = 1),   -- una misión activa a la vez
  nombre        TEXT NOT NULL,
  destino       TEXT NOT NULL,                        -- id de datos/destinos.json
  duracion      INTEGER NOT NULL,                     -- días
  fecha_inicio  TEXT NOT NULL,                        -- AAAA-MM-DD (día 1)
  demo          INTEGER NOT NULL DEFAULT 0,
  creada        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tripulantes (
  id            TEXT PRIMARY KEY,
  orden         INTEGER NOT NULL,
  nombre        TEXT NOT NULL,
  rol           TEXT NOT NULL,
  sexo          TEXT,                                 -- f | m
  edad          INTEGER,
  condicion     TEXT,                                 -- alta | media | baja
  antecedentes  TEXT NOT NULL DEFAULT '[]',           -- JSON: lista de ids
  notas         TEXT,
  color         TEXT,
  sim           TEXT                                  -- JSON: parámetros del sensor simulado
);

-- Estado de la pantalla (preferencias, juegos, check-ins). Clave -> JSON.
CREATE TABLE IF NOT EXISTS estado (
  clave         TEXT PRIMARY KEY,
  valor         TEXT NOT NULL,
  actualizado   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reportes_sintomas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tripulante    TEXT NOT NULL REFERENCES tripulantes(id),
  creado        TEXT NOT NULL,
  sintomas      TEXT NOT NULL,                        -- JSON {id: {v, pat, on}}
  preguntas     TEXT NOT NULL                         -- JSON {id: true}
);

CREATE TABLE IF NOT EXISTS evaluaciones (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tripulante    TEXT NOT NULL,
  creado        TEXT NOT NULL,
  nivel         INTEGER NOT NULL,                     -- 0 nada, 1 advertencia, 2 alerta
  resumen       TEXT,
  resultado     TEXT NOT NULL                         -- JSON con todas las condiciones
);

CREATE TABLE IF NOT EXISTS signos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tripulante    TEXT NOT NULL,
  creado        TEXT NOT NULL,
  hr REAL, spo2 REAL, sbp REAL, dbp REAL, temp REAL, rr REAL,
  nivel         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pruebas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tripulante    TEXT NOT NULL,
  creado        TEXT NOT NULL,
  dia           INTEGER,
  prueba        TEXT NOT NULL,                        -- pvt, alcance, trazo, vision_c, amsler, animo, bart, ert, nback
  puntaje       REAL,
  nivel         INTEGER NOT NULL DEFAULT 0,
  detalle       TEXT                                  -- JSON
);

CREATE TABLE IF NOT EXISTS muestras (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo        TEXT NOT NULL,                        -- ORI-0001, SAN-0002...
  tripulante    TEXT NOT NULL,
  tipo          TEXT NOT NULL,                        -- orina | sangre | saliva
  origen        TEXT NOT NULL,                        -- a_bordo | tierra
  tomada        TEXT NOT NULL,
  registrada    TEXT NOT NULL,
  valores       TEXT NOT NULL,                        -- JSON {analito: valor}
  resultado     TEXT,                                 -- JSON: interpretación por analito
  nivel         INTEGER NOT NULL DEFAULT 0,
  enviada_tierra INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS alertas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  clave         TEXT NOT NULL,                        -- tripulante:tipo
  tripulante    TEXT,
  creada        TEXT NOT NULL,
  nivel         INTEGER NOT NULL,
  titulo        TEXT NOT NULL,
  detalle       TEXT,
  estado        TEXT NOT NULL DEFAULT 'activa',       -- activa | atendida | cerrada
  cerrada       TEXT,
  motivo        TEXT
);

-- Registro personal del tripulante (documento de parámetros)
CREATE TABLE IF NOT EXISTS autoreportes (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  tripulante    TEXT NOT NULL,
  creado        TEXT NOT NULL,
  carga         REAL,                                 -- carga de trabajo 0-100
  pss           REAL,                                 -- estrés PSS-10 0-40
  animo         REAL,                                 -- 1-10
  equipo        REAL,                                 -- trabajo en equipo 1-10
  simulado      INTEGER NOT NULL DEFAULT 0
);

-- Cola de envío a la Tierra: se manda por prioridad cuando hay señal.
CREATE TABLE IF NOT EXISTS cola_enlace (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  creado        TEXT NOT NULL,
  prioridad     INTEGER NOT NULL,                     -- 1 alerta, 2 resumen, 3 detalle
  resumen       TEXT NOT NULL,
  datos         TEXT,
  enviado       TEXT,
  intentos      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_cola_pend ON cola_enlace(enviado, prioridad);
CREATE INDEX IF NOT EXISTS ix_signos_t ON signos(tripulante, id);
CREATE INDEX IF NOT EXISTS ix_pruebas_t ON pruebas(tripulante, prueba, id);
CREATE INDEX IF NOT EXISTS ix_muestras_t ON muestras(tripulante, codigo);
