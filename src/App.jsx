import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AppShell from './components/AppShell';
import GestionSSTPage from './pages/GestionSSTPage';
import ProjectsPage from './pages/ProjectsPage';
import ConsultProjectPage from './pages/ConsultProjectPage';
import AdminFaqPage from './pages/AdminFaqPage';
import LoginPage from './pages/LoginPage';
import {
  completeEmailLinkSignIn,
  completeProviderRedirectSignIn,
} from './services/authService';

function getRouteKey() {
  const routeKey = window.location.hash.replace('#', '');
  return routeKey === 'registro' ? 'login' : routeKey;
}

const routes = {
  '': AppShell,
  hero: AppShell,
  contacto: AppShell,
  'gestion-sst': GestionSSTPage,
  'risk-explorer': GestionSSTPage,
  portfolio: ProjectsPage,
  'proyectos': ProjectsPage,
  'consultar-proyecto': ConsultProjectPage,
  'admin-faq': AdminFaqPage,
  'login': LoginPage,
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
  const [routeKey, setRouteKey] = useState(getRouteKey);
  const emailLinkHandled = useRef(false);

  useEffect(() => {
    if (window.location.hash === '#registro') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#login`);
    }

    if (!emailLinkHandled.current) {
      emailLinkHandled.current = true;
      completeEmailLinkSignIn().catch((error) => {
        console.error('No se pudo completar el acceso por enlace de correo:', error);
      });
      completeProviderRedirectSignIn().catch((error) => {
        console.error('No se pudo completar el acceso con el proveedor:', error);
      });
    }

    const onHashChange = () => {
      if (window.location.hash === '#registro') {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#login`);
      }
      setRouteKey(getRouteKey());
    };
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
  const showFooter = !['consultar-proyecto', 'login'].includes(routeKey);

  return (
    <Layout showFooter={showFooter}>
      <PageComponent />
    </Layout>
  );
}
