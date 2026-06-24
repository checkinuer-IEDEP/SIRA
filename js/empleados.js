const API_URL =
CONFIG.API_URL;

let empleadosGlobal = [];

// ===============================
// INICIALIZACIÓN
// ===============================

window.onload = () => {

  cargarUER();

  cargarEmpleados();

};

// ===============================
// CARGAR UER
// ===============================

function cargarUER(){

mostrarSpinner(
"Cargando catálogo de UER..."
);

fetch(API_URL,{

method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({
accion:"listarUER"
})

})

.then(r=>r.json())

.then(data=>{

const combo =
document.getElementById("uer");

combo.innerHTML =
`<option value="">Seleccione UER</option>`;

data.forEach(uer=>{

const option =
document.createElement("option");

option.value =
uer;

option.textContent =
uer;

combo.appendChild(option);

});

ocultarSpinner();

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
"Error",
"No fue posible cargar el catálogo de UER."
);

});

}

// ===============================
// CARGAR EMPLEADOS
// ===============================

function cargarEmpleados(){

mostrarSpinner(
"Cargando colaboradores..."
);

fetch(API_URL,{

method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({
accion:"listarEmpleadosRH"
})

})

.then(r=>r.json())

.then(data=>{

empleadosGlobal =
data;

pintarTabla(
empleadosGlobal
);

ocultarSpinner();

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
"Error",
"No fue posible cargar colaboradores."
);

});

}

// ===============================
// PINTAR TABLA
// ===============================

function pintarTabla(datos){

const tbody =
document.querySelector(
"#tablaEmpleados tbody"
);

tbody.innerHTML = "";

datos.forEach(emp=>{

const fila =
document.createElement("tr");

fila.onclick = () => {
  seleccionarEmpleado(emp);
};

fila.innerHTML = `

<td>${emp.numero || ""}</td>
<td>${emp.nombre || ""}</td>
<td>${emp.uer || ""}</td>
<td class="${emp.activo === "SI" ? "estado-activo" : "estado-inactivo"}">
  ${emp.activo || ""}
</td>
<td>${emp.horaEntrada || ""}</td>
<td>${emp.horaSalida || ""}</td>
<td>${emp.rol || ""}</td>

`;

tbody.appendChild(fila);

});

}

// ===============================
// SELECCIONAR EMPLEADO
// ===============================

function seleccionarEmpleado(emp){

document.getElementById("numero").value =
emp.numero || "";

document.getElementById("nombre").value =
emp.nombre || "";

seleccionarUER(
emp.uer
);

document.getElementById("activo").value =
emp.activo || "SI";

document.getElementById("horaEntrada").value =
normalizarHoraInput(
emp.horaEntrada
);

document.getElementById("horaSalida").value =
normalizarHoraInput(
emp.horaSalida
);

document.getElementById("rol").value =
emp.rol || "";

}

// ===============================
// GUARDAR NUEVO
// ===============================

function guardarEmpleado(){

const data =
obtenerDatosFormulario();

if(!validarFormulario(data)){
  return;
}

mostrarSpinner(
"Guardando colaborador..."
);

fetch(API_URL,{

method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({
accion:"guardarEmpleadoRH",
...data
})

})

.then(r=>r.json())

.then(resp=>{

ocultarSpinner();

mostrarModal(
resp.success ? "Registro exitoso" : "Aviso",
resp.message
);

if(resp.success){

limpiarFormulario();

cargarEmpleados();

}

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
"Error",
"No fue posible guardar el colaborador."
);

});

}

// ===============================
// ACTUALIZAR
// ===============================

function actualizarEmpleado(){

const data =
obtenerDatosFormulario();

if(!data.numero){

mostrarModal(
"Información requerida",
"Seleccione o capture un número de expediente."
);

return;

}

if(!validarFormulario(data)){
  return;
}

mostrarSpinner(
"Actualizando colaborador..."
);

fetch(API_URL,{

method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({
accion:"actualizarEmpleadoRH",
...data
})

})

.then(r=>r.json())

.then(resp=>{

ocultarSpinner();

mostrarModal(
resp.success ? "Actualización exitosa" : "Aviso",
resp.message
);

if(resp.success){

limpiarFormulario();

cargarEmpleados();

}

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
"Error",
"No fue posible actualizar el colaborador."
);

});

}

// ===============================
// DESACTIVAR
// ===============================

function desactivarEmpleado(){

const numero =
document.getElementById("numero").value.trim();

if(!numero){

mostrarModal(
"Información requerida",
"Seleccione un colaborador para dar de baja."
);

return;

}

if(
!confirm(
"¿Confirma dar de baja lógica al colaborador seleccionado?"
)
){
  return;
}

mostrarSpinner(
"Dando de baja colaborador..."
);

fetch(API_URL,{

method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({
accion:"desactivarEmpleadoRH",
numero:numero
})

})

.then(r=>r.json())

.then(resp=>{

ocultarSpinner();

mostrarModal(
resp.success ? "Baja realizada" : "Aviso",
resp.message
);

if(resp.success){

limpiarFormulario();

cargarEmpleados();

}

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
"Error",
"No fue posible dar de baja al colaborador."
);

});

}

// ===============================
// FILTRAR EMPLEADOS
// ===============================

function filtrarEmpleados(){

const texto =
document
.getElementById("buscador")
.value
.toString()
.trim()
.toUpperCase();

if(!texto){

pintarTabla(
empleadosGlobal
);

return;

}

const filtrados =
empleadosGlobal.filter(emp=>{

return (
  (emp.numero || "").toString().toUpperCase().includes(texto) ||
  (emp.nombre || "").toString().toUpperCase().includes(texto) ||
  (emp.uer || "").toString().toUpperCase().includes(texto) ||
  (emp.activo || "").toString().toUpperCase().includes(texto) ||
  (emp.rol || "").toString().toUpperCase().includes(texto)
);

});

pintarTabla(
filtrados
);

}

// ===============================
// OBTENER DATOS FORMULARIO
// ===============================

function obtenerDatosFormulario(){

return {

numero:
document
.getElementById("numero")
.value
.trim(),

nombre:
document
.getElementById("nombre")
.value
.trim(),

uer:
document
.getElementById("uer")
.value
.trim(),

activo:
document
.getElementById("activo")
.value,

horaEntrada:
document
.getElementById("horaEntrada")
.value,

horaSalida:
document
.getElementById("horaSalida")
.value,

rol:
document
.getElementById("rol")
.value

};

}

// ===============================
// VALIDAR FORMULARIO
// ===============================

function validarFormulario(data){

if(!data.numero){

mostrarModal(
"Información requerida",
"Capture el número de expediente."
);

return false;

}

if(!data.nombre){

mostrarModal(
"Información requerida",
"Capture el nombre completo del colaborador."
);

return false;

}

if(!data.uer){

mostrarModal(
"Información requerida",
"Seleccione la UER."
);

return false;

}

if(!data.horaEntrada){

mostrarModal(
"Información requerida",
"Capture la hora de entrada."
);

return false;

}

if(!data.horaSalida){

mostrarModal(
"Información requerida",
"Capture la hora de salida."
);

return false;

}

if(!data.rol){

mostrarModal(
"Información requerida",
"Seleccione el rol del colaborador."
);

return false;

}

return true;

}

// ===============================
// LIMPIAR FORMULARIO
// ===============================

function limpiarFormulario(){

document.getElementById("numero").value = "";
document.getElementById("nombre").value = "";
document.getElementById("uer").value = "";
document.getElementById("activo").value = "SI";
document.getElementById("horaEntrada").value = "";
document.getElementById("horaSalida").value = "";
document.getElementById("rol").value = "";

}

// ===============================
// NORMALIZAR HORA PARA INPUT TIME
// ===============================

function normalizarHoraInput(hora){

if(!hora){
  return "";
}

hora =
hora.toString().trim();

/* Si viene como 8:00 */
if(/^\d{1,2}:\d{2}$/.test(hora)){

const partes =
hora.split(":");

return partes[0].padStart(2,"0") +
":" +
partes[1];

}

/* Si viene como 09:23 a. m. o 03:23 p. m. */
hora =
hora
.replace("a. m.","AM")
.replace("p. m.","PM")
.replace("a.m.","AM")
.replace("p.m.","PM")
.replace(/\s/g,"")
.toUpperCase();

const match =
hora.match(/^(\d{1,2}):(\d{2})(AM|PM)$/);

if(match){

let hh =
parseInt(match[1]);

const mm =
match[2];

const periodo =
match[3];

if(periodo === "PM" && hh < 12){
  hh += 12;
}

if(periodo === "AM" && hh === 12){
  hh = 0;
}

return hh.toString().padStart(2,"0") +
":" +
mm;

}

return "";

}

// ===============================
// SPINNER
// ===============================

function mostrarSpinner(texto){

document
.getElementById("spinnerTexto")
.innerText =
texto;

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

// ===============================
// MODAL
// ===============================

function mostrarModal(titulo,mensaje){

document
.getElementById("modalTitulo")
.innerText =
titulo;

document
.getElementById("modalMensaje")
.innerText =
mensaje;

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

function seleccionarUER(valor){

const combo =
document.getElementById("uer");

const uerEmpleado =
valor
? valor.toString().trim().toUpperCase()
: "";

for(let i=0;i<combo.options.length;i++){

const opcion =
combo.options[i].value
.toString()
.trim()
.toUpperCase();

if(opcion === uerEmpleado){

combo.selectedIndex = i;

return;

}

}

combo.value = "";

}
