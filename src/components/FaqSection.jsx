import { useState } from 'react';

export default function FaqSection({ id, eyebrow = 'Resolvemos tus dudas', title, items }) {
  const [openQuestion, setOpenQuestion] = useState(null);

  return (
    <section id={id} className="bg-surface py-xl">
      <div className="mx-auto max-w-4xl px-margin-mobile md:px-md">
        <div className="mb-lg text-center">
          <p className="font-label-caps text-label-caps uppercase tracking-[0.2em] text-industrial-orange">
            {eyebrow}
          </p>
          <h2 className="mt-xs font-headline-lg text-headline-lg text-primary">{title}</h2>
        </div>
        <div className="space-y-sm">
          {items.map(({ question, answer }, index) => {
            const isOpen = openQuestion === index;
            const answerId = `${id}-answer-${index}`;

            return (
              <article key={question} className="overflow-hidden rounded-xl border border-surface-variant bg-white">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenQuestion(isOpen ? null : index)}
                    className="flex min-h-14 w-full items-center justify-between gap-md px-md py-sm text-left font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-industrial-orange"
                  >
                    {question}
                    <span className="material-symbols-outlined shrink-0" aria-hidden="true">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                </h3>
                <div id={answerId} hidden={!isOpen} className="border-t border-surface-variant px-md py-sm text-secondary">
                  {answer}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
