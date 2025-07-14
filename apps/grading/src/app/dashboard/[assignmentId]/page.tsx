'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Download, ArrowUpDown, Filter, Eye, FileSpreadsheet, FileText, PieChart, Share2 } from 'lucide-react';

interface EvaluationData {
  id: string;
  submissionId: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  domainEvaluations: Record<string, {
    level: string;
    feedback: string;
    score: number;
  }>;
  overallLevel: string;
  overallFeedback: string;
  evaluatedAt: string;
}

interface AssignmentData {
  id: string;
  title: string;
  schoolName: string;
  gradeLevel: string;
  writingType: string;
  evaluationDomains: string[];
  evaluationLevels: string[];
  levelCount: string;
}

type SortKey = 'studentName' | 'overallLevel' | string;
type SortOrder = 'asc' | 'desc';

export default function DashboardPage({ params }: { params: { assignmentId: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('studentName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [params.assignmentId]);

  const fetchData = async () => {
    try {
      // 과제 정보 가져오기
      const assignmentResponse = await fetch(`/api/assignments/${params.assignmentId}`);
      const assignmentData = await assignmentResponse.json();
      
      if (assignmentData.success) {
        setAssignment(assignmentData.assignment);
      }

      // 평가 결과 가져오기
      const evaluationsResponse = await fetch(`/api/evaluations/by-assignment/${params.assignmentId}`);
      const evaluationsData = await evaluationsResponse.json();
      
      if (evaluationsData.success) {
        setEvaluations(evaluationsData.evaluations);
      }
    } catch (error) {
      console.error('데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    if (level.includes('매우 우수')) return 'bg-green-100 text-green-700';
    if (level.includes('우수')) return 'bg-blue-100 text-blue-700';
    if (level.includes('보통')) return 'bg-yellow-100 text-yellow-700';
    if (level.includes('미흡')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getLevelScore = (level: string, levels: string[]) => {
    const index = levels.indexOf(level);
    return index === -1 ? 0 : levels.length - index;
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedAndFilteredEvaluations = evaluations
    .filter(evaluation => filterLevel === 'all' || evaluation.overallLevel === filterLevel)
    .sort((a, b) => {
      let compareValue = 0;
      
      if (sortKey === 'studentName') {
        compareValue = a.studentName.localeCompare(b.studentName, 'ko');
      } else if (sortKey === 'overallLevel') {
        const aScore = getLevelScore(a.overallLevel, assignment?.evaluationLevels || []);
        const bScore = getLevelScore(b.overallLevel, assignment?.evaluationLevels || []);
        compareValue = bScore - aScore;
      } else if (sortKey.startsWith('domain-')) {
        const domain = sortKey.replace('domain-', '');
        const aScore = a.domainEvaluations[domain]?.score || 0;
        const bScore = b.domainEvaluations[domain]?.score || 0;
        compareValue = bScore - aScore;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

  const exportToExcel = async () => {
    try {
      const response = await fetch('/api/export/excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentId: params.assignmentId }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${assignment?.title}_평가결과_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert('Excel 파일 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Excel 내보내기 오류:', error);
      alert('Excel 파일 생성 중 오류가 발생했습니다.');
    }
  };

  const exportToCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${assignment?.title}_평가결과_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = () => {
    if (!assignment) return '';
    
    const headers = ['학번', '이름', ...assignment.evaluationDomains, '종합평가'];
    const rows = sortedAndFilteredEvaluations.map(evaluation => [
      evaluation.studentId,
      evaluation.studentName,
      ...assignment.evaluationDomains.map(domain => 
        evaluation.domainEvaluations[domain]?.level || '-'
      ),
      evaluation.overallLevel
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // UTF-8 BOM 추가 (한글 깨짐 방지)
    return '\uFEFF' + csvContent;
  };

  const generateShareLink = async (evaluationId: string, studentId: string) => {
    try {
      const response = await fetch('/api/access-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          evaluationId,
          studentId,
          expiresIn: 30 // 30일 유효
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 링크 복사
        navigator.clipboard.writeText(data.accessUrl).then(() => {
          alert(`공유 링크가 복사되었습니다!\n\n${data.accessUrl}\n\n유효기간: ${new Date(data.expiresAt).toLocaleDateString('ko-KR')}까지`);
        }).catch(() => {
          alert(`공유 링크:\n${data.accessUrl}\n\n유효기간: ${new Date(data.expiresAt).toLocaleDateString('ko-KR')}까지`);
        });
      } else {
        alert('공유 링크 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('공유 링크 생성 오류:', error);
      alert('공유 링크 생성 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">평가 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            과제 목록으로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">평가 결과 대시보드</h1>
            {assignment && (
              <div className="text-slate-600">
                <p className="text-lg font-medium">{assignment.title}</p>
                <p className="text-sm mt-1">
                  {assignment.schoolName} · {assignment.gradeLevel} · {assignment.writingType}
                </p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/analytics/${params.assignmentId}`)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <PieChart className="w-4 h-4" />
              통계 분석
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel 내보내기
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              CSV 내보내기
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {assignment?.evaluationLevels.map(level => {
            const count = evaluations.filter(e => e.overallLevel === level).length;
            const percentage = evaluations.length > 0 ? (count / evaluations.length * 100).toFixed(1) : '0';
            
            return (
              <Card key={level} className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
                <CardContent className="py-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-2">{level}</p>
                    <p className="text-2xl font-bold text-slate-900">{count}명</p>
                    <p className="text-xs text-slate-500 mt-1">{percentage}%</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">필터:</span>
          </div>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white"
          >
            <option value="all">전체</option>
            {assignment?.evaluationLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            총 {sortedAndFilteredEvaluations.length}명
          </span>
        </div>

        {/* Results Table */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">
                      <button
                        onClick={() => handleSort('studentName')}
                        className="flex items-center gap-1 hover:text-slate-900"
                      >
                        학생
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    {assignment?.evaluationDomains.map(domain => (
                      <th key={domain} className="text-center py-3 px-4 font-medium text-slate-700">
                        <button
                          onClick={() => handleSort(`domain-${domain}`)}
                          className="flex items-center gap-1 hover:text-slate-900 mx-auto"
                        >
                          {domain}
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-medium text-slate-700">
                      <button
                        onClick={() => handleSort('overallLevel')}
                        className="flex items-center gap-1 hover:text-slate-900 mx-auto"
                      >
                        종합평가
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-slate-700">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredEvaluations.map((evaluation) => (
                    <tr key={evaluation.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-800">{evaluation.studentName}</p>
                          <p className="text-xs text-slate-500">{evaluation.studentId}</p>
                        </div>
                      </td>
                      {assignment?.evaluationDomains.map(domain => {
                        const domainEval = evaluation.domainEvaluations[domain];
                        return (
                          <td key={domain} className="text-center py-3 px-4">
                            {domainEval && (
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getLevelColor(domainEval.level)}`}>
                                {domainEval.level}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="text-center py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${getLevelColor(evaluation.overallLevel)}`}>
                          {evaluation.overallLevel}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => router.push(`/student-report/${evaluation.id}`)}
                            className="text-blue-600 hover:text-blue-700"
                            title="개별 리포트 보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateShareLink(evaluation.id, evaluation.studentId)}
                            className="text-green-600 hover:text-green-700"
                            title="공유 링크 생성"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {sortedAndFilteredEvaluations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600">평가 결과가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}