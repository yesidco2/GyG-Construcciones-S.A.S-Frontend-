import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { describeProjectError } from '../services/projectService';

export async function uploadDocuments(projectId, files) {
  const failures = [];
  for (const file of files) {
    try {
      if (!file.size || file.size > 5 * 1024 * 1024) throw new Error('El PDF debe pesar hasta 5 MB.');
      const body = new FormData();
      body.append('archivo', file);
      await apiFetch('/api/panel/obras/' + projectId + '/documentos', { method: 'POST', body, timeoutMs: 60000 });
    } catch (error) {
      failures.push(file.name + ': ' + describeProjectError(error, 'Falló la carga.'));
    }
  }
  return failures;
}

export function DocumentInput({ onChange, disabled }) {
  return <label className="block space-y-2 text-sm font-semibold">Documentos PDF (hasta 5 MB por archivo)
    <input type="file" multiple accept="application/pdf,.pdf" disabled={disabled} className="block w-full"
      onChange={(event) => onChange(Array.from(event.target.files))} />
    <span className="block font-normal text-secondary">Visibles para quienes consulten la obra con su código.</span>
  </label>;
}

export default function ProjectDocuments({ projectId, documents, code, blocked, onRateLimit }) {
  const [list, setList] = useState([]);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const path = '/api/panel/obras/' + projectId + '/documentos';

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    apiFetch(path, { signal: controller.signal }).then(setList).catch((err) => {
      if (!controller.signal.aborted) setError(describeProjectError(err, 'No se pudieron cargar los documentos.'));
    });
    return () => controller.abort();
  }, [path, projectId, revision]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  async function open(doc) {
    setError('');
    setBusy(true);
    setPreview(null);
    try {
      const url = projectId ? path + '/' + doc.id : '/api/obras/seguimiento/documentos/' + doc.id;
      const options = projectId ? {} : { method: 'POST', body: JSON.stringify({ codigo: code }) };
      const blob = await apiFetch(url, { ...options, responseType: 'blob', headers: { Accept: 'application/pdf' } });
      setPreview({ url: URL.createObjectURL(blob), name: doc.nombre });
    } catch (err) {
      if (err.status === 429) onRateLimit?.(err);
      setError(describeProjectError(err, 'No se pudo abrir el PDF.'));
    } finally { setBusy(false); }
  }

  async function upload() {
    setBusy(true);
    try {
      const failures = await uploadDocuments(projectId, files);
      setError(failures.join(' '));
      setFiles([]);
      setRevision((value) => value + 1);
    } finally { setBusy(false); }
  }

  return <section className="space-y-3 rounded-2xl border border-surface-variant bg-white p-4">
    <h3 className="font-bold text-primary">Documentos de la obra</h3>
    {projectId && <>
      <DocumentInput key={revision} onChange={setFiles} disabled={busy} />
      {files.length > 0 && <button type="button" disabled={busy} onClick={upload} className="underline">Guardar documentos</button>}
    </>}
    {(documents ?? list).length === 0 && <p className="text-sm text-secondary">Sin documentos registrados.</p>}
    {(documents ?? list).map((doc) => <button type="button" key={doc.id} disabled={busy || blocked}
      className="block text-left underline" onClick={() => open(doc)}>Ver {doc.nombre}</button>)}
    {busy && <p role="status">Procesando documentos…</p>}
    {error && <p role="alert">{error}</p>}
    {preview && <a className="font-semibold underline" href={preview.url} target="_blank" rel="noopener noreferrer">Abrir PDF: {preview.name}</a>}
  </section>;
}
