const API_URL =
CONFIG.API_URL;

function consultarIncidencias(){

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

mostrarSpinner();

fetch(API_URL,{

method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({
  accion:"consultarIncidencias",
  fechaInicio:fechaInicio,
  fechaFin:fechaFin
})

})

.then(r=>r.json())

.then(data=>{

ocultarSpinner();

mostrarTabla(data);

if(data.length > 0){

  mostrarModal(
    "Incidencias generadas",
    "Se encontraron " + data.length + " incidencias en el periodo seleccionado."
  );

}else{

  mostrarModal(
    "Sin incidencias",
    "Periodo del " + fechaInicio + " al " + fechaFin + " sin incidencias."
  );

}

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
  "Error",
  "No fue posible consultar las incidencias."
);

});

}

function mostrarTabla(datos){

let html = `

<table>

<tr>

<th>Fecha</th>
<th>Empleado</th>
<th>Nombre</th>
<th>UER</th>
<th>Incidencia</th>
<th>Detalle</th>

</tr>

`;

datos.forEach(row=>{

html += `

<tr>

<td>${row.fecha}</td>
<td>${row.empleado}</td>
<td>${row.nombre}</td>
<td>${row.uer}</td>
<td>${row.incidencia}</td>
<td>${row.detalle}</td>

</tr>

`;

});

html += "</table>";

document
.getElementById(
"resultado"
)
.innerHTML = html;

}


function mostrarSpinner(){
  document.getElementById("spinnerOverlay").classList.remove("hidden");
}

function ocultarSpinner(){
  document.getElementById("spinnerOverlay").classList.add("hidden");
}

function mostrarModal(titulo,mensaje){
  document.getElementById("modalTitulo").innerText = titulo;
  document.getElementById("modalMensaje").innerText = mensaje;
  document.getElementById("modalOverlay").classList.remove("hidden");
}

function cerrarModal(){
  document.getElementById("modalOverlay").classList.add("hidden");
}
