'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestLMStudioPage() {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [studentText, setStudentText] = useState(`안녕하세요. 저는 3학년 김민준입니다.
이번 방학에는 가족과 함께 제주도로 여행을 다녀왔습니다.
제주도에서 한라산도 보고, 맛있는 흑돼지도 먹었습니다.
바다에서 수영도 하고 모래성도 쌓았습니다.
정말 즐거운 방학이었습니다.`);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setError('');
    setResult(null);

    try {
      // 간단한 테스트 평가 요청
      const response = await fetch('/api/test-lm-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentText,
          studentName: '김민준',
          assignmentTitle: '방학 생활문',
          schoolName: '테스트초등학교',
          grade: '3학년',
          writingType: '생활문'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error || '평가 실패');
      }
    } catch (err) {
      setError('평가 중 오류 발생: ' + (err as Error).message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">LM Studio 로컬 테스트</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>학생 글 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full h-40 p-3 border rounded-lg"
            value={studentText}
            onChange={(e) => setStudentText(e.target.value)}
            placeholder="평가할 글을 입력하세요..."
          />
          
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !studentText}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                평가 중...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                LM Studio로 평가하기
              </>
            )}
          </button>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>평가 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">전체 점수</h3>
                <p className="text-2xl font-bold text-blue-600">{result.overallScore}점</p>
              </div>
              
              <div>
                <h3 className="font-semibold">전체 등급</h3>
                <p className="text-lg">{result.overallGrade}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">강점</h3>
                <ul className="list-disc list-inside">
                  {result.strengths?.map((str: string, i: number) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">개선점</h3>
                <ul className="list-disc list-inside">
                  {result.improvements?.map((imp: string, i: number) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">상세 피드백</h3>
                <p className="bg-gray-50 p-3 rounded">{result.detailedFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}