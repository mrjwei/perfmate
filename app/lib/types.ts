export type TStatus = 'BEFORE-WORK' | 'IN-WORK' | 'IN-BREAK' | 'AFTER-WORK'

export interface IRecord {
  id: string
  date: string
  starttime: string
  breaks: IBreak[]
  endtime: string
}

export interface IBreak {
  id: string
  starttime: string
  endtime: string
}

export type TActionState = {
  message?: string | null
  errors?: {
    id?: string[]
    date?: string[]
    starttime?: string[]
    breaks?: string[]
    endtime?: string[]
  }
}
