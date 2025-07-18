'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@bluenote/ui';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { DomainChecklist, ChecklistItem, LevelSystem, WritingType } from '@/types/grading';

interface ChecklistBuilderProps {
  writingType: WritingType;
  levelSystem: LevelSystem;
  onSave: (domains: DomainChecklist[]) => void;
}

const DEFAULT_DOMAINS = [
  { name: '주장의 명확성', weight: 25 },
  { name: '근거의 타당성', weight: 25 },
  { name: '논리적 구조', weight: 25 },
  { name: '설득력 있는 표현', weight: 25 },
];

const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  '주장의 명확성': [
    '핵심 주장이 첫 단락에 제시되었는가?',
    '주장이 한 문장으로 요약 가능한가?',
    '모호한 표현 없이 명확한가?',
  ],
  '근거의 타당성': [
    '구체적인 사례나 통계를 제시했는가?',
    '근거가 주장과 직접적으로 연관되는가?',
    '신뢰할 수 있는 출처를 인용했는가?',
  ],
  '논리적 구조': [
    '서론-본론-결론의 구조가 명확한가?',
    '단락 간 연결이 자연스러운가?',
    '논리적 비약 없이 일관성이 있는가?',
  ],
  '설득력 있는 표현': [
    '다양한 어휘와 문장 구조를 사용했는가?',
    '독자를 고려한 적절한 어조인가?',
    '효과적인 수사법을 활용했는가?',
  ],
};

export default function ChecklistBuilder({ writingType, levelSystem, onSave }: ChecklistBuilderProps) {
  const [domains, setDomains] = useState<DomainChecklist[]>(
    DEFAULT_DOMAINS.map(domain => ({
      ...domain,
      checklist: DEFAULT_CHECKLISTS[domain.name]?.map((q, idx) => ({
        id: `${domain.name}-${idx}`,
        question: q,
      })) || [],
      levelCriteria: levelSystem === 4
        ? { '매우 우수': 3, '우수': 2, '보통': 1, '미흡': 0 }
        : { '우수': 2, '보통': 1, '미흡': 0 },
    }))
  );

  const [editingDomain, setEditingDomain] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<{ domainIdx: number; itemIdx: number } | null>(null);
  const [newDomainName, setNewDomainName] = useState('');
  const [newItemQuestion, setNewItemQuestion] = useState('');

  const updateDomainWeight = (index: number, weight: number) => {
    const newDomains = [...domains];
    newDomains[index].weight = weight;
    
    // 가중치 합계를 100으로 맞추기
    const totalWeight = newDomains.reduce((sum, d) => sum + d.weight, 0);
    if (totalWeight !== 100) {
      const diff = 100 - totalWeight;
      const otherIndex = index === 0 ? 1 : 0;
      if (newDomains[otherIndex]) {
        newDomains[otherIndex].weight += diff;
      }
    }
    
    setDomains(newDomains);
  };

  const addChecklistItem = (domainIdx: number) => {
    if (!newItemQuestion.trim()) return;
    
    const newDomains = [...domains];
    const newItem: ChecklistItem = {
      id: `${domains[domainIdx].name}-${Date.now()}`,
      question: newItemQuestion.trim(),
    };
    newDomains[domainIdx].checklist.push(newItem);
    
    // 레벨 기준 자동 조정
    const itemCount = newDomains[domainIdx].checklist.length;
    if (levelSystem === 4) {
      newDomains[domainIdx].levelCriteria = {
        '매우 우수': itemCount,
        '우수': Math.floor(itemCount * 0.75),
        '보통': Math.floor(itemCount * 0.5),
        '미흡': Math.floor(itemCount * 0.25),
      };
    } else {
      newDomains[domainIdx].levelCriteria = {
        '우수': Math.floor(itemCount * 0.75),
        '보통': Math.floor(itemCount * 0.5),
        '미흡': Math.floor(itemCount * 0.25),
      };
    }
    
    setDomains(newDomains);
    setNewItemQuestion('');
  };

  const deleteChecklistItem = (domainIdx: number, itemIdx: number) => {
    const newDomains = [...domains];
    newDomains[domainIdx].checklist.splice(itemIdx, 1);
    setDomains(newDomains);
  };

  const updateChecklistItem = (domainIdx: number, itemIdx: number, question: string) => {
    const newDomains = [...domains];
    newDomains[domainIdx].checklist[itemIdx].question = question;
    setDomains(newDomains);
    setEditingItem(null);
  };

  const addDomain = () => {
    if (!newDomainName.trim()) return;
    
    const newDomain: DomainChecklist = {
      name: newDomainName.trim(),
      weight: 25,
      checklist: [],
      levelCriteria: levelSystem === 4
        ? { '매우 우수': 3, '우수': 2, '보통': 1, '미흡': 0 }
        : { '우수': 2, '보통': 1, '미흡': 0 },
    };
    
    setDomains([...domains, newDomain]);
    setNewDomainName('');
  };

  const deleteDomain = (index: number) => {
    const newDomains = domains.filter((_, idx) => idx !== index);
    setDomains(newDomains);
  };

  const getLevelNames = () => {
    return levelSystem === 4
      ? ['매우 우수', '우수', '보통', '미흡']
      : ['우수', '보통', '미흡'];
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-xl">평가 영역 및 체크리스트 설정</CardTitle>
          <p className="text-sm text-slate-600 mt-2">
            {writingType} 평가를 위한 영역별 체크리스트를 설정하세요. ({levelSystem}단계 평가)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {domains.map((domain, domainIdx) => (
              <div key={domainIdx} className="border border-slate-200/50 rounded-lg p-4 bg-slate-50/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    {editingDomain === domainIdx ? (
                      <input
                        type="text"
                        value={domain.name}
                        onChange={(e) => {
                          const newDomains = [...domains];
                          newDomains[domainIdx].name = e.target.value;
                          setDomains(newDomains);
                        }}
                        className="font-medium text-lg px-2 py-1 border rounded"
                        onBlur={() => setEditingDomain(null)}
                        autoFocus
                      />
                    ) : (
                      <h3
                        className="font-medium text-lg cursor-pointer hover:text-blue-600"
                        onClick={() => setEditingDomain(domainIdx)}
                      >
                        {domain.name}
                      </h3>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">가중치:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={domain.weight}
                        onChange={(e) => updateDomainWeight(domainIdx, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      />
                      <span className="text-sm text-slate-600">%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteDomain(domainIdx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 체크리스트 항목들 */}
                <div className="space-y-2 mb-4">
                  {domain.checklist.map((item, itemIdx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="text-slate-400">☐</span>
                      {editingItem?.domainIdx === domainIdx && editingItem?.itemIdx === itemIdx ? (
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => {
                            const newDomains = [...domains];
                            newDomains[domainIdx].checklist[itemIdx].question = e.target.value;
                            setDomains(newDomains);
                          }}
                          className="flex-1 px-2 py-1 border rounded text-sm"
                          onBlur={() => updateChecklistItem(domainIdx, itemIdx, item.question)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateChecklistItem(domainIdx, itemIdx, item.question);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          className="flex-1 text-sm cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingItem({ domainIdx, itemIdx })}
                        >
                          {item.question}
                        </span>
                      )}
                      <button
                        onClick={() => deleteChecklistItem(domainIdx, itemIdx)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 새 항목 추가 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingItem?.domainIdx === domainIdx ? '' : newItemQuestion}
                    onChange={(e) => setNewItemQuestion(e.target.value)}
                    placeholder="새 체크리스트 항목 추가..."
                    className="flex-1 px-3 py-2 border border-slate-200/50 rounded text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addChecklistItem(domainIdx);
                      }
                    }}
                  />
                  <button
                    onClick={() => addChecklistItem(domainIdx)}
                    className="px-3 py-2 bg-blue-500/20 text-slate-700 rounded hover:bg-blue-500/30 transition-colors flex items-center gap-1 text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    추가
                  </button>
                </div>

                {/* 레벨 기준 표시 */}
                <div className="mt-4 p-3 bg-slate-100/50 rounded text-sm">
                  <div className="font-medium mb-2">수준별 기준:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(domain.levelCriteria).map(([level, count]) => (
                      <div key={level} className="flex justify-between">
                        <span>{level}:</span>
                        <span className="font-medium">{count}개 이상 충족</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* 새 영역 추가 */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  placeholder="새 평가 영역 추가..."
                  className="flex-1 px-3 py-2 border border-slate-200/50 rounded"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addDomain();
                    }
                  }}
                />
                <button
                  onClick={addDomain}
                  className="px-4 py-2 bg-blue-500/20 text-slate-700 rounded hover:bg-blue-500/30 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  영역 추가
                </button>
              </div>
            </div>

            {/* 가중치 합계 표시 */}
            <div className="text-right text-sm">
              <span className="text-slate-600">총 가중치: </span>
              <span className={`font-medium ${domains.reduce((sum, d) => sum + d.weight, 0) === 100 ? 'text-green-600' : 'text-red-600'}`}>
                {domains.reduce((sum, d) => sum + d.weight, 0)}%
              </span>
              {domains.reduce((sum, d) => sum + d.weight, 0) !== 100 && (
                <span className="text-red-600 ml-2">(100%가 되어야 합니다)</span>
              )}
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <button
                onClick={() => onSave(domains)}
                disabled={domains.reduce((sum, d) => sum + d.weight, 0) !== 100}
                className="px-6 py-3 bg-blue-500/20 text-slate-700 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center gap-2 border border-blue-200/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-5 h-5" />
                체크리스트 저장
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}