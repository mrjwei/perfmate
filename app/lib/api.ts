import {unstable_noStore as noStore} from 'next/cache'

export const fetchRecords = async () => {
  noStore()
  const res = await fetch(`http://localhost:3000/records`)
  const records = await res.json()
  return records
}

export const fetchOneRecord = async (id: string) => {
  noStore()
  const res = await fetch(`http://localhost:3000/records/${id}`)
  const record = await res.json()
  return record
}
