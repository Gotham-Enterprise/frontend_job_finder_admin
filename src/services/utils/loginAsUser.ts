import { impersonationApi } from "../api/impersonation";

export function currentAdminReturnPath(): string {
  if (typeof window === "undefined") return "/admin";
  const path = `${window.location.pathname}${window.location.search}`;
  if (!path.startsWith("/admin") || path.startsWith("//") || path.includes("://")) {
    return "/admin";
  }
  return path;
}

/**
 * Opens the main app as the selected user. Call this directly from a click
 * handler so the new tab is allowed.
 */
export async function openLoginAsUser(targetUserId: string, returnPath?: string) {
  const popup = window.open("about:blank", "_blank");
  try {
    const response = await impersonationApi.start(
      targetUserId,
      returnPath ?? currentAdminReturnPath(),
    );
    const url = response.data?.redirectUrl;
    if (!url) {
      throw new Error("The application link was not returned");
    }
    if (popup && !popup.closed) {
      popup.location.href = url;
      popup.opener = null;
      return;
    }
    window.location.assign(url);
  } catch (error) {
    if (popup && !popup.closed) popup.close();
    throw error;
  }
}
