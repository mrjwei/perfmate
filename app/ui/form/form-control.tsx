import React from "react"
import clsx from "clsx"
import { Label } from "@/components/ui/label"

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
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </Label>
      {children}
    </div>
  )
}
