import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SIZES = { sm: 28, md: 48, lg: 52, xl: 72 } as const;

type LogoSize = keyof typeof SIZES;

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

/**
 * Torch-bearer mark from designs/assets.
 * Light: logo.webp + multiply (white plate drops onto cream).
 * Dark: logo-dark.png (cream figure on transparent).
 */
export function Logo({ size = 'lg', className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const px = SIZES[size];
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <img
      src={isDark ? '/logo-dark.png' : '/logo.webp'}
      alt=""
      width={px}
      height={px}
      draggable={false}
      className={cn(
        'select-none object-contain',
        isDark ? 'mix-blend-normal' : 'mix-blend-multiply',
        className,
      )}
      style={{ width: px, height: px }}
    />
  );
}
