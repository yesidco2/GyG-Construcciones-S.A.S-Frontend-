import { useState } from 'react';
import { friendlyAuthError, resetPassword } from '../../services/authService';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Por favor ingresa un correo corporativo válido.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await resetPassword(email);
      setIsSubmitting(false);
      setStatus({
        type: 'success',
        message: 'Si existe una cuenta asociada a ese correo, recibirás instrucciones para restablecer la contraseña.',
      });
    } catch (error) {
      setIsSubmitting(false);
      setStatus({
        type: error?.code === 'auth/user-not-found' ? 'success' : 'error',
        message:
          error?.code === 'auth/user-not-found'
            ? 'Si existe una cuenta asociada a ese correo, recibirás instrucciones para restablecer la contraseña.'
            : friendlyAuthError(error),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-surface-variant animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-industrial-orange">lock_reset</span>
            <h3 className="font-headline-sm text-lg text-primary font-bold">Recuperar Contraseña</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="mt-3 text-sm text-secondary font-body-sm">
          La recuperación solo está disponible para correos autorizados por un administrador. Ingresa el correo vinculado a tu cuenta para recibir instrucciones seguras.
        </p>

        {status.message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2 ${
              status.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-error-container text-error border border-error/20'
            }`}
          >
            <span className="material-symbols-outlined text-base mt-0.5">
              {status.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{status.message}</span>
          </div>
        )}

        {status.type !== 'success' ? (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="recovery-email" className="block text-xs font-semibold uppercase text-secondary mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  mail
                </span>
                <input
                  id="recovery-email"
                  type="email"
                  placeholder="ejemplo@gygconstrucciones.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white focus:outline-none focus:ring-2 focus:ring-industrial-orange/40 focus:border-industrial-orange text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-surface-variant text-sm font-medium text-secondary hover:bg-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-industrial-orange text-white text-sm font-semibold hover:bg-industrial-orange/90 active:scale-95 transition-all shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Enviando...</span>
                  </>
                ) : (
                  'Enviar Enlace'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 text-right">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
