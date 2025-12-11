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
            let precio = parseFloat(btn.dataset.precio);

            let producto = carrito.find(p => p.nombre === nombre);

            if (producto) {
                producto.cantidad++;
            } else {
                carrito.push({
                    nombre,
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

document.getElementById("btnComprar").addEventListener("click", () => {

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let mensaje = "Hola, quiero realizar una compra:%0A%0A";

    carrito.forEach(producto => {
        mensaje += `• ${producto.nombre} (x${producto.cantidad}) - S/ ${(producto.precio * producto.cantidad).toFixed(2)}%0A`;
    });

    mensaje += `%0ATotal: S/ ${carritoTotal.textContent}%0A`;
    mensaje += "%0A¿Está disponible?";

    // Tu número de WhatsApp con código de país (ejemplo Perú: 51)
    let numero = "51941115384";

    let url = `https://wa.me/${numero}?text=${mensaje}`;

    window.open(url, "_blank");
});
