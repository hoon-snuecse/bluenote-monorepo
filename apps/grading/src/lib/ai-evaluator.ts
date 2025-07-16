import { evaluateWithClaude, EvaluationResult as ClaudeEvaluationResult } from './claude-api';

export interface EvaluationResult {
  domainEvaluations: Record<string, {
    level: string;
    feedback: string;
    score: number;
  }>;
  overallLevel: string;
  overallFeedback: string;
  improvementSuggestions: string[];
  strengths: string[];
}

export interface AIEvaluator {
  evaluate(
    content: string, 
    criteria: string, 
    domains: string[], 
    levels: string[]
  ): Promise<EvaluationResult>;
}

// Claude API 평가기 구현
export class ClaudeEvaluator implements AIEvaluator {
  private assignmentData: any;

  constructor(assignmentData?: any) {
    this.assignmentData = assignmentData;
  }

  async evaluate(
    content: string, 
    criteria: string, 
    domains: string[], 
    levels: string[]
  ): Promise<EvaluationResult> {
    try {
      // Claude API 호출
      const claudeResult = await evaluateWithClaude({
        assignmentTitle: this.assignmentData?.title || '글쓰기 과제',
        schoolName: this.assignmentData?.schoolName || '한국초등학교',
        grade: this.assignmentData?.grade || '초등학교',
        writingType: this.assignmentData?.writingType || '논설문',
        evaluationDomains: domains,
        evaluationLevels: levels,
        levelCount: levels.length,
        evaluationPrompt: criteria,
        studentText: content,
        studentName: this.assignmentData?.studentName || '학생'
      });

      // Claude API 결과를 기존 형식으로 변환
      const domainEvaluations: Record<string, any> = {};
      
      domains.forEach((domain) => {
        const levelIndex = levels.indexOf(claudeResult.domainGrades[domain]);
        domainEvaluations[domain] = {
          level: claudeResult.domainGrades[domain],
          score: levels.length - levelIndex,
          feedback: `${domain}에 대한 평가: ${claudeResult.domainGrades[domain]} 수준을 보여주고 있습니다.`
        };
      });

      return {
        domainEvaluations,
        overallLevel: claudeResult.overallGrade,
        overallFeedback: claudeResult.detailedFeedback,
        improvementSuggestions: claudeResult.improvements,
        strengths: claudeResult.strengths
      };
    } catch (error) {
      console.error('Claude API 호출 오류:', error);
      // 오류 시 Mock 데이터 반환
      return new MockEvaluator().evaluate(content, criteria, domains, levels);
    }
  }
}

// Mock 평가기 (개발/테스트용)
export class MockEvaluator implements AIEvaluator {
  async evaluate(
    content: string, 
    criteria: string, 
    domains: string[], 
    levels: string[]
  ): Promise<EvaluationResult> {
    // 실제 구현에서는 Claude API를 사용
    const domainEvaluations: Record<string, any> = {};
    
    domains.forEach((domain, index) => {
      const randomLevelIndex = Math.floor(Math.random() * levels.length);
      const level = levels[randomLevelIndex];
      
      domainEvaluations[domain] = {
        level,
        score: levels.length - randomLevelIndex,
        feedback: `${domain}에 대한 평가: 학생의 글은 ${level} 수준을 보여주고 있습니다. 더 발전하기 위해서는 구체적인 예시를 추가하고 문장 구조를 다양화하면 좋겠습니다.`
      };
    });
    
    const averageScore = Object.values(domainEvaluations).reduce((sum, score) => sum + score.score, 0) / domains.length;
    const overallLevelIndex = Math.round(levels.length - averageScore);
    const overallLevel = levels[Math.max(0, Math.min(overallLevelIndex, levels.length - 1))];
    
    return {
      domainEvaluations,
      overallLevel,
      overallFeedback: `전체적으로 ${overallLevel} 수준의 글쓰기 능력을 보여주고 있습니다. 주제를 명확하게 표현하려는 노력이 보이며, 자신의 생각을 전달하려는 의지가 느껴집니다. 앞으로도 꾸준히 글쓰기 연습을 하면 더욱 발전할 수 있을 것입니다.`,
      improvementSuggestions: [
        '문장과 문장 사이의 연결을 더 자연스럽게 만들어보세요.',
        '구체적인 예시나 경험을 추가하면 글이 더 생생해집니다.',
        '다양한 어휘를 사용하여 표현력을 높여보세요.'
      ],
      strengths: [
        '주제에 맞는 내용을 일관성 있게 전개했습니다.',
        '자신의 생각을 솔직하게 표현하려고 노력했습니다.'
      ]
    };
  }
}

// Factory function
export function createEvaluator(
  type: 'claude' | 'mock' = 'mock',
  apiKey?: string,
  model?: 'claude-3-sonnet' | 'claude-3-opus',
  assignmentData?: any
): AIEvaluator {
  if (type === 'claude') {
    return new ClaudeEvaluator(assignmentData);
  }
  return new MockEvaluator();
}