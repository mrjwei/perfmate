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

export interface IThread {
  id: string
  userid: string
  name: string
  hourlywage: number
  currency: string
  taxincluded: boolean
  taxrate: number
  archived: boolean
  schedule: TWeekday[]
}

export interface IBreak {
  id: string
  recordId: string
  starttime: string
  endtime: string | null
}

export interface IGenericBreak extends Omit<IBreak, 'recordId' | 'starttime' | 'endtime'> {
  [key: string]: any
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

export interface IUser {
  id: string
  name: string
  email: string
  password: string
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
