import { Link } from 'react-router-dom';

interface LandingLogoProps {
  size?: 'sm' | 'md';
  asLink?: boolean;
}

const LandingLogo = ({ size = 'md', asLink = true }: LandingLogoProps) => {
  const tile = size === 'sm' ? 'h-6 w-6 text-[13px]' : 'h-7 w-7 text-sm';
  const word = size === 'sm' ? 'text-base' : 'text-lg';

  const inner = (
    <span className="flex items-center gap-2">
      <span
        className={`${tile} inline-flex items-center justify-center rounded-sm bg-[hsl(var(--marketing-text))] font-display font-black tracking-tight text-[hsl(var(--marketing-surface))]`}
      >
        A
      </span>
      <span
        className={`font-display font-bold tracking-tight text-[hsl(var(--marketing-text))] ${word}`}
      >
        Agntive
      </span>
    </span>
  );

  return asLink ? (
    <Link to="/" className="flex items-center">
      {inner}
    </Link>
  ) : (
    inner
  );
};

export default LandingLogo;
