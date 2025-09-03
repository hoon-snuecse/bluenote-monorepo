# Temperature 조정 가이드

## Temperature란?
AI 모델의 창의성과 일관성을 조절하는 매개변수입니다.
- **낮은 값 (0.0~0.3)**: 일관되고 예측 가능한 응답
- **중간 값 (0.4~0.7)**: 균형잡힌 응답
- **높은 값 (0.8~1.0)**: 창의적이지만 예측하기 어려운 응답

## 수정 방법

### 방법 1: UI에서 실시간 조정 (권장)
1. 평가 페이지로 이동
   ```
   http://localhost:3002/assignments/[assignmentId]/evaluate
   ```

2. AI 모델 선택 섹션 확인

3. Temperature 슬라이더 조정
   - 슬라이더를 좌우로 움직여 값 변경
   - 우측에 현재 값 표시 (예: 0.1)

### 방법 2: 코드에서 기본값 변경

**파일 위치**: `/src/app/assignments/[assignmentId]/evaluate/page.tsx`

**라인 35**:
```typescript
// 현재 설정
const [temperature, setTemperature] = useState(0.1);

// 변경 예시 (0.2로 변경)
const [temperature, setTemperature] = useState(0.2);
```

### 방법 3: LM Studio API 기본값 변경

**파일 위치**: `/src/lib/lm-studio-api.ts`

**라인 110**:
```typescript
// 현재 설정
temperature: request.temperature || 0.1,

// 변경 예시 (기본값을 0.2로)
temperature: request.temperature || 0.2,
```

### 방법 4: Claude API 기본값 변경

**파일 위치**: `/src/lib/claude-api.ts`

**라인 120, 132**:
```typescript
// 현재 설정
temperature: request.temperature || 0.1,

// 변경 예시
temperature: request.temperature || 0.2,
```

## 권장 설정값

| 용도 | Temperature | 설명 |
|-----|------------|------|
| **일관된 평가** (권장) | 0.1 | 현재 설정값, 가장 일관된 결과 |
| **약간의 변화** | 0.2~0.3 | 조금 더 다양한 표현 |
| **균형적 평가** | 0.5 | 창의성과 일관성의 균형 |
| **창의적 피드백** | 0.7~0.8 | 다양한 관점의 피드백 |

## 주의사항

1. **학생 평가 시**: 0.1~0.3 권장 (일관성 중요)
2. **테스트 시**: 다양한 값으로 실험 가능
3. **대량 평가 시**: 낮은 값 유지 (0.1)

## 빠른 테스트

1. 평가 페이지에서 Temperature 변경
2. 같은 학생 글로 여러 번 평가
3. 결과 비교

**예시**:
- Temperature 0.1: 거의 동일한 평가
- Temperature 0.5: 약간 다른 표현과 점수
- Temperature 1.0: 매번 다른 평가

---
*최종 업데이트: 2025-09-03*