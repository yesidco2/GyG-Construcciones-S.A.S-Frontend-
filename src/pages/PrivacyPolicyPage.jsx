import { PRIVACY_POLICY_VERSION } from '../services/privacyPolicy';

const policySections = [
  {
    title: 'Responsable del tratamiento',
    content: 'G&G Construcciones S.A.S. — NIT [COMPLETAR].',
  },
  {
    title: 'Datos que se recolectan',
    content: 'Datos de identificación y contacto, información que el titular incluya en sus solicitudes y consultas, y los datos necesarios para gestionar los servicios solicitados.',
  },
  {
    title: 'Finalidades del tratamiento',
    content: 'Atender solicitudes de contacto y cotización, responder consultas, gestionar la suscripción al boletín solicitado y mantener la seguridad y operación de los canales digitales.',
  },
  {
    title: 'Derechos del titular',
    content: 'El titular puede conocer, actualizar y rectificar sus datos personales; solicitar prueba de la autorización; conocer el uso dado a sus datos; presentar consultas y reclamos; solicitar la revocatoria de la autorización o la supresión de los datos cuando proceda, y acudir ante la autoridad competente.',
  },
  {
    title: 'Canal para consultas y reclamos',
    content: 'Correo electrónico: [COMPLETAR].',
  },
  {
    title: 'Tiempo de conservación',
    content: '[COMPLETAR].',
  },
  {
    title: 'Vigencia y versión',
    content: `Fecha de vigencia: [COMPLETAR]. Versión configurada: ${PRIVACY_POLICY_VERSION}.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main id="politica-datos" className="min-h-screen bg-surface px-md py-xl pt-24">
      <article className="mx-auto max-w-4xl rounded-2xl border border-surface-variant bg-white p-6 shadow-sm md:p-10">
        <p role="status" className="rounded-lg border border-amber-400 bg-amber-50 p-4 font-bold text-amber-900">
          BORRADOR – pendiente de revisión y aprobación por G&amp;G Construcciones S.A.S.
        </p>
        <p className="mt-6 font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">
          Protección de datos personales
        </p>
        <h1 className="mt-2 font-headline-xl text-headline-xl text-primary">
          Política de tratamiento de datos personales
        </h1>
        <p className="mt-4 font-body-md text-body-md text-secondary">
          Este documento es un borrador de estructura para revisión y aprobación. Los campos marcados como [COMPLETAR] requieren información confirmada por G&amp;G Construcciones S.A.S.
        </p>
        <div className="mt-8 space-y-6">
          {policySections.map((section) => (
            <section key={section.title}>
              <h2 className="font-headline-sm text-xl font-bold text-primary">{section.title}</h2>
              <p className="mt-2 font-body-md text-body-md text-secondary">{section.content}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
