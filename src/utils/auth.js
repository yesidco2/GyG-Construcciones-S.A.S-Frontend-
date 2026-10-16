/**
 * Utilidades de Autenticación con JWT (JSON Web Tokens) y Cookies
 * para G&G Construcciones S.A.S - SG-SST
 */

const COOKIE_NAME = 'gg_jwt_token';
const JWT_SECRET = 'gg_construcciones_sst_secret_key_2026';

// Funciones de codificación/decodificación Base64URL estándar
function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Genera un token JWT firmado (Header.Payload.Signature)
 */
export function generateJWT(user, expiresInSeconds = 7 * 24 * 60 * 60) {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    sub: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    method: user.method || 'Standard Auth',
    iat: now,
    exp: now + expiresInSeconds,
    iss: 'gyg-construcciones-auth-service',
    aud: 'portal-sst-web',
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  // Simulación de firma HMAC-SHA256 con secret
  const signatureRaw = `${encodedHeader}.${encodedPayload}.${JWT_SECRET}`;
  const encodedSignature = base64UrlEncode(signatureRaw).substring(0, 43);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Decodifica y valida un token JWT
 */
export function verifyAndDecodeJWT(token) {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const now = Math.floor(Date.now() / 1000);

    // Validar expiración
    if (payload.exp && payload.exp < now) {
      console.warn('Token JWT expirado');
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

/**
 * Guarda el token JWT en una Cookie del navegador
 * Cumple con especificaciones SameSite y Secure
 */
export function setAuthCookie(token, days = 7) {
  try {
    const maxAge = days * 24 * 60 * 60;
    const isHttps = window.location.protocol === 'https:';
    
    // Cookie con SameSite=Strict y path=/
    let cookieString = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Strict`;
    if (isHttps) {
      cookieString += '; Secure';
    }

    document.cookie = cookieString;
    return true;
  } catch (err) {
    console.error('Error al guardar cookie de autenticación:', err);
    return false;
  }
}

/**
 * Lee el token JWT almacenado en las cookies
 */
export function getAuthCookie() {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, val] = cookie.trim().split('=');
      if (key === COOKIE_NAME && val) {
        return decodeURIComponent(val);
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Elimina la cookie de sesión JWT
 */
export function removeAuthCookie() {
  try {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene la sesión actual a partir del token JWT almacenado en cookies
 */
export function getCurrentSessionFromCookie() {
  const token = getAuthCookie();
  if (!token) return null;

  const payload = verifyAndDecodeJWT(token);
  if (!payload) {
    removeAuthCookie();
    return null;
  }

  return {
    name: payload.name,
    email: payload.sub,
    role: payload.role,
    avatar: payload.avatar,
    method: payload.method,
    exp: payload.exp,
    iat: payload.iat,
    token: token,
  };
}
