"use client"

import { AlertTriangle, Shield } from "lucide-react"
import type { AlertEntry } from "@/lib/cyber-data"

interface AlertTableProps {
  alerts: AlertEntry[]
}

export function AlertTable({ alerts }: AlertTableProps) {
  return (
    <div className="glass-panel rounded-xl border border-glass-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground font-sans">
            Alert Feed
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Recent network events &amp; intrusion alerts
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neon-green" />
            Normal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-attack-red" />
            Attack
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-glass-border bg-secondary/50">
              <th className="text-left px-5 py-3 text-muted-foreground font-medium uppercase tracking-wider">
                Time
              </th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium uppercase tracking-wider">
                Source IP
              </th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium uppercase tracking-wider">
                Destination IP
              </th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium uppercase tracking-wider">
                Protocol
              </th>
              <th className="text-left px-5 py-3 text-muted-foreground font-medium uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => {
              const isAttack = alert.status === "Attack"
              return (
                <tr
                  key={alert.id}
                  className={`border-b border-glass-border transition-colors ${
                    isAttack
                      ? "bg-attack-red-dim/50 hover:bg-attack-red-dim"
                      : "hover:bg-secondary/30"
                  }`}
                >
                  <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
                    {alert.time}
                  </td>
                  <td className="px-5 py-3 text-foreground whitespace-nowrap">
                    {alert.sourceIp}
                  </td>
                  <td className="px-5 py-3 text-foreground whitespace-nowrap">
                    {alert.destinationIp}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {alert.protocol}
                    </span>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isAttack
                          ? "bg-attack-red-dim text-attack-red"
                          : "bg-neon-green-dim text-neon-green"
                      }`}
                    >
                      {isAttack ? (
                        <AlertTriangle className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {alert.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
