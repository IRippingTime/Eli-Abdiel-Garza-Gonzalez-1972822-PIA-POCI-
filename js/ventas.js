document.addEventListener("DOMContentLoaded", function () {
  const category = document.getElementById("sales-category");
  const refresh = document.getElementById("sales-refresh");
  if (!category || !refresh) return;
  apiRequest("/categories").then(function (result) {
    result.data.forEach(function (item) { category.add(new Option(item.name, item.id)); });
  }).catch(function (error) { mostrarAviso("aviso-ventas", error.message); });
  refresh.addEventListener("click", cargarVentas);
  cargarVentas();
});

async function cargarVentas() {
  const params = new URLSearchParams();
  const values = { from: "sales-from", to: "sales-to", category: "sales-category", active: "sales-active" };
  Object.entries(values).forEach(function (entry) {
    const value = document.getElementById(entry[1]).value;
    if (value) params.set(entry[0], value);
  });
  const query = params.toString();
  try {
    const [summary, detail] = await Promise.all([
      apiRequest("/instructor/sales?view=summary" + (query ? "&" + query : "")),
      apiRequest("/instructor/sales?view=detail" + (query ? "&" + query : ""))
    ]);
    drawSalesSummary(summary.data);
    drawSalesDetail(detail.data);
    mostrarAviso("aviso-ventas", "Reporte actualizado.", "ok");
  } catch (error) {
    document.getElementById("sales-summary").replaceChildren(salesEmpty(error.message, 6));
    document.getElementById("sales-detail").replaceChildren(salesEmpty(error.message, 6));
    mostrarAviso("aviso-ventas", error.message);
  }
}

function drawSalesSummary(rows) {
  const body = document.getElementById("sales-summary");
  body.replaceChildren();
  let total = 0, transferTotal = 0, cardTotal = 0;
  if (!rows.length) body.appendChild(salesEmpty("Todavía no hay pagos confirmados.", 6));
  rows.forEach(function (item) {
    total += Number(item.revenue || 0);
    transferTotal += Number(item.transfer_income || 0);
    cardTotal += Number(item.card_income || 0);
    const row = document.createElement("tr");
    [item.course_title, item.student_count, Number(item.average_progress || 0).toFixed(1) + "%", money(item.revenue), money(item.transfer_income), money(item.card_income)].forEach(function (value) {
      const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell);
    });
    body.appendChild(row);
  });
  document.getElementById("sales-total").textContent = "Ingresos totales: " + money(total) + " · Transferencia: " + money(transferTotal) + " · Tarjeta: " + money(cardTotal);
}

function drawSalesDetail(rows) {
  const body = document.getElementById("sales-detail");
  body.replaceChildren();
  if (!rows.length) body.appendChild(salesEmpty("No hay alumnos con pagos confirmados.", 6));
  rows.forEach(function (item) {
    const row = document.createElement("tr");
    [item.course_title, item.student_name, shortDate(item.enrolled_at), Number(item.progress_percent || 0) + "%", money(item.amount), item.payment_method === "tarjeta" ? "Tarjeta" : "Transferencia"].forEach(function (value) {
      const cell = document.createElement("td"); cell.textContent = value; row.appendChild(cell);
    });
    body.appendChild(row);
  });
}

function salesEmpty(message, columns) {
  const row = document.createElement("tr"), cell = document.createElement("td");
  cell.colSpan = columns; cell.textContent = message; row.appendChild(cell); return row;
}
function money(value) { return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(value || 0)); }
function shortDate(value) {
  if (!value) return "—";
  const date = new Date(String(value).replace(" ", "T"));
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(date).replace(" de ", " ");
}
