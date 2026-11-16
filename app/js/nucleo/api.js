'use strict';
/* ================= comunicación con el servidor de la nave (Python) =================
   Todo lo que se captura se manda a /api/... y queda en SQLite (nave/nave.db). */
const API={
  async pedir(metodo,ruta,cuerpo){
    const r=await fetch('/api/'+ruta,{method:metodo,headers:cuerpo?{'Content-Type':'application/json'}:{},body:cuerpo?JSON.stringify(cuerpo):undefined});
    let d=null;try{d=await r.json()}catch(e){}
    if(!r.ok)throw new Error((d&&d.error)||('Error '+r.status));
    return d},
  get(r){return this.pedir('GET',r)},post(r,b){return this.pedir('POST',r,b||{})},put(r,b){return this.pedir('PUT',r,b)},del(r){return this.pedir('DELETE',r)}
};
/* estado de la pantalla: se guarda en el servidor, con un pequeño retraso para no saturarlo */
const _pendEstado={};
function guardarEstado(k){clearTimeout(_pendEstado[k]);_pendEstado[k]=setTimeout(()=>{API.put('estado/'+encodeURIComponent(k),window.ESTADO[k]).catch(()=>{})},400)}
