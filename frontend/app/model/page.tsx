'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar
} from 'recharts'
import { Brain, Cpu, Zap, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import { getAvailableModels } from '@/lib/api'

const modelMetrics = {
  xgboost: { accuracy: 98.5, f1: 97.2, precision: 96.8, recall: 97.6, trainingTime: '45s' },
  lightgbm: { accuracy: 97.8, f1: 96.5, precision: 95.9, recall: 97.1, trainingTime: '32s' },
  random_forest: { accuracy: 96.2, f1: 94.8, precision: 94.1, recall: 95.5, trainingTime: '68s' },
  logistic_regression: { accuracy: 94.5, f1: 92.1, precision: 91.5, recall: 92.8, trainingTime: '12s' },
}

const radarData = [
  { metric: 'Accuracy', xgboost: 98.5, lightgbm: 97.8, random_forest: 96.2, logistic_regression: 94.5 },
  { metric: 'F1 Score', xgboost: 97.2, lightgbm: 96.5, random_forest: 94.8, logistic_regression: 92.1 },
  { metric: 'Precision', xgboost: 96.8, lightgbm: 95.9, random_forest: 94.1, logistic_regression: 91.5 },
  { metric: 'Recall', xgboost: 97.6, lightgbm: 97.1, random_forest: 95.5, logistic_regression: 92.8 },
  { metric: 'Speed', xgboost: 85, lightgbm: 95, random_forest: 60, logistic_regression: 98 },
  { metric: 'Scalability', xgboost: 90, lightgbm: 95, random_forest: 70, logistic_regression: 85 },
]

export default function ModelInsights() {
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await getAvailableModels()

        setAvailableModels(res.data ?? ['xgboost', 'lightgbm'])

        if (res.error) {
          setError(res.error)
        } else {
          setError(null)
        }

      } catch (e) {
        console.error('Models fetch failed:', e)
        setError("Failed to load models")
        setAvailableModels(['xgboost', 'lightgbm'])
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Model Insights</h1>
            <p className="text-muted-foreground mt-2">
              Machine learning model performance and configuration
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground">
            <RefreshCw className="h-4 w-4" />
            Retrain Models
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        {/* Model Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(modelMetrics).map(([model, metrics]) => (
            <Card key={model} className={`bg-card ${
              availableModels.includes(model) ? 'ring-2 ring-green-500/50' : ''
            }`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {model.replace('_', ' ').toUpperCase()}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p>Accuracy: {metrics.accuracy}%</p>
                <p>F1: {metrics.f1}%</p>
                <p>Time: {metrics.trainingTime}</p>

                <p className={`mt-2 flex items-center gap-1 ${
                  availableModels.includes(model) ? 'text-green-400' : 'text-red-400'
                }`}>
                  {availableModels.includes(model)
                    ? <><CheckCircle className="h-4 w-4" /> Active</>
                    : <><XCircle className="h-4 w-4" /> Unavailable</>
                  }
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts (unchanged) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Model Accuracy</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'XGBoost', accuracy: 98.5 },
                  { name: 'LightGBM', accuracy: 97.8 },
                  { name: 'RF', accuracy: 96.2 },
                  { name: 'LR', accuracy: 94.5 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="accuracy" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <Radar dataKey="xgboost" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}