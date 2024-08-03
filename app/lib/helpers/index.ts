import {TStatus, IRecord, IBreak} from '@/app/lib/types'

export const returnStatus = (record: IRecord) => {
  if (record['startTime']) {
    if (record['endTime']) {
      return 'AFTER-WORK'
    } else {
      if (record['breaks'].length > 0) {
        if (record['breaks'].some((b: any) => !b['endTime'])) {
          return 'IN-BREAK'
        } else {
          return 'IN-WORK'
        }
      } else {
        return 'IN-WORK'
      }
    }
  } else {
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
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export const getTimeDifferneceInMins = (startTime: string, endTime: string) => {
  const [startHours, startMins] = startTime.split(':').map(Number)
  const [endHours, endMins] = endTime.split(':').map(Number)

  const startTotalMins = startHours * 60 + startMins;
  const endTotalMins = endHours * 60 + endMins;

  let diffInMins = endTotalMins - startTotalMins

  if (diffInMins < 0) {
    diffInMins += 24 * 60
  }

  return diffInMins
}

export const getFormattedTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export const calculateTotalBreakMins = (record: IRecord) => {
  return record.breaks.reduce((acc: number, curr: IBreak) => acc + getTimeDifferneceInMins(curr.startTime, curr.endTime), 0)
}
