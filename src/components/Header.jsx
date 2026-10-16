import { useEffect, useState } from 'react';

const navItems = [
  { id: 'hero', label: 'Inicio', href: '#hero' },
  { id: 'servicios', label: 'Servicios', href: '#servicios' },
  { id: 'gestion-sst', label: 'Gestión SST', href: '#gestion-sst' },
  { id: 'risk-explorer', label: 'Riesgos', href: '#risk-explorer' },
  { id: 'portfolio', label: 'Proyectos', href: '#portfolio' },
  { id: 'contacto', label: 'Contacto', href: '#contacto' },
];

const pageRoutes = {
  'servicios': { label: 'Servicios', parent: 'Inicio' },
  'gestion-sst': { label: 'Gestión SST', parent: 'Inicio' },
  'portfolio': { label: 'Proyectos', parent: 'Inicio' },
  'proyectos': { label: 'Proyectos', parent: 'Inicio' },
  'consultar-proyecto': { label: 'Consultar Proyecto', parent: 'Inicio' },
  'risk-explorer': { label: 'Explorador de Riesgos', parent: 'Gestión SST' },
};

export default function Header() {
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('');

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);

    const updateActiveSectionFromHash = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentRoute(hash);
      if (hash && sectionIds.includes(hash)) {
        setActiveSection(hash);
      }
    };

    updateActiveSectionFromHash();
    window.addEventListener('hashchange', updateActiveSectionFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries.filter((entry) => entry.isIntersecting);
        if (visibleSections.length === 0) {
          return;
        }

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

  const closeMenu = () => setMenuOpen(false);

  const isSubPage = pageRoutes[currentRoute];

  return (
    <header className="fixed top-0 w-full z-50 bg-primary shadow-md shadow-primary/10">
      <div className="flex items-center justify-between px-md h-16 max-w-container-max mx-auto text-on-primary">
        <div className="flex items-center gap-xs">
          <a href="#hero" className="flex items-center gap-xs hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-industrial-orange" style={{ fontSize: 32 }}>
              foundation
            </span>
            <span className="font-headline-md text-headline-md font-bold tracking-tight">G&G</span>
          </a>
        </div>

        <div className="hidden md:flex items-center gap-md">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                className={`font-body-sm text-body-sm border-b-2 transition-all ${
                  isActive
                    ? 'border-white text-white opacity-100'
                    : 'border-transparent text-on-primary opacity-80 hover:opacity-100 hover:border-white'
                }`}
                href={item.href}
              >
                {item.label}
              </a>
            );
          })}
          <a className="text-on-primary opacity-80 hover:opacity-100 font-body-sm text-body-sm bg-transparent border-none p-0" href="#consultar-proyecto">
            Consultar Proyecto
          </a>
          <a className="bg-industrial-orange text-white px-md py-xs rounded-lg hover:scale-95 transition-transform font-label-caps text-label-caps" href="#contacto">
            Solicitar Cotización
          </a>
        </div>

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

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Menú móvil" className="md:hidden border-t border-white/10 bg-primary">
          <div className="px-md py-sm space-y-sm">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={closeMenu}
                className="block font-body-sm text-body-sm text-on-primary opacity-90 hover:opacity-100"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#consultar-proyecto"
              onClick={closeMenu}
              className="block font-body-sm text-body-sm text-on-primary opacity-90 hover:opacity-100"
            >
              Consultar Proyecto
            </a>
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