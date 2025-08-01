'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { School, BookOpen, Calendar, Users, Copy, Eye, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SharedAssignment {
  id: string;
  title: string;
  schoolName: string;
  gradeLevel: string;
  writingType: string;
  evaluationDomains: string[];
  evaluationLevels: string[];
  levelCount: number;
  gradingCriteria: string;
  sharedAt: string;
  sharedBy: string;
  sharedByEmail?: string;
  copyCount: number;
  usageCount: number;
}

interface SharedAssignmentsListProps {
  assignments: SharedAssignment[];
  onCopyAssignment: (assignmentId: string) => void;
}

export function SharedAssignmentsList({ assignments, onCopyAssignment }: SharedAssignmentsListProps) {
  const router = useRouter();

  const handlePreview = (assignmentId: string) => {
    router.push(`/assignments/${assignmentId}/preview`);
  };

  if (assignments.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
        <CardContent className="py-12 text-center">
          <Globe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">공유된 과제 템플릿이 없습니다.</p>
          <p className="text-sm text-slate-500">다른 교사가 공유한 과제가 여기에 표시됩니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="glass card-hover border-2 border-blue-100">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                    {assignment.gradeLevel}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md">
                    {assignment.writingType}
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">
                  {assignment.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <School className="w-4 h-4" />
                  <span>{assignment.schoolName}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-medium">평가 영역:</span> {assignment.evaluationDomains.join(', ')}
              </p>
              <p className="text-sm text-slate-600 mb-2">
                <span className="font-medium">평가 수준:</span> {assignment.levelCount}단계
              </p>
            </div>
            
            <div className="space-y-2 text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>공유자: {assignment.sharedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(assignment.sharedAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Copy className="w-4 h-4" />
                <span>{assignment.copyCount > 0 ? `${assignment.copyCount}명이 사용중` : '아직 사용 기록 없음'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handlePreview(assignment.id)}
                className="w-full px-4 py-2.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-sm font-medium border border-slate-200"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </button>
              <button
                onClick={() => onCopyAssignment(assignment.id)}
                className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                내 과제로 복사
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}