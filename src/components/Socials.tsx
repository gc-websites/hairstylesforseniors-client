import { facebook, instagram, linkedin } from '../utils/Icons';

const socialsData = {
  icons: [facebook, instagram, linkedin],
  names: ['Facebook', 'Instagram', 'LinkedIn'],
  links: [
    'https://www.facebook.com',
    'https://www.instagram.com',
    'https://www.linkendIn.com',
  ],
};

const Socials = ({ textClassName, IconsClassName }) => {
  return (
    <div className="flex flex-col gap-y-10">
      <div className="flex flex-col gap-y-4">
        <ul className="flex flex-col gap-y-4">
          {socialsData.icons.map((social, idx) => {
            return (
              <li key={idx}>
                <a
                  href={socialsData.links[idx]}
                  className={`font-poppins text-xl break-words flex gap-4 items-center ${textClassName}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    className={`md:w-10 md:h-10 w-8 h-8 ${IconsClassName}`}
                    viewBox="0 0 24 24"
                    fill="white"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {social}
                  </svg>
                  {socialsData.names[idx]}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Socials;
