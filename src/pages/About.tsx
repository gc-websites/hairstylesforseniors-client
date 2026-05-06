import { Link } from 'react-router-dom';
import AboutView from '../views/About';
import { useSEO } from '../utils/useSEO';

const About = () => {
  useSEO({
    title: 'About Us',
    description:
      'Learn about HairStylesForSeniors – our editorial mission, vision, values, and the team that publishes practical, well-researched articles on health, family, sports, nutrition, and lifestyle.',
    canonical: '/about',
    type: 'website',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About HairStylesForSeniors',
      url: 'https://nice-advice.info/about',
      description:
        'Editorial mission, values, and team behind HairStylesForSeniors.',
      mainEntity: {
        '@type': 'Organization',
        name: 'HairStylesForSeniors',
        url: 'https://nice-advice.info/',
      },
    },
  });

  return (
    <div className="container section__padding flex flex-col gap-8">
      <h1 className="section__title text-3xl md:text-4xl">About Us</h1>
      <p className="section__description">
        HairStylesForSeniors is an independent editorial website publishing
        practical, well-researched articles on health, family, sports,
        nutrition, body wellness, and everyday lifestyle. Our goal is to make
        reliable advice accessible to everyone — written in plain language and
        organised around the real questions readers ask every day.
      </p>
      <p className="section__description">
        Every article is written or reviewed by our editorial team and
        cross-checked against reputable medical, scientific, and lifestyle
        sources. We publish original photography, references, and author bios on
        every piece so readers can see who is behind the words.
      </p>

      <AboutView />

      <h2 className="section__title text-2xl md:text-3xl mt-4">
        Editorial Standards
      </h2>
      <ul className="section__description list-disc pl-6 flex flex-col gap-3">
        <li>
          <strong>Accuracy first.</strong> We cite credible sources and update
          articles when new evidence emerges.
        </li>
        <li>
          <strong>Author transparency.</strong> Every post is signed by a named
          author with a public profile page.
        </li>
        <li>
          <strong>No medical substitution.</strong> Our articles are
          informational and never replace personalised advice from a qualified
          professional.
        </li>
        <li>
          <strong>Independent advertising.</strong> Editorial content is kept
          separate from sponsored placements; ads are clearly distinguishable.
        </li>
        <li>
          <strong>Reader-first design.</strong> We prioritise readability,
          accessibility, and a fast, ad-light experience.
        </li>
      </ul>

      <h2 className="section__title text-2xl md:text-3xl mt-4">
        How to Reach Us
      </h2>
      <p className="section__description">
        Questions, corrections, or partnership ideas are always welcome. Visit
        our{' '}
        <Link to="/contact" className="text-main underline">
          contact page
        </Link>{' '}
        or read our{' '}
        <Link to="/privacy" className="text-main underline">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link to="/terms" className="text-main underline">
          Terms of Use
        </Link>
        .
      </p>
    </div>
  );
};

export default About;
