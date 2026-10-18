import { useState, useEffect } from 'react';
import {
  getStoredProjects,
  updateProjectProgress,
  addProjectPhoto,
  createProject,
  deleteProject,
} from '../../services/projectService';

// Fotos sugeridas para agilizar pruebas
const PRESET_PHOTOS = [
  { label: 'Estructura', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Seguridad SST', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Maquinaria', url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80' },
  { label: 'Topografía', url: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600&auto=format&fit=crop&q=80' },
];

export default function EngineerDashboard({ currentUser, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create' | 'session'
  const [notification, setNotification] = useState(null);

  // Estados para Modal de Agregar Imagen
  const [photoModalProject, setPhotoModalProject] = useState(null);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoDesc, setPhotoDesc] = useState('');

  // Estados para Formulario de Creación de Proyecto
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Ingeniería Civil');
  const [newClient, setNewClient] = useState('');
  const [newProgress, setNewProgress] = useState(15);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [createError, setCreateError] = useState('');

  // Cargar proyectos al montar
  useEffect(() => {
    loadProjects();
    suggestNextCode();
  }, []);

  const loadProjects = () => {
    setProjects(getStoredProjects());
  };

  const suggestNextCode = () => {
    const list = getStoredProjects();
    const nextNum = 125 + list.length;
    setNewCode(`GG-2026-00${nextNum}`);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Manejar cambio de avance
  const handleProgressChange = (code, value) => {
    const updated = updateProjectProgress(code, value);
    if (updated) {
      loadProjects();
      showNotification(`Avance de ${updated.name} actualizado al ${updated.progress}%.`);
    }
  };

  // Manejar adición de foto
  const handleAddPhotoSubmit = (e) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;

    const updated = addProjectPhoto(photoModalProject.code, {
      url: photoUrl.trim(),
      description: photoDesc.trim() || 'Fotografía de control técnico en obra',
      fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }),
    });

    if (updated) {
      loadProjects();
      setPhotoModalProject(updated);
      setPhotoUrl('');
      setPhotoDesc('');
      showNotification(`Nueva imagen agregada al proyecto ${updated.code}.`);
    }
  };

  // Manejar creación de nuevo proyecto
  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    setCreateError('');

    if (!newCode.trim() || !newName.trim()) {
      setCreateError('Por favor completa el código y el nombre del proyecto.');
      return;
    }

    try {
      const created = createProject({
        code: newCode.trim(),
        name: newName.trim(),
        category: newCategory,
        client: newClient.trim() || 'Cliente Corporativo',
        supervisor: currentUser?.name || 'Ing. Residente SST',
        progress: newProgress,
        photoUrl: newPhotoUrl.trim() || PRESET_PHOTOS[0].url,
        description: newDescription.trim(),
      });

      loadProjects();
      showNotification(`¡Proyecto ${created.code} (${created.name}) registrado con éxito!`);
      
      // Limpiar formulario y volver a la lista
      setNewName('');
      setNewClient('');
      setNewProgress(15);
      setNewPhotoUrl('');
      setNewDescription('');
      suggestNextCode();
      setActiveTab('list');
    } catch (err) {
      setCreateError(err.message || 'Error al crear el proyecto.');
    }
  };

  // Manejar eliminación
  const handleDelete = (code) => {
    if (window.confirm(`¿Estás seguro de eliminar el proyecto ${code}?`)) {
      deleteProject(code);
      loadProjects();
      showNotification(`Proyecto ${code} eliminado.`, 'info');
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
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                alt={currentUser?.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-industrial-orange object-cover shadow-md"
              />
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
              : 'bg-green-50 text-green-900 border border-green-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              {notification.type === 'info' ? 'info' : 'check_circle'}
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
          <div className="flex items-center justify-between text-xs text-secondary px-1">
            <p>
              Modifica directamente el <strong>porcentaje de avance</strong> o agrega <strong>nuevas fotografías</strong> para mantener actualizado el seguimiento del cliente.
            </p>
            <span className="font-mono text-[11px]">Sincronización en tiempo real</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
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
                      onClick={() => setPhotoModalProject(project)}
                      className="px-3 py-1.5 rounded-lg border border-outline-variant hover:border-industrial-orange bg-surface hover:bg-white text-xs font-semibold text-primary flex items-center gap-1.5 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm text-industrial-orange">add_a_photo</span>
                      <span>Fotos ({project.photos?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(project.code)}
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
                      value={project.progress}
                      onChange={(e) => handleProgressChange(project.code, e.target.value)}
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
                          onClick={() => handleProgressChange(project.code, val)}
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors ${
                            project.progress === val
                              ? 'bg-industrial-orange text-white border-industrial-orange'
                              : 'bg-white hover:bg-surface border-outline-variant text-secondary'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
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
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-surface-variant h-20 bg-slate-100">
                          <img
                            src={p.url}
                            alt={p.description}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1 text-[9px] text-white">
                            <span className="line-clamp-1">{p.fecha}</span>
                          </div>
                        </div>
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

            {/* URL Imagen Principal */}
            <div>
              <label htmlFor="new-photo" className="block text-xs font-semibold uppercase text-secondary mb-1">
                Fotografía Inicial de la Obra
              </label>
              <input
                id="new-photo"
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://ejemplo.com/foto-obra.jpg"
                className="w-full px-3 py-2.5 rounded-lg border border-outline-variant bg-surface focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-industrial-orange/40"
              />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-secondary">Sugerencias rápidas:</span>
                {PRESET_PHOTOS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setNewPhotoUrl(p.url)}
                    className="text-[10px] bg-surface hover:bg-surface-variant px-2 py-0.5 rounded border border-surface-variant font-medium text-primary"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
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
                className="px-6 py-2.5 rounded-xl bg-industrial-orange hover:bg-industrial-orange/90 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">save</span>
                <span>Registrar Proyecto</span>
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
                onClick={() => setPhotoModalProject(null)}
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
                <label className="block text-[11px] font-semibold text-secondary mb-1">
                  URL de la Fotografía *
                </label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white text-xs focus:ring-2 focus:ring-industrial-orange/40 focus:outline-none"
                  required
                />
              </div>

              {/* Botones sugeridos */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-secondary">O elige una foto sugerida:</span>
                {PRESET_PHOTOS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(p.url);
                      setPhotoDesc(`Avance en obra: ${p.label}`);
                    }}
                    className="text-[10px] bg-white hover:bg-surface-variant px-2 py-0.5 rounded border border-outline-variant font-medium text-primary shadow-2xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

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
                  className="px-4 py-2 rounded-lg bg-industrial-orange text-white text-xs font-semibold hover:bg-industrial-orange/90 transition-all shadow-sm"
                >
                  Subir Fotografía al Registro
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
                      <img
                        src={photo.url}
                        alt={photo.description}
                        className="w-full h-32 object-cover"
                      />
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
    </div>
  );
}
