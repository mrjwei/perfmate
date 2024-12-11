import React from 'react'
import TimeStamp from "@/app/ui/TimeStamp/TimeStamp"

export default function BreakUnit({index, starttime, endtime}: {
  index: number, starttime: string, endtime: string
}) {
  return (
    <div data-testid='breakUnit' className="grid grid-cols-8">
      <p className="col-span-6 text-lg font-bold flex-1 text-slate-600">Break {index}</p>
      <div className="min-w-28 col-span-2">
        <TimeStamp heading="Begin" timeStamp={starttime} />
        <TimeStamp heading="End" timeStamp={endtime} />
      </div>
    </div>
  )
}
