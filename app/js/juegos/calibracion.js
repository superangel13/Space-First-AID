'use strict';
/* ================= calibración de la pantalla =================
   Para calcular la agudeza (logMAR) de «La C abierta» se necesita saber
   cuántos píxeles mide un milímetro en esta pantalla. 3.78 px/mm es una
   pantalla estándar de 96 ppp. Se puede ajustar con una tarjeta de crédito
   (85.6 mm de ancho) desde la consola: calibrarPantalla(anchoEnPx). */
const pxmm=()=>S.cal||3.78;
function calibrarPantalla(anchoTarjetaPx){if(anchoTarjetaPx>100){S.cal=anchoTarjetaPx/85.6;save();toast(`Pantalla calibrada: ${S.cal.toFixed(2)} px por mm`)}return pxmm()}
