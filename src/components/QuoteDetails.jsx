const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 2,
});
const quantities = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
const dates = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' });

const dateLabel = (value) => dates.format(new Date(value + 'T00:00:00Z'));
export const wholeUnits = (unit) => ['servicio completo', 'visita'].includes(unit.toLowerCase());

export function quantityError(value, unit) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 999999.99) return 'Ingresa una cantidad mayor que cero y menor que un millón.';
  if (wholeUnits(unit) && !Number.isInteger(n)) return 'Esta unidad requiere una cantidad entera.';
  if (!/^\d+(?:\.\d{1,2})?$/.test(String(value))) return 'Usa hasta dos decimales.';
  return '';
}

export function Icon({ children }) {
  return <span aria-hidden="true" className="material-symbols-outlined">{children}</span>;
}

export function QuoteItems({ items, onQuantity, onRemove, errors = {}, refreshing = false }) {
  const editing = Boolean(onQuantity);
  return <table className="quote-lines">
    <caption className="sr-only">Detalle de los servicios en pesos colombianos</caption>
    <thead><tr>
      <th scope="col">Servicio</th><th scope="col">Unidad</th><th scope="col">Cantidad</th>
      <th scope="col">Precio unitario</th><th scope="col">Total del ítem</th>
      {editing && <th scope="col"><span className="sr-only">Acciones</span></th>}
    </tr></thead>
    <tbody>{items.map(({ servicio, cantidad, total }) => {
      const { id, tarifa, nombre, descripcion, unidad } = servicio;
      const quantityId = 'quote-qty-' + id;
      const error = errors[quantityId];
      return <tr key={id}>
        <th scope="row" className="quote-line-title">
          <strong>{nombre}</strong><p>{descripcion}</p>
          {tarifa?.tipo === 'APROBADA' && !refreshing && <p>Alcance: {tarifa.alcance}</p>}
          {tarifa?.tipo === 'REFERENCIA' && !refreshing && <details className="quote-source">
            <summary>Precio de referencia</summary>
            <dl>
              <dt>Fuente</dt><dd>{tarifa.fuente}</dd>
              <dt>Fecha</dt><dd>{dateLabel(tarifa.fechaFuente)}</dd>
              <dt>Ubicación</dt><dd>{tarifa.ubicacion}</dd>
              <dt>Unidad</dt><dd>{unidad}</dd>
              <dt>Alcance</dt><dd>{tarifa.alcance}</dd>
            </dl>
          </details>}
        </th>
        <td data-label="Unidad">{unidad}</td>
        <td data-label="Cantidad">{editing ? <>
          <input id={quantityId} aria-label={'Cantidad de ' + nombre} type="number"
            min={wholeUnits(unidad) ? 1 : 0.01} max={wholeUnits(unidad) ? 999999 : 999999.99}
            step={wholeUnits(unidad) ? 1 : 0.01} inputMode={wholeUnits(unidad) ? 'numeric' : 'decimal'}
            value={cantidad} onChange={event => onQuantity(id, event.target.value)}
            aria-invalid={Boolean(error)} aria-describedby={error ? quantityId + '-error' : undefined} />
          {error && <small className="quote-field-error" id={quantityId + '-error'}>{error}</small>}
        </> : quantities.format(cantidad)}</td>
        <td data-label="Precio unitario">{refreshing ? '…' : tarifa ?
          pesos.format(tarifa.precioUnitario) : <span className="quote-pending">Requiere revisión</span>}</td>
        <td data-label="Total del ítem" className="quote-line-total">{total == null || refreshing ? '—' : pesos.format(total)}</td>
        {editing && <td className="quote-remove-cell"><button type="button" className="quote-remove"
          onClick={() => onRemove(id)} aria-label={'Quitar ' + nombre}><Icon>delete</Icon></button></td>}
      </tr>;
    })}</tbody>
  </table>;
}

export default function QuoteDetails({ quote }) {
  const { empresa, cliente, fecha, referencia, items, subtotal, pendientes, ajustes, total } = quote;
  const conditions = Boolean(quote.diasVigencia || quote.condiciones || quote.alcance);
  const references = items.some(({ servicio }) => servicio.tarifa?.tipo === 'REFERENCIA');
  return <article className="quote-paper" aria-label="Documento de cotización">
    <div className="quote-letterhead">
      <div>
        <div className="quote-brand"><Icon>foundation</Icon> G&amp;G</div>
        <p><strong>{empresa.nombre}</strong></p>
        {empresa.nit && <p>NIT {empresa.nit}</p>}
        <p>{[empresa.direccion, empresa.ubicacion].filter(Boolean).join(' · ')}</p>
        <p>{[empresa.telefono, empresa.correo].filter(Boolean).join(' · ')}</p>
      </div>
      <div className="quote-document-title">
        <h2>{quote.preliminar ? 'Estimación preliminar' : 'Cotización'}</h2>
        <p><strong>{referencia}</strong></p><time dateTime={fecha}>{dateLabel(fecha)}</time>
      </div>
    </div>
    <div className="quote-parties">
      <div><h3>Cliente</h3><strong>{cliente.nombre}</strong>
        {cliente.nit && <p>NIT {cliente.nit}</p>}
        <p>{cliente.correo}</p><p>{cliente.telefono}</p>
      </div>
      <div><h3>Trabajo solicitado</h3><strong>{cliente.ciudad}</strong>
        {cliente.direccion && <p>{cliente.direccion}</p>}
        <p className="quote-user-text">{cliente.descripcion}</p>
      </div>
    </div>
    <div className="quote-detail-title"><h3>Detalle de servicios</h3><span>Valores en COP</span></div>
    <QuoteItems items={items} />
    <div className="quote-summary">
      <div>
        {pendientes > 0 && <p className="quote-note"><Icon>info</Icon><span>G&amp;G debe confirmar el precio de los servicios marcados «Requiere revisión». Están excluidos del cálculo.</span></p>}
        {references && <p className="quote-note"><Icon>info</Icon><span>Los precios de referencia están sujetos a confirmación por G&amp;G. Consulta la fuente en el detalle del servicio.</span></p>}
      </div>
      <dl className="quote-totals">
        {(!pendientes || ajustes.length > 0) && <div><dt>{pendientes ? 'Subtotal de ítems valorados' : 'Subtotal'}</dt><dd>{pesos.format(subtotal)}</dd></div>}
        {ajustes.map((item, index) => <div key={index}><dt>{item.nombre}</dt><dd>{pesos.format(item.valor)}</dd></div>)}
        <div className="quote-final-total"><dt>{pendientes ? 'Subtotal de ítems valorados' + (ajustes.length ? ' con ajustes' : '') : 'Total'}</dt><dd>{pesos.format(total)}</dd></div>
      </dl>
    </div>
    {conditions && <div className="quote-terms">
      {quote.diasVigencia != null && <p><strong>Vigencia</strong> {quote.diasVigencia} días desde la fecha de emisión.</p>}
      {quote.alcance && <p><strong>Alcance</strong> {quote.alcance}</p>}
      {quote.condiciones && <p><strong>Condiciones</strong> {quote.condiciones}</p>}
    </div>}
  </article>;
}
