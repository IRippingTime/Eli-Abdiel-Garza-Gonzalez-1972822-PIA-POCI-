/* Listados públicos de cursos desde API, búsqueda y detalle. */

function tarjetaCurso(c) {
  const precioTxt = c.gratis || Number(c.precio) === 0 ? "Gratis" : formatoMoneda(c.precio) + " MXN";
  const estado = c.activo ? "" : '<span class="etiqueta baja">Baja logica</span>';
  return '<article class="tarjeta curso-card">' +
    '<img class="curso-foto" src="' + c.imagen + '" alt="Portada: ' + c.titulo + '">' +
    '<div class="curso-cuerpo">' +
      '<span class="curso-pill">' + c.categoria + '</span>' +
      '<h3>' + c.titulo + '</h3>' +
      '<p>' + c.descripcion + '</p>' +
      '<p class="meta">Por <strong>' + c.instructor + '</strong></p>' +
      '<p class="meta">' + c.niveles + ' niveles · Publicado: ' + formatoFecha(c.fecha_publicacion) + '</p>' +
      '<div class="curso-compra"><span class="precio">' + precioTxt + '</span> ' + estado +
      '<a class="btn btn-mini" href="curso-detalle.html?id=' + c.id + '">Ver curso</a></div>' +
    '</div>' +
    '</article>';
}

async function renderCursosInicio() {
  const cont = document.getElementById("cursos-inicio");
  const aviso = document.getElementById("inicio-aviso");
  if (!cont) return;
  try {
    const result = await apiRequest("/courses");
    cont.innerHTML = "";
    const total = document.getElementById("inicio-total");
    if (total) total.textContent = result.data.length;
    result.data.forEach(function (course) {
      const card = document.createElement("article");
      card.className = "tarjeta curso-card";
      const image = document.createElement("img");
      image.className = "curso-foto";
      image.src = course.image_url || "../img/curso-php.svg";
      image.alt = "Portada: " + course.title;
      const body = document.createElement("div");
      body.className = "curso-cuerpo";
      const category = document.createElement("span");
      category.className = "curso-pill";
      category.textContent = course.category;
      const title = document.createElement("h3");
      title.textContent = course.title;
      const description = document.createElement("p");
      description.textContent = course.description;
      const instructor = document.createElement("p");
      instructor.className = "meta";
      instructor.textContent = "Por " + course.instructor;
      const price = document.createElement("span");
      price.className = "precio";
      price.textContent = Number(course.price) === 0 ? "Gratis" : formatoMoneda(course.price) + " MXN";
      const link = document.createElement("a");
      link.className = "btn btn-mini";
      link.href = "curso-detalle.html?id=" + encodeURIComponent(course.id);
      link.textContent = "Ver curso";
      const actions = document.createElement("div");
      actions.className = "curso-compra";
      actions.append(price, link);
      body.append(category, title, description, instructor, actions);
      card.append(image, body);
      cont.appendChild(card);
    });
    if (aviso) aviso.textContent = result.data.length ? result.data.length + " curso(s) publicados desde la base de datos." : "Aún no hay cursos publicados. Explora el catálogo para volver a buscar.";
  } catch (error) {
    const total = document.getElementById("inicio-total");
    if (total) total.textContent = "—";
    if (aviso) {
      aviso.className = "alerta alerta-error";
      aviso.textContent = error.message + " También puedes abrir el catálogo e intentarlo de nuevo.";
    }
  }
}
function buscarDesdeHero(event) {
  event.preventDefault();
  const q = (document.getElementById("hero-q").value || "").trim();
  window.location.href = "cursos.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  return false;
}

async function renderCatalogo() {
  const cont = document.getElementById("catalogo");
  if (!cont) return;
  const params = new URLSearchParams(window.location.search);
  const box = document.getElementById("q");
  const category = document.getElementById("f-categoria");
  const from = document.getElementById("f-desde");
  const to = document.getElementById("f-hasta");
  const instructor = document.getElementById("f-instructor");
  if (box && !box.value && params.get("q")) box.value = params.get("q");
  const query = new URLSearchParams();
  if (box && box.value.trim()) query.set("q", box.value.trim());
  if (category && category.value) query.set("category", category.value);
  if (instructor && instructor.value.trim()) query.set("instructor", instructor.value.trim());
  if (from && from.value) query.set("from", from.value);
  if (to && to.value) query.set("to", to.value);
  cont.innerHTML = '<div class="alerta alerta-info">Cargando cursos…</div>';
  try {
    const result = await apiRequest("/courses" + (query.toString() ? "?" + query.toString() : ""));
    const rows = result.data.map(function (c) {
      return {
        id: c.id, titulo: c.title, categoria_id: c.category_id, categoria: c.category,
        instructor: c.instructor, precio: Number(c.price), gratis: Number(c.price) === 0,
        niveles: Number(c.level_count), fecha_publicacion: c.published_at, activo: true,
        descripcion: c.description, imagen: c.image_url || "../img/curso-php.svg"
      };
    });
    const total = document.getElementById("total-resultados");
    if (total) total.textContent = result.total + " curso(s) activos encontrados.";
    cont.innerHTML = rows.length ? rows.map(tarjetaCurso).join("") : '<div class="alerta alerta-info">Aún no hay cursos publicados con esos filtros.</div>';
  } catch (error) {
    const total = document.getElementById("total-resultados");
    if (total) total.textContent = "";
    cont.innerHTML = "";
    const alert = document.createElement("div");
    alert.className = "alerta alerta-error";
    alert.textContent = error.message;
    cont.appendChild(alert);
  }
}

async function renderDetalle() {
  const cont = document.getElementById("detalle-curso");
  if (!cont) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id || !/^\d+$/.test(id)) {
    cont.textContent = "El identificador del curso no es válido.";
    return;
  }
  cont.innerHTML = '<div class="alerta alerta-info">Cargando curso…</div>';
  try {
    const result = await apiRequest("/courses/" + id);
    const course = result.data;
    cont.innerHTML = "";
    const image = document.createElement("img");
    image.className = "curso-foto curso-foto-detalle";
    image.src = course.image_url || "../img/curso-php.svg";
    image.alt = "Portada: " + course.title;
    const title = document.createElement("h2");
    title.textContent = course.title;
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = "Categoría: " + course.category + " | Instructor: " + course.instructor;
    const description = document.createElement("p");
    description.textContent = course.description;
    const price = document.createElement("p");
    price.className = "precio";
    price.textContent = Number(course.price) === 0 ? "Gratis" : formatoMoneda(course.price) + " MXN";
    cont.append(image, title, meta, description, price);

    const heading = document.createElement("h3");
    heading.textContent = "Niveles del curso";
    cont.appendChild(heading);
    const list = document.createElement("ol");
    course.levels.forEach(function (level) {
      const item = document.createElement("li");
      const levelTitle = document.createElement("strong");
      levelTitle.textContent = level.title + ": ";
      const link = document.createElement("a");
      link.href = level.video_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ver video del nivel";
      item.append(levelTitle, link);
      if (level.description && !/^contenido de demostración para este tema\.?$/i.test(level.description.trim())) {
        const text = document.createElement("span");
        text.textContent = " — " + level.description;
        item.appendChild(text);
      }
      list.appendChild(item);
    });
    cont.appendChild(list);
    const register = document.createElement("a");
    register.className = "btn";
    register.href = "registro.html";
    register.textContent = "Crear cuenta para inscribirme";
    cont.appendChild(register);
  } catch (error) {
    cont.innerHTML = "";
    const alert = document.createElement("div");
    alert.className = "alerta alerta-error";
    alert.textContent = error.message;
    cont.appendChild(alert);
  }
}

async function renderCategorias() {
  const selects = ["f-categoria", "categoria"].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if (!selects.length) return;
  try {
    const result = await apiRequest("/categories");
    selects.forEach(function (select) {
      const firstText = select.id === "f-categoria" ? "Todas las categorías" : "Seleccionar categoría...";
      select.innerHTML = '<option value="">' + firstText + '</option>';
      result.data.forEach(function (cat) {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    });
  } catch (error) {
    selects.forEach(function (select) {
      select.innerHTML = '<option value="">No se pudieron cargar categorías</option>';
    });
    const notice = document.getElementById("aviso-curso");
    if (notice) mostrarAviso("aviso-curso", error.message);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderCursosInicio();
  renderCategorias();
  renderCatalogo();
  renderDetalle();
});
