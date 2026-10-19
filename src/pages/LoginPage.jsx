import { useState } from 'react';
import EngineerDashboard from '../components/dashboard/EngineerDashboard';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import {
  friendlyAuthError,
  loginWithEmail,
  loginWithGoogle,
  loginWithMicrosoft,
  logout,
  sendMagicLink,
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
  onLogout,
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
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 text-sm font-semibold text-secondary underline-offset-2 hover:text-primary hover:underline"
        >
          Cerrar sesión
        </button>
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
  const [activeTab, setActiveTab] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verificationAction, setVerificationAction] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const runAuth = async (operation) => {
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      await operation();
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = (event) => {
    event.preventDefault();
    return runAuth(() => loginWithEmail(email, password, remember));
  };

  const handleMagicLink = (event) => {
    event.preventDefault();
    return runAuth(async () => {
      await sendMagicLink(email);
      setNotice('Si el correo puede iniciar sesión, recibirás un enlace seguro. Revisa también la carpeta de correo no deseado.');
    });
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
        onLogout={handleLogout}
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
        <div className="mb-6 flex items-center justify-between">
          <a href="#hero" className="group inline-flex items-center gap-2 text-sm font-medium text-secondary transition-colors hover:text-primary">
            <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span>Volver a la página principal</span>
          </a>
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-variant bg-white px-3 py-1 text-xs text-secondary shadow-sm">
            <span className={`h-2 w-2 rounded-full ${isFirebaseConfigured ? 'animate-pulse bg-green-500' : 'bg-amber-500'}`} />
            <span className="font-mono text-[11px]">Acceso seguro</span>
          </div>
        </div>

        {authenticatedContent || (
          <div className="grid min-h-[640px] grid-cols-1 overflow-hidden rounded-3xl border border-surface-variant/80 bg-white shadow-xl lg:grid-cols-12">
            <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary-container to-[#00142e] p-8 text-white lg:col-span-5 lg:p-10">
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
                  <div>
                    <h2 className="font-headline-sm text-2xl font-bold leading-none tracking-tight text-white">G&amp;G</h2>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-industrial-orange">Construcciones S.A.S</p>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-orange-200">
                    <span className="material-symbols-outlined text-sm text-industrial-orange">verified_user</span>
                    <span>Portal Oficial SG-SST &amp; Obras</span>
                  </div>
                  <h1 className="font-headline-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Gestión Segura de Ingeniería y Salud Laboral
                  </h1>
                  <p className="font-body-sm text-sm leading-relaxed text-white/75">
                    Plataforma integral para control de acceso en obra, reporte de actos y condiciones inseguras, inspección de EPP y cumplimiento normativo ISO 45001.
                  </p>
                </div>
              </div>

              <div className="relative z-10 my-8 space-y-4">
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                    <span className="material-symbols-outlined text-base text-industrial-orange">shield</span>
                    Autenticación protegida por Firebase
                  </div>
                  <p className="text-xs text-white/60">
                    El acceso y los permisos se validan con el servicio de autenticación y el backend corporativo.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="font-headline-sm block text-xl font-bold text-industrial-orange">428+</span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-white/70">Días continuos sin incidentes LTI</span>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="font-headline-sm block text-xl font-bold text-white">100%</span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-white/70">Trazabilidad de seguridad en obra</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/60">
                <span>Resolución 0312 de 2019</span>
                <span className="font-mono text-[11px]">G&amp;G SG-SST</span>
              </div>
            </section>

            <section className="flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-7">
              <div className="mb-6">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-industrial-orange">Acceso Corporativo</span>
                <h2 className="mt-1 font-headline-sm text-2xl font-bold text-primary">Acceso para administradores</h2>
                <p className="mt-1 text-sm text-secondary">Ingresa con tu cuenta corporativa o solicita un enlace seguro por correo.</p>
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
              {notice && (
                <div role="status" className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-900">
                  <span className="material-symbols-outlined text-base text-green-600">mark_email_read</span>
                  <span className="font-medium">{notice}</span>
                </div>
              )}

              <div className="mb-6 flex border-b border-surface-variant">
                <button
                  type="button"
                  onClick={() => { setActiveTab('password'); setError(''); setNotice(''); }}
                  className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold transition-all ${activeTab === 'password' ? 'border-industrial-orange text-industrial-orange' : 'border-transparent text-secondary hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-base">login</span>
                  Correo y contraseña
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('link'); setError(''); setNotice(''); }}
                  className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold transition-all ${activeTab === 'link' ? 'border-industrial-orange text-industrial-orange' : 'border-transparent text-secondary hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-base">forward_to_inbox</span>
                  Enlace por correo
                </button>
              </div>

              <form onSubmit={activeTab === 'password' ? handlePasswordLogin : handleMagicLink} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-1 block text-xs font-semibold uppercase text-secondary">Correo electrónico</label>
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

                {activeTab === 'password' && (
                  <>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <label htmlFor="login-password" className="block text-xs font-semibold uppercase text-secondary">Contraseña</label>
                        <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-xs font-medium text-industrial-orange hover:underline">
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
                        <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                          <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                    <label className="flex cursor-pointer select-none items-center gap-2 pt-1">
                      <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-outline-variant text-industrial-orange focus:ring-industrial-orange/30" />
                      <span className="text-xs font-medium text-secondary">Mantener sesión activa</span>
                    </label>
                  </>
                )}

                <button
                  type="submit"
                  disabled={!isFirebaseConfigured || isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-industrial-orange px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-industrial-orange/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-outline/50 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">{activeTab === 'password' ? 'login' : 'send'}</span>
                      <span>{activeTab === 'password' ? 'Iniciar Sesión' : 'Enviar enlace de acceso'}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-variant" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 font-semibold text-secondary">O ingresa con</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!isFirebaseConfigured || isSubmitting}
                  onClick={() => runAuth(loginWithGoogle)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2.5 text-xs font-semibold text-secondary transition-all hover:border-outline hover:bg-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.09C3.3 21.44 7.37 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.09z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.3 2.56 1.27 6.59l4.01 3.09c.95-2.83 3.6-4.93 6.72-4.93z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  disabled={!isFirebaseConfigured || isSubmitting}
                  onClick={() => runAuth(loginWithMicrosoft)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2.5 text-xs font-semibold text-secondary transition-all hover:border-outline hover:bg-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="grid h-4 w-4 grid-cols-2 gap-0.5" aria-hidden="true">
                    <span className="bg-[#f25022]" /><span className="bg-[#7fba00]" />
                    <span className="bg-[#00a4ef]" /><span className="bg-[#ffb900]" />
                  </span>
                  Microsoft
                </button>
              </div>
              <div className="mt-6 border-t border-surface-variant pt-5 text-center">
                <p className="mx-auto max-w-xl text-sm leading-relaxed text-secondary">
                  ¿Te autorizaron como administrador y aún no tienes cuenta? Entra con Google o con enlace por correo: tu cuenta se crea automáticamente la primera vez.
                </p>
              </div>
            </section>
          </div>
        )}
      </div>

      <ForgotPasswordModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  );
}
