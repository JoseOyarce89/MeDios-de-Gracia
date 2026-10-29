// ==========================================================================
// INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbarToggle();
  initCarousel();
  initWhatsappButton();
  initLectorBiblico();
  cargarVersiculoDelDia();
  cargarNoticiasEnInicio();
});

// Evita que texto escrito por usuarios se interprete como HTML
function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

/* ==========================================================================
   1. NAVEGACIÓN Y MENÚ RESPONSIVE
   ========================================================================== */
function initNavbarToggle() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });

    // Cierra el menú móvil al hacer clic en un enlace
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('show');
      });
    });
  }
}

/* ==========================================================================
   2. CARRUSEL DE IMÁGENES AUTOMÁTICO Y MANUAL
   ========================================================================== */
let currentSlideIndex = 0;
let carouselTimer = null;

function initCarousel() {
  showSlide(currentSlideIndex);
  startCarouselAutoPlay();
}

function showSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.dot');

  if (slides.length === 0) return;

  if (index >= slides.length) currentSlideIndex = 0;
  else if (index < 0) currentSlideIndex = slides.length - 1;
  else currentSlideIndex = index;

  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  slides[currentSlideIndex].classList.add('active');
  if (dots[currentSlideIndex]) {
    dots[currentSlideIndex].classList.add('active');
  }
}

function moveSlide(direction) {
  resetCarouselTimer();
  showSlide(currentSlideIndex + direction);
}

function currentSlide(index) {
  resetCarouselTimer();
  showSlide(index);
}

function startCarouselAutoPlay() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => {
    showSlide(currentSlideIndex + 1);
  }, 5000); // Cambia cada 5 segundos
}

function resetCarouselTimer() {
  startCarouselAutoPlay();
}

/* ==========================================================================
   3. BOTÓN FLOTANTE DE WHATSAPP
   ========================================================================== */
function initWhatsappButton() {
  const boton = document.getElementById('whatsapp-float');
  if (!boton || !CONFIG.WHATSAPP_NUMERO) return;

  boton.href = `https://wa.me/${CONFIG.WHATSAPP_NUMERO}`;
  boton.hidden = false;
}

/* ==========================================================================
   Libros de la Biblia: nombre y cantidad de capítulos (ID = posición 1..66)
   ========================================================================== */
const LIBROS_BIBLIA = [
  ["Génesis", 50], ["Éxodo", 40], ["Levítico", 27], ["Números", 36], ["Deuteronomio", 34],
  ["Josué", 24], ["Jueces", 21], ["Rut", 4], ["1 Samuel", 31], ["2 Samuel", 24],
  ["1 Reyes", 22], ["2 Reyes", 25], ["1 Crónicas", 29], ["2 Crónicas", 36], ["Esdras", 10],
  ["Nehemías", 13], ["Ester", 10], ["Job", 42], ["Salmos", 150], ["Proverbios", 31],
  ["Eclesiastés", 12], ["Cantares", 8], ["Isaías", 66], ["Jeremías", 52], ["Lamentaciones", 5],
  ["Ezequiel", 48], ["Daniel", 12], ["Oseas", 14], ["Joel", 3], ["Amós", 9],
  ["Abdías", 1], ["Jonás", 4], ["Miqueas", 7], ["Nahúm", 3], ["Habacuc", 3],
  ["Sofonías", 3], ["Hageo", 2], ["Zacarías", 14], ["Malaquías", 4], ["Mateo", 28],
  ["Marcos", 16], ["Lucas", 24], ["Juan", 21], ["Hechos", 28], ["Romanos", 16],
  ["1 Corintios", 16], ["2 Corintios", 13], ["Gálatas", 6], ["Efesios", 6], ["Filipenses", 4],
  ["Colosenses", 4], ["1 Tesalonicenses", 5], ["2 Tesalonicenses", 3], ["1 Timoteo", 6],
  ["2 Timoteo", 4], ["Tito", 3], ["Filemón", 1], ["Hebreos", 13], ["Santiago", 5],
  ["1 Pedro", 5], ["2 Pedro", 3], ["1 Juan", 5], ["2 Juan", 1], ["3 Juan", 1],
  ["Judas", 1], ["Apocalipsis", 22]
];

function nombreLibro(id) {
  return LIBROS_BIBLIA[id - 1]?.[0] || `Libro ${id}`;
}

/* ==========================================================================
   4. VERSÍCULO DEL DÍA Y SELECTOR ALEATORIO (BOLLS API - RV1960)
   ========================================================================== */
async function cargarVersiculoDelDia() {
  await obtenerVersiculoAleatorio();
}

async function obtenerNuevoVersiculoAleatorio() {
  await obtenerVersiculoAleatorio();
}

async function obtenerVersiculoAleatorio() {
  const elementoTexto = document.getElementById('verse-text');
  const elementoRef = document.getElementById('verse-ref');

  if (!elementoTexto || !elementoRef) return;

  elementoTexto.textContent = '"Cargando versículo..."';
  elementoRef.textContent = '';

  try {
    const res = await fetch('https://bolls.life/get-random-verse/RV1960/');
    if (!res.ok) throw new Error('Error al conectar con la API');

    const data = await res.json();

    // Limpiamos etiquetas HTML internas
    const textoLimpio = data.text.replace(/<[^>]*>/g, '').trim();

    elementoTexto.textContent = `"${textoLimpio}"`;
    elementoRef.textContent = `${nombreLibro(data.book)} ${data.chapter}:${data.verse}`;
  } catch (error) {
    console.error('Error al obtener el versículo:', error);
    elementoTexto.textContent = '"Jehová es mi pastor; nada me faltará."';
    elementoRef.textContent = 'Salmos 23:1';
  }
}

/* ==========================================================================
   5. LECTOR BÍBLICO ONLINE (BOLLS API)
   ========================================================================== */
function initLectorBiblico() {
  const libroSelect = document.getElementById('bible-book');
  if (!libroSelect) return;

  // Antiguo Testamento: libros 1-39, Nuevo Testamento: 40-66
  const grupo = (etiqueta, desde, hasta) => {
    const opciones = LIBROS_BIBLIA.slice(desde - 1, hasta)
      .map(([nombre], i) => `<option value="${desde + i}">${nombre}</option>`)
      .join('');
    return `<optgroup label="${etiqueta}">${opciones}</optgroup>`;
  };

  libroSelect.innerHTML = grupo('Antiguo Testamento', 1, 39) + grupo('Nuevo Testamento', 40, 66);
  libroSelect.value = '43'; // Juan

  cambiarLibroBiblico();
}

// Al cambiar de libro se regeneran los capítulos y se vuelve al capítulo 1
function cambiarLibroBiblico() {
  const bookId = parseInt(document.getElementById('bible-book').value, 10);
  const capituloSelect = document.getElementById('bible-chapter');
  const totalCapitulos = LIBROS_BIBLIA[bookId - 1][1];

  let opciones = '';
  for (let c = 1; c <= totalCapitulos; c++) {
    opciones += `<option value="${c}">Capítulo ${c}</option>`;
  }
  capituloSelect.innerHTML = opciones;

  cargarCapituloBiblico();
}

async function cargarCapituloBiblico() {
  const visor = document.getElementById('bible-content');
  if (!visor) return;

  const bookId = parseInt(document.getElementById('bible-book').value, 10) || 43;
  const capitulo = document.getElementById('bible-chapter').value || '1';
  const version = document.getElementById('bible-version').value || 'RV1960';
  const titulo = `<h3>${nombreLibro(bookId)} Capítulo ${capitulo}</h3>`;

  visor.innerHTML = "<p>Cargando pasaje bíblico...</p>";

  try {
    const res = await fetch(`https://bolls.life/get-chapter/${version}/${bookId}/${capitulo}/`);

    if (!res.ok) throw new Error('No se pudo cargar el capítulo');

    const versiculos = await res.json();
    let htmlContenido = `${titulo}<hr><br>`;

    if (Array.isArray(versiculos) && versiculos.length > 0) {
      versiculos.forEach(v => {
        const textoLimpio = v.text.replace(/<[^>]*>/g, '').trim();
        htmlContenido += `<p class="bible-verse-item"><span class="verse-num">${v.verse}</span> ${escaparHTML(textoLimpio)}</p>`;
      });
    } else {
      htmlContenido += `<p>El pasaje seleccionado no contiene versículos para mostrar.</p>`;
    }

    visor.innerHTML = htmlContenido;
    visor.scrollTop = 0;
  } catch (error) {
    console.error('Error al obtener el capítulo:', error);
    visor.innerHTML = `
      ${titulo}
      <p>Error al conectar con el servidor de la Biblia. Por favor intenta de nuevo.</p>
    `;
  }
}

/* ==========================================================================
   6. FORMULARIOS (ORACIÓN Y CONTACTO) → GMAIL VÍA WEB3FORMS
   ========================================================================== */
async function enviarFormulario(form, datos) {
  const boton = form.querySelector('button[type="submit"]');
  const estado = form.querySelector('.form-status');
  const textoBoton = boton.innerHTML;

  // Campo trampa anti-spam: las personas no lo ven, los robots sí lo llenan
  if (form.querySelector('[name="botcheck"]').checked) return false;

  boton.disabled = true;
  boton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
  estado.className = 'form-status';
  estado.textContent = '';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: CONFIG.WEB3FORMS_KEY,
        from_name: 'Web MeDios de Gracia',
        ...datos
      })
    });
    const resultado = await res.json();
    if (!resultado.success) throw new Error(resultado.message);

    form.reset();
    return true;
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    estado.className = 'form-status error';
    estado.textContent = 'No pudimos enviar tu mensaje. Revisa tu conexión e inténtalo nuevamente.';
    return false;
  } finally {
    boton.disabled = false;
    boton.innerHTML = textoBoton;
  }
}

function mostrarExito(form, mensaje) {
  const estado = form.querySelector('.form-status');
  estado.className = 'form-status ok';
  estado.textContent = mensaje;
}

async function handlePrayerSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const valor = id => document.getElementById(id).value.trim();

  const nombre = valor('prayer-firstname');
  const porQuien = valor('prayer-for');
  const motivo = valor('prayer-reason');
  const peticion = valor('prayer-request');
  const confidencial = document.getElementById('prayer-confidential').checked;

  const datos = {
    subject: confidencial
      ? `🔒 [CONFIDENCIAL] Petición de oración por ${porQuien}`
      : `🙏 Petición de oración por ${porQuien}`,
    replyto: valor('prayer-email') || undefined,
    'Orar por': porQuien,
    'Motivo': motivo,
    'Petición': peticion,
    'Confidencial': confidencial ? 'SÍ — solo equipo pastoral, NO compartir en el grupo' : 'No',
    'Enviada por': `${nombre} ${valor('prayer-lastname')}`.trim(),
    'Correo': valor('prayer-email') || '(no indicado)',
    'Teléfono': valor('prayer-phone') || '(no indicado)'
  };

  // Enlace que abre WhatsApp con el mensaje listo para pegar en el grupo de oración
  if (!confidencial) {
    const mensajeGrupo = `🙏 *Petición de oración*\n*Oremos por:* ${porQuien}\n*Motivo:* ${motivo}\n\n${peticion}`;
    datos['Compartir en WhatsApp'] = `https://wa.me/?text=${encodeURIComponent(mensajeGrupo)}`;
  }

  if (await enviarFormulario(form, datos)) {
    mostrarExito(form, `¡Gracias ${nombre}! Recibimos tu petición. Estaremos orando por ${porQuien}.`);
  }
}

async function handleContactSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const valor = id => document.getElementById(id).value.trim();

  const nombre = valor('contact-firstname');
  const motivoSelect = document.getElementById('contact-reason');
  const motivo = motivoSelect.options[motivoSelect.selectedIndex].text;

  const datos = {
    subject: `✉️ Consulta web: ${motivo} — ${nombre}`,
    replyto: valor('contact-email'),
    'Nombre': `${nombre} ${valor('contact-lastname')}`,
    'Correo': valor('contact-email'),
    'Teléfono': valor('contact-phone'),
    'Motivo': motivo,
    'Mensaje': valor('contact-message')
  };

  if (await enviarFormulario(form, datos)) {
    mostrarExito(form, `¡Muchas gracias ${nombre}! Recibimos tu mensaje y te responderemos a la brevedad.`);
  }
}

/* ==========================================================================
   7. NOTICIAS PUBLICADAS POR EL PASTOR (DESDE SUPABASE)
   ========================================================================== */

// Guardamos las noticias en memoria para acceder a ellas desde el modal
let listaNoticiasActuales = [];

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function cargarNoticiasEnInicio() {
  const seccion = document.getElementById('seccion-noticias');
  const contenedor = document.getElementById('contenedor-noticias');

  if (!seccion || !contenedor) return;

  try {
    const res = await fetch(
      `${CONFIG.SUPABASE_URL}/rest/v1/noticias?select=*&order=created_at.desc&limit=12`,
      { headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}` } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    listaNoticiasActuales = await res.json();
  } catch (error) {
    console.error('Error al cargar las noticias:', error);
    listaNoticiasActuales = [];
  }

  // Sin noticias la sección permanece oculta
  if (listaNoticiasActuales.length === 0) {
    seccion.hidden = true;
    return;
  }

  seccion.hidden = false;

  contenedor.innerHTML = listaNoticiasActuales.map((item, index) => {
    // Si tiene más de 25 palabras, cortamos el texto
    const palabras = item.contenido.trim().split(/\s+/);
    const superaLimite = palabras.length > 25;
    const textoMostrar = superaLimite ? palabras.slice(0, 25).join(' ') + '...' : item.contenido;

    return `
      <article class="news-card">
        <div>
          ${item.imagen_url ? `<img src="${escaparHTML(item.imagen_url)}" alt="${escaparHTML(item.titulo)}" class="news-card-img" loading="lazy">` : ''}
          <h3>${escaparHTML(item.titulo)}</h3>
          <p>${escaparHTML(textoMostrar)}</p>
          ${superaLimite ? `<button class="news-more" onclick="abrirModalNoticia(${index})">Ver más →</button>` : ''}
        </div>
        <div class="news-date">${formatearFecha(item.created_at)}</div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   VENTANA EMERGENTE (MODAL) PARA MOSTRAR LA NOTICIA COMPLETA
   ========================================================================== */
function abrirModalNoticia(index) {
  const noticia = listaNoticiasActuales[index];
  if (!noticia) return;

  // Crear o reutilizar la ventana emergente en el HTML
  let modal = document.getElementById('modal-noticia-completa');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-noticia-completa';
    modal.className = 'news-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.appendChild(modal);

    // Cerrar al hacer clic fuera del contenido o con la tecla Escape
    modal.addEventListener('click', e => {
      if (e.target === modal) cerrarModalNoticia();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') cerrarModalNoticia();
    });
  }

  modal.innerHTML = `
    <div class="news-modal-content">
      <button class="news-modal-close" onclick="cerrarModalNoticia()" aria-label="Cerrar">✕</button>
      ${noticia.imagen_url ? `<img src="${escaparHTML(noticia.imagen_url)}" alt="${escaparHTML(noticia.titulo)}">` : ''}
      <h2>${escaparHTML(noticia.titulo)}</h2>
      <p>${escaparHTML(noticia.contenido)}</p>
      <hr>
      <small>${formatearFecha(noticia.created_at)}</small>
    </div>
  `;

  modal.style.display = 'flex';
}

function cerrarModalNoticia() {
  const modal = document.getElementById('modal-noticia-completa');
  if (modal) modal.style.display = 'none';
}
