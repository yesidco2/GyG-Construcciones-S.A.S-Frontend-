import { apiFetch } from './api';

export async function verifyCaptcha(captchaToken) {
  if (typeof captchaToken !== 'string' || !captchaToken.trim()) {
    throw new Error('Completa la verificación CAPTCHA.');
  }

  const result = await apiFetch('/api/auth/captcha/verify', {
    method: 'POST',
    body: JSON.stringify({ captchaToken }),
  });

  if (typeof result?.ticket !== 'string' || !result.ticket.trim() || result.ticket.length > 128) {
    throw new Error('El servidor no devolvió un ticket CAPTCHA válido.');
  }

  return result;
}
