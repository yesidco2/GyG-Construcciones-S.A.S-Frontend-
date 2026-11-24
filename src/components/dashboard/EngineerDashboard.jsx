import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getProjects,
  getProjectClients,
  getProjectStatuses,
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  PROJECT_CATEGORIES,
  updateProjectProgress,
  updateProject,
  createProject,
  uploadProjectPhotos,
  describeProjectError,
  regenerateProjectTrackingCode,
  deleteProject,
} from '../../services/projectService';
import ProjectDocuments, { DocumentInput, uploadDocuments } from '../ProjectDocuments';
import { apiFetch } from '../../services/api';
import ProfileEditor from './ProfileEditor';

import ProjectPhotos, { ProjectPhotoInput } from './ProjectPhotos';
import ClientPicker from './ClientPicker';
import InduccionesObra from './InduccionesObra';
import { ProjectDate, ProjectMilestones } from '../ProjectMetadata';

const categoryLabels = new Map(Object.entries(PROJECT_CATEGORIES));
const statusLabels = new Map(Object.entries(PROJECT_STATUS_LABELS));
const statusTransitions = new Map([
  ['PLANIFICADA', ['EN_PROGRESO', 'PAUSADA']],
  ['EN_PROGRESO', ['PAUSADA', 'FINALIZADA']],
  ['PAUSADA', ['EN_PROGRESO', 'FINALIZADA']],
  ['FINALIZADA', []],
]);

function ProjectDateFields({ prefix, start, end, onStart, onEnd, disabled }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor={prefix + '-start'} className="mb-1 block text-xs font-semibold text-secondary">Fecha de inicio (opcional)</label>
        <input id={prefix + '-start'} type="date" value={start} disabled={disabled}
          onChange={(event) => onStart(event.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor={prefix + '-end'} className="mb-1 block text-xs font-semibold text-secondary">Fecha de fin estimada (opcional)</label>
        <input id={prefix + '-end'} type="date" value={end} disabled={disabled}
          onChange={(event) => onEnd(event.target.value)}
          className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm" />
      </div>
    </div>
  );
}

export default function EngineerDashboard({ currentUser, onLogout }) {
  const [obraInduccion, setObraInduccion] = useState(null);
  const isAdmin = currentUser?.role === 'ADMIN';
  const canCreate = isAdmin || currentUser?.role === 'INGENIERO';
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'session'
  const [notification, setNotification] = useState(null);

  // Galería de la obra
  const [photoModalProject, setPhotoModalProject] = useState(null);
  // Estados para Formulario de Creación de Proyecto
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('CIVIL');
  const [newClientName, setNewClientName] = useState('');
  const [projectClients, setProjectClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientsError, setClientsError] = useState('');
  const clientRequest = useRef(0);
  const [projectStatuses, setProjectStatuses] = useState(PROJECT_STATUSES);
  const [newStatus, setNewStatus] = useState('PLANIFICADA');
  const [trackingCodeModal, setTrackingCodeModal] = useState('');
  const [newProgress, setNewProgress] = useState(15);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState({});
  const [progressDrafts, setProgressDrafts] = useState({});
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [projectEdits, setProjectEdits] = useState(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentError, setDocumentError] = useState('');
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [avatar, setAvatar] = useState('');
  const [avatarRevision, setAvatarRevision] = useState(0);
  useEffect(() => {
    if (!currentUser?.email) return;
    let active = true;
    let url;
    apiFetch('/api/panel/perfil/foto', { responseType: 'blob' }).then((blob) => {
      if (active && blob.size) {
        url = URL.createObjectURL(blob);
        setAvatar(url);
      }
    }).catch(() => {});
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [avatarRevision, currentUser?.email]);

  const [initialPhotos, setInitialPhotos] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [retryingPhotos, setRetryingPhotos] = useState(false);
  const [rotateTarget, setRotateTarget] = useState(null);
  const [rotatingCode, setRotatingCode] = useState(false);
  const [rotateError, setRotateError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [editError, setEditError] = useState('');
  const mutation = useRef(false);

  function showTrackingCode(code) {
    setCopyMessage('');
    setTrackingCodeModal(code);
  }

  function savePhotoFailures(project, failed) {
    setPendingPhotos((current) => {
      const others = current.filter((item) => item.project.id !== project.id);
      return failed.length ? [...others, { project, failed }] : others;
    });
  }

  async function retryPhotos(project, failed) {
    if (mutation.current) return;
    mutation.current = true;
    setRetryingPhotos(true);
    try {
      savePhotoFailures(project, await uploadProjectPhotos(project, failed.map(({ file }) => file)));
    } finally {
      mutation.current = false;
      setRetryingPhotos(false);
    }
  }

  async function rotateTrackingCode() {
    if (!canCreate || !rotateTarget || mutation.current) return;
    mutation.current = true;
    setRotatingCode(true);
    setRotateError('');
    try {
      const { trackingCode } = await regenerateProjectTrackingCode(rotateTarget);
      if (!trackingCode) throw new Error('El servidor no devolvió el nuevo código.');
      setProjects((current) => current.map((item) => item.id === rotateTarget.id ? { ...item, trackingCode } : item));
      setRotateTarget(null);
      showTrackingCode(trackingCode);
    } catch (error) {
      setRotateError(describeProjectError(error, 'No se pudo regenerar el código.'));
    } finally {
      setRotatingCode(false);
      mutation.current = false;
    }
  }
  const [newDescription, setNewDescription] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [createError, setCreateError] = useState('');

  const loadProjects = useCallback(() => {
    setIsLoadingProjects(true);
    setProjectsError('');
    return getProjects()
      .then(setProjects)
      .catch(() => {
        setProjectsError('No se pudieron cargar las obras desde el servidor. Intenta de nuevo.');
      })
      .finally(() => setIsLoadingProjects(false));
  }, []);

  const loadClients = useCallback(async () => {
    if (!isAdmin) return;
    const request = ++clientRequest.current;
    setClientsLoading(true);
    setClientsError('');
    try {
      const clients = await getProjectClients();
      if (clientRequest.current !== request) return;
      setProjectClients(clients);
    } catch (error) {
      if (clientRequest.current !== request) return;
      setClientsError(describeProjectError(error, 'No se pudo cargar la lista de clientes.'));
    } finally {
      if (clientRequest.current === request) setClientsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadProjects();
    getProjectStatuses().then((statuses) => {
      setProjectStatuses(statuses.filter((status) => PROJECT_STATUSES.includes(status)));
    }).catch(() => {});
    return () => { clientRequest.current += 1; };
  }, [loadProjects]);

  useEffect(() => {
    if (!notification) return undefined;
    const timer = window.setTimeout(() => setNotification(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Manejar cambio de avance
  const handleProgressChange = async (project, value) => {
    const progress = Number(value);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      showNotification('El avance debe ser un número entero entre 0 y 100.', 'error');
      return;
    }

    setIsUpdatingProgress((current) => ({ ...current, [project.id]: true }));
    try {
      const updated = await updateProjectProgress(project, progress);
      setProjects((current) => current.map((item) => item.id === project.id ? { ...item, progress: updated.progress } : item));
      setProgressDrafts((current) => Object.fromEntries(
        Object.entries(current).filter(([id]) => id !== String(project.id)),
      ));
      showNotification(`Avance de ${updated.name} actualizado al ${updated.progress}%.`);
    } catch (error) {
      showNotification(describeProjectError(error, 'No se pudo actualizar el avance.'), 'error');
    } finally {
      setIsUpdatingProgress((current) => ({ ...current, [project.id]: false }));
    }
  };

  const handleProgressDraft = (projectId, value) => {
    const progress = Number(value);
    if (Number.isInteger(progress) && progress >= 0 && progress <= 100) {
      setProgressDrafts((current) => ({ ...current, [projectId]: progress }));
    }
  };

  // Manejar creación de nuevo proyecto
  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!canCreate || mutation.current) return;
    if (!newName.trim() || !newClientName.trim() || !newCategory.trim()) {
      setCreateError('Completa el nombre de la obra, la categoría y el nombre del cliente.');
      return;
    }

    if (initialPhotos.length > 20) {
      setCreateError('Selecciona hasta 20 fotografías.');
      return;
    }
    mutation.current = true;
    setIsCreatingProject(true);
    try {
      const created = await createProject({
        name: newName.trim(),
        category: newCategory,
        clientName: newClientName.trim(),
        status: newStatus,
        progress: newProgress,
        description: newDescription.trim(),
        startDate: newStart,
        estimatedEnd: newEnd,
      });

      const { trackingCode } = created;
      setProjects((current) => [created, ...current]);
      if (trackingCode) showTrackingCode(trackingCode);
      const failures = await uploadDocuments(created.id, documents);
      setDocumentError(failures.length ? 'La obra se guardó. Vuelve a seleccionar estos documentos en su galería: ' + failures.join(' ') : '');
      setDocuments([]);
      if (initialPhotos.length) savePhotoFailures(created, await uploadProjectPhotos(created, initialPhotos));
      showNotification('Obra ' + created.name + ' registrada con éxito.');
      
      // Limpiar formulario y volver a la lista
      setNewName('');
      setNewClientName('');
      setNewStatus('PLANIFICADA');
      setNewProgress(15);
      setNewDescription('');
      setNewStart('');
      setNewEnd('');
      setInitialPhotos([]);
      setActiveTab('list');
    } catch (err) {
      setCreateError(describeProjectError(err, 'No se pudo crear la obra.'));
    } finally {
      setIsCreatingProject(false);
      mutation.current = false;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || mutation.current) return;
    mutation.current = true;
    const project = deleteTarget;
    setDeletingProject(project.id);
    setDeleteError('');
    try {
      await deleteProject(project);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      savePhotoFailures(project, []);
      setDeleteTarget(null);
      showNotification('Se eliminó ' + project.name + '.', 'info');
    } catch (error) {
      setDeleteError(describeProjectError(error, 'No se pudo eliminar la obra.'));
    } finally {
      mutation.current = false;
      setDeletingProject(null);
    }
  };

  const openProjectEditor = (project) => {
    if (isAdmin) loadClients();
    setEditError('');
    setEditingProject(project);
    setProjectEdits({
      name: project.name,
      clientId: project.clientId,
      client: project.client,
      category: project.category,
      description: project.description,
      status: project.status,
      milestones: project.milestones,
      startDate: project.startDate,
      estimatedEnd: project.estimatedEnd,
    });
  };

  const updateMilestone = (index, changes) => {
    setProjectEdits((current) => ({
      ...current,
      milestones: current.milestones.map((hito, i) => i === index ? { ...hito, ...changes } : hito),
    }));
  };

  const handleUpdateProjectSubmit = async (event) => {
    event.preventDefault();
    if (!editingProject || !projectEdits || mutation.current) return;
    mutation.current = true;
    setEditError('');
    setIsSavingProject(true);
    try {
      const { clientId, client, ...fields } = projectEdits;
      const clientName = client.trim();
      if (!clientName || clientName.length > 255) throw new Error('Ingresa el nombre del cliente (máximo 255 caracteres).');
      const originalFields = new Map(Object.entries(editingProject));
      const changes = Object.fromEntries(
        Object.entries(fields).filter(([field, value]) => value !== undefined && value !== originalFields.get(field)),
      );
      if (clientName !== editingProject.client.trim()) changes.client = clientName;
      if (isAdmin && clientId != null && clientId !== editingProject.clientId) {
        if (clientsLoading || clientsError || !projectClients.some((client) => client.id === clientId)) throw new Error('Selecciona un cliente registrado.');
        changes.clientId = clientId;
      }
      if (Object.keys(changes).length === 0) {
        setEditingProject(null);
        return;
      }
      const updated = await updateProject(editingProject, changes);
      setProjects((current) => current.map((item) => item.id === updated.id ? { ...updated, trackingCode: updated.trackingCode || item.trackingCode } : item));
      setEditingProject(null);
      setProjectEdits(null);
      showNotification(`Obra ${updated.name} actualizada.`);
    } catch (error) {
      setEditError(describeProjectError(error, 'No se pudo actualizar la obra.'));
    } finally {
      setIsSavingProject(false);
      mutation.current = false;
    }
  };

  // Métricas
  const totalProjects = projects.length;
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects)
    : 0;
  const completedProjects = projects.filter((p) => p.status === 'FINALIZADA' || p.progress === 100).length;

  return (
    <div className="portal-dashboard space-y-8">
      
      {documentError && <p role="alert">{documentError}</p>}
      {/* BARRA SUPERIOR DEL DASHBOARD */}
      <div className="portal-dashboard-hero text-white relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt={currentUser.name || 'Foto de perfil'}
                  className="h-16 w-16 rounded-2xl border-2 border-industrial-orange object-cover shadow-md sm:h-20 sm:w-20"
                />
              ) : (
                <div
                  role="img"
                  aria-label="Foto de perfil predeterminada"
                  className="flex h-16 w-16 items-end justify-center overflow-hidden rounded-2xl border-2 border-industrial-orange bg-[#e4e6eb] shadow-md sm:h-20 sm:w-20"
                >
                  <svg viewBox="0 0 64 64" aria-hidden="true" className="h-[90%] w-[90%] text-[#65676b]">
                    <circle cx="32" cy="21" r="13" fill="currentColor" />
                    <path d="M8 64c1-16 10-25 24-25s23 9 24 25H8Z" fill="currentColor" />
                  </svg>
                </div>
              )}
              <button type="button" aria-label="Personalizar mi perfil" title="Personalizar mi perfil" onClick={() => setActiveTab('session')}
                className="absolute inset-0 rounded-2xl focus:ring-2 focus:ring-white" />
              <span className="pointer-events-none absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-primary rounded-full flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-industrial-orange/20 text-orange-300 font-label-caps text-[10px] uppercase font-bold tracking-wider">
                  {currentUser?.role || 'Ingeniero / Administrador'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-green-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Sesión autenticada
                </span>
              </div>

              <h2 className="font-headline-sm text-2xl font-bold text-white mt-1">
                {profileName || 'Ingeniero Residente'}
              </h2>
              <p className="text-xs text-white/70 font-body-sm">
                {currentUser?.email} • Panel de Control de Proyectos & Auditoría SG-SST
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
            <a
              href="#consultar-proyecto"
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
              title="Ver cómo los clientes consultan los códigos"
            >
              <span className="material-symbols-outlined text-sm text-industrial-orange">search</span>
              <span>Probar Consulta Pública</span>
            </a>

            <button
              type="button"
              onClick={onLogout}
              className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-error/90 hover:bg-error text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* MÉTRICAS DE RESUMEN (KPIs) */}
        <div className="portal-dashboard-metrics relative grid grid-cols-2 sm:grid-cols-4 mt-6 border-t border-white/20 text-white">
          <div className="min-w-0 py-4 pr-3">
            <span className="text-[11px] text-white/70 uppercase font-semibold block">Proyectos Activos</span>
            <span className="font-headline-sm text-2xl font-bold text-white mt-0.5 block">{totalProjects}</span>
          </div>
          <div className="min-w-0 py-4 pr-3">
            <span className="text-[11px] text-white/70 uppercase font-semibold block">Avance Promedio</span>
            <span className="font-headline-sm text-2xl font-bold text-industrial-orange mt-0.5 block">{avgProgress}%</span>
          </div>
          <div className="min-w-0 py-4 pr-3">
            <span className="text-[11px] text-white/70 uppercase font-semibold block">Obras Culminadas</span>
            <span className="font-headline-sm text-2xl font-bold text-green-400 mt-0.5 block">{completedProjects}</span>
          </div>
          <div className="min-w-0 py-4 pr-3">
            <span className="text-[11px] text-white/70 uppercase font-semibold block">Cumplimiento SST</span>
            <span className="font-headline-sm text-2xl font-bold text-white mt-0.5 block">100% ISO</span>
          </div>
        </div>
      </div>

      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {notification && (
        <div
          role={notification.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 shadow-md ${
            notification.type === 'info'
              ? 'bg-blue-50 text-blue-900 border border-blue-200'
              : notification.type === 'error'
              ? 'bg-error-container text-error border border-error/20'
              : 'bg-green-50 text-green-900 border border-green-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              {notification.type === 'info' ? 'info' : notification.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="text-secondary hover:text-primary">
            ✕
          </button>
        </div>
      )}

      {/* PESTAÑAS DEL DASHBOARD */}
      <nav aria-label="Secciones del portal SST" className="portal-workspace-nav">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          aria-pressed={activeTab === 'list'}
          className={`portal-workspace-tab ${
            activeTab === 'list'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface text-secondary hover:text-primary hover:bg-surface-variant/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">apartment</span>
          <span>Gestión de Proyectos ({totalProjects})</span>
        </button>

        {canCreate && <button
          type="button"
          onClick={() => setActiveTab('create')}
          aria-pressed={activeTab === 'create'}
          className={`portal-workspace-tab ${
            activeTab === 'create'
              ? 'bg-industrial-orange text-white shadow-sm'
              : 'bg-surface text-secondary hover:text-primary hover:bg-surface-variant/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span>Crear Proyecto con Código</span>
        </button>}

        <button
          type="button"
          onClick={() => setActiveTab('session')}
          aria-pressed={activeTab === 'session'}
          className={`portal-workspace-tab ${
            activeTab === 'session'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface text-secondary hover:text-primary hover:bg-surface-variant/60'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">shield</span>
          <span>Auditoría y sesión</span>
        </button>
      </nav>

      {/* VISTA 1: LISTADO Y EDICIÓN DE AVANCES */}
      {pendingPhotos.map(({ project, failed }) => (
        <div key={project.id} className="break-words rounded-xl bg-error-container p-4 text-sm text-error">
          <p role="alert">La obra se guardó. No se pudieron subir estas fotos de {project.name}:</p>
          <ul className="list-inside list-disc">
            {failed.map(({ file, message }, index) => <li key={index}>{file.name}: {message}</li>)}
          </ul>
          <button type="button" className="mt-2 font-semibold underline disabled:opacity-60"
            disabled={retryingPhotos || isCreatingProject} onClick={() => retryPhotos(project, failed)}>
            {retryingPhotos ? 'Reintentando…' : 'Reintentar fotos fallidas'}
          </button>
        </div>
      ))}

      {activeTab === 'list' && (
        <section className="portal-workspace-view space-y-4" aria-label="Gestión de proyectos">
          {projectsError && (
            <div className="rounded-xl border border-error/20 bg-error-container p-4 text-sm text-error" role="alert">
              <p>{projectsError}</p>
              <button type="button" onClick={loadProjects} className="mt-2 font-semibold underline">
                Reintentar
              </button>
            </div>
          )}
          <div className="portal-workspace-heading">
            <h3>Gestión de proyectos</h3>
            <p>
              Modifica directamente el <strong>porcentaje de avance</strong> para mantener actualizado el seguimiento del cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {isLoadingProjects && (
              <p className="rounded-xl border border-surface-variant bg-white p-6 text-center text-sm text-secondary" role="status">
                Cargando obras...
              </p>
            )}
            {!isLoadingProjects && !projectsError && projects.length === 0 && (
              <p className="rounded-xl border border-surface-variant bg-white p-6 text-center text-sm text-secondary">
                No hay obras asignadas o registradas.
              </p>
            )}
            {projects.map((project) => (
              <div
                key={project.id}
                className="portal-project-row space-y-4"
              >
                {/* Cabecera de la tarjeta del proyecto */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-variant">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-2xl">foundation</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-md">
                          #{project.id}
                        </span>
                        <span className="text-[11px] font-semibold text-industrial-orange uppercase">
                          {categoryLabels.get(project.category) || project.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            project.status === 'FINALIZADA'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'PAUSADA'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {statusLabels.get(project.status) || project.status}
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-lg font-bold text-primary mt-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Cliente: <strong>{project.client}</strong>
                      </p>
                      <p className="mt-1 text-xs text-secondary">
                        Código de seguimiento{' '}
                        {project.trackingCode ? (
                          <strong className="break-all font-mono text-primary">{project.trackingCode}</strong>
                        ) : 'no disponible'}
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción lateral */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => openProjectEditor(project)}
                      disabled={Boolean(isUpdatingProgress[project.id]) || deletingProject === project.id}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant hover:border-industrial-orange bg-surface hover:bg-white text-xs font-semibold text-primary flex items-center gap-1.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoModalProject(project)}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant hover:border-industrial-orange bg-surface hover:bg-white text-xs font-semibold text-primary flex items-center gap-1.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm text-industrial-orange">add_a_photo</span>
                      <span>Fotos y documentos</span>
                    </button>

                    {canCreate && (
                      <button type="button" className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-primary"
                        onClick={() => { setRotateError(''); setRotateTarget(project); }}>
                        Regenerar código
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError('');
                        setDeleteTarget(project);
                      }}
                      aria-haspopup="dialog"
                      aria-label={'Eliminar ' + project.name}
                      disabled={deletingProject === project.id || Boolean(isUpdatingProgress[project.id])}
                      className="p-1.5 rounded-lg border border-error/20 hover:bg-error-container text-error text-xs transition-colors"
                      title="Eliminar proyecto"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

                <details className="rounded-xl border border-surface-variant bg-surface p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-primary">Detalle de {project.name}</summary>
                  <div className="mt-3 space-y-3 text-sm">
                    {project.description && <p className="whitespace-pre-wrap break-words text-secondary">{project.description}</p>}
                    {(project.startDate || project.estimatedEnd) && (
                      <dl className="flex flex-wrap gap-x-6 gap-y-2">
                        {project.startDate && <div><dt>Fecha de inicio</dt><dd><ProjectDate value={project.startDate} /></dd></div>}
                        {project.estimatedEnd && <div><dt>Fecha de fin estimada</dt><dd><ProjectDate value={project.estimatedEnd} /></dd></div>}
                      </dl>
                    )}
                    <div>
                      <h4 className="mb-1 font-semibold text-primary">Hitos</h4>
                      <ProjectMilestones milestones={project.milestones} />
                    </div>
                  </div>
                </details>

                <button type="button" className="mb-3 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-primary"
                  aria-expanded={obraInduccion === project.id}
                  onClick={() => setObraInduccion(obraInduccion === project.id ? null : project.id)}>
                  {obraInduccion === project.id ? 'Cerrar inducciones SST' : 'Abrir inducciones SST'}
                </button>
                {obraInduccion === project.id && <InduccionesObra key={project.id} obra={project} />}

                {/* CONTROL DE AVANCE INTERACTIVO */}
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-variant/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-industrial-orange text-sm">trending_up</span>
                      Modificar Avance de la Obra:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-primary">
                        {project.progress}%
                      </span>
                    </div>
                  </div>

                  {/* Slider de avance y botones rápidos */}
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      aria-label={`Avance de ${project.name}`}
                      min="0"
                      max="100"
                      value={progressDrafts[project.id] ?? project.progress}
                      onChange={(e) => handleProgressDraft(project.id, e.target.value)}
                      disabled={Boolean(isUpdatingProgress[project.id])}
                      className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-industrial-orange"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-secondary">
                    <span>Ajuste rápido:</span>
                    <div className="flex gap-1.5">
                      {[25, 50, 75, 90, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleProgressDraft(project.id, val)}
                          disabled={Boolean(isUpdatingProgress[project.id])}
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors ${
                            (progressDrafts[project.id] ?? project.progress) === val
                              ? 'bg-industrial-orange text-white border-industrial-orange'
                              : 'bg-white hover:bg-surface border-outline-variant text-secondary'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleProgressChange(project, progressDrafts[project.id])}
                      disabled={
                        Boolean(isUpdatingProgress[project.id]) ||
                        deletingProject === project.id ||
                        progressDrafts[project.id] === undefined ||
                        progressDrafts[project.id] === project.progress
                      }
                      className="rounded border border-primary px-2 py-1 text-[10px] font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUpdatingProgress[project.id] ? 'Guardando...' : 'Guardar avance'}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* VISTA 2: FORMULARIO PARA CREAR NUEVO PROYECTO CON CÓDIGO */}
      {canCreate && activeTab === 'create' && (
        <div className="portal-workspace-view portal-workspace-split">
          <div className="portal-workspace-heading">
            <span className="font-label-caps text-label-caps text-industrial-orange uppercase tracking-wider">
              Nueva Obra / Contrato
            </span>
            <h3 className="font-headline-sm text-2xl font-bold text-primary mt-1">
              Crear proyecto con código
            </h3>
            <p className="text-xs text-secondary mt-1">
              El servidor genera un código para que los clientes e interventores puedan consultar el estado del proyecto en la sección pública.
            </p>
          </div>

          {createError && (
            <div role="alert" className="p-3 rounded-lg bg-error-container text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateProjectSubmit} className="portal-project-form">
            <div className="portal-project-span grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Estado inicial */}
              <div>
                <label htmlFor="new-status" className="block text-xs font-semibold uppercase text-secondary mb-1">
                  Estado inicial *
                </label>
                <select
                  id="new-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
                >
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>{statusLabels.get(status) || status}</option>
                  ))}
                </select>
              </div>

              {/* Categoría */}
              <div>
                <label htmlFor="new-category" className="block text-xs font-semibold uppercase text-secondary mb-1">
                  Categoría de Ingeniería *
                </label>
                <select
                  id="new-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
                >
                  {Object.entries(PROJECT_CATEGORIES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nombre del Proyecto */}
            <div>
              <label htmlFor="new-name" className="block text-xs font-semibold uppercase text-secondary mb-1">
                Nombre de la Obra o Proyecto *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  business
                </span>
                <input
                  id="new-name"
                  maxLength={255}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Puente Peatonal Av. Boyacá con Calle 127"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
                  required
                />
              </div>
            </div>

            {/* Cliente */}
            <div>
              <label htmlFor="new-client" className="block text-xs font-semibold uppercase text-secondary mb-1">
                Nombre del cliente *
              </label>
              <input id="new-client" type="text" required maxLength={255} value={newClientName}
                disabled={isCreatingProject} onChange={(event) => setNewClientName(event.target.value)}
                placeholder="Nombre de la persona o empresa"
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40" />
            </div>

            {/* Avance Inicial */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="new-progress" className="block text-xs font-semibold uppercase text-secondary">
                  Porcentaje de Avance Inicial: <strong className="text-primary font-mono">{newProgress}%</strong>
                </label>
              </div>
              <input
                id="new-progress"
                type="range"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-industrial-orange"
              />
            </div>

            <div>
              <label htmlFor="new-tracking-code" className="block text-xs font-semibold uppercase text-secondary">
                Código de seguimiento
              </label>
              <input id="new-tracking-code" readOnly value="Generación aleatoria automática"
                aria-describedby="new-tracking-code-help"
                className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-secondary" />
              <p id="new-tracking-code-help" className="mt-1 text-xs text-secondary">
                El servidor genera un código de 32 caracteres al registrar la obra. Cópialo para compartirlo con el cliente.
              </p>
            </div>

            <div className="portal-project-span">
              <ProjectDateFields prefix="new-work" start={newStart} end={newEnd}
                onStart={setNewStart} onEnd={setNewEnd} disabled={isCreatingProject} />
            </div>

            <DocumentInput onChange={setDocuments} disabled={isCreatingProject} />
            <ProjectPhotoInput id="initial-project-photos" onChange={setInitialPhotos} disabled={isCreatingProject} />

            <div className="portal-project-span">
              <label htmlFor="new-desc" className="block text-xs font-semibold uppercase text-secondary mb-1">
                Descripción Técnica & Compromiso SST
              </label>
              <textarea
                id="new-desc"
                maxLength={2000}
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detalla los alcances de la obra y las medidas preventivas de seguridad industrial implementadas..."
                className="w-full p-3 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
              />
            </div>

            <div className="portal-project-span portal-project-actions pt-4 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl border border-surface-variant text-xs font-semibold text-secondary hover:bg-surface"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreatingProject}
                className="px-6 py-2.5 rounded-xl bg-industrial-orange hover:bg-industrial-orange/90 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">save</span>
                <span>{isCreatingProject ? 'Guardando…' : 'Registrar y generar código'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA 3: AUDITORÍA Y SESIÓN */}
      {activeTab === 'session' && (
        <div className="portal-workspace-view portal-session-grid">
          <div className="portal-session-profile">
            <ProfileEditor name={profileName} avatar={avatar} onSaved={(name, changedPhoto) => {
              if (name) setProfileName(name);
              if (changedPhoto) setAvatarRevision((value) => value + 1);
            }} />
          </div>
          <section className="portal-session-details space-y-5">
            <div className="portal-workspace-heading">
              <span className="font-label-caps text-label-caps text-industrial-orange uppercase tracking-wider">
                Seguridad de la sesión
              </span>
              <h3 className="font-headline-sm text-xl font-bold text-primary mt-1">
                Sesión autenticada
              </h3>
              <p className="text-xs text-secondary mt-1">
                Consulta el estado de tu acceso y el rol asociado a tu cuenta.
              </p>
            </div>

            <div className="portal-session-facts">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">Estado:</span>
                <span className="font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">
                  Sesión autenticada
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">Rol de Acceso:</span>
                <span className="font-semibold text-industrial-orange">{currentUser?.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary">Cuenta:</span>
                <span>{currentUser?.email}</span>
              </div>
            </div>
          </section>
        </div>
      )}

      {editingProject && projectEdits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form role="dialog" aria-modal="true" aria-label="Editar datos de la obra" onSubmit={handleUpdateProjectSubmit} className="max-h-[90vh] overflow-y-auto w-full max-w-xl space-y-4 rounded-2xl border border-surface-variant bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-surface-variant pb-3">
              <div>
                <p className="font-mono text-xs font-bold text-industrial-orange">#{editingProject.id}</p>
                <h3 className="mt-1 text-lg font-bold text-primary">Editar datos de la obra</h3>
              </div>
              <button type="button" onClick={() => setEditingProject(null)} aria-label="Cerrar edición" className="text-secondary hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div>
              <label htmlFor="edit-project-name" className="mb-1 block text-xs font-semibold text-secondary">Nombre</label>
              <input id="edit-project-name" required maxLength={255} value={projectEdits.name} onChange={(event) => setProjectEdits({ ...projectEdits, name: event.target.value })} className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-project-client" className="mb-1 block text-xs font-semibold text-secondary">Cliente</label>
                <input id="edit-project-client" type="text" value={projectEdits.client} required maxLength={255}
                  disabled={isSavingProject} onChange={(event) => setProjectEdits((current) => ({ ...current, client: event.target.value }))}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm" />
                {isAdmin && (clientsLoading || clientsError || projectClients.length > 0) && (
                  <div className="mt-2">
                    <label htmlFor="edit-project-client-account" className="mb-1 block text-xs font-semibold text-secondary">
                      Vincular cuenta de cliente
                    </label>
                    <ClientPicker id="edit-project-client-account" clients={projectClients} selectedId={projectEdits.clientId}
                      initialName={editingProject.clientId == null ? '' : editingProject.client} disabled={isSavingProject}
                      loading={clientsLoading} error={clientsError} onReload={loadClients}
                      onSelect={(clientId) => setProjectEdits((current) => ({ ...current, clientId }))} />
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="edit-project-category" className="mb-1 block text-xs font-semibold text-secondary">Categoría</label>
                <select id="edit-project-category" value={projectEdits.category} onChange={(event) => setProjectEdits({ ...projectEdits, category: event.target.value })} className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm">
                  {Object.entries(PROJECT_CATEGORIES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="edit-project-status" className="mb-1 block text-xs font-semibold text-secondary">Estado</label>
              <select
                id="edit-project-status"
                value={projectEdits.status || ''}
                onChange={(event) => setProjectEdits({ ...projectEdits, status: event.target.value })}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
              >
                {!projectStatuses.includes(editingProject.status) && (
                  <option value={editingProject.status}>{editingProject.status || 'Estado sin definir'}</option>
                )}
                {projectStatuses.filter((status) => status === editingProject.status ||
                  statusTransitions.get(editingProject.status)?.includes(status)).map((status) => (
                  <option key={status} value={status}>{statusLabels.get(status) || status}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-project-description" className="mb-1 block text-xs font-semibold text-secondary">Descripción</label>
              <textarea id="edit-project-description" rows={3} maxLength={2000} value={projectEdits.description} onChange={(event) => setProjectEdits({ ...projectEdits, description: event.target.value })} className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" />
            </div>
            <ProjectDateFields prefix="edit-work" start={projectEdits.startDate} end={projectEdits.estimatedEnd}
              onStart={(startDate) => setProjectEdits((current) => ({ ...current, startDate }))}
              onEnd={(estimatedEnd) => setProjectEdits((current) => ({ ...current, estimatedEnd }))}
              disabled={isSavingProject} />
            <fieldset className="space-y-3">
              <legend className="mb-2 text-xs font-semibold text-secondary">Hitos de la obra</legend>
              {projectEdits.milestones.map((hito, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-outline-variant p-3 text-sm">
                  <label className="block">
                    Nombre del hito
                    <input required maxLength={255} value={hito.nombre} className="block w-full rounded border border-outline-variant p-2"
                      onChange={(event) => updateMilestone(index, { nombre: event.target.value })} />
                  </label>
                  <label className="block">
                    Descripción del hito
                    <textarea maxLength={1000} value={hito.descripcion ?? ''} className="block w-full rounded border border-outline-variant p-2"
                      onChange={(event) => updateMilestone(index, { descripcion: event.target.value })} />
                  </label>
                  <label className="block">
                    Fecha objetivo
                    <input type="date" value={hito.fechaObjetivo ?? ''} className="ml-2"
                      onChange={(event) => updateMilestone(index, { fechaObjetivo: event.target.value })} />
                  </label>
                  <div className="flex flex-wrap justify-between gap-2">
                    <label><input type="checkbox" checked={hito.completado}
                      onChange={(event) => updateMilestone(index, { completado: event.target.checked })} /> Completado</label>
                    <button type="button" onClick={() => setProjectEdits((current) => ({
                      ...current, milestones: current.milestones.filter((_, i) => i !== index),
                    }))} className="text-error underline">Quitar hito</button>
                  </div>
                </div>
              ))}
              <button type="button" disabled={projectEdits.milestones.length >= 50}
                onClick={() => setProjectEdits((current) => ({
                  ...current,
                  milestones: [...current.milestones, { nombre: '', descripcion: '', fechaObjetivo: '', completado: false }],
                }))} className="text-sm font-semibold text-primary underline disabled:opacity-50">Agregar hito</button>
            </fieldset>
            {editError && <p role="alert" className="text-sm text-error">{editError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingProject(null)} className="rounded-lg border border-surface-variant px-4 py-2 text-xs font-semibold text-secondary">Cancelar</button>
              <button type="submit" disabled={isSavingProject} className="rounded-lg bg-industrial-orange px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">
                {isSavingProject ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL PARA AGREGAR IMÁGENES AL PROYECTO */}
      {photoModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div role="dialog" aria-modal="true" aria-label="Galería fotográfica de la obra" onKeyDown={(event) => { if (event.key === 'Escape') setPhotoModalProject(null); }} className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-surface-variant p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-primary text-white px-2 py-0.5 rounded">
                    #{photoModalProject.id}
                  </span>
                  <h3 className="font-headline-sm text-base font-bold text-primary">
                    Galería Fotográfica de la Obra
                  </h3>
                </div>
                <p className="text-xs text-secondary mt-0.5">{photoModalProject.name}</p>
              </div>

              <button
                type="button"
                onClick={() => setPhotoModalProject(null)}
                autoFocus
                aria-label="Cerrar galería"
                className="text-secondary hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <ProjectPhotos key={photoModalProject.id} project={photoModalProject} />
            <ProjectDocuments key={'docs-' + photoModalProject.id} projectId={photoModalProject.id} />
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onKeyDown={(event) => {
              if (event.key === 'Escape' && deletingProject === null) setDeleteTarget(null);
            }}>
            <h3 id="delete-title" className="text-lg font-bold text-primary">Eliminar obra</h3>
            <p id="delete-description" className="mt-2 text-sm text-secondary">
              ¿Confirmas que quieres eliminar {deleteTarget.name}?
            </p>
            {deleteError && <p role="alert" className="mt-3 text-sm text-error">{deleteError}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" autoFocus disabled={deletingProject !== null} onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-surface-variant px-4 py-2 text-sm text-secondary">Cancelar</button>
              <button type="button" disabled={deletingProject !== null} onClick={handleDelete}
                className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {deletingProject === null ? 'Confirmar eliminación' : 'Eliminando…'}
              </button>
            </div>
          </section>
        </div>
      )}

      {rotateTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <section role="alertdialog" aria-modal="true" aria-labelledby="rotate-code-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 id="rotate-code-title" className="text-lg font-bold text-primary">Regenerar código</h3>
            <p className="mt-2 text-sm text-secondary">El código anterior de {rotateTarget.name} dejará de funcionar.</p>
            {rotateError && <p role="alert" className="mt-3 text-sm text-error">{rotateError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" autoFocus disabled={rotatingCode} onClick={() => setRotateTarget(null)}
                className="rounded-lg border border-surface-variant px-4 py-2 text-sm">Cancelar</button>
              <button type="button" disabled={rotatingCode} onClick={rotateTrackingCode}
                className="rounded-lg bg-industrial-orange px-4 py-2 text-sm font-semibold text-white">
                {rotatingCode ? 'Regenerando…' : 'Confirmar regeneración'}
              </button>
            </div>
          </section>
        </div>
      )}

      {trackingCodeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Código de seguimiento generado">
          <div className="w-full max-w-md rounded-2xl border border-surface-variant bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-industrial-orange">
              <span className="material-symbols-outlined">key</span>
              <h3 className="text-lg font-bold text-primary">Código de seguimiento generado</h3>
            </div>
            <p className="mt-3 text-sm text-secondary">
              El código seguirá vigente hasta que lo regeneres. Cópialo ahora y compártelo por un canal privado.
            </p>
            <div className="mt-4 rounded-lg border border-surface-variant bg-surface p-3 text-center font-mono font-bold text-primary">
              {trackingCodeModal}
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(trackingCodeModal);
                  setCopyMessage('Código copiado al portapapeles.');
                } catch {
                  setCopyMessage('No se pudo copiar el código. Cópialo manualmente.');
                }
              }}
              className="mt-4 w-full rounded-lg bg-industrial-orange px-4 py-2.5 text-sm font-semibold text-white"
            >
              Copiar código
            </button>
            {copyMessage && <p role="status" className="mt-2 text-sm text-secondary">{copyMessage}</p>}
            <button type="button" onClick={() => setTrackingCodeModal('')} className="mt-2 w-full rounded-lg border border-surface-variant px-4 py-2 text-sm font-semibold text-secondary">
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
