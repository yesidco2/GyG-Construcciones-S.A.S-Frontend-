/**
 * Servicio de Gestión de Proyectos SG-SST para G&G Construcciones S.A.S
 * Permite almacenar, consultar, modificar avances, agregar fotos y crear obras.
 * Persiste los datos en localStorage para integración inmediata con el Dashboard y Consultar Proyecto.
 */

const STORAGE_KEY = 'gg_projects_db';

const INITIAL_PROJECTS = [
  {
    code: 'GG-2026-00125',
    name: 'Viaducto Metropolitano y Cimentación Profunda',
    category: 'Ingeniería Civil',
    client: 'Consorcio Vías de Colombia / IDU',
    supervisor: 'Ing. Mateo Restrepo (SST)',
    progress: 78,
    status: 'En Ejecución',
    startDate: '2025-08-15',
    estimatedEnd: '2026-12-20',
    description: 'Cimentación profunda y diseño estructural con implementación total del protocolo de seguridad en alturas y cero accidentes.',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80',
        fecha: '12 de Octubre, 2026',
        description: 'Vaciado de zapatas y colocación de mallas anticaídas',
      },
      {
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80',
        fecha: '28 de Septiembre, 2026',
        description: 'Inspección de líneas de vida y anclajes certificados',
      },
      {
        url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600&auto=format&fit=crop&q=80',
        fecha: '15 de Septiembre, 2026',
        description: 'Montaje de vigas principales con grúa telescópica',
      },
    ],
  },
  {
    code: 'GG-2026-00126',
    name: 'Centro Logístico e Industrial El Dorado',
    category: 'SST & Obras Industriales',
    client: 'Parque Industrial Metrópolis S.A.S',
    supervisor: 'Ing. Diana Ramírez (Coordinadora SST)',
    progress: 92,
    status: 'Fase Final',
    startDate: '2025-04-10',
    estimatedEnd: '2026-11-30',
    description: 'Auditoría de riesgos, cerramientos perimetrales y supervisión técnica integral para planta de 5.000m².',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80',
        fecha: '05 de Octubre, 2026',
        description: 'Pruebas de sistemas contraincendios y señalización de evacuación',
      },
      {
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
        fecha: '20 de Septiembre, 2026',
        description: 'Pavimentación de patio de maniobras de carga pesada',
      },
    ],
  },
  {
    code: 'GG-2026-00127',
    name: 'Subestación y Redes Eléctricas Energía Norte',
    category: 'Ingeniería Civil',
    client: 'Empresa de Energía de Cundinamarca',
    supervisor: 'Arq. Andrés Gómez (Director de Obra)',
    progress: 45,
    status: 'En Ejecución',
    startDate: '2026-01-18',
    estimatedEnd: '2027-03-15',
    description: 'Implementación rigurosa del SG-SST (ISO 45001) para trabajos con riesgo eléctrico de alta tensión.',
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
        fecha: '01 de Octubre, 2026',
        description: 'Canalizaciones subterráneas y mallas de puesta a tierra',
      },
    ],
  },
];

/**
 * Obtiene todos los proyectos almacenados
 */
export function getStoredProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error al leer proyectos de localStorage:', error);
    return INITIAL_PROJECTS;
  }
}

/**
 * Guarda la lista de proyectos en localStorage
 */
function saveProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error('Error al guardar proyectos:', err);
    return false;
  }
}

/**
 * Busca un proyecto por su código
 */
export function getProjectByCode(code) {
  if (!code) return null;
  const projects = getStoredProjects();
  const cleanCode = code.trim().toUpperCase();
  return projects.find((p) => p.code.toUpperCase() === cleanCode) || null;
}

/**
 * Actualiza el porcentaje de avance de un proyecto
 */
export function updateProjectProgress(code, newProgress) {
  const projects = getStoredProjects();
  const cleanCode = code.trim().toUpperCase();
  const index = projects.findIndex((p) => p.code.toUpperCase() === cleanCode);

  if (index === -1) return false;

  const validProgress = Math.min(100, Math.max(0, parseInt(newProgress, 10) || 0));
  projects[index].progress = validProgress;
  
  if (validProgress === 100) {
    projects[index].status = 'Completado';
  } else if (validProgress > 85) {
    projects[index].status = 'Fase Final';
  } else {
    projects[index].status = 'En Ejecución';
  }

  saveProjects(projects);
  return projects[index];
}

/**
 * Agrega una nueva fotografía a la galería de un proyecto
 */
export function addProjectPhoto(code, photoData) {
  const projects = getStoredProjects();
  const cleanCode = code.trim().toUpperCase();
  const index = projects.findIndex((p) => p.code.toUpperCase() === cleanCode);

  if (index === -1) return false;

  const newPhoto = {
    url: photoData.url,
    fecha: photoData.fecha || new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
    description: photoData.description || 'Fotografía de control técnico en obra',
  };

  if (!projects[index].photos) {
    projects[index].photos = [];
  }

  projects[index].photos.unshift(newPhoto);
  saveProjects(projects);
  return projects[index];
}

/**
 * Crea un nuevo proyecto con su código único
 */
export function createProject(projectData) {
  const projects = getStoredProjects();
  const cleanCode = projectData.code.trim().toUpperCase();

  // Validar si ya existe el código
  if (projects.some((p) => p.code.toUpperCase() === cleanCode)) {
    throw new Error(`Ya existe un proyecto registrado con el código ${cleanCode}`);
  }

  const newProject = {
    code: cleanCode,
    name: projectData.name.trim(),
    category: projectData.category || 'Ingeniería Civil',
    client: projectData.client || 'G&G Clientes',
    supervisor: projectData.supervisor || 'Ing. Residente SST',
    progress: Math.min(100, Math.max(0, parseInt(projectData.progress, 10) || 0)),
    status: parseInt(projectData.progress, 10) >= 100 ? 'Completado' : 'En Ejecución',
    startDate: projectData.startDate || new Date().toISOString().split('T')[0],
    estimatedEnd: projectData.estimatedEnd || '2027-12-31',
    description: projectData.description || 'Proyecto de ingeniería y gestión de seguridad en el trabajo.',
    photos: projectData.photoUrl ? [
      {
        url: projectData.photoUrl,
        fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
        description: 'Foto de inicio de proyecto',
      }
    ] : [],
  };

  projects.unshift(newProject);
  saveProjects(projects);
  return newProject;
}

/**
 * Elimina un proyecto
 */
export function deleteProject(code) {
  const projects = getStoredProjects();
  const cleanCode = code.trim().toUpperCase();
  const filtered = projects.filter((p) => p.code.toUpperCase() !== cleanCode);
  saveProjects(filtered);
  return filtered;
}
