import { requireAuthOrRedirect, getLocalSession, signOut } from "./auth.js";

/** Muestra/oculta un elemento por id */
function show(id, visible) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = visible ? "" : "none";
}

/** Normaliza texto (mayúsculas + sin tildes) */
function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // saca tildes (MÉDICO -> MEDICO)
}

(async () => {
  // 1) Asegura autenticación
  const session = await requireAuthOrRedirect();

  // 2) Si por alguna razón no vuelve session, intenta localStorage
  const local = getLocalSession() || {};
  const email = session?.email || local.email || "";
  const rolRaw = session?.rol || local.rol || "";

  const R = normalizeRole(rolRaw);

  // 3) Roles admitidos (flexible con nombres)
  const isAdmin =
    R === "ADMIN" ||
    R === "ADMINISTRADOR" ||
    R === "ADMINISTRACION";

  const isTM =
    R === "TM" ||
    R === "TECNOLOGO" ||
    R === "TECNOLOGO MEDICO" ||
    R === "TECNOLOGO MEDICO(A)" ||
    R === "TECNICO";

  const isMedico =
    R === "MEDICO" ||
    R === "MEDICO SOLICITANTE" ||
    R === "DOCTOR";

  // 4) Pintar cabecera sesión
  const lbl = document.getElementById("lblSession");
  if (lbl) {
    const rolLabel = rolRaw || "SIN ROL";
    lbl.textContent = `Conectado: ${email} (${rolLabel})`;
  }

  // 5) Logout
  const btnOut = document.getElementById("btnLogout");
  if (btnOut) btnOut.addEventListener("click", signOut);

  // 6) Reglas de visibilidad (ADMIN ve TODO)
  show("mPacientes", isAdmin || isTM);
  show("mMedicos", isAdmin);
  show("mTipoExamen", isAdmin);
  show("mOrdenes", isAdmin || isTM);
  show("mCrearOrden", isAdmin || isMedico);
  show("mLogs", isAdmin || isTM);

  // 7) Debug rápido (podés borrarlo después)
  console.log("[INDEX] email:", email);
  console.log("[INDEX] rolRaw:", rolRaw);
  console.log("[INDEX] R(normalized):", R);
  console.log("[INDEX] isAdmin/isTM/isMedico:", isAdmin, isTM, isMedico);
})();
