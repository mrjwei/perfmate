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
