import { useState } from 'react';

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
  Demolición: {
    summary: 'Delimitar el área, confirmar redes y estabilidad estructural, y ejecutar la actividad según un plan aprobado.',
    risks: [
      { label: 'Caída de materiales', level: 'alto', description: 'Elementos desprendidos pueden golpear a trabajadores o personas cercanas.' },
      { label: 'Colapso no controlado', level: 'alto', description: 'Una secuencia inadecuada puede comprometer elementos que permanecen en pie.' },
      { label: 'Polvo y partículas', level: 'medio', description: 'La generación de polvo puede afectar ojos y vías respiratorias.' },
    ],
    epp: ['Casco con barbuquejo', 'Gafas de seguridad', 'Protección respiratoria adecuada', 'Guantes y botas de seguridad'],
  },
  'Soldadura y corte': {
    summary: 'Realizar trabajos en caliente con autorización, control de fuentes de ignición y vigilancia del área.',
    risks: [
      { label: 'Quemaduras e incendio', level: 'alto', description: 'Chispas y superficies calientes pueden causar lesiones o iniciar un incendio.' },
      { label: 'Radiación del arco', level: 'alto', description: 'La exposición sin protección puede lesionar ojos y piel.' },
      { label: 'Humos de soldadura', level: 'medio', description: 'Los humos requieren ventilación y controles según el material y el proceso.' },
    ],
    epp: ['Careta para soldar', 'Guantes de carnaza', 'Ropa de protección', 'Protección respiratoria según evaluación'],
  },
  'Operación de maquinaria': {
    summary: 'Usar equipos autorizados e inspeccionados, con operadores competentes y área de maniobra controlada.',
    risks: [
      { label: 'Atropellamiento o atrapamiento', level: 'alto', description: 'La interacción entre personas y equipos móviles puede provocar lesiones graves.' },
      { label: 'Vuelco o pérdida de estabilidad', level: 'alto', description: 'Las condiciones del terreno o la operación pueden desestabilizar el equipo.' },
      { label: 'Falla del equipo', level: 'medio', description: 'Defectos o falta de mantenimiento pueden causar incidentes durante la operación.' },
    ],
    epp: ['Casco', 'Chaleco de alta visibilidad', 'Botas de seguridad', 'Protección auditiva según exposición'],
  },
  'Tránsito de vehículos': {
    summary: 'Planear rutas, separar peatones y vehículos, y mantener señalización visible y control de accesos.',
    risks: [
      { label: 'Colisión o atropellamiento', level: 'alto', description: 'Puntos ciegos, maniobras y circulación mixta elevan el riesgo de impacto.' },
      { label: 'Choque con estructuras', level: 'medio', description: 'Espacios reducidos o rutas no coordinadas pueden causar colisiones.' },
      { label: 'Exposición a polvo y ruido', level: 'medio', description: 'El tránsito continuo puede generar ruido y material particulado.' },
    ],
    epp: ['Chaleco de alta visibilidad', 'Casco en zona de obra', 'Botas de seguridad', 'Protección auditiva según evaluación'],
  },
  'Manejo de sustancias químicas': {
    summary: 'Identificar los productos, consultar sus hojas de seguridad y aplicar controles de almacenamiento y uso.',
    risks: [
      { label: 'Contacto con sustancias', level: 'alto', description: 'Salpicaduras o contacto pueden irritar o lesionar piel y ojos.' },
      { label: 'Inhalación de vapores', level: 'alto', description: 'Algunos productos requieren ventilación y controles específicos.' },
      { label: 'Derrames o incompatibilidad', level: 'medio', description: 'Un almacenamiento inadecuado puede generar exposición o reacciones no deseadas.' },
    ],
    epp: ['Gafas según el producto', 'Guantes compatibles con la sustancia', 'Ropa de protección', 'Respirador según hoja de seguridad'],
  },
  'Manipulación manual de cargas': {
    summary: 'Evaluar peso, dimensiones y recorrido; usar ayudas mecánicas y coordinar el movimiento cuando sea necesario.',
    risks: [
      { label: 'Sobreesfuerzo', level: 'medio', description: 'La carga o postura inadecuada puede producir lesiones musculoesqueléticas.' },
      { label: 'Golpes y atrapamientos', level: 'medio', description: 'La carga puede desplazarse o atrapar manos y pies durante el traslado.' },
      { label: 'Caídas al transportar', level: 'medio', description: 'La carga puede limitar la visión o dificultar el equilibrio.' },
    ],
    epp: ['Guantes adecuados a la carga', 'Botas con protección', 'Chaleco de alta visibilidad cuando aplique'],
  },
  'Encofrado y desencofrado': {
    summary: 'Verificar diseño, estabilidad, secuencia de montaje y condiciones antes de cargar o retirar los elementos.',
    risks: [
      { label: 'Colapso del encofrado', level: 'alto', description: 'Un montaje deficiente o carga no prevista puede ocasionar fallas estructurales temporales.' },
      { label: 'Caídas a distinto nivel', level: 'alto', description: 'El trabajo en bordes y plataformas requiere protección contra caídas.' },
      { label: 'Golpes por elementos', level: 'medio', description: 'Tableros, puntales o herramientas pueden caer durante el montaje.' },
    ],
    epp: ['Casco', 'Guantes de trabajo', 'Botas de seguridad', 'Protección contra caídas según evaluación'],
  },
  'Vaciado de concreto': {
    summary: 'Coordinar el suministro y bombeo, mantener comunicación y controlar el acceso al área de vaciado.',
    risks: [
      { label: 'Contacto con concreto húmedo', level: 'medio', description: 'El contacto prolongado puede irritar o quemar la piel.' },
      { label: 'Golpe por mangueras o equipos', level: 'alto', description: 'La presión y el movimiento de los equipos requieren control y coordinación.' },
      { label: 'Caídas y resbalones', level: 'medio', description: 'Derrames y superficies húmedas pueden generar pérdida de estabilidad.' },
    ],
    epp: ['Gafas de seguridad', 'Guantes impermeables compatibles', 'Botas impermeables', 'Casco'],
  },
  'Instalaciones eléctricas': {
    summary: 'Planear el trabajo, identificar fuentes de energía y aplicar procedimientos de aislamiento y verificación.',
    risks: [
      { label: 'Contacto eléctrico', level: 'alto', description: 'La energía presente puede causar descarga, quemaduras o lesiones graves.' },
      { label: 'Arco eléctrico', level: 'alto', description: 'Una falla puede liberar calor, presión y partículas peligrosas.' },
      { label: 'Caídas durante la instalación', level: 'medio', description: 'El uso de escaleras y plataformas exige estabilidad y acceso seguro.' },
    ],
    epp: ['EPP dieléctrico definido por persona competente', 'Gafas o careta según evaluación', 'Casco adecuado', 'Calzado de seguridad'],
  },
  'Pintura y recubrimientos': {
    summary: 'Revisar la hoja de seguridad, controlar ventilación y fuentes de ignición, y evitar exposición innecesaria.',
    risks: [
      { label: 'Inhalación de vapores', level: 'alto', description: 'La exposición depende del producto, método de aplicación y ventilación.' },
      { label: 'Contacto con piel y ojos', level: 'medio', description: 'Las salpicaduras pueden causar irritación u otras afectaciones.' },
      { label: 'Incendio', level: 'alto', description: 'Algunos productos y vapores pueden ser inflamables.' },
    ],
    epp: ['Gafas de seguridad', 'Guantes compatibles con el producto', 'Ropa de protección', 'Respirador según hoja de seguridad'],
  },
};

const activities = Object.keys(riskCatalog);

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