import { ReadonlyURLSearchParams } from "next/navigation"
import {
  TStatus,
  IRecord,
  IBreak,
  IThread,
  TDateIndexedRecords,
  IPaddedRecord,
  TNotificationType,
  INationalHoliday,
} from "@/app/lib/types"

export const placeholder = "--:--"

// Fallback for calendar-date formatting (dateToStr, extractDateParts, etc.)
// which deals with dates that are already known (e.g. a DB date column, a
// month string from a URL) rather than "the current moment" — that math
// doesn't depend on any particular timezone, so this default only matters for
// display and is not a correctness issue.
export const formatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Tokyo"
})

// Timezone is a per-thread setting (thread.timezone) since a user can work
// for companies in different countries. These helpers answer "what is today"
// and "what time is it right now" for a specific thread's timezone — unlike
// `formatter` above, this genuinely depends on the timezone since it's
// evaluating the current instant, not reformatting an already-known date.
const timezoneDateFormatterCache = new Map<string, Intl.DateTimeFormat>()
const getDateFormatterForTimezone = (timezone: string) => {
  let tzFormatter = timezoneDateFormatterCache.get(timezone)
  if (!tzFormatter) {
    tzFormatter = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: timezone,
    })
    timezoneDateFormatterCache.set(timezone, tzFormatter)
  }
  return tzFormatter
}

export const extractDatePartsInTimezone = (date: Date, timezone: string) => {
  const [
    { value: weekday },
    ,
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
  ] = getDateFormatterForTimezone(timezone).formatToParts(date)
  return { weekday, year, month, day }
}

export const getTodayInTimezone = (timezone: string) => {
  const { year, month, day } = extractDatePartsInTimezone(new Date(), timezone)
  return `${year}-${month}-${day}`
}

export const getCurrentTimeInTimezone = (timezone: string) => {
  return new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: timezone })
}

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

export const returnStatus = (record: IRecord, timezone: string) => {
  if (record.date === getTodayInTimezone(timezone)) {
    // If today's record exists
    if (record.endtime) {
      return "AFTER-WORK"
    } else {
      if (record.breaks.length > 0) {
        if (record.breaks.some((b) => !b.endtime)) {
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

export const zip = <T>(fillna: T, ...arrays: T[][]): T[][] => {
  const length = Math.max(...arrays.map((arr) => arr.length))
  return Array.from({ length }, (_, i) =>
    arrays.map((arr) => (arr[i] ? arr[i] : fillna))
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

export interface IWageBreakdown {
  exclTax: number
  inclTax: number
}

// A thread's hourlywage is either tax-inclusive or tax-exclusive (per its
// taxincluded flag); this derives the other figure from taxrate (a percentage,
// e.g. 10 for a 10% consumption/sales tax) so both can be displayed.
export const calculateWage = (
  mins: number,
  thread: Pick<IThread, "hourlywage" | "taxincluded" | "taxrate">
): IWageBreakdown => {
  const base = (Math.round(mins) / 60) * thread.hourlywage
  const taxMultiplier = 1 + thread.taxrate / 100
  if (thread.taxincluded) {
    return { inclTax: base, exclTax: base / taxMultiplier }
  }
  return { exclTax: base, inclTax: base * taxMultiplier }
}

export const fetchNationalHolidays = async (year: string | number, countryCode: string): Promise<INationalHoliday[]> => {
  const res = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`)
  return res.json()
}

export const isSaturday = (date: Date) => {
  return date.getDay() === 6
}

export const isSunday = (date: Date) => {
  return date.getDay() === 0
}

export const isNationalHoliday = (date: string, nationalHolidays: INationalHoliday[]) => {
  return nationalHolidays.some((holiday) => holiday.date === date)
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
