/* Space First AID · idioma (español / English)
 *
 * La app está escrita en español. En inglés, este archivo traduce lo que aparece en la pantalla
 * con el diccionario de app/i18n/en.js (window.SFA_EN, generado con herramientas/i18n/).
 * Traduce:
 *  - el texto de la página, también el que cambia después (React, núcleo, respuestas del motor);
 *  - los atributos title, placeholder, aria-label y alt;
 *  - el texto dibujado en canvas (juegos) y los diálogos (confirm, alert).
 * Cambiar de idioma no recarga la página: se restaura el texto original o se vuelve a traducir.
 *
 * API: window.SFA_I18N = { idioma(), elegido(), poner('es'|'en'), t(texto), faltan() }
 */
(function () {
  'use strict';
  var CLAVE = 'sfa.idioma';
  var elegido = null;
  try { elegido = localStorage.getItem(CLAVE); } catch (e) { /* sin almacenamiento */ }
  var idioma = elegido === 'en' ? 'en' : 'es';

  /* ---------- diccionario ---------- */
  var DIC = window.SFA_EN || {};
  var exacto = new Map(), minus = new Map(), numerico = new Map(), plantillas = [];
  var NUM = /\d+(?:[.,]\d+)*/g;
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  Object.keys(DIC).forEach(function (es) {
    var en = DIC[es], k = norm(es);
    if (!k || en == null) return;
    if (/\{\d+\}/.test(k)) {
      // Plantillas ambiguas («{0}{1}», «3{1}»): no se puede saber dónde corta cada parte.
      if (/\}\{|\d\{|\}\d/.test(k)) return;
      var partes = k.split(/\{(\d+)\}/), re = '^', orden = [];
      for (var i = 0; i < partes.length; i++) {
        if (i % 2) { re += '(.+?)'; orden.push(+partes[i]); } else re += escRe(partes[i]);
      }
      plantillas.push({ re: new RegExp(re + '$'), en: en, orden: orden, peso: k.replace(/\{\d+\}/g, '').length });
    } else {
      exacto.set(k, en);
      if (!minus.has(k.toLowerCase())) minus.set(k.toLowerCase(), en);
      var nums = k.match(NUM);
      if (nums) {
        var numsEn = String(en).match(NUM) || [];
        if (numsEn.length === nums.length) numerico.set(k.replace(NUM, '#'), String(en).replace(NUM, '#'));
      }
    }
  });
  plantillas.sort(function (a, b) { return b.peso - a.peso; });

  /* ---------- ¿parece español? (para saber si falta traducir) ---------- */
  var ES_RE = /[áéíóúñ¿¡]|\b(de|la|el|los|las|que|con|para|sin|por|del|una|uno|en|y|es|se|al|su|sus|más|menos|hay|está|son|tu|cada|todo|todos|día|días|tiene|hoy|ver|sí|no hay)\b/i;
  var nombres = null;
  function esNombre(s) {
    if (!nombres) {
      nombres = new Set();
      try { (window.TRIP || []).forEach(function (c) { nombres.add(norm(c.nombre || c.n || '')); }); } catch (e) { /* aún sin tripulación */ }
      if (!nombres.size) nombres = null;
    }
    return !!(nombres && nombres.has(norm(s)));
  }
  function pareceEs(s) { return ES_RE.test(s) && !esNombre(s); }

  /* ---------- traducir un texto ---------- */
  var cache = new Map();
  var SEPARADORES = [' · ', ' — ', ' – ', ' | ', ' → ', '. ', ': ', '; ', ', ', ' / ', ' (', ') '];

  // «EMERGENCIA», «base en la superficie»: mismo texto con otras mayúsculas.
  function conMayusculas(n) {
    var en = minus.get(n.toLowerCase());
    if (en == null) return null;
    if (n === n.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(n)) return en.toUpperCase();
    var a = n.charAt(0), b = en.charAt(0);
    if (a === a.toLowerCase() && a !== a.toUpperCase()) return b.toLowerCase() + en.slice(1);
    if (a === a.toUpperCase() && a !== a.toLowerCase()) return b.toUpperCase() + en.slice(1);
    return en;
  }

  function buscar(n, prof) {
    if (exacto.has(n)) return exacto.get(n);
    if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]{2}/.test(n)) return n;   // números y símbolos: nada que traducir
    var may = conMayusculas(n);
    if (may != null) return may;
    if (exacto.has(n + '.')) return String(exacto.get(n + '.')).replace(/\.$/, '');   // la misma oración sin punto final
    var nums = n.match(NUM);
    if (nums) {
      var kn = n.replace(NUM, '#');
      if (numerico.has(kn)) { var i = 0; return numerico.get(kn).replace(/#/g, function () { return nums[i++]; }); }
    }
    for (var p = 0; p < plantillas.length; p++) {
      var m = plantillas[p].re.exec(n);
      if (!m) continue;
      var pl = plantillas[p], partes0 = [], valida = true;
      for (var q = 1; q < m.length; q++) {
        var tq = t(m[q], prof + 1);
        if (tq === m[q] && pareceEs(m[q])) { valida = false; break; }   // la parte variable sigue en español
        partes0.push(tq);
      }
      if (!valida) continue;
      return String(pl.en).replace(/\{(\d+)\}/g, function (_, j) {
        var pos = pl.orden.indexOf(+j);
        return pos < 0 ? '' : partes0[pos];
      });
    }
    if (prof > 4) return n;
    // Signos alrededor: «¿Cómo te sientes?», «(opcional)», «Pulso:», «✓ Hecho»
    var r = /^([\s(\[«"'“¿¡•·\-–—*✓✕⚠←→]*)(.*?)([\s)\]»"'”.,:;!?…*→]*)$/.exec(n);
    if (r && (r[1] || r[3]) && r[2]) {
      var nucleo = buscar(r[2], prof + 1);
      if (nucleo !== r[2]) return r[1].replace(/[¿¡]/g, '') + nucleo + r[3];
    }
    // Oraciones: «Todo bien. Estado general: 96 %.» (cada una conserva su punto)
    if (/[.!?] [A-ZÁÉÍÓÚÑ¿¡]/.test(n)) {
      var oraciones = n.split(/(?<=[.!?]) (?=[A-ZÁÉÍÓÚÑ¿¡])/);
      if (oraciones.length > 1) {
        var cambioO = false;
        var trO = oraciones.map(function (x) { var y = t(x, prof + 1); if (y !== x) cambioO = true; return y; });
        if (cambioO) return trO.join(' ');
      }
    }
    // Partes separadas: «Radiación · Inmunológico», «Pulso: alto»
    for (var s = 0; s < SEPARADORES.length; s++) {
      var sep = SEPARADORES[s];
      if (n.indexOf(sep) > 0) {
        var partes = n.split(sep), cambio = false;
        var tr = partes.map(function (x) { var y = x ? t(x, prof + 1) : x; if (y !== x) cambio = true; return y; });
        if (cambio) return tr.join(sep);
      }
    }
    // Prefijo o sufijo conocido con un nombre o número: «Simular en Grover»
    var pal = n.split(' ');
    for (var c = pal.length - 1; c > 0; c--) {
      var izq = pal.slice(0, c).join(' '), der = pal.slice(c).join(' ');
      if (exacto.has(izq) && (!pareceEs(der) || esNombre(der))) return exacto.get(izq) + ' ' + der;
      if (exacto.has(der) && (!pareceEs(izq) || esNombre(izq))) return izq + ' ' + exacto.get(der);
    }
    return n;
  }

  function t(texto, prof) {
    if (texto == null) return texto;
    var s = String(texto), n = norm(s);
    if (!n) return s;
    var en;
    if (cache.has(n)) en = cache.get(n);
    else { en = buscar(n, prof || 0); if (cache.size > 20000) cache.clear(); cache.set(n, en); }
    if (en === n) return s;
    var ini = /^\s*/.exec(s)[0], fin = /\s*$/.exec(s)[0];
    return ini + en + fin;
  }

  /* ---------- textos que faltan (para completar el diccionario) ---------- */
  var faltan = new Map();
  function anotarFalta(s) {
    var n = norm(s);
    if (n.length < 2 || !pareceEs(n)) return;
    faltan.set(n, (faltan.get(n) || 0) + 1);
  }

  /* ---------- pantalla ---------- */
  // Sin traducir su contenido (los campos sí traducen title, placeholder y aria-label).
  var SALTAR = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  var ATRIBUTOS = ['title', 'placeholder', 'aria-label', 'alt'];
  var texto0 = new WeakMap();   // nodo de texto → { es, en }
  var atrib0 = new WeakMap();   // elemento → { atributo: { es, en } }

  function saltar(el) {
    for (var e = el; e && e.nodeType === 1; e = e.parentNode) {
      if (SALTAR[e.nodeName] || (e.hasAttribute && e.hasAttribute('data-no-traducir'))) return true;
    }
    return false;
  }
  function original(nodo) {
    var r = texto0.get(nodo);
    return r && nodo.data === r.en ? r.es : nodo.data;
  }
  function poner(nodo, es, en) {
    if (en === es) { texto0.delete(nodo); if (nodo.data !== es) nodo.data = es; return; }
    texto0.set(nodo, { es: es, en: en });
    if (nodo.data !== en) nodo.data = en;
  }

  // React parte «{n} de {total}» en varios nodos de texto seguidos: se traducen juntos.
  function grupo(padre) {
    var hijos = padre.childNodes, nodos = [];
    for (var i = 0; i < hijos.length; i++) {
      if (hijos[i].nodeType === 3) nodos.push(hijos[i]); else return null;
    }
    return nodos.length > 1 ? nodos : null;
  }

  function traducirTexto(nodo) {
    var padre = nodo.parentNode;
    if (!padre || padre.nodeType !== 1 || saltar(padre)) return;
    var nodos = grupo(padre);
    if (nodos) {
      var es = nodos.map(original), junto = es.join('');
      var en = t(junto);
      if (en !== junto) {
        poner(nodos[0], es[0], en);
        for (var i = 1; i < nodos.length; i++) poner(nodos[i], es[i], '');
        return;
      }
      for (var j = 0; j < nodos.length; j++) traducirUno(nodos[j], es[j]);
      return;
    }
    traducirUno(nodo, original(nodo));
  }
  function traducirUno(nodo, es) {
    var en = t(es);
    poner(nodo, es, en);
    if (en === es) anotarFalta(es);
  }

  function traducirAtributo(el, nombre) {
    var v = el.getAttribute(nombre);
    if (v == null) return;
    var mapa = atrib0.get(el) || {};
    var r = mapa[nombre];
    var es = r && v === r.en ? r.es : v;
    var en = t(es);
    if (en === es) { if (r) delete mapa[nombre]; return; }
    mapa[nombre] = { es: es, en: en };
    atrib0.set(el, mapa);
    if (v !== en) el.setAttribute(nombre, en);
  }
  function traducirElemento(el) {
    if (saltar(el.nodeName === 'TEXTAREA' ? el.parentNode : el)) return;
    for (var a = 0; a < ATRIBUTOS.length; a++) if (el.hasAttribute(ATRIBUTOS[a])) traducirAtributo(el, ATRIBUTOS[a]);
  }
  function recorrer(raiz) {
    if (!raiz) return;
    if (raiz.nodeType === 3) { traducirTexto(raiz); return; }
    if (raiz.nodeType !== 1 && raiz.nodeType !== 9 && raiz.nodeType !== 11) return;
    if (raiz.nodeType === 1) { if (saltar(raiz)) return; traducirElemento(raiz); }
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
      acceptNode: function (n) {
        if (n.nodeName === 'TEXTAREA') { traducirElemento(n); return NodeFilter.FILTER_REJECT; }
        if (n.nodeType === 1) return SALTAR[n.nodeName] || n.hasAttribute('data-no-traducir') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    var lista = [];
    for (var n = w.nextNode(); n; n = w.nextNode()) lista.push(n);
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].nodeType === 1) traducirElemento(lista[i]); else traducirTexto(lista[i]);
    }
  }
  function restaurar() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (var n = w.nextNode(); n; n = w.nextNode()) {
      if (n.nodeType === 3) {
        var r = texto0.get(n);
        if (r && n.data === r.en) n.data = r.es;
        texto0.delete(n);
      } else {
        var mapa = atrib0.get(n);
        if (mapa) {
          Object.keys(mapa).forEach(function (k) { if (n.getAttribute(k) === mapa[k].en) n.setAttribute(k, mapa[k].es); });
          atrib0.delete(n);
        }
      }
    }
  }

  var observador = new MutationObserver(function (cambios) {
    for (var i = 0; i < cambios.length; i++) {
      var c = cambios[i];
      if (c.type === 'characterData') {
        var r = texto0.get(c.target);
        if (!r || c.target.data !== r.en) traducirTexto(c.target);
      } else if (c.type === 'attributes') {
        var mapa = atrib0.get(c.target), v = c.target.getAttribute(c.attributeName);
        var dueno = c.target.nodeName === 'TEXTAREA' ? c.target.parentNode : c.target;
        if (!(mapa && mapa[c.attributeName] && mapa[c.attributeName].en === v) && !saltar(dueno)) traducirAtributo(c.target, c.attributeName);
      } else {
        for (var j = 0; j < c.addedNodes.length; j++) recorrer(c.addedNodes[j]);
      }
    }
  });
  function observar() {
    observador.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS });
  }

  /* ---------- canvas y diálogos ---------- */
  ['fillText', 'strokeText', 'measureText'].forEach(function (f) {
    var P = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    if (!P || !P[f]) return;
    var orig = P[f];
    P[f] = function (txt) {
      var args = Array.prototype.slice.call(arguments);
      if (idioma === 'en' && typeof txt === 'string') args[0] = t(txt);
      return orig.apply(this, args);
    };
  });
  ['alert', 'confirm', 'prompt'].forEach(function (f) {
    var orig = window[f];
    if (!orig) return;
    window[f] = function (msg) {
      var args = Array.prototype.slice.call(arguments);
      if (idioma === 'en' && typeof msg === 'string') args[0] = t(msg);
      return orig.apply(window, args);
    };
  });

  /* ---------- cambiar de idioma ---------- */
  function aplicar() {
    document.documentElement.lang = idioma;
    if (idioma === 'en') {
      if (document.body) recorrer(document.body);
      observar();
    } else {
      observador.disconnect();
      if (document.body) restaurar();
    }
  }
  function ponerIdioma(id) {
    id = id === 'en' ? 'en' : 'es';
    elegido = id;
    try { localStorage.setItem(CLAVE, id); } catch (e) { /* sin almacenamiento */ }
    if (id === idioma) { document.documentElement.lang = id; disparar(); return; }
    idioma = id;
    aplicar();
    disparar();
  }
  function disparar() {
    try { window.dispatchEvent(new CustomEvent('sfa-idioma', { detail: idioma })); } catch (e) { /* navegador viejo */ }
  }

  window.SFA_I18N = {
    idioma: function () { return idioma; },
    elegido: function () { return elegido; },
    poner: ponerIdioma,
    t: function (s) { return idioma === 'en' ? t(s) : s; },
    faltan: function () { return Array.from(faltan.keys()); },
    limpiarFaltan: function () { faltan.clear(); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', aplicar);
  else aplicar();
})();
