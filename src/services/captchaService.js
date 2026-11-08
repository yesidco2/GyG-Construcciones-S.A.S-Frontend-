import { apiFetch } from './api';

export async function verifyCaptcha(captchaToken) {
  if (!captchaToken) {
    throw new Error('Completa la verificación CAPTCHA.');
  }

  const result = await apiFetch('/api/auth/captcha/verify', {
    method: 'POST',
    body: JSON.stringify({ captchaToken }),
  });

  if (!result?.ticket) {
    throw new Error('El servidor no devolvió un ticket CAPTCHA válido.');
  }

  return result;
}
