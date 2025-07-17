'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Download, RefreshCw, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { exportToExcel } from '@/utils/excel-export';

interface Student {
  id: string;
  name: string;
  documentId: string;
  documentName: string;
  evaluationStatus: 'pending' | 'in_progress' | 'completed';
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

const mockStudents: Student[] = [
  {
    id: '1',
    name: '김민준',
    documentId: 'doc1',
    documentName: '논설문_김민준.docx',
    evaluationStatus: 'completed',
    scores: {
      clarity: 85,
      evidence: 90,
      structure: 88,
      expression: 92,
      overall: 89
    },
    grade: '매우 우수'
  },
  {
    id: '2',
    name: '박서연',
    documentId: 'doc2',
    documentName: '논설문_박서연.docx',
    evaluationStatus: 'completed',
    scores: {
      clarity: 78,
      evidence: 82,
      structure: 80,
      expression: 85,
      overall: 81
    },
    grade: '우수'
  },
  {
    id: '3',
    name: '이준호',
    documentId: 'doc3',
    documentName: '논설문_이준호.docx',
    evaluationStatus: 'pending',
    scores: {
      clarity: 0,
      evidence: 0,
      structure: 0,
      expression: 0,
      overall: 0
    },
    grade: '-'
  }
];

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'overall' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/assignments/documents');
      if (response.ok) {
        const data = await response.json();
        if (data.students && data.students.length > 0) {
          setStudents(data.students);
        } else {
          // Use mock data if no imported documents
          setStudents(mockStudents);
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const evaluationDomains = [
    { key: 'clarity', name: '주장의 명확성' },
    { key: 'evidence', name: '근거의 타당성' },
    { key: 'structure', name: '논리적 구조' },
    { key: 'expression', name: '설득력 있는 표현' }
  ];

  const handleSort = (field: 'name' | 'overall' | 'status') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'overall':
        comparison = a.scores.overall - b.scores.overall;
        break;
      case 'status':
        const statusOrder = { completed: 3, in_progress: 2, pending: 1 };
        comparison = statusOrder[a.evaluationStatus] - statusOrder[b.evaluationStatus];
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)));
    }
  };

  const handleEvaluateSelected = async () => {
    const studentsToEvaluate = Array.from(selectedStudents).filter(
      id => students.find(s => s.id === id)?.evaluationStatus === 'pending'
    );

    if (studentsToEvaluate.length === 0) {
      alert('선택한 학생들은 이미 평가가 완료되었습니다.');
      return;
    }

    try {
      // Update UI to show in progress
      setStudents(prev => prev.map(s => 
        studentsToEvaluate.includes(s.id) 
          ? { ...s, evaluationStatus: 'in_progress' }
          : s
      ));

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentIds: studentsToEvaluate,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Evaluation result:', result);
        
        // Refresh the data
        await fetchDocuments();
        setSelectedStudents(new Set());
        
        alert(`평가 완료: ${result.evaluated}명 성공, ${result.failed}명 실패`);
      } else {
        alert('평가 중 오류가 발생했습니다.');
        // Revert status
        await fetchDocuments();
      }
    } catch (error) {
      console.error('Error evaluating:', error);
      alert('평가 중 오류가 발생했습니다.');
      await fetchDocuments();
    }
  };

  const handleExportToExcel = () => {
    try {
      exportToExcel(students, '논설문평가결과');
      alert('Excel 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel 내보내기 중 오류가 발생했습니다.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">평가완료</span>;
      case 'in_progress':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">평가중</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">대기중</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">평가 대시보드</h1>
        <p className="text-gray-600">학생들의 논설문 평가 결과를 관리하고 분석합니다</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={handleEvaluateSelected}
          disabled={selectedStudents.size === 0}
          className="btn-primary disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          선택한 문서 평가 ({selectedStudents.size}개)
        </button>
        <button
          onClick={handleExportToExcel}
          className="btn-primary bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Excel 내보내기
        </button>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle>학생 평가 현황</CardTitle>
          <CardDescription>
            총 {students.length}명 | 평가완료: {students.filter(s => s.evaluationStatus === 'completed').length}명 | 
            대기중: {students.filter(s => s.evaluationStatus === 'pending').length}명
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <input
                      type="checkbox"
                      checked={selectedStudents.size === students.length}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="text-left p-3">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      이름
                      {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="text-left p-3">문서명</th>
                  <th className="text-left p-3">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      상태
                      {sortBy === 'status' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </button>
                  </th>
                  {evaluationDomains.map(domain => (
                    <th key={domain.key} className="text-center p-3 text-sm">
                      {domain.name}
                    </th>
                  ))}
                  <th className="text-center p-3">
                    <button
                      onClick={() => handleSort('overall')}
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      종합점수
                      {sortBy === 'overall' && (sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
                    </button>
                  </th>
                  <th className="text-center p-3">등급</th>
                  <th className="text-center p-3">상세보기</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student) => (
                  <tr key={student.id} className="border-b hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedStudents.has(student.id)}
                        onChange={() => toggleStudentSelection(student.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3 font-medium">{student.name}</td>
                    <td className="p-3 text-sm text-gray-600 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {student.documentName}
                    </td>
                    <td className="p-3">
                      {getStatusBadge(student.evaluationStatus)}
                    </td>
                    {evaluationDomains.map(domain => (
                      <td key={domain.key} className="p-3 text-center">
                        {student.evaluationStatus === 'completed' ? (
                          <span className={`font-medium ${getScoreColor(student.scores[domain.key as keyof typeof student.scores])}`}>
                            {student.scores[domain.key as keyof typeof student.scores]}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    ))}
                    <td className="p-3 text-center">
                      {student.evaluationStatus === 'completed' ? (
                        <span className={`font-bold ${getScoreColor(student.scores.overall)}`}>
                          {student.scores.overall}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.grade === '매우 우수' ? 'bg-green-100 text-green-800' :
                        student.grade === '우수' ? 'bg-blue-100 text-blue-800' :
                        student.grade === '보통' ? 'bg-yellow-100 text-yellow-800' :
                        student.grade === '미흡' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.grade}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => window.location.href = `/report/${student.id}`}
                        className="text-blue-600 hover:text-blue-800"
                        disabled={student.evaluationStatus !== 'completed'}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>평가 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">평균 종합점수</span>
                <span className="font-bold">
                  {Math.round(
                    students
                      .filter(s => s.evaluationStatus === 'completed')
                      .reduce((sum, s) => sum + s.scores.overall, 0) / 
                    students.filter(s => s.evaluationStatus === 'completed').length || 0
                  )}점
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">최고점</span>
                <span className="font-bold text-green-600">
                  {Math.max(...students.filter(s => s.evaluationStatus === 'completed').map(s => s.scores.overall), 0)}점
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">최저점</span>
                <span className="font-bold text-red-600">
                  {Math.min(...students.filter(s => s.evaluationStatus === 'completed').map(s => s.scores.overall), 100)}점
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>등급 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['매우 우수', '우수', '보통', '미흡'].map(grade => {
                const count = students.filter(s => s.grade === grade).length;
                const percentage = (count / students.filter(s => s.evaluationStatus === 'completed').length) * 100 || 0;
                return (
                  <div key={grade} className="flex items-center gap-3">
                    <span className="text-sm w-20">{grade}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                      <div 
                        className={`h-full rounded-full ${
                          grade === '매우 우수' ? 'bg-green-500' :
                          grade === '우수' ? 'bg-blue-500' :
                          grade === '보통' ? 'bg-yellow-500' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm w-12 text-right">{count}명</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>평가 진행률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - students.filter(s => s.evaluationStatus === 'completed').length / students.length)}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {Math.round((students.filter(s => s.evaluationStatus === 'completed').length / students.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-sm text-gray-600">
              {students.filter(s => s.evaluationStatus === 'completed').length} / {students.length} 완료
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}