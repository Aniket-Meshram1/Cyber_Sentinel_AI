'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Search } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { fetchAlerts, type ApiAlert } from '@/lib/api'

const generateAlertData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    critical: Math.floor(Math.random() * 5),
    high: Math.floor(Math.random() * 10),
    medium: Math.floor(Math.random() * 15),
  }))
}

const getSeverityColor = (label: string) => {
  return label === 'DDoS Attack'
    ? 'bg-red-500/20 text-red-300'
    : 'bg-green-500/20 text-green-300'
}

export default function Alerts() {
  const [alertData, setAlertData] = useState(generateAlertData())
  const [alerts, setAlerts] = useState<ApiAlert[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isFetching = useRef(false)

  // ✅ Fixed fetch function
  const fetchAlertsData = async () => {
    if (isFetching.current) return
    isFetching.current = true

    try {
      const res = await fetchAlerts()

      setAlerts(res.data ?? [])

      if (res.error) {
        setError(res.error)
      } else {
        setError(null)
      }

    } catch (e) {
      setError("Unexpected error occurred")
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }

  // ✅ Polling (fixed)
  useEffect(() => {
    fetchAlertsData()

    const interval = setInterval(() => {
      fetchAlertsData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Simulated chart updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAlertData(generateAlertData())
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    return (
      (alert.source_ip?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (alert.destination_ip?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      alert.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const stats = {
    critical: alerts.filter(a => a.prediction === 1).length,
    high: alerts.filter(a => a.prediction === 1).length,
    medium: alerts.filter(a => a.prediction === 0).length,
    low: alerts.filter(a => a.prediction === 0).length,
  }

  // ✅ Initial loader
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Security Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage active security alerts
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-red-500/30 bg-red-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">DDoS Attacks</p>
              <p className="text-3xl font-bold text-red-400 mt-2">{stats.critical}</p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/30 bg-orange-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-3xl font-bold text-orange-400 mt-2">{stats.high}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/30 bg-yellow-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Medium Risk</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.medium}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Normal Traffic</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{stats.low}</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Alert Trends (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={alertData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Alert Log</CardTitle>
          </CardHeader>
          <CardContent>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by IP or alert type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Source IP</TableHead>
                    <TableHead>Destination IP</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredAlerts.slice(0, 50).map((alert, index) => (
                    <TableRow key={`${alert.timestamp}-${index}`}>
                      <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{alert.source_ip || 'N/A'}</TableCell>
                      <TableCell>{alert.destination_ip || 'N/A'}</TableCell>
                      <TableCell>{alert.protocol || 'N/A'}</TableCell>
                      <TableCell>{alert.model_used}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded ${getSeverityColor(alert.label)}`}>
                          {alert.label}
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