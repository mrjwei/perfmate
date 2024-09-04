import React from 'react'
import LinkItem from '@/app/ui/link-item/link-item'

const LINKS = [
  {href: '/app', children: 'Home'},
  {href: '/app/records', children: 'Records'},
]

export default function Sidebar() {
  return (
    <div className="self-stretch bg-lime-600 text-white py-8">
      <ul>
        {LINKS.map((l: typeof LINKS[0]) => {
          const {href, children } = l
          return (
            <li key={href}>
              <LinkItem href={href}>{children}</LinkItem>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
