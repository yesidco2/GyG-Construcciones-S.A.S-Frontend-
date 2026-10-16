import Services from '../components/Services';

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <section className="py-xl px-md max-w-container-max mx-auto">
        <div className="mb-lg">
          <h1 className="font-headline-xl text-headline-xl text-primary mb-sm">Servicios</h1>
          <p className="font-body-md text-body-md text-secondary">Conozca nuestros servicios integrales en ingeniería civil y seguridad laboral.</p>
        </div>
      </section>
      <Services />
    </div>
  );
}