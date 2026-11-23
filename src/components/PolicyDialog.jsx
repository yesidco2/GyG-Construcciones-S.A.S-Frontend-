import { useEffect, useRef } from 'react';

export default function PolicyDialog({ title, onClose, children }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousActiveElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      )];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement?.isConnected) previousActiveElement.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[85] overflow-y-auto bg-primary/70 p-2 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-dialog-title"
        className="relative mx-auto max-h-[calc(100vh-1rem)] max-w-6xl overflow-y-auto rounded-2xl bg-surface shadow-2xl sm:max-h-[calc(100vh-2.5rem)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-variant bg-white px-4 py-3">
          <h2 id="policy-dialog-title" className="font-semibold text-primary">{title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg border border-surface-variant px-3 py-2 font-semibold text-primary hover:bg-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-industrial-orange"
          >
            Cerrar
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
