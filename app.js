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

                // Crear lista de artistas con fallback de imagen
                if (!artistas.some(a => a.nombre === row.Artista)) {
                    artistas.push({
                        nombre: row.Artista,
                        img: row.Img && row.Img.trim() !== ""
                             ? row.Img
                             : "https://i.imgur.com/2yAfK7E.png"
                    });
                }

                // Agrupar eventos
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

    // Generar tarjetas de artistas
    function generarTarjetas() {
        const contenedor = document.getElementById("listaArtistas");
        contenedor.innerHTML = "";

        artistas.forEach(artist => {

            // Filtrar eventos del artista solo España
            const eventosDelArtista = eventos
                .filter(ev => ev.artistas.includes(artist.nombre))
                .sort((a, b) => {
                    if (a.fecha === "TBA") return 1;
                    if (b.fecha === "TBA") return -1;
                    const da = a.fecha.split('/').reverse().join('-');
                    const db = b.fecha.split('/').reverse().join('-');
                    return new Date(da) - new Date(db);
                });


            const proximoEvento = eventosDelArtista.length > 0 ? eventosDelArtista[0] : null;
            const labelText = proximoEvento ? `Próximo evento: ${proximoEvento.fecha}` : "No hay eventos";

            const card = document.createElement("div");
            card.className = "artist-card";
            card.setAttribute("data-nombre", artist.nombre.toLowerCase().trim());

            card.innerHTML = `
                <img src="${artist.img}" alt="${artist.nombre}">
                <div class="artist-label">${labelText}</div>
                <div class="artist-name">${artist.nombre}</div>
            `;

            card.addEventListener('click', () => {
                body.style.backgroundImage = `url('${artist.img}')`;
                mostrarEventos(artist.nombre);
            });

            contenedor.appendChild(card);
        });
    }

    // Barra de búsqueda
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

    // Mostrar eventos del artista
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

    // Volver a artistas
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
