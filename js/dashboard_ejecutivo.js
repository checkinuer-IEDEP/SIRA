const API_URL =
CONFIG.API_URL;

let dashboardData = null;

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

dashboardData = data;    
    
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

document.getElementById("totalManualEntrada").innerText =
resumen.totalManualEntrada;

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

let categoria = "";

if(id === "uerMasFaltas"){
  categoria = "faltas";
}

if(id === "uerRetardosMenores"){
  categoria = "retardosMenores";
}

if(id === "uerRetardosMayores"){
  categoria = "retardosMayores";
}

if(id === "uerManualEntrada"){
  categoria = "manualEntrada";
}

if(id === "uerManualSalida"){
  categoria = "manualSalida";
}

let html = "";

datos.slice(0,10).forEach(item=>{

html += `

<div class="ranking-item"
     onclick="mostrarDetalleUER('${categoria}','${item.uer}')">
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


function mostrarDetalleCategoria(categoria,titulo){

if(!dashboardData || !dashboardData.detalle){
  return;
}

let datos =
dashboardData.detalle[categoria] || [];

mostrarTablaDetalle(
titulo,
datos
);

}

function mostrarDetalleUER(categoria,uer){

if(!dashboardData || !dashboardData.detalle){
  return;
}

let datos = [];

if(categoria === "faltas"){

datos =
[
  ...dashboardData.detalle.faltasCompletas,
  ...dashboardData.detalle.faltasEntrada,
  ...dashboardData.detalle.faltasSalida
];

}else{

datos =
dashboardData.detalle[categoria] || [];

}

datos =
datos.filter(r=>r.uer === uer);

mostrarTablaDetalle(
uer,
datos
);

}

function mostrarTablaDetalle(titulo,datos){

const existente =
document.getElementById("detalleDashboard");

if(existente){
  existente.remove();
}

let html = `

<div id="detalleDashboard" class="detalle-dashboard">

<h3>${titulo}</h3>

<table>
<thead>
<tr>
<th>Fecha</th>
<th>Empleado</th>
<th>Nombre</th>
<th>UER</th>
<th>Entrada</th>
<th>Salida</th>
<th>Puntualidad</th>
<th>Incidencia</th>
<th>Detalle</th>
</tr>
</thead>
<tbody>

`;

datos.forEach(r=>{

html += `

<tr>
<td>${r.fecha || ""}</td>
<td>${r.numero || ""}</td>
<td>${r.nombre || ""}</td>
<td>${r.uer || ""}</td>
<td>${r.entrada || ""}</td>
<td>${r.salida || ""}</td>
<td>${r.puntualidad || ""}</td>
<td>${r.incidencia || ""}</td>
<td>${r.detalle || ""}</td>
</tr>

`;

});

html += `

</tbody>
</table>

</div>

`;

document
.querySelector(".card")
.insertAdjacentHTML(
"beforeend",
html
);

document
.getElementById("detalleDashboard")
.scrollIntoView({
behavior:"smooth"
});

}
