"use client"

import React, { useState, useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/navigation"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import LinkItem from "@/app/ui/link-item/link-item"
import { IWorkspace } from "@/app/lib/types"

export default function WorkspaceSwitcher({ workspaces }: { workspaces: IWorkspace[] }) {
  const t = useTranslations("Nav")
  const pathname = usePathname()
  const currentWorkspaceId = pathname.match(/^\/app\/(?!workspaces|setting)([^/]+)/)?.[1]
  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId)
  const activeWorkspaces = workspaces.filter((w) => !w.archived)

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

  if (activeWorkspaces.length === 0) {
    return null
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        className={`flex items-center justify-between w-full text-white hover:bg-white/10 ${isOpen ? "bg-white/10" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        ref={buttonRef}
      >
        <span className="mr-2 truncate">{currentWorkspace ? currentWorkspace.name : t("selectWorkspace")}</span>
        {isOpen ? <ChevronUpIcon className="w-4 shrink-0" /> : <ChevronDownIcon className="w-4 shrink-0" />}
      </Button>
      {isOpen && (
        <ul className="absolute left-0 top-[44px] bg-card shadow-md rounded-lg p-2 w-56 z-50" ref={menuRef}>
          {activeWorkspaces.map((w) => (
            <li key={w.id}>
              <LinkItem
                href={`/app/${w.id}`}
                className={`w-full px-4 py-2 rounded-lg hover:bg-muted ${w.id === currentWorkspaceId ? "font-bold" : ""}`}
              >
                {w.name}
              </LinkItem>
            </li>
          ))}
          <li className="border-t border-border mt-2 pt-2">
            <LinkItem href="/app/workspaces" className="w-full px-4 py-2 rounded-lg text-primary hover:bg-muted">
              {t("manageWorkspaces")}
            </LinkItem>
          </li>
        </ul>
      )}
    </div>
  )
}
