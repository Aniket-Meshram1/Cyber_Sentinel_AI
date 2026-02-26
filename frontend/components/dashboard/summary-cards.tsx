"use client"

import { Layers, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react"
import type { FlowData } from "@/lib/cyber-data"
import { formatNumber } from "@/lib/cyber-data"

interface SummaryCardsProps {
  data: FlowData
}

interface StatCardProps {
  label: string
  value: string
  icon: React.ReactNode
  accent?: "green" | "red" | "blue"
  badge?: { text: string; variant: "safe" | "danger" }
}

function StatCard({ label, value, icon, accent = "green", badge }: StatCardProps) {
  const accentBorder =
    accent === "red"
      ? "border-attack-red/20 hover:border-attack-red/40"
      : accent === "blue"
      ? "border-cyber-blue/20 hover:border-cyber-blue/40"
      : "border-neon-green/20 hover:border-neon-green/40"

  const iconColor =
    accent === "red"
      ? "text-attack-red"
      : accent === "blue"
      ? "text-cyber-blue"
      : "text-neon-green"

  const iconBg =
    accent === "red"
      ? "bg-attack-red-dim"
      : accent === "blue"
      ? "bg-[rgba(0,191,255,0.12)]"
      : "bg-neon-green-dim"

  return (
    <div
      className={`glass-panel rounded-xl p-5 ${accentBorder} border transition-colors duration-300`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold font-mono text-foreground">{value}</p>
        {badge && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
              badge.variant === "safe"
                ? "bg-neon-green-dim text-neon-green"
                : "bg-attack-red-dim text-attack-red animate-neon-pulse"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                badge.variant === "safe" ? "bg-neon-green" : "bg-attack-red"
              }`}
            />
            {badge.text}
          </span>
        )}
      </div>
    </div>
  )
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Flows"
        value={formatNumber(data.totalFlows)}
        icon={<Layers className="w-4 h-4" />}
        accent="blue"
      />
      <StatCard
        label="Normal Flows"
        value={formatNumber(data.normalFlows)}
        icon={<CheckCircle2 className="w-4 h-4" />}
        accent="green"
      />
      <StatCard
        label="Attacks Detected"
        value={data.attacksDetected.toString()}
        icon={<AlertTriangle className="w-4 h-4" />}
        accent="red"
      />
      <StatCard
        label="Current Status"
        value={data.isUnderAttack ? "THREAT" : "SECURE"}
        icon={
          data.isUnderAttack ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )
        }
        accent={data.isUnderAttack ? "red" : "green"}
        badge={{
          text: data.isUnderAttack ? "Under Attack" : "Safe",
          variant: data.isUnderAttack ? "danger" : "safe",
        }}
      />
    </div>
  )
}
