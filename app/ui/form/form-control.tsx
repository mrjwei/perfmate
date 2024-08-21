import React from "react"
import clsx from "clsx"

export default function FormControl({
  className,
  labelClassName,
  label,
  htmlFor,
  children,
}: {
  className?: string
  labelClassName?: string
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className={clsx("grid grid-cols-12 gap-x-4", className)}>
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </label>
      {children}
    </div>
  )
}
