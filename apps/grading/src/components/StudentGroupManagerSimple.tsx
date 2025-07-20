'use client'

import { Button } from '@bluenote/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@bluenote/ui'
import { Plus } from 'lucide-react'

export function StudentGroupManagerSimple() {
  console.log('[StudentGroupManagerSimple] Render')
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 그룹 목록 */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <CardTitle className="text-lg">학생 그룹 (Simple)</CardTitle>
            <Button 
              size="sm"
              onClick={() => alert('새 그룹 클릭!')}
              style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '6px' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              새 그룹
            </Button>
          </CardHeader>
          <CardContent>
            <p>여기에 그룹 목록이 표시됩니다.</p>
          </CardContent>
        </Card>
      </div>
      
      {/* 학생 목록 */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>학생 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <p>그룹을 선택하면 학생 목록이 표시됩니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}