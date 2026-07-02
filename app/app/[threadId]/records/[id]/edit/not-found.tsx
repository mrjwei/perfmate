import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h2 className="text-3xl font-bold mb-12">Requested record not found</h2>
      <Link href='/app/threads'>
        <Button>Go Back</Button>
      </Link>
    </div>
  )
}
