'use client'

import React, {useState, useEffect, useMemo} from 'react'
import {
  extractDatePartsInTimezone
} from '@/app/lib/helpers'

export default function Clock({suppressHydrationWarning, timezone}: {suppressHydrationWarning?: boolean, timezone: string}) {
  const [time, setTime] = useState<Date>(new Date())

  useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date())
		}, 1000)
		return () => clearInterval(interval)
	}, [])

  const {weekday, year, month, day} = useMemo(() => {
    return extractDatePartsInTimezone(time as Date, timezone)
  }, [time, timezone])

  return (
    <div className="w-full relative rounded-lg shadow-sm bg-card py-8 mb-4" suppressHydrationWarning={suppressHydrationWarning}>
      <p className="font-bold mx-auto mb-1 w-[160px] text-4xl lg:w-[264px] lg:text-6xl">
        {time?.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: timezone})}
      </p>
      <p className="text-muted-foreground text-lg font-semibold lg:text-2xl lg:font-bold text-center">
        {time && `${year}-${month}-${day} (${weekday})`}
      </p>
    </div>
  )
}
