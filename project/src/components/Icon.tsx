import { getIcon } from '../utils/icons';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
}

export function Icon({ name, size = 20, className, strokeWidth = 1.75, ...rest }: IconProps) {
  const Cmp = getIcon(name);
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} aria-hidden={rest['aria-hidden']} />;
}
