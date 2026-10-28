import { useState } from 'react';
import EngineerDashboard from '../components/dashboard/EngineerDashboard';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import {
  friendlyAuthError,
  loginWithEmail,
  logout,
  sendVerificationEmail,
} from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';
import useAuth from '../utils/useAuth';

function LoadingSpinner({ label }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-surface-variant bg-white p-8 shadow-xl">
      <div className="text-center">
        <svg className="mx-auto h-9 w-9 animate-spin text-industrial-orange" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-4 text-sm font-medium text-secondary">{label}</p>
      </div>
    </div>
  );
}

function AccessMessage({ icon, title, message, onLogout, error = false }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-surface-variant bg-white p-8 shadow-xl">
      <div className="max-w-lg text-center">
        <span className={`material-symbols-outlined text-5xl ${error ? 'text-error' : 'text-industrial-orange'}`}>
          {icon}
        </span>
        <h2 className="mt-4 font-headline-sm text-2xl font-bold text-primary">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{message}</p>
        <button
          type="button"
          onClick={onLogout}
          className="mt-6 rounded-xl bg-industrial-orange px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-industrial-orange/90"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function VerificationMessage({
  email,
  message,
  error,
  isSending,
  isChecking,
  onResend,
  onCheck,
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-surface-variant bg-white p-8 shadow-xl">
      <div className="max-w-lg text-center">
        <span className="material-symbols-outlined text-5xl text-industrial-orange">mark_email_unread</span>
        <h2 className="mt-4 font-headline-sm text-2xl font-bold text-primary">Verifica tu correo</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Enviamos un enlace de verificación a <strong className="text-primary">{email}</strong>. Verifica tu dirección para que podamos comprobar tu acceso.
        </p>
        {message && (
          <p role="status" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-lg border border-error/20 bg-error-container p-3 text-sm text-error">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onResend}
            disabled={isSending || isChecking}
            className="rounded-xl border border-outline-variant px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-industrial-orange hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSending ? 'Enviando...' : 'Reenviar correo de verificación'}
          </button>
          <button
            type="button"
            onClick={onCheck}
            disabled={isSending || isChecking}
            className="rounded-xl bg-industrial-orange px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-industrial-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChecking ? 'Comprobando...' : 'Ya verifiqué, volver a comprobar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const {
    loading,
    firebaseUser,
    profile,
    role,
    canAccessPanel,
    error: profileError,
    refreshProfile,
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationAction, setVerificationAction] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password, remember);
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setError('');
    } catch (logoutError) {
      setError(friendlyAuthError(logoutError));
    }
  };

  const handleResendVerification = async () => {
    setVerificationMessage('');
    setVerificationError('');
    setVerificationAction('resend');
    try {
      await sendVerificationEmail(firebaseUser);
      setVerificationMessage('Correo de verificación enviado. Revisa también la carpeta de correo no deseado.');
    } catch (verificationSendError) {
      setVerificationError(friendlyAuthError(verificationSendError));
    } finally {
      setVerificationAction('');
    }
  };

  const handleCheckVerification = async () => {
    setVerificationMessage('');
    setVerificationError('');
    setVerificationAction('check');
    try {
      await firebaseUser.reload();
      await firebaseUser.getIdToken(true);
      await refreshProfile(firebaseUser);
    } catch (verificationCheckError) {
      setVerificationError(
        verificationCheckError?.message ||
          'No se pudo volver a comprobar la verificación. Inténtalo de nuevo.',
      );
    } finally {
      setVerificationAction('');
    }
  };

  let authenticatedContent;
  if (loading) {
    authenticatedContent = <LoadingSpinner label="Verificando tu sesión y consultando el perfil..." />;
  } else if (firebaseUser && firebaseUser.emailVerified === false) {
    authenticatedContent = (
      <VerificationMessage
        email={firebaseUser.email || 'tu cuenta'}
        message={verificationMessage}
        error={verificationError}
        isSending={verificationAction === 'resend'}
        isChecking={verificationAction === 'check'}
        onResend={handleResendVerification}
        onCheck={handleCheckVerification}
      />
    );
  } else if (firebaseUser && profileError) {
    authenticatedContent = (
      <AccessMessage
        icon="cloud_off"
        title="No se pudo validar tu perfil"
        message="El servidor no respondió o no fue posible consultar tus permisos. Verifica que el backend esté disponible e inténtalo de nuevo."
        onLogout={handleLogout}
        error
      />
    );
  } else if (firebaseUser && !canAccessPanel) {
    authenticatedContent = (
      <AccessMessage
        icon="admin_panel_settings"
        title="Tu correo no está autorizado"
        message="Pide a un administrador que lo agregue a la lista de acceso."
        onLogout={handleLogout}
      />
    );
  } else if (firebaseUser && canAccessPanel) {
    authenticatedContent = (
      <EngineerDashboard
        currentUser={{
          name: profile.nombre || profile.email,
          email: profile.email,
          role,
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-20 selection:bg-industrial-orange selection:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {authenticatedContent || (
          <div className="grid min-h-[640px] grid-cols-1 overflow-hidden rounded-3xl border border-surface-variant/80 bg-white shadow-xl lg:grid-cols-12">
            <section className="relative hidden flex-col justify-center overflow-hidden bg-gradient-to-br from-primary via-primary-container to-[#00142e] p-8 text-white lg:col-span-5 lg:flex lg:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-10">
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
              </div>
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-industrial-orange/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-industrial-orange/15 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-industrial-orange shadow-lg shadow-industrial-orange/30">
                    <span className="material-symbols-outlined text-3xl text-white">foundation</span>
                  </div>
                  <span className="font-headline-sm text-2xl font-bold leading-none tracking-tight text-white">G&amp;G</span>
                </div>
                <h1 className="mt-8 font-headline-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                  Portal de administración
                </h1>
                <p className="mt-3 font-body-sm text-sm leading-relaxed text-white/75">
                  Gestión segura de proyectos y seguridad laboral.
                </p>
              </div>
            </section>

            <section className="flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-7">
              <div className="mb-6">
                <h2 className="font-headline-sm text-2xl font-bold text-primary">Iniciar sesión</h2>
                <p className="mt-1 text-sm text-secondary">Acceso exclusivo para administradores.</p>
              </div>

              {!isFirebaseConfigured && (
                <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>Firebase no está configurado. Completa las variables VITE_FIREBASE_* del archivo .env y reinicia Vite.</span>
                </div>
              )}
              {error && (
                <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-error/20 bg-error-container p-3 text-xs text-error">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-1 block text-xs font-semibold uppercase text-secondary">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">mail</span>
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      disabled={!isFirebaseConfigured || isSubmitting}
                      placeholder="nombre@gygconstrucciones.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-10 pr-3 text-sm transition-all focus:border-industrial-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-industrial-orange/40 disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label htmlFor="login-password" className="block text-xs font-semibold uppercase text-secondary">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs font-medium text-industrial-orange hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">lock</span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      disabled={!isFirebaseConfigured || isSubmitting}
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-surface py-2.5 pl-10 pr-11 text-sm transition-all focus:border-industrial-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-industrial-orange/40 disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>

                <label className="flex cursor-pointer select-none items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-outline-variant text-industrial-orange focus:ring-industrial-orange/30"
                  />
                  <span className="text-xs font-medium text-secondary">Mantener sesión activa</span>
                </label>

                <button
                  type="submit"
                  disabled={!isFirebaseConfigured || isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-industrial-orange px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-industrial-orange/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-outline/50 disabled:shadow-none"
                >
                  {isSubmitting ? 'Procesando...' : 'Iniciar sesión'}
                </button>
              </form>

              <p className="mt-6 border-t border-surface-variant pt-5 text-center text-sm leading-relaxed text-secondary">
                ¿Necesitas acceso? Solicítalo a un administrador de G&amp;G.
              </p>
            </section>
          </div>
        )}
      </div>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
}
