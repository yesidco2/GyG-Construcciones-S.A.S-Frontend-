import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiFetch } from '../services/api';
import { POLICY_URL } from '../config/privacy';

// El backend admite hasta dos intentos de generación de 50 segundos.
const CHAT_TIMEOUT_MS = 120_000;

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
  const [noticesOpen, setNoticesOpen] = useState(true);
  const opener = useRef(null);
  const panel = useRef(null);
  useEffect(() => {
    const show = event => {
      opener.current = event.detail;
      setOpen(true);
      panel.current?.focus();
    };
    window.addEventListener('gg-chat-open', show);
    return () => window.removeEventListener('gg-chat-open', show);
  }, []);

  function closeChat() {
    setOpen(false);
    opener.current?.focus();
  }
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
  const [configAttempt, setConfigAttempt] = useState(0);
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
  }, [configAttempt]);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
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
    setNoticesOpen(true);
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
        timeoutMs: CHAT_TIMEOUT_MS,
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
        timeoutMs: CHAT_TIMEOUT_MS,
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
        <div className="mb-2 w-80 max-w-[calc(100vw-2rem)] sm:w-96 overflow-hidden rounded-lg border border-surface-variant bg-white shadow-lg">
          <div ref={panel} tabIndex={-1} role="dialog" aria-label="Asistente de G&G"
            onKeyDown={event => { if (event.key === 'Escape') closeChat(); }}
            className="overflow-y-auto flex flex-col h-[480px] max-h-[70dvh]">
            {/* Encabezado */}
            <div className="flex items-center justify-between bg-primary p-3 text-white">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-industrial-orange">smart_toy</span>
                <strong className="font-headline-sm text-headline-sm">Asistente IA</strong>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearConversation}
                  className="text-sm text-white/80 underline underline-offset-2 hover:text-white"
                >
                  Borrar conversación
                </button>
                <button
                  onClick={closeChat}
                  className="text-white opacity-90 hover:opacity-100"
                  aria-label="Cerrar asistente IA"
                  type="button"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-surface">
              <div className="border-b border-surface-variant bg-white">
                <button type="button" aria-expanded={noticesOpen} aria-controls="chat-notices"
                  onClick={() => setNoticesOpen(shown => !shown)}
                  className="flex min-h-10 w-full items-center justify-between gap-2 px-3 text-left text-sm font-semibold text-primary hover:bg-surface">
                  Privacidad y uso del chat
                  <span className="inline-flex items-center gap-1 text-secondary">
                    {noticesOpen ? 'Ocultar' : 'Ver'}
                    <span className="material-symbols-outlined text-base" aria-hidden="true">{noticesOpen ? 'expand_less' : 'expand_more'}</span>
                  </span>
                </button>
                <div id="chat-notices" hidden={!noticesOpen} className="space-y-2 px-3 pb-3 text-sm leading-relaxed text-on-surface-variant">
                  <p>
                    {chatConfig?.proveedorExternoActivo
                      ? 'Si acepta, enviaremos únicamente su pregunta a Google Gemini para generar la respuesta y registraremos la interacción en los sistemas de G&G. No escriba datos sensibles ni documentos de identidad. '
                      : 'Sus mensajes se registran en los sistemas de G&G para responderle y mantener el servicio. No escriba datos sensibles ni documentos de identidad. '}
                    Consulte nuestra{' '}
                    <a href={POLICY_URL} className="font-semibold text-on-primary-fixed-variant underline">
                      Política de Tratamiento de Datos Personales
                    </a>.
                  </p>
                  <p>
                    La orientación es general; no sustituye la evaluación de un profesional SST, los procedimientos aprobados ni la atención de emergencias. Verifica los requisitos legales vigentes en fuentes oficiales.
                  </p>
                  {chatConfig?.proveedorExternoActivo && (
                    <label className="flex items-start gap-2 border-t border-surface-variant pt-2 text-primary">
                      <input type="checkbox" checked={aceptaEnvioProveedor}
                        onChange={event => setAceptaEnvioProveedor(event.target.checked)} className="mt-1 accent-primary" />
                      <span>Autorizo que G&amp;G envíe mi pregunta a Google Gemini y registre esta interacción.</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Historial de Mensajes */}
              <div className="flex flex-col gap-2 p-3 text-sm text-on-surface">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[92%] whitespace-pre-wrap break-words p-2.5 rounded-lg text-sm leading-relaxed ${
                      msg.type === 'user'
                        ? 'bg-primary text-white self-end rounded-br-none'
                        : 'bg-white text-gray-800 border border-surface-variant self-start shadow-xs rounded-bl-none'
                    }`}
                  >
                    {msg.type === 'user' ? msg.text : (
                      <div className="space-y-1.5 whitespace-normal [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-4 [&_ol]:pl-4">
                        <ReactMarkdown skipHtml unwrapDisallowed allowedElements={['p', 'strong', 'em', 'ul', 'ol', 'li', 'br']}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}

                {/* Preguntas Frecuentes */}
                {showFAQ && messages.length === 1 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <p className="text-label-caps text-gray-500 font-semibold uppercase tracking-wider">Preguntas Frecuentes:</p>
                    {FAQ_DATA.map((faq, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectFAQ(faq)}
                        disabled={!chatConfigLoaded || !chatConfig || isLoading || (
                          chatConfig.proveedorExternoActivo && !aceptaEnvioProveedor
                        )}
                        className="text-left bg-white border border-industrial-orange text-primary hover:bg-orange-50 font-medium p-2 rounded-md transition-colors text-sm shadow-xs"
                      >
                        {faq.question}
                      </button>
                    ))}
                  </div>
                )}

                {isLoading && <div className="rounded-md bg-white p-2 text-on-surface text-sm">Pensando...</div>}
              </div>
            </div>

            {/* Formulario de Entrada */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-surface-variant bg-white">
              {storageError && <p role="status" className="mb-2 text-sm text-error" aria-live="polite">{storageError}</p>}
              {chatConfigError && (
                <p role="alert" className="mb-2 text-sm text-error">
                  No se pudo cargar la configuración del asistente.{' '}
                  <button type="button" className="font-semibold underline" onClick={() => {
                    setChatConfigError(false);
                    setChatConfigLoaded(false);
                    setConfigAttempt(attempt => attempt + 1);
                  }}>Reintentar conexión</button>
                </p>
              )}
              {!chatConfigLoaded && <p role="status" className="mb-2 text-sm">Conectando con el asistente…</p>}
              {!noticesOpen && chatConfig?.proveedorExternoActivo && !aceptaEnvioProveedor && (
                <button type="button" className="mb-2 text-sm font-semibold underline" onClick={() => {
                  setNoticesOpen(true);
                  requestAnimationFrame(() => panel.current?.querySelector('#chat-notices input')?.focus());
                }}>Revisar autorización para enviar mensajes</button>
              )}
              <label htmlFor="chat-input" className="sr-only">
                Mensaje para el asistente
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  placeholder="Escribe tu pregunta..."
                  className="min-w-0 flex-1 rounded-md border border-outline-variant px-3 py-2 text-body-md focus:border-primary"
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
                  className="min-h-12 rounded-md bg-industrial-orange px-4 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
                >
                  {isLoading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Botón Flotante */}
      <button
        onClick={event => {
          if (open) closeChat();
          else { opener.current = event.currentTarget; setOpen(true); }
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-semibold text-white shadow-lg transition-colors hover:bg-primary-container"
        aria-label={open ? 'Cerrar asistente IA' : 'Abrir asistente IA'}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[28px]">{open ? 'close' : 'smart_toy'}</span>
        <span>{open ? 'Cerrar chat' : 'Asistente IA'}</span>
      </button>
    </div>
  );
}
