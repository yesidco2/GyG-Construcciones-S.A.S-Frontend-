import { POLICY_URL } from '../config/privacy';

export default function PrivacyConsent({ id, label, required, checked, onChange, error, className = '' }) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-start gap-2 text-sm text-current">
        <input
          id={id}
          type="checkbox"
          required={required}
          checked={checked}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${helpId} ${errorId}` : helpId}
          className="mt-1 h-4 w-4 shrink-0 rounded border-outline-variant text-industrial-orange focus:ring-industrial-orange/30"
        />
        <span>
          {label}
          {required && <span className="sr-only"> Obligatorio</span>}
        </span>
      </label>
      <p id={helpId} className="ml-6 mt-1 text-xs text-current">
        Consulta la{' '}
        <a
          href={POLICY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-industrial-orange underline"
        >
          Política de Tratamiento de Datos Personales
        </a>
        .
      </p>
      {error && (
        <p id={errorId} role="alert" aria-live="polite" className={`ml-6 mt-1 text-sm ${className ? 'text-red-200' : 'text-error'}`}>
          {error}
        </p>
      )}
    </div>
  );
}
