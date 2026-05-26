// 1. Definición de clases

// Clase que representa cualquier evento de la agenda, tanto festivos como eventos del usuario
class Evento {
    constructor(id, titulo, fecha, hora, tipo) {
        this.id = id;           // identificador único
        this.titulo = titulo;   // nombre del evento
        this.fecha = fecha;     // formato YYYY-MM-DD
        this.hora = hora;       // formato HH:MM, vacío en festivos
        this.tipo = tipo;       // 'festivo' o 'usuario'
    }

    // Devuelve true si el evento es un festivo nacional
    esFestivo() {
        return this.tipo === 'festivo';
    }

    // Convierte la fecha de YYYY-MM-DD a DD/MM/YYYY para mostrarla al usuario
    getFechaFormateada() {
        const [anio, mes, dia] = this.fecha.split('-');
        return `${dia}/${mes}/${anio}`;
    }

    // Devuelve la fecha y la hora juntas, o solo la fecha si no hay hora (festivos)
    getTextoFechaHora() {
        if (this.hora) {
            return `${this.getFechaFormateada()} — ${this.hora}`;
        }
        return this.getFechaFormateada();
    }
}


// 2. Referencias al DOM

// Contenedor donde se renderizan todas las tarjetas de eventos
const listaEventos = document.getElementById('event-list');

// Modal para crear un nuevo evento
const modalOverlay = document.getElementById('modal-overlay');
const btnAbrirModal = document.getElementById('btn-open-modal');
const btnCerrarModal = document.getElementById('btn-close-modal');
const btnCancelar = document.getElementById('btn-cancel');

// Formulario y sus campos
const formulario = document.getElementById('event-form');
const inputTitulo = document.getElementById('title');
const inputFecha = document.getElementById('date');
const inputHora = document.getElementById('time');

// Spans donde se muestran los errores de validación bajo cada campo
const errorTitulo = document.getElementById('error-title');
const errorFecha = document.getElementById('error-date');
const errorHora = document.getElementById('error-time');

// Badge del encabezado que informa del estado de la conexión con la API
const estadoApi = document.getElementById('api-status');

// Elementos del widget del tiempo en la barra lateral
const iconoClima = document.getElementById('weather-icon');
const tempClima = document.getElementById('weather-temp');
const descClima = document.getElementById('weather-desc');


// 3. Llamada a la API

// Obtiene los festivos nacionales de España 2025 desde la API pública Nager.Date
async function cargarFestivos() {
    try {
        const respuesta = await fetch('https://date.nager.at/api/v3/PublicHolidays/2025/ES');
        if (!respuesta.ok) throw new Error('Error en la respuesta de la API');
        const datos = await respuesta.json();

        // Actualizar el badge del header para confirmar que la API respondió bien
        estadoApi.textContent = '✓ Festivos cargados';
        estadoApi.style.color = '#0f9d58';

        // Convertir cada objeto de la API en una instancia de Evento
        return datos.map(f => new Evento(
            'festivo-' + f.date,  // ID único basado en la fecha
            f.localName,           // nombre en español que devuelve la API
            f.date,
            '',                    // los festivos no tienen hora
            'festivo'
        ));
    } catch (error) {
        // Si la API falla, se avisa al usuario y se devuelve array vacío para no romper la app
        estadoApi.textContent = 'Error al cargar festivos';
        estadoApi.style.color = '#d93025';
        return [];
    }
}

// Obtiene la previsión meteorológica de hoy para Zaragoza desde Open-Meteo (sin API key)
async function cargarClima() {
    try {
        const url = 'https://api.open-meteo.com/v1/forecast?latitude=41.6488&longitude=-0.8891&daily=weathercode,temperature_2m_max&timezone=Europe/Madrid';
        const respuesta = await fetch(url);
        if (!respuesta.ok) throw new Error('Error en la API del clima');
        const datos = await respuesta.json();

        // El índice [0] de cada array corresponde siempre al día de hoy
        const codigo = datos.daily.weathercode[0];
        const temperatura = datos.daily.temperature_2m_max[0];

        // Traducir el código numérico WMO a texto e icono legible
        const { icono, descripcion } = traducirCodigo(codigo);

        iconoClima.textContent = icono;
        tempClima.textContent = temperatura + '°C';
        descClima.textContent = descripcion;
    } catch (error) {
        // Si el clima falla la app sigue funcionando, solo se muestra un mensaje
        descClima.textContent = 'No se pudo cargar el clima';
    }
}

// Convierte el código meteorológico WMO que devuelve Open-Meteo en texto e icono
function traducirCodigo(codigo) {
    if (codigo === 0) return { icono: '☀️', descripcion: 'Cielo despejado' };
    if (codigo === 1) return { icono: '🌤️', descripcion: 'Principalmente claro' };
    if (codigo === 2) return { icono: '⛅', descripcion: 'Parcialmente nublado' };
    if (codigo === 3) return { icono: '☁️', descripcion: 'Nublado' };
    if (codigo === 45 || codigo === 48) return { icono: '🌫️', descripcion: 'Niebla' };
    if (codigo >= 51 && codigo <= 55) return { icono: '🌦️', descripcion: 'Llovizna' };
    if (codigo >= 61 && codigo <= 65) return { icono: '🌧️', descripcion: 'Lluvia' };
    if (codigo >= 71 && codigo <= 75) return { icono: '🌨️', descripcion: 'Nieve' };
    if (codigo >= 80 && codigo <= 82) return { icono: '🌦️', descripcion: 'Chubascos' };
    if (codigo === 95) return { icono: '⛈️', descripcion: 'Tormenta' };
    return { icono: '🌡️', descripcion: 'Condición desconocida' };
}


// 4. LocalStorage

// Guarda en localStorage solo los eventos creados por el usuario, nunca los festivos
function guardarEventos(eventos) {
    const soloUsuario = eventos.filter(e => e.tipo === 'usuario');
    localStorage.setItem('eventos', JSON.stringify(soloUsuario));
}

// Recupera los eventos guardados y los convierte de nuevo en instancias de la clase Evento
function recuperarEventos() {
    const datos = localStorage.getItem('eventos');
    // Si no hay nada guardado todavía, devolver array vacío
    if (!datos) return [];
    const guardados = JSON.parse(datos);
    return guardados.map(e => new Evento(e.id, e.titulo, e.fecha, e.hora, e.tipo));
}


// 5. Renderizado

// Array global con todos los eventos (festivos + usuario) que están activos en la app
let todosLosEventos = [];

// Vuelca el contenido de todosLosEventos en el DOM, limpiando lo que había antes
function renderizarEventos() {
    // Ordenar: primero eventos del usuario, luego festivos; dentro de cada grupo, por fecha y hora
    const ordenados = [...todosLosEventos].sort((a, b) => {
        // eventos del usuario siempre antes que los festivos
        if (a.tipo !== b.tipo) return a.tipo === 'usuario' ? -1 : 1;
        if (a.fecha !== b.fecha) return a.fecha.localeCompare(b.fecha);
        return (a.hora || '').localeCompare(b.hora || '');
    });

    // Limpiar la lista antes de volver a pintarla
    listaEventos.innerHTML = '';

    if (ordenados.length === 0) {
        listaEventos.innerHTML = '<p class="empty-msg">No hay eventos programados.</p>';
        return;
    }

    ordenados.forEach(evento => {
        const tarjeta = document.createElement('div');
        // La clase CSS cambia según el tipo para aplicar el color del borde izquierdo
        tarjeta.className = 'event-card ' + (evento.esFestivo() ? 'holiday' : 'user-event');

        // Badge visual que distingue festivos de eventos propios
        const badge = evento.esFestivo()
            ? '<span class="badge badge-holiday">Festivo</span>'
            : '<span class="badge badge-user">Mi evento</span>';

        // El botón de eliminar solo aparece en eventos del usuario, nunca en festivos
        const btnEliminar = evento.esFestivo()
            ? ''
            : `<button class="btn-delete" data-id="${evento.id}">✕</button>`;

        tarjeta.innerHTML = `
            <div class="event-info">
                <div class="event-title">${evento.titulo} ${badge}</div>
                <div class="event-date">${evento.getTextoFechaHora()}</div>
            </div>
            ${btnEliminar}
        `;

        listaEventos.appendChild(tarjeta);
    });
}


// 6. Validaciones del formulario

// Comprueba que los tres campos del formulario sean correctos antes de crear el evento
function validarFormulario() {
    let valido = true;

    // Limpiar los mensajes de error de una validación anterior
    errorTitulo.textContent = '';
    errorFecha.textContent = '';
    errorHora.textContent = '';

    // El título no puede estar vacío ni contener solo espacios
    if (inputTitulo.value.trim() === '') {
        errorTitulo.textContent = 'El título no puede estar vacío.';
        valido = false;
    }

    // Obtener la fecha de hoy en formato YYYY-MM-DD para poder comparar directamente con el input
    const hoy = new Date().toISOString().split('T')[0];

    if (!inputFecha.value) {
        errorFecha.textContent = 'La fecha es obligatoria.';
        valido = false;
    } else if (inputFecha.value < hoy) {
        // La comparación de strings funciona porque el formato YYYY-MM-DD es lexicográficamente ordenable
        errorFecha.textContent = 'La fecha no puede ser anterior a hoy.';
        valido = false;
    }

    // Expresión regular que valida el formato HH:MM (horas de 00 a 23, minutos de 00 a 59)
    const regexHora = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!inputHora.value) {
        errorHora.textContent = 'La hora es obligatoria.';
        valido = false;
    } else if (!regexHora.test(inputHora.value)) {
        errorHora.textContent = 'El formato debe ser HH:MM.';
        valido = false;
    }

    return valido;
}


// 7. Eventos del DOM

// Cierra el modal y limpia el formulario y los mensajes de error
function cerrarModal() {
    modalOverlay.classList.add('hidden');
    formulario.reset();
    errorTitulo.textContent = '';
    errorFecha.textContent = '';
    errorHora.textContent = '';
}

// Abrir el modal al pulsar el botón "Crear evento"
btnAbrirModal.addEventListener('click', () => {
    modalOverlay.classList.remove('hidden');
});

// Cerrar el modal con el botón X o con el botón Cancelar
btnCerrarModal.addEventListener('click', cerrarModal);
btnCancelar.addEventListener('click', cerrarModal);

// Cerrar el modal al hacer clic en el fondo oscuro fuera de la ventana
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) cerrarModal();
});

// Manejar el envío del formulario: validar, crear el evento y guardarlo
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    // Crear una nueva instancia de Evento con los datos del formulario
    const evento = new Evento(
        Date.now(),                    // ID único basado en la marca de tiempo
        inputTitulo.value.trim(),
        inputFecha.value,
        inputHora.value,
        'usuario'
    );

    todosLosEventos.push(evento);
    guardarEventos(todosLosEventos);
    renderizarEventos();
    cerrarModal();
});

// Delegación de eventos: escuchar los clics en los botones de eliminar de todas las tarjetas
listaEventos.addEventListener('click', (e) => {
    const boton = e.target.closest('.btn-delete');
    if (!boton) return;

    // Los IDs de usuario son números (Date.now), hay que convertir el string del atributo data-id
    const id = Number(boton.dataset.id);
    todosLosEventos = todosLosEventos.filter(ev => ev.id !== id);
    guardarEventos(todosLosEventos);
    renderizarEventos();
});


// 8. Inicio de la aplicación

// Punto de entrada: carga datos previos, llama a las APIs y pinta la lista inicial
async function iniciarApp() {
    // Recuperar primero los eventos del usuario desde localStorage para no perderlos
    const eventosGuardados = recuperarEventos();

    // Esperar a que la API de festivos responda antes de renderizar
    const festivos = await cargarFestivos();

    // Combinar festivos y eventos del usuario en el array global
    todosLosEventos = [...festivos, ...eventosGuardados];
    renderizarEventos();

    // El clima se carga de forma independiente, no bloquea la lista de eventos
    cargarClima();
}

iniciarApp();
