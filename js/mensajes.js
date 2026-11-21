document.addEventListener("DOMContentLoaded", async function () {
  const contactsPane = document.getElementById("contactos-mensaje");
  try { const me = await apiRequest("/auth/me"); usuarioMensajeId = Number(me.data.user.id); } catch (_) {}
  const form = document.getElementById("form-mensaje");
  const textarea = document.getElementById("mensaje-cuerpo");
  const sendButton = form.querySelector("button[type=submit]");
  if (!contactsPane || !form) return;

  try {
    const result = await apiRequest("/messages/contacts");
    contactosMensajes = result.data || [];
    contactsPane.replaceChildren();
    if (!contactosMensajes.length) {
      contactsPane.innerHTML = '<div class="chat-vacio contactos-sin"><strong>Aún no hay contactos</strong><p>Cuando compartas un curso con alguien, aparecerá aquí.</p></div>';
      return;
    }
    contactosMensajes.forEach(function (contact) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "conv";
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", "false");
      button.dataset.contactId = String(contact.id);
      button.appendChild(crearAvatar(contact.full_name, contact.avatar_url));
      const details = document.createElement("span");
      details.className = "conv-texto";
      const name = document.createElement("strong");
      name.textContent = contact.full_name || "Contacto";
      const subtitle = document.createElement("span");
      subtitle.textContent = "Contacto de tus cursos";
      details.append(name, subtitle);
      button.appendChild(details);
      button.addEventListener("click", function () { seleccionarContacto(contact); });
      contactsPane.appendChild(button);
    });
  } catch (error) {
    mostrarAviso("aviso-mensajes", error.message);
    contactsPane.innerHTML = '<p class="contactos-cargando">No se pudieron cargar los contactos.</p>';
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!contactoActivo) return;
    const body = textarea.value.trim();
    if (!body) return;
    sendButton.disabled = true;
    try {
      const sent = await apiRequest("/messages", { method: "POST", body: JSON.stringify({ recipient_id: Number(contactoActivo.id), body: body }) });
      textarea.value = "";
      mostrarAviso("aviso-mensajes", sent.message || "Mensaje enviado.", "ok");
      await cargarConversacion();
    } catch (error) {
      mostrarAviso("aviso-mensajes", error.message);
    } finally {
      sendButton.disabled = false;
      textarea.focus();
    }
  });

  textarea.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
  });
});

let contactosMensajes = [];
let contactoActivo = null;
let usuarioMensajeId = null;

function seleccionarContacto(contact) {
  contactoActivo = contact;
  document.querySelectorAll(".conv").forEach(function (button) {
    const active = button.dataset.contactId === String(contact.id);
    button.classList.toggle("activo", active);
    button.setAttribute("aria-selected", String(active));
  });
  const header = document.getElementById("conversacion-header");
  header.classList.remove("hilo-vacio");
  header.replaceChildren();
  header.appendChild(crearAvatar(contact.full_name, contact.avatar_url));
  const info = document.createElement("div");
  const name = document.createElement("h2");
  name.id = "contacto-nombre";
  name.textContent = contact.full_name || "Contacto";
  const state = document.createElement("p");
  state.id = "contacto-estado";
  state.textContent = "Disponible para conversar";
  info.append(name, state);
  header.appendChild(info);
  document.getElementById("mensaje-cuerpo").disabled = false;
  document.querySelector(".chat-enviar").disabled = false;
  cargarConversacion();
}

async function cargarConversacion() {
  const pane = document.getElementById("conversacion");
  if (!contactoActivo) return;
  pane.innerHTML = '<div class="chat-vacio"><span aria-hidden="true">◌</span><strong>Cargando conversación…</strong></div>';
  try {
    const result = await apiRequest("/messages?with=" + encodeURIComponent(contactoActivo.id));
    pane.replaceChildren();
    const messages = result.data || [];
    if (!messages.length) {
      pane.innerHTML = '<div class="chat-vacio"><span aria-hidden="true">✧</span><strong>Inicia la conversación</strong><p>Envía el primer mensaje a ' + escaparHtml(contactoActivo.full_name || "tu contacto") + '.</p></div>';
      return;
    }
    messages.forEach(function (message) {
      const own = usuarioMensajeId !== null && Number(message.sender_id) === usuarioMensajeId;
      const item = document.createElement("article");
      item.className = "msg " + (own ? "msg-propio" : "msg-otro");
      const heading = document.createElement("div");
      heading.className = "mensaje-header";
      const author = document.createElement("strong");
      author.textContent = message.full_name || "Usuario";
      const date = document.createElement("time");
      date.className = "fecha-hora";
      date.textContent = formatearFecha(message.created_at);
      heading.append(author, date);
      const body = document.createElement("p");
      body.textContent = message.body || "";
      item.append(heading, body);
      pane.appendChild(item);
    });
    pane.scrollTop = pane.scrollHeight;
  } catch (error) {
    pane.textContent = error.message;
  }
}

function crearAvatar(name, url) {
  if (url) {
    const img = document.createElement("img");
    img.className = "avatar-contacto";
    img.src = url;
    img.alt = "Foto de " + (name || "contacto");
    img.loading = "lazy";
    img.onerror = function () { const fallback = document.createElement("span"); fallback.className = "avatar-contacto avatar-iniciales"; fallback.textContent = iniciales(name); img.replaceWith(fallback); };
    return img;
  }
  const avatar = document.createElement("span");
  avatar.className = "avatar-contacto avatar-iniciales";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = iniciales(name);
  return avatar;
}
function iniciales(name) { return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join("").toUpperCase(); }
function formatearFecha(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" }); }
function escaparHtml(value) { const element = document.createElement("span"); element.textContent = value; return element.innerHTML; }


