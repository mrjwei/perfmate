import React from 'react'
import clsx from 'clsx'
import {TStatus} from '@/app/lib/types'
import {mapStatusToHumanReadableString} from '@/app/lib/helpers'

export default function Tag({testid, children, className}: {testid?: string, children: TStatus | null, className?: string}) {
  return (
    <div data-testid={testid} className={
      clsx(
        'px-4 py-2 font-bold whitespace-nowrap',
        {
          'text-muted-foreground': children === 'BEFORE-WORK',
          'text-success': children === 'IN-WORK',
          'text-warning': children === 'IN-BREAK',
          'text-destructive': children === 'AFTER-WORK',
        },
        className
      )
    }>
      {mapStatusToHumanReadableString(children)}
    </div>
  )
}
