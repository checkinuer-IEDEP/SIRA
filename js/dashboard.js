const usuario =
localStorage.getItem("usuarioRH");

const rol =
localStorage.getItem("rolRH");

if(!usuario){

    window.location =
    "login.html";

}

document.addEventListener(
"DOMContentLoaded",
()=>{

document.getElementById(
"usuarioInfo"
).innerHTML =

`
Bienvenido: <b>${usuario}</b><br>
Rol: ${rol}
`;

});

function abrirModulo(url){

    window.location = url;

}

function cerrarSesion(){

    localStorage.removeItem(
    "usuarioRH"
    );

    localStorage.removeItem(
    "rolRH"
    );

    window.location =
    "login.html";

}
