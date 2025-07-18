'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Users, Target, BarChart3, PieChart, Activity, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart as RePieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, ResponsiveContainer
} from 'recharts';

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
  createdAt: string;
}

const COLORS = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed'];

export default function AnalyticsPage({ params }: { params: { assignmentId: string } }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 데이터 분석 함수들
  const getLevelDistribution = () => {
    if (!assignment) return [];
    
    const distribution = assignment.evaluationLevels.map(level => ({
      name: level,
      value: evaluations.filter(e => e.overallLevel === level).length,
      percentage: evaluations.length > 0 
        ? ((evaluations.filter(e => e.overallLevel === level).length / evaluations.length) * 100).toFixed(1)
        : '0'
    }));
    
    return distribution;
  };

  const getDomainAverages = () => {
    if (!assignment) return [];
    
    return assignment.evaluationDomains.map(domain => {
      const scores = evaluations
        .map(e => e.domainEvaluations[domain]?.score || 0)
        .filter(score => score > 0);
      
      const average = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      
      return {
        domain,
        average: Number(average.toFixed(2)),
        fullMark: assignment.evaluationLevels.length
      };
    });
  };

  const getDomainDistribution = () => {
    if (!assignment) return [];
    
    return assignment.evaluationDomains.map(domain => {
      const distribution = assignment.evaluationLevels.map(level => ({
        level,
        count: evaluations.filter(e => e.domainEvaluations[domain]?.level === level).length
      }));
      
      return {
        domain,
        ...Object.fromEntries(distribution.map(d => [d.level, d.count]))
      };
    });
  };

  const getSubmissionTimeline = () => {
    // 날짜별 제출 현황
    const timeline: Record<string, number> = {};
    
    evaluations.forEach(evaluation => {
      const date = new Date(evaluation.submittedAt).toLocaleDateString('ko-KR');
      timeline[date] = (timeline[date] || 0) + 1;
    });
    
    return Object.entries(timeline)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }));
  };

  const getStatistics = () => {
    const totalStudents = evaluations.length;
    const levelCounts = getLevelDistribution();
    const excellentCount = levelCounts
      .filter(l => l.name.includes('우수'))
      .reduce((sum, l) => sum + l.value, 0);
    const excellentRate = totalStudents > 0 ? (excellentCount / totalStudents * 100).toFixed(1) : '0';
    
    const domainAverages = getDomainAverages();
    const overallAverage = domainAverages.length > 0
      ? (domainAverages.reduce((sum, d) => sum + d.average, 0) / domainAverages.length).toFixed(2)
      : '0';
    
    return {
      totalStudents,
      excellentRate,
      overallAverage,
      submissionRate: '100' // 모든 학생이 제출했다고 가정
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const stats = getStatistics();
  const levelDistribution = getLevelDistribution();
  const domainAverages = getDomainAverages();
  const domainDistribution = getDomainDistribution();
  const submissionTimeline = getSubmissionTimeline();

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">평가 통계 분석</h1>
          {assignment && (
            <div className="text-slate-600">
              <p className="text-lg font-medium">{assignment.title}</p>
              <p className="text-sm mt-1">
                {assignment.schoolName} · {assignment.gradeLevel} · {assignment.writingType}
              </p>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">전체 학생</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}명</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">우수 이상 비율</p>
                  <p className="text-2xl font-bold text-green-600">{stats.excellentRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">평균 점수</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.overallAverage}</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">제출률</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.submissionRate}%</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Level Distribution Pie Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                평가 수준 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={levelDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {levelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Domain Averages Radar Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                영역별 평균 점수
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={domainAverages}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="domain" />
                  <PolarRadiusAxis angle={90} domain={[0, assignment?.evaluationLevels.length || 4]} />
                  <Radar name="평균 점수" dataKey="average" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Domain Distribution Bar Chart */}
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                영역별 수준 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={domainDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {assignment?.evaluationLevels.map((level, index) => (
                    <Bar 
                      key={level} 
                      dataKey={level} 
                      fill={COLORS[index % COLORS.length]} 
                      stackId="a"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Submission Timeline */}
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                제출 현황 추이
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={submissionTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics Table */}
        <Card className="mt-6 bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardHeader>
            <CardTitle>상세 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">평가 영역</th>
                    {assignment?.evaluationLevels.map(level => (
                      <th key={level} className="text-center py-3 px-4 font-medium text-slate-700">
                        {level}
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 font-medium text-slate-700">평균</th>
                  </tr>
                </thead>
                <tbody>
                  {domainAverages.map((domain, idx) => {
                    const dist = domainDistribution[idx];
                    return (
                      <tr key={domain.domain} className="border-b border-slate-100">
                        <td className="py-3 px-4 font-medium text-slate-800">{domain.domain}</td>
                        {assignment?.evaluationLevels.map(level => (
                          <td key={level} className="text-center py-3 px-4">
                            {dist[level] || 0}명
                          </td>
                        ))}
                        <td className="text-center py-3 px-4 font-medium text-blue-600">
                          {domain.average}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}