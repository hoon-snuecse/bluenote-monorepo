// Mock data for development and testing

import type { 
  Student, 
  EvaluationResult, 
  Assignment, 
  Rubric, 
  TeacherDashboardData,
  DomainKey,
  AchievementLevel 
} from '@/types/grading';
import { DOMAIN_MAP } from '@/types/grading';

// Sample students
export const mockStudents: Student[] = [
  { id: '1', name: '김민준', class: '2-3', studentNumber: '20240301' },
  { id: '2', name: '박진서', class: '2-3', studentNumber: '20240302' },
  { id: '3', name: '이서연', class: '2-3', studentNumber: '20240303' },
  { id: '4', name: '최지우', class: '2-3', studentNumber: '20240304' },
  { id: '5', name: '정하은', class: '2-3', studentNumber: '20240305' },
  { id: '6', name: '강민호', class: '2-3', studentNumber: '20240306' },
  { id: '7', name: '손예진', class: '2-3', studentNumber: '20240307' },
  { id: '8', name: '윤서준', class: '2-3', studentNumber: '20240308' },
  { id: '9', name: '임채원', class: '2-3', studentNumber: '20240309' },
  { id: '10', name: '황도현', class: '2-3', studentNumber: '20240310' },
];

// Sample assignment
export const mockAssignment: Assignment = {
  id: 'assignment-1',
  title: '설득하는 글쓰기 - 환경 보호의 중요성',
  description: '환경 보호의 필요성에 대해 독자를 설득하는 글을 작성하세요.',
  rubricId: 'rubric-1',
  createdAt: new Date('2024-03-01'),
  dueDate: new Date('2024-03-15'),
};

// Sample rubric
export const mockRubric: Rubric = {
  id: 'rubric-1',
  name: '논설문 평가 루브릭',
  description: '중학교 논설문 작성 능력 평가',
  domains: {
    clarity: {
      weight: 25,
      criteria: {
        '매우 우수': '주장이 명확하고 일관되며, 독자가 쉽게 이해할 수 있도록 체계적으로 제시됨',
        '우수': '주장이 대체로 명확하며, 전반적으로 일관성 있게 제시됨',
        '보통': '주장이 있으나 부분적으로 불명확하거나 일관성이 부족함',
        '미흡': '주장이 불명확하거나 일관성이 현저히 부족함'
      }
    },
    validity: {
      weight: 25,
      criteria: {
        '매우 우수': '타당하고 구체적인 근거를 충분히 제시하여 주장을 효과적으로 뒷받침함',
        '우수': '적절한 근거를 제시하여 주장을 뒷받침함',
        '보통': '근거를 제시하나 일부는 타당성이 부족하거나 구체성이 떨어짐',
        '미흡': '근거가 부족하거나 타당성이 현저히 떨어짐'
      }
    },
    structure: {
      weight: 25,
      criteria: {
        '매우 우수': '서론-본론-결론의 구조가 체계적이며, 단락 간 연결이 자연스러움',
        '우수': '전체적인 구조가 잘 갖춰져 있고, 논리적 흐름이 적절함',
        '보통': '기본적인 구조는 갖추었으나 일부 논리적 비약이나 연결 부족이 있음',
        '미흡': '구조가 체계적이지 못하고 논리적 흐름이 부족함'
      }
    },
    expression: {
      weight: 25,
      criteria: {
        '매우 우수': '다양한 어휘와 문장 구조를 활용하여 설득력 있게 표현함',
        '우수': '적절한 어휘와 문장을 사용하여 효과적으로 표현함',
        '보통': '기본적인 표현은 적절하나 다양성이나 설득력이 부족함',
        '미흡': '표현이 단조롭거나 부적절하여 설득력이 떨어짐'
      }
    }
  }
};

// Growth examples for each domain
const growthExamples = {
  clarity: {
    '미흡': {
      before: '환경 보호는 중요합니다. 지구가 더워지고 있습니다. 쓰레기도 많습니다. 그래서 환경을 보호해야 합니다.',
      after: '지구 온난화와 환경 오염이 심각해지고 있는 현재, 환경 보호는 우리 모두의 생존과 직결된 문제입니다. 따라서 개인과 사회가 함께 환경 보호에 적극적으로 참여해야 합니다.'
    },
    '보통': {
      before: '환경 보호는 중요한 문제입니다. 왜냐하면 지구 온난화가 진행되고 있고, 많은 동물들이 멸종 위기에 처해 있기 때문입니다.',
      after: '환경 보호는 인류의 지속 가능한 미래를 위해 반드시 해결해야 할 시급한 과제입니다. 지구 온난화로 인한 기후 위기와 생물 다양성 감소는 우리의 삶을 직접적으로 위협하고 있기 때문입니다.'
    },
    '우수': {
      before: '환경 보호는 현대 사회의 중요한 과제입니다. 기후 변화와 환경 오염으로 인해 우리의 삶이 위협받고 있습니다.',
      after: '21세기 인류가 직면한 가장 시급한 과제는 환경 보호입니다. 급속한 산업화로 인한 기후 위기는 단순한 환경 문제를 넘어 경제, 사회, 건강 등 우리 삶의 모든 영역을 위협하는 복합적 위기로 발전했습니다.'
    }
  },
  validity: {
    '미흡': {
      before: '플라스틱을 사용하면 안 됩니다. 플라스틱은 환경에 나쁘기 때문입니다. 많은 사람들이 플라스틱은 나쁘다고 말합니다.',
      after: '플라스틱 사용을 줄여야 합니다. 실제로 태평양에는 한반도 면적의 7배에 달하는 플라스틱 쓰레기 섬이 형성되어 있으며, 매년 800만 톤의 플라스틱이 바다로 유입되어 해양 생태계를 파괴하고 있습니다.'
    },
    '보통': {
      before: '재활용을 해야 합니다. 재활용을 하면 쓰레기가 줄어들고 자원을 절약할 수 있습니다. 많은 나라들이 재활용을 하고 있습니다.',
      after: '재활용은 환경 보호의 핵심 실천 방안입니다. 환경부 통계에 따르면, 재활용을 통해 연간 약 1,400만 톤의 온실가스 감축 효과를 얻을 수 있으며, 이는 자동차 600만 대가 1년간 배출하는 양과 맞먹습니다.'
    },
    '우수': {
      before: '친환경 에너지 사용이 증가하고 있습니다. 태양광과 풍력 발전이 대표적인 예입니다. 이러한 에너지는 환경에 좋습니다.',
      after: '재생 에너지로의 전환은 기후 위기 대응의 핵심입니다. 국제에너지기구(IEA) 보고서에 따르면, 2023년 전 세계 재생 에너지 발전량이 50% 증가했으며, 이를 통해 약 20억 톤의 CO2 배출을 방지했습니다. 특히 덴마크는 풍력 발전으로 전체 전력의 80%를 충당하며 탄소 중립의 모범 사례를 보여주고 있습니다.'
    }
  },
  structure: {
    '미흡': {
      before: '환경이 중요합니다. 플라스틱을 줄여야 합니다. 그리고 나무도 심어야 합니다. 재활용도 중요합니다. 정부가 노력해야 합니다. 우리도 노력해야 합니다.',
      after: '서론: 환경 보호는 현재 인류가 직면한 가장 시급한 과제입니다.\n\n본론1: 첫째, 일상생활에서 플라스틱 사용을 줄여야 합니다.\n본론2: 둘째, 재활용을 생활화하여 자원 순환에 기여해야 합니다.\n본론3: 셋째, 정부와 시민이 협력하여 친환경 정책을 추진해야 합니다.\n\n결론: 따라서 환경 보호는 개인의 실천과 사회적 노력이 함께할 때 실현될 수 있습니다.'
    },
    '보통': {
      before: '환경 보호가 중요한 이유는 다양합니다. 먼저 기후 변화 문제가 있습니다. 또한 자원 고갈 문제도 심각합니다. 이를 해결하기 위해 우리가 할 수 있는 일들이 있습니다.',
      after: '현대 사회에서 환경 보호가 시급한 과제로 대두되는 이유는 크게 세 가지입니다.\n\n첫째, 기후 변화가 인류의 생존을 직접적으로 위협하고 있습니다. 지구 평균 기온 상승으로 인한 자연재해가 빈번해지고 있으며...\n\n둘째, 한정된 자원의 고갈이 가속화되고 있습니다. 특히 화석 연료의 무분별한 사용은...\n\n이러한 문제들을 해결하기 위해서는 개인적 차원과 사회적 차원의 노력이 병행되어야 합니다.'
    },
    '우수': {
      before: '서론에서는 환경 문제의 심각성을 제시하고, 본론에서는 구체적인 해결 방안을 논의하며, 결론에서는 실천의 중요성을 강조하겠습니다.',
      after: '오늘날 우리는 "환경 위기의 시대"를 살고 있습니다. 북극의 빙하가 녹아내리고, 아마존의 열대우림이 불타며, 미세먼지가 일상을 위협하는 현실은 더 이상 먼 미래의 일이 아닙니다.\n\n이러한 위기를 극복하기 위한 첫 번째 방안은 에너지 전환입니다. 화석 연료 중심의 에너지 체계를 재생 가능 에너지로 전환함으로써... (구체적 논증 전개)\n\n두 번째 방안은 순환 경제 시스템의 구축입니다. 생산-소비-폐기의 선형 구조를 생산-소비-재활용의 순환 구조로... (논리적 연결)\n\n결론적으로, 환경 보호는 선택이 아닌 필수입니다. 개인의 작은 실천이 모여 큰 변화를 만들 수 있다는 믿음으로...'
    }
  },
  expression: {
    '미흡': {
      before: '환경이 나빠지고 있다. 사람들이 쓰레기를 많이 버린다. 공장에서 나쁜 것들이 나온다. 이것은 큰 문제다.',
      after: '지구 환경이 급속도로 악화되고 있다. 무분별한 소비 문화로 인해 쓰레기가 넘쳐나고, 산업 시설에서 배출되는 오염 물질이 대기와 수질을 오염시키고 있다. 이는 우리 모두의 생존을 위협하는 심각한 문제이다.'
    },
    '보통': {
      before: '환경 보호를 위해 우리는 노력해야 한다. 재활용을 하고, 대중교통을 이용하며, 에너지를 절약하는 것이 중요하다.',
      after: '푸른 지구를 후손에게 물려주기 위해, 우리는 일상 속 작은 실천부터 시작해야 한다. 분리수거를 생활화하고, 자가용 대신 대중교통을 선택하며, 불필요한 전력 소비를 줄이는 것—이 모든 행동이 모여 거대한 변화의 물결을 만들어낸다.'
    },
    '우수': {
      before: '기후 변화는 전 지구적 문제이며, 국제적 협력이 필요하다. 각국은 탄소 배출을 줄이고 친환경 정책을 추진해야 한다.',
      after: '기후 위기는 국경을 초월하는 인류 공동의 도전 과제다. 마치 거대한 도미노처럼, 한 지역의 환경 파괴는 연쇄적으로 전 지구에 영향을 미친다. 이에 국제 사회는 "함께 행동하지 않으면 함께 멸망한다"는 절박한 인식 아래, 탄소 중립이라는 공동의 목표를 향해 전진해야 한다.'
    }
  }
};

// Generate random evaluation data
function generateEvaluationResult(student: Student, index: number): EvaluationResult {
  const levels: AchievementLevel[] = ['매우 우수', '우수', '보통', '미흡'];
  const domainKeys: DomainKey[] = ['clarity', 'validity', 'structure', 'expression'];
  
  // Create varied but realistic distribution
  const baseLevel = index < 3 ? 0 : index < 6 ? 1 : index < 9 ? 2 : 3;
  
  const domainEvaluations = {} as EvaluationResult['domainEvaluations'];
  let totalScore = 0;
  
  domainKeys.forEach((key) => {
    const levelIndex = Math.max(0, Math.min(3, baseLevel + Math.floor(Math.random() * 2 - 0.5)));
    const level = levels[levelIndex];
    const score = 100 - (levelIndex * 25) + Math.floor(Math.random() * 10);
    
    totalScore += score * 0.25;
    
    // Generate specific feedback for each domain
    let feedback = '';
    if (key === 'clarity') {
      feedback = level === '매우 우수' 
        ? '주장이 매우 명확하고 일관되게 제시되어 있습니다. 독자가 글의 핵심 메시지를 즉시 이해할 수 있도록 체계적으로 구성되어 있습니다.'
        : level === '우수'
        ? '주장이 명확하게 드러나 있으며, 전반적으로 일관성을 유지하고 있습니다. 다만 일부 문단에서 좀 더 명료한 표현이 필요합니다.'
        : level === '보통'
        ? '기본적인 주장은 제시되어 있으나, 부분적으로 불명확하거나 일관성이 부족한 부분이 있습니다. 핵심 주장을 더 강조할 필요가 있습니다.'
        : '주장이 불명확하고 글 전체에서 일관된 논지를 찾기 어렵습니다. 무엇을 주장하고자 하는지 명확히 정리할 필요가 있습니다.';
    } else if (key === 'validity') {
      feedback = level === '매우 우수'
        ? '구체적이고 신뢰할 수 있는 근거를 충분히 제시하여 주장을 효과적으로 뒷받침하고 있습니다. 통계 자료와 실제 사례가 적절히 활용되었습니다.'
        : level === '우수'
        ? '적절한 근거를 제시하여 주장을 뒷받침하고 있습니다. 더 구체적인 수치나 사례를 추가하면 설득력이 높아질 것입니다.'
        : level === '보통'
        ? '근거를 제시하고 있으나 일부는 타당성이 부족하거나 구체성이 떨어집니다. 신뢰할 수 있는 출처의 자료를 더 활용해 보세요.'
        : '근거가 부족하거나 주장과의 연관성이 약합니다. 주장을 뒷받침할 수 있는 구체적이고 타당한 근거를 제시해야 합니다.';
    } else if (key === 'structure') {
      feedback = level === '매우 우수'
        ? '서론-본론-결론의 구조가 매우 체계적이며, 단락 간 연결이 자연스럽습니다. 논리적 흐름이 뛰어나 독자가 쉽게 따라갈 수 있습니다.'
        : level === '우수'
        ? '전체적인 구조가 잘 갖춰져 있고 논리적 흐름이 적절합니다. 일부 단락 간 연결을 더 매끄럽게 다듬으면 좋겠습니다.'
        : level === '보통'
        ? '기본적인 구조는 갖추었으나 일부 논리적 비약이나 연결 부족이 있습니다. 각 단락의 역할을 명확히 하고 연결 어구를 활용해 보세요.'
        : '구조가 체계적이지 못하고 논리적 흐름이 부족합니다. 서론-본론-결론의 기본 구조를 명확히 하고, 각 부분의 역할을 분명히 해야 합니다.';
    } else if (key === 'expression') {
      feedback = level === '매우 우수'
        ? '다양하고 풍부한 어휘와 문장 구조를 활용하여 매우 설득력 있게 표현하고 있습니다. 비유와 강조 표현이 효과적으로 사용되었습니다.'
        : level === '우수'
        ? '적절한 어휘와 문장을 사용하여 효과적으로 표현하고 있습니다. 좀 더 다양한 수사법을 활용하면 글의 완성도가 높아질 것입니다.'
        : level === '보통'
        ? '기본적인 표현은 적절하나 다양성이나 설득력이 부족합니다. 동일한 표현의 반복을 피하고 다양한 어휘를 활용해 보세요.'
        : '표현이 단조롭고 어휘 선택이 부적절한 경우가 있습니다. 다양한 어휘와 문장 구조를 학습하여 표현력을 향상시킬 필요가 있습니다.';
    }
    
    domainEvaluations[key] = {
      domain: DOMAIN_MAP[key],
      level,
      score,
      feedback,
      growthExample: level !== '매우 우수' ? growthExamples[key][level] : undefined
    };
  });
  
  const overallScore = Math.round(totalScore);
  const overallLevel = overallScore >= 85 ? '매우 우수' : overallScore >= 70 ? '우수' : overallScore >= 55 ? '보통' : '미흡';
  
  // Generate comprehensive holistic feedback
  let holisticFeedback = '';
  if (overallLevel === '매우 우수') {
    holisticFeedback = `${student.name} 학생은 논설문 작성에서 매우 우수한 능력을 보여주었습니다. 명확한 주장과 타당한 근거, 체계적인 구조, 설득력 있는 표현이 조화롭게 어우러져 완성도 높은 글을 작성했습니다. 이러한 수준을 유지하면서도 더 깊이 있는 사고와 창의적인 관점을 개발해 나가기를 권합니다.`;
  } else if (overallLevel === '우수') {
    holisticFeedback = `${student.name} 학생은 전반적으로 우수한 논설문 작성 능력을 보여주었습니다. 주장이 명확하고 적절한 근거를 제시하고 있으며, 글의 구조도 안정적입니다. 더 다양한 근거와 풍부한 표현을 활용한다면 한 단계 더 발전할 수 있을 것입니다.`;
  } else if (overallLevel === '보통') {
    holisticFeedback = `${student.name} 학생은 기본적인 논설문 작성 능력을 갖추고 있습니다. 주장과 근거를 제시하려는 노력이 보이지만, 명확성과 설득력 면에서 개선이 필요합니다. 제시된 개선 예시를 참고하여 꾸준히 연습한다면 충분히 향상될 수 있습니다.`;
  } else {
    holisticFeedback = `${student.name} 학생은 논설문 작성의 기초를 다질 필요가 있습니다. 먼저 명확한 주장을 세우는 연습부터 시작하고, 이를 뒷받침할 구체적인 근거를 찾는 방법을 익혀야 합니다. 제시된 개선 예시를 통해 좋은 글의 특징을 이해하고 단계적으로 실력을 향상시켜 나가기를 바랍니다.`;
  }
  
  return {
    id: `eval-${student.id}`,
    student,
    assignmentId: mockAssignment.id,
    assignmentTitle: mockAssignment.title,
    evaluatedAt: new Date(),
    overallLevel,
    overallScore,
    holisticFeedback,
    domainEvaluations,
    aiModel: 'GPT-4'
  };
}

// Generate mock evaluation results for all students
export const mockEvaluationResults: EvaluationResult[] = mockStudents.map((student, index) => 
  generateEvaluationResult(student, index)
);

// Calculate class statistics
export const mockClassStatistics = {
  assignmentId: mockAssignment.id,
  totalStudents: mockStudents.length,
  evaluatedStudents: mockEvaluationResults.length,
  averageScore: Math.round(
    mockEvaluationResults.reduce((sum, result) => sum + result.overallScore, 0) / mockEvaluationResults.length
  ),
  domainAverages: {
    clarity: Math.round(
      mockEvaluationResults.reduce((sum, result) => sum + result.domainEvaluations.clarity.score, 0) / mockEvaluationResults.length
    ),
    validity: Math.round(
      mockEvaluationResults.reduce((sum, result) => sum + result.domainEvaluations.validity.score, 0) / mockEvaluationResults.length
    ),
    structure: Math.round(
      mockEvaluationResults.reduce((sum, result) => sum + result.domainEvaluations.structure.score, 0) / mockEvaluationResults.length
    ),
    expression: Math.round(
      mockEvaluationResults.reduce((sum, result) => sum + result.domainEvaluations.expression.score, 0) / mockEvaluationResults.length
    ),
  },
  levelDistribution: mockEvaluationResults.reduce((acc, result) => {
    acc[result.overallLevel] = (acc[result.overallLevel] || 0) + 1;
    return acc;
  }, {} as Record<AchievementLevel, number>)
};

// Complete teacher dashboard data
export const mockTeacherDashboardData: TeacherDashboardData = {
  assignment: mockAssignment,
  classStatistics: mockClassStatistics,
  evaluationResults: mockEvaluationResults
};