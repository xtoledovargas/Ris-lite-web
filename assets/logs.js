import { supabase } from "./assets/supabaseClient.js";
import { requireAuthOrRedirect } from "./assets/auth.js";

const $rows = document.getElementById("rows");
const $q = document.getElementById("q");
const $btnBuscar = document.getElementById("btnBuscar");
const $btnLimpiar = document.getElementById("btnLimpiar");
const $btnVolver = document.getElementById("btnVolver");

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function cargarRolesMapa() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("email,rol,activo");

  if (error) return new Map();

  const map = new Map();
  (data || []).forEach(u => {
    if (u?.email && u?.activo !== false) map.set(u.email, u.rol || "");
  });
  return map;
}

async function cargarLogs() {
  $rows.innerHTML = `<tr><td colspan="6">Cargando...</td></tr>`;

  const rolesMap = await cargarRolesMapa();

  const { data, error } = await supabase
    .from("log_sistema")
    .select("created_at,user_email,accion,entidad,entidad_id,detalle")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    $rows.innerHTML = `<tr><td colspan="6">Error: ${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  const term = ($q.value || "").trim().toLowerCase();

  const rows = !term ? (data || []) : (data || []).filter(r => {
    const email = r.user_email ?? "";
    const rol = rolesMap.get(email) ?? "";
    const blob = `${email} ${rol} ${r.accion ?? ""} ${r.entidad ?? ""} ${r.entidad_id ?? ""} ${r.detalle ?? ""}`.toLowerCase();
    return blob.includes(term);
  });

  if (!rows.length) {
    $rows.innerHTML = `<tr><td colspan="6">Sin registros</td></tr>`;
    return;
  }

  $rows.innerHTML = rows.map(r => {
    const email = r.user_email ?? null;
    const rol = email ? (rolesMap.get(email) ?? "") : "";
    const actorTxt = email ? (rol ? `${email} (${rol})` : email) : "—";

    return `
      <tr>
        <td>${escapeHtml(new Date(r.created_at).toLocaleString())}</td>
        <td>${escapeHtml(actorTxt)}</td>
        <td>${escapeHtml(r.accion)}</td>
        <td>${escapeHtml(r.entidad)}</td>
        <td>${escapeHtml(r.entidad_id)}</td>
        <td>${escapeHtml(r.detalle)}</td>
      </tr>
    `;
  }).join("");
}

$btnBuscar?.addEventListener("click", cargarLogs);
$btnLimpiar?.addEventListener("click", () => { $q.value = ""; cargarLogs(); });
$btnVolver?.addEventListener("click", () => window.location.href = "index.html");

// ✅ protege pantalla
await requireAuthOrRedirect();
cargarLogs();
