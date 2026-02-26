// Simulated cybersecurity data for the dashboard

export interface FlowData {
  totalFlows: number
  normalFlows: number
  attacksDetected: number
  isUnderAttack: boolean
}

export interface TrafficPoint {
  time: string
  packetsPerSec: number
  bytesPerSec: number
}

export interface AlertEntry {
  id: string
  time: string
  sourceIp: string
  destinationIp: string
  protocol: string
  status: "Normal" | "Attack"
}

const protocols = ["TCP", "UDP", "ICMP", "HTTP", "HTTPS", "DNS", "SSH", "FTP"]

function randomIp(): string {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
}

function randomProtocol(): string {
  return protocols[Math.floor(Math.random() * protocols.length)]
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export function generateFlowData(): FlowData {
  const totalFlows = Math.floor(Math.random() * 5000) + 12000
  const attacksDetected = Math.floor(Math.random() * 180) + 20
  const normalFlows = totalFlows - attacksDetected
  const isUnderAttack = attacksDetected > 120

  return { totalFlows, normalFlows, attacksDetected, isUnderAttack }
}

export function generateTrafficHistory(points: number = 30): TrafficPoint[] {
  const now = Date.now()
  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now - (points - 1 - i) * 2000)
    const isBurst = Math.random() > 0.85
    return {
      time: formatTime(time),
      packetsPerSec: Math.floor(Math.random() * (isBurst ? 8000 : 4000)) + 1200,
      bytesPerSec: Math.floor(Math.random() * (isBurst ? 500000 : 250000)) + 50000,
    }
  })
}

export function generateNewTrafficPoint(): TrafficPoint {
  const isBurst = Math.random() > 0.85
  return {
    time: formatTime(new Date()),
    packetsPerSec: Math.floor(Math.random() * (isBurst ? 8000 : 4000)) + 1200,
    bytesPerSec: Math.floor(Math.random() * (isBurst ? 500000 : 250000)) + 50000,
  }
}

export function generateAlerts(count: number = 15): AlertEntry[] {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const isAttack = Math.random() > 0.65
    return {
      id: `alert-${now}-${i}`,
      time: formatTime(new Date(now - i * Math.floor(Math.random() * 5000 + 1000))),
      sourceIp: randomIp(),
      destinationIp: randomIp(),
      protocol: randomProtocol(),
      status: isAttack ? "Attack" : "Normal",
    }
  })
}

export function generateNewAlert(): AlertEntry {
  const isAttack = Math.random() > 0.6
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    time: formatTime(new Date()),
    sourceIp: randomIp(),
    destinationIp: randomIp(),
    protocol: randomProtocol(),
    status: isAttack ? "Attack" : "Normal",
  }
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return (n / 1000).toFixed(1) + "K"
  return n.toString()
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB/s"
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB/s"
  return bytes + " B/s"
}
