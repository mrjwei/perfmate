import React from 'react'
import LinkItem from '@/app/ui/link-item/link-item'
import Button from '@/app/ui/button/button'
import { signOut } from '@/auth'

const LINKS = [
  {href: '/', children: 'Home'},
  {href: '/records', children: 'Records'},
  {href: '/setting', children: 'Setting'},
]

export default function Sidebar() {
  return (
    <div className="self-stretch bg-lime-600 text-white py-8">
      <h1>Logo</h1>
      <ul>
        {LINKS.map((l: any) => {
          const {href, children } = l
          return (
            <li key={href}>
              <LinkItem href={href}>{children}</LinkItem>
            </li>
          )
        })}
      </ul>
      <form action={
        async () => {
          'use server'
          await signOut()
        }
      }>
        <Button type="submit">
          Sign Out
        </Button>
      </form>
    </div>
  )
}
