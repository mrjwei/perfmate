"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  HomeModernIcon,
  DocumentChartBarIcon,
  RectangleStackIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline"
import {
  HomeModernIcon as HomeModernSolidIcon,
  DocumentChartBarIcon as DocumentChartBarSolidIcon,
  RectangleStackIcon as RectangleStackSolidIcon,
  Cog6ToothIcon as Cog6ToothSolidIcon
} from "@heroicons/react/24/solid"
import LinkItem from "@/app/ui/link-item/link-item"
import { IThread } from "@/app/lib/types"

// Matches /app/<threadId>/... (but not /app/threads or /app/setting, which
// aren't scoped to a thread).
const THREAD_ID_PATTERN = /^\/app\/(?!threads|setting)([^/]+)/

export default function Sidebar({ threads }: { threads: IThread[] }) {
  const pathname = usePathname()
  // Fall back to the first active thread so Home/Records stay reachable even
  // from pages that aren't scoped to a thread (e.g. /app/threads, /app/setting).
  const threadId = pathname.match(THREAD_ID_PATTERN)?.[1] ?? threads.find((t) => !t.archived)?.id

  const links = [
    ...(threadId
      ? [
          {
            href: `/app/${threadId}`,
            children: "Home",
            outlineIcon: <HomeModernIcon className="w-5" />,
            solidIcon: <HomeModernSolidIcon className="w-5" />,
          },
          {
            href: `/app/${threadId}/records`,
            children: "Records",
            outlineIcon: <DocumentChartBarIcon className="w-5" />,
            solidIcon: <DocumentChartBarSolidIcon className="w-5" />,
          },
        ]
      : []),
    {
      href: "/app/threads",
      children: "Threads",
      outlineIcon: <RectangleStackIcon className="w-5" />,
      solidIcon: <RectangleStackSolidIcon className="w-5" />,
    },
    {
      href: "/app/setting",
      children: "Setting",
      outlineIcon: <Cog6ToothIcon className="w-5" />,
      solidIcon: <Cog6ToothSolidIcon className="w-5" />,
    },
  ]

  return (
    <div className="self-stretch bg-slate-800 px-3 py-6 shadow-md fixed top-[56px] h-full z-10">
      <ul>
        {links.map((l) => {
          const { href, children, outlineIcon, solidIcon } = l
          const isActive = href === pathname
          return (
            <li key={href} className="mb-2">
              <LinkItem
                href={href}
                className={{
                  "w-full px-8 py-2 rounded-lg text-slate-800 bg-white hover:text-slate-600":
                    isActive,
                  "w-full px-8 py-2 rounded-lg text-white hover:bg-white/10":
                    !isActive,
                }}
              >
                <span className="mr-2">
                  {isActive ? solidIcon : outlineIcon}
                </span>
                <span>{children}</span>
              </LinkItem>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
