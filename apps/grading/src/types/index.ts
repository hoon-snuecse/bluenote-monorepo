export interface Assignment {
  id: string;
  title: string;
  schoolName: string;
  gradeLevel: string;
  writingType: string;
  evaluationDomains: string[];
  evaluationLevels: string[];
  levelCount: number;
  gradingCriteria: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  assignmentId: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  studentId: string;
  assignmentId: string;
  fileName: string;
  content: string;
  googleDriveFileId?: string;
  importedAt: Date;
  evaluationStatus: 'pending' | 'in_progress' | 'completed' | 'error';
}

export interface Evaluation {
  id: string;
  documentId: string;
  studentId: string;
  assignmentId: string;
  scores: {
    clarity: number;        // 주장의 명확성
    evidence: number;       // 근거의 타당성
    structure: number;      // 논리적 구조
    expression: number;     // 설득력 있는 표현
    overall: number;        // 종합 점수
  };
  grade: '매우 우수' | '우수' | '보통' | '미흡';
  feedback: {
    clarity: string;
    evidence: string;
    structure: string;
    expression: string;
    overall: string;
  };
  evaluatedAt: Date;
  evaluatedBy: 'AI' | 'teacher';
}

export interface Rubric {
  id: string;
  assignmentId: string;
  criteria: {
    clarity: {
      weight: number;
      description: string;
      levels: {
        excellent: string;
        good: string;
        fair: string;
        poor: string;
      };
    };
    evidence: {
      weight: number;
      description: string;
      levels: {
        excellent: string;
        good: string;
        fair: string;
        poor: string;
      };
    };
    structure: {
      weight: number;
      description: string;
      levels: {
        excellent: string;
        good: string;
        fair: string;
        poor: string;
      };
    };
    expression: {
      weight: number;
      description: string;
      levels: {
        excellent: string;
        good: string;
        fair: string;
        poor: string;
      };
    };
  };
}