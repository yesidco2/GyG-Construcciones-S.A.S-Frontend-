const services = [
  {
    title: 'Diseño Estructural',
    icon: 'architecture',



    description: 'Cálculos, modelado 3D y diseño de planos estructurales bajo norma NSR-10.'
  },
  {
    title: 'Ejecución de Obras',
    icon: 'construction',


    description: 'Construcción y dirección técnica integral de proyectos civiles y comerciales.'
  },
  {
    title: 'Interventoría',
    icon: 'visibility',



    description: 'Supervisión técnica, administrativa y financiera para asegurar calidad y cumplimiento.'
  },
  {
    title: 'Estudios de Suelos',
    icon: 'layers',


    description: 'Exploración geotécnica y ensayos de laboratorio para cimentaciones seguras.'
  },
  {
    title: 'Remodelaciones y Refuerzos',
    icon: 'home_repair_service',



    description: 'Adecuación de espacios, reforzamiento de estructuras y mantenimiento locativo.'
  },
  {
    title: 'Presupuestos y Cantidades',
    icon: 'calculate',



    description: 'Elaboración de APUs, cómputos métricos y programación detallada de obra.'
  }
];

const sstServices = [
  {
    title: 'Implementación SG-SST',
    icon: 'fact_check',



    description: 'Diseño, ejecución y evaluación del sistema según el Decreto 1072 y Res. 0312.'
  },
  {
    title: 'Auditorías de Riesgo',
    icon: 'assignment_late',



    description: 'Identificación de peligros, valoración de riesgos e inspecciones de seguridad.'
  },
  {
    title: 'Seguridad en Alturas',
    icon: 'height',


    description: 'Planes de protección contra caídas, inspección de equipos y certificación de puntos.'
  },
  {
    title: 'Capacitación Técnica',
    icon: 'school',



    description: 'Formación especializada a trabajadores en prevención de riesgos laborales.'
  },
  {
    title: 'Planes de Emergencia',
    icon: 'emergency',



    description: 'Elaboración de planes de evacuación, análisis de vulnerabilidad y brigadas.'
  },
  {
    title: 'Investigación de Accidentes',
    icon: 'search',


    description: 'Análisis de causas raíz e implementación de medidas correctivas para el personal.'
  }
];

function ServiceRow({ title, icon, description }) {
  return (
    <li className="portal-service-row">
      <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
      <div>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </li>
  );
}

export default function Services() {
  return (
    <section className="portal-services py-xl px-md max-w-container-max mx-auto" id="servicios">
      <header>
        <h2>Servicios integrales</h2>
        <p>Combinamos la precisión de la ingeniería civil con la rigurosidad normativa del SG-SST.</p>
      </header>
      <div className="portal-services-grid">
        <div className="portal-service-group">
          <h3 aria-label="Bloque 01 — Ingeniería Civil">Ingeniería civil</h3>
          <ul>{services.map((service) => <ServiceRow key={service.title} {...service} />)}</ul>
        </div>
        <div className="portal-service-group">
          <h3 aria-label="Bloque 02 — SST Especializada">SST especializada</h3>
          <ul>{sstServices.map((service) => <ServiceRow key={service.title} {...service} />)}</ul>
        </div>
      </div>
    </section>
  );
}
