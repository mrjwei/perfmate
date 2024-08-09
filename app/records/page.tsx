import React from 'react'
import {
  fetchUniqueMonths
} from '@/app/lib/api'
import Table from '@/app/ui/records/table'
// import Pagination from '@/app/ui/records/pagination'
import MonthPicker from '@/app/ui/records/monthpicker'
import { getMonthStr } from "@/app/lib/helpers"

export default async function Records({searchParams}: {searchParams?: {page?: string}}) {
  const uniqueMonths = await fetchUniqueMonths()
  const pageIndex = Number(searchParams?.page)
  const month = pageIndex ? uniqueMonths[pageIndex - 1] : getMonthStr(new Date())

  return (
    <>
      <h2 className="text-3xl font-bold mb-12">Records</h2>
      <MonthPicker uniqueMonths={uniqueMonths} />
      <Table month={month} />
      {/* <Pagination uniqueMonths={uniqueMonths} /> */}
    </>
  )
}
