import { useState, useEffect } from 'react';
import {
  getProjects,
  generateProjectCode,
  updateProjectProgress,
  updateProject,
  addProjectPhoto,
  createProject,
  deleteProject,
} from '../../services/projectService';
import safeImageUrl from '../../utils/safeImageUrl';

function compressProjectPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      reject(new Error('Selecciona una imagen JPG, PNG o WebP.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('La imagen debe pesar máximo 5 MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida.'));
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('No se pudo procesar la imagen.'));
          return;
        }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        try {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('No se pudo procesar la imagen seleccionada.'));
          }, 'image/jpeg', 0.82);
        } catch {
          reject(new Error('No se pudo procesar la imagen seleccionada.'));
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function EngineerDashboard({ currentUser, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'session'
  const [notification, setNotification] = useState(null);

  // Estados para Modal de Agregar Imagen
  const [photoModalProject, setPhotoModalProject] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Estados para Formulario de Creación de Proyecto
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Ingeniería Civil');
  const [newClient, setNewClient] = useState('');
  const [newProgress, setNewProgress] = useState(15);
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState({});
  const [progressDrafts, setProgressDrafts] = useState({});
  const [deletingProject, setDeletingProject] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [projectEdits, setProjectEdits] = useState(null);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  // Cargar proyectos al montar
  useEffect(() => {
    loadProjects();
    suggestNextCode();
  }, []);

  useEffect(() => {
    if (!expandedPhoto) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setExpandedPhoto(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedPhoto]);

  useEffect(() => () => {
    if (newPhotoUrl.startsWith('blob:')) URL.revokeObjectURL(newPhotoUrl);
  }, [newPhotoUrl]);

  useEffect(() => () => {
    if (photoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(photoPreviewUrl);
  }, [photoPreviewUrl]);

  const loadProjects = () => {
    setIsLoadingProjects(true);
    setProjectsError('');
    return getProjects()
      .then(setProjects)
      .catch(() => {
        setProjectsError('No se pudieron cargar las obras desde el servidor. Intenta de nuevo.');
      })
      .finally(() => setIsLoadingProjects(false));
  };

  const suggestNextCode = () => {
    try {
      setNewCode(generateProjectCode());
      setCreateError('');
    } catch (error) {
      console.error('No se pudo generar un código de proyecto:', error);
      setCreateError(error.message || 'No se pudo generar un código de proyecto.');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const closePhotoModal = () => {
    setPhotoModalProject(null);
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    setPhotoDesc('');
    setPhotoError('');
  };

  const handleProjectPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    setNewPhotoFile(null);
    setNewPhotoUrl('');
    try {
      const compressed = await compressProjectPhoto(file);
      setNewPhotoFile(compressed);
      setNewPhotoUrl(URL.createObjectURL(compressed));
    } catch (error) {
      setPhotoError(error.message || 'No se pudo cargar la imagen.');
    }
  };

  const handleGalleryPhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    try {
      const compressed = await compressProjectPhoto(file);
      setPhotoFile(compressed);
      setPhotoPreviewUrl(URL.createObjectURL(compressed));
    } catch (error) {
      setPhotoError(error.message || 'No se pudo cargar la imagen.');
    }
  };

  // Manejar cambio de avance
  const handleProgressChange = async (project, value) => {
    const progress = Number(value);
    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      showNotification('El avance debe ser un número entero entre 0 y 100.', 'error');
      return;
    }

    setIsUpdatingProgress((current) => ({ ...current, [project.code]: true }));
    try {
      const updated = await updateProjectProgress(project, progress);
      setProjects((current) => current.map((item) => item.code === project.code ? updated : item));
      setProgressDrafts((current) => {
        const next = { ...current };
        delete next[project.code];
        return next;
      });
      showNotification(`Avance de ${updated.name} actualizado al ${updated.progress}%.`);
    } catch {
      showNotification('No se pudo actualizar el avance en el servidor.', 'error');
    } finally {
      setIsUpdatingProgress((current) => ({ ...current, [project.code]: false }));
    }
  };

  const handleProgressDraft = (projectCode, value) => {
    const progress = Number(value);
    if (Number.isInteger(progress) && progress >= 0 && progress <= 100) {
      setProgressDrafts((current) => ({ ...current, [projectCode]: progress }));
    }
  };

  // Manejar adición de foto
  const handleAddPhotoSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile || !photoModalProject) return;
    setIsUploadingPhoto(true);
    try {
      const updated = await addProjectPhoto(photoModalProject, photoFile, photoDesc);
      setPhotoModalProject(updated);
      setProjects((current) => current.map((item) => item.code === updated.code ? updated : item));
      setPhotoFile(null);
      setPhotoPreviewUrl('');
      setPhotoDesc('');
      showNotification(`Nueva imagen agregada al proyecto ${updated.code}.`);
    } catch {
      showNotification('No se pudo subir la fotografía al servidor.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Manejar creación de nuevo proyecto
  const handleCreateProjectSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newCode.trim() || !newName.trim()) {
      setCreateError('Por favor completa el código y el nombre del proyecto.');
      return;
    }

    setIsCreatingProject(true);
    try {
      let created = await createProject({
        code: newCode.trim(),
        name: newName.trim(),
        category: newCategory,
        client: newClient.trim(),
        progress: newProgress,
        description: newDescription.trim(),
        startDate: '',
        estimatedEnd: '',
      });

      if (newPhotoFile) {
        created = await addProjectPhoto(created, newPhotoFile, 'Fotografía inicial de la obra');
      }
      setProjects((current) => [created, ...current]);
      showNotification(`¡Proyecto ${created.code} (${created.name}) registrado con éxito!`);
      
      // Limpiar formulario y volver a la lista
      setNewName('');
      setNewClient('');
      setNewProgress(15);
      setNewPhotoFile(null);
      setNewPhotoUrl('');
      setNewDescription('');
      setPhotoError('');
      suggestNextCode();
      setActiveTab('list');
    } catch (err) {
      setCreateError(err.message || 'Error al crear el proyecto.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Manejar eliminación
  const handleDelete = async (project) => {
    if (window.confirm(`¿Estás seguro de eliminar el proyecto ${project.code}?`)) {
      setDeletingProject(project.code);
      try {
        await deleteProject(project);
        setProjects((current) => current.filter((item) => item.code !== project.code));
      } catch {
        showNotification('No se pudo eliminar la obra en el servidor.', 'error');
        return;
      } finally {
        setDeletingProject('');
      }
      const code = project.code;
      showNotification(`Proyecto ${code} eliminado.`, 'info');
    }
  };

  const openProjectEditor = (project) => {
    setEditingProject(project);
    setProjectEdits({
      name: project.name,
      client: project.client,
      category: project.category,
      description: project.description,
      estimatedEnd: project.estimatedEnd,
    });
  };

  const handleUpdateProjectSubmit = async (event) => {
    event.preventDefault();
    if (!editingProject || !projectEdits) return;
    setIsSavingProject(true);
    try {
      const updated = await updateProject(editingProject, projectEdits);
      setProjects((current) => current.map((item) => item.code === updated.code ? updated : item));
      setEditingProject(null);
      setProjectEdits(null);
      showNotification(`Proyecto ${updated.code} actualizado.`);
    } catch (error) {
      showNotification(error.message || 'No se pudo actualizar la obra en el servidor.', 'error');
    } finally {
      setIsSavingProject(false);
    }
  };

  // Métricas
  const totalProjects = projects.length;
  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjects)
    : 0;
  const completedProjects = projects.filter((p) => p.progress >= 100).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* BARRA SUPERIOR DEL DASHBOARD */}
      <div className="bg-primary text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-industrial-orange/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {currentUser?.avatar ? (
                <img
                  src={safeImageUrl(currentUser.avatar)}
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
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-primary rounded-full flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-industrial-orange/20 text-orange-300 font-label-caps text-[10px] uppercase font-bold tracking-wider">
                  {currentUser?.role || 'Ingeniero / Administrador'}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-green-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Sesión autenticada
                </span>
              </div>

              <h2 className="font-headline-sm text-2xl font-bold text-white mt-1">
                {currentUser?.name || 'Ingeniero Residente'}
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
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-white">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-white/70 uppercase font-semibold block">Proyectos Activos</span>
            <span className="font-headline-sm text-2xl font-bold text-white mt-0.5 block">{totalProjects}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-white/70 uppercase font-semibold block">Avance Promedio</span>
            <span className="font-headline-sm text-2xl font-bold text-industrial-orange mt-0.5 block">{avgProgress}%</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-white/70 uppercase font-semibold block">Obras Culminadas</span>
            <span className="font-headline-sm text-2xl font-bold text-green-400 mt-0.5 block">{completedProjects}</span>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] text-white/70 uppercase font-semibold block">Cumplimiento SST</span>
            <span className="font-headline-sm text-2xl font-bold text-white mt-0.5 block">100% ISO</span>
          </div>
        </div>
      </div>

      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {notification && (
        <div
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
      <div className="flex items-center justify-between border-b border-surface-variant pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-secondary hover:text-primary hover:bg-surface-variant/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">apartment</span>
            <span>Gestión de Proyectos ({totalProjects})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-industrial-orange text-white shadow-sm'
                : 'bg-surface text-secondary hover:text-primary hover:bg-surface-variant/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Crear Proyecto con Código</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('session')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'session'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-secondary hover:text-primary hover:bg-surface-variant/60'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shield</span>
            <span>Auditoría y sesión</span>
          </button>
        </div>
      </div>

      {/* VISTA 1: LISTADO Y EDICIÓN DE AVANCES */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {projectsError && (
            <div className="rounded-xl border border-error/20 bg-error-container p-4 text-sm text-error" role="alert">
              <p>{projectsError}</p>
              <button type="button" onClick={loadProjects} className="mt-2 font-semibold underline">
                Reintentar
              </button>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-secondary px-1">
            <p>
              Modifica directamente el <strong>porcentaje de avance</strong> o agrega <strong>nuevas fotografías</strong> para mantener actualizado el seguimiento del cliente.
            </p>
            <span className="font-mono text-[11px]">Sincronización en tiempo real</span>
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
                key={project.code}
                className="bg-white rounded-2xl border border-surface-variant p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
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
                          {project.code}
                        </span>
                        <span className="text-[11px] font-semibold text-industrial-orange uppercase">
                          {project.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            project.status === 'Completado'
                              ? 'bg-green-100 text-green-800'
                              : project.status === 'Fase Final'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-lg font-bold text-primary mt-1">
                        {project.name}
                      </h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Cliente: <strong>{project.client}</strong> • Supervisor: {project.supervisor}
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción lateral */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => openProjectEditor(project)}
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
                      <span>Fotos ({project.photos?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(project)}
                      disabled={deletingProject === project.code}
                      className="p-1.5 rounded-lg border border-error/20 hover:bg-error-container text-error text-xs transition-colors"
                      title="Eliminar proyecto"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>

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
                      min="0"
                      max="100"
                      value={progressDrafts[project.code] ?? project.progress}
                      onChange={(e) => handleProgressDraft(project.code, e.target.value)}
                      disabled={Boolean(isUpdatingProgress[project.code])}
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
                          onClick={() => handleProgressDraft(project.code, val)}
                          disabled={Boolean(isUpdatingProgress[project.code])}
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors ${
                            (progressDrafts[project.code] ?? project.progress) === val
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
                      onClick={() => handleProgressChange(project, progressDrafts[project.code])}
                      disabled={
                        Boolean(isUpdatingProgress[project.code]) ||
                        progressDrafts[project.code] === undefined ||
                        progressDrafts[project.code] === project.progress
                      }
                      className="rounded border border-primary px-2 py-1 text-[10px] font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUpdatingProgress[project.code] ? 'Guardando...' : 'Guardar avance'}
                    </button>
                  </div>
                </div>

                {/* MINIATURAS DE FOTOGRAFÍAS */}
                {project.photos && project.photos.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-secondary block mb-2">
                      Galería de Fotos en Obra ({project.photos.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {project.photos.slice(0, 4).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setExpandedPhoto(p.url)}
                          aria-label={`Ampliar foto: ${p.description}`}
                          aria-haspopup="dialog"
                          className="relative group block h-20 overflow-hidden rounded-lg border border-surface-variant bg-slate-100 text-left"
                        >
                          <img
                            src={safeImageUrl(p.url)}
                            alt={p.description}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1 text-[9px] text-white">
                            <span className="line-clamp-1">{p.fecha}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 2: FORMULARIO PARA CREAR NUEVO PROYECTO CON CÓDIGO */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl border border-surface-variant p-6 sm:p-8 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="border-b border-surface-variant pb-4">
            <span className="font-label-caps text-label-caps text-industrial-orange uppercase tracking-wider">
              Nueva Obra / Contrato
            </span>
            <h3 className="font-headline-sm text-2xl font-bold text-primary mt-1">
              Registrar Nuevo Proyecto en Sistema
            </h3>
            <p className="text-xs text-secondary mt-1">
              Asigna un código único para que los clientes e interventores puedan consultar el estado del proyecto en la sección pública.
            </p>
          </div>

          {createError && (
            <div className="p-3 rounded-lg bg-error-container text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateProjectSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Código del Proyecto */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="new-code" className="block text-xs font-semibold uppercase text-secondary">
                    Código Único del Proyecto *
                  </label>
                  <button
                    type="button"
                    onClick={suggestNextCode}
                    className="text-[10px] text-industrial-orange hover:underline font-bold"
                  >
                    Generar Código
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    qr_code
                  </span>
                  <input
                    id="new-code"
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Ej. GG-2026-00128"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
                    required
                  />
                </div>
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
                  <option value="Ingeniería Civil">Ingeniería Civil & Estructuras</option>
                  <option value="SST & Obras Industriales">SST & Obras Industriales</option>
                  <option value="Infraestructura Vial">Infraestructura Vial</option>
                  <option value="Auditoría SG-SST">Auditoría SG-SST (ISO 45001)</option>
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
                Cliente / Entidad Contratante
              </label>
              <input
                id="new-client"
                type="text"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="Ej: Consorcio Vial Metropolitano"
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
              />
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

            {/* Fotografía Inicial */}
            <div>
              <label htmlFor="new-photo" className="block text-xs font-semibold uppercase text-secondary mb-1">
                Fotografía Inicial de la Obra
              </label>
              <input
                id="new-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleProjectPhotoChange}
                aria-describedby={photoError ? 'new-photo-error' : 'new-photo-help'}
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <p id="new-photo-help" className="mt-1 text-[10px] text-secondary">
                Elige una foto JPG, PNG o WebP de máximo 5 MB. Se optimizará y se enviará al servidor.
              </p>
              {photoError && (
                <p id="new-photo-error" role="alert" className="mt-1 text-xs text-error">
                  {photoError}
                </p>
              )}
              {newPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setExpandedPhoto(newPhotoUrl)}
                  aria-label="Ampliar vista previa de la fotografía"
                  aria-haspopup="dialog"
                  className="mt-3 block h-96 w-full overflow-hidden rounded-lg border border-surface-variant bg-surface text-left sm:h-[30rem] lg:h-[34rem]"
                >
                  <img
                    src={safeImageUrl(newPhotoUrl)}
                    alt="Vista previa de la fotografía inicial del proyecto. Toca para ampliar."
                    className="h-full w-full object-cover"
                  />
                </button>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="new-desc" className="block text-xs font-semibold uppercase text-secondary mb-1">
                Descripción Técnica & Compromiso SST
              </label>
              <textarea
                id="new-desc"
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detalla los alcances de la obra y las medidas preventivas de seguridad industrial implementadas..."
                className="w-full p-3 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
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
                <span className="material-symbols-outlined text-base">save</span>
                <span>{isCreatingProject ? 'Guardando...' : 'Registrar Proyecto'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VISTA 3: AUDITORÍA Y SESIÓN */}
      {activeTab === 'session' && (
        <div className="bg-white rounded-3xl border border-surface-variant p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl mx-auto">
          <div>
            <span className="font-label-caps text-label-caps text-industrial-orange uppercase tracking-wider">
              Seguridad de la sesión
            </span>
            <h3 className="font-headline-sm text-xl font-bold text-primary mt-1">
              Sesión autenticada con Firebase
            </h3>
            <p className="text-xs text-secondary mt-1">
              Tu identidad se valida con Firebase y tus permisos se consultan en el servidor corporativo.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-surface-variant space-y-3">
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
        </div>
      )}

      {editingProject && projectEdits && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form onSubmit={handleUpdateProjectSubmit} className="w-full max-w-xl space-y-4 rounded-2xl border border-surface-variant bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-surface-variant pb-3">
              <div>
                <p className="font-mono text-xs font-bold text-industrial-orange">{editingProject.code}</p>
                <h3 className="mt-1 text-lg font-bold text-primary">Editar datos de la obra</h3>
              </div>
              <button type="button" onClick={() => setEditingProject(null)} aria-label="Cerrar edición" className="text-secondary hover:text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div>
              <label htmlFor="edit-project-name" className="mb-1 block text-xs font-semibold text-secondary">Nombre</label>
              <input id="edit-project-name" required maxLength={120} value={projectEdits.name} onChange={(event) => setProjectEdits({ ...projectEdits, name: event.target.value })} className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-project-client" className="mb-1 block text-xs font-semibold text-secondary">Cliente</label>
                <input id="edit-project-client" maxLength={120} value={projectEdits.client} onChange={(event) => setProjectEdits({ ...projectEdits, client: event.target.value })} className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" />
              </div>
              <div>
                <label htmlFor="edit-project-category" className="mb-1 block text-xs font-semibold text-secondary">Categoría</label>
                <select id="edit-project-category" value={projectEdits.category} onChange={(event) => setProjectEdits({ ...projectEdits, category: event.target.value })} className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm">
                  <option value="Ingeniería Civil">Ingeniería Civil</option>
                  <option value="SST & Obras Industriales">SST & Obras Industriales</option>
                  <option value="Infraestructura Vial">Infraestructura Vial</option>
                  <option value="Auditoría SG-SST">Auditoría SG-SST</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="edit-project-description" className="mb-1 block text-xs font-semibold text-secondary">Descripción</label>
              <textarea id="edit-project-description" rows={3} maxLength={1000} value={projectEdits.description} onChange={(event) => setProjectEdits({ ...projectEdits, description: event.target.value })} className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm" />
            </div>
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
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-surface-variant p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-primary text-white px-2 py-0.5 rounded">
                    {photoModalProject.code}
                  </span>
                  <h3 className="font-headline-sm text-base font-bold text-primary">
                    Galería Fotográfica de la Obra
                  </h3>
                </div>
                <p className="text-xs text-secondary mt-0.5">{photoModalProject.name}</p>
              </div>

              <button
                type="button"
                onClick={closePhotoModal}
                className="text-secondary hover:text-primary"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Formulario para agregar nueva fotografía */}
            <form onSubmit={handleAddPhotoSubmit} className="bg-surface p-4 rounded-xl border border-surface-variant space-y-3">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-industrial-orange">add_photo_alternate</span>
                Agregar Nueva Fotografía de Seguimiento:
              </h4>

              <div>
                <label htmlFor="gallery-photo" className="block text-[11px] font-semibold text-secondary mb-1">
                  Fotografía JPG, PNG o WebP (máximo 5 MB) *
                </label>
                <input
                  id="gallery-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleGalleryPhotoChange}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-xs focus:ring-2 focus:ring-industrial-orange/40 focus:outline-none"
                />
              </div>
              {photoPreviewUrl && (
                <img src={safeImageUrl(photoPreviewUrl)} alt="Vista previa de la fotografía" className="max-h-48 rounded-lg object-contain" />
              )}
              {photoError && <p role="alert" className="text-xs text-error">{photoError}</p>}

              <div>
                <label className="block text-[11px] font-semibold text-secondary mb-1">
                  Descripción o Actividad de la Foto
                </label>
                <input
                  type="text"
                  value={photoDesc}
                  onChange={(e) => setPhotoDesc(e.target.value)}
                  placeholder="Ej: Inspección de arneses y anclajes en placa piso 4"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-xs focus:ring-2 focus:ring-industrial-orange/40 focus:outline-none"
                />
              </div>

              <div className="text-right pt-1">
                <button
                  type="submit"
                  disabled={!photoFile || isUploadingPhoto}
                  className="px-4 py-2 rounded-lg bg-industrial-orange text-white text-xs font-semibold hover:bg-industrial-orange/90 transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploadingPhoto ? 'Subiendo...' : 'Subir Fotografía al Registro'}
                </button>
              </div>
            </form>

            {/* Listado de fotos actuales */}
            <div>
              <h5 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Fotografías Registradas ({photoModalProject.photos?.length || 0}):
              </h5>

              {photoModalProject.photos && photoModalProject.photos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {photoModalProject.photos.map((photo, index) => (
                    <div key={index} className="rounded-xl overflow-hidden border border-surface-variant bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => setExpandedPhoto(photo.url)}
                        aria-label={`Ampliar foto: ${photo.description}`}
                        aria-haspopup="dialog"
                        className="block h-48 w-full overflow-hidden bg-slate-100 sm:h-64"
                      >
                        <img
                          src={safeImageUrl(photo.url)}
                          alt={photo.description}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </button>
                      <div className="p-2.5">
                        <span className="text-[10px] text-industrial-orange font-bold block">{photo.fecha}</span>
                        <p className="text-xs text-primary font-medium mt-0.5 line-clamp-2">{photo.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-secondary italic py-4 text-center">
                  No hay fotografías registradas aún en este proyecto.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {expandedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Fotografía ampliada"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-6"
          onClick={() => setExpandedPhoto(null)}
        >
          <button
            type="button"
            autoFocus
            onClick={() => setExpandedPhoto(null)}
            aria-label="Cerrar fotografía ampliada"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl leading-none text-white hover:bg-white/25"
          >
            ×
          </button>
          <img
            src={safeImageUrl(expandedPhoto)}
            alt="Fotografía del proyecto ampliada"
            className="max-h-[92vh] max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
