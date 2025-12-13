/* --------------------------
   SISTEMA DE CARRITO
--------------------------- */

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const cartCount = document.getElementById("cart-count");
const carritoLista = document.getElementById("carrito-lista");
const carritoTotal = document.getElementById("carrito-total");

// Esperar a que cargue todo el HTML antes de ejecutar
document.addEventListener("DOMContentLoaded", () => {

    actualizarCarritoUI();

    // Evento de agregar producto al carrito
    document.querySelectorAll(".add-cart").forEach(btn => {
        btn.addEventListener("click", () => {

            let nombre = btn.dataset.nombre;
            let codigo = btn.dataset.codigo || "";   // NUEVO
            let precio = parseFloat(btn.dataset.precio);


            let producto = carrito.find(p => p.nombre === nombre);

            if (producto) {
                producto.cantidad++;
            } else {
                carrito.push({
                    nombre,
                    codigo,     // NUEVO
                    precio,
                    cantidad: 1
                });
            }

            guardarCarrito();
            actualizarCarritoUI();
        });
    });


    /* --------------------------
        TU CÓDIGO ORIGINAL
    --------------------------- */
    document.querySelectorAll(".add-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            let original = btn.textContent;
            btn.textContent = "Agregado ✓";
            btn.classList.add("btn-success");

            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove("btn-success");
            }, 1500);
        });
    });

}); // FIN DOMContentLoaded



/* --------------------------
   FUNCIONES DEL CARRITO
--------------------------- */

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarCarritoUI() {
    carritoLista.innerHTML = "";
    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach((producto, index) => {
        let li = document.createElement("li");
        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

        li.innerHTML = `
            <span>${producto.nombre} (x${producto.cantidad})</span>
            <div>
                <span class="me-3">S/ ${(producto.precio * producto.cantidad).toFixed(2)}</span>
                <button class="btn btn-sm btn-danger eliminar-item" data-index="${index}">X</button>
            </div>
        `;

        carritoLista.appendChild(li);

        total += producto.precio * producto.cantidad;
        cantidadTotal += producto.cantidad;
    });

    carritoTotal.textContent = total.toFixed(2);
    cartCount.textContent = cantidadTotal;

    agregarEventosEliminar();
}



/* --------------------------
   ELIMINAR ITEM DEL CARRITO
--------------------------- */

function agregarEventosEliminar() {
    document.querySelectorAll(".eliminar-item").forEach(btn => {
        btn.addEventListener("click", () => {
            let index = btn.dataset.index;

            // eliminar 1 producto en esa posición
            carrito.splice(index, 1);

            guardarCarrito();
            actualizarCarritoUI();
        });
    });
}

/* --------------------------
   ENVIAR CARRITO A WHATSAPP
--------------------------- */

const btnComprar = document.getElementById("btnComprar");

if (btnComprar) {
  btnComprar.addEventListener("click", () => {

    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    let mensaje = "Hola, quiero realizar una compra:%0A%0A";

    carrito.forEach(producto => {
      const cod = producto.codigo ? ` [Código: ${producto.codigo}]` : " [Código: SIN CÓDIGO]";
      mensaje += `• ${producto.nombre}${cod} (x${producto.cantidad}) - S/ ${(producto.precio * producto.cantidad).toFixed(2)}%0A`;
    });


    mensaje += `%0ATotal: S/ ${carritoTotal.textContent}%0A`;
    mensaje += "%0A¿Está disponible?";

    // Tu número de WhatsApp con código de país (ejemplo Perú: 51)
    let numero = "51941115384";

    let url = `https://wa.me/${numero}?text=${mensaje}`;

    window.open(url, "_blank");
  });
}


/* --------------------------
   BUSCADOR + FILTRO CATÁLOGO
   (por Nombre/Marca o por Código)
--------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const btnClear = document.getElementById("btnClear");
  const productosRow = document.getElementById("productosRow");
  const resultCount = document.getElementById("resultCount");
  const noResults = document.getElementById("noResults");

  // Si no estamos en catalogo.html (o no existe el buscador), no hacemos nada
  if (!searchInput || !filterSelect || !productosRow) return;

  // Hacer que la "lupa" sea clickeable (focus al input)
  const lupa = document.querySelector(".input-group .input-group-text");
  if (lupa) {
    lupa.style.cursor = "pointer";
    lupa.addEventListener("click", () => {
      searchInput.focus();
      aplicarFiltro();
    });
  }

  // Normaliza texto: minúsculas + sin tildes
  const normalizar = (txt) =>
    (txt || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Extrae (marca/nombre) y (codigo) desde el título
  const separarNombreCodigo = (titulo) => {
    const t = (titulo || "").trim();
    const parts = t.split(" ");
    const nombre = parts[0] || "";              
    const codigo = parts.slice(1).join(" ");    
    return { nombre, codigo, titulo: t };
  };


  const aplicarFiltro = () => {
    const q = normalizar(searchInput.value);
    const modo = filterSelect.value; // "nombre" | "codigo"

    const items = productosRow.querySelectorAll(".col-md-4");
    let visibles = 0;

    items.forEach((col) => {
      const titleEl = col.querySelector(".card-title");
      const titulo = titleEl ? titleEl.textContent : "";

      const { nombre, codigo: codigoTitulo, titulo: full } = separarNombreCodigo(titulo);

      // leer data-codigo (si existe en el botón)
      const btn = col.querySelector(".add-cart");
      const codigoData = btn?.dataset?.codigo ? btn.dataset.codigo : "";

      // prioridad: data-codigo, si no existe usa lo del título
      const codigoFinal = codigoData || codigoTitulo;

      const textoComparar =
        modo === "codigo"
            ? normalizar(codigoFinal)
            : normalizar(nombre + " " + full);



      const match = q === "" || textoComparar.includes(q);

      col.classList.toggle("d-none", !match);
      if (match) visibles++;
    });

    // Texto “X resultados”
    if (resultCount) {
      resultCount.textContent = `${visibles} resultado(s)`;
    }

    // Mensaje “no hay resultados”
    if (noResults) {
      noResults.classList.toggle("d-none", visibles !== 0);
    }
  };

  // Eventos
  searchInput.addEventListener("input", aplicarFiltro);
  filterSelect.addEventListener("change", aplicarFiltro);

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.focus();
      aplicarFiltro();
    });
  }

  // Estado inicial
  aplicarFiltro();
});
