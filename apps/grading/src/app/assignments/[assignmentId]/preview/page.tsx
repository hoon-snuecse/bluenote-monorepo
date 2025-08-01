'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { Button } from '@bluenote/ui';
import { ArrowLeft, Copy, School, Calendar, BookOpen, Users, Globe, Shield, Eye } from 'lucide-react';

export default function PreviewPage({ params }: { params: { assignmentId: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignment();
  }, [params.assignmentId]);

  const fetchAssignment = async () => {
    try {
      // 미리보기 전용 API 사용 (인증 불필요)
      const response = await fetch(`/api/assignments/${params.assignmentId}/preview`);
      const data = await response.json();
      
      if (data.success && data.assignment) {
        setAssignment(data.assignment);
      } else {
        setError(data.error || '과제를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('과제 조회 오류:', error);
      setError('과제를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.assignmentId}/copy`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 복사된 과제 페이지로 이동
        router.push(`/assignments/${data.assignment.id}`);
      } else {
        alert(data.error || '과제 복사에 실패했습니다.');
      }
    } catch (error) {
      console.error('과제 복사 오류:', error);
      alert('과제 복사 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">과제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">접근 제한</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/assignments')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              과제 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => router.push('/assignments')} 
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로 가기
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">공유 과제 미리보기</h1>
          </div>
          <Button onClick={handleCopy} className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            내 과제로 복사
          </Button>
        </div>

        {/* 과제 정보 카드 */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                    {assignment.gradeLevel}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    {assignment.writingType}
                  </span>
                  {assignment.isShared && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      전체 공유
                    </span>
                  )}
                </div>
                <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <School className="w-4 h-4" />
                <span>{assignment.schoolName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>공유일: {new Date(assignment.sharedAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>공유자: {assignment.userEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="w-4 h-4" />
                <span>조회 전용 (읽기만 가능)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 평가 기준 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">평가 기준</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">평가 영역</h3>
                <div className="flex flex-wrap gap-2">
                  {assignment.evaluationDomains.map((domain: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">평가 수준</h3>
                <div className="flex flex-wrap gap-2">
                  {assignment.evaluationLevels.map((level: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">수준 개수</h3>
                <p className="text-gray-600">{assignment.levelCount}단계</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 채점 기준 표시 */}
        {assignment.gradingCriteria && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">채점 기준</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {assignment.gradingCriteria}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 text-sm">
                  <Shield className="w-4 h-4" />
                  <p>이 채점 기준은 읽기 전용입니다. 복사 후 자유롭게 수정할 수 있습니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 하단 액션 버튼 */}
        <div className="mt-8 flex justify-center">
          <Button onClick={handleCopy} size="lg" className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            이 과제를 내 과제로 복사하기
          </Button>
        </div>
      </div>
    </div>
  );
}