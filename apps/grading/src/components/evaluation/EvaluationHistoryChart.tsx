'use client'

import { useMemo } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface EvaluationHistoryChartProps {
  domainGrowth: Record<string, number[]>
  improvementRate?: number
}

const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

export function EvaluationHistoryChart({ domainGrowth, improvementRate }: EvaluationHistoryChartProps) {
  const chartData = useMemo(() => {
    const domains = Object.keys(domainGrowth)
    const maxLength = Math.max(...Object.values(domainGrowth).map(arr => arr.length))
    
    return Array.from({ length: maxLength }, (_, index) => {
      const dataPoint: any = { name: `평가 ${index + 1}` }
      domains.forEach(domain => {
        dataPoint[domain] = domainGrowth[domain][index] || 0
      })
      return dataPoint
    })
  }, [domainGrowth])

  return (
    <>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} />
            <Tooltip 
              formatter={(value: number) => {
                const levels = ['', '미흡', '보통', '우수', '매우 우수']
                return levels[Math.round(value)]
              }}
            />
            <Legend />
            {Object.keys(domainGrowth).map((domain, index) => (
              <Line
                key={domain}
                type="monotone"
                dataKey={domain}
                stroke={chartColors[index % chartColors.length]}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {improvementRate !== undefined && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            전체 개선율: 
            <span className={`ml-2 font-semibold ${improvementRate > 0 ? 'text-green-600' : 'text-gray-600'}`}>
              {improvementRate > 0 ? '+' : ''}{(improvementRate * 25).toFixed(0)}%
            </span>
          </p>
        </div>
      )}
    </>
  )
}