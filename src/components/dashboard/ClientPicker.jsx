import { useState } from 'react';

export default function ClientPicker({ id, clients, selectedId, onSelect, initialName = '', disabled, loading, error, onReload }) {
  const [query, setQuery] = useState(initialName);
  const selected = clients.find((client) => client.id === selectedId);
  const term = query.trim().toLocaleLowerCase('es');
  const matches = selectedId == null && term
    ? clients.filter((client) => [client.name, client.email].some((value) => value.toLocaleLowerCase('es').includes(term)))
    : [];
  const helpId = id + '-help';
  if (loading) return <p id={helpId} role="status" className="text-sm text-secondary">Cargando clientes…</p>;
  if (error) return (
    <p id={helpId} role="alert" className="text-sm text-error">
      {error}{' '}<button type="button" onClick={onReload} className="font-semibold underline">Recargar clientes</button>
    </p>
  );
  if (!clients.length) return (
    <p id={helpId} role="status" className="text-sm text-secondary">
      No hay clientes disponibles. Se necesita una cuenta activa con rol CLIENTE.
    </p>
  );

  return (
    <>
      <input id={id} type="search" disabled={disabled} value={selected?.name ?? query}
        placeholder="Busca por nombre o correo" aria-describedby={id + '-help'}
        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-body-md"
        onChange={(event) => {
          setQuery(event.target.value);
          onSelect(null);
        }} />
      <p id={id + '-help'} className="mt-1 text-sm text-secondary">
        {selected ? 'Cliente seleccionado: ' + (selected.email || selected.name)
          : selectedId != null ? 'Cliente asignado actualmente.'
          : 'Busca y selecciona un cliente registrado.'}
      </p>
      {selectedId == null && term && (
        matches.length ? (
          <div className="mt-1 overflow-hidden rounded-lg border border-outline-variant">
            <ul aria-label="Clientes encontrados" className="max-h-44 overflow-y-auto">
              {matches.map((client) => (
                <li key={client.id}>
                  <button type="button" disabled={disabled} className="w-full px-3 py-2 text-left text-sm hover:bg-surface"
                    onClick={() => { setQuery(client.name); onSelect(client.id); }}>
                    {client.name}{client.email && ' — ' + client.email}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : <p role="status" className="mt-1 text-sm text-secondary">Sin coincidencias.</p>
      )}
    </>
  );
}
