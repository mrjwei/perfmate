'use client'

import React, {useState, useEffect, useMemo} from "react"
import type { User } from "next-auth"
import StartWorkingButton from "@/app/ui/Button/variants/StartWorkingButton"
import EndWorkingButton from "@/app/ui/Button/variants/EndWorkingButton"
import StartBreakButton from "@/app/ui/Button/variants/StartBreakButton"
import EndBreakButton from "@/app/ui/Button/variants/EndBreakButton"
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
