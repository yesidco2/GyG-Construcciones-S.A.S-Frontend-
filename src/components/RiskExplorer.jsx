import { useState } from 'react';

import { activities, riskCatalog } from '../content/riskCatalog';

const severityStyles = {
  bajo: 'bg-green-100 text-green-800 border-green-300',
  medio: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  alto: 'bg-red-100 text-red-800 border-red-300',
};

function normalizeRiskLevel(level) {
  const normalized = String(level || '').trim().toLowerCase();
  return ['bajo', 'medio', 'alto'].includes(normalized) ? normalized : 'medio';
}

function getEppDescription(item) {
  const name = item.toLowerCase();
  if (name.includes('arnés')) return 'Debe formar parte de un sistema compatible de protección contra caídas, revisado antes de su uso.';
  if (name.includes('línea de vida')) return 'Debe ser compatible con el arnés y el anclaje definidos para la tarea.';
  if (name.includes('respir')) return 'El tipo y filtro se seleccionan según el contaminante y la evaluación del riesgo.';
  if (name.includes('guante')) return 'El material debe corresponder al riesgo mecánico, químico o eléctrico de la actividad.';
  if (name.includes('casco')) return 'El tipo y la clase se seleccionan según los peligros identificados en el área.';
  if (name.includes('bota') || name.includes('calzado')) return 'Selecciona el calzado según los riesgos de impacto, perforación, humedad o electricidad.';
  if (name.includes('gafas') || name.includes('careta')) return 'La protección debe corresponder a partículas, salpicaduras, radiación o tarea específica.';
  if (name.includes('chaleco')) return 'Usa alta visibilidad donde haya tránsito de vehículos o equipos móviles.';
  if (name.includes('auditiva')) return 'La atenuación debe seleccionarse según la medición y el nivel de exposición al ruido.';
  if (name.includes('ropa')) return 'El material y la cobertura deben corresponder a la tarea y a la exposición identificada.';
  return 'El tipo y las especificaciones deben definirse según la evaluación de riesgos de la actividad.';
}

export default function RiskExplorer() {
  const [selectedActivity, setSelectedActivity] = useState(activities[0]);
  const [expandedEpp, setExpandedEpp] = useState('');
  const currentRisk = riskCatalog[selectedActivity] || riskCatalog[activities[0]];
  const normalizedRisks = currentRisk.risks.map((risk) => ({
    ...risk,
    level: normalizeRiskLevel(risk.level),
  }));
  const highestRiskLevel = normalizedRisks.length
    ? normalizedRisks.reduce(
        (highest, risk) => (
          ['bajo', 'medio', 'alto'].indexOf(risk.level) >
          ['bajo', 'medio', 'alto'].indexOf(highest)
            ? risk.level
            : highest
        ),
        normalizedRisks[0].level,
      )
    : 'medio';
  const riskGridColumns =
    normalizedRisks.length === 1
      ? 'grid-cols-1'
      : normalizedRisks.length === 2 || normalizedRisks.length === 4
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div id="risk-explorer" className="mx-auto max-w-container-max px-4 py-xl sm:px-6 lg:px-8 2xl:px-12">
      <div className="mb-lg grid gap-md lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:items-end">
        <div>
          <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">
            Gestión de riesgos
          </p>
          <h2 className="mt-sm font-headline-xl text-headline-xl text-primary">Explorador interactivo de peligros en obra</h2>
        </div>
        <div>
          <p className="font-body-md text-body-md text-secondary">
            Consulta los peligros por labor y pulsa cada EPP para ver una recomendación breve.
          </p>
          <p className="mt-xs text-xs text-secondary">
            Contenido orientativo: no reemplaza la identificación de peligros, evaluación de riesgos ni los procedimientos aprobados para cada obra.
          </p>
        </div>
      </div>

      <div className="grid items-start gap-lg lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,2fr)]">
        <aside className="rounded-2xl border border-surface-variant bg-surface-container-lowest p-md shadow-sm lg:sticky lg:top-20">
          <h2 className="mb-md font-headline-sm text-headline-sm text-primary">Selecciona una labor</h2>
          <div className="risk-activity-list space-y-sm lg:max-h-[60vh] lg:overflow-y-auto lg:pr-1">
            {activities.map((activity) => {
              const isActive = activity === selectedActivity;

              return (
                <button
                  key={activity}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setSelectedActivity(activity);
                    setExpandedEpp('');
                  }}
                  className={`risk-activity-option flex min-h-[56px] w-full items-center rounded-xl border px-md py-sm text-left transition-all ${
                    isActive
                      ? 'risk-activity-option--active border-primary bg-primary text-on-primary shadow-md'
                      : 'border-surface-variant bg-surface text-on-surface hover:border-primary/60'
                  }`}
                >
                  <span className="font-label-caps text-label-caps uppercase">{activity}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div
          key={selectedActivity}
          className="risk-results rounded-2xl border border-surface-variant bg-surface-container-lowest p-md shadow-sm"
        >
          <div className="mb-md flex items-start justify-between gap-md border-b border-surface-variant pb-md">
            <div>
              <p className="font-label-caps text-label-caps uppercase text-secondary">Labor activa</p>
              <h2 className="font-headline-lg text-headline-lg text-primary">{selectedActivity}</h2>
            </div>
            <span className={`shrink-0 rounded-full border px-sm py-xs font-label-caps text-label-caps ${severityStyles[highestRiskLevel]}`}>
              Riesgo {highestRiskLevel}
            </span>
          </div>

          <p className="risk-summary mb-md font-body-md text-body-md text-secondary">
            {currentRisk.summary}
          </p>

          <div className={`grid auto-rows-fr gap-md ${riskGridColumns}`}>
            {normalizedRisks.map((risk) => (
              <div key={risk.label || risk.description} className="risk-result-card flex h-full flex-col rounded-xl border border-surface-variant bg-surface p-sm">
                <div className="mb-sm flex items-start justify-between gap-xs">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${severityStyles[risk.level]}`}>
                    {risk.level}
                  </span>
                </div>
                {risk.label && risk.label !== risk.description && (
                  <h3 className="mb-xs font-headline-sm text-headline-sm text-primary">{risk.label}</h3>
                )}
                <p className="font-body-sm text-body-sm text-secondary">{risk.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-lg rounded-xl bg-primary-container p-md text-on-primary">
            <h3 className="mb-sm font-headline-sm text-headline-sm">EPP mínimos sugeridos</h3>
            <ul className="grid grid-cols-1 gap-xs sm:grid-cols-2">
              {currentRisk.epp.map((item, index) => {
                const eppKey = `${selectedActivity}-${item}`;
                const isExpanded = expandedEpp === eppKey;
                const detailsId = `epp-details-${index}`;

                return (
                  <li key={item} className="risk-epp-item rounded-lg bg-white/10">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      onClick={() => setExpandedEpp(isExpanded ? '' : eppKey)}
                      className="flex min-h-[56px] w-full items-center gap-xs px-sm py-xs text-left font-body-sm text-body-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
                    >
                      <span className="material-symbols-outlined text-industrial-orange" aria-hidden="true">check_circle</span>
                      <span className="flex-1">{item}</span>
                      <span className="material-symbols-outlined text-base" aria-hidden="true">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    <p id={detailsId} hidden={!isExpanded} className="px-sm pb-sm pl-12 text-xs text-white/80">
                      {getEppDescription(item)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}