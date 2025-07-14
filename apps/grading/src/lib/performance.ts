// Performance monitoring utility
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  private static measures: Map<string, number[]> = new Map();

  static mark(name: string) {
    if (typeof window !== 'undefined' && window.performance) {
      this.marks.set(name, performance.now());
    }
  }

  static measure(name: string, startMark: string) {
    if (typeof window !== 'undefined' && window.performance) {
      const startTime = this.marks.get(startMark);
      if (startTime) {
        const duration = performance.now() - startTime;
        
        if (!this.measures.has(name)) {
          this.measures.set(name, []);
        }
        this.measures.get(name)!.push(duration);
        
        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    }
    return 0;
  }

  static getAverageTime(name: string): number {
    const times = this.measures.get(name);
    if (!times || times.length === 0) return 0;
    
    const sum = times.reduce((a, b) => a + b, 0);
    return sum / times.length;
  }

  static logMetrics() {
    if (process.env.NODE_ENV === 'development') {
      console.group('Performance Metrics');
      this.measures.forEach((times, name) => {
        console.log(`${name}: Average ${this.getAverageTime(name).toFixed(2)}ms`);
      });
      console.groupEnd();
    }
  }

  static clear() {
    this.marks.clear();
    this.measures.clear();
  }
}

// React component performance tracking hook
import React from 'react';

export function usePerformanceTracking(componentName: string) {
  React.useEffect(() => {
    PerformanceMonitor.mark(`${componentName}-mount`);
    
    return () => {
      PerformanceMonitor.measure(`${componentName}-lifecycle`, `${componentName}-mount`);
    };
  }, [componentName]);
}

// API call performance tracking
export async function trackAPICall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  PerformanceMonitor.mark(`api-${name}-start`);
  
  try {
    const result = await apiCall();
    PerformanceMonitor.measure(`api-${name}`, `api-${name}-start`);
    return result;
  } catch (error) {
    PerformanceMonitor.measure(`api-${name}-error`, `api-${name}-start`);
    throw error;
  }
}