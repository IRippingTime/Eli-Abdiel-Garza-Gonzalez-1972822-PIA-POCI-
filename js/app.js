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
    const total = document.getElementById("inicio-total");
    if (total) total.textContent = result.data.length;
    const courses = result.data;
    const recent = courses.slice().sort(function (a, b) { return String(b.published_at).localeCompare(String(a.published_at)); });
    const rated = courses.filter(function (course) { return course.average_rating !== null && Number(course.average_rating) > 0; }).sort(function (a, b) { return Number(b.average_rating) - Number(a.average_rating); });
    const sold = courses.slice().sort(function (a, b) { return Number(b.sold_count || 0) - Number(a.sold_count || 0); });
    cont.replaceChildren();
    appendHomeCourseSection(cont, "Mejor calificados", rated, function (course) { return Number(course.average_rating).toFixed(1) + "/5"; }, "Aún no hay cursos calificados.");
    appendHomeCourseSection(cont, "Más vendidos", sold, function (course) { return Number(course.sold_count || 0) + " compra(s)"; });
    appendHomeCourseSection(cont, "Más recientes", recent, function (course) { return formatoFecha(course.published_at); });
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

function appendHomeCourseSection(container, headingText, courses, metric, emptyMessage = "No hay cursos publicados.") {
  const section = document.createElement("section");
  const heading = document.createElement("h3");
  heading.textContent = headingText;
  const grid = document.createElement("div");
  grid.className = "grid-3";
  section.appendChild(heading);
  if (!courses.length) {
    const empty = document.createElement("p");
    empty.textContent = emptyMessage;
    section.appendChild(empty);
  }
  courses.slice(0, 3).forEach(function (course) {
    const card = document.createElement("article");
    card.className = "tarjeta curso-card";
    const image = document.createElement("img");
    image.className = "curso-foto";
    image.src = course.image_url || "../img/curso-php.svg";
    image.alt = "Portada: " + course.title;
    const body = document.createElement("div");
    body.className = "curso-cuerpo";
    const category = document.createElement("span"); category.className = "curso-pill"; category.textContent = course.category;
    const title = document.createElement("h4"); title.textContent = course.title;
    const description = document.createElement("p"); description.textContent = course.description;
    const instructor = document.createElement("p"); instructor.className = "meta"; instructor.textContent = "Por " + course.instructor;
    const stat = document.createElement("p"); stat.className = "meta"; stat.textContent = metric(course);
    const price = document.createElement("span"); price.className = "precio"; price.textContent = Number(course.price) === 0 ? "Gratis" : formatoMoneda(course.price) + " MXN";
    const link = document.createElement("a"); link.className = "btn btn-mini"; link.href = "curso-detalle.html?id=" + encodeURIComponent(course.id); link.textContent = "Ver curso";
    const actions = document.createElement("div"); actions.className = "curso-compra"; actions.append(price, link);
    body.append(category, title, description, instructor, stat, actions);
    card.append(image, body); grid.appendChild(card);
  });
  if (courses.length) section.appendChild(grid);
  container.appendChild(section);
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
      item.appendChild(levelTitle);
      if (course.has_access && level.video_url) {
        const link = document.createElement("a");
        link.href = level.video_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Ver video del nivel";
        item.appendChild(link);
      } else {
        const locked = document.createElement("span");
        locked.textContent = "Contenido disponible después de inscribirte y tener acceso.";
        item.appendChild(locked);
      }
      if (level.description && !/^contenido de demostración para este tema\.?$/i.test(level.description.trim())) {
        const text = document.createElement("span");
        text.textContent = " — " + level.description;
        item.appendChild(text);
      }
      list.appendChild(item);
    });
    cont.appendChild(list);
    const reviewsPanel = document.createElement("section");
    const reviewsTitle = document.createElement("h3");
    reviewsTitle.textContent = "Opiniones y calificación";
    reviewsPanel.appendChild(reviewsTitle);
    try {
      const reviews = await apiRequest("/courses/" + encodeURIComponent(course.id) + "/reviews");
      const average = document.createElement("p");
      average.textContent = reviews.average_rating === null ? "Aún no hay calificaciones." : "Promedio: " + reviews.average_rating + "/5 (" + reviews.total + " opiniones)";
      reviewsPanel.appendChild(average);
      reviews.data.forEach(function (review) {
        const item = document.createElement("article");
        item.className = "tarjeta";
        const author = document.createElement("strong");
        author.textContent = review.full_name + " · " + review.rating + "/5 · " + String(review.created_at || "").slice(0, 16);
        const body = document.createElement("p");
        body.textContent = review.deleted_at ? "Comentario eliminado por moderación." : review.comment;
        item.append(author, body);
        reviewsPanel.appendChild(item);
      });
    } catch (error) {
      const notice = document.createElement("p");
      notice.textContent = error.message;
      reviewsPanel.appendChild(notice);
    }
    cont.appendChild(reviewsPanel);
    const actions = document.createElement("div");
    actions.className = "tarjeta";
    try {
      const session = await apiRequest("/auth/me");
      if (session.data.user.role === "estudiante") {
        const enrollments = await apiRequest("/student/enrollments");
        const enrollment = enrollments.data.find(function (row) { return Number(row.course_id) === Number(course.id); });
        if (enrollment && enrollment.completed_at && !enrollment.review_id) {
          const reviewForm = document.createElement("form");
          const rating = document.createElement("select");
          rating.required = true;
          for (let score = 1; score <= 5; score++) rating.add(new Option(score + " estrellas", String(score)));
          const comment = document.createElement("textarea");
          comment.required = true;
          comment.maxLength = 2000;
          comment.placeholder = "Comparte tu opinión del curso";
          const submit = document.createElement("button");
          submit.className = "btn";
          submit.type = "submit";
          submit.textContent = "Publicar opinión";
          reviewForm.append(rating, comment, submit);
          reviewForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            try { await apiRequest("/student/reviews", { method: "POST", body: JSON.stringify({ enrollment_id: Number(enrollment.id), rating: Number(rating.value), comment: comment.value.trim() }) }); window.location.reload(); }
            catch (error) { mostrarAviso("aviso-curso", error.message); }
          });
          actions.appendChild(reviewForm);
        }
        if (!enrollment || !Number(enrollment.access_granted)) {
          if (enrollment) {
            const notice = document.createElement("p");
            notice.className = "alerta alerta-info";
            notice.textContent = "Tu solicitud de pago está pendiente de validación por el administrador.";
            actions.appendChild(notice);
          } else if (Number(course.price) === 0) {
            const enrollButton = document.createElement("button");
            enrollButton.className = "btn";
            enrollButton.textContent = "Inscribirme gratis";
            enrollButton.addEventListener("click", async function () {
              enrollButton.disabled = true;
              try { await apiRequest("/student/enrollments", { method: "POST", body: JSON.stringify({ course_id: Number(course.id) }) }); window.location.reload(); }
              catch (error) { enrollButton.disabled = false; mostrarAviso("aviso-curso", error.message); }
            });
            actions.appendChild(enrollButton);
          } else {
            const form = document.createElement("form");
            const method = document.createElement("select");
            method.required = true;
            method.add(new Option("Selecciona forma de pago", ""));
            method.add(new Option("Transferencia bancaria", "transferencia"));
            method.add(new Option("Tarjeta (solicitud de demostración)", "tarjeta"));
            const button = document.createElement("button");
            button.className = "btn";
            button.textContent = "Solicitar inscripción de pago";
            form.append(method, button);
            const notice = document.createElement("p");
            notice.className = "meta";
            notice.textContent = "Esta demostración registra solicitudes; el administrador debe validar el pago antes de activar el curso. No procesa cargos de tarjeta.";
            form.appendChild(notice);
            form.addEventListener("submit", async function (event) {
              event.preventDefault();
              button.disabled = true;
              try {
                const result = await apiRequest("/student/courses/" + encodeURIComponent(course.id) + "/purchase", { method: "POST", body: JSON.stringify({ payment_method: method.value }) });
                mostrarAviso("aviso-curso", result.message, "ok");
                window.location.reload();
              } catch (error) { button.disabled = false; mostrarAviso("aviso-curso", error.message); }
            });
            actions.appendChild(form);
          }
        } else {
          const title = document.createElement("h3");
          title.textContent = "Tu avance: " + Number(enrollment.progress_percent || 0) + "%";
          actions.appendChild(title);
          const completedIds = String(enrollment.completed_level_ids || "").split(",");
          course.levels.forEach(function (level) {
            const row = document.createElement("p");
            const done = completedIds.includes(String(level.id));
            if (done) row.textContent = level.title + " — completado";
            else {
              const button = document.createElement("button");
              button.className = "btn btn-mini";
              button.textContent = "Marcar nivel como terminado: " + level.title;
              button.addEventListener("click", async function () {
                button.disabled = true;
                try {
                  await apiRequest("/student/enrollments/" + enrollment.id + "/progress", { method: "PUT", body: JSON.stringify({ level_id: Number(level.id) }) });
                  window.location.reload();
                } catch (error) { button.disabled = false; mostrarAviso("aviso-curso", error.message); }
              });
              row.appendChild(button);
            }
            actions.appendChild(row);
          });
        }
      } else {
        const register = document.createElement("a");
        register.className = "btn";
        register.href = "registro.html";
        register.textContent = "Crear cuenta de estudiante";
        actions.appendChild(register);
      }
    } catch (_) {
      const register = document.createElement("a");
      register.className = "btn";
      register.href = "registro.html";
      register.textContent = "Crear cuenta para inscribirme";
      actions.appendChild(register);
    }
    cont.appendChild(actions);
  } catch (error) {
    cont.innerHTML = "";
    const alert = document.createElement("div");
    alert.className = "alerta alerta-error";
    alert.textContent = error.message;
    cont.appendChild(alert);
    if (/Inicia sesión|inscribirte|pago confirmado/i.test(error.message)) {
      const login = document.createElement("a");
      login.className = "btn";
      login.href = "login.html";
      login.textContent = "Iniciar sesión";
      const register = document.createElement("a");
      register.className = "btn btn-secundario";
      register.href = "registro.html";
      register.textContent = "Crear cuenta";
      cont.append(login, register);
    }
  }
}

async function renderCategorias() {
  const selects = ["f-categoria", "categoria"].map(function (id) { return document.getElementById(id); }).filter(Boolean);
  const homeCategories = document.getElementById("inicio-categorias");
  if (!selects.length && !homeCategories) return;
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
    const selectedCategory = new URLSearchParams(window.location.search).get("category");
    const categoryFilter = document.getElementById("f-categoria");
    if (selectedCategory && categoryFilter) {
      categoryFilter.value = selectedCategory;
      renderCatalogo();
    }
    if (homeCategories) {
      homeCategories.replaceChildren();
      result.data.forEach(function (category) {
        const link = document.createElement("a");
        link.className = "curso-pill";
        link.href = "cursos.html?category=" + encodeURIComponent(category.id);
        link.textContent = category.name;
        homeCategories.appendChild(link);
      });
    }
  } catch (error) {
    selects.forEach(function (select) {
      select.innerHTML = '<option value="">No se pudieron cargar categorías</option>';
    });
    const notice = document.getElementById("aviso-curso");
    if (notice) mostrarAviso("aviso-curso", error.message);
    if (homeCategories) homeCategories.textContent = error.message;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderCursosInicio();
  renderCategorias();
  renderCatalogo();
  renderDetalle();
});
