'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { ArrowLeft, Download, Filter, BarChart3, TrendingUp, AlertCircle, FileSearch, PlayCircle, Users, CheckCircle, Clock, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import * as XLSX from 'xlsx';

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
  evaluatedBy?: string;
  evaluationCount?: number;
  evaluationHistory?: Array<{
    evaluationId: string;
    round: number;
    evaluatedAt: Date;
    overallLevel: string;
    domainScores: any;
    evaluatedBy?: string;
  }>;
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
  const [filterRound, setFilterRound] = useState<string>('latest'); // latest, all, 1, 2, 3...
  const [availableRounds, setAvailableRounds] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'submission' | 'analysis'>('submission'); // 탭 상태 추가

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
        // JSON 필드가 배열인지 확인하고 변환
        const assignment = {
          ...assignmentData.assignment,
          evaluationDomains: Array.isArray(assignmentData.assignment.evaluationDomains) 
            ? assignmentData.assignment.evaluationDomains 
            : JSON.parse(assignmentData.assignment.evaluationDomains || '[]'),
          evaluationLevels: Array.isArray(assignmentData.assignment.evaluationLevels)
            ? assignmentData.assignment.evaluationLevels
            : JSON.parse(assignmentData.assignment.evaluationLevels || '[]')
        };
        setAssignment(assignment);
      }

      // Fetch submissions with evaluations
      const submissionsRes = await fetch(`/api/assignments/${params.assignmentId}/evaluations`);
      const submissionsData = await submissionsRes.json();
      console.log('Evaluations data:', submissionsData);
      if (submissionsData.success) {
        const evaluatedStudents = submissionsData.evaluations.map((evaluation: any) => {
          // domainEvaluations가 JSON 객체일 수 있으므로 확인
          let domainScores = {};
          if (evaluation.domainScores && typeof evaluation.domainScores === 'object') {
            // domainScores가 이미 객체 형태인 경우
            domainScores = evaluation.domainScores;
          } else if (typeof evaluation.domainScores === 'string') {
            // 문자열인 경우 파싱
            try {
              domainScores = JSON.parse(evaluation.domainScores);
            } catch (e) {
              console.error('Failed to parse domainScores:', e);
            }
          }
          
          return {
            id: evaluation.id,
            name: evaluation.studentName,
            studentId: evaluation.studentId,
            scores: domainScores,
            overallLevel: evaluation.overallLevel || '평가 대기',
            submittedAt: new Date(evaluation.submittedAt),
            evaluatedAt: evaluation.evaluatedAt ? new Date(evaluation.evaluatedAt) : undefined,
            evaluatedBy: evaluation.evaluatedBy,
            evaluationCount: evaluation.evaluationCount || 0,
            evaluationHistory: evaluation.evaluationHistory || []
          };
        });
        setStudents(evaluatedStudents);
        
        // 사용 가능한 평가 차수 계산
        const rounds = new Set<number>();
        evaluatedStudents.forEach((student: Student) => {
          if (student.evaluationCount && student.evaluationCount > 0) {
            for (let i = 1; i <= student.evaluationCount; i++) {
              rounds.add(i);
            }
          }
        });
        setAvailableRounds(Array.from(rounds).sort((a, b) => a - b));

        // Calculate domain scores은 필터링 후에 다시 계산되도록 함
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      // 워크북 생성
      const wb = XLSX.utils.book_new();
      
      // 1. 최신 평가 결과 시트
      const latestData = [];
      const latestHeaders = ['학생 이름', '학번'];
      if (assignment?.evaluationDomains) {
        latestHeaders.push(...assignment.evaluationDomains);
      }
      latestHeaders.push('종합 평가', '평가 모델', '평가 차수', '제출일시', '평가일시');
      latestData.push(latestHeaders);
      
      // 학생별 최신 평가 데이터
      students.forEach(student => {
        const row = [student.name, student.studentId];
        
        if (assignment?.evaluationDomains) {
          assignment.evaluationDomains.forEach((domain: string) => {
            const score = student.scores[domain];
            const level = typeof score === 'object' && score !== null 
              ? (score as any).level 
              : score;
            row.push(level || '-');
          });
        }
        
        row.push(student.overallLevel);
        row.push(student.evaluatedBy || '-');
        row.push(student.evaluationCount ? `${student.evaluationCount}차` : '-');
        row.push(student.submittedAt.toLocaleString('ko-KR'));
        row.push(student.evaluatedAt ? student.evaluatedAt.toLocaleString('ko-KR') : '미평가');
        
        latestData.push(row);
      });
      
      const wsLatest = XLSX.utils.aoa_to_sheet(latestData);
      const latestColWidths = latestHeaders.map((header, index) => {
        if (index === 0) return { wch: 15 }; // 이름
        if (index === 1) return { wch: 12 }; // 학번
        if (header.includes('일시')) return { wch: 20 }; // 일시
        return { wch: 15 }; // 기본
      });
      wsLatest['!cols'] = latestColWidths;
      XLSX.utils.book_append_sheet(wb, wsLatest, '최신 평가 결과');
      
      // 2. 전체 평가 이력 시트
      const historyData = [];
      const historyHeaders = ['학생 이름', '학번', '평가 차수', '평가일시', '평가 모델'];
      if (assignment?.evaluationDomains) {
        historyHeaders.push(...assignment.evaluationDomains);
      }
      historyHeaders.push('종합 평가');
      historyData.push(historyHeaders);
      
      // 모든 평가 이력 데이터
      students.forEach(student => {
        if (student.evaluationHistory && student.evaluationHistory.length > 0) {
          student.evaluationHistory.forEach(evalHistory => {
            const row = [student.name, student.studentId, `${evalHistory.round}차`, 
                        new Date(evalHistory.evaluatedAt).toLocaleString('ko-KR'),
                        evalHistory.evaluatedBy || '-'];
            
            if (assignment?.evaluationDomains) {
              assignment.evaluationDomains.forEach((domain: string) => {
                const score = evalHistory.domainScores?.[domain];
                const level = typeof score === 'object' && score !== null 
                  ? (score as any).level 
                  : score;
                row.push(level || '-');
              });
            }
            
            row.push(evalHistory.overallLevel);
            historyData.push(row);
          });
        }
      });
      
      const wsHistory = XLSX.utils.aoa_to_sheet(historyData);
      wsHistory['!cols'] = historyHeaders.map((header, index) => {
        if (index === 0) return { wch: 15 }; // 이름
        if (index === 1) return { wch: 12 }; // 학번
        if (header.includes('일시')) return { wch: 20 }; // 일시
        return { wch: 15 }; // 기본
      });
      XLSX.utils.book_append_sheet(wb, wsHistory, '전체 평가 이력');
      
      // 3. 통계 시트
      const statsData = [];
      statsData.push(['평가 통계']);
      statsData.push(['']);
      statsData.push(['과제명', assignment?.title || '']);
      statsData.push(['전체 학생 수', students.length]);
      statsData.push(['평가 완료', students.filter(s => s.evaluatedAt).length]);
      statsData.push(['미평가', students.filter(s => !s.evaluatedAt).length]);
      statsData.push(['']);
      statsData.push(['평가 차수별 현황']);
      const roundCounts = new Map();
      students.forEach(s => {
        if (s.evaluationCount) {
          roundCounts.set(s.evaluationCount, (roundCounts.get(s.evaluationCount) || 0) + 1);
        }
      });
      Array.from(roundCounts.entries())
        .sort((a, b) => a[0] - b[0])
        .forEach(([round, count]) => {
          statsData.push([`${round}차 평가`, count]);
        });
      
      statsData.push(['']);
      statsData.push(['영역별 분포 (최신 평가 기준)']);
      
      if (domainScores.length > 0) {
        domainScores.forEach(domain => {
          statsData.push(['']);
          statsData.push([domain.domain]);
          domain.distribution.forEach(dist => {
            statsData.push([dist.level, dist.count]);
          });
        });
      }
      
      const wsStats = XLSX.utils.aoa_to_sheet(statsData);
      wsStats['!cols'] = [{ wch: 20 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsStats, '통계');
      
      // 파일 다운로드
      const fileName = `${assignment?.title || '평가결과'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel 파일 생성 중 오류가 발생했습니다.');
    }
  };

  // 평가 차수별로 학생 데이터 필터링 및 변환
  const getStudentDataForRound = (student: Student, round: string) => {
    if (round === 'latest') {
      return student; // 최신 평가 데이터 그대로 사용
    } else if (round === 'all') {
      return student; // 모든 평가 보기 (최신 데이터 표시)
    } else {
      // 특정 차수의 평가 데이터 가져오기
      const roundNum = parseInt(round);
      const evalHistory = student.evaluationHistory?.find(h => h.round === roundNum);
      if (evalHistory) {
        return {
          ...student,
          scores: evalHistory.domainScores || {},
          overallLevel: evalHistory.overallLevel,
          evaluatedAt: new Date(evalHistory.evaluatedAt),
          evaluatedBy: evalHistory.evaluatedBy
        };
      }
      return null; // 해당 차수 평가가 없는 경우
    }
  };

  // 필터링된 학생 목록 생성
  const processedStudents = students
    .map(student => getStudentDataForRound(student, filterRound))
    .filter(student => student !== null) as Student[];
    
  // 필터가 변경될 때마다 도메인 점수 재계산
  useEffect(() => {
    if (assignment && assignment.evaluationDomains && processedStudents.length > 0) {
      const domains = assignment.evaluationDomains;
      const levels = assignment.evaluationLevels || ['매우 우수', '우수', '보통', '미흡'];
      
      const calculatedScores = domains.map((domain: string) => {
        const scores = processedStudents
          .map((s: Student) => {
            const score = s.scores[domain];
            return typeof score === 'object' && score !== null 
              ? (score as any).level 
              : score;
          })
          .filter(Boolean);
        
        const levelCounts = levels.reduce((acc: any, level: string) => {
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
  }, [filterRound, students, assignment]);

  const sortedStudents = [...processedStudents].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return a.overallLevel.localeCompare(b.overallLevel);
    }
  });

  const filteredStudents = filterDomain === 'all' 
    ? sortedStudents 
    : sortedStudents.filter(s => {
        const score = s.scores[filterDomain];
        return score !== null && score !== undefined;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container-custom py-8">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/assignments')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            과제 관리로 돌아가기
          </button>
        </div>

        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">평가 대시보드</h1>
            <p className="text-slate-600">{assignment?.title}</p>
          </div>
          <button
            onClick={handleExportExcel}
            className="btn-primary bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Excel 다운로드
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('submission')}
              className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'submission'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              제출 및 평가 관리
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all flex items-center gap-2 ${
                activeTab === 'analysis'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              평가 결과 분석
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'submission' ? (
          // 제출 및 평가 관리 탭
          <>
            <SubmissionManagementTab 
              assignment={assignment}
              students={students}
              params={params}
              router={router}
            />
          </>
        ) : (
          // 평가 결과 분석 탭
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass">
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
          
          <Card className="glass">
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

          <Card className="glass">
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

          <Card className="glass">
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
          <select
            value={filterRound}
            onChange={(e) => setFilterRound(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg bg-white/70"
          >
            <option value="latest">최신 평가</option>
            <option value="all">전체 보기</option>
            {availableRounds.map((round) => (
              <option key={round} value={round.toString()}>{round}차 평가</option>
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
                    <th className="text-center p-4 font-medium">평가 차수</th>
                    <th className="text-center p-4 font-medium">보기</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-blue-50/10 transition-colors">
                      <td className="p-4 font-medium">{student.name}</td>
                      <td className="p-4 text-slate-600">{student.studentId}</td>
                      {assignment?.evaluationDomains?.map((domain: string) => {
                        const score = student.scores[domain];
                        // score가 객체인 경우 level 속성을 사용하고, 문자열인 경우 그대로 사용
                        const level = typeof score === 'object' && score !== null 
                          ? (score as any).level 
                          : score;
                        
                        return (
                          <td key={domain} className="p-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              level === '매우 우수' ? 'bg-green-100 text-green-700' :
                              level === '우수' ? 'bg-blue-100 text-blue-700' :
                              level === '보통' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {level || '-'}
                            </span>
                          </td>
                        );
                      })}
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
                        {(() => {
                          if (filterRound === 'latest') {
                            return student.evaluationCount && student.evaluationCount > 0 ? (
                              <span className="text-sm text-slate-600">
                                최신 ({student.evaluationCount}차)
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">-</span>
                            );
                          } else if (filterRound === 'all') {
                            return student.evaluationCount && student.evaluationCount > 0 ? (
                              <span className="text-sm text-slate-600">
                                총 {student.evaluationCount}회
                              </span>
                            ) : (
                              <span className="text-sm text-slate-400">-</span>
                            );
                          } else {
                            return (
                              <span className="text-sm text-slate-600">
                                {filterRound}차 평가
                              </span>
                            );
                          }
                        })()}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => router.push(`/assignments/${params.assignmentId}/submissions/${student.id}`)}
                          className="px-3 py-1 bg-white/60 text-slate-700 rounded-lg hover:bg-white/80 transition-colors text-sm border border-slate-200/50"
                          title={student.evaluatedAt ? '보고서' : '학생글'}
                        >
                          보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </div>
  );
}

// 제출 및 평가 관리 탭 컴포넌트
function SubmissionManagementTab({ assignment, students, params, router }: any) {
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'evaluated' | 'unevaluated'>('all');
  const [sortField, setSortField] = useState<'name' | 'studentId' | 'submittedAt' | 'status'>('submittedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 전체 제출물 데이터 가져오기
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [params.assignmentId]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/assignments/${params.assignmentId}/submissions`);
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedSubmissions.size === filteredAndSortedSubmissions.length) {
      setSelectedSubmissions(new Set());
    } else {
      setSelectedSubmissions(new Set(filteredAndSortedSubmissions.map(s => s.id)));
    }
  };

  const handleSelectSubmission = (id: string) => {
    const newSelection = new Set(selectedSubmissions);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedSubmissions(newSelection);
  };

  const handleBatchEvaluate = () => {
    if (selectedSubmissions.size === 0) {
      alert('평가할 학생을 선택해주세요.');
      return;
    }
    
    const submissionIds = Array.from(selectedSubmissions);
    router.push(`/assignments/${params.assignmentId}/evaluate?submissions=${submissionIds.join(',')}`);
  };

  const handleCollectMore = () => {
    router.push(`/assignments/${params.assignmentId}/collect`);
  };

  const handleDeleteSelected = async () => {
    if (selectedSubmissions.size === 0) {
      alert('삭제할 제출물을 선택해주세요.');
      return;
    }

    const selectedCount = selectedSubmissions.size;
    const selectedNames = Array.from(selectedSubmissions).map(id => {
      const submission = submissions.find(s => s.id === id);
      return submission?.studentName || '이름 없음';
    }).join(', ');

    if (!confirm(`선택한 ${selectedCount}개의 제출물을 삭제하시겠습니까?\n\n삭제할 학생: ${selectedNames}`)) {
      return;
    }

    try {
      const submissionIds = Array.from(selectedSubmissions);
      const response = await fetch(`/api/assignments/${params.assignmentId}/submissions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionIds }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`${data.deletedCount}개의 제출물이 삭제되었습니다.`);
        setSelectedSubmissions(new Set()); // 선택 초기화
        fetchSubmissions(); // 목록 새로고침
      } else {
        alert('삭제 실패: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting submissions:', error);
      alert('제출물 삭제 중 오류가 발생했습니다.');
    }
  };

  // 정렬 핸들러
  const handleSort = (field: 'name' | 'studentId' | 'submittedAt' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 정렬 아이콘 컴포넌트
  const SortIcon = ({ field }: { field: 'name' | 'studentId' | 'submittedAt' | 'status' }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  // 상태별 필터링 및 정렬
  const filteredAndSortedSubmissions = submissions
    .filter(sub => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'evaluated') return sub.status === 'evaluated';
      if (filterStatus === 'unevaluated') return sub.status === 'submitted';
      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.studentName || '';
          bValue = b.studentName || '';
          break;
        case 'studentId':
          aValue = a.studentId || '';
          bValue = b.studentId || '';
          break;
        case 'submittedAt':
          aValue = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
          bValue = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
          break;
        case 'status':
          aValue = a.status === 'evaluated' ? 1 : 0;
          bValue = b.status === 'evaluated' ? 1 : 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  const stats = {
    total: submissions.length,
    evaluated: submissions.filter(s => s.status === 'evaluated').length,
    unevaluated: submissions.filter(s => s.status === 'submitted').length
  };

  if (loadingSubmissions) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">제출 현황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">전체 제출</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">평가 완료</p>
                <p className="text-2xl font-bold text-green-600">{stats.evaluated}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">미평가</p>
                <p className="text-2xl font-bold text-amber-600">{stats.unevaluated}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['all', 'unevaluated', 'evaluated'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {status === 'all' && '전체'}
              {status === 'unevaluated' && `미평가 (${stats.unevaluated})`}
              {status === 'evaluated' && `평가완료 (${stats.evaluated})`}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleCollectMore}
            className="px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 border border-slate-200"
          >
            <FileSearch className="w-4 h-4" />
            글 가져오기
          </button>
          
          {selectedSubmissions.size > 0 && (
            <>
              <button
                onClick={handleBatchEvaluate}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                선택 평가 ({selectedSubmissions.size}명)
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                선택 삭제 ({selectedSubmissions.size}개)
              </button>
            </>
          )}
          
          {stats.unevaluated > 0 && selectedSubmissions.size === 0 && (
            <button
              onClick={() => {
                const unevaluatedIds = filteredAndSortedSubmissions
                  .filter(s => s.status === 'submitted')
                  .map(s => s.id);
                router.push(`/assignments/${params.assignmentId}/evaluate?submissions=${unevaluatedIds.join(',')}`);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              전체 평가 ({stats.unevaluated}명)
            </button>
          )}
        </div>
      </div>

      {/* 제출 현황 테이블 */}
      <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50/50">
                  <th className="text-center p-4 w-12">
                    <input
                      type="checkbox"
                      checked={selectedSubmissions.size === filteredAndSortedSubmissions.length && filteredAndSortedSubmissions.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      학생 이름
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('studentId')}
                  >
                    <div className="flex items-center gap-1">
                      학번
                      <SortIcon field="studentId" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('submittedAt')}
                  >
                    <div className="flex items-center gap-1">
                      제출 일시
                      <SortIcon field="submittedAt" />
                    </div>
                  </th>
                  <th 
                    className="text-center p-4 font-medium cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      상태
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="text-center p-4 font-medium">보기</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSubmissions.map((submission: any) => (
                  <tr key={submission.id} className="border-b hover:bg-slate-50/50">
                    <td className="text-center p-4">
                      <input
                        type="checkbox"
                        checked={selectedSubmissions.has(submission.id)}
                        onChange={() => handleSelectSubmission(submission.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4 font-medium">{submission.studentName}</td>
                    <td className="p-4 text-slate-600">{submission.studentId}</td>
                    <td className="p-4 text-slate-600">
                      {submission.submittedAt 
                        ? new Date(submission.submittedAt).toLocaleString('ko-KR')
                        : '-'}
                    </td>
                    <td className="p-4 text-center">
                      {submission.status === 'evaluated' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                          <CheckCircle className="w-3 h-3" />
                          평가완료
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                          <Clock className="w-3 h-3" />
                          미평가
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => router.push(`/assignments/${params.assignmentId}/submissions/${submission.id}`)}
                        className="px-3 py-1.5 bg-white text-slate-700 rounded-md hover:bg-slate-50 text-sm border border-slate-200"
                        title={submission.status === 'evaluated' ? '보고서' : '학생글'}
                      >
                        보기
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
  );
}