'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { useEvaluationStream } from '@/hooks/useEvaluationStream';
import { ChatPanel } from '@/components/ChatPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUpDown, 
  Download, 
  FileSpreadsheet,
  Search,
  ChevronUp,
  ChevronDown,
  Wifi,
  WifiOff,
  Activity,
  MessageCircle
} from 'lucide-react';
import type { SortField, SortOrder, FilterConfig, DomainKey, TeacherDashboardData, AchievementLevel } from '@/types/grading';
import { DOMAIN_MAP } from '@/types/grading';
import { exportToExcel, exportToGoogleSheets } from '@/lib/export-utils';

export default function TeacherDashboard() {
  return (
    <AuthLayout>
      <DashboardContent />
    </AuthLayout>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignmentId');
  const { updates, isConnected, clearUpdates } = useEvaluationStream(assignmentId);
  
  const [sortConfig, setSortConfig] = useState<{ field: SortField; order: SortOrder }>({
    field: 'name',
    order: 'asc'
  });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  const [selectedDomain, setSelectedDomain] = useState<DomainKey | 'overall'>('overall');
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeEvaluations, setActiveEvaluations] = useState<Map<string, any>>(new Map());
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Load assignment data
    if (assignmentId) {
      fetchAssignmentData();
    }
  }, [assignmentId]);
  
  // Process real-time updates
  useEffect(() => {
    updates.forEach(update => {
      if (update.type === 'evaluation_started') {
        setActiveEvaluations(prev => {
          const newMap = new Map(prev);
          newMap.set(update.submissionId!, {
            studentName: update.studentName,
            status: 'evaluating',
            timestamp: update.timestamp
          });
          return newMap;
        });
      } else if (update.type === 'evaluation_completed') {
        setActiveEvaluations(prev => {
          const newMap = new Map(prev);
          newMap.delete(update.submissionId!);
          return newMap;
        });
        // Refresh data after completion
        fetchAssignmentData();
      }
    });
  }, [updates]);
  
  const fetchAssignmentData = async () => {
    if (!assignmentId) return;
    
    setIsLoading(true);
    try {
      // Fetch assignment details
      const assignmentRes = await fetch(`/api/assignments/${assignmentId}`);
      const assignmentData = await assignmentRes.json();
      
      // Fetch evaluations
      const evaluationsRes = await fetch(`/api/evaluations/by-assignment/${assignmentId}`);
      const evaluationsData = await evaluationsRes.json();
      
      if (assignmentData.success && evaluationsData.success) {
        // Transform data to match dashboard format
        const dashboardData: TeacherDashboardData = {
          classInfo: {
            schoolName: assignmentData.assignment.schoolName,
            grade: assignmentData.assignment.gradeLevel,
            assignmentTitle: assignmentData.assignment.title,
            evaluationDate: new Date().toISOString()
          },
          statistics: {
            totalStudents: evaluationsData.evaluations.length,
            completedEvaluations: evaluationsData.evaluations.length,
            averageScore: 0,
            domainAverages: {}
          },
          evaluationResults: evaluationsData.evaluations.map((evaluation: any) => ({
            student: {
              name: evaluation.studentName,
              studentNumber: evaluation.studentId
            },
            domainScores: evaluation.domainEvaluations,
            overallLevel: evaluation.overallLevel,
            overallScore: 0,
            strengths: [],
            improvements: [],
            feedback: evaluation.overallFeedback
          }))
        };
        
        setDashboardData(dashboardData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort and filter results
  const processedResults = useMemo(() => {
    if (!dashboardData) return [];
    
    let results = [...dashboardData.evaluationResults];

    // Apply search filter
    if (filterConfig.searchQuery) {
      const query = filterConfig.searchQuery.toLowerCase();
      results = results.filter(
        (result) =>
          result.student.name.toLowerCase().includes(query) ||
          result.student.studentNumber.includes(query)
      );
    }

    // Apply level filter
    if (filterConfig.levels && filterConfig.levels.length > 0) {
      results = results.filter((result) => {
        if (selectedDomain === 'overall') {
          return filterConfig.levels!.includes(result.overallLevel);
        } else {
          return filterConfig.levels!.includes(result.domainEvaluations[selectedDomain].level);
        }
      });
    }

    // Apply score range filter
    if (filterConfig.scoreRange) {
      results = results.filter(
        (result) =>
          result.overallScore >= filterConfig.scoreRange!.min &&
          result.overallScore <= filterConfig.scoreRange!.max
      );
    }

    // Sort results
    results.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortConfig.field === 'name') {
        aValue = a.student.name;
        bValue = b.student.name;
      } else if (sortConfig.field === 'studentNumber') {
        aValue = a.student.studentNumber;
        bValue = b.student.studentNumber;
      } else if (sortConfig.field === 'overallLevel') {
        const levelOrder = { '매우 우수': 4, '우수': 3, '보통': 2, '미흡': 1 };
        aValue = levelOrder[a.overallLevel as keyof typeof levelOrder];
        bValue = levelOrder[b.overallLevel as keyof typeof levelOrder];
      } else if (sortConfig.field === 'overallScore') {
        aValue = a.overallScore;
        bValue = b.overallScore;
      } else {
        // Domain scores
        aValue = a.domainEvaluations[sortConfig.field as DomainKey].score;
        bValue = b.domainEvaluations[sortConfig.field as DomainKey].score;
      }

      if (sortConfig.order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return results;
  }, [dashboardData, sortConfig, filterConfig]);

  const handleSort = (field: SortField | 'studentNumber' | 'overallLevel') => {
    setSortConfig((prev) => ({
      field: field as SortField,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ field }: { field: SortField | 'studentNumber' | 'overallLevel' }) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.order === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  const handleExcelExport = () => {
    if (dashboardData) {
      exportToExcel(dashboardData);
    }
  };

  const handleGoogleSheetsExport = async () => {
    if (dashboardData) {
      await exportToGoogleSheets(dashboardData);
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <p className="text-center text-gray-500">로딩 중...</p>
      </div>
    );
  }

  const { assignment, classStatistics } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">교사 평가 대시보드</h1>
          <p className="text-slate-600">{assignment.title}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">실시간 업데이트 연결됨</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">오프라인 모드</span>
              </>
            )}
          </div>
        </div>
        
        {/* Active Evaluations */}
        {activeEvaluations.size > 0 && (
          <Card className="bg-blue-50/50 border border-blue-200/50 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                현재 진행 중인 평가
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from(activeEvaluations.entries()).map(([submissionId, evaluation]) => (
                  <div key={submissionId} className="flex items-center justify-between p-3 bg-white/70 rounded-lg">
                    <span className="font-medium">{evaluation.studentName}</span>
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">평가 중...</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-t-xl">
              <CardTitle className="text-base font-medium text-slate-700 text-center">평가 완료 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-4">
              <p className="text-3xl font-bold">
                {classStatistics.evaluatedStudents} / {classStatistics.totalStudents}
              </p>
              <p className="text-3xl text-gray-600">명</p>
            </div>
            <div className="w-full bg-slate-200/50 rounded-full h-3">
              <div 
                className="bg-blue-500/60 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(classStatistics.evaluatedStudents / classStatistics.totalStudents) * 100}%` }}
              />
            </div>
          </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
            <CardHeader className="pb-2 bg-gradient-to-r from-slate-500/10 to-slate-600/10 rounded-t-xl">
              <CardTitle className="text-base font-medium text-slate-700 text-center">등급별 분포</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {(['매우 우수', '우수', '보통', '미흡'] as const).map((level) => {
                const count = classStatistics.levelDistribution[level] || 0;
                const percentage = Math.round((count / classStatistics.totalStudents) * 100);
                const colors = {
                  '매우 우수': 'bg-blue-500/60',
                  '우수': 'bg-blue-400/60',
                  '보통': 'bg-amber-400/60',
                  '미흡': 'bg-slate-400/60'
                };
                
                return (
                  <div key={level} className="flex items-center gap-2">
                    <span className="text-base font-medium w-20 text-right">{level}</span>
                    <div className="flex-1 bg-slate-200/50 rounded-full h-6 relative">
                      <div 
                        className={`${colors[level]} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                        style={{ width: `${percentage}%` }}
                      >
                        {percentage > 10 && (
                          <span className="text-sm text-white font-medium">{count}명</span>
                        )}
                      </div>
                      {percentage <= 10 && count > 0 && (
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-sm font-medium">{count}명</span>
                      )}
                    </div>
                    <span className="text-base text-gray-600 w-10">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Controls */}
        <div className="mb-6 space-y-4">
          {/* Search and Export Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="w-full sm:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="학생 이름 또는 번호로 검색..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                  onChange={(e) =>
                    setFilterConfig((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                />
              </div>
            </div>
            
            <div className="flex gap-2 self-start sm:self-auto">
              <button 
                onClick={() => handleExcelExport()}
                className="px-4 py-2 bg-white/70 text-slate-700 rounded-lg hover:bg-white/80 transition-colors flex items-center gap-2 border border-slate-200/50 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                엑셀 내보내기
              </button>
              <button 
                onClick={() => handleGoogleSheetsExport()}
                className="px-4 py-2 bg-white/70 text-slate-700 rounded-lg hover:bg-white/80 transition-colors flex items-center gap-2 border border-slate-200/50 whitespace-nowrap"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Google Sheets
              </button>
            </div>
          </div>
          
          {/* Filter Row */}
          <div className="space-y-2">
            {/* Domain Selection */}
            <div className="flex flex-wrap gap-2">
              <span className="text-base text-slate-600 self-center mr-2">필터 항목:</span>
              <button
                onClick={() => setSelectedDomain('overall')}
                className={`px-4 py-2 text-base rounded-lg border transition-colors ${
                  selectedDomain === 'overall'
                    ? 'bg-slate-700/10 border-slate-400 text-slate-700'
                    : 'bg-white/50 border-slate-200/50 text-slate-600 hover:bg-white/70'
                }`}
              >
                종합 등급
              </button>
              {Object.entries(DOMAIN_MAP).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedDomain(key as DomainKey)}
                  className={`px-4 py-2 text-base rounded-lg border transition-colors ${
                    selectedDomain === key
                      ? 'bg-slate-700/10 border-slate-400 text-slate-700'
                      : 'bg-white/50 border-slate-200/50 text-slate-600 hover:bg-white/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* Level Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-base text-slate-600 self-center mr-2">등급 선택:</span>
              {(['매우 우수', '우수', '보통', '미흡'] as AchievementLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setFilterConfig((prev) => {
                      const currentLevels = prev.levels || [];
                      const isSelected = currentLevels.includes(level);
                      return {
                        ...prev,
                        levels: isSelected
                          ? currentLevels.filter((l) => l !== level)
                          : [...currentLevels, level]
                      };
                    });
                  }}
                  className={`px-4 py-2 text-base rounded-lg border transition-colors ${
                    filterConfig.levels?.includes(level)
                      ? level === '매우 우수'
                        ? 'bg-blue-500/20 border-blue-300 text-blue-700'
                        : level === '우수'
                        ? 'bg-blue-400/20 border-blue-300 text-blue-600'
                        : level === '보통'
                        ? 'bg-amber-400/20 border-amber-300 text-amber-700'
                        : 'bg-slate-400/20 border-slate-300 text-slate-600'
                      : 'bg-white/50 border-slate-200/50 text-slate-600 hover:bg-white/70'
                  }`}
                >
                  {level}
                </button>
              ))}
              {filterConfig.levels && filterConfig.levels.length > 0 && (
                <button
                  onClick={() => setFilterConfig((prev) => ({ ...prev, levels: undefined }))}
                  className="px-4 py-2 text-base text-slate-500 hover:text-slate-700"
                >
                  필터 초기화
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Grid */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-blue-50/10 to-indigo-50/10">
                  <th className="text-left p-4">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/60 hover:bg-blue-100/50 hover:text-blue-700 transition-all text-base font-medium text-slate-700 border border-transparent hover:border-blue-200/30"
                    >
                      학생 이름
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="text-center p-4">
                    <button
                      onClick={() => handleSort('studentNumber')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/60 hover:bg-amber-100/50 hover:text-amber-700 transition-all mx-auto text-base font-medium text-slate-700 border border-transparent hover:border-amber-200/30"
                    >
                      학번
                      <SortIcon field="studentNumber" />
                    </button>
                  </th>
                  {Object.entries(DOMAIN_MAP).map(([key, label]) => (
                    <th key={key} className="text-center p-4 min-w-[120px]">
                      <button
                        onClick={() => handleSort(key as DomainKey)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/60 hover:bg-blue-100/50 hover:text-blue-700 transition-all mx-auto text-base font-medium text-slate-700 border border-transparent hover:border-blue-200/30"
                      >
                        {label}
                        <SortIcon field={key as DomainKey} />
                      </button>
                    </th>
                  ))}
                  <th className="text-center p-4">
                    <button
                      onClick={() => handleSort('overallLevel')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/60 hover:bg-amber-100/50 hover:text-amber-700 transition-all mx-auto text-base font-medium text-slate-700 border border-transparent hover:border-amber-200/30"
                    >
                      종합 등급
                      <SortIcon field="overallLevel" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {processedResults.map((result) => (
                  <tr
                    key={result.id}
                    className="border-b hover:bg-blue-50/20 transition-all duration-200 cursor-pointer bg-white/30 group"
                    onClick={() => router.push(`/grading/${result.student.id}`)}
                  >
                    <td className="p-4 font-medium text-slate-700 group-hover:text-blue-600 transition-colors text-base">
                      {result.student.name}
                    </td>
                    <td className="p-4 text-center text-slate-600 text-base">
                      {result.student.studentNumber}
                    </td>
                    {Object.keys(DOMAIN_MAP).map((key) => {
                      const evaluation = result.domainEvaluations[key as DomainKey];
                      return (
                        <td key={key} className="p-4 text-center">
                          <span
                            className={`inline-block px-3 py-1.5 rounded-md text-sm font-medium ${
                              evaluation.level === '매우 우수'
                                ? 'bg-blue-500/10 text-blue-700 border border-blue-200/30'
                                : evaluation.level === '우수'
                                ? 'bg-blue-400/10 text-blue-600 border border-blue-200/30'
                                : evaluation.level === '보통'
                                ? 'bg-amber-400/10 text-amber-700 border border-amber-200/30'
                                : 'bg-slate-400/10 text-slate-600 border border-slate-200/30'
                            }`}
                          >
                            {evaluation.level}
                          </span>
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block px-4 py-2 rounded-md text-base font-medium ${
                          result.overallLevel === '매우 우수'
                            ? 'bg-blue-500/10 text-blue-700 border border-blue-200/30'
                            : result.overallLevel === '우수'
                            ? 'bg-blue-400/10 text-blue-600 border border-blue-200/30'
                            : result.overallLevel === '보통'
                            ? 'bg-amber-400/10 text-amber-700 border border-amber-200/30'
                            : 'bg-slate-400/10 text-slate-600 border border-slate-200/30'
                        }`}
                      >
                        {result.overallLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        </Card>
      </div>
      
      {/* Floating Chat Button */}
      {assignmentId && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          title="실시간 채팅 열기"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      
      {/* Chat Panel */}
      {assignmentId && (
        <ChatPanel
          assignmentId={assignmentId}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}