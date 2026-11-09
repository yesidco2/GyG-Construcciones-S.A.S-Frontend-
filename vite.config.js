import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function contentSecurityPolicy(apiOrigin, development = false) {
  const connectSources = [
    "'self'",
    apiOrigin,
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://www.googleapis.com',
    'https://challenges.cloudflare.com',
    'https://www.google.com',
    'https://www.recaptcha.net',
    'data:',
    ...(development ? ['ws://localhost:*', 'ws://127.0.0.1:*'] : []),
  ].filter(Boolean);
  const scriptSources = [
    "script-src 'self' https://challenges.cloudflare.com https://www.google.com https://www.gstatic.com",
    ...(development ? ["'unsafe-inline'"] : []),
  ];
  return [
    "default-src 'self'",
    scriptSources.join(' '),
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    `img-src 'self' blob: https:`,
    `connect-src ${connectSources.join(' ')}`,
    "frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://www.recaptcha.net",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

function securityMetadataPlugin(apiUrl) {
  const apiOrigin = apiUrl ? new URL(apiUrl).origin : '';
  const policy = contentSecurityPolicy(apiOrigin);

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
              content: policy,
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
    writeBundle(outputOptions) {
      const outputDirectory = outputOptions.dir || resolve(process.cwd(), 'dist');
      const headersTemplate = readFileSync(resolve(process.cwd(), 'public', '_headers'), 'utf8');
      writeFileSync(
        resolve(outputDirectory, '_headers'),
        headersTemplate.replace('__API_ORIGIN__', apiOrigin),
      );
    },
  };
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiOrigin = env.VITE_API_URL ? new URL(env.VITE_API_URL).origin : '';
  if (command === 'build' && mode === 'production') {
    if (!env.VITE_API_URL) {
      throw new Error('VITE_API_URL debe configurarse para generar el build de producción.');
    }

    let apiUrl;
    try {
      apiUrl = new URL(env.VITE_API_URL);
    } catch {
      throw new Error('VITE_API_URL debe ser una URL válida en el build de producción.');
    }

    const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
    if (apiUrl.protocol !== 'https:' && !localHosts.has(apiUrl.hostname)) {
      throw new Error('VITE_API_URL debe usar HTTPS en producción; HTTP solo se permite para localhost.');
    }
  }

  return {
    base: '/GG-WEB/',
    plugins: [react(), securityMetadataPlugin(env.VITE_API_URL)],
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Content-Security-Policy': contentSecurityPolicy(apiOrigin, true),
      },
    },
  };
});
