import Link from "next/link"
import clsx from "clsx"
import { fetchPaginatedRecords } from "@/app/lib/api"
import { generatePaddedRecordsForMonth } from "@/app/lib/helpers"
import { IPaddedRecord } from "@/app/lib/types"

export default async function Table({
  month,
  editedRecordId,
}: {
  month: string
  editedRecordId: string | undefined
}) {
  const records = await fetchPaginatedRecords(month)

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
            return (
              <tr
                key={id}
                className={clsx("border-t-1 border-slate-200", {
                  "animate-fadeOutBackground": editedRecordId === id,
                })}
              >
                <td className="py-4">{date}</td>
                <td className="py-4">{starttime}</td>
                <td className="py-4">{endtime ? endtime : "--:--"}</td>
                <td className="py-4">{totalbreakhours}</td>
                <td className="py-4">{totalworkhours}</td>
                <td className="py-4 text-right">
                  {id ? (
                    <Link
                      className="text-sky-500"
                      href={`/records/${id}/edit?month=${month}`}
                    >
                      Edit
                    </Link>
                  ) : (
                    <Link
                      className="text-sky-500"
                      href={`/records/new?date=${date}`}
                    >
                      Edit
                    </Link>
                  )}
                </td>
              </tr>
            )
          }
        )}
      </tbody>
    </table>
  )
}
