import { useState } from 'react';
import { auth } from '../services/supabase';

export default function VerifyEmailPage({ recovery = false }) {
  const [token] = useState(() => new URLSearchParams(window.location.search).get('token_hash'));
  const [password, setPassword] = useState('');
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
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-24">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl">
        <h1 className="mb-5 text-2xl font-bold text-primary">
          {recovery ? 'Cambiar contraseña' : 'Verificar correo electrónico'}
        </h1>
        {complete && <p role="status">{recovery ? 'Contraseña actualizada.' : 'Correo verificado.'}</p>}
        {!token && <p role="alert">El enlace está incompleto. Solicita uno nuevo.</p>}
        {error && <p role="alert" className="mb-4 text-error">{error}</p>}
        {!complete && auth && token && (
          <form onSubmit={submit} className="space-y-4">
            {recovery && (
              <label className="block">
                Nueva contraseña
                <input type="password" autoComplete="new-password" required minLength={8}
                  value={password} onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 block w-full rounded-lg border p-3" />
              </label>
            )}
            <button type="submit" disabled={busy}
              className="rounded-xl bg-industrial-orange px-5 py-3 text-white disabled:opacity-60">
              {busy ? 'Procesando…' : recovery ? 'Guardar contraseña' : 'Confirmar mi correo'}
            </button>
          </form>
        )}
        <a className="mt-6 inline-block underline" href={window.location.pathname + '#login'}>
          Volver al inicio de sesión
        </a>
      </section>
    </main>
  );
}
