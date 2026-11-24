import { useState } from 'react';
import { apiFetch } from '../../services/api';
import { prepareProfilePhoto } from '../../utils/preparePhoto';
import { describeProjectError, PROJECT_PHOTO_TYPES } from '../../services/projectService';

export default function ProfileEditor({ name, avatar, onSaved }) {
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

  return <form onSubmit={save} className="portal-profile-form">
    <header className="portal-profile-header">
      {avatar ? (
        <img src={avatar} alt="" className="portal-profile-avatar" />
      ) : (
        <span className="portal-profile-avatar material-symbols-outlined" aria-hidden="true">person</span>
      )}
      <div className="portal-workspace-heading">
        <h3>Mi perfil</h3>
        <p>Actualiza tu nombre y tu foto.</p>
      </div>
    </header>
    <label className="block">Nombre
      <input className="portal-profile-name" autoComplete="name" value={draft} maxLength={100} disabled={busy}
        onChange={(event) => setDraft(event.target.value)} />
    </label>
    <label className="block">Foto de perfil
      <input name="foto" type="file" accept={PROJECT_PHOTO_TYPES} disabled={busy} className="portal-profile-file"
        onChange={(event) => { setPhoto(event.target.files[0]); setMessage(''); }} />
    </label>
    <button type="submit" className="portal-profile-save" disabled={busy || (!photo && draft.trim() === name)}>
      {busy ? 'Guardando…' : 'Guardar perfil'}
    </button>
    {message && <p role="status">{message}</p>}
  </form>;
}
