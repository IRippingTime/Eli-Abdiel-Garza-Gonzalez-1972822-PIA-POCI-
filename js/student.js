document.addEventListener("DOMContentLoaded", cargarVistasEstudiante);

async function cargarVistasEstudiante() {
  const dashboard = document.getElementById("student-enrollments");
  const tableBody = document.getElementById("kardex-body");
  if (!dashboard && !tableBody) return;

  try {
    const session = await apiRequest("/auth/me");
    const user = session.data.user;
    if (user.role !== "estudiante") throw new Error("Esta pantalla es exclusiva para cuentas de estudiante.");
    const result = await apiRequest("/student/enrollments");
    if (dashboard) {
      const profileResult = await apiRequest("/profile");
      renderStudentDashboard(user, profileResult.data, result.data);
    }
    if (tableBody) renderStudentKardex(result.data);
  } catch (error) {
    showStudentError(error.message, dashboard, tableBody);
  }
}

function renderStudentDashboard(user, profile, enrollments) {
  document.getElementById("student-name").textContent = "Hola, " + user.full_name;
  const avatar = document.getElementById("student-avatar");
  const initials = user.full_name.trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0).toUpperCase(); }).join("") || "ES";
  avatar.replaceChildren();
  if (profile.avatar_url) {
    const image = document.createElement("img");
    image.src = profile.avatar_url;
    image.alt = "Foto de " + user.full_name;
    image.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover";
    avatar.appendChild(image);
  } else avatar.textContent = initials;
  const created = profile.created_at ? "Miembro desde " + displayDate(profile.created_at) : "Cuenta activa";
  document.getElementById("student-member").textContent = created;

  const completed = enrollments.filter(isEnrollmentComplete).length;
  const average = enrollments.length
    ? Math.round(enrollments.reduce((sum, row) => sum + Number(row.progress_percent || 0), 0) / enrollments.length)
    : 0;
  document.getElementById("student-course-count").textContent = String(enrollments.length);
  document.getElementById("student-completed-count").textContent = String(completed);
  document.getElementById("student-average-progress").textContent = average + "%";

  const container = document.getElementById("student-enrollments");
  container.replaceChildren();
  if (!enrollments.length) {
    const empty = document.createElement("div");
    empty.className = "tarjeta";
    const message = document.createElement("p");
    message.textContent = "Tu cuenta todavía no tiene cursos inscritos.";
    const link = document.createElement("a");
    link.className = "btn";
    link.href = "../cursos.html";
    link.textContent = "Explorar cursos";
    empty.append(message, link);
    container.appendChild(empty);
    return;
  }

  enrollments.forEach(function (row) {
    const card = document.createElement("article");
    card.className = "tarjeta";
    const title = document.createElement("h3");
    title.textContent = row.course_title;
    const category = document.createElement("p");
    category.className = "meta";
    category.textContent = row.category;
    const progress = document.createElement("p");
    progress.textContent = "Avance registrado: " + Number(row.progress_percent || 0) + "%";
    const status = document.createElement("p");
    status.className = "meta";
    status.textContent = isEnrollmentComplete(row) ? "Completado" : "En progreso";
    const link = document.createElement("a");
    link.className = "btn";
    link.href = "../curso-detalle.html?id=" + encodeURIComponent(row.course_id);
    link.textContent = "Ver curso";
    card.append(title, category, progress, status, link);
    container.appendChild(card);
  });
}

function renderStudentKardex(rows) {
  const body = document.getElementById("kardex-body");
  const categorySelect = document.getElementById("kardex-category");
  const categories = Array.from(new Set(rows.map(function (row) { return row.category; }))).sort();
  categories.forEach(function (category) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  ["kardex-from", "kardex-to", "kardex-category", "kardex-state", "kardex-active"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", function () { renderKardexRows(rows); });
  });
  renderKardexRows(rows);
}

function renderKardexRows(rows) {
  const body = document.getElementById("kardex-body");
  const from = document.getElementById("kardex-from").value;
  const to = document.getElementById("kardex-to").value;
  const category = document.getElementById("kardex-category").value;
  const state = document.getElementById("kardex-state").value;
  const active = document.getElementById("kardex-active").value;
  const filtered = rows.filter(function (row) {
    const date = String(row.enrolled_at || "").slice(0, 10);
    const complete = isEnrollmentComplete(row);
    return (!from || date >= from) && (!to || date <= to) &&
      (!category || row.category === category) &&
      (!state || (state === "complete" ? complete : !complete)) &&
      (!active || String(Number(row.course_is_active)) === active);
  });
  body.replaceChildren();
  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = rows.length ? "No hay inscripciones que coincidan con los filtros." : "Tu cuenta no tiene inscripciones registradas.";
    row.appendChild(cell);
    body.appendChild(row);
    return;
  }
  filtered.forEach(function (item) {
    const cells = [
      item.course_title,
      item.category,
      displayDate(item.enrolled_at),
      item.last_accessed_at ? displayDate(item.last_accessed_at) : "—",
      item.completed_at ? displayDate(item.completed_at) : "—",
      isEnrollmentComplete(item) ? "Completo" : "Incompleto",
      Number(item.progress_percent || 0) + "%",
      Number(item.course_is_active) ? "Sí" : "No"
    ];
    const row = document.createElement("tr");
    cells.forEach(function (value) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    body.appendChild(row);
  });
}

function isEnrollmentComplete(row) {
  return Boolean(row.completed_at) || Number(row.progress_percent || 0) >= 100;
}

function displayDate(value) {
  const date = String(value || "").slice(0, 10);
  return date && date !== "0000-00-00" ? formatoFecha(date) : "—";
}

function showStudentError(message, dashboard, tableBody) {
  if (dashboard) {
    const notice = document.getElementById("aviso-estudiante");
    notice.className = "alerta alerta-error";
    notice.textContent = message;
    dashboard.replaceChildren();
  }
  if (tableBody) {
    tableBody.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = message;
    row.appendChild(cell);
    tableBody.appendChild(row);
  }
}
