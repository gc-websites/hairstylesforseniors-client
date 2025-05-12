import { goals, vision, values } from '../utils/Icons';

const About = () => {
  return (
    <section className="container section__padding">
      <h2 className="section__title mb-6">About Us</h2>
      <p className="section__description mb-4">
        Welcome to our information portal! Our mission is to provide readers
        with the most engaging and up-to-date articles across various topics.
        Our team of experienced writers explores and highlights subjects that
        resonate with contemporary society.
      </p>
      <p className="section__description mb-4">
        We believe that knowledge is power. Our materials aim to inform,
        inspire, and broaden the horizons of our readers. Whether you're seeking
        advice on a healthy lifestyle, technological news, or cultural reviews,
        we have something for everyone.
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
            To deliver high-quality, reliable, and diverse content that caters
            to the interests and needs of our readers, fostering a community of
            informed individuals.
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
            To become a leading platform for insightful articles, where readers
            can find inspiration, knowledge, and a deeper understanding of the
            world around them.
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
