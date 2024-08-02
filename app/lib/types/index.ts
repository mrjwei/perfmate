export type TStatus = 'BEFORE-WORK' | 'IN-WORK' | 'IN-BREAK' | 'AFTER-WORK'

export interface IRecord {
  id: string
  date: string
  startTime: string
  endTime: string
  breaks: IBreak[]
  totalHours: string
}

export interface IBreak {
  id: string
  date: string
  startTime: string
  endTime: string
}
