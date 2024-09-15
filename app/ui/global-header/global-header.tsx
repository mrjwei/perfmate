"use client"

import React, { useState, useEffect, useRef } from "react"
import { User } from "next-auth"
import Link from 'next/link'
import { League_Spartan } from "next/font/google";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import Button from "@/app/ui/button/button"
import LinkItem from "@/app/ui/link-item/link-item"
import { signOut } from '@/app/lib/actions'
import { INotification } from "@/app/lib/types"

const spartan = League_Spartan({ subsets: ["latin"] });

export default function GlobalHeader({ user, notifications }: { user: User, notifications: INotification[] | null }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false)

  const profileRef = useRef<HTMLButtonElement>(null)
  const notificationRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOnWindow = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationMenuOpen(false)
      }
    }
    document.addEventListener('click', handleClickOnWindow)
    return () => document.removeEventListener('click', handleClickOnWindow)
  }, [])

  return (
    <header className="flex items-center justify-between py-2 px-8 shadow bg-white fixed z-50 w-full">
      <h1 className={`${spartan.className} text-slate-800 text-2xl font-bold align-middle`}>
        <Link href='/app' className="align-[-8px]">
          PERFMATE
        </Link>
      </h1>
      <div className="flex items-center">
        <Button
          type="button"
          className=""
          onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}
          ref={notificationRef}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="rgb(15 23 42)" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            {notifications && notifications.length > 0 && <circle stroke="white" strokeWidth={2} cx="18" cy="7" r="5" fill="red" />}
          </svg>
        </Button>
        <Button
          type="button"
          className="flex items-center text-slate-800"
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          ref={profileRef}
        >
          <span className="mr-2">{user.name}</span>
          {isProfileMenuOpen ? (<ChevronUpIcon className="w-4" />) : (<ChevronDownIcon className="w-4" />)}
        </Button>
      </div>
      {isProfileMenuOpen && (
        <ul className="absolute right-8 top-[68px] bg-white shadow-md rounded-lg p-2">
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
      {notifications && isNotificationMenuOpen && (
        <ul className="absolute right-8 top-[68px] bg-white shadow-md rounded-lg p-2">
          {notifications.map(n => {
            return (
              <li key={n.navigateToPath}>
                <LinkItem href={n.navigateToPath} className="rounded-lg hover:bg-lime-200/75">{n.text}</LinkItem>
              </li>
            )
          })}
        </ul>
      )}
    </header>
  )
}
