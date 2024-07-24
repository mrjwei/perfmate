'use client'
import {useState, useEffect} from 'react'

const calculateDiffInMinutes = (startTime: string, endTime: string) => {
  const [startHours, startMins] = startTime.split(':').map(Number)
  const [endHours, endMins] = endTime.split(':').map(Number)

  const startTotalMinutes = startHours * 60 + startMins;
  const endTotalMinutes = endHours * 60 + endMins;

  let durationMinutes = endTotalMinutes - startTotalMinutes;

  if (durationMinutes < 0) {
    durationMinutes += 24 * 60;
  }

  return durationMinutes
}

const formatMinutesToTimeString = (minutes: number) => {
  const durationHours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedHours = String(durationHours).padStart(2, '0');
  const formattedMinutes = String(remainingMinutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`
}

export default function Records() {
  const [records, setRecords] = useState([])

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
        {records.map((record: any) => {
          const {id, date, start_time: startTime, end_time: endTime, breaks, total_hours: totalWorkHours} = record

          const totalBreakMins = breaks.reduce((mins: number, b: any) => calculateDiffInMinutes(b['start_time'], b['end_time']) + mins, 0)
          const totalBreakHours = formatMinutesToTimeString(totalBreakMins)

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
                {totalBreakHours}
              </td>
              <td>
                {totalWorkHours}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
