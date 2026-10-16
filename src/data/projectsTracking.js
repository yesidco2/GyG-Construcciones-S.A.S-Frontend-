export const projectsTracking = [
  {
    code: 'GG-2026-00125',
    name: 'Viaducto Metropolitano',
    progress: 74,
    photos: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    code: 'GG-2026-00218',
    name: 'Centro Logístico Industrial',
    progress: 58,
    photos: [
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    code: 'GG-2026-00307',
    name: 'Subestación Energía Norte',
    progress: 100,
    photos: [
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

export function findTrackingProjectByCode(code) {
  const normalized = String(code || '').trim().toUpperCase();
  if (!normalized) return null;

  return projectsTracking.find((project) => project.code.toUpperCase() === normalized) || null;
}

// NOTA: Reemplazar este mock por una llamada real a backend/API de seguimiento de obra cuando exista el servicio de datos.
