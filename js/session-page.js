document.addEventListener("DOMContentLoaded", async function () {
  const notice = document.getElementById("session-notice");
  const userLabel = document.getElementById("session-user");
  if (!notice) return;
  try {
    const result = await apiRequest("/auth/me");
    const user = result.data.user;
    const roles = (document.body.dataset.requiredRole || "").split(",").filter(Boolean);
    if (roles.length && !roles.includes(user.role)) {
      throw new Error("Esta sección no corresponde al rol de tu cuenta (" + user.role + ").");
    }
    if (userLabel) userLabel.textContent = user.full_name;
    notice.textContent = "Sesión activa · " + user.role;
    notice.className = "meta";
  } catch (error) {
    notice.className = "alerta alerta-error";
    notice.textContent = error.message;
    if (userLabel) userLabel.textContent = "—";
  }
});
