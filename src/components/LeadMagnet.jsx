import { useState } from 'react';

export default function LeadMagnet() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      return;
    }

    // NOTA: Aquí conectar con servicio real de Email (MailerLite, Convertkit, etc.)
    // Ejemplo para MailerLite:
    // await fetch('https://api.mailerlite.com/api/v1/subscribers', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json', 'X-MailerLite-ApiDomain': 'api.mailerlite.com' },
    //   body: JSON.stringify({
    //     email: email,
    //     fields: { name: 'EPP Lead' },
    //     groups: ['grupo_id_aqui'],
    //   }),
    // });

    // Por ahora, guardar localmente y mostrar confirmación
    const magnet = {
      email,
      downloadedAt: new Date().toISOString(),
      resource: 'Checklist EPP',
    };

    const existing = JSON.parse(localStorage.getItem('gg-lead-magnets') || '[]');
    existing.push(magnet);
    localStorage.setItem('gg-lead-magnets', JSON.stringify(existing));

    setSubmitted(true);
    setEmail('');

    // Reset form después de 4s
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border-2 border-industrial-orange/30 bg-gradient-to-br from-primary/5 to-industrial-orange/5 p-lg">
      <div className="mb-md flex items-center gap-sm">
        <span className="material-symbols-outlined text-industrial-orange text-2xl">download</span>
        <h3 className="font-headline-md text-headline-md text-primary">Descarga tu Checklist EPP</h3>
      </div>

      <p className="mb-lg font-body-sm text-body-sm text-on-surface/70">
        Obtén la guía definitiva de Equipos de Protección Personal mínimos según el tipo de obra.
      </p>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-sm">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu.email@empresa.com"
            className="w-full rounded-lg border-2 border-outline-variant bg-white p-sm font-body-sm text-body-sm placeholder-secondary focus:border-industrial-orange focus:ring-0"
            required
          />
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-sm rounded-lg bg-industrial-orange py-sm font-headline-sm text-headline-sm text-white transition-colors hover:bg-industrial-orange/90"
          >
            <span>Descargar ahora</span>
            <span className="material-symbols-outlined">download</span>
          </button>
        </form>
      ) : (
        <div className="rounded-lg bg-green-500/10 p-md text-center">
          <p className="mb-sm font-body-sm text-body-sm text-green-700 font-semibold">
            ¡Descarga exitosa!
          </p>
          <p className="font-body-sm text-body-sm text-green-700/70">
            Revisa tu correo para acceder al checklist de EPP.
          </p>
        </div>
      )}

      <p className="mt-sm text-center font-label-caps text-label-caps text-secondary/50 uppercase">
        Garantizado seguro — Sin spam
      </p>
    </div>
  );
}