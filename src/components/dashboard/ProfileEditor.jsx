import { useState } from 'react';
import { apiFetch } from '../../services/api';
import { prepareProfilePhoto } from '../../utils/preparePhoto';
import { describeProjectError, PROJECT_PHOTO_TYPES } from '../../services/projectService';

export default function ProfileEditor({ name, onSaved }) {
  const [draft, setDraft] = useState(name);
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage('');
    try {
      const body = new FormData();
      if (draft.trim() !== name) {
        if (!draft.trim()) throw new Error('Ingresa tu nombre antes de guardar.');
        body.append('nombre', draft.trim());
      }
      if (photo) body.append('foto', await prepareProfilePhoto(photo), 'perfil.png');
      await apiFetch('/api/panel/perfil', { method: 'POST', body });
      onSaved(draft.trim(), Boolean(photo));
      form.elements.foto.value = '';
      setPhoto(null);
      setMessage('Perfil actualizado.');
    } catch (error) {
      setMessage(describeProjectError(error, 'No se pudo guardar el perfil.'));
    } finally { setBusy(false); }
  }

  return <form onSubmit={save} className="space-y-3">
    <h3 className="text-xl font-bold text-primary">Mi perfil</h3>
    <label className="block">Nombre
      <input className="block w-full rounded-lg border p-2" value={draft} maxLength={100} disabled={busy}
        onChange={(event) => setDraft(event.target.value)} />
    </label>
    <label className="block">Foto de perfil
      <input name="foto" type="file" accept={PROJECT_PHOTO_TYPES} disabled={busy} className="block"
        onChange={(event) => { setPhoto(event.target.files[0]); setMessage(''); }} />
    </label>
    <button className="rounded-lg bg-primary px-4 py-2 text-white" disabled={busy || (!photo && draft.trim() === name)}>
      {busy ? 'Guardando…' : 'Guardar perfil'}
    </button>
    {message && <p role="status">{message}</p>}
  </form>;
}
