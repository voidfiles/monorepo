"use client"
import Image from 'next/image'
import { useEffect, useState } from 'react'

const time = (): string => {
  return new Date().toLocaleTimeString('en-US')
}

export default function Home() {
  const [t, setTime] = useState<string>("")
  const [timer, setTimer] = useState<string>("")

  useEffect(() => {
    const cancel = setInterval(() => {
      setTime(time())
    }, 10)

    return () => {
      clearInterval(cancel);
    }
  })

  useEffect(() => {
    
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="text-9xl font-mono">
        {t}
      </div>
      <div className="text-9xl font-mono">
        {timer}
      </div>
    </main>
  )
}
