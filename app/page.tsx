'use client'

import {useState, useEffect, useRef} from 'react'
import Link from 'next/link'
import Clock from '@/app/ui/clock/clock'
import StartWorkingButton from '@/app/ui/start-working-button/start-working-button'
import EndWorkingButton from '@/app/ui/end-working-button'
import StartBreakButton from '@/app/ui/start-break-button'
import EndBreakButton from '@/app/ui/end-break-button'
import { v4 as uuidv4 } from 'uuid'

const returnStatus = (record: any) => {
  if (record['start_time']) {
    if (record['end_time']) {
      return 'AFTER-WORK'
    } else {
      if (record['breaks'].length > 0) {
        if (record['breaks'].some((b: any) => !b['end_time'])) {
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

const formatDate = (date: Date) => {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

const getFormattedTimeDiffernece = (startTime: string, endTime: string) => {
  const [startHours, startMins] = startTime.split(':').map(Number)
  const [endHours, endMins] = endTime.split(':').map(Number)

  const startTotalMins = startHours * 60 + startMins;
  const endTotalMins = endHours * 60 + endMins;

  let diffInMins = endTotalMins - startTotalMins

  if (diffInMins < 0) {
    diffInMins += 24 * 60
  }

  const hours = Math.floor(diffInMins / 60)
  const mins = diffInMins % 60

  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export default function Home() {
  const [status, setStatus] = useState<'BEFORE-WORK' | 'IN-WORK' | 'IN-BREAK' | 'AFTER-WORK' | null>(null)
  const recordRef = useRef<any>(null)

  const fetchRecordByDate = async (date: Date) => {
    const dateStr = formatDate(date)
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
        date: formatDate(new Date()),
        start_time: new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit',hour12: false}),
        end_time: '',
        breaks: [],
        total_hours: '00:00'
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
          body: JSON.stringify({end_time, total_hours: getFormattedTimeDiffernece(recordRef.current.start_time, end_time)})
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
    <div className="flex">
      <div>
        <h1>Logo</h1>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="">Records</Link>
          </li>
          <li>
            <Link href="">Settings</Link>
          </li>
        </ul>
      </div>
      <main>
        <Clock />
        <p data-testid="status">{status}</p>
        <div>
          <StartWorkingButton handleStartWorking={handleStartWorking} disabled={status !== 'BEFORE-WORK'} />
          <StartBreakButton handleStartBreak={handleStartBreak} disabled={status !== 'IN-WORK'} />
          <EndBreakButton handleEndBreak={handleEndBreak} disabled={status !== 'IN-BREAK'} />
          <EndWorkingButton handleEndWorking={handleEndWorking} disabled={status !== 'IN-WORK'} />
        </div>
        {recordRef.current?.start_time && (<p>Started work at: {recordRef.current.start_time}</p>)}
        {recordRef.current?.breaks.map((b: any, i: number) => (
          <>
            <p>Break {i + 1}:</p>
            <p>Begin: {b.start_time}</p>
            <p>End: {b.end_time}</p>
          </>
        ))}
        {recordRef.current?.end_time && (<p>Finished work at: {recordRef.current.end_time}</p>)}
      </main>
    </div>
  )
}
