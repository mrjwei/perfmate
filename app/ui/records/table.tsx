import Link from "next/link"
import {
  fetchPaginatedRecords
} from '@/app/lib/api'
import {
  generatePaddedRecordsForMonth
} from "@/app/lib/helpers"
import { IPaddedRecord } from "@/app/lib/types"

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
        {generatePaddedRecordsForMonth(month, records).map((record: IPaddedRecord) => {
          const {id, date, starttime, endtime, totalbreakhours, totalworkhours} = record
          return (
            <tr key={id} className="border-t-1 border-slate-200">
              <td className="py-4">{date}</td>
              <td className="py-4">{starttime}</td>
              <td className="py-4">{endtime ? endtime : "--:--"}</td>
              <td className="py-4">{totalbreakhours}</td>
              <td className="py-4">{totalworkhours}</td>
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
