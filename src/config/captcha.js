export const CAPTCHA_SITE_KEY = import.meta.env.DEV
  ? import.meta.env.VITE_CAPTCHA_SITE_KEY_DEV || '1x00000000000000000000AA'
  : import.meta.env.VITE_CAPTCHA_SITE_KEY;