import React, { useState } from 'react';

const services = [
  {
    title: 'Diseño Estructural',
    icon: 'architecture',
    variant: 'bg-white',
    border: 'industrial-border',
    textClass: 'text-primary',
    description: 'Cálculos, modelado 3D y diseño de planos estructurales bajo norma NSR-10.'
  },
  {
    title: 'Ejecución de Obras',
    icon: 'construction',
    variant: 'bg-primary',
    textClass: 'text-white',
    description: 'Construcción y dirección técnica integral de proyectos civiles y comerciales.'
  },
  {
    title: 'Interventoría',
    icon: 'visibility',
    variant: 'bg-white',
    textClass: 'text-primary',
    borderClass: 'border border-outline-variant',
    description: 'Supervisión técnica, administrativa y financiera para asegurar calidad y cumplimiento.'
  },
  {
    title: 'Estudios de Suelos',
    icon: 'layers',
    variant: 'bg-surface-container-high',
    textClass: 'text-primary',
    description: 'Exploración geotécnica y ensayos de laboratorio para cimentaciones seguras.'
  },
  {
    title: 'Remodelaciones y Refuerzos',
    icon: 'home_repair_service',
    variant: 'bg-white',
    textClass: 'text-primary',
    borderClass: 'border border-outline-variant',
    description: 'Adecuación de espacios, reforzamiento de estructuras y mantenimiento locativo.'
  },
  {
    title: 'Presupuestos y Cantidades',
    icon: 'calculate',
    variant: 'bg-white',
    border: 'industrial-border',
    textClass: 'text-primary',
    description: 'Elaboración de APUs, cómputos métricos y programación detallada de obra.'
  }
];

const sstServices = [
  {
    title: 'Implementación SG-SST',
    icon: 'fact_check',
    variant: 'bg-white',
    textClass: 'text-primary',
    borderClass: 'border border-outline-variant',
    description: 'Diseño, ejecución y evaluación del sistema según el Decreto 1072 y Res. 0312.'
  },
  {
    title: 'Auditorías de Riesgo',
    icon: 'assignment_late',
    variant: 'bg-white',
    textClass: 'text-primary',
    border: 'industrial-border',
    description: 'Identificación de peligros, valoración de riesgos e inspecciones de seguridad.'
  },
  {
    title: 'Seguridad en Alturas',
    icon: 'height',
    variant: 'bg-primary',
    textClass: 'text-white',
    description: 'Planes de protección contra caídas, inspección de equipos y certificación de puntos.'
  },
  {
    title: 'Capacitación Técnica',
    icon: 'school',
    variant: 'bg-white',
    textClass: 'text-primary',
    borderClass: 'border border-outline-variant',
    description: 'Formación especializada a trabajadores en prevención de riesgos laborales.'
  },
  {
    title: 'Planes de Emergencia',
    icon: 'emergency',
    variant: 'bg-white',
    border: 'industrial-border',
    textClass: 'text-primary',
    description: 'Elaboración de planes de evacuación, análisis de vulnerabilidad y brigadas.'
  },
  {
    title: 'Investigación de Accidentes',
    icon: 'search',
    variant: 'bg-surface-container-high',
    textClass: 'text-primary',
    description: 'Análisis de causas raíz e implementación de medidas correctivas para el personal.'
  }
];

function ServiceCard({ title, icon, variant, textClass, border, borderClass, description }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isDark = variant === 'bg-primary';

  return (
    <div 
      className="h-48 cursor-pointer [perspective:1000px] select-none"
      onClick={() => setIsFlipped((prev) => !prev)}
    >
      <div 
        className={`relative w-full h-full duration-500 ease-in-out [transform-style:preserve-3d] transition-transform ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Cara Frontal */}
        <div 
          className={`absolute inset-0 w-full h-full bento-card ${variant} p-md rounded-xl shadow-sm ${border || ''} ${borderClass || ''} flex flex-col justify-between [backface-visibility:hidden] [-webkit-backface-visibility:hidden] group`}
        >
          <span className={`material-symbols-outlined ${textClass} group-hover:scale-110 transition-transform`} style={{ fontSize: 40 }}>
            {icon}
          </span>
          <div>
            <h4 className={`font-headline-sm text-headline-sm ${textClass}`}>{title}</h4>
          </div>
        </div>

        {/* Cara Trasera */}
        <div 
          className={`absolute inset-0 w-full h-full bento-card ${
            isDark ? 'bg-primary text-white' : 'bg-white text-primary'
          } p-md rounded-xl shadow-sm ${border || ''} ${borderClass || ''} flex flex-col justify-between [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]`}
        >
          <p className="font-body-md text-body-md leading-relaxed text-xs sm:text-sm">
            {description}
          </p>
          <span className={`text-[10px] font-semibold self-end uppercase tracking-wider ${isDark ? 'text-industrial-orange' : 'text-secondary'}`}>
            Clic para volver
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section className="py-xl px-md max-w-container-max mx-auto" id="servicios">
      <div className="flex flex-col md:flex-row justify-between items-end mb-lg gap-sm">
        <div className="max-w-2xl">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-xs uppercase tracking-tighter">Servicios Integrales</h2>
          <p className="font-body-md text-body-md text-secondary">Combinamos la precisión de la ingeniería civil con la rigurosidad normativa del SG-SST.</p>
        </div>
        <div className="hidden md:block w-32 h-1 bg-industrial-orange" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <div className="col-span-full mb-xs">
            <h3 className="font-label-caps text-label-caps text-industrial-orange uppercase mb-xs tracking-widest">Bloque 01 — Ingeniería Civil</h3>
          </div>
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
        <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-sm">
          <div className="col-span-full mb-xs">
            <h3 className="font-label-caps text-label-caps text-industrial-orange uppercase mb-xs tracking-widest">Bloque 02 — SST Especializada</h3>
          </div>
          {sstServices.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}