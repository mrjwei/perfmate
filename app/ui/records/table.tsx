import React from 'react'
import Link from "next/link"
import clsx from "clsx"
import { PencilIcon } from "@heroicons/react/24/outline"
import { generatePaddedRecordsForMonth, isSaturday, isSunday, isNationalHoliday } from "@/app/lib/helpers"
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
          <th className="text-left pb-2">Date</th>
          <th className="text-left">Start Time</th>
          <th className="text-left">End Time</th>
          <th className="text-left">Total Break Hours</th>
          <th className="text-left">Total Work Hours</th>
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
            const isHoliday = await isNationalHoliday(date, 'US')
            return (
              <tr
                key={date}
                className={clsx("border-t-1 border-slate-200", {
                  "animate-fadeOutBackground": targetDate === date,
                  "bg-red-100": isSunday(date) || isHoliday,
                  "bg-blue-100": isSaturday(date)
                })}
              >
                <td className="py-4">{date}</td>
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
