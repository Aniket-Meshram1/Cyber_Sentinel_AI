"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import type { TrafficPoint } from "@/lib/cyber-data"
import { formatBytes } from "@/lib/cyber-data"

interface TrafficChartProps {
  data: TrafficPoint[]
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-panel rounded-lg px-4 py-3 shadow-2xl border border-glass-border">
      <p className="text-xs font-mono text-muted-foreground mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">
            {entry.dataKey === "packetsPerSec" ? "Packets/s" : "Bytes/s"}:
          </span>
          <span className="text-foreground font-bold">
            {entry.dataKey === "bytesPerSec"
              ? formatBytes(entry.value)
              : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

function CustomLegend({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>
}) {
  if (!payload?.length) return null
  const labels: Record<string, string> = {
    packetsPerSec: "Packets/sec",
    bytesPerSec: "Bytes/sec",
  }
  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          {labels[entry.value] ?? entry.value}
        </div>
      ))}
    </div>
  )
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <div className="glass-panel rounded-xl p-5 border border-glass-border">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground font-sans">
            Real-Time Network Traffic
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Packets per second & bytes per second
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-neon-green bg-neon-green-dim px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-neon-pulse" />
          STREAMING
        </span>
      </div>

      <div className="h-[280px] -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#6b7a8d", fontFamily: "Geist Mono, monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "#6b7a8d", fontFamily: "Geist Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toString())}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "#6b7a8d", fontFamily: "Geist Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(v: number) =>
                v >= 1000000
                  ? `${(v / 1000000).toFixed(1)}M`
                  : v >= 1000
                  ? `${(v / 1000).toFixed(0)}K`
                  : v.toString()
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="packetsPerSec"
              stroke="#00ff88"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#00ff88", stroke: "#06080e", strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="bytesPerSec"
              stroke="#00bfff"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#00bfff", stroke: "#06080e", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
