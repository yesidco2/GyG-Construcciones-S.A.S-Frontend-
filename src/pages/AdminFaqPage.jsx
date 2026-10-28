import { useEffect, useState } from 'react';
import useAuth from '../utils/useAuth';

function getFaqs() {
  try {
    return JSON.parse(localStorage.getItem('gg-chat-history') || '[]');
  } catch {
    return [];
  }
}

export default function AdminFaqPage() {
  const { loading, canAccessPanel } = useAuth();
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    if (!loading && canAccessPanel) {
      setFaqs(getFaqs());
    }
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
            Historial local
          </p>
          <h1 className="mt-sm font-headline-xl text-headline-xl text-primary">Log de preguntas del chatbot</h1>
          <p className="mt-sm font-body-md text-body-md text-secondary">
            Vista administrativa temporal para revisar preguntas almacenadas localmente. Esto debe migrarse a una base de datos real cuando exista el backend.
          </p>
        </div>

        {faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-variant bg-surface p-lg text-center text-secondary">
            No hay preguntas guardadas todavía.
          </div>
        ) : (
          <div className="space-y-sm">
            {faqs.map((item, index) => (
              <div key={`${item.text}-${index}`} className="rounded-xl border border-surface-variant bg-surface p-md">
                <p className="mb-xs font-label-caps text-label-caps uppercase text-secondary">Pregunta {index + 1}</p>
                <p className="font-body-md text-body-md text-on-surface">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}