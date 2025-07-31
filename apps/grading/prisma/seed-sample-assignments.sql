-- Sample assignments for Grading app
-- 초등학교, 중학교, 고등학교별 샘플 과제 데이터

-- 초등학교 샘플 과제
INSERT INTO "Assignment" (
  id,
  title,
  "schoolName",
  "gradeLevel",
  "writingType",
  "evaluationDomains",
  "evaluationLevels",
  "levelCount",
  "gradingCriteria",
  "isSample",
  "sampleOrder",
  "sampleCategory",
  "createdAt",
  "updatedAt"
) VALUES (
  'sample-elem-argument-1',
  '[샘플] 초등 4학년 논설문 - 환경보호',
  '블루노트 초등학교',
  '초등학교 4학년',
  '논설문',
  '["주장의 명확성", "근거의 타당성", "논리적 구조", "설득력 있는 표현"]',
  '["매우 우수", "우수", "보통", "노력 필요"]',
  4,
  '초등학생 수준에 적합한 환경보호 주제의 논설문 평가. 명확한 주장, 구체적인 예시, 논리적 전개를 중점적으로 평가합니다.',
  true,
  1,
  '초등학교',
  NOW(),
  NOW()
);

-- 중학교 샘플 과제
INSERT INTO "Assignment" (
  id,
  title,
  "schoolName",
  "gradeLevel",
  "writingType",
  "evaluationDomains",
  "evaluationLevels",
  "levelCount",
  "gradingCriteria",
  "isSample",
  "sampleOrder",
  "sampleCategory",
  "createdAt",
  "updatedAt"
) VALUES (
  'sample-middle-literature-1',
  '[샘플] 중학교 2학년 문학 감상문 - 소설 독후감',
  '블루노트 중학교',
  '중학교 2학년',
  '감상문',
  '["작품 이해도", "개인적 해석", "문학적 표현", "비평적 사고"]',
  '["탁월", "우수", "양호", "기본", "미흡"]',
  5,
  '문학 작품에 대한 깊이 있는 이해와 개인적 해석, 창의적인 표현력을 평가합니다.',
  true,
  2,
  '중학교',
  NOW(),
  NOW()
);

-- 고등학교 샘플 과제
INSERT INTO "Assignment" (
  id,
  title,
  "schoolName",
  "gradeLevel",
  "writingType",
  "evaluationDomains",
  "evaluationLevels",
  "levelCount",
  "gradingCriteria",
  "isSample",
  "sampleOrder",
  "sampleCategory",
  "createdAt",
  "updatedAt"
) VALUES (
  'sample-high-research-1',
  '[샘플] 고등학교 1학년 탐구보고서 - 과학 실험',
  '블루노트 고등학교',
  '고등학교 1학년',
  '탐구보고서',
  '["연구 설계", "데이터 분석", "결과 해석", "학술적 글쓰기", "참고문헌 활용"]',
  '["A", "B", "C", "D", "E", "F"]',
  6,
  '과학적 탐구 과정의 체계성, 데이터 분석의 정확성, 결론 도출의 논리성을 종합적으로 평가합니다.',
  true,
  3,
  '고등학교',
  NOW(),
  NOW()
);