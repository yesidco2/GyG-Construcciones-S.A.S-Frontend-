import React, { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { POLICY_URL } from '../config/privacy';

const getSessionHistory = () => {
  try {
    return JSON.parse(sessionStorage.getItem('gg-chat-history') || '[]');
  } catch {
    return [];
  }
};

const FAQ_DATA = [
  { question: '¿Qué servicios ofrece G&G?' },
  { question: '¿Cómo solicito una cotización?' },
  { question: '¿Cumplen con la norma NSR-10 y Decreto 1072?' },
  { question: '¿Dónde prestan sus servicios?' },
];

export default function FloatingIA() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hola — soy el asistente virtual de G&G. ¿Sobre qué quieres consultar?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFAQ, setShowFAQ] = useState(true);
  const [storageError, setStorageError] = useState('');
  const [chatConfig, setChatConfig] = useState(null);
  const [chatConfigLoaded, setChatConfigLoaded] = useState(false);
  const [chatConfigError, setChatConfigError] = useState(false);
  const [aceptaEnvioProveedor, setAceptaEnvioProveedor] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch('/api/chat/config')
      .then((data) => {
        if (!data || typeof data.proveedorExternoActivo !== 'boolean') {
          throw new Error('La configuración del asistente no tiene el formato esperado.');
        }
        if (active) setChatConfig(data);
      })
      .catch((error) => {
        if (active) setChatConfigError(true);
        console.error('No se pudo consultar la configuración del asistente:', error);
      })
      .finally(() => {
        if (active) setChatConfigLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

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
    if (!chatConfigLoaded || !chatConfig || (chatConfig.proveedorExternoActivo && !aceptaEnvioProveedor)) return;
    const userMessage = { type: 'user', text: faq.question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setShowFAQ(false);
    setIsLoading(true);

    try {
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        timeoutMs: 30000,
        body: JSON.stringify({
          pregunta: faq.question,
          aceptaEnvioProveedor,
        }),
      });
      const botMessage = {
        type: 'bot',
        text: data?.respuesta || 'El asistente no devolvió una respuesta. Inténtalo de nuevo más tarde.',
      };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } catch (error) {
      console.error('No se pudo obtener respuesta para la pregunta frecuente:', error);
      const botMessage = {
        type: 'bot',
        text: error?.status
          ? error.message
          : 'No pude conectar con el asistente en este momento. Inténtalo de nuevo más tarde.',
      };
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
    if (
      !trimmed ||
      !chatConfigLoaded ||
      !chatConfig ||
      (chatConfig.proveedorExternoActivo && !aceptaEnvioProveedor)
    ) return;
    const userMessage = { type: 'user', text: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        timeoutMs: 30000,
        body: JSON.stringify({
          pregunta: trimmed,
          aceptaEnvioProveedor,
        }),
      });

      const botMessage = {
        type: 'bot',
        text: data?.respuesta || 'El asistente no devolvió una respuesta. Inténtalo de nuevo más tarde.',
      };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } catch (error) {
      console.error('No se pudo obtener respuesta del asistente:', error);
      const botMessage = {
        type: 'bot',
        text: error?.status
          ? error.message
          : 'No pude conectar con el asistente en este momento. Inténtalo de nuevo más tarde.',
      };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cookie-floating-chat fixed left-4 bottom-8 z-50 flex flex-col items-start">
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

          <p className="border-b border-surface-variant bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-primary">
            {chatConfig?.proveedorExternoActivo
              ? 'Si acepta, enviaremos únicamente su pregunta a Google Gemini para generar la respuesta y registraremos la interacción en los sistemas de G&G. No escriba datos sensibles ni documentos de identidad. '
              : 'Sus mensajes se registran en los sistemas de G&G para responderle y mantener el servicio. No escriba datos sensibles ni documentos de identidad. '}
            Consulte nuestra{' '}
            <a href={POLICY_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-on-primary-fixed-variant underline">
              Política de Tratamiento de Datos Personales
            </a>.
          </p>
          <p className="border-b border-surface-variant bg-white px-3 py-1.5 text-[10px] leading-relaxed text-secondary">
            La orientación es general; no sustituye la evaluación de un profesional SST, los procedimientos aprobados ni la atención de emergencias. Verifica los requisitos legales vigentes en fuentes oficiales.
          </p>

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
                    disabled={!chatConfigLoaded || !chatConfig || isLoading || (
                      chatConfig.proveedorExternoActivo && !aceptaEnvioProveedor
                    )}
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
            {storageError && <p role="status" className="mb-2 text-[10px] text-error" aria-live="polite">{storageError}</p>}
            {chatConfigError && (
              <p role="alert" className="mb-2 text-[10px] text-error">
                No se pudo cargar la configuración del asistente. Recarga la página para intentarlo de nuevo.
              </p>
            )}
            {chatConfig?.proveedorExternoActivo && (
              <label className="mb-3 flex items-start gap-2 text-[10px] leading-relaxed text-secondary">
                <input
                  type="checkbox"
                  checked={aceptaEnvioProveedor}
                  onChange={(event) => setAceptaEnvioProveedor(event.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span>
                  Autorizo que G&G envíe mi pregunta a Google Gemini para generar una respuesta y registre esta interacción según la Política de Tratamiento de Datos Personales.
                </span>
              </label>
            )}
            <label htmlFor="chat-input" className="mb-1 block text-[10px] font-semibold text-secondary">
              Mensaje para el asistente
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Escribe tu pregunta..."
              className="w-full rounded-md border border-surface-variant p-2 text-xs focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={
                isLoading ||
                !chatConfigLoaded ||
                !chatConfig ||
                !input.trim() ||
                (chatConfig.proveedorExternoActivo && !aceptaEnvioProveedor)
              }
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