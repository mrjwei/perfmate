import React from 'react'
import type {User} from 'next-auth'
import dynamic from 'next/dynamic'
import { fetchPaginatedRecords, fetchUserByEmail } from "@/app/lib/api"
import { auth } from "@/auth"
import MonthPicker from '@/app/ui/records/monthpicker'
import Aggregates from '@/app/ui/records/aggregates'
import LinkItem from '@/app/ui/link-item/link-item'
import { dateToStr } from "@/app/lib/helpers"
import {TRecordsProps} from '@/app/lib/types'

const Table = dynamic(() => import('@/app/ui/records/table'), { ssr: false })

export default async function Records({searchParams}: TRecordsProps) {
  const session = await auth()
  const user = await fetchUserByEmail(session?.user.email!) as User
  const month = searchParams?.month ? searchParams?.month : dateToStr(new Date(), 'yyyy-mm')
  const records = await fetchPaginatedRecords(user.id!, month)
  const targetDate = searchParams?.date ? searchParams?.date : undefined

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Records</h2>
        <div className="flex items-center">
          <LinkItem href="/app/records#today" className="px-4 py-2 text-blue-500 mr-4 border-2 border-blue-500 rounded-lg">
            Back to Today
          </LinkItem>
          <MonthPicker />
        </div>
      </div>
      <div className="py-8 px-8 bg-white rounded-lg shadow">
        <Aggregates records={records} user={user} month={month} />
        <Table records={records} month={month} targetDate={targetDate} />
      </div>
    </div>
  )
}
