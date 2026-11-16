// Copia a public/ los recursos que comparte con la versión web (app/):
// three.js, cuerpo 3D, fuentes, detector de manos (MediaPipe), video, ícono e idioma (i18n).
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = dirname(fileURLToPath(import.meta.url));
const app = join(aqui, '..', '..', 'app');
const pub = join(aqui, '..', 'public');
mkdirSync(pub, { recursive: true });
for (const carpeta of ['vendor', 'media', 'i18n']) cpSync(join(app, carpeta), join(pub, carpeta), { recursive: true });
console.log('Recursos copiados a public/ (vendor, media)');
