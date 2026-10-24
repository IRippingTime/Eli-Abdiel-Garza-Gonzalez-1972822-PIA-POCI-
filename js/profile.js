document.addEventListener("DOMContentLoaded", async function () {
  if (!document.getElementById("form-perfil")) return;
  try {
    const result = await apiRequest("/profile");
    const profile = result.data;
    renderProfileHeader(profile);
    document.getElementById("nombre").value = profile.full_name || "";

    document.getElementById("email").value = profile.email || "";
    document.getElementById("genero").value = profile.gender || "Otro";
    document.getElementById("nacimiento").value = profile.birth_date || "";
    document.getElementById("avatar_url").value = profile.avatar_url || "";
  } catch (error) {
    mostrarAviso("aviso-perfil", error.message);
  }
});

function renderProfileHeader(profile) {
  const heading = document.getElementById("profile-heading");
  const avatar = document.getElementById("profile-avatar");
  const meta = document.getElementById("profile-meta");
  if (heading) heading.textContent = profile.full_name || "Mi perfil";
  if (avatar) {
    const initials = String(profile.full_name || "?").trim().split(/\s+/).slice(0, 2)
      .map(function (part) { return part.charAt(0).toUpperCase(); }).join("") || "?";
    avatar.replaceChildren();
    if (profile.avatar_url) {
      const image = document.createElement("img");
      image.src = profile.avatar_url;
      image.alt = "Foto de " + (profile.full_name || "usuario");
      image.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover";
      avatar.appendChild(image);
    } else avatar.textContent = initials;
  }
  if (meta) {
    const created = profile.created_at ? formatoFecha(profile.created_at) : "—";
    const updated = profile.updated_at ? formatoFecha(profile.updated_at) : "—";
    meta.textContent = "ID: " + profile.id + " (no editable) · Miembro desde " + created + " · Actualizado " + updated;
  }
}