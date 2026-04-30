const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["https:"]);
const PARTIFUL_EDIT_PATH_PATTERN = /\/edit\/?$/;

export function getSafeExternalUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (!ALLOWED_EXTERNAL_PROTOCOLS.has(parsedUrl.protocol)) {
      return null;
    }

    parsedUrl.username = "";
    parsedUrl.password = "";
    parsedUrl.hash = "";
    parsedUrl.search = "";
    parsedUrl.pathname = parsedUrl.pathname.replace(PARTIFUL_EDIT_PATH_PATTERN, "");

    return parsedUrl.toString();
  } catch {
    return null;
  }
}
