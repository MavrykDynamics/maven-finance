import * as React from 'react';

type Props = {
  id: string;
  className?: string;
  width?: string;
  height?: string;
  white?: boolean;
};

export default function MediumIcon({ id, className = '', white = false, ...props }: Props) {
  const fillColor = white ? '#fff' : '#38237C';
  return (
    <svg viewBox="0 0 36 31" {...props}>
      <path
        d="M1.56522 0.794922L4.69565 4.84225V24.0729L0 30.2052H10.9565L6.26087 24.0729V6.95518L16.4348 30.2052L16.4333 30.216L25.8261 6.79217V27.0257L22.6957 30.2052H36L32.8696 27.0257L32.8482 4.37495L35.893 0.805789H26.4879L19.2565 18.8736L11.3448 0.794922H1.56522Z"
        fill={fillColor}
      />
    </svg>
  );
}
