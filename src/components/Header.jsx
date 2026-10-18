import { useEffect, useState, useRef } from 'react';

const pageRoutes = {
  'gestion-sst': { label: 'Gestión SST', parent: 'Inicio' },
  'proyectos': { label: 'Proyectos', parent: 'Inicio' },
  'portfolio': { label: 'Proyectos', parent: 'Inicio' },
  'consultar-proyecto': { label: 'Consultar Proyecto', parent: 'Inicio' },
  'risk-explorer': { label: 'Explorador de Riesgos', parent: 'Gestión SST' },
  'login': { label: 'Portal SST / Iniciar Sesión', parent: 'Inicio' },
  'registro': { label: 'Crear cuenta', parent: 'Inicio' },
};

export default function Header() {
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');
  
  // Estado para el Mega Menú desplegable de Inicio
  const [inicioMenuOpen, setInicioMenuOpen] = useState(false);
  const [mobileInicioOpen, setMobileInicioOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el Mega Menú si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setInicioMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Observador de hash y secciones para actualizar el estado activo
  useEffect(() => {
    const updateActiveSectionFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentRoute(hash);
      if (hash) {
        setActiveSection(hash);
      }
    };

    updateActiveSectionFromHash();
    window.addEventListener('hashchange', updateActiveSectionFromHash);

    const sectionIds = ['hero', 'servicios', 'gestion-sst', 'portfolio', 'contacto'];
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting);
        if (visibleSections.length === 0) return;

        const topSection = visibleSections.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev,
        );

        if (sectionIds.includes(topSection.target.id)) {
          setActiveSection(topSection.target.id);
        }
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      window.removeEventListener('hashchange', updateActiveSectionFromHash);
      observer.disconnect();
    };
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setInicioMenuOpen(false);
  };

  const isSubPage = pageRoutes[currentRoute];

  return (
    <header className="fixed top-0 w-full z-50 bg-primary shadow-md shadow-primary/10 select-none">
      <div className="flex items-center justify-between px-md h-16 max-w-container-max mx-auto text-on-primary">
        
        {/* COLUMNA IZQUIERDA: LOGO (Ancho proporcional para balancear el centro) */}
        <div className="flex items-center gap-xs shrink-0 min-w-[180px]">
          <a href="#hero" className="flex items-center gap-xs hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-industrial-orange" style={{ fontSize: 32 }}>
              foundation
            </span>
            <span className="font-headline-md text-headline-md font-bold tracking-tight">G&G</span>
          </a>
        </div>

        {/* COLUMNA CENTRAL: NAVEGACIÓN TOTALMENTE CENTRADA */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-8 flex-1">
          
          {/* 1. BOTÓN INICIO (Con Mega Menú desplegable estilo MongoDB) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setInicioMenuOpen(!inicioMenuOpen)}
              className={`font-body-sm text-body-sm border-b-2 py-1 transition-all flex items-center gap-1 cursor-pointer ${
                inicioMenuOpen || activeSection === 'hero' || activeSection === 'servicios' || activeSection === 'portfolio' || activeSection === 'contacto'
                  ? 'border-white text-white opacity-100 font-semibold'
                  : 'border-transparent text-on-primary opacity-80 hover:opacity-100 hover:border-white'
              }`}
              aria-expanded={inicioMenuOpen}
              aria-haspopup="true"
            >
              <span>Inicio</span>
              <span
                className={`material-symbols-outlined text-[18px] transition-transform duration-200 ${
                  inicioMenuOpen ? 'rotate-180 text-industrial-orange' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {/* MEGA DROPDOWN (Inspirado en MongoDB, centrado bajo el botón) */}
            {inicioMenuOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[660px] max-w-[calc(100vw-2rem)] bg-white text-on-surface rounded-2xl shadow-2xl border border-surface-variant p-6 z-50 animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="grid grid-cols-12 gap-6">
                  
                  {/* SECCIÓN PRINCIPAL: Servicios, Proyectos y Contactos */}
                  <div className="col-span-7 space-y-3">
                    <p className="text-[11px] font-bold text-secondary uppercase tracking-wider mb-2">
                      Áreas y Ecosistema
                    </p>

                    {/* Opción 1: SERVICIOS */}
                    <a
                      href="#servicios"
                      onClick={() => setInicioMenuOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface transition-all group border border-transparent hover:border-surface-variant"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-industrial-orange/10 flex items-center justify-center text-primary group-hover:text-industrial-orange transition-colors shrink-0">
                        <span className="material-symbols-outlined text-2xl">construction</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary group-hover:text-industrial-orange transition-colors flex items-center gap-1">
                          <span>Servicios</span>
                          <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            arrow_forward
                          </span>
                        </h4>
                        <p className="text-xs text-secondary leading-snug mt-0.5">
                          Ingeniería de alta precisión, consultoría técnica y gestión integral SG-SST.
                        </p>
                      </div>
                    </a>

                    {/* Opción 2: PROYECTOS */}
                    <a
                      href="#portfolio"
                      onClick={() => setInicioMenuOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface transition-all group border border-transparent hover:border-surface-variant"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-industrial-orange/10 flex items-center justify-center text-primary group-hover:text-industrial-orange transition-colors shrink-0">
                        <span className="material-symbols-outlined text-2xl">apartment</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary group-hover:text-industrial-orange transition-colors flex items-center gap-1">
                          <span>Proyectos</span>
                          <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            arrow_forward
                          </span>
                        </h4>
                        <p className="text-xs text-secondary leading-snug mt-0.5">
                          Portafolio de obras civiles, infraestructura ejecutada y casos de éxito.
                        </p>
                      </div>
                    </a>

                    {/* Opción 3: CONTACTOS */}
                    <a
                      href="#contacto"
                      onClick={() => setInicioMenuOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface transition-all group border border-transparent hover:border-surface-variant"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/5 group-hover:bg-industrial-orange/10 flex items-center justify-center text-primary group-hover:text-industrial-orange transition-colors shrink-0">
                        <span className="material-symbols-outlined text-2xl">contact_support</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary group-hover:text-industrial-orange transition-colors flex items-center gap-1">
                          <span>Contactos</span>
                          <span className="material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            arrow_forward
                          </span>
                        </h4>
                        <p className="text-xs text-secondary leading-snug mt-0.5">
                          Líneas de atención directa, radicación de solicitudes y asesoría personalizada.
                        </p>
                      </div>
                    </a>
                  </div>

                  {/* PANEL LATERAL DESTACADO (Estilo MongoDB) */}
                  <div className="col-span-5 bg-surface-container-low rounded-xl p-4 border border-surface-variant">
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-md bg-industrial-orange/10 text-industrial-orange text-[10px] font-bold uppercase tracking-wider mb-2">
                        G&G Construcciones
                      </span>
                      <h5 className="text-sm font-bold text-primary leading-tight">
                        Compromiso con la Vida
                      </h5>
                      <p className="text-xs text-secondary mt-1.5 leading-relaxed">
                        Implementación de estándares de seguridad y salud en el trabajo certificados con trazabilidad total en obra.
                      </p>
                    </div>

                  </div>
                </div>

                {/* PIE DEL MEGA MENÚ */}
                <div className="mt-4 pt-3 border-t border-surface-variant flex items-center justify-between text-xs text-secondary">
                  <a
                    href="#hero"
                    onClick={() => setInicioMenuOpen(false)}
                    className="hover:text-industrial-orange flex items-center gap-1 font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">home</span>
                    <span>Ir a la cabecera principal</span>
                  </a>
                  <span className="text-[11px] text-secondary/60 font-mono">SG-SST ISO 45001</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. GESTIÓN SST */}
          <a
            className={`font-body-sm text-body-sm border-b-2 py-1 transition-all ${
              activeSection === 'gestion-sst'
                ? 'border-white text-white opacity-100 font-semibold'
                : 'border-transparent text-on-primary opacity-80 hover:opacity-100 hover:border-white'
            }`}
            href="#gestion-sst"
          >
            Gestión SST
          </a>

          {/* 3. CONSULTAR PROYECTO */}
          <a
            className="text-on-primary opacity-80 hover:opacity-100 font-body-sm text-body-sm bg-transparent border-none p-0 transition-opacity"
            href="#consultar-proyecto"
          >
            Consultar Proyecto
          </a>

          {/* 4. LOGIN (Portal SST) */}
          <a
            className="border border-white/20 hover:border-white text-on-primary hover:text-white px-3 py-1.5 rounded-lg transition-all font-body-sm text-body-sm flex items-center gap-1.5"
            href="#login"
          >
            <span className="material-symbols-outlined text-[18px] text-industrial-orange">lock</span>
            <span>Portal SST</span>
          </a>
          <a
            className="border border-white/20 hover:border-white text-on-primary hover:text-white px-3 py-1.5 rounded-lg transition-all font-body-sm text-body-sm"
            href="#registro"
          >
            Registrarse
          </a>
        </div>

        {/* COLUMNA DERECHA: BOTÓN DE ACCIÓN (Equilibra perfectamente el ancho del Logo) */}
        <div className="hidden md:flex items-center justify-end shrink-0 min-w-[180px]">
          {/* 5. SOLICITAR COTIZACIÓN */}
          <a
            className="bg-industrial-orange text-white px-md py-xs rounded-lg hover:scale-95 transition-transform font-label-caps text-label-caps"
            href="#contacto"
          >
            Solicitar Cotización
          </a>
        </div>

        {/* BOTÓN MENÚ MÓVIL (Hamburguesa) */}
        <button
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="md:hidden p-xs active:scale-95 transition-transform"
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Breadcrumb para subpáginas */}
      {isSubPage && (
        <div className="border-t border-white/10 bg-primary/50 backdrop-blur-sm px-md h-10 flex items-center text-on-primary text-sm max-w-container-max mx-auto">
          <a href="#hero" className="opacity-70 hover:opacity-100 transition-opacity">
            {isSubPage.parent}
          </a>
          <span className="mx-sm opacity-50">/</span>
          <span className="opacity-100 font-semibold">{isSubPage.label}</span>
        </div>
      )}

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuOpen && (
        <nav id="mobile-menu" aria-label="Menú móvil" className="md:hidden border-t border-white/10 bg-primary animate-in fade-in duration-150">
          <div className="px-md py-sm space-y-sm">
            
            {/* 1. INICIO CON ACORDEÓN DESPLEGABLE EN MÓVIL */}
            <div>
              <button
                type="button"
                onClick={() => setMobileInicioOpen(!mobileInicioOpen)}
                className="w-full flex items-center justify-between font-body-sm text-body-sm text-on-primary opacity-90 py-1"
              >
                <span className="font-semibold">Inicio</span>
                <span
                  className={`material-symbols-outlined text-sm transition-transform duration-200 ${
                    mobileInicioOpen ? 'rotate-180 text-industrial-orange' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              {mobileInicioOpen && (
                <div className="mt-1 pl-4 space-y-2 border-l-2 border-industrial-orange ml-1 py-1">
                  <a
                    href="#servicios"
                    onClick={closeMenu}
                    className="flex items-center gap-2 text-xs text-white/80 hover:text-white py-1"
                  >
                    <span className="material-symbols-outlined text-sm text-industrial-orange">construction</span>
                    <span>Servicios</span>
                  </a>
                  <a
                    href="#portfolio"
                    onClick={closeMenu}
                    className="flex items-center gap-2 text-xs text-white/80 hover:text-white py-1"
                  >
                    <span className="material-symbols-outlined text-sm text-industrial-orange">apartment</span>
                    <span>Proyectos</span>
                  </a>
                  <a
                    href="#contacto"
                    onClick={closeMenu}
                    className="flex items-center gap-2 text-xs text-white/80 hover:text-white py-1"
                  >
                    <span className="material-symbols-outlined text-sm text-industrial-orange">contact_support</span>
                    <span>Contactos</span>
                  </a>
                </div>
              )}
            </div>

            {/* 2. GESTIÓN SST */}
            <a
              href="#gestion-sst"
              onClick={closeMenu}
              className="block font-body-sm text-body-sm text-on-primary opacity-90 hover:opacity-100 py-1"
            >
              Gestión SST
            </a>

            {/* 3. CONSULTAR PROYECTO */}
            <a
              href="#consultar-proyecto"
              onClick={closeMenu}
              className="block font-body-sm text-body-sm text-on-primary opacity-90 hover:opacity-100 py-1"
            >
              Consultar Proyecto
            </a>

            {/* 4. LOGIN QUE REALIZASTE */}
            <a
              href="#login"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 border border-white/30 text-white px-md py-xs rounded-lg font-body-sm text-body-sm text-center"
            >
              <span className="material-symbols-outlined text-[18px] text-industrial-orange">lock</span>
              <span>Portal SST / Iniciar Sesión</span>
            </a>

            <a
              href="#registro"
              onClick={closeMenu}
              className="flex items-center justify-center border border-white/20 text-white px-md py-xs rounded-lg font-body-sm text-body-sm text-center"
            >
              Registrarse
            </a>

            {/* 5. SOLICITAR COTIZACIÓN */}
            <a
              href="#contacto"
              onClick={closeMenu}
              className="block bg-industrial-orange text-white px-md py-xs rounded-lg font-label-caps text-label-caps text-center"
            >
              Solicitar Cotización
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}