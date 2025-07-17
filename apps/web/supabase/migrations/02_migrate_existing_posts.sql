-- Migration script to import existing posts into Supabase
-- Run this in Supabase SQL Editor after the schema is created

-- ============================================
-- 1. DISABLE RLS TEMPORARILY
-- ============================================
ALTER TABLE research_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE shed_posts DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. INSERT RESEARCH POSTS
-- ============================================
INSERT INTO research_posts (
  title, 
  content, 
  category, 
  tags, 
  summary,
  reading_time,
  created_at,
  updated_at
) VALUES 
(
  'PISA 2022 결과 분석: Claude AI와 함께 찾은 새로운 인사이트',
  '# PISA 2022 결과 분석: Claude AI와 함께 찾은 새로운 인사이트

## 연구 배경

PISA 2022 결과가 발표되면서 전 세계 교육계가 주목하고 있습니다. 이번 연구에서는 단순한 순위 비교를 넘어서, Claude AI와의 협업을 통해 데이터 속에 숨겨진 새로운 패턴을 발견하고자 했습니다.

## Claude AI와의 대화 과정

> **박교수**: Claude, PISA 2022 데이터에서 기존 연구들이 놓쳤을 만한 흥미로운 패턴이 있을까요?

> **Claude**: 흥미로운 질문이네요. PISA 데이터를 다각도로 분석해보면, 단순한 성취도 순위보다는 국가 간 학습 격차의 변화 패턴이나, 사회경제적 배경과 디지털 리터러시의 상관관계 등이 주목할 만합니다...

## 주요 발견사항

### 1. 디지털 네이티브 세대의 역설
Claude AI와의 분석을 통해 발견한 가장 흥미로운 점은...

### 2. 코로나19가 만든 새로운 교육 격차
팬데믹 이후 나타난 예상치 못한 패턴들...

## 정책적 시사점

이번 분석 결과는 다음과 같은 정책적 함의를 제공합니다...',
  'research',
  ARRAY['PISA', 'Claude AI', '교육격차', '데이터분석', '국제비교'],
  'Claude AI를 활용하여 PISA 2022 데이터에서 기존 연구에서 놓친 패턴을 발견한 혁신적 분석 연구',
  8,
  '2025-06-30T09:00:00Z',
  '2025-06-30T15:30:00Z'
),
(
  'AI 기반 자동 채점 시스템의 효과성 검증',
  '# AI 기반 자동 채점 시스템의 효과성 검증

## 연구 개요

본 연구는 Claude AI를 활용한 자동 채점 시스템의 효과성을 검증하는 것을 목적으로 합니다...

## 연구 방법

### 데이터 수집
- 참여 학생: 200명
- 에세이 유형: 논설문, 설명문
- 평가 기준: 논리성, 창의성, 표현력

### AI 모델 훈련
Claude AI와의 협업을 통해...

## 연구 결과

### 1. 채점의 일관성
인간 채점자와 AI 채점의 상관계수가 0.89로 매우 높게 나타났습니다...

### 2. 시간 효율성
기존 수동 채점 대비 95% 시간 단축...

## 결론 및 제언

AI 기반 자동 채점 시스템은 교육 현장에서 충분히 활용 가능한 수준의 정확도와 효율성을 보여주었습니다...',
  'research',
  ARRAY['AI교육', '자동채점', 'Claude AI', '에듀테크'],
  '교육 현장에서 AI 자동 채점 시스템의 실제 적용 가능성을 검증한 실증 연구',
  10,
  '2025-05-15T10:00:00Z',
  '2025-05-15T10:00:00Z'
);

-- ============================================
-- 3. INSERT SAMPLE SHED POSTS
-- ============================================
-- Note: shed-posts.json contains base64 images which need manual processing
-- Here we'll insert a few sample posts with cleaned content

INSERT INTO shed_posts (
  title,
  content,
  mood,
  weather,
  music,
  category,
  tags,
  summary,
  created_at
) VALUES
(
  '나의 여름 커피: Ethiopia Guji Gerbicho Rogicha Washed G1',
  '오늘은 특별한 커피를 만났다. Ethiopia Guji 지역의 Gerbicho Rogicha 농장에서 온 워시드 G1 등급의 원두다.

첫 향을 맡는 순간, 레몬그라스와 베르가못의 상큼한 향이 코끝을 스친다. 한 모금 마시니 밝은 산미와 함께 복숭아, 살구 같은 스톤 프루트의 단맛이 입안을 가득 채운다.

이 커피가 특별한 이유는 단순히 맛 때문만이 아니다. Gerbicho Rogicha 농장은 해발 2,000m 이상의 고지대에 위치해 있으며, 전통적인 방식으로 커피를 재배한다. 

브루잉 레시피:
- 원두: 15g
- 물: 250ml (93°C)
- 추출 시간: 2분 30초
- 그라인딩: 중간 굵기

V60로 내렸을 때 가장 밸런스가 좋았다. 첫 번째 푸어링에서 30초간 블루밍을 하고, 이후 천천히 동심원을 그리며 물을 부었다.

커피 한 잔에도 수많은 사람들의 정성이 담겨있다는 것을 다시 한번 느낀다.',
  '즐거운',
  '맑음',
  'Bill Evans - Waltz for Debby',
  'coffee',
  ARRAY['커피', '에티오피아', 'V60', '스페셜티커피'],
  '에티오피아 구지 지역의 특별한 워시드 커피를 만나다',
  NOW() - INTERVAL '7 days'
),
(
  '내가 아끼는 공구: LIE-NIELSEN No. 8 Jointer Plane',
  '목공을 시작한 지 5년째, 수많은 공구들을 거쳐왔지만 가장 아끼는 것은 단연 LIE-NIELSEN No. 8 Jointer Plane이다.

이 대패는 단순한 공구가 아니라 예술품에 가깝다. 황동과 주철로 만들어진 몸체는 묵직하면서도 균형이 완벽하다. 609mm의 긴 솔 플레이트는 긴 판재를 평평하게 만드는 데 이상적이다.

처음 이 대패를 손에 들었을 때의 감동을 잊을 수 없다. A2 공구강으로 만들어진 블레이드는 예리함을 오래 유지하며, 0.001인치 단위로 조정 가능한 정밀함은 놀라울 정도다.

사용 팁:
1. 블레이드 각도는 45도가 기본이지만, 나무 결에 따라 조정
2. 캡 아이언은 블레이드 끝에서 1/32인치 정도 떨어뜨려 세팅
3. 사용 후에는 반드시 동백기름으로 관리

좋은 공구는 사용자를 더 나은 장인으로 만든다고 믿는다. 이 대패로 다듬은 나무 표면은 거울처럼 매끄럽다. 

다음 프로젝트는 월넛으로 만드는 책상이다. 이 대패가 또 어떤 아름다운 표면을 만들어낼지 기대된다.',
  '평온한',
  '흐림',
  '',
  'woodwork',
  ARRAY['목공', '대패', 'LIE-NIELSEN', '수공구'],
  '평생 함께할 대패, LIE-NIELSEN No. 8에 대한 이야기',
  NOW() - INTERVAL '14 days'
);

-- ============================================
-- 4. RE-ENABLE RLS (Optional)
-- ============================================
-- Uncomment if you want to re-enable RLS after migration
-- ALTER TABLE research_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shed_posts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. VERIFY MIGRATION
-- ============================================
-- Check imported posts
SELECT 'Research Posts:' as category, COUNT(*) as count FROM research_posts
UNION ALL
SELECT 'Shed Posts:', COUNT(*) FROM shed_posts;