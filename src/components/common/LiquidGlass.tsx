import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export type LiquidGlassVariant = 'default' | 'subtle' | 'strong';
export type LiquidGlassRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

export const liquidGlassVariants: Record<LiquidGlassVariant, string> = {
  default: 'liquid-glass',
  subtle: 'liquid-glass-subtle',
  strong: 'liquid-glass-strong',
};

const roundedMap: Record<LiquidGlassRounded, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

export interface LiquidGlassOptions {
  variant?: LiquidGlassVariant;
  interactive?: boolean;
  sheen?: boolean;
  rounded?: LiquidGlassRounded;
  className?: string;
}

/**
 * Utility function to compose the exact Liquid Glass classes for any element.
 */
export function getLiquidGlassClass({
  variant = 'default',
  interactive = false,
  sheen = true,
  rounded = '2xl',
  className = '',
}: LiquidGlassOptions = {}): string {
  return cn(
    liquidGlassVariants[variant] || liquidGlassVariants.default,
    roundedMap[rounded],
    sheen && 'liquid-glass-sheen',
    interactive && 'liquid-glass-interactive',
    className
  );
}

export interface LiquidGlassProps<T extends React.ElementType = 'div'> {
  /** Visual density & contrast variant */
  variant?: LiquidGlassVariant;
  /** Enables hover elevation, specular bloom, and micro-press physics */
  interactive?: boolean;
  /** Subtle optical light catch / refraction reflection sheen */
  sheen?: boolean;
  /** Border radius preset */
  rounded?: LiquidGlassRounded;
  /** Polymorphic component tag (e.g. 'div', 'button', 'aside', 'section') */
  as?: T;
  className?: string;
  children?: React.ReactNode;
}

type PolymorphicProps<T extends React.ElementType, P> = P &
  Omit<React.ComponentPropsWithoutRef<T>, keyof P | 'as'> & {
    as?: T;
  };

/**
 * LiquidGlass — Premium iOS-inspired glass material component.
 * 
 * Features:
 * - Crystal-clear optical translucency (no milky/frosted white fog)
 * - Backdrop blur with saturation boosting for underlying color vibrancy
 * - Razor-sharp micro-beveled specular edge highlights
 * - Dual-layer realistic contact & ambient drop shadows
 * - Theme-aware styling (light crystalline & dark obsidian violet)
 */
export const LiquidGlass = forwardRef(function LiquidGlass<T extends React.ElementType = 'div'>(
  {
    as,
    variant = 'default',
    interactive = false,
    sheen = true,
    rounded = '2xl',
    className,
    children,
    ...restProps
  }: PolymorphicProps<T, LiquidGlassProps<T>>,
  ref: React.Ref<Element>
) {
  const Component = as || 'div';

  const computedClassName = getLiquidGlassClass({
    variant,
    interactive,
    sheen,
    rounded,
    className,
  });

  return (
    <Component ref={ref} className={computedClassName} {...restProps}>
      {children}
    </Component>
  );
}) as <T extends React.ElementType = 'div'>(
  props: PolymorphicProps<T, LiquidGlassProps<T>> & { ref?: React.Ref<Element> }
) => React.ReactElement | null;

export default LiquidGlass;
