'use client'

import React from 'react'
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import clsx from "clsx"
import { PencilIcon } from "@heroicons/react/24/outline"
import { generatePaddedRecordsForMonth, isSaturday, isSunday, isNationalHoliday, getWeekdayName, getTodayInTimezone, fetchNationalHolidays } from "@/app/lib/helpers"
import { INationalHoliday, IPaddedRecord, IRecord } from "@/app/lib/types"
import DeleteButton from '@/app/ui/records/delete-button'

export default function Table({
  records,
  month,
  targetDate,
  workspaceId,
  timezone,
}: {
  records: IRecord[]
  month: string
  targetDate?: string
  workspaceId: string
  timezone: string
}) {
  const t = useTranslations("RecordsTable")
  const [holidays, setHolidays] = React.useState<INationalHoliday[]>([])
  const today = getTodayInTimezone(timezone)
  const locale = useLocale()

  React.useEffect(() => {
    const data = localStorage.getItem('holidays')
    if (data) {
      const {timestamp, holidays} = JSON.parse(data)
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setHolidays(holidays)
        return
      }
    }
    fetchNationalHolidays(month.substring(0, 4), 'JP').then((holidays) => {
      setHolidays(holidays)
      localStorage.setItem('holidays', JSON.stringify({timestamp: Date.now(), holidays}))
      console.log('fetch called')
    }).catch((err) => console.error(err))
  }, [])

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="text-left pl-4 pr-1 pb-2">{t("date")}</th>
          <th className="text-left px-1">{t("start")}</th>
          <th className="text-left px-1">{t("end")}</th>
          <th className="text-left px-1">{t("breakHours")}</th>
          <th className="text-left px-1">{t("workHours")}</th>
          <th className="text-left pl-1 pr-4">
            <div className="flex items-center justify-end text-primary text-sm">
              <div className="w-3 h-3 bg-primary mr-2"></div>
              <p>{t("today")}</p>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {generatePaddedRecordsForMonth(month, records).map(
          (record: IPaddedRecord) => {
            const {
              id,
              date,
              starttime,
              endtime,
              totalbreakhours,
              totalworkhours,
            } = record
            const isHoliday = isNationalHoliday(date, holidays)
            return (
              <tr
                key={date}
                id={date === today ? 'today' : ''}
                className={clsx("box-border", {
                  "animate-fadeOutBackground": targetDate === date,
                  "bg-destructive/5": isSunday(new Date(date)) || isHoliday,
                  "bg-info/5": isSaturday(new Date(date)),
                  "border-l-8 border-2 border-primary": date === today,
                  "border-t-1 border-border first:border-none": date !== today
                })}
              >
                <td className="py-4 pl-4">
                  <span className="mr-2">
                    {date}
                  </span>
                  <span className="">
                    ({getWeekdayName(date, locale)})
                  </span>
                </td>
                <td className="py-4">{starttime}</td>
                <td className="py-4">{endtime ? endtime : "--:--"}</td>
                <td className="py-4">{totalbreakhours}</td>
                <td className="py-4">{totalworkhours}</td>
                <td className="py-4 text-right flex items-center justify-end">
                  {id ? (
                    <Link
                      className="text-primary"
                      href={`/app/${workspaceId}/records/${id}/edit?month=${month}`}
                    >
                      <PencilIcon className="w-5" />
                    </Link>
                  ) : (
                    <Link
                      className="text-primary"
                      href={`/app/${workspaceId}/records/create?month=${month}&date=${date}`}
                    >
                      <PencilIcon className="w-5" />
                    </Link>
                  )}
                  <DeleteButton workspaceId={workspaceId} id={record.id} month={month} />
                </td>
              </tr>
            )
          }
        )}
      </tbody>
    </table>
  )
}
