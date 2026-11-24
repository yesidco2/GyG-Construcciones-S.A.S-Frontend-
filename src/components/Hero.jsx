export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-[90vh] items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="G&G Hero"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYo3ctFUQAlUhgg7YJpNEy66IXvIGfWcCNIGBMO22dZ-QJ8HR2bCfU_SfEI3i64rGFwtlW39OCJUDk8E6Ucja5kvryaO7eb_YB6sp-YqRILE0Q7heeAhGW_xh82XGGGUDdGwS2vVGFqouJl4xrSWYeQyR_cVuaJ_jTUih0bruzEctWUI8-HrQKuxazWsoIRaB4RWbmWPvSzCcCBWnCMwMd7-jdQbY7ZltcRFreazsbNI-y5cXcO_em4LbC4IZEEVZT6hC9oTlzFpk"
        />
        <div className="absolute inset-0 gradient-overlay" />
      </div>
      <div className="relative z-10 mx-auto grid w-full max-w-container-max grid-cols-1 items-center gap-lg px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-xl lg:px-8 2xl:px-12">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-xs bg-industrial-orange/10 border border-industrial-orange/30 px-sm py-xs rounded-full mb-md">
            <span className="w-2 h-2 rounded-full bg-industrial-orange animate-pulse" />
            <span className="text-industrial-orange font-label-caps text-label-caps uppercase tracking-widest">
              Líderes en Seguridad &amp; Construcción
            </span>
          </div>
          <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl text-white mb-md leading-tight">
            Construimos infraestructura sólida bajo los más altos estándares de seguridad
          </h1>
          <p className="font-body-lg text-body-lg text-white/80 mb-lg max-w-2xl">
            Solidez técnica, rigurosidad y compromiso innegociable con la prevención de riesgos y el cumplimiento legal.
          </p>
        </div>
        <aside className="rounded-2xl border border-white/15 bg-white/5 p-md backdrop-blur-md sm:p-lg lg:col-span-5">
          <p className="mb-md font-body-sm text-body-sm text-white/70">
            Selecciona tu perfil para continuar:
          </p>
          <div className="grid gap-sm">
            <a className="flex items-center justify-between gap-sm rounded-lg bg-on-tertiary-container px-md py-md font-headline-sm text-headline-sm font-semibold text-primary transition-all hover:bg-on-tertiary-container/90" href="#contacto">
              <span>¿Eres nuevo? Solicitar cotización</span>
              <span className="material-symbols-outlined shrink-0" aria-hidden="true">arrow_forward</span>
            </a>
            <a className="flex items-center justify-between gap-sm rounded-lg border-2 border-white/30 px-md py-md font-headline-sm text-headline-sm text-white transition-all hover:bg-white/10" href="#consultar-proyecto">
              <span>¿Ya eres cliente? Consulta tu obra</span>
              <span className="material-symbols-outlined shrink-0" aria-hidden="true">arrow_forward</span>
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}