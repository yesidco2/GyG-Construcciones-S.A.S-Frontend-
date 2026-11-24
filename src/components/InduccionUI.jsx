import { useEffect, useState } from 'react';
import './induccion.css';

export const estados = {
  PENDIENTE: 'Pendiente',
  POR_REVISAR: 'Por revisar',
  VALIDADA: 'Validada',
  CORRECCION: 'Requiere corrección',
};

export const campo = 'sst-field';
export const tarjeta = 'sst-card space-y-4';
export const boton = 'sst-primary';
export const secundario = 'sst-secondary';

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
