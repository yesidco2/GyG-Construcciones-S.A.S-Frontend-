import { useEffect, useRef, useState } from 'react';
import QuoteDetails, { Icon, QuoteItems, quantityError } from '../components/QuoteDetails';
import { getQuoteCatalog, getQuotePdf, previewQuote } from '../services/quoteService';
import { POLICY_URL } from '../config/privacy';
import './quote.css';

const emptyClient = { nombre: '', nit: '', correo: '', telefono: '', ciudad: '', direccion: '', descripcion: '' };

function Field({ name, label, optional, error, value, onChange, multiline, ...props }) {
  const id = 'quote-' + name;
  const Control = multiline ? 'textarea' : 'input';
  return <div className="quote-field">
    <label htmlFor={id}>{label} {optional && <span>(opcional)</span>}</label>
    <Control {...props} id={id} name={name} value={value} required={!optional} aria-invalid={Boolean(error)}
      aria-describedby={error ? id + '-error' : undefined} onChange={event => onChange(name, event.target.value)} />
    {error && <small className="quote-field-error" id={id + '-error'}>{error}</small>}
  </div>;
}

function errorMessage(error, fallback) {
  if (error.status === 429) return error.retryAfter > 0
    ? 'Has realizado varias consultas. Vuelve a intentarlo en ' + error.retryAfter + ' segundos.'
    : 'Has realizado varias consultas. Espera un momento y vuelve a intentarlo.';
  if (error.name === 'TimeoutError') return 'La solicitud tardó demasiado. Vuelve a intentarlo.';
  if (error.status >= 400 && error.status < 500) return error.message || fallback;
  return fallback;
}

function validate(client, items) {
  const errors = {};
  if (!client.nombre) errors.nombre = 'Escribe tu nombre o la razón social.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.correo)) errors.correo = 'Escribe un correo electrónico válido.';
  if (!/^\+?[\d ()-]+$/.test(client.telefono) || !/^\d{7,15}$/.test(client.telefono.replace(/\D/g, ''))) {
    errors.telefono = 'Ingresa un teléfono de 7 a 15 dígitos.';
  }
  if (!client.ciudad) errors.ciudad = 'Indica dónde se realizará el trabajo.';
  if (!client.descripcion) errors.descripcion = 'Describe el trabajo que deseas cotizar.';
  if (!items.length) errors.servicios = 'Agrega al menos un servicio a la cotización.';
  items.forEach(({ servicio, cantidad }) => {
    const error = quantityError(cantidad, servicio.unidad);
    if (error) errors['quote-qty-' + servicio.id] = error;
  });
  return errors;
}

export default function QuotePage() {
  const [client, setClient] = useState(emptyClient);
  const [chosen, setChosen] = useState([]);
  const [selection, setSelection] = useState('');
  const [catalog, setCatalog] = useState({ services: [], city: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState(null);
  const [download, setDownload] = useState(null);
  const [outdated, setOutdated] = useState(false);
  const [busy, setBusy] = useState(false);
  const request = useRef(null);
  const heading = useRef(null);
  const city = client.ciudad.trim();
  const ready = catalog.city === city && !catalog.error;

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const services = await getQuoteCatalog(city, controller.signal);
        if (!controller.signal.aborted) setCatalog({ services, city, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setCatalog(previous => ({
          ...previous, city, error: errorMessage(error, 'No se pudo cargar el tarifario. Reintenta para consultar los servicios disponibles.'),
        }));
      }
    }, city ? 300 : 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [city, attempt]);

  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => () => { if (download) URL.revokeObjectURL(download); }, [download]);

  const items = chosen.map(({ selected, cantidad }) => {
    const servicio = catalog.services.find(item => item.id === selected.id)
      ?? { ...selected, tarifa: null };
    const total = servicio.tarifa && !quantityError(cantidad, servicio.unidad)
      ? Number(cantidad) * servicio.tarifa.precioUnitario : null;
    return { servicio, cantidad, total };
  });
  const available = catalog.services.filter(service => !chosen.some(item => item.selected.id === service.id));
  const categories = [...new Set(available.map(service => service.categoria))];

  function field(name) {
    return { name, value: client[name], error: errors[name], onChange: (key, value) => {
      setClient(previous => ({ ...previous, [key]: value }));
      setErrors(previous => ({ ...previous, [key]: '' }));
      setNotice('');
    } };
  }

  function addService() {
    const selected = available.find(service => String(service.id) === selection);
    if (!selected || !ready || chosen.length >= 40) return;
    setChosen(previous => [...previous, { selected, cantidad: '1' }]);
    setErrors(previous => ({ ...previous, servicios: '' }));
    setSelection('');
    setNotice('');
  }

  function changeQuantity(id, value) {
    setChosen(previous => previous.map(item => item.selected.id === id ? { ...item, cantidad: value } : item));
    setErrors(previous => ({ ...previous, ['quote-qty-' + id]: '' }));
    setNotice('');
  }

  function edit() {
    setPreview(null);
    setDownload(null);
    setOutdated(false);
    setNotice('');
    window.requestAnimationFrame(() => heading.current?.focus());
  }

  async function submit(event) {
    event?.preventDefault();
    if (request.current) return;
    const trimmed = Object.fromEntries(Object.entries(client).map(([key, value]) => [key, value.trim()]));
    const invalid = validate(trimmed, items);
    setErrors(invalid);
    const first = Object.keys(invalid)[0];
    if (first) {
      document.getElementById(first.startsWith('quote-') ? first : 'quote-' + first)?.focus();
      return;
    }
    if (!ready) return;
    if (items.some(({ servicio }) => !catalog.services.some(current => current.id === servicio.id))) {
      setNotice('Hay servicios que ya no están en el catálogo. Quítalos y elige un servicio disponible.');
      return;
    }
    const payload = { ...trimmed, items: items.map(({ servicio, cantidad }) => ({
      servicioId: servicio.id, cantidad: Number(cantidad),
    })) };
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setNotice('');
    try {
      const quote = await previewQuote(payload, controller.signal);
      if (!controller.signal.aborted) {
        setPreview({ quote, payload });
        setOutdated(false);
        setDownload(null);
        window.requestAnimationFrame(() => heading.current?.focus());
      }
    } catch (error) {
      if (!controller.signal.aborted) setNotice(errorMessage(error, 'No se pudo preparar la cotización. Tus datos siguen en el formulario.'));
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  async function generatePdf() {
    if (!preview || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setNotice('');
    try {
      const blob = await getQuotePdf(preview.payload, preview.quote.referencia, controller.signal);
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      setDownload(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = preview.quote.referencia + '.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (!controller.signal.aborted && error.status === 409) {
        setOutdated(true);
        setNotice('Cambió el tarifario o la configuración de la cotización. Actualiza la vista previa para revisar los valores vigentes.');
      } else if (!controller.signal.aborted) setNotice(errorMessage(error, 'No se pudo generar el PDF. Vuelve a intentarlo.'));
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return <main className="quote-workspace" id="cotizador">
    <div className="quote-wrap">
      <div className="quote-page-heading">
        <div>
          <a href="#hero" className="quote-back"><Icon>arrow_back</Icon> Volver al inicio</a>
          <h1 ref={heading} tabIndex={-1}>{preview ? 'Vista previa de la cotización' : 'Cotiza tu proyecto'}</h1>
          {!preview && <p>Describe el trabajo y elige los servicios que quieres incluir en tu cotización.</p>}
        </div>
        <ol className="quote-steps" aria-label="Etapas de la cotización">
          <li aria-current={!preview ? 'step' : undefined}>Solicitud</li>
          <li aria-hidden="true"><Icon>chevron_right</Icon></li>
          <li aria-current={preview ? 'step' : undefined}>Vista previa</li>
        </ol>
      </div>
      {preview ? <>
        <QuoteDetails quote={preview.quote} />
        {notice && <p role="alert" className="quote-notice">{notice}</p>}
        <div className="quote-actions">
          <button className="quote-button quote-secondary" type="button" disabled={busy} onClick={edit}><Icon>edit</Icon> Editar solicitud</button>
          {download
            ? <a className="quote-button quote-primary" href={download} download={preview.quote.referencia + '.pdf'}><Icon>download</Icon> Descargar PDF</a>
            : <button type="button" className="quote-button quote-primary" disabled={busy} onClick={outdated ? submit : generatePdf}>
              <Icon>{outdated ? 'refresh' : 'download'}</Icon>
              {busy ? 'Preparando documento…' : outdated ? 'Actualizar vista previa' : 'Generar PDF'}
            </button>}
        </div>
        {download && <p role="status" className="quote-download-status">PDF listo. Puedes volver a descargarlo desde el botón.</p>}
      </> : <form noValidate onSubmit={submit}>
        <fieldset className="quote-form-sheet" disabled={busy}>
          <legend className="sr-only">Solicitud de cotización</legend>
          <div className="quote-fields-groups">
            <div className="quote-group">
              <h2>Datos del cliente</h2>
              <div className="quote-fields-grid">
                <Field {...field('nombre')} label="Nombre o razón social" maxLength={160} autoComplete="name" />
                <Field {...field('nit')} label="NIT" optional maxLength={30} />
                <Field {...field('correo')} label="Correo electrónico" type="email" autoComplete="email" maxLength={254} />
                <Field {...field('telefono')} label="Teléfono" type="tel" autoComplete="tel" maxLength={30} />
              </div>
            </div>
            <div className="quote-group">
              <h2>Datos del proyecto</h2>
              <div className="quote-fields-grid">
                <Field {...field('ciudad')} label="Ciudad o municipio" maxLength={120} autoComplete="address-level2" />
                <Field {...field('direccion')} label="Dirección de la obra" optional maxLength={200} autoComplete="street-address" />
                <div className="quote-wide"><Field {...field('descripcion')} label="Descripción del trabajo" multiline rows={2} maxLength={2000} /></div>
              </div>
            </div>
          </div>
          <div className="quote-services">
            <div className="quote-detail-title"><h2>Servicios a cotizar</h2><span>Valores en COP</span></div>
            <div className="quote-picker">
              <label htmlFor="quote-servicios">Servicio del catálogo</label>
              <select id="quote-servicios" value={selection} disabled={!ready || available.length === 0 || items.length >= 40}
                aria-invalid={Boolean(errors.servicios)} aria-describedby={errors.servicios ? 'quote-service-error' : undefined}
                onChange={event => setSelection(event.target.value)}>
                <option value="">{ready ? 'Selecciona un servicio' : 'Consultando catálogo…'}</option>
                {categories.map(category => <optgroup key={category} label={category}>
                  {available.filter(service => service.categoria === category).map(service =>
                    <option key={service.id} value={service.id}>{service.nombre}</option>)}
                </optgroup>)}
              </select>
              <button className="quote-button quote-secondary" type="button" onClick={addService} disabled={!selection || !ready}>
                <Icon>add</Icon> Agregar servicio
              </button>
            </div>
            {errors.servicios && <p className="quote-field-error" id="quote-service-error">{errors.servicios}</p>}
            {catalog.city === city && catalog.error && <div className="quote-notice" role="alert">
              {catalog.error} <button type="button" className="quote-text-button" onClick={() => {
                setCatalog(previous => ({ ...previous, city: null, error: '' }));
                setAttempt(previous => previous + 1);
              }}>Reintentar</button>
            </div>}
            {ready && !catalog.services.length && <p role="status" className="quote-notice">El catálogo de servicios aún no está disponible.</p>}
            {items.length > 0 && <QuoteItems items={items} errors={errors} refreshing={!ready} onQuantity={changeQuantity}
              onRemove={id => { setChosen(previous => previous.filter(item => item.selected.id !== id)); setNotice(''); }} />}
          </div>
        </fieldset>
        {notice && <p role="alert" className="quote-notice">{notice}</p>}
        <div className="quote-actions">
          <a className="quote-policy" href={POLICY_URL} target="_blank" rel="noopener noreferrer">Política de tratamiento de datos</a>
          <button className="quote-button quote-primary" type="submit" disabled={busy || !ready || !catalog.services.length}>
            {busy ? 'Calculando…' : 'Ver vista previa'} <Icon>arrow_forward</Icon>
          </button>
        </div>
      </form>}
    </div>
  </main>;
}
