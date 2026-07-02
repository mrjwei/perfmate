import clsx from "clsx"
import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const ClockSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full rounded-lg shadow-sm bg-card py-8 mb-4">
      <Skeleton className="h-16 w-40 mb-2" />
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

export const WidgetsSkeleton = () => {
  return (
    <div className="w-full flex justify-between items-start lg:items-center py-8 px-8 bg-card rounded-lg shadow-sm mb-4">
      <Skeleton className="h-8 w-20" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

export const LogSkeleton = () => {
  return (
    <ul className="px-8 py-8 bg-card rounded-lg shadow-sm mb-4">
      {Array.from({length: 4}, (_, i) => {
        return (
          <li className={clsx(
            'flex justify-between py-4',
            {
              'border-b-2 border-border': i !== 3
            }
          )} key={i}>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
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
      <Skeleton className="h-16 w-40 mb-2" />
      <Skeleton className="h-16 w-40 mb-2" />
    </div>
  )
}

export const TableSkeleton = () => {
  return (
    <div className="py-8 px-8 bg-card rounded-lg shadow-sm">
      <Skeleton className="h-16 mb-4" />
      {Array.from({length: 5}, (_, i) => {
        return (
          <div className={clsx(
            'grid grid-cols-5 gap-4 py-4',
            {
              'border-b-2 border-border': i !== 4
            }
          )} key={i}>
            {Array.from({length: 5}, (_, j) => {
              return (
                <Skeleton className="h-8 w-20" key={j} />
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
