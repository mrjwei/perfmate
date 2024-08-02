import clsx from 'clsx'
import {TStatus} from '@/app/lib/types'
import {mapStatusToHumanReadableString} from '@/app/lib/helpers'

export default function Tag({testid, children, className}: {testid?: string, children: TStatus | null, className?: string}) {
  return (
    <div data-testid={testid} className={
      clsx(
        'px-4 py-2 text-2xl font-bold whitespace-nowrap',
        {
          'text-slate-400': children === 'BEFORE-WORK',
          'text-lime-600': children === 'IN-WORK',
          'text-purple-500': children === 'IN-BREAK',
          'text-red-500': children === 'AFTER-WORK',
        },
        className
      )
    }>
      {mapStatusToHumanReadableString(children)}
    </div>
  )
}
