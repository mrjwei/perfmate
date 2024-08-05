import clsx from 'clsx'

export default function FormControl({className, label, htmlFor, children}: {className?: string, label: string, htmlFor: string, children: React.ReactNode}) {
  return (
    <div className={clsx('flex', className)}>
      <label htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}
