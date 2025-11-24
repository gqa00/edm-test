document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const fondoOriginal = "url('https://i.imgur.com/cBzCeyg.jpeg')";

    let eventos = [];
    let artistas = [];

    // Cargar CSV
    Papa.parse("eventos.csv", {
        download: true,
        header: true,
        complete: function(results) {
            const datos = results.data;

            datos.forEach(row => {
                if (!artistas.some(a => a.nombre === row.Artista)) {
                    artistas.push({ nombre: row.Artista, img: row.Img });
                }

                let eventoExistente = eventos.find(e => 
                    e.evento === row.Evento &&
                    e.ciudad === row.Ciudad &&
                    e.fecha === row.Fecha
                );

                if (eventoExistente) {
                    if (!eventoExistente.artistas.includes(row.Artista)) {
                        eventoExistente.artistas.push(row.Artista);
                    }
                } else {
                    eventos.push({
                        evento: row.Evento,
                        ciudad: row.Ciudad,
                        fecha: row.Fecha,
                        artistas: [row.Artista],
                        link: row.Link
                    });
                }
            });

            generarTarjetas();
        }
    });

    function generarTarjetas() {
        const contenedor = document.getElementById("listaArtistas");
        artistas.forEach(artist => {
            const card = document.createElement("div");
            card.className = "artist-card";
            card.setAttribute("data-nombre", artist.nombre.toLowerCase());

            card.innerHTML = `
                <img src="${artist.img}" alt="${artist.nombre}">
                <div class="artist-name">${artist.nombre}</div>
            `;

            card.addEventListener('click', () => {
                body.style.backgroundImage = `url('${artist.img}')`;
                mostrarEventos(artist.nombre);
            });

            contenedor.appendChild(card);
        });
    }

    const input = document.getElementById("buscarArtista");
    input.addEventListener("input", function () {
        const filtro = this.value.toLowerCase().trim();
        const cards = document.querySelectorAll(".artist-card");
        const visibles = [];

        cards.forEach(card => {
            const nombre = card.getAttribute("data-nombre") || "";
            const artistaNombreOriginal = card.querySelector(".artist-name").textContent;

            const ciudades = eventos
                .filter(ev => ev.artistas.includes(artistaNombreOriginal))
                .map(ev => ev.ciudad.toLowerCase());

            const coincideArtista = nombre.includes(filtro);
            const coincideCiudad = ciudades.some(ciudad => ciudad.includes(filtro));

            if (filtro === "" || coincideArtista || coincideCiudad) {
                card.style.display = "";
                visibles.push(card);
            } else {
                card.style.display = "none";
            }
        });

        if (visibles.length === 1) {
            const img = visibles[0].querySelector('img');
            const src = img ? img.src : null;
            body.style.backgroundImage = src ? `url('${src}')` : fondoOriginal;
        } else {
            body.style.backgroundImage = fondoOriginal;
        }
    });

    window.mostrarEventos = function(nombre) {
        document.getElementById("vistaArtistas").style.display = "none";
        document.getElementById("vistaEventos").style.display = "block";
        document.getElementById("tituloArtista").textContent = `Eventos disponibles para ${nombre}`;

        const cuerpo = document.getElementById("tablaEventos");
        cuerpo.innerHTML = "";

        const filtrados = eventos.filter(ev => ev.artistas.includes(nombre));

        if (filtrados.length === 0) {
            cuerpo.innerHTML = `<tr><td colspan="3">No hay eventos disponibles</td></tr>`;
            return;
        }

        filtrados.forEach(ev => {
            cuerpo.innerHTML += `
                <tr>
                    <td><a href="${ev.link}" target="_blank">${ev.evento}</a></td>
                    <td>${ev.ciudad}</td>
                    <td>${ev.fecha}</td>
                </tr>
            `;
        });
    };

    window.volverArtistas = function() {
        body.style.backgroundImage = fondoOriginal;
        document.getElementById("vistaEventos").style.display = "none";
        document.getElementById("vistaArtistas").style.display = "block";
    };

    // Bloquear click derecho
    document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    });

});
