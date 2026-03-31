'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts'
import { Shield, AlertTriangle, Skull, Bug, Eye } from 'lucide-react'
import { fetchStats, type SystemStats } from '@/lib/api'

const threatData = [
  { threat: 'DDoS', score: 85 },
  { threat: 'Malware', score: 72 },
  { threat: 'Phishing', score: 65 },
  { threat: 'Ransomware', score: 78 },
  { threat: 'Insider Threat', score: 45 },
  { threat: 'APT', score: 82 },
  { threat: 'Botnet', score: 58 },
  { threat: 'Zero-day', score: 70 },
]

export default function ThreatIntelligence() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isFetching = useRef(false)

  const fetchStatsData = async () => {
    if (isFetching.current) return
    isFetching.current = true

    try {
      const res = await fetchStats()

      setStats(
        res.data ?? {
          total_flows: 0,
          normal: 0,
          attacks: 0,
          recent_attack_ratio: 0,
          status: 'SAFE'
        }
      )

      if (res.error) {
        setError(res.error)
      } else {
        setError(null)
      }

    } catch (e) {
      console.error('Threats stats failed:', e)
      setError("Failed to fetch threat data")
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }

  useEffect(() => {
    fetchStatsData()

    const interval = setInterval(() => {
      fetchStatsData()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
          <h1 className="text-3xl font-bold text-foreground">Threat Intelligence</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive threat analysis
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent>
              <p>Threat Level</p>
              <h2>{stats?.status === 'THREAT' ? 'HIGH' : 'NORMAL'}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p>Active Threats</p>
              <h2>{stats?.attacks || 0}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p>Total Flows</p>
              <h2>{stats?.total_flows || 0}</h2>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p>Mitigated</p>
              <h2>{((stats?.attacks || 0) * 2.5).toFixed(0)}</h2>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Threat Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={threatData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="threat" />
                <PolarRadiusAxis />
                <Radar dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}