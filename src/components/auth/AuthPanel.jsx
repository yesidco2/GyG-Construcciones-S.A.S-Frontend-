export default function AuthPanel({ title, icon, children }) {
  return (
    <section className="mx-auto w-full max-w-[28rem] overflow-hidden rounded-2xl border border-surface-variant bg-white shadow-md">
      <header className="border-b-[3px] border-industrial-orange bg-primary px-5 py-5 text-white sm:px-7">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="material-symbols-outlined shrink-0 rounded-lg bg-white/10 p-2 text-white">
            {icon}
          </span>
          <h1 className="min-w-0 font-headline-md text-headline-sm sm:text-headline-md">{title}</h1>
        </div>
      </header>
      <div className="p-5 sm:px-7 sm:py-6">{children}</div>
    </section>
  );
}
