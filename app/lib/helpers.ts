import { ReadonlyURLSearchParams } from "next/navigation"
import {
  TStatus,
  IRecord,
  IBreak,
  TDateIndexedRecords,
  IPaddedRecord,
  TNotificationType,
} from "@/app/lib/types"

export const placeholder = "--:--"

export const formatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo" // TODO: move this to user settings
})

export const mapStatusToHumanReadableString = (status: TStatus | null) => {
  switch (status) {
    case "BEFORE-WORK":
      return "Ready to Start"
    case "IN-WORK":
      return "At Work"
    case "IN-BREAK":
      return "On Break"
    case "AFTER-WORK":
      return "Work Over"
    default:
      return ""
  }
}

export const returnStatus = (record: IRecord) => {
  if (areSameDay(new Date(), new Date(record.date))) {
    // If today's record exists
    if (record.endtime) {
      return "AFTER-WORK"
    } else {
      if (record.breaks.length > 0) {
        if (record.breaks.some((b: any) => !b.endtime)) {
          return "IN-BREAK"
        } else {
          return "IN-WORK"
        }
      } else {
        return "IN-WORK"
      }
    }
  } else {
    // Otherwise
    return "BEFORE-WORK"
  }
}

export const timeStringToMins = (timeStr: string) => {
  const [hours, mins] = timeStr.split(":").map(Number)
  return hours * 60 + mins
}

export const getTimeDifferneceInMins = (starttime: string, endtime: string) => {
  const startTotalMins = timeStringToMins(starttime)
  const endTotalMins = timeStringToMins(endtime)

  let diffInMins = endTotalMins - startTotalMins

  if (diffInMins < 0) {
    diffInMins += 24 * 60
  }

  return diffInMins
}

export const getFormattedTimeString = (input: Date | number | string) => {
  if (typeof input === "string") {
    return input.split(":").slice(0, 2).join(":")
  } else if (typeof input === "number") {
    const hours = Math.floor(input / 60)
    const mins = input % 60
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
  } else if (input instanceof Date) {
    return input.toLocaleTimeString("en-US", { hour12: false })
  } else {
    throw new Error("Invalid input type. Can only accept Date or number.")
  }
}

export const calculateTotalBreakMins = (record: IRecord) => {
  return record.breaks.reduce((acc: number, curr: IBreak) => {
    if (!curr.endtime || curr.endtime === "--:--") {
      return acc
    }
    return acc + getTimeDifferneceInMins(curr.starttime, curr.endtime)
  }, 0)
}

export const zip = (fillna: any, ...arrays: any) => {
  const length = Math.max(...arrays.map((arr: any) => arr.length))
  return Array.from({ length }, (_, i) =>
    arrays.map((arr: any) => (arr[i] ? arr[i] : fillna))
  )
}

export const areSameDay = (d1: Date, d2: Date) => {
  const {year: year1, month: month1, day: day1} = extractDateParts(d1)
  const {year: year2, month: month2, day: day2} = extractDateParts(d2)
  const d1Str = `${year1}-${month1}-${day1}`
  const d2Str = `${year2}-${month2}-${day2}`
  return d1Str === d2Str
}

export const extractDateParts = (date: Date) => {
  const [
    { value: weekday },
    ,
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
  ] = formatter.formatToParts(date)
  return { weekday, year, month, day }
}

export const generatePageIndexes = (
  currentPageIndex: number,
  totalPages: number
) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPageIndex <= 3) {
    return [1, 2, 3, "...", totalPages - 1, totalPages]
  }

  if (currentPageIndex >= totalPages - 2) {
    return [1, 2, "...", totalPages - 2, totalPages - 1, totalPages]
  }

  return [
    1,
    "...",
    currentPageIndex - 1,
    currentPageIndex,
    currentPageIndex + 1,
    "...",
    totalPages,
  ]
}

export const dateStrOneMonthOffset = (date: Date, offset: 'prev' | 'next') => {
  const {year, month} = extractDateParts(date)
  let newYear = year
  let newMonth = month
  if (offset === 'prev') {
    if (month === '01') {
      newYear = String(Number(year) - 1)
      newMonth = "12"
    } else {
      newMonth = String(Number(month) - 1).padStart(2, '0')
    }
  } else {
    if (month === '12') {
      newYear = String(Number(year) + 1)
      newMonth = "01"
    } else {
      newMonth = String(Number(month) + 1).padStart(2, '0')
    }
  }
  return `${newYear}-${newMonth}`
}

export const dateToStr = (date: Date, format: 'yyyy-mm-dd' | 'yyyy-mm' | 'mm-dd' | 'yyyy-mm-dd (w)' =  'yyyy-mm-dd') => {
  const {weekday, year, month, day} = extractDateParts(date)
  switch (format) {
    case 'yyyy-mm-dd':
      return `${year}-${month}-${day}`
    case 'yyyy-mm':
      return `${year}-${month}`
    case 'mm-dd':
      return `${month}-${day}`
    case 'yyyy-mm-dd (w)':
      return `${year}-${month}-${day} (${weekday})`
    default:
      return `${year}-${month}-${day}`
  }
}

export const dateStrToMonthStr = (date: string) => {
  return date.split("-").slice(0, 2).join("-")
}

export const getMonthIndex = (month: string, uniqueMonths: string[]) => {
  return uniqueMonths.indexOf(month) + 1
}

export const getWeekdayName = (date: string | Date, locale: string = 'en-US', isShort: boolean = true) => {
  let d
  if (typeof date === 'string') {
    d = new Date(date)
  } else {
    d = date
  }
  return d.toLocaleDateString(locale, {weekday: isShort ? 'short' : 'long'})
}

export const createPageURL = (
  pathname: string,
  searchParams: ReadonlyURLSearchParams,
  key: string,
  value: number | string
) => {
  const params = new URLSearchParams(searchParams)
  params.set(key, value.toString())
  return `${pathname}?${params.toString()}`
}

export const generateObjFromRecords = (records: IRecord[]) => {
  const obj: TDateIndexedRecords = {}
  records.forEach((r) => {
    obj[r.date] = r
  })
  return obj
}

export const getFormattedTotalWorkHours = (record: IRecord) => {
  if (!record.endtime) {
    return placeholder
  }
  const totalWorkHoursInMins = getTimeDifferneceInMins(
    record.starttime,
    record.endtime
  )
  const totalBreakMins = calculateTotalBreakMins(record)
  return getFormattedTimeString(totalWorkHoursInMins - totalBreakMins)
}

export const getFormattedTotalBreakHours = (record: IRecord) => {
  const totalBreakMins = calculateTotalBreakMins(record)
  if (totalBreakMins > 0) {
    return getFormattedTimeString(totalBreakMins)
  }
  return placeholder
}

export const generatePaddedRecordsForMonth = (
  monthStr: string,
  records: IRecord[]
) => {
  const dateIndexedRecords = generateObjFromRecords(records)

  const paddedRecords: IPaddedRecord[] = []

  const [year, month] = monthStr.split("-").map(Number)
  const date = new Date(year, month - 1, 1)

  while (date.getMonth() === month - 1) {
    let paddedRecord: IPaddedRecord = {
      date: dateToStr(date),
      starttime: placeholder,
      breaks: [],
      endtime: placeholder,
      totalbreakhours: placeholder,
      totalworkhours: placeholder,
    }
    const record = dateIndexedRecords[dateToStr(date)]
    if (record) {
      paddedRecord = {
        ...record,
        totalbreakhours: getFormattedTotalBreakHours(record),
        totalworkhours: getFormattedTotalWorkHours(record),
      }
    }
    paddedRecords.push(paddedRecord)
    date.setDate(date.getDate() + 1)
  }
  return paddedRecords
}

export const calculateMonthlyTotalWorkMins = (records: IRecord[]) => {
  const recordsWithStartAndEndTimes = records.filter(
    (r) =>
      r.starttime && r.endtime && r.starttime !== null && r.endtime !== null
  )
  const monthlyTotalWorkMins = recordsWithStartAndEndTimes.reduce(
    (acc, curr) => {
      const workMins =
        getTimeDifferneceInMins(curr.starttime, curr.endtime!) -
        calculateTotalBreakMins(curr)
      return acc + workMins
    },
    0
  )
  return monthlyTotalWorkMins
}

export const mapCurrencyToMark = (currency: string) => {
  switch (currency) {
    case "yen":
    case "rmb":
      return "¥"
    case "usd":
      return "$"
    default:
      return "$"
  }
}

export const calculateWageFromMins = (mins: number, hourlyWage: number) => {
  return Math.round(mins) / 60 * hourlyWage
}

export const fetchNationalHolidays = async (year: string | number, countryCode: string) => {
  const res = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`)
  const array = await res.json()
  return array
}

export const isSaturday = (date: Date) => {
  return date.getDay() === 6
}

export const isSunday = (date: Date) => {
  return date.getDay() === 0
}

export const isNationalHoliday = (date: string, nationalHolidays: any[]) => {
  return !!nationalHolidays.map((obj: any) => obj.date).find((d: string) => d === date)
}

export const mapRecordsToNoticifications = (records: IRecord[]) => {
  return records.map(record => ([
    {
      type: 'empty work end time' as TNotificationType,
      navigateToPath: `/app/records/${record.id}/edit?month=${dateStrToMonthStr(record.date)}`,
      text: `${record.date}: work not ended`,
      isUrgent: true
    },
    ...record.breaks.map((_) => ({
      type: 'empty break end time' as TNotificationType,
      navigateToPath: `/app/records/${record.id}/edit?month=${dateStrToMonthStr(record.date)}`,
      text: `${record.date}: break not ended`,
      isUrgent: true
    }))
  ])).reduce((acc, curr) => {
    return [...acc, ...curr]
  }, [])
}
