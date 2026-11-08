export default function safeImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return undefined;

  try {
    const url = new URL(value, window.location.origin);
    if (url.origin === window.location.origin) return value;
    return url.protocol === 'https:' ? value : undefined;
  } catch {
    return undefined;
  }
}
