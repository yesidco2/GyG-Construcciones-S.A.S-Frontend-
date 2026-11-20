import { useEffect, useRef, useState } from 'react';
import { describeProjectError, getPublicProjectPhoto } from '../services/projectService';
import { PhotoMetadata } from '../components/ProjectMetadata';

export default function PublicProjectPhotos({ photos, code, blocked, onRateLimit }) {
  const request = useRef(null);
  const objectUrl = useRef('');
  const [view, setView] = useState(null);

  useEffect(() => () => {
    request.current?.abort();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  async function openPhoto(photo) {
    if (blocked || request.current) return;
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = '';
    }
    const controller = new AbortController();
    request.current = controller;
    setView({ photo, loading: true });
    try {
      const blob = await getPublicProjectPhoto(photo.id, code, controller.signal);
      if (controller.signal.aborted) return;
      if (blob.type !== 'image/png' || blob.size === 0) throw new Error('La foto recibida no es un PNG válido.');
      objectUrl.current = URL.createObjectURL(blob);
      setView({ photo, url: objectUrl.current });
    } catch (error) {
      if (controller.signal.aborted) return;
      if (error.status === 429) onRateLimit(error);
      setView({ photo, error: describeProjectError(error, 'No se pudo cargar la fotografía.') });
    } finally {
      if (request.current === controller) request.current = null;
    }
  }

  return (
    <div className="rounded-2xl border border-surface-variant bg-surface p-md shadow-sm">
      <h2 className="mb-sm font-label-caps text-label-caps uppercase text-secondary">Galería de Fotos</h2>
      {photos.length === 0 ? <p className="text-sm text-secondary">Esta obra todavía no tiene fotografías.</p> : (
        <ul className="space-y-2">
          {photos.map((photo) => (
            <li key={photo.id}>
              <button type="button" disabled={blocked || Boolean(view?.loading)}
                className="break-all text-left text-sm font-semibold text-primary underline disabled:opacity-60"
                onClick={() => openPhoto(photo)}>
                Ver foto: {photo.nombre}
              </button>
              <PhotoMetadata photo={photo} />
            </li>
          ))}
        </ul>
      )}
      {view?.loading && <p role="status" className="mt-3 text-sm">Cargando fotografía…</p>}
      {view?.error && <p role="alert" className="mt-3 text-sm text-error">{view.error}</p>}
      {view?.url && (
        <figure className="mt-4">
          <img src={view.url} alt={view.photo.nombre} className="max-h-96 w-full rounded-lg object-contain"
            onError={() => {
              URL.revokeObjectURL(objectUrl.current);
              objectUrl.current = '';
              setView({ photo: view.photo, error: 'No se pudo mostrar la fotografía.' });
            }} />

        </figure>
      )}
    </div>
  );
}
