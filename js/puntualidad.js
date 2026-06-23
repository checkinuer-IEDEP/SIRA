const API_URL =
CONFIG.API_URL;

let datosRetardos = [];

function consultarRetardos(){

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
"Consultando Puntualidad del Periodo " +
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
accion:"consultarRetardos",
fechaInicio:fechaInicio,
fechaFin:fechaFin
})

})

.then(r=>r.json())

.then(data=>{

ocultarSpinner();

datosRetardos =
data;

mostrarTabla(data);

actualizarResumen(data);

if(data.length === 0){

mostrarModal(
"Sin retardos",
"Periodo del " +
fechaInicio +
" al " +
fechaFin +
" sin retardos registrados."
);

}else{

mostrarModal(
"Consulta Realizada",
"Consulta realizada del periodo " +
fechaInicio +
" al " +
fechaFin +
". Registros encontrados: " +
data.length +
"."
);

}

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
"Error",
"No fue posible consultar la puntualidad."
);

});

}

function mostrarTabla(datos){

let html = `

<table>
<thead>
<tr>
<th>Fecha</th>
<th>Empleado</th>
<th>Nombre</th>
<th>UER</th>
<th>Incidencia</th>
</tr>
</thead>
<tbody>

`;

datos.forEach(r=>{

html += `

<tr>
<td>${r.fecha}</td>
<td>${r.numero}</td>
<td>${r.nombre}</td>
<td>${r.uer}</td>
<td>${r.incidencia}</td>
</tr>

`;

});

html += `
</tbody>
</table>
`;

document
.getElementById("resultado")
.innerHTML = html;

}

function actualizarResumen(datos){

let menores = 0;
let mayores = 0;

datos.forEach(r=>{

if(r.incidencia === "RETARDO MENOR"){
menores++;
}

if(r.incidencia === "RETARDO MAYOR"){
mayores++;
}

});

document
.getElementById("totalMenores")
.innerText = menores;

document
.getElementById("totalMayores")
.innerText = mayores;

}

function exportarExcel(){

if(!datosRetardos || datosRetardos.length === 0){

mostrarModal(
"Sin información",
"No hay registros para exportar."
);

return;

}

let csv =
"Fecha,Empleado,Nombre,UER,Incidencia\n";

datosRetardos.forEach(r=>{

csv +=
`"${r.fecha}","${r.numero}","${r.nombre}","${r.uer}","${r.incidencia}"\n`;

});

const blob =
new Blob(
["\uFEFF" + csv],
{
type:"text/csv;charset=utf-8;"
}
);

const link =
document.createElement("a");

link.href =
URL.createObjectURL(blob);

link.download =
"Puntualidad_IEDEP.csv";

link.click();

mostrarModal(
"Exportación realizada",
"El archivo de puntualidad fue generado correctamente."
);

}

function mostrarSpinner(texto){

document
.getElementById("spinnerTexto")
.innerText = texto;

document
.getElementById("spinnerOverlay")
.classList
.remove("hidden");

}

function ocultarSpinner(){

document
.getElementById("spinnerOverlay")
.classList
.add("hidden");

}

function mostrarModal(titulo,mensaje){

document
.getElementById("modalTitulo")
.innerText = titulo;

document
.getElementById("modalMensaje")
.innerText = mensaje;

document
.getElementById("modalOverlay")
.classList
.remove("hidden");

}

function cerrarModal(){

document
.getElementById("modalOverlay")
.classList
.add("hidden");

}
