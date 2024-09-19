import React from "react"
import dynamic from "next/dynamic"
import type { User } from "next-auth"
import Tag from "@/app/ui/tag/tag"
import ButtonGroup from "@/app/ui/home/button-group"
import BreakUnit from "@/app/ui/break-unit/break-unit"
import TimeStamp from "@/app/ui/time-stamp/time-stamp"
import { TStatus } from "@/app/lib/types"
import { returnStatus, getFormattedTotalWorkHours } from "@/app/lib/helpers"
import { fetchLastRecord, fetchUserByEmail } from "@/app/lib/api"
import { auth } from "@/auth"
import clsx from "clsx"

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
      <Clock suppressHydrationWarning />
      <div className="w-full flex justify-between items-start lg:items-center py-8 px-8 bg-white rounded-lg shadow mb-4">
        <Tag testid="status" className="mr-2 text-xl lg:text-2xl lg:mr-8">
          {status}
        </Tag>
        <ButtonGroup user={user} record={record} status={status} />
      </div>
      <ul
        className={`px-8 py-8 bg-white rounded-lg shadow mb-4 ${
          status === "BEFORE-WORK" && "hidden"
        }`}
      >
        {record && record.starttime && (
          <li className="py-4 border-b-2 border-gray-100">
            <TimeStamp heading="Started work at" timeStamp={record.starttime} />
          </li>
        )}
        <li>
          <ul className="pl-4">
            {record &&
              record.breaks.map((b: any, i: number) => (
                <li
                  className={clsx(
                    'py-2',
                    {
                      'border-b-2 border-gray-100': i !== record.breaks.length -  1
                    }
                  )}
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
