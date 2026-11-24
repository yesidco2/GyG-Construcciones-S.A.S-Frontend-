import './components/portal.css';
import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AppShell from './components/AppShell';
import GestionSSTPage from './pages/GestionSSTPage';
import ConsultProjectPage from './pages/ConsultProjectPage';
import AdminFaqPage from './pages/AdminFaqPage';
import LoginPage from './pages/LoginPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookieConsentManager from './components/CookieConsentManager';
import CookiePolicyPage from './pages/CookiePolicyPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import getAppRouteKey from './utils/appRoute';
import PolicyDialog from './components/PolicyDialog';
import InduccionTrabajadorPage from './pages/InduccionTrabajadorPage';

const policyRoutes = ['politica-cookies', 'politica-datos', 'policy-content'];

function isPolicyRoute(routeKey) {
  return policyRoutes.includes(routeKey) || /^section-[0-9]+$/.test(routeKey);
}

function renderPage(routeKey) {
  switch (routeKey) {
    case 'gestion-sst':
    case 'risk-explorer':
    case 'vision-prevencion':
    case 'servicios-sst':
    case 'jerarquia-controles':
    case 'marco-legal-sst':
    case 'contacto-sst':
    case 'faq-sst':
      return <GestionSSTPage />;
    case 'consultar-proyecto':
      return <ConsultProjectPage />;
    case 'admin-faq':
      return <AdminFaqPage />;
    case 'login':
      return <LoginPage />;
    case 'politica-cookies':
      return <CookiePolicyPage />;
    case 'politica-datos':
    case 'policy-content':
      return <PrivacyPolicyPage />;
    case 'verify-email':
      return <VerifyEmailPage />;
    case 'reset-password':
      return <VerifyEmailPage recovery />;
    default:
      return /^section-[0-9]+$/.test(routeKey) ? <PrivacyPolicyPage /> : <AppShell />;
  }
}

function Layout({ children, showFooter = true }) {
  return (
    <div className="portal-layout bg-background text-on-background selection:bg-industrial-orange selection:text-white">
      <Header />
      {children}
      {showFooter && <Footer />}
      <CookieConsentManager />
    </div>
  );
}

export default function App() {
  const [routeKey, setRouteKey] = useState(getAppRouteKey);
  const previousRouteRef = useRef('');

  useEffect(() => {
    window.scrollTo(0, 0);
    const onHashChange = () => setRouteKey(getAppRouteKey());
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
    };
  }, []);

  useEffect(() => {
    if (!isPolicyRoute(routeKey)) previousRouteRef.current = routeKey || 'hero';
  }, [routeKey]);

  useEffect(() => {
    const sections = document.querySelectorAll('.portal-home > main > section:not(.portal-hero), .portal-sst-page > section:not(.portal-hero)');
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('scroll-reveal--visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    sections.forEach((section) => {
      section.classList.add('scroll-reveal');
      void section.offsetHeight;
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
      sections.forEach((section) => {
        section.classList.remove('scroll-reveal', 'scroll-reveal--visible');
      });
    };
  }, [routeKey]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const targetId = routeKey === 'proyectos' ? 'portfolio' : routeKey;
      const target = document.getElementById(targetId);
      if (target) {
        const top = window.scrollY + target.getBoundingClientRect().top - 72;
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [routeKey]);

  const induction = /^induccion\/([0-9a-f-]{36})$/i.exec(routeKey);
  if (induction) return <InduccionTrabajadorPage key={induction[1]} asignacion={induction[1]} />;

  const showFooter = !['consultar-proyecto', 'login'].includes(routeKey);
  const closePolicy = () => {
    window.location.hash = previousRouteRef.current || 'hero';
  };
  const policyTitle = routeKey === 'politica-cookies'
    ? 'Política de cookies'
    : 'Política de tratamiento de datos personales';

  return (
    <Layout showFooter={showFooter}>
      {isPolicyRoute(routeKey) ? (
        <PolicyDialog title={policyTitle} onClose={closePolicy}>
          {renderPage(routeKey)}
        </PolicyDialog>
      ) : renderPage(routeKey)}
    </Layout>
  );
}
