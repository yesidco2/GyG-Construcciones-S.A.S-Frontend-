import { useEffect, useState } from 'react';
import safeImageUrl from '../utils/safeImageUrl';

const fallbackProjectImage = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80';
const filters = [
  { label: 'Todos', category: '' },
  { label: 'Ingeniería Civil', category: 'CIVIL' },
  { label: 'SST', category: 'SST' },
];

const emblematicProjects = [
  {
    id: 1,
    title: 'Puente Peatonal Avenida Boyacá',
    description: 'Estructura peatonal diseñada para mejorar la movilidad segura y la conectividad urbana.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
    category: 'Ingeniería Civil',
    categoryKey: 'CIVIL',
    metric: '320 m',
    metricLabel: 'Conectividad construida',
  },
  {
    id: 2,
    title: 'Complejo Industrial Zona Norte',
    description: 'Construcción industrial con sistemas de seguridad, ventilación y control operativo.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    category: 'SST',
    categoryKey: 'SST',
    metric: '100%',
    metricLabel: 'Cumplimiento SST',
  },
  {
    id: 3,
    title: 'Centro Logístico Metropolitano',
    description: 'Obra logística con áreas de carga, almacenamiento y circulación optimizada.',
    image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
    category: 'Ingeniería Civil',
    categoryKey: 'CIVIL',
    metric: '12.500 m²',
    metricLabel: 'Área intervenida',
  },
  {
    id: 4,
    title: 'Programa de Seguridad Corporativa',
    description: 'Implementación integral de gestión preventiva y programas de seguridad laboral.',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
    category: 'SST',
    categoryKey: 'SST',
    metric: 'ISO 45001',
    metricLabel: 'Sistema aplicado',
  },
  {
    id: 5,
    title: 'Vías de Acceso Residencial',
    description: 'Construcción y adecuación vial con pavimentos, drenajes y señalización.',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80',
    category: 'Ingeniería Civil',
    categoryKey: 'CIVIL',
    metric: '2,8 km',
    metricLabel: 'Vía mejorada',
  },
  {
    id: 6,
    title: 'Auditoría de Seguridad Industrial',
    description: 'Diagnóstico y control preventivo para operaciones industriales de alto riesgo.',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80',
    category: 'SST',
    categoryKey: 'SST',
    metric: '95%',
    metricLabel: 'Riesgos controlados',
  },
  {
    id: 7,
    title: 'Edificación Comercial Central',
    description: 'Desarrollo estructural, acabados y adecuaciones técnicas de uso comercial.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    category: 'Ingeniería Civil',
    categoryKey: 'CIVIL',
    metric: '8 pisos',
    metricLabel: 'Construcción ejecutada',
  },
  {
    id: 8,
    title: 'Plan de Emergencias Empresarial',
    description: 'Diseño de rutas, brigadas, simulacros y respuesta ante emergencias corporativas.',
    image: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=900&q=80',
    category: 'SST',
    categoryKey: 'SST',
    metric: '24/7',
    metricLabel: 'Preparación operativa',
  },
  {
    id: 9,
    title: 'Infraestructura Urbana Integral',
    description: 'Intervención coordinada de redes, andenes, espacios públicos y movilidad.',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
    category: 'Ingeniería Civil',
    categoryKey: 'CIVIL',
    metric: '18 ha',
    metricLabel: 'Territorio intervenido',
  },
  {
    id: 10,
    title: 'Capacitación en Prevención Laboral',
    description: 'Formación práctica para fortalecer la cultura preventiva y segura del personal.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    category: 'SST',
    categoryKey: 'SST',
    metric: '1.200',
    metricLabel: 'Trabajadores capacitados',
  },
];

function ProjectImage({ src, title }) {
  const [hasImageError, setHasImageError] = useState(!src);
  const [hasFallbackError, setHasFallbackError] = useState(false);

  if (hasFallbackError) {
    return (
      <span className="material-symbols-outlined text-5xl text-secondary" aria-hidden="true">
        apartment
      </span>
    );
  }

  const showingFallback = !src || hasImageError;

  return (
    <img
      alt={title}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      src={showingFallback ? fallbackProjectImage : src}
      onError={() => {
        if (showingFallback) setHasFallbackError(true);
        else setHasImageError(true);
      }}
    />
  );
}

function ProjectCard({ project }) {
  const imageUrl = safeImageUrl(project.image);

  return (
    <article className="bento-card group overflow-hidden rounded-xl bg-white shadow-md">
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-surface-variant">
        <ProjectImage key={imageUrl || 'no-image'} src={imageUrl} title={project.title} />
        <div className="absolute right-sm top-sm rounded bg-primary px-sm py-xs font-label-caps text-label-caps text-white">
          {project.category}
        </div>
      </div>
      <div className="p-md">
        <h3 className="mb-xs font-headline-sm text-headline-sm text-primary">{project.title}</h3>
        <p className="mb-md font-body-sm text-body-sm text-secondary">{project.description}</p>
        <div className="flex items-center justify-between border-t border-surface-variant pt-md">
          <div className="flex flex-col">
            <span className="font-body-md text-body-md font-bold text-industrial-orange">{project.metric}</span>
            <span className="text-[10px] font-bold uppercase text-secondary">{project.metricLabel}</span>
          </div>
          <span className="material-symbols-outlined text-primary" aria-hidden="true">arrow_outward</span>
        </div>
      </div>
    </article>
  );
}

export default function Portfolio() {
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState(filters[0]);
  const [slidesPerView, setSlidesPerView] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1,
  );

  useEffect(() => {
    function onResize() {
      setSlidesPerView(window.innerWidth >= 768 ? 3 : 1);
      setIndex(0);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [filter]);

  const projectItems = emblematicProjects.filter(
    (project) => !filter.category || project.categoryKey === filter.category,
  );
  const groups = Math.ceil(projectItems.length / slidesPerView);
  const previous = () => setIndex((current) => Math.max(0, Math.min(groups - 1, current - 1)));
  const next = () => setIndex((current) => Math.max(0, Math.min(groups - 1, current + 1)));

  return (
    <section className="bg-surface py-xl" id="portfolio">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="mb-xl flex flex-col gap-md border-b border-surface-variant pb-lg md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mb-xs font-headline-lg text-headline-lg text-primary">Proyectos Emblemáticos</h2>
            <p className="max-w-2xl font-body-md text-body-md text-secondary">
              Nuestra trayectoria se mide en estructuras firmes y vidas protegidas.
            </p>
          </div>
          <div className="flex flex-wrap justify-start gap-sm md:justify-end">
            {filters.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter.label === item.label}
                className={`rounded-full px-md py-xs font-label-caps text-label-caps transition-colors ${
                  filter.label === item.label
                    ? 'bg-primary text-on-primary'
                    : 'border border-surface-variant bg-white text-secondary hover:border-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-label="Anterior"
            onClick={previous}
            disabled={groups <= 1}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white disabled:opacity-40"
          >
            ‹
          </button>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {projectItems.map((project, projectIndex) => (
                <div key={project.id || `${project.title}-${projectIndex}`} className="w-full flex-shrink-0 px-2 md:w-1/3">
                  <ProjectCard project={project} />
                </div>
              ))}
              {projectItems.length === 0 && (
                <p className="w-full py-lg text-center font-body-md text-body-md text-secondary">
                  No hay proyectos disponibles para esta categoría.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="Siguiente"
            onClick={next}
            disabled={groups <= 1}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
