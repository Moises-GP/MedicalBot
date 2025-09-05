document.addEventListener("DOMContentLoaded", () => {
    const calendario = document.getElementById("calendario");

    // Crear modal
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <h2 id="modalTitulo"></h2>
            <p id="modalFecha"></p>
            <p id="modalTipo"></p>
            <p id="modalUbicacion"></p>
            <p id="modalEspecialidad"></p>
            <p id="modalHora"></p>
            <p id="modalRequisitos"></p>
            <button class="close-modal" id="cerrarModal">Cerrar</button>
        </div>
    `;
    document.body.appendChild(modal);

    const modalTitulo = document.getElementById("modalTitulo");
    const modalFecha = document.getElementById("modalFecha");
    const modalTipo = document.getElementById("modalTipo");
    const modalUbicacion = document.getElementById("modalUbicacion");
    const modalEspecialidad = document.getElementById("modalEspecialidad");
    const modalHora = document.getElementById("modalHora");
    const modalRequisitos = document.getElementById("modalRequisitos");
    const cerrarModal = document.getElementById("cerrarModal");

    cerrarModal.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Crear tooltip
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    document.body.appendChild(tooltip);

    function mostrarTooltip(e, data, fechaStr) {
        tooltip.innerHTML = `
            <strong>${data.titulo}</strong><br>
            📅 ${fechaStr}<br>
            🏥 ${data.tipo} - ${data.especialidad}<br>
            ⏰ ${data.hora}<br>
            📍 ${data.ubicacion}<br>
            ✅ Requisitos: ${data.requisitos}
        `;
        tooltip.style.display = "block";
        tooltip.style.left = e.pageX + 15 + "px";
        tooltip.style.top = e.pageY + 15 + "px";
    }

    function ocultarTooltip() {
        tooltip.style.display = "none";
    }

    // 📌 Array con nombres de los meses
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Fecha actual
    const hoy = new Date();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    const diaActual = hoy.getDate();

    const hoyNormalizado = new Date(anio, mes, diaActual);

    // 📌 Insertar nombre del mes encima del calendario
    const tituloMes = document.createElement("h2");
    tituloMes.classList.add("titulo-mes");
    tituloMes.textContent = `${meses[mes]} ${anio}`;
    calendario.parentNode.insertBefore(tituloMes, calendario);

    // Días de la semana
    const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    diasSemana.forEach(dia => {
        const header = document.createElement("div");
        header.textContent = dia;
        header.classList.add("header-dia");
        calendario.appendChild(header);
    });

    // Primer día del mes
    let primerDia = new Date(anio, mes, 1).getDay();
    primerDia = (primerDia === 0) ? 6 : primerDia - 1;

    const diasEnMes = new Date(anio, mes + 1, 0).getDate();

    // 📌 Eventos con información ampliada
    const eventos = {
        "2025-09-05": { 
            tipo: "feria", 
            titulo: "Feria de Salud", 
            ubicacion: "Parque Central, Managua",
            especialidad: "Medicina General",
            hora: "08:00 AM - 2:00 PM",
            requisitos: "Llevar cédula y mascarilla"
        },
        "2025-09-10": { 
            tipo: "vacunacion", 
            titulo: "Jornada de Vacunación", 
            ubicacion: "Centro de Salud, León",
            especialidad: "Pediatría",
            hora: "09:00 AM - 1:00 PM",
            requisitos: "Carnet de vacunas"
        },
        "2025-09-15": { 
            tipo: "feria", 
            titulo: "Feria de Salud", 
            ubicacion: "Plaza de la Cultura, Masaya",
            especialidad: "Cardiología",
            hora: "07:00 AM - 12:00 PM",
            requisitos: "Ayuno de 8 horas"
        },
        "2025-09-20": { 
            tipo: "vacunacion", 
            titulo: "Vacunación Infantil", 
            ubicacion: "Hospital San Juan de Dios, Granada",
            especialidad: "Pediatría",
            hora: "08:30 AM - 3:00 PM",
            requisitos: "Llevar cédula del tutor"
        },
        "2025-09-25": { 
            tipo: "feria", 
            titulo: "Feria de Salud", 
            ubicacion: "Parque 16 de Julio, Estelí",
            especialidad: "Ginecología",
            hora: "09:00 AM - 4:00 PM",
            requisitos: "Llevar resultados previos si los tiene"
        }
    };

    // Crear días vacíos
    for (let i = 0; i < primerDia; i++) {
        const empty = document.createElement("div");
        calendario.appendChild(empty);
    }

    // Crear días
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaStr = `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        const divDia = document.createElement("div");
        divDia.classList.add("dia");

        const titulo = document.createElement("h3");
        titulo.textContent = dia;
        divDia.appendChild(titulo);

        // Día actual
        if (dia === diaActual) {
            divDia.classList.add("hoy");
        }

        // Si hay evento
        if (eventos[fechaStr]) {
            const evento = document.createElement("div");
            evento.classList.add("evento", eventos[fechaStr].tipo);
            evento.textContent = eventos[fechaStr].titulo;
            divDia.appendChild(evento);

            // Comparar fechas
            const fechaEvento = new Date(fechaStr);

            if (fechaEvento < hoyNormalizado) {
                divDia.classList.add("evento-pasado");
            } else if (fechaEvento > hoyNormalizado) {
                divDia.classList.add("evento-futuro");
            } else {
                divDia.classList.add("hoy");
            }

            // 📌 Tooltip
            divDia.addEventListener("mousemove", (e) => {
                mostrarTooltip(e, eventos[fechaStr], fechaStr);
            });
            divDia.addEventListener("mouseleave", ocultarTooltip);

            // 📌 Modal al hacer clic
            divDia.addEventListener("click", () => {
                modalTitulo.textContent = eventos[fechaStr].titulo;
                modalFecha.textContent = `📅 Fecha: ${fechaStr}`;
                modalTipo.textContent = `🏥 Tipo de jornada: ${eventos[fechaStr].tipo}`;
                modalUbicacion.textContent = `📍 Ubicación: ${eventos[fechaStr].ubicacion}`;
                modalEspecialidad.textContent = `🩺 Especialidad: ${eventos[fechaStr].especialidad}`;
                modalHora.textContent = `⏰ Hora: ${eventos[fechaStr].hora}`;
                modalRequisitos.textContent = `✅ Requisitos: ${eventos[fechaStr].requisitos}`;
                modal.style.display = "block";
            });
        }

        calendario.appendChild(divDia);
    }
});