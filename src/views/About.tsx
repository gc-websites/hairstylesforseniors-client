import { goals, vision, values } from '../utils/Icons';

const cards = [
  {
    icon: goals,
    viewBox: '0 0 32 32',
    title: 'Our Mission',
    text: 'Deliver reliable, easy-to-follow hair-care advice for people 50 and up — in plain language, free from jargon, and rooted in real reader questions.',
  },
  {
    icon: vision,
    viewBox: '0 0 512 512',
    title: 'Our Vision',
    text: 'To be the go-to destination for hair care after 50 — a place where readers feel welcomed, informed, and confident about the choices they make.',
  },
  {
    icon: values,
    viewBox: '0 0 24 24',
    title: 'Our Values',
    text: 'Integrity, curiosity, and inclusivity are at the heart of everything we do — in all our content and every interaction with our readers.',
  },
];

const About = () => {
  return (
    <section className="bg-slate-50 dark:bg-additionalText">
      <div className="container section__padding">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <p className="font-poppins text-main font-semibold uppercase tracking-wider text-sm mb-3">
            Who we are
          </p>
          <h2 className="section__title text-3xl md:text-4xl mb-4">
            About HairStylesForSeniors
          </h2>
          <p className="section__description">
            We write friendly, practical hair-care articles for adults 50 and up
            — from senior-friendly hairstyles and gentle routines to gray
            coverage, thinning hair, color, and product reviews. Trusted advice,
            in plain language.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {cards.map(card => (
            <div
              key={card.title}
              className="bg-white dark:bg-mainText rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-main/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 fill-main2 dark:fill-main"
                  viewBox={card.viewBox}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {card.icon}
                </svg>
              </div>
              <h3 className="section__title text-xl mb-3">{card.title}</h3>
              <p className="section__description text-base">{card.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
