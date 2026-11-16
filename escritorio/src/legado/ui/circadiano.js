'use strict';
/* ================= RITMO CIRCADIANO · datos de la guía de sueño =================
   En el espacio se pierde la noción del día y la noche: en la Estación
   Espacial hay unos 16 amaneceres al día y en la Luna el día dura unos
   29.5 días terrestres. El reloj del cuerpo se guía por la luz, así que la
   app marca un día de 24 h (hora UTC de la misión) con fases de luz.
   El reloj animado es el componente de React src/componentes/PanelResumen.jsx. */
const FASES_LUZ=[
  {de:6,a:7,n:'Despertar',luz:'Luz azul brillante',col:'#7FB2FF',tip:'Prende la luz azul de la cabina y abre la cortina: le dice a tu cuerpo que empezó el día.'},
  {de:7,a:19.5,n:'Día',luz:'Luz blanca',col:'#F7D154',tip:'Mantén luz blanca intensa mientras trabajas y haz tu ejercicio antes de la tarde.'},
  {de:19.5,a:21.5,n:'Preparar el sueño',luz:'Luz cálida y tenue',col:'#FF9F5A',tip:'Cambia a luz cálida, baja las pantallas y evita el ejercicio intenso. Prueba la respiración guiada.'},
  {de:21.5,a:30,n:'Dormir',luz:'Oscuridad',col:'#5B6CFF',tip:'Antifaz y tapones si hay luz o ruido. Duerme en tu saco, a la misma hora todos los días: meta de 8 h.'}];
function faseLuz(h){const x=h<6?h+24:h;return FASES_LUZ.find(f=>x>=f.de&&x<f.a)||FASES_LUZ[3]}
function afuera(){const z=mzAt(DAY);
  if(z.id==='leo')return{t:'Afuera: unos 16 amaneceres al día',d:'La Estación da una vuelta a la Tierra cada 90 minutos: 45 de luz y 45 de oscuridad. Por eso la luz de la cabina es la que marca el día.',orb:90};
  if(z.id==='sur')return{t:'Afuera: un día lunar dura unos 29.5 días',d:'En la base hay cerca de dos semanas seguidas de luz solar y dos de oscuridad. Sin la cabina, el cuerpo no sabría qué hora es.',orb:0};
  return{t:'Afuera: no hay día ni noche de 24 h',d:'En el viaje la nave puede estar con sol todo el tiempo. Tu día lo marcan la luz de la cabina y el horario de la tripulación.',orb:0}}
