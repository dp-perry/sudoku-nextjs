import Link from "next/link";
import React from "react";
import { buttonClassNames, ButtonDensity, ButtonVariant } from "@/components/Form/Button";

type LinkButtonProps = {
  href: string;
  target?: '_self' | '_blank';
  variant?: ButtonVariant;
  density?: ButtonDensity;
  fullWidth?: boolean;
  className?: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
  children: React.ReactNode
}

export default function LinkButton(
  {href, target = '_self', variant = 'primary', density = 'comfortable', fullWidth = true, className = '', ariaLabel, icon, children}: LinkButtonProps
){
  // The link itself carries the button styling — nesting a <button> inside an <a>
  // is invalid and swallows keyboard activation.
  return (
    <Link
      href={href}
      target={target}
      aria-label={ariaLabel}
      className={buttonClassNames({variant, density, size: fullWidth ? 'full' : 'fit', className})}
    >
      {icon}
      {children}
    </Link>
  )
}
