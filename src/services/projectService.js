import { apiFetch } from './api';

const PROJECTS_ENDPOINT = '/api/panel/obras';
export const PROJECT_STATUSES = ['PLANIFICADA', 'EN_PROGRESO', 'PAUSADA', 'FINALIZADA'];
export const PROJECT_STATUS_LABELS = {
  PLANIFICADA: 'Planificada',
  EN_PROGRESO: 'En progreso',
  PAUSADA: 'Pausada',
  FINALIZADA: 'Finalizada',
};

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
    code: project.codigoSeguimiento || '',
    trackingCode: project.codigoSeguimiento || '',
    clientId: project.clienteId ?? project.cliente?.id ?? null,
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

export async function getProjectClients() {
  const result = await apiFetch(`${PROJECTS_ENDPOINT}/clientes`);
  if (!Array.isArray(result)) {
    throw new Error('La respuesta de clientes del servidor no tiene el formato esperado.');
  }
  return result.map((client) => ({
    id: client.id,
    name: client.nombre || client.name || client.email || `Cliente ${client.id}`,
    email: client.email || '',
  })).filter((client) => client.id != null);
}

export async function getProjectStatuses() {
  const result = await apiFetch(`${PROJECTS_ENDPOINT}/estados`);
  return Array.isArray(result) ? result : PROJECT_STATUSES;
}

export async function createProject(projectData) {
  const progress = Number(projectData.progress);
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw new Error('El avance debe ser un número entero entre 0 y 100.');
  }
  if (!projectData.name?.trim() || projectData.clientId == null || !projectData.category?.trim()) {
    throw new Error('Nombre, cliente y categoría son obligatorios.');
  }
  if (!PROJECT_STATUSES.includes(projectData.status)) {
    throw new Error('Selecciona un estado válido para la obra.');
  }
  const result = await apiFetch(PROJECTS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      nombre: projectData.name.trim(),
      clienteId: Number(projectData.clientId),
      categoria: projectData.category.trim(),
      estado: projectData.status,
      progreso: progress,
      ...(projectData.description?.trim() ? { descripcion: projectData.description.trim() } : {}),
      ...(projectData.startDate ? { fechaInicio: projectData.startDate } : {}),
      ...(projectData.estimatedEnd ? { fechaFinEstimada: projectData.estimatedEnd } : {}),
    }),
  });
  return mapProject(result);
}

export async function replaceProject(project, projectData) {
  const progress = Number(projectData.progress);
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw new Error('El avance debe ser un número entero entre 0 y 100.');
  }
  const result = await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre: projectData.name.trim(),
      clienteId: projectData.clientId == null ? undefined : Number(projectData.clientId),
      categoria: projectData.category?.trim(),
      estado: projectData.status,
      progreso: progress,
      descripcion: projectData.description?.trim() || '',
      fechaInicio: projectData.startDate || null,
      fechaFinEstimada: projectData.estimatedEnd || null,
    }),
  });
  return mapProject(result);
}

export async function updateProject(project, projectData) {
  const payload = {};
  if (projectData.name !== undefined) payload.nombre = projectData.name.trim();
  if (projectData.clientId !== undefined) payload.clienteId = Number(projectData.clientId);
  if (projectData.category !== undefined) payload.categoria = projectData.category.trim();
  if (projectData.status !== undefined) payload.estado = projectData.status;
  if (projectData.progress !== undefined) {
    const progress = Number(projectData.progress);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      throw new Error('El avance debe ser un número entero entre 0 y 100.');
    }
    payload.progreso = progress;
  }
  if (projectData.description !== undefined) payload.descripcion = projectData.description.trim();
  if (projectData.startDate !== undefined) payload.fechaInicio = projectData.startDate || null;
  if (projectData.estimatedEnd !== undefined) payload.fechaFinEstimada = projectData.estimatedEnd || null;

  const result = await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapProject(result);
}

export async function updateProjectStatus(project, status) {
  if (!PROJECT_STATUSES.includes(status)) throw new Error('Selecciona un estado válido.');
  const result = await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado: status }),
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

export async function getAdminProjectPhoto(project, photoId) {
  if (!photoId) throw new Error('La fotografía no tiene un identificador válido.');
  return apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}/fotos/${encodeURIComponent(photoId)}`, {
    responseType: 'blob',
  });
}

export async function getPublicProjectPhoto(photoId, code) {
  if (!photoId || !code?.trim()) {
    throw new Error('Se requieren el identificador de la foto y el código de seguimiento.');
  }
  return apiFetch(`/api/obras/seguimiento/fotos/${encodeURIComponent(photoId)}`, {
    method: 'POST',
    body: JSON.stringify({ codigo: code.trim() }),
    responseType: 'blob',
  });
}

export async function deleteProjectPhoto(project, photoId) {
  await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}/fotos/${encodeURIComponent(photoId)}`, {
    method: 'DELETE',
  });
}

export async function regenerateProjectTrackingCode(project) {
  const result = await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}/codigo-seguimiento`, {
    method: 'POST',
  });
  return mapProject(result);
}

export async function deleteProject(project) {
  await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}`, {
    method: 'DELETE',
  });
}
