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
    <main className="min-h-screen bg-surface px-4 py-xl pt-24 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-7xl rounded-2xl border border-surface-variant bg-white p-6 shadow-sm md:p-10">
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
            <h2 className="font-headline-sm text-xl font-bold text-primary">Reglas aplicables en Colombia</h2>
            <p className="mt-2">
              En Colombia, el tratamiento de datos que pueda realizarse mediante cookies se rige principalmente por el marco general de protección de datos personales, incluida la Ley 1581 de 2012 y su reglamentación compilada en el Decreto 1074 de 2015. Cuando una cookie u otra tecnología permite identificar o hacer identificable a una persona, aplican las obligaciones correspondientes a esos datos. La Superintendencia de Industria y Comercio (SIC) es la autoridad nacional de protección de datos.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li><a className="font-semibold text-on-primary-fixed-variant underline" href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981" target="_blank" rel="noreferrer">Ley Estatutaria 1581 de 2012</a>, fuente oficial de Función Pública.</li>
              <li><a className="font-semibold text-on-primary-fixed-variant underline" href="https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=76608" target="_blank" rel="noreferrer">Decreto 1074 de 2015</a>, Decreto Único Reglamentario del sector Comercio, Industria y Turismo.</li>
              <li><a className="font-semibold text-on-primary-fixed-variant underline" href="https://www.sic.gov.co/tema/proteccion-de-datos-personales" target="_blank" rel="noreferrer">Superintendencia de Industria y Comercio</a>, autoridad colombiana de protección de datos personales.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-headline-sm text-xl font-bold text-primary">Cookies y almacenamiento identificados</h2>
            <p className="mt-2">
              Este inventario describe el almacenamiento propio identificado en el sitio y los servicios externos que pueden intervenir. El sitio puede mostrar promociones de servicios propios, pero actualmente no integra redes publicitarias de terceros ni herramientas de analítica. La información que un proveedor externo almacene puede variar según la configuración y el navegador.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
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
              En el sitio, usa el enlace “Preferencias de cookies” del pie de página para administrar las categorías opcionales. Actualmente no hay cookies de analítica ni de publicidad de terceros activas. Si se incorporan tecnologías opcionales, se solicitará autorización antes de activarlas y podrás retirar tu decisión guardando tus preferencias.
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
