import { supabase } from "./supabaseClient.js";

const btnRegister = document.getElementById("btnRegister");
const msg = document.getElementById("msg");

btnRegister.addEventListener("click", async () => {
  msg.style.color = "red";
  msg.textContent = "";

  const email = (document.getElementById("email").value || "").trim();
  const password = (document.getElementById("password").value || "").trim();
  const rol = (document.getElementById("rol")?.value || "TM").trim(); // TM / Medico / Admin

  if (!email || !password) {
    msg.textContent = "Completa email y contraseña.";
    return;
  }

  // 1) Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    msg.textContent = `Registro falló: ${error.message}`;
    return;
  }

  const user = data?.user;

  if (!user?.id) {
    msg.style.color = "green";
    msg.textContent =
      "Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.";
    return;
  }

  // 2) Guardar perfil/rol en tu tabla usuarios
  const { error: dbError } = await supabase.from("usuarios").insert([
    {
      id: user.id,
      email: user.email,
      rol: rol,
      activo: true
    }
  ]);

  if (dbError) {
    msg.textContent =
      "Cuenta creada en Auth, pero falló guardar rol en tabla usuarios: " +
      dbError.message;
    return;
  }

  msg.style.color = "green";

  if (!data?.session) {
    msg.textContent =
      "Cuenta creada. Revisa tu correo para confirmar y luego inicia sesión.";
  } else {
    msg.textContent = "Cuenta creada. Ya puedes ingresar.";
    window.location.href = "index.html";
  }
});
