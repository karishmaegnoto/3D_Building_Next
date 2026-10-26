export const TOKEN_KEY = "grip_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export const getToken = () => {
  if (typeof window === "undefined") return null;

  const localToken = window.localStorage.getItem(TOKEN_KEY);
  if (localToken) return localToken;

  if (typeof document !== "undefined" && document.cookie) {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${TOKEN_KEY}=([^;]+)`));
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return null;
};


export const setToken = (token) => {
  if (typeof window === "undefined" || !token) return;

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.removeItem("gripcrm_auth");

  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
};


export const removeToken = () => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem("gripcrm_auth");

  if (typeof document !== "undefined") {
    document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
};
