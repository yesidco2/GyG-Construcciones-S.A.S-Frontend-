const commitments = [
  {
    icon: 'gavel',
    title: 'Cumplimiento Legal y Normativo',
    description: 'Aseguramos total adherencia a las regulaciones nacionales e internacionales.',
  },
  {
    icon: 'verified_user',
    title: 'Política de Cero Accidentes',
    description: 'Metodologías predictivas para eliminar incidentes en el lugar de trabajo.',
  },
  {
    icon: 'psychology',
    title: 'Cultura de Prevención y Gestión de Riesgos',
    description: 'Fomentamos la autoconciencia y el liderazgo en seguridad a todo nivel.',
  },
];

import LeadMagnet from './LeadMagnet';

function CommitmentItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-md">
      <div className="bg-industrial-orange p-xs rounded-lg shrink-0">
        <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
      </div>
      <div>
        <h4 className="font-headline-sm text-headline-sm text-white">{title}</h4>
        <p className="font-body-sm text-body-sm text-white/70">{description}</p>
      </div>
    </div>
  );
}

export default function Commitment() {
  return (
    <section id="gestion-sst" className="bg-primary-container text-white py-xl">
      <div className="max-w-container-max mx-auto px-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
          <div>
            <h2 className="font-headline-lg text-headline-lg mb-md text-on-primary-container">Nuestro Compromiso SST</h2>
            <div className="space-y-md">
              <p className="font-body-lg text-body-lg text-on-primary-container/80">
                En G&G, la seguridad no es un requisito, es nuestro valor fundamental. Protegemos el capital más valioso de su empresa: las personas.
              </p>
              <div className="space-y-md">
                {commitments.map((commitment) => (
                  <CommitmentItem key={commitment.title} {...commitment} />
                ))}
              </div>
              <div className="mt-lg">
                <button
                  type="button"
                  className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-lg py-sm rounded-lg font-headline-sm text-headline-sm text-center hover:bg-white/20 transition-all"
                  onClick={() => {
                    const target = document.getElementById('contacto');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Ver más
                </button>
              </div>

              {/* Lead Magnet - Descargable EPP */}
              <div className="mt-xl pt-xl border-t border-white/20">
                <h3 className="font-headline-sm text-headline-sm text-on-primary-container mb-md">Recurso Gratuito</h3>
                <LeadMagnet />
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-industrial-orange/10 rounded-3xl overflow-hidden shadow-2xl relative">
              <img
                alt="SST Excellence"
                className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 transition-all duration-700"
                data-alt="A professional heavy equipment operator at a high-tech construction site wearing bright orange safety gear and a white hard hat. The scene is illuminated by the golden hour sunlight, highlighting dust particles in the air for a dramatic, industrial atmosphere. The photograph captures the precision and focus required in modern engineering, with architectural structures in the background under a clear sky. The overall style is professional, high-contrast, and emphasizes corporate reliability."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxuQFodpHP9uLwpuNt-ekzDpEJ5Tl1mmA5X_JA1KIrxa9JlUtLMWFxl53_R5ZWRHJHZG259EKh31orE2lFYvkS6NVKPkzmsu7HyvZvH3N3x3PHlBHbybuWTt_b71hhhsFdkosINXi6c3kaLIfglx98clwHwM9UJc_TXop_8eXXpdEDQ2Xm6v-rS_aHjaiNmwWsUsf4imCVIoGSA5ljQBlnNoLgvQm0qTNmIHLLwfuuZUQSyJgrN5Hn8wdefy1trZDzroZZ0UUBcxc"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-transparent to-transparent" />
              <div className="absolute bottom-md left-md right-md bg-white/10 backdrop-blur-xl p-md rounded-2xl border border-white/20">
                <div className="text-industrial-orange font-headline-xl text-headline-xl leading-none">0%</div>
                <div className="font-label-caps text-label-caps uppercase text-white tracking-widest mt-xs">Índice de Siniestralidad en Proyectos 2023</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}