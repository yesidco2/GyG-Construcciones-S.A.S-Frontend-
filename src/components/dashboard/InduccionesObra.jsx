import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { apiFetch } from '../../services/api';
import { boton, campo, estados, Foto, json, normalizar, secundario, tarjeta } from '../InduccionUI';
import EditorInduccion from './EditorInduccion';

export default function InduccionesObra({ obra }) {
  const base = '/api/panel/obras/' + obra.id + '/inducciones';
  const [catalogo, setCatalogo] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [seleccion, setSeleccion] = useState('');
  const [material, setMaterial] = useState('');
  const [nombres, setNombres] = useState('');
  const [pins, setPins] = useState([]);
  const [cuadrilla, setCuadrilla] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [foto, setFoto] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [copiado, setCopiado] = useState('');
  const [qr, setQr] = useState(null);
  const [version, actualizar] = useState(0);

  const asignacion = asignaciones.find((a) => a.id === seleccion);
  const link = seleccion ? new URL(window.location.pathname + '#induccion/' + seleccion, window.location.origin).href : '';
  const url = base + '/asignaciones/' + seleccion;

  useEffect(() => {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    Promise.all([apiFetch(base + '/catalogo', options), apiFetch(base + '/asignaciones', options)])
      .then(([materiales, registros]) => {
        setCatalogo(materiales);
        setAsignaciones(registros);
        setSeleccion((actual) => actual || registros[0]?.id || '');
      })
      .catch((e) => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [base, version]);

  useEffect(() => {
    if (!seleccion) return undefined;
    const controller = new AbortController();
    let consultando = false;
    async function consultar() {
      if (consultando) return;
      consultando = true;
      try {
        const data = await apiFetch(url + '/trabajadores', { signal: controller.signal });
        if (!controller.signal.aborted) setCuadrilla(data);
      } catch (e) {
        if (!controller.signal.aborted) setError(e.message);
      } finally {
        consultando = false;
      }
    }
    consultar();
    const timer = window.setInterval(consultar, 10000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [seleccion, url, version]);

  useEffect(() => {
    if (!link) return undefined;
    let vigente = true;
    let src;
    QRCode.toCanvas(link, { width: 224, margin: 4 })
      .then((canvas) => canvas.toBlob((blob) => {
        if (vigente && blob) {
          src = URL.createObjectURL(blob);
          setQr({ link, src });
        }
      }))
      .catch(() => { if (vigente) setError('No se pudo generar el QR. Puedes copiar el enlace.'); });
    return () => {
      vigente = false;
      if (src) URL.revokeObjectURL(src);
    };
  }, [link]);

  async function ejecutar(fn) {
    if (ocupado) return;
    setOcupado(true);
    setError('');
    setCopiado('');
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  }

  async function copiar(texto, aviso) {
    return ejecutar(async () => {
      await navigator.clipboard.writeText(texto);
      setCopiado(aviso);
    });
  }

  function cambiarAsignacion(id) {
    setSeleccion(id);
    setCuadrilla([]);
    setPins([]);
    setDetalle(null);
    setFoto(null);
    setObservacion('');
    setCopiado('');
  }

  async function crear(event) {
    event.preventDefault();
    await ejecutar(async () => {
      const [id, versionMaterial] = material.split('/');
      const response = await apiFetch(base + '/asignaciones', json({
        material: id, version: Number(versionMaterial), nombres: nombres.split(/\r?\n/).map((n) => n.trim()).filter(Boolean),
      }));
      cambiarAsignacion(response.id);
      setPins(response.pins);
      setNombres('');
      actualizar((n) => n + 1);
    });
  }

  async function abrir(id) {
    await ejecutar(async () => {
      setFoto(null);
      setObservacion('');
      setDetalle(await apiFetch(url + '/trabajadores/' + id));
    });
  }

  async function verFoto(id) {
    await ejecutar(async () => {
      const imagen = await apiFetch(url + '/trabajadores/' + detalle.id + '/foto', {
        ...json({ entrega: id }), responseType: 'blob',
      });
      setFoto({ id, imagen });
    });
  }

  async function revisar(validar) {
    await ejecutar(async () => {
      await apiFetch(url + '/trabajadores/' + detalle.id + '/revision', json({
        entrega: detalle.entrega.id, validar, observacion,
      }));
      setDetalle(null);
      setFoto(null);
      setObservacion('');
      actualizar((n) => n + 1);
    });
  }

  const filtrados = cuadrilla.filter((p) => (!estado || p.estado === estado)
    && normalizar(p.nombre).includes(normalizar(busqueda)));

  return (
    <section className="sst-flow sst-panel">
      <header className="sst-banner">
        <span className="sst-icon material-symbols-outlined" aria-hidden="true">health_and_safety</span>
        <div>
        <h3 className="text-xl font-bold text-primary">Inducciones SST</h3>
        <p>{obra.name}</p>
        </div>
      </header>
      <div className="sst-panel-content">
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      {copiado && <p role="status">{copiado}</p>}
      <form className={tarjeta} onSubmit={crear}>
        <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-xl text-sky-800" aria-hidden="true">assignment_add</span>
          <h4 className="text-lg font-bold">Crear asignación</h4>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
        <label className="block text-sm font-semibold">Material y versión
          <select className={campo} required value={material} onChange={(e) => setMaterial(e.target.value)}>
            <option value="">Selecciona una inducción</option>
            {catalogo.map((m) => <option key={m.id + '/' + m.version} value={m.id + '/' + m.version}>
              {m.titulo} · v{m.version}{m.ejemplo ? ' · ejemplo pendiente de revisión' : ''}
            </option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Nombres de trabajadores, uno por línea
          <textarea className={campo} rows={4} required value={nombres} onChange={(e) => setNombres(e.target.value)} />
        </label>
        </div>
        <div className="flex justify-end border-t border-slate-200 pt-4">
          <button className={boton} disabled={ocupado || !material || !nombres.trim()}>Crear asignación</button>
        </div>
      </form>
      <EditorInduccion catalogo={catalogo} ocupado={ocupado} publicar={(contenido) => ejecutar(async () => {
        const registro = await apiFetch(base + '/catalogo', json(contenido));
        setMaterial(registro.id + '/' + registro.version);
        actualizar((n) => n + 1);
        setCopiado('Versión guardada.');
      })} />
      {(asignaciones.length > 0 || seleccion) && <div className={tarjeta}>
        <label className="block">Asignación
          <select className={campo} value={seleccion} disabled={ocupado} onChange={(e) => cambiarAsignacion(e.target.value)}>
            {asignaciones.map((a) => <option key={a.id} value={a.id}>
              {a.titulo} · v{a.version} · {new Date(a.creada_en).toLocaleString('es-CO')}{a.cerrada_en ? ' · cerrada' : ''}
            </option>)}
          </select>
        </label>
        {asignacion?.cerrada_en ? <p>Asignación cerrada.</p> : <>
          <label className="block">Enlace compartido <input className={campo} readOnly value={link} /></label>
          <div className="flex flex-wrap gap-2">
            <button className={secundario} disabled={ocupado} onClick={() => copiar(link, 'Enlace copiado.')}>Copiar enlace</button>
            <button className={secundario} disabled={ocupado} onClick={() => ejecutar(async () => {
              if (!window.confirm('¿Cerrar la asignación y revocar el acceso de toda la cuadrilla?')) return;
              await apiFetch(url + '/cerrar', { method: 'POST' });
              setPins([]);
              actualizar((n) => n + 1);
            })}>Cerrar asignación</button>
          </div>
          {qr?.link === link && <a href={qr.src} download="induccion-sst.png">
            <img src={qr.src} width="224" height="224" alt="Descargar QR compartido de la asignación" />
          </a>}
        </>}
      </div>}
      {pins.length > 0 && <div className={tarjeta}>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-bold">PIN emitidos para entregar en privado</h4>
          <button className={secundario} onClick={() => setPins([])}>Ocultar PIN</button>
        </div>
        <ul className="space-y-2">{pins.map((p) => <li key={p.id} className="flex flex-wrap items-center gap-2">
          <span>{p.nombre} · Nº {p.numero}</span><code>{p.pin}</code>
          <button className={secundario} disabled={ocupado} onClick={() => copiar(p.pin, 'PIN copiado.')}>Copiar PIN de {p.nombre}</button>
        </li>)}</ul>
      </div>}
      {seleccion && <div className={tarjeta}>
        <h4 className="font-bold">Entregas</h4>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(estados).map(([key, label]) => <div key={key} className="rounded-lg bg-slate-100 p-2">
            <dt>{label}</dt><dd className="text-xl font-bold">{cuadrilla.filter((p) => p.estado === key).length}</dd>
          </div>)}
        </dl>
        <div className="grid gap-2 sm:grid-cols-2">
          <label>Buscar trabajador<input className={campo} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></label>
          <label>Estado<select className={campo} value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(estados).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select></label>
        </div>
        {filtrados.length === 0 && <p>No hay trabajadores para este filtro.</p>}
        <ul className="divide-y divide-slate-200">{filtrados.map((p) => <li key={p.id} className="flex flex-wrap items-center gap-2 py-2">
          <span className="grow">{p.nombre} · Nº {p.numero} · {estados[p.estado]}</span>
          <button className={secundario} disabled={ocupado} onClick={() => abrir(p.id)}>Ver entrega</button>
          {!asignacion?.cerrada_en && <button className={secundario} disabled={ocupado} onClick={() => ejecutar(async () => {
            if (!window.confirm('¿Regenerar el PIN de ' + p.nombre + ' e invalidar su acceso actual?')) return;
            const response = await apiFetch(url + '/trabajadores/' + p.id + '/pin', { method: 'POST' });
            setPins((actual) => [...actual.filter((x) => x.id !== p.id), { ...p, pin: response.pin }]);
          })}>Regenerar PIN</button>}
        </li>)}</ul>
      </div>}
      {detalle && <div className={tarjeta}>
        <h4 className="font-bold">{detalle.nombre} · {estados[detalle.estado]}</h4>
        <button className={secundario} onClick={() => { setDetalle(null); setFoto(null); }}>Cerrar detalle</button>
        <ol className="list-decimal pl-5">
          {detalle.material.preguntas.map((p, i) => {
            const r = detalle.respuestas.find((row) => row.pregunta === i);
            return <li key={i}>{p.texto}<br />{r ? p.opciones[r.opcion] + (r.correcta ? ' · Correcta' : ' · Incorrecta') : 'Sin respuesta'}</li>;
          })}
        </ol>
        {detalle.historial.map((h) => <div key={h.id} className="space-y-2 border-t border-slate-200 pt-2">
          <p>Enviada {new Date(h.enviada_en).toLocaleString('es-CO')}</p>
          {h.revisada_en && <p>{estados[h.decision]} · {new Date(h.revisada_en).toLocaleString('es-CO')}{h.observacion && ' · ' + h.observacion}</p>}
          <button className={secundario} disabled={ocupado} onClick={() => verFoto(h.id)}>Ver foto del EPP</button>
          {foto?.id === h.id && <Foto key={foto.id} archivo={foto.imagen} alt="Evidencia fotográfica del EPP" />}
        </div>)}
        {detalle.estado === 'POR_REVISAR' && <>
          <label className="block">Observación para el trabajador
            <textarea className={campo} maxLength={1000} value={observacion} onChange={(e) => setObservacion(e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-2">
            <button className={boton} disabled={ocupado} onClick={() => revisar(true)}>Validar entrega</button>
            <button className={secundario} disabled={ocupado || !observacion.trim()} onClick={() => revisar(false)}>Devolver para corrección</button>
          </div>
        </>}
      </div>}
      </div>
    </section>
  );
}
