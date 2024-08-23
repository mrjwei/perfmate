import Link from "next/link"
import clsx from "clsx"
import { PencilIcon } from "@heroicons/react/24/outline"
import { fetchPaginatedRecords } from "@/app/lib/api"
import { generatePaddedRecordsForMonth } from "@/app/lib/helpers"
import { IPaddedRecord } from "@/app/lib/types"
import DeleteButton from '@/app/ui/records/delete-button'

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
                key={date}
                className={clsx("border-t-1 border-slate-200", {
                  "animate-fadeOutBackground": editedRecordId === id,
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
                      href={`/records/${id}/edit?month=${month}`}
                    >
                      <PencilIcon className="w-5" />
                    </Link>
                  ) : (
                    <Link
                      className="text-sky-500"
                      href={`/records/create?date=${date}`}
                    >
                      <PencilIcon className="w-5" />
                    </Link>
                  )}
                  <DeleteButton id={record.id} />
                </td>
              </tr>
            )
          }
        )}
      </tbody>
    </table>
  )
}
