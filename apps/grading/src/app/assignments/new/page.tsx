'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Check } from 'lucide-react';

type GradeLevel = '초등학교 3학년' | '초등학교 4학년' | '초등학교 5학년' | '초등학교 6학년';
type WritingType = '설명문' | '논설문' | '생활문' | '독서감상문' | '기행문';

export default function NewAssignmentPage() {
  const router = useRouter();
  
  // 글의 종류별 기본 평가 영역
  const defaultDomainsByType: Record<WritingType, string[]> = {
    '설명문': ['정보의 정확성', '논리적 구성', '이해하기 쉬운 설명'],
    '논설문': ['주장의 명확성', '근거의 타당성', '논리적 전개', '설득력 있는 표현'],
    '생활문': ['경험의 구체성', '감정 표현', '시간적 순서'],
    '독서감상문': ['책 내용 이해도', '개인적 감상', '비판적 사고'],
    '기행문': ['장소 묘사', '여행 경험', '생생한 표현'],
  };
  
  const [formData, setFormData] = useState({
    title: '',
    schoolName: '',
    gradeLevel: '초등학교 3학년' as GradeLevel,
    writingType: '설명문' as WritingType,
  });
  
  const [evaluationDomains, setEvaluationDomains] = useState<string[]>([...defaultDomainsByType['설명문'], '']);
  const [evaluationLevels, setEvaluationLevels] = useState<string[]>(['매우 우수', '우수', '보통', '미흡']);
  const [levelCount, setLevelCount] = useState<'3' | '4' | '5'>('4');
  const [gradingCriteria, setGradingCriteria] = useState('');
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  
  // 평가 수준 개수별 기본값
  const defaultLevelsByCount: Record<'3' | '4' | '5', string[]> = {
    '3': ['우수', '보통', '미흡'],
    '4': ['매우 우수', '우수', '보통', '미흡'],
    '5': ['매우 우수', '우수', '보통', '미흡', '매우 미흡'],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 프롬프트 파일로 저장할 데이터
    const assignmentData = {
      title: formData.title,
      schoolName: formData.schoolName,
      gradeLevel: formData.gradeLevel,
      writingType: formData.writingType,
      evaluationDomains: evaluationDomains.filter(d => d.trim()),
      evaluationLevels: evaluationLevels.filter(l => l.trim()),
      levelCount,
      gradingCriteria,
    };
    
    try {
      // API 호출하여 과제 생성 및 파일 저장
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Assignment creation error:', response.status, errorData);
        let errorMessage = `Failed to create assignment: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.error || errorMessage;
          if (errorJson.details) {
            console.error('Error details:', errorJson.details);
            errorMessage += `\n\n상세 정보: ${errorJson.details}`;
          }
        } catch (e) {
          // JSON 파싱 실패 시 원본 텍스트 사용
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Assignment creation result:', result);
      
      if (result.success) {
        // 성공 시 과제 목록 페이지로 이동
        router.push('/assignments');
      } else {
        const errorMessage = result.error || '과제 생성 중 오류가 발생했습니다.';
        console.error('Assignment creation failed:', result);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('과제 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '과제 생성 중 오류가 발생했습니다.';
      alert(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // 글의 종류가 변경되면 평가 영역을 자동으로 업데이트
    if (name === 'writingType') {
      const newDomains = [...defaultDomainsByType[value as WritingType], ''];
      setEvaluationDomains(newDomains);
    }
  };

  const updateDomain = (index: number, value: string) => {
    const newDomains = [...evaluationDomains];
    newDomains[index] = value;
    setEvaluationDomains(newDomains);
  };

  const addDomain = () => {
    setEvaluationDomains([...evaluationDomains, '']);
  };

  const removeDomain = (index: number) => {
    const newDomains = evaluationDomains.filter((_, i) => i !== index);
    setEvaluationDomains(newDomains);
  };

  const updateLevel = (index: number, value: string) => {
    const newLevels = [...evaluationLevels];
    newLevels[index] = value;
    setEvaluationLevels(newLevels);
  };

  const generateGradingCriteria = async () => {
    setIsGeneratingCriteria(true);
    
    // AI 프롬프트 생성 시뮬레이션
    const domains = evaluationDomains.filter(d => d.trim());
    
    // 글의 종류별 특성 정의
    const writingTypeCharacteristics = {
      '설명문': {
        focus: '정보 전달의 명확성과 이해의 용이성',
        keyElements: ['정보의 정확성', '논리적 구성', '객관적 설명', '이해하기 쉬운 표현'],
        specificCriteria: '대상에 대한 정확한 정보 제시, 체계적인 구성, 독자가 이해하기 쉬운 설명'
      },
      '논설문': {
        focus: '주장의 설득력과 논리적 전개',
        keyElements: ['명확한 주장', '타당한 근거', '논리적 전개', '반론 고려'],
        specificCriteria: '주장과 근거의 일관성, 논리적 구조, 설득력 있는 표현'
      },
      '생활문': {
        focus: '경험의 생생한 전달과 개인적 성찰',
        keyElements: ['구체적인 경험 서술', '감정 표현', '시간적 순서', '교훈이나 깨달음'],
        specificCriteria: '경험의 구체성, 감정의 진솔한 표현, 일상에서 얻은 의미 발견'
      },
      '독서감상문': {
        focus: '책 내용 이해와 개인적 해석',
        keyElements: ['책 내용 이해도', '개인적 감상', '비판적 사고', '자신의 삶과 연결'],
        specificCriteria: '책의 주제 파악, 인상 깊은 부분 설명, 개인적 의견과 감상'
      },
      '기행문': {
        focus: '여행 경험의 생동감 있는 전달',
        keyElements: ['장소의 생생한 묘사', '여행 경험', '문화적 이해', '개인적 감상'],
        specificCriteria: '장소와 풍경 묘사, 여행에서 얻은 경험과 감동, 생생한 표현력'
      }
    };
    
    const typeInfo = writingTypeCharacteristics[formData.writingType as keyof typeof writingTypeCharacteristics] || {
      focus: '글의 목적에 맞는 표현',
      keyElements: ['주제 표현', '구성', '표현력'],
      specificCriteria: '글의 목적에 맞는 내용 전개'
    };
    
    const prompt = `
${formData.schoolName} ${formData.gradeLevel} 학생을 위한 "${formData.title}" (${formData.writingType}) 과제 채점 기준

【${formData.writingType}의 핵심 평가 요소】
- 평가 중점: ${typeInfo.focus}
- 주요 요소: ${typeInfo.keyElements.join(', ')}
- 특별 고려사항: ${typeInfo.specificCriteria}

【평가 영역】
${domains.map((domain, idx) => `${idx + 1}. ${domain}`).join('\n')}

【평가 수준】
${evaluationLevels.filter(l => l.trim()).map((level, idx) => `${idx + 1}. ${level}`).join('\n')}

【종합 평가 기준】

${evaluationLevels.filter(l => l.trim()).map(level => {
  if (level === '매우 우수') return `▸ ${level}: 
  - ${formData.writingType}의 모든 핵심 요소를 완벽하게 충족
  - ${typeInfo.focus}에서 탁월한 성취를 보임
  - ${formData.gradeLevel} 수준을 뛰어넘는 ${typeInfo.keyElements[0]}과 ${typeInfo.keyElements[1]} 능력 발휘`;
  
  if (level === '우수') return `▸ ${level}:
  - ${formData.writingType}의 주요 특성을 잘 이해하고 표현
  - ${typeInfo.focus}에서 우수한 수준을 보임
  - ${formData.gradeLevel}에 적합한 ${typeInfo.keyElements[0]} 능력 보유`;
  
  if (level === '보통') return `▸ ${level}:
  - ${formData.writingType}의 기본 형식을 이해하고 있음
  - ${typeInfo.focus}에서 기본적인 수준 달성
  - 일부 ${typeInfo.keyElements.join(', ')} 영역에서 개선 필요`;
  
  if (level === '미흡') return `▸ ${level}:
  - ${formData.writingType}의 특성 이해가 부족함
  - ${typeInfo.focus}에서 추가 지도가 필요
  - ${typeInfo.keyElements.join(', ')} 전반에 걸쳐 기초 학습 필요`;
  
  return `▸ ${level}: ${formData.gradeLevel} 수준에 맞는 ${formData.writingType} 작성 능력을 보임`;
}).join('\n\n')}

【각 영역별 평가 기준】

${domains.map((domain, idx) => `
${idx + 1}. ${domain}
${evaluationLevels.filter(l => l.trim()).map(level => {
  // 영역별로 글의 종류 특성을 반영한 구체적 기준 제시
  const domainLower = domain.toLowerCase();
  let criteria = '';
  
  if (level === '매우 우수') {
    criteria = `${formData.writingType}에서 요구되는 ${domain} 능력을 탁월하게 발휘`;
    if (domainLower.includes('주장') || domainLower.includes('주제')) {
      criteria += `, ${formData.writingType === '논설문' ? '설득력 있는 주장과 논리적 근거 제시' : formData.writingType === '설명문' ? '명확하고 체계적인 정보 전달' : '주제를 효과적으로 표현'}`;
    }
  } else if (level === '우수') {
    criteria = `${domain}의 핵심 요소를 ${formData.writingType}에 맞게 잘 표현`;
  } else if (level === '보통') {
    criteria = `${domain}의 기본적인 내용은 이해하나 ${formData.writingType}의 특성에 맞는 표현력 향상 필요`;
  } else if (level === '미흡') {
    criteria = `${domain}에 대한 이해와 ${formData.writingType} 작성 기초 학습 필요`;
  } else {
    criteria = `${formData.gradeLevel} 수준에 맞는 ${domain} 능력을 보임`;
  }
  
  return `  ▸ ${level}: ${criteria}`;
}).join('\n')}
`).join('\n')}

【${formData.writingType} 평가 시 추가 고려사항】
${typeInfo.keyElements.map(element => `- ${element}: ${formData.writingType}에 적합한 ${element} 평가`).join('\n')}
- 맞춤법 및 문법의 정확성
- ${formData.gradeLevel} 학생의 발달 수준과 어휘력 고려
- ${formData.writingType}의 장르적 특성 이해도
    `.trim();
    
    setTimeout(() => {
      setGradingCriteria(prompt);
      setIsGeneratingCriteria(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
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

        {/* Form */}
        <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <CardTitle className="text-2xl text-center">평가 과제 만들기</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-2">
                  과제 제목
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full max-w-md px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                  placeholder="예: 나의 꿈 소개하기"
                />
              </div>

              {/* School Name and Grade Level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="max-w-sm">
                  <label htmlFor="schoolName" className="block text-base font-medium text-gray-700 mb-2">
                    학교 이름
                  </label>
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white text-sm"
                    placeholder="예: 서울초등학교"
                  />
                </div>
                <div>
                  <label htmlFor="gradeLevel" className="block text-base font-medium text-gray-700 mb-2">
                    대상 학년
                  </label>
                  <select
                    id="gradeLevel"
                    name="gradeLevel"
                    value={formData.gradeLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white active:bg-white bg-white text-sm appearance-none"
                  >
                    <option value="초등학교 3학년" className="bg-white">초등학교 3학년</option>
                    <option value="초등학교 4학년" className="bg-white">초등학교 4학년</option>
                    <option value="초등학교 5학년" className="bg-white">초등학교 5학년</option>
                    <option value="초등학교 6학년" className="bg-white">초등학교 6학년</option>
                  </select>
                </div>
              </div>

              {/* Writing Type */}
              <div className="max-w-xs">
                <label htmlFor="writingType" className="block text-base font-medium text-gray-700 mb-2">
                  글의 종류
                </label>
                <select
                  id="writingType"
                  name="writingType"
                  value={formData.writingType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white active:bg-white bg-white text-sm appearance-none"
                >
                  <option value="설명문" className="bg-white">설명문</option>
                  <option value="논설문" className="bg-white">논설문</option>
                  <option value="생활문" className="bg-white">생활문</option>
                  <option value="독서감상문" className="bg-white">독서감상문</option>
                  <option value="기행문" className="bg-white">기행문</option>
                </select>
              </div>

              {/* Evaluation Domains and Levels - 2 column layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Evaluation Domains */}
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    평가 영역
                  </label>
                  <div className="space-y-3">
                    {evaluationDomains.map((domain, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={domain}
                          onChange={(e) => updateDomain(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                          placeholder={`평가 영역 ${index + 1} (예: 주제 표현력)`}
                        />
                        {evaluationDomains.length > 1 && (
                          <span
                            onClick={() => removeDomain(index)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
                          >
                            ×
                          </span>
                        )}
                      </div>
                    ))}
                    <div
                      onClick={addDomain}
                      className="text-sm text-slate-700 hover:text-slate-900 cursor-pointer transition-colors py-2 font-medium"
                    >
                      + 평가 영역 추가
                    </div>
                  </div>
                </div>

                {/* Evaluation Levels */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <label className="block text-base font-medium text-gray-700">
                      평가 수준
                    </label>
                    <select
                      value={levelCount}
                      onChange={(e) => {
                        const count = e.target.value as '3' | '4' | '5';
                        setLevelCount(count);
                        setEvaluationLevels(defaultLevelsByCount[count]);
                      }}
                      className="px-3 py-1.5 pr-8 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white text-sm appearance-none"
                    >
                      <option value="3" className="bg-white">3단계</option>
                      <option value="4" className="bg-white">4단계</option>
                      <option value="5" className="bg-white">5단계</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    {evaluationLevels.map((level, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={level}
                          onChange={(e) => updateLevel(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base"
                          placeholder={`평가 수준 ${index + 1} (예: 매우 우수)`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grading Criteria */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="gradingCriteria" className="block text-base font-medium text-gray-700">
                    채점 기준 (프롬프트)
                  </label>
                  <span
                    onClick={() => {
                      if (formData.title && evaluationDomains.filter(d => d.trim()).length > 0 && !isGeneratingCriteria) {
                        generateGradingCriteria();
                      }
                    }}
                    className={`text-sm cursor-pointer transition-colors ${
                      !formData.title || evaluationDomains.filter(d => d.trim()).length === 0 || isGeneratingCriteria
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-blue-700 hover:text-blue-900 font-medium'
                    }`}
                  >
                    {isGeneratingCriteria ? '생성 중...' : '자동 생성'}
                  </span>
                </div>
                <textarea
                  id="gradingCriteria"
                  name="gradingCriteria"
                  value={gradingCriteria}
                  onChange={(e) => setGradingCriteria(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border border-slate-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/70 backdrop-blur-sm text-base resize-none font-mono text-sm"
                  placeholder="위의 정보를 입력하고 '채점 기준 생성' 버튼을 클릭하면 AI가 자동으로 채점 기준을 생성합니다."
                />
              </div>

              {/* Creation Date */}
              <div className="text-sm text-slate-600">
                <span className="font-medium">과제 생성일:</span> {new Date().toLocaleDateString('ko-KR')}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/assignments')}
                  className="px-6 py-3 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 text-base"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!formData.title || evaluationDomains.filter(d => d.trim()).length === 0 || !gradingCriteria}
                  className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-5 h-5" />
                  과제 생성
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}