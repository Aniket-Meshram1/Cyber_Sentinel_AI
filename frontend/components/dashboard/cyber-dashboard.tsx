"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "./header"
import { SummaryCards } from "./summary-cards"
import { TrafficChart } from "./traffic-chart"
import { AlertTable } from "./alert-table"
// Import the new API functions
import { fetchStats, fetchAlerts, type SystemStats, type ApiAlert } from "@/lib/api"
// Keep simulated data for the traffic chart, as the backend doesn't provide this.
import {
  generateTrafficHistory,
  generateNewTrafficPoint,
  type TrafficPoint,
} from "@/lib/cyber-data"

// Re-define these types here to match what the components expect
import type { FlowData, AlertEntry } from "@/lib/cyber-data"

const MAX_TRAFFIC_POINTS = 30
const MAX_ALERTS = 20

export function CyberDashboard() {
  const [mounted, setMounted] = useState(false)
  const [flowData, setFlowData] = useState<FlowData | null>(null)
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([])
  const [alerts, setAlerts] = useState<AlertEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  // Initial data load (simulated for traffic, empty for others)
  useEffect(() => {
    setTrafficData(generateTrafficHistory(MAX_TRAFFIC_POINTS))
    setMounted(true)
  }, [])

  // Main data fetching and polling loop
  useEffect(() => {
    if (!mounted) return

    const fetchData = async () => {
      try {
        // 1. Fetch live stats from the backend
        const stats: SystemStats = await fetchStats()
        setFlowData({
          totalFlows: stats.total_flows,
          normalFlows: stats.normal,
          attacksDetected: stats.attacks,
          isUnderAttack: stats.status === "THREAT",
        })

        // 2. Fetch live alerts from the backend
        const apiAlerts: ApiAlert[] = await fetchAlerts()
        const formattedAlerts: AlertEntry[] = apiAlerts.map(alert => ({
          id: `${alert.timestamp}-${alert.source_ip}`,
          time: new Date(alert.timestamp).toLocaleTimeString(),
          sourceIp: alert.source_ip ?? "N/A",
          destinationIp: alert.destination_ip ?? "N/A",
          protocol: alert.protocol ?? "N/A",
          status: alert.label === "DDoS Attack" ? "Attack" : "Normal",
        }))
        setAlerts(formattedAlerts)

        // 3. Update simulated traffic chart data (no backend equivalent)
        setTrafficData((prev) => {
          const next = [...prev, generateNewTrafficPoint()]
          return next.length > MAX_TRAFFIC_POINTS ? next.slice(-MAX_TRAFFIC_POINTS) : next
        })

        setError(null) // Clear error on success
      } catch (e) {
        console.error("API Error:", e)
        setError(`Backend Error: ${e instanceof Error ? e.message : "Connection Failed"}. Is 'python app.py' running?`)
      }
    }

    fetchData() // Initial fetch
    const interval = setInterval(fetchData, 2000) // Poll every 2 seconds
    return () => clearInterval(interval)
  }, [mounted])

  // Default flow data for the loading/skeleton state
  const safeFlowData: FlowData = flowData ?? {
    totalFlows: 0,
    normalFlows: 0,
    attacksDetected: 0,
    isUnderAttack: false,
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-neon-green/[0.02] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyber-blue/[0.02] blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <DashboardHeader />

        {!mounted ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <div className="w-10 h-10 rounded-full border-2 border-neon-green/30 border-t-neon-green animate-spin" />
            <p className="text-sm font-mono text-muted-foreground">Initializing sensors...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center font-mono">
                {error}
              </div>
            )}
            <SummaryCards data={safeFlowData} />
            <TrafficChart data={trafficData} />
            <AlertTable alerts={alerts} />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 pb-4 text-center text-[10px] font-mono text-muted-foreground/50 tracking-wider uppercase">
          Cyber Sentinel AI v2.4.1 &middot; Encrypted Channel &middot; All
          Systems Nominal
        </footer>
      </main>
    </div>
  )
}
