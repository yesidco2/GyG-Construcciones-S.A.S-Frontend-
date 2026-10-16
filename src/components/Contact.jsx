import { useState } from 'react';
import { apiFetch } from '../services/api';

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  message: '',
};

export default function Contact() {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setStatus({
        type: 'error',
        message: 'Por favor, completa tu nombre.',
      });
      return;
    }

    const email = formData.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus({
        type: 'error',
        message: 'Ingresa un correo electrónico válido.',
      });
      return;
    }

    setStatus({ type: '', message: '' });
    setStep(2);
  };

  const handleStep2Submit = async (event) => {
    event.preventDefault();

    const { name, email, service, message } = formData;

    if (!service || !message.trim()) {
      setStatus({
        type: 'error',
        message: 'Completa el tipo de servicio y tu consulta para enviar la solicitud.',
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await apiFetch('/api/contacto', {
        method: 'POST',
        body: JSON.stringify({
          nombre: name.trim(),
          empresa: formData.company || '',
          correo: email.trim(),
          telefono: formData.phone || '',
          tipoServicio: service,
          mensaje: message.trim(),
        }),
      });

      setStatus({
        type: 'success',
        message: 'Tu solicitud se envió correctamente. Nuestro equipo te contactará pronto.',
      });
      setFormData(initialForm);
      setStep(1);
    } catch (error) {
      console.error('API error:', error);
      const isClientError = error.status >= 400 && error.status < 500;
      setStatus({
        type: 'error',
        message: isClientError && error.message
          ? error.message
          : 'No pudimos enviar el mensaje. Intenta de nuevo o escríbenos directamente a proyectos@gng.co.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-md py-xl" id="contacto">
      <div className="mx-auto max-w-container-max">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-surface-variant bg-white shadow-xl md:flex-row">
          <div className="bg-primary p-lg text-white md:w-1/3">
            <h2 className="mb-md font-headline-lg text-headline-lg">Inicie su proyecto con expertos</h2>
            <p className="mb-lg font-body-md text-body-md text-white/70">
              Estamos listos para brindarle la solidez técnica y seguridad que su infraestructura requiere.
            </p>
            <div className="space-y-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-industrial-orange">phone</span>
                <span className="font-body-sm text-body-sm">+57 (1) 234 5678</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-industrial-orange">mail</span>
                <span className="font-body-sm text-body-sm">proyectos@gng.co</span>
              </div>
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-industrial-orange">location_on</span>
                <span className="font-body-sm text-body-sm">Bogotá D.C., Colombia</span>
              </div>
            </div>
            <div className="mt-xl">
              <span className="font-label-caps text-label-caps uppercase text-industrial-orange">SST Compliance Certified</span>
              <div className="mt-sm flex gap-xs opacity-50" aria-hidden="true">
                <div className="h-8 w-8 rounded bg-white" />
                <div className="h-8 w-8 rounded bg-white" />
                <div className="h-8 w-8 rounded bg-white" />
              </div>
            </div>
          </div>

          <div className="p-lg md:w-2/3">
            {/* Indicador de pasos */}
            <div className="mb-lg flex items-center gap-sm">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-headline-sm transition-all ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-surface-variant text-secondary'
                }`}
              >
                1
              </div>
              <div className={`h-1 flex-1 transition-all ${step >= 2 ? 'bg-primary' : 'bg-surface-variant'}`} />
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-headline-sm transition-all ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-surface-variant text-secondary'
                }`}
              >
                2
              </div>
            </div>

            {status.message && (
              <div
                className={`mb-md rounded-lg px-md py-sm ${
                  status.type === 'error' ? 'bg-error/10 text-error' : 'bg-green-500/10 text-green-700'
                } font-body-sm text-body-sm`}
              >
                {status.message}
              </div>
            )}

            {/* PASO 1: Contacto rápido */}
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-md">
                <div>
                  <label htmlFor="contact-name" className="mb-xs block font-label-caps text-label-caps text-primary">
                    Nombre
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-outline-variant p-sm transition-colors focus:border-primary-container focus:ring-0"
                    placeholder="Tu nombre completo"
                    type="text"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-xs block font-label-caps text-label-caps text-primary">
                    Correo
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-outline-variant p-sm transition-colors focus:border-primary-container focus:ring-0"
                    placeholder="email@empresa.com"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="mb-xs block font-label-caps text-label-caps text-primary">
                    Teléfono
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-outline-variant p-sm transition-colors focus:border-primary-container focus:ring-0"
                    placeholder="+57 300 000 0000 (opcional)"
                    type="tel"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-sm font-headline-sm text-headline-sm text-white transition-colors hover:bg-primary-container"
                >
                  Continuar
                </button>
              </form>
            )}

            {/* PASO 2: Detalles y mensaje */}
            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-md">
                <div>
                  <label htmlFor="contact-company" className="mb-xs block font-label-caps text-label-caps text-primary">
                    Empresa (opcional)
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-outline-variant p-sm transition-colors focus:border-primary-container focus:ring-0"
                    placeholder="Nombre de tu compañía"
                    type="text"
                  />
                </div>
                <div>
                  <label htmlFor="contact-service" className="mb-xs block font-label-caps text-label-caps text-primary">
                    Tipo de Servicio
                  </label>
                  <select
                    id="contact-service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-outline-variant p-sm transition-colors focus:border-primary-container focus:ring-0"
                  >
                    <option value="">Selecciona un servicio</option>
                    <option value="Obra Civil">Obra Civil</option>
                    <option value="Consultoría SST">Consultoría SST</option>
                    <option value="Interventoría Técnica">Interventoría Técnica</option>
                    <option value="Capacitación Integral">Capacitación Integral</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="contact-message" className="mb-xs block font-label-caps text-label-caps text-primary">
                    Tu consulta
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-lg border-2 border-outline-variant p-sm transition-colors focus:border-primary-container focus:ring-0"
                    placeholder="Cuéntanos sobre tu proyecto o necesidad..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-sm">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-lg border-2 border-primary bg-transparent py-sm font-headline-sm text-headline-sm text-primary transition-colors hover:bg-primary/5"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg bg-industrial-orange py-sm font-headline-sm text-headline-sm text-white transition-colors hover:bg-industrial-orange/90 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}