import { supabase } from "./assets/supabaseClient.js";

const id = new URLSearchParams(location.search).get("id");

if (id) cargarPaciente(id);

async function cargarPaciente(id) {
  const { data } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .single();

  rut.value = data.rut;
  nombre.value = data.nombre;
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    rut: rut.value,
    nombre: nombre.value,
    activo: true
  };

  if (id) {
    await supabase.from("pacientes").update(payload).eq("id", id);
  } else {
    await supabase.from("pacientes").insert(payload);
  }

  location.href = "pacientes.html";
});
