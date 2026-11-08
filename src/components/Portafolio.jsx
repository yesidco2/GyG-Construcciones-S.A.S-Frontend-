import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import safeImageUrl from '../utils/safeImageUrl';

const filters = [
  { label: 'Todos', category: '' },
  { label: 'Ingeniería Civil', category: 'CIVIL' },
  { label: 'SST', category: 'SST' },
];

function ProjectCard({ project }) {
  const imageUrl = safeImageUrl(project.image);

  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-md">
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-surface-variant">
        {imageUrl ? (
          <img
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            src={imageUrl}
          />
        ) : (
          <span className="material-symbols-outlined text-5xl text-secondary" aria-hidden="true">apartment</span>
        )}
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
  const [projectItems, setProjectItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
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
    let active = true;
    const endpoint = filter.category
      ? `/api/proyectos?categoria=${encodeURIComponent(filter.category)}`
      : '/api/proyectos';

    setProjectItems([]);
    setError('');
    setIsLoading(true);

    apiFetch(endpoint)
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data)) {
          throw new Error('El servidor devolvió un formato de proyectos no válido.');
        }
        setProjectItems(data.map((project) => ({
          id: project.id,
          title: project.nombre || project.name || 'Proyecto',
          description: project.descripcion || project.description || '',
          image: project.imagenUrl || project.imageUrl || '',
          category: project.categoria === 'CIVIL' ? 'Ingeniería Civil' : project.categoria || 'Proyecto',
          metric: project.metricaDestacada || project.metric || 'Proyecto destacado',
          metricLabel: project.etiquetaMetrica || project.metricLabel || 'Métrica destacada',
        })));
      })
      .catch(() => {
        if (active) setError('No se pudieron cargar los proyectos desde el servidor.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter]);

  useEffect(() => {
    setIndex(0);
  }, [filter]);

  const groups = Math.ceil(projectItems.length / slidesPerView);
  const previous = () => setIndex((current) => Math.max(0, Math.min(groups - 1, current - 1)));
  const next = () => setIndex((current) => Math.max(0, Math.min(groups - 1, current + 1)));

  return (
    <section className="bg-surface py-xl" id="portfolio">
      <div className="mx-auto max-w-container-max px-md">
        <div className="mb-xl text-center">
          <h2 className="mb-xs font-headline-lg text-headline-lg text-primary">Proyectos Emblemáticos</h2>
          <p className="mx-auto max-w-2xl font-body-md text-body-md text-secondary">
            Nuestra trayectoria se mide en estructuras firmes y vidas protegidas.
          </p>
        </div>

        <div className="mb-md flex flex-wrap justify-center gap-sm">
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

        <p className="mb-sm text-center font-body-sm text-body-sm text-secondary" aria-live="polite">
          {isLoading ? 'Cargando proyectos...' : error}
        </p>

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
              {projectItems.length === 0 && !isLoading && !error && (
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
