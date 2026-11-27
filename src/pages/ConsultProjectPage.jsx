import { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../services/api';
import { describeProjectError } from '../services/projectService';
import ProjectDocuments from '../components/ProjectDocuments';
import PublicProjectPhotos from './PublicProjectPhotos';
import { ProjectMilestones } from '../components/ProjectMetadata';

const projectCodePattern = /^[A-Za-z0-9-]{6,40}$/;

export default function ConsultProjectPage() {
  const [projectCode, setProjectCode] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const request = useRef(null);
  const [blockedUntil, setBlockedUntil] = useState(0);
  const rateLimitRef = useRef(0);
  const [retryAfter, setRetryAfter] = useState(null);

  function onRateLimit(error) {
    const seconds = error.retryAfter > 0 ? error.retryAfter : 60;
    const until = Date.now() + seconds * 1000;
    rateLimitRef.current = until;
    setRetryAfter(error.retryAfter ?? null);
    setBlockedUntil(until);
  }

  useEffect(() => () => request.current?.abort(), []);

  useEffect(() => {
    if (!blockedUntil) return undefined;
    const timer = window.setTimeout(() => setBlockedUntil(0), Math.max(0, blockedUntil - Date.now()));
    return () => window.clearTimeout(timer);
  }, [blockedUntil]);
  const [error, setError] = useState('');

  const statusMessage = useMemo(() => {
    if (isLoading) {
      return 'Buscando información del proyecto...';
    }

    if (!searched) {
      return 'Consulta tu proyecto con el código asignado.';
    }

    if (error === 'not-found') {
      return 'Código de acceso inválido. Verifica el código e inténtalo de nuevo.';
    }

    if (error === 'empty') {
      return 'Ingresa el código asignado a tu proyecto para realizar la consulta.';
    }

    if (error === 'invalid-code') {
      return 'El código debe tener entre 6 y 40 caracteres y solo puede incluir letras, números y guiones.';
    }

    if (error === 'rate-limited') {
      return retryAfter > 0
        ? 'Demasiadas consultas seguidas. Espera ' + retryAfter + ' segundos antes de intentarlo de nuevo.'
        : 'Demasiadas consultas seguidas. Espera antes de intentarlo de nuevo.';
    }

    if (error) {
      return error === 'request-failed' ? 'No pudimos consultar el proyecto. Puedes intentarlo de nuevo.' : error;
    }

    if (!trackingResult) {
      return 'Consulta tu proyecto con el código asignado.';
    }

    return 'Proyecto encontrado con éxito.';
  }, [searched, trackingResult, error, isLoading, retryAfter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (request.current || Date.now() < rateLimitRef.current) return;
    const code = projectCode.trim();
    if (!code) {
      setSearched(true);
      setError('empty');
      setTrackingResult(null);
      return;
    }
    if (!projectCodePattern.test(code)) {
      setSearched(true);
      setError('invalid-code');
      setTrackingResult(null);
      return;
    }

    const controller = new AbortController();
    request.current = controller;
    setIsLoading(true);
    setError('');
    setTrackingResult(null);
    setSearched(false);

    try {
      const data = await apiFetch('/api/obras/seguimiento', {
        method: 'POST',
        body: JSON.stringify({ codigo: code }),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (typeof data?.nombre !== 'string' || !Number.isInteger(data.porcentajeAvance)
          || data.porcentajeAvance < 0 || data.porcentajeAvance > 100) {
        throw new Error('La respuesta de seguimiento no tiene el formato esperado.');
      }
      if (!Array.isArray(data.hitos)) throw new Error('La respuesta de hitos tiene un formato inválido.');
      setTrackingResult({
        name: data.nombre,
        progress: data.porcentajeAvance,
        milestones: data.hitos,
        documents: Array.isArray(data.documentos) ? data.documentos : [],
        photos: Array.isArray(data.fotos) ? data.fotos : [],
        code,
      });
      setSearched(true);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (err.status === 429) {
        onRateLimit(err);
        setError('rate-limited');
        setSearched(true);
        return;
      }

      setError(err.status === 404 ? 'not-found'
        : (err.status && err.status < 500) ? describeProjectError(err, 'No se pudo realizar la consulta.')
          : 'request-failed');
      setSearched(true);
    } finally {
      if (request.current === controller) request.current = null;
      if (!controller.signal.aborted) setIsLoading(false);
    }
  };

  return (
    <section
      data-awaiting-code={!searched && !isLoading ? '' : undefined}
      className="portal-consult portal-form-surface min-h-screen px-4 py-xl pt-24 sm:px-6 lg:px-8"
    >
      <div className="portal-consult-content">
        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] xl:gap-12">
          <div className="min-w-0 space-y-6">
            <div className="space-y-4">
              <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">Seguimiento</p>
              <h1 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary">Consulta el avance de tu proyecto</h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
                Consulta el avance y los hitos de tu obra con el código asignado.
              </p>
            </div>

            <a href="#hero" className="inline-block text-sm font-semibold text-primary underline">Volver al inicio</a>

            <form noValidate onSubmit={handleSubmit} className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <label htmlFor="project-code" className="text-sm font-semibold text-secondary sm:col-span-2">
                Código de acceso del proyecto
              </label>
              <input
                id="project-code"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={projectCode}
                onChange={(event) => setProjectCode(event.target.value)}
                minLength={6}
                maxLength={40}
                placeholder="Pega el código asignado"
                className="w-full rounded-lg border border-surface-variant bg-white px-6 py-4 text-body-md text-on-background shadow-sm focus:border-primary-container focus:outline-none disabled:opacity-50"
                aria-label="Código del proyecto"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || Boolean(blockedUntil)}
                className="inline-flex items-center justify-center rounded-lg bg-industrial-orange px-lg py-sm text-white font-headline-sm hover:bg-industrial-orange/90 transition-all gap-xs disabled:opacity-70"
              >
                {isLoading ? 'Buscando...' : error === 'request-failed' ? 'Reintentar' : 'Consultar Proyecto'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <p className="font-body-sm text-body-sm text-secondary" aria-live="polite">
              {statusMessage}
            </p>
          </div>

          <div className="portal-consult-aside min-w-0">
            <div className="flex flex-col justify-between text-white">
              <div>
                <div className="mb-lg flex h-14 w-14 items-center justify-center rounded-2xl bg-industrial-orange text-white">
                  <span className="material-symbols-outlined text-3xl" aria-hidden="true">monitoring</span>
                </div>
                <p className="mb-xs font-label-caps text-label-caps uppercase tracking-widest text-industrial-orange">
                  Seguimiento de obra
                </p>
                <h2 className="font-headline-md text-headline-md text-white">
                  Tu proyecto, en un solo lugar
                </h2>
                <p className="mt-sm font-body-sm text-body-sm text-white/70">
                  Consulta con tu código de acceso la información disponible de tu obra.
                </p>
              </div>
              <ul className="mt-lg grid gap-sm border-t border-white/15 pt-md font-body-sm text-body-sm text-white/85">
                <li className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-industrial-orange" aria-hidden="true">trending_up</span>
                  Avance del proyecto
                </li>
                <li className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-industrial-orange" aria-hidden="true">checklist</span>
                  Hitos de la obra
                </li>
                <li className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-industrial-orange" aria-hidden="true">photo_library</span>
                  Fotografías disponibles
                </li>
              </ul>
            </div>
          </div>
        </div>

        {trackingResult && (
          <section aria-labelledby="project-result-name" className="mt-lg grid gap-md">
            <div className="min-w-0 space-y-4 rounded-2xl border border-surface-variant bg-surface p-md shadow-sm">
              <div>
                <p className="font-label-caps text-label-caps uppercase text-secondary">Proyecto</p>
                <h2 id="project-result-name" className="break-words font-headline-md text-headline-md text-primary">{trackingResult.name}</h2>
              </div>
              <div>
                <p className="font-label-caps text-label-caps uppercase text-secondary">Código</p>
                <p className="break-all text-primary">{trackingResult.code}</p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase text-secondary">Avance</span>
                  <span className="font-bold text-primary">{trackingResult.progress}%</span>
                </div>
                <div role="progressbar" aria-label="Avance del proyecto" aria-valuenow={trackingResult.progress}
                  aria-valuemin={0} aria-valuemax={100} className="h-2.5 overflow-hidden rounded-lg bg-surface-variant">
                  <div className="h-full rounded-lg bg-industrial-orange" style={{ width: `${trackingResult.progress}%` }} />
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-surface-variant bg-surface p-md shadow-sm">
              <h2 className="mb-sm font-label-caps text-label-caps uppercase text-secondary">Hitos de la obra</h2>
              <ProjectMilestones milestones={trackingResult.milestones} />
            </div>
            <ProjectDocuments key={trackingResult.code} documents={trackingResult.documents} code={trackingResult.code}
              blocked={Boolean(blockedUntil)} onRateLimit={onRateLimit} />
            <PublicProjectPhotos photos={trackingResult.photos} code={trackingResult.code}
              blocked={Boolean(blockedUntil)} onRateLimit={onRateLimit} />
          </section>
        )}
      </div>
    </section>
  );
}
