export function getRecoveryAccessToken(): string | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  if (params.get("type") !== "recovery") return null;

  const accessToken = params.get("access_token");
  if (accessToken) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  return accessToken;
}
