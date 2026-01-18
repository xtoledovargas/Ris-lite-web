import { supabase } from "./supabaseClient.js";
import { getSessionUser, getLocalSession } from "./auth.js";

export async function logEvent({ accion, entidad, entidad_id, detalle }) {
  try {
    // 1) intenta auth real
    const user = await getSessionUser();
    let email = user?.email ?? null;

    // 2) fallback local storage
    if (!email) {
      const local = getLocalSession();
      email = local?.email ?? null;
    }

    const payload = {
      accion,
      entidad,
      entidad_id: entidad_id ?? null,
      detalle: detalle ?? "",
      user_email: email // <- ESTA ES TU COLUMNA REAL
    };

    const { error } = await supabase.from("log_sistema").insert(payload);
    if (error) console.warn("No se pudo guardar log:", error.message);
  } catch (e) {
    console.warn("No se pudo guardar log (catch):", e?.message ?? e);
  }
}
