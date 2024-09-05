import React from 'react'
import type {User} from 'next-auth'
import { fetchPaginatedRecords, fetchUserByEmail } from "@/app/lib/api"
import { auth } from "@/auth"
import Table from '@/app/ui/records/table'
import MonthPicker from '@/app/ui/records/monthpicker'
import Aggregates from '@/app/ui/records/aggregates'
import { dateToMonthStr } from "@/app/lib/helpers"
import {TRecordsProps} from '@/app/lib/types'

export default async function Records({searchParams}: TRecordsProps) {
  const session = await auth()
  const user = await fetchUserByEmail(session?.user.email!) as User
  const month = searchParams?.month ? searchParams?.month : dateToMonthStr(new Date())
  const records = await fetchPaginatedRecords(user.id!, month)
  const targetDate = searchParams?.date ? searchParams?.date : undefined

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Records</h2>
        <MonthPicker />
      </div>
      <div className="py-8 px-8 bg-white rounded-lg shadow">
        <Aggregates records={records} user={user} month={month} />
        <Table records={records} month={month} targetDate={targetDate} />
      </div>
    </div>
  )
}
