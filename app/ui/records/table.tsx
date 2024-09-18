'use client'

import React from 'react'
import Link from "next/link"
import clsx from "clsx"
import { PencilIcon } from "@heroicons/react/24/outline"
import { generatePaddedRecordsForMonth, isSaturday, isSunday, isNationalHoliday, getWeekdayName, getFormattedDateString } from "@/app/lib/helpers"
import { IPaddedRecord, IRecord } from "@/app/lib/types"
import DeleteButton from '@/app/ui/records/delete-button'

export default function Table({
  records,
  month,
  targetDate,
}: {
  records: IRecord[]
  month: string
  targetDate?: string
}) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left pl-4 pr-1 pb-2">Date</th>
          <th className="text-left px-1">Start</th>
          <th className="text-left px-1">End</th>
          <th className="text-left px-1">Break Hours</th>
          <th className="text-left px-1">Work Hours</th>
          <th className="text-left pl-1 pr-4">
            <div className="flex items-center justify-end text-blue-500 text-sm">
              <div className="w-3 h-3 bg-blue-500 mr-2"></div>
              <p>Today</p>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {generatePaddedRecordsForMonth(month, records).map(
          async (record: IPaddedRecord) => {
            const {
              id,
              date,
              starttime,
              endtime,
              totalbreakhours,
              totalworkhours,
            } = record
            const isHoliday = await isNationalHoliday(date, 'JP')
            return (
              <tr
                key={date}
                id={date === getFormattedDateString(new Date()) ? 'today' : ''}
                className={clsx("box-border", {
                  "animate-fadeOutBackground": targetDate === date,
                  "bg-red-50": isSunday(date) || isHoliday,
                  "bg-blue-50": isSaturday(date),
                  "border-l-8 border-2 border-blue-500": date === getFormattedDateString(new Date()),
                  "border-t-1 border-slate-200 first:border-none": date !== getFormattedDateString(new Date())
                })}
              >
                <td className="py-4 pl-4">
                  <span className="mr-2">
                    {date}
                  </span>
                  <span className="">
                    ({getWeekdayName(date)})
                  </span>
                </td>
                <td className="py-4">{starttime}</td>
                <td className="py-4">{endtime ? endtime : "--:--"}</td>
                <td className="py-4">{totalbreakhours}</td>
                <td className="py-4">{totalworkhours}</td>
                <td className="py-4 text-right flex items-center justify-end">
                  {id ? (
                    <Link
                      className="text-sky-500"
                      href={`/app/records/${id}/edit?month=${month}`}
                    >
                      <PencilIcon className="w-5" />
                    </Link>
                  ) : (
                    <Link
                      className="text-sky-500"
                      href={`/app/records/create?month=${month}&date=${date}`}
                    >
                      <PencilIcon className="w-5" />
                    </Link>
                  )}
                  <DeleteButton id={record.id} month={month} />
                </td>
              </tr>
            )
          }
        )}
      </tbody>
    </table>
  )
}
