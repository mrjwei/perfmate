import {describe, it, expect} from 'vitest'
import {
  extractDateParts,
  areSameDay,
  returnStatus,
  dateStrOneMonthOffset,
  dateToStr,
  isNationalHoliday,
  isSaturday,
  isSunday,
  calculateWageFromMins
} from '@/app/lib/helpers'
import {
  todayRecord,
  todayRecordWithNullEndtime,
  todayRecordWithNullEndtimeBreaks,
  todayRecordWithNonNullEndtimeBreaks,
  recordOfAnotherDay,
  holidays
} from '@/app/lib/test-utils/mock-data';

describe('Function extractDateParts', () => {
  it.each([
    ['2024-01-01', 'Mon', '2024', '01', '01'],
    ['2000-12-31', 'Sun', '2000', '12', '31'],
    ['1999-07-15', 'Thu', '1999', '07', '15']
  ])('returns correct values', (dateStr, expectedWeekday, expectedYear, expectedMonth, expectedDay) => {
    const {weekday, year, month, day} = extractDateParts(new Date(dateStr))
    expect(weekday).toBe(expectedWeekday)
    expect(year).toBe(expectedYear)
    expect(month).toBe(expectedMonth)
    expect(day).toBe(expectedDay)
  })
})

describe('Function areSameDay', () => {
  it('returns true if two dates are of the same day', () => {
    expect(areSameDay(new Date(), new Date())).toBeTruthy()
    expect(areSameDay(new Date('2023-01-02'), new Date('2023-01-02'))).toBeTruthy()
  })
  it('returns false if two dates are of different days', () => {
    expect(areSameDay(new Date(), new Date('1990-12-15'))).toBeFalsy()
    expect(areSameDay(new Date('2023-01-02'), new Date('1990-12-15'))).toBeFalsy()
  })
})

describe('Function returnStatus', () => {
  it('returns "BEFORE-WORK" if record date does not match today date', () => {
    expect(returnStatus(recordOfAnotherDay)).toBe("BEFORE-WORK")
  })

  it('returns "AFTER-WORK" if record date matches today date and record endtime is not null', () => {
    expect(returnStatus(todayRecord)).toBe("AFTER-WORK")
  })

  it('returns "IN-BREAK" if record has any break whose endtime is null', () => {
    expect(returnStatus(todayRecordWithNullEndtimeBreaks)).toBe("IN-BREAK")
  })

  it('returns "IN-WORK" if record has break(s) whose endtime(s) is(are) all non-null', () => {
    expect(returnStatus(todayRecordWithNonNullEndtimeBreaks)).toBe("IN-WORK")
  })

  it('returns "IN-WORK" if record has no break', () => {
    expect(returnStatus(todayRecordWithNullEndtime)).toBe("IN-WORK")
  })
});

describe('Function dateStrOneMonthOffset', () => {
  it.each([
    ['2024-12-06', 'next', '2025-01'],
    ['2024-01-31', 'next', '2024-02'],
    ['2024-06-15', 'next', '2024-07'],
    ['2024-01-31', 'prev', '2023-12'],
    ['2024-02-28', 'prev', '2024-01'],
    ['2024-06-15', 'prev', '2024-05'],
  ])('return correct date string', (dateStr, offset, expectedStr) => {
    const date = new Date(dateStr)
    const str = dateStrOneMonthOffset(date, offset as 'prev' | 'next')
    expect(str).toBe(expectedStr)
  })
});

describe('Function dateToStr', () => {
  it.each([
    ['2024-12-06', 'yyyy-mm-dd', '2024-12-06'],
    ['2023-06-15', 'yyyy-mm-dd', '2023-06-15'],
    ['2024-12-06', 'yyyy-mm', '2024-12'],
    ['2023-06-15', 'yyyy-mm', '2023-06'],
    ['2024-12-06', 'mm-dd', '12-06'],
    ['2023-06-15', 'mm-dd', '06-15'],
    ['2024-12-06', 'yyyy-mm-dd (w)', '2024-12-06 (Fri)'],
    ['2023-06-15', 'yyyy-mm-dd (w)', '2023-06-15 (Thu)'],
  ])('return correct date string', (dateStr, format, expectedStr) => {
    const date = new Date(dateStr)
    const str = dateToStr(date, format as 'yyyy-mm-dd' | 'yyyy-mm' | 'mm-dd' | 'yyyy-mm-dd (w)')
    expect(str).toBe(expectedStr)
  })
});

describe('Function isNationalHoliday', () => {
  it('returns true if a given day is a national nationalHolidays and false otherwise', () => {
    const result1 = isNationalHoliday('2024-11-23', holidays)
    const result2 = isNationalHoliday('2024-11-22', holidays)
    expect(result1).toBeTruthy()
    expect(result2).toBeFalsy()
  })
})

describe('Function isSaturday', () => {
  it('returns true if a given day is Saturday and false otherwise', () => {
    const result1 = isSaturday(new Date('2024-12-07'))
    const result2 = isSaturday(new Date('2024-12-08'))
    expect(result1).toBeTruthy()
    expect(result2).toBeFalsy()
  })
})

describe('Function isSunday', () => {
  it('returns true if a given day is Saturday and false otherwise', () => {
    const result1 = isSunday(new Date('2024-12-08'))
    const result2 = isSunday(new Date('2024-12-09'))
    expect(result1).toBeTruthy()
    expect(result2).toBeFalsy()
  })
})

describe('Function calculateWageFromMins', () => {
  it.each([
    [5, 600, 50],
    [5.4, 600, 50],
    [5.5, 600, 60],
    [100, 600, 1000],
  ])('returns correct values', (mins, hourlyWage, expectedWage) => {
    const wage = calculateWageFromMins(mins, hourlyWage)
    expect(wage).toBe(expectedWage)
  })
})



