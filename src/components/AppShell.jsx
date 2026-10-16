import Hero from './Hero';
import TrustBar from './TrustBar';
import Services from './Services';
import Commitment from './Commitment';
import Portfolio from './Portafolio';
import About from './About';
import Contact from './Contact';
import FloatingIA from './FloatingIA';
import FloatingWhatsapp from './FloatingWhatsapp';

export default function AppShell() {
  return (
    <div className="bg-background text-on-background selection:bg-industrial-orange selection:text-white">
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <Commitment />
        <Portfolio />
        <About /  >
        <Contact />
      </main>
      <FloatingIA />
      <FloatingWhatsapp />
    </div>
  );
}