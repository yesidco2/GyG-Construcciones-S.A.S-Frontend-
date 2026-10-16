const environmentalPolicies = [
  {
    title: 'Manejo de residuos de construcción',
    description: 'Clasificación y disposición adecuada de residuos de obra para minimizar impacto ambiental y costear la reutilización segura de materiales.',
  },
  {
    title: 'Control de emisiones de polvo',
    description: 'Uso de riego, cubrimiento de materiales y procedimientos de trabajo para reducir la dispersión de partículas en el entorno.',
  },
  {
    title: 'Gestión de agua en obra',
    description: 'Prevención de escorrentías, recirculación y control de agua de lavado para reducir el impacto de efluentes y sedimentos.',
  },
];

export default function About() {
  return (
    <section id="nosotros" className="bg-white py-xl px-md">
      <div className="mx-auto max-w-container-max">
        <div className="mb-lg text-center">
          <h2 className="mb-xs font-headline-lg text-headline-lg text-primary">Nosotros</h2>
          <p className="mx-auto max-w-2xl font-body-md text-body-md text-secondary">
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
            {environmentalPolicies.map((policy) => (
              <div key={policy.title} className="rounded-lg bg-white p-md shadow-sm ring-1 ring-surface-variant">
                <div className="mb-sm flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary">
                  <span className="material-symbols-outlined">eco</span>
                </div>
                <h4 className="mb-xs font-headline-sm text-headline-sm text-primary">{policy.title}</h4>
                <p className="font-body-sm text-body-sm text-secondary">{policy.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-xl">
          <h3 className="mb-sm font-headline-sm text-headline-sm text-primary">Testimonios</h3>
          <div className="grid grid-cols-1 gap-md md:grid-cols-3">
            <div className="rounded-lg bg-surface-container-high p-md shadow-sm">
              <p className="font-body-sm text-body-sm text-secondary">"La intervención técnica de G&G redujo nuestros incidentes y mejoró la productividad."</p>
              <div className="mt-3 font-label-caps text-label-caps text-primary">— Ing. Laura Martínez</div>
            </div>
            <div className="rounded-lg bg-surface-container-high p-md shadow-sm">
              <p className="font-body-sm text-body-sm text-secondary">"Profesionales, responsables y orientados a resultados. Altamente recomendados."</p>
              <div className="mt-3 font-label-caps text-label-caps text-primary">— Sr. Carlos Gómez</div>
            </div>
            <div className="rounded-lg bg-surface-container-high p-md shadow-sm">
              <p className="font-body-sm text-body-sm text-secondary">"Implementaron un SG-SST claro y efectivo en tiempo récord."</p>
              <div className="mt-3 font-label-caps text-label-caps text-primary">— Dra. Paula Ríos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}