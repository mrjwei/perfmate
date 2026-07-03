'use client'

import React, {useState, useEffect, useMemo} from "react"
import type { User } from "next-auth"
import StartWorkingButton from "@/app/ui/button/variants/start-working-button"
import EndWorkingButton from "@/app/ui/button/variants/end-working-button"
import StartBreakButton from "@/app/ui/button/variants/start-break-button"
import EndBreakButton from "@/app/ui/button/variants/end-break-button"
import { IRecord, TStatus } from "@/app/lib/types"
import {
  getTodayInTimezone,
  getCurrentTimeInTimezone
} from '@/app/lib/helpers'

export default function ButtonGroup({user, workspaceId, timezone, record, status}: {user: User, workspaceId: string, timezone: string, record: IRecord | null, status: TStatus}) {
  const [date, setDate] = useState(new Date())

  const dateStr = useMemo(() => getTodayInTimezone(timezone), [date, timezone])
  const timeStr = useMemo(() => getCurrentTimeInTimezone(timezone), [date, timezone])

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
        workspaceId={workspaceId}
        disabled={status !== "BEFORE-WORK"}
        dateStr={dateStr}
        starttimeStr={timeStr}
      />
      <StartBreakButton workspaceId={workspaceId} record={record} disabled={status !== "IN-WORK"} starttimeStr={timeStr} />
      <EndBreakButton workspaceId={workspaceId} record={record} disabled={status !== "IN-BREAK"} endtimeStr={timeStr} />
      <EndWorkingButton workspaceId={workspaceId} record={record} disabled={status !== "IN-WORK"} endtimeStr={timeStr} />
    </div>
  )
}
