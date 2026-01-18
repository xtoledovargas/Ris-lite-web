import { supabase } from "./supabaseClient.js";

const KEY = "ris_session"; // { email, rol }

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

  // 👇 normalizamos SIEMPRE
  return (data?.rol ?? "").toUpperCase();
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

export async function signOut() {
  await supabase.auth.signOut();
  clearLocalSession();
  window.location.href = "login.html";
}

