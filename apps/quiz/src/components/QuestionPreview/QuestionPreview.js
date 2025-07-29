'use client'

import { CheckCircle, XCircle, Clock } from 'lucide-react'

export default function QuestionPreview({ 
  question, 
  index, 
  showCheckbox = false, 
  showExplanation = true,
  onCheckChange 
}) {
  // Ensure we have valid options array
  const options = question.question_options || question.options || []
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <input
            type="checkbox"
            onChange={(e) => onCheckChange && onCheckChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        )}
        
        <div className="flex-1">
          {/* 문항 헤더 */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg font-medium text-gray-900">
              {index + 1}. {question.question || question.text}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              question.type === 'true_false' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {question.type === 'true_false' ? 'OX형' : '4지선다형'}
            </span>
            {question.metadata?.difficulty && (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                question.metadata.difficulty === 'hard' 
                  ? 'bg-red-100 text-red-700'
                  : question.metadata.difficulty === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {question.metadata.difficulty === 'hard' ? '상' : 
                 question.metadata.difficulty === 'medium' ? '중' : '하'}
              </span>
            )}
            <span className="inline-flex items-center text-xs text-gray-500">
              <Clock className="mr-1 h-3 w-3" />
              {question.time_limit || question.timeLimit || 30}초
            </span>
          </div>
          
          {/* 선택지 */}
          <div className="space-y-2 mb-3">
            {options.map((option, optIndex) => (
              <div 
                key={optIndex}
                className={`flex items-center gap-2 p-2 rounded ${
                  option.is_correct || option.isCorrect ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                {option.is_correct || option.isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className={`text-sm ${
                  option.is_correct || option.isCorrect ? 'font-medium text-green-900' : 'text-gray-700'
                }`}>
                  {option.text || option.option_text}
                </span>
                {(option.is_correct || option.isCorrect) && (
                  <span className="ml-auto text-xs text-green-600 font-medium">
                    정답
                  </span>
                )}
              </div>
            ))}
          </div>
          
          {/* 해설 */}
          {showExplanation && question.explanation && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">해설:</p>
              <p className="text-sm text-blue-800">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}