'use client'

import {useState, useEffect} from 'react'
import {IRecord} from '@/app/lib/types'
import {
  getFormattedTimeString,
  getTimeDifferneceInMins,
  calculateTotalBreakMins
} from '@/app/lib/helpers'

export default function Records() {
  const [records, setRecords] = useState<IRecord[]>([])

  const fetchRecords = async () => {
    const res = await fetch('http://localhost:3000/records')
    const data = await res.json()
    setRecords(data)
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Start Time</th>
          <th>End Time</th>
          <th>Total Break Hours</th>
          <th>Total Work Hours</th>
        </tr>
      </thead>
      <tbody>
        {records.map((record: IRecord) => {
          const {id, date, startTime, endTime, breaks, totalHours} = record

          const totalWorkHoursInMins = getTimeDifferneceInMins(record.startTime, record.endTime)
          const totalBreakMins = calculateTotalBreakMins(record)
          const formattedTotalBreakHours = getFormattedTimeString(totalBreakMins)
          const formattedTotalWorkHours = getFormattedTimeString(totalWorkHoursInMins - totalBreakMins)

          return (
            <tr key={id}>
              <td>
                {date}
              </td>
              <td>
                {startTime}
              </td>
              <td>
                {endTime}
              </td>
              <td>
                {formattedTotalBreakHours}
              </td>
              <td>
                {formattedTotalWorkHours}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
