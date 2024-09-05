import React from "react"
import dynamic from "next/dynamic"
import type { User } from "next-auth"
import StartWorkingButton from "@/app/ui/start-working-button/start-working-button"
import EndWorkingButton from "@/app/ui/end-working-button/end-working-button"
import StartBreakButton from "@/app/ui/start-break-button/start-break-button"
import EndBreakButton from "@/app/ui/end-break-button/end-break-button"
import Tag from "@/app/ui/tag/tag"
import BreakUnit from "@/app/ui/break-unit/break-unit"
import TimeStamp from "@/app/ui/time-stamp/time-stamp"
import { TStatus } from "@/app/lib/types"
import { returnStatus, getFormattedTotalWorkHours } from "@/app/lib/helpers"
import { fetchLastRecord, fetchUserByEmail } from "@/app/lib/api"
import { auth } from "@/auth"

const Clock = dynamic(() => import("@/app/ui/clock/clock"), { ssr: false })

export default async function Home() {
  const session = await auth()
  const user = (await fetchUserByEmail(session?.user.email!)) as User
  const record = await fetchLastRecord(user.id!)

  let status: TStatus

  if (!record) {
    status = "BEFORE-WORK"
  } else {
    status = returnStatus(record)
  }

  return (
    <>
      <div className="rounded-lg shadow bg-white py-8 mb-4">
        <Clock suppressHydrationWarning />
      </div>
      <div className="w-full flex justify-between items-center py-8 px-8 bg-white rounded-lg shadow mb-4">
        <Tag testid="status" className="mr-4">
          {status}
        </Tag>
        <div className="flex justify-between">
          <StartWorkingButton
            userid={user.id!}
            disabled={status !== "BEFORE-WORK"}
          />
          <StartBreakButton record={record} disabled={status !== "IN-WORK"} />
          <EndBreakButton record={record} disabled={status !== "IN-BREAK"} />
          <EndWorkingButton record={record} disabled={status !== "IN-WORK"} />
        </div>
      </div>
      <ul
        className={`px-8 py-8 bg-white rounded-lg shadow mb-4 ${
          status === "BEFORE-WORK" && "hidden"
        }`}
      >
        {record && record.starttime && (
          <li className="py-4">
            <TimeStamp heading="Started work at" timeStamp={record.starttime} />
          </li>
        )}
        <li>
          <ul className="pl-4">
            {record &&
              record.breaks.map((b: any, i: number) => (
                <li
                  className="border-t-2 border-gray-100 py-2"
                  key={`${b.starttime}-${i}`}
                >
                  <BreakUnit
                    index={i + 1}
                    starttime={b.starttime}
                    endtime={b.endtime}
                  />
                </li>
              ))}
          </ul>
        </li>
        {record && record.endtime && (
          <>
            <li className="border-t-2 border-gray-100 py-4">
              <TimeStamp
                heading="Finished work at"
                timeStamp={record.endtime}
              />
            </li>
            <li className="border-t-2 border-gray-100 py-4">
              <TimeStamp
                heading="Total hours"
                timeStamp={getFormattedTotalWorkHours(record)}
              />
            </li>
          </>
        )}
      </ul>
    </>
  )
}
