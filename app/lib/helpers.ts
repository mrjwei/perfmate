import {ReadonlyURLSearchParams} from 'next/navigation'
import {TStatus, IRecord, IBreak} from '@/app/lib/types'

export const returnStatus = (record: IRecord) => {
  if (areSameDay(new Date(), new Date(record.date))) {
    // If today's record exists.
    if (record.endtime) {
      return 'AFTER-WORK'
    } else {
      if (record.breaks.length > 0) {
        if (record.breaks.some((b: any) => !b.endtime)) {
          return 'IN-BREAK'
        } else {
          return 'IN-WORK'
        }
      } else {
        return 'IN-WORK'
      }
    }
  } else {
    // If today's record does not exist.
    return 'BEFORE-WORK'
  }
}

export const mapStatusToHumanReadableString = (status: TStatus | null) => {
  switch (status) {
    case 'BEFORE-WORK':
      return 'Ready to Start'
    case 'IN-WORK':
      return 'At Work'
    case 'IN-BREAK':
      return 'On Break'
    case 'AFTER-WORK':
      return 'Work Over'
    default:
      return ''
  }
}

export const getFormattedDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getTimeDifferneceInMins = (starttime: string, endtime: string) => {
  const [startHours, startMins] = starttime.split(':').map(Number)
  const [endHours, endMins] = endtime.split(':').map(Number)

  const startTotalMins = startHours * 60 + startMins;
  const endTotalMins = endHours * 60 + endMins;

  let diffInMins = endTotalMins - startTotalMins

  if (diffInMins < 0) {
    diffInMins += 24 * 60
  }

  return diffInMins
}

export const getFormattedTimeString = (input: Date | number | string) => {
  if (typeof input === 'string') {
    return input.split(':').slice(0, 2).join(':')
  }
  else if (typeof input === 'number') {
    const hours = Math.floor(input / 60)
    const mins = input % 60

    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  } else if (input instanceof Date) {
    return input.toLocaleTimeString('en-US', { hour12: false })
  } else {
    throw new Error('Invalid input type. Can only accept Date or number.')
  }
}

export const calculateTotalBreakMins = (record: IRecord) => {
  return record.breaks.reduce((acc: number, curr: IBreak) => {
    if (!curr.endtime || curr.endtime === '--:--') {
      return acc
    }
    return acc + getTimeDifferneceInMins(curr.starttime, curr.endtime)
  }, 0)
}

export const zip = (fillna: any, ...arrays: any) => {
  const length = Math.max(...arrays.map((arr: any) => arr.length))
  return Array.from({length}, (_, i) => arrays.map((arr: any) => arr[i] ? arr[i] : fillna))
}

export const areSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

const formatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const extractDateParts = (date: Date) => {
  const [{value: weekday}, , {value: month}, , {value: day}, , {value: year}] = formatter.formatToParts(date)
  return {weekday, year, month, day}
}

export const generatePageIndexes = (currentPageIndex: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPageIndex <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  if (currentPageIndex >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  return [
    1,
    '...',
    currentPageIndex - 1,
    currentPageIndex,
    currentPageIndex + 1,
    '...',
    totalPages,
  ];
}

export const getMonthStr = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const getMonthIndex = (month: string, uniqueMonths: string[]) => {
  return uniqueMonths.indexOf(month) + 1
}

export const createPageURL = (pathname: string, searchParams: ReadonlyURLSearchParams, pageIndex: number | string) => {
  const params = new URLSearchParams(searchParams)
  params.set('page', pageIndex.toString())
  return `${pathname}?${params.toString()}`
}