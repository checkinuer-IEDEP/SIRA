const API_URL =
CONFIG.API_URL;

function consultarDashboard(){

const fechaInicio =
document.getElementById("fechaInicio").value;

const fechaFin =
document.getElementById("fechaFin").value;

if(!fechaInicio || !fechaFin){

mostrarModal(
"Información requerida",
"Seleccione fecha inicial y fecha final."
);

return;

}

if(fechaFin < fechaInicio){

mostrarModal(
"Rango inválido",
"La fecha final no puede ser menor que la fecha inicial."
);

return;

}

mostrarSpinner(
"Generando Dashboard Ejecutivo del periodo " +
fechaInicio +
" - " +
fechaFin
);

fetch(API_URL,{

method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({
accion:"obtenerDashboardRH",
fechaInicio:fechaInicio,
fechaFin:fechaFin
})

})

.then(r=>r.json())

.then(data=>{

ocultarSpinner();

pintarResumen(data.resumen);

pintarRanking(
"uerMasFaltas",
data.ranking.uerMasFaltas
);

pintarRanking(
"uerRetardosMenores",
data.ranking.uerRetardosMenores
);

pintarRanking(
"uerRetardosMayores",
data.ranking.uerRetardosMayores
);

pintarRanking(
"uerManualEntrada",
data.ranking.uerManualEntrada
);

pintarRanking(
"uerManualSalida",
data.ranking.uerManualSalida
);

mostrarModal(
"Dashboard generado",
"Indicadores generados correctamente para el periodo seleccionado."
);

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
"Error",
"No fue posible generar el Dashboard Ejecutivo."
);

});

}

function pintarResumen(resumen){

document.getElementById("totalRegistros").innerText =
resumen.totalRegistros;

document.getElementById("totalEntradas").innerText =
resumen.totalEntradas;

document.getElementById("totalSalidas").innerText =
resumen.totalSalidas;

document.getElementById("faltasCompletas").innerText =
resumen.faltasCompletas;

document.getElementById("faltasEntrada").innerText =
resumen.faltasEntrada;

document.getElementById("faltasSalida").innerText =
resumen.faltasSalida;

document.getElementById("retardosMenores").innerText =
resumen.retardosMenores;

document.getElementById("retardosMayores").innerText =
resumen.retardosMayores;

}

function pintarRanking(id,datos){

const contenedor =
document.getElementById(id);

if(!datos || datos.length === 0){

contenedor.innerHTML =
"<p class='sin-datos'>Sin datos en el periodo.</p>";

return;

}

let html = "";

datos.slice(0,10).forEach(item=>{

html += `

<div class="ranking-item">
    <span>${item.uer}</span>
    <span>${item.total}</span>
</div>

`;

});

contenedor.innerHTML =
html;

}

function mostrarSpinner(texto){

document.getElementById("spinnerTexto").innerText =
texto;

document.getElementById("spinnerOverlay")
.classList.remove("hidden");

}

function ocultarSpinner(){

document.getElementById("spinnerOverlay")
.classList.add("hidden");

}

function mostrarModal(titulo,mensaje){

document.getElementById("modalTitulo").innerText =
titulo;

document.getElementById("modalMensaje").innerText =
mensaje;

document.getElementById("modalOverlay")
.classList.remove("hidden");

}

function cerrarModal(){

document.getElementById("modalOverlay")
.classList.add("hidden");

}
