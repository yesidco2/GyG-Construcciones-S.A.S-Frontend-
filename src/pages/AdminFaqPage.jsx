import { useEffect, useState } from 'react';

function getFaqs() {
  try {
    return JSON.parse(localStorage.getItem('gg-chat-history') || '[]');
  } catch {
    return [];
  }
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    setFaqs(getFaqs());
  }, []);

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