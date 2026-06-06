import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Lightweight contact modal. Mirrors the /contact page: composes the message
// into a mailto: to the editorial inbox (no backend needed), with a friendly
// success state. Accessible: role=dialog, aria-modal, labelled fields, Escape
// / backdrop / close-button dismissal, body-scroll lock, focus on open.

const CONTACT_EMAIL = 'support@hairstylesforseniors.com';

const fieldClass =
  'rounded-xl border border-gray-300 dark:border-white/20 bg-white dark:bg-white/5 px-4 py-3 text-mainText dark:text-white placeholder-gray-400 focus:border-main2 focus:outline-none focus:ring-2 focus:ring-main/30 transition-colors';
const labelClass =
  'font-poppins text-sm font-semibold text-mainText dark:text-white';

const EmailForm = ({ handleFormClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') handleFormClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // The cookie-consent widget pins itself with `z-index: 9999 !important`,
    // which beats any normal Tailwind z-class. Force the overlay above it.
    overlayRef.current?.style.setProperty('z-index', '10001', 'important');
    firstFieldRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleFormClose]);

  const handleSubmit = e => {
    e.preventDefault();
    const subject = encodeURIComponent(
      `Website enquiry from ${name.trim() || 'a reader'}`,
    );
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleFormClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-form-title"
        onClick={e => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-mainText md:p-8"
      >
        <button
          type="button"
          onClick={handleFormClose}
          aria-label="Close contact form"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-additionalText transition-colors hover:bg-light hover:text-mainText focus:outline-none focus-visible:ring-2 focus-visible:ring-main dark:text-white dark:hover:bg-white/10"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-main/10">
              <svg
                className="h-8 w-8 text-main2 dark:text-main"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 id="contact-form-title" className="section__title text-2xl">
              Almost there!
            </h2>
            <p className="section__description text-base">
              Your email app should have opened with the message ready to send.
              If it didn’t, write to us at{' '}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-main2 underline dark:text-main"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <button
              type="button"
              onClick={handleFormClose}
              className="mt-2 rounded-full bg-main2 px-8 py-3 font-poppins font-semibold text-white transition-colors hover:bg-main3 focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 pr-8">
              <p className="mb-2 font-poppins text-xs font-semibold uppercase tracking-wider text-main">
                Get in touch
              </p>
              <h2
                id="contact-form-title"
                className="section__title text-2xl md:text-3xl"
              >
                Send us a message
              </h2>
              <p className="section__description mt-2 text-sm">
                Questions, corrections, or just want to say hello? We usually
                reply within 2–3 business days.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-name" className={labelClass}>
                  Name
                </label>
                <input
                  id="cf-name"
                  ref={firstFieldRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Your name"
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="cf-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-message" className={labelClass}>
                  Your message
                </label>
                <textarea
                  id="cf-message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  minLength={10}
                  maxLength={4000}
                  rows={5}
                  placeholder="How can we help?"
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleFormClose}
                  className="rounded-full px-6 py-3 font-poppins font-semibold text-mainText transition-colors hover:bg-light focus:outline-none focus-visible:ring-2 focus-visible:ring-main dark:text-white dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-main2 px-8 py-3 font-poppins font-semibold text-white transition-colors hover:bg-main3 focus:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:ring-offset-2"
                >
                  Send message
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default EmailForm;
