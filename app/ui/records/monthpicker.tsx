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
  dateToMonthStr,
  createPageURL,
  getLastMonth,
  getNextMonth,
  monthStrToDate
} from '@/app/lib/helpers'

export default function MonthPicker() {
  const searchParams = useSearchParams()
  const currentMonth = searchParams.get('month') ? searchParams.get('month') as string : dateToMonthStr(new Date())

  const pickerRef = useRef<HTMLInputElement>(null)

  const pathname = usePathname()
  const {replace} = useRouter()

  useEffect(() => {
    if (!pickerRef.current) {
      return
    }
    pickerRef.current.value = currentMonth
  }, [searchParams])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams)
    params.set('month', e.target.value)
    replace(`${pathname}?${params.toString()}`)
  }, [])
  return (
    <FormControl label="Month" htmlFor="month" className="items-center mb-8" labelClassName="font-bold mr-4">
      <Link href={createPageURL(pathname, searchParams, 'month', dateToMonthStr(getLastMonth(monthStrToDate(currentMonth))))}>
        <ChevronLeftIcon className="w-6" strokeWidth={2} />
      </Link>
      <input ref={pickerRef} type="month" name="month" id="month" defaultValue={currentMonth} onChange={handleChange} className="border-1 border-slate-400 p-2 mx-4" />
      <Link href={createPageURL(pathname, searchParams, 'month', dateToMonthStr(getNextMonth(monthStrToDate(currentMonth))))}>
        <ChevronRightIcon className="w-6"  strokeWidth={2} />
      </Link>
    </FormControl>
  )
}
