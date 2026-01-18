export function qs(sel) { return document.querySelector(sel); }

export function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

export function setStatus(msg, type = "info") {
  const el = qs("#status");
  if (!el) return;
  el.textContent = msg || "";
  el.style.padding = msg ? "10px" : "0";
  el.style.marginTop = msg ? "10px" : "0";
  el.style.border = msg ? "1px solid #ddd" : "0";
}

export function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
