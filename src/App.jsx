import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AppShell from './components/AppShell';
import ServicesPage from './pages/ServicesPage';
import GestionSSTPage from './pages/GestionSSTPage';
import ProjectsPage from './pages/ProjectsPage';
import ConsultProjectPage from './pages/ConsultProjectPage';
import RiskExplorer from './components/RiskExplorer';

const routes = {
  '': AppShell,
  hero: AppShell,
  contacto: AppShell,
  'servicios': ServicesPage,
  'gestion-sst': GestionSSTPage,
  'risk-explorer': RiskExplorer,
  portfolio: ProjectsPage,
  'proyectos': ProjectsPage,
  'consultar-proyecto': ConsultProjectPage,
};

function Layout({ children, showFooter = true }) {
  return (
    <div className="bg-background text-on-background selection:bg-industrial-orange selection:text-white">
      <Header />
      {children}
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  const [routeKey, setRouteKey] = useState(window.location.hash.replace('#', ''));

  useEffect(() => {
    const onHashChange = () => setRouteKey(window.location.hash.replace('#', ''));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (!routeKey) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const targetId = routeKey === 'proyectos' ? 'portfolio' : routeKey;
      const target = document.getElementById(targetId);
      if (target) {
        const top = window.scrollY + target.getBoundingClientRect().top - 104;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [routeKey]);

  const PageComponent = routes[routeKey] || AppShell;
  const showFooter = routeKey !== 'consultar-proyecto';

  return (
    <Layout showFooter={showFooter}>
      <PageComponent />
    </Layout>
  );
}
