'use client'

import {useState, useEffect, useRef} from 'react'
import Clock from '@/app/ui/clock/clock'
import StartWorkingButton from '@/app/ui/start-working-button/start-working-button'
import EndWorkingButton from '@/app/ui/end-working-button/end-working-button'
import StartBreakButton from '@/app/ui/start-break-button/start-break-button'
import EndBreakButton from '@/app/ui/end-break-button/end-break-button'
import { v4 as uuidv4 } from 'uuid'
import Sidebar from '@/app/ui/sidebar/sidebar'
import Tag from '@/app/ui/tag/tag'
import BreakUnit from "@/app/ui/break-unit/break-unit"
import TimeStamp from "./ui/time-stamp/time-stamp"
import {TStatus} from '@/app/lib/types'
import {
  returnStatus,
  getFormattedDateString,
  getTimeDifferneceInMins,
  getFormattedTimeString
} from '@/app/lib/helpers'

export default function Home() {
  const [status, setStatus] = useState<TStatus | null>(null)
  const recordRef = useRef<any>(null)

  const fetchRecordByDate = async (date: Date) => {
    const dateStr = getFormattedDateString(date)
    const res = await fetch(`http://localhost:3000/records?date=${dateStr}`)
    const records = await res.json()
    return records.length > 0 ? records[0] : null
  }

  useEffect(() => {
    /**
     * Assign today's record to recordRef and
     * initialize status
     */
    const initialize = async () => {
      const record = await fetchRecordByDate(new Date())
      if (record) {
        recordRef.current = record
        setStatus(returnStatus(record))
      } else {
        setStatus('BEFORE-WORK')
      }
    }
    initialize()
  }, [])

  useEffect(() => {
    const updateRecord = async () => {
      const record = await fetchRecordByDate(new Date())
      recordRef.current = record
    }
    updateRecord()
  }, [status])

  const handleStartWorking = async () => {
    let res
    if (recordRef.current === null) {
      const newRecord = {
        id: uuidv4(),
        date: getFormattedDateString(new Date()),
        start_time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit',hour12: false}),
        end_time: '',
        breaks: [],
        total_hours: ''
      }
      res = await fetch(
        `http://localhost:3000/records`,
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newRecord)
        }
      )
    } else {
      res = await fetch(
        `http://localhost:3000/records/${recordRef.current.id}`,
        {
          method: "PATCH",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({start_time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})})
        }
      )
    }
    if (res.ok) {
      setStatus('IN-WORK')
    }
  }

  const handleEndWorking = async () => {
    if (recordRef.current) {
      /**
       * `http://localhost:3000/records?id=${record.id}` does not work
       * because it is intended for filtering (GET tasks) and returns
       * an array instead of a single resource.
       */
      const end_time = new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit', hour12: false})
      await fetch(
        `http://localhost:3000/records/${recordRef.current.id}`,
        {
          method: "PATCH",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({end_time, total_hours: getFormattedTimeString(getTimeDifferneceInMins(recordRef.current.start_time, end_time))})
        }
      )
      setStatus('AFTER-WORK')
    }
  }

  const handleStartBreak = async () => {
    const newBreak = {
      id: uuidv4(),
      date: recordRef.current.date,
      start_time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit',hour12: false}),
      end_time: ''
    }
    await fetch(
      `http://localhost:3000/records/${recordRef.current.id}`,
      {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({breaks: [...recordRef.current.breaks, newBreak]})
      }
    )
    setStatus('IN-BREAK')
  }

  const handleEndBreak = async () => {
    const breakRecord = recordRef.current.breaks.find((b: any) => b["end_time"] === "")
    if (!breakRecord) return
    await fetch(
      `http://localhost:3000/records/${recordRef.current.id}`,
      {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({breaks: recordRef.current.breaks.map((b: any) => b.id === breakRecord.id ? ({...breakRecord, end_time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit',hour12: false})}) : b)})
      }
    )
    setStatus('IN-WORK')
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="mx-auto py-12 w-2/3 xl:w-3/5 2xl:w-2/5">
        <Clock />
        <div className="w-full flex justify-between items-center py-8">
          <Tag testid="status" className="mr-4">{status}</Tag>
          <div className="flex justify-between">
            <StartWorkingButton handleStartWorking={handleStartWorking} disabled={status !== 'BEFORE-WORK'} />
            <StartBreakButton handleStartBreak={handleStartBreak} disabled={status !== 'IN-WORK'} />
            <EndBreakButton handleEndBreak={handleEndBreak} disabled={status !== 'IN-BREAK'} />
            <EndWorkingButton handleEndWorking={handleEndWorking} disabled={status !== 'IN-WORK'} />
          </div>
        </div>
        <ul className="pl-4">
          {recordRef.current?.start_time && (
            <li className="border-t-2 py-4">
              <TimeStamp heading='Started work at' timeStamp={recordRef.current.start_time} />
            </li>
          )}
          <li>
            <ul className="pl-4">
              {recordRef.current?.breaks.map((b: any, i: number) => (
                <li className="border-t-2 py-2" key={`${b.start_time}-${i}`}>
                  <BreakUnit index={i + 1} startTime={b.start_time} endTime={b.end_time} />
                </li>
              ))}
            </ul>
          </li>
          {recordRef.current?.end_time && (
            <li className="border-t-2 py-4">
              <TimeStamp heading='Finished work at' timeStamp={recordRef.current.end_time} />
            </li>
          )}
          {recordRef.current?.total_hours && (
            <li className="border-t-2 py-4">
              <TimeStamp heading='Total hours' timeStamp={recordRef.current.total_hours} />
            </li>
          )}
        </ul>
      </main>
    </div>
  )
}
