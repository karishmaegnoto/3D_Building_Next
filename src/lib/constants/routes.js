export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    TWO_FACTOR: "/two-factor",
    SIGNUP: "/signup",
    FORGOT_PASSWORD: "/forgot-password",
    ONBOARDING: "/onboarding",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
  },
};

export const APP_BASE_PATH = "/crm";

export const withBasePath = (path) =>
  `${APP_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;

export default ROUTES;
