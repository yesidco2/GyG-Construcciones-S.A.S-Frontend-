import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import useAuth from '../utils/useAuth';

export default function AdminFaqPage() {
  const { loading, role } = useAuth();
  const [result, setResult] = useState(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading || role !== 'ADMIN') return undefined;

    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    apiFetch('/api/admin/consultas-chat?page=' + page, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data?.content)) {
          throw new Error('El servidor devolvió un formato de historial no válido.');
        }
        setResult(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('No se pudo cargar el historial. Intenta de nuevo más tarde.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [loading, role, page]);

  if (loading) {
    return (
      <section className="min-h-screen bg-surface px-md py-xl pt-24">
        <p className="mx-auto max-w-5xl text-center font-body-md text-body-md text-secondary">
          Verificando permisos...
        </p>
      </section>
    );
  }

  if (role !== 'ADMIN') {
    return (
      <section className="min-h-screen bg-surface px-md py-xl pt-24">
        <div className="mx-auto max-w-5xl rounded-2xl border border-surface-variant bg-white p-lg text-center shadow-sm">
          <h1 className="font-headline-lg text-headline-lg text-primary">Acceso restringido</h1>
          <p className="mt-sm font-body-md text-body-md text-secondary">
            Necesitas una sesión con rol ADMIN para consultar esta página.
          </p>
          <a className="mt-md inline-block font-label-caps text-label-caps text-industrial-orange hover:underline" href="#login">
            Iniciar sesión
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-surface px-md py-xl pt-24">
      <div className="mx-auto max-w-5xl rounded-2xl border border-surface-variant bg-white p-md shadow-sm md:p-lg">
        <div className="mb-lg">
          <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">
            Consultas almacenadas en el servidor
          </p>
          <h1 className="mt-sm font-headline-xl text-headline-xl text-primary">Log de preguntas del chatbot</h1>
          <p className="mt-sm font-body-md text-body-md text-secondary">
            Historial de preguntas enviado al backend.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-surface-variant bg-surface p-lg text-center text-secondary" role="status">
            Cargando historial...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-error/20 bg-error-container p-lg text-center text-error" role="alert">
            {error}
          </div>
        ) : !result?.content.length ? (
          <div className="rounded-xl border border-dashed border-surface-variant bg-surface p-lg text-center text-secondary">
            No hay preguntas guardadas todavía.
          </div>
        ) : (
          <div className="space-y-sm">
            {result.content.map((item, index) => (
              <div key={`${item.id || item.text || 'consulta'}-${index}`} className="rounded-xl border border-surface-variant bg-surface p-md">
                <p className="mb-xs font-label-caps text-label-caps uppercase text-secondary">Pregunta {result.page * result.size + index + 1}</p>
                <p className="font-body-md text-body-md text-on-surface">{item.pregunta || item.text || 'Consulta sin texto'}</p>
                <p className="mt-xs text-xs text-secondary">
                  {item.fechaConsentimiento
                    ? `Autorizó envío al proveedor de IA: sí (política ${item.versionPolitica})`
                    : 'No consta autorización de envío a un proveedor externo.'}
                </p>
              </div>
            ))}
          </div>
        )}
        {(page > 0 || (result && !result.last)) && (
          <nav aria-label="Páginas del historial" className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <button type="button" disabled={isLoading || page === 0}
              onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-50">Anterior</button>
            <span>Página {page + 1}</span>
            <button type="button" disabled={isLoading || Boolean(error) || !result || result.last}
              onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-50">Siguiente</button>
          </nav>
        )}
      </div>
    </section>
  );
}