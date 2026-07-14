export const Session = {
  accessCookieName: "freshflow_access",
  refreshCookieName: "freshflow_refresh",
  accessMaxAgeMs: 15 * 60 * 1000,
  refreshMaxAgeMs: 30 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
} as const;
