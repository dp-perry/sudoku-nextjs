import React from "react";

type CardProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full'
  gap?: 'xs' | 'sm' | 'md' | 'lg'
  padded?: boolean
  children: React.ReactNode
}

const sizes = {
  sm: 'w-[150px] md:w-[350px] max-w-md',
  md: 'w-[350px] md:w-[540px] max-w-lg',
  lg: 'max-w-screen-lg w-full',
  full: 'w-full'
}

const gaps = {
  xs: 'gap',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-8',
  xl: 'gap-12',
}

export default function Card({className, size = 'md', gap = 'md', padded = true, children}: CardProps) {
  const classes = [
    'rounded-2xl bg-white',
    'flex flex-col shadow-sm',
    `${gaps[gap]} `,
    `${sizes[size]} `,
    `${padded ? 'p-6 md:p-8' : 'p-0'}`,
    className
  ]
  return (
    <div className={classes.join(' ') + ''}>
      {children}
    </div>
  )
}