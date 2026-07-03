import { z } from "zod"
import { userBaseSchema, workspaceBaseSchema } from "@/app/lib/schemas"

export type TStatus = 'BEFORE-WORK' | 'IN-WORK' | 'IN-BREAK' | 'AFTER-WORK'

export interface IRecord {
  id: string
  userid: string
  workspaceid: string
  date: string
  starttime: string
  breaks: IBreak[]
  endtime: string | null
}

export interface IPaddedRecord extends Omit<IRecord, 'id' | 'userid' | 'workspaceid'> {
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

export interface IWorkspace extends Omit<z.infer<typeof workspaceBaseSchema>, 'schedule'> {
  userid: string
  archived: boolean
  schedule: TWeekday[]
  // Not user-editable yet — every workspace is 'JP' (see workspaces.tax_country
  // migration); the seam for a second country's tax module, not exposed in
  // the create/update form schema since there's nothing to choose yet.
  taxcountry: string
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

// Billing fields live on `users` but aren't part of the signup/settings form
// schema (see IWorkspace's archived/schedule for the same pattern), so this
// is a separate interface rather than an extension of IUser.
export type TPlan = 'free' | 'pro'

export interface IUserPlan {
  plan: TPlan
  planStatus: string | null
  currentPeriodEnd: string | null
  stripeCustomerId: string | null
}

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
