/* Logica del prototipo: listados, buscador, detalle, kardex, ventas, mensajes */

function tarjetaCurso(c) {
  const precioTxt = c.gratis || c.precio === 0 ? "Gratis" : formatoMoneda(c.precio) + " MXN";
  const estado = c.activo ? "" : '<span class="etiqueta baja">Baja logica</span>';
  return '<article class="tarjeta curso-card">' +
    '<img class="curso-foto" src="' + c.imagen + '" alt="Portada: ' + c.titulo + '">' +
    '<div class="curso-cuerpo">' +
      '<span class="curso-pill">' + c.categoria + '</span>' +
      '<h3>' + c.titulo + '</h3>' +
      '<p>' + c.descripcion + '</p>' +
      '<p class="meta">Por <strong>' + c.instructor + '</strong></p>' +
      '<p class="meta">' + (c.duracion || "") + ' · ' + (c.nivel || "Todos") +
      ' · Publicado: ' + formatoFecha(c.fecha_publicacion) +
      ' · <span class="estrellas">★</span> ' + c.rating + ' (' + c.vendidos + ')</p>' +
      '<div class="curso-compra"><span class="precio">' + precioTxt + '</span> ' + estado +
      '<a class="btn btn-mini" href="curso-detalle.html?id=' + c.id + '">Ver curso</a></div>' +
    '</div>' +
    '</article>';
}

function renderDestacados(idContenedor, filtro) {
  const cont = document.getElementById(idContenedor);
  if (!cont) return;
  let lista = CURSOS.filter(function (c) { return c.activo; });
  if (filtro === "mejor") lista = lista.slice().sort(function (a, b) { return b.rating - a.rating; }).slice(0, 3);
  if (filtro === "vendidos") lista = lista.slice().sort(function (a, b) { return b.vendidos - a.vendidos; }).slice(0, 3);
  if (filtro === "recientes") lista = lista.slice().sort(function (a, b) { return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion); }).slice(0, 3);
  cont.innerHTML = lista.map(tarjetaCurso).join("");
}

function buscarDesdeHero(event) {
  event.preventDefault();
  const q = (document.getElementById("hero-q").value || "").trim();
  window.location.href = "cursos.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  return false;
}

function renderCatalogo() {
  const cont = document.getElementById("catalogo");
  if (!cont) return;
  const box = document.getElementById("q");
  const params = new URLSearchParams(window.location.search);
  if (box && !box.value && params.get("q")) box.value = params.get("q");
  const q = (box.value || "").toLowerCase();
  const cat = document.getElementById("f-categoria").value;
  const desde = document.getElementById("f-desde").value;
  const hasta = document.getElementById("f-hasta").value;
  const instructor = (document.getElementById("f-instructor").value || "").toLowerCase();

  let lista = CURSOS.filter(function (c) { return c.activo; });
  if (q) lista = lista.filter(function (c) { return c.titulo.toLowerCase().includes(q); });
  if (cat) lista = lista.filter(function (c) { return String(c.categoria_id) === String(cat); });
  if (instructor) lista = lista.filter(function (c) { return c.instructor.toLowerCase().includes(instructor); });
  if (desde) lista = lista.filter(function (c) { return c.fecha_publicacion >= desde; });
  if (hasta) lista = lista.filter(function (c) { return c.fecha_publicacion <= hasta; });

  document.getElementById("total-resultados").textContent = lista.length + " curso(s) activos encontrados.";
  cont.innerHTML = lista.length ? lista.map(tarjetaCurso).join("") : '<div class="alerta alerta-info">Sin resultados con esos filtros.</div>';
}

function renderDetalle() {
  const cont = document.getElementById("detalle-curso");
  if (!cont) return;
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id") || "101", 10);
  const c = CURSOS.find(function (x) { return x.id === id && x.activo; }) || CURSOS[0];
  const precioTxt = c.gratis || c.precio === 0 ? "Gratis" : formatoMoneda(c.precio);
  cont.innerHTML =
    '<img class="curso-foto curso-foto-detalle" src="' + c.imagen + '" alt="Portada: ' + c.titulo + '">' +
    '<h2>' + c.titulo + '</h2>' +
    '<p class="meta">Publicado: ' + formatoFecha(c.fecha_publicacion) + ' | Instructor: ' + c.instructor + '</p>' +
    '<p>' + c.descripcion + '</p>' +
    '<p><span class="estrellas">★★★★★</span> Promedio: <strong>' + c.rating + '</strong> | Estudiantes: ' + c.vendidos + ' | Niveles: ' + c.niveles + '</p>' +
    '<p class="precio">' + precioTxt + '</p>' +
    '<div class="alerta alerta-info">Para ver el contenido completo debes registrarte y comprar el curso o inscribirte si es gratis. Prototipo: cada nivel incluye un video obligatorio.</div>' +
    '<p><a class="btn" href="registro.html">Inscribirme</a> <a class="btn btn-secundario" href="cursos.html">Volver al buscador</a></p>' +
    '<h3>Niveles del curso</h3>' +
    '<table><tr><th>Nivel</th><th>Contenido</th><th>Video</th><th>Costo</th></tr>' +
    [1,2,3].map(function(n){
      return '<tr><td>Nivel ' + n + '</td><td>Texto, PDF adjunto, links e imagenes</td><td>Video obligatorio nivel ' + n + ' (YouTube/Cloudinary)</td><td>' + (n===1 && c.gratis ? 'Gratis' : precioTxt) + '</td></tr>';
    }).join("") + '</table>' +
    '<h3>Comentarios de estudiantes que terminaron el curso</h3>' +
    '<div class="comentario"><div class="mensaje-header"><span class="avatar">P1</span><div><strong>Persona 1</strong><br><span class="fecha-hora">12 sep 2026, 10:30</span></div></div><p><span class="estrellas">★★★★★</span> Excelente curso, muy completo.</p></div>' +
    '<div class="comentario"><div class="mensaje-header"><span class="avatar">P2</span><div><strong>Persona 2</strong><br><span class="fecha-hora">10 sep 2026, 18:05</span></div></div><p><span class="estrellas">★★★★☆</span> Bueno, el nivel 2 podria tener mas ejemplos.</p></div>';
}

function renderKardex() {
  const cuerpo = document.getElementById("kardex-body");
  if (!cuerpo) return;
  const datos = [
    { curso: "PHP desde Cero con POO y MVC", cat: "IT & Software", inscripcion: "2026-08-18", ultimo: "2026-09-12", fin: "-", estado: "Incompleto", avance: "60%", activo: "Si" },
    { curso: "JavaScript Moderno y Fetch API", cat: "IT & Software", inscripcion: "2026-08-20", ultimo: "2026-09-10", fin: "10 sep 2026", estado: "Completo", avance: "100%", activo: "Si" },
    { curso: "Ingles Tecnico para TI", cat: "Idiomas", inscripcion: "2026-09-01", ultimo: "2026-09-11", fin: "-", estado: "Incompleto", avance: "30%", activo: "Si" }
  ];
  cuerpo.innerHTML = datos.map(function (r) {
    return "<tr><td>" + r.curso + "</td><td>" + r.cat + "</td><td>" + formatoFecha(r.inscripcion) +
      "</td><td>" + formatoFecha(r.ultimo) + "</td><td>" + r.fin + "</td><td>" + r.estado +
      "</td><td>" + r.avance + "</td><td>" + r.activo + "</td></tr>";
  }).join("");
}

function renderVentas() {
  const cuerpo = document.getElementById("ventas-body");
  if (!cuerpo) return;
  const filas = [
    { curso: "PHP desde Cero con POO y MVC", alumnos: 120, nivelProm: "3.2", ingresos: 107880.00 },
    { curso: "Marketing Digital para Creadores", alumnos: 80, nivelProm: "2.5", ingresos: 47920.00 }
  ];
  cuerpo.innerHTML = filas.map(function (r) {
    return "<tr><td>" + r.curso + "</td><td>" + r.alumnos + "</td><td>" + r.nivelProm +
      "</td><td>" + formatoMoneda(r.ingresos) + "</td></tr>";
  }).join("");
  const total = filas.reduce(function (a, b) { return a + b.ingresos; }, 0);
  document.getElementById("ventas-total").textContent = "Total de ingresos por todos los cursos: " + formatoMoneda(total) + " (Tarjeta: " + formatoMoneda(total*0.7) + " | Transferencia: " + formatoMoneda(total*0.3) + ")";
}

function renderRutas() {
  const cont = document.getElementById("rutas");
  if (!cont || typeof RUTAS === "undefined") return;
  cont.innerHTML = RUTAS.map(function (r) {
    return '<article class="tarjeta ruta-card">' +
      '<img class="curso-foto" src="' + r.imagen + '" alt="Ruta: ' + r.nombre + '">' +
      '<h3>' + r.nombre + '</h3>' +
      '<p>' + r.descripcion + '</p>' +
      '<p class="meta">' + r.horas + ' | ' + r.nivel + '</p>' +
      '<div class="level-bar"><span style="width:' + (r.cursos >= 3 ? "100" : "66") + '%"></span></div>' +
      '<p><a class="btn btn-secundario" href="cursos.html">Explorar ruta</a></p>' +
      '</article>';
  }).join("");
}

function renderCategorias() {
  const sel = document.getElementById("f-categoria");
  if (!sel || typeof CATEGORIAS === "undefined") return;
  CATEGORIAS.forEach(function (cat) {
    const op = document.createElement("option");
    op.value = cat.id;
    op.textContent = cat.nombre;
    sel.appendChild(op);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderDestacados("destacados-mejor", "mejor");
  renderDestacados("destacados-vendidos", "vendidos");
  renderDestacados("destacados-recientes", "recientes");
  renderRutas();
  renderCategorias();
  renderCatalogo();
  renderDetalle();
  renderKardex();
  renderVentas();
});
