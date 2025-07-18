/**
 * 통계 분석 유틸리티 함수들
 */

// 평균 계산
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

// 중앙값 계산
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// 표준편차 계산
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0
  const mean = calculateMean(values)
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = calculateMean(squaredDiffs)
  return Math.sqrt(variance)
}

// 사분위수 계산
export function calculateQuartiles(values: number[]): {
  q1: number
  q2: number
  q3: number
  min: number
  max: number
} {
  if (values.length === 0) {
    return { q1: 0, q2: 0, q3: 0, min: 0, max: 0 }
  }
  
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  
  const q1Index = Math.floor(n * 0.25)
  const q2Index = Math.floor(n * 0.5)
  const q3Index = Math.floor(n * 0.75)
  
  return {
    min: sorted[0],
    q1: sorted[q1Index],
    q2: sorted[q2Index],
    q3: sorted[q3Index],
    max: sorted[n - 1]
  }
}

// 상관계수 계산 (피어슨 상관계수)
export function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0
  
  const n = x.length
  const meanX = calculateMean(x)
  const meanY = calculateMean(y)
  
  let numerator = 0
  let denominatorX = 0
  let denominatorY = 0
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX
    const diffY = y[i] - meanY
    numerator += diffX * diffY
    denominatorX += diffX * diffX
    denominatorY += diffY * diffY
  }
  
  const denominator = Math.sqrt(denominatorX * denominatorY)
  return denominator === 0 ? 0 : numerator / denominator
}

// 성장률 계산
export function calculateGrowthRate(initial: number, final: number): number {
  if (initial === 0) return 0
  return ((final - initial) / initial) * 100
}

// 백분위수 계산
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[Math.max(0, index)]
}

// 점수 분포 계산
export function calculateDistribution(
  values: number[], 
  bins: number = 10
): Array<{ range: string; count: number; percentage: number }> {
  if (values.length === 0) return []
  
  const min = Math.min(...values)
  const max = Math.max(...values)
  const binSize = (max - min) / bins
  
  const distribution = new Array(bins).fill(0).map((_, i) => {
    const start = min + i * binSize
    const end = start + binSize
    return {
      range: `${Math.round(start)}-${Math.round(end)}`,
      count: 0,
      percentage: 0
    }
  })
  
  values.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1)
    distribution[binIndex].count++
  })
  
  distribution.forEach(bin => {
    bin.percentage = (bin.count / values.length) * 100
  })
  
  return distribution
}

// Z-스코어 계산 (표준화)
export function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

// 이상치 탐지 (IQR 방법)
export function detectOutliers(values: number[]): {
  outliers: number[]
  lowerBound: number
  upperBound: number
} {
  const quartiles = calculateQuartiles(values)
  const iqr = quartiles.q3 - quartiles.q1
  const lowerBound = quartiles.q1 - 1.5 * iqr
  const upperBound = quartiles.q3 + 1.5 * iqr
  
  const outliers = values.filter(val => val < lowerBound || val > upperBound)
  
  return { outliers, lowerBound, upperBound }
}