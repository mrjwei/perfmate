import TimeStamp from "../time-stamp/time-stamp"

export default function BreakUnit({index, startTime, endTime}: {
  index: number, startTime: string, endTime: string
}) {
  return (
    <div className="grid grid-cols-8">
      <p className="col-span-6 text-lg font-bold flex-1 text-slate-600">Break {index}</p>
      <div className="min-w-28 col-span-2">
        <TimeStamp heading="Begin" timeStamp={startTime} />
        <TimeStamp heading="End" timeStamp={endTime} />
      </div>
    </div>
  )
}
