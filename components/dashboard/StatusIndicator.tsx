"use client"
import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_URL

export default function StatusIndicator() {
  const [isLive, setIsLive] = useState<boolean | null>(null)

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    try {
      const res = await fetch(`${API}/dashboard/stats`)
      setIsLive(res.ok)
    } catch {
      setIsLive(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${isLive === null ? "bg-gray-500" : isLive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
      <span className="text-xs text-gray-400">
        {isLive === null ? "Connecting..." : isLive ? "Live" : "Offline"}
      </span>
    </div>
  )
}
