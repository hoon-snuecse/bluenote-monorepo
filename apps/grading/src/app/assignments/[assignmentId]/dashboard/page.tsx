'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Download, Filter, BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

interface DomainScore {
  domain: string;
  average: number;
  distribution: { level: string; count: number }[];
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  scores: { [key: string]: string };
  overallLevel: string;
  submittedAt: Date;
  evaluatedAt?: Date;
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [domainScores, setDomainScores] = useState<DomainScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'overallLevel'>('name');
  const [filterDomain, setFilterDomain] = useState<string>('all');

  useEffect(() => {
    fetchDashboardData();
  }, [params.assignmentId]);

  const fetchDashboardData = async () => {
    try {
      // Fetch assignment
      const assignmentRes = await fetch(`/api/assignments/${params.assignmentId}`);
      const assignmentData = await assignmentRes.json();
      console.log('Assignment data:', assignmentData);
      if (assignmentData.success) {
        setAssignment(assignmentData.assignment);
      }

      // Fetch submissions with evaluations
      const submissionsRes = await fetch(`/api/assignments/${params.assignmentId}/evaluations`);
      const submissionsData = await submissionsRes.json();
      console.log('Evaluations data:', submissionsData);
      if (submissionsData.success) {
        const evaluatedStudents = submissionsData.evaluations.map((evaluation: any) => ({
          id: evaluation.id,
          name: evaluation.studentName,
          studentId: evaluation.studentId,
          scores: evaluation.domainScores || {},
          overallLevel: evaluation.overallLevel || '평가 대기',
          submittedAt: new Date(evaluation.submittedAt),
          evaluatedAt: evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt) : undefined
        }));
        setStudents(evaluatedStudents);

        // Calculate domain scores
        if (assignmentData.assignment.evaluationDomains) {
          const domains = assignmentData.assignment.evaluationDomains;
          const calculatedScores = domains.map((domain: string) => {
            const scores = evaluatedStudents
              .map((s: Student) => s.scores[domain])
              .filter(Boolean);
            
            const levelCounts = assignmentData.assignment.evaluationLevels.reduce((acc: any, level: string) => {
              acc[level] = scores.filter((s: string) => s === level).length;
              return acc;
            }, {});

            return {
              domain,
              average: scores.length,
              distribution: Object.entries(levelCounts).map(([level, count]) => ({
                level,
                count: count as number
              }))
            };
          });
          setDomainScores(calculatedScores);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    // TODO: Implement Excel export
    console.log('Export to Excel');
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.overallLevel.localeCompare(b.overallLevel);
    }
  });

  const filteredStudents = filterDomain === 'all' 
    ? sortedStudents 
    : sortedStudents.filter(s => s.scores[filterDomain]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
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
            onClick={() => router.push(`/assignments/${params.assignmentId}/submissions`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            제출 현황으로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">평가 대시보드</h1>
            <p className="text-slate-600">{assignment?.title}</p>
          </div>
          <button
            onClick={handleExportExcel}
            className="px-6 py-3 bg-green-500/20 text-slate-700 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 border border-green-200/30"
          >
            <Download className="w-5 h-5" />
            Excel 다운로드
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">전체 학생</p>
                  <p className="text-2xl font-bold text-slate-800">{students.length}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">평가 완료</p>
                  <p className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.evaluatedAt).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">평균 수준</p>
                  <p className="text-2xl font-bold text-blue-600">우수</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">완료율</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round((students.filter(s => s.evaluatedAt).length / students.length) * 100)}%
                  </p>
                </div>
                <div className="w-16 h-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#9333ea"
                      strokeWidth="3"
                      strokeDasharray={`${(students.filter(s => s.evaluatedAt).length / students.length) * 100}, 100`}
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Domain Scores */}
        {domainScores.length > 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 mb-8">
            <CardHeader>
              <CardTitle>영역별 평가 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {domainScores.map((domain) => (
                  <div key={domain.domain}>
                    <h4 className="font-medium text-slate-700 mb-3">{domain.domain}</h4>
                    <div className="space-y-2">
                      {domain.distribution.map((dist) => (
                        <div key={dist.level} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{dist.level}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(dist.count / students.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-700 w-8 text-right">{dist.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'overallLevel')}
              className="px-3 py-2 border border-slate-200 rounded-lg bg-white/70"
            >
              <option value="name">이름순</option>
              <option value="overallLevel">성취도순</option>
            </select>
          </div>
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white/70"
          >
            <option value="all">전체 영역</option>
            {assignment?.evaluationDomains?.map((domain: string) => (
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </div>

        {/* Student Table */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gradient-to-r from-blue-50/10 to-indigo-50/10">
                    <th className="text-left p-4 font-medium">학생 이름</th>
                    <th className="text-left p-4 font-medium">학번</th>
                    {assignment?.evaluationDomains?.map((domain: string) => (
                      <th key={domain} className="text-center p-4 font-medium">{domain}</th>
                    ))}
                    <th className="text-center p-4 font-medium">종합 평가</th>
                    <th className="text-center p-4 font-medium">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-blue-50/10 transition-colors">
                      <td className="p-4 font-medium">{student.name}</td>
                      <td className="p-4 text-slate-600">{student.studentId}</td>
                      {assignment?.evaluationDomains?.map((domain: string) => (
                        <td key={domain} className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            student.scores[domain] === '매우 우수' ? 'bg-green-100 text-green-700' :
                            student.scores[domain] === '우수' ? 'bg-blue-100 text-blue-700' :
                            student.scores[domain] === '보통' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {student.scores[domain] || '-'}
                          </span>
                        </td>
                      ))}
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          student.overallLevel === '매우 우수' ? 'bg-green-100 text-green-700' :
                          student.overallLevel === '우수' ? 'bg-blue-100 text-blue-700' :
                          student.overallLevel === '보통' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {student.overallLevel}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => router.push(`/assignments/${params.assignmentId}/submissions/${student.id}`)}
                          className="px-3 py-1 bg-white/60 text-slate-700 rounded-lg hover:bg-white/80 transition-colors text-sm border border-slate-200/50"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}