export default function Hero() {
  return (
    <section id="hero" className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="G&G Hero"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYo3ctFUQAlUhgg7YJpNEy66IXvIGfWcCNIGBMO22dZ-QJ8HR2bCfU_SfEI3i64rGFwtlW39OCJUDk8E6Ucja5kvryaO7eb_YB6sp-YqRILE0Q7heeAhGW_xh82XGGGUDdGwS2vVGFqouJl4xrSWYeQyR_cVuaJ_jTUih0bruzEctWUI8-HrQKuxazWsoIRaB4RWbmWPvSzCcCBWnCMwMd7-jdQbY7ZltcRFreazsbNI-y5cXcO_em4LbC4IZEEVZT6hC9oTlzFpk"
        />
        <div className="absolute inset-0 gradient-overlay" />
      </div>
      <div className="relative z-10 max-w-container-max mx-auto px-md py-xl">
        {/* Bloque de segmentación: Cliente vs Prospecto */}
        <div className="mb-xl bg-primary/75 backdrop-blur-md border border-white/20 rounded-lg p-md max-w-2xl shadow-lg">
          <p className="text-white font-body-sm text-body-sm mb-sm">Selecciona tu perfil para una mejor experiencia:</p>
          <div className="flex flex-col sm:flex-row gap-sm">
            <a className="flex-1 bg-on-tertiary-container text-white px-md py-sm rounded-lg font-headline-sm text-headline-sm text-center hover:bg-tertiary-container transition-all font-semibold" href="#servicios">
              ¿Eres nuevo? Conoce nuestros servicios
            </a>
            <a className="flex-1 bg-primary/35 border-2 border-white/40 text-white px-md py-sm rounded-lg font-headline-sm text-headline-sm text-center hover:bg-primary/55 transition-all" href="#consultar-proyecto">
              ¿Ya eres cliente? Consulta tu obra
            </a>
          </div>
        </div>

        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-xs bg-primary/75 border border-white/25 px-sm py-xs rounded-full mb-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-industrial-orange animate-pulse" />
            <span className="text-white font-label-caps text-label-caps uppercase tracking-widest">
              Líderes en Seguridad &amp; Construcción
            </span>
          </div>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-white mb-md leading-tight">
            Construimos infraestructura sólida bajo los más altos estándares de seguridad
          </h1>
          <p className="font-body-lg text-body-lg text-white/80 mb-lg max-w-2xl">
            Solidez técnica, rigurosidad y compromiso innegociable con la prevención de riesgos y el cumplimiento legal.
          </p>
          <div className="flex flex-col sm:flex-row gap-sm">
            <a className="bg-industrial-orange text-white px-lg py-sm rounded-lg font-headline-sm text-headline-sm text-center hover:bg-industrial-orange/90 transition-all flex items-center justify-center gap-xs" href="#contacto">
              Solicitar Cotización
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
            <a className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-lg py-sm rounded-lg font-headline-sm text-headline-sm text-center hover:bg-white/20 transition-all" href="#servicios">
              Conocer Servicios
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}