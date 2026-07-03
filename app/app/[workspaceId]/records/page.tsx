import React from 'react'
import dynamic from 'next/dynamic'
import { fetchPaginatedRecords, fetchWorkspaceById } from "@/app/lib/api"
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
}: TRecordsProps & { params: { workspaceId: string } }) {
  const { workspaceId } = params
  const workspace = await fetchWorkspaceById(workspaceId)
  if (!workspace) {
    notFound()
  }
  const month = searchParams?.month ? searchParams?.month : getTodayInTimezone(workspace.timezone).slice(0, 7)
  const records = await fetchPaginatedRecords(workspaceId, month)
  const targetDate = searchParams?.date ? searchParams?.date : undefined

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Records</h2>
        <div className="flex items-center">
          <LinkItem href={`/app/${workspaceId}/records#today`} className="px-4 py-2 text-primary mr-4 border-2 border-primary rounded-lg">
            Back to Today
          </LinkItem>
          <MonthPicker timezone={workspace.timezone} />
        </div>
      </div>
      <div className="py-8 px-8 bg-card rounded-lg shadow-sm">
        <Aggregates records={records} workspace={workspace} month={month} />
        <Table records={records} month={month} targetDate={targetDate} workspaceId={workspaceId} timezone={workspace.timezone} />
      </div>
    </div>
  )
}
