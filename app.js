const API_URL = "https://script.google.com/macros/s/AKfycbxISCFqiHFg-yFAuCebfc2MtkqseWFl6_M3_gDk5jRwIosRXvubCFaFPNCGG_gK1MxzPQ/exec";

let deviceId = localStorage.getItem("deviceId");
let selfieBase64 = null;
let currentLat = null;
let currentLng = null;



// =====================================
// DETECTOR MODO INCOGNITO (SEGURIDAD)
// =====================================

async function detectarIncognito() {

  return new Promise(resolve => {

    try {

      const fs = window.RequestFileSystem || window.webkitRequestFileSystem;

      if (!fs) {
        resolve(false);
      } else {
        fs(window.TEMPORARY, 100,
          () => resolve(false),
          () => resolve(true)
        );
      }

    } catch (e) {
      resolve(false);
    }

  });

}



// =====================================
// GENERAR FINGERPRINT DISPOSITIVO
// =====================================

function generarFingerprint() {

  const datos = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset()
  ].join("|");

  return btoa(datos).replace(/=/g,"");

}



// =====================================
// GENERAR TOKEN ROBUSTO
// =====================================

function generarToken() {

  const uuid = crypto.randomUUID();
  const fingerprint = generarFingerprint();

  return uuid + "_" + fingerprint;

}



// =====================================
// VALIDAR TOKEN LOCAL
// =====================================

function validarTokenLocal() {

  try {

    if (!deviceId) {

      deviceId = generarToken();
      localStorage.setItem("deviceId", deviceId);

    }

  } catch(e) {

    deviceId = generarToken();

  }

}



// =====================================
// DETECTOR GPS SOSPECHOSO
// =====================================

function gpsSospechoso(position){

  try {

    const accuracy = position.coords.accuracy;

    if (accuracy > 1000) return true;

    if (position.coords.speed && position.coords.speed > 300) return true;

    return false;

  } catch(e) {

    return false;

  }

}



// =====================================
// INICIALIZACION SEGURA DEL SISTEMA
// =====================================

async function inicializarSeguridad(){

  try {

    const incognito = await detectarIncognito();

    if (incognito){

      mostrarModal(
        "ERROR",
        "Modo de navegación restringido",
        "Por seguridad institucional..."
      );

      return;
    }

    validarTokenLocal();

  } catch(e) {

    console.error(e);

    validarTokenLocal();

  }

}

window.onload = inicializarSeguridad;



// =====================================
// VALIDAR UBICACION
// =====================================

function validarUbicacion() {

  const numero = document.getElementById("numero").value.trim();

  if (!numero) {

    mostrarModal(
      "ERROR",
      "Información requerida",
      "Debe ingresar su número de empleado para iniciar el proceso de validación."
    );

    return;
  }

  if (!navigator.geolocation) {

    mostrarModal(
      "ERROR",
      "GPS no disponible",
      "El dispositivo no permite obtener la ubicación necesaria para el registro."
    );

    return;

  }
mostrarLoading();
  navigator.geolocation.getCurrentPosition(

    function(position){

     if (gpsSospechoso(position)) {

    ocultarLoading();

    mostrarModal(
      "ERROR",
      "Ubicación no confiable",
      "El sistema detectó inconsistencias en la geolocalización del dispositivo."
    );

    return;
}

      currentLat = position.coords.latitude;
      currentLng = position.coords.longitude;

      enviarValidacion(numero);

    },

    function(){
       ocultarLoading();    
      mostrarModal(
        "ERROR",
        "Permiso de ubicación requerido",
        "Para registrar asistencia debe permitir acceso a la ubicación del dispositivo."
      );

    },

    {
      enableHighAccuracy:true,
      timeout:15000,
      maximumAge:0
    }

  );

}



// =====================================
// VALIDAR UBICACION CON SERVIDOR
// =====================================

function enviarValidacion(numero){

  fetch(API_URL, {
  method:"POST",
  headers:{
    "Content-Type":"text/plain"
  },
  body: JSON.stringify({
      accion:"validar",
      numero:numero,
      lat:currentLat,
      lng:currentLng
    })

  })

  .then(res => res.json())

.then(data => {

    ocultarLoading();

    if(data.success){

      document.getElementById("nombreEmpleado").innerText =
        data.nombre || "";

      document.getElementById("uerEmpleado").innerText =
        "UER: " + (data.uer || "");

      document.getElementById("step1").classList.add("hidden");

      document.getElementById("step2").classList.remove("hidden");

      activarCamara();

    } else {

      mostrarModal(
        "ERROR",
        "Validación no autorizada",
        data.message
      );

    }

})

.catch((error)=>{

    console.error(error);

    ocultarLoading();

    mostrarModal(
      "ERROR",
      "Error de comunicación",
      "No fue posible establecer comunicación con el servidor institucional."
    );

});

}



// =====================================
// ACTIVAR CAMARA
// =====================================

function activarCamara() {

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {

    mostrarModal(
      "ERROR",
      "Cámara no disponible",
      "El dispositivo no permite acceder a la cámara."
    );

    return;
  }

  navigator.mediaDevices.getUserMedia({
    video:{facingMode:"user"}
  })

  .then(stream => {

    const video = document.getElementById("video");

    video.srcObject = stream;

    iniciarContador(stream);

  })

  .catch(()=>{

    mostrarModal(
      "ERROR",
      "Acceso a cámara requerido",
      "Debe permitir acceso a la cámara para capturar la evidencia fotográfica."
    );

  });

}



// =====================================
// CONTADOR SELFIE
// =====================================

function iniciarContador(stream){

  let tiempo = 3;

  const contador = document.getElementById("contador");

  contador.innerText = "Capturando evidencia en " + tiempo;

  const interval = setInterval(()=>{

    tiempo--;

    contador.innerText = "Capturando evidencia de Asistencia en... " + tiempo;

    if(tiempo === 0){

      clearInterval(interval);

      tomarSelfie(stream);

    }

  },1000);

}



// =====================================
// TOMAR SELFIE
// =====================================

function tomarSelfie(stream){

  try{

    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video,0,0);

    selfieBase64 = canvas.toDataURL("image/jpeg",0.8);

    stream.getTracks().forEach(track => track.stop());

    registrar();

  }catch(e){

    mostrarModal(
      "ERROR",
      "Error en captura",
      "No fue posible capturar la evidencia fotográfica."
    );

  }

}



// =====================================
// REGISTRAR ASISTENCIA
// =====================================

function registrar(){
 
  validarTokenLocal();
console.log("DEVICE ID:", deviceId);

  
  fetch(API_URL, {
  method:"POST",
  headers:{
    "Content-Type":"text/plain"
  },
  body: JSON.stringify({

      accion:"registrar",
      numero:document.getElementById("numero").value.trim(),
      lat:currentLat,
      lng:currentLng,
      deviceId:deviceId,
      selfie:selfieBase64

    })

  })

  .then(res=>res.json())

  .then(data=>{

   if(data.success){

  document.getElementById("step2").classList.add("hidden");

  document.getElementById("step3").classList.remove("hidden");

  document.getElementById("tipoRegistroTexto").innerText =
      data.tipoRegistro;

}else{
ocultarLoading();
      mostrarModal("ERROR","Registro no autorizado",data.message);

      setTimeout(()=>{
        location.reload();
      },3000);

    }

  })

  .catch(()=>{
ocultarLoading();
    mostrarModal(
      "ERROR",
      "Error de comunicación",
      "No fue posible completar el registro en el sistema institucional."
    );

  });

}



// =====================================
// MODAL CORPORATIVO
// =====================================

function mostrarModal(tipo,titulo,mensaje){

  const modal = document.getElementById("modal");
  const icon = document.getElementById("modalIcon");
  const title = document.getElementById("modalTitle");
  const message = document.getElementById("modalMessage");

  modal.classList.remove("hidden");
  modal.classList.remove("modal-success","modal-error");

  if(tipo === "success"){

    modal.classList.add("modal-success");
    icon.innerHTML="✔";

  }else{

    modal.classList.add("modal-error");
    icon.innerHTML="✖";

  }

  title.innerText=titulo;
  message.innerText=mensaje;

}



function cerrarModal(){

  document.getElementById("modal").classList.add("hidden");

}


function mostrarLoading(){

  document
    .getElementById("loading")
    .classList
    .remove("hidden");

  document
    .getElementById("btnValidar")
    .disabled = true;

}

function ocultarLoading(){

  document
    .getElementById("loading")
    .classList
    .add("hidden");

  document
    .getElementById("btnValidar")
    .disabled = false;

}
