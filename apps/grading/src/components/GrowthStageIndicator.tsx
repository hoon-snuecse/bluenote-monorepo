import React from 'react';

interface GrowthStageIndicatorProps {
  currentStage: number;
  totalStages: number;
  stageLabels: string[];
  compact?: boolean;
}

const getStageColor = (stageLabel: string, isActive: boolean) => {
  if (!isActive) return 'bg-slate-200';
  
  if (stageLabel.includes('매우 우수')) return 'bg-green-500';
  if (stageLabel.includes('우수')) return 'bg-blue-500';
  if (stageLabel.includes('보통')) return 'bg-yellow-500';
  if (stageLabel.includes('미흡')) return 'bg-red-500';
  return 'bg-slate-400';
};

const getTextColor = (stageLabel: string) => {
  if (stageLabel.includes('매우 우수')) return 'text-green-700';
  if (stageLabel.includes('우수')) return 'text-blue-700';
  if (stageLabel.includes('보통')) return 'text-yellow-700';
  if (stageLabel.includes('미흡')) return 'text-red-700';
  return 'text-slate-700';
};

export const GrowthStageIndicator: React.FC<GrowthStageIndicatorProps> = ({
  currentStage,
  totalStages,
  stageLabels,
  compact = false,
}) => {
  const circleSize = compact ? 'w-3 h-3' : 'w-4 h-4';
  const lineHeight = compact ? 'h-0.5' : 'h-1';
  const fontSize = compact ? 'text-xs' : 'text-sm';
  const marginTop = compact ? 'mt-1' : 'mt-2';

  return (
    <div className="w-full flex items-center">
      {stageLabels.map((label, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={`${circleSize} rounded-full transition-all duration-300 ${
                getStageColor(label, index <= currentStage)
              }`}
            />
            <span
              className={`${marginTop} ${fontSize} font-medium ${
                index === currentStage ? getTextColor(label) : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </div>
          {index < totalStages - 1 && (
            <div
              className={`flex-1 ${lineHeight} mx-2 transition-all duration-300 ${
                index < currentStage ? getStageColor(stageLabels[currentStage], true) : 'bg-slate-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};