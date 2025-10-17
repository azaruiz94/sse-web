// Small helper to centralize application base URL handling
export function getBaseUrl() {
  try {
    const raw = (import.meta && import.meta.env && import.meta.env.BASE_URL) || '';
    // ensure no trailing slash
    return raw.replace(/\/$/, '');
  } catch (e) {
    return '';
  }
}

// Prefix a given path with the base URL, ensuring slashes are correct
export function withBase(path) {
  const base = getBaseUrl();
  if (!base) return path;
  // strip leading slash from path if present
  const p = path.replace(/^\//, '');
  return `${base}/${p}`;
}

export default { getBaseUrl, withBase };
