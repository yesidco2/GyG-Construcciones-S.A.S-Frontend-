import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function securityMetadataPlugin(apiUrl) {
  const apiOrigin = apiUrl ? new URL(apiUrl).origin : '';
  const connectSources = [
    "'self'",
    apiOrigin,
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://www.googleapis.com',
  ].filter(Boolean);
  const contentSecurityPolicy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `img-src 'self' data: blob: https:`,
    `connect-src ${connectSources.join(' ')}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  return {
    name: 'production-security-metadata',
    apply: 'build',
    transformIndexHtml() {
      return {
        tags: [
          {
            tag: 'meta',
            attrs: {
              'http-equiv': 'Content-Security-Policy',
              content: contentSecurityPolicy,
            },
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: {
              name: 'referrer',
              content: 'strict-origin-when-cross-origin',
            },
            injectTo: 'head',
          },
        ],
      };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/GG-WEB/',
    plugins: [react(), securityMetadataPlugin(env.VITE_API_URL)],
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      },
    },
  };
});
