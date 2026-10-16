import { useMemo, useState } from 'react';
import { apiFetch } from '../services/api';

export default function ConsultProjectPage() {
  const [projectCode, setProjectCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const statusMessage = useMemo(() => {
    if (isLoading) {
      return 'Buscando información del proyecto...';
    }

    if (!searched) {
      return 'Consulta tu proyecto con el código asignado.';
    }

    if (error === 'not-found') {
      return 'No encontramos un proyecto con ese código. Verifica la información o contacta a tu gestor.';
    }

    if (error === 'empty') {
      return 'Ingresa el código asignado a tu proyecto para realizar la consulta.';
    }

    if (error) {
      return 'No pudimos consultar el proyecto por un error de red o del servidor. Intenta nuevamente más tarde.';
    }

    if (!trackingResult) {
      return 'Consulta tu proyecto con el código asignado.';
    }

    return 'Proyecto encontrado con éxito.';
  }, [searched, trackingResult, error, isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const code = projectCode.trim();
    if (!code) {
      setSearched(true);
      setError('empty');
      setTrackingResult(null);
      return;
    }

    setIsLoading(true);
    setError('');
    setTrackingResult(null);
    setSearched(false);

    try {
      const data = await apiFetch(`/api/obras/seguimiento/${encodeURIComponent(code)}`);
      setTrackingResult({
        name: data.nombre,
        progress: data.porcentajeAvance,
        photos: (data.fotos || []),
        code,
      });
      setSearched(true);
    } catch (err) {
      console.error('API error:', err);
      setError(err.status === 404 ? 'not-found' : 'request-failed');
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#eef2ff] px-md py-xl pt-24">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-white shadow-xl border border-surface-variant p-6 md:p-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">Seguimiento</p>
              <h1 className="font-headline-xl text-headline-xl text-primary">Consulta el avance de tu proyecto</h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
                Accede a la información detallada, cronogramas y reportes en tiempo real ingresando el código del proyecto.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <label htmlFor="project-code" className="sr-only">Código del proyecto</label>
              <input
                id="project-code"
                type="text"
                value={projectCode}
                onChange={(event) => setProjectCode(event.target.value)}
                placeholder="Ej: GG-2026-00125"
                className="w-full rounded-full border border-surface-variant bg-white px-6 py-4 text-body-md text-on-background shadow-sm focus:border-primary-container focus:outline-none disabled:opacity-50"
                aria-label="Código del proyecto"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full bg-industrial-orange px-lg py-sm text-white font-headline-sm hover:bg-industrial-orange/90 transition-all gap-xs disabled:opacity-70"
              >
                {isLoading ? 'Buscando...' : 'Consultar Proyecto'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <p className="font-body-sm text-body-sm text-secondary" aria-live="polite">
              {statusMessage}
            </p>
          </div>

          <div className="rounded-2xl border border-surface-variant bg-surface p-5 shadow-sm">
            {trackingResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-label-caps text-label-caps uppercase text-secondary">Código</p>
                    <h2 className="font-headline-sm text-headline-sm text-primary">{trackingResult.code}</h2>
                  </div>
                  <span className="rounded-full bg-primary px-sm py-xs font-label-caps text-label-caps text-on-primary">
                    {trackingResult.progress}%
                  </span>
                </div>

                <div>
                  <p className="font-label-caps text-label-caps uppercase text-secondary">Proyecto</p>
                  <h3 className="font-headline-md text-headline-md text-primary">{trackingResult.name}</h3>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-label-caps text-label-caps uppercase text-secondary">Avance</span>
                    <span className="font-bold text-primary">{trackingResult.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-variant">
                    <div className="h-full rounded-full bg-industrial-orange" style={{ width: `${trackingResult.progress}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-surface-variant bg-white p-6 text-center text-secondary">
                <p>
                  {isLoading
                    ? 'Consultando el proyecto...'
                    : error === 'not-found'
                      ? 'No se encontró un proyecto con ese código.'
                      : error === 'request-failed'
                        ? 'No se pudo cargar el proyecto. Intenta nuevamente más tarde.'
                        : error === 'empty'
                          ? 'Ingresa un código para iniciar la consulta.'
                          : 'Sin resultados para este código.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {trackingResult && trackingResult.photos && trackingResult.photos.length > 0 && (
          <div className="mt-lg rounded-2xl border border-surface-variant bg-surface p-md shadow-sm">
            <div className="mb-md">
              <p className="font-label-caps text-label-caps uppercase text-secondary">Galería de Fotos</p>
            </div>

            <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-4">
              {trackingResult.photos.map((photo, index) => (
                <div
                  key={`${trackingResult.code}-${photo.url}-${index}`}
                  className="overflow-hidden rounded-xl bg-white shadow-sm"
                >
                  <img
                    src={photo.url}
                    alt={`${trackingResult.name} foto ${index + 1}`}
                    className="h-36 w-full object-cover hover:scale-105 transition-transform"
                  />
                  <p className="p-xs font-body-sm text-body-sm text-secondary">
                    {photo.fecha}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}