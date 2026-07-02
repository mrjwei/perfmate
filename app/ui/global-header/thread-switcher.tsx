"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import LinkItem from "@/app/ui/link-item/link-item"
import { IThread } from "@/app/lib/types"

export default function ThreadSwitcher({ threads }: { threads: IThread[] }) {
  const pathname = usePathname()
  const currentThreadId = pathname.match(/^\/app\/(?!threads|setting)([^/]+)/)?.[1]
  const currentThread = threads.find((t) => t.id === currentThreadId)
  const activeThreads = threads.filter((t) => !t.archived)

  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const handleClickOnWindow = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        menuRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleClickOnWindow)
    return () => document.removeEventListener("click", handleClickOnWindow)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  if (activeThreads.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        className={`flex items-center text-foreground ${isOpen ? "bg-muted" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        ref={buttonRef}
      >
        <span className="mr-2">{currentThread ? currentThread.name : "Select a thread"}</span>
        {isOpen ? <ChevronUpIcon className="w-4" /> : <ChevronDownIcon className="w-4" />}
      </Button>
      {isOpen && (
        <ul className="absolute left-0 top-[44px] bg-card shadow-md rounded-lg p-2 w-56 z-50" ref={menuRef}>
          {activeThreads.map((t) => (
            <li key={t.id}>
              <LinkItem
                href={`/app/${t.id}`}
                className={`w-full px-4 py-2 rounded-lg hover:bg-muted ${t.id === currentThreadId ? "font-bold" : ""}`}
              >
                {t.name}
              </LinkItem>
            </li>
          ))}
          <li className="border-t border-border mt-2 pt-2">
            <LinkItem href="/app/threads" className="w-full px-4 py-2 rounded-lg text-primary hover:bg-muted">
              Manage threads
            </LinkItem>
          </li>
        </ul>
      )}
    </div>
  )
}
