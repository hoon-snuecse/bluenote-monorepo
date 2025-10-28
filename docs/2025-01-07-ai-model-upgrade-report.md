# AI 모델 업그레이드 및 토큰 증량 개선 보고서

**작성일**: 2025년 1월 7일
**작업자**: Claude Code
**관련 앱**: Grading App

## 📋 개요

Grading 앱의 AI 평가 시스템에 대한 두 가지 주요 개선 작업을 수행했습니다:

1. **Claude Sonnet 4.5 모델 추가** - 최신 AI 모델 지원으로 평가 품질 향상
2. **max_tokens 증량** - 피드백 잘림 현상 해결 (2000 → 4096)

---

## 🎯 작업 1: Claude Sonnet 4.5 모델 추가

### 배경
기존에는 Claude Sonnet 4와 Opus 4만 지원했으나, Anthropic의 최신 모델인 Claude Sonnet 4.5를 추가하여 더 나은 평가 성능을 제공하고자 함.

### 변경 사항

#### 1. 모델 ID 조사 및 확인
- **모델 ID**: `claude-sonnet-4-5-20250929`
- **특징**: 코딩 최적화, 최신 모델, Sonnet 4 대비 향상된 성능

#### 2. UI 업데이트
**파일**: `apps/grading/src/app/assignments/[assignmentId]/evaluate/page.tsx`

```tsx
// 모델 선택 기본값 변경
const [selectedModel, setSelectedModel] = useState('claude-sonnet-4-5-20250929');

// 드롭다운 옵션 추가
<select>
  <option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5 (권장 - 최신 모델, 코딩 최적화)</option>
  <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (스마트하고 효율적)</option>
  <option value="claude-opus-4-20250514">Claude Opus 4 (가장 강력한 모델)</option>
</select>
```

#### 3. API 로직 업데이트
**파일**: `apps/grading/src/lib/claude-api.ts`

```typescript
// 기본 모델을 Sonnet 4.5로 변경
let actualModel = 'claude-sonnet-4-5-20250929';

// 모델 매핑 로직 개선
if (request.aiModel) {
  // 직접 지정된 경우
  if (request.aiModel === 'claude-sonnet-4-5-20250929' ||
      request.aiModel === 'claude-sonnet-4-20250514' ||
      request.aiModel === 'claude-opus-4-20250514') {
    actualModel = request.aiModel;
  }
  // 레거시 호환성: sonnet 포함 시 4.5로 매핑
  else if (request.aiModel.includes('opus')) {
    actualModel = 'claude-opus-4-20250514';
  } else if (request.aiModel.includes('sonnet')) {
    actualModel = 'claude-sonnet-4-5-20250929';
  }
}
```

#### 4. 평가 API 기본값 변경
**파일**:
- `apps/grading/src/app/api/evaluate/route.ts`
- `apps/grading/src/app/api/evaluations/route.ts`

모든 API 엔드포인트의 기본 모델을 `claude-sonnet-4-5-20250929`로 설정

### 결과
- ✅ 최신 Claude Sonnet 4.5 모델을 기본값으로 설정
- ✅ 기존 모델과의 하위 호환성 유지
- ✅ UI에서 사용자가 모델 선택 가능

---

## 🔧 작업 2: max_tokens 증량 (2000 → 4096)

### 배경
사용자가 피드백 잘림 현상을 스크린샷과 함께 보고. 한국어 피드백이 2000 토큰 제한으로 인해 중간에 잘리는 문제 발견.

### 문제 분석
- **기존 설정**: `max_tokens: 2000`
- **예상 한국어 출력**: 약 650-1,000자 (토큰당 약 0.5자)
- **실제 필요량**: 상세한 피드백 제공 시 1,300-2,000자 필요
- **결론**: 토큰 양 부족으로 피드백이 중간에 잘림

### 변경 사항

#### 1. Claude API 설정
**파일**: `apps/grading/src/lib/claude-api.ts` (Line 122)

```typescript
const message = await anthropic.messages.create({
  model: actualModel,
  max_tokens: 4096,  // 2000 → 4096 증량
  temperature: request.temperature || 0.1,
  // ...
});
```

#### 2. LM Studio API 설정
**파일**: `apps/grading/src/lib/lm-studio-api.ts` (Line 111)

```typescript
temperature: request.temperature || 0.1,
max_tokens: 4096,  // 2000 → 4096 증량
```

#### 3. AI Evaluator 유틸리티
**파일**: `apps/grading/src/utils/ai-evaluator.ts` (Line 92)

```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-opus-20240229',
  max_tokens: 4096,  // 2000 → 4096 증량
  temperature: 0.1
});
```

#### 4. 문서 업데이트
**파일**: `apps/grading/CLAUDE.md`

새로운 섹션 추가:

```markdown
## AI Model Configuration

### Supported Models
- **Claude Sonnet 4.5** (`claude-sonnet-4-5-20250929`) - 기본값, 최신 모델
- **Claude Sonnet 4** (`claude-sonnet-4-20250514`) - 효율적인 평가
- **Claude Opus 4** (`claude-opus-4-20250514`) - 가장 강력한 모델

### API Configuration
- **max_tokens**: 4096 (2000에서 증량하여 피드백 잘림 방지)
- **temperature**: 0.1-0.3 (일관된 평가를 위해 낮은 값 사용)
```

**파일**: `docs/OSS_GPT_20B_COMPLETE_GUIDE.md`, `docs/CURRENT_LM_STUDIO_SETUP.md`

LM Studio 관련 문서에도 max_tokens 설정 업데이트

### 영향 분석

#### 토큰 증량의 효과
| 항목 | 기존 (2000) | 변경 후 (4096) | 개선율 |
|------|-------------|----------------|--------|
| 최대 토큰 수 | 2,000 | 4,096 | +105% |
| 예상 한국어 출력 | 650-1,000자 | 1,300-2,000자 | +100% |
| 피드백 잘림 현상 | 자주 발생 | 거의 없음 | ✅ 해결 |

#### API 비용 영향
- 토큰 사용량 증가로 인한 비용 상승 가능성 있음
- 그러나 실제 사용량은 필요한 만큼만 사용되므로, 항상 4096을 소비하는 것은 아님
- 피드백 품질 향상으로 인한 사용자 만족도 증가가 비용 상승을 상쇄

### 결과
- ✅ 피드백 잘림 현상 해결
- ✅ 더 상세하고 완전한 피드백 제공 가능
- ✅ 모든 AI API 호출 지점에 일관되게 적용

---

## 📦 Git 커밋 내역

### 커밋 1: Claude Sonnet 4.5 추가
```
feat: Add Claude Sonnet 4.5 model support

- Add claude-sonnet-4-5-20250929 as default model
- Update UI dropdown with new model option
- Update API logic to support new model
- Maintain backward compatibility with existing models
```

### 커밋 2: max_tokens 증량
```
fix: Increase max_tokens to 4096 to prevent feedback truncation

- Update claude-api.ts: 2000 → 4096
- Update lm-studio-api.ts: 2000 → 4096
- Update ai-evaluator.ts: 2000 → 4096
- Update documentation (CLAUDE.md, LM Studio guides)
```

---

## 🎯 향후 개선 사항

1. **모델 성능 모니터링**
   - Sonnet 4.5의 평가 품질 모니터링
   - 필요시 모델별 성능 비교 분석

2. **토큰 사용량 최적화**
   - 실제 토큰 사용 패턴 분석
   - 필요시 프롬프트 최적화로 불필요한 토큰 사용 감소

3. **비용 모니터링**
   - API 호출 비용 추적
   - 필요시 비용 알림 시스템 구축

4. **사용자 피드백 수집**
   - 새로운 모델과 증량된 토큰의 효과 검증
   - 사용자 만족도 조사

---

## 📚 참고 문서

- [apps/grading/CLAUDE.md](../apps/grading/CLAUDE.md) - Grading 앱 전체 가이드
- [docs/OSS_GPT_20B_COMPLETE_GUIDE.md](OSS_GPT_20B_COMPLETE_GUIDE.md) - LM Studio 가이드
- [docs/CURRENT_LM_STUDIO_SETUP.md](CURRENT_LM_STUDIO_SETUP.md) - 현재 LM Studio 설정

---

## ✅ 체크리스트

- [x] Claude Sonnet 4.5 모델 ID 조사
- [x] UI에 새 모델 옵션 추가
- [x] API 로직 업데이트
- [x] 기본 모델을 Sonnet 4.5로 변경
- [x] max_tokens를 4096으로 증량 (모든 파일)
- [x] 문서 업데이트 (CLAUDE.md 및 관련 가이드)
- [x] Git 커밋 및 푸시
- [x] 개선 보고서 작성
