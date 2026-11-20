import { useEffect, useState } from 'react';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import getFirebaseActionParams from '../utils/firebaseActionParams';
import { auth, isFirebaseConfigured } from '../services/firebase';

function getVerificationError(error) {
  if (['auth/expired-action-code', 'auth/invalid-action-code'].includes(error?.code)) {
    return 'Este enlace expiró, ya fue utilizado o no es válido. Solicita un nuevo correo de verificación.';
  }
  if (error?.code === 'auth/too-many-requests') {
    return 'Se realizaron demasiados intentos. Espera un momento antes de volver a intentarlo.';
  }
  if (error?.code === 'auth/network-request-failed') {
    return 'No se pudo conectar con Firebase. Comprueba tu conexión e inténtalo nuevamente.';
  }
  return 'No fue posible verificar el enlace. Solicita un nuevo correo o inténtalo más tarde.';
}

export default function VerifyEmailPage() {
  const [actionCode, setActionCode] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const { mode, oobCode } = getFirebaseActionParams();

    if (!isFirebaseConfigured || !auth) {
      setErrorMessage('La autenticación no está configurada. Contacta al administrador.');
      setStatus('invalid');
      return () => { active = false; };
    }

    if (mode !== 'verifyEmail' || !oobCode) {
      setErrorMessage('El enlace de verificación está incompleto o no es válido.');
      setStatus('invalid');
      return () => { active = false; };
    }

    checkActionCode(auth, oobCode)
      .then((actionInfo) => {
        if (!active) return;
        if (actionInfo.operation !== 'VERIFY_EMAIL') {
          setErrorMessage('El enlace no corresponde a una verificación de correo.');
          setStatus('invalid');
          return;
        }
        setActionCode(oobCode);
        setEmail(actionInfo.data?.email || '');
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        setErrorMessage(getVerificationError(error));
        setStatus('invalid');
      });

    return () => { active = false; };
  }, []);

  const handleConfirm = async () => {
    if (!actionCode) return;
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await applyActionCode(auth, actionCode);
      setActionCode('');
      setStatus('success');
    } catch (error) {
      setErrorMessage(getVerificationError(error));
      if (['auth/expired-action-code', 'auth/invalid-action-code'].includes(error?.code)) {
        setActionCode('');
        setStatus('invalid');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-[#eef2ff] px-4 py-12 pt-24">
      <section className="w-full max-w-xl rounded-3xl border border-surface-variant bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-industrial-orange">
            <span className="material-symbols-outlined text-3xl" aria-hidden="true">
              {status === 'success' ? 'mark_email_read' : 'mark_email_unread'}
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-industrial-orange">G&amp;G Construcciones S.A.S.</p>
          <h1 className="mt-2 font-headline-xl text-2xl font-bold text-primary sm:text-3xl">
            {status === 'success' ? 'Correo verificado' : 'Verificar correo electrónico'}
          </h1>
          {status === 'ready' && (
            <p className="mt-2 text-sm text-secondary">
              Confirma la verificación{email ? <> de <strong className="text-primary">{email}</strong></> : ''}.
            </p>
          )}
        </div>

        {status === 'checking' && (
          <p role="status" className="text-center text-sm text-secondary">Comprobando el enlace de verificación...</p>
        )}

        {status === 'ready' && (
          <div className="space-y-4 text-center">
            <p className="text-sm leading-relaxed text-secondary">
              Tu correo aún no ha sido cambiado. Para finalizar la verificación, confirma explícitamente con el botón.
            </p>
            {errorMessage && <p role="alert" className="rounded-lg border border-error/20 bg-error-container p-3 text-sm text-error">{errorMessage}</p>}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting || !actionCode}
              className="w-full rounded-xl bg-industrial-orange px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-industrial-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Verificando...' : 'Confirmar mi correo'}
            </button>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-4 text-center">
            <p role="alert" className="rounded-lg border border-error/20 bg-error-container p-3 text-sm text-error">{errorMessage}</p>
            <p className="text-sm text-secondary">
              Vuelve al inicio de sesión para solicitar otro correo de verificación.
            </p>
            <a href={window.location.pathname + '#login'} className="block w-full rounded-xl bg-industrial-orange px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-industrial-orange/90">
              Ir al inicio de sesión
            </a>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 text-center">
            <p role="status" className="text-sm leading-relaxed text-secondary">
              Tu dirección de correo fue verificada. Regresa al portal para continuar.
            </p>
            <a href={window.location.pathname + '#login'} className="block w-full rounded-xl bg-industrial-orange px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-industrial-orange/90">
              Regresar al inicio de sesión
            </a>
          </div>
        )}
      </section>
    </main>
  );
}
