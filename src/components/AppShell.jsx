import Hero from './Hero';
import TrustBar from './TrustBar';
import Services from './Services';
import Commitment from './Commitment';
import Portfolio from './Portafolio';
import About from './About';
import Contact from './Contact';
import FloatingIA from './FloatingIA';
import FloatingWhatsapp from './FloatingWhatsApp';
import FaqSection from './FaqSection';
import ServicePromotion from './ServicePromotion';

const homeFaqs = [
  {
    question: '¿Qué servicios ofrece G&G?',
    answer: 'Ofrecemos servicios de ingeniería y construcción, consultoría técnica y acompañamiento en Seguridad y Salud en el Trabajo. El alcance se define según las necesidades de cada proyecto.',
  },
  {
    question: '¿Cómo solicito una cotización?',
    answer: <>Abre el <a className="font-semibold underline" href="#cotizador">cotizador de G&amp;G</a>, describe tu proyecto y selecciona los servicios. Podrás revisar los valores disponibles y descargar el documento en PDF.</>,
  },
  {
    question: '¿Puedo consultar el avance de una obra?',
    answer: 'Sí. Si ya tienes un proyecto con nosotros, utiliza la opción «Consultar Proyecto» y los datos de acceso que te fueron proporcionados.',
  },
];

export default function AppShell() {
  return (
    <div className="portal-home text-on-background selection:bg-industrial-orange selection:text-white">
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <ServicePromotion />
        <Commitment />
        <Portfolio />
        <About />
        <FaqSection id="preguntas-frecuentes" title="Preguntas frecuentes" items={homeFaqs} />
        <Contact />
      </main>
      <FloatingIA />
      <FloatingWhatsapp />
    </div>
  );
}
