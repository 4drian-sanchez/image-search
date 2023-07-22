const form = document.querySelector("#form");
//Valor del input del termino de busqueda
const termino = document.querySelector("#termino");

//Total de paginas del paginador
let totalPaginas;

//Pagina actual de la busqueda
let paginaActual = 1;

//validar si el campo del termino no este vacio
window.onload = () => {
  //Se ejecuta el evento al buscar un termino
  form.addEventListener("submit", formValidation);
  //detecta que tiene caracteres el input y elimina estilos
  termino.addEventListener("input", quitarBorder);

  obtenerSizes();
  peticionHttp();
};

function formValidation(e) {
  e.preventDefault();

  //Si el termino es un campo vacio muestra la alerta
  if (!termino.value) {
    termino.style.setProperty("--colorAlert", "red");
    mostrarAlerta();
    return;
  }
  //Dirige a imagenes.html
  const imagenes = "./imagenes.html";
  if (window.location.href !== imagenes) window.location.href = imagenes;
  //Guardamos el string de busqueda en localStorage
  localStorage.setItem("termino", termino.value);
  peticionHttp();
}

function peticionHttp() {
  //Accediendo al primer termino buscado en el index.html
  const termino = localStorage.getItem("termino");
  /* localStorage.removeItem("termino"); */
  const key = "30764639-a68575c99b2e56b36b57cde21";

  const url = `https://pixabay.com/api/?key=${key}&q=${termino}&page=${paginaActual}&image_type=photo&per_page=40`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      totalPaginas = calcularImagenes(data.totalHits);
      mostrarImagenes(data.hits);
    });
}

function mostrarImagenes(data) {
  //Contenedor principal de las imagenes
  const contenedor = document.querySelector(".imagenes");
  if (contenedor) cleanHTML(contenedor);

  data.forEach((img) => {
    const { largeImageURL, previewURL } = img;

    //Scripting de la imagen previa
    const div = document.createElement("DIV");
    div.classList.add("imagen", "col-md-4", "p-0");
    const imagen = document.createElement("IMG");
    imagen.src = previewURL;
    imagen.dataset.largeImageURL = largeImageURL;
    imagen.alt = "Imagen";
    imagen.className = "img-fluid rounded-3 img";

    div.appendChild(imagen);
    if (contenedor) contenedor.appendChild(div);
  });

  const imagenes = document.querySelectorAll(".imagen");
  if (imagenes) {
    imagenes.forEach((imagen) => {
      imagen.addEventListener("click", modal);
    });
  }

  //Mostrar paginacion
  paginacion();
}

//Coloca un border rojo en el input
function mostrarAlerta() {
  termino.classList.add("border", "border-2", "border-danger");
}

console.log(form);
//Si el input no esta vacio quita el border rojo
function quitarBorder(e) {
  e.target.classList.remove("border", "border-2", "border-danger");
  termino.style.setProperty("--colorAlert", "black");
}

//Funcion que se ejecuta en los eventos que tiene el body en el HTML
function obtenerSizes() {
  //Calcula el widtth
  const width = document.documentElement.clientWidth;
  /* Si el tamaño de la ventana grafica 
     es mayor a 576px cambia el placeholder sino
     vuelve a su estado normal  */

  if (width > 576) {
    termino.placeholder = "Introduce un termino de búsqueda";
    return;
  }
  termino.placeholder = "Introduce un termino";
}

//Limpia el html de una referencia
function cleanHTML(ref) {
  while (ref.firstChild) {
    ref.removeChild(ref.firstChild);
  }
}

//bootstrap
function modal(e) {
  const img_src = e.target.src;
  const largeImageURL = e.target.dataset.largeImageURL;
  const modalBody = document.querySelector(".modal-body");

  //Scripting de la imagen de el cuerpo del modal
  const img = document.createElement("IMG");
  img.src = img_src;
  img.className = "img-fluid w-100";

  //Scripting de el boton de descarga
  const download = document.createElement("A");
  download.href = largeImageURL;
  download.download = "imagen.jpg";
  download.classList.add("btn", "btn-primary");
  download.textContent = "Descargar imagen";

  const modalFooter = document.querySelector(".modal-footer");
  if (modalFooter) {
    cleanHTML(modalFooter);
  }
  modalFooter.appendChild(download);

  if (modalBody) {
    cleanHTML(modalBody);
  }

  modalBody.appendChild(img);
  const modal = new bootstrap.Modal(document.querySelector("#modal"));
  modal.show();
}

function calcularImagenes(totalHits) {
  return Math.ceil(totalHits / 40);
}

function* generarPaginas(total) {
  for (let i = 1; i < total; i++) {
    yield i;
  }
}

function paginacion() {
  let iterador = generarPaginas(totalPaginas);
  const paginacion = document.querySelector(".paginacion");

  cleanHTML(paginacion);
  while (true) {
    const { done, value } = iterador.next();
    if (done) return;

    const btn = document.createElement("A");
    btn.href = "#";
    btn.textContent = value;
    btn.classList.add("btn", "btn-success");
    btn.onclick = () => {
      paginaActual = value;
      peticionHttp();
    };

    paginacion.appendChild(btn);
  }
}
