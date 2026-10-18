import { useState } from 'react';
import {
  friendlyAuthError,
  loginWithGoogle,
  loginWithMicrosoft,
  registerWithEmail,
} from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';

const passwordRequirements = [
  { label: 'Mínimo 8 caracteres', test: (value) => value.length >= 8 },
  { label: 'Al menos una mayúscula', test: (value) => /[A-Z]/.test(value) },
  { label: 'Al menos una minúscula', test: (value) => /[a-z]/.test(value) },
  { label: 'Al menos un número', test: (value) => /\d/.test(value) },
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedDataTreatment, setAcceptedDataTreatment] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const runSocialRegistration = async (providerLogin) => {
    setError('');
    setIsSubmitting(true);
    try {
      await providerLogin();
      window.location.hash = 'login';
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const passwordIsValid = passwordRequirements.every((requirement) => requirement.test(password));
    if (!passwordIsValid) {
      setError('La contraseña debe cumplir todos los requisitos de seguridad indicados.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!acceptedDataTreatment) {
      setError('Debes aceptar el tratamiento de datos personales para continuar.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithEmail(name, email, password);
      setSuccess(true);
    } catch (authError) {
      setError(friendlyAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <span className="font-mono text-[11px]">Registro seguro</span>
          </div>
        </div>

        <div className="grid min-h-[640px] grid-cols-1 overflow-hidden rounded-3xl border border-surface-variant/80 bg-white shadow-xl lg:grid-cols-12">
          <section className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-primary-container to-[#00142e] p-8 text-white lg:col-span-5 lg:p-10">
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="register-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#register-grid-pattern)" />
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
                  Crea tu cuenta corporativa
                </h1>
                <p className="font-body-sm text-sm leading-relaxed text-white/75">
                  Registra tus datos para verificar tu correo. El acceso al panel requiere asignación de permisos por un administrador.
                </p>
              </div>
            </div>

            <div className="relative z-10 my-8 space-y-4">
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <span className="material-symbols-outlined text-base text-industrial-orange">shield</span>
                  Datos protegidos
                </div>
                <p className="text-xs text-white/60">
                  La autenticación se realiza de forma segura y los roles de acceso son asignados por el backend.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-headline-sm block text-xl font-bold text-industrial-orange">SG-SST</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-white/70">Gestión de seguridad laboral</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="font-headline-sm block text-xl font-bold text-white">G&amp;G</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-white/70">Construcciones S.A.S</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-white/60">
              <span>Ley 1581 de 2012</span>
              <span className="font-mono text-[11px]">G&amp;G SG-SST</span>
            </div>
          </section>

          <section className="flex flex-col justify-center bg-white p-6 sm:p-10 lg:col-span-7">
            <div className="mb-6">
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-industrial-orange">Crear cuenta</span>
              <h2 className="mt-1 font-headline-sm text-2xl font-bold text-primary">
                {success ? 'Verifica tu correo' : 'Registro de usuario'}
              </h2>
              <p className="mt-1 text-sm text-secondary">
                {success ? 'Ya casi terminas el proceso de registro.' : 'Completa tus datos para crear una cuenta.'}
              </p>
            </div>

            {!isFirebaseConfigured && (
              <div role="alert" className="mb-5 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                <span className="material-symbols-outlined text-base">info</span>
                <span>Firebase no está configurado. Completa las variables VITE_FIREBASE_* del archivo .env y reinicia Vite.</span>
              </div>
            )}

            {success ? (
              <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-5 text-sm leading-relaxed text-green-900">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-xl text-green-600">mark_email_read</span>
                  <p>Cuenta creada. Te enviamos un correo para verificar tu dirección. Un administrador debe asignarte acceso al panel.</p>
                </div>
                <a href="#login" className="mt-5 inline-flex items-center justify-center rounded-lg bg-industrial-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-industrial-orange/90">
                  Ir a iniciar sesión
                </a>
              </div>
            ) : (
              <>
                {error && (
                  <div role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-error/20 bg-error-container p-3 text-xs text-error">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="register-name" className="mb-1 block text-xs font-semibold uppercase text-secondary">Nombre completo</label>
                    <input
                      id="register-name"
                      type="text"
                      autoComplete="name"
                      disabled={!isFirebaseConfigured || isSubmitting}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm transition-all focus:border-industrial-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-industrial-orange/40 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Nombre y apellidos"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="register-email" className="mb-1 block text-xs font-semibold uppercase text-secondary">Correo electrónico</label>
                    <input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      disabled={!isFirebaseConfigured || isSubmitting}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm transition-all focus:border-industrial-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-industrial-orange/40 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="nombre@gygconstrucciones.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="register-password" className="mb-1 block text-xs font-semibold uppercase text-secondary">Contraseña</label>
                    <div className="relative">
                      <input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={!isFirebaseConfigured || isSubmitting}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 pr-11 text-sm transition-all focus:border-industrial-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-industrial-orange/40 disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Crea una contraseña segura"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                        <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    <ul className="mt-2 grid grid-cols-1 gap-1 text-[11px] text-secondary sm:grid-cols-2">
                      {passwordRequirements.map((requirement) => {
                        const passed = requirement.test(password);
                        return (
                          <li key={requirement.label} className={`flex items-center gap-1 ${passed ? 'text-green-700' : ''}`}>
                            <span className="material-symbols-outlined text-sm">{passed ? 'check_circle' : 'radio_button_unchecked'}</span>
                            {requirement.label}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div>
                    <label htmlFor="register-confirm-password" className="mb-1 block text-xs font-semibold uppercase text-secondary">Confirmar contraseña</label>
                    <input
                      id="register-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={!isFirebaseConfigured || isSubmitting}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm transition-all focus:border-industrial-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-industrial-orange/40 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Repite tu contraseña"
                      required
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-xs text-error">Las contraseñas no coinciden.</p>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={acceptedDataTreatment}
                      onChange={(event) => setAcceptedDataTreatment(event.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-outline-variant text-industrial-orange focus:ring-industrial-orange/30"
                      required
                    />
                    <span className="text-xs leading-relaxed text-secondary">
                      Acepto el tratamiento de datos personales (Ley 1581 de 2012).
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!isFirebaseConfigured || isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-industrial-orange px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-industrial-orange/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-outline/50 disabled:shadow-none"
                  >
                    {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                  </button>
                </form>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-variant" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 font-semibold text-secondary">O regístrate con</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={!isFirebaseConfigured || isSubmitting}
                    onClick={() => runSocialRegistration(loginWithGoogle)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2.5 text-xs font-semibold text-secondary transition-all hover:border-outline hover:bg-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="font-bold text-[#4285F4]">G</span>
                    Registrarse con Google
                  </button>
                  <button
                    type="button"
                    disabled={!isFirebaseConfigured || isSubmitting}
                    onClick={() => runSocialRegistration(loginWithMicrosoft)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant px-3 py-2.5 text-xs font-semibold text-secondary transition-all hover:border-outline hover:bg-surface hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="grid h-4 w-4 grid-cols-2 gap-0.5" aria-hidden="true">
                      <span className="bg-[#f25022]" /><span className="bg-[#7fba00]" />
                      <span className="bg-[#00a4ef]" /><span className="bg-[#ffb900]" />
                    </span>
                    Registrarse con Microsoft
                  </button>
                </div>

                <p className="mt-6 border-t border-surface-variant pt-5 text-center text-sm text-secondary">
                  ¿Ya tienes cuenta?{' '}
                  <a href="#login" className="font-semibold text-industrial-orange hover:underline">Iniciar sesión</a>
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
