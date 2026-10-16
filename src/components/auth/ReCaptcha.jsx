import { useState, useEffect } from 'react';

/**
 * ReCaptcha Component
 * Simula de forma fiel y profesional el widget de Google reCAPTCHA v2
 * con soporte para verificación inmediata, desafío interactivo de seguridad industrial (EPP)
 * y temporizador de expiración de token.
 */
export default function ReCaptcha({ onVerify, onExpire, isLocked = false }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'verified' | 'challenge' | 'expired'
  const [showChallenge, setShowChallenge] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [challengeError, setChallengeError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  // Imágenes para desafío interactivo de Seguridad y Salud en el Trabajo (SST)
  const challengeImages = [
    { id: 1, label: 'Casco de Seguridad', isPPE: true, icon: 'engineering' },
    { id: 2, label: 'Taza de Café', isPPE: false, icon: 'coffee' },
    { id: 3, label: 'Botas Dieléctricas', isPPE: true, icon: 'footprint' },
    { id: 4, label: 'Gafas de Protección', isPPE: true, icon: 'visibility' },
    { id: 5, label: 'Planta de Oficina', isPPE: false, icon: 'potted_plant' },
    { id: 6, label: 'Arnés Anticaídas', isPPE: true, icon: 'accessibility_new' },
  ];

  // Expiración del token tras 2 minutos de verificación
  useEffect(() => {
    let timer;
    if (status === 'verified') {
      setTimeLeft(120);
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setStatus('expired');
            if (onExpire) onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [status, onExpire]);

  // Si está bloqueado, resetear
  useEffect(() => {
    if (isLocked && status === 'verified') {
      setStatus('idle');
      if (onExpire) onExpire();
    }
  }, [isLocked, status, onExpire]);

  const handleCheckboxClick = () => {
    if (isLocked || status === 'loading' || status === 'verified') return;

    setStatus('loading');
    
    // Simular validación heurística rápida de reCAPTCHA
    setTimeout(() => {
      // 30% de probabilidad o primer intento abre un mini-desafío de seguridad SST
      const requiresChallenge = Math.random() < 0.35;
      
      if (requiresChallenge) {
        setStatus('challenge');
        setShowChallenge(true);
        setSelectedTiles([]);
        setChallengeError(false);
      } else {
        completeVerification();
      }
    }, 700);
  };

  const completeVerification = () => {
    setStatus('verified');
    setShowChallenge(false);
    const token = `recaptcha_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    if (onVerify) {
      onVerify(token);
    }
  };

  const handleTileToggle = (id) => {
    setSelectedTiles((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setChallengeError(false);
  };

  const handleChallengeVerify = () => {
    // Validar que se hayan seleccionado al menos 2 elementos de EPP
    const ppeIds = challengeImages.filter((img) => img.isPPE).map((img) => img.id);
    const correctSelections = selectedTiles.filter((id) => ppeIds.includes(id));
    const incorrectSelections = selectedTiles.filter((id) => !ppeIds.includes(id));

    if (correctSelections.length >= 2 && incorrectSelections.length === 0) {
      completeVerification();
    } else {
      setChallengeError(true);
    }
  };

  const handleRefresh = (e) => {
    e.stopPropagation();
    setStatus('idle');
    setShowChallenge(false);
    if (onExpire) onExpire();
  };

  return (
    <div className="relative my-4 select-none">
      {/* Contenedor oficial estilo Google reCAPTCHA v2 */}
      <div
        className={`w-full max-w-[340px] mx-auto sm:mx-0 rounded-md border p-3 flex items-center justify-between transition-all duration-200 shadow-sm ${
          isLocked
            ? 'bg-surface-variant/40 border-outline-variant opacity-60 cursor-not-allowed'
            : status === 'verified'
            ? 'bg-[#f9fbf9] border-[#c1e1c1]'
            : status === 'expired'
            ? 'bg-amber-50 border-amber-300'
            : 'bg-[#f9f9f9] border-[#d3d3d3] hover:border-[#b8b8b8]'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Checkbox / Spinner / Checkmark */}
          <button
            type="button"
            disabled={isLocked || status === 'loading' || status === 'verified'}
            onClick={handleCheckboxClick}
            aria-label="No soy un robot"
            className={`w-7 h-7 rounded-[3px] border-2 flex items-center justify-center transition-all ${
              status === 'verified'
                ? 'bg-transparent border-transparent'
                : status === 'loading'
                ? 'border-transparent'
                : status === 'expired'
                ? 'border-amber-500 bg-amber-50'
                : 'border-[#c1c1c1] bg-white hover:border-[#8e8e8e] active:scale-95'
            }`}
          >
            {status === 'idle' && <span className="w-full h-full" />}

            {status === 'loading' && (
              <svg className="animate-spin h-6 w-6 text-industrial-orange" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}

            {status === 'verified' && (
              <span className="material-symbols-outlined text-[#0f9d58] text-[30px] animate-scale-in">
                check_circle
              </span>
            )}

            {status === 'expired' && (
              <span className="material-symbols-outlined text-amber-600 text-[20px]" title="Expirado">
                refresh
              </span>
            )}
          </button>

          {/* Etiqueta */}
          <div className="flex flex-col">
            <span
              onClick={handleCheckboxClick}
              className={`text-[13px] font-medium leading-tight cursor-pointer ${
                status === 'verified' ? 'text-[#0f9d58] font-semibold' : 'text-[#282828]'
              }`}
            >
              {status === 'verified'
                ? 'Verificación completada'
                : status === 'expired'
                ? 'Token expirado. Haz clic para renovar'
                : 'No soy un robot'}
            </span>
            {status === 'verified' && (
              <span className="text-[10px] text-secondary font-mono">
                Expira en {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>

        {/* Branding oficial reCAPTCHA */}
        <div className="flex flex-col items-center justify-center pl-2 border-l border-outline-variant/30">
          <svg className="w-8 h-8 text-[#4285f4]" viewBox="0 0 48 48">
            <path
              fill="#4285F4"
              d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 6c7.73 0 14 6.27 14 14 0 2.21-.52 4.3-1.44 6.16l-4.59-4.59c.65-1.12 1.03-2.42 1.03-3.81 0-4.97-4.03-9-9-9h-1.17l3.59-3.59L24 10zm-9.97 7.84l4.59 4.59C17.97 23.55 17.6 24.85 17.6 26.24c0 4.97 4.03 9 9 9h1.17l-3.59 3.59L24.77 40c-7.73 0-14-6.27-14-14 0-2.91.89-5.61 2.42-7.84l-2.16-2.32z"
            />
          </svg>
          <span className="text-[9px] font-bold tracking-tight text-secondary -mt-1">reCAPTCHA</span>
          <div className="flex gap-1 text-[8px] text-secondary/80">
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Privacidad
            </a>
            <span>-</span>
            <a
              href="https://policies.google.com/terms"
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Términos
            </a>
          </div>
        </div>
      </div>

      {/* Modal Desafío de Seguridad SST Opcional */}
      {showChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white shadow-2xl border border-surface-variant overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-primary p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-industrial-orange">
                  Verificación de Seguridad SG-SST
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowChallenge(false);
                    setStatus('idle');
                  }}
                  className="text-white/70 hover:text-white"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <h4 className="mt-1 font-headline-sm text-base text-white">
                Selecciona todos los elementos de <strong className="text-industrial-orange">Protección Personal (EPP)</strong>
              </h4>
              <p className="text-xs text-white/70">Requerido por protocolo de seguridad en obra</p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-3 gap-2">
                {challengeImages.map((item) => {
                  const isSelected = selectedTiles.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTileToggle(item.id)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all aspect-square text-center ${
                        isSelected
                          ? 'border-industrial-orange bg-industrial-orange/10 shadow-sm scale-95'
                          : 'border-surface-variant bg-surface hover:border-outline hover:bg-white'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-3xl mb-1 ${
                          isSelected ? 'text-industrial-orange' : 'text-primary'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[10px] leading-tight font-medium text-on-surface line-clamp-2">
                        {item.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-industrial-orange rounded-full flex items-center justify-center text-white text-[10px]">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {challengeError && (
                <div className="mt-3 p-2 rounded bg-error-container text-error text-xs flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>Selección incorrecta. Asegúrate de marcar los elementos de EPP.</span>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-surface-variant flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="text-secondary hover:text-primary flex items-center gap-1 text-xs"
                  title="Cambiar desafío"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Recargar</span>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChallenge(false);
                      setStatus('idle');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-surface-variant text-xs text-secondary hover:bg-surface font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleChallengeVerify}
                    className="px-4 py-1.5 rounded-lg bg-industrial-orange text-white text-xs font-semibold hover:bg-industrial-orange/90 active:scale-95 transition-all shadow-sm"
                  >
                    Verificar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
