"use client"

import React, { useState } from "react"
import { User } from "next-auth"
import Link from 'next/link'
import { League_Spartan } from "next/font/google";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import Button from "@/app/ui/button/button"
import LinkItem from "@/app/ui/link-item/link-item"
import { signOut } from '@/app/lib/actions'

const spartan = League_Spartan({ subsets: ["latin"] });

export default function GlobalHeader({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <header className="flex items-center justify-between py-2 px-8 shadow bg-lime-600 fixed z-50 w-full">
      <h1 className={`${spartan.className} text-white text-2xl font-bold`}>
        <Link href='/app'>
          PERFMATE
        </Link>
      </h1>
      <Button
        type="button"
        className="flex items-center text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="mr-2">{user.name}</span>
        {isOpen ? (<ChevronUpIcon className="w-4" />) : (<ChevronDownIcon className="w-4" />)}
      </Button>
      {isOpen && (
        <ul className="absolute right-8 top-[50px] bg-white shadow-md rounded-lg p-2">
          <li>
            <LinkItem href="/app/setting" className="rounded-lg hover:bg-lime-200/75">Setting</LinkItem>
          </li>
          <li>
            <form action={signOut}>
              <Button type="submit" className="w-full px-8 py-2 flex items-center rounded-lg font-medium hover:bg-lime-200/75">Sign Out</Button>
            </form>
          </li>
        </ul>
      )}
    </header>
  )
}
