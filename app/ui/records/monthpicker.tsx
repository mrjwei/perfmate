'use client'

import {useEffect, useRef, useCallback} from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import {useSearchParams, useRouter, usePathname} from 'next/navigation'
import Link from 'next/link'
import FormControl from "@/app/ui/form/form-control"
import {
  getMonthIndex,
  getMonthStr,
  createPageURL
} from '@/app/lib/helpers'

export default function MonthPicker({uniqueMonths}: {uniqueMonths: string[]}) {
  const searchParams = useSearchParams()
  const currentPageIndex = Number(searchParams.get('page')) || getMonthIndex(getMonthStr(new Date()), uniqueMonths)

  const pickerRef = useRef<HTMLInputElement>(null)

  const pathname = usePathname()
  const {replace} = useRouter()

  useEffect(() => {
    if (!pickerRef.current) {
      return
    }
    pickerRef.current.value = uniqueMonths[currentPageIndex - 1]
  }, [searchParams])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(getMonthIndex(e.target.value, uniqueMonths)))
    replace(`${pathname}?${params.toString()}`)
  }, [])
  return (
    <FormControl label="Month" htmlFor="month" className="items-center mb-8" labelClassName="font-bold mr-4">
      {currentPageIndex > 1 ? (
        <Link href={createPageURL(pathname, searchParams, currentPageIndex - 1)}>
          <ChevronLeftIcon className="w-6" strokeWidth={2} />
        </Link>
      ) : (
        <div className="text-gray-300">
          <ChevronLeftIcon className="w-6"  strokeWidth={2} />
        </div>
      )}
      <input ref={pickerRef} type="month" name="month" id="month" defaultValue={uniqueMonths[currentPageIndex - 1]} onChange={handleChange} className="border-1 border-slate-400 p-2 mx-4" />
      {currentPageIndex < uniqueMonths.length ? (
        <Link href={createPageURL(pathname, searchParams, currentPageIndex + 1)}>
          <ChevronRightIcon className="w-6"  strokeWidth={2} />
        </Link>
      ) : (
        <div className="text-gray-300">
          <ChevronRightIcon className="w-6"  strokeWidth={2} />
        </div>
      )}
    </FormControl>
  )
}
