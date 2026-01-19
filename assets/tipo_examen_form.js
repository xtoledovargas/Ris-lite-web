import { supabase } from "./assets/supabaseClient.js";

const id = new URLSearchParams(location.search).get("id");

if (id) cargar();

async function cargar() {
  const { data } = await supabase
    .from("tipo_examen")
    .select("*")
    .eq("id", id)
    .single();

  codigo.value = data.codigo;
  nombre.value = data.nombre;
  descripcion.value = data.descripcion;
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    codigo: codigo.value,
    nombre: nombre.value,
    descripcion: descripcion.value,
    activo: true
  };

  if (id) {
    await supabase.from("tipo_examen").update(payload).eq("id", id);
  } else {
    await supabase.from("tipo_examen").insert(payload);
  }

  location.href = "tipo_examen.html";
});
