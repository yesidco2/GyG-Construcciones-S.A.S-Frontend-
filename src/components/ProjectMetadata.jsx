export function ProjectDate({ value }) {
  if (!value) return null;
  const day = value.slice(0, 10);
  return <time dateTime={value}>{day}</time>;
}

export function ProjectMilestones({ milestones }) {
  return milestones.length === 0 ? <p className="text-sm text-secondary">Aún no hay hitos registrados.</p> : (
    <ul className="space-y-2">
      {milestones.map((hito, index) => (
        <li key={hito.id ?? index} className="rounded-xl bg-white p-sm text-sm">
          <strong className="text-primary">{hito.nombre}</strong>
          <p className="text-secondary">{hito.completado ? 'Completado' : 'Pendiente'}</p>
          {hito.descripcion && <p>{hito.descripcion}</p>}
          {hito.fechaObjetivo && <p className="text-secondary">Fecha objetivo <ProjectDate value={hito.fechaObjetivo} /></p>}
        </li>
      ))}
    </ul>
  );
}

export function PhotoMetadata({ photo }) {
  return (
    <>
      {photo.fecha && <p className="text-xs text-secondary"><ProjectDate value={photo.fecha} /></p>}
      {photo.descripcion && <p className="break-words text-sm text-secondary">{photo.descripcion}</p>}
    </>
  );
}
