'use client'

import { useMemo } from 'react'
import { calculateCorrelation } from '@/utils/statistics'

interface CorrelationMatrixProps {
  evaluations: any[]
}

export function CorrelationMatrix({ evaluations }: CorrelationMatrixProps) {
  const correlationMatrix = useMemo(() => {
    const domains = ['clarity', 'validity', 'structure', 'expression']
    const domainLabels: Record<string, string> = {
      clarity: '명료성',
      validity: '타당성', 
      structure: '구조',
      expression: '표현'
    }
    
    // 각 도메인별 점수 수집
    const domainScores: Record<string, number[]> = {}
    domains.forEach(domain => {
      domainScores[domain] = evaluations
        .map(e => e.scores?.[domain])
        .filter(score => score !== undefined && score !== null)
    })
    
    // 상관계수 매트릭스 계산
    const matrix: any[][] = []
    domains.forEach((domain1, i) => {
      matrix[i] = []
      domains.forEach((domain2, j) => {
        if (domainScores[domain1].length > 0 && domainScores[domain2].length > 0) {
          const correlation = calculateCorrelation(
            domainScores[domain1],
            domainScores[domain2]
          )
          matrix[i][j] = {
            value: correlation,
            domain1: domainLabels[domain1],
            domain2: domainLabels[domain2]
          }
        } else {
          matrix[i][j] = {
            value: 0,
            domain1: domainLabels[domain1],
            domain2: domainLabels[domain2]
          }
        }
      })
    })
    
    return { matrix, domains: domains.map(d => domainLabels[d]) }
  }, [evaluations])
  
  // 상관계수에 따른 색상 결정
  function getCorrelationColor(value: number): string {
    if (value >= 0.7) return 'bg-green-600 text-white'
    if (value >= 0.4) return 'bg-green-400 text-white'
    if (value >= 0.2) return 'bg-green-200'
    if (value >= -0.2) return 'bg-gray-100'
    if (value >= -0.4) return 'bg-red-200'
    if (value >= -0.7) return 'bg-red-400 text-white'
    return 'bg-red-600 text-white'
  }
  
  // 상관계수 해석
  function getCorrelationInterpretation(value: number): string {
    const absValue = Math.abs(value)
    if (absValue >= 0.7) return '강한 상관관계'
    if (absValue >= 0.4) return '중간 상관관계'
    if (absValue >= 0.2) return '약한 상관관계'
    return '상관관계 없음'
  }
  
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left font-medium"></th>
              {correlationMatrix.domains.map((domain, index) => (
                <th key={index} className="p-2 text-center font-medium">
                  {domain}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {correlationMatrix.matrix.map((row, i) => (
              <tr key={i}>
                <td className="p-2 font-medium">{correlationMatrix.domains[i]}</td>
                {row.map((cell, j) => (
                  <td key={j} className="p-2 text-center">
                    <div
                      className={`rounded px-2 py-1 text-sm font-medium ${
                        i === j ? 'bg-gray-200' : getCorrelationColor(cell.value)
                      }`}
                      title={`${cell.domain1} - ${cell.domain2}: ${getCorrelationInterpretation(cell.value)}`}
                    >
                      {cell.value.toFixed(2)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">상관계수:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>강한 양의 상관 (0.7~1.0)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span>중간 양의 상관 (0.4~0.7)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span>약한 양의 상관 (0.2~0.4)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span>상관없음 (-0.2~0.2)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-200 rounded"></div>
          <span>약한 음의 상관 (-0.4~-0.2)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-400 rounded"></div>
          <span>중간 음의 상관 (-0.7~-0.4)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span>강한 음의 상관 (-1.0~-0.7)</span>
        </div>
      </div>
    </div>
  )
}