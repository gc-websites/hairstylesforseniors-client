import { FC } from 'react';

type LogoProps = {
  className?: string;
  isLink?: boolean;
  spanClassName?: string;
};

const Logo: FC<LogoProps> = ({
  className = '',
  spanClassName = '',
  isLink = false,
}) => {
  return isLink ? (
    <a
      href="/"
      className={`font-bold font-merriweather text-main ${className}`}
    >
      HairStyles
      <span className={`text-main3 ${spanClassName}`}>ForSeniors</span>
    </a>
  ) : (
    <p className={`font-bold font-merriweather text-main ${className}`}>
      HairStyles
      <span className={`text-main3 ${spanClassName}`}>ForSeniors</span>
    </p>
  );
};

export default Logo;
