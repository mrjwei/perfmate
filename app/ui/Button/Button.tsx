import React from 'react'
import clsx from 'clsx'

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string
  ref?: any
}

export default function Button({children, className, ...rest}: IButtonProps) {
  return (
    <button className={
      clsx(
        'px-4 py-2 font-medium rounded-lg disabled:bg-slate-300 whitespace-nowrap box-border',
        className
      )
    } {...rest}>
      {children}
    </button>
  )
}
