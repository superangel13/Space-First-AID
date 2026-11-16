import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));

// El núcleo de la app (datos de la tripulación, signos vitales, alertas, juegos, 3D…)
// está en src/legado/, en archivos que comparten un mismo ámbito. Este plugin los une,
// en este orden, en un solo módulo: `import('virtual:nucleo')`.
const PARTES = [
  'nucleo/utilidades.js', 'datos/fuentes.js', 'nucleo/tripulacion.js', 'nucleo/puntuaciones.js', 'ui/anillos.js',
  'ui/encabezado.js', 'ui/selector.js', 'vistas/panel.js', 'vistas/persona.js', 'juegos/orbita.js',
  'juegos/calibracion.js', 'juegos/manos.js', 'vistas/referencias.js', 'nucleo/signos.js',
  'nucleo/alertas.js', 'nucleo/predicciones.js', 'vistas/mision.js', 'ui/cuerpo3d.js', 'vistas/alertas.js',
  'ui/ambiente.js', 'vistas/midia.js', 'motor/clinico.js', 'vistas/sintomas.js', 'vistas/muestras.js',
  'ui/alerta_grande.js', 'ui/sirena.js', 'ui/circadiano.js', 'juegos/mente.js', 'nucleo/enlace.js',
  'vistas/pruebas.js', 'main.js', '_exporta.js',
];

function nucleo() {
  const id = 'virtual:nucleo', rid = '\0' + id, dir = path.join(aqui, 'src', 'legado');
  const abs = f => JSON.stringify(path.join(aqui, 'src', f));
  return {
    name: 'nucleo-space-first-aid',
    resolveId(s) { if (s === id) return rid; },
    load(i) {
      if (i !== rid) return;
      PARTES.forEach(f => this.addWatchFile(path.join(dir, f)));
      const cabecera = `import { API, guardarEstado } from ${abs('api.js')};\n`
        + `import { ANTECEDENTES } from ${abs('datos/antecedentes.js')};\n`
        + `import { SFA } from ${abs('bus.js')};\n`;
      return cabecera + PARTES.map(f => `\n/* ======== ${f} ======== */\n` + fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
    },
  };
}

export default defineConfig({
  plugins: [react(), nucleo()],
  server: {
    port: 5173,
    fs: { allow: ['..'] },
    // En desarrollo, la API y los datos los sirve el motor en Python (python3 ../iniciar.py)
    proxy: { '/api': 'http://127.0.0.1:8000', '/datos': 'http://127.0.0.1:8000', '/tierra': 'http://127.0.0.1:8000' },
  },
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1500 },
});
