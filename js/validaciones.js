/* Validaciones del lado del cliente - Primer Avance
   Regla de contrasena: minimo 8 caracteres, una mayuscula, un numero y un caracter especial.
   Caracter especial = simbolo que no sea letra ni numero.
*/

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function mostrarError(id, mensaje) {
  const el = document.getElementById(id);
  if (el) el.textContent = mensaje || "";
}

function validarPassword(valor) {
  if (!valor) return "La contrasena es obligatoria.";
  if (valor.length < 8) return "Minimo 8 caracteres.";
  if (!/[A-Z]/.test(valor)) return "Debe incluir al menos una mayuscula.";
  if (!/\d/.test(valor)) return "Debe incluir al menos un numero.";
  if (!/[^A-Za-z0-9]/.test(valor)) return "Debe incluir al menos un caracter especial.";
  return "";
}

function validarLogin(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;
  let ok = true;

  if (!email) { mostrarError("err-email", "El correo es obligatorio."); ok = false; }
  else if (!EMAIL_REGEX.test(email)) { mostrarError("err-email", "Formato de correo no valido."); ok = false; }
  else mostrarError("err-email", "");

  if (!pass) { mostrarError("err-password", "La contrasena es obligatoria."); ok = false; }
  else mostrarError("err-password", "");

  const aviso = document.getElementById("aviso-login");
  if (!ok) {
    if (aviso) { aviso.className = "alerta alerta-error"; aviso.textContent = "Revisa los campos marcados."; }
    return false;
  }
  // Prototipo: simula bloqueo tras 3 intentos (contador en localStorage)
  let intentos = parseInt(localStorage.getItem("intentos_login") || "0", 10);
  if (pass !== "Demo*123") {
    intentos += 1;
    localStorage.setItem("intentos_login", String(intentos));
    if (aviso) {
      aviso.className = "alerta alerta-error";
      aviso.textContent = intentos >= 3
        ? "Cuenta deshabilitada por 3 intentos fallidos consecutivos. Contacta al administrador."
        : "Credenciales incorrectas. Intento " + intentos + " de 3. (Demo usa: Demo*123)";
    }
    return false;
  }
  localStorage.setItem("intentos_login", "0");
  const rol = document.getElementById("rol").value;
  localStorage.setItem("rol_demo", rol);
  if (aviso) { aviso.className = "alerta alerta-ok"; aviso.textContent = "Acceso correcto. Redirigiendo como " + rol + "..."; }
  setTimeout(function () {
    if (rol === "estudiante") window.location.href = "estudiante/dashboard.html";
    else if (rol === "instructor") window.location.href = "instructor/dashboard.html";
    else window.location.href = "admin/dashboard.html";
  }, 800);
  return false;
}

function validarRegistro(event) {
  event.preventDefault();
  let ok = true;

  const nombre = document.getElementById("nombre").value.trim();
  const genero = document.getElementById("genero").value;
  const nacimiento = document.getElementById("nacimiento").value;
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value;
  const pass2 = document.getElementById("password2").value;
  const rol = document.getElementById("rol").value;

  if (!nombre) { mostrarError("err-nombre", "El nombre completo es obligatorio."); ok = false; }
  else mostrarError("err-nombre", "");

  if (!genero) { mostrarError("err-genero", "Selecciona el genero."); ok = false; }
  else mostrarError("err-genero", "");

  if (!nacimiento) { mostrarError("err-nacimiento", "La fecha de nacimiento es obligatoria."); ok = false; }
  else mostrarError("err-nacimiento", "");

  if (!email) { mostrarError("err-email", "El correo es obligatorio."); ok = false; }
  else if (!EMAIL_REGEX.test(email)) { mostrarError("err-email", "Formato de correo no valido."); ok = false; }
  else mostrarError("err-email", "");

  const errPass = validarPassword(pass);
  mostrarError("err-password", errPass);
  if (errPass) ok = false;

  if (pass !== pass2) { mostrarError("err-password2", "Las contrasenas no coinciden."); ok = false; }
  else mostrarError("err-password2", "");

  if (!rol) { mostrarError("err-rol", "Selecciona un rol."); ok = false; }
  else mostrarError("err-rol", "");

  const aviso = document.getElementById("aviso-registro");
  if (!ok) {
    if (aviso) { aviso.className = "alerta alerta-error"; aviso.textContent = "Corrige los errores del formulario."; }
    return false;
  }
  if (aviso) { aviso.className = "alerta alerta-ok"; aviso.textContent = "Registro valido. Cuenta creada como " + rol + ". Ya puedes iniciar sesion."; }
  document.getElementById("form-registro").reset();
  return false;
}

function validarPerfil(event) {
  event.preventDefault();
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  let ok = true;
  if (!nombre) { mostrarError("err-nombre", "El nombre es obligatorio."); ok = false; }
  else mostrarError("err-nombre", "");
  if (!EMAIL_REGEX.test(email)) { mostrarError("err-email", "Correo no valido."); ok = false; }
  else mostrarError("err-email", "");
  const aviso = document.getElementById("aviso-perfil");
  if (!ok) { if (aviso) { aviso.className = "alerta alerta-error"; aviso.textContent = "Revisa los campos."; } return false; }
  if (aviso) { aviso.className = "alerta alerta-ok"; aviso.textContent = "Perfil actualizado correctamente."; }
  return false;
}

function validarCurso(event) {
  event.preventDefault();
  let ok = true;
  const titulo = document.getElementById("titulo").value.trim();
  const categoria = document.getElementById("categoria").value;
  const precio = document.getElementById("precio").value;
  const niveles = document.getElementById("niveles").value;
  const descripcion = document.getElementById("descripcion").value.trim();

  if (titulo.length < 5) { mostrarError("err-titulo", "Titulo minimo de 5 caracteres."); ok = false; }
  else mostrarError("err-titulo", "");
  if (!categoria) { mostrarError("err-categoria", "Selecciona una categoria."); ok = false; }
  else mostrarError("err-categoria", "");
  if (precio === "" || isNaN(precio) || Number(precio) < 0) { mostrarError("err-precio", "Precio no valido. Usa 0 para gratis."); ok = false; }
  else mostrarError("err-precio", "");
  if (!niveles || Number(niveles) < 1) { mostrarError("err-niveles", "Minimo 1 nivel."); ok = false; }
  else mostrarError("err-niveles", "");
  if (descripcion.length < 20) { mostrarError("err-descripcion", "Descripcion minima de 20 caracteres."); ok = false; }
  else mostrarError("err-descripcion", "");

  const campoImagen = document.getElementById("imagen");
  const archivo = campoImagen && campoImagen.files ? campoImagen.files[0] : null;
  if (!archivo) { mostrarError("err-imagen", "Selecciona una imagen del curso desde tu computadora."); ok = false; }
  else if (!archivo.type.startsWith("image/")) { mostrarError("err-imagen", "El archivo debe ser una imagen (JPG, PNG o SVG)."); ok = false; }
  else mostrarError("err-imagen", "");

  const aviso = document.getElementById("aviso-curso");
  if (!ok) { if (aviso) { aviso.className = "alerta alerta-error"; aviso.textContent = "Corrige los errores."; } return false; }
  if (aviso) { aviso.className = "alerta alerta-ok"; aviso.textContent = "Curso validado y guardado (prototipo). Cada nivel debera incluir un video obligatorio."; }
  return false;
}

function confirmarEliminacion(mensaje) {
  return confirm(mensaje || "Deseas eliminar este registro? Esta accion requiere confirmacion.");
}
