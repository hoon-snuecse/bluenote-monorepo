// Types for the AI-based Writing Assessment System

// 평가 등급 타입
export type AchievementLevel = '매우 우수' | '우수' | '보통' | '미흡';

// 평가 영역 타입
export type EvaluationDomain = 
  | '주장의 명확성'
  | '근거의 타당성'
  | '논리적 구조'
  | '설득력 있는 표현';

// 영어 도메인 키 (내부 사용)
export type DomainKey = 'clarity' | 'validity' | 'structure' | 'expression';

// 도메인 매핑
export const DOMAIN_MAP: Record<DomainKey, EvaluationDomain> = {
  clarity: '주장의 명확성',
  validity: '근거의 타당성',
  structure: '논리적 구조',
  expression: '설득력 있는 표현'
};

// 학생 정보
export interface Student {
  id: string;
  name: string;
  class: string;
  studentNumber: string;
}

// 도메인별 평가 결과
export interface DomainEvaluation {
  domain: EvaluationDomain;
  level: AchievementLevel;
  score: number; // 0-100
  feedback: string;
  growthExample?: {
    before: string;
    after: string;
  };
}

// 전체 평가 결과
export interface EvaluationResult {
  id: string;
  student: Student;
  assignmentId: string;
  assignmentTitle: string;
  evaluatedAt: Date;
  overallLevel: AchievementLevel;
  overallScore: number; // 0-100
  holisticFeedback: string;
  domainEvaluations: Record<DomainKey, DomainEvaluation>;
  teacherComments?: string;
  aiModel?: string;
}

// 과제 정보
export interface Assignment {
  id: string;
  title: string;
  description: string;
  rubricId: string;
  createdAt: Date;
  dueDate?: Date;
}

// 루브릭 (평가 기준)
export interface Rubric {
  id: string;
  name: string;
  description: string;
  domains: {
    [K in DomainKey]: {
      weight: number; // 가중치 (합계 100)
      criteria: {
        [K in AchievementLevel]: string; // 각 등급별 설명
      };
    };
  };
}

// 학급 통계
export interface ClassStatistics {
  assignmentId: string;
  totalStudents: number;
  evaluatedStudents: number;
  averageScore: number;
  domainAverages: Record<DomainKey, number>;
  levelDistribution: Record<AchievementLevel, number>;
}

// 교사 대시보드 데이터
export interface TeacherDashboardData {
  assignment: Assignment;
  classStatistics: ClassStatistics;
  evaluationResults: EvaluationResult[];
}

// 정렬 옵션
export type SortField = 'name' | 'studentNumber' | 'overallLevel' | 'overallScore' | DomainKey;
export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

// 필터 옵션
export interface FilterConfig {
  levels?: AchievementLevel[];
  scoreRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
}

// Export 형식
export type ExportFormat = 'excel' | 'googleSheets' | 'pdf';

// 글 종류
export type WritingType = '논설문' | '성찰문' | '창의적 글쓰기' | '설명문' | '기타';

// 평가 단계 시스템
export type LevelSystem = 3 | 4;

// 체크리스트 항목
export interface ChecklistItem {
  id: string;
  question: string;
  weight?: number;
}

// 체크리스트 평가 결과
export interface ChecklistResult {
  itemId: string;
  satisfied: boolean;
  evidence?: string; // AI가 판단한 근거
}

// 영역별 체크리스트 설정
export interface DomainChecklist {
  name: string;
  weight: number; // 가중치 (%)
  checklist: ChecklistItem[];
  levelCriteria: {
    [level: string]: number; // 필요 충족 개수
  };
}

// 종합 평가 기준
export interface OverallCriteria {
  levels: {
    [level: string]: {
      name: string;
      minScore: number;
      maxScore: number;
    };
  };
}

// 평가 설정
export interface EvaluationSettings {
  writingType: WritingType;
  levelSystem: LevelSystem;
  domains: DomainChecklist[];
  overallCriteria: OverallCriteria;
}

// 개선 사항
export interface DomainImprovement {
  domain: string;
  currentLevel: string;
  missingCheckpoints: string[];
  specificExamples: {
    original: string; // 학생의 실제 문장
    improved: string; // 개선된 예시
    explanation: string; // 왜 이렇게 개선해야 하는지
  }[];
  practiceExercises: string[];
}

// 학생 피드백
export interface StudentFeedback {
  studentId: string;
  evaluationResult: EvaluationResult;
  improvements: DomainImprovement[];
  overallGuidance: string;
  nextSteps: string[];
}

// 체크리스트 기반 평가 결과
export interface ChecklistEvaluationResult {
  domainResults: {
    [domain: string]: {
      checkedItems: boolean[];
      checklistResults: ChecklistResult[];
      score: number;
      level: string;
    };
  };
  overallScore: number;
  overallLevel: string;
}

// 확장된 과제 정보
export interface ExtendedAssignment extends Assignment {
  evaluationSettings?: EvaluationSettings;
  aiGeneratedExamples?: {
    [level: string]: {
      [domain: string]: string;
    };
  };
}