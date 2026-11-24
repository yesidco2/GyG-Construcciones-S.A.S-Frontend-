import { useEffect, useState } from 'react';

export const estados = {
  PENDIENTE: 'Pendiente',
  POR_REVISAR: 'Por revisar',
  VALIDADA: 'Validada',
  CORRECCION: 'Requiere corrección',
};

export const campo = 'w-full rounded-lg border border-slate-400 bg-white p-2 text-slate-900';
export const tarjeta = 'rounded-xl border border-slate-300 bg-white p-4 space-y-3 text-slate-900';
export const boton = 'rounded-lg bg-primary px-4 py-2 font-semibold text-white disabled:opacity-50';
export const secundario = 'rounded-lg border border-slate-400 px-3 py-2 font-semibold disabled:opacity-50';

export function normalizar(texto) {
  return texto.toLocaleLowerCase('es').normalize('NFD').replace(/\p{M}/gu, '').trim();
}

export function json(body) {
  return { method: 'POST', body: JSON.stringify(body) };
}

export function Foto({ archivo, alt }) {
  const [preview, setPreview] = useState(null);
  useEffect(() => {
    if (!archivo) return undefined;
    const url = URL.createObjectURL(archivo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);
  return archivo && preview ? <img src={preview} alt={alt} className="max-h-80 max-w-full rounded-lg object-contain" /> : null;
}
