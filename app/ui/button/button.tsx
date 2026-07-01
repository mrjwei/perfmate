import React from 'react'
import clsx from 'clsx'

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string
}

const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  function Button({children, className, ...rest}, ref) {
    return (
      <button ref={ref} className={
        clsx(
          'px-4 py-2 font-medium rounded-lg disabled:bg-slate-300 whitespace-nowrap box-border',
          className
        )
      } {...rest}>
        {children}
      </button>
    )
  }
)

export default Button
