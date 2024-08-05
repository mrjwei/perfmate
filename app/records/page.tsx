import Link from 'next/link'
import {IRecord} from '@/app/lib/types'
import {
  getFormattedTimeString,
  getTimeDifferneceInMins,
  calculateTotalBreakMins
} from '@/app/lib/helpers'
import RecordEditForm from "@/app/ui/form/record-edit-form"
import {fetchOneRecord, fetchRecords} from '@/app/lib/api'

export default async function Records({searchParams}: {searchParams: {id: string}}) {
  const recordId = searchParams?.id ?? ''
  const records = await fetchRecords()

  const record = await fetchOneRecord(recordId)

  return (
    <>
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
          {records.map((record: IRecord) => {
            const {id, date, startTime} = record

            let {endTime} = record
            let formattedTotalWorkHours = '--:--'

            const totalBreakMins = calculateTotalBreakMins(record)
            const formattedTotalBreakHours = getFormattedTimeString(totalBreakMins)

            if (!endTime) {
              endTime = '--:--'
            } else {
              const totalWorkHoursInMins = getTimeDifferneceInMins(startTime, endTime)
              formattedTotalWorkHours = getFormattedTimeString(totalWorkHoursInMins - totalBreakMins)
            }

            return (
              <tr key={id} className="border-t-1 border-slate-200">
                <td className="py-4">
                  {date}
                </td>
                <td className="py-4">
                  {startTime}
                </td>
                <td className="py-4">
                  {endTime}
                </td>
                <td className="py-4">
                  {formattedTotalBreakHours}
                </td>
                <td className="py-4">
                  {formattedTotalWorkHours}
                </td>
                <td className="py-4 text-right">
                  <Link className="text-sky-500" href={`/records?id=${id}`}>
                    Edit
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {recordId && (
        <div className="absolute left-1/2 top-1/2 bg-white p-4">
          <RecordEditForm record={record} />
        </div>
      )}
    </>
  )
}
