import { CSSProperties, FC } from 'react';

const AVATAR_GRADIENTS: Array<[string, string]> = [
  ['#4BC8BE', '#039185'],
  ['#7c3aed', '#4f46e5'],
  ['#f59e0b', '#ef4444'],
  ['#3b82f6', '#0ea5e9'],
  ['#10b981', '#059669'],
  ['#ec4899', '#db2777'],
  ['#6366f1', '#8b5cf6'],
  ['#14b8a6', '#0891b2'],
  ['#f97316', '#ea580c'],
  ['#8b5cf6', '#6d28d9'],
];

const hashString = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export interface IdenticonProps {
  name: string;
  seed?: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const Identicon: FC<IdenticonProps> = ({
  name,
  seed,
  size,
  className = '',
  style,
}) => {
  const hashSeed = seed || name || '?';
  const [c1, c2] =
    AVATAR_GRADIENTS[hashString(hashSeed) % AVATAR_GRADIENTS.length];

  const inline: CSSProperties = {
    background: `linear-gradient(135deg, ${c1}, ${c2})`,
    ...(size ? { width: size, height: size, fontSize: size * 0.42 } : {}),
    ...style,
  };

  return (
    <div
      className={`hfs-forum__avatar ${className}`}
      style={inline}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
};

export { hashString, getInitials };
export default Identicon;
