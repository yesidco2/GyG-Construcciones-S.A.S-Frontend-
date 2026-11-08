import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { PRIVACY_POLICY_URL, PRIVACY_POLICY_VERSION } from '../services/privacyPolicy';

const fallbackResponses = [
  'Para resolver dudas de SST, revisa primero el tipo de actividad, los riesgos asociados y los EPP mínimos recomendados. Si quieres, puedo orientarte sobre trabajo en alturas, riesgo eléctrico o excavaciones.',
  'La normativa en obra exige evaluación de riesgos, instrucción previa y uso obligatorio de EPE. Si compartes tu caso específico, te puedo guiar en la mejor práctica.',
  'Para trabajos en altura, el principal control es la línea de vida y la formación del personal. También es clave revisar el plan de trabajo y la inspección general del área.',
];

const getFallbackAnswer = () => fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

const getSessionHistory = () => {
  try {
    return JSON.parse(sessionStorage.getItem('gg-chat-history') || '[]');
  } catch {
    return [];
  }
};

const FAQ_DATA = [
  {
    question: '¿Qué servicios ofrece G&G?',
    answer: 'Ofrecemos diseño estructural, ejecución de obras, interventoría, estudios de suelos e implementación integral del SG-SST.'
  },
  {
    question: '¿Cómo solicito una cotización?',
    answer: 'Puedes usar el botón "Solicitar Cotización" del menú superior o contactarnos directamente vía WhatsApp para atención prioritaria.'
  },
  {
    question: '¿Cumplen con la norma NSR-10 y Decreto 1072?',
    answer: 'Sí, todos nuestros diseños de ingeniería civil y sistemas de SG-SST cumplen estrictamente con la normativa colombiana vigente.'
  },
  {
    question: '¿Dónde prestan sus servicios?',
    answer: 'Operamos principalmente en Medellín, el Valle de Aburrá y el departamento de Antioquia, con capacidad de cobertura nacional según el proyecto.'
  }
];

export default function FloatingIA() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hola — soy el asistente virtual de G&G. ¿Sobre qué quieres consultar?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);
  const [acceptsPolicy, setAcceptsPolicy] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    if (!open) return;
    const saved = getSessionHistory();
    if (saved.length > 0) {
      setMessages(saved.slice(-4));
      setShowFAQ(false);
    } else {
      setShowFAQ(true);
    }
  }, [open]);

  const saveHistory = (nextMessages) => {
    try {
      sessionStorage.setItem('gg-chat-history', JSON.stringify(nextMessages.slice(-20)));
      setStorageError('');
    } catch {
      setStorageError('No se pudo guardar el historial de esta conversación en la sesión.');
    }
  };

  const clearConversation = () => {
    sessionStorage.removeItem('gg-chat-history');
    setMessages([
      { type: 'bot', text: 'Hola — soy el asistente virtual de G&G. ¿Sobre qué quieres consultar?' },
    ]);
    setInput('');
    setShowFAQ(true);
  };

  const handleSelectFAQ = async (faq) => {
    if (!acceptsPolicy) {
      setConsentError('Autoriza el tratamiento de datos para iniciar la conversación.');
      return;
    }
    setConsentError('');
    const userMessage = { type: 'user', text: faq.question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setShowFAQ(false);
    setIsLoading(true);

    try {
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          pregunta: faq.question,
          aceptaPolitica: true,
          politicaVersion: PRIVACY_POLICY_VERSION,
        }),
      });
      const botMessage = { type: 'bot', text: data?.respuesta || faq.answer };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } catch {
      const botMessage = { type: 'bot', text: faq.answer };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;
    if (!acceptsPolicy) {
      setConsentError('Autoriza el tratamiento de datos para enviar tu consulta.');
      return;
    }
    setConsentError('');

    const userMessage = { type: 'user', text: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          pregunta: trimmed,
          aceptaPolitica: true,
          politicaVersion: PRIVACY_POLICY_VERSION,
        }),
      });

      const aiText = data?.respuesta || getFallbackAnswer();
      const botMessage = { type: 'bot', text: aiText };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } catch {
      const botMessage = { type: 'bot', text: getFallbackAnswer() };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed left-4 bottom-8 z-50 flex flex-col items-start">
      {open && (
        <div className="mb-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-surface-variant overflow-hidden flex flex-col h-[480px]">
          {/* Encabezado */}
          <div className="flex items-center justify-between bg-primary p-3 text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-industrial-orange">smart_toy</span>
              <strong>Asistente IA</strong>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={clearConversation}
                className="text-xs text-white/80 underline underline-offset-2 hover:text-white"
              >
                Borrar conversación
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-white opacity-90 hover:opacity-100"
                aria-label="Cerrar asistente IA"
                type="button"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Historial de Mensajes */}
          <div className="flex-1 p-3 text-sm text-on-surface overflow-y-auto flex flex-col gap-2 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] p-2.5 rounded-lg text-xs ${
                  msg.type === 'user'
                    ? 'bg-primary text-white self-end rounded-br-none'
                    : 'bg-white text-gray-800 border border-surface-variant self-start shadow-xs rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            ))}

            {/* Preguntas Frecuentes */}
            {showFAQ && messages.length === 1 && (
              <div className="mt-2 flex flex-col gap-1.5">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Preguntas Frecuentes:</p>
                {FAQ_DATA.map((faq, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectFAQ(faq)}
                    className="text-left bg-white border border-industrial-orange text-primary hover:bg-orange-50 font-medium p-2 rounded-md transition-colors text-xs shadow-xs"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}

            {isLoading && <div className="rounded-md bg-white p-2 text-on-surface text-xs">Pensando...</div>}
          </div>

          {/* Formulario de Entrada */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-surface-variant bg-white">
            <p className="mb-2 text-[10px] leading-relaxed text-secondary" aria-live="polite">
              Las conversaciones se guardan solo en esta pestaña durante la sesión. Evita compartir datos sensibles.
            </p>
            <label htmlFor="chat-privacy" className="mb-2 flex items-start gap-2 text-[10px] leading-relaxed text-secondary">
              <input
                id="chat-privacy"
                type="checkbox"
                checked={acceptsPolicy}
                onChange={(event) => {
                  setAcceptsPolicy(event.target.checked);
                  setConsentError('');
                }}
                aria-invalid={Boolean(consentError)}
                aria-describedby={consentError ? 'chat-privacy-error' : undefined}
                className="mt-0.5 h-3.5 w-3.5 rounded border-outline-variant text-industrial-orange focus:ring-industrial-orange/30"
              />
              <span>
                Autorizo el tratamiento de datos según la{' '}
                <a href={PRIVACY_POLICY_URL} className="font-semibold text-industrial-orange underline">
                  Política de tratamiento de datos
                </a>.
              </span>
            </label>
            {consentError && <p id="chat-privacy-error" role="alert" className="mb-2 text-[10px] text-error">{consentError}</p>}
            {storageError && <p role="status" className="mb-2 text-[10px] text-error" aria-live="polite">{storageError}</p>}
            <label htmlFor="chat-input" className="sr-only">
              Mensaje para el asistente
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              className="w-full rounded-md border border-surface-variant p-2 text-xs focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !acceptsPolicy}
              className="mt-2 w-full bg-industrial-orange text-white py-2 rounded-md text-xs font-semibold hover:opacity-95 transition-opacity disabled:opacity-60"
            >
              {isLoading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      )}

      {/* Botón Flotante */}
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 rounded-full bg-primary p-3 text-white shadow-lg transition-transform hover:scale-105"
        aria-label={open ? 'Cerrar asistente IA' : 'Abrir asistente IA'}
        type="button"
      >
        <span className="material-symbols-outlined">smart_toy</span>
      </button>
    </div>
  );
}