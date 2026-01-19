import { supabase } from "./assets/supabaseClient.js";

const id = new URLSearchParams(location.search).get("id");

if (id) cargar(id);

async function cargar(id) {
  const { data } = await supabase
    .from("medico_solicitante")
    .select("*")
    .eq("id", id)
    .single();

  nombre.value = data.nombre;
  especialidad.value = data.especialidad;
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    nombre: nombre.value,
    especialidad: especialidad.value,
    activo: true
  };

  if (id) {
    await supabase.from("medico_solicitante").update(payload).eq("id", id);
  } else {
    await supabase.from("medico_solicitante").insert(payload);
  }

  location.href = "medico.html";
});
