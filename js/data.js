function formatoMoneda(valor) {
  return "$" + Number(valor).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatoFecha(fechaISO) {
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const d = new Date(fechaISO);
  if (isNaN(d)) return fechaISO;
  return d.getDate() + " " + meses[d.getMonth()] + " " + d.getFullYear();
}
