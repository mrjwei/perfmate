"use client"

import React, { useState } from "react"
import { User } from "next-auth"
import { ChevronDownIcon } from "@heroicons/react/24/outline"
import Button from "@/app/ui/button/button"
import LinkItem from "@/app/ui/link-item/link-item"
import { signOut } from '@/app/lib/actions'

export default function GlobalHeader({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <header className="flex items-center justify-between relative">
      <h1>Logo</h1>
      <Button
        type="button"
        className="flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2">{user.name}</span>
        <ChevronDownIcon className="w-4" />
      </Button>
      {isOpen && (
        <ul className="absolute right-0 top-full">
          <li>
            <LinkItem href="/app/setting">Setting</LinkItem>
          </li>
          <li>
            <form action={signOut}>
              <Button type="submit">Sign Out</Button>
            </form>
          </li>
        </ul>
      )}
    </header>
  )
}
