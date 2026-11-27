import portadaConstruccion from '../assets/portada-construccion.webp';
import portadaMediana from '../assets/portada-construccion-1280.webp';
import portadaPequena from '../assets/portada-construccion-640.webp';

export function PortalHero({ id, title, description, image, srcSet, sizes, alt, actions, children }) {
  return (
    <section id={id} className="portal-hero">
      <div className="portal-hero-copy">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="portal-hero-actions">
            {children}
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
        <img src={image} srcSet={srcSet} sizes={sizes} alt={alt} fetchpriority="high" />
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
      image={portadaMediana}
      srcSet={`${portadaPequena} 640w, ${portadaMediana} 1280w, ${portadaConstruccion} 1920w`}
      sizes="(min-width: 768px) 50vw, 100vw"
      alt=""
      actions={[
        { href: '#cotizador', label: 'Solicitar cotización' },
        { href: '#consultar-proyecto', label: 'Consultar mi obra' },
      ]}
    />
  );
}
