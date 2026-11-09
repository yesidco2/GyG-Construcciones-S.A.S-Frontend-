import { EFFECTIVE_DATE_LABEL, CONTACT_EMAIL } from '../config/privacy';
import { COOKIE_POLICY_VERSION } from '../config/cookies';
import cookieInventory from '../../docs/inventario-cookies.md?raw';

const inventoryTableLines = cookieInventory
  .split(/\r?\n/)
  .filter((line) => line.startsWith('|'));
const inventoryRows = [
  inventoryTableLines[0],
  ...inventoryTableLines.slice(2),
]
  .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-surface px-md py-xl pt-24">
      <article className="mx-auto max-w-4xl rounded-2xl border border-surface-variant bg-white p-6 shadow-sm md:p-10">
        <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">
          Privacidad y almacenamiento
        </p>
        <h1 className="mt-2 font-headline-xl text-headline-xl text-primary">Política de cookies</h1>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-body-md text-body-md text-secondary">
          <div className="flex gap-1">
            <dt className="font-semibold">Versión:</dt>
            <dd>{COOKIE_POLICY_VERSION}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-semibold">Fecha de vigencia:</dt>
            <dd>{EFFECTIVE_DATE_LABEL}</dd>
          </div>
        </dl>

        <div className="mt-8 space-y-7 text-secondary">
          <section>
            <h2 className="font-headline-sm text-xl font-bold text-primary">Qué son las cookies</h2>
            <p className="mt-2">
              Las cookies son pequeños datos que un sitio puede guardar en el navegador. El almacenamiento del navegador también puede incluir mecanismos distintos de las cookies, como sessionStorage o IndexedDB.
            </p>
          </section>

          <section>
            <h2 className="font-headline-sm text-xl font-bold text-primary">Cookies y almacenamiento identificados</h2>
            <p className="mt-2">
              Este inventario describe el almacenamiento propio identificado en el sitio y los servicios externos que pueden intervenir. Actualmente no hay herramientas de analítica ni publicidad configuradas. La información que un proveedor externo almacene puede variar según la configuración y el navegador.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-surface-container-low text-primary">
                  <tr>
                    {inventoryRows[0]?.map((header) => (
                      <th key={header} scope="col" className="border border-outline-variant p-3">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryRows.slice(1).map((row, rowIndex) => (
                    <tr key={`${row[0]}-${rowIndex}`} className="align-top even:bg-surface">
                      {row.map((cell, cellIndex) => (
                        <td key={`${cellIndex}-${cell}`} className="border border-outline-variant p-3">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-headline-sm text-xl font-bold text-primary">Cómo gestionar o revocar tu decisión</h2>
            <p className="mt-2">
              En el sitio, usa el enlace “Preferencias de cookies” del pie de página para administrar las categorías opcionales. Actualmente no hay cookies de analítica activas. Si en el futuro se incorporan, solo se utilizarán con tu autorización y podrás retirarla guardando tus preferencias.
            </p>
            <p className="mt-2">
              Puedes administrar o borrar cookies y datos de sitios desde la configuración de privacidad de tu navegador. La forma de hacerlo depende del navegador que uses.
            </p>
          </section>

          <section>
            <h2 className="font-headline-sm text-xl font-bold text-primary">Contacto y otras políticas</h2>
            <p className="mt-2">
              Para consultas relacionadas con privacidad, escribe a{' '}
              <a className="font-semibold text-on-primary-fixed-variant underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <p className="mt-2">
              Consulta también la{' '}
              <a className="font-semibold text-on-primary-fixed-variant underline" href="#politica-datos">
                Política de tratamiento de datos personales
              </a>
              .
            </p>
          </section>
        </div>

        <a
          href="#hero"
          className="mt-10 inline-block font-semibold text-on-primary-fixed-variant underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
        >
          Volver al inicio
        </a>
      </article>
    </main>
  );
}
