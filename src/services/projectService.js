import { apiFetch } from './api';

const PROJECTS_ENDPOINT = '/api/panel/obras';

function mapPhoto(photo) {
  return {
    id: photo.id,
    url: photo.url || photo.imagenUrl || photo.archivoUrl || photo.ruta,
    fecha: photo.fecha || photo.createdAt || '',
    description: photo.descripcion || photo.description || 'Fotografía de obra',
  };
}

function mapProject(project) {
  return {
    id: project.id,
    code: project.codigo || project.code || '',
    name: project.nombre || project.name || '',
    category: project.categoria || project.category || '',
    client: project.cliente || project.client || '',
    supervisor: project.supervisor || '',
    progress: Number(project.progreso ?? project.porcentajeAvance ?? project.progress ?? 0),
    status: project.estado || project.status || '',
    startDate: project.fechaInicio || project.startDate || '',
    estimatedEnd: project.fechaFinEstimada || project.estimatedEnd || '',
    description: project.descripcion || project.description || '',
    photos: (project.fotos || project.photos || []).map(mapPhoto),
  };
}

function getProjectIdentifier(project) {
  const identifier = project.id ?? project.code;
  if (!identifier) {
    throw new Error('El proyecto no tiene un identificador válido.');
  }
  return encodeURIComponent(identifier);
}

export async function getProjects() {
  const result = await apiFetch(PROJECTS_ENDPOINT);
  const projects = Array.isArray(result) ? result : result?.content;
  if (!Array.isArray(projects)) {
    throw new Error('La respuesta de proyectos del servidor no tiene el formato esperado.');
  }
  return projects.map(mapProject);
}

export function generateProjectCode() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Este navegador no permite generar códigos de proyecto seguros.');
  }

  const range = 100000;
  const maxRandomValue = 0x100000000;
  const unbiasedLimit = Math.floor(maxRandomValue / range) * range;
  const randomValues = new Uint32Array(1);

  do {
    globalThis.crypto.getRandomValues(randomValues);
  } while (randomValues[0] >= unbiasedLimit);

  const suffix = String(randomValues[0] % range).padStart(5, '0');
  return `GG-${new Date().getFullYear()}-${suffix}`;
}

export async function createProject(projectData) {
  const result = await apiFetch(PROJECTS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      codigo: projectData.code.trim().toUpperCase(),
      nombre: projectData.name.trim(),
      cliente: projectData.client.trim(),
      categoria: projectData.category,
      progreso: Number(projectData.progress),
      descripcion: projectData.description.trim(),
      fechaInicio: projectData.startDate,
      fechaFinEstimada: projectData.estimatedEnd,
    }),
  });
  return mapProject(result);
}

export async function updateProject(project, projectData) {
  const result = await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre: projectData.name.trim(),
      cliente: projectData.client.trim(),
      categoria: projectData.category,
      descripcion: projectData.description.trim(),
      fechaFinEstimada: projectData.estimatedEnd,
    }),
  });
  return mapProject(result);
}

export async function updateProjectProgress(project, progress) {
  const value = Number(progress);
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error('El avance debe ser un número entero entre 0 y 100.');
  }

  const result = await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}/progreso`, {
    method: 'PATCH',
    body: JSON.stringify({ progreso: value }),
  });
  return mapProject(result);
}

export async function addProjectPhoto(project, file, description) {
  const formData = new FormData();
  formData.append('archivo', file, file.name || 'fotografia');
  formData.append('descripcion', description.trim() || 'Fotografía de control técnico en obra');

  await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}/fotos`, {
    method: 'POST',
    body: formData,
  });
  const refreshedProjects = await getProjects();
  const updatedProject = refreshedProjects.find((item) =>
    (project.id && item.id === project.id) || item.code === project.code,
  );
  if (!updatedProject) {
    throw new Error('La fotografía se subió, pero no se pudo actualizar la obra.');
  }
  return updatedProject;
}

export async function deleteProject(project) {
  await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}`, {
    method: 'DELETE',
  });
}
