const DEFAULT_ADMIN_PATH = "/admin";

/**
 * Post-login destination from a `?redirect=` value. Only same-site /admin paths
 * are honored so the param can't be used as an open redirect.
 */
export const getSafeAdminRedirect = (value: string | null | undefined): string => {
  if (!value || !value.startsWith(DEFAULT_ADMIN_PATH) || value.includes("\\")) {
    return DEFAULT_ADMIN_PATH;
  }
  return value;
};
