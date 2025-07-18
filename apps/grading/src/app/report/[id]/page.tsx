'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bluenote/ui';
import { GrowthStageIndicator } from '@/components/GrowthStageIndicator';
import { ArrowLeft, Download, Edit2, Save, X, History } from 'lucide-react';
import Link from 'next/link';

interface StudentData {
  id: string;
  name: string;
  documentName: string;
  evaluationStatus: string;
  scores: {
    clarity: number;
    evidence: number;
    structure: number;
    expression: number;
    overall: number;
  };
  grade: string;
  feedback?: {
    clarity: string;
    evidence: string;
    structure: string;
    expression: string;
    overall: string;
  };
}

function StudentReportContent() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedScores, setEditedScores] = useState<StudentData['scores'] | null>(null);
  const [editedFeedback, setEditedFeedback] = useState<StudentData['feedback'] | null>(null);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/assignments/documents');
      if (response.ok) {
        const data = await response.json();
        const studentData = data.students.find((s: StudentData) => s.id === studentId);
        if (studentData) {
          setStudent(studentData);
          setEditedScores(studentData.scores);
          setEditedFeedback(studentData.feedback);
        }
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    // TODO: Implement save functionality
    console.log('Saving edits:', { editedScores, editedFeedback });
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setEditedScores(student?.scores || null);
    setEditedFeedback(student?.feedback || null);
    setEditMode(false);
  };

  const getStageForScore = (score: number): 'seed' | 'sprout' | 'growth' | 'bloom' => {
    if (score >= 90) return 'bloom';
    if (score >= 80) return 'growth';
    if (score >= 70) return 'sprout';
    return 'seed';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const domains = [
    { key: 'clarity', name: '주장의 명확성', description: '글의 주제와 주장이 명확하게 드러나는가?' },
    { key: 'evidence', name: '근거의 타당성', description: '주장을 뒷받침하는 근거가 타당하고 충분한가?' },
    { key: 'structure', name: '논리적 구조', description: '글의 구성이 논리적이고 체계적인가?' },
    { key: 'expression', name: '설득력 있는 표현', description: '어휘 선택과 문장 표현이 설득력 있는가?' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!student || student.evaluationStatus !== 'completed') {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">평가가 완료되지 않았습니다.</p>
            <div className="mt-4 text-center">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="text-blue-600 hover:text-blue-800"
              >
                대시보드로 돌아가기
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          대시보드로 돌아가기
        </button>
        <div className="flex gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit2 className="w-4 h-4" />
              평가 수정
            </button>
          ) : (
            <>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                저장
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                취소
              </button>
            </>
          )}
          <Link
            href={`/students/${studentId}`}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <History className="w-4 h-4" />
            평가 히스토리
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            PDF 저장
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">논설문 평가 보고서</h1>
          <div className="text-lg text-gray-600">
            <span className="font-semibold">{student.name}</span> 학생
          </div>
          <div className="text-sm text-gray-500 mt-1">{student.documentName}</div>
        </div>

        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">종합 점수</div>
              <div className={`text-3xl font-bold ${getScoreColor(student.scores.overall)}`}>
                {student.scores.overall}점
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">등급</div>
              <div className={`text-2xl font-bold ${
                student.grade === '매우 우수' ? 'text-green-600' :
                student.grade === '우수' ? 'text-blue-600' :
                student.grade === '보통' ? 'text-yellow-600' :
                'text-orange-600'
              }`}>
                {student.grade}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">평가일</div>
              <div className="text-lg">{new Date().toLocaleDateString('ko-KR')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">평가자</div>
              <div className="text-lg">AI 자동평가</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {domains.map((domain) => {
            const score = editMode && editedScores 
              ? editedScores[domain.key as keyof typeof editedScores]
              : student.scores[domain.key as keyof typeof student.scores];
            const feedback = editMode && editedFeedback
              ? editedFeedback[domain.key as keyof typeof editedFeedback]
              : student.feedback?.[domain.key as keyof typeof student.feedback];

            return (
              <Card key={domain.key} className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{domain.name}</span>
                    {editMode ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={score}
                        onChange={(e) => setEditedScores(prev => ({
                          ...prev!,
                          [domain.key]: parseInt(e.target.value) || 0
                        }))}
                        className={`w-20 px-2 py-1 border rounded text-2xl font-bold text-center ${getScoreColor(score)}`}
                      />
                    ) : (
                      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score}점
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>{domain.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <GrowthStageIndicator
                      stage={getStageForScore(score)}
                      size="sm"
                    />
                  </div>
                  {editMode ? (
                    <textarea
                      value={feedback || ''}
                      onChange={(e) => setEditedFeedback(prev => ({
                        ...prev!,
                        [domain.key]: e.target.value
                      }))}
                      className="w-full p-2 border rounded-lg resize-none"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {feedback || '평가 피드백이 없습니다.'}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>종합 평가</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <textarea
                value={editedFeedback?.overall || ''}
                onChange={(e) => setEditedFeedback(prev => ({
                  ...prev!,
                  overall: e.target.value
                }))}
                className="w-full p-2 border rounded-lg resize-none"
                rows={6}
              />
            ) : (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {student.feedback?.overall || '종합 평가가 없습니다.'}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500 print:hidden">
          <p>이 보고서는 AI 기반 자동 평가 시스템에 의해 생성되었습니다.</p>
          <p>교사의 검토와 수정을 거쳐 최종 평가가 확정됩니다.</p>
        </div>
      </div>
    </div>
  );
}

export default function StudentReportPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    }>
      <StudentReportContent />
    </Suspense>
  );
}