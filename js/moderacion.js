document.addEventListener("DOMContentLoaded", cargarComentariosAdmin);
async function cargarComentariosAdmin() {
  const body = document.getElementById("moderacion-comentarios");
  try {
    const result = await apiRequest("/admin/reviews");
    body.replaceChildren();
    const rows = result.data.filter(function (review) { return !review.deleted_at; });
    if (!rows.length) { body.appendChild(moderacionEmpty("No hay comentarios activos.")); return; }
    rows.forEach(function (review) {
      const row = document.createElement("tr");
      [review.course_title, review.full_name, review.rating + "/5", review.comment, review.created_at].forEach(function (value) { const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell); });
      const action = document.createElement("td"), button = document.createElement("button");
      button.className = "btn btn-mini btn-secundario"; button.textContent = "Eliminar";
      button.addEventListener("click", async function () {
        if (!confirm("¿Eliminar este comentario? Se conservará la calificación y se mostrará la leyenda de moderación.")) return;
        const reason = prompt("Causa de eliminación (requerida):");
        if (reason === null || reason.trim().length < 3) return mostrarAviso("aviso-comentarios", "Escribe una causa de al menos 3 caracteres.");
        try { const response = await apiRequest("/admin/reviews/" + review.id, { method: "DELETE", body: JSON.stringify({ reason: reason.trim() }) }); mostrarAviso("aviso-comentarios", response.message, "ok"); await cargarComentariosAdmin(); }
        catch (error) { mostrarAviso("aviso-comentarios", error.message); }
      });
      action.appendChild(button); row.appendChild(action); body.appendChild(row);
    });
  } catch (error) { body.replaceChildren(moderacionEmpty(error.message)); }
}
function moderacionEmpty(message) { const row = document.createElement("tr"), cell = document.createElement("td"); cell.colSpan = 6; cell.textContent = message; row.appendChild(cell); return row; }
