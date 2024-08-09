import Link from "next/link"
import {
  fetchPaginatedRecords
} from '@/app/lib/api'
import {
  calculateTotalBreakMins,
  getFormattedTimeString,
  getTimeDifferneceInMins,
  getMonthStr
} from "@/app/lib/helpers"

export default async function Table({month}: {month: string}) {
  const records = await fetchPaginatedRecords(month)

  if (!records || records.length === 0) {
    return (<p>No record</p>)
  }

  return (
    <table className="w-full border-collapse">
      <thead className="">
        <tr>
          <th className="text-left">Date</th>
          <th className="text-left">Start Time</th>
          <th className="text-left">End Time</th>
          <th className="text-left">Total Break Hours</th>
          <th className="text-left">Total Work Hours</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record) => {
          const { id, date, starttime, endtime } = record

          let formattedTotalWorkHours = "--:--"
          let formattedTotalBreakHours = "--:--"

          const totalBreakMins = calculateTotalBreakMins(record)
          if (totalBreakMins > 0) {
            formattedTotalBreakHours = getFormattedTimeString(totalBreakMins)
          }

          if (endtime) {
            const totalWorkHoursInMins = getTimeDifferneceInMins(
              starttime,
              endtime
            )
            formattedTotalWorkHours = getFormattedTimeString(
              totalWorkHoursInMins - totalBreakMins
            )
          }

          return (
            <tr key={id} className="border-t-1 border-slate-200">
              <td className="py-4">{date}</td>
              <td className="py-4">{starttime}</td>
              <td className="py-4">{endtime ? endtime : "--:--"}</td>
              <td className="py-4">{formattedTotalBreakHours}</td>
              <td className="py-4">{formattedTotalWorkHours}</td>
              <td className="py-4 text-right">
                <Link className="text-sky-500" href={`/records/${id}/edit`}>
                  Edit
                </Link>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
