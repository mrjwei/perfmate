import React from 'react'

export default function TimeStamp({heading, timeStamp, className}: {heading: string, timeStamp: string, className?: string}) {
  return (
    <p className={`text-lg flex justify-between ${className}`}>
      <span className="font-bold mr-1 text-slate-600">
        {heading}
      </span>
      <span>
        {timeStamp}
      </span>
    </p>
  )
}
