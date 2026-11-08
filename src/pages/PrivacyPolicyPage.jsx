import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import policyMarkdown from '../content/politicaDatos.md?raw';
import { EFFECTIVE_DATE, IS_DRAFT, POLICY_VERSION } from '../config/privacy';

const policySections = [...policyMarkdown.matchAll(/^## (\d+)\. (.+)$/gm)].map(([, number, title]) => ({
  id: `section-${number}`,
  title: `${number}. ${title}`,
}));

const textFromChildren = (children) =>
  React.Children.toArray(children)
    .map((child) => (typeof child === 'string' || typeof child === 'number' ? child : ''))
    .join('');

function PolicyHeading({ children, ...props }) {
  const sectionNumber = textFromChildren(children).match(/^(\d+)\./)?.[1];
  return (
    <h2
      {...props}
      id={sectionNumber ? `section-${sectionNumber}` : undefined}
      className="mb-3 mt-8 scroll-mt-24 font-headline-sm text-xl font-bold text-primary"
    >
      {children}
    </h2>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <a
        href="#policy-content"
        className="sr-only z-[60] rounded bg-white p-3 text-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-industrial-orange"
      >
        Saltar al contenido de la política
      </a>
      <main
        id="policy-content"
        tabIndex="-1"
        className="min-h-screen bg-surface px-md py-xl pt-24 focus:outline-none"
      >
        <article className="mx-auto max-w-[75ch] rounded-2xl border border-surface-variant bg-white p-6 shadow-sm print:max-w-none print:border-0 print:p-0 print:shadow-none md:p-10">
          {IS_DRAFT && (
            <div role="status" className="mb-8 rounded-lg border border-amber-500 bg-amber-50 p-4 text-amber-950">
              <p className="font-bold">
                BORRADOR – pendiente de revisión y aprobación por G&amp;G Construcciones S.A.S.
              </p>
              <p className="mt-1">
                Los campos marcados como [COMPLETAR] aún no se han llenado.
              </p>
            </div>
          )}

          <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">
            Protección de datos personales
          </p>
          <h1 className="mt-2 font-headline-xl text-headline-xl text-primary">
            Política de tratamiento de datos personales
          </h1>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-body-md text-body-md text-secondary">
            <div className="flex gap-1">
              <dt className="font-semibold">Versión:</dt>
              <dd>{POLICY_VERSION}</dd>
            </div>
            <div className="flex gap-1">
              <dt className="font-semibold">Fecha de vigencia:</dt>
              <dd>{EFFECTIVE_DATE || 'Pendiente de definir'}</dd>
            </div>
          </dl>

          <nav
            aria-label="Índice de la política"
            className="mt-8 rounded-xl border border-surface-variant bg-surface-container-low p-5"
          >
            <h2 className="font-headline-sm text-lg font-bold text-primary">Índice</h2>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {policySections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-on-primary-fixed-variant underline decoration-industrial-orange underline-offset-2 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-8 max-w-[75ch] text-secondary [&_a]:text-on-primary-fixed-variant [&_a]:underline [&_a]:underline-offset-2 [&_li]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-4 [&_strong]:font-semibold [&_table]:w-full [&_td]:border [&_td]:border-outline-variant [&_td]:p-2 [&_th]:border [&_th]:border-outline-variant [&_th]:bg-surface-container-low [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h2 className="mb-3 mt-8 font-headline-sm text-xl font-bold text-primary">
                    {children}
                  </h2>
                ),
                h2: PolicyHeading,
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto">
                    <table>{children}</table>
                  </div>
                ),
              }}
            >
              {policyMarkdown}
            </ReactMarkdown>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <a
              href="#hero"
              className="font-semibold text-on-primary-fixed-variant underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
            >
              Volver al inicio
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
            >
              Imprimir / guardar en PDF
            </button>
          </div>
        </article>
      </main>
    </>
  );
}
