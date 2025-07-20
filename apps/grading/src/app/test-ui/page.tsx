'use client'

import { Button } from '@bluenote/ui'
import { Card, CardHeader, CardTitle, CardContent } from '@bluenote/ui'

export default function TestUIPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">UI 컴포넌트 테스트</h1>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>테스트 카드</CardTitle>
        </CardHeader>
        <CardContent>
          <p>이 텍스트가 보이나요?</p>
          <Button onClick={() => alert('버튼 클릭!')}>
            기본 버튼
          </Button>
          <Button 
            style={{ backgroundColor: 'blue', color: 'white', padding: '10px', marginLeft: '10px' }}
            onClick={() => alert('스타일 버튼 클릭!')}
          >
            스타일 버튼
          </Button>
        </CardContent>
      </Card>
      
      <div style={{ border: '1px solid red', padding: '20px' }}>
        <p>빨간 테두리 안의 텍스트</p>
        <button 
          style={{ backgroundColor: 'green', color: 'white', padding: '10px' }}
          onClick={() => alert('일반 버튼 클릭!')}
        >
          일반 HTML 버튼
        </button>
      </div>
    </div>
  )
}