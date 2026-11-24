import { useState } from 'react';

const environmentalPolicies = [
  {
    title: 'Manejo de residuos de construcción',
    summary: 'Separar y aprovechar materiales.',
    detail: 'Clasificar los residuos de obra y disponerlos adecuadamente para reducir impactos y facilitar la reutilización segura.',
    icon: 'recycling',
  },
  {
    title: 'Control de emisiones de polvo',
    summary: 'Reducir partículas en el aire.',
    detail: 'Cubrir materiales y aplicar controles en las actividades que puedan dispersar polvo en el entorno.',
    icon: 'air',
  },
  {
    title: 'Gestión de agua en obra',
    summary: 'Cuidar el agua y los drenajes.',
    detail: 'Controlar el agua de lavado y la escorrentía; reutilizar agua cuando sea viable y seguro.',
    icon: 'water_drop',
  },
  {
    title: 'Control de ruido y vibraciones',
    summary: 'Mitigar ruido de equipos.',
    detail: 'Planificar actividades ruidosas y mantener los equipos para reducir molestias e impactos en el entorno.',
    icon: 'volume_down',
  },
  {
    title: 'Protección del suelo',
    summary: 'Prevenir erosión y contaminación.',
    detail: 'Almacenar materiales de forma segura y controlar la escorrentía para proteger el suelo.',
    icon: 'landscape',
  },
  {
    title: 'Uso eficiente de energía',
    summary: 'Usar energía eficientemente.',
    detail: 'Promover el uso eficiente de maquinaria, iluminación y otros recursos durante cada proyecto.',
    icon: 'bolt',
  },
  {
    title: 'Selección responsable de materiales',
    summary: 'Elegir materiales durables.',
    detail: 'Considerar durabilidad, uso eficiente y reducción de desperdicios al seleccionar materiales y proveedores.',
    icon: 'fact_check',
  },
  {
    title: 'Prevención de derrames',
    summary: 'Evitar fugas y derrames.',
    detail: 'Almacenar y manipular combustibles, aceites y sustancias con controles que protejan el suelo y el agua.',
    icon: 'oil_barrel',
  },
  {
    title: 'Cuidado de flora y fauna',
    summary: 'Respetar el entorno natural.',
    detail: 'Identificar elementos naturales en el área de trabajo y aplicar medidas de prevención y protección cuando corresponda.',
    icon: 'park',
  },
];

export default function About() {
  const [expandedPolicy, setExpandedPolicy] = useState(null);

  return (
    <section id="nosotros" className="bg-white px-4 py-xl sm:px-6 lg:px-8 2xl:px-12">
      <div className="mx-auto max-w-container-max">
        <div className="mb-lg flex flex-col gap-md border-b border-surface-variant pb-lg md:flex-row md:items-end md:justify-between">
          <h2 className="mb-xs font-headline-lg text-headline-lg text-primary">Nosotros</h2>
          <p className="max-w-2xl font-body-md text-body-md text-secondary">
            Conozca nuestra misión, visión y lo que opinan nuestros clientes.
          </p>
        </div>

        <div className="mb-xl grid grid-cols-1 gap-lg md:grid-cols-3">
          <div>
            <h3 className="mb-xs font-headline-sm text-headline-sm text-primary">Misión</h3>
            <p className="font-body-sm text-body-sm text-secondary">
              Brindar servicios de ingeniería y gestión SST que garanticen proyectos seguros, eficientes y conformes a la normativa, protegiendo vidas y activos.
            </p>
          </div>
          <div>
            <h3 className="mb-xs font-headline-sm text-headline-sm text-primary">Visión</h3>
            <p className="font-body-sm text-body-sm text-secondary">
              Ser la firma de referencia en la región por excelencia técnica, cultura de prevención y solución integral en seguridad y obras civiles.
            </p>
          </div>
          <div>
            <h3 className="mb-xs font-headline-sm text-headline-sm text-primary">Valores</h3>
            <p className="font-body-sm text-body-sm text-secondary">
              Compromiso, profesionalismo, prevención y mejora continua en cada proyecto.
            </p>
          </div>
        </div>

        <div className="mb-xl rounded-xl border border-surface-variant bg-surface p-md shadow-sm">
          <h3 className="mb-md font-headline-sm text-headline-sm text-primary">Políticas ambientales y mitigación</h3>
          <div className="grid gap-md md:grid-cols-3">
            {environmentalPolicies.map((policy, index) => {
              const isExpanded = expandedPolicy === index;
              const detailId = `environmental-policy-${index}`;

              return (
                <article key={policy.title} className="bento-card rounded-lg bg-white shadow-sm ring-1 ring-surface-variant">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={detailId}
                    onClick={() => setExpandedPolicy(isExpanded ? null : index)}
                    className="w-full rounded-lg p-md text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
                  >
                    <span className="mb-sm flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary">
                      <span className="material-symbols-outlined" aria-hidden="true">{policy.icon}</span>
                    </span>
                    <span className="block font-headline-sm text-headline-sm text-primary">{policy.title}</span>
                    <span className="mt-xs block font-body-sm text-body-sm text-secondary">{policy.summary}</span>
                    <span className="mt-sm flex items-center gap-1 text-xs font-semibold text-industrial-orange">
                      {isExpanded ? 'Ver menos' : 'Ver detalles'}
                      <span className="material-symbols-outlined text-base" aria-hidden="true">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </span>
                  </button>
                  <div id={detailId} hidden={!isExpanded} className="px-md pb-md">
                    <p className="border-t border-surface-variant pt-sm font-body-sm text-body-sm text-secondary">
                      {policy.detail}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mb-xl">
          <h3 className="mb-sm font-headline-sm text-headline-sm text-primary">Testimonios</h3>
          <div className="grid grid-cols-1 gap-md md:grid-cols-3">
            <div className="rounded-lg bg-surface-container-high p-md shadow-sm">
              <p className="font-body-sm text-body-sm text-secondary">&quot;La intervención técnica de G&amp;G redujo nuestros incidentes y mejoró la productividad.&quot;</p>
              <div className="mt-3 font-label-caps text-label-caps text-primary">— Ing. Laura Martínez</div>
            </div>
            <div className="rounded-lg bg-surface-container-high p-md shadow-sm">
              <p className="font-body-sm text-body-sm text-secondary">&quot;Profesionales, responsables y orientados a resultados. Altamente recomendados.&quot;</p>
              <div className="mt-3 font-label-caps text-label-caps text-primary">— Sr. Carlos Gómez</div>
            </div>
            <div className="rounded-lg bg-surface-container-high p-md shadow-sm">
              <p className="font-body-sm text-body-sm text-secondary">&quot;Implementaron un SG-SST claro y efectivo en tiempo récord.&quot;</p>
              <div className="mt-3 font-label-caps text-label-caps text-primary">— Dra. Paula Ríos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}