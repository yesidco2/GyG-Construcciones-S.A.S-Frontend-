import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api';

const riskCatalog = {
  'Trabajo en Alturas': {
    summary:
      'Se requiere control estricto de accesos, líneas de vida y coordinación de trabajos en altura.',
    risks: [
      { label: 'Caída al mismo nivel', level: 'alto', description: 'Pérdida de estabilidad en andamios o escaleras.' },
      { label: 'Caída a desnivel', level: 'alto', description: 'Mala fijación de sistemas de protección personal.' },
      { label: 'Golpes por herramientas', level: 'medio', description: 'Objetos o herramientas que se desploman.' },
    ],
    epp: ['Casco de seguridad', 'Arnés de seguridad', 'Línea de vida', 'Botas de seguridad'],
  },
  'Riesgo Eléctrico': {
    summary:
      'Debe existir un control riguroso de instalaciones energizadas, cortes y procedimientos de trabajo seguro.',
    risks: [
      { label: 'Contacto directo con tensión', level: 'alto', description: 'Instalaciones energizadas sin aislamiento.' },
      { label: 'Arco eléctrico', level: 'alto', description: 'Fallas en equipos o cableado defectuoso.' },
      { label: 'Choque por descarga estática', level: 'medio', description: 'Acumulación eléctrica durante actividades de montaje.' },
    ],
    epp: ['Guantes dieléctricos', 'Casco dieléctrico', 'Calzado aislante', 'Careta de protección'],
  },
  Excavaciones: {
    summary:
      'La estabilidad del terreno y la protección de taludes son factores críticos para prevenir colapsos.',
    risks: [
      { label: 'Desprendimiento de taludes', level: 'alto', description: 'Falta de entibado o taludes inestables.' },
      { label: 'Aplastamiento por maquinaria', level: 'alto', description: 'Vehículos y equipos sin señalización.' },
      { label: 'Fugas de servicios públicos', level: 'medio', description: 'Falta de localización previa de redes.' },
    ],
    epp: ['Casco', 'Botas de seguridad', 'Chaleco reflectivo', 'Guantes de mano'],
  },
  'Izaje de Cargas': {
    summary:
      'Es imprescindible verificar cargas, rutas de tránsito y la resistencia de los equipos de izaje.',
    risks: [
      { label: 'Aplastamiento por carga', level: 'alto', description: 'Mala señalización o sobrecarga del equipo.' },
      { label: 'Colisión con personal', level: 'alto', description: 'Zona de trabajo sin delimitación.' },
      { label: 'Falla mecánica', level: 'medio', description: 'Inspección insuficiente del equipo.' },
    ],
    epp: ['Casco', 'Guantes de trabajo', 'Botas de seguridad', 'Chaleco reflectivo'],
  },
  'Espacios Confinados': {
    summary:
      'La ventilación, la vigilancia y la autorización previa son condiciones esenciales para operar sin riesgo.',
    risks: [
      { label: 'Falta de oxígeno', level: 'alto', description: 'Ambientes con deficiencia de ventilación.' },
      { label: 'Exposición a gases tóxicos', level: 'alto', description: 'Acumulación de vapores o gases peligrosos.' },
      { label: 'Desmayo o inconsciencia', level: 'alto', description: 'Condiciones atmosféricas no controladas.' },
    ],
    epp: ['Casco', 'Guantes resistentes', 'Respirador o línea de vida', 'Botas de seguridad'],
  },
};

const activities = Object.keys(riskCatalog);
const fallbackActivities = activities.map((nombre) => ({ id: null, nombre }));

const severityStyles = {
  bajo: 'bg-green-100 text-green-800 border-green-300',
  medio: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  alto: 'bg-red-100 text-red-800 border-red-300',
};

export default function RiskExplorer() {
  const [activityItems, setActivityItems] = useState(fallbackActivities);
  const [selectedActivity, setSelectedActivity] = useState(activities[0]);
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [apiRisk, setApiRisk] = useState(null);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);

  useEffect(() => {
    let active = true;

    apiFetch('/api/riesgos/labores')
      .then((data) => {
        if (!active || !Array.isArray(data) || data.length === 0) return;
        setActivityItems(data);
        setSelectedActivity(data[0].nombre);
        setSelectedActivityId(data[0].id);
      })
      .catch((error) => {
        console.error('No se pudieron cargar las labores de riesgo:', error);
      })
      .finally(() => {
        if (active) setIsLoadingActivities(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selectedActivityId === null || selectedActivityId === undefined) return undefined;

    let active = true;
    setApiRisk(null);
    setIsLoadingRisk(true);

    apiFetch(`/api/riesgos/${encodeURIComponent(selectedActivityId)}`)
      .then((data) => {
        if (!active) return;
        setApiRisk({
          summary: `Riesgos asociados a ${data.nombre}.`,
          risks: (data.riesgos || []).map((risk) => ({
            label: risk.descripcion,
            level: String(risk.nivelSeveridad || 'MEDIO').toLowerCase(),
            description: risk.descripcion,
          })),
          epp: (data.epps || []).map((item) => item.nombre),
        });
      })
      .catch((error) => {
        console.error(`No se pudieron cargar los riesgos de ${selectedActivity}:`, error);
      })
      .finally(() => {
        if (active) setIsLoadingRisk(false);
      });

    return () => {
      active = false;
    };
  }, [selectedActivityId, selectedActivity]);

  const currentRisk = useMemo(
    () => apiRisk || riskCatalog[selectedActivity] || riskCatalog[activities[0]],
    [apiRisk, selectedActivity],
  );

  return (
    <div id="risk-explorer" className="mx-auto max-w-6xl px-md py-xl">
      <div className="mb-lg text-center">
        <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">
          Gestión de riesgos
        </p>
        <h1 className="mt-sm font-headline-xl text-headline-xl text-primary">Explorador interactivo de peligros en obra</h1>
        <p className="mx-auto mt-sm max-w-3xl font-body-md text-body-md text-secondary">
          Consulte los riesgos asociados a cada actividad y los EPP mínimos recomendados para prevenir incidentes.
        </p>
      </div>

      <div className="grid gap-lg lg:grid-cols-[0.9fr_1.6fr]">
        <aside className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-md shadow-sm">
          <h2 className="mb-md font-headline-sm text-headline-sm text-primary">Selecciona una labor</h2>
          <div className="space-y-sm">
            {activityItems.map((activity) => {
              const isActive = activity.nombre === selectedActivity;

              return (
                <button
                  key={activity.id ?? activity.nombre}
                  type="button"
                  onClick={() => {
                    setSelectedActivity(activity.nombre);
                    setSelectedActivityId(activity.id ?? null);
                    setApiRisk(null);
                  }}
                  className={`w-full rounded-xl border px-md py-sm text-left transition-all ${
                    isActive
                      ? 'border-primary bg-primary text-on-primary shadow-md'
                      : 'border-surface-variant bg-surface text-on-surface hover:border-primary/60'
                  }`}
                >
                  <span className="font-label-caps text-label-caps uppercase">{activity.nombre}</span>
                </button>
              );
            })}
          </div>
          {isLoadingActivities && (
            <p className="mt-sm font-body-sm text-body-sm text-secondary" aria-live="polite">
              Cargando labores...
            </p>
          )}
        </aside>

        <div className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-md shadow-sm">
          <div className="mb-md flex items-start justify-between gap-md border-b border-surface-variant pb-md">
            <div>
              <p className="font-label-caps text-label-caps uppercase text-secondary">Labor activa</p>
              <h2 className="font-headline-lg text-headline-lg text-primary">{selectedActivity}</h2>
            </div>
            <span className="rounded-full bg-industrial-orange/10 px-sm py-xs font-label-caps text-label-caps text-industrial-orange">
              Riesgo crítico
            </span>
          </div>

          <p className="mb-md font-body-md text-body-md text-secondary">
            {isLoadingRisk ? 'Cargando información de riesgos...' : currentRisk.summary}
          </p>

          <div className="grid gap-md md:grid-cols-3">
            {currentRisk.risks.map((risk) => (
              <div key={risk.label} className="rounded-xl border border-surface-variant bg-surface p-sm">
                <div className="mb-sm flex items-center justify-between gap-xs">
                  <h3 className="font-headline-sm text-headline-sm text-primary">{risk.label}</h3>
                  <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${severityStyles[risk.level]}`}>
                    {risk.level}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-secondary">{risk.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-lg rounded-xl bg-primary-container p-md text-on-primary">
            <h3 className="mb-sm font-headline-sm text-headline-sm">EPP mínimos sugeridos</h3>
            <ul className="grid gap-xs md:grid-cols-2">
              {currentRisk.epp.map((item) => (
                <li key={item} className="flex items-center gap-xs font-body-sm text-body-sm">
                  <span className="material-symbols-outlined text-industrial-orange">check_circle</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}