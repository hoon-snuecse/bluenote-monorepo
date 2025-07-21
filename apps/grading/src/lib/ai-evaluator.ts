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
  private aiModel?: string;

  constructor(assignmentData?: any, aiModel?: string) {
    this.assignmentData = assignmentData;
    this.aiModel = aiModel;
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
        studentName: this.assignmentData?.studentName || '학생',
        temperature: this.assignmentData?.temperature || 0.1,
        aiModel: this.aiModel
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
    console.warn('⚠️ [Mock 처리: 주의] MockEvaluator 사용 중 - 실제 AI 평가가 아닙니다!');
    
    // 콘텐츠 기반 해시를 사용하여 일관된 결과 생성
    const textHash = content.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    
    const consistentRandom = (seed: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * max);
    };
    
    const domainEvaluations: Record<string, any> = {};
    let totalScore = 0;
    
    domains.forEach((domain, index) => {
      const domainSeed = textHash + index + domain.charCodeAt(0);
      const baseLevelIndex = Math.min(1, levels.length - 1); // 기본적으로 두 번째 레벨
      const variance = consistentRandom(domainSeed, 3) - 1; // -1, 0, 1 변동
      const levelIndex = Math.max(0, Math.min(levels.length - 1, baseLevelIndex + variance));
      const level = levels[levelIndex];
      const score = levels.length - levelIndex;
      
      domainEvaluations[domain] = {
        level,
        score,
        feedback: `[Mock 처리: 주의] ${domain}에 대한 평가: 학생의 글은 ${level} 수준을 보여주고 있습니다. 더 발전하기 위해서는 구체적인 예시를 추가하고 문장 구조를 다양화하면 좋겠습니다.`
      };
      
      totalScore += score;
    });
    
    const averageScore = totalScore / domains.length;
    const overallLevelIndex = Math.round(levels.length - averageScore);
    const overallLevel = levels[Math.max(0, Math.min(overallLevelIndex, levels.length - 1))];
    
    return {
      domainEvaluations,
      overallLevel,
      overallFeedback: `[Mock 처리: 주의] 이것은 실제 AI 평가가 아닌 테스트 결과입니다!\n\n전체적으로 ${overallLevel} 수준의 글쓰기 능력을 보여주고 있습니다. 주제를 명확하게 표현하려는 노력이 보이며, 자신의 생각을 전달하려는 의지가 느껴집니다. 앞으로도 꾸준히 글쓰기 연습을 하면 더욱 발전할 수 있을 것입니다.\n\n⚠️ [Mock 처리: 주의] 이 평가는 테스트용이므로 실제 평가 결과로 사용하지 마세요.`,
      improvementSuggestions: [
        '[Mock 처리: 주의] 문장과 문장 사이의 연결을 더 자연스럽게 만들어보세요.',
        '[Mock 처리: 주의] 구체적인 예시나 경험을 추가하면 글이 더 생생해집니다.',
        '[Mock 처리: 주의] 다양한 어휘를 사용하여 표현력을 높여보세요.'
      ],
      strengths: [
        '[Mock 처리: 주의] 주제에 맞는 내용을 일관성 있게 전개했습니다.',
        '[Mock 처리: 주의] 자신의 생각을 솔직하게 표현하려고 노력했습니다.'
      ]
    };
  }
}

// Factory function
export function createEvaluator(
  type: 'claude' | 'mock' = 'mock',
  _apiKey?: string,
  model?: string,
  assignmentData?: any
): AIEvaluator {
  if (type === 'claude') {
    return new ClaudeEvaluator(assignmentData, model);
  }
  return new MockEvaluator();
}