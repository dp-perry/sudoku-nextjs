import React from "react";

export type ButtonVariant =
  'primary' | 'secondary' | 'plain' | 'outline' | 'danger' | 'danger_soft' | 'tool';
export type ButtonDensity = 'compact' | 'comfortable' | 'touch' | 'square';
export type ButtonSize = 'full' | 'fit';

export const buttonThemes = {
  base: [
    'relative inline-flex items-center justify-center gap-2',
    'rounded-xl font-sans font-semibold text-base text-center align-middle',
    'select-none cursor-pointer',
    'transition-[color,background-color,border-color,box-shadow,transform] duration-100',
    'active:scale-[0.97]',
    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none disabled:active:scale-100',
  ],
  variants: {
    primary: 'bg-primary text-white shadow-sm hover:bg-primary-hover active:bg-primary-active',
    secondary: 'bg-white text-zinc-800 border border-zinc-200 shadow-xs hover:bg-zinc-50 active:bg-zinc-100',
    plain: 'text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200',
    outline: 'border border-zinc-300 text-zinc-800 hover:bg-zinc-50 active:bg-zinc-100',
    danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 active:bg-red-800',
    danger_soft: 'bg-white text-red-700 border border-red-200 shadow-xs hover:bg-red-50 active:bg-red-100',
    // Icon above label, used for the board control strip
    tool: 'flex-col gap-1 rounded-2xl bg-white text-zinc-600 border border-zinc-200 shadow-xs font-medium text-xs md:text-sm hover:bg-zinc-50 active:bg-zinc-100',
  },
  // Applied on top of the variant when `pressed` is true
  pressed: {
    tool: 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300 hover:bg-emerald-50',
    default: 'ring-2 ring-primary ring-offset-1',
  },
  densities: {
    compact: 'min-h-9 px-3 py-1.5 text-sm',
    comfortable: 'min-h-11 px-4 py-2',
    touch: 'min-h-touch px-5 py-3',
    // For buttons laid out by a grid that supplies their own width, e.g. the digit pad
    square: 'min-h-touch p-1',
  },
  sizes: {
    full: 'w-full',
    fit: 'w-fit',
  },
}

/** Shared class builder so link-shaped buttons can look identical without nesting
 *  a <button> inside an <a>. */
export const buttonClassNames = (
  {variant = 'primary', size = 'full', density = 'comfortable', pressed = false, className = ''}:
    {variant?: ButtonVariant, size?: ButtonSize, density?: ButtonDensity, pressed?: boolean, className?: string}
) => [
  ...buttonThemes.base,
  buttonThemes.variants[variant],
  buttonThemes.densities[density],
  buttonThemes.sizes[size],
  pressed ? (buttonThemes.pressed[variant as keyof typeof buttonThemes.pressed] ?? buttonThemes.pressed.default) : '',
  className,
].join(' ');

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  size?: ButtonSize;
  density?: ButtonDensity;
  /** Renders aria-pressed and the variant's toggled styling */
  pressed?: boolean;
  ariaLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function Button(
  {
    children,
    variant = 'primary',
    type = 'button',
    size = 'full',
    density = 'comfortable',
    pressed,
    ariaLabel,
    icon,
    className = '',
    disabled = false,
    onClick,
  }: ButtonProps)
{
  const buttonClasses = buttonClassNames({variant, size, density, pressed, className});

  return(
    <button
      className={buttonClasses}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={pressed}
    >
      {icon}
      {children}
    </button>
  )
}
