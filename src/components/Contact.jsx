import { useRef, useState } from 'react';
import { apiFetch } from '../services/api';

const services = [
  'Obra Civil',
  'Consultoría SST',
  'Interventoría Técnica',
  'Capacitación Integral',
];

const initialForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  website: '',
};

const namePattern = /^[\p{L}][\p{L} .'’-]*$/u;
const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const phonePattern = /^(?:[0-9]{7,14}|\+[0-9]{7,13})$/;
const linkPattern = /(?:https?:\/\/|www\.)[^\s]+/gi;

function validateForm(formData) {
  const name = formData.name.trim();
  const company = formData.company.trim();
  const email = formData.email.trim();
  const phone = formData.phone.trim();
  const message = formData.message.trim();
  const errors = {};

  if (name.length < 2 || name.length > 100 || !namePattern.test(name)) {
    errors.name = 'Ingresa un nombre de 2 a 100 caracteres con letras, espacios, puntos, apóstrofes o guiones.';
  }
  if (!emailPattern.test(email)) {
    errors.email = 'Ingresa un correo electrónico válido.';
  }
  if (phone && !phonePattern.test(phone)) {
    errors.phone = 'Ingresa de 7 a 14 números; si incluyes +, cuenta dentro del límite de 14 caracteres.';
  }
  if (company.length > 120 || /[<>]/.test(company)) {
    errors.company = 'La empresa debe tener máximo 120 caracteres y no puede contener < ni >.';
  }
  if (!services.includes(formData.service)) {
    errors.service = 'Selecciona uno de los servicios disponibles.';
  }
  if (message.length < 10 || message.length > 1500 || /[<>]/.test(message)) {
    errors.message = 'El mensaje debe tener entre 10 y 1500 caracteres y no puede contener < ni >.';
  } else if ((message.match(linkPattern) || []).length > 2) {
    errors.message = 'El mensaje puede incluir máximo 2 enlaces.';
  }

  return errors;
}

function FieldError({ id, message }) {
  return message ? (
    <p id={id} role="alert" className="mt-1 text-sm text-error">
      {message}
    </p>
  ) : null;
}

export default function Contact({ sectionId = 'contacto' }) {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const updatedValue =
      name === 'phone'
        ? value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '').slice(0, 14)
        : value;
    setFormData((previous) => ({ ...previous, [name]: updatedValue }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submissionLock.current) return;

    const validationErrors = validateForm(formData);
    setErrors(validationErrors);
    setStatus({ type: '', message: '' });
    if (Object.keys(validationErrors).length > 0) return;

    submissionLock.current = true;
    setIsSubmitting(true);

    try {
      await apiFetch('/api/contacto', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.name.trim(),
          empresa: formData.company.trim(),
          correo: formData.email.trim(),
          telefono: formData.phone.trim(),
          tipoServicio: formData.service,
          mensaje: formData.message.trim(),
          sitioWeb: formData.website.trim(),
        }),
      });

      setStatus({
        type: 'success',
        message: 'Tu solicitud se envió correctamente. Nuestro equipo te contactará pronto.',
      });
      setFormData(initialForm);
      setErrors({});
    } catch (error) {
      console.error('No se pudo enviar la solicitud de contacto:', error);
      setStatus({
        type: 'error',
        message:
          (error.status === 400 || error.status === 429) && error.message
            ? error.message
            : 'No pudimos enviar el mensaje. Intenta de nuevo o escríbenos directamente a proyectos@gng.co.',
      });
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section className="px-md py-xl" id={sectionId}>
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
            {status.message && (
              <div
                role={status.type === 'error' ? 'alert' : 'status'}
                className={`mb-md rounded-lg px-md py-sm ${
                  status.type === 'error' ? 'bg-error/10 text-error' : 'bg-green-500/10 text-green-700'
                } font-body-sm text-body-sm`}
              >
                {status.message}
              </div>
            )}

            <form noValidate onSubmit={handleSubmit} className="space-y-md">
              <div className="absolute -left-[9999px]" aria-hidden="true">
                <label htmlFor="contact-website">Sitio web</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  value={formData.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="contact-name" className="mb-xs block font-label-caps text-label-caps text-primary">
                  Nombre
                </label>
                <input
                  id="contact-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full rounded-lg border-2 p-sm transition-colors focus:border-primary-container focus:ring-0 ${
                    errors.name ? 'border-error' : 'border-outline-variant'
                  }`}
                  placeholder="Tu nombre completo"
                  type="text"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'contact-name-error' : undefined}
                />
                <FieldError id="contact-name-error" message={errors.name} />
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
                  maxLength={254}
                  className={`w-full rounded-lg border-2 p-sm transition-colors focus:border-primary-container focus:ring-0 ${
                    errors.email ? 'border-error' : 'border-outline-variant'
                  }`}
                  placeholder="email@empresa.com"
                  type="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'contact-email-error' : undefined}
                />
                <FieldError id="contact-email-error" message={errors.email} />
              </div>

              <div className="grid gap-md sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-phone" className="mb-xs block font-label-caps text-label-caps text-primary">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={14}
                    className={`w-full rounded-lg border-2 p-sm transition-colors focus:border-primary-container focus:ring-0 ${
                      errors.phone ? 'border-error' : 'border-outline-variant'
                    }`}
                    placeholder="+573000000000"
                    type="tel"
                    inputMode="tel"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                  />
                  <FieldError id="contact-phone-error" message={errors.phone} />
                </div>

                <div>
                  <label htmlFor="contact-company" className="mb-xs block font-label-caps text-label-caps text-primary">
                    Empresa (opcional)
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    maxLength={120}
                    className={`w-full rounded-lg border-2 p-sm transition-colors focus:border-primary-container focus:ring-0 ${
                      errors.company ? 'border-error' : 'border-outline-variant'
                    }`}
                    placeholder="Nombre de tu compañía"
                    type="text"
                    aria-invalid={Boolean(errors.company)}
                    aria-describedby={errors.company ? 'contact-company-error' : undefined}
                  />
                  <FieldError id="contact-company-error" message={errors.company} />
                </div>
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
                  className={`w-full rounded-lg border-2 p-sm transition-colors focus:border-primary-container focus:ring-0 ${
                    errors.service ? 'border-error' : 'border-outline-variant'
                  }`}
                  aria-invalid={Boolean(errors.service)}
                  aria-describedby={errors.service ? 'contact-service-error' : undefined}
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
                <FieldError id="contact-service-error" message={errors.service} />
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
                  maxLength={1500}
                  className={`w-full rounded-lg border-2 p-sm transition-colors focus:border-primary-container focus:ring-0 ${
                    errors.message ? 'border-error' : 'border-outline-variant'
                  }`}
                  placeholder="Cuéntanos sobre tu proyecto o necesidad..."
                  rows={4}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={[
                    errors.message ? 'contact-message-error' : '',
                    'contact-message-count',
                  ].filter(Boolean).join(' ')}
                />
                <div className="flex items-start justify-between gap-sm">
                  <FieldError id="contact-message-error" message={errors.message} />
                  <span id="contact-message-count" className="ml-auto shrink-0 text-xs text-secondary">
                    {formData.message.length}/1500
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-industrial-orange py-sm font-headline-sm text-headline-sm text-white transition-colors hover:bg-industrial-orange/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
