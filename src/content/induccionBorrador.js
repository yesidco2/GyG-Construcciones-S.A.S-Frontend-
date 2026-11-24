import { riskCatalog } from './riskCatalog';

const sgSst = {
  titulo: 'Decreto 1072 de 2015 · Artículo 2.2.4.6.24',
  url: 'https://www1.funcionpublica.gov.co/documents/34645357/34703621/Decreto_1072_de_2015.pdf/ba60c71c-ebb0-d606-b91a-3d43037aecd4#page=105',
  texto: 'La gestión del riesgo da prioridad a eliminar o sustituir el peligro y a aplicar controles de ingeniería y administrativos. El equipo de protección personal complementa los controles definidos para la actividad.',
  pregunta: {
    texto: '¿Qué papel tiene el EPP dentro de los controles de riesgo?',
    opciones: ['Reemplaza los controles de ingeniería', 'Complementa las demás medidas de control', 'Se define al terminar la tarea'],
    correcta: 1,
  },
};

const alturas = {
  titulo: 'Resolución 4272 de 2021 · Artículo 15',
  url: 'https://cancilleria.gov.co/normograma/compilacion/docs/resolucion_mtra_4272_2021.htm',
  texto: 'El procedimiento de permisos de trabajo debe cumplirse antes de empezar el trabajo en alturas. Si las condiciones cambian, se aplica el procedimiento de revalidación definido para la tarea.',
  pregunta: {
    texto: '¿Cuándo se cumple el procedimiento de permiso para trabajo en alturas?',
    opciones: ['Antes de empezar el trabajo', 'Al finalizar el turno', 'Cuando se registra la foto del equipo'],
    correcta: 0,
  },
};

export function generarBorradorInduccion(actividad) {
  const ficha = riskCatalog[actividad];
  const fuentes = actividad === 'Trabajo en Alturas' ? [sgSst, alturas] : [sgSst];
  const riesgos = ficha.risks;
  const secciones = [
    {
      titulo: 'Riesgos de la actividad',
      texto: [ficha.summary, ...riesgos.map(({ label, description }) => `${label}. ${description}`)].join('\n\n'),
    },
    {
      titulo: 'Equipo de protección',
      texto: `Referencias del catálogo para esta actividad. ${ficha.epp.join(', ')}. Usa el equipo que indique la evaluación de riesgos y el procedimiento de tu obra.`,
    },
    ...fuentes.map(({ titulo, texto, url }) => ({ titulo, texto: `${texto}\n\nFuente oficial: ${url}` })),
  ];
  const preguntas = [
    {
      texto: `¿Qué situación relaciona el catálogo con «${riesgos[0].label}»?`,
      opciones: riesgos.map(({ description }) => description),
      correcta: 0,
      seccion: 0,
    },
    {
      texto: '¿Qué determina el equipo de protección a usar en la obra?',
      opciones: ['La evaluación de riesgos y el procedimiento de la obra', 'La preferencia de cada trabajador', 'El equipo disponible en cualquier otra obra'],
      correcta: 0,
      seccion: 1,
    },
    ...fuentes.map(({ pregunta }, indice) => ({
      ...pregunta, opciones: [...pregunta.opciones], seccion: indice + 2,
    })),
  ];
  return { secciones, preguntas, fuentes: fuentes.map(({ titulo, url }) => ({ titulo, url })) };
}
