'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { Sparkles, RefreshCw, Check, Edit2 } from 'lucide-react';
import type { DomainChecklist, LevelSystem, WritingType } from '@/types/grading';

interface AIExampleGeneratorProps {
  writingType: WritingType;
  levelSystem: LevelSystem;
  domains: DomainChecklist[];
  assignmentTitle: string;
  assignmentDescription: string;
  onComplete: (examples: Record<string, Record<string, string>>) => void;
}

export default function AIExampleGenerator({
  writingType,
  levelSystem,
  domains,
  assignmentTitle,
  assignmentDescription,
  onComplete,
}: AIExampleGeneratorProps) {
  const getLevelNames = () => {
    return levelSystem === 4
      ? ['매우 우수', '우수', '보통', '미흡']
      : ['우수', '보통', '미흡'];
  };

  const levels = getLevelNames();
  
  // 각 수준별, 영역별 예시 답안 상태
  const [examples, setExamples] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    levels.forEach(level => {
      initial[level] = {};
      domains.forEach(domain => {
        initial[level][domain.name] = generateInitialExample(level, domain, writingType);
      });
    });
    return initial;
  });

  const [editingCell, setEditingCell] = useState<{ level: string; domain: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  function generateInitialExample(level: string, domain: DomainChecklist, writingType: WritingType): string {
    // 실제 구현에서는 AI API를 호출하여 예시 생성
    // 여기서는 모의 예시를 반환
    const examples: Record<string, Record<string, Record<string, string>>> = {
      '논설문': {
        '주장의 명확성': {
          '매우 우수': '환경 보호는 현대 사회가 직면한 가장 시급한 과제이며, 개인의 작은 실천부터 국가적 정책까지 모든 수준에서의 즉각적인 행동이 필요합니다.',
          '우수': '환경 보호는 중요한 사회적 과제이며, 우리 모두가 일상에서 실천해야 합니다.',
          '보통': '환경 보호는 중요합니다. 우리가 노력해야 하는 문제입니다.',
          '미흡': '환경이 중요하다고 생각합니다. 사람들이 관심을 가져야 합니다.',
        },
        '근거의 타당성': {
          '매우 우수': 'IPCC 2023년 보고서에 따르면, 지구 평균 기온이 산업화 이전 대비 1.1도 상승했으며, 2030년까지 1.5도 상승을 막지 못하면 돌이킬 수 없는 생태계 붕괴가 시작됩니다.',
          '우수': '최근 연구에 따르면 지구 온난화로 인해 북극 빙하가 급속히 녹고 있으며, 이로 인한 해수면 상승이 관측되고 있습니다.',
          '보통': '많은 과학자들이 지구 온난화의 위험성을 경고하고 있습니다. 기후 변화의 영향이 나타나고 있습니다.',
          '미흡': '날씨가 이상해지고 있습니다. 여름이 더 덥고 겨울이 따뜻해졌습니다.',
        },
      },
    };

    return examples[writingType]?.[domain.name]?.[level] || 
           `${writingType}의 ${domain.name} 영역에서 ${level} 수준의 예시 문장입니다.`;
  }

  const regenerateExample = async (level: string, domainName: string) => {
    setIsGenerating(`${level}-${domainName}`);
    
    // 실제 구현에서는 AI API 호출
    setTimeout(() => {
      const domain = domains.find(d => d.name === domainName)!;
      const newExample = generateInitialExample(level, domain, writingType) + ' (재생성됨)';
      
      setExamples(prev => ({
        ...prev,
        [level]: {
          ...prev[level],
          [domainName]: newExample,
        },
      }));
      
      setIsGenerating(null);
    }, 1000);
  };

  const updateExample = (level: string, domainName: string, value: string) => {
    setExamples(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [domainName]: value,
      },
    }));
  };

  const handleCellClick = (level: string, domain: string) => {
    setEditingCell({ level, domain });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            AI 예시 답안 생성
          </CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            각 평가 영역과 수준에 맞는 예시 답안을 AI가 생성합니다. 필요시 수정하거나 재생성할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50/50 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">과제 정보</h4>
            <p className="text-sm text-slate-700"><strong>제목:</strong> {assignmentTitle}</p>
            <p className="text-sm text-slate-700"><strong>설명:</strong> {assignmentDescription}</p>
            <p className="text-sm text-slate-700"><strong>글 종류:</strong> {writingType}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-slate-200 p-3 bg-slate-50/50 text-left font-medium">
                    수준 / 영역
                  </th>
                  {domains.map(domain => (
                    <th key={domain.name} className="border border-slate-200 p-3 bg-slate-50/50 text-left font-medium">
                      {domain.name}
                      <span className="text-xs text-slate-500 ml-1">({domain.weight}%)</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {levels.map(level => (
                  <tr key={level}>
                    <td className="border border-slate-200 p-3 bg-slate-50/30 font-medium">
                      {level}
                    </td>
                    {domains.map(domain => {
                      const isEditing = editingCell?.level === level && editingCell?.domain === domain.name;
                      const isLoading = isGenerating === `${level}-${domain.name}`;
                      
                      return (
                        <td key={domain.name} className="border border-slate-200 p-3 relative group">
                          {isEditing ? (
                            <textarea
                              value={examples[level][domain.name]}
                              onChange={(e) => updateExample(level, domain.name, e.target.value)}
                              onBlur={handleCellBlur}
                              className="w-full p-2 border rounded text-sm resize-none"
                              rows={4}
                              autoFocus
                            />
                          ) : (
                            <div
                              className="text-sm cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                              onClick={() => handleCellClick(level, domain.name)}
                            >
                              {isLoading ? (
                                <div className="flex items-center justify-center py-4">
                                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                                </div>
                              ) : (
                                <>
                                  <p className="line-clamp-3">{examples[level][domain.name]}</p>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellClick(level, domain.name);
                                      }}
                                      className="p-1 bg-white rounded shadow-sm hover:bg-slate-50"
                                      title="편집"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        regenerateExample(level, domain.name);
                                      }}
                                      className="p-1 bg-white rounded shadow-sm hover:bg-slate-50"
                                      title="재생성"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-amber-50/50 rounded-lg border border-amber-200/50">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
              <span className="text-amber-600">💡</span>
              체크리스트 충족 기준
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-amber-800">
              {domains.map(domain => (
                <div key={domain.name}>
                  <p className="font-medium">{domain.name}:</p>
                  <ul className="ml-4 mt-1 space-y-1">
                    {Object.entries(domain.levelCriteria).map(([level, count]) => (
                      <li key={level} className="text-xs">
                        {level}: {count}개 이상 충족
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => onComplete(examples)}
              className="px-6 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30"
            >
              <Check className="w-5 h-5" />
              예시 답안 확정
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}