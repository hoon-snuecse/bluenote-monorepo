'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StudentGroupManager } from '@/components/StudentGroupManager'
import { StudentGroupManagerSimple } from '@/components/StudentGroupManagerSimple'

export default function StudentsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard-beta')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            대시보드로 돌아가기
          </button>
        </div>

        {/* Page Header */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <CardTitle className="text-2xl">학생 그룹 관리</CardTitle>
            <CardDescription className="text-base">
              학년, 반별로 학생들을 그룹화하여 효율적으로 관리하세요. 
              CSV 파일로 학생 명단을 가져오거나 내보낼 수 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Student Group Manager - Simple Version for Testing */}
        <StudentGroupManagerSimple />
        
        {/* Original Student Group Manager - Hidden for now */}
        {/* <StudentGroupManager /> */}
      </div>
    </div>
  )
}