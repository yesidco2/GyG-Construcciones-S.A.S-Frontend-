import { useState } from 'react';
import { apiFetch } from '../services/api';
import CaptchaWidget from './auth/CaptchaWidget';
import PrivacyConsent from './PrivacyConsent';
import { POLICY_URL, POLICY_VERSION } from '../config/privacy';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [captchaError, setCaptchaError] = useState('');
  const [acceptsPolicy, setAcceptsPolicy] = useState(false);
  const [policyError, setPolicyError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: 'error', message: 'Ingresa un correo válido para suscribirte.' });
      return;
    }
    if (!captchaToken) {
      setCaptchaError('Completa la verificación CAPTCHA antes de suscribirte.');
      return;
    }
    if (!acceptsPolicy) {
      setPolicyError('Debes autorizar el tratamiento de tus datos para suscribirte.');
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await apiFetch('/api/newsletter', {
        method: 'POST',
        headers: { 'X-Captcha-Token': captchaToken },
        body: JSON.stringify({
          correo: email.trim(),
          source: 'GG WEB newsletter',
          aceptaPolitica: true,
          politicaVersion: POLICY_VERSION,
        }),
      });
      setStatus({
        type: 'success',
        message: 'Te has suscrito correctamente a nuestro boletín.',
      });
      setEmail('');
      setAcceptsPolicy(false);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.status === 429
          ? 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.'
          : 'No pudimos completar la suscripción. Inténtalo nuevamente más tarde.',
      });
    } finally {
      setIsSubmitting(false);
      setCaptchaToken('');
      setCaptchaResetKey((current) => current + 1);
    }
  };

  return (
    <footer className="bg-primary w-full mt-lg border-t-4 border-tertiary">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-md py-xl max-w-container-max mx-auto text-on-primary">
        <div className="space-y-md">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-industrial-orange" style={{ fontSize: 24 }}>
              foundation
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-tertiary-fixed">G&G</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-primary/70">
            Consultoría de ingeniería de alta precisión y gestión integral de seguridad en el trabajo.
          </p>
          <div className="inline-flex border-2 border-industrial-orange px-sm py-xs rounded-full">
            <span className="font-label-caps text-[10px] text-industrial-orange uppercase tracking-[2px]">
              Compromiso con la Seguridad y la Vida
            </span>
          </div>
        </div>
        <div>
          <h4 className="font-label-caps text-label-caps text-white uppercase mb-md">Ecosistema</h4>
          <ul className="space-y-xs font-body-sm text-body-sm text-on-primary/70">
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href="#servicios">
                Servicios
              </a>
            </li>
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href="#portfolio">
                Portafolio
              </a>
            </li>
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href="#gestion-sst">
                Estandares de Seguridad
              </a>
            </li>
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href="#gestion-sst">
                Gestión SST
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-caps text-label-caps text-white uppercase mb-md">Compañía</h4>
          <ul className="space-y-xs font-body-sm text-body-sm text-on-primary/70">
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href="#contacto">
                Contacto
              </a>
            </li>
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href="#consultar-proyecto">
                Consulta de Proyecto
              </a>
            </li>
            <li>
              <a className="hover:text-on-primary hover:underline transition-all flex items-center gap-1 text-industrial-orange font-medium" href="#login">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>Portal SST (Acceso Seguro)</span>
              </a>
            </li>
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href={POLICY_URL}>
                Política de tratamiento de datos
              </a>
            </li>
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href="#politica-cookies">
                Política de cookies
              </a>
            </li>
            <li>
              <button
                type="button"
                data-cookie-preferences-trigger
                onClick={(event) => window.dispatchEvent(new CustomEvent('cookie-preferences-open', {
                  detail: { trigger: event.currentTarget },
                }))}
                className="text-left hover:text-on-primary hover:underline transition-all"
              >
                Preferencias de cookies
              </button>
            </li>
            <li>
              <a className="hover:text-on-primary hover:underline transition-all" href="#">
                Términos de Servicio
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-label-caps text-label-caps text-white uppercase mb-md">Newsletter Técnico</h4>
          <p className="font-body-sm text-body-sm text-on-primary/70 mb-sm">
            Reciba actualizaciones sobre normatividad SST y avances en ingeniería.
          </p>
          <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-xs">
            <label htmlFor="newsletter-email" className="text-xs font-medium text-on-primary">
              Correo electrónico
            </label>
            <div className="flex">
              <input
                id="newsletter-email"
                className="bg-white/10 border-none text-white rounded-l-lg w-full font-body-sm text-body-sm p-sm focus:ring-1 focus:ring-industrial-orange placeholder:text-white/50"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="bg-industrial-orange p-sm rounded-r-lg disabled:opacity-70" type="submit" disabled={isSubmitting || !captchaToken} aria-label="Suscribirme al boletín">
                <span className="material-symbols-outlined text-white">chevron_right</span>
              </button>
            </div>
            <CaptchaWidget
              siteKey={import.meta.env.VITE_CAPTCHA_SITE_KEY}
              resetKey={captchaResetKey}
              onToken={(token) => {
                setCaptchaToken(token);
                setCaptchaError('');
              }}
              onError={setCaptchaError}
            />
            {captchaError && <p role="status" className="text-xs text-red-200" aria-live="polite">{captchaError}</p>}
            <PrivacyConsent
              id="newsletter-privacy"
              required
              checked={acceptsPolicy}
              onChange={(event) => {
                setAcceptsPolicy(event.target.checked);
                setPolicyError('');
              }}
              error={policyError}
              className="text-on-primary"
              label="Autorizo a G&G CONSTRUCCIONES SST S.A.S. para enviarme información comercial y técnica a mi correo electrónico. Puedo revocar esta autorización en cualquier momento."
            />
            {status.message && (
              <p
                className={`text-xs ${status.type === 'error' ? 'text-red-200' : 'text-green-200'}`}
                aria-live="polite"
              >
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
      <div className="border-t border-white/10 py-md">
        <div className="mx-auto max-w-container-max px-md text-center text-on-primary/70">
          <p className="font-body-sm text-body-sm">NIT 900.XXX.XXX-1</p>
          <p className="font-body-sm text-body-sm">Cra 7 # 123-45, Bogotá D.C., Colombia</p>
          <p className="mt-xs font-body-sm text-body-sm text-on-primary/50">
            © 2024 G&G. Commitment to Safety and Life. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}