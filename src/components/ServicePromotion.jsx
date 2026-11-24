export default function ServicePromotion({ compact = false }) {
  return (
    <aside
      aria-label="Anuncio de servicios de G&G"
      className={`mx-auto max-w-container-max px-margin-mobile md:px-md ${compact ? 'py-lg' : 'py-xl'}`}
    >
      <div className="flex flex-col items-start justify-between gap-md rounded-2xl bg-primary p-lg text-on-primary shadow-ambient md:flex-row md:items-center md:p-xl">
        <div className="max-w-2xl">
          <h2 className="mt-xs font-headline-md text-headline-md text-white">
            Prepara tu proyecto para trabajar con seguridad
          </h2>
          <p className="mt-xs text-sm text-white/80">
            Conoce nuestras soluciones de ingeniería, consultoría y acompañamiento en gestión SST.
          </p>
        </div>
        <a
          href="#contacto"
          className="shrink-0 rounded-lg bg-industrial-orange px-lg py-sm text-center font-label-caps text-label-caps text-white transition-colors hover:bg-industrial-orange/90"
        >
          Solicitar información
        </a>
      </div>
    </aside>
  );
}
