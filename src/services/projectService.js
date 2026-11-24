import { apiFetch } from './api';
import { PHOTO_TYPES, prepareWorkPhoto } from '../utils/preparePhoto';

const PROJECTS_ENDPOINT = '/api/panel/obras';
export const PROJECT_STATUSES = ['PLANIFICADA', 'EN_PROGRESO', 'PAUSADA', 'FINALIZADA'];
export const PROJECT_CATEGORIES = { CIVIL: 'Ingeniería Civil', SST: 'Seguridad y Salud en el Trabajo' };
export const PROJECT_STATUS_LABELS = {
  PLANIFICADA: 'Planificada',
  EN_PROGRESO: 'En progreso',
  PAUSADA: 'Pausada',
  FINALIZADA: 'Finalizada',
};

function mapProject(project) {
  return {
    id: project.id,
    trackingCode: project.codigoSeguimiento || '',
    clientId: project.clienteId ?? project.cliente?.id ?? null,
    name: project.nombre || project.name || '',
    category: project.categoria || project.category || '',
    client: project.cliente || project.client || '',
    progress: Number(project.progreso ?? project.porcentajeAvance ?? project.progress ?? 0),
    status: project.estado || project.status || '',
    startDate: project.fechaInicio || project.startDate || '',
    estimatedEnd: project.fechaFinEstimada || project.estimatedEnd || '',
    description: project.descripcion || project.description || '',
    milestones: project.hitos ?? [],
    photos: Array.isArray(project.fotos) ? project.fotos : [],
  };
}

function getProjectIdentifier(project) {
  const identifier = project.id;
  if (!Number.isSafeInteger(identifier) || identifier <= 0) {
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
  })).filter((client) => Number.isSafeInteger(client.id) && client.id > 0);
}

export async function getProjectStatuses() {
  const result = await apiFetch(`${PROJECTS_ENDPOINT}/estados`);
  return Array.isArray(result) ? result : PROJECT_STATUSES;
}

function validateProjectDates(start, end) {
  for (const date of [start, end]) {
    if (!date) continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Usa fechas en formato AAAA-MM-DD.');
    const parsed = new Date(date + 'T00:00:00Z');
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || date.startsWith('0000')) {
      throw new Error('Selecciona una fecha válida.');
    }
  }
  if (start && end && end < start) throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
}

export async function createProject(projectData) {
  validateProjectDates(projectData.startDate, projectData.estimatedEnd);
  const progress = Number(projectData.progress);
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    throw new Error('El avance debe ser un número entero entre 0 y 100.');
  }
  const name = projectData.name?.trim();
  const clientName = projectData.clientName?.trim();
  if (!name || name.length > 255) throw new Error('Ingresa el nombre de la obra (máximo 255 caracteres).');
  if (!clientName || clientName.length > 255) {
    throw new Error('Ingresa el nombre del cliente (máximo 255 caracteres).');
  }
  if (!Object.hasOwn(PROJECT_CATEGORIES, projectData.category)) {
    throw new Error('Selecciona una categoría válida para la obra.');
  }
  if (!PROJECT_STATUSES.includes(projectData.status)) {
    throw new Error('Selecciona un estado válido para la obra.');
  }
  if (projectData.description?.trim().length > 2000) throw new Error('La descripción admite hasta 2000 caracteres.');
  const result = await apiFetch(PROJECTS_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      nombre: name,
      cliente: clientName,
      categoria: projectData.category.trim(),
      estado: projectData.status,
      progreso: progress,
      descripcion: projectData.description?.trim() || '',
      ...(projectData.startDate ? { fechaInicio: projectData.startDate } : {}),
      ...(projectData.estimatedEnd ? { fechaFinEstimada: projectData.estimatedEnd } : {}),
    }),
  });
  return mapProject(result);
}

export async function updateProject(project, projectData) {
  if (projectData.startDate !== undefined || projectData.estimatedEnd !== undefined) {
    validateProjectDates(
      projectData.startDate === undefined ? project.startDate : projectData.startDate,
      projectData.estimatedEnd === undefined ? project.estimatedEnd : projectData.estimatedEnd,
    );
  }
  const payload = {};
  if (projectData.name !== undefined) {
    payload.nombre = projectData.name.trim();
    if (!payload.nombre || payload.nombre.length > 255) throw new Error('El nombre admite entre 1 y 255 caracteres.');
  }
  if (projectData.client !== undefined) {
    const client = projectData.client.trim();
    if (!client || client.length > 255) throw new Error('Ingresa el nombre del cliente (máximo 255 caracteres).');
    payload.cliente = client;
  }
  if (projectData.clientId !== undefined) {
    if (!Number.isSafeInteger(projectData.clientId) || projectData.clientId <= 0) {
      throw new Error('Selecciona un cliente válido.');
    }
    payload.clienteId = projectData.clientId;
  }
  if (projectData.category !== undefined) {
    if (!Object.hasOwn(PROJECT_CATEGORIES, projectData.category)) {
      throw new Error('Selecciona una categoría válida para la obra.');
    }
    payload.categoria = projectData.category;
  }
  if (projectData.status !== undefined) payload.estado = projectData.status;
  if (projectData.progress !== undefined) {
    const progress = Number(projectData.progress);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      throw new Error('El avance debe ser un número entero entre 0 y 100.');
    }
    payload.progreso = progress;
  }
  if (projectData.description !== undefined) {
    payload.descripcion = projectData.description.trim();
    if (payload.descripcion.length > 2000) throw new Error('La descripción admite hasta 2000 caracteres.');
  }
  if (projectData.milestones !== undefined) {
    if (projectData.milestones.length > 50) throw new Error('La obra admite hasta 50 hitos.');
    payload.hitos = projectData.milestones.map((milestone) => {
      const name = milestone.nombre.trim();
      if (!name) throw new Error('Ingresa el nombre de cada hito.');
      return {
        nombre: name,
        descripcion: milestone.descripcion?.trim() || null,
        fechaObjetivo: milestone.fechaObjetivo || null,
        completado: milestone.completado,
      };
    });
  }
  if (projectData.startDate !== undefined) payload.fechaInicio = projectData.startDate || null;
  if (projectData.estimatedEnd !== undefined) payload.fechaFinEstimada = projectData.estimatedEnd || null;

  const result = await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
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

export async function deleteProject(project) {
  await apiFetch(`${PROJECTS_ENDPOINT}/${getProjectIdentifier(project)}`, {
    method: 'DELETE',
  });
}

export const PROJECT_PHOTO_TYPES = PHOTO_TYPES;

export function describeProjectError(error, fallback) {
  if (error.status === 401 || error.code === 'CAPTCHA_REQUIRED') return 'Tu sesión venció. Vuelve a iniciar sesión.';
  if (error.status === 403) return 'Tu cuenta no tiene permiso para realizar esta acción.';
  if (error.status === 404) return 'El recurso solicitado no existe o dejó de estar disponible.';
  if (error.status === 413) return 'El archivo supera el tamaño permitido.';
  if (error.status === 429) return error.retryAfter > 0
    ? 'Demasiadas solicitudes. Espera ' + error.retryAfter + ' segundos.'
    : 'Demasiadas solicitudes. Espera antes de volver a intentarlo.';
  if (error.status === 400 || error.status === 409) return error.message;
  if (error instanceof TypeError || error.name === 'TimeoutError') return 'No se pudo conectar con el servidor. Inténtalo de nuevo.';
  return error.status ? fallback : error.message || fallback;
}

export async function uploadProjectPhotos(project, files) {
  if (files.length > 20) throw new Error('Selecciona hasta 20 fotografías.');
  const failed = [];
  const path = PROJECTS_ENDPOINT + '/' + getProjectIdentifier(project) + '/fotos';
  for (const [index, file] of files.entries()) {
    try {
      const prepared = await prepareWorkPhoto(file);
      const body = new FormData();
      body.append('archivo', prepared, file.name);
      const result = await apiFetch(path, { method: 'POST', body, timeoutMs: 60000 });
      if (!Number.isSafeInteger(result?.id) || result.id <= 0) throw new Error('Respuesta de carga inválida.');
    } catch (error) {
      const message = describeProjectError(error, 'No se pudo cargar el archivo.');
      failed.push({ file, message });
      if (error.status === 429 || error.status === 401 || error.code === 'CAPTCHA_REQUIRED') {
        failed.push(...files.slice(index + 1).map((pending) => ({ file: pending, message })));
        break;
      }
    }
  }
  return failed;
}

export function getProjectPhotos(project, signal) {
  return apiFetch(PROJECTS_ENDPOINT + '/' + getProjectIdentifier(project) + '/fotos', { signal });
}

export function getProjectPhoto(project, photoId, signal) {
  return apiFetch(PROJECTS_ENDPOINT + '/' + getProjectIdentifier(project) + '/fotos/' + encodeURIComponent(photoId), {
    responseType: 'blob', signal,
  });
}

export function deleteProjectPhoto(project, photoId) {
  return apiFetch(PROJECTS_ENDPOINT + '/' + getProjectIdentifier(project) + '/fotos/' + encodeURIComponent(photoId), {
    method: 'DELETE',
  });
}

export async function regenerateProjectTrackingCode(project) {
  const result = await apiFetch(PROJECTS_ENDPOINT + '/' + getProjectIdentifier(project) + '/codigo-seguimiento', {
    method: 'POST',
  });
  return mapProject(result);
}

export function getPublicProjectPhoto(photoId, code, signal) {
  return apiFetch('/api/obras/seguimiento/fotos/' + encodeURIComponent(photoId), {
    method: 'POST',
    body: JSON.stringify({ codigo: code }),
    responseType: 'blob',
    signal,
  });
}
