# LM Studio 빠른 시작 가이드

## 🚀 5분 안에 시작하기

### 1단계: LM Studio 설치
```bash
# macOS (Homebrew)
brew install --cask lm-studio

# 또는 https://lmstudio.ai 에서 직접 다운로드
```

### 2단계: 모델 다운로드
1. LM Studio 실행
2. "Discover" 탭 클릭
3. "gpt" 검색
4. 원하는 모델 다운로드 (추천: 7B~20B 모델)

### 3단계: 서버 시작
1. "Local Server" 탭 클릭
2. 모델 선택
3. "Start Server" 클릭
4. 확인: `http://localhost:1234/v1` 접속 가능

### 4단계: Grading 앱 설정
`.env.local` 파일에 추가:
```env
LM_STUDIO_ENABLED="true"
LM_STUDIO_URL="http://localhost:1234/v1"
```

### 5단계: 테스트
```bash
# 개발 서버 재시작
npm run dev

# 브라우저에서 테스트
http://localhost:3002/test-lm-studio
```

## ✅ 체크리스트

- [ ] LM Studio 설치 완료
- [ ] 최소 16GB RAM 확보
- [ ] 모델 다운로드 (20-40GB 디스크 공간)
- [ ] Local Server 실행 중 (포트 1234)
- [ ] 환경 변수 설정 완료
- [ ] 테스트 페이지에서 "available: true" 확인

## 🎯 사용하기

1. 과제 평가 페이지로 이동
2. "AI 모델" 드롭다운에서 "OSS GPT (로컬)" 선택
3. Temperature 조절 (권장: 0.1)
4. "평가 시작" 클릭

## ⚡ 성능 팁

### 메모리 부족 시
- 더 작은 모델 사용 (7B, 13B)
- Quantized 버전 선택 (Q4_K_M, Q5_K_S)

### 속도 개선
- GPU 사용 설정 (NVIDIA CUDA / Apple Metal)
- 배치 크기 조절 (5개씩 처리)

## 🔧 문제 해결

### "연결 실패" 오류
```bash
# LM Studio 서버 상태 확인
curl http://localhost:1234/v1/models

# 포트 확인
lsof -i :1234
```

### "모델 없음" 오류
1. LM Studio에서 모델 로드 확인
2. "My Models" → 모델 선택 → "Load"

### 평가 결과 이상
- Temperature를 0.1로 낮추기
- 출력 형식을 명확히 지정

## 📊 모델 추천

| 용도 | 모델 | RAM | 속도 | 정확도 |
|-----|------|-----|------|--------|
| 테스트 | Llama-2-7B | 8GB | ⚡⚡⚡ | ⭐⭐ |
| 일반 | Llama-2-13B | 16GB | ⚡⚡ | ⭐⭐⭐ |
| 고품질 | GPT-20B | 32GB | ⚡ | ⭐⭐⭐⭐ |

## 🔗 유용한 링크

- [LM Studio 다운로드](https://lmstudio.ai)
- [모델 목록 (Hugging Face)](https://huggingface.co/models?other=gguf)
- [문제 신고](https://github.com/your-repo/issues)

---
*최종 업데이트: 2025-09-03*