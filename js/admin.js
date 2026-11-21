document.addEventListener("DOMContentLoaded", async function () {
  if (document.getElementById("admin-user-count")) await cargarResumenAdmin();
  const reportType = document.getElementById("tipo-reporte");
  if (reportType) {
    reportType.addEventListener("change", function () {
      document.getElementById("t-instructor").hidden = this.value !== "instructor";
      document.getElementById("t-estudiante").hidden = this.value !== "estudiante";
      cargarReporteUsuarios(this.value);
    });
    await cargarReporteUsuarios(reportType.value);
  }
  const body = document.getElementById("usuarios-body");
  if (body) {
    try {
      const result = await apiRequest("/admin/users");
      body.innerHTML = "";
      if (!result.data.length) {
        body.innerHTML = '<tr><td colspan="7">No hay cuentas registradas.</td></tr>';
      }
      result.data.forEach(function (user) {
        const row = document.createElement("tr");
        const values = [user.id, user.full_name, user.role, user.email, Number(user.is_active) ? "Activa" : "Deshabilitada", user.failed_attempts];
        values.forEach(function (value) {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.appendChild(cell);
        });
        const action = document.createElement("td");
        if (!Number(user.is_active)) {
          const button = document.createElement("button");
          button.className = "btn btn-mini";
          button.textContent = "Reactivar";
          button.addEventListener("click", async function () {
            if (!confirm("¿Reactivar la cuenta de " + user.full_name + "?")) return;
            try {
              const result = await apiRequest("/admin/users/" + user.id + "/unlock", { method: "POST" });
              mostrarAviso("aviso-admin", result.message, "ok");
              window.location.reload();
            } catch (error) { mostrarAviso("aviso-admin", error.message); }
          });
          action.appendChild(button);
        } else {
          action.textContent = "Sin acciones";
        }
        row.appendChild(action);
        body.appendChild(row);
      });
    } catch (error) {
      body.innerHTML = "";
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 7;
      cell.textContent = error.message;
      row.appendChild(cell);
      body.appendChild(row);
    }
  }

  const categoryBody = document.getElementById("categorias-body");
  if (categoryBody) await cargarCategoriasAdmin();

  const form = document.getElementById("form-categoria");
  if (form) form.addEventListener("submit", async function (event) {
    event.preventDefault();
    try {
      const result = await apiRequest("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("categoria-nombre").value.trim(),
          description: document.getElementById("categoria-descripcion").value.trim()
        })
      });
      mostrarAviso("aviso-categorias", result.message, "ok");
      form.reset();
      await cargarCategoriasAdmin();
    } catch (error) { mostrarAviso("aviso-categorias", error.message); }
  });
});

async function cargarCategoriasAdmin() {
  const body = document.getElementById("categorias-body");
  try {
    const result = await apiRequest("/categories");
    body.innerHTML = "";
      if (!result.data.length) body.innerHTML = '<tr><td colspan="6">No hay categorías.</td></tr>';
    result.data.forEach(function (category) {
      const row = document.createElement("tr");
      [category.id, category.name, category.description || "—", category.created_by_name || "Sistema", category.created_at].forEach(function (value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      const actions = document.createElement("td");
      const edit = document.createElement("button");
      edit.className = "btn btn-mini";
      edit.textContent = "Editar";
      edit.addEventListener("click", async function () {
        const name = prompt("Nombre de la categoría", category.name);
        if (name === null) return;
        const description = prompt("Descripción", category.description || "");
        if (description === null) return;
        try {
          const updated = await apiRequest("/categories/" + category.id, { method: "PUT", body: JSON.stringify({ name: name.trim(), description: description.trim() }) });
          mostrarAviso("aviso-categorias", updated.message, "ok");
          await cargarCategoriasAdmin();
        } catch (error) { mostrarAviso("aviso-categorias", error.message); }
      });
      const remove = document.createElement("button");
      remove.className = "btn btn-mini btn-secundario";
      remove.textContent = "Eliminar";
      remove.addEventListener("click", async function () {
        if (!confirm("¿Eliminar la categoría «" + category.name + "»? No se puede eliminar si tiene cursos asociados.")) return;
        try {
          const deleted = await apiRequest("/categories/" + category.id, { method: "DELETE" });
          mostrarAviso("aviso-categorias", deleted.message, "ok");
          await cargarCategoriasAdmin();
        } catch (error) { mostrarAviso("aviso-categorias", error.message); }
      });
      actions.append(edit, remove);
      row.appendChild(actions);
      body.appendChild(row);
    });
  } catch (error) {
    body.innerHTML = "";
    const row = document.createElement("tr"), cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = error.message;
    row.appendChild(cell);
    body.appendChild(row);
  }
}

async function cargarResumenAdmin() {
  const usersCount = document.getElementById("admin-user-count");
  const categoriesCount = document.getElementById("admin-category-count");
  try {
    const results = await Promise.all([apiRequest("/admin/users"), apiRequest("/categories"), apiRequest("/auth/me")]);
    usersCount.textContent = String(results[0].data.length);
    categoriesCount.textContent = String(results[1].data.length);
    const adminName = document.getElementById("admin-name");
    if (adminName) adminName.textContent = "Hola, " + results[2].data.user.full_name;
  } catch (error) {
    usersCount.textContent = "—";
    categoriesCount.textContent = "—";
    const card = usersCount.closest(".stat-cards");
    if (card) {
      const notice = document.createElement("p");
      notice.className = "alerta alerta-error";
      notice.textContent = error.message;
      card.insertAdjacentElement("afterend", notice);
    }
  }
}

async function cargarReporteUsuarios(role) {
  const body = document.getElementById(role === "instructor" ? "reporte-instructores" : "reporte-estudiantes");
  if (!body) return;
  try {
    const result = await apiRequest("/admin/reports/users?role=" + encodeURIComponent(role));
    body.replaceChildren();
    if (!result.data.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = role === "instructor" ? 5 : 6;
      cell.textContent = "No hay cuentas activas de este tipo.";
      row.appendChild(cell);
      body.appendChild(row);
      return;
    }
    result.data.forEach(function (user) {
      const cells = role === "instructor"
        ? [user.email, user.full_name, reportDate(user.created_at), String(user.course_count), reportMoney(user.revenue)]
        : [user.email, user.full_name, reportDate(user.created_at), String(user.enrollment_count), String(user.completed_count), Number(user.completion_percent || 0).toFixed(1) + "%"];
      const row = document.createElement("tr");
      cells.forEach(function (value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  } catch (error) {
    body.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = role === "instructor" ? 5 : 6;
    cell.textContent = error.message;
    row.appendChild(cell);
    body.appendChild(row);
  }
}

function reportDate(value) {
  if (!value) return "—";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(date).replace(" de ", " ");
}
function reportMoney(value) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0)); }
