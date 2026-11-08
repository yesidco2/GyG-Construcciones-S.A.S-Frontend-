import { EFFECTIVE_DATE, CONTACT_EMAIL } from '../config/privacy';
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
        {COOKIE_POLICY_VERSION.toLowerCase().includes('borrador') && (
          <div role="status" className="mb-8 rounded-lg border border-amber-500 bg-amber-50 p-4 text-amber-950">
            <p className="font-bold">
              BORRADOR – pendiente de revisión y aprobación por G&amp;G Construcciones S.A.S.
            </p>
            <p className="mt-1">Los datos identificados como [VERIFICAR] requieren confirmación antes de publicar la política definitiva.</p>
          </div>
        )}

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
            <dd>{EFFECTIVE_DATE || 'Pendiente de definir'}</dd>
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
              La tabla se genera a partir del inventario del proyecto. Los valores [VERIFICAR] indican información de terceros que no se pudo confirmar desde el código.
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
              En el sitio, usa el enlace “Preferencias de cookies” del pie de página para aceptar o rechazar analítica. También puedes revocar una aceptación desactivando Analítica y guardando las preferencias; se retirarán los elementos de almacenamiento de analítica reconocidos por el sitio.
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
