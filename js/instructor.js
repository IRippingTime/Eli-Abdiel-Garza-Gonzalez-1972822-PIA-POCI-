document.addEventListener("DOMContentLoaded", cargarPanelInstructor);

async function cargarPanelInstructor() {
  const body = document.getElementById("instructor-courses-body");
  const count = document.getElementById("instructor-course-total");
  try {
    const session = await apiRequest("/auth/me");
    const user = session.data.user;
    if (user.role !== "instructor") {
      throw new Error("Esta pantalla es exclusiva para cuentas de instructor.");
    }
    document.getElementById("saludo-instructor").textContent = "Hola, " + user.full_name;
    const initials = user.full_name.trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0).toUpperCase(); }).join("");
    const avatar = document.getElementById("avatar-instructor");
    avatar.replaceChildren();
    if (user.avatar_url) {
      const image = document.createElement("img");
      image.src = user.avatar_url;
      image.alt = "Foto de " + user.full_name;
      image.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover";
      avatar.appendChild(image);
    } else avatar.textContent = initials || "IN";

    const result = await apiRequest("/instructor/courses");
    count.textContent = result.total;
    body.replaceChildren();
    if (!result.data.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.textContent = "Todavía no has publicado cursos. Usa «Crear curso» para agregar el primero.";
      row.appendChild(cell);
      body.appendChild(row);
      return;
    }
    result.data.forEach(function (course) {
      const row = document.createElement("tr");
      const values = [
        course.title,
        course.category,
        String(course.level_count),
        Number(course.price) === 0 ? "Gratis" : formatoMoneda(course.price) + " MXN",
        Number(course.is_active) ? "Activo" : "Inactivo"
      ];
      values.forEach(function (value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      const action = document.createElement("td");
      const link = document.createElement("a");
      link.href = "../curso-detalle.html?id=" + encodeURIComponent(course.id);
      link.textContent = "Ver curso";
      action.appendChild(link);
      row.appendChild(action);
      body.appendChild(row);
    });
  } catch (error) {
    count.textContent = "—";
    body.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = error.message;
    row.appendChild(cell);
    body.appendChild(row);
    const notice = document.getElementById("aviso-instructor");
    notice.className = "alerta alerta-error";
    if (error.message.includes("Inicia sesión")) {
      const login = document.createElement("a");
      login.href = "../login.html";
      login.textContent = " Iniciar sesión";
      notice.textContent = "La sesión no está activa.";
      notice.appendChild(login);
    } else {
      notice.textContent = error.message;
    }
  }
}
