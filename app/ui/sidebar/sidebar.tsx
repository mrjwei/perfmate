"use client"

import React from "react"
import { usePathname } from "next/navigation"
import {
  HomeModernIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline"
import {
  HomeModernIcon as HomeModernSolidIcon,
  DocumentChartBarIcon as DocumentChartBarSolidIcon,
  Cog6ToothIcon as Cog6ToothSolidIcon
} from "@heroicons/react/24/solid"
import LinkItem from "@/app/ui/link-item/link-item"
import WorkspaceSwitcher from "@/app/ui/sidebar/workspace-switcher"
import { IWorkspace } from "@/app/lib/types"

// Matches /app/<workspaceId>/... (but not /app/workspaces or /app/setting, which
// aren't scoped to a workspace).
const WORKSPACE_ID_PATTERN = /^\/app\/(?!workspaces|setting)([^/]+)/

export default function Sidebar({ workspaces }: { workspaces: IWorkspace[] }) {
  const pathname = usePathname()
  // Fall back to the first active workspace so Home/Records stay reachable even
  // from pages that aren't scoped to a workspace (e.g. /app/workspaces, /app/setting).
  const workspaceId = pathname.match(WORKSPACE_ID_PATTERN)?.[1] ?? workspaces.find((t) => !t.archived)?.id

  const links = [
    ...(workspaceId
      ? [
          {
            href: `/app/${workspaceId}`,
            children: "Home",
            outlineIcon: <HomeModernIcon className="w-5" />,
            solidIcon: <HomeModernSolidIcon className="w-5" />,
          },
          {
            href: `/app/${workspaceId}/records`,
            children: "Records",
            outlineIcon: <DocumentChartBarIcon className="w-5" />,
            solidIcon: <DocumentChartBarSolidIcon className="w-5" />,
          },
        ]
      : []),
    {
      href: "/app/setting",
      children: "Setting",
      outlineIcon: <Cog6ToothIcon className="w-5" />,
      solidIcon: <Cog6ToothSolidIcon className="w-5" />,
    },
  ]

  return (
    <div className="self-stretch bg-neutral-900 px-3 py-6 shadow-md fixed top-[56px] h-full z-10">
      <div className="mb-4">
        <WorkspaceSwitcher workspaces={workspaces} />
      </div>
      <ul>
        {links.map((l) => {
          const { href, children, outlineIcon, solidIcon } = l
          const isActive = href === pathname
          return (
            <li key={href} className="mb-2">
              <LinkItem
                href={href}
                className={{
                  "w-full px-8 py-2 rounded-lg text-foreground bg-card hover:text-muted-foreground":
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
