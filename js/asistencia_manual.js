const API_URL =
CONFIG.API_URL;


let evidenciaBase64 = "";

window.onload = () => {

    cargarEmpleados();

    const evidencia =
    document.getElementById(
        "evidencia"
    );

    if(evidencia){

        evidencia.addEventListener(
            "change",
            previewImagen
        );

    }

};

function cargarEmpleados(){

fetch(API_URL,{

method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({

accion:"obtenerEmpleados"

})

})

.then(r=>r.json())

.then(data=>{
console.log(data);
const combo =
document.getElementById(
"empleado"
);

window.listaEmpleados = data;

data.forEach(emp=>{

const option =
document.createElement(
"option"
);

option.value =
emp.numero;

option.text =
emp.numero +
" - " +
emp.nombre;

combo.appendChild(
option
);

});

combo.addEventListener(
"change",
mostrarEmpleado
);

mostrarEmpleado();

});

}

function mostrarEmpleado(){

const numero =
document.getElementById(
"empleado"
).value;

const empleado =
window.listaEmpleados.find(
e => e.numero == numero
);

if(!empleado) return;

document.getElementById(
"nombreEmpleado"
).innerText =
empleado.nombre;

document.getElementById(
"uerEmpleado"
).innerText =
"UER: " + empleado.uer;

}


function previewImagen(e){

const file =
e.target.files[0];

if(!file){

mostrarModal(
"Archivo requerido",
"No se seleccionó ninguna imagen."
);

return;

}

const reader =
new FileReader();

reader.onload =
function(evt){

evidenciaBase64 =
evt.target.result;

const img =
document.getElementById(
"preview"
);

img.src =
evidenciaBase64;

img.classList.remove(
"hidden"
);

procesarFechaHoraEvidencia(file);

if(typeof EXIF === "undefined"){

mostrarModal(
"Error de lectura",
"No se pudo cargar la librería para leer metadatos de la imagen."
);

return;

}

extraerFechaHoraExif(file);

};

reader.readAsDataURL(file);

}

function guardarAsistencia(){

const empleado =
document.getElementById(
"empleado"
);

const texto =
empleado.options[
empleado.selectedIndex
].text;

const numero =
empleado.value;

const nombre =
texto.split(" - ")[1];

const uer =
document
.getElementById(
"uerEmpleado"
)
.innerText
.replace("UER: ","");
    
 mostrarSpinner();
    
fetch(API_URL,{
    
method:"POST",

headers:{
"Content-Type":"text/plain"
},

body:JSON.stringify({

accion:
"guardarAsistenciaManual",

numero:
numero,

nombre:
nombre,

uer:
uer,

fecha:
document.getElementById(
"fecha"
).value,

hora:
document.getElementById(
"hora"
).value,

tipo:
document.getElementById(
"tipo"
).value,

motivo:
document.getElementById(
"motivo"
).value,

evidencia:
evidenciaBase64,

usuarioRH:
localStorage.getItem(
"usuarioRH"
)

})

})

.then(r=>r.json())

.then(data=>{

ocultarSpinner();

if(data.success){

recargarPagina = true;

}

mostrarModal(
data.success
? "Registro exitoso"
: "Error",
data.message
);

})

.catch(error=>{

ocultarSpinner();

console.error(error);

mostrarModal(
"Error",
"No fue posible registrar la asistencia."
);

});

}

function mostrarModal(titulo,mensaje){

document
.getElementById(
"modalTitulo"
).innerText = titulo;

document
.getElementById(
"modalMensaje"
).innerHTML  = mensaje;

document
.getElementById(
"modalOverlay"
)
.classList.remove(
"hidden"
);

}

function cerrarModal(){

document
.getElementById(
"modalOverlay"
)
.classList
.add(
"hidden"
);

if(
typeof recargarPagina !== "undefined" &&
recargarPagina
){

location.reload();

}

}

function mostrarSpinner(){

document
.getElementById(
"spinnerOverlay"
)
.classList.remove(
"hidden"
);

}

function ocultarSpinner(){

document
.getElementById(
"spinnerOverlay"
)
.classList.add(
"hidden"
);

}

function extraerFechaHoraExif(file){

EXIF.getData(file,function(){

const todos =
EXIF.getAllTags(this);

console.log(
"METADATOS EXIF:",
todos
);

const fechaExif =
todos.DateTimeOriginal ||
todos.DateTimeDigitized ||
todos.DateTime ||
todos.CreateDate ||
todos.ModifyDate;

if(!fechaExif){

mostrarModal(
"Fecha no detectada",
"La evidencia contiene metadatos técnicos, pero no incluye fecha y hora de captura. Capture la fecha y hora manualmente."
);

return;

}

const partes =
fechaExif.split(" ");

if(partes.length < 2){

mostrarModal(
"Metadatos inválidos",
"La fecha detectada no tiene un formato reconocido. Capture la fecha y hora manualmente."
);

return;

}

const fechaPartes =
partes[0].split(":");

const horaPartes =
partes[1].split(":");

if(
fechaPartes.length < 3 ||
horaPartes.length < 2
){

mostrarModal(
"Metadatos inválidos",
"No fue posible interpretar la fecha y hora de la evidencia."
);

return;

}

const fechaISO =
fechaPartes[0] + "-" +
fechaPartes[1] + "-" +
fechaPartes[2];

const hora =
horaPartes[0] + ":" +
horaPartes[1];

document
.getElementById("fecha")
.value = fechaISO;

document
.getElementById("hora")
.value = hora;

if(parseInt(horaPartes[0]) < 12){

document
.getElementById("tipo")
.value = "ENTRADA";

}else{

document
.getElementById("tipo")
.value = "SALIDA";

}

mostrarModal(
"Datos detectados",
"Se detectó automáticamente la fecha " +
fechaISO +
" y hora " +
hora +
" desde la evidencia."
);

});

}

function procesarFechaHoraEvidencia(file){

if(typeof EXIF !== "undefined"){

EXIF.getData(file,function(){

const todos =
EXIF.getAllTags(this);

const fechaExif =
todos.DateTimeOriginal ||
todos.DateTimeDigitized ||
todos.DateTime ||
todos.CreateDate ||
todos.ModifyDate;

if(fechaExif){

aplicarFechaHoraDetectada(
fechaExif,
"EXIF"
);

return;

}

leerMarcaAguaOCR(file);

});

}else{

leerMarcaAguaOCR(file);

}

}

function aplicarFechaHoraDetectada(valor,origen){

let fechaISO = "";
let hora = "";

if(valor.includes("/")){

const partes =
valor.split(" ");

if(partes.length < 2){
return;
}

const fechaPartes =
partes[0].split("/");

const horaPartes =
partes[1].split(":");

fechaISO =
fechaPartes[2] +
"-" +
fechaPartes[1] +
"-" +
fechaPartes[0];

hora =
horaPartes[0] +
":" +
horaPartes[1];

}else{

const partes =
valor.split(" ");

if(partes.length < 2){
return;
}

const fechaPartes =
partes[0].split(":");

const horaPartes =
partes[1].split(":");

fechaISO =
fechaPartes[0] +
"-" +
fechaPartes[1] +
"-" +
fechaPartes[2];

hora =
horaPartes[0] +
":" +
horaPartes[1];

}

document.getElementById("fecha").value =
fechaISO;

document.getElementById("hora").value =
hora;

const horaNumero =
parseInt(
hora.split(":")[0]
);

document.getElementById("tipo").value =
horaNumero < 12
? "ENTRADA"
: "SALIDA";

mostrarModal(
"Fecha y hora detectadas",
"Origen: " +
origen +
"<br>Fecha: " +
fechaISO +
"<br>Hora: " +
hora +
"<br>Tipo sugerido: " +
document.getElementById("tipo").value
);

}

function leerMarcaAguaOCR(file){

if(typeof Tesseract === "undefined"){

mostrarModal(
"OCR no disponible",
"No fue posible cargar el lector de marca de agua. Capture fecha y hora manualmente."
);

return;

}

mostrarSpinner(
"Leyendo fecha y hora de la evidencia..."
);

const img =
new Image();

img.onload =
function(){

const canvas =
document.createElement("canvas");

const ctx =
canvas.getContext("2d");

const ancho =
img.width;

const alto =
img.height;

/*
  Recorte específico:
  parte inferior derecha donde normalmente aparece la fecha.
*/

const recorteX =
Math.floor(ancho * 0.45);

const recorteY =
Math.floor(alto * 0.82);

const recorteAncho =
Math.floor(ancho * 0.55);

const recorteAlto =
Math.floor(alto * 0.18);

/*
  Escalamos 3x para mejorar OCR
*/

canvas.width =
recorteAncho * 3;

canvas.height =
recorteAlto * 3;

ctx.drawImage(
img,
recorteX,
recorteY,
recorteAncho,
recorteAlto,
0,
0,
canvas.width,
canvas.height
);

/*
  Mejorar contraste
*/

const imageData =
ctx.getImageData(
0,
0,
canvas.width,
canvas.height
);

const data =
imageData.data;

for(let i=0;i<data.length;i+=4){

const promedio =
(data[i] + data[i+1] + data[i+2]) / 3;

const valor =
promedio > 150
? 255
: 0;

data[i] = valor;
data[i+1] = valor;
data[i+2] = valor;

}

ctx.putImageData(
imageData,
0,
0
);

const imagenRecortada =
canvas.toDataURL(
"image/png"
);

console.log(
"RECORTE OCR:",
imagenRecortada
);

Tesseract.recognize(
imagenRecortada,
"eng",
{
  tessedit_char_whitelist:
  "0123456789/: -"
}
)

.then(({ data:{ text } })=>{

ocultarSpinner();

console.log(
"TEXTO OCR FECHA:",
text
);

const patron =
/(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+(\d{2}:\d{2})/;

const encontrado =
text.match(
patron
);

if(!encontrado){

mostrarModal(
"Fecha no detectada",
"No fue posible detectar fecha y hora en la marca de agua. Capture fecha y hora manualmente."
);

return;

}

const valor =
encontrado[1] +
" " +
encontrado[2];

aplicarFechaHoraDetectada(
valor,
"OCR"
);

})

.catch(error=>{

ocultarSpinner();

console.error(
"ERROR OCR:",
error
);

mostrarModal(
"Error OCR",
"No fue posible leer la marca de agua. Capture fecha y hora manualmente."
);

});

};

img.src =
URL.createObjectURL(file);

}
