import { useState, useEffect } from 'react';
import ReCaptcha from '../components/auth/ReCaptcha';
import AlternativeLogin from '../components/auth/AlternativeLogin';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';
import EngineerDashboard from '../components/dashboard/EngineerDashboard';
import {
  generateJWT,
  setAuthCookie,
  getCurrentSessionFromCookie,
  removeAuthCookie,
} from '../utils/auth';
import {
  getRateLimitStatus,
  consumeRateLimit,
  resetRateLimit,
} from '../utils/rateLimiter';

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_SECONDS = 60;

// Credenciales demo autorizadas para pruebas
const DEMO_CREDENTIALS = {
  email: 'admin.sst@gygconstrucciones.com',
  password: 'Seguridad2026*',
  name: 'Ing. Mateo Restrepo',
  role: 'Especialista Líder SG-SST',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
};

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('standard'); // 'standard' | 'alternative'
  
  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados de reCAPTCHA
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaKey, setRecaptchaKey] = useState(0); // Para forzar reset del widget

  // Estados de Rate Limit (5 peticiones por minuto)
  const [rateLimitStatus, setRateLimitStatus] = useState(getRateLimitStatus());

  // Estados de limitación de intentos y bloqueo
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const saved = localStorage.getItem('gg_auth_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState(() => {
    const saved = localStorage.getItem('gg_auth_lockout_until');
    return saved ? parseInt(saved, 10) : null;
  });
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Estados de interfaz y feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Sesión iniciada: comprobar primero en Cookies con JWT o fallback a localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cookieSession = getCurrentSessionFromCookie();
      if (cookieSession) return cookieSession;
      const saved = localStorage.getItem('gg_auth_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Temporizador de bloqueo regresivo
  useEffect(() => {
    if (!lockoutUntil) {
      setSecondsRemaining(0);
      return;
    }

    const checkLockout = () => {
      const now = Date.now();
      const diff = Math.ceil((lockoutUntil - now) / 1000);
      if (diff <= 0) {
        // Bloqueo terminado
        setLockoutUntil(null);
        setFailedAttempts(0);
        setSecondsRemaining(0);
        localStorage.removeItem('gg_auth_lockout_until');
        localStorage.removeItem('gg_auth_failed_attempts');
        setErrorMsg('');
      } else {
        setSecondsRemaining(diff);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  // Actualizar estado de Rate Limit cada segundo
  useEffect(() => {
    const updateRate = () => {
      setRateLimitStatus(getRateLimitStatus());
    };
    updateRate();
    const timer = setInterval(updateRate, 1000);
    return () => clearInterval(timer);
  }, []);

  const isLocked = secondsRemaining > 0;
  const attemptsLeft = Math.max(0, MAX_ATTEMPTS - failedAttempts);

  // Verificación reCAPTCHA
  const handleRecaptchaVerify = (token) => {
    setRecaptchaToken(token);
    setErrorMsg('');
  };

  const handleRecaptchaExpire = () => {
    setRecaptchaToken(null);
  };

  // Manejo de Login Estándar (Email + Contraseña con intentos + reCAPTCHA + Rate Limit + JWT en Cookies)
  const handleStandardLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. CONTROL DE RATE LIMIT (Máximo 5 peticiones por minuto)
    const rateCheck = consumeRateLimit();
    setRateLimitStatus(rateCheck.status);

    if (!rateCheck.allowed) {
      setErrorMsg(
        `🛑 HTTP 429 - Límite de Tasa Excedido (Rate Limit): Has alcanzado el límite de ${rateCheck.status.limit} peticiones por minuto. Espera ${rateCheck.status.resetSeconds}s antes de reintentar.`
      );
      return;
    }

    if (isLocked) {
      setErrorMsg(`Tu cuenta está bloqueada temporalmente. Espera ${secondsRemaining} segundos.`);
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!recaptchaToken) {
      setErrorMsg('Debes completar la verificación de seguridad reCAPTCHA antes de continuar.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Comprobación de credenciales (Acepta las de demo o formato válido para test)
      const isValid =
        (email.toLowerCase().trim() === DEMO_CREDENTIALS.email.toLowerCase() &&
          password === DEMO_CREDENTIALS.password) ||
        (email.includes('@') && password === 'GyG2026*');

      if (isValid) {
        // Generar Token JWT firmado con claims de seguridad
        const token = generateJWT({
          email: email.trim(),
          name: DEMO_CREDENTIALS.name,
          role: DEMO_CREDENTIALS.role,
          avatar: DEMO_CREDENTIALS.avatar,
          method: 'Inicio de Sesión Estándar',
        });

        // Guardar Token en Cookie Segura (SameSite=Strict)
        setAuthCookie(token, rememberMe ? 30 : 7);

        const loggedUser = {
          name: DEMO_CREDENTIALS.name,
          email: email.trim(),
          role: DEMO_CREDENTIALS.role,
          method: 'Inicio de Sesión Estándar',
          avatar: DEMO_CREDENTIALS.avatar,
          token,
          loginTime: new Date().toLocaleTimeString(),
        };

        if (rememberMe) {
          localStorage.setItem('gg_auth_current_user', JSON.stringify(loggedUser));
        }
        setCurrentUser(loggedUser);
        setFailedAttempts(0);
        localStorage.removeItem('gg_auth_failed_attempts');
        localStorage.removeItem('gg_auth_lockout_until');
        setSuccessMsg('¡Autenticación exitosa! Token JWT emitido y guardado en Cookie segura.');
      } else {
        // FALLO: Incrementar intentos fallidos
        const newFailed = failedAttempts + 1;
        setFailedAttempts(newFailed);
        localStorage.setItem('gg_auth_failed_attempts', newFailed.toString());

        // Forzar nuevo reCAPTCHA por seguridad en caso de fallo
        setRecaptchaToken(null);
        setRecaptchaKey((k) => k + 1);

        if (newFailed >= MAX_ATTEMPTS) {
          // ACTIVAR BLOQUEO TEMPORAL
          const lockTime = Date.now() + LOCKOUT_DURATION_SECONDS * 1000;
          setLockoutUntil(lockTime);
          localStorage.setItem('gg_auth_lockout_until', lockTime.toString());
          setSecondsRemaining(LOCKOUT_DURATION_SECONDS);
          setErrorMsg(
            `⚠️ Has superado el límite de ${MAX_ATTEMPTS} intentos fallidos. Por seguridad, el acceso ha sido bloqueado temporalmente por ${LOCKOUT_DURATION_SECONDS} segundos.`
          );
        } else {
          const remaining = MAX_ATTEMPTS - newFailed;
          setErrorMsg(
            `Contraseña incorrecta. Te queda${remaining === 1 ? '' : 'n'} ${remaining} intento${
              remaining === 1 ? '' : 's'
            } antes del bloqueo temporal de seguridad.`
          );
        }
      }
    }, 1000);
  };

  // Restablecer contador para pruebas
  const handleResetAttempts = () => {
    setFailedAttempts(0);
    setLockoutUntil(null);
    setSecondsRemaining(0);
    setErrorMsg('');
    localStorage.removeItem('gg_auth_failed_attempts');
    localStorage.removeItem('gg_auth_lockout_until');
    setRecaptchaToken(null);
    setRecaptchaKey((k) => k + 1);
  };

  // Restablecer Rate Limit para pruebas
  const handleResetRateLimit = () => {
    const updated = resetRateLimit();
    setRateLimitStatus(updated);
    setErrorMsg('');
  };

  // Cargar credenciales de prueba con 1 clic
  const handleLoadDemoCredentials = (valid = true) => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(valid ? DEMO_CREDENTIALS.password : 'ClaveErronea123');
    setErrorMsg('');
  };

  // Manejar éxito desde métodos alternativos (con JWT y Cookies)
  const handleAlternativeSuccess = (userData) => {
    // Control de rate limit también en métodos alternativos
    const rateCheck = consumeRateLimit();
    setRateLimitStatus(rateCheck.status);

    if (!rateCheck.allowed) {
      setErrorMsg(
        `🛑 HTTP 429 - Límite de Tasa Excedido: Espera ${rateCheck.status.resetSeconds}s antes de reintentar.`
      );
      return;
    }

    const token = generateJWT({
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
      method: userData.method,
    });

    // Guardar en cookie segura
    setAuthCookie(token, 7);

    const loggedUser = {
      ...userData,
      token,
      loginTime: new Date().toLocaleTimeString(),
    };
    if (rememberMe) {
      localStorage.setItem('gg_auth_current_user', JSON.stringify(loggedUser));
    }
    setCurrentUser(loggedUser);
    setSuccessMsg('¡Bienvenido! Sesión iniciada y token JWT emitido en Cookie segura.');
  };

  // Cerrar sesión
  const handleLogout = () => {
    removeAuthCookie();
    setCurrentUser(null);
    localStorage.removeItem('gg_auth_current_user');
    setSuccessMsg('');
    setErrorMsg('');
    setRecaptchaToken(null);
    setRecaptchaKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 flex flex-col justify-center selection:bg-industrial-orange selection:text-white">
      {/* Contenedor Principal Centrado con Bento/Split Layout */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Barra superior de navegación rápida */}
        <div className="flex items-center justify-between mb-6">
          <a
            href="#hero"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">
              arrow_back
            </span>
            <span>Volver a la página principal</span>
          </a>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-surface-variant text-xs text-secondary shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-[11px]">SG-SST Cloud SSL 256-bit</span>
          </div>
        </div>

        {/* VISTA CONDICIONAL: DASHBOARD DE INGENIERO SI ESTÁ AUTENTICADO O LOGIN CORPORATIVO */}
        {currentUser ? (
          <EngineerDashboard currentUser={currentUser} onLogout={handleLogout} />
        ) : (
          /* Tarjeta Ejecutiva Principal (Split Card) */
          <div className="bg-white rounded-3xl shadow-xl border border-surface-variant/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
            
            {/* PANEL IZQUIERDO: Branding Corporativo Industrial y Seguridad SST */}
            <div className="lg:col-span-5 bg-gradient-to-br from-primary via-primary-container to-[#00142e] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
              {/* Patrón geométrico de fondo */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
              </div>

              {/* Acento de luz naranja industrial */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-industrial-orange/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-industrial-orange/15 rounded-full blur-3xl pointer-events-none" />

              {/* Cabecera de marca */}
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-industrial-orange flex items-center justify-center shadow-lg shadow-industrial-orange/30">
                    <span className="material-symbols-outlined text-white text-3xl">foundation</span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-2xl font-bold tracking-tight text-white leading-none">
                      G&G
                    </h2>
                    <p className="text-[11px] font-semibold text-industrial-orange uppercase tracking-widest mt-1">
                      Construcciones S.A.S
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-orange-200">
                    <span className="material-symbols-outlined text-sm text-industrial-orange">
                      verified_user
                    </span>
                    <span>Portal Oficial SG-SST & Obras</span>
                  </div>

                  <h1 className="font-headline-xl text-3xl sm:text-4xl font-bold text-white leading-tight">
                    Gestión Segura de Ingeniería y Salud Laboral
                  </h1>

                  <p className="text-sm text-white/75 leading-relaxed font-body-sm">
                    Plataforma integral para control de acceso en obra, reporte inmediato de actos y condiciones inseguras, inspección de EPP y cumplimiento normativo ISO 45001.
                  </p>
                </div>
              </div>

              {/* Métricas y Garantías de Seguridad */}
              <div className="relative z-10 my-8 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-industrial-orange text-base">
                        shield
                      </span>
                      Protección de Cuenta Activa
                    </span>
                    <span className="font-mono text-[11px] text-green-400">Protegido por CAPTCHA</span>
                  </div>
                  <p className="text-xs text-white/60">
                    Sistema anti fuerza bruta con bloqueo dinámico y auditoría de sesiones para personal técnico y contratistas.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-headline-sm text-xl font-bold text-industrial-orange block">
                      428+
                    </span>
                    <span className="text-[11px] text-white/70 leading-tight block mt-0.5">
                      Días continuos sin incidentes LTI
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="font-headline-sm text-xl font-bold text-white block">
                      100%
                    </span>
                    <span className="text-[11px] text-white/70 leading-tight block mt-0.5">
                      Trazabilidad de seguridad en obra
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie del panel izquierdo */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
                <span>Resolución 0312 de 2019</span>
                <span className="font-mono text-[11px]">v3.4.0 Secure</span>
              </div>
            </div>

            {/* PANEL DERECHO: Formulario de Autenticación */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
              <div>
                {/* Cabecera del formulario */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-label-caps text-label-caps text-industrial-orange uppercase tracking-wider">
                      Acceso Corporativo
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Indicador de Rate Limit */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          rateLimitStatus.isExceeded
                            ? 'bg-error-container text-error animate-pulse'
                            : rateLimitStatus.remaining <= 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-50 text-blue-900 border border-blue-200'
                        }`}
                        title="Rate Limit: Máximo 5 peticiones por minuto"
                      >
                        <span className="material-symbols-outlined text-[14px]">speed</span>
                        <span>
                          {rateLimitStatus.isExceeded
                            ? `Rate Limit (${rateLimitStatus.resetSeconds}s)`
                            : `Rate: ${rateLimitStatus.remaining}/${rateLimitStatus.limit} req/min`}
                        </span>
                      </div>

                      {/* Indicador de Intentos Restantes */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          isLocked
                            ? 'bg-error-container text-error'
                            : attemptsLeft === 1
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : attemptsLeft === 2
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-green-50 text-green-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isLocked ? 'lock_clock' : 'security'}
                        </span>
                        <span>
                          {isLocked
                            ? 'Bloqueado'
                            : `${attemptsLeft} de ${MAX_ATTEMPTS} intentos`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="font-headline-sm text-2xl font-bold text-primary mt-1">
                    Iniciar Sesión en el Portal
                  </h2>
                  <p className="text-sm text-secondary mt-1">
                    Ingresa con tus credenciales asignadas o utiliza uno de los métodos alternativos autorizados.
                  </p>
                </div>

                {/* PESTAÑAS PRINCIPALES: Inicio de Sesión vs Inicio Alternativo */}
                <div className="flex border-b border-surface-variant mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('standard');
                      setErrorMsg('');
                    }}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'standard'
                        ? 'border-industrial-orange text-industrial-orange'
                        : 'border-transparent text-secondary hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Inicio de Sesión</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('alternative');
                      setErrorMsg('');
                    }}
                    className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'alternative'
                        ? 'border-industrial-orange text-industrial-orange'
                        : 'border-transparent text-secondary hover:text-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">alt_route</span>
                    <span>Inicio Alternativo</span>
                    <span className="w-2 h-2 rounded-full bg-industrial-orange" />
                  </button>
                </div>

                {/* BANNER DE RATE LIMIT EXCEDIDO (HTTP 429) */}
                {rateLimitStatus.isExceeded && (
                  <div className="mb-6 p-4 rounded-xl bg-error-container border border-error/30 text-error animate-shake">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-2xl text-error mt-0.5">
                        speed
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">HTTP 429 - Límite de Tasa Excedido (Rate Limit)</h4>
                        <p className="text-xs text-on-error-container mt-1 leading-relaxed">
                          Has superado el límite de <strong>{rateLimitStatus.limit} peticiones por minuto</strong> permitidas para proteger el servidor contra flooding y ataques de fuerza bruta.
                        </p>
                        
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-1.5 font-mono text-base font-bold bg-white/90 px-3 py-1 rounded-lg border border-error/20">
                            <span className="material-symbols-outlined text-sm animate-spin text-error">
                              timelapse
                            </span>
                            <span>{rateLimitStatus.resetSeconds}s</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleResetRateLimit}
                            className="text-xs text-error font-semibold hover:underline"
                            title="Restablece el rate limit para pruebas"
                          >
                            Restablecer Rate Limit (Modo Pruebas)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* BANNER DE BLOQUEO POR EXCESO DE INTENTOS */}
                {isLocked && (
                  <div className="mb-6 p-4 rounded-xl bg-error-container border border-error/20 text-error animate-shake">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-2xl text-error mt-0.5">
                        lock_clock
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">Acceso temporalmente bloqueado</h4>
                        <p className="text-xs text-on-error-container mt-1 leading-relaxed">
                          Se detectaron múltiples intentos fallidos de autenticación. Por protocolo de seguridad cibernética SG-SST, debes esperar a que termine el temporizador:
                        </p>
                        
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-1.5 font-mono text-base font-bold bg-white/80 px-3 py-1 rounded-lg border border-error/20">
                            <span className="material-symbols-outlined text-sm animate-spin">
                              schedule
                            </span>
                            <span>{secondsRemaining}s</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleResetAttempts}
                            className="text-xs text-error font-semibold hover:underline"
                            title="Restablece el estado de intentos para pruebas"
                          >
                            Restablecer ahora (Modo Pruebas)
                          </button>
                        </div>

                        {/* Barra de progreso regresiva */}
                        <div className="w-full bg-white/60 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-error h-full transition-all duration-1000"
                            style={{
                              width: `${(secondsRemaining / LOCKOUT_DURATION_SECONDS) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensajes de Alerta General */}
                {errorMsg && !isLocked && (
                  <div className="mb-5 p-3 rounded-lg bg-error-container text-error text-xs flex items-center gap-2 border border-error/20">
                    <span className="material-symbols-outlined text-base">warning</span>
                    <span className="font-medium">{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-5 p-3 rounded-lg bg-green-50 text-green-900 border border-green-200 text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-green-600">
                      check_circle
                    </span>
                    <span className="font-medium">{successMsg}</span>
                  </div>
                )}

                {/* PESTAÑA 1: INICIO ESTÁNDAR (Email + Contraseña con intentos + reCAPTCHA) */}
                {activeTab === 'standard' && (
                  <form onSubmit={handleStandardLogin} className="space-y-4">
                    {/* Campo Correo */}
                    <div>
                      <label
                        htmlFor="login-email"
                        className="block text-xs font-semibold uppercase text-secondary mb-1"
                      >
                        Correo Electrónico Corporativo
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                          mail
                        </span>
                        <input
                          id="login-email"
                          type="email"
                          disabled={isLocked || isSubmitting}
                          placeholder="nombre@gygconstrucciones.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40 focus:border-industrial-orange transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                    </div>

                    {/* Campo Contraseña con botón de revelación */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="login-password"
                          className="block text-xs font-semibold uppercase text-secondary"
                        >
                          Contraseña
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsForgotModalOpen(true)}
                          className="text-xs text-industrial-orange hover:underline font-medium"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>

                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                          lock
                        </span>
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          disabled={isLocked || isSubmitting}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-10 pr-10 py-2.5 rounded-lg border bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                            failedAttempts > 0 && !isLocked
                              ? 'border-amber-400 focus:ring-amber-200'
                              : 'border-outline-variant focus:ring-industrial-orange/40 focus:border-industrial-orange'
                          }`}
                          required
                        />
                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                          aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>

                      {/* Contador de intentos visual bajo la contraseña */}
                      {failedAttempts > 0 && !isLocked && (
                        <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs text-amber-600">
                              info
                            </span>
                            <span>
                              Intento fallido registrado ({failedAttempts}/{MAX_ATTEMPTS})
                            </span>
                          </span>
                          <button
                            type="button"
                            onClick={handleResetAttempts}
                            className="underline text-[10px] text-secondary hover:text-primary"
                          >
                            Limpiar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* WIDGET RECAPTCHA */}
                    <div className="pt-1">
                      <label className="block text-xs font-semibold uppercase text-secondary mb-1">
                        Validación de Seguridad
                      </label>
                      <ReCaptcha
                        key={recaptchaKey}
                        onVerify={handleRecaptchaVerify}
                        onExpire={handleRecaptchaExpire}
                        isLocked={isLocked}
                      />
                    </div>

                    {/* Recordar en este equipo */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-industrial-orange focus:ring-industrial-orange/30 border-outline-variant"
                        />
                        <span className="text-xs text-secondary font-medium">
                          Mantener sesión activa
                        </span>
                      </label>
                    </div>

                    {/* Botón de Enviar Login */}
                    <button
                      type="submit"
                      disabled={isLocked || isSubmitting || !recaptchaToken}
                      className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                        isLocked || !recaptchaToken
                          ? 'bg-outline/50 cursor-not-allowed shadow-none'
                          : 'bg-industrial-orange hover:bg-industrial-orange/90 active:scale-[0.99] shadow-industrial-orange/20'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          <span>Validando credenciales...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">login</span>
                          <span>Iniciar Sesión en el Portal</span>
                        </>
                      )}
                    </button>

                    {/* Acceso Rápido con SSO desde el inicio estándar */}
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-surface-variant" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-secondary font-semibold">
                          O ingresa con
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          handleAlternativeSuccess({
                            name: 'Ing. Diana Ramírez',
                            email: 'diana.ramirez@gygconstrucciones.com',
                            role: 'Coordinadora Nacional SG-SST',
                            method: 'Google Workspace SSO',
                            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
                          })
                        }
                        className="py-2 px-3 border border-outline-variant hover:border-outline rounded-lg text-xs font-semibold text-secondary hover:text-primary flex items-center justify-center gap-2 transition-all hover:bg-surface"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.09C3.3 21.44 7.37 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.27C.46 8.21 0 10.05 0 12s.46 3.79 1.27 5.41l4.01-3.09z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.3 2.56 1.27 6.59l4.01 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
                          />
                        </svg>
                        <span>Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleAlternativeSuccess({
                            name: 'Arq. Andrés Gómez',
                            email: 'andres.gomez@gygconstrucciones.com',
                            role: 'Director de Obra y Proyectos',
                            method: 'Microsoft 365 Entra ID',
                            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
                          })
                        }
                        className="py-2 px-3 border border-outline-variant hover:border-outline rounded-lg text-xs font-semibold text-secondary hover:text-primary flex items-center justify-center gap-2 transition-all hover:bg-surface"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 23 23">
                          <path fill="#f35325" d="M1 1h10v10H1z" />
                          <path fill="#81bc06" d="M12 1h10v10H12z" />
                          <path fill="#05a6f0" d="M1 12h10v10H1z" />
                          <path fill="#ffba08" d="M12 12h10v10H12z" />
                        </svg>
                        <span>Microsoft</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* PESTAÑA 2: INICIO ALTERNATIVO (Cédula/Documento + OTP, Magic Link, SSO) */}
                {activeTab === 'alternative' && (
                  <AlternativeLogin onLoginSuccess={handleAlternativeSuccess} />
                )}

                {/* HELPER DE PRUEBAS / DEMO CREDENTIALS PILL */}
                <div className="mt-8 pt-4 border-t border-surface-variant">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-surface-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-industrial-orange text-lg">
                        quickreply
                      </span>
                      <div>
                        <p className="text-xs font-bold text-primary">Acceso Rápido de Prueba:</p>
                        <p className="text-[11px] text-secondary">
                          Haz clic para probar éxito o forzar intentos erróneos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadDemoCredentials(true)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-surface-variant border border-outline-variant text-[11px] font-semibold text-primary transition-colors shadow-2xs"
                      >
                        Rellenar Correcto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadDemoCredentials(false)}
                        className="px-2.5 py-1 rounded bg-white hover:bg-surface-variant border border-outline-variant text-[11px] font-semibold text-error transition-colors shadow-2xs"
                      >
                        Probar Clave Errónea
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          for (let i = 0; i < 5; i++) {
                            consumeRateLimit();
                          }
                          setRateLimitStatus(getRateLimitStatus());
                          setErrorMsg('🛑 Rate Limit activado para pruebas (5 solicitudes registradas en la ventana actual).');
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-surface-variant border border-outline-variant text-[11px] font-semibold text-blue-700 transition-colors shadow-2xs"
                        title="Simular saturación de Rate Limit para pruebas"
                      >
                        Saturar Rate Limit
                      </button>
                      {rateLimitStatus.isExceeded && (
                        <button
                          type="button"
                          onClick={handleResetRateLimit}
                          className="px-2.5 py-1 rounded bg-white hover:bg-surface-variant border border-green-300 text-[11px] font-semibold text-green-700 transition-colors shadow-2xs"
                        >
                          Limpiar Rate Limit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Aviso de confidencialidad en el pie */}
              <div className="mt-6 pt-4 border-t border-surface-variant text-center text-[11px] text-secondary">
                <p>
                  Este portal es de uso exclusivo y confidencial para personal autorizado de{' '}
                  <strong>G&G Construcciones S.A.S</strong> y contratistas con inducción SG-SST vigente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Recuperar Contraseña */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
}
