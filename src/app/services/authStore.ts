const TOKEN_KEY = "openarms_token";
const GUEST_KEY = "openarms_guest_mode";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(GUEST_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function isGuestMode() {
  return sessionStorage.getItem(GUEST_KEY) === "1";
}

export function setGuestMode(enabled: boolean) {
  if (enabled) {
    sessionStorage.setItem(GUEST_KEY, "1");
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  sessionStorage.removeItem(GUEST_KEY);
}
