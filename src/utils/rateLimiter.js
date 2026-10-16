/**
 * Rate Limiter para control de tasa de peticiones en el Login
 * Protege contra ataques DDoS, flooding y fuerza bruta automatizada.
 *
 * Configuración:
 * - Ventana de tiempo: 60 segundos
 * - Límite máximo de peticiones por ventana: 5 peticiones
 */

const STORAGE_KEY = 'gg_auth_rate_limit_timestamps';
const WINDOW_MS = 60 * 1000; // 60 segundos
const MAX_REQUESTS = 5;

/**
 * Obtiene los timestamps válidos de peticiones dentro de la ventana de 60s
 */
function getValidTimestamps() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const timestamps = JSON.parse(raw);
    const now = Date.now();
    // Filtrar únicamente los que ocurrieron en los últimos 60 segundos
    return timestamps.filter((t) => now - t < WINDOW_MS);
  } catch {
    return [];
  }
}

/**
 * Guarda los timestamps válidos
 */
function saveTimestamps(timestamps) {
  try {
    const data = JSON.stringify(timestamps);
    sessionStorage.setItem(STORAGE_KEY, data);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (err) {
    console.error('Error al guardar rate limit:', err);
  }
}

/**
 * Consulta el estado actual del Rate Limit
 */
export function getRateLimitStatus() {
  const timestamps = getValidTimestamps();
  const count = timestamps.length;
  const isExceeded = count >= MAX_REQUESTS;
  const remaining = Math.max(0, MAX_REQUESTS - count);

  let resetSeconds = 0;
  if (timestamps.length > 0) {
    const oldestTimestamp = timestamps[0];
    const diffMs = WINDOW_MS - (Date.now() - oldestTimestamp);
    resetSeconds = Math.max(0, Math.ceil(diffMs / 1000));
  }

  return {
    isExceeded,
    limit: MAX_REQUESTS,
    remaining,
    count,
    windowSeconds: WINDOW_MS / 1000,
    resetSeconds,
  };
}

/**
 * Registra una nueva petición.
 * Retorna true si la petición fue permitida, o false si excedió el rate limit.
 */
export function consumeRateLimit() {
  const timestamps = getValidTimestamps();
  const now = Date.now();

  if (timestamps.length >= MAX_REQUESTS) {
    return {
      allowed: false,
      status: getRateLimitStatus(),
    };
  }

  // Registrar nueva petición
  timestamps.push(now);
  saveTimestamps(timestamps);

  return {
    allowed: true,
    status: getRateLimitStatus(),
  };
}

/**
 * Restablece el contador de rate limit para pruebas
 */
export function resetRateLimit() {
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
  return getRateLimitStatus();
}
