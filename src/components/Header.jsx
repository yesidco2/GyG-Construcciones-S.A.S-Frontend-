import { useEffect, useState, useRef } from 'react';

const homeSections = [
  { id: 'hero', label: 'Inicio', icon: 'home', description: 'Conoce G&G Construcciones y nuestra experiencia.' },
  { id: 'indicadores', label: 'Indicadores', icon: 'analytics', description: 'Cifras de experiencia, proyectos y cumplimiento.' },
  { id: 'servicios', label: 'Servicios', icon: 'construction', description: 'Ingeniería, consultoría técnica y gestión integral SG-SST.' },
  { id: 'compromiso', label: 'Compromiso SST', icon: 'health_and_safety', description: 'Nuestro enfoque de prevención y seguridad en obra.' },
  { id: 'portfolio', label: 'Proyectos', icon: 'apartment', description: 'Obras civiles, infraestructura y casos de éxito.' },
  { id: 'nosotros', label: 'Nosotros', icon: 'groups', description: 'Nuestra misión, visión, valores y políticas.' },
  { id: 'contacto', label: 'Contacto', icon: 'contact_support', description: 'Canales de atención y solicitudes.' },
];

const sstSections = [
  { id: 'gestion-sst', label: 'Inicio Gestión SST', icon: 'health_and_safety', description: 'Liderazgo en seguridad y salud para la construcción.' },
  { id: 'vision-prevencion', label: 'Visión de la prevención', icon: 'visibility', description: 'Principios y medidas para prevenir incidentes.' },
  { id: 'risk-explorer', label: 'Explorador de riesgos', icon: 'warning', description: 'Consulta riesgos y EPP asociados a cada labor.' },
  { id: 'servicios-sst', label: 'Servicios especializados', icon: 'engineering', description: 'Soluciones especializadas para la seguridad de tus proyectos.' },
  { id: 'jerarquia-controles', label: 'Jerarquía de controles', icon: 'account_tree', description: 'Metodología para mitigar riesgos en obra.' },
  { id: 'contacto-sst', label: 'Contacto SST', icon: 'contact_support', description: 'Solicita un diagnóstico inicial de tu obra.' },
];

export default function Header() {
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');
  
  // Estado para el Mega Menú desplegable de Inicio
  const [inicioMenuOpen, setInicioMenuOpen] = useState(false);
  const [mobileInicioOpen, setMobileInicioOpen] = useState(false);
  const [gestionMenuOpen, setGestionMenuOpen] = useState(false);
  const [mobileGestionOpen, setMobileGestionOpen] = useState(false);
  const dropdownRef = useRef(null);
  const gestionDropdownRef = useRef(null);

  // Cerrar el Mega Menú si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setInicioMenuOpen(false);
      }
      if (gestionDropdownRef.current && !gestionDropdownRef.current.contains(event.target)) {
        setGestionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateCurrentRoute = () => setCurrentRoute(window.location.hash.replace('#', ''));
    updateCurrentRoute();
    window.addEventListener('hashchange', updateCurrentRoute);
    return () => window.removeEventListener('hashchange', updateCurrentRoute);
  }, []);

  useEffect(() => {
    const homeRoutes = ['', ...homeSections.map(({ id }) => id), 'proyectos'];
    if (!homeRoutes.includes(currentRoute)) {
      setActiveSection(currentRoute);
      return undefined;
    }

    const sectionIds = homeSections.map(({ id }) => id);
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
      observer.disconnect();
    };
  }, [currentRoute]);

  const closeMenu = () => {
    setMenuOpen(false);
    setInicioMenuOpen(false);
    setGestionMenuOpen(false);
  };

  const isHomePage = ['', ...homeSections.map(({ id }) => id), 'proyectos'].includes(currentRoute);
  const isInicioActive =
    isHomePage && homeSections.some(({ id }) => id === activeSection);
  const isGestionActive = sstSections.some(({ id }) => id === currentRoute);
  const isConsultProjectActive = currentRoute === 'consultar-proyecto';

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
                isInicioActive
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
                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Áreas y Ecosistema
                  </p>
                  <nav aria-label="Secciones de Inicio" className="grid gap-2 sm:grid-cols-2">
                    {homeSections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={() => setInicioMenuOpen(false)}
                        className="group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-surface-variant hover:bg-surface"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-industrial-orange/10 group-hover:text-industrial-orange">
                          <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-1 text-sm font-bold text-primary transition-colors group-hover:text-industrial-orange">
                            {section.label}
                            <span className="material-symbols-outlined text-xs opacity-0 transition-opacity group-hover:opacity-100">
                              arrow_forward
                            </span>
                          </h4>
                          <p className="mt-0.5 text-xs leading-snug text-secondary">{section.description}</p>
                        </div>
                      </a>
                    ))}
                  </nav>
                </div>

              </div>
            )}
          </div>

          {/* 2. GESTIÓN SST */}
          <div className="relative" ref={gestionDropdownRef}>
            <button
              type="button"
              onClick={() => setGestionMenuOpen((open) => !open)}
              className={`flex items-center gap-1 border-b-2 py-1 font-body-sm text-body-sm transition-all ${
                isGestionActive || gestionMenuOpen
                  ? 'border-white text-white opacity-100 font-semibold'
                  : 'border-transparent text-on-primary opacity-80 hover:opacity-100 hover:border-white'
              }`}
              aria-expanded={gestionMenuOpen}
              aria-haspopup="true"
            >
              Gestión SST
              <span className={`material-symbols-outlined text-[18px] transition-transform ${gestionMenuOpen ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>
            {gestionMenuOpen && (
              <nav
                aria-label="Menú de Gestión SST"
                className="absolute left-1/2 top-full z-50 mt-3 w-[660px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-surface-variant bg-white p-6 text-on-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200"
              >
                <div>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Áreas y Ecosistema
                  </p>
                  <nav aria-label="Secciones de Gestión SST" className="grid gap-2 sm:grid-cols-2">
                    {sstSections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={() => setGestionMenuOpen(false)}
                        className="group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-surface-variant hover:bg-surface"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-industrial-orange/10 group-hover:text-industrial-orange">
                          <span className="material-symbols-outlined text-2xl">{section.icon}</span>
                        </div>
                        <div>
                          <h4 className="flex items-center gap-1 text-sm font-bold text-primary transition-colors group-hover:text-industrial-orange">
                            {section.label}
                            <span className="material-symbols-outlined text-xs opacity-0 transition-opacity group-hover:opacity-100">
                              arrow_forward
                            </span>
                          </h4>
                          <p className="mt-0.5 text-xs leading-snug text-secondary">{section.description}</p>
                        </div>
                      </a>
                    ))}
                  </nav>
                </div>
              </nav>
            )}
          </div>

          {/* 3. CONSULTAR PROYECTO */}
          <a
            className={`font-body-sm text-body-sm border-b-2 py-1 transition-all ${
              isConsultProjectActive
                ? 'border-white text-white opacity-100 font-semibold'
                : 'border-transparent text-on-primary opacity-80 hover:opacity-100 hover:border-white'
            }`}
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

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {menuOpen && (
        <nav id="mobile-menu" aria-label="Menú móvil" className="md:hidden border-t border-white/10 bg-primary animate-in fade-in duration-150">
          <div className="px-md py-sm space-y-sm">
            
            {/* 1. INICIO CON ACORDEÓN DESPLEGABLE EN MÓVIL */}
            <div>
              <button
                type="button"
                onClick={() => setMobileInicioOpen(!mobileInicioOpen)}
                className={`w-full flex items-center justify-between font-body-sm text-body-sm py-1 ${
                  isInicioActive ? 'text-white opacity-100' : 'text-on-primary opacity-90'
                }`}
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
                  {homeSections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={closeMenu}
                      className="block py-1 text-xs text-white/80 hover:text-white"
                    >
                      {section.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => setMobileGestionOpen((open) => !open)}
                className={`flex w-full items-center justify-between py-1 font-body-sm text-body-sm ${
                  isGestionActive ? 'font-semibold text-white opacity-100' : 'text-on-primary opacity-90'
                }`}
                aria-expanded={mobileGestionOpen}
              >
                Gestión SST
                <span className={`material-symbols-outlined text-sm transition-transform ${mobileGestionOpen ? 'rotate-180 text-industrial-orange' : ''}`}>
                  expand_more
                </span>
              </button>
              {mobileGestionOpen && (
                <div className="ml-1 mt-1 space-y-2 border-l-2 border-industrial-orange py-1 pl-4">
                  {sstSections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      onClick={closeMenu}
                      className="block py-1 text-xs text-white/80 hover:text-white"
                    >
                      {section.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* 3. CONSULTAR PROYECTO */}
            <a
              href="#consultar-proyecto"
              onClick={closeMenu}
              className={`block font-body-sm text-body-sm py-1 ${
                isConsultProjectActive
                  ? 'font-semibold text-white opacity-100'
                  : 'text-on-primary opacity-90 hover:opacity-100'
              }`}
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