import dynamic from 'next/dynamic';

// Lazy load heavy components
export const LazyChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  }
);

export const LazyPDFExport = dynamic(
  () => import('@/components/PDFExport').then(mod => mod.PDFExport),
  { 
    ssr: false,
    loading: () => <span>PDF 준비 중...</span>
  }
);

export const LazyExcelExport = dynamic(
  () => import('@/lib/export-utils').then(mod => ({ default: mod.exportToExcel })),
  { 
    ssr: false,
    loading: () => <span>Excel 준비 중...</span>
  }
);

export const LazyAnalyticsDashboard = dynamic(
  () => import('@/app/grading/analytics/[assignmentId]/page'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">통계 분석을 불러오는 중...</p>
        </div>
      </div>
    )
  }
);