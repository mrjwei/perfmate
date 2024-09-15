import React from 'react'
import Link from 'next/link'
import clsx from 'clsx'

export default function LinkItem({href, children, className}: {href: string, children: React.ReactNode, className?: string | {[key: string]: boolean}}) {
  return (
    <Link href={href} className={clsx(
      "w-full flex items-center font-medium",
      className
    )}>
      {children}
    </Link>
  )
}
