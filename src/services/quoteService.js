import { apiFetch } from './api';

const basePath = '/api/cotizaciones';

export function getQuoteCatalog(city, signal) {
  const query = city ? '?' + new URLSearchParams({ ciudad: city }) : '';
  return apiFetch(basePath + '/catalogo' + query, { signal });
}

export function previewQuote(request, signal) {
  return apiFetch(basePath + '/vista-previa', {
    method: 'POST', body: JSON.stringify(request), signal,
  });
}

export function getQuotePdf(request, reference, signal) {
  return apiFetch(basePath + '/pdf', {
    method: 'POST',
    body: JSON.stringify(request),
    headers: { Accept: 'application/pdf', 'If-Match': '"' + reference + '"' },
    responseType: 'blob',
    signal,
    timeoutMs: 45000,
  });
}
