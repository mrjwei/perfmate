import { z } from "zod"
import { userBaseSchema, threadBaseSchema } from "@/app/lib/schemas"

export type TStatus = 'BEFORE-WORK' | 'IN-WORK' | 'IN-BREAK' | 'AFTER-WORK'

export interface IRecord {
  id: string
  userid: string
  threadid: string
  date: string
  starttime: string
  breaks: IBreak[]
  endtime: string | null
}

export interface IPaddedRecord extends Omit<IRecord, 'id' | 'userid' | 'threadid'> {
  id?: string
  totalbreakhours: string
  totalworkhours: string
}

// 0 = Sunday .. 6 = Saturday, matching JS Date#getDay()
export type TWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface INationalHoliday {
  date: string
  localName: string
  name: string
  countryCode: string
  fixed: boolean
  global: boolean
  counties: string[] | null
  launchYear: number | null
  types: string[]
}

export interface IThread extends Omit<z.infer<typeof threadBaseSchema>, 'schedule'> {
  userid: string
  archived: boolean
  schedule: TWeekday[]
}

export interface IBreak {
  id: string
  recordId: string
  starttime: string
  endtime: string | null
}

export interface IGenericBreak {
  id: string
  starttime?: string
  endtime?: string | null
}

export type TDateIndexedRecords = {
  [key: string]: IRecord
}

export type TRecordsProps = {
  searchParams: {
    month?: string
    date?: string
  }
}

export type IUser = z.infer<typeof userBaseSchema>

export type TNotificationType = 'empty break end time' | 'empty work end time'

export interface INotification {
  type: TNotificationType
  navigateToPath: string
  text: string
  isUrgent: boolean
}

export type TActionState = {
  message: string
  errors: {
    [key: string]: string
  }
}

export type TBreakFieldErrorDetail = {
  id: string
  fieldName: string
}

export type TRecordFormFieldError = {
  message: string
  errors?: TBreakFieldErrorDetail[]
}

export type TRecordFormState = {
  message: string
  errors: {
    [key: string]: TRecordFormFieldError
  }
} | undefined
