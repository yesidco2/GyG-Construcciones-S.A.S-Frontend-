import { useState } from 'react';
import { activities } from '../../content/riskCatalog';
import { generarBorradorInduccion } from '../../content/induccionBorrador';
import { boton, campo, secundario } from '../InduccionUI';

const seccionVacia = () => ({ titulo: '', texto: '' });
const preguntaVacia = () => ({ texto: '', opciones: ['', ''], correcta: 0, seccion: 0 });

export default function EditorInduccion({ catalogo, ocupado, publicar }) {
  const [actividad, setActividad] = useState(activities[0]);
  const [fuentes, setFuentes] = useState([]);
  const [revisado, setRevisado] = useState(false);
  const [material, setMaterial] = useState('');
  const [titulo, setTitulo] = useState('');
  const [secciones, setSecciones] = useState([seccionVacia()]);
  const [preguntas, setPreguntas] = useState([preguntaVacia()]);
  const editables = [...new Map(catalogo.filter((m) => !m.ejemplo).map((m) => [m.id, m])).values()];

  function generar() {
    if (secciones.some((s) => s.titulo || s.texto) && !window.confirm('¿Reemplazar el borrador actual?')) return;
    const borrador = generarBorradorInduccion(actividad);
    if (!material) setTitulo(actividad);
    setSecciones(borrador.secciones);
    setPreguntas(borrador.preguntas);
    setFuentes(borrador.fuentes);
    setRevisado(false);
  }

  function modificarSeccion(i, cambio) {
    setSecciones((actual) => actual.map((s, n) => n === i ? { ...s, ...cambio } : s));
  }

  function modificarPregunta(i, cambio) {
    setPreguntas((actual) => actual.map((p, n) => n === i ? { ...p, ...cambio } : p));
  }

  return <details className="sst-editor">
    <summary>
      <span className="flex items-center gap-2"><span className="material-symbols-outlined text-industrial-orange" aria-hidden="true">edit_note</span>Preparar material y cuestionario</span>
      <span className="sst-chevron material-symbols-outlined" aria-hidden="true">expand_more</span>
    </summary>
    <form className="sst-editor-body space-y-5" onSubmit={(e) => {
      e.preventDefault();
      if (fuentes.length > 0 && !revisado) return;
      publicar({ material: material || null, titulo, contenido: { secciones, preguntas } });
    }}>
      <div className="sst-generator space-y-3">
        <label className="block text-sm font-semibold">Actividad del catálogo de riesgos
          <select className={campo} value={actividad} onChange={(e) => setActividad(e.target.value)}>
            {activities.map((nombre) => <option key={nombre}>{nombre}</option>)}
          </select>
        </label>
        <button className={boton} type="button" disabled={ocupado} onClick={generar}>
          Generar borrador
        </button>
        {fuentes.length > 0 && <div className="sst-reveal space-y-2 border-t border-sky-200 pt-3">
          <p>Borrador basado en el catálogo del portal y documentación oficial. Ajusta el contenido a las condiciones de la obra antes de publicarlo.</p>
          <ul className="list-disc pl-5">{fuentes.map(({ titulo, url }) => (
            <li key={url}><a href={url} target="_blank" rel="noreferrer" className="underline">{titulo}</a></li>
          ))}</ul>
        </div>}
      </div>
      <label className="block text-sm font-semibold">Material
        <select className={campo} value={material} onChange={(e) => {
          setMaterial(e.target.value);
          setTitulo(editables.find((m) => m.id === e.target.value)?.titulo || '');
        }}>
          <option value="">Nuevo material para esta obra</option>
          {editables.map((m) => <option key={m.id} value={m.id}>Nueva versión de {m.titulo}</option>)}
        </select>
      </label>
      <label className="block text-sm font-semibold">Título<input className={campo} required maxLength={150} readOnly={Boolean(material)}
        value={titulo} onChange={(e) => setTitulo(e.target.value)} /></label>
      {secciones.map((s, i) => <fieldset key={i} className="sst-edit-block space-y-3">
        <legend>Sección {i + 1}</legend>
        <label className="block text-sm font-semibold">Título de la sección<input className={campo} required maxLength={150}
          value={s.titulo} onChange={(e) => modificarSeccion(i, { titulo: e.target.value })} /></label>
        <label className="block text-sm font-semibold">Texto<textarea className={campo} required maxLength={1500} rows={3}
          value={s.texto} onChange={(e) => modificarSeccion(i, { texto: e.target.value })} /></label>
      </fieldset>)}
      <button className={secundario} type="button" disabled={secciones.length >= 12}
        onClick={() => setSecciones([...secciones, seccionVacia()])}>Añadir sección</button>
      {preguntas.map((p, i) => <fieldset key={i} className="sst-edit-block space-y-3">
        <legend>Pregunta {i + 1}</legend>
        <label className="block text-sm font-semibold">Enunciado<input className={campo} required maxLength={300}
          value={p.texto} onChange={(e) => modificarPregunta(i, { texto: e.target.value })} /></label>
        {p.opciones.map((o, j) => <label key={j} className="block text-sm font-semibold">Opción {j + 1}
          <input className={campo} required maxLength={200} value={o} onChange={(e) => {
            const opciones = p.opciones.map((actual, indice) => indice === j ? e.target.value : actual);
            modificarPregunta(i, { opciones });
          }} />
        </label>)}
        <button className={secundario} type="button" disabled={p.opciones.length >= 6}
          onClick={() => modificarPregunta(i, { opciones: [...p.opciones, ''] })}>Añadir opción</button>
        <label className="block text-sm font-semibold">Opción correcta<select className={campo} value={p.correcta}
          onChange={(e) => modificarPregunta(i, { correcta: Number(e.target.value) })}>
          {p.opciones.map((_, j) => <option key={j} value={j}>Opción {j + 1}</option>)}
        </select></label>
        <label className="block text-sm font-semibold">Sección para repasar<select className={campo} value={p.seccion}
          onChange={(e) => modificarPregunta(i, { seccion: Number(e.target.value) })}>
          {secciones.map((s, j) => <option key={j} value={j}>{s.titulo.trim() || 'Sección ' + (j + 1)}</option>)}
        </select></label>
      </fieldset>)}
      {fuentes.length > 0 && <label className="flex items-start gap-2">
        <input type="checkbox" checked={revisado} onChange={(e) => setRevisado(e.target.checked)} />
        Confirmo que revisé el material y el cuestionario para esta obra.
      </label>}
      <div className="flex flex-wrap gap-2">
        <button className={secundario} type="button" disabled={preguntas.length >= 20}
          onClick={() => setPreguntas([...preguntas, preguntaVacia()])}>Añadir pregunta</button>
        <button className={boton} disabled={ocupado || (fuentes.length > 0 && !revisado)}>Publicar versión</button>
      </div>
    </form>
  </details>;
}
