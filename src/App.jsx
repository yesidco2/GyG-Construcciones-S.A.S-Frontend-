import { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AppShell from './components/AppShell';
import GestionSSTPage from './pages/GestionSSTPage';
import ConsultProjectPage from './pages/ConsultProjectPage';
import AdminFaqPage from './pages/AdminFaqPage';
import LoginPage from './pages/LoginPage';

const routes = {
  '': AppShell,
  hero: AppShell,
  indicadores: AppShell,
  contacto: AppShell,
  compromiso: AppShell,
  nosotros: AppShell,
  'gestion-sst': GestionSSTPage,
  'risk-explorer': GestionSSTPage,
  'vision-prevencion': GestionSSTPage,
  'servicios-sst': GestionSSTPage,
  'jerarquia-controles': GestionSSTPage,
  'contacto-sst': GestionSSTPage,
  portfolio: AppShell,
  'proyectos': AppShell,
  'consultar-proyecto': ConsultProjectPage,
  'admin-faq': AdminFaqPage,
  'login': LoginPage,
};

function initializeRoute() {
  if (window.location.hash) {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
  return '';
}

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
  const [routeKey, setRouteKey] = useState(initializeRoute);

  useEffect(() => {
    window.scrollTo(0, 0);
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
        const top = window.scrollY + target.getBoundingClientRect().top - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [routeKey]);

  const PageComponent = routes[routeKey] || AppShell;
  const showFooter = !['consultar-proyecto', 'login'].includes(routeKey);

  return (
    <Layout showFooter={showFooter}>
      <PageComponent />
    </Layout>
  );
}
