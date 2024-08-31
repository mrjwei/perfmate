'use client'

import React, {useEffect} from 'react'
import Button from '@/app/ui/button/button'

export default function Error({
  error,
  reset
} : {
  error: Error & {digest?: string}
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h2 className="text-3xl font-bold mb-12">Something went wrong</h2>
      <Button type="button" onClick={reset} className="bg-lime-600 text-white">
        Try again
      </Button>
    </div>
  )
}
