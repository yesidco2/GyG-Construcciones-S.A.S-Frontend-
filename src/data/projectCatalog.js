export const projectCatalog = [
  {
    code: 'GG-2026-00125',
    title: 'Viaducto Metropolitano',
    status: 'En ejecución',
    client: 'Secretaría Distrital de Movilidad',
    progress: 74,
    phase: 'Interventoría técnica y seguridad estructural',
    budget: '$ 4.8 M',
    description:
      'Supervisión de obra, control de calidad y gestión de riesgos para la ampliación del corredor vial principal.',
    lastUpdate: '12 ago 2026',
    nextMilestone: 'Entrega de avance mensual y revisión técnica de vigas',
  },
  {
    code: 'GG-2026-00218',
    title: 'Centro Logístico Industrial',
    status: 'En revisión',
    client: 'Grupo Logística Norte',
    progress: 58,
    phase: 'Diseño y obra civil',
    budget: '$ 3.2 M',
    description:
      'Diseño estructural para nave industrial con sistemas de drenaje, accesos y medidas de seguridad para operación continua.',
    lastUpdate: '05 ago 2026',
    nextMilestone: 'Aprobación de planos de detalle y contratación de maquinaria',
  },
  {
    code: 'GG-2026-00307',
    title: 'Subestación Energía Norte',
    status: 'Culminado',
    client: 'Energía del Caribe',
    progress: 100,
    phase: 'Comisionamiento y cierre',
    budget: '$ 6.1 M',
    description:
      'Proyecto de subestación con protocolo de seguridad y cumplimiento de normativas eléctricas y de salud ocupacional.',
    lastUpdate: '29 jul 2026',
    nextMilestone: 'Cierre administrativo y entrega de documentación final',
  },
  {
    code: 'GG-2026-00490',
    title: 'Planta de Tratamiento de Aguas',
    status: 'Programado',
    client: 'Municipio de Cota',
    progress: 18,
    phase: 'Estudios preliminares',
    budget: '$ 2.6 M',
    description:
      'Diagnóstico técnico y diseño conceptual para optimización del sistema de tratamiento y cumplimiento ambiental.',
    lastUpdate: '18 ago 2026',
    nextMilestone: 'Presentación de estudio de impacto y cronograma preliminar',
  },
];

export function findProjectByCode(code) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  return projectCatalog.find((project) => project.code.toUpperCase() === normalized) || null;
}
