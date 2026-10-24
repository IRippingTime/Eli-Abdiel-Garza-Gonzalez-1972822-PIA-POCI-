/* Cliente de la API EduCursos. Las credenciales y la sesión permanecen en el servidor. */
const API_BASE = "/api/v1";

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  let response;
  try {
    response = await fetch(API_BASE + path, {
      ...options,
      headers,
      credentials: "same-origin"
    });
  } catch (_) {
    throw new Error("No se pudo conectar con el servidor. Revisa que PHP esté iniciado.");
  }
  const payload = await response.json().catch(() => ({ ok: false, error: "El servidor devolvió una respuesta no válida." }));
  if (!response.ok || payload.ok === false) throw new Error(payload.error || "La solicitud no pudo completarse.");
  return payload;
}

async function subirImagen(file) {
  const form = new FormData();
  form.append("image", file);
  const result = await apiRequest("/uploads/image", { method: "POST", body: form });
  return result.data.secure_url;
}

function mostrarAviso(id, mensaje, tipo = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = "alerta " + (tipo === "ok" ? "alerta-ok" : tipo === "info" ? "alerta-info" : "alerta-error");
  el.textContent = mensaje;
}
