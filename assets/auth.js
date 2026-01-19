import { supabase } from "./supabaseClient.js";

const KEY = "ris_session"; // { email, rol }

// Normaliza: mayúsculas + sin tildes + sin dobles espacios
export function normalizeRole(rol) {
  return String(rol || "")
    .trim()
    .toUpperCase()
    .replaceAll("Ó", "O")
    .replaceAll("É", "E")
    .replaceAll("Í", "I")
    .replaceAll("Á", "A")
    .replaceAll("Ú", "U")
    .replace(/\s+/g, " ");
}

export async function getSessionUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user ?? null;
}

export async function getUserRoleByEmail(email) {
  if (!email) return null;

  const { data, error } = await supabase
    .from("usuarios")
    .select("rol, activo")
    .eq("email", email)
    .single();

  if (error) return null;
  if (data?.activo === false) return null;

  return normalizeRole(data?.rol ?? "");
}

export function setLocalSession({ email, rol }) {
  localStorage.setItem(KEY, JSON.stringify({ email, rol }));
}

export function getLocalSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  localStorage.removeItem(KEY);
}

export async function requireAuthOrRedirect() {
  const user = await getSessionUser();

  if (!user?.email) {
    window.location.href = "login.html";
    return null;
  }

  const rol = await getUserRoleByEmail(user.email);

  if (!rol) {
    await supabase.auth.signOut();
    clearLocalSession();
    window.location.href = "login.html";
    return null;
  }

  setLocalSession({ email: user.email, rol });
  return { email: user.email, rol };
}

export function can(rol, action) {
  const R = normalizeRole(rol);

  const isAdmin = (R === "ADMIN" || R === "ADMINISTRADOR");
  const isTM =
    (R === "TM" ||
     R === "TECNOLOGO" ||
     R === "TECNOLOGO MEDICO");
  const isMedico = (R === "MEDICO");

  const rules = {
    VIEW_PACIENTES: isAdmin || isTM,
    VIEW_MEDICOS: isAdmin,
    VIEW_TIPO_EXAMEN: isAdmin,
    VIEW_ORDENES: isAdmin || isTM,
    VIEW_CREAR_ORDEN: isAdmin || isMedico,
    VIEW_LOGS: isAdmin || isTM,

    CREATE_ORDEN: isAdmin || isMedico,
    CREATE_MEDICO: isAdmin,
    CREATE_PACIENTE: isAdmin || isTM,
    CREATE_TIPO_EXAMEN: isAdmin,
  };

  return !!rules[action];
}

export async function signOut() {
  await supabase.auth.signOut();
  clearLocalSession();
  window.location.href = "login.html";
}


