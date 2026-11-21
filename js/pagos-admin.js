document.addEventListener("DOMContentLoaded", cargarPagosPendientes);
async function cargarPagosPendientes() {
  const body = document.getElementById("pagos-pendientes");
  try {
    const result = await apiRequest("/admin/payments");
    body.replaceChildren();
    if (!result.data.length) { body.appendChild(pagosEmpty("No hay solicitudes pendientes.")); return; }
    result.data.forEach(function (payment) {
      const row = document.createElement("tr");
      [payment.course_title, payment.full_name, new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(payment.amount)), payment.payment_method, payment.created_at].forEach(function (value) { const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell); });
      const action = document.createElement("td"), button = document.createElement("button");
      button.className = "btn btn-mini"; button.textContent = "Confirmar pago verificado";
      button.addEventListener("click", async function () {
        if (!confirm("¿Ya verificaste este pago fuera del sistema? Al confirmar, el estudiante obtendrá acceso.")) return;
        try { const done = await apiRequest("/admin/payments/" + payment.id + "/confirm", { method: "POST" }); mostrarAviso("aviso-pagos", done.message, "ok"); await cargarPagosPendientes(); }
        catch (error) { mostrarAviso("aviso-pagos", error.message); }
      });
      action.appendChild(button); row.appendChild(action); body.appendChild(row);
    });
  } catch (error) { body.replaceChildren(pagosEmpty(error.message)); }
}
function pagosEmpty(message) { const row = document.createElement("tr"), cell = document.createElement("td"); cell.colSpan = 6; cell.textContent = message; row.appendChild(cell); return row; }
