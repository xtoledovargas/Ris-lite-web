import { supabase } from "./supabaseClient.js";
import { requireAuthOrRedirect, signOut, getLocalSession } from "./auth.js";

const tbody = document.getElementById("tbody");
const btnNueva = document.getElementById("btnNueva");
const btnVolver = document.getElementById("btnVolver");
const btnLogout = document.getElementById("btnLogout");
const lblSession = document.getElementById("lblSession");

btnNueva.addEventListener("click", () => {
  // Importante: from=medico para que en orden_form vuelva acá
  window.location.href = "orden_form.html?from=medico";
});

btnVolver.addEventListener("click", () => {
  window.location.href = "index.html";
});

btnLogout.addEventListener("click", signOut);

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}

async function load() {
  tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`;

  // 1) Asegura sesión
  const session = await requireAuthOrRedirect();
  if (!session) return;

  // (solo UI)
  const ls = session || getLocalSession() || {};
  if (lblSession) lblSession.textContent = `Conectado: ${ls.email ?? ""} (${ls.rol ?? ""})`;

  // 2) Obtiene UID del usuario logueado (auth)
  const { data: uData, error: uErr } = await supabase.auth.getUser();
  if (uErr || !uData?.user?.id) {
    tbody.innerHTML = `<tr><td colspan="7">Sesión inválida. Vuelve a iniciar sesión.</td></tr>`;
    return;
  }
  const uid = uData.user.id;

  // 3) Carga SOLO órdenes creadas por este usuario (created_by)
  const { data, error } = await supabase
    .from("orden_radiologica")
    .select(`
      id,
      prioridad,
      paciente:paciente_id ( nombre, rut ),
      examen:tipo_examen_id ( nombre, codigo ),
      estado:estado_id ( nombre ),
      created_at
    `)
    .eq("created_by", uid)
    .order("id", { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7">ERROR: ${esc(error.message)}</td></tr>`;
    return;
  }

  const rows = data || [];
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">Aún no tienes órdenes creadas.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${esc(r.paciente?.nombre)} <small>(${esc(r.paciente?.rut)})</small></td>
      <td>${esc(r.examen?.nombre)}</td>
      <td>${esc(r.examen?.codigo)}</td>
      <td>${esc(r.estado?.nombre)}</td>
      <td>${esc(r.prioridad)}</td>
      <td>
        <button data-edit="${r.id}">Editar</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit");
      window.location.href = `orden_form.html?id=${encodeURIComponent(id)}&from=medico`;
    });
  });
}

load();
