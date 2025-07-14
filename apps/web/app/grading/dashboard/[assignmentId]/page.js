'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Download,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId;
  
  const [assignment, setAssignment] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('studentName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    fetchData();
  }, [assignmentId]);

  const fetchData = async () => {
    try {
      // Mock data
      const mockAssignment = {
        id: assignmentId,
        title: '2024 1학기 논설문 쓰기',
        schoolName: '서울초등학교',
        gradeLevel: '6학년',
        evaluationDomains: ['주장의 명확성', '근거의 타당성', '논리적 구조', '설득력 있는 표현']
      };
      
      const mockEvaluations = [
        {
          id: '1',
          studentName: '김민준',
          studentNumber: '20240101',
          className: '6-1',
          scores: { clarity: 92, evidence: 88, structure: 90, expression: 85 },
          overallScore: 89,
          level: '매우 우수'
        },
        {
          id: '2',
          studentName: '이서연',
          studentNumber: '20240102',
          className: '6-1',
          scores: { clarity: 85, evidence: 82, structure: 88, expression: 90 },
          overallScore: 86,
          level: '우수'
        },
        {
          id: '3',
          studentName: '박준호',
          studentNumber: '20240103',
          className: '6-2',
          scores: { clarity: 78, evidence: 75, structure: 80, expression: 77 },
          overallScore: 78,
          level: '보통'
        },
        {
          id: '4',
          studentName: '최지우',
          studentNumber: '20240104',
          className: '6-2',
          scores: { clarity: 95, evidence: 93, structure: 92, expression: 94 },
          overallScore: 94,
          level: '매우 우수'
        },
        {
          id: '5',
          studentName: '정하윤',
          studentNumber: '20240105',
          className: '6-1',
          scores: { clarity: 82, evidence: 80, structure: 85, expression: 83 },
          overallScore: 83,
          level: '우수'
        }
      ];
      
      setAssignment(mockAssignment);
      setEvaluations(mockEvaluations);
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewReport = (evaluationId) => {
    router.push(`/grading/student-report/${evaluationId}`);
  };

  const handleExportExcel = () => {
    alert('Excel 내보내기 기능은 준비 중입니다.');
  };

  // Calculate statistics
  const statistics = {
    totalStudents: evaluations.length,
    averageScore: Math.round(evaluations.reduce((acc, e) => acc + e.overallScore, 0) / evaluations.length || 0),
    levelCounts: {
      '매우 우수': evaluations.filter(e => e.level === '매우 우수').length,
      '우수': evaluations.filter(e => e.level === '우수').length,
      '보통': evaluations.filter(e => e.level === '보통').length,
      '미흡': evaluations.filter(e => e.level === '미흡').length
    },
    domainAverages: assignment?.evaluationDomains.map((domain, index) => ({
      domain,
      average: Math.round(
        evaluations.reduce((acc, e) => acc + Object.values(e.scores)[index], 0) / evaluations.length || 0
      )
    }))
  };

  // Filter and sort evaluations
  const filteredEvaluations = evaluations.filter(e => 
    filterLevel === 'all' || e.level === filterLevel
  );

  const sortedEvaluations = [...filteredEvaluations].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortField) {
      case 'studentName':
        aValue = a.studentName;
        bValue = b.studentName;
        break;
      case 'overallScore':
        aValue = a.overallScore;
        bValue = b.overallScore;
        break;
      case 'level':
        aValue = a.level;
        bValue = b.level;
        break;
      default:
        aValue = a[sortField];
        bValue = b[sortField];
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로 가기
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">평가 대시보드</h1>
              {assignment && (
                <p className="text-slate-600">{assignment.title} · {assignment.gradeLevel}</p>
              )}
            </div>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Excel 내보내기
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <span className="text-sm text-slate-500">전체 학생</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{statistics.totalStudents}명</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <span className="text-sm text-slate-500">평균 점수</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{statistics.averageScore}점</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <span className="text-sm text-slate-500">최고 성취</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{statistics.levelCounts['매우 우수']}명</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-8 h-8 text-orange-500" />
              <span className="text-sm text-slate-500">평가 완료율</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">100%</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Level Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">성취 수준 분포</h3>
            <div className="space-y-3">
              {Object.entries(statistics.levelCounts).map(([level, count]) => (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{level}</span>
                    <span className="font-medium">{count}명</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        level === '매우 우수' ? 'bg-green-500' :
                        level === '우수' ? 'bg-blue-500' :
                        level === '보통' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(count / statistics.totalStudents) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Domain Averages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">영역별 평균 점수</h3>
            <div className="space-y-3">
              {statistics.domainAverages?.map(({ domain, average }) => (
                <div key={domain}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{domain}</span>
                    <span className="font-medium">{average}점</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${average}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">성취 수준:</span>
            <div className="flex gap-2">
              {['all', '매우 우수', '우수', '보통', '미흡'].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterLevel(level)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filterLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {level === 'all' ? '전체' : level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('studentName')}
                      className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                      학생 정보
                      {sortField === 'studentName' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  {assignment?.evaluationDomains.map((domain, index) => (
                    <th key={domain} className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                      {domain}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSort('overallScore')}
                      className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 mx-auto"
                    >
                      종합 점수
                      {sortField === 'overallScore' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleSort('level')}
                      className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 mx-auto"
                    >
                      성취 수준
                      {sortField === 'level' && (
                        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-slate-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedEvaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{evaluation.studentName}</p>
                        <p className="text-sm text-slate-600">
                          {evaluation.className} · {evaluation.studentNumber}
                        </p>
                      </div>
                    </td>
                    {Object.values(evaluation.scores).map((score, index) => (
                      <td key={index} className="px-4 py-4 text-center">
                        <span className={`font-medium ${
                          score >= 90 ? 'text-green-600' :
                          score >= 80 ? 'text-blue-600' :
                          score >= 70 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {score}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center">
                      <span className="text-lg font-bold text-slate-800">{evaluation.overallScore}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        evaluation.level === '매우 우수' ? 'bg-green-100 text-green-700' :
                        evaluation.level === '우수' ? 'bg-blue-100 text-blue-700' :
                        evaluation.level === '보통' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {evaluation.level}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleViewReport(evaluation.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 text-sm font-medium mx-auto"
                      >
                        <Eye className="w-4 h-4" />
                        리포트
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}