export function setCookie(name, value, days = 30) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days*24*60*60*1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

export function getCookie(name) {
  if (typeof document === "undefined") return "";
  const key = name + "=";
  return document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith(key))?.slice(key.length) ?? "";
}