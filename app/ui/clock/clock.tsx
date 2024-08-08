'use client'

import React, {useState, useEffect, useMemo} from 'react'
import {
  extractDateParts
} from '@/app/lib/helpers'

export default function Clock({suppressHydrationWarning}: {suppressHydrationWarning?: boolean}) {
  const [time, setTime] = useState<Date>(new Date())

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
    <div className="w-full font-bold text-center" suppressHydrationWarning={suppressHydrationWarning}>
      <span className="block text-6xl">
          {time?.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}
        </span>
        <span className="block text-2xl">
          {time && `${year}-${month}-${day} (${weekday})`}
        </span>
    </div>
  )
}
