/* Validaciones del navegador; toda regla crítica también se verifica en PHP. */
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mostrarError(id, mensaje) {
  const el = document.getElementById(id);
  if (el) el.textContent = mensaje || "";
}
function validarPassword(valor) {
  if (!valor) return "La contraseña es obligatoria.";
  if (!PASSWORD_REGEX.test(valor)) return "Usa al menos 8 caracteres, una mayúscula, un número y un símbolo.";
  return "";
}
function valor(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

async function validarLogin(event) {
  event.preventDefault();
  const email = valor("email");
  const password = document.getElementById("password").value;
  let ok = true;
  if (!EMAIL_REGEX.test(email)) { mostrarError("err-email", "Escribe un correo válido."); ok = false; }
  else mostrarError("err-email", "");
  if (!password) { mostrarError("err-password", "La contraseña es obligatoria."); ok = false; }
  else mostrarError("err-password", "");
  if (!ok) { mostrarAviso("aviso-login", "Revisa los campos marcados."); return false; }

  const button = event.submitter;
  if (button) button.disabled = true;
  try {
    const result = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    const verifiedSession = await apiRequest("/auth/me");
    const user = verifiedSession.data.user;
    localStorage.setItem("educursos_user", JSON.stringify(user));
    mostrarAviso("aviso-login", "Sesión iniciada. Abriendo tu panel…", "ok");
    const destinations = { estudiante: "estudiante/dashboard.html", instructor: "instructor/dashboard.html", administrador: "admin/dashboard.html" };
    setTimeout(() => { window.location.href = destinations[user.role] || "index.html"; }, 350);
  } catch (error) {
    mostrarAviso("aviso-login", error.message);
  } finally {
    if (button) button.disabled = false;
  }
  return false;
}

async function validarRegistro(event) {
  event.preventDefault();
  const data = {
    full_name: valor("nombre"),
    gender: valor("genero"),
    birth_date: valor("nacimiento"),
    email: valor("email"),
    password: document.getElementById("password").value,
    role: valor("rol")
  };
  const password2 = document.getElementById("password2").value;
  let ok = true;
  if (data.full_name.length < 3) { mostrarError("err-nombre", "Escribe tu nombre completo."); ok = false; } else mostrarError("err-nombre", "");
  if (!data.gender) { mostrarError("err-genero", "Selecciona tu género."); ok = false; } else mostrarError("err-genero", "");
  if (!data.birth_date) { mostrarError("err-nacimiento", "Selecciona tu fecha de nacimiento."); ok = false; } else mostrarError("err-nacimiento", "");
  if (!EMAIL_REGEX.test(data.email)) { mostrarError("err-email", "Escribe un correo válido."); ok = false; } else mostrarError("err-email", "");
  const passError = validarPassword(data.password);
  mostrarError("err-password", passError);
  if (passError) ok = false;
  if (password2 !== data.password) { mostrarError("err-password2", "Las contraseñas no coinciden."); ok = false; } else mostrarError("err-password2", "");
  if (!data.role) { mostrarError("err-rol", "Selecciona un rol."); ok = false; } else mostrarError("err-rol", "");
  if (!ok) { mostrarAviso("aviso-registro", "Corrige los campos marcados."); return false; }

  try {
    const result = await apiRequest("/auth/register", { method: "POST", body: JSON.stringify(data) });
    mostrarAviso("aviso-registro", result.message + " Ya puedes iniciar sesión.", "ok");
    document.getElementById("form-registro").reset();
  } catch (error) {
    mostrarAviso("aviso-registro", error.message);
  }
  return false;
}

async function validarPerfil(event) {
  event.preventDefault();
  const data = {
    full_name: valor("nombre"),
    gender: valor("genero"),
    birth_date: valor("nacimiento"),
    avatar_url: valor("avatar_url")
  };
  if (data.full_name.length < 3 || !data.gender || !data.birth_date) {
    mostrarAviso("aviso-perfil", "Completa nombre, género y fecha de nacimiento.");
    return false;
  }
  try {
    const file = document.getElementById("avatar_file")?.files?.[0];
    if (file) data.avatar_url = await subirImagen(file);
    const result = await apiRequest("/profile", { method: "PUT", body: JSON.stringify(data) });
    const refreshedProfile = await apiRequest("/profile");
    if (typeof renderProfileHeader === "function") renderProfileHeader(refreshedProfile.data);
    document.getElementById("nombre").value = refreshedProfile.data.full_name || "";
    document.getElementById("email").value = refreshedProfile.data.email || "";
    document.getElementById("genero").value = refreshedProfile.data.gender || "";
    document.getElementById("nacimiento").value = refreshedProfile.data.birth_date || "";
    document.getElementById("avatar_url").value = refreshedProfile.data.avatar_url || "";
    mostrarAviso("aviso-perfil", result.message, "ok");
  } catch (error) {
    mostrarAviso("aviso-perfil", error.message);
  }
  return false;
}

function actualizarCamposNivel() {
  const container = document.getElementById("video-niveles");
  const count = Math.min(20, Math.max(1, Number(valor("niveles")) || 1));
  if (!container) return;
  container.innerHTML = "";
  for (let i = 1; i <= count; i++) {
    const section = document.createElement("div");
    section.className = "tarjeta";
    section.innerHTML = '<h3>Nivel ' + i + '</h3>' +
      '<label for="nivel-titulo-' + i + '">Título</label><input id="nivel-titulo-' + i + '" required value="Nivel ' + i + '">' +
      '<label for="nivel-video-' + i + '">URL HTTPS del video</label><input id="nivel-video-' + i + '" type="url" required placeholder="https://...">' +
      '<label for="nivel-desc-' + i + '">Descripción del nivel</label><textarea id="nivel-desc-' + i + '" rows="2"></textarea>';
    container.appendChild(section);
  }
}

async function validarCurso(event) {
  event.preventDefault();
  const title = valor("titulo"), description = valor("descripcion");
  const categoryId = Number(valor("categoria")), price = Number(valor("precio"));
  const count = Math.min(20, Math.max(1, Number(valor("niveles")) || 1));
  let ok = true;
  if (title.length < 5) { mostrarError("err-titulo", "Título mínimo de 5 caracteres."); ok = false; } else mostrarError("err-titulo", "");
  if (!categoryId) { mostrarError("err-categoria", "Selecciona una categoría."); ok = false; } else mostrarError("err-categoria", "");
  if (!Number.isFinite(price) || price < 0) { mostrarError("err-precio", "Indica un precio válido."); ok = false; } else mostrarError("err-precio", "");
  if (description.length < 20) { mostrarError("err-descripcion", "Descripción mínima de 20 caracteres."); ok = false; } else mostrarError("err-descripcion", "");
  const levels = [];
  for (let i = 1; i <= count; i++) {
    const levelTitle = valor("nivel-titulo-" + i);
    const videoUrl = valor("nivel-video-" + i);
    if (!levelTitle || !/^https:\/\//i.test(videoUrl)) ok = false;
    levels.push({ title: levelTitle, description: valor("nivel-desc-" + i), video_url: videoUrl });
  }
  if (!ok) { mostrarAviso("aviso-curso", "Revisa los campos. Cada nivel requiere una URL HTTPS de video."); return false; }

  const button = event.submitter;
  if (button) button.disabled = true;
  try {
    const file = document.getElementById("imagen")?.files?.[0];
    let imageUrl = "";
    if (file) imageUrl = await subirImagen(file);
    const result = await apiRequest("/courses", {
      method: "POST",
      body: JSON.stringify({ title, description, category_id: categoryId, price, levels, image_url: imageUrl || null })
    });
    mostrarAviso("aviso-curso", "Curso guardado en MySQL. Folio: " + result.data.id, "ok");
    document.getElementById("form-curso").reset();
    actualizarCamposNivel();
  } catch (error) {
    mostrarAviso("aviso-curso", error.message);
  } finally {
    if (button) button.disabled = false;
  }
  return false;
}
document.addEventListener("DOMContentLoaded", actualizarCamposNivel);
