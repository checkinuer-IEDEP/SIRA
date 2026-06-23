const API_URL =
CONFIG.API_URL;

let datosConsulta = [];

function consultar(){

const numero =
document.getElementById("numero").value.trim();

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
"Consultando Asistencias del Periodo " +
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

accion:"consultarReporteRH",

numero:numero,

fechaInicio:fechaInicio,

fechaFin:fechaFin

})

})

.then(r=>r.json())

.then(data=>{

ocultarSpinner();

datosConsulta =
data;

mostrarTabla(data);

if(data.length === 0){

mostrarModal(
"Sin asistencias",
"Periodo del " +
fechaInicio +
" al " +
fechaFin +
" sin asistencias registradas."
);

}else{

let textoEmpleado =
numero
? " para el expediente " + numero
: "";

mostrarModal(
"Consulta Realizada",
"Consulta realizada del periodo " +
fechaInicio +
" al " +
fechaFin +
textoEmpleado +
". Registros encontrados: " +
data.length +
"."
);

}

})

.catch(error=>{

ocultarSpinner();

console.error("ERROR CONSULTA ASISTENCIAS:", error);

mostrarModal(
"Error",
"No fue posible consultar las asistencias."
);

});

}

function mostrarTabla(datos){

const tbody =
document.querySelector(
"#tablaResultados tbody"
);

tbody.innerHTML = "";

datos.forEach(reg=>{

const puntualidad =
obtenerClasePuntualidadRH(
reg.puntualidad
);

const incidencia =
obtenerClaseIncidenciaRH(
reg.incidencia
);

const fila =
document.createElement("tr");

fila.innerHTML = `

<td>${reg.fecha}</td>
<td>${reg.entrada || ""}</td>
<td>${reg.salida || ""}</td>
<td>${reg.numero}</td>
<td>${reg.nombre}</td>
<td>${reg.uer}</td>
<td>${reg.origenEntrada || ""}</td>
<td>${reg.origenSalida || ""}</td>

<td>
  <span class="badge-puntualidad ${puntualidad.clase}">
    <span class="punto"></span>
    ${puntualidad.texto}
  </span>
</td>

<td>
  <span class="badge-incidencia ${incidencia.clase}">
    ${incidencia.texto}
  </span>
</td>

<td>${reg.detalle || ""}</td>

`;

tbody.appendChild(fila);

});

}

function exportarExcel(){

if(!datosConsulta || datosConsulta.length === 0){

mostrarModal(
"Sin información",
"No hay registros para exportar."
);

return;

}

let csv =
"Fecha,Empleado,Nombre,UER,Tipo,Origen,Evidencia,Puntualidad\n";

datosConsulta.forEach(r=>{

const puntualidad =
obtenerPuntualidadConsulta(
r.fecha,
r.tipo
);

csv +=
`"${r.fecha}","${r.numero}","${r.nombre}","${r.uer}","${r.tipo}","${r.origen}","${r.evidencia}","${puntualidad.texto}"\n`;

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
"Asistencias_IEDEP.csv";

link.click();

mostrarModal(
"Exportación realizada",
"El archivo de asistencias fue generado correctamente."
);

}

function mostrarSpinner(texto){

document
.getElementById(
"spinnerTexto"
).innerText = texto;

document
.getElementById(
"spinnerOverlay"
)
.classList
.remove("hidden");

}

function ocultarSpinner(){

document
.getElementById(
"spinnerOverlay"
)
.classList
.add("hidden");

}

function mostrarModal(titulo,mensaje){

document
.getElementById(
"modalTitulo"
).innerText = titulo;

document
.getElementById(
"modalMensaje"
).innerText = mensaje;

document
.getElementById(
"modalOverlay"
)
.classList
.remove("hidden");

}

function cerrarModal(){

document
.getElementById(
"modalOverlay"
)
.classList
.add("hidden");

}


function obtenerPuntualidadConsulta(fecha,tipo){

if(
tipo &&
tipo.toString().trim().toUpperCase() === "SALIDA"
){

return {
texto:"No aplica",
clase:"gris"
};

}

const partes =
fecha.split(" ");

if(partes.length < 2){

return {
texto:"No aplica",
clase:"gris"
};

}

const hora =
partes[1];

if(hora <= "09:14"){

return {
texto:"OK",
clase:"verde"
};

}

if(
hora >= "09:15" &&
hora <= "09:29"
){

return {
texto:"Retardo Menor",
clase:"amarillo"
};

}

if(hora >= "09:30"){

return {
texto:"Retardo Mayor",
clase:"rojo"
};

}

return {
texto:"No aplica",
clase:"gris"
};

}


function obtenerPuntualidadConsulta(fecha,tipo){

if(
tipo &&
tipo.toString().trim().toUpperCase() === "SALIDA"
){

return {
texto:"No aplica",
clase:"gris"
};

}

const partes =
fecha.split(" ");

if(partes.length < 2){

return {
texto:"No aplica",
clase:"gris"
};

}

const hora =
partes[1];

if(hora <= "09:14"){

return {
texto:"OK",
clase:"verde"
};

}

if(
hora >= "09:15" &&
hora <= "09:29"
){

return {
texto:"Retardo Menor",
clase:"amarillo"
};

}

if(hora >= "09:30"){

return {
texto:"Retardo Mayor",
clase:"rojo"
};

}

return {
texto:"No aplica",
clase:"gris"
};

}

function obtenerClasePuntualidadRH(valor){

valor =
valor
? valor.toString().trim()
: "";

if(valor === ""){

return {
texto:"",
clase:"gris"
};

}

if(valor === "OK"){

return {
texto:"OK",
clase:"verde"
};

}

if(valor === "RETARDO MENOR"){

return {
texto:"RETARDO MENOR",
clase:"amarillo"
};

}

if(valor === "RETARDO MAYOR"){

return {
texto:"Retardo Mayor",
clase:"rojo"
};

}

if(valor === "SIN HORARIO"){

return {
texto:"SIN HORARIO",
clase:"gris"
};

}

return {
texto:valor,
clase:"gris"
};

}

function obtenerClaseIncidenciaRH(valor){

if(!valor){
return {
texto:"",
clase:"gris"
};
}

if(valor === "FALTA COMPLETA"){
return {
texto:"FALTA COMPLETA",
clase:"rojo"
};
}

if(valor === "FALTA SALIDA" || valor === "FALTA ENTRADA"){
return {
texto:valor,
clase:"amarillo"
};
}

return {
texto:valor,
clase:"gris"
};

}
