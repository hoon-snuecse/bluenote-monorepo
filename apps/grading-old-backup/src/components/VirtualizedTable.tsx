'use client';

import React, { useMemo, useCallback, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { EvaluationResult, DomainKey } from '@/types/grading';
import { DOMAIN_MAP } from '@/types/grading';

interface VirtualizedTableProps {
  data: EvaluationResult[];
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onRowClick: (student: any) => void;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: EvaluationResult[];
    onRowClick: (student: any) => void;
  };
}

// Memoized row component
const Row = memo(({ index, style, data }: RowProps) => {
  const result = data.items[index];
  
  return (
    <div
      style={style}
      className="flex items-center hover:bg-slate-50 cursor-pointer border-b border-gray-200"
      onClick={() => data.onRowClick(result.student)}
    >
      <div className="flex-1 grid grid-cols-7 gap-4 px-4">
        <div className="py-4">
          <p className="font-medium text-slate-900">{result.student.name}</p>
          <p className="text-sm text-slate-500">{result.student.studentNumber}</p>
        </div>
        
        {Object.keys(DOMAIN_MAP).map((key) => {
          const evaluation = result.domainEvaluations[key as DomainKey];
          return (
            <div key={key} className="py-4 flex items-center justify-center">
              <span className={`inline-block px-3 py-1.5 rounded-md text-sm font-medium ${
                evaluation.level === '매우 우수'
                  ? 'bg-blue-500/10 text-blue-700 border border-blue-200/30'
                  : evaluation.level === '우수'
                  ? 'bg-blue-400/10 text-blue-600 border border-blue-200/30'
                  : evaluation.level === '보통'
                  ? 'bg-amber-400/10 text-amber-700 border border-amber-200/30'
                  : 'bg-slate-400/10 text-slate-600 border border-slate-200/30'
              }`}>
                {evaluation.level}
              </span>
            </div>
          );
        })}
        
        <div className="py-4 flex items-center justify-center">
          <span className={`inline-block px-4 py-2 rounded-md text-base font-medium ${
            result.overallLevel === '매우 우수'
              ? 'bg-blue-500/10 text-blue-700 border border-blue-200/30'
              : result.overallLevel === '우수'
              ? 'bg-blue-400/10 text-blue-600 border border-blue-200/30'
              : result.overallLevel === '보통'
              ? 'bg-amber-400/10 text-amber-700 border border-amber-200/30'
              : 'bg-slate-400/10 text-slate-600 border border-slate-200/30'
          }`}>
            {result.overallLevel}
          </span>
        </div>
      </div>
    </div>
  );
});

Row.displayName = 'Row';

export const VirtualizedTable = memo(function VirtualizedTable({
  data,
  sortField,
  sortOrder,
  onSort,
  onRowClick
}: VirtualizedTableProps) {
  const itemData = useMemo(() => ({
    items: data,
    onRowClick
  }), [data, onRowClick]);

  const SortIcon = useCallback(({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  }, [sortField, sortOrder]);

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <div className="grid grid-cols-7 gap-4 px-4">
          <button
            onClick={() => onSort('name')}
            className="py-3 text-left font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
          >
            학생 정보
            <SortIcon field="name" />
          </button>
          
          {Object.entries(DOMAIN_MAP).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onSort(key)}
              className="py-3 text-center font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center gap-1"
            >
              {label}
              <SortIcon field={key} />
            </button>
          ))}
          
          <button
            onClick={() => onSort('overall')}
            className="py-3 text-center font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center gap-1"
          >
            종합
            <SortIcon field="overall" />
          </button>
        </div>
      </div>

      {/* Virtualized Table Body */}
      <List
        height={600}
        itemCount={data.length}
        itemSize={80}
        width="100%"
        itemData={itemData}
      >
        {Row}
      </List>
    </div>
  );
});