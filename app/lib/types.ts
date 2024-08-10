export type TStatus = 'BEFORE-WORK' | 'IN-WORK' | 'IN-BREAK' | 'AFTER-WORK'

export interface IRecord {
  id: string
  date: string
  starttime: string
  breaks: IBreak[]
  endtime: string | null
}

export interface IBreak {
  id: string
  starttime: string
  endtime: string | null
}

export type TDateIndexedRecords = {
  [key: string]: IRecord
}

export interface IPaddedRecord extends IRecord {
  totalbreakhours: string
  totalworkhours: string
}

export type TRecordsProps = {
  searchParams: {
    month?: string
    edited?: string
  }
}
