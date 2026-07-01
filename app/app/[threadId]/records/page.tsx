import React from 'react'
import dynamic from 'next/dynamic'
import { fetchPaginatedRecords, fetchThreadById } from "@/app/lib/api"
import { notFound } from 'next/navigation'
import MonthPicker from '@/app/ui/records/monthpicker'
import Aggregates from '@/app/ui/records/aggregates'
import LinkItem from '@/app/ui/link-item/link-item'
import { getTodayInTimezone } from "@/app/lib/helpers"
import {TRecordsProps} from '@/app/lib/types'

const Table = dynamic(() => import('@/app/ui/records/table'), { ssr: false })

export default async function Records({
  params,
  searchParams,
}: TRecordsProps & { params: { threadId: string } }) {
  const { threadId } = params
  const thread = await fetchThreadById(threadId)
  if (!thread) {
    notFound()
  }
  const month = searchParams?.month ? searchParams?.month : getTodayInTimezone(thread.timezone).slice(0, 7)
  const records = await fetchPaginatedRecords(threadId, month)
  const targetDate = searchParams?.date ? searchParams?.date : undefined

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Records</h2>
        <div className="flex items-center">
          <LinkItem href={`/app/${threadId}/records#today`} className="px-4 py-2 text-blue-500 mr-4 border-2 border-blue-500 rounded-lg">
            Back to Today
          </LinkItem>
          <MonthPicker timezone={thread.timezone} />
        </div>
      </div>
      <div className="py-8 px-8 bg-white rounded-lg shadow">
        <Aggregates records={records} thread={thread} month={month} />
        <Table records={records} month={month} targetDate={targetDate} threadId={threadId} timezone={thread.timezone} />
      </div>
    </div>
  )
}
