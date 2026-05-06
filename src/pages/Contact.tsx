import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../utils/useSEO';

const Contact = () => {
  useSEO({
    title: 'Contact Us',
    description:
      'Contact HairStylesForSeniors – send editorial questions, corrections, advertising enquiries, or general feedback to our team.',
    canonical: '/contact',
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact HairStylesForSeniors',
      url: 'https://nice-advice.info/contact',
      description: 'Get in touch with the HairStylesForSeniors editorial team.',
      mainEntity: {
        '@type': 'Organization',
        name: 'HairStylesForSeniors',
        email: 'support@nice-advice.info',
        url: 'https://nice-advice.info/',
      },
    },
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = encodeURIComponent(
      String(data.get('subject') || 'Website enquiry'),
    );
    const body = encodeURIComponent(
      `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get(
        'message',
      )}`,
    );
    window.location.href = `mailto:support@nice-advice.info?subject=${subject}&body=${body}`;
    setSubmitted(true);
    form.reset();
  };

  return (
    <div className="container section__padding flex flex-col gap-8">
      <h1 className="section__title text-3xl md:text-4xl">Contact Us</h1>
      <p className="section__description">
        We read every message. For editorial corrections, partnership ideas,
        advertising enquiries, or general feedback, please use the form below or
        email us directly at{' '}
        <a
          href="mailto:support@nice-advice.info"
          className="text-main underline"
        >
          support@nice-advice.info
        </a>
        . We typically reply within 2–3 business days.
      </p>

      <section
        aria-label="Contact form"
        className="bg-white dark:bg-additionalText p-6 rounded-lg flex flex-col gap-4"
      >
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="section__description font-semibold">
              Your name
            </span>
            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              className="border rounded p-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="section__description font-semibold">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="border rounded p-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="section__description font-semibold">Subject</span>
            <input
              type="text"
              name="subject"
              required
              maxLength={120}
              className="border rounded p-2"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="section__description font-semibold">Message</span>
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={4000}
              rows={6}
              className="border rounded p-2"
            />
          </label>
          <button
            type="submit"
            className="px-6 py-3 bg-main text-white rounded-md hover:bg-main3 transition-colors self-start"
          >
            Send message
          </button>
          {submitted && (
            <p role="status" className="section__description text-main mt-2">
              Your email client should now open with the message ready to send.
            </p>
          )}
        </form>
      </section>

      <h2 className="section__title text-2xl md:text-3xl mt-4">Other Links</h2>
      <ul className="section__description list-disc pl-6 flex flex-col gap-3">
        <li>
          <Link to="/about" className="text-main underline">
            About HairStylesForSeniors
          </Link>
        </li>
        <li>
          <Link to="/privacy" className="text-main underline">
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link to="/terms" className="text-main underline">
            Terms of Use
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Contact;
