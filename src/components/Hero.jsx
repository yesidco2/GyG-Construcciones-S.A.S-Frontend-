import portadaConstruccion from '../assets/portada-construccion.webp';

export function PortalHero({ id, title, description, image, alt, actions }) {
  return (
    <section id={id} className="portal-hero">
      <div className="portal-hero-copy">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="portal-hero-actions">
            {actions.map(({ href, label }) => (
              <a key={href} href={href}>
                {label}
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="portal-hero-image">
        <img src={image} alt={alt} fetchPriority="high" />
      </div>
    </section>
  );
}

export default function Hero() {
  return (
    <PortalHero
      id="hero"
      title="Ingeniería para construir con seguridad"
      description="Ingeniería civil, construcción y gestión SST para acompañar tu proyecto desde la planeación hasta la obra."
      image={portadaConstruccion}
      alt=""
      actions={[
        { href: '#contacto', label: 'Solicitar cotización' },
        { href: '#consultar-proyecto', label: 'Consultar mi obra' },
      ]}
    />
  );
}
