import { useState } from 'react';
import { auth } from '../services/supabase';
import AuthPanel from '../components/auth/AuthPanel';

export default function VerifyEmailPage({ recovery = false }) {
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token_hash'));
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (busy || !auth || !token) return;
    setBusy(true);
    setError('');
    try {
      if (!verified) {
        const result = await auth.verifyOtp({
          token_hash: token,
          type: recovery ? 'recovery' : 'email',
        });
        if (result.error) throw result.error;
        const url = new URL(window.location.href);
        url.searchParams.delete('token_hash');
        window.history.replaceState(null, '', url);
        setVerified(true);
      }
      if (recovery) {
        const result = await auth.updateUser({ password });
        if (result.error) throw result.error;
      }
      await auth.signOut({ scope: 'local' });
      setPassword('');
      setComplete(true);
    } catch {
      setError(recovery && verified
        ? 'No se pudo actualizar la contraseña. Revisa los requisitos e inténtalo de nuevo.'
        : 'No se pudo completar la solicitud. Si el enlace expiró, solicita uno nuevo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh content-center bg-background px-3 pb-8 pt-24 sm:px-5">
      <AuthPanel title={recovery ? 'Crear nueva contraseña' : 'Verificar correo electrónico'}
        icon={recovery ? 'lock_reset' : 'mark_email_read'}>
        {complete && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">
          {recovery ? 'Contraseña actualizada.' : 'Correo verificado.'}
        </p>}
        {!token && <p role="alert" className="rounded-lg bg-surface p-3 text-sm">El enlace está incompleto. Solicita uno nuevo.</p>}
        {error && <p role="alert" className="mb-4 rounded-lg bg-error-container p-3 text-sm text-error">{error}</p>}
        {!complete && auth && token && (
          <form onSubmit={submit} className="space-y-4">
            {recovery && (
              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-primary">Nueva contraseña</label>
                <div className="relative mt-1.5">
                  <input id="new-password" type={visible ? 'text' : 'password'} autoComplete="new-password"
                    aria-describedby="password-length" required minLength={8} disabled={busy}
                    value={password} onChange={(event) => setPassword(event.target.value)}
                    className="block w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-3 pr-12 focus:border-primary" />
                  <button type="button" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-secondary">
                    <span aria-hidden="true" className="material-symbols-outlined text-xl">{visible ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                <p id="password-length" className="mt-2 text-sm text-secondary">Usa al menos 8 caracteres.</p>
              </div>
            )}
            <button type="submit" disabled={busy}
              className="w-full rounded-lg bg-industrial-orange px-4 py-3 text-sm font-semibold text-white hover:bg-on-tertiary-fixed-variant disabled:opacity-60">
              {busy ? 'Procesando…' : recovery ? 'Guardar contraseña' : 'Confirmar mi correo'}
            </button>
          </form>
        )}
        <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" href={window.location.pathname + '#login'}>
          <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_back</span>
          Volver al inicio de sesión
        </a>
      </AuthPanel>
    </main>
  );
}
