'use client'

import {useState, useEffect, useMemo} from 'react'

const formatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const extractDateParts = (date: Date) => {
  const [{value: weekday}, , {value: month}, , {value: day}, , {value: year}] = formatter.formatToParts(date)
  return {weekday, year, month, day}
}

export default function Clock({initialTime = null}: {initialTime?: Date | null}) {
  const [time, setTime] = useState<Date | typeof initialTime>(initialTime)
  useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date())
		}, 1000)
		return () => clearInterval(interval)
	}, [])

  const {weekday, year, month, day} = useMemo(() => {
    return extractDateParts(time as Date)
  }, [time])

  return (
    <div className="w-full font-bold text-center">
      <span className="block text-6xl">
          {time?.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}
        </span>
        <span className="block text-2xl">
          {time && `${year}-${month}-${day} (${weekday})`}
        </span>
    </div>
  )
}
