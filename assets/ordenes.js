import { supabase } from "./supabaseClient.js";
import { requireAuthOrRedirect, getLocalSession } from "./auth.js";
import { logEvent } from "./logger.js";

let ESTADOS = []; // cache de estados: [{id,nombre,orden}, ...]

async function loadEstados() {
  const { data, error } = await supabase
    .from("estado_orden")
    .select("id,nombre,orden,activo")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) throw new Error("Error cargando estados: " + error.message);
  ESTADOS = data || [];
}

function getSiguienteEstadoId(estadoActualId) {
  const actual = getEstadoById(estadoActualId);
  if (!actual) return null;

  const siguiente = ESTADOS.find(e => Number(e.orden) === Number(actual.orden) + 1);
  return siguiente ? Number(siguiente.id) : null; // ✅ si no hay siguiente, es finalizado
}


const $tbody = document.getElementById("rows"); // ajusta al id real de tu tbody

function esc(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function cargarEstadosOrden() {
  const { data, error } = await supabase
    .from("estado_orden")
    .select("id,nombre,orden,activo")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) throw new Error("No pude cargar estados: " + error.message);
  return data || [];
}

// Devuelve el id del estado siguiente según el campo "orden"
function getNextEstadoId(estados, estadoActualId) {
  const idx = estados.findIndex(e => Number(e.id) === Number(estadoActualId));
  if (idx === -1) return null;
  const next = estados[idx + 1];
  return next ? next.id : null; // si no hay siguiente, queda null
}

async function cambiarASiguienteEstado(ordenId) {
  // 1) Traer orden actual (estado_id)
  const { data: ord, error: ordErr } = await supabase
    .from("orden_radiologica")
    .select("id, estado_id")
    .eq("id", Number(ordenId))
    .single();

  if (ordErr) {
    alert("No pude leer la orden: " + ordErr.message);
    return;
  }

  // 2) Cargar estados y calcular siguiente
  let estados;
  try {
    estados = await cargarEstadosOrden();
  } catch (e) {
    alert(e.message);
    return;
  }

  const nextEstadoId = getNextEstadoId(estados, ord.estado_id);
  if (!nextEstadoId) {
    alert("Esta orden ya está en el último estado.");
    return;
  }

  const estadoActual = estados.find(e => Number(e.id) === Number(ord.estado_id))?.nombre || "";
  const estadoNuevo = estados.find(e => Number(e.id) === Number(nextEstadoId))?.nombre || "";

  // 3) Actualizar estado
  const { error: upErr } = await supabase
    .from("orden_radiologica")
    .update({ estado_id: nextEstadoId })
    .eq("id", Number(ordenId));

  if (upErr) {
    alert("No se pudo cambiar el estado (RLS o permisos): " + upErr.message);
    return;
  }

  // 4) Log
  await logEvent({
    accion: "STATUS",
    entidad: "orden_radiologica",
    entidad_id: Number(ordenId),
    detalle: `Cambio estado: ${estadoActual} -> ${estadoNuevo}`
  });

  alert(`Estado actualizado: ${estadoActual} -> ${estadoNuevo}`);

  // 5) Recargar listado
  await cargarOrdenes(); // <- tu función de recarga
}

/* =========================
   EVENT DELEGATION (CLAVE)
   ========================= */
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest(".btnNextEstado");
  if (!btn) return;

  const rol = String(getLocalSession()?.rol || "").toUpperCase();
  if (rol !== "TM" && rol !== "ADMIN") {
    alert("No tienes permisos para cambiar el estado.");
    return;
  }

  const id = btn.getAttribute("data-id");
  if (!id) return;

  cambiarASiguienteEstado(id);
});

/* =========================
   EJEMPLO de render (mínimo)
   ========================= */
// Asegúrate que cuando pintas la tabla pongas la clase y data-id
function renderRow(r) {
  return `
    <tr>
      <td>${esc(r.id)}</td>
      <td>${esc(r.paciente_nombre ?? "")}</td>
      <td>${esc(r.medico_nombre ?? "")}</td>
      <td>${esc(r.examen_nombre ?? "")}</td>
      <td>${esc(r.codigo ?? "")}</td>
      <td>${esc(r.estado_nombre ?? "")}</td>
      <td>${esc(r.prioridad ?? "")}</td>
      <td>
        <button class="btnEdit" data-id="${esc(r.id)}">Editar</button>
        <button class="btnNextEstado" data-id="${esc(r.id)}">Siguiente estado</button>
      </td>
    </tr>
  `;
}

/* =========================
   Tu función real de carga
   ========================= */
async function cargarOrdenes() {
  // OJO: acá va tu select con joins o con vista.
  // Te dejo un select simple. Ajusta al tuyo:
  const { data, error } = await supabase
    .from("orden_radiologica")
    .select("id, prioridad, estado_id") // ideal: traer nombres via join/vista
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  
}

// Init
await requireAuthOrRedirect();
await cargarOrdenes();
