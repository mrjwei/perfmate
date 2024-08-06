import React from 'react'
import Link from 'next/link'

export default function LinkItem({href, children}: {href: string, children: React.ReactNode}) {
  return (
    <Link href={href} className="block w-full px-8 py-2">
      {children}
    </Link>
  )
}
