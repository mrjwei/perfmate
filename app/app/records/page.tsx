import React from 'react'
import { Session } from "next-auth"
import { auth } from "@/auth"
import Table from '@/app/ui/records/table'
import MonthPicker from '@/app/ui/records/monthpicker'
import { dateToMonthStr } from "@/app/lib/helpers"
import {TRecordsProps} from '@/app/lib/types'

export default async function Records({searchParams}: TRecordsProps) {
  const {user} = await auth() as Session
  const month = searchParams?.month ? searchParams?.month : dateToMonthStr(new Date())
  const targetDate = searchParams?.date ? searchParams?.date : undefined

  return (
    <>
      <h2 className="text-3xl font-bold mb-12">Records</h2>
      <MonthPicker />
      <Table userid={user.id!} month={month} targetDate={targetDate} />
    </>
  )
}
