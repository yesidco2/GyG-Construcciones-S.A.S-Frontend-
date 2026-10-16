import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({ type: 'error', message: 'Ingresa un correo válido para suscribirte.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    const endpoint = import.meta.env.VITE_NEWSLETTER_ENDPOINT;

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'GG WEB newsletter' }),
        });

        if (!response.ok) {
          throw new Error('No se pudo completar la suscripción');
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus({
        type: 'success',
        message: endpoint
          ? 'Te has suscrito correctamente a nuestro boletín.'
          : 'Configuración pendiente: agrega VITE_NEWSLETTER_ENDPOINT para activar la suscripción real.',
      });
      setEmail('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'No pudimos completar la suscripción. Inténtalo nuevamente más tarde.',
      });
    } finally {
      setIsSubmitting(false);
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
              <a className="hover:text-on-primary hover:underline transition-all" href="#">
                Política de Privacidad
              </a>
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-xs">
            <div className="flex">
              <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
              <input
                id="newsletter-email"
                className="bg-white/10 border-none text-white rounded-l-lg w-full font-body-sm text-body-sm p-sm focus:ring-1 focus:ring-industrial-orange placeholder:text-white/50"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-label="Correo electrónico para newsletter"
              />
              <button className="bg-industrial-orange p-sm rounded-r-lg disabled:opacity-70" type="submit" disabled={isSubmitting} aria-label="Suscribirme al boletín">
                <span className="material-symbols-outlined text-white">chevron_right</span>
              </button>
            </div>
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