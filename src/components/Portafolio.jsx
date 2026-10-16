import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../services/api';

const projects = [
  {
    title: 'Viaducto Metropolitano',
    description: 'Cimentación profunda y diseño estructural con implementación total de seguridad en alturas.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCm3SJzPRAKA3ICXNxF2wJl0YrOyBXWqyuGvnobqfv9AIkhh4gvBzOPuvtIWfxS3M3dQGAPd7eM3he1Xg9NTAdZrML3NEPPG-pv84pLOX6nG3CF2A2rADHzo-Uqp-OEiS8bycVibaYkTRmEHuqzHdESMeQ5RSW1nyWAgpuHN8FPTDGuMlpwztb-2srM-gA_D4HPBLjQmECnIWarpRCHzfNr4oM-SWH5jc1cE8lGuWeyLb1TM0RLJIEPkOTj-UCZEifKSXruqfBaA0Q',
    category: 'Ingeniería Civil',
    metric: '12.500+',
    metricLabel: 'Horas/Hombre sin incidentes',
  },
  {
    title: 'Centro Logístico Industrial',
    description: 'Auditoría de riesgos y supervisión técnica para planta de 5.000m².',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_X2Lk_GfLAGVTSZWLpDIDsfV9N7KXmWUzsu6y_ax7tD_ubQW9xjAoltol3c9lJU82qzvdfRX7Qeiqn_6-tPOjc3Hlvq3ToZWEGqMavS09pWrxge1k5BZgE-k6LhN2IDYQVqL_wNJJSC6hpnEuytTNIDDEwVLtTJuZ9lMuiwrW8Oqakwbbdx9BcHHCkGVsiGpmNLNcG2rD4nwGs2Ptk2oucs7rIQ81GO3h5Ks7yNDTv_MSb0z-b4J6gvv0Kb_yA1_rAdKZEId4wqo',
    category: 'SST',
    metric: '45.000+',
    metricLabel: 'Horas/Hombre sin incidentes',
  },
  {
    title: 'Subestación Energía Norte',
    description: 'Implementación completa del Sistema de Gestión de Seguridad y Salud (ISO 45001).',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANnAm65X5dpBo0xx87Fdu5xzslV8i2AINR2HWh3m8y7UN379_1OxrMP5jdOIdi_-KT4nPKLyIxobKSWTLibzKzrsCUyMZKZD-V_dL7ajqAI-lwk3s0m7cpZCHYuwH_UbJDppVgzRAPZAWl_Ai40tNCNEmcciPPwkUjg4gPYm4wy6Or4XEhUyJb0peabC80xpNBCxkHIJULt5nQgilLOkmE6QrpCI5WGeAwHiL5FENrxHM3wk-vTxEwKQ3bWCUcXvg9Pzgm_50mGKE',
    category: 'Ingeniería Civil',
    metric: '18.200+',
    metricLabel: 'Horas/Hombre sin incidentes',
  },
];

const filters = ['Todos', 'Ingeniería Civil', 'SST'];

const fallbackProjects = projects.map((project) => ({
  ...project,
  apiCategory: project.category === 'SST' ? 'SST' : 'CIVIL',
}));

function ProjectCard({ title, description, image, category, metric, metricLabel }) {
  return (
    <div className="group overflow-hidden rounded-xl bg-white shadow-md">
      <div className="relative h-64 overflow-hidden">
        <img
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={image}
        />
        <div className="absolute right-sm top-sm rounded bg-primary px-sm py-xs font-label-caps text-label-caps text-white">
          {category}
        </div>
      </div>
      <div className="p-md">
        <h4 className="mb-xs font-headline-sm text-headline-sm text-primary">{title}</h4>
        <p className="mb-md font-body-sm text-body-sm text-secondary">{description}</p>
        <div className="flex items-center justify-between border-t border-surface-variant pt-md">
          <div className="flex flex-col">
            <span className="font-body-md text-body-md font-bold text-industrial-orange">{metric}</span>
            <span className="text-[10px] font-bold uppercase text-secondary">{metricLabel}</span>
          </div>
          <span className="material-symbols-outlined text-primary">arrow_outward</span>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState('Todos');
  const [projectItems, setProjectItems] = useState(fallbackProjects);
  const [isLoading, setIsLoading] = useState(true);
  const [slidesPerView, setSlidesPerView] = useState(typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1);
  const trackRef = useRef(null);

  useEffect(() => {
    function onResize() {
      setSlidesPerView(window.innerWidth >= 768 ? 3 : 1);
      setIndex(0);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let active = true;
    const apiCategory = filter === 'Ingeniería Civil' ? 'CIVIL' : filter === 'SST' ? 'SST' : '';
    const endpoint = apiCategory
      ? `/api/proyectos?categoria=${encodeURIComponent(apiCategory)}`
      : '/api/proyectos';
    const fallback = apiCategory
      ? fallbackProjects.filter((project) => project.apiCategory === apiCategory)
      : fallbackProjects;

    setProjectItems(fallback);
    setIsLoading(true);

    apiFetch(endpoint)
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data)) {
          setProjectItems(data.map((project) => {
            const fallbackProject = fallbackProjects.find((item) => item.apiCategory === project.categoria);
            return {
              title: project.nombre,
              description: project.descripcion,
              image: project.imagenUrl || fallbackProject?.image || '',
              category: project.categoria === 'CIVIL' ? 'Ingeniería Civil' : 'SST',
              apiCategory: project.categoria,
              metric: project.metricaDestacada || 'Proyecto destacado',
              metricLabel: 'Métrica destacada',
            };
          }));
        }
      })
      .catch((error) => {
        console.error('No se pudieron cargar los proyectos:', error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter]);

  const filteredProjects = projectItems;

  useEffect(() => {
    setIndex(0);
  }, [filter]);

  const groups = Math.ceil(filteredProjects.length / slidesPerView);

  function prev() {
    setIndex((i) => Math.max(0, Math.min(groups - 1, i - 1)));
  }

  function next() {
    setIndex((i) => Math.max(0, Math.min(groups - 1, i + 1)));
  }

  return (
    <section className="bg-surface py-xl" id="portfolio">
      <div className="mx-auto max-w-container-max px-md">
        <div className="mb-xl text-center">
          <h2 className="mb-xs font-headline-lg text-headline-lg text-primary">Proyectos Emblemáticos</h2>
          <p className="mx-auto max-w-2xl font-body-md text-body-md text-secondary">
            Nuestra trayectoria se mide en estructuras firmes y vidas protegidas.
          </p>
        </div>

        <div className="mb-md flex flex-wrap justify-center gap-sm">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-md py-xs font-label-caps text-label-caps transition-colors ${
                filter === item
                  ? 'bg-primary text-on-primary'
                  : 'border border-surface-variant bg-white text-secondary hover:border-primary'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mb-sm text-center font-body-sm text-body-sm text-secondary" aria-live="polite">
          {isLoading ? 'Cargando proyectos...' : ''}
        </p>

        <div className="relative">
          <button
            aria-label="Anterior"
            onClick={prev}
            disabled={groups <= 1}
            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
          >
            ‹
          </button>

          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {filteredProjects.map((project) => (
                <div key={`${project.apiCategory}-${project.title}`} className="w-full flex-shrink-0 px-2 md:w-1/3">
                  <ProjectCard {...project} />
                </div>
              ))}
              {filteredProjects.length === 0 && !isLoading && (
                <p className="w-full py-lg text-center font-body-md text-body-md text-secondary">
                  No hay proyectos disponibles para esta categoría.
                </p>
              )}
            </div>
          </div>

          <button
            aria-label="Siguiente"
            onClick={next}
            disabled={groups <= 1}
            className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md hover:bg-white"
          >
            ›
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: groups }).map((_, g) => (
              <button
                key={g}
                onClick={() => setIndex(g)}
                className={`h-3 w-3 rounded-full ${g === index ? 'bg-primary' : 'bg-gray-300'}`}
                aria-label={`Ir al grupo ${g + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}