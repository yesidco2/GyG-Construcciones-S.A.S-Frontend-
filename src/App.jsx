import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AppShell from './components/AppShell';
import ServicesPage from './pages/ServicesPage';
import GestionSSTPage from './pages/GestionSSTPage';
import ProjectsPage from './pages/ProjectsPage';
import ConsultProjectPage from './pages/ConsultProjectPage';
import RiskExplorer from './components/RiskExplorer';
import AdminFaqPage from './pages/AdminFaqPage';

const routes = {
  '': AppShell,
  'servicios': ServicesPage,
  'gestion-sst': GestionSSTPage,
  'risk-explorer': RiskExplorer,
  'proyectos': ProjectsPage,
  'consultar-proyecto': ConsultProjectPage,
  'admin-faq': AdminFaqPage,
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

  const PageComponent = routes[routeKey] || AppShell;
  const showFooter = routeKey !== 'consultar-proyecto';

  return (
    <Layout showFooter={showFooter}>
      <PageComponent />
    </Layout>
  );
}
