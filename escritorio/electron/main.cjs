// Space First AID · programa de escritorio (Electron)
//
// 1) Arranca el motor de la nave (Python + SQLite) en un puerto libre.
//    - Empaquetado: usa el motor incluido en resources/motor (no hace falta instalar Python).
//    - En desarrollo: usa `python3 ../iniciar.py`.
// 2) Cuando el motor responde, abre la ventana con la pantalla (React), que el propio
//    motor sirve junto con la API. Todo queda en esta computadora: funciona sin internet.
// 3) Al cerrar la ventana apaga el motor.
const { app, BrowserWindow, Menu, dialog, session, shell } = require('electron');
const { spawn, execFile } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');

let motor = null;
let ventana = null;
let urlNave = null;

/** Primer puerto libre a partir de `desde`. */
function puertoLibre(desde) {
  return new Promise((resolver, rechazar) => {
    const probar = p => {
      if (p > desde + 40) return rechazar(new Error('No hay puertos libres'));
      const s = net.createServer();
      s.once('error', () => probar(p + 1));
      s.once('listening', () => s.close(() => resolver(p)));
      s.listen(p, '127.0.0.1');
      return undefined;
    };
    probar(desde);
  });
}

/** ¿El motor ya responde en ese puerto? */
function motorListo(puerto) {
  return new Promise(resolver => {
    const pedido = http.get({ host: '127.0.0.1', port: puerto, path: '/api/salud', timeout: 1200 }, r => {
      let cuerpo = '';
      r.on('data', c => { cuerpo += c; });
      r.on('end', () => { try { resolver(JSON.parse(cuerpo).nave === 'Space First AID'); } catch (e) { resolver(false); } });
    });
    pedido.on('error', () => resolver(false));
    pedido.on('timeout', () => { pedido.destroy(); resolver(false); });
  });
}

async function arrancarMotor() {
  const puertoNave = await puertoLibre(8000);
  const puertoTierra = await puertoLibre(8766);
  const pantalla = app.isPackaged ? path.join(process.resourcesPath, 'pantalla') : path.join(__dirname, '..', 'dist');
  const env = {
    ...process.env,
    NAVE_PUERTO: String(puertoNave),
    TIERRA_PUERTO: String(puertoTierra),
    TIERRA_URL: process.env.TIERRA_URL || `http://127.0.0.1:${puertoTierra}`,
    NAVE_APP: pantalla,
    PYTHONUNBUFFERED: '1',
    PYTHONUTF8: '1',
  };
  delete env.PORT;
  if (app.isPackaged) {
    const exe = path.join(process.resourcesPath, 'motor', process.platform === 'win32' ? 'SpaceFirstAID.exe' : 'SpaceFirstAID');
    motor = spawn(exe, ['--sin-navegador'], { env, windowsHide: true });
  } else {
    const python = process.platform === 'win32' ? 'python' : 'python3';
    motor = spawn(python, [path.join(__dirname, '..', '..', 'iniciar.py'), '--sin-navegador'], { env, windowsHide: true });
  }
  let salida = '';
  const anotar = d => { salida = (salida + d).slice(-4000); process.stdout.write(`[motor] ${d}`); };
  motor.stdout.on('data', anotar);
  motor.stderr.on('data', anotar);
  let terminado = false;
  motor.on('exit', () => { terminado = true; motor = null; });
  motor.on('error', e => { terminado = true; salida += `\n${e.message}`; });

  for (let i = 0; i < 120; i++) {                 // hasta 60 s (el primer arranque descomprime el motor)
    if (await motorListo(puertoNave)) return `http://127.0.0.1:${puertoNave}`;
    if (terminado) break;
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error('El motor de la nave no arrancó.\n\n' + salida.slice(-900));
}

function apagarMotor() {
  if (!motor) return;
  const m = motor;
  motor = null;
  try {
    if (process.platform === 'win32') execFile('taskkill', ['/pid', String(m.pid), '/T', '/F']);
    else m.kill('SIGTERM');
  } catch (e) { /* ya estaba apagado */ }
}

function crearVentana() {
  ventana = new BrowserWindow({
    width: 1440, height: 920, minWidth: 380, minHeight: 600,
    backgroundColor: '#05070A', title: 'Space First AID', autoHideMenuBar: true, show: false,
    icon: path.join(__dirname, '..', 'public', 'media', 'icono.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  ventana.once('ready-to-show', () => ventana.show());
  ventana.on('closed', () => { ventana = null; });
  // El centro de control (/tierra/) se abre en otra ventana; los enlaces a fuentes externas, en el navegador.
  ventana.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(urlNave)) return { action: 'allow', overrideBrowserWindowOptions: { width: 1180, height: 820, backgroundColor: '#05070A', autoHideMenuBar: true, title: 'Centro de control · Tierra' } };
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  ventana.loadURL(urlNave);
}

const unica = app.requestSingleInstanceLock();
if (!unica) app.quit();
else {
  app.on('second-instance', () => { if (ventana) { if (ventana.isMinimized()) ventana.restore(); ventana.focus(); } });
  app.whenReady().then(async () => {
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      { label: 'Space First AID', submenu: [{ role: 'about', label: 'Acerca de' }, { type: 'separator' }, { role: 'quit', label: 'Salir' }] },
      { label: 'Edición', submenu: [{ role: 'undo', label: 'Deshacer' }, { role: 'redo', label: 'Rehacer' }, { type: 'separator' }, { role: 'cut', label: 'Cortar' }, { role: 'copy', label: 'Copiar' }, { role: 'paste', label: 'Pegar' }, { role: 'selectAll', label: 'Seleccionar todo' }] },
      { label: 'Ver', submenu: [{ role: 'reload', label: 'Recargar' }, { role: 'togglefullscreen', label: 'Pantalla completa' }, { role: 'resetZoom', label: 'Tamaño normal' }, { role: 'zoomIn', label: 'Acercar' }, { role: 'zoomOut', label: 'Alejar' }, { type: 'separator' }, { role: 'toggleDevTools', label: 'Herramientas de desarrollo' }] },
    ]));
    // La cámara solo se permite para la propia app (pruebas con la mano).
    session.defaultSession.setPermissionRequestHandler((wc, permiso, responder) => {
      responder(permiso === 'media' && !!urlNave && wc.getURL().startsWith(urlNave));
    });
    try {
      urlNave = await arrancarMotor();
      crearVentana();
    } catch (e) {
      dialog.showErrorBox('Space First AID', e.message);
      app.quit();
    }
    app.on('activate', () => { if (!ventana && urlNave) crearVentana(); });
  });
  app.on('window-all-closed', () => { apagarMotor(); app.quit(); });
  app.on('before-quit', apagarMotor);
  process.on('exit', apagarMotor);
}
