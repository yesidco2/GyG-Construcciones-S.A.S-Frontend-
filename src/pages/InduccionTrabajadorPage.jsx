import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { boton, campo, estados, Foto, json, secundario, tarjeta } from '../components/InduccionUI';

export default function InduccionTrabajadorPage({ asignacion }) {
  const base = '/api/inducciones/' + asignacion;
  const [busqueda, setBusqueda] = useState({ buscar: '', pagina: 0 });
  const [lista, setLista] = useState({ personas: [], total: 0 });
  const [persona, setPersona] = useState(null);
  const [pin, setPin] = useState('');
  const [token, setToken] = useState('');
  const [entrega, setEntrega] = useState(null);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [cerrada, setCerrada] = useState(false);
  const [foto, setFoto] = useState(null);
  const [enviada, setEnviada] = useState(null);

  useEffect(() => {
    if (token || cerrada) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      apiFetch(base + '/nombres?' + new URLSearchParams(busqueda), { signal: controller.signal })
        .then(setLista)
        .catch((e) => {
          if (controller.signal.aborted) return;
          setError(e.message);
          if (e.status === 404) setCerrada(true);
        });
    }, 180);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [base, busqueda, token, cerrada]);

  useEffect(() => {
    if (!token) return undefined;
    const controller = new AbortController();
    const consultar = () => apiFetch(base + '/entrega', {
      headers: { 'X-Induccion-Token': token }, signal: controller.signal,
    }).then(setEntrega).catch((e) => {
      if (controller.signal.aborted) return;
      setError(e.status === 403 ? 'Tu acceso temporal venció. Ingresa tu PIN de nuevo.' : e.message);
      if (e.status === 404) setCerrada(true);
      if ([403, 404].includes(e.status)) {
        setToken('');
        setEntrega(null);
        setEnviada(null);
        setFoto(null);
      }
    });
    const timer = window.setInterval(consultar, 12000);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, [base, token]);

  async function ejecutar(fn) {
    if (ocupado) return;
    setOcupado(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(e.status === 403 ? 'Tu acceso temporal venció. Ingresa tu PIN de nuevo.' : e.message);
      if (e.status === 404) setCerrada(true);
      if ([403, 404].includes(e.status)) {
        setToken('');
        setEntrega(null);
        setEnviada(null);
        setFoto(null);
      }
    } finally {
      setOcupado(false);
    }
  }

  function propia(path, options = {}, acceso = token) {
    return apiFetch(base + path, { ...options, headers: { ...options.headers, 'X-Induccion-Token': acceso } });
  }

  async function entrar(event) {
    event.preventDefault();
    await ejecutar(async () => {
      const acceso = await apiFetch(base + '/acceso', json({ trabajador: persona.id, pin }));
      setPin('');
      setEntrega(await propia('/entrega', {}, acceso.token));
      setToken(acceso.token);
    });
  }

  async function responder(pregunta, opcion) {
    await ejecutar(async () => {
      const respuesta = await propia('/respuestas', json({ pregunta, opcion }));
      setEntrega((actual) => ({
        ...actual,
        respuestas: [...actual.respuestas.filter((r) => r.pregunta !== pregunta), respuesta],
      }));
    });
  }

  async function enviar(event) {
    event.preventDefault();
    await ejecutar(async () => {
      const form = new FormData();
      form.append('referencia', foto.referencia);
      form.append('archivo', foto.archivo);
      await propia('/entrega', { method: 'POST', body: form, timeoutMs: 45000 });
      setEntrega(await propia('/entrega'));
      setFoto(null);
      setEnviada(null);
    });
  }

  const editable = entrega && ['PENDIENTE', 'CORRECCION'].includes(entrega.estado);
  const completas = entrega && entrega.respuestas.filter((r) => r.correcta).length === entrega.preguntas.length;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-xl space-y-4">
        <header>
          <p className="text-sm font-bold text-primary">G&amp;G Construcciones</p>
          <h1 className="text-2xl font-extrabold">{entrega?.titulo || 'Inducción SST'}</h1>
        </header>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-900">{error}</p>}
        {cerrada && <p className={tarjeta}>La asignación ya no está disponible.</p>}
        {!cerrada && !entrega && (
          <div className={tarjeta}>
            <label className="block font-semibold">Busca tu nombre o apellido
              <input className={campo} maxLength={150} value={busqueda.buscar} onChange={(e) => {
                setBusqueda({ buscar: e.target.value, pagina: 0 });
                setPersona(null);
                setPin('');
              }} />
            </label>
            <ul className="grid gap-2">
              {lista.personas.map((p) => <li key={p.id}><button type="button" aria-pressed={persona?.id === p.id}
                className={secundario + ' w-full text-left aria-pressed:bg-slate-200'} onClick={() => {
                  setPersona(p);
                  setPin('');
                  setError('');
                }}>{p.nombre} · Nº {p.numero}</button></li>)}
            </ul>
            {lista.total === 0 && <p>No se encontraron nombres.</p>}
            {lista.total > 20 && <div className="flex justify-between">
              <button className={secundario} disabled={busqueda.pagina === 0} onClick={() => setBusqueda({ ...busqueda, pagina: busqueda.pagina - 1 })}>Anterior</button>
              <button className={secundario} disabled={(busqueda.pagina + 1) * 20 >= lista.total} onClick={() => setBusqueda({ ...busqueda, pagina: busqueda.pagina + 1 })}>Siguiente</button>
            </div>}
            {persona && <form onSubmit={entrar} className="space-y-2">
              <label className="block font-semibold">PIN de {persona.nombre} · Nº {persona.numero}
                <input className={campo} type="password" inputMode="numeric" pattern="[0-9]{6}" required
                  autoComplete="off" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} />
              </label>
              <button className={boton} disabled={ocupado}>Ingresar</button>
            </form>}
          </div>
        )}
        {!cerrada && entrega && <>
          <div className={tarjeta}>
            <p className="font-bold" aria-live="polite">{estados[entrega.estado]}</p>
            <p>{entrega.nombre} · Versión {entrega.version}</p>
            {entrega.ejemplo && <p className="font-semibold">Material de ejemplo pendiente de revisión.</p>}
            <p>Confirma por separado la autorización para iniciar la tarea.</p>
            {entrega.entrega?.observacion && <p><strong>Observación:</strong> {entrega.entrega.observacion}</p>}
            {entrega.entrega?.id && <button className={secundario} disabled={ocupado}
              onClick={() => ejecutar(async () => setEnviada(await propia('/foto', { responseType: 'blob' })))}>Ver foto enviada</button>}
            <Foto key={entrega.entrega?.id} archivo={enviada} alt="Foto de EPP enviada" />
            <button className={secundario} disabled={ocupado} onClick={() => {
              setToken('');
              setEntrega(null);
              setPersona(null);
              setFoto(null);
              setEnviada(null);
            }}>Salir de mi entrega</button>
          </div>
          {entrega.secciones.map((s, i) => <article id={'material-' + i} className={tarjeta} key={i}>
            <h2 className="font-bold">{s.titulo}</h2>
            <p className="whitespace-pre-wrap">{s.texto}</p>
          </article>)}
          <div className={tarjeta}>
            <h2 className="font-bold">Cuestionario</h2>
            {entrega.preguntas.map((p, i) => {
              const respuesta = entrega.respuestas.find((r) => r.pregunta === i);
              return <fieldset key={i} className="space-y-2 border-t border-slate-200 pt-3">
                <legend className="font-semibold">{p.texto}</legend>
                {respuesta?.correcta ? <p className="text-green-800">Correcta · {p.opciones[respuesta.opcion]}</p> : <>
                  {respuesta && <p className="text-red-900" role="status">Repasa <button type="button" className="underline"
                    onClick={() => document.getElementById('material-' + p.seccion)?.scrollIntoView()}>
                    {entrega.secciones[p.seccion].titulo}</button> y vuelve a responder esta pregunta.</p>}
                  {p.opciones.map((opcion, j) => <button key={j} className={secundario + ' mr-2'}
                    onClick={() => responder(i, j)} disabled={ocupado || entrega.estado !== 'PENDIENTE'}>{opcion}</button>)}
                </>}
              </fieldset>;
            })}
          </div>
          {editable && <form className={tarjeta} onSubmit={enviar}>
            <h2 className="font-bold">{entrega.estado === 'CORRECCION' ? 'Reemplazar la foto' : 'Foto del EPP puesto'}</h2>
            <p>Tómala antes de iniciar la tarea, en un lugar seguro. Usa una imagen JPEG o PNG de hasta 5 MB.</p>
            <input type="file" aria-label="Foto del EPP" accept="image/jpeg,image/png,image/webp" className={campo}
              onChange={(e) => setFoto(e.target.files[0] ? { archivo: e.target.files[0], referencia: crypto.randomUUID() } : null)} />
            <Foto key={foto?.referencia} archivo={foto?.archivo} alt="Vista previa del EPP" />
            {!completas && <p>Completa el cuestionario para poder enviar la foto.</p>}
            <button className={boton} disabled={!completas || !foto || ocupado}>Enviar entrega</button>
          </form>}
        </>}
      </div>
    </main>
  );
}
