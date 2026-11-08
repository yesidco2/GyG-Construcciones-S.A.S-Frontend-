import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import useAuth from '../utils/useAuth';

export default function AdminFaqPage() {
  const { loading, canAccessPanel } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading || !canAccessPanel) return undefined;

    let active = true;
    setIsLoading(true);
    setError('');
    apiFetch('/api/admin/consultas-chat')
      .then((data) => {
        if (!active) return;
        const entries = Array.isArray(data) ? data : data?.content;
        if (!Array.isArray(entries)) {
          throw new Error('El servidor devolvió un formato de historial no válido.');
        }
        setFaqs(entries);
      })
      .catch(() => {
        if (active) setError('No se pudo cargar el historial. Intenta de nuevo más tarde.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loading, canAccessPanel]);

  if (loading) {
    return (
      <section className="min-h-screen bg-surface px-md py-xl pt-24">
        <p className="mx-auto max-w-5xl text-center font-body-md text-body-md text-secondary">
          Verificando permisos...
        </p>
      </section>
    );
  }

  if (!canAccessPanel) {
    return (
      <section className="min-h-screen bg-surface px-md py-xl pt-24">
        <div className="mx-auto max-w-5xl rounded-2xl border border-surface-variant bg-white p-lg text-center shadow-sm">
          <h1 className="font-headline-lg text-headline-lg text-primary">Acceso restringido</h1>
          <p className="mt-sm font-body-md text-body-md text-secondary">
            Necesitas una sesión con rol ADMIN o INGENIERO para consultar esta página.
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
        ) : faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-variant bg-surface p-lg text-center text-secondary">
            No hay preguntas guardadas todavía.
          </div>
        ) : (
          <div className="space-y-sm">
            {faqs.map((item, index) => (
              <div key={`${item.id || item.text || 'consulta'}-${index}`} className="rounded-xl border border-surface-variant bg-surface p-md">
                <p className="mb-xs font-label-caps text-label-caps uppercase text-secondary">Pregunta {index + 1}</p>
                <p className="font-body-md text-body-md text-on-surface">{item.pregunta || item.text || 'Consulta sin texto'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}