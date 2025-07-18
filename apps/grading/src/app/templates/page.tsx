'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui'
import { Button } from '@bluenote/ui'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TemplateManager } from '@/components/TemplateManager'

export default function TemplatesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
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
            <CardTitle className="text-2xl">평가 기준 템플릿 관리</CardTitle>
            <CardDescription className="text-base">
              자주 사용하는 평가 기준을 템플릿으로 저장하고 관리하세요. 
              새 과제를 만들 때 템플릿을 불러와서 빠르게 설정할 수 있습니다.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Template Manager */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="pt-6">
            <TemplateManager mode="manage" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}