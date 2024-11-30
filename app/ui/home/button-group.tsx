'use client'

import React, {useState, useEffect, useMemo} from "react"
import type { User } from "next-auth"
import StartWorkingButton from "@/app/ui/home/start-working-button"
import EndWorkingButton from "@/app/ui/home/end-working-button"
import StartBreakButton from "@/app/ui/start-break-button/start-break-button"
import EndBreakButton from "@/app/ui/end-break-button/end-break-button"
import { IRecord, TStatus } from "@/app/lib/types"
import {
  getFormattedDateString,
  getFormattedTimeString
} from '@/app/lib/helpers'

export default function ButtonGroup({user, record, status}: {user: User, record: IRecord | null, status: TStatus}) {
  const [date, setDate] = useState(new Date())

  const dateStr = useMemo(() => getFormattedDateString(date), [date])
  const timeStr = useMemo(() => getFormattedTimeString(date), [date])

  useEffect(() => {
		const interval = setInterval(() => {
			setDate(new Date())
		}, 1000)
		return () => clearInterval(interval)
	}, [])

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StartWorkingButton
        userid={user.id!}
        disabled={status !== "BEFORE-WORK"}
        dateStr={dateStr}
        starttimeStr={timeStr}
      />
      <StartBreakButton record={record} disabled={status !== "IN-WORK"} starttimeStr={timeStr} />
      <EndBreakButton record={record} disabled={status !== "IN-BREAK"} endtimeStr={timeStr} />
      <EndWorkingButton record={record} disabled={status !== "IN-WORK"} endtimeStr={timeStr} />
    </div>
  )
}
