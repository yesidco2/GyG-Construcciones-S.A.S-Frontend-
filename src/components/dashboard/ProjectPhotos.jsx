import { useEffect, useRef, useState } from 'react';
import {
  deleteProjectPhoto, describeProjectError, getProjectPhoto, getProjectPhotos, PROJECT_PHOTO_TYPES, uploadProjectPhotos,
} from '../../services/projectService';
import { PhotoMetadata } from '../ProjectMetadata';

export function ProjectPhotoInput({ id, onChange, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold uppercase text-secondary">Fotografías de la obra</label>
      <input id={id} type="file" multiple accept={PROJECT_PHOTO_TYPES} disabled={disabled}
        aria-describedby={id + '-help'}
        className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm"
        onChange={(event) => onChange(Array.from(event.target.files))} />
      <p id={id + '-help'} className="mt-1 text-xs text-secondary">Hasta 20 fotos JPEG, PNG o WebP por obra. Las fotos grandes se reducen automáticamente al subirlas.</p>
    </div>
  );
}

export default function ProjectPhotos({ project }) {
  const [photos, setPhotos] = useState(() => project.photos?.length ? project.photos : null);
  const [version, setVersion] = useState(0);
  const [files, setFiles] = useState([]);
  const [inputKey, setInputKey] = useState(0);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState('');
  const [listError, setListError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const operation = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    getProjectPhotos(project, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(result)) throw new Error('Respuesta de galería inválida.');
      setPhotos(result);
      setListError('');
    }).catch((error) => {
      if (!controller.signal.aborted) setListError(describeProjectError(error, 'No se pudo cargar la galería.'));
    });
    return () => controller.abort();
  }, [project, version]);

  useEffect(() => {
    if (!selected) return undefined;
    const controller = new AbortController();
    let url;
    getProjectPhoto(project, selected.id, controller.signal).then((blob) => {
      if (controller.signal.aborted) return;
      if (blob.type !== 'image/png' || !blob.size) throw new Error('Formato inválido.');
      url = URL.createObjectURL(blob);
      setPreview(url);
    }).catch((error) => {
      if (!controller.signal.aborted) setPreviewError(describeProjectError(error, 'No se pudo abrir esta fotografía.'));
    });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [project, selected]);

  async function handleUpload() {
    if (operation.current || files.length === 0) return;
    operation.current = true;
    setUploadError('');
    setUploading(true);
    try {
      const failed = await uploadProjectPhotos(project, files);
      setFiles(failed.map(({ file }) => file));
      setInputKey((current) => current + 1);
      if (failed.length) setUploadError(failed.map(({ file, message }) => file.name + ': ' + message).join(' '));
      setVersion((current) => current + 1);
    } catch (error) {
      setUploadError(describeProjectError(error, 'No se pudieron guardar las fotos.'));
    } finally {
      setUploading(false);
      operation.current = false;
    }
  }

  async function handleDelete() {
    if (!deleteTarget || operation.current) return;
    operation.current = true;
    setDeleting(true);
    setUploadError('');
    try {
      await deleteProjectPhoto(project, deleteTarget.id);
      setPhotos((current) => current.filter((photo) => photo.id !== deleteTarget.id));
      if (selected?.id === deleteTarget.id) {
        setPreview('');
        setPreviewError('');
        setSelected(null);
      }
      setDeleteTarget(null);
      setVersion((current) => current + 1);
    } catch (error) {
      setUploadError(describeProjectError(error, 'No se pudo eliminar la fotografía.'));
    } finally {
      operation.current = false;
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <ProjectPhotoInput key={inputKey} id="gallery-photos" disabled={uploading || deleting}
        onChange={(selectedFiles) => {
          if ((photos?.length ?? 0) + selectedFiles.length > 20) {
            setFiles([]);
            setUploadError('La obra admite hasta 20 fotografías.');
            setInputKey((current) => current + 1);
            return;
          }
          setUploadError('');
          setFiles(selectedFiles);
        }} />
      <button type="button" disabled={uploading || deleting || !files.length} onClick={handleUpload}
        className="rounded-lg bg-industrial-orange px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {uploading ? 'Subiendo fotos…' : uploadError && files.length ? 'Reintentar fotos fallidas' : 'Guardar fotos seleccionadas'}
      </button>
      {uploadError && <p role="alert" className="break-words text-sm text-error">{uploadError}</p>}
      {listError ? (
        <p role="alert" className="text-sm text-error">{listError}{' '}
          <button type="button" className="underline" onClick={() => setVersion((current) => current + 1)}>Reintentar</button>
        </p>
      ) : photos === null ? <p role="status">Cargando fotografías…</p> : photos.length === 0 ? (
        <p className="text-sm text-secondary">Esta obra todavía no tiene fotografías.</p>
      ) : (
        <ul className="space-y-2">
          {photos.map((photo) => (
            <li key={photo.id}>
              <button type="button" className="break-all text-left text-sm font-semibold text-primary underline"
                onClick={() => {
                  if (selected?.id === photo.id && !previewError) return;
                  setPreview('');
                  setPreviewError('');
                  setSelected({ ...photo });
                }}>{photo.nombre}</button>
              <button type="button" disabled={deleting || uploading} className="ml-3 text-sm text-error underline"
                onClick={() => { setUploadError(''); setDeleteTarget(photo); }}
                aria-label={'Eliminar foto ' + photo.nombre}>Eliminar</button>
              <PhotoMetadata photo={photo} />
              {deleteTarget?.id === photo.id && (
                <div className="mt-2 rounded-lg border border-outline-variant bg-white p-3 text-sm">
                  <p>¿Eliminar la foto {photo.nombre}?</p>
                  <button type="button" disabled={deleting} className="mt-2 text-error underline" onClick={handleDelete}>
                    {deleting ? 'Eliminando…' : 'Confirmar eliminación de foto'}
                  </button>
                  <button type="button" disabled={deleting} className="ml-3 underline" onClick={() => setDeleteTarget(null)}>
                    Cancelar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {selected && !preview && !previewError && <p role="status" className="text-sm">Cargando fotografía…</p>}
      {previewError && <p role="alert" className="text-sm text-error">{previewError}</p>}
      {preview && <img src={preview} alt={selected.nombre} className="max-h-80 w-full rounded-lg object-contain" />}
    </div>
  );
}
