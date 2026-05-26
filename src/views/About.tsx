import { goals, vision, values } from '../utils/Icons';

const About = () => {
  return (
    <section className="container section__padding">
      <h2 className="section__title mb-6">About Us</h2>
      <p className="section__description mb-4">
        Welcome to HairStylesForSeniors. We write friendly, practical hair-care
        articles for adults 50 and up — covering the everyday questions that
        come up as our hair (and lives) change with age.
      </p>
      <p className="section__description mb-4">
        From senior-friendly hairstyles and gentle care routines to gray
        coverage, thinning hair, color choices, and product reviews — our team
        of experienced writers shares trusted advice in plain language.
      </p>

      <div className="flex flex-wrap justify-center items-start mt-8">
        <div className="w-full md:w-1/3 p-4">
          <svg
            className="w-16 h-16 mx-auto mb-4 fill-main2"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {goals}
          </svg>
          <h3 className="section__title mb-2 text-center">Our Mission</h3>
          <p className="section__description">
            Deliver reliable, easy-to-follow hair-care advice for people 50 and
            up — written in plain language, free from jargon, and rooted in real
            reader questions.
          </p>
        </div>

        <div className="w-full md:w-1/3 p-4">
          <svg
            className="w-16 h-16 mx-auto mb-4 fill-main2"
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {vision}
          </svg>
          <h3 className="section__title mb-2 text-center">Our Vision</h3>
          <p className="section__description">
            To be the go-to destination for hair care and hairstyles after 50 —
            a place where readers feel welcomed, informed, and confident about
            the choices they make for their hair.
          </p>
        </div>

        <div className="w-full md:w-1/3 p-4">
          <svg
            className="w-16 h-16 mx-auto mb-4 fill-main2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {values}
          </svg>
          <h3 className="section__title mb-2 text-center">Our Values</h3>
          <p className="section__description">
            Integrity, curiosity, and inclusivity are at the heart of everything
            we do. We strive to uphold these principles in all our content and
            interactions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
