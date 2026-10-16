import React, { useEffect, useState } from 'react';

const fallbackResponses = [
  'Para resolver dudas de SST, revisa primero el tipo de actividad, los riesgos asociados y los EPP mínimos recomendados. Si quieres, puedo orientarte sobre trabajo en alturas, riesgo eléctrico o excavaciones.',
  'La normativa en obra exige evaluación de riesgos, instrucción previa y uso obligatorio de EPE. Si compartes tu caso específico, te puedo guiar en la mejor práctica.',
  'Para trabajos en altura, el principal control es la línea de vida y la formación del personal. También es clave revisar el plan de trabajo y la inspección general del área.',
];

const getFallbackAnswer = () => fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

const getLocalHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('gg-chat-history') || '[]');
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

  useEffect(() => {
    if (!open) return;
    const saved = getLocalHistory();
    if (saved.length > 0) {
      setMessages(saved.slice(-4));
      setShowFAQ(false);
    } else {
      setShowFAQ(true);
    }
  }, [open]);

  const saveHistory = (nextMessages) => {
    try {
      localStorage.setItem('gg-chat-history', JSON.stringify(nextMessages.slice(-20)));
    } catch (error) {
      console.warn('No se pudo guardar el historial local del chat:', error);
    }
  };

  const handleSelectFAQ = async (faq) => {
    const userMessage = { type: 'user', text: faq.question };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setShowFAQ(false);
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pregunta: faq.question }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiText = data?.respuesta || faq.answer;
          const botMessage = { type: 'bot', text: aiText };
          const updated = [...nextMessages, botMessage];
          setMessages(updated);
          saveHistory(updated);
          setIsLoading(false);
          return;
        }
      }

      // Fallback si no hay API o falla
      const botMessage = { type: 'bot', text: faq.answer };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } catch (error) {
      console.error('FAQ API error:', error);
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

    const userMessage = { type: 'user', text: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('VITE_API_URL no está configurada en .env');
      }

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      const aiText = data?.respuesta || getFallbackAnswer();
      const botMessage = { type: 'bot', text: aiText };
      const updated = [...nextMessages, botMessage];
      setMessages(updated);
      saveHistory(updated);
    } catch (error) {
      console.error('Chat API error:', error);
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
            <button
              onClick={() => setOpen(false)}
              className="text-white opacity-90 hover:opacity-100"
              aria-label="Cerrar asistente IA"
              type="button"
            >
              ✕
            </button>
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
              disabled={isLoading || !input.trim()}
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