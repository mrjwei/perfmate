import {describe, it, expect} from 'vitest'
import {extractDateParts, areSameDay, returnStatus} from '@/app/lib/helpers'
import {
  todayRecord,
  todayRecordWithNullEndtime,
  todayRecordWithNullEndtimeBreaks,
  todayRecordWithNonNullEndtimeBreaks,
  recordOfAnotherDay
} from '@/app/lib/test-utils/mock-date';

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

