'use client'

import {useState, useEffect} from 'react'

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null)
  useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date())
		}, 1000)
		return () => clearInterval(interval)
	}, [])

  return (
    <div>
      {time?.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false})}
    </div>
  )
}
