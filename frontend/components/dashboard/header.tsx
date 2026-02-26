"use client"

import { Shield, Activity } from "lucide-react"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const update = () =>
      setCurrentTime(
        new Date().toLocaleString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      )
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex items-center justify-between pb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-neon-green-dim">
          <Shield className="w-6 h-6 text-neon-green" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-green animate-neon-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-sans">
            Cyber Sentinel AI
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Enterprise Threat Monitoring
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md glass-panel">
          <Activity className="w-3.5 h-3.5 text-neon-green animate-neon-pulse" />
          <span className="text-xs font-mono text-neon-green">LIVE</span>
        </div>
        {currentTime && (
          <time className="text-xs font-mono text-muted-foreground">
            {currentTime}
          </time>
        )}
      </div>
    </header>
  )
}
