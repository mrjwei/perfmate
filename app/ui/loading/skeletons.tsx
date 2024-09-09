import clsx from "clsx"
import React from "react"

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'

export const ClockSkeleton = () => {
  return (
    <div
      className={`${shimmer} flex flex-col items-center justify-center w-full rounded-lg shadow bg-white py-8 mb-4`}
    >
      <div className="h-16 w-40 rounded-md bg-gray-200 mb-2" />
      <div className="h-8 w-20 rounded-md bg-gray-200" />
    </div>
  )
}

export const WidgetsSkeleton = () => {
  return (
    <div className="w-full flex justify-between items-start lg:items-center py-8 px-8 bg-white rounded-lg shadow mb-4">
      <div className="h-8 w-20 rounded-md bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="h-8 w-20 rounded-md bg-gray-200" />
        <div className="h-8 w-20 rounded-md bg-gray-200" />
        <div className="h-8 w-20 rounded-md bg-gray-200" />
        <div className="h-8 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  )
}

export const LogSkeleton = () => {
  return (
    <ul className="px-8 py-8 bg-white rounded-lg shadow mb-4">
      {Array.from({length: 4}, (_, i) => {
        return (
          <li className={clsx(
            'flex justify-between py-4',
            {
              'border-b-2 border-gray-100': i !== 3
            }
          )} key={i}>
            <div className="h-8 w-20 rounded-md bg-gray-200" />
            <div className="h-8 w-20 rounded-md bg-gray-200" />
          </li>
        )
      })}
    </ul>
  )
}

export const HomeSkeleton = () => {
  return (
    <>
      <ClockSkeleton />
      <WidgetsSkeleton />
      <LogSkeleton />
    </>
  )
}

export const PageHeaderSkeleton = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="h-16 w-40 rounded-md bg-gray-200 mb-2" />
      <div className="h-16 w-40 rounded-md bg-gray-200 mb-2" />
    </div>
  )
}

export const TableSkeleton = () => {
  return (
    <div className="py-8 px-8 bg-white rounded-lg shadow">
      <div className="h-16 rounded-md bg-gray-200 mb-4" />
      {Array.from({length: 5}, (_, i) => {
        return (
          <div className={clsx(
            'grid grid-cols-5 gap-4 py-4',
            {
              'border-b-2 border-gray-100': i !== 4
            }
          )} key={i}>
            {Array.from({length: 5}, (_, j) => {
              return (
                <div className="h-8 w-20 rounded-md bg-gray-200" key={j} />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export const RecordsSkeleton = () => {
  return (
    <div className="pb-8">
      <PageHeaderSkeleton />
      <TableSkeleton />
    </div>
  )
}
