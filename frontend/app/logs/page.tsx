'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { fetchAlerts, type ApiAlert } from '@/lib/api'

const generateLogs = () => {
  const protocols = ['TCP', 'UDP', 'ICMP', 'DNS', 'HTTP', 'HTTPS']
  const actions = ['Allow', 'Deny', 'Alert', 'Block']
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
    sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    destIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    packetSize: Math.floor(Math.random() * 1500) + 64,
    action: actions[Math.floor(Math.random() * actions.length)],
  }))
}

const getActionColor = (action: string) => {
  switch (action) {
    case 'Allow':
      return 'bg-green-500/20 text-green-300'
    case 'Deny':
      return 'bg-red-500/20 text-red-300'
    case 'Alert':
      return 'bg-yellow-500/20 text-yellow-300'
    case 'Block':
      return 'bg-orange-500/20 text-orange-300'
    default:
      return 'bg-blue-500/20 text-blue-300'
  }
}

const getProtocolColor = (protocol: string) => {
  const colors: { [key: string]: string } = {
    TCP: 'bg-blue-500/20 text-blue-300',
    UDP: 'bg-amber-500/20 text-amber-300',
    ICMP: 'bg-red-500/20 text-red-300',
    DNS: 'bg-purple-500/20 text-purple-300',
    HTTP: 'bg-cyan-500/20 text-cyan-300',
    HTTPS: 'bg-green-500/20 text-green-300',
  }
  return colors[protocol] || 'bg-gray-500/20 text-gray-300'
}

export default function LogsExplorer() {
  const [logs, setLogs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [protocolFilter, setProtocolFilter] = useState('All')
  const [sourceIpFilter, setSourceIpFilter] = useState('')
  const [destIpFilter, setDestIpFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch alerts from backend and combine with simulated logs
  const loadLogs = async () => {
    setLoading(true)
    try {
      const { data: alerts, error } = await fetchAlerts()
      if (error) setError(error)
      else setError(null)

      const alertLogs = (alerts || []).map((alert: ApiAlert, index: number) => ({
        id: 1000 + index,
        timestamp: new Date(alert.timestamp).toLocaleString(),
        sourceIp: alert.source_ip || 'N/A',
        destIp: alert.destination_ip || 'N/A',
        protocol: alert.protocol || 'N/A',
        packetSize: 0,
        action: alert.label === 'DDoS Attack' ? 'Alert' : 'Allow',
      }))

      setLogs([...alertLogs, ...generateLogs()])
    } catch (e) {
      setError('Failed to fetch alerts')
      setLogs(generateLogs())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
    // Optional: Poll every 10s for live updates
    // const interval = setInterval(loadLogs, 10000)
    // return () => clearInterval(interval)
  }, [])

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.timestamp.includes(searchTerm) || 
      log.sourceIp.includes(searchTerm) ||
      log.destIp.includes(searchTerm)
    const matchesProtocol = protocolFilter === 'All' || log.protocol === protocolFilter
    const matchesSourceIp = !sourceIpFilter || log.sourceIp.includes(sourceIpFilter)
    const matchesDestIp = !destIpFilter || log.destIp.includes(destIpFilter)
    const matchesAction = actionFilter === 'All' || log.action === actionFilter
    return matchesSearch && matchesProtocol && matchesSourceIp && matchesDestIp && matchesAction
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Log Explorer</h1>
          <p className="text-muted-foreground mt-2">Network traffic logs and SIEM monitoring</p>
        </div>

        {error && (
          <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Log Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold text-foreground mt-2">{logs.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Allowed</p>
              <p className="text-2xl font-bold text-green-400 mt-2">{logs.filter(l => l.action === 'Allow').length}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Blocked</p>
              <p className="text-2xl font-bold text-red-400 mt-2">{logs.filter(l => l.action === 'Block' || l.action === 'Deny').length}</p>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Alerts</p>
              <p className="text-2xl font-bold text-yellow-400 mt-2">{logs.filter(l => l.action === 'Alert').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="relative col-span-1 md:col-span-2 lg:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by timestamp or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground"
                />
              </div>
              
              <select
                value={protocolFilter}
                onChange={(e) => setProtocolFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
              >
                <option value="All">All Protocols</option>
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
                <option value="DNS">DNS</option>
                <option value="HTTP">HTTP</option>
                <option value="HTTPS">HTTPS</option>
              </select>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-border bg-card text-foreground text-sm"
              >
                <option value="All">All Actions</option>
                <option value="Allow">Allow</option>
                <option value="Deny">Deny</option>
                <option value="Alert">Alert</option>
                <option value="Block">Block</option>
              </select>

              <Input
                placeholder="Source IP..."
                value={sourceIpFilter}
                onChange={(e) => setSourceIpFilter(e.target.value)}
                className="bg-input border-border text-foreground text-sm"
              />

              <Input
                placeholder="Dest IP..."
                value={destIpFilter}
                onChange={(e) => setDestIpFilter(e.target.value)}
                className="bg-input border-border text-foreground text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Network Traffic Logs ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="text-foreground font-semibold">Timestamp</TableHead>
                    <TableHead className="text-foreground font-semibold">Source IP</TableHead>
                    <TableHead className="text-foreground font-semibold">Destination IP</TableHead>
                    <TableHead className="text-foreground font-semibold">Protocol</TableHead>
                    <TableHead className="text-foreground font-semibold text-right">Packet Size (bytes)</TableHead>
                    <TableHead className="text-foreground font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-b border-border/50 hover:bg-muted/50">
                      <TableCell className="text-muted-foreground text-sm font-mono">{log.timestamp}</TableCell>
                      <TableCell className="text-foreground font-mono text-sm">{log.sourceIp}</TableCell>
                      <TableCell className="text-foreground font-mono text-sm">{log.destIp}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProtocolColor(log.protocol)}`}>
                          {log.protocol}
                        </span>
                      </TableCell>
                      <TableCell className="text-foreground text-right font-mono text-sm">{log.packetSize}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}