'use client'

import React, {useEffect, useRef, useCallback} from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import {useSearchParams, useRouter, usePathname} from 'next/navigation'
import Link from 'next/link'
import FormControl from "@/app/ui/form/form-control"
import {
  dateToStr,
  createPageURL,
  dateStrOneMonthOffset,
} from '@/app/lib/helpers'

export default function MonthPicker() {
  const searchParams = useSearchParams()
  const currentMonth = searchParams.get('month') ? searchParams.get('month') as string : dateToStr(new Date(), 'yyyy-mm')

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
    <FormControl label="Month" htmlFor="month" isGrid={false} className="flex items-center" labelClassName="hidden">
      <Link href={createPageURL(pathname, searchParams, 'month', dateStrOneMonthOffset(new Date(currentMonth), 'prev'))} className="flex justify-end mr-2">
        <ChevronLeftIcon className="w-6" strokeWidth={2} />
      </Link>
      <input ref={pickerRef} type="month" name="month" id="month" defaultValue={currentMonth} onChange={handleChange} className="border-1 border-slate-400 p-2 rounded" />
      <Link href={createPageURL(pathname, searchParams, 'month', dateStrOneMonthOffset(new Date(currentMonth), 'next'))} className="flex justify-start ml-2">
        <ChevronRightIcon className="w-6"  strokeWidth={2} />
      </Link>
    </FormControl>
  )
}
