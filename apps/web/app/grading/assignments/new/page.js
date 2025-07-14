'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';

export default function NewAssignmentPage() {
  const router = useRouter();
  
  // 글의 종류별 기본 평가 영역
  const defaultDomainsByType = {
    '설명문': ['정보의 정확성', '논리적 구성', '이해하기 쉬운 설명'],
    '논설문': ['주장의 명확성', '근거의 타당성', '논리적 전개', '설득력 있는 표현'],
    '생활문': ['경험의 구체성', '감정 표현', '시간적 순서'],
    '독서감상문': ['책 내용 이해도', '개인적 감상', '비판적 사고'],
    '기행문': ['장소 묘사', '여행 경험', '생생한 표현'],
  };
  
  const [formData, setFormData] = useState({
    title: '',
    schoolName: '',
    gradeLevel: '초등학교 3학년',
    writingType: '설명문',
  });
  
  const [evaluationDomains, setEvaluationDomains] = useState([...defaultDomainsByType['설명문'], '']);
  const [evaluationLevels, setEvaluationLevels] = useState(['매우 우수', '우수', '보통', '미흡']);
  const [levelCount, setLevelCount] = useState('4');
  const [gradingCriteria, setGradingCriteria] = useState('');
  
  // 평가 수준 개수별 기본값
  const defaultLevelsByCount = {
    '3': ['우수', '보통', '미흡'],
    '4': ['매우 우수', '우수', '보통', '미흡'],
    '5': ['매우 우수', '우수', '보통', '미흡', '매우 미흡'],
  };

  const handleSubmit = async (e) => {
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
      const response = await fetch('/api/grading/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 성공 시 과제 목록 페이지로 이동
        router.push('/grading/assignments');
      } else {
        console.error('Assignment creation error:', result);
        alert(`과제 생성 중 오류가 발생했습니다.\n\n${result.error}\n${result.details || ''}\n${result.hint || ''}`);
      }
    } catch (error) {
      console.error('과제 생성 오류:', error);
      alert('과제 생성 중 오류가 발생했습니다.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // 글의 종류가 변경되면 평가 영역을 자동으로 업데이트
    if (name === 'writingType') {
      const newDomains = [...defaultDomainsByType[value], ''];
      setEvaluationDomains(newDomains);
    }
  };

  const updateDomain = (index, value) => {
    const newDomains = [...evaluationDomains];
    newDomains[index] = value;
    setEvaluationDomains(newDomains);
  };

  const addDomain = () => {
    setEvaluationDomains([...evaluationDomains, '']);
  };

  const removeDomain = (index) => {
    setEvaluationDomains(evaluationDomains.filter((_, i) => i !== index));
  };

  const updateLevel = (index, value) => {
    const newLevels = [...evaluationLevels];
    newLevels[index] = value;
    setEvaluationLevels(newLevels);
  };

  const handleLevelCountChange = (count) => {
    setLevelCount(count);
    setEvaluationLevels(defaultLevelsByCount[count]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-slate-50 to-purple-50/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            뒤로 가기
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-lg shadow-lg">
          <div className="p-6 border-b border-slate-200/50">
            <h1 className="text-2xl font-bold text-slate-800">새 과제 만들기</h1>
            <p className="text-slate-600 mt-1">평가할 글쓰기 과제의 정보를 입력하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                과제 제목
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="예: 2024 1학기 논설문 쓰기"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  학교명
                </label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  required
                  placeholder="예: 서울초등학교"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  학년
                </label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="초등학교 3학년">초등학교 3학년</option>
                  <option value="초등학교 4학년">초등학교 4학년</option>
                  <option value="초등학교 5학년">초등학교 5학년</option>
                  <option value="초등학교 6학년">초등학교 6학년</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                글의 종류
              </label>
              <select
                name="writingType"
                value={formData.writingType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="설명문">설명문</option>
                <option value="논설문">논설문</option>
                <option value="생활문">생활문</option>
                <option value="독서감상문">독서감상문</option>
                <option value="기행문">기행문</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                평가 영역
              </label>
              <div className="space-y-2">
                {evaluationDomains.map((domain, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => updateDomain(index, e.target.value)}
                      placeholder={`평가 영역 ${index + 1}`}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {evaluationDomains.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDomain(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDomain}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  평가 영역 추가
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                평가 수준 개수
              </label>
              <div className="flex gap-4">
                {['3', '4', '5'].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => handleLevelCountChange(count)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      levelCount === count
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {count}단계
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                평가 수준 명칭
              </label>
              <div className="space-y-2">
                {evaluationLevels.map((level, index) => (
                  <input
                    key={index}
                    type="text"
                    value={level}
                    onChange={(e) => updateLevel(index, e.target.value)}
                    placeholder={`수준 ${index + 1}`}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                평가 기준 및 추가 정보
              </label>
              <textarea
                name="gradingCriteria"
                value={gradingCriteria}
                onChange={(e) => setGradingCriteria(e.target.value)}
                placeholder="평가에 필요한 추가 기준이나 정보를 입력하세요..."
                rows={4}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200/50">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                과제 생성
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}