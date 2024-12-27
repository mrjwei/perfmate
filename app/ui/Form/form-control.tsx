import React from "react"
import clsx from "clsx"

export default function FormControl({
  className,
  labelClassName,
  label,
  htmlFor,
  children,
  isGrid = true,
}: {
  className?: string
  labelClassName?: string
  label: string
  htmlFor: string
  children: React.ReactNode
  isGrid?: boolean
}) {
  return (
    <div className={clsx(
      {
        'grid grid-cols-12 gap-x-4': isGrid
      },
      className
    )}>
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </label>
      {children}
    </div>
  )
}
