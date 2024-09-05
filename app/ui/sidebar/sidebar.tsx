'use client'

import React from 'react'
import {usePathname} from 'next/navigation'
import {
  HomeModernIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import {
  HomeModernIcon as HomeModernSolidIcon,
  DocumentChartBarIcon as DocumentChartBarSolidIcon
} from '@heroicons/react/24/solid';
import LinkItem from '@/app/ui/link-item/link-item'

const LINKS = [
  {href: '/app', children: 'Home', outlineIcon: <HomeModernIcon className="w-5" />, solidIcon: <HomeModernSolidIcon className="w-5" /> },
  {href: '/app/records', children: 'Records', outlineIcon: <DocumentChartBarIcon className="w-5" />, solidIcon: <DocumentChartBarSolidIcon className="w-5" />},
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <div className="self-stretch bg-white text-white p-3 shadow-md fixed top-[56px] h-full z-10">
      <ul>
        {LINKS.map((l: typeof LINKS[0]) => {
          const {href, children, outlineIcon, solidIcon } = l
          return (
            <li key={href} className="mb-2">
              <LinkItem href={href} className={{
                'rounded-lg text-slate-800 bg-lime-200/75 hover:bg-lime-bg-lime-50': href === pathname,
                'rounded-lg text-slate-600 hover:text-slate-800 hover:bg-lime-200/75': href !== pathname
              }}>
                <span className="mr-2">{href === pathname ? solidIcon : outlineIcon}</span>
                <span>{children}</span>
              </LinkItem>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
