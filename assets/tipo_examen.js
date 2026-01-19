import { supabase } from "./assets/supabaseClient.js";

async function cargar() {
  const { data } = await supabase
    .from("tipo_examen")
    .select("*")
    .eq("activo", true);

  tbody.innerHTML = data.map(e => `
    <tr>
      <td>${e.codigo}</td>
      <td>${e.nombre}</td>
      <td>${e.descripcion}</td>
      <td><button onclick="editar(${e.id})">Editar</button></td>
    </tr>
  `).join("");
}

window.editar = id => location.href = `tipo_examen_form.html?id=${id}`;

cargar();
