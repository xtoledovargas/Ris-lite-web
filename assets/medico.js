import { supabase } from "./assets/supabaseClient.js";

async function cargarMedicos() {
  const { data } = await supabase
    .from("medico_solicitante")
    .select("*")
    .eq("activo", true);

  tbody.innerHTML = data.map(m => `
    <tr>
      <td>${m.nombre}</td>
      <td>${m.especialidad}</td>
      <td>
        <button onclick="editar(${m.id})">Editar</button>
      </td>
    </tr>
  `).join("");
}

window.editar = id => location.href = `medico_form.html?id=${id}`;

cargarMedicos();
