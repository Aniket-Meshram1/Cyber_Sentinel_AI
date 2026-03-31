"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { DashboardHeader } from "./header"
import { SummaryCards } from "./summary-cards"
import { TrafficChart } from "./traffic-chart"
import { AlertTable } from "./alert-table"
import { fetchStats, fetchAlerts, type SystemStats, type ApiAlert } from "@/lib/api"
import type { FlowData, AlertEntry, TrafficPoint } from "@/lib/cyber-data"

const MAX_TRAFFIC_POINTS = 30

export function CyberDashboard() {
  const [mounted, setMounted] = useState(false)
  const [flowData, setFlowData] = useState<FlowData | null>(null)
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([])
  const [alerts, setAlerts] = useState<AlertEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const retryCount = useRef(0)

  // Initial mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const stats: SystemStats = await fetchStats()

      // Update summary
      setFlowData({
        totalFlows: stats.total_flows,
        normalFlows: stats.normal,
        attacksDetected: stats.attacks,
        isUnderAttack: stats.status === "THREAT",
      })

      // Fetch alerts
      const apiAlerts: ApiAlert[] = await fetchAlerts()

      const formattedAlerts: AlertEntry[] = apiAlerts.slice(0, 20).map((alert, index) => ({
        id: `${alert.timestamp}-${alert.source_ip}-${index}`,
        time: new Date(alert.timestamp).toLocaleTimeString(),
        sourceIp: alert.source_ip ?? "N/A",
        destinationIp: alert.destination_ip ?? "N/A",
        protocol: alert.protocol ?? "N/A",
        status: alert.label === "DDoS Attack" ? "Attack" : "Normal",
      }))

      setAlerts(formattedAlerts)

      // Simulated traffic (since backend doesn't provide it)
      setTrafficData((prev) => {
        const newPoint: TrafficPoint = {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          packetsPerSec: Math.floor(Math.random() * 500),
          bytesPerSec: Math.floor(Math.random() * 1000),
        }

        const next = [...prev, newPoint]
        return next.length > MAX_TRAFFIC_POINTS
          ? next.slice(-MAX_TRAFFIC_POINTS)
          : next
      })

      // Success
      setError(null)
      retryCount.current = 0

    } catch (err) {
      console.warn("API fetch failed:", err)

      retryCount.current += 1

      // Show error only after repeated failures
      if (retryCount.current >= 2) {
        setError("Connecting to backend... (retrying)")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Polling setup
  useEffect(() => {
    if (!mounted) return

    fetchData()
    pollInterval.current = setInterval(fetchData, 5000)

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [mounted, fetchData])

  const safeFlowData: FlowData = flowData ?? {
    totalFlows: 0,
    normalFlows: 0,
    attacksDetected: 0,
    isUnderAttack: false,
  }

  // Initial loading screen
  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        <div className="w-12 h-12 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin" />
        <p className="text-lg font-mono text-muted-foreground">
          Initializing Cyber Sentinel...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <DashboardHeader />

        <div className="flex flex-col gap-6">
          {error && (
            <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 p-3 rounded-lg text-center font-mono">
              {error}
            </div>
          )}

          <SummaryCards data={safeFlowData} />
          <TrafficChart data={trafficData} />
          <AlertTable alerts={alerts} />
        </div>

        <footer className="mt-12 pb-8 text-center text-[10px] font-mono text-muted-foreground/50 tracking-wider uppercase">
          Cyber Sentinel AI • Live • Protected
        </footer>
      </main>
    </div>
  )
}