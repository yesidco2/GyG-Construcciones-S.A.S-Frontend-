import { useState } from 'react';

/**
 * AlternativeLogin Component
 * Brinda opciones alternativas de autenticación adaptadas al ecosistema
 * de G&G Construcciones y SG-SST:
 * 1. Acceso por Documento / Cédula de Ciudadanía con código OTP para personal operativo y contratistas.
 * 2. Acceso por Enlace Mágico (Magic Link sin contraseña).
 * 3. Botones corporativos SSO (Google Workspace y Microsoft 365 Azure AD).
 */
export default function AlternativeLogin({ onLoginSuccess }) {
  const [method, setMethod] = useState('doc'); // 'doc' | 'magic' | 'sso'
  
  // Estado para flujo por Cédula / Documento
  const [docType, setDocType] = useState('CC');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Estado para Magic Link
  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  // Manejo de envío de OTP
  const handleRequestOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!docNumber.trim() || docNumber.length < 6) {
      setErrorMsg('Ingresa un número de documento válido (mínimo 6 dígitos).');
      return;
    }
    if (!phone.trim() || phone.length < 7) {
      setErrorMsg('Ingresa un número de contacto válido para recibir el código.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setOtpStep(true);
      setOtpCountdown(45);
      setInfoMsg(`Código de verificación enviado al número finalizado en ***${phone.slice(-3)}. (Código demo: 123456)`);
    }, 800);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Por favor ingresa los 6 dígitos del código.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      // Validar código demo '123456' o cualquier código de 6 dígitos para testing
      if (enteredCode === '123456' || enteredCode === '987654') {
        onLoginSuccess({
          name: 'Carlos Mendoza',
          email: `${docNumber}@contratistas.gyg.com`,
          role: 'Supervisor de Obra SST',
          method: `Documento ${docType}: ${docNumber}`,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        });
      } else {
        setErrorMsg('Código incorrecto. Ingresa el código demo 123456.');
      }
    }, 900);
  };

  // Manejo de Magic Link
  const handleMagicLinkSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!magicEmail || !magicEmail.includes('@')) {
      setErrorMsg('Ingresa un correo electrónico corporativo válido.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setMagicSent(true);
      setInfoMsg(`Enlace seguro de acceso generado para ${magicEmail}.`);
    }, 800);
  };

  // Manejo de SSO simulado (Google / Microsoft)
  const handleSsoLogin = (provider) => {
    setIsSubmitting(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        name: provider === 'Google' ? 'Ing. Diana Ramírez' : 'Arq. Andrés Gómez',
        email: provider === 'Google' ? 'diana.ramirez@gygconstrucciones.com' : 'andres.gomez@gygconstrucciones.com',
        role: provider === 'Google' ? 'Coordinadora Nacional SG-SST' : 'Director de Obra y Proyectos',
        method: `SSO ${provider} Workspace`,
        avatar:
          provider === 'Google'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      });
    }, 1000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Botones de navegación interna para métodos alternativos */}
      <div className="flex border border-surface-variant p-1 rounded-xl bg-surface">
        <button
          type="button"
          onClick={() => {
            setMethod('doc');
            setErrorMsg('');
            setInfoMsg('');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            method === 'doc'
              ? 'bg-white text-primary shadow-xs'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">badge</span>
          <span>Cédula / SST Obra</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod('magic');
            setErrorMsg('');
            setInfoMsg('');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            method === 'magic'
              ? 'bg-white text-primary shadow-xs'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">magic_button</span>
          <span>Enlace Mágico</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMethod('sso');
            setErrorMsg('');
            setInfoMsg('');
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            method === 'sso'
              ? 'bg-white text-primary shadow-xs'
              : 'text-secondary hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">domain</span>
          <span>SSO Corporativo</span>
        </button>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-error-container text-error text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {infoMsg && (
        <div className="p-3 rounded-lg bg-blue-50 text-blue-900 border border-blue-200 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-blue-600">info</span>
          <span>{infoMsg}</span>
        </div>
      )}

      {/* 1. Flujo Cédula / Documento + OTP */}
      {method === 'doc' && (
        <div>
          {!otpStep ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="rounded-lg bg-surface-container-low p-3 border border-surface-variant/80">
                <p className="text-xs text-secondary leading-relaxed">
                  Diseñado para <strong>ingenieros residentes, contratistas y brigadistas</strong> en obra que ingresan mediante su documento de identidad y validación en tiempo real.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label htmlFor="doc-type" className="block text-xs font-semibold uppercase text-secondary mb-1">
                    Tipo Doc.
                  </label>
                  <select
                    id="doc-type"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
                  >
                    <option value="CC">C.C. Cédula</option>
                    <option value="CE">C.E. Extranjería</option>
                    <option value="PAS">Pasaporte</option>
                    <option value="NIT">NIT Empresa</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="doc-number" className="block text-xs font-semibold uppercase text-secondary mb-1">
                    Número de Documento
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                      fingerprint
                    </span>
                    <input
                      id="doc-number"
                      type="text"
                      placeholder="Ej. 1020304050"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="auth-phone" className="block text-xs font-semibold uppercase text-secondary mb-1">
                  Celular registrado en SG-SST (para SMS/WhatsApp OTP)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    smartphone
                  </span>
                  <input
                    id="auth-phone"
                    type="tel"
                    placeholder="300 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Enviando código...</span>
                  </span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">sms</span>
                    <span>Solicitar Código OTP de Acceso</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <span className="material-symbols-outlined text-industrial-orange text-4xl mb-1">
                  mark_email_read
                </span>
                <h4 className="font-headline-sm text-base text-primary font-bold">Ingresa el Código OTP</h4>
                <p className="text-xs text-secondary mt-1">
                  Hemos enviado una clave dinámica de 6 dígitos a tu celular registrado.
                </p>
              </div>

              {/* 6 Casillas de entrada OTP */}
              <div className="flex justify-center gap-2 py-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-bold rounded-lg border-2 border-outline-variant focus:border-industrial-orange focus:ring-2 focus:ring-industrial-orange/30 bg-surface focus:bg-white transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-secondary">
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep(false);
                    setOtpDigits(['', '', '', '', '', '']);
                  }}
                  className="hover:text-primary underline"
                >
                  Cambiar documento
                </button>
                <span>
                  Reenviar código en: <strong className="text-primary font-mono">{otpCountdown}s</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-industrial-orange hover:bg-industrial-orange/90 text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <span>Verificando credencial...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Validar e Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* 2. Flujo Magic Link */}
      {method === 'magic' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-surface-container-low p-3 border border-surface-variant/80">
            <p className="text-xs text-secondary leading-relaxed">
              Recibe un enlace de un solo uso en tu correo corporativo para acceder al portal <strong>sin necesidad de recordar contraseña</strong>.
            </p>
          </div>

          {!magicSent ? (
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              <div>
                <label htmlFor="magic-email" className="block text-xs font-semibold uppercase text-secondary mb-1">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    alternate_email
                  </span>
                  <input
                    id="magic-email"
                    type="email"
                    placeholder="ingenieria@gygconstrucciones.com"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-container text-white text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Generando enlace seguro...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Enviar Enlace Mágico</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-center space-y-3">
              <span className="material-symbols-outlined text-green-700 text-4xl">
                forward_to_inbox
              </span>
              <h4 className="font-headline-sm text-base text-green-900 font-bold">¡Enlace Mágico Emitido!</h4>
              <p className="text-xs text-green-800">
                Hemos enviado el enlace a <strong>{magicEmail}</strong>. Válido durante los próximos 15 minutos.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    onLoginSuccess({
                      name: 'Ingeniero de Proyectos',
                      email: magicEmail,
                      role: 'Residente de Obra SG-SST',
                      method: 'Enlace Mágico de Correo',
                      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                    })
                  }
                  className="px-4 py-2 bg-green-700 text-white rounded-lg text-xs font-semibold hover:bg-green-800 transition-colors shadow-xs"
                >
                  Simular clic en enlace recibido
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Flujo SSO Corporativo */}
      {method === 'sso' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-surface-container-low p-3 border border-surface-variant/80">
            <p className="text-xs text-secondary leading-relaxed">
              Autenticación federada corporativa mediante el directorio activo de la organización (Google Workspace o Microsoft Azure AD).
            </p>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSsoLogin('Google')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-outline-variant bg-white hover:bg-surface text-on-surface text-sm font-semibold transition-all shadow-xs hover:border-outline"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span>Continuar con Google Workspace</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSsoLogin('Microsoft')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-outline-variant bg-white hover:bg-surface text-on-surface text-sm font-semibold transition-all shadow-xs hover:border-outline"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
              </svg>
              <span>Continuar con Microsoft 365 (Azure AD)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
